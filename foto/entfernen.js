// Bildwerk – Objekte entfernen (Agent E-Teil, gebaut im Modul „auswahl“). Signaturen FEST (ARCH.md §4.8).
// Ablauf: Ausschnitt aus VOLLER Quelle → 512² → Füllen (MI-GAN | LaMa | Rückfall Flicken-Suche) → hochskalieren →
// Rand-Angleichung (Farbe/Helligkeit diffus, Korn der Umgebung) → Flicken (RGBA, A = weiche Deckung) → Schritt 'entfernen'.
// Die Shader-Stufe 'retusche' (STUFE.RETUSCHE) legt die Flicken in voller Auflösung über das Bild (Vorschau, Lupe, Export).
import { ART, STUFE, FEHLER, BildwerkFehler, neueId, neuerSchritt } from './typen.js';

const kl = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);

// ================================================================ Ausschnitt
/** Quadratischer Ausschnitt um die Maske (Quell-Pixel, Vielfache von 8) mit Kontext-Rand. */
export function waehleAusschnitt(maske, quelleB, quelleH, opts = {}) {
  const kante = opts.modellKante ?? 512, kontext = opts.kontext ?? 0.5;
  let x0 = Infinity, y0 = Infinity, x1 = -1, y1 = -1; const { b, h, daten } = maske;
  for (let y = 0; y < h; y++) { const o = y * b; for (let x = 0; x < b; x++) if (daten[o + x] > 16) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } }
  if (x1 < 0) throw new BildwerkFehler(FEHLER.UNBEKANNT, 'Leere Maske');
  const sx = quelleB / b, sy = quelleH / h;
  const qx0 = x0 * sx, qy0 = y0 * sy, qx1 = (x1 + 1) * sx, qy1 = (y1 + 1) * sy;
  const gross = Math.max(qx1 - qx0, qy1 - qy0);
  let seite = Math.max(Math.min(256, Math.min(quelleB, quelleH)), gross * (1 + 2 * kontext));
  seite = Math.min(seite, quelleB, quelleH); seite = Math.max(8, Math.floor(seite / 8) * 8);
  const cx = (qx0 + qx1) / 2, cy = (qy0 + qy1) / 2;
  const x = Math.round(kl(cx - seite / 2, 0, quelleB - seite)), y = Math.round(kl(cy - seite / 2, 0, quelleH - seite));
  return { px: { x, y, b: seite, h: seite }, skala: kante / seite };
}

