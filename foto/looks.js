// Bildwerk – Looks, adaptive Schärfe, Tiefenschärfe (Agent B). Signaturen FEST (ARCH.md §4.3). Rezepte: KONZEPT.md §5.7.
// Import ohne Nebenwirkung. Alles GLSL ES 3.00, nur lokale Filter (Radien als Anteil der kurzen Seite) + ctx.region für
// ortsfeste Muster → Kacheln = Ganzbild, solange gl.js den Rand aus rand() vorsieht.
// Prinzip „nie artefaktig“: Luminanz-Änderungen laufen über grenzeAuf() (weiche Sättigung zum Rand → kein neues Clipping),
// Detail-Bänder kommen aus kantenerhaltenden geführten Filtern (kein Halo), Schärfe ist auf das lokale Min/Max begrenzt und
// unter der Rausch-Schwelle entkernt (Coring), Farbe wird getrennt in OKLab behandelt.
import { STUFE, ART, REGLER_STANDARD, neuerSchritt } from './typen.js';
import { STUFEN as REGLER_STUFEN } from './regler.js';

export { STUFE };
const RS = Object.fromEntries(REGLER_STUFEN.map((m) => [m.name, m]));

// ================================================================ Rezepte (Feinregler = ReglerDef, Gruppen wie regler.js)
const FR = (id, titel, gruppe, standard = 50, min = 0, max = 100) => ({ id, titel, gruppe, min, max, standard, schritt: 1, stufe: STUFE.LOOK });
const L = (id, titel, beschreibung, feinregler, basis) => ({ id, titel, beschreibung, feinregler, basis });
/** Look-Rezepte. basis = Startwerte bei Stärke 100 % (Stärke skaliert linear). */
export const LOOKS = Object.freeze([
  L('natuerlich', 'Natürlich', 'Nur sauberer Ton und feine Schärfe', [FR('schaerfe', 'Schärfe', 'details')], { schaerfe: 0.4 }),
  L('gemalt', 'Gemalt', 'Plastisches Licht, tiefe Mitteltöne, gedämpfte Farben',
    [FR('licht', 'Licht formen', 'licht'), FR('malerisch', 'Malerisch', 'praesenz'), FR('farbe', 'Farbe zurück', 'farbe', 0), FR('haut', 'Haut glätten', 'details'), FR('korn', 'Körnung', 'effekte')],
    { regler: { belichtung: -0.15, lichter: -35, tiefen: 30, weiss: -10, schwarz: -15 }, schaerfe: 0.6, vignette: -20, korn: 8 }),
  // Intensiv: feste Abwedeln-/Nachbelichten-Routine (mehrere Durchgänge mit Mischmodi), keine Einzelschritte zur Auswahl
  L('intensiv', 'Intensiv', 'Abwedeln und Nachbelichten: Licht, Tiefe und Farbe kräftig',
    [FR('licht', 'Licht und Schatten', 'licht'), FR('struktur', 'Struktur', 'details'), FR('farbe', 'Farbe', 'farbe'), FR('rand', 'Rand dunkler', 'effekte')],
    { schaerfe: 0.3, vignette: -24 }),
  L('brillant', 'Brillant', 'Klar, frisch, lebendig', [FR('klarheit', 'Klarheit', 'praesenz'), FR('farbe', 'Farbe', 'farbe'), FR('schaerfe', 'Schärfe', 'details')],
    { regler: { klarheit: 25, struktur: 15, dunst: 10, dynamik: 20, lichter: -20, tiefen: 15 }, schaerfe: 0.5 }),
  L('monochrom', 'Monochrom', 'Schwarzweiß mit automatischem Kanalmischer',
    [FR('kontrast', 'Kontrast', 'licht'), FR('filter', 'Filter (Blau … Rot)', 'farbe', 20, -100, 100), FR('toenung', 'Tönung (kühl … warm)', 'farbe', 0, -100, 100), FR('korn', 'Körnung', 'effekte')],
    { regler: { kontrast: 10, struktur: 6, klarheit: 8 }, schaerfe: 0.3, korn: 12 }),
  L('comic', 'Comic', 'Linien und ruhige Farbflächen', [FR('linien', 'Linien', 'licht'), FR('flaechen', 'Flächen', 'praesenz'), FR('farbe', 'Farbe', 'farbe')], {}),
  L('tiefe', 'Tiefe', 'Hintergrund weich, Motiv scharf', [FR('unschaerfe', 'Unschärfe', 'effekte'), FR('lichter', 'Lichter im Hintergrund', 'licht')], { tiefe: 1, schaerfe: 0.4 }),
  L('kombination', 'Kombination', 'Gemalt mit Tiefe und Schärfe', [FR('malerisch', 'Malerisch', 'praesenz'), FR('unschaerfe', 'Unschärfe', 'effekte'), FR('schaerfe', 'Schärfe', 'details')],
    { gemalt: 0.6, tiefe: 0.5, schaerfe: 0.7 }),
  L('weich', 'Weich', 'Sanftes Licht, ruhige Haut', [FR('haut', 'Haut glätten', 'details'), FR('leuchten', 'Leuchten', 'licht')],
    { regler: { klarheit: -15, lichter: -15, dynamik: 10 }, haut: 0.4, leuchten: 0.04 }),
]);
const LOOK = Object.fromEntries(LOOKS.map((l) => [l.id, l]));

// ================================================================ reine Hilfen (Node-testbar)
const klemme = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const stOf = (s) => klemme(s?.params?.staerke ?? 0.7, 0, 1);
/** Feinregler-Faktor: Standard 50 → 1 (0 … 2). */
const fein = (s, id, std = 50) => { const v = s?.params?.fein?.[id]; return (typeof v === 'number' ? v : std) / (std || 50); };

/** Kanalmischer-Presets (linear, Summe 1, alle ≥ 0 → kein Clipping). */
const MISCHER = [[-100, [0.05, 0.25, 0.70]], [-50, [0.10, 0.70, 0.20]], [0, [0.2126, 0.7152, 0.0722]], [35, [0.36, 0.58, 0.06]], [60, [0.50, 0.45, 0.05]], [100, [0.78, 0.22, 0.0]]];
/** Gewichte für Filterwert −100 (blau) … 0 (neutral) … +100 (rot). */
export function monoGewichte(filter = 0) {
  const f = klemme(filter, -100, 100); let i = 0; while (i < MISCHER.length - 2 && f > MISCHER[i + 1][0]) i++;
  const [a, wa] = MISCHER[i], [b, wb] = MISCHER[i + 1], t = (f - a) / (b - a), w = wa.map((v, k) => v + (wb[k] - v) * t), s = w[0] + w[1] + w[2];
  return w.map((v) => v / s);
}
/** Automatischer Filter aus der Analyse: Gesichter → gelb-orange (Haut hell), viel Blau → orange-rot (Himmel dunkler), viel Grün → grün. */
export function monoFilter(analyse) {
  if (!analyse) return 20;
  if (analyse.gesichter > 0) return 45;
  const h = analyse.histogramme, m = (a) => { if (!a) return 0; let s = 0, n = 0; for (let i = 0; i < a.length; i++) { s += a[i] * i; n += a[i]; } return n ? s / n / (a.length - 1) : 0; };
  const r = m(h?.r), g = m(h?.g), b = m(h?.b);
  if (b > r * 1.12 && b >= g) return 70;
  if (g > r * 1.08 && g > b * 1.08) return -40;
  return 20;
}
/** Fokus-Tiefe aus einer Tiefenkarte (KarteF32, 0 nah … 1 fern) am Punkt (normiert), Median 5×5. Für die Antipp-Bedienung. */
export function fokusTiefe(karte, punkt) {
  const x = Math.round(klemme(punkt.x) * (karte.b - 1)), y = Math.round(klemme(punkt.y) * (karte.h - 1)), v = [];
  for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const X = klemme(x + dx, 0, karte.b - 1), Y = klemme(y + dy, 0, karte.h - 1); v.push(karte.daten[Y * karte.b + X]); }
  v.sort((a, b) => a - b); return v[v.length >> 1];
}
/** Schärfe-Radien (Pixel der aktuellen Auflösung) aus Pixel je Quellpixel: fein ≈ 0,8, mittel ≈ 2, grob ≈ 5 Quellpixel. */
export function schaerfeRadien(pxProQuelle = 1) {
  const s = Math.max(0.05, pxProQuelle);
  return { fein: Math.max(0.6, 0.8 * s), mittel: Math.max(1.3, 2.0 * s), grob: Math.max(2.8, 5.0 * s) };
}
/** Rauschen (σ kodierte Luma) in der aktuellen Auflösung: Verkleinern mittelt (korreliertes Kamera-Rauschen → Exponent 0,75). */
export function rauschJetzt(analyse, pxProQuelle = 1) {
  const s = analyse?.rauschen?.sigmaL ?? 0.004; return s * Math.min(1, Math.pow(Math.max(0.05, pxProQuelle), 0.75));
}

