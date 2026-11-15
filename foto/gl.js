// Bildwerk – WebGL2-Pipeline + Kachel-Rendern. Signaturen FEST (ARCH.md §4.1).
// Prinzip „Region“: jede Rechnung (Vorschau, Lupe, Mini, Export-Kachel) rendert einen Ausschnitt der Quelle in einer
// bestimmten Auflösung. Alle Texturen im Pass-Kontext (Eingang, Masken, Basis-Schichten) sind auf diesen Ausschnitt
// ausgerichtet; Stufen müssen nichts über Kacheln wissen. Zeile 0 jeder Textur = oberer Bildrand.
import { STUFE, KACHEL, ARBEITS_KANTE, BildwerkFehler, FEHLER, renderReihenfolge } from './typen.js';
import { geometrieMatrix, ansichtMatrix, mal3, invers3 } from './zuschnitt.js';

/** Gemeinsame GLSL-Bausteine (von regler.js/looks.js benutzt). Alle Werte linear. */
export const GLSL_FARBE = `
float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
vec3 zuSrgb(vec3 c){ c = clamp(c, 0.0, 1.0); return mix(12.92*c, 1.055*pow(c, vec3(1.0/2.4)) - 0.055, step(0.0031308, c)); }
vec3 zuLinear(vec3 c){ return mix(c/12.92, pow((c + 0.055)/1.055, vec3(2.4)), step(0.04045, c)); }
vec3 oklab(vec3 c){
  vec3 l = mat3(0.4122214708, 0.2119034982, 0.0883024619, 0.5363325363, 0.6806995451, 0.2817188376, 0.0514459929, 0.1073969566, 0.6299787005) * max(c, 0.0);
  l = pow(l, vec3(1.0/3.0));
  return mat3(0.2104542553, 1.9779984951, 0.0259040371, 0.7936177850, -2.4285922050, 0.7827717662, -0.0040720468, 0.4505937099, -0.8086757660) * l; }
vec3 oklabZuRgb(vec3 o){
  vec3 l = mat3(1.0, 1.0, 1.0, 0.3963377774, -0.1055613458, -0.0894841775, 0.2158037573, -0.0638541728, -1.2914855480) * o;
  l = l*l*l;
  return mat3(4.0767416621, -1.2684380046, -0.0041960863, -3.3077115913, 2.6097574011, -0.7034186147, 0.2309699292, -0.3413193965, 1.7076147010) * l; }
float logL(vec3 c){ return log2(max(lum(c), 1e-5)); }
`;
export const GLSL_TON = `
float weichesLicht(float a, float b){ return b < 0.5 ? a - (1.0 - 2.0*b)*a*(1.0 - a) : a + (2.0*b - 1.0)*(sqrt(max(a, 0.0)) - a); }
vec3 weichesLicht(vec3 a, vec3 b){ return vec3(weichesLicht(a.r, b.r), weichesLicht(a.g, b.g), weichesLicht(a.b, b.b)); }
float sanftKnie(float x, float k){ return x / (1.0 + max(x - k, 0.0)); }
`;
export const GLSL_HILFE = `
float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
vec3 begrenze(vec3 x, vec3 lo, vec3 hi){ return clamp(x, lo, hi); }
float dither(vec2 absPx){ return (hash12(absPx) + hash12(absPx + 17.17) - 1.0) / 255.0; }
`;

const KOPF = `#version 300 es
precision highp float; precision highp int; precision highp sampler2D;
in vec2 uv; out vec4 aus; uniform vec2 px;
`;
const VS = `#version 300 es
out vec2 uv; void main(){ vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2)); uv = p; gl_Position = vec4(p*2.0 - 1.0, 0.0, 1.0); }`;

// ---- eingebaute Programme ----
const FS_EINLESEN = `uniform sampler2D q; uniform vec4 reg; uniform vec2 qGr; uniform int n; uniform int istSrgb;
void main(){ vec2 m = reg.xy + uv*reg.zw; vec2 fuss = reg.zw*px; vec3 s = vec3(0.0);
  for (int j = 0; j < 8; j++) { if (j >= n) break; for (int i = 0; i < 8; i++) { if (i >= n) break;
    vec2 o = (vec2(float(i), float(j)) + 0.5)/float(n) - 0.5; s += texture(q, m + o*fuss).rgb; } }
  s /= float(n*n); if (istSrgb == 1) s = zuLinear(s); aus = vec4(s, 1.0); }`;
const FS_AUSSCHNITT = `uniform sampler2D q; uniform vec4 reg; void main(){ aus = texture(q, reg.xy + uv*reg.zw); }`;
const FS_MISCH = `uniform sampler2D a; uniform sampler2D b; uniform sampler2D m; uniform float d; uniform int mitMaske;
void main(){ float w = d; if (mitMaske == 1) w *= texture(m, uv).r; aus = mix(texture(a, uv), texture(b, uv), w); }`;
const FS_BLUR = `uniform sampler2D q; uniform vec2 rich; uniform float sigma; uniform int r;
void main(){ vec4 s = texture(q, uv); float wsum = 1.0;
  for (int i = 1; i <= 64; i++) { if (i > r) break; float w = exp(-0.5*float(i*i)/(sigma*sigma));
    s += w*(texture(q, uv + rich*float(i)) + texture(q, uv - rich*float(i))); wsum += 2.0*w; }
  aus = s/wsum; }`;
// Halbieren/Verdoppeln in Texel-Koordinaten (exakt auch bei ungeraden Größen -> Kacheln = Ganzbild)
const FS_HALB = `uniform sampler2D q; uniform vec2 qpx; void main(){ vec2 m = (floor(gl_FragCoord.xy)*2.0 + 1.0)*qpx;
  aus = 0.25*(texture(q, m + vec2(-0.5,-0.5)*qpx) + texture(q, m + vec2(0.5,-0.5)*qpx) + texture(q, m + vec2(-0.5,0.5)*qpx) + texture(q, m + vec2(0.5,0.5)*qpx)); }`;
const FS_DOPPELT = `uniform sampler2D q; uniform vec2 kpx; void main(){ aus = texture(q, gl_FragCoord.xy*0.5*kpx); }`;
const FS_KOPIE = `uniform sampler2D q; void main(){ aus = texture(q, uv); }`;
const FS_DIFF = `uniform sampler2D a; uniform sampler2D b; void main(){ aus = texture(a, uv) - texture(b, uv); }`;
const FS_SUMME = `uniform sampler2D a; uniform sampler2D b; void main(){ aus = texture(a, uv) + texture(b, uv); }`;
const FS_GF1 = `uniform sampler2D p; uniform sampler2D f; uniform int grau;
void main(){ vec3 P = texture(p, uv).rgb; float I = grau == 1 ? texture(f, uv).r : lum(texture(f, uv).rgb); aus = vec4(P, I); }`;
const FS_GF2 = `uniform sampler2D p; uniform sampler2D f; uniform int grau;
void main(){ vec3 P = texture(p, uv).rgb; float I = grau == 1 ? texture(f, uv).r : lum(texture(f, uv).rgb); aus = vec4(I*P, I*I); }`;
const FS_GF3 = `uniform sampler2D m1; uniform sampler2D m2; uniform float eps; uniform int teil;
void main(){ vec4 a = texture(m1, uv); vec4 b = texture(m2, uv); float varI = max(b.a - a.a*a.a, 0.0);
  vec3 A = (b.rgb - a.a*a.rgb)/(varI + eps); vec3 B = a.rgb - A*a.a; aus = teil == 0 ? vec4(A, 1.0) : vec4(B, 1.0); }`;
