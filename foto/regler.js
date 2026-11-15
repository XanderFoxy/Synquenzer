// Bildwerk – Raw-Entwickler-Regler + Shader-Stufen (Modul analyse/regler). Signaturen FEST (ARCH.md §4.2).
// Import ohne Nebenwirkung; UI-Funktionen fassen das DOM erst beim Aufruf an.
import { STUFE, ART, HSL_BEREICHE, REGLER_STANDARD } from './typen.js';
export { HSL_BEREICHE, ART };

const R = (id, titel, gruppe, min, max, standard, schritt, stufe, einheit) => ({ id, titel, gruppe, min, max, standard, schritt, stufe, einheit });
/** Regler-Definitionen (IDs fest). */
export const REGLER = Object.freeze([
  R('belichtung', 'Belichtung', 'licht', -5, 5, 0, 0.01, STUFE.BELICHTUNG, 'EV'),
  R('kontrast', 'Kontrast', 'licht', -100, 100, 0, 1, STUFE.TON),
  R('lichter', 'Lichter', 'licht', -100, 100, 0, 1, STUFE.TON),
  R('tiefen', 'Tiefen', 'licht', -100, 100, 0, 1, STUFE.TON),
  R('weiss', 'Weiß', 'licht', -100, 100, 0, 1, STUFE.TON),
  R('schwarz', 'Schwarz', 'licht', -100, 100, 0, 1, STUFE.TON),
  R('klarheit', 'Klarheit', 'praesenz', -100, 100, 0, 1, STUFE.PRAESENZ),
  R('struktur', 'Struktur', 'praesenz', -100, 100, 0, 1, STUFE.PRAESENZ),
  R('dunst', 'Dunst entfernen', 'praesenz', -100, 100, 0, 1, STUFE.PRAESENZ),
  R('temperatur', 'Temperatur', 'farbe', 2000, 50000, null, 50, STUFE.WB, 'K'),
  R('toenung', 'Tönung', 'farbe', -150, 150, 0, 1, STUFE.WB),
  R('dynamik', 'Dynamik', 'farbe', -100, 100, 0, 1, STUFE.PRAESENZ),
  R('saettigung', 'Sättigung', 'farbe', -100, 100, 0, 1, STUFE.PRAESENZ),
  R('schaerfe', 'Schärfe', 'details', 0, 150, 0, 1, STUFE.DETAILS),
  R('rauschL', 'Rauschen Luminanz', 'details', 0, 100, 0, 1, STUFE.DETAILS),
  R('rauschF', 'Rauschen Farbe', 'details', 0, 100, 0, 1, STUFE.DETAILS),
  R('vignette', 'Vignette', 'effekte', -100, 100, 0, 1, STUFE.EFFEKTE),
  R('korn', 'Korn', 'effekte', 0, 100, 0, 1, STUFE.EFFEKTE),
]);
export const GRUPPEN = Object.freeze([['licht', 'Licht'], ['praesenz', 'Präsenz'], ['farbe', 'Farbe'], ['details', 'Details'], ['effekte', 'Effekte']]);

// ================================================================ Farbmathe (rein)
const M_RGB_XYZ = [0.4124564, 0.3575761, 0.1804375, 0.2126729, 0.7151522, 0.0721750, 0.0193339, 0.1191920, 0.9503041];
const M_XYZ_RGB = [3.2404542, -1.5371385, -0.4985314, -0.9692660, 1.8760108, 0.0415560, 0.0556434, -0.2040259, 1.0572252];
const mal = (m, v) => [m[0] * v[0] + m[1] * v[1] + m[2] * v[2], m[3] * v[0] + m[4] * v[1] + m[5] * v[2], m[6] * v[0] + m[7] * v[1] + m[8] * v[2]];
const mm = (a, b) => { const o = new Array(9); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) o[i * 3 + j] = a[i * 3] * b[j] + a[i * 3 + 1] * b[3 + j] + a[i * 3 + 2] * b[6 + j]; return o; };
function inv3(m) {
  const [a, b, c, d, e, f, g, h, i] = m, A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g, det = a * A + b * B + c * C;
  return [A / det, -(b * i - c * h) / det, (b * f - c * e) / det, B / det, (a * i - c * g) / det, -(a * f - c * d) / det, C / det, -(a * h - b * g) / det, (a * e - b * d) / det];
}
/** linear sRGB → OKLab */
export function okLab(r, g, b) {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b), m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b), s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s, 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s];
}
/** Planck-Ort (Kim et al.) → CIE 1960 uv */
function planckUV(T) {
  T = Math.min(50000, Math.max(1667, T)); const t = 1e3 / T, t2 = t * t, t3 = t2 * t;
  const x = T <= 4000 ? -0.2661239 * t3 - 0.2343589 * t2 + 0.8776956 * t + 0.179910 : -3.0258469 * t3 + 2.1070379 * t2 + 0.2226347 * t + 0.240390;
  const y = T <= 2222 ? -1.1063814 * x ** 3 - 1.34811020 * x * x + 2.18555832 * x - 0.20219683 : T <= 4000 ? -0.9549476 * x ** 3 - 1.37418593 * x * x + 2.09137015 * x - 0.16748867 : 3.0817580 * x ** 3 - 5.87338670 * x * x + 3.75112997 * x - 0.37001483;
  const n = -2 * x + 12 * y + 3; return [(4 * x) / n, (6 * y) / n];
}
const TOENUNG_UV = 0.0002;   // 1 Einheit Tönung = 0,0002 Δuv (±150 → ±0,03)
function lichtUV(K, toenung) {   // Tönung + = Licht grüner angenommen = Bild magenta (wie gewohnt)
  const a = planckUV(K * 0.99), b = planckUV(K * 1.01), c = planckUV(K), tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty) || 1;
  let nx = -ty / l, ny = tx / l; if (ny < 0) { nx = -nx; ny = -ny; }    // Normale Richtung +v (grün)
  return [c[0] + nx * toenung * TOENUNG_UV, c[1] + ny * toenung * TOENUNG_UV];
}
function uvZuXYZ([u, v]) { const d = 2 * u - 8 * v + 4, x = (3 * u) / d, y = (2 * v) / d; return [x / y, 1, (1 - x - y) / y]; }
function xyzZuUV([X, Y, Z]) { const d = X + 15 * Y + 3 * Z; return [(4 * X) / d, (6 * Y) / d]; }
const REF_RGB = () => mal(M_XYZ_RGB, uvZuXYZ(lichtUV(6504, 0)));
const LW = [0.2126, 0.7152, 0.0722];
/** @returns {[number,number,number]} Gains, die das Licht (K, Tönung) neutralisieren; wbGains(6504, 0) = [1,1,1], Luminanz von Grau bleibt. */
export function wbGains(kelvin, toenung = 0) {
  const ill0 = mal(M_XYZ_RGB, uvZuXYZ(lichtUV(kelvin, toenung))), mx = Math.max(...ill0), ill = ill0.map((v) => Math.max(v, 0.02 * mx)), ref = REF_RGB(), g = ref.map((v, i) => v / ill[i]);
  const Y = LW[0] * g[0] + LW[1] * g[1] + LW[2] * g[2]; return g.map((v) => v / Y);
}
/** @returns {{kelvin:number,toenung:number}} Umkehrung von wbGains (Suche auf dem Planck-Ort in Mired). */
export function wbAusGains(gains) {
  const ref = REF_RGB(), ill = ref.map((v, i) => v / Math.max(1e-6, gains[i])), uv = xyzZuUV(mal(M_RGB_XYZ, ill));
  const ab = (mired) => { const p = planckUV(1e6 / mired); return Math.hypot(p[0] - uv[0], p[1] - uv[1]); };
  let best = 150, bd = Infinity; for (let m = 20; m <= 600; m += 2) { const d = ab(m); if (d < bd) { bd = d; best = m; } }
  let lo = Math.max(20, best - 2), hi = Math.min(600, best + 2);
  for (let k = 0; k < 40; k++) { const a = lo + (hi - lo) / 3, b = hi - (hi - lo) / 3; if (ab(a) < ab(b)) hi = b; else lo = a; }
  const K = 1e6 / ((lo + hi) / 2), p = lichtUV(K, 0), q = lichtUV(K, 1), nx = (q[0] - p[0]) / TOENUNG_UV, ny = (q[1] - p[1]) / TOENUNG_UV;
  const t = ((uv[0] - p[0]) * nx + (uv[1] - p[1]) * ny) / TOENUNG_UV;
  return { kelvin: Math.round(K), toenung: Math.max(-150, Math.min(150, Math.round(t * 10) / 10)) };
}
const M16 = [0.401288, 0.650173, -0.051461, -0.250268, 1.204414, 0.045854, -0.002079, 0.048952, 0.953127];
/** 3×3 (zeilenweise) für den Temperatur-Regler: CAT16 vom angenommenen Licht (K, Tönung) nach Neutral (6504 K). */
export function wbMatrix(kelvin, toenung = 0) {
  const src = mal(M16, uvZuXYZ(lichtUV(kelvin, toenung))), dst = mal(M16, uvZuXYZ(lichtUV(6504, 0)));
  const D = [dst[0] / src[0], 0, 0, 0, dst[1] / src[1], 0, 0, 0, dst[2] / src[2]];
  let M = mm(M_XYZ_RGB, mm(inv3(M16), mm(D, mm(M16, M_RGB_XYZ))));
  const g = mal(M, [1, 1, 1]), Y = LW[0] * g[0] + LW[1] * g[1] + LW[2] * g[2]; M = M.map((v) => v / Y);
  return M;
}