// ================================================================ Flicken-Suche (PatchMatch, Wexler-Stil, mehrstufig) – rein, Worker
function zufall(s) { return () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function halb(img, loch, b, h) {
  const B = Math.ceil(b / 2), H = Math.ceil(h / 2), o = new Float32Array(B * H * 3), m = new Uint8Array(B * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < B; x++) {
    let s0 = 0, s1 = 0, s2 = 0, n = 0, l = 0;
    for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) { const X = Math.min(b - 1, 2 * x + dx), Y = Math.min(h - 1, 2 * y + dy), i = Y * b + X;
      if (loch[i]) { l = 1; continue; } s0 += img[i * 3]; s1 += img[i * 3 + 1]; s2 += img[i * 3 + 2]; n++; }
    const j = y * B + x; m[j] = l; if (n) { o[j * 3] = s0 / n; o[j * 3 + 1] = s1 / n; o[j * 3 + 2] = s2 / n; }
  }
  return { img: o, loch: m, b: B, h: H };
}
/** Löcher von außen nach innen mit Nachbarmittel füllen (Start der gröbsten Stufe). */
function zwiebel(img, loch, b, h) {
  const offen = Uint8Array.from(loch); let rest = offen.reduce((s, v) => s + v, 0), runden = 0;
  while (rest > 0 && runden++ < 4096) {
    const neu = [];
    for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) { const i = y * b + x; if (!offen[i]) continue;
      let s0 = 0, s1 = 0, s2 = 0, n = 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) { const X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= b || Y >= h) continue; const j = Y * b + X; if (offen[j]) continue; s0 += img[j * 3]; s1 += img[j * 3 + 1]; s2 += img[j * 3 + 2]; n++; }
      if (n) neu.push(i, s0 / n, s1 / n, s2 / n); }
    if (!neu.length) break;
    for (let k = 0; k < neu.length; k += 4) { const i = neu[k]; img[i * 3] = neu[k + 1]; img[i * 3 + 1] = neu[k + 2]; img[i * 3 + 2] = neu[k + 3]; offen[i] = 0; rest--; }
  }
}
function stufeFuellen(img, loch, b, h, R, iterationen, rnd, nnfAlt) {
  // gültige Quellen: Flicken komplett bekannt
  const erw = new Uint8Array(b * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) if (loch[y * b + x]) for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) { const X = x + dx, Y = y + dy; if (X >= 0 && Y >= 0 && X < b && Y < h) erw[Y * b + X] = 1; }
  const quellen = []; for (let y = R; y < h - R; y++) for (let x = R; x < b - R; x++) if (!erw[y * b + x]) quellen.push(y * b + x);
  if (!quellen.length) return null;
  const ziele = []; for (let i = 0; i < b * h; i++) if (erw[i]) ziele.push(i);
  const gueltig = new Uint8Array(b * h); for (const q of quellen) gueltig[q] = 1;
  const nnf = new Int32Array(b * h).fill(-1), dist = new Float32Array(b * h);
  const D = (p, q, grenze) => {   // SSD über den Flicken (Ränder abgeschnitten)
    const px = p % b, py = (p / b) | 0, qx = q % b, qy = (q / b) | 0; let s = 0;
    for (let dy = -R; dy <= R; dy++) { const Y = py + dy; if (Y < 0 || Y >= h) continue; const QY = qy + dy;
      for (let dx = -R; dx <= R; dx++) { const X = px + dx; if (X < 0 || X >= b) continue; const i = (Y * b + X) * 3, j = (QY * b + qx + dx) * 3;
        const a = img[i] - img[j], c = img[i + 1] - img[j + 1], e = img[i + 2] - img[j + 2]; s += a * a + c * c + e * e; }
      if (s > grenze) return s; }
    return s;
  };
  for (const p of ziele) { let q = nnfAlt?.[p] ?? -1; if (q < 0 || !gueltig[q]) q = quellen[(rnd() * quellen.length) | 0]; nnf[p] = q; dist[p] = D(p, q, Infinity); }
  const versuche = (p, q) => { if (q < 0 || !gueltig[q] || q === nnf[p]) return; const d = D(p, q, dist[p]); if (d < dist[p]) { dist[p] = d; nnf[p] = q; } };
  const neu = new Float32Array(img.length);
  for (let it = 0; it < iterationen; it++) {
    const vor = it % 2 === 0, reihe = vor ? ziele : ziele.slice().reverse(), s = vor ? 1 : -1;
    for (const p of reihe) {
      const x = p % b, y = (p / b) | 0;
      // Fortpflanzung: Versatz des Nachbarn übernehmen
      if (x - s >= 0 && x - s < b && nnf[p - s] >= 0) { const q = nnf[p - s] + s; if (((q % b) - x) === ((nnf[p - s] % b) - (x - s))) versuche(p, q); }
      if (y - s >= 0 && y - s < h && nnf[p - s * b] >= 0) versuche(p, nnf[p - s * b] + s * b);
      // Zufallssuche mit halbiertem Radius
      const qx = nnf[p] % b, qy = (nnf[p] / b) | 0;
      for (let rad = Math.max(b, h); rad >= 1; rad >>= 1) { const X = Math.round(qx + (rnd() * 2 - 1) * rad), Y = Math.round(qy + (rnd() * 2 - 1) * rad); if (X >= R && Y >= R && X < b - R && Y < h - R) versuche(p, Y * b + X); }
    }
    // Abstimmung: jedes Loch-Pixel = gewichtetes Mittel aller überdeckenden Flicken
    neu.fill(0); const gew = new Float32Array(b * h);
    const sig = (() => { const ds = ziele.map((p) => dist[p]).sort((a, c) => a - c); return Math.max(1e-6, ds[(ds.length * 0.75) | 0] || 1); })();
    for (const p of ziele) {
      const px = p % b, py = (p / b) | 0, qx2 = nnf[p] % b, qy2 = (nnf[p] / b) | 0, w = Math.exp(-dist[p] / (2 * sig));
      for (let dy = -R; dy <= R; dy++) { const Y = py + dy; if (Y < 0 || Y >= h) continue;
        for (let dx = -R; dx <= R; dx++) { const X = px + dx; if (X < 0 || X >= b) continue; const i = Y * b + X; if (!loch[i]) continue;
          const j = ((qy2 + dy) * b + qx2 + dx) * 3; neu[i * 3] += w * img[j]; neu[i * 3 + 1] += w * img[j + 1]; neu[i * 3 + 2] += w * img[j + 2]; gew[i] += w; } }
    }
    for (let i = 0; i < b * h; i++) if (loch[i] && gew[i] > 0) { img[i * 3] = neu[i * 3] / gew[i]; img[i * 3 + 1] = neu[i * 3 + 1] / gew[i]; img[i * 3 + 2] = neu[i * 3 + 2] / gew[i]; }
  }
  return nnf;
}
/** Rückfall ohne Modell: Flicken-Suche. bild BildU8 RGBA, maske 255 = füllen. */
export function flickenSuche(bild, maske, opts = {}) {
  const iterationen = opts.iterationen ?? 5, stufen = opts.stufen ?? 4, R = opts.radius ?? 3, rnd = zufall(opts.saat ?? 7);
  const { b, h } = bild, n = b * h, img = new Float32Array(n * 3), loch = new Uint8Array(n);
  for (let i = 0; i < n; i++) { for (let k = 0; k < 3; k++) img[i * 3 + k] = bild.daten[i * 4 + k]; loch[i] = maske.daten[i] >= 128 ? 1 : 0; }
  const pyr = [{ img, loch, b, h }];
  while (pyr.length < stufen && Math.min(pyr[pyr.length - 1].b, pyr[pyr.length - 1].h) > 48) { const p = pyr[pyr.length - 1]; pyr.push(halb(p.img, p.loch, p.b, p.h)); }
  let nnf = null, vorher = null;
  for (let s = pyr.length - 1; s >= 0; s--) {
    const p = pyr[s];
    if (!vorher) zwiebel(p.img, p.loch, p.b, p.h);
    else {   // grobe Lösung hochziehen (bilinear) + Versatzfeld verdoppeln
      for (let y = 0; y < p.h; y++) for (let x = 0; x < p.b; x++) { const i = y * p.b + x; if (!p.loch[i]) continue;
        const sx = Math.min(vorher.b - 1, Math.max(0, (x + 0.5) / 2 - 0.5)), sy = Math.min(vorher.h - 1, Math.max(0, (y + 0.5) / 2 - 0.5)), x0 = Math.floor(sx), y0 = Math.floor(sy), x1 = Math.min(vorher.b - 1, x0 + 1), y1 = Math.min(vorher.h - 1, y0 + 1), wx = sx - x0, wy = sy - y0;
        for (let k = 0; k < 3; k++) { const v = (q) => vorher.img[q * 3 + k]; p.img[i * 3 + k] = (v(y0 * vorher.b + x0) * (1 - wx) + v(y0 * vorher.b + x1) * wx) * (1 - wy) + (v(y1 * vorher.b + x0) * (1 - wx) + v(y1 * vorher.b + x1) * wx) * wy; } }
      if (nnf) { const alt = new Int32Array(p.b * p.h).fill(-1);
        for (let y = 0; y < p.h; y++) for (let x = 0; x < p.b; x++) { const q = nnf[Math.min(vorher.h - 1, y >> 1) * vorher.b + Math.min(vorher.b - 1, x >> 1)]; if (q < 0) continue;
          const qx = Math.min(p.b - 1, (q % vorher.b) * 2 + (x & 1)), qy = Math.min(p.h - 1, ((q / vorher.b) | 0) * 2 + (y & 1)); alt[y * p.b + x] = qy * p.b + qx; }
        nnf = alt; }
    }
    nnf = stufeFuellen(p.img, p.loch, p.b, p.h, R, s === 0 ? iterationen : iterationen + 2, rnd, nnf) || nnf;
    vorher = p;
  }
  const aus = new Uint8ClampedArray(n * 4);
  for (let i = 0; i < n; i++) { for (let k = 0; k < 3; k++) aus[i * 4 + k] = loch[i] ? img[i * 3 + k] : bild.daten[i * 4 + k]; aus[i * 4 + 3] = 255; }
  return { b, h, daten: aus, farbraum: bild.farbraum };
}