// ================================================================ Shader
const KOPF = `#version 300 es
precision highp float; precision highp int; precision highp sampler2D;
in vec2 uv; out vec4 aus; uniform sampler2D ein;
const vec3 LW = vec3(0.2126, 0.7152, 0.0722);
float kod1(float v){ v = max(v, 0.0); return v <= 0.0031308 ? 12.92*v : 1.055*pow(v, 1.0/2.4) - 0.055; }
vec3 kod(vec3 c){ return vec3(kod1(c.r), kod1(c.g), kod1(c.b)); }
float lin1(float v){ v = max(v, 0.0); return v <= 0.04045 ? v/12.92 : pow((v + 0.055)/1.055, 2.4); }
vec3 lin(vec3 c){ return vec3(lin1(c.r), lin1(c.g), lin1(c.b)); }
float cbrt(float x){ return sign(x)*pow(abs(x), 1.0/3.0); }
vec3 zuOk(vec3 c){ float l = cbrt(dot(c, vec3(0.4122214708, 0.5363325363, 0.0514459929))), m = cbrt(dot(c, vec3(0.2119034982, 0.6806995451, 0.1073969566))), s = cbrt(dot(c, vec3(0.0883024619, 0.2817188376, 0.6299787005)));
  return vec3(0.2104542553*l + 0.7936177850*m - 0.0040720468*s, 1.9779984951*l - 2.4285922050*m + 0.4505937099*s, 0.0259040371*l + 0.7827717662*m - 0.8086757660*s); }
vec3 ausOk(vec3 o){ float l = o.x + 0.3963377774*o.y + 0.2158037573*o.z, m = o.x - 0.1055613458*o.y - 0.0638541728*o.z, s = o.x - 0.0894841775*o.y - 1.2914855480*o.z;
  l = l*l*l; m = m*m*m; s = s*s*s;
  return vec3(4.0767416621*l - 3.3077115913*m + 0.2309699292*s, -1.2684380046*l + 2.6097574011*m - 0.3413193965*s, -0.0041960863*l - 0.7034186147*m + 1.7076147010*s); }
ivec2 PX(){ return ivec2(gl_FragCoord.xy); }
vec4 E(){ return texelFetch(ein, PX(), 0); }
float F(sampler2D t){ return texelFetch(t, PX(), 0).r; }
vec4 F4(sampler2D t){ return texelFetch(t, PX(), 0); }
vec4 K(sampler2D t, float s){ return texture(t, gl_FragCoord.xy/(s*vec2(textureSize(t, 0)))); }
float th(float x){ x = clamp(x, -9.0, 9.0); float e = exp(2.0*x); return (e - 1.0)/(e + 1.0); }
// Tonwert e (kodiert) um d verschieben, weich begrenzt: nie über 0,995 / nie unter 15 % des Werts → kein neues Clipping
float grenzeAuf(float e, float d){ if (d >= 0.0){ float h = max(0.995 - e, 0.0); return e + h*th(d/max(h, 1e-4)); } float h = max(e, 0.0)*0.85; return e - h*th(-d/max(h, 1e-4)); }
// Farbe auf neue Luma (kodiert) bringen, Farbart bleibt; Kanäle über 1 werden zur Luminanz hin entsättigt
vec3 mitLuma(vec3 c, float e2){ float Y = dot(c, LW), Y2 = lin1(e2); vec3 o = Y > 1e-6 ? c*(Y2/Y) : vec3(Y2);
  float m = max(o.r, max(o.g, o.b)), gr = max(max(c.r, max(c.g, c.b)), 0.996);
  if (m > gr && m > Y2) o = vec3(Y2) + (o - vec3(Y2))*clamp((gr - Y2)/(m - Y2), 0.0, 1.0);
  return max(o, 0.0); }
vec3 schutz(vec3 o, vec3 c){ float Y = dot(o, LW), m = max(o.r, max(o.g, o.b)), gr = max(max(c.r, max(c.g, c.b)), 0.996);
  if (m > gr && m > Y) o = vec3(Y) + (o - vec3(Y))*clamp((gr - Y)/(m - Y), 0.0, 1.0); return max(o, 0.0); }
// Hautton-Schätzung (Rückfall ohne Haut-Maske): OKLab-Farbton 20°–90°, mäßige Buntheit, nicht zu dunkel
float hautTon(vec3 c){ vec3 o = zuOk(max(c, 0.0)); float C = length(o.yz), h = degrees(atan(o.z, o.y));
  return smoothstep(0.02, 0.045, C)*(1.0 - smoothstep(0.15, 0.21, C))*smoothstep(18.0, 35.0, h)*(1.0 - smoothstep(78.0, 95.0, h))*smoothstep(0.28, 0.42, o.x); }
`;
const FS = {
  luma: KOPF + `void main(){ aus = vec4(kod1(min(dot(max(E().rgb, 0.0), LW), 4.0)), 0.0, 0.0, 1.0); }`,
  halb: KOPF + `void main(){ ivec2 p = PX()*2, g = textureSize(ein, 0) - 1;
  aus = 0.25*(texelFetch(ein, min(p, g), 0) + texelFetch(ein, min(p + ivec2(1, 0), g), 0) + texelFetch(ein, min(p + ivec2(0, 1), g), 0) + texelFetch(ein, min(p + ivec2(1, 1), g), 0)); }`,
  gf1: KOPF + `void main(){ float I = E().r; aus = vec4(I, I*I, 0.0, 1.0); }`,
  gf2: KOPF + `uniform float eps; void main(){ vec4 m = E(); float v = max(m.g - m.r*m.r, 0.0), a = v/(v + eps); aus = vec4(a, m.r - a*m.r, 0.0, 1.0); }`,
  misch: KOPF + `uniform sampler2D neu; uniform sampler2D maske; void main(){ float m = clamp(texture(maske, uv).r, 0.0, 1.0); aus = mix(E(), F4(neu), m); }`,
  // ---- Gemalt / Weich / Brillant: Luma-Bänder aus schnellen geführten Filtern (Koeffizienten in kleiner Auflösung)
  baender: KOPF + `uniform sampler2D Lt; uniform sampler2D k1; uniform sampler2D k2; uniform sampler2D k3; uniform sampler2D k4; uniform vec4 s;
uniform sampler2D haut; uniform int mitHaut; uniform vec4 gA; uniform vec4 gH; uniform float form; uniform float satt; uniform float mitten; uniform float orange;
uniform vec2 split; uniform float kurveS; uniform float matt; uniform vec3 tau;
float kern(float d, float t){ return sign(d)*max(abs(d) - t, 0.0); }
float B(sampler2D k, float f, float l){ vec2 ab = K(k, f).rg; return ab.x*l + ab.y; }
float A(sampler2D k, float f){ return 1.0 - smoothstep(0.45, 0.9, K(k, f).r); }   // Halo-Bremse: ā≈1 = harte Kante → Band aus
void main(){ vec4 p = E(); vec3 c = max(p.rgb, 0.0); float l = F(Lt);
  float b1 = B(k1, s.x, l), b2 = B(k2, s.y, l), b3 = B(k3, s.z, l), b4 = B(k4, s.w, l);
  float d1 = kern(l - b1, tau.x)*A(k1, s.x), d2 = kern(b1 - b2, tau.y)*A(k2, s.y), d3 = kern(b2 - b3, tau.z)*A(k3, s.z), d4 = (b3 - b4)*A(k4, s.w)*A(k3, s.z);
  float hs = mitHaut == 1 ? clamp(F(haut), 0.0, 1.0) : hautTon(c);
  vec4 g = mix(gA, gH, hs);
  float lc = clamp(l, 0.0, 1.0);
  float hp = g.x*d1 + g.y*d2 + g.z*d3;
  float wsl = hp < 0.0 ? 4.0*lc*(1.0 - lc) : (sqrt(lc) - lc)/0.2071;      // Form des Mischmodus „weiches Licht“
  float wL = smoothstep(0.45, 0.85, b3), wS = 1.0 - smoothstep(0.12, 0.5, b3);   // Luminanz-Masken Lichter/Tiefen
  float db = form*d4*(0.5 + 0.5*(d4 > 0.0 ? wL : wS))*(1.0 - 0.5*hs);           // Dodge & Burn auf der Form-Ebene
  float e = grenzeAuf(l, hp*wsl + db*4.0*lc*(1.0 - lc) + g.w*d4);
  if (e >= 0.0 && e <= 1.0){ e = e + kurveS*e*(1.0 - e)*(2.0*e - 1.0); e = matt + e*(1.0 - matt); }
  vec3 o3 = mitLuma(c, e);
  if (satt != 0.0 || mitten != 0.0 || orange != 0.0 || split != vec2(0.0)){
    vec3 o = zuOk(o3); float C = length(o.yz), h = degrees(atan(o.z, o.y)); float wm = 1.0 - pow(abs(2.0*clamp(e, 0.0, 1.0) - 1.0), 2.0);
    float wo = pow(max(cos(radians(h - 55.0)), 0.0), 4.0)*smoothstep(0.02, 0.06, C);
    float f = (1.0 + satt)*(1.0 - mitten*wm)*(1.0 - orange*wo); o.yz *= max(f, 0.0);
    float wl = smoothstep(0.25, 0.75, e);
    o.yz += (1.0 - wl)*split.x*0.1*vec2(cos(radians(210.0)), sin(radians(210.0)))*(1.0 - smoothstep(0.0, 0.08, 1.0 - o.x)) + wl*split.y*0.1*vec2(cos(radians(40.0)), sin(radians(40.0)));
    o3 = schutz(ausOk(o), c); }
  aus = vec4(o3, p.a); }`,
  // ---- Intensiv: Detail-Menge (Wichtigkeit) = örtliche Energie des Mittel-Bands
  intE: KOPF + `uniform sampler2D k2; uniform float s2; void main(){ float l = E().r; vec2 ab = K(k2, s2).rg; float d = l - (ab.x*l + ab.y); aus = vec4(d*d, 0.0, 0.0, 1.0); }`,
  // ---- Intensiv: Abwedeln & Nachbelichten als feste Ablaufroutine. Alle Ton-Durchgänge laufen auf der feinen, kantenerhaltenden Basis
  // (Frequenztrennung) → Rauschen im Rest wird nicht mitverstärkt; Bänder aus geführten Filtern + Halo-Bremse → keine Säume an harten Kanten.
  intensiv: KOPF + `uniform sampler2D Lt; uniform sampler2D k1; uniform sampler2D k2; uniform sampler2D k3; uniform sampler2D en;
uniform sampler2D haut; uniform int mitHaut; uniform vec3 tau; uniform vec4 s; uniform float st; uniform float lf; uniform float sf; uniform float ff; uniform float ks; uniform float pv;
uniform vec4 reg; uniform vec4 subj[4]; uniform int nSubj; uniform float seiten; uniform sampler2D kh; uniform sampler2D kf; uniform float sKf;
// 0.5 vorbereitet: „Weich (neu)“ = mehr örtliches Abwedeln/Nachbelichten über die Form-Ebene, weniger globale Kurve. Ausgeschaltet
// (WN = 0 als Konstante → wird weggerechnet, Ergebnis wie 0.4); nur params.weichNeu === true nimmt die Variante „intensivWeich“ (WN = 1).
const float WN = 0.0;
float kern(float d, float t){ return sign(d)*max(abs(d) - t, 0.0); }
// weiche Begrenzung der Detail-Bänder: Textur (kleine Ausschläge) fast linear, große Sprünge an Kanten gedämpft → kein heller Umriss
float sanft(float d, float g){ return d/(1.0 + abs(d)/g); }
float B(sampler2D k, float f, float l){ vec2 ab = K(k, f).rg; return ab.x*l + ab.y; }
float A(sampler2D k, float f){ return 1.0 - smoothstep(0.45, 0.9, K(k, f).r); }
float D(float b){ return b <= 0.25 ? ((16.0*b - 12.0)*b + 4.0)*b : sqrt(b); }
// Weiches Licht mit einer neutral-grauen Ebene (0,5 + x): Formel der Mischmodi, x begrenzt
float weichesLicht(float b, float x){ x = clamp(x, -0.5, 0.5); return x <= 0.0 ? b + 2.0*x*b*(1.0 - b) : b + 2.0*x*(D(b) - b); }
// Ineinanderkopieren mit grauer Ebene (0,5 + x)
float ineinander(float b, float x){ x = clamp(x, -0.5, 0.5); return b + 2.0*x*(b < 0.5 ? b : 1.0 - b); }
void main(){ vec4 p = E(); vec3 c = max(p.rgb, 0.0); float l = F(Lt);
  // Basen: b2/b3 mit b1 statt l geführt → der Pixel-Rest (Rauschen) steckt nur in l − b1 und wird von den Ton-Durchgängen nicht verstärkt;
  // an harten Kanten ist b1 ≈ l (ā ≈ 1), die Kante bleibt in allen Basen erhalten
  float b1 = B(k1, s.x, l), b2 = B(k2, s.y, b1), b3 = B(k3, s.z, b1);
  float a2 = A(k2, s.y), a3 = A(k3, s.z);
  // Halo-Bremse auch für dünne Linien und kontrastarme (Farb-)Kanten: größtes ā der feinen Kanten-Karte in der Nachbarschaft (Radius ≈ Form-Ebene)
  float hb = 1.0 - smoothstep(0.45, 0.8, K(kh, s.w).g);
  // Struktur-Tor: Struktur und Fein-Rest nur, wo am Pixel selbst Struktur ist (glatte Flächen neben Kanten: kein Saum; Korn: ā klein)
  float gs = smoothstep(0.38, 0.7, K(kf, sKf).r);
  float hs = mitHaut == 1 ? clamp(F(haut), 0.0, 1.0) : hautTon(c);
  // 1) Wichtigkeit: Gesicht/Motiv, Detail-Menge (Kanten, Textur), leicht zur Mitte; glatte Flächen (Himmel, Wand) bleiben ruhig
  vec2 g = reg.xy + uv*reg.zw; float wF = 0.0;
  for (int i = 0; i < 4; i++){ if (i >= nSubj) break; float q = length((g - subj[i].xy)/subj[i].zw); wF = max(wF, 1.0 - smoothstep(0.7, 1.5, q)); }
  // Detail-Menge: Schwelle über dem Filmkorn echter Fotos (σ ≈ 3–4/255 im Mittel-Band) – Korn zählt nicht als Struktur
  float wD = smoothstep(0.008, 0.045, sqrt(max(F(en), 0.0)));
  vec2 m = (g - 0.5)*vec2(seiten, 1.0)/max(seiten, 1.0); float wC = 1.0 - smoothstep(0.25, 0.75, length(m)*1.4);
  // W (Detail-Durchgänge): Gesicht, Detail-Menge, Mitte. Wt (Ton-Durchgänge): nur Gesicht (bis zum Rand der Ellipse) und weiche Bildmitte –
  // die Detail-Menge fällt neben Linien/Kanten in glatte Flächen hinein ab und würde dort als heller Saum/„Kissen“ sichtbar
  float W = clamp(max(wF, 0.7*wD + 0.3*wC*wD + 0.15*wC), 0.0, 1.0), Wt = 0.4*wC;   // Gesicht wirkt nur über W (Struktur) – eine Gesichts-Ellipse in den Ton-Durchgängen zeichnete Kanten in glatten Hintergrund
  // Bänder: Form (grob → Licht/Schatten der Formen), Struktur (mittel), Fein-Rest (über der Rausch-Schwelle)
  float dForm = kern(b2 - b3, tau.z)*a3*a2*hb, dStr = sanft(kern(b1 - b2, tau.y), 0.035)*a2, dFein = l - b1;
  float wL = smoothstep(0.42, 0.9, b3), wS = 1.0 - smoothstep(0.1, 0.48, b3);          // Luminanz-Masken Lichter / Tiefen (weich)
  // Ton-Durchgänge auf der mittleren Basis (fast rauschfrei); Struktur und Fein-Rest kommen danach dazu (Frequenztrennung)
  float e = b2;
  // Durchgang 1: Licht formen – weiches Licht, grob, auf grauer Ebene aus der Form-Ebene gemalt
  e = weichesLicht(e, 9.0*st*lf*(0.55 + 0.45*Wt)*(1.0 + 0.6*WN)*dForm);
  // Durchgang 2: Abwedeln – Negativ multiplizieren auf den Lichtern der Formen (heller als ihre Umgebung) + Glanz auf dem Motiv
  float hell = smoothstep(0.0, 0.05, b2 - b3)*a3*hb;
  //   + Mitten leicht aufhellen (Negativ multiplizieren, geringe Deckkraft, Mitten-Maske) – hält die Gesamthelligkeit gegen das Nachbelichten
  float wM = 4.0*b3*(1.0 - b3);
  //   Haut: Glanz gering und gedämpft (Gesicht nur leicht herausarbeiten, Schattierung der Wangen bleibt)
  float hd = 1.0 - 0.8*hs;
  e = 1.0 - (1.0 - e)*(1.0 - 0.6*st*lf*wL*hell*(0.55 + 0.45*Wt)*hd)*(1.0 - 0.05*st*lf*Wt*smoothstep(0.45, 0.9, b2)*hd)*(1.0 - 0.08*st*lf*wM*(0.6 + 0.4*Wt)*hd);
  // Durchgang 3: Nachbelichten – Multiplizieren in den Tiefen der Formen und im Unwichtigen (Motiv tritt hervor)
  float dunkel = smoothstep(0.0, 0.05, b3 - b2)*a3*hb;
  //   sehr dunkle Stellen werden nicht weiter abgedunkelt (kein Absaufen)
  e *= 1.0 - (0.42*st*lf*wS*dunkel*(1.0 - 0.5*hs) + 0.09*st*lf*(1.0 - Wt)*(1.0 - wL)*(1.0 - 0.4*WN))*smoothstep(0.03, 0.16, e);
  // Durchgang 4: Klarheit in den Mitten (Form-Ebene, Mitteltöne gewichtet)
  float ec = clamp(e, 0.0, 1.0); e += 3.0*st*lf*(1.0 + 0.3*WN)*4.0*ec*(1.0 - ec)*dForm*(1.0 - 0.4*hs);
  // Gesamtkontrast: S-Kurve um die Bildmitte pv (0,25…0,42 kodiert, aus der Analyse) – tiefere Schatten, hellere Lichter, Mitte bleibt;
  // dunkle Bilder werden so nicht noch dunkler, tiefste Tiefen geschont
  ec = clamp(e, 0.0, 1.0); float sk = 2.0*ec*(1.0 - ec)*(ec - pv); if (sk < 0.0) sk *= smoothstep(0.02, 0.16, ec);
  e = ec + ks*(1.0 - 0.3*WN)*st*sk*(1.0 - 0.75*hs) + (e - ec);
  float off = e - b2;   // örtliche Ton-Verschiebung (für die Hülle der Detail-Bänder)
  // Durchgang 5: Struktur – Band zurück + Ineinanderkopieren, mittlerer Radius (der „gemalte“ Detail-Kontrast), Haut ruhiger
  e = ineinander(e + (b1 - b2), 14.0*st*sf*(0.1 + 0.9*W)*(1.0 - 0.55*hs)*gs*dStr);
  // Durchgang 6: Hochpass (fein) in weichem Licht – nur über der Rausch-Schwelle, nur wo Struktur ist, Haut ausgespart
  float hp = sanft(kern(dFein, tau.x), 0.03)*9.0*st*sf*W*(1.0 - 0.75*hs)*gs;
  ec = clamp(e, 0.0, 1.0); e += dFein + hp*(hp < 0.0 ? 4.0*ec*(1.0 - ec) : (sqrt(ec) - ec)/0.2071);
  // Hülle: Struktur und Fein-Rest dürfen die örtliche Spanne des Originals (5×5, um die Ton-Verschiebung versetzt) kaum überschreiten –
  // an harten Kanten fast gar nicht (sonst heller Umriss), in Texturen bleibt die Verstärkung innerhalb der Spanne
  { ivec2 P = PX(), G = textureSize(Lt, 0) - 1; float mn = 1e4, mx = -1e4;
    for (int dy = -2; dy <= 2; dy++) for (int dx = -2; dx <= 2; dx++){ float v = texelFetch(Lt, clamp(P + ivec2(dx, dy), ivec2(0), G), 0).r; mn = min(mn, v); mx = max(mx, v); }
    float sp = mx - mn, del = 0.002 + 0.012*(1.0 - smoothstep(0.04, 0.12, sp));
    e = clamp(e, mn + off - del, mx + off + del); }
  float e2 = grenzeAuf(l, e - l);
  // Kräftige helle Farben nur so weit aufhellen, wie der Farbraum reicht (sonst würden sie beim Begrenzen pastellig = ausgefressen)
  float Yc = dot(c, LW), mc = max(c.r, max(c.g, c.b));
  if (Yc > 1e-5 && mc > 1e-5){ float Ym = Yc*max(mc, 0.95)/mc, Y2 = lin1(e2);
    if (Y2 > Yc){ float h = max(Ym - Yc, 0.0); e2 = kod1(Yc + h*th((Y2 - Yc)/max(h, 1e-5))); } }
  vec3 o3 = mitLuma(c, e2);
  // Kanäle unter max(alter Höchstwert, 0,95 linear) halten – zur Luminanz hin entsättigen (kräftige helle Farben fressen nicht aus)
  float Yo = dot(o3, LW), mo = max(o3.r, max(o3.g, o3.b)), gk = max(max(c.r, max(c.g, c.b)), 0.95);
  if (mo > gk && mo > Yo) o3 = vec3(Yo) + (o3 - vec3(Yo))*clamp((gk - Yo)/(mo - Yo), 0.0, 1.0);
  // Farbe: Lebendigkeit in OKLCh (wenig Bunte stärker), Mitten/Tiefen satter, Haut (Farbton 25–75°) kaum, Lichter nicht ausfressen
  vec3 o = zuOk(o3); float C = length(o.yz), h = degrees(atan(o.z, o.y));
  float hautW = max(hs, smoothstep(0.02, 0.05, C)*smoothstep(18.0, 30.0, h)*(1.0 - smoothstep(70.0, 82.0, h))*0.6);
  float leb = (0.75*(1.0 - smoothstep(0.03, 0.17, C)) + 0.25)*smoothstep(0.022, 0.06, C);
  float lw = 1.0 - 0.6*smoothstep(0.55, 0.97, o.x);
  float f = 1.0 + st*ff*leb*lw*(1.0 - 0.9*hautW);
  o.yz *= f; vec3 r = ausOk(o);
  // Farbumfang: kein Kanal unter seinen alten Wert hinaus Richtung 0 (sonst „zulaufen“ je Kanal) – Rücknahme der Buntheit linear in RGB
  //   … und keiner über max(alter Höchstwert, 0,95 linear) hinaus (kein Ausfressen einzelner Kanäle in kräftigen Farben)
  float lo = min(min(o3.r, min(o3.g, o3.b)), 0.0006), hi = max(max(o3.r, max(o3.g, o3.b)), 0.95), t = 1.0;
  for (int k = 0; k < 3; k++){ float v = r[k], a = o3[k]; if (v < lo && a > v) t = min(t, (a - lo)/(a - v)); if (v > hi && v > a) t = min(t, (hi - a)/(v - a)); }
  r = mix(o3, r, clamp(t, 0.0, 1.0));
  aus = vec4(schutz(max(r, 0.0), c), p.a); }`,
  // Kanten-Hülle: größtes ā (Kanalwert .r) je 2×2 → verkleinert ohne dünne Linien zu verlieren
  maxHalb: KOPF + `void main(){ ivec2 p = PX()*2, g = textureSize(ein, 0) - 1;
  float a = max(max(texelFetch(ein, min(p, g), 0).r, texelFetch(ein, min(p + ivec2(1, 0), g), 0).r), max(texelFetch(ein, min(p + ivec2(0, 1), g), 0).r, texelFetch(ein, min(p + ivec2(1, 1), g), 0).r));
  aus = vec4(a, 0.0, 0.0, 1.0); }`,
  glanzQ: KOPF + `void main(){ vec3 e = kod(max(E().rgb, 0.0)); aus = vec4(max(e - 0.72, 0.0)/0.28, 1.0); }`,
  glanz: KOPF + `uniform sampler2D g; uniform float k; void main(){ vec4 p = E(); vec3 c = max(p.rgb, 0.0), e = kod(c);
  vec3 r = 1.0 - (1.0 - e)*(1.0 - k*clamp(F4(g).rgb, 0.0, 1.0)); aus = vec4(schutz(lin(min(r, vec3(max(max(e.r, max(e.g, e.b)), 0.996)))), c), p.a); }`,
  // ---- Adaptive Schärfe
  mmH: KOPF + `uniform float r; void main(){ ivec2 P = PX(), G = textureSize(ein, 0) - 1; float lo = 1e4, hi = -1e4;
  for (int k = -8; k <= 8; k++){ if (float(abs(k)) > r) continue; float v = texelFetch(ein, clamp(P + ivec2(k, 0), ivec2(0), G), 0).r; lo = min(lo, v); hi = max(hi, v); } aus = vec4(lo, hi, 0.0, 1.0); }`,
  mmV: KOPF + `uniform float r; void main(){ ivec2 P = PX(), G = textureSize(ein, 0) - 1; float lo = 1e4, hi = -1e4;
  for (int k = -8; k <= 8; k++){ if (float(abs(k)) > r) continue; vec2 v = texelFetch(ein, clamp(P + ivec2(0, k), ivec2(0), G), 0).rg; lo = min(lo, v.r); hi = max(hi, v.g); } aus = vec4(lo, hi, 0.0, 1.0); }`,
  energie: KOPF + `uniform sampler2D g1; uniform sampler2D g2; uniform sampler2D g3; void main(){ float l = E().r, a1 = F(g1), a2 = F(g2), a3 = F(g3);
  float d0 = l - a1, d1 = a1 - a2, d2 = a2 - a3; aus = vec4(d0*d0, d1*d1, d2*d2, 1.0); }`,
  schaerfe: KOPF + `uniform sampler2D Lt; uniform sampler2D g1; uniform sampler2D g2; uniform sampler2D g3; uniform sampler2D mm; uniform sampler2D dk; uniform sampler2D haut;
uniform int eigene; uniform int mitHaut; uniform int hautSchaetzen; uniform vec3 gF; uniform vec3 tau; uniform int zeige;
void main(){ vec4 p = E(); vec3 c = max(p.rgb, 0.0); float l = F(Lt), a1 = F(g1), a2 = F(g2), a3 = F(g3);
  float d0 = l - a1, d1 = a1 - a2, d2 = a2 - a3; vec4 w;
  if (eigene == 1){ vec3 r = max(sqrt(max(F4(dk).xyz, 0.0)) - tau*vec3(1.1, 1.3, 1.5), 0.0); float ges = r.x + r.y + r.z + 1e-6, akt = smoothstep(0.002, 0.01, ges);
    float w3 = smoothstep(0.3, 0.5, r.x/ges)*akt, w2 = smoothstep(0.3, 0.55, r.y/ges)*(1.0 - w3)*akt, w1 = smoothstep(0.3, 0.6, r.z/ges)*max(1.0 - w3 - w2, 0.0)*akt;
    w = vec4(max(1.0 - w1 - w2 - w3, 0.0), w1, w2, w3); }
  else w = F4(dk);
  if (mitHaut == 1 || hautSchaetzen == 1){ float hv = mitHaut == 1 ? clamp(F(haut), 0.0, 1.0) : 0.8*hautTon(c); w.w *= 1.0 - hv; w.z *= 1.0 - 0.7*hv; w.y *= 1.0 - 0.5*hv; }
  if (zeige == 1){ aus = vec4(lin(vec3(0.15)*w.x + vec3(0.2, 0.4, 1.0)*w.y + vec3(0.2, 1.0, 0.3)*w.z + vec3(1.0, 0.35, 0.2)*w.w), 1.0); return; }
  float c0 = sign(d0)*max(abs(d0) - tau.x, 0.0), c1 = sign(d1)*max(abs(d1) - tau.y, 0.0), c2 = sign(d2)*max(abs(d2) - tau.z, 0.0);
  float k0 = gF.x*0.8*w.w, k1 = gF.x*0.3*w.w + gF.y*0.5*w.z, k2 = gF.y*0.3*w.z + gF.z*0.2*w.y;
  vec2 lh = F4(mm).rg; float sp = max(lh.y - lh.x, 0.0), brems = 1.0 - 0.9*smoothstep(0.3, 0.55, sp);   // harte Kanten sind schon scharf
  float del = 0.001 + 0.01*sp*(1.0 - smoothstep(0.15, 0.4, sp));   // harte Einzelkante: kaum Überschwingen erlaubt
  float e2 = clamp(l + (k0*c0 + k1*c1 + k2*c2)*brems, lh.x - del, lh.y + del);
  aus = vec4(mitLuma(c, grenzeAuf(l, e2 - l)), p.a); }`,
  // ---- Monochrom: Kanalmischer (Summe 1, ≥ 0), Haut nicht dunkler als vorher, Tönung in OKLab
  mono: KOPF + `uniform vec3 w; uniform vec2 ton; uniform float umw; uniform sampler2D haut; uniform int mitHaut;
void main(){ vec4 p = E(); vec3 c = max(p.rgb, 0.0); float Y = dot(c, LW), M = max(dot(c, w), 0.0);
  float hs = mitHaut == 1 ? clamp(F(haut), 0.0, 1.0) : hautTon(c); M = mix(M, max(M, Y), hs);
  vec3 o = zuOk(vec3(M)); o.yz += ton*4.0*o.x*(1.0 - o.x); vec3 g = schutz(max(ausOk(o), 0.0), vec3(M));
  aus = vec4(mix(c, g, umw), p.a); }`,
  // ---- Comic: bilaterale Glättung (getrennt), XDoG-artige Linien auf dem geglätteten Bild, weiche Posterisierung in OKLab
  bilat: KOPF + `uniform vec2 rich; uniform float r; uniform float schritt; uniform float sr;
void main(){ vec4 c0 = E(); vec3 e0 = kod(max(c0.rgb, 0.0)); vec3 s = c0.rgb; float ws = 1.0, sS = max(r*0.5, 0.5); ivec2 G = textureSize(ein, 0) - 1;
  for (int i = 1; i <= 16; i++){ float d = float(i)*schritt; if (d > r + 1e-3) break;
    for (int k = -1; k <= 1; k += 2){ ivec2 q = clamp(PX() + ivec2(round(rich*d*float(k))), ivec2(0), G); vec3 c = max(texelFetch(ein, q, 0).rgb, 0.0), de = kod(c) - e0;
      float wt = exp(-0.5*d*d/(sS*sS) - dot(de, de)/(2.0*sr*sr)); s += wt*c; ws += wt; } }
  aus = vec4(s/ws, c0.a); }`,
  comic: KOPF + `uniform sampler2D glatt; uniform sampler2D g1; uniform sampler2D g2; uniform sampler2D haut; uniform int mitHaut;
uniform float st; uniform float theta; uniform float linien; uniform float stufen; uniform float quant; uniform float satt;
void main(){ vec4 p = E(); vec3 c = max(p.rgb, 0.0), cs = max(F4(glatt).rgb, 0.0);
  float S = F(g1) - F(g2); float hs = mitHaut == 1 ? clamp(F(haut), 0.0, 1.0) : hautTon(cs);
  float t = theta*(1.0 + hs);
  float lin_ = smoothstep(t, 2.5*t, -S)*linien;
  vec3 o = zuOk(cs); float x = clamp(o.x, 0.0, 1.0)*stufen, i = floor(x), f = x - i, wq = 0.15;
  float q = (i + 0.5 + 0.5*th((f - 0.5)/wq)/th(0.5/wq))/stufen; o.x = mix(o.x, q, quant); o.yz *= 1.0 + satt;
  vec3 col = schutz(max(ausOk(o), 0.0), cs); col = mix(col, col*0.12, 0.85*clamp(lin_, 0.0, 1.0));
  aus = vec4(mix(c, col, st), p.a); }`,
  // ---- Tiefenschärfe: CoC (vorzeichenbehaftet, px), Sammel-Bokeh mit Vorder-/Hintergrund-Regel, Lichter gewichtet
  coc: KOPF + `uniform sampler2D tiefe; uniform int mitTiefe; uniform float df; uniform vec2 fokus; uniform float maxC; uniform vec4 reg; uniform vec4 subj[4]; uniform int nSubj; uniform float kT;
void main(){ vec2 g = reg.xy + uv*reg.zw; float z;
  if (mitTiefe == 1){ float d0 = df; if (d0 < 0.0){ vec2 fu = (fokus - reg.xy)/reg.zw; d0 = (fu.x >= 0.0 && fu.y >= 0.0 && fu.x <= 1.0 && fu.y <= 1.0) ? texture(tiefe, fu).r : 0.15; }
    float dd = texture(tiefe, uv).r - d0; z = sign(dd)*min(max(abs(dd) - 0.03, 0.0)*kT, 1.0)*maxC; }
  else { float q = 1e3; for (int i = 0; i < 4; i++){ if (i >= nSubj) break; q = min(q, length((g - subj[i].xy)/subj[i].zw)); } z = smoothstep(1.0, 2.3, q)*maxC; }
  aus = vec4(z, 0.0, 0.0, 1.0); }`,
  bokeh: KOPF + `uniform sampler2D coc; uniform float maxR; uniform float hl; uniform int n; uniform float skal;
void main(){ ivec2 P = PX(), G = textureSize(ein, 0) - 1; vec3 c0 = texelFetch(ein, P, 0).rgb; float z0 = texelFetch(coc, P, 0).r*skal, a0 = abs(z0);
  vec3 s = c0; float ws = 1.0, sch = maxR/sqrt(float(n));
  for (int i = 0; i < 128; i++){ if (i >= n) break; float t = (float(i) + 0.5)/float(n), r = maxR*sqrt(t), w0 = float(i)*2.39996323;
    ivec2 Q = clamp(P + ivec2(round(r*vec2(cos(w0), sin(w0)))), ivec2(0), G); vec3 c = texelFetch(ein, Q, 0).rgb; float z = texelFetch(coc, Q, 0).r*skal, a = abs(z);
    if (z > z0) a = min(a, a0*2.0 + 0.5);
    float wt = smoothstep(r - sch, r + 0.5*sch, a)*(1.0 + hl*smoothstep(0.55, 1.0, kod1(dot(max(c, 0.0), LW))));
    s += c*wt; ws += wt; }
  aus = vec4(s/ws, a0); }`,
  bokehMisch: KOPF + `uniform sampler2D unscharf; uniform sampler2D coc; uniform float sk; void main(){ vec4 p = E(); float a = abs(F(coc));
  vec3 u = sk > 1.0 ? K(unscharf, sk).rgb : F4(unscharf).rgb; aus = vec4(schutz(mix(p.rgb, u, smoothstep(0.25*sk, 1.0 + 0.5*sk, a)), p.rgb), p.a); }`,
};
export const SHADER = Object.freeze(Object.fromEntries(Object.entries(FS).map(([k, v]) => ['looks-' + k, v])));
FS.intensivWeich = FS.intensiv.replace('const float WN = 0.0;', 'const float WN = 1.0;');   // „Weich (neu)“, nur über params.weichNeu
const prog = (ctx, n) => ctx.programm('looks-' + n, FS[n]);