/** @param {[number,number][]} punkte @param {number} [n=1024] @returns {Float32Array} monoton-kubisch (Fritsch–Carlson) */
export function kurveLUT(punkte, n = 1024) {
  const p = (punkte?.length ? punkte : [[0, 0], [1, 1]]).map(([x, y]) => [Math.min(1, Math.max(0, x)), Math.min(1, Math.max(0, y))]).sort((a, b) => a[0] - b[0]);
  const u = []; for (const q of p) if (!u.length || q[0] - u[u.length - 1][0] > 1e-6) u.push(q); else u[u.length - 1] = q;
  const aus = new Float32Array(n);
  if (u.length === 1) return aus.fill(u[0][1]);
  const k = u.length, d = new Array(k - 1), m = new Array(k);
  for (let i = 0; i < k - 1; i++) d[i] = (u[i + 1][1] - u[i][1]) / (u[i + 1][0] - u[i][0]);
  m[0] = d[0]; m[k - 1] = d[k - 2]; for (let i = 1; i < k - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < k - 1; i++) { if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; } const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b; if (s > 9) { const t = 3 / Math.sqrt(s); m[i] = t * a * d[i]; m[i + 1] = t * b * d[i]; } }
  let seg = 0;
  for (let j = 0; j < n; j++) {
    const x = j / (n - 1);
    if (x <= u[0][0]) { aus[j] = u[0][1]; continue; } if (x >= u[k - 1][0]) { aus[j] = u[k - 1][1]; continue; }
    while (seg < k - 2 && x > u[seg + 1][0]) seg++;
    const h = u[seg + 1][0] - u[seg][0], t = (x - u[seg][0]) / h, t2 = t * t, t3 = t2 * t;
    aus[j] = Math.min(1, Math.max(0, (2 * t3 - 3 * t2 + 1) * u[seg][1] + (t3 - 2 * t2 + t) * h * m[seg] + (-2 * t3 + 3 * t2) * u[seg + 1][1] + (t3 - t2) * h * m[seg + 1]));
  }
  return aus;
}
const istGerade = (pk) => !pk || pk.length < 2 || pk.every(([x, y]) => Math.abs(x - y) < 1e-4);

/** Auto-Ton-Parameter → Shader-Werte (Stärke eingerechnet). Gemeinsam für GPU (Stufe 'belichtung') und CPU-Referenz (analyse.js). */
export function autoTonVorbereiten(params) {
  const st = params.staerke ?? 1, gw = params.wbGains || [1, 1, 1];
  return { gain: gw.map((v) => Math.pow(v, st)), g: Math.pow(2, (params.ev || 0) * st), s: (params.schwarz || [0, 0, 0]).map((v) => v * st),
    w: (params.weiss || [1, 1, 1]).map((v) => 1 + (v - 1) * st), gam: (params.gamma || [1, 1, 1]).map((v) => 1 + (v - 1) * st), staerke: 1 };
}