// ================================================================ Einblenden (rein, Worker)
function kastenF(src, b, h, r) {
  const t = new Float32Array(b * h), o = new Float32Array(b * h); if (r < 1) { o.set(src); return o; }
  for (let y = 0; y < h; y++) { let s = 0, n = 0; const z = y * b; for (let x = -r; x < b; x++) { if (x + r < b) { s += src[z + x + r]; n++; } if (x - r - 1 >= 0) { s -= src[z + x - r - 1]; n--; } if (x >= 0) t[z + x] = s / n; } }
  for (let x = 0; x < b; x++) { let s = 0, n = 0; for (let y = -r; y < h; y++) { if (y + r < h) { s += t[(y + r) * b + x]; n++; } if (y - r - 1 >= 0) { s -= t[(y - r - 1) * b + x]; n--; } if (y >= 0) o[y * b + x] = s / n; } }
  return o;
}
/** Weiche Deckung: Loch sicher voll, nach außen ausgeblendet (rand px). */
export function federMaske(maske, rand) {
  const { b, h } = maske, n = b * h, r = Math.max(1, Math.round(rand / 2));
  let f = new Float32Array(n); for (let i = 0; i < n; i++) f[i] = maske.daten[i] >= 128 ? 1 : 0;
  // dilatieren um r (über Kastenfilter > 0), dann weich um r
  const d = kastenF(f, b, h, r); for (let i = 0; i < n; i++) d[i] = d[i] > 1e-4 ? 1 : 0;
  f = kastenF(kastenF(d, b, h, r), b, h, Math.max(1, r >> 1));
  for (let i = 0; i < n; i++) if (maske.daten[i] >= 128) f[i] = 1;
  return f;
}
/** Differenz-Feld vom Rand ins Loch ausbreiten (Push-Pull, glatt) → Farbe/Helligkeit passen nahtlos. */
function ausbreiten(wert, bekannt, b, h) {
  const stufen = [{ w: wert, k: bekannt, b, h }];
  while (Math.max(stufen[stufen.length - 1].b, stufen[stufen.length - 1].h) > 2) {
    const s = stufen[stufen.length - 1], B = Math.ceil(s.b / 2), H = Math.ceil(s.h / 2), w = new Float32Array(B * H), k = new Float32Array(B * H);
    for (let y = 0; y < s.h; y++) for (let x = 0; x < s.b; x++) { const i = y * s.b + x, j = (y >> 1) * B + (x >> 1); w[j] += s.w[i] * s.k[i]; k[j] += s.k[i]; }
    for (let j = 0; j < B * H; j++) if (k[j] > 0) { w[j] /= k[j]; k[j] = Math.min(1, k[j]); }
    stufen.push({ w, k, b: B, h: H });
  }
  for (let s = stufen.length - 2; s >= 0; s--) {
    const f = stufen[s], g = stufen[s + 1];
    for (let y = 0; y < f.h; y++) for (let x = 0; x < f.b; x++) { const i = y * f.b + x; if (f.k[i] >= 1) continue;
      const sx = Math.min(g.b - 1, Math.max(0, (x + 0.5) / 2 - 0.5)), sy = Math.min(g.h - 1, Math.max(0, (y + 0.5) / 2 - 0.5)), x0 = Math.floor(sx), y0 = Math.floor(sy), x1 = Math.min(g.b - 1, x0 + 1), y1 = Math.min(g.h - 1, y0 + 1), wx = sx - x0, wy = sy - y0;
      const v = (g.w[y0 * g.b + x0] * (1 - wx) + g.w[y0 * g.b + x1] * wx) * (1 - wy) + (g.w[y1 * g.b + x0] * (1 - wx) + g.w[y1 * g.b + x1] * wx) * wy;
      f.w[i] = f.w[i] * f.k[i] + v * (1 - f.k[i]); }
  }
  return stufen[0].w;
}
/**
 * Gefüllt in die Maske einblenden: Rand-Differenz (Original − Füllung) glatt ins Loch ausgebreitet, Korn angeglichen.
 * opts: { rand?: px (Std 1,2 % der kurzen Seite, ≥ 2), korn?: true, nurFuellung?: false (true → RGBA mit A = Deckung, für Flicken) }
 */