// ================================================================ Bausteine (GPU)
const ist1x1 = (t) => !t || (t.b === 1 && t.h === 1);
function luma(ctx, t) { return ctx.pass(prog(ctx, 'luma'), {}, { ein: t }, 'r16f'); }
function maskiere(ctx, ein, aus, maske) {
  if (!maske || aus === ein) return aus;
  const m = ctx.pass(prog(ctx, 'misch'), {}, { ein, neu: aus, maske }); ctx.frei(aus); return m;
}
/** Schneller geführter Filter: Koeffizienten (ā, b̄) in verkleinerter Auflösung, Anwendung mit voller Führung im Shader. */
function gfKoeff(ctx, Lt, rAnteil, eps) {
  const rPx = rAnteil * ctx.kurzeSeite; let s = 1; while (s < 8 && rPx / (s * 2) >= 3) s *= 2;
  let t = Lt, b = ctx.b, h = ctx.h;
  for (let k = 1; k < s; k *= 2) { b = Math.ceil(b / 2); h = Math.ceil(h / 2); const o = ctx.pass(prog(ctx, 'halb'), {}, { ein: t }, 'r16f', ctx.temp('r16f', b, h)); if (t !== Lt) ctx.frei(t); t = o; }
  const m = ctx.pass(prog(ctx, 'gf1'), {}, { ein: t }, 'rgba16f', ctx.temp('rgba16f', b, h)); if (t !== Lt) ctx.frei(t);
  const mb = ctx.unschaerfe(m, rAnteil / s); ctx.frei(m);
  const ab = ctx.pass(prog(ctx, 'gf2'), { eps }, { ein: mb }, 'rgba16f', ctx.temp('rgba16f', b, h)); ctx.frei(mb);
  const abm = ctx.unschaerfe(ab, rAnteil / s); ctx.frei(ab);
  return { tex: abm, s };
}
/** Regler-Stufen aus regler.js mit synthetischen Params (Teil der Look-Rezepte). */
function regle(ctx, tex, params, namen, ein) {
  const s = { id: 'look-regler', art: ART.REGLER, params: { ...REGLER_STANDARD, ...params }, an: true, deckkraft: 1 };
  for (const n of namen) { const m = RS[n]; if (!m) continue; let an = false; try { an = m.aktiv(s, ctx); } catch { an = false; } if (!an) continue;
    const o = m.rendere(ctx, tex, s, null); if (o && o !== tex) { if (tex !== ein) ctx.frei(tex); tex = o; } }
  return tex;
}
const skaliere = (p, f) => Object.fromEntries(Object.entries(p || {}).map(([k, v]) => [k, v * f]));
const REGLER_RAND = (px) => Math.ceil(0.06 * px);
const hautTex = (ctx) => { const t = ctx.basis ? ctx.basis('haut') : null; return ist1x1(t) ? null : t; };