const FS_GF4 = `uniform sampler2D A; uniform sampler2D B; uniform sampler2D f; uniform int grau;
void main(){ float I = grau == 1 ? texture(f, uv).r : lum(texture(f, uv).rgb); aus = vec4(texture(A, uv).rgb*I + texture(B, uv).rgb, 1.0); }`;
const FS_KODIERE = `uniform sampler2D q; void main(){ aus = vec4(zuSrgb(texture(q, uv).rgb), 1.0); }`;
const FS_LOGL = `uniform sampler2D q; void main(){ aus = vec4(logL(texture(q, uv).rgb), 0.0, 0.0, 1.0); }`;
// Ausgabe: Ziel-uv -> Ausgabe normiert (zielZuAusgabe) -> Quelle normiert (ausgabeZuQuelle) -> Regions-Textur.
const FS_AUSGABE = `uniform sampler2D bildN; uniform sampler2D bildV; uniform mat3 zielZuAusgabe; uniform mat3 ausgabeZuQuelle;
uniform vec4 regN; uniform vec4 regV; uniform float teil; uniform vec3 grund; uniform int flipY; uniform vec2 absOff; uniform float zielH;
uniform int kodiere; uniform sampler2D maske; uniform int maskeZeigen; uniform vec4 maskeFarbe;
void main(){ vec2 c = flipY == 1 ? vec2(uv.x, 1.0 - uv.y) : uv; vec2 a = (zielZuAusgabe*vec3(c, 1.0)).xy;
  if (a.x < 0.0 || a.y < 0.0 || a.x > 1.0 || a.y > 1.0) { aus = vec4(grund, 1.0); return; }
  vec2 s = (ausgabeZuQuelle*vec3(a, 1.0)).xy;
  if (s.x < -1e-4 || s.y < -1e-4 || s.x > 1.0001 || s.y > 1.0001) { aus = vec4(grund, 1.0); return; }
  bool vorher = c.x < teil; vec3 f = vorher ? texture(bildV, (s - regV.xy)/regV.zw).rgb : texture(bildN, (s - regN.xy)/regN.zw).rgb;
  if (maskeZeigen == 1) { float m = texture(maske, s).r; f = mix(f, maskeFarbe.rgb, m*maskeFarbe.a); }
  if (kodiere == 1) { vec2 ap = absOff + vec2(gl_FragCoord.x, flipY == 1 ? zielH - gl_FragCoord.y : gl_FragCoord.y); f = zuSrgb(f) + dither(floor(ap)); }
  aus = vec4(f, 1.0); }`;
// Rückfall-Stufe 'auto-ton' (nur aktiv, solange kein anderes StufenModul 'auto-ton' bedient). Gleiche Bedeutung wie
// regler.js/analyse.js (autoTonVorbereiten): lineare Verstärkung wbGains·2^ev mit weicher Schulter, dann Tonwerte
// schwarz/weiss im KODIERTEN Raum, dann Exponent gamma, zurück nach linear.
const FS_AUTOTON = `uniform sampler2D ein; uniform vec3 gain; uniform float g; uniform vec3 s; uniform vec3 w; uniform vec3 gam;
float bel(float x){ if (g >= 1.0){ float z = x*g; return z <= 0.8 ? z : 0.8 + 0.2*(1.0 - exp(-(z - 0.8)/0.2)); } float c = clamp(x, 0.0, 1.0); float c2 = c*c; return g*x + (1.0 - g)*c2*c2*c2; }
void main(){ vec3 x = texture(ein, uv).rgb; vec3 y = vec3(bel(x.r*gain.r), bel(x.g*gain.g), bel(x.b*gain.b));
  vec3 e = clamp((zuSrgb(y) - s)/max(w - s, vec3(1e-4)), 0.0, 1.0); aus = vec4(zuLinear(pow(e, gam)), 1.0); }`;
function autoTonWerte(p = {}) {
  const st = p.staerke ?? 1, gw = p.wbGains || [1, 1, 1];
  return { gain: gw.map((v) => v ** st), g: 2 ** ((p.ev || 0) * st), s: (p.schwarz || [0, 0, 0]).map((v) => v * st), w: (p.weiss || [1, 1, 1]).map((v) => 1 + (v - 1) * st), gam: (p.gamma || [1, 1, 1]).map((v) => 1 + (v - 1) * st) };
}

export const STUFEN_RUECKFALL = Object.freeze([{
  name: 'auto-ton-rueckfall', stufe: STUFE.BELICHTUNG, arten: ['auto-ton'], rueckfall: true,
  aktiv: (s) => (s.params?.staerke ?? 1) > 0,
  rand: () => 0,
  rendere(ctx, ein, s) { return ctx.pass(ctx.programm('auto-ton-rueckfall', FS_AUTOTON), autoTonWerte(s.params), { ein }); },
}]);

const FORMATE = {
  rgba16f: (gl) => [gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT], rgba32f: (gl) => [gl.RGBA32F, gl.RGBA, gl.FLOAT],
  r16f: (gl) => [gl.R16F, gl.RED, gl.HALF_FLOAT], rgba8: (gl) => [gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE],
  srgb8: (gl) => [gl.SRGB8_ALPHA8, gl.RGBA, gl.UNSIGNED_BYTE], r8: (gl) => [gl.R8, gl.RED, gl.UNSIGNED_BYTE],
};

/**
 * @param {HTMLCanvasElement|OffscreenCanvas} canvas @param {{farbraum?:'srgb'|'display-p3'}} [opts]
 */