export function einblenden(original, gefuellt, maske, opts = {}) {
  const { b, h } = original, n = b * h, rand = opts.rand ?? Math.max(2, Math.round(0.012 * Math.min(b, h)));
  const alpha = federMaske(maske, rand);
  // Ring: bekannt, nahe am Loch → dort ist die Differenz verlässlich
  const loch = new Float32Array(n); for (let i = 0; i < n; i++) loch[i] = maske.daten[i] >= 128 ? 1 : 0;
  const nah = kastenF(loch, b, h, Math.max(2, rand * 2));
  const bekannt = new Float32Array(n); for (let i = 0; i < n; i++) bekannt[i] = !loch[i] && nah[i] > 0 && alpha[i] < 1 ? 1 : 0;
  const korrektur = [0, 1, 2].map((k) => { const w = new Float32Array(n); for (let i = 0; i < n; i++) w[i] = bekannt[i] ? original.daten[i * 4 + k] - gefuellt.daten[i * 4 + k] : 0; return ausbreiten(w, bekannt, b, h); });
  // Korn: Hochpass-Streuung Ring (Original) vs. Loch (Füllung)
  let kornAdd = 0;
  if (opts.korn !== false) {
    const lum = (d) => { const l = new Float32Array(n); for (let i = 0; i < n; i++) l[i] = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]; return l; };
    const lo = lum(original.daten), lf = lum(gefuellt.daten), mo = kastenF(lo, b, h, 1), mf = kastenF(lf, b, h, 1);
    // robust (Median der Abweichung): Kanten/Fugen der Textur zählen nicht als Rauschen
    const ro = [], rf = [];
    for (let i = 0; i < n; i++) { if (bekannt[i]) ro.push(Math.abs(lo[i] - mo[i])); else if (loch[i]) rf.push(Math.abs(lf[i] - mf[i])); }
    const med = (a) => { if (!a.length) return 0; a.sort((x, y) => x - y); return a[a.length >> 1] * 1.4826 * 1.12; };
    const so = med(ro), sf = med(rf); kornAdd = Math.sqrt(Math.max(0, so * so - sf * sf));
  }
  const rnd = zufall(opts.saat ?? 11), gauss = () => { let s = 0; for (let k = 0; k < 4; k++) s += rnd(); return (s - 2) * 1.732; };
  const aus = new Uint8ClampedArray(n * 4);
  for (let i = 0; i < n; i++) {
    const a = alpha[i], g = a > 0 && kornAdd > 0 ? gauss() * kornAdd * a : 0;
    for (let k = 0; k < 3; k++) {
      const f = gefuellt.daten[i * 4 + k] + korrektur[k][i] + g;
      aus[i * 4 + k] = opts.nurFuellung ? f : original.daten[i * 4 + k] * (1 - a) + f * a;
    }
    aus[i * 4 + 3] = opts.nurFuellung ? a * 255 + 0.5 : 255;
  }
  return { b, h, daten: aus, farbraum: original.farbraum };
}