// Radien der Bänder (Anteil kurze Seite): fein 0,25 %, mittel 0,8 %, Klarheit 1,5 %, Form 3 % (geführt; Rand = 2 Unschärfen × 3σ)
const RB = [0.0025, 0.008, 0.015, 0.03];
function baender(ctx, ein, g) {
  // eps klein (0,1 %): Kanten ab ~0,1 Luma-Sprung bleiben in der Basis erhalten → Form/Klarheit-Bänder (d2–d4) springen nicht über harte
  // Kanten (Halo 4,5 % → 0,8 % ohne Schärfe); weiche Form-Verläufe (Wange, Licht) haben viel kleinere örtliche Varianz und bleiben im Band.
  const Lt = luma(ctx, ein), eps = [0.0025, 0.002, 0.001, 0.001];
  const k = (g.ohneForm ? RB.slice(0, 3) : RB).map((r, i) => gfKoeff(ctx, Lt, r, eps[i]));
  if (g.ohneForm) k.push(k[2]);
  const ht = hautTex(ctx);
  const o = ctx.pass(prog(ctx, 'baender'), {
    s: k.map((x) => x.s), mitHaut: ht ? 1 : 0, gA: g.gA, gH: g.gH, form: g.form || 0, satt: g.satt || 0, mitten: g.mitten || 0, orange: g.orange || 0,
    split: g.split || [0, 0], kurveS: g.kurveS || 0, matt: g.matt || 0, tau: [1.5, 0.6, 0.3].map((f) => f * rauschJetzt(ctx.analyse, ctx.pxProQuelle || 1)),
  }, { ein, Lt, k1: k[0].tex, k2: k[1].tex, k3: k[2].tex, k4: k[3].tex, haut: ht || Lt });
  ctx.frei(Lt); for (const x of new Set(k)) ctx.frei(x.tex);
  return o;
}
const RAND_BAENDER = (px, ohneForm = false) => Math.ceil(6 * RB[ohneForm ? 2 : 3] * px) + 4;