// ================================================================ Shader
const KOPF = `#version 300 es
precision highp float; precision highp int; precision highp sampler2D;
in vec2 uv; out vec4 farbe; uniform sampler2D ein;
const vec3 LW = vec3(0.2126, 0.7152, 0.0722);
float kod1(float v){ v = max(v, 0.0); return v <= 0.0031308 ? 12.92*v : 1.055*pow(v, 1.0/2.4) - 0.055; }
vec3 kod(vec3 c){ return vec3(kod1(c.r), kod1(c.g), kod1(c.b)); }
float lin1(float v){ return v <= 0.04045 ? max(v, 0.0)/12.92 : pow((v + 0.055)/1.055, 2.4); }
vec3 lin(vec3 c){ return vec3(lin1(c.r), lin1(c.g), lin1(c.b)); }
float cbrt(float x){ return sign(x)*pow(abs(x), 1.0/3.0); }
vec3 zuOk(vec3 c){ float l = cbrt(dot(c, vec3(0.4122214708, 0.5363325363, 0.0514459929))), m = cbrt(dot(c, vec3(0.2119034982, 0.6806995451, 0.1073969566))), s = cbrt(dot(c, vec3(0.0883024619, 0.2817188376, 0.6299787005)));
  return vec3(0.2104542553*l + 0.7936177850*m - 0.0040720468*s, 1.9779984951*l - 2.4285922050*m + 0.4505937099*s, 0.0259040371*l + 0.7827717662*m - 0.8086757660*s); }
vec3 ausOk(vec3 o){ float l = o.x + 0.3963377774*o.y + 0.2158037573*o.z, m = o.x - 0.1055613458*o.y - 0.0638541728*o.z, s = o.x - 0.0894841775*o.y - 1.2914855480*o.z;
  l = l*l*l; m = m*m*m; s = s*s*s;
  return vec3(4.0767416621*l - 3.3077115913*m + 0.2309699292*s, -1.2684380046*l + 2.6097574011*m - 0.3413193965*s, -0.0041960863*l - 0.7034186147*m + 1.7076147010*s); }
vec4 E(){ return texelFetch(ein, ivec2(gl_FragCoord.xy), 0); }
`;
const FS = {
  misch: KOPF + `uniform sampler2D neu; uniform sampler2D maske; uniform float umkehren;
void main(){ vec4 a = E(), b = texelFetch(neu, ivec2(gl_FragCoord.xy), 0); float m = texture(maske, uv).r; m = umkehren > 0.5 ? 1.0 - m : m; farbe = mix(a, b, clamp(m, 0.0, 1.0)); }`,
  wb: KOPF + `uniform mat3 M; void main(){ vec4 p = E(); farbe = vec4(max(M*p.rgb, 0.0), p.a); }`,
  ev: KOPF + `uniform float g; void main(){ vec4 p = E(); farbe = vec4(p.rgb*g, p.a); }`,
  // Auto-Ton: identisch mit analyse.autoTonKanal (CPU-Referenz)
  autoton: KOPF + `uniform vec3 gain; uniform float g; uniform vec3 s; uniform vec3 w; uniform vec3 gam;
float bel(float x){ if (g >= 1.0){ float z = x*g; return z <= 0.8 ? z : 0.8 + 0.2*(1.0 - exp(-(z - 0.8)/0.2)); } float c = clamp(x, 0.0, 1.0); float c2 = c*c; return g*x + (1.0 - g)*c2*c2*c2; }
void main(){ vec4 p = E(); vec3 o;
  for (int j = 0; j < 3; j++){ float y = bel(p[j]*gain[j]); float e = kod1(clamp(y, 0.0, 1.0)); e = clamp((e - s[j])/(w[j] - s[j]), 0.0, 1.0); o[j] = lin1(pow(e, gam[j])); }
  farbe = vec4(o, p.a); }`,
  logl: KOPF + `void main(){ farbe = vec4(log2(max(dot(max(E().rgb, 0.0), LW), 1e-5)), 0.0, 0.0, 1.0); }`,
  luma: KOPF + `void main(){ farbe = vec4(kod1(min(dot(max(E().rgb, 0.0), LW), 4.0)), 0.0, 0.0, 1.0); }`,
  // Ton: Lichter/Tiefen verschieben nur die Basis (geführter Filter auf log2 L) → kein Halo; Weiß/Schwarz = Endpunkte; Kontrast = S-Kurve
  ton: KOPF + `uniform sampler2D basis; uniform float mitBasis; uniform float K; uniform float Li; uniform float Ti; uniform float We; uniform float Sc;
void main(){ vec4 p = E(); vec3 c = max(p.rgb, 0.0); float Y = max(dot(c, LW), 1e-6), l = log2(Y);
  float b = mitBasis > 0.5 ? texelFetch(basis, ivec2(gl_FragCoord.xy), 0).r : l; float d = l - b;
  float wT = 1.0 - smoothstep(-5.5, -1.0, b), wL = smoothstep(-3.5, 0.0, b);
  float e = kod1(exp2(b + 1.6*Ti*wT + 1.4*Li*wL + d));
  e = e*(1.0 + 0.25*We*e*e*e);
  float q = 1.0 - e; e = 1.0 - q*(1.0 - 0.25*Sc*q*q*q);
  float ec = clamp(e, 0.0, 1.0); e = e + 2.0*K*(e - 0.46)*ec*(1.0 - ec);
  float Y2 = lin1(max(e, 0.0)); farbe = vec4(c*min(Y2/Y, 64.0), p.a); }`,
  dunkel: KOPF + `uniform vec3 A; void main(){ vec3 c = max(E().rgb, 0.0)/max(A, vec3(0.05)); farbe = vec4(min(c.r, min(c.g, c.b)), 0.0, 0.0, 1.0); }`,
  min: KOPF + `uniform vec2 dir; uniform float r; void main(){ ivec2 P = ivec2(gl_FragCoord.xy), G = textureSize(ein, 0) - 1; float m = 1e4;
  for (int k = -64; k <= 64; k++){ if (float(abs(k)) > r) continue; ivec2 Q = clamp(P + ivec2(dir*float(k)), ivec2(0), G); m = min(m, texelFetch(ein, Q, 0).r); } farbe = vec4(m, 0.0, 0.0, 1.0); }`,
  entdunst: KOPF + `uniform sampler2D dk; uniform vec3 A; uniform float om; void main(){ vec4 p = E();
  float t = max(1.0 - om*clamp(texelFetch(dk, ivec2(gl_FragCoord.xy), 0).r, 0.0, 1.0), 0.25); farbe = vec4(max((p.rgb - A)/t + A, 0.0), p.a); }`,
  // Präsenz: Dunst hinzufügen, Klarheit (Log-Basis, mitteltongewichtet), Struktur (feines Band mit Coring + Halo-Bremse), Dynamik/Sättigung in OKLCH
  praesenz: KOPF + `uniform sampler2D basisK; uniform sampler2D blurS; uniform vec3 A; uniform float dunstPlus; uniform float klar; uniform float struk; uniform float tau; uniform float dyn; uniform float sat;
void main(){ vec4 p = E(); vec3 c = max(p.rgb, 0.0); ivec2 P = ivec2(gl_FragCoord.xy);
  if (dunstPlus > 0.0) c = mix(c, A, 0.4*dunstPlus);
  float Y = max(dot(c, LW), 1e-6), l = log2(Y);
  if (klar != 0.0){ float b = texelFetch(basisK, P, 0).r, le = clamp(kod1(Y), 0.0, 1.0), w = 1.0 - pow(abs(2.0*le - 1.0), 2.0); l += 0.6*klar*w*(l - b); }
  float e = kod1(exp2(l));
  if (struk != 0.0){ float sd = texelFetch(blurS, P, 0).r; float d = kod1(Y) - sd; float k = sign(d)*max(abs(d) - tau, 0.0); float br = 1.0 - smoothstep(0.02, 0.07, abs(d)); e += struk*k*br; }
  float Y2 = lin1(max(e, 0.0)); c *= min(Y2/Y, 64.0);
  if (dyn != 0.0 || sat != 0.0){ vec3 o = zuOk(c); float C = length(o.yz), h = degrees(atan(o.z, o.y)); h = h < 0.0 ? h + 360.0 : h;
    float haut = dyn > 0.0 ? smoothstep(15.0, 30.0, h)*(1.0 - smoothstep(70.0, 85.0, h)) : 0.0;
    float f = (1.0 + sat)*(1.0 + dyn*(1.0 - clamp(C/0.25, 0.0, 1.0))*(1.0 - 0.6*haut)); o.yz *= max(f, 0.0); c = max(ausOk(o), 0.0); }
  farbe = vec4(c, p.a); }`,
  kurve: KOPF + `uniform sampler2D lut; uniform float n;
float k(float x, int ch){ float xc = clamp(x, 0.0, 1.0); float v = texture(lut, vec2((xc*(n - 1.0) + 0.5)/n, 0.5))[ch]; return v + max(x - 1.0, 0.0); }
void main(){ vec4 p = E(); vec3 e = kod(max(p.rgb, 0.0)); e = vec3(k(e.r, 0), k(e.g, 0), k(e.b, 0)); e = vec3(k(e.r, 1), k(e.g, 2), k(e.b, 3)); farbe = vec4(lin(e), p.a); }`,
  hsl: KOPF + `uniform float ton[8]; uniform float sa[8]; uniform float lu[8]; uniform float mitte[8];
void main(){ vec4 p = E(); vec3 o = zuOk(max(p.rgb, 0.0)); float C = length(o.yz); if (C < 1e-4){ farbe = p; return; }
  float h = degrees(atan(o.z, o.y)); h = h < 0.0 ? h + 360.0 : h;
  int i = 7; for (int k = 0; k < 8; k++){ if (h >= mitte[k]) i = k; }
  int j = i == 7 ? 0 : i + 1; float a = mitte[i], b = mitte[j]; if (b <= a) b += 360.0; float hh = h < a ? h + 360.0 : h;
  float t = clamp((hh - a)/(b - a), 0.0, 1.0), wi = 0.5 + 0.5*cos(3.14159265*t), wj = 1.0 - wi;
  float dh = (wi*ton[i] + wj*ton[j])*0.3, fs = 1.0 + (wi*sa[i] + wj*sa[j])/100.0, dl = (wi*lu[i] + wj*lu[j])/100.0*0.15*smoothstep(0.02, 0.1, C);
  float nh = radians(h + dh); float nC = C*max(fs, 0.0); o = vec3(max(o.x + dl*o.x, 0.0), nC*cos(nh), nC*sin(nh));
  farbe = vec4(max(ausOk(o), 0.0), p.a); }`,
  // Details: Luminanz-Rauschminderung (geführt), Farb-Rauschminderung (geführt mit Luminanz), Schärfe mit Coring + Überschwing-Begrenzung (3×3, δ 2 %)
  details: KOPF + `uniform sampler2D le; uniform sampler2D leNR; uniform sampler2D rgbNR; uniform sampler2D leBlur; uniform float nrL; uniform float nrF; uniform float sch; uniform float tau;
void main(){ vec4 p = E(); ivec2 P = ivec2(gl_FragCoord.xy), G = textureSize(ein, 0) - 1; vec3 c = max(p.rgb, 0.0);
  float Y = max(dot(c, LW), 1e-6), e = texelFetch(le, P, 0).r, e0 = e;
  if (nrF > 0.0){ vec3 cn = max(texelFetch(rgbNR, P, 0).rgb, 0.0); vec3 o = zuOk(c), on = zuOk(cn); o.yz = mix(o.yz, on.yz, nrF); c = max(ausOk(o), 0.0); Y = max(dot(c, LW), 1e-6); }
  if (nrL > 0.0) e = mix(e, texelFetch(leNR, P, 0).r, nrL);
  if (sch > 0.0){ float d = e0 - texelFetch(leBlur, P, 0).r; float k = sign(d)*max(abs(d) - tau, 0.0); float lo = 1e4, hi = -1e4;
    for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++){ float v = texelFetch(le, clamp(P + ivec2(x, y), ivec2(0), G), 0).r; lo = min(lo, v); hi = max(hi, v); }
    e = clamp(e + sch*k, lo - 0.02, hi + 0.02); }
  float Y2 = lin1(max(e, 0.0)); farbe = vec4(c*min(Y2/Y, 64.0), p.a); }`,
  effekte: KOPF + `uniform float vig; uniform float korn; uniform vec4 lage; uniform float kornPx;
float hash(vec2 p){ vec3 q = fract(vec3(p.xyx)*0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y)*q.z); }
void main(){ vec4 p = E(); vec3 c = max(p.rgb, 0.0); vec2 g = gl_FragCoord.xy + lage.xy; vec2 pos = g/lage.zw;
  vec3 e = kod(c);
  if (vig != 0.0){ vec2 d = (pos - 0.5)*vec2(lage.z/max(lage.z, lage.w), lage.w/max(lage.z, lage.w))*2.0; float r = length(d)/1.41421; float f = smoothstep(0.35, 1.05, r); e *= 1.0 + vig*0.7*f*f; }
  if (korn > 0.0){ vec2 zelle = floor(g/kornPx); float n = (hash(zelle) + hash(zelle + 19.19) - 1.0); float L = dot(e, LW); e += korn*0.07*n*4.0*L*(1.0 - L); }
  farbe = vec4(lin(max(e, 0.0)), p.a); }`,
};