// ================================================================ Füllen (Modell oder Rückfall)
/** bild/maske in Modellgröße (512²). opts: { qualitaet: 'schnell'|'hoch', rechnen?: RpcKanal (Rückfall im Worker), nurRueckfall? } */
export async function fuelle(ki, bild, maske, opts = {}) {
  if (!opts.nurRueckfall && ki) {
    try {
      const k = { b: bild.b, h: bild.h, daten: bild.daten.slice() }, m = { b: maske.b, h: maske.h, daten: maske.daten.slice() };
      return await ki.rufe('fuellen', { bild: k, maske: m, qualitaet: opts.qualitaet || 'schnell' }, { transfer: [k.daten.buffer, m.daten.buffer], signal: opts.signal });
    } catch (e) { if (e?.code === FEHLER.ABBRUCH) throw e; opts.onRueckfall?.(e); }
  }
  const erg = opts.rechnen ? await opts.rechnen.rufe('flickensuche', { bild, maske, opts: {} }, { signal: opts.signal }) : flickenSuche(bild, maske);
  return { bild: erg, verfahren: 'flickensuche' };
}

// ================================================================ Flicken-Speicher + Shader-Stufe
const FLICKEN = new Map();   // rasterId -> BildU8 (RGBA, A = Deckung), synchron für die Stufe
const GL_TEX = new WeakMap();   // gl -> Map(rasterId -> WebGLTexture)
let flickenLader = null, nachLaden = null;
const fehlt = new Set();
/** Für Neustart/Wiederherstellen: Lader für Flicken-Raster (app.raster.hole) + Rückruf zum Neuzeichnen. */
export function setzeFlickenLader(hole, neuZeichnen) { flickenLader = hole; nachLaden = neuZeichnen; }
export function merkeFlicken(rasterId, bild) { FLICKEN.set(rasterId, bild); fehlt.delete(rasterId); }

const FS_RETUSCHE = `#version 300 es
precision highp float;
uniform sampler2D ein; uniform sampler2D fl; uniform vec4 reg; uniform vec4 rect;
out vec4 farbe;
void main(){
  vec2 uv = gl_FragCoord.xy / vec2(textureSize(ein, 0));
  vec4 e = texture(ein, uv);
  vec2 q = (reg.xy + uv * reg.zw - rect.xy) / rect.zw;
  if (q.x < 0.0 || q.y < 0.0 || q.x > 1.0 || q.y > 1.0) { farbe = e; return; }
  vec4 f = texture(fl, q);
  farbe = vec4(mix(e.rgb, f.rgb, f.a), e.a);
}`;
function glTextur(gl, id, bild) {
  let m = GL_TEX.get(gl); if (!m) { m = new Map(); GL_TEX.set(gl, m); }
  if (m.has(id)) return m.get(id);
  const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false); gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
  const d = bild.daten instanceof Uint8Array ? bild.daten : new Uint8Array(bild.daten.buffer, bild.daten.byteOffset, bild.daten.byteLength);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.SRGB8_ALPHA8, bild.b, bild.h, 0, gl.RGBA, gl.UNSIGNED_BYTE, d);   // sRGB → beim Abtasten linear
  for (const [p, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, p, v);
  gl.bindTexture(gl.TEXTURE_2D, null); m.set(id, t); return t;
}
/** Stufe für Flicken-Schritte. arten erweiterbar (hoch.js kann 'auffrischen' mitnutzen, gleicher Flicken-Aufbau). */
export function flickenStufe(arten = [ART.ENTFERNEN], name = 'retusche') {
  return {
    name, stufe: STUFE.RETUSCHE, arten, mischtSelbst: false,
    aktiv: (s) => !!s.params?.flicken?.rasterId,
    rand: () => 0,
    rendere(ctx, ein, s) {
      const f = s.params.flicken, bild = FLICKEN.get(f.rasterId), qb = f.quelle?.b, qh = f.quelle?.h;
      if (!bild || !qb) { if (flickenLader && !fehlt.has(f.rasterId)) { fehlt.add(f.rasterId); flickenLader(f.rasterId).then((d) => { if (d) { merkeFlicken(f.rasterId, d); nachLaden?.(); } }).catch(() => {}); } return ein; }
      const r = ctx.region, rect = [f.px.x / qb, f.px.y / qh, f.px.b / qb, f.px.h / qh];
      if (rect[0] > r.x + r.b || rect[1] > r.y + r.h || rect[0] + rect[2] < r.x || rect[1] + rect[3] < r.y) return ein;
      const t = { tex: glTextur(ctx.gl, f.rasterId, bild), b: bild.b, h: bild.h, format: 'srgb8' };
      return ctx.pass(ctx.programm('retusche-flicken', FS_RETUSCHE), { reg: [r.x, r.y, r.b, r.h], rect }, { ein, fl: t });
    },
  };
}
export const STUFEN = Object.freeze([flickenStufe()]);