/** Gemalt-Kern (Stärke st, Feinregler aus s). */
function gemaltKern(ctx, ein, s, st) {
  const mal = fein(s, 'malerisch'), lf = fein(s, 'licht'), hg = fein(s, 'haut'), fz = 1 - klemme((s.params?.fein?.farbe ?? 0) / 100);
  const tt = 0.5 * fz;   // Teiltonung: halbe frühere Stärke; „Farbe zurück“ 100 % = keine Tönung (neutrales Grau bleibt neutral)
  let t = regle(ctx, ein, skaliere(LOOK.gemalt.basis.regler, st), ['belichtung', 'ton'], ein);
  const a = 0.45 * st * mal, h = 0.2 * st * mal;
  const o = baender(ctx, t, {
    gA: [1.1 * a, 1.6 * a, 1.3 * a, 0], gH: [0.4 * h - 0.15 * st, -0.6 * st * hg * 1.2, -0.3 * st * hg, 0],
    form: 0.45 * st * lf, satt: -0.25 * st * fz, mitten: 0.12 * st * fz, orange: 0.15 * st * fz, split: [0.8 * st * tt, 0.6 * st * tt], kurveS: 0.3 * st, matt: 0.03 * st,
  });
  if (t !== ein) ctx.frei(t); return o;
}