// ================================================================ Stufen-Module
const P = (s) => ({ ...REGLER_STANDARD, ...(s.params || {}) });
const nz = (v) => typeof v === 'number' && Math.abs(v) > 1e-6;
function maskiere(ctx, ein, aus, maske, umkehren = false) {
  if (!maske) return aus;
  const m = ctx.pass(ctx.programm('regler-misch', FS.misch), { umkehren: umkehren ? 1 : 0 }, { ein, neu: aus, maske });
  ctx.frei(aus); return m;
}
const HSL_MITTE = [25, 55, 105, 142, 195, 255, 295, 330];
const ZWISCHEN = (ctx, alt, neu, ein) => { if (alt !== ein && alt !== neu) ctx.frei(alt); return neu; };

function wbAktiv(p) { return (p.temperatur != null && Math.abs(p.temperatur - 6504) > 1) || nz(p.toenung); }
function rendereWB(ctx, ein, p) { const M = wbMatrix(p.temperatur ?? 6504, p.toenung || 0); return ctx.pass(ctx.programm('regler-wb', FS.wb), { M: new Float32Array([M[0], M[3], M[6], M[1], M[4], M[7], M[2], M[5], M[8]]) }, { ein }); }
function tonAktiv(p) { return nz(p.kontrast) || nz(p.lichter) || nz(p.tiefen) || nz(p.weiss) || nz(p.schwarz); }
function rendereTon(ctx, ein, p) {
  let basis = null;
  if (nz(p.lichter) || nz(p.tiefen)) {
    const l = ctx.pass(ctx.programm('regler-logl', FS.logl), {}, { ein }, 'r16f');
    basis = ctx.gefuehrt ? ctx.gefuehrt(l, l, 0.02, 0.02) : ctx.unschaerfe(l, 0.02); ctx.frei(l);
  }
  const o = ctx.pass(ctx.programm('regler-ton', FS.ton), { mitBasis: basis ? 1 : 0, K: (p.kontrast || 0) / 100, Li: (p.lichter || 0) / 100, Ti: (p.tiefen || 0) / 100, We: (p.weiss || 0) / 100, Sc: (p.schwarz || 0) / 100 }, { ein, basis: basis || ein });
  if (basis) ctx.frei(basis); return o;
}
function praesenzAktiv(p) { return nz(p.klarheit) || nz(p.struktur) || nz(p.dunst) || nz(p.dynamik) || nz(p.saettigung); }
function rendereP(ctx, ein, p) {
  const A = ctx.analyse?.dunst?.atmosLicht || [0.85, 0.85, 0.85]; let tex = ein;
  if ((p.dunst || 0) > 0) {   // Dunkelkanal-Verfahren
    // Dunkelkanal je Pixel = punktweise Transmission → an harten Kanten kein Saum möglich. (Das klassische Minimum-Fenster
    // + geführte Verfeinerung ergab 14–116 % Überschwingen an der Test-Kante; siehe LOG.)
    const d = ctx.pass(ctx.programm('regler-dunkel', FS.dunkel), { A }, { ein }, 'r16f');
    tex = ctx.pass(ctx.programm('regler-entdunst', FS.entdunst), { A, om: 0.8 * p.dunst / 100 }, { ein, dk: d }); ctx.frei(d);
  }
  const brauchtRest = nz(p.klarheit) || nz(p.struktur) || (p.dunst || 0) < 0 || nz(p.dynamik) || nz(p.saettigung);
  if (!brauchtRest) return tex;
  let basisK = null, blurS = null;
  if (nz(p.klarheit)) { const l = ctx.pass(ctx.programm('regler-logl', FS.logl), {}, { ein: tex }, 'r16f'); basisK = ctx.gefuehrt ? ctx.gefuehrt(l, l, 0.02, 0.08) : ctx.unschaerfe(l, 0.02); ctx.frei(l); }
  if (nz(p.struktur)) { const l = ctx.pass(ctx.programm('regler-luma', FS.luma), {}, { ein: tex }, 'r16f'); blurS = ctx.unschaerfe(l, 0.003); ctx.frei(l); }
  const tau = 1.5 * (ctx.analyse?.rauschen?.sigmaL ?? 0.004);
  const o = ctx.pass(ctx.programm('regler-praesenz', FS.praesenz), { A, dunstPlus: Math.max(0, -(p.dunst || 0) / 100), klar: (p.klarheit || 0) / 100, struk: (p.struktur || 0) / 100, tau, dyn: (p.dynamik || 0) / 100, sat: (p.saettigung || 0) / 100 },
    { ein: tex, basisK: basisK || tex, blurS: blurS || tex });
  if (basisK) ctx.frei(basisK); if (blurS) ctx.frei(blurS); if (tex !== ein) ctx.frei(tex);
  return o;
}
const kurvenVon = (s) => (s.art === ART.KURVE ? (s.params.kurve || s.params) : P(s).kurve) || {};
function kurveAktiv(k) { return ['rgb', 'r', 'g', 'b'].some((c) => !istGerade(k[c])); }
const lutCache = new Map();
function rendereKurve(ctx, ein, k, id) {
  const schl = JSON.stringify(k); let daten = lutCache.get(schl);
  if (!daten) { const N = 1024, L = ['rgb', 'r', 'g', 'b'].map((c) => kurveLUT(k[c] || [[0, 0], [1, 1]], N)); daten = new Float32Array(N * 4); for (let i = 0; i < N; i++) for (let c = 0; c < 4; c++) daten[i * 4 + c] = L[c][i]; if (lutCache.size > 32) lutCache.clear(); lutCache.set(schl, daten); }
  return ctx.pass(ctx.programm('regler-kurve', FS.kurve), { n: 1024 }, { ein, lut: ctx.lut('kurve-' + id, daten, 1024) });
}
const hslVon = (s) => (s.art === ART.HSL ? (s.params.hsl || s.params) : P(s).hsl) || {};
function hslAktiv(h) { return HSL_BEREICHE.some((b) => h[b] && (nz(h[b].ton) || nz(h[b].saett) || nz(h[b].lum))); }
function rendereHSL(ctx, ein, h) {
  const f = (k) => new Float32Array(HSL_BEREICHE.map((b) => h[b]?.[k] || 0));
  return ctx.pass(ctx.programm('regler-hsl', FS.hsl), { ton: f('ton'), sa: f('saett'), lu: f('lum'), mitte: new Float32Array(HSL_MITTE) }, { ein });
}
const detailWerte = (s) => { if (s.art === ART.RAUSCHEN) return { nrL: (s.params.luminanz || 0) / 100, nrF: (s.params.farbe || 0) / 100, sch: 0 }; const p = P(s); return { nrL: (p.rauschL || 0) / 100, nrF: (p.rauschF || 0) / 100, sch: (p.schaerfe || 0) / 100 }; };
function rendereDetails(ctx, ein, w) {
  const sigma = ctx.analyse?.rauschen?.sigmaL ?? 0.004, le = ctx.pass(ctx.programm('regler-luma', FS.luma), {}, { ein }, 'r16f');
  let leNR = null, rgbNR = null, leBlur = null;
  if (w.nrL > 0) leNR = ctx.gefuehrt ? ctx.gefuehrt(le, le, 0.004, (sigma * (1 + 4 * w.nrL)) ** 2 * 4) : ctx.unschaerfe(le, 0.002);
  if (w.nrF > 0) rgbNR = ctx.gefuehrt ? ctx.gefuehrt(ein, le, 0.008 + 0.01 * w.nrF, 0.002) : ctx.unschaerfe(ein, 0.006);
  if (w.sch > 0) leBlur = ctx.unschaerfe(le, 0.0012);
  const o = ctx.pass(ctx.programm('regler-details', FS.details), { nrL: w.nrL, nrF: w.nrF, sch: 1.2 * w.sch, tau: 1.5 * sigma }, { ein, le, leNR: leNR || le, rgbNR: rgbNR || ein, leBlur: leBlur || le });
  for (const t of [le, leNR, rgbNR, leBlur]) if (t) ctx.frei(t);
  return o;
}
const effektWerte = (s) => { const p = s.art === ART.EFFEKTE ? s.params : P(s); return { vig: (p.vignette || 0) / 100, korn: (p.korn || 0) / 100 }; };
function rendereEffekte(ctx, ein, w) {
  const r = ctx.region;   // Lage der Kachel im Gesamtbild (normiert, von gl.js) → Vignette/Korn ohne Nähte
  const gesB = r ? ctx.b / r.b : ctx.b, gesH = r ? ctx.h / r.h : ctx.h, ox = r ? r.x * gesB : 0, oy = r ? r.y * gesH : 0;
  return ctx.pass(ctx.programm('regler-effekte', FS.effekte), { vig: w.vig, korn: w.korn, lage: [ox, oy, gesB, gesH], kornPx: Math.max(1, Math.min(gesB, gesH) * 0.0011) }, { ein });
}