export function erstellePipeline(canvas, opts = {}) {
  const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: false, desynchronized: false, powerPreference: 'high-performance' });
  if (!gl) return leerePipeline(canvas);
  const floatRender = !!gl.getExtension('EXT_color_buffer_float');
  const halfRender = floatRender || !!gl.getExtension('EXT_color_buffer_half_float');
  const floatLinear = !!gl.getExtension('OES_texture_float_linear');
  const parallel = gl.getExtension('KHR_parallel_shader_compile');
  const faehigkeiten = { halbFloat: halfRender, floatLinear, maxTextur: gl.getParameter(gl.MAX_TEXTURE_SIZE), p3: 'drawingBufferColorSpace' in gl, parallelKompilieren: !!parallel, floatLesen: floatRender };
  const ARBEIT = halfRender ? 'rgba16f' : 'rgba8';
  if (opts.farbraum === 'display-p3' && faehigkeiten.p3) try { gl.drawingBufferColorSpace = 'display-p3'; } catch {}
  gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  const vao = gl.createVertexArray(); gl.bindVertexArray(vao);
  const vs = shader(gl.VERTEX_SHADER, VS);

  function shader(typ, quelle) {
    const s = gl.createShader(typ); gl.shaderSource(s, quelle); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS) && !gl.isContextLost()) throw new BildwerkFehler(FEHLER.GPU, 'Shader: ' + gl.getShaderInfoLog(s));
    return s;
  }
  // ---- Programme ----
  const programme = new Map();
  function programm(name, quelle) {
    const alt = programme.get(name);
    if (alt && alt.quelle === quelle) return alt;
    const voll = /^\s*#version/.test(quelle) ? quelle : KOPF + GLSL_FARBE + GLSL_TON + GLSL_HILFE + quelle;
    const prog = gl.createProgram(); gl.attachShader(prog, vs); gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, voll)); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS) && !gl.isContextLost()) throw new BildwerkFehler(FEHLER.GPU, `Programm ${name}: ` + gl.getProgramInfoLog(prog));
    const info = new Map(); const n = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) { const u = gl.getActiveUniform(prog, i); info.set(u.name.replace(/\[0\]$/, ''), { typ: u.type, groesse: u.size, ort: gl.getUniformLocation(prog, u.name) }); }
    const p = { name, quelle, prog, info };
    programme.set(name, p); return p;
  }
  function setzeUniform(u, w) {
    const T = gl; const a = typeof w === 'number' || typeof w === 'boolean' ? [Number(w)] : w;
    switch (u.typ) {
      case T.FLOAT: u.groesse > 1 ? gl.uniform1fv(u.ort, a) : gl.uniform1f(u.ort, a[0]); break;
      case T.FLOAT_VEC2: gl.uniform2fv(u.ort, a); break; case T.FLOAT_VEC3: gl.uniform3fv(u.ort, a); break; case T.FLOAT_VEC4: gl.uniform4fv(u.ort, a); break;
      case T.INT: case T.BOOL: u.groesse > 1 ? gl.uniform1iv(u.ort, a) : gl.uniform1i(u.ort, a[0]); break;
      case T.FLOAT_MAT3: gl.uniformMatrix3fv(u.ort, false, a); break; case T.FLOAT_MAT4: gl.uniformMatrix4fv(u.ort, false, a); break;
      default: break;
    }
  }
  // ---- Texturen + Pool ----
  let texZaehler = 0;
  function neueTex(format, b, h, daten = null) {
    const [ifmt, fmt, typ] = FORMATE[format](gl); const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, ifmt, b, h, 0, fmt, daten instanceof Float32Array ? gl.FLOAT : typ, daten);
    return { tex, b, h, format, fbo: null, nr: ++texZaehler };
  }
  function fbo(t) {
    if (t.fbo) return t.fbo;
    t.fbo = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, t.fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t.tex, 0);
    return t.fbo;
  }
  function loescheTex(t) { if (!t) return; if (t.fbo) gl.deleteFramebuffer(t.fbo); gl.deleteTexture(t.tex); }
  const pool = new Map(); let ausgegeben = new Set(); let poolBytes = 0;
  const BPP = { rgba16f: 8, rgba32f: 16, r16f: 2, rgba8: 4, srgb8: 4, r8: 1 };
  function temp(format = ARBEIT, b, h) {
    if (format === 'rgba16f' && !halfRender) format = 'rgba8';
    if (format === 'r16f' && !halfRender) format = 'rgba8';
    const k = `${format}:${b}x${h}`; const l = pool.get(k);
    const t = l && l.length ? l.pop() : (poolBytes += b * h * BPP[format], neueTex(format, b, h));
    ausgegeben.add(t); return t;
  }
  function frei(t) {
    if (!t || !ausgegeben.has(t)) return; ausgegeben.delete(t);
    const k = `${t.format}:${t.b}x${t.h}`; if (!pool.has(k)) pool.set(k, []); pool.get(k).push(t);
  }
  function alleFrei(ausser = []) { for (const t of [...ausgegeben]) if (!ausser.includes(t)) frei(t); }
  function poolLeeren() { for (const l of pool.values()) for (const t of l) loescheTex(t); pool.clear(); poolBytes = 0; }

  function zeichne(p, uniforms, eingaenge, ziel) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, ziel ? fbo(ziel) : null);
    const b = ziel ? ziel.b : gl.drawingBufferWidth, h = ziel ? ziel.h : gl.drawingBufferHeight;
    gl.viewport(0, 0, b, h); gl.useProgram(p.prog);
    let einheit = 0;
    for (const [n, t] of Object.entries(eingaenge)) {
      const u = p.info.get(n); if (!u || !t) continue;
      gl.activeTexture(gl.TEXTURE0 + einheit); gl.bindTexture(gl.TEXTURE_2D, t.tex); gl.uniform1i(u.ort, einheit++);
    }
    for (const [n, w] of Object.entries(uniforms)) { const u = p.info.get(n); if (u && w != null) setzeUniform(u, w); }
    const upx = p.info.get('px'); if (upx) gl.uniform2f(upx.ort, 1 / b, 1 / h);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    for (let i = 0; i < einheit; i++) { gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, null); }
  }

  // ---- Zustand ----
  const stufen = [];                 // registrierte StufenModule
  const raster = new Map();          // id -> Tex (Arbeitsauflösung, Quell-Koordinaten)
  const luts = new Map();
  let q = null;                      // { bild, b, h, voll: Tex|null, arbeit: Tex, arbeitB, arbeitH, farbraum }
  let basisCache = new Map();
  let einleseCache = null;           // { schluessel, tex, vorherTex }
  const neutral = {};
  const statistik = { renders: 0, letzteMs: 0, passe: 0 };

  function neutralTex(wert) {
    if (!neutral[wert]) { neutral[wert] = neueTex('rgba8', 1, 1, new Uint8Array([wert, wert, wert, 255])); }
    return neutral[wert];
  }

  // Regions-Kontext. reg = {x,y,b,h} in Quell-Pixeln, ziel = {b,h} Pixel der Regions-Textur.
  function kontext(reg, zielB, zielH, skala, qualitaet, analyse, gesichter) {
    const regN = [reg.x / q.b, reg.y / q.h, reg.b / q.b, reg.h / q.h];
    const pxProQuelle = zielB / reg.b;
    const kurzeSeite = Math.min(q.b, q.h) * pxProQuelle;
    const ausschnittCache = new Map();
    const ctx = {
      gl, b: zielB, h: zielH, kurzeSeite, skala, qualitaet, analyse: analyse || null, gesichter: gesichter || [],
      region: { x: regN[0], y: regN[1], b: regN[2], h: regN[3] }, pxProQuelle,
      programm,
      pass(p, uniforms = {}, eingaenge = {}, format = ARBEIT, ziel) { const t = ziel || temp(format, zielB, zielH); zeichne(p, uniforms, eingaenge, t); statistik.passe++; return t; },
      temp: (format = ARBEIT, b = zielB, h = zielH) => temp(format, b, h), frei,
      unschaerfe(tex, radiusAnteil) { return unschaerfe(tex, radiusAnteil * kurzeSeite); },
      gefuehrt(eingabe, fuehrung, radiusAnteil, eps) { return gefuehrt(eingabe, fuehrung, radiusAnteil * kurzeSeite, eps); },
      pyramide(tex, n) { return pyramide(tex, n); },
      rekonstruiere(p) { return rekonstruiere(p); },
      basis(name) { return ausschnitt('basis:' + name, basisTex(name)); },
      lut(id, daten, breite) { return lut(id, daten, breite); },
      raster(id) { const t = raster.get(id); return t ? ausschnitt('raster:' + id, t) : null; },
    };
    function ausschnitt(schluessel, t) {
      if (t.b === 1 && t.h === 1) return t;
      if (ausschnittCache.has(schluessel)) return ausschnittCache.get(schluessel);
      const fmt = t.format === 'r8' ? 'rgba8' : (t.format === 'srgb8' ? ARBEIT : (t.format === 'r16f' ? 'r16f' : t.format));
      const aus = temp(fmt, zielB, zielH);
      zeichne(programm('_ausschnitt', FS_AUSSCHNITT), { reg: regN }, { q: t }, aus);
      ausschnittCache.set(schluessel, aus); return aus;
    }
    function unschaerfe(tex, sigmaPx) {
      if (sigmaPx < 0.35) { const k = temp(tex.format, tex.b, tex.h); zeichne(programm('_kopie', FS_KOPIE), {}, { q: tex }, k); return k; }
      let stufe = tex, ebenen = 0, s = sigmaPx; const zwischen = [];
      while (s > 6 && stufe.b > 8 && stufe.h > 8 && ebenen < 6) {
        const hb = Math.max(1, Math.ceil(stufe.b / 2)), hh = Math.max(1, Math.ceil(stufe.h / 2)); const t = temp(tex.format, hb, hh);
        zeichne(programm('_halb', FS_HALB), { qpx: [1 / stufe.b, 1 / stufe.h] }, { q: stufe }, t); zwischen.push(t); stufe = t; s /= 2; ebenen++;
      }
      // Restunschärfe auf der kleinen Stufe (Herunterrechnen hat schon ~0,5 px je Stufe beigetragen)
      const sRest = Math.sqrt(Math.max(0.25, s * s - (ebenen ? 0.25 : 0)));
      const r = Math.min(64, Math.ceil(sRest * 3)); const pB = programm('_blur', FS_BLUR);
      const t1 = temp(tex.format, stufe.b, stufe.h), t2 = temp(tex.format, stufe.b, stufe.h);
      zeichne(pB, { rich: [1 / stufe.b, 0], sigma: sRest, r }, { q: stufe }, t1);
      zeichne(pB, { rich: [0, 1 / stufe.h], sigma: sRest, r }, { q: t1 }, t2); frei(t1);
      for (const z of zwischen) frei(z);
      if (!ebenen) return t2;
      // stufenweise zurück (je ×2, exakt ausgerichtet)
      let g = t2;
      for (let i = zwischen.length - 2; i >= -1; i--) { const ziel = i >= 0 ? zwischen[i] : tex; const o = temp(tex.format, ziel.b, ziel.h); zeichne(programm('_doppelt', FS_DOPPELT), { kpx: [1 / g.b, 1 / g.h] }, { q: g }, o); frei(g); g = o; }
      return g;
    }
    function gefuehrt(eingabe, fuehrung, rPx, eps) {
      const grau = fuehrung.format === 'r16f' || fuehrung.format === 'r8' ? 1 : 0;
      const a = temp(ARBEIT, zielB, zielH), b = temp(ARBEIT, zielB, zielH);
      zeichne(programm('_gf1', FS_GF1), { grau }, { p: eingabe, f: fuehrung }, a);
      zeichne(programm('_gf2', FS_GF2), { grau }, { p: eingabe, f: fuehrung }, b);
      const ma = unschaerfe(a, rPx), mb = unschaerfe(b, rPx); frei(a); frei(b);
      const A = temp(ARBEIT, zielB, zielH), B = temp(ARBEIT, zielB, zielH);
      zeichne(programm('_gf3', FS_GF3), { eps, teil: 0 }, { m1: ma, m2: mb }, A);
      zeichne(programm('_gf3', FS_GF3), { eps, teil: 1 }, { m1: ma, m2: mb }, B); frei(ma); frei(mb);
      const mA = unschaerfe(A, rPx), mB = unschaerfe(B, rPx); frei(A); frei(B);
      const o = temp(ARBEIT, zielB, zielH); zeichne(programm('_gf4', FS_GF4), { grau }, { A: mA, B: mB, f: fuehrung }, o); frei(mA); frei(mB);
      return o;
    }
    function pyramide(tex, n) {
      const laplace = []; let g = tex;
      for (let i = 0; i < n && g.b > 2 && g.h > 2; i++) {
        const gb = unschaerfe(g, 1.0);
        const k = temp(tex.format, Math.ceil(g.b / 2), Math.ceil(g.h / 2)); zeichne(programm('_halb', FS_HALB), { qpx: [1 / g.b, 1 / g.h] }, { q: gb }, k); frei(gb);
        const hoch = temp(tex.format, g.b, g.h); zeichne(programm('_doppelt', FS_DOPPELT), { kpx: [1 / k.b, 1 / k.h] }, { q: k }, hoch);
        const l = temp(tex.format, g.b, g.h); zeichne(programm('_diff', FS_DIFF), {}, { a: g, b: hoch }, l); frei(hoch);
        laplace.push(l); if (g !== tex) frei(g); g = k;
      }
      return { laplace, rest: g };
    }
    function rekonstruiere({ laplace, rest }) {
      let g = rest;
      for (let i = laplace.length - 1; i >= 0; i--) { const l = laplace[i]; const hoch = temp(l.format, l.b, l.h); zeichne(programm('_doppelt', FS_DOPPELT), { kpx: [1 / g.b, 1 / g.h] }, { q: g }, hoch); if (g !== rest) frei(g); const o = temp(l.format, l.b, l.h); zeichne(programm('_summe', FS_SUMME), {}, { a: l, b: hoch }, o); frei(hoch); g = o; }
      return g;
    }
    return ctx;
  }
  function lut(id, daten, breite) {
    const alt = luts.get(id);
    if (alt && alt.daten === daten) return alt.tex;
    const kanaele = daten.length / breite; const fmt = kanaele === 4 ? 'rgba16f' : 'r16f';
    if (alt && alt.tex.b === breite && alt.kanaele === kanaele) {
      gl.bindTexture(gl.TEXTURE_2D, alt.tex.tex); gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, breite, 1, kanaele === 4 ? gl.RGBA : gl.RED, gl.FLOAT, daten); alt.daten = daten; return alt.tex;
    }
    if (alt) loescheTex(alt.tex);
    const tex = neueTex(fmt, breite, 1, daten);
    luts.set(id, { tex, daten, kanaele }); return tex;
  }
  // Basis-Schichten in Arbeitsauflösung (aus der Quelle, vor allen Schritten). logL wird hier berechnet,
  // die übrigen kommen über setzeRaster(name, …) (z. B. 'detailkarte' aus der Analyse, 'tiefe' aus auswahl.js).
  function basisTex(name) {
    if (raster.has(name)) return raster.get(name);
    if (name === 'logL' && q) {
      if (!basisCache.has('logL')) {
        const gross = { x: 0, y: 0, b: q.b, h: q.h };
        const ctx = kontext(gross, q.arbeitB, q.arbeitH, 1, 'voll', null, []);
        const l = temp('r16f', q.arbeitB, q.arbeitH); zeichne(programm('_logl', FS_LOGL), {}, { q: q.arbeit }, l);
        const g = ctx.gefuehrt(l, l, 0.015, 0.06); frei(l);
        const k = neueTex(halfRender ? 'r16f' : 'rgba8', q.arbeitB, q.arbeitH); zeichne(programm('_kopie', FS_KOPIE), {}, { q: g }, k); frei(g);
        basisCache.set('logL', k);
      }
      return basisCache.get('logL');
    }
    return neutralTex(name === 'transmission' ? 255 : name === 'tiefe' ? 128 : 0);
  }

  function aktiveStufen(doc, ctxProbe) {
    const ordnung = renderReihenfolge(doc.schritte || []);
    const paare = [];
    ordnung.forEach((s, i) => {
      const eigene = stufen.filter((m) => !m.rueckfall && m.arten.includes(s.art));
      const liste = eigene.length ? eigene : STUFEN_RUECKFALL.filter((m) => m.arten.includes(s.art));
      for (const m of liste) { let an = false; try { an = m.aktiv(s, ctxProbe); } catch { an = false; } if (an) paare.push({ m, s, i }); }
    });
    paare.sort((a, b) => a.m.stufe - b.m.stufe || a.i - b.i);
    return paare;
  }

  /** Rendert die Schritte für einen Quell-Ausschnitt. Gibt Textur (mit Rand) + innere Lage zurück. */
  function rendereRegion(doc, reg, pxProQuelle, { qualitaet = 'voll', quelleArt, mitSchritten = true, bisStufe = Infinity, abStufe = -Infinity, eingang = null, randVonAllen = false, analyse, gesichter } = {}) {
    const probe = { b: 1, h: 1, kurzeSeite: Math.min(q.b, q.h) * pxProQuelle, qualitaet, analyse, gesichter };
    const alle = mitSchritten ? aktiveStufen(doc, probe) : [];
    const paare = alle.filter((p) => p.m.stufe < bisStufe && p.m.stufe >= abStufe);
    let randPx = 0;
    // INTEGRATION: Ränder aufeinanderfolgender Stufen addieren sich (Einzugsbereich wächst je Stufe), daher Summe statt Maximum.
    for (const { m, s } of (randVonAllen ? alle : paare)) { try { randPx += Math.max(0, m.rand(s, probe.kurzeSeite) || 0); } catch {} }
    const randQ = eingang ? 0 : Math.ceil(randPx / pxProQuelle);
    // Region um den Rand erweitern, auf das Bild begrenzen, an Ziel-Pixelraster ausrichten
    const x0 = Math.max(0, reg.x - randQ), y0 = Math.max(0, reg.y - randQ);
    const x1 = Math.min(q.b, reg.x + reg.b + randQ), y1 = Math.min(q.h, reg.y + reg.h + randQ);
    // Ursprung auf ein 64er-Raster der Zielauflösung legen: Pyramiden-/Halbierungs-Raster gleich wie beim Ganzbild
    const A = randQ > 0 ? 64 : 1;
    const zx0 = Math.floor(Math.floor(x0 * pxProQuelle + 1e-6) / A) * A, zy0 = Math.floor(Math.floor(y0 * pxProQuelle + 1e-6) / A) * A;
    const zx1 = Math.min(Math.ceil(q.b * pxProQuelle - 1e-6), Math.ceil(Math.ceil(x1 * pxProQuelle - 1e-6) / A) * A), zy1 = Math.min(Math.ceil(q.h * pxProQuelle - 1e-6), Math.ceil(Math.ceil(y1 * pxProQuelle - 1e-6) / A) * A);
    const zielB = eingang ? eingang.b : Math.max(1, zx1 - zx0), zielH = eingang ? eingang.h : Math.max(1, zy1 - zy0);
    const erw = eingang ? { ...reg } : { x: zx0 / pxProQuelle, y: zy0 / pxProQuelle, b: zielB / pxProQuelle, h: zielH / pxProQuelle };
    const skala = pxProQuelle / (q.arbeitB / q.b);
    const ctx = kontext(erw, zielB, zielH, skala, qualitaet, analyse, gesichter);
    let tex = eingang;
    if (!tex) {
      const art = quelleArt || (pxProQuelle > (q.arbeitB / q.b) * 1.05 && q.voll ? 'voll' : 'arbeit');
      tex = einlesen(art, erw, zielB, zielH);
    }
    const start = tex;
    for (const { m, s } of paare) {
      const maske = s.maske ? (ctx.raster(s.maske.rasterId || s.maske.id)) : null;
      if (s.maske && !maske) continue;           // Maske noch nicht gebaut -> Schritt überspringen
      let aus;
      try { aus = m.rendere(ctx, tex, s, maske); } catch (e) { console.warn('Stufe', m.name, e); continue; }
      if (!aus || aus === tex) continue;
      const d = s.deckkraft ?? 1;
      if (d < 0.999 && !m.mischtSelbst) { const mix = temp(ARBEIT, zielB, zielH); zeichne(programm('_misch', FS_MISCH), { d, mitMaske: 0 }, { a: tex, b: aus, m: aus }, mix); if (aus !== start) frei(aus); aus = mix; }
      if (tex !== start) frei(tex);
      tex = aus;
    }
    return { tex, start, erw, zielB, zielH, regN: [erw.x / q.b, erw.y / q.h, erw.b / q.b, erw.h / q.h] };
  }
  function einlesen(art, erw, zielB, zielH) {
    const t = temp(ARBEIT, zielB, zielH);
    const qt = art === 'voll' && q.voll ? q.voll : q.arbeit;
    const fussTexel = (erw.b / zielB) * (qt.b / q.b);
    const n = Math.max(1, Math.min(8, Math.ceil(fussTexel / 1.5)));
    zeichne(programm('_einlesen', FS_EINLESEN), { reg: [erw.x / q.b, erw.y / q.h, erw.b / q.b, erw.h / q.h], qGr: [qt.b, qt.h], n, istSrgb: qt.format === 'rgba8' && qt.srgbKodiert ? 1 : 0 }, { q: qt }, t);
    return t;
  }

  // Ausgabe-Pass: rendert Regions-Texturen über Geometrie + Ansicht in ein Ziel (Canvas oder Textur).
  function ausgabe(ziel, { zielZuAusgabe, ausgabeZuQuelle, nach, vor, teil = -1, flipY, kodiere = 1, absOff = [0, 0], zielH, maske = null }) {
    zeichne(programm('_ausgabe', FS_AUSGABE), {
      zielZuAusgabe, ausgabeZuQuelle, regN: nach.regN, regV: (vor || nach).regN, teil, grund: [0.043, 0.047, 0.051], flipY: flipY ? 1 : 0,
      absOff, zielH, kodiere, maskeZeigen: maske ? 1 : 0, maskeFarbe: [1, 0.3, 0.3, 0.4],
    }, { bildN: nach.tex, bildV: (vor || nach).tex, maske: maske || nach.tex }, ziel);
  }

  // Sichtbarer Quell-Ausschnitt einer Ansicht (Pixel der Quelle) + Auflösung.
  function sichtRegion(doc, ansicht, zielB, zielH) {
    const gm = geometrieMatrix(doc.geometrie, q.b, q.h);
    const am = ansichtMatrix(ansicht, gm.ausgabeB, gm.ausgabeH);            // Schirm-uv -> Ausgabe normiert
    const m = mal3(gm.matrix, am);                                            // Schirm-uv -> Quelle normiert
    let x0 = 1, y0 = 1, x1 = 0, y1 = 0;
    for (const [u, v] of [[0, 0], [1, 0], [0, 1], [1, 1], [0.5, 0], [0, 0.5], [1, 0.5], [0.5, 1]]) {
      // Schirm-Ecke auf die Ausgabe begrenzen
      const a = anwenden(am, u, v); const ac = [Math.min(1, Math.max(0, a[0])), Math.min(1, Math.max(0, a[1]))];
      const s = anwenden(gm.matrix, ac[0], ac[1]); x0 = Math.min(x0, s[0]); y0 = Math.min(y0, s[1]); x1 = Math.max(x1, s[0]); y1 = Math.max(y1, s[1]);
    }
    x0 = Math.max(0, x0); y0 = Math.max(0, y0); x1 = Math.min(1, x1); y1 = Math.min(1, y1);
    // Gerätepixel je Quellpixel (Ausgabe-Pixel = Quell-Pixel, Drehung ändert die Dichte nicht)
    const proAusgabe = Math.min(ansicht.cssB / gm.ausgabeB, ansicht.cssH / gm.ausgabeH) * (ansicht.zoom || 1) * (zielB / ansicht.cssB);
    return { gm, am, m, reg: { x: x0 * q.b, y: y0 * q.h, b: Math.max(1, (x1 - x0) * q.b), h: Math.max(1, (y1 - y0) * q.h) }, pxProQuelle: proAusgabe };
  }
  function anwenden(m, u, v) { return [m[0] * u + m[3] * v + m[6], m[1] * u + m[4] * v + m[7]]; }

  // ---- Lesen (async, Fence) ----
  function leseAsync(t, x, y, b, h, typ) {
    const float = typ === 'float';
    const bytes = b * h * 4 * (float ? 4 : 1);
    const pbo = gl.createBuffer(); gl.bindBuffer(gl.PIXEL_PACK_BUFFER, pbo); gl.bufferData(gl.PIXEL_PACK_BUFFER, bytes, gl.STREAM_READ);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo(t)); gl.readPixels(x, y, b, h, gl.RGBA, float ? gl.FLOAT : gl.UNSIGNED_BYTE, 0);
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0); gl.flush();
    return new Promise((ok, fehl) => {
      const pruefe = () => {
        const st = gl.clientWaitSync(sync, 0, 0);
        if (st === gl.WAIT_FAILED) { gl.deleteSync(sync); gl.deleteBuffer(pbo); fehl(new BildwerkFehler(FEHLER.GPU, 'Lesen fehlgeschlagen')); return; }
        if (st === gl.TIMEOUT_EXPIRED) { setTimeout(pruefe, 2); return; }
        gl.deleteSync(sync);
        const aus = float ? new Float32Array(b * h * 4) : new Uint8ClampedArray(b * h * 4);
        gl.bindBuffer(gl.PIXEL_PACK_BUFFER, pbo); gl.getBufferSubData(gl.PIXEL_PACK_BUFFER, 0, aus); gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null); gl.deleteBuffer(pbo);
        ok(aus);
      };
      setTimeout(pruefe, 0);
    });
  }

  function brauchtQuelle() { if (!q) throw new BildwerkFehler(FEHLER.UNBEKANNT, 'Kein Bild geladen'); }

  // ---- Export (Kacheln) ----
  async function exportiere(zustand, o = {}) {
    brauchtQuelle();
    const doc = zustand.doc; const format = o.format || 'image/jpeg';
    const gm = geometrieMatrix(doc.geometrie, q.b, q.h);
    let skala = o.skala || 1;
    let ausB = Math.round(gm.ausgabeB * skala), ausH = Math.round(gm.ausgabeH * skala);
    if (o.maxKante && Math.max(ausB, ausH) > o.maxKante) { const f = o.maxKante / Math.max(ausB, ausH); ausB = Math.round(ausB * f); ausH = Math.round(ausH * f); }
    const pxProQuelle = ausB / gm.ausgabeB;               // Ausgabe-Pixel je Quell-Pixel
    const kachel = o.kachel || KACHEL;
    const daten = new Uint8ClampedArray(ausB * ausH * 4);
    const kx = Math.ceil(ausB / kachel), ky = Math.ceil(ausH / kachel), gesamt = kx * ky; let fertig = 0;
    const hochFaktor = skala > 1 && o.hochKachel && Math.abs(ausB / gm.ausgabeB - skala) < 1e-6 ? skala : 1;
    for (let ty = 0; ty < ky; ty++) for (let tx = 0; tx < kx; tx++) {
      if (o.signal?.aborted) { alleFrei(); throw new BildwerkFehler(FEHLER.ABBRUCH, 'abgebrochen'); }
      const ox = tx * kachel, oy = ty * kachel, ob = Math.min(kachel, ausB - ox), oh = Math.min(kachel, ausH - oy);
      // Ziel-uv der Kachel -> Ausgabe normiert
      const zielZuAusgabe = new Float32Array([ob / ausB, 0, 0, 0, oh / ausH, 0, ox / ausB, oy / ausH, 1]);
      // benötigter Quell-Ausschnitt (+1 px für bilineares Abtasten)
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (const [u, v] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
        const a = anwenden(zielZuAusgabe, u, v); const s = anwenden(gm.matrix, a[0], a[1]);
        x0 = Math.min(x0, s[0] * q.b); y0 = Math.min(y0, s[1] * q.h); x1 = Math.max(x1, s[0] * q.b); y1 = Math.max(y1, s[1] * q.h);
      }
      const g = 2 / pxProQuelle;
      const reg = { x: Math.max(0, x0 - g), y: Math.max(0, y0 - g) }; reg.b = Math.min(q.b, x1 + g) - reg.x; reg.h = Math.min(q.h, y1 + g) - reg.y;
      if (reg.b <= 0 || reg.h <= 0) { fertig++; continue; }
      let r;
      if (hochFaktor > 1) {
        // Stufen vor HOCH in Quell-Auflösung (Rand für alle Stufen), dann Hochskalier-Brücke, dann der Rest
        const vor = rendereRegion(doc, reg, 1, { quelleArt: 'voll', bisStufe: STUFE.HOCH, randVonAllen: true, analyse: doc.analyse, gesichter: doc.gesichter });
        const k8 = temp('rgba8', vor.zielB, vor.zielH); zeichne(programm('_kodiere', FS_KODIERE), {}, { q: vor.tex }, k8);
        const roh = await leseAsync(k8, 0, 0, vor.zielB, vor.zielH, 'u8');
        let hoch = null;
        try { hoch = await o.hochKachel({ b: vor.zielB, h: vor.zielH, daten: roh }, hochFaktor, o.hochModus || 'treu'); } catch { hoch = null; }
        alleFrei();
        if (hoch && hoch.b === vor.zielB * hochFaktor && hoch.h === vor.zielH * hochFaktor) {
          const eingang = temp(ARBEIT, hoch.b, hoch.h);
          const s8 = neueTex('rgba8', hoch.b, hoch.h, new Uint8Array(hoch.daten.buffer, hoch.daten.byteOffset, hoch.daten.byteLength));
          zeichne(programm('_einlesen', FS_EINLESEN), { reg: [0, 0, 1, 1], qGr: [hoch.b, hoch.h], n: 1, istSrgb: 1 }, { q: s8 }, eingang); loescheTex(s8);
          r = rendereRegion(doc, vor.erw, pxProQuelle, { abStufe: STUFE.HOCH, eingang, analyse: doc.analyse, gesichter: doc.gesichter });
        } else {
          r = rendereRegion(doc, reg, pxProQuelle, { quelleArt: 'voll', analyse: doc.analyse, gesichter: doc.gesichter });   // Rückfall: GPU-Vergrößerung
        }
      } else {
        r = rendereRegion(doc, reg, pxProQuelle, { quelleArt: 'voll', qualitaet: 'voll', analyse: doc.analyse, gesichter: doc.gesichter });
      }
      const ziel = temp('rgba8', ob, oh);
      ausgabe(ziel, { zielZuAusgabe, ausgabeZuQuelle: gm.matrix, nach: r, flipY: false, kodiere: 1, absOff: [ox, oy], zielH: oh });
      const px = await leseAsync(ziel, 0, 0, ob, oh, 'u8');
      for (let y = 0; y < oh; y++) daten.set(px.subarray(y * ob * 4, (y + 1) * ob * 4), ((oy + y) * ausB + ox) * 4);
      alleFrei();
      fertig++; o.onFortschritt?.(fertig / gesamt, `Kachel ${fertig}/${gesamt}`);
      await new Promise((ok) => setTimeout(ok, 0));
    }
    if (o.roh) return { b: ausB, h: ausH, daten };
    return kodiereBild({ b: ausB, h: ausH, daten }, format, o.qualitaet ?? 0.92);
  }
  const api = {
    gl, faehigkeiten, statistik,
    async ladeQuelle(bild, o = {}) {
      const b = bild.width, h = bild.height; const kante = o.arbeitsKante || ARBEITS_KANTE;
      api.entladeQuelle();
      const voll = (b * h <= 25e6 && Math.max(b, h) <= faehigkeiten.maxTextur) ? neueTex('srgb8', b, h, null) : null;
      if (voll) { gl.bindTexture(gl.TEXTURE_2D, voll.tex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.SRGB8_ALPHA8, gl.RGBA, gl.UNSIGNED_BYTE, bild); }
      let quellTex = voll;
      if (!quellTex) {   // sehr große Bilder: verkleinert hochladen (Export dann aus der Arbeitsquelle, siehe LOG)
        const f = Math.min(1, Math.sqrt(25e6 / (b * h)), faehigkeiten.maxTextur / Math.max(b, h));
        const k = await createImageBitmap(bild, { resizeWidth: Math.floor(b * f), resizeHeight: Math.floor(h * f), resizeQuality: 'high' });
        quellTex = neueTex('srgb8', k.width, k.height, null); gl.bindTexture(gl.TEXTURE_2D, quellTex.tex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.SRGB8_ALPHA8, gl.RGBA, gl.UNSIGNED_BYTE, k); k.close?.();
      }
      const s = Math.min(1, kante / Math.max(b, h)); const arbeitB = Math.max(1, Math.round(b * s)), arbeitH = Math.max(1, Math.round(h * s));
      q = { bild, b, h, voll: quellTex, arbeit: null, arbeitB, arbeitH, farbraum: o.farbraum || 'srgb' };
      const arbeit = neueTex(ARBEIT, arbeitB, arbeitH);
      const n = Math.max(1, Math.min(8, Math.ceil((quellTex.b / arbeitB) / 1.5)));
      zeichne(programm('_einlesen', FS_EINLESEN), { reg: [0, 0, 1, 1], qGr: [quellTex.b, quellTex.h], n, istSrgb: 0 }, { q: quellTex }, arbeit);
      q.arbeit = arbeit;
      if (!voll) q.voll = quellTex;
      return { arbeitB, arbeitH };
    },
    entladeQuelle() {
      if (!q) return; if (q.voll) loescheTex(q.voll); if (q.arbeit) loescheTex(q.arbeit);
      for (const t of basisCache.values()) loescheTex(t); basisCache = new Map(); q = null; poolLeeren();
    },
    hatQuelle: () => !!q, quelleGroesse: () => (q ? { b: q.b, h: q.h, arbeitB: q.arbeitB, arbeitH: q.arbeitH } : null),
    async leseArbeitsbild(o = {}) {
      brauchtQuelle();
      const kante = o.kante || Math.max(q.arbeitB, q.arbeitH); const s = Math.min(1, kante / Math.max(q.b, q.h));
      const b = Math.max(1, Math.round(q.b * s)), h = Math.max(1, Math.round(q.h * s));
      const fmt = floatRender ? 'rgba32f' : 'rgba8';
      const t = neueTex(fmt, b, h);
      const n = Math.max(1, Math.min(8, Math.ceil((q.arbeitB / b) / 1.5)));
      zeichne(programm('_einlesen', FS_EINLESEN), { reg: [0, 0, 1, 1], qGr: [q.arbeitB, q.arbeitH], n, istSrgb: 0 }, { q: q.arbeit }, t);
      let daten;
      if (floatRender) daten = await leseAsync(t, 0, 0, b, h, 'float');
      else { const u = await leseAsync(t, 0, 0, b, h, 'u8'); daten = new Float32Array(u.length); for (let i = 0; i < u.length; i++) daten[i] = u[i] / 255; }
      loescheTex(t);
      return { b, h, kanaele: 4, daten, farbraum: q.farbraum, linear: true };
    },
    setzeRaster(id, d, o = {}) {
      api.entferneRaster(id);
      let t;
      if (typeof ImageBitmap !== 'undefined' && d instanceof ImageBitmap) {
        t = neueTex(o.srgb ? 'srgb8' : 'rgba8', d.width, d.height, null); gl.bindTexture(gl.TEXTURE_2D, t.tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, o.srgb ? gl.SRGB8_ALPHA8 : gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, d);
      } else if (d.daten instanceof Float32Array) t = neueTex(halfRender ? 'r16f' : 'rgba32f', d.b, d.h, d.daten);
      else if (d.daten instanceof Uint8Array && d.daten.length === d.b * d.h) t = neueTex('r8', d.b, d.h, d.daten);
      else t = neueTex(o.srgb ? 'srgb8' : 'rgba8', d.b, d.h, new Uint8Array(d.daten.buffer, d.daten.byteOffset, d.daten.byteLength));
      raster.set(id, t);
    },
    entferneRaster(id) { const t = raster.get(id); if (t) { loescheTex(t); raster.delete(id); } },
    hatRaster: (id) => raster.has(id),
    registriereStufen(liste) {
      for (const m of liste) { const i = stufen.findIndex((x) => x.name === m.name); if (i >= 0) stufen.splice(i, 1); stufen.push(m); }
      stufen.sort((a, b) => a.stufe - b.stufe);
    },
    rendereVorschau(zustand) {
      const t0 = performance.now();
      const B = gl.drawingBufferWidth, H = gl.drawingBufferHeight;
      if (!q || !zustand?.doc) { gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, B, H); gl.clearColor(0.043, 0.047, 0.051, 1); gl.clear(gl.COLOR_BUFFER_BIT); return; }
      const ansicht = zustand.ansicht || { zoom: 1, mitteX: 0.5, mitteY: 0.5, cssB: B, cssH: H, dpr: 1 };
      const sr = sichtRegion(zustand.doc, ansicht, B, H);
      let px = sr.pxProQuelle;
      if (zustand.qualitaet === 'zieh' && sr.reg.b * sr.reg.h * px * px > 1.2e6) px *= 0.6;    // beim Ziehen leichter rechnen
      px = Math.min(px, 1);                                                                    // nie über Quell-Auflösung
      const vergleich = zustand.vergleich || 'nachher';
      const nurVorher = vergleich === 'vorher';
      const r = rendereRegion(zustand.doc, sr.reg, px, { qualitaet: zustand.qualitaet || 'voll', mitSchritten: !nurVorher, analyse: zustand.doc.analyse, gesichter: zustand.doc.gesichter });
      const vor = typeof vergleich === 'object' ? { tex: r.start, regN: r.regN } : null;
      const maske = zustand.maskeZeigen && raster.has(zustand.maskeZeigen) ? raster.get(zustand.maskeZeigen) : null;
      ausgabe(null, { zielZuAusgabe: sr.am, ausgabeZuQuelle: sr.gm.matrix, nach: r, vor, teil: vor ? vergleich.teilung : -1, flipY: true, kodiere: 1, zielH: H, maske });
      alleFrei();
      statistik.renders++; statistik.letzteMs = performance.now() - t0;
    },
    async rendereMini(zustand, kante = 160) {
      brauchtQuelle();
      const gm = geometrieMatrix(zustand.doc.geometrie, q.b, q.h);
      const f = kante / Math.max(gm.ausgabeB, gm.ausgabeH); const b = Math.max(1, Math.round(gm.ausgabeB * f)), h = Math.max(1, Math.round(gm.ausgabeH * f));
      const r = rendereRegion(zustand.doc, { x: 0, y: 0, b: q.b, h: q.h }, Math.min(1, f), { qualitaet: 'voll', mitSchritten: zustand.vergleich !== 'vorher', analyse: zustand.doc.analyse, gesichter: zustand.doc.gesichter });
      const ziel = temp('rgba8', b, h);
      ausgabe(ziel, { zielZuAusgabe: new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]), ausgabeZuQuelle: gm.matrix, nach: r, flipY: false, kodiere: 1, zielH: h });
      const px = await leseAsync(ziel, 0, 0, b, h, 'u8'); alleFrei();
      return createImageBitmap(new ImageData(px, b, h));
    },
    rendereLupe(zustand, mitte, zoom = 1) {
      brauchtQuelle();
      const gm = geometrieMatrix(zustand.doc.geometrie, q.b, q.h); const inv = invers3(gm.matrix);
      const a = anwenden(inv, mitte.x, mitte.y);
      const an = zustand.ansicht; const fit = Math.min(an.cssB / gm.ausgabeB, an.cssH / gm.ausgabeH) * (an.dpr || 1);
      api.rendereVorschau({ ...zustand, ansicht: { ...an, mitteX: a[0], mitteY: a[1], zoom: zoom / fit } });
    },
    exportiere,
    async lesePixel(x, y, b, h, zustand) {   // Test: Canvas-Pixel (oben links = 0,0) direkt nach einem Rendern
      if (zustand) api.rendereVorschau(zustand);
      const H = gl.drawingBufferHeight; const aus = new Uint8Array(b * h * 4);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.readPixels(x, H - y - h, b, h, gl.RGBA, gl.UNSIGNED_BYTE, aus);
      const zeile = b * 4, tmp = new Uint8Array(zeile);
      for (let i = 0; i < (h >> 1); i++) { const o1 = i * zeile, o2 = (h - 1 - i) * zeile; tmp.set(aus.subarray(o1, o1 + zeile)); aus.copyWithin(o1, o2, o2 + zeile); aus.set(tmp, o2); }
      return aus;
    },
    speicher: () => ({ poolBytes, raster: raster.size, programme: programme.size }),
    zerstoere() { api.entladeQuelle(); for (const t of raster.values()) loescheTex(t); raster.clear(); gl.getExtension('WEBGL_lose_context')?.loseContext(); },
    _stufen: stufen,
  };
  return api;
}