// ---- Intensiv: Abwedeln & Nachbelichten wie eine Aktion in mehreren Durchgängen (Ablauf im Shader „intensiv“):
//  Luminanz-Masken + Wichtigkeit (Gesicht, Detail-Menge, Mitte) → Weiches Licht (grob) → Negativ multiplizieren (Lichter) →
//  Multiplizieren (Tiefen, Unwichtiges) → Ineinanderkopieren (Struktur, mittel) → Klarheit Mitten → S-Kurve → Hochpass fein (weiches Licht)
//  → Lebendigkeit (Haut geschont) → Rand nachbelichten (look-effekte) → leichte adaptive Schärfe (look-schaerfe).
const RI = [0.0035, 0.012, 0.03];   // fein / mittel (Struktur) / grob (Form, Licht) – Anteil der kurzen Seite
const RI_E = 0.012;                 // Unschärfe der Detail-Energie (Wichtigkeit)
function intensivKern(ctx, ein, s, st) {
  const lf = fein(s, 'licht'), sf = fein(s, 'struktur'), ff = fein(s, 'farbe');
  // eps klein: Kanten ab ~0,04 Luma bleiben in den Basen → die Form-Ebene enthält nur weiche Verläufe (kein „Kissen“ in Flächen, kein Halo)
  const Lt = luma(ctx, ein), eps = [0.002, 0.001, 0.0003];
  const k = RI.map((r, i) => gfKoeff(ctx, Lt, r, eps[i]));
  const e0 = ctx.pass(prog(ctx, 'intE'), { s2: k[1].s }, { ein: Lt, k2: k[1].tex }, 'r16f'), en = ctx.unschaerfe(e0, RI_E); ctx.frei(e0);
  const subj = new Float32Array(16); let n = 0;
  for (const g of (ctx.gesichter || []).slice(0, 4)) { const b = g.box; subj.set([b.x + b.b / 2, b.y + b.h * 0.5, b.b * 1.05, b.h * 1.25], n * 4); n++; }
  const reg = ctx.region ? [ctx.region.x, ctx.region.y, ctx.region.b, ctx.region.h] : [0, 0, 1, 1];
  const gesB = ctx.region ? ctx.b / ctx.region.b : ctx.b, gesH = ctx.region ? ctx.h / ctx.region.h : ctx.h;
  const ht = hautTex(ctx), sig = rauschJetzt(ctx.analyse, ctx.pxProQuelle || 1);
  const kh = kantenHuelle(ctx, Lt);
  const o = ctx.pass(prog(ctx, s?.params?.weichNeu === true ? 'intensivWeich' : 'intensiv'), {
    s: [...k.map((x) => x.s), kh.s], sKf: kh.sf, mitHaut: ht ? 1 : 0, tau: [2.0, 1.1, 1.0].map((f) => Math.max(0.002, f * sig)), st, lf, sf, ff, ks: 1.8 * (0.4 + 0.6 * kornRauschen(ctx.analyse)), pv: klemme(ctx.analyse?.belichtung?.p50 ?? 0.42, 0.25, 0.42), reg, subj, nSubj: n, seiten: gesB / gesH,
  }, { ein, Lt, k1: k[0].tex, k2: k[1].tex, k3: k[2].tex, en, haut: ht || Lt, kh: kh.tex, kf: kh.fein });
  ctx.frei(Lt); ctx.frei(en); ctx.frei(kh.tex); ctx.frei(kh.fein); for (const x of k) ctx.frei(x.tex);
  return o;
}
// Kanten-Hülle für die Halo-Bremse: feine Kanten-Stärke ā (kleines eps → auch dünne Linien und kontrastarme Farbkanten zählen),
// verkleinert per Maximum und dann um RH (≈ Reichweite der Form-Ebene) geweitet. Ergebnis .g, Abtastung mit K(t, s).
const RH = 0.05, EPS_H = 0.0004;
function kantenHuelle(ctx, Lt) {
  const sig = rauschJetzt(ctx.analyse, ctx.pxProQuelle || 1), g = gfKoeff(ctx, Lt, RI[0], Math.max(EPS_H, 10 * sig * sig)); let t = g.tex, s = g.s, b = Math.ceil(ctx.b / s), h = Math.ceil(ctx.h / s);
  const R = RH * ctx.kurzeSeite;
  while (R / s > 6 && s < 64) { b = Math.ceil(b / 2); h = Math.ceil(h / 2); const o = ctx.pass(prog(ctx, 'maxHalb'), {}, { ein: t }, 'r16f', ctx.temp('r16f', b, h)); if (t !== g.tex) ctx.frei(t); t = o; s *= 2; }
  const r = Math.max(1, Math.min(8, Math.ceil(R / s)));
  const m1 = ctx.pass(prog(ctx, 'mmH'), { r }, { ein: t }, 'rgba16f', ctx.temp('rgba16f', b, h)); if (t !== g.tex) ctx.frei(t);
  const m2 = ctx.pass(prog(ctx, 'mmV'), { r }, { ein: m1 }, 'rgba16f', ctx.temp('rgba16f', b, h)); ctx.frei(m1);
  return { tex: m2, s, fein: g.tex, sf: g.s };   // fein: ungeweitete Kanten-Stärke am Pixel (Struktur nur, wo selbst Struktur ist)
}
// Kanten-Hülle und Form-Ebene hängen beide nur an Lt (parallel) → das Maximum der beiden Reichweiten zählt, nicht die Summe
const RAND_INTENSIV = (px) => Math.ceil(Math.max(6 * RI[2], RH + 6 * RI[0]) * px) + Math.ceil(3 * RI_E * px) + 8;