// ================================================================ Ganzer Ablauf (Haupt-Faden)
const leinwand = (b, h) => (typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(b, h) : Object.assign(document.createElement('canvas'), { width: b, height: h }));
function ausBitmap(bmp, px, b, h) {
  const c = leinwand(b, h), x = c.getContext('2d', { willReadFrequently: true }); x.imageSmoothingQuality = 'high';
  x.drawImage(bmp, px.x, px.y, px.b, px.h, 0, 0, b, h); const d = x.getImageData(0, 0, b, h); return { b, h, daten: d.data };
}
function skaliereBild(bild, b, h) {
  const c = leinwand(bild.b, bild.h); c.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(bild.daten), bild.b, bild.h), 0, 0);
  const z = leinwand(b, h), x = z.getContext('2d', { willReadFrequently: true }); x.imageSmoothingQuality = 'high'; x.drawImage(c, 0, 0, b, h);
  return { b, h, daten: x.getImageData(0, 0, b, h).data };
}
/** Maske (Arbeitsauflösung, Quell-Koordinaten) → Ausschnitt px in Größe b×h, binär + dilatiert (Objektkante/Schatten-Saum). */
function maskeAusschnitt(maske, q, px, b, h, dilatPx) {
  const sx = maske.b / q.b, sy = maske.h / q.h, d = new Uint8Array(b * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) {
    const mx = Math.min(maske.b - 1, Math.floor((px.x + ((x + 0.5) / b) * px.b) * sx)), my = Math.min(maske.h - 1, Math.floor((px.y + ((y + 0.5) / h) * px.h) * sy));
    d[y * b + x] = maske.daten[my * maske.b + mx] > 64 ? 255 : 0;
  }
  if (dilatPx < 1) return { b, h, daten: d };
  const f = Float32Array.from(d, (v) => v / 255), k = kastenF(f, b, h, dilatPx); for (let i = 0; i < d.length; i++) d[i] = k[i] > 1e-4 ? 255 : 0;
  return { b, h, daten: d };
}
/** Bestehende Entfernen-Flicken auf einen Ausschnitt legen (damit der neue Flicken auf dem schon retuschierten Bild aufsetzt). */
function legeFlickenAuf(bild, px, schritte) {
  for (const s of schritte || []) {
    const f = s.an !== false && s.art === ART.ENTFERNEN && s.params?.flicken; if (!f) continue; const fl = FLICKEN.get(f.rasterId); if (!fl) continue;
    const x0 = Math.max(px.x, f.px.x), y0 = Math.max(px.y, f.px.y), x1 = Math.min(px.x + px.b, f.px.x + f.px.b), y1 = Math.min(px.y + px.h, f.px.y + f.px.h);
    if (x1 <= x0 || y1 <= y0) continue;
    const sx = bild.b / px.b, sy = bild.h / px.h, fx = fl.b / f.px.b, fy = fl.h / f.px.h;
    for (let y = Math.floor((y0 - px.y) * sy); y < Math.ceil((y1 - px.y) * sy); y++) for (let x = Math.floor((x0 - px.x) * sx); x < Math.ceil((x1 - px.x) * sx); x++) {
      const qx = px.x + (x + 0.5) / sx, qy = px.y + (y + 0.5) / sy, u = Math.floor((qx - f.px.x) * fx), v = Math.floor((qy - f.px.y) * fy);
      if (u < 0 || v < 0 || u >= fl.b || v >= fl.h || x < 0 || y < 0 || x >= bild.b || y >= bild.h) continue;
      const i = (y * bild.b + x) * 4, j = (v * fl.b + u) * 4, a = fl.daten[j + 3] / 255;
      for (let k = 0; k < 3; k++) bild.daten[i + k] = bild.daten[i + k] * (1 - a) + fl.daten[j + k] * a;
    }
  }
  return bild;
}

/** Ganzer Ablauf → Schritt 'entfernen' mit Flicken (Raster in app.raster). opts: { qualitaet, ohneModell, signal, onFortschritt } */
export async function entferne(app, maske, opts = {}) {
  const doc = app.zustand().doc; if (!doc) throw new BildwerkFehler(FEHLER.UNBEKANNT, 'Kein Bild');
  const q = doc.quelle, melde = opts.onFortschritt || (() => {}), t0 = performance.now();
  app.pipeline.registriereStufen?.(STUFEN); setzeFlickenLader((id) => app.raster.hole(id), () => app.neuZeichnen?.());
  const K = 512, { px } = waehleAusschnitt(maske, q.b, q.h, { modellKante: K });
  const bmp = app.quelleBitmap(); if (!bmp) throw new BildwerkFehler(FEHLER.UNBEKANNT, 'Quelle fehlt');
  melde(0.1, 'Ausschnitt');
  const voll = legeFlickenAuf(ausBitmap(bmp, px, px.b, px.h), px, doc.schritte);
  const klein = px.b === K ? { b: K, h: K, daten: Uint8ClampedArray.from(voll.daten) } : skaliereBild(voll, K, K);
  const m512 = maskeAusschnitt(maske, q, px, K, K, Math.max(2, Math.round(K * 0.008)));
  melde(0.25, 'Füllen');
  let rueckfall = null;
  const { bild: gefuellt, verfahren } = await fuelle(opts.ohneModell ? null : app.ki, klein, m512, { qualitaet: opts.qualitaet, rechnen: app.rechnen, signal: opts.signal, onRueckfall: (e) => { rueckfall = e; } });
  melde(0.75, 'Einblenden');
  const gross = px.b === K ? gefuellt : skaliereBild(gefuellt, px.b, px.h);
  const mVoll = maskeAusschnitt(maske, q, px, px.b, px.h, Math.max(2, Math.round(px.b * 0.008)));
  const rand = Math.max(2, Math.round(px.b * 0.012));
  const flicken = app.rechnen ? await app.rechnen.rufe('einblenden', { original: voll, gefuellt: gross, maske: mVoll, opts: { rand, nurFuellung: true } }).catch(() => einblenden(voll, gross, mVoll, { rand, nurFuellung: true }))
    : einblenden(voll, gross, mVoll, { rand, nurFuellung: true });
  const rasterId = await app.raster.lege(flicken, 'flicken');
  merkeFlicken(rasterId, flicken);
  const f = { id: neueId('flicken'), art: 'entfernen', px, rasterId, maskeId: null, verfahren, erstellt: Date.now(), quelle: { b: q.b, h: q.h } };
  melde(1, 'Fertig');
  const s = neuerSchritt(ART.ENTFERNEN, { flicken: f }, { flickenId: f.id, name: 'Entfernen' });
  s._info = { dauerMs: Math.round(performance.now() - t0), rueckfall: rueckfall ? (rueckfall.text || String(rueckfall)) : null };
  return s;
}