const modul = (name, stufe, arten, aktiv, rendere, rand) => ({ name, stufe, arten, aktiv, rendere, rand: rand || (() => 0), braucht: [] });
const KETTE_LOKAL = [];   // wird unten gefüllt
/** Shader-Stufen (StufenModul[]): 'wb','belichtung','ton','praesenz','kurve','hsl','lokal','details','effekte'. */
export const STUFEN = Object.freeze([
  modul('wb', STUFE.WB, [ART.REGLER], (s) => wbAktiv(P(s)), (ctx, ein, s, m) => maskiere(ctx, ein, rendereWB(ctx, ein, P(s)), m)),
  modul('belichtung', STUFE.BELICHTUNG, [ART.AUTO_TON, ART.REGLER], (s) => s.art === ART.AUTO_TON || nz(P(s).belichtung), (ctx, ein, s, m) => {
    if (s.art === ART.AUTO_TON) { const q = autoTonVorbereiten(s.params || {}); return maskiere(ctx, ein, ctx.pass(ctx.programm('regler-autoton', FS.autoton), { gain: q.gain, g: q.g, s: q.s, w: q.w, gam: q.gam }, { ein }), m); }
    return maskiere(ctx, ein, ctx.pass(ctx.programm('regler-ev', FS.ev), { g: 2 ** P(s).belichtung }, { ein }), m);
  }),
  modul('ton', STUFE.TON, [ART.REGLER], (s) => tonAktiv(P(s)), (ctx, ein, s, m) => maskiere(ctx, ein, rendereTon(ctx, ein, P(s)), m), (s, px) => (nz(P(s).lichter) || nz(P(s).tiefen) ? Math.ceil(0.02 * 3 * px) : 0)),
  modul('praesenz', STUFE.PRAESENZ, [ART.REGLER], (s) => praesenzAktiv(P(s)), (ctx, ein, s, m) => maskiere(ctx, ein, rendereP(ctx, ein, P(s)), m),
    (s, px) => { const p = P(s); return Math.ceil(px * Math.max(nz(p.klarheit) ? 0.06 : 0, nz(p.dunst) ? 0 : 0, nz(p.struktur) ? 0.01 : 0)); }),
  modul('kurve', STUFE.KURVE, [ART.REGLER, ART.KURVE], (s) => kurveAktiv(kurvenVon(s)), (ctx, ein, s, m) => maskiere(ctx, ein, rendereKurve(ctx, ein, kurvenVon(s), s.id || 'k'), m)),
  modul('hsl', STUFE.HSL, [ART.REGLER, ART.HSL], (s) => hslAktiv(hslVon(s)), (ctx, ein, s, m) => maskiere(ctx, ein, rendereHSL(ctx, ein, hslVon(s)), m)),
  modul('lokal', STUFE.LOKAL, [ART.LOKAL], (s) => Object.values(s.params?.regler || {}).some((v) => nz(v) || (v && typeof v === 'object')), (ctx, ein, s, m) => {
    const t = { ...s, art: ART.REGLER, params: { ...REGLER_STANDARD, ...(s.params?.regler || {}) } }; let tex = ein;
    for (const k of KETTE_LOKAL) if (k.aktiv(t, ctx)) tex = ZWISCHEN(ctx, tex, k.rendere(ctx, tex, t, null), ein);
    if (tex === ein) return ein;
    return maskiere(ctx, ein, tex, m);
  }, (s, px) => Math.max(0, ...KETTE_LOKAL.map((k) => k.rand({ ...s, art: ART.REGLER, params: { ...REGLER_STANDARD, ...(s.params?.regler || {}) } }, px)))),
  modul('details', STUFE.DETAILS, [ART.REGLER, ART.RAUSCHEN], (s) => { const w = detailWerte(s); return w.nrL > 0 || w.nrF > 0 || w.sch > 0; }, (ctx, ein, s, m) => maskiere(ctx, ein, rendereDetails(ctx, ein, detailWerte(s)), m), (s, px) => Math.ceil(px * 0.06)),
  modul('effekte', STUFE.EFFEKTE, [ART.REGLER, ART.EFFEKTE], (s) => { const w = effektWerte(s); return nz(w.vig) || w.korn > 0; }, (ctx, ein, s, m) => maskiere(ctx, ein, rendereEffekte(ctx, ein, effektWerte(s)), m)),
]);
KETTE_LOKAL.push(...STUFEN.filter((m) => ['wb', 'belichtung', 'ton', 'praesenz', 'hsl', 'details'].includes(m.name)));
/** Alle Shader-Quellen (für Vorab-Kompilieren beim Start). */
export const SHADER = Object.freeze(Object.fromEntries(Object.entries(FS).map(([k, v]) => ['regler-' + k, v])));