// ---- Adaptive Schärfe (Stufe DETAILS): Bänder fein/mittel/grob, Gewichte aus der Detailkarte (oder eigene GPU-Karte)
function rendereSchaerfe(ctx, ein, p) {
  const st = klemme(p.staerke ?? 0.6, 0, 2); if (st <= 0) return ein;
  const r = schaerfeRadien(ctx.pxProQuelle || 1), ks = ctx.kurzeSeite, sigma = rauschJetzt(ctx.analyse, ctx.pxProQuelle || 1), rs = p.rauschSchwelle ?? 1.5;
  const Lt = luma(ctx, ein), g1 = ctx.unschaerfe(Lt, r.fein / ks), g2 = ctx.unschaerfe(Lt, r.mittel / ks), g3 = ctx.unschaerfe(Lt, r.grob / ks);
  const R = Math.min(8, Math.max(1, Math.round(1.5 * r.mittel)));
  const m1 = ctx.pass(prog(ctx, 'mmH'), { r: R }, { ein: Lt }, 'rgba16f'), mm = ctx.pass(prog(ctx, 'mmV'), { r: R }, { ein: m1 }, 'rgba16f'); ctx.frei(m1);
  let dk = ctx.basis ? ctx.basis('detailkarte') : null, eigene = null;
  if (ist1x1(dk)) { const en = ctx.pass(prog(ctx, 'energie'), {}, { ein: Lt, g1, g2, g3 }, 'rgba16f'); eigene = ctx.unschaerfe(en, (2.5 * r.mittel) / ks); ctx.frei(en); }
  const ht = hautTex(ctx), K = 2.6;
  const tau = [0.85, 0.45, 0.25].map((f) => Math.max(0.003, rs * sigma * f));   // ≥ 0,8/255: 8-Bit-Stufen in Verläufen nie verstärken
  const o = ctx.pass(prog(ctx, 'schaerfe'), { eigene: eigene ? 1 : 0, mitHaut: ht ? 1 : 0, hautSchaetzen: !ht && (ctx.gesichter || []).length ? 1 : 0, gF: [st * K * (p.fein ?? 1), st * K * (p.mittel ?? 1), st * K * (p.grob ?? 1)], tau, zeige: p.zeige ? 1 : 0 },
    { ein, Lt, g1, g2, g3, mm, dk: eigene || dk, haut: ht || Lt });
  for (const t of [Lt, g1, g2, g3, mm, eigene]) if (t) ctx.frei(t);
  return o;
}
const randSchaerfe = (px, pxProQuelle = 1) => { const r = schaerfeRadien(pxProQuelle); return Math.ceil(3 * r.grob + 8 + 3 * 2.5 * r.mittel) + 2; };

// ---- Tiefenschärfe (Stufe EFFEKTE − 1, vor Vignette/Korn)
function tiefenParams(s) {
  if (s.art === ART.EFFEKTE) { const t = s.params?.tiefenschaerfe; return t ? { staerke: klemme(t.staerke ?? 0.7, 0, 1), fokus: t.fokus || null, fokusTiefe: t.fokusTiefe ?? null, lichter: t.lichter ?? 1 } : null; }
  const def = LOOK[s.params?.id]?.basis; if (!def?.tiefe) return null;
  return { staerke: stOf(s) * def.tiefe * fein(s, 'unschaerfe'), fokus: s.params?.fokus || null, fokusTiefe: s.params?.fokusTiefe ?? null, lichter: fein(s, 'lichter') };
}
const maxCoc = (t, px) => 0.012 * px * klemme(t.staerke, 0, 2);
function rendereTiefe(ctx, ein, t) {
  const mc = maxCoc(t, ctx.kurzeSeite); if (mc < 0.6) return ein;
  const tiefe = ctx.basis ? ctx.basis('tiefe') : null, mitTiefe = !ist1x1(tiefe);
  // Motiv ohne Tiefenmodell: Gesichter (Kopf + Oberkörper), sonst Antipp-Punkt, sonst Bildmitte
  const subj = [];
  for (const g of (ctx.gesichter || []).slice(0, 4)) { const b = g.box; subj.push([b.x + b.b / 2, b.y + b.h * 0.7, b.b * 0.8, b.h * 1.1]); }   // Kopf + Schultern (vorher ×1,25/×1,6: bei großen Gesichtern blieb das ganze Bild scharf)
  if (!subj.length && t.fokus) subj.push([t.fokus.x, t.fokus.y, 0.16, 0.2]);
  if (!subj.length) subj.push([0.5, 0.5, 0.28, 0.36]);
  const groesste = (ctx.gesichter || []).slice().sort((a, b) => b.box.b * b.box.h - a.box.b * a.box.h)[0];
  const fokus = t.fokus || (groesste ? { x: groesste.box.x + groesste.box.b / 2, y: groesste.box.y + groesste.box.h / 2 } : { x: 0.5, y: 0.5 });
  const flach = new Float32Array(16); subj.forEach((v, i) => flach.set(v, i * 4));
  const reg = ctx.region ? [ctx.region.x, ctx.region.y, ctx.region.b, ctx.region.h] : [0, 0, 1, 1];
  const coc = ctx.pass(prog(ctx, 'coc'), { mitTiefe: mitTiefe ? 1 : 0, df: t.fokusTiefe ?? -1, fokus: [fokus.x, fokus.y], maxC: mc, reg, subj: flach, nSubj: subj.length, kT: 2.5 }, { tiefe: mitTiefe ? tiefe : ein, ein }, 'r16f');
  let s = 1; while (s < 8 && mc / s > 10) s *= 2;
  let farbe = ein, cocS = coc, b = ctx.b, h = ctx.h;
  for (let k = 1; k < s; k *= 2) { b = Math.ceil(b / 2); h = Math.ceil(h / 2);
    const f2 = ctx.pass(prog(ctx, 'halb'), {}, { ein: farbe }, 'rgba16f', ctx.temp('rgba16f', b, h)); if (farbe !== ein) ctx.frei(farbe); farbe = f2;
    const c2 = ctx.pass(prog(ctx, 'halb'), {}, { ein: cocS }, 'r16f', ctx.temp('r16f', b, h)); if (cocS !== coc) ctx.frei(cocS); cocS = c2; }
  // CoC in der kleinen Stufe in deren Pixeln: Werte durch s teilen geschieht im Shader über maxR; a vergleicht in px → skalieren
  const n = ctx.qualitaet === 'zieh' ? 48 : 96;
  const un = ctx.pass(prog(ctx, 'bokeh'), { maxR: mc / s, hl: 1.5 * (t.lichter ?? 1), n, skal: 1 / s }, { ein: farbe, coc: cocS }, 'rgba16f', ctx.temp('rgba16f', b, h));
  if (farbe !== ein) ctx.frei(farbe); if (cocS !== coc) ctx.frei(cocS);
  const o = ctx.pass(prog(ctx, 'bokehMisch'), { sk: s }, { ein, unscharf: un, coc }); ctx.frei(un); ctx.frei(coc);
  return o;
}

// ---- Monochrom
function monoKern(ctx, ein, s, st) {
  // Verrauschtes Foto: Mischer bis zur Hälfte Richtung gleiche Anteile (unabhängiges Kanal-Rauschen mittelt sich: √(Σw²) 0,75 → 0,58)
  const kr = kornRauschen(ctx.analyse), w0 = monoGewichte(s.params?.fein?.filter ?? s.params?.filter ?? 20), w = w0.map((v) => v + 0.5 * (1 - kr) * (1 / 3 - v)),
    tn = klemme((s.params?.fein?.toenung ?? 0) / 100, -1, 1);
  const ton = tn >= 0 ? [0.035 * tn * 0.55, 0.035 * tn] : [0.035 * tn * 0.6, 0.035 * tn * 1.0];   // warm: Richtung Orange, kühl: Richtung Blau
  const ht = hautTex(ctx);
  const m = ctx.pass(prog(ctx, 'mono'), { w, ton: tn >= 0 ? ton : [-ton[0] * 0.2, ton[1]], umw: klemme(st / 0.5, 0, 1), mitHaut: ht ? 1 : 0 }, { ein, haut: ht || ein });
  // Verrauschtes Foto (σ Luma > 0,6 %): Struktur und Klarheit (heben Rauschen direkt) gleiten bis 0 (ab 1,8 %) – Kontrast bleibt
  const kf = fein(s, 'kontrast'); const r = LOOK.monochrom.basis.regler, rf = 1 - klemme(((ctx.analyse?.rauschen?.sigmaL ?? 0) - 0.006) / 0.012);
  const o = regle(ctx, m, { kontrast: r.kontrast * st * kf, struktur: r.struktur * st * kf * rf, klarheit: r.klarheit * st * kf * rf }, ['ton', 'praesenz'], ein);
  if (o !== m) ctx.frei(m); return o;
}

// ---- Comic
function comicKern(ctx, ein, s, st) {
  const ks = ctx.kurzeSeite, r = Math.max(1.5, 0.006 * ks * fein(s, 'flaechen')), schritt = Math.max(1, r / 12);
  let t = ein;
  for (let it = 0; it < 2; it++) for (const rich of [[1, 0], [0, 1]]) { const o = ctx.pass(prog(ctx, 'bilat'), { rich, r, schritt, sr: 0.09 }, { ein: t }, 'rgba16f'); if (t !== ein) ctx.frei(t); t = o; }
  const Ls = luma(ctx, t), sg = Math.max(0.8, 0.9 * (ctx.skala || 1));
  const g1 = ctx.unschaerfe(Ls, sg / ks), g2 = ctx.unschaerfe(Ls, (1.6 * sg) / ks);
  const sigma = rauschJetzt(ctx.analyse, ctx.pxProQuelle || 1), ht = hautTex(ctx);
  const o = ctx.pass(prog(ctx, 'comic'), { st, theta: Math.max(0.014, 2.5 * sigma), linien: fein(s, 'linien'), stufen: 6, quant: klemme(0.85 * fein(s, 'flaechen'), 0, 1), satt: 0.3 * fein(s, 'farbe'), mitHaut: ht ? 1 : 0 },
    { ein, glatt: t, g1, g2, haut: ht || Ls });
  for (const x of [Ls, g1, g2]) ctx.frei(x); if (t !== ein) ctx.frei(t);
  return o;
}
const randComic = (px, skala = 1) => Math.ceil(2 * 0.006 * px * 2 + 3 * 1.6 * Math.max(0.8, 0.9 * skala)) + 4;