// ================================================================ Bedienung (DOM)
const STIL = `.ef{display:flex;flex-direction:column;gap:8px;color:var(--text,#e8e6e1);font:14px/1.3 system-ui,-apple-system,sans-serif}
.ef .zeile{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.ef label{display:flex;align-items:center;gap:8px;min-height:44px;flex:1}
.ef input[type=range]{flex:1;min-height:44px;accent-color:var(--akzent,#d9a441)}
.ef button{min-height:44px;min-width:44px;padding:0 12px;border-radius:10px;border:1px solid var(--linie,#33363c);background:var(--flaeche2,#202226);color:inherit;font:inherit}
.ef button[aria-pressed="true"]{border-color:var(--akzent,#d9a441);color:var(--akzent,#d9a441)}
.ef .status{color:var(--leise,#9a9890);font-size:13px;min-height:18px}.ef .balken{height:4px;background:var(--linie,#33363c);border-radius:2px;overflow:hidden}.ef .balken i{display:block;height:100%;width:0;background:var(--akzent,#d9a441)}
.ef-ueber{position:absolute;inset:0;pointer-events:none}`;
export function entfernenUI(container, opts) {
  const { app } = opts, doc = container.ownerDocument;
  if (!doc.getElementById('ef-stil')) { const s = doc.createElement('style'); s.id = 'ef-stil'; s.textContent = STIL; doc.head.appendChild(s); }
  app.pipeline.registriereStufen?.(STUFEN); setzeFlickenLader((id) => app.raster.hole(id), () => app.neuZeichnen?.());
  const st = { groesse: 0.04, modell: null, laeuft: false };
  const el = doc.createElement('div'); el.className = 'ef';
  el.innerHTML = `<div class="zeile"><label>Pinselgröße <input type="range" min="1" max="15" value="4" data-r="groesse"></label></div>
<div class="zeile"><button data-a="modell" aria-pressed="false">Füll-Modell</button><button data-a="ohne" aria-pressed="false">Ohne Modell</button></div>
<div class="status" aria-live="polite">Über das Objekt malen. Loslassen füllt den Bereich.</div><div class="balken" hidden><i></i></div>`;
  container.appendChild(el);
  const statusEl = el.querySelector('.status'), balken = el.querySelector('.balken');
  const status = (t) => { statusEl.textContent = t; }, fortschritt = (f) => { balken.hidden = f == null || f >= 1; balken.firstElementChild.style.width = `${Math.round((f || 0) * 100)}%`; };
  const modusAnzeigen = () => { el.querySelector('[data-a="modell"]').setAttribute('aria-pressed', String(st.modell === true)); el.querySelector('[data-a="ohne"]').setAttribute('aria-pressed', String(st.modell === false)); };
  app.ki.rufe('status', {}).then((s) => { if (st.modell == null && s.ids?.fuellen?.imCache) { st.modell = true; modusAnzeigen(); } }).catch(() => {});
  el.querySelector('[data-r="groesse"]').addEventListener('input', (e) => { st.groesse = e.target.value / 100; });
  el.addEventListener('click', (e) => {
    const a = e.target.closest('[data-a]')?.dataset.a; if (!a) return;
    if (a === 'ohne') { st.modell = false; modusAnzeigen(); status('Ohne Modell: Flicken-Suche (schnell, bei Strukturen schwächer).'); }
    if (a === 'modell') frageModell().then(() => modusAnzeigen());
  });
  async function frageModell() {
    const s = await app.ki.rufe('status', {}).catch(() => null);
    if (s?.ids?.fuellen?.imCache) { st.modell = true; return true; }
    const M = await import('./modelle.js');
    return new Promise((ok) => { const h = app.blatt('Füll-Modell laden', (c) => M.modellUI(c, { ids: ['fuellen'], ki: app.ki, hinweis: 'Füll-Modell laden? Danach geht es offline.', onFertig: (g) => { st.modell = !!g; h.schliesse(); ok(g); } })); });
  }
  // Malen
  app.tippModus = true;
  const flaeche = app.bildflaeche, ueber = doc.createElement('canvas'); ueber.className = 'ef-ueber';
  if (flaeche) { if (getComputedStyle(flaeche).position === 'static') flaeche.style.position = 'relative'; flaeche.appendChild(ueber); }
  let zug = null;
  const zeichne = () => {
    const r = flaeche.getBoundingClientRect(), dpr = devicePixelRatio || 1; ueber.width = r.width * dpr; ueber.height = r.height * dpr; ueber.style.width = r.width + 'px'; ueber.style.height = r.height + 'px';
    const c = ueber.getContext('2d'); c.clearRect(0, 0, ueber.width, ueber.height); if (!zug) return; c.scale(dpr, dpr);
    c.strokeStyle = 'rgba(255,77,77,0.45)'; c.lineCap = c.lineJoin = 'round'; c.lineWidth = zug.breite; c.beginPath(); zug.css.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); if (zug.css.length === 1) c.lineTo(zug.css[0][0] + 0.1, zug.css[0][1]); c.stroke();
  };
  const runter = (e) => { if (st.laeuft || !app.zustand().doc) return; const r = flaeche.getBoundingClientRect(), a = app.ansicht();
    const breite = Math.max(8, st.groesse * Math.min(r.width, r.height) * 2 * (a.zoom || 1)); zug = { id: e.pointerId, css: [[e.clientX - r.left, e.clientY - r.top]], breite }; requestAnimationFrame(zeichne); };
  const bewegt = (e) => { if (!zug || e.pointerId !== zug.id) return; const r = flaeche.getBoundingClientRect(); zug.css.push([e.clientX - r.left, e.clientY - r.top]); requestAnimationFrame(zeichne); };
  const hoch = (e) => { if (!zug || e.pointerId !== zug.id) return; const z = zug; zug = null; ausfuehren(z).catch((err) => { st.laeuft = false; fortschritt(null); zeichne(); status(err.text || err.message || String(err)); }); };
  async function ausfuehren(z) {
    if (st.modell == null) { await frageModell(); modusAnzeigen(); }
    st.laeuft = true; status('Wird gefüllt …'); fortschritt(0.05);
    const d = app.zustand().doc, q = app.pipeline.quelleGroesse?.() || { arbeitB: d.quelle.b, arbeitH: d.quelle.h };
    const Z = await import('./zuschnitt.js'), A = await import('./auswahl.js'), a = app.ansicht(), r = flaeche.getBoundingClientRect();
    const pts = z.css.filter((_, i) => i % Math.max(1, Math.floor(z.css.length / 300)) === 0).map(([x, y]) => Z.bildschirmZuQuelle({ x, y }, a, d.geometrie, d.quelle.b, d.quelle.h));
    // Pinselbreite (CSS) → Anteil der kurzen Quellseite über zwei Nachbarpunkte am Schirm
    const p0 = Z.bildschirmZuQuelle({ x: r.width / 2, y: r.height / 2 }, a, d.geometrie, d.quelle.b, d.quelle.h), p1 = Z.bildschirmZuQuelle({ x: r.width / 2 + z.breite / 2, y: r.height / 2 }, a, d.geometrie, d.quelle.b, d.quelle.h);
    const rad = Math.hypot((p1.x - p0.x) * d.quelle.b, (p1.y - p0.y) * d.quelle.h) / Math.min(d.quelle.b, d.quelle.h);
    const maske = A.pinsel(null, q.arbeitB, q.arbeitH, [{ punkte: pts, radiusAnteil: rad, haerte: 0.9 }]);
    const s = await entferne(app, maske, { ohneModell: st.modell === false, onFortschritt: (f) => fortschritt(f) });
    app.aendere((dd) => { dd.schritte.push(s); return dd; }, { name: 'Entfernen' });
    st.laeuft = false; fortschritt(null); zeichne();
    status(s.params.flicken.verfahren === 'flickensuche' ? `Gefüllt ohne Modell (Flicken-Suche, ${s._info.dauerMs} ms).` : `Gefüllt (${s._info.dauerMs} ms).`);
  }
  if (flaeche) { flaeche.addEventListener('pointerdown', runter); flaeche.addEventListener('pointermove', bewegt); flaeche.addEventListener('pointerup', hoch); flaeche.addEventListener('pointercancel', hoch); }
  return {
    setze() {},
    zerstoere() { app.tippModus = false; if (flaeche) { flaeche.removeEventListener('pointerdown', runter); flaeche.removeEventListener('pointermove', bewegt); flaeche.removeEventListener('pointerup', hoch); flaeche.removeEventListener('pointercancel', hoch); } ueber.remove(); el.remove(); },
  };
}