/** Bild kodieren (JPEG/PNG) über OffscreenCanvas bzw. Canvas. */
export async function kodiereBild(bild, format = 'image/jpeg', qualitaet = 0.92) {
  const id = new ImageData(bild.daten, bild.b, bild.h);
  if (typeof OffscreenCanvas !== 'undefined') {
    try { const c = new OffscreenCanvas(bild.b, bild.h); const x = c.getContext('2d'); x.putImageData(id, 0, 0); return await c.convertToBlob({ type: format, quality: qualitaet }); } catch {}
  }
  const c = document.createElement('canvas'); c.width = bild.b; c.height = bild.h; c.getContext('2d').putImageData(id, 0, 0);
  return new Promise((ok, fehl) => c.toBlob((b) => (b ? ok(b) : fehl(new BildwerkFehler(FEHLER.SPEICHER, 'Kodieren fehlgeschlagen'))), format, qualitaet));
}

function leerePipeline() {
  const f = () => { throw new BildwerkFehler(FEHLER.GPU, 'WebGL2 ist auf diesem Gerät nicht verfügbar'); };
  return { gl: null, faehigkeiten: null, statistik: {}, ladeQuelle: f, leseArbeitsbild: f, setzeRaster: f, entferneRaster() {}, registriereStufen() {}, rendereVorschau() {}, rendereMini: f, rendereLupe() {}, exportiere: f, zerstoere() {}, hatQuelle: () => false, _stufen: [] };
}
export { STUFE, KACHEL, ARBEITS_KANTE };