// ---- Weich / Brillant / Natürlich
function weichKern(ctx, ein, s, st) {
  const hg = fein(s, 'haut'), lk = fein(s, 'leuchten'), b = LOOK.weich.basis;
  let t = regle(ctx, ein, skaliere(b.regler, st), ['ton', 'praesenz'], ein);
  const hh = b.haut * st * hg;
  let o = baender(ctx, t, { ohneForm: true, gA: [0, 0, 0, 0], gH: [-0.1 * hh, -1.0 * hh, -0.5 * hh, 0] }); if (t !== ein) ctx.frei(t); t = o;
  const k = b.leuchten * st * lk * 4;
  if (k > 0.002) { const q = ctx.pass(prog(ctx, 'glanzQ'), {}, { ein: t }, 'rgba16f'); const g = ctx.unschaerfe(q, 0.015); ctx.frei(q);
    o = ctx.pass(prog(ctx, 'glanz'), { k: Math.min(0.5, k) }, { ein: t, g }); ctx.frei(g); if (t !== ein) ctx.frei(t); t = o; }
  return t;
}
function brillantKern(ctx, ein, s, st) {
  const kf = fein(s, 'klarheit'), ff = fein(s, 'farbe'), r = LOOK.brillant.basis.regler;
  return regle(ctx, ein, { ...skaliere(r, st), klarheit: r.klarheit * st * kf, struktur: r.struktur * st * kf, dynamik: r.dynamik * st * ff }, ['ton', 'praesenz'], ein);
}

const KERNE = {
  gemalt: (ctx, ein, s, st) => gemaltKern(ctx, ein, s, st),
  kombination: (ctx, ein, s, st) => gemaltKern(ctx, ein, { ...s, params: { ...s.params, fein: { ...(s.params?.fein || {}), malerisch: s.params?.fein?.malerisch ?? 50 } } }, st * LOOK.kombination.basis.gemalt),
  brillant: brillantKern, monochrom: monoKern, comic: comicKern, weich: weichKern, intensiv: intensivKern,
};
const RAENDER = {
  gemalt: (s, px) => Math.max(REGLER_RAND(px), RAND_BAENDER(px)) + REGLER_RAND(px), kombination: (s, px) => Math.max(REGLER_RAND(px), RAND_BAENDER(px)) + REGLER_RAND(px),
  brillant: (s, px) => REGLER_RAND(px) * 2, monochrom: (s, px) => REGLER_RAND(px) * 2, comic: (s, px) => randComic(px),
  weich: (s, px) => REGLER_RAND(px) + RAND_BAENDER(px, true) + Math.ceil(0.045 * px), intensiv: (s, px) => RAND_INTENSIV(px),
};
const lookSchaerfe = (s) => { const b = LOOK[s.params?.id]?.basis; if (!b?.schaerfe) return 0; return b.schaerfe * stOf(s) * fein(s, 'schaerfe'); };
/** Körnung bei schon verrauschten Fotos zurücknehmen (σ Luma 0,6 % → 1, ab 1,8 % → 0): Rauschen IST dort schon Korn. */
export const kornRauschen = (analyse) => 1 - klemme(((analyse?.rauschen?.sigmaL ?? 0) - 0.006) / 0.012);
const lookEffekte = (s) => { const b = LOOK[s.params?.id]?.basis; const st = stOf(s), id = s.params?.id;
  const korn = id === 'gemalt' || id === 'monochrom' ? (b.korn || 0) * st * fein(s, 'korn') : id === 'kombination' ? 8 * st * 0.6 * fein(s, 'korn') : 0;
  const vignette = id === 'gemalt' ? (b.vignette || 0) * st : id === 'kombination' ? -20 * st * 0.6 : id === 'intensiv' ? (b.vignette || 0) * st * fein(s, 'rand') : 0;
  return { vignette, korn }; };

// ================================================================ Stufen-Module
const modul = (name, stufe, arten, aktiv, rendere, rand, braucht = []) => ({ name, stufe, arten, aktiv, rendere, rand, braucht });
/** StufenModul[]: 'look-*' (STUFE.LOOK), 'look-schaerfe' + 'schaerfe' (STUFE.DETAILS), 'look-tiefe' + 'tiefenschaerfe' (STUFE.EFFEKTE − 1, vor Vignette/Korn), 'look-effekte' (STUFE.EFFEKTE). */
export const STUFEN = Object.freeze([
  ...LOOKS.filter((l) => KERNE[l.id]).map((l) => modul('look-' + l.id, STUFE.LOOK, [ART.LOOK],
    (s) => s.params?.id === l.id && stOf(s) > 0.001,
    (ctx, ein, s, m) => maskiere(ctx, ein, KERNE[l.id](ctx, ein, s, stOf(s)), m),
    (s, px) => RAENDER[l.id](s, px), ['haut'])),
  modul('look-schaerfe', STUFE.DETAILS, [ART.LOOK], (s) => lookSchaerfe(s) > 0.01,
    (ctx, ein, s, m) => maskiere(ctx, ein, rendereSchaerfe(ctx, ein, { staerke: lookSchaerfe(s) * (0.3 + 0.7 * kornRauschen(ctx.analyse)), fein: s.params?.id === 'intensiv' ? 0.5 : 1, mittel: 1, grob: 1, rauschSchwelle: (ctx.analyse?.rauschen?.sigmaL ?? 0) > 0.015 ? 2.5 : 1.5 }), m), (s, px) => randSchaerfe(px), ['detailkarte', 'haut']),
  modul('schaerfe', STUFE.DETAILS, [ART.SCHAERFE], (s) => (s.params?.staerke ?? 0.6) > 0.001,
    (ctx, ein, s, m) => maskiere(ctx, ein, rendereSchaerfe(ctx, ein, s.params || {}), m), (s, px) => randSchaerfe(px), ['detailkarte', 'haut']),
  modul('look-tiefe', STUFE.EFFEKTE - 1, [ART.LOOK], (s) => { const t = tiefenParams(s); return !!t && t.staerke > 0.01; },
    (ctx, ein, s, m) => maskiere(ctx, ein, rendereTiefe(ctx, ein, tiefenParams(s)), m), (s, px) => { const t = tiefenParams(s); return t ? Math.ceil(maxCoc(t, px)) + 20 : 0; }, ['tiefe', 'gesichter']),
  modul('tiefenschaerfe', STUFE.EFFEKTE - 1, [ART.EFFEKTE], (s) => { const t = tiefenParams(s); return !!t && t.staerke > 0.01; },
    (ctx, ein, s, m) => maskiere(ctx, ein, rendereTiefe(ctx, ein, tiefenParams(s)), m), (s, px) => { const t = tiefenParams(s); return t ? Math.ceil(maxCoc(t, px)) + 20 : 0; }, ['tiefe', 'gesichter']),
  modul('look-effekte', STUFE.EFFEKTE, [ART.LOOK], (s) => { const e = lookEffekte(s); return Math.abs(e.vignette) > 0.05 || e.korn > 0.05; },
    (ctx, ein, s, m) => { const e = lookEffekte(s), kr = kornRauschen(ctx.analyse); return maskiere(ctx, ein, RS.effekte.rendere(ctx, ein, { art: ART.EFFEKTE, params: { vignette: e.vignette, korn: e.korn * kr } }, null), m); }, () => 0),
]);

// ================================================================ Schritte
/** @returns {import('./typen.js').Schritt} */
export function lookSchritt(id, staerke = 0.7, analyse) {
  const def = LOOK[id] || LOOK.natuerlich, f = {};
  for (const d of def.feinregler) f[d.id] = d.standard;
  if (def.id === 'monochrom') f.filter = monoFilter(analyse);
  return neuerSchritt(ART.LOOK, { id: def.id, staerke: klemme(staerke, 0, 1), fein: f, fokus: null, fokusTiefe: null }, { name: def.titel });
}
/** @returns {import('./typen.js').Schritt} adaptive Schärfe; weiches Bild → etwas mehr, starkes Rauschen → höhere Schwelle. */
export function schaerfeSchritt(analyse, staerke = 0.6) {
  const unscharf = (analyse?.frequenz?.schaerfe ?? 1) < 0.08, laut = (analyse?.rauschen?.sigmaL ?? 0) > 0.015;
  return neuerSchritt(ART.SCHAERFE, { staerke: klemme(staerke * (unscharf ? 1.25 : 1), 0, 1.5), fein: 1, mittel: 1, grob: 1, rauschSchwelle: laut ? 2 : 1.5 }, { name: 'Adaptive Schärfe' });
}
/** Tiefenschärfe als eigener Effekt-Schritt (Antippen: fokus normiert; fokusTiefe aus fokusTiefe(karte, punkt)). */
export function tiefenSchritt({ staerke = 0.7, fokus = null, fokusTiefe = null, lichter = 1 } = {}) {
  return neuerSchritt(ART.EFFEKTE, { vignette: 0, korn: 0, tiefenschaerfe: { staerke, fokus, fokusTiefe, lichter } }, { name: 'Tiefenschärfe' });
}