// ================================================================ Bedienung
const CSS = `.rg{font:15px system-ui,-apple-system,sans-serif;color:#e8e8e6;user-select:none;-webkit-user-select:none}
.rg h3{font-size:13px;font-weight:600;color:#9aa0a6;margin:12px 4px 2px;text-transform:none;letter-spacing:.02em}
.rg-z{position:relative;display:flex;align-items:center;justify-content:space-between;min-height:44px;padding:0 12px;margin:2px 0;border-radius:10px;background:#17191c;touch-action:pan-y;cursor:ew-resize;overflow:hidden}
.rg-z.zieh{background:#1f2226}.rg-z .bal{position:absolute;top:auto;bottom:6px;height:3px;background:#d9a441;border-radius:2px;opacity:.85}
.rg-z .mitte{position:absolute;bottom:4px;width:1px;height:7px;background:#2a2e33}
.rg-z .wert{font-variant-numeric:tabular-nums;color:#9aa0a6;font-size:15px}.rg-z.geaendert .wert{color:#d9a441}
.rg-k{display:block;width:100%;max-width:340px;aspect-ratio:1;margin:6px auto;background:#17191c;border-radius:10px;touch-action:none}
.rg-chips{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0}.rg-chips button{min-width:44px;min-height:44px;border-radius:22px;border:1px solid #2a2e33;background:#17191c;color:#e8e8e6;font:13px system-ui;padding:0 12px}
.rg-chips button[aria-pressed=true]{border-color:#d9a441;color:#d9a441}.rg-chips .punkt{display:inline-block;width:10px;height:10px;border-radius:5px;margin-right:6px;vertical-align:-1px}
@media (prefers-reduced-motion:no-preference){.rg-z{transition:background .15s}}`;
function stil(container) {
  const doc = container.ownerDocument; if (doc.getElementById('rg-stil')) return;
  const s = doc.createElement('style'); s.id = 'rg-stil'; s.textContent = CSS; doc.head.appendChild(s);
}
const zeige = (d, v) => {
  if (v == null) return d.id === 'temperatur' ? 'Wie Aufnahme' : '0';
  if (d.einheit === 'EV') return (v > 0 ? '+' : '') + v.toFixed(2).replace('.', ',');
  if (d.einheit === 'K') return Math.round(v) + ' K';
  return (v > 0 && d.min < 0 ? '+' : '') + Math.round(v);
};
/** Eine Reglerzeile: Ziehen über die ganze Zeile, Doppeltipp = Standard, Finger nach oben = 4× feiner. */
function zeile(eltern, d, wert, onAendern) {
  const z = eltern.ownerDocument.createElement('div'); z.className = 'rg-z'; z.setAttribute('role', 'slider'); z.setAttribute('aria-label', d.titel); z.tabIndex = 0;
  z.innerHTML = `<span class="titel">${d.titel}</span><span class="wert"></span><i class="mitte"></i><i class="bal"></i>`; eltern.appendChild(z);
  const log = d.id === 'temperatur', zuT = (v) => (log ? Math.log(v / d.min) / Math.log(d.max / d.min) : (v - d.min) / (d.max - d.min));
  const ausT = (t) => (log ? d.min * Math.pow(d.max / d.min, t) : d.min + t * (d.max - d.min));
  let v = wert, start = null, letzterTipp = 0;
  const neutral = log ? 6504 : (d.standard ?? 0);
  const setze = (w) => {
    v = w; const vv = v ?? neutral; z.querySelector('.wert').textContent = zeige(d, v); z.setAttribute('aria-valuenow', String(vv));
    const t0 = zuT(neutral), t1 = zuT(vv), bal = z.querySelector('.bal'), mitte = z.querySelector('.mitte');
    bal.style.left = `calc(12px + ${Math.min(t0, t1) * 100}% - ${Math.min(t0, t1) * 24}px)`; bal.style.width = `calc(${Math.abs(t1 - t0) * 100}% - ${Math.abs(t1 - t0) * 24}px)`;
    mitte.style.left = `calc(12px + ${t0 * 100}% - ${t0 * 24}px)`; z.classList.toggle('geaendert', v != null && Math.abs(vv - neutral) > 1e-9);
  };
  setze(v);
  const runde = (w) => { const s = d.schritt || 1; return Math.min(d.max, Math.max(d.min, Math.round(w / s) * s)); };
  z.addEventListener('pointerdown', (e) => {
    const jetzt = e.timeStamp; if (jetzt - letzterTipp < 300) { setze(d.standard); onAendern(d.id, d.standard, 'start'); onAendern(d.id, d.standard, 'ende'); letzterTipp = 0; return; }
    letzterTipp = jetzt; start = { x: e.clientX, y: e.clientY, t: zuT(v ?? neutral), id: e.pointerId, bewegt: false, b: z.getBoundingClientRect().width };
    z.setPointerCapture?.(e.pointerId);
  });
  z.addEventListener('pointermove', (e) => {
    if (!start || e.pointerId !== start.id) return;
    const dx = e.clientX - start.x; if (!start.bewegt) { if (Math.abs(dx) < 6) return; start.bewegt = true; z.classList.add('zieh'); onAendern(d.id, v ?? neutral, 'start'); start.x = e.clientX; return; }
    const fein = start.y - e.clientY > 40 ? 0.25 : 1, t = Math.min(1, Math.max(0, start.t + ((e.clientX - start.x) / Math.max(120, start.b)) * fein));
    const w = runde(ausT(t)); if (w !== v) { setze(w); onAendern(d.id, w, 'zieh'); }
  });
  const ende = (e) => { if (!start || e.pointerId !== start.id) return; if (start.bewegt) { z.classList.remove('zieh'); onAendern(d.id, v, 'ende'); } start = null; };
  z.addEventListener('pointerup', ende); z.addEventListener('pointercancel', ende);
  z.addEventListener('keydown', (e) => { const s = (d.schritt || 1) * (e.shiftKey ? 10 : 1); if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { const w = runde((v ?? neutral) + (e.key === 'ArrowRight' ? s : -s)); setze(w); onAendern(d.id, w, 'ende'); e.preventDefault(); } });
  return { setze, el: z };
}
/** @returns {import('./typen.js').UIHandle} */
export function reglerUI(container, opts) {
  stil(container); const defs = opts.defs || REGLER, wurzel = container.ownerDocument.createElement('div'); wurzel.className = 'rg'; container.appendChild(wurzel);
  const zeilen = new Map();
  for (const [g, titel] of GRUPPEN) {
    const ds = defs.filter((d) => d.gruppe === g); if (!ds.length) continue;
    const h = container.ownerDocument.createElement('h3'); h.textContent = titel; wurzel.appendChild(h);
    for (const d of ds) zeilen.set(d.id, zeile(wurzel, d, opts.params?.[d.id] ?? d.standard, opts.onAendern || (() => {})));
  }
  return { setze(params) { for (const [id, z] of zeilen) if (id in params) z.setze(params[id]); }, zerstoere() { wurzel.remove(); } };
}
/** Gradationskurve: Tippen = Punkt, Ziehen = verschieben, aus dem Feld ziehen = löschen. */
export function kurveUI(container, opts) {
  stil(container); const doc = container.ownerDocument, wurzel = doc.createElement('div'); wurzel.className = 'rg'; container.appendChild(wurzel);
  let kanal = opts.kanal || 'rgb', punkte = structuredClone(opts.punkte?.[kanal] || opts.punkte || [[0, 0], [1, 1]]);
  const alle = Array.isArray(opts.punkte) ? { rgb: opts.punkte } : structuredClone(opts.punkte || {});
  const chips = doc.createElement('div'); chips.className = 'rg-chips';
  chips.innerHTML = [['rgb', 'RGB', '#e8e8e6'], ['r', 'Rot', '#e06666'], ['g', 'Grün', '#6abf69'], ['b', 'Blau', '#6f9ce0']].map(([k, t, c]) => `<button data-k="${k}" aria-pressed="${k === kanal}"><span class="punkt" style="background:${c}"></span>${t}</button>`).join('');
  wurzel.appendChild(chips);
  const c = doc.createElement('canvas'); c.className = 'rg-k'; wurzel.appendChild(c); const x = c.getContext('2d');
  const male = () => {
    const dpr = Math.min(3, doc.defaultView?.devicePixelRatio || 1), B = (c.width = Math.round(c.clientWidth * dpr) || 300), H = (c.height = B);
    x.fillStyle = '#17191c'; x.fillRect(0, 0, B, H); x.strokeStyle = '#2a2e33'; x.lineWidth = 1;
    for (let i = 1; i < 4; i++) { x.beginPath(); x.moveTo((i * B) / 4, 0); x.lineTo((i * B) / 4, H); x.moveTo(0, (i * H) / 4); x.lineTo(B, (i * H) / 4); x.stroke(); }
    const lut = kurveLUT(punkte, 256); x.strokeStyle = { rgb: '#e8e8e6', r: '#e06666', g: '#6abf69', b: '#6f9ce0' }[kanal]; x.lineWidth = 1.75 * dpr; x.beginPath();
    for (let i = 0; i < 256; i++) { const px = (i / 255) * B, py = (1 - lut[i]) * H; i ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke();
    x.fillStyle = '#d9a441'; for (const [a, b] of punkte) { x.beginPath(); x.arc(a * B, (1 - b) * H, 5 * dpr, 0, 7); x.fill(); }
  };
  chips.addEventListener('click', (e) => { const b = e.target.closest('[data-k]'); if (!b) return; alle[kanal] = punkte; kanal = b.dataset.k; punkte = structuredClone(alle[kanal] || [[0, 0], [1, 1]]); for (const k of chips.children) k.setAttribute('aria-pressed', String(k === b)); male(); });
  let zieh = -1;
  const pos = (e) => { const r = c.getBoundingClientRect(); return [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height]; };
  c.addEventListener('pointerdown', (e) => {
    const [a, b] = pos(e); let best = -1, bd = 0.06;
    punkte.forEach(([px, py], i) => { const d = Math.hypot(px - a, py - b); if (d < bd) { bd = d; best = i; } });
    if (best < 0) { punkte.push([a, b]); punkte.sort((p, q) => p[0] - q[0]); best = punkte.findIndex((p) => p[0] === a); }
    zieh = best; c.setPointerCapture?.(e.pointerId); opts.onAendern?.(structuredClone(punkte), 'start', kanal); male();
  });
  c.addEventListener('pointermove', (e) => {
    if (zieh < 0) return; const [a, b] = pos(e), rand = zieh === 0 || zieh === punkte.length - 1;
    const lo = zieh > 0 ? punkte[zieh - 1][0] + 0.01 : 0, hi = zieh < punkte.length - 1 ? punkte[zieh + 1][0] - 0.01 : 1;
    punkte[zieh] = [rand && (zieh === 0 ? a < 0.5 : a > 0.5) ? Math.min(hi, Math.max(lo, a)) : Math.min(hi, Math.max(lo, a)), Math.min(1, Math.max(0, b))];
    if (!rand && (b < -0.15 || b > 1.15)) { punkte.splice(zieh, 1); zieh = -1; }
    opts.onAendern?.(structuredClone(punkte), 'zieh', kanal); male();
  });
  const fertig = () => { if (zieh >= -1) opts.onAendern?.(structuredClone(punkte), 'ende', kanal); zieh = -1; };
  c.addEventListener('pointerup', fertig); c.addEventListener('pointercancel', fertig);
  requestAnimationFrame?.(male);
  return { setze(p) { const q = p?.kurve || p; if (q && q[kanal]) { Object.assign(alle, structuredClone(q)); punkte = structuredClone(q[kanal]); } else if (Array.isArray(q)) punkte = structuredClone(q); male(); }, zerstoere() { wurzel.remove(); } };
}
const HSL_TITEL = { rot: 'Rot', orange: 'Orange', gelb: 'Gelb', gruen: 'Grün', aquamarin: 'Aquamarin', blau: 'Blau', lila: 'Lila', magenta: 'Magenta' };
const HSL_FARBE = { rot: '#d95a4e', orange: '#e0913f', gelb: '#d9c441', gruen: '#5fae5a', aquamarin: '#4fb3a9', blau: '#4f7fd9', lila: '#8a64d0', magenta: '#c85aa8' };
/** Farbtöne: Farbe wählen (8 Kreise), darunter Farbton / Sättigung / Luminanz. */
export function hslUI(container, opts) {
  stil(container); const doc = container.ownerDocument, wurzel = doc.createElement('div'); wurzel.className = 'rg'; container.appendChild(wurzel);
  let params = structuredClone(opts.params?.hsl || opts.params || {}), bereich = 'rot';
  const chips = doc.createElement('div'); chips.className = 'rg-chips';
  chips.innerHTML = HSL_BEREICHE.map((b) => `<button data-b="${b}" aria-pressed="${b === bereich}" aria-label="${HSL_TITEL[b]}"><span class="punkt" style="background:${HSL_FARBE[b]}"></span>${HSL_TITEL[b]}</button>`).join('');
  wurzel.appendChild(chips); const feld = doc.createElement('div'); wurzel.appendChild(feld);
  const defs = [['ton', 'Farbton'], ['saett', 'Sättigung'], ['lum', 'Luminanz']].map(([id, titel]) => ({ id, titel, min: -100, max: 100, standard: 0, schritt: 1 }));
  let z = [];
  const baue = () => { feld.textContent = ''; z = defs.map((d) => zeile(feld, d, params[bereich]?.[d.id] || 0, (id, w, phase) => { (params[bereich] ||= { ton: 0, saett: 0, lum: 0 })[id] = w; opts.onAendern?.(bereich, id, w, phase); })); };
  chips.addEventListener('click', (e) => { const b = e.target.closest('[data-b]'); if (!b) return; bereich = b.dataset.b; for (const k of chips.children) k.setAttribute('aria-pressed', String(k === b)); baue(); });
  baue();
  return { setze(p) { params = structuredClone(p?.hsl || p || {}); defs.forEach((d, i) => z[i].setze(params[bereich]?.[d.id] || 0)); }, zerstoere() { wurzel.remove(); } };
}
