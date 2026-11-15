// Bildwerk – Analyse „Was braucht das Bild?“ (Modul analyse). Rein, läuft im Worker. Signaturen FEST (ARCH.md §4.4).
// Kein DOM. Alle Eingaben BildF32 (linear). „kodiert“ = sRGB-Kennlinie (Wahrnehmungsraum), auch für P3-Quellen.
import { ANALYSE_KANTE, ART, neuerSchritt, neueId } from './typen.js';
import { wbAusGains, okLab, autoTonVorbereiten } from './regler.js';
export { autoTonVorbereiten };

// ---------------------------------------------------------------- Grundlagen
const GEWICHTE = { srgb: [0.2126, 0.7152, 0.0722], 'display-p3': [0.2290, 0.6917, 0.0793] };
const klemme = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const glatt = (a, b, x) => { const t = klemme((x - a) / (b - a)); return t * t * (3 - 2 * t); };
export const kodiere = (v) => (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055);
export const linear = (v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
const KOD_N = 4096; const KOD_LUT = new Float32Array(KOD_N + 1);
for (let i = 0; i <= KOD_N; i++) KOD_LUT[i] = kodiere(i / KOD_N);
/** schnelle Kodierung (linear → sRGB-Kennlinie), Werte außerhalb 0..1 werden begrenzt */
function kod(v) { if (v <= 0) return 0; if (v >= 1) return 1; const f = v * KOD_N, i = f | 0; return KOD_LUT[i] + (KOD_LUT[i + 1] - KOD_LUT[i]) * (f - i); }

/** Bild in Ebenen zerlegen, optional auf lange Seite maxKante verkleinern (Kastenmittel). */
function vorbereite(bild, maxKante = ANALYSE_KANTE) {
  const k = bild.kanaele || 4, lang = Math.max(bild.b, bild.h);
  const f = lang > maxKante ? Math.ceil(lang / maxKante) : 1;
  const b = Math.floor(bild.b / f), h = Math.floor(bild.h / f), n = b * h, d = bild.daten;
  const r = new Float32Array(n), g = new Float32Array(n), bl = new Float32Array(n);
  if (f === 1) for (let i = 0; i < n; i++) { r[i] = d[i * k]; g[i] = d[i * k + 1]; bl[i] = d[i * k + 2]; }
  else {
    const inv = 1 / (f * f);
    for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) {
      let sr = 0, sg = 0, sb = 0;
      for (let dy = 0; dy < f; dy++) { let j = ((y * f + dy) * bild.b + x * f) * k; for (let dx = 0; dx < f; dx++, j += k) { sr += d[j]; sg += d[j + 1]; sb += d[j + 2]; } }
      const i = y * b + x; r[i] = sr * inv; g[i] = sg * inv; bl[i] = sb * inv;
    }
  }
  const w = GEWICHTE[bild.farbraum] || GEWICHTE.srgb, Y = new Float32Array(n), le = new Float32Array(n);
  for (let i = 0; i < n; i++) { Y[i] = w[0] * r[i] + w[1] * g[i] + w[2] * bl[i]; le[i] = w[0] * kod(r[i]) + w[1] * kod(g[i]) + w[2] * kod(bl[i]); }
  return { b, h, n, r, g, bl, Y, le, w, farbraum: bild.farbraum || 'srgb', faktor: f };
}

/** Gültigkeits-Maske: innerhalb des Inhalts (ohne schwarze Ränder). */
function gueltig(p, raender) {
  const m = new Uint8Array(p.n).fill(1); const r = raender?.rechteck || raender;
  if (!r || !(r.b > 0)) return m;
  const x0 = Math.round(r.x * p.b), y0 = Math.round(r.y * p.h), x1 = Math.round((r.x + r.b) * p.b), y1 = Math.round((r.y + r.h) * p.h);
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.b; x++) if (x < x0 || x >= x1 || y < y0 || y >= y1) m[y * p.b + x] = 0;
  return m;
}
const geclippt = (p, i) => p.r[i] > 0.995 || p.g[i] > 0.995 || p.bl[i] > 0.995;
/** Reines Weiß ohne Zeichnung: ALLE Kanäle voll (ein einzelner voller Kanal, z. B. bei Rotstich, ist kein ausgefressenes Weiß). */
const weissGeclippt = (p, i) => p.r[i] > 0.995 && p.g[i] > 0.995 && p.bl[i] > 0.995;
/** linear sRGB → CIELAB (D65) */
function cieLab(r, g, b) {
  const X = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047, Y = 0.2126 * r + 0.7152 * g + 0.0722 * b, Z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883;
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116), fx = f(X), fy = f(Y), fz = f(Z);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}
/** ΔE2000 */
export function deltaE2000([L1, a1, b1], [L2, a2, b2]) {
  const rad = Math.PI / 180, C1 = Math.hypot(a1, b1), C2 = Math.hypot(a2, b2), Cm = (C1 + C2) / 2, G = 0.5 * (1 - Math.sqrt(Cm ** 7 / (Cm ** 7 + 25 ** 7)));
  const a1p = a1 * (1 + G), a2p = a2 * (1 + G), C1p = Math.hypot(a1p, b1), C2p = Math.hypot(a2p, b2);
  const h1p = (Math.atan2(b1, a1p) / rad + 360) % 360, h2p = (Math.atan2(b2, a2p) / rad + 360) % 360;
  const dL = L2 - L1, dC = C2p - C1p; let dh = h2p - h1p; if (C1p * C2p === 0) dh = 0; else if (dh > 180) dh -= 360; else if (dh < -180) dh += 360;
  const dH = 2 * Math.sqrt(C1p * C2p) * Math.sin((dh * rad) / 2), Lm = (L1 + L2) / 2, Cmp = (C1p + C2p) / 2;
  let hm = h1p + h2p; if (C1p * C2p !== 0) { if (Math.abs(h1p - h2p) > 180) hm += h1p + h2p < 360 ? 360 : -360; hm /= 2; }
  const T = 1 - 0.17 * Math.cos((hm - 30) * rad) + 0.24 * Math.cos(2 * hm * rad) + 0.32 * Math.cos((3 * hm + 6) * rad) - 0.2 * Math.cos((4 * hm - 63) * rad);
  const dTh = 30 * Math.exp(-(((hm - 275) / 25) ** 2)), RC = 2 * Math.sqrt(Cmp ** 7 / (Cmp ** 7 + 25 ** 7));
  const SL = 1 + (0.015 * (Lm - 50) ** 2) / Math.sqrt(20 + (Lm - 50) ** 2), SC = 1 + 0.045 * Cmp, SH = 1 + 0.015 * Cmp * T, RT = -Math.sin(2 * dTh * rad) * RC;
  return Math.sqrt((dL / SL) ** 2 + (dC / SC) ** 2 + (dH / SH) ** 2 + RT * (dC / SC) * (dH / SH));
}
/** Rauscharme Kopie der Ebenen (Gauß je Kanal) – damit Rauschen Weißabgleich/Belichtung nicht verschiebt. */
function geglaettet(p, sigma) {
  const r = gauss(p.r, p.b, p.h, sigma), g = gauss(p.g, p.b, p.h, sigma), bl = gauss(p.bl, p.b, p.h, sigma), Y = new Float32Array(p.n), le = new Float32Array(p.n), w = p.w;
  for (let i = 0; i < p.n; i++) { Y[i] = w[0] * r[i] + w[1] * g[i] + w[2] * bl[i]; le[i] = w[0] * kod(r[i]) + w[1] * kod(g[i]) + w[2] * kod(bl[i]); }
  return { ...p, r, g, bl, Y, le };
}
/** Einheitlicher Farbton (getönter Abzug, Himmel, Sepia): Farbton-Bündelung Rh und mittlere Chroma (OKLab ×100) der Mitteltöne. */
function toenungIntern(p, gm) {
  let sa = 0, sb = 0, sc = 0, z = 0; const st = Math.max(1, Math.floor(p.n / 60000));
  for (let i = 0; i < p.n; i += st) { if (!gm[i] || p.le[i] < 0.12 || p.le[i] > 0.92 || geclippt(p, i)) continue;
    const L = okLab(p.r[i], p.g[i], p.bl[i]); sa += L[1]; sb += L[2]; sc += Math.hypot(L[1], L[2]); z++; }
  if (!z || sc <= 0) return { rh: 0, chroma: 0, farbton: 0, einheitlich: false, blau: false };
  const rh = Math.hypot(sa, sb) / sc, chroma = (100 * sc) / z, farbton = (Math.atan2(sb, sa) * 180) / Math.PI;
  const einheitlich = rh >= 0.85 && chroma >= 0.8;
  return { rh, chroma, farbton, einheitlich, blau: einheitlich && farbton < -60 && farbton > -150 };
}

/** Quantile aus Werten 0..1 (Histogramm mit n Fächern). */
function quantilFkt(werte, maske, faecher = 4096) {
  const h = new Uint32Array(faecher); let n = 0;
  for (let i = 0; i < werte.length; i++) if (!maske || maske[i]) { h[Math.min(faecher - 1, Math.max(0, (werte[i] * faecher) | 0))]++; n++; }
  return (q) => { const ziel = q * n; let s = 0; for (let v = 0; v < faecher; v++) { s += h[v]; if (s >= ziel) return (v + 0.5) / faecher; } return 1; };
}

/** Kastenunschärfe, separabel, O(n), Rand = Wiederholung. */
function kasten(src, b, h, r, aus = new Float32Array(b * h)) {
  if (r < 1) { aus.set(src); return aus; }
  const tmp = new Float32Array(b * h), inv = 1 / (2 * r + 1);
  for (let y = 0; y < h; y++) {
    const o = y * b; let s = src[o] * (r + 1);
    for (let x = 1; x <= r; x++) s += src[o + Math.min(b - 1, x)];
    for (let x = 0; x < b; x++) { tmp[o + x] = s * inv; s += src[o + Math.min(b - 1, x + r + 1)] - src[o + Math.max(0, x - r)]; }
  }
  for (let x = 0; x < b; x++) {
    let s = tmp[x] * (r + 1);
    for (let y = 1; y <= r; y++) s += tmp[Math.min(h - 1, y) * b + x];
    for (let y = 0; y < h; y++) { aus[y * b + x] = s * inv; s += tmp[Math.min(h - 1, y + r + 1) * b + x] - tmp[Math.max(0, y - r) * b + x]; }
  }
  return aus;
}
/** Gauß-Näherung durch 3 Kästen. */
function gauss(src, b, h, sigma) {
  if (sigma < 0.5) return Float32Array.from(src);
  const r = Math.max(1, Math.round(Math.sqrt((12 * sigma * sigma) / 3 + 1) / 2 - 0.5));
  return kasten(kasten(kasten(src, b, h, r), b, h, r), b, h, r);
}
/** Minimum-Filter (Quadrat, Radius r), separabel. */
function minimum(src, b, h, r) {
  const tmp = new Float32Array(b * h), aus = new Float32Array(b * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) { let m = Infinity; for (let k = Math.max(0, x - r); k <= Math.min(b - 1, x + r); k++) { const v = src[y * b + k]; if (v < m) m = v; } tmp[y * b + x] = m; }
  for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) { let m = Infinity; for (let k = Math.max(0, y - r); k <= Math.min(h - 1, y + r); k++) { const v = tmp[k * b + x]; if (v < m) m = v; } aus[y * b + x] = m; }
  return aus;
}

// ---------------------------------------------------------------- Histogramme
/** @returns {{r:Uint32Array,g:Uint32Array,b:Uint32Array,l:Uint32Array,anzahl:number}} kodierte Werte */
export function histogramme(bild, opts = {}) {
  const F = opts.faecher || 256, k = bild.kanaele || 4, d = bild.daten, m = opts.maske;
  const w = GEWICHTE[bild.farbraum] || GEWICHTE.srgb;
  const H = { r: new Uint32Array(F), g: new Uint32Array(F), b: new Uint32Array(F), l: new Uint32Array(F), anzahl: 0 };
  const fx = m ? m.b / bild.b : 0, fy = m ? m.h / bild.h : 0, S = F - 1;
  for (let y = 0; y < bild.h; y++) {
    const my = m ? Math.min(m.h - 1, (y * fy) | 0) * m.b : 0;
    for (let x = 0; x < bild.b; x++) {
      if (m && m.daten[my + Math.min(m.b - 1, (x * fx) | 0)] < 128) continue;
      const j = (y * bild.b + x) * k, R = kod(d[j]), G = kod(d[j + 1]), B = kod(d[j + 2]);
      H.r[Math.round(R * S)]++; H.g[Math.round(G * S)]++; H.b[Math.round(B * S)]++; H.l[Math.round((w[0] * R + w[1] * G + w[2] * B) * S)]++; H.anzahl++;
    }
  }
  return H;
}

// ---------------------------------------------------------------- Punkte (Schwellenwert-Trick)
function oeffnung(bin, b, h) {   // 3×3 Erosion, dann Dilatation
  const e = new Uint8Array(b * h), o = new Uint8Array(b * h);
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < b - 1; x++) { let ok = 1; for (let dy = -1; dy <= 1 && ok; dy++) for (let dx = -1; dx <= 1; dx++) if (!bin[(y + dy) * b + x + dx]) { ok = 0; break; } e[y * b + x] = ok; }
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < b - 1; x++) { if (!e[y * b + x]) continue; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) o[(y + dy) * b + x + dx] = 1; }
  return o;
}
function punktAus(p, auswahl) {
  let sr = 0, sg = 0, sb = 0, sx = 0, sy = 0, n = 0;
  for (let i = 0; i < p.n; i++) if (auswahl[i]) { sr += p.r[i]; sg += p.g[i]; sb += p.bl[i]; sx += i % p.b; sy += (i / p.b) | 0; n++; }
  if (!n) return { rgb: [0.5, 0.5, 0.5], x: 0.5, y: 0.5, anteil: 0 };
  return { rgb: [sr / n, sg / n, sb / n], x: (sx / n + 0.5) / p.b, y: (sy / n + 0.5) / p.h, anteil: n / p.n };
}
function punkteIntern(p, gm, gi) {
  const ok = new Uint8Array(p.n); for (let i = 0; i < p.n; i++) ok[i] = gm[i] && !geclippt(p, i) ? 1 : 0;
  const q = quantilFkt(p.le, ok), q999 = q(0.999), q001 = q(0.001);
  const wb = new Uint8Array(p.n), sb = new Uint8Array(p.n);
  for (let i = 0; i < p.n; i++) { if (!ok[i]) continue; if (p.le[i] >= q999) wb[i] = 1; if (p.le[i] <= q001 && gm[i]) sb[i] = 1; }
  let wo = oeffnung(wb, p.b, p.h), so = oeffnung(sb, p.b, p.h);
  const zahl = (a) => { let n = 0; for (const v of a) n += v; return n; };
  if (zahl(wo) < p.n * 1e-4) wo = wb; if (zahl(so) < p.n * 1e-4) so = sb;   // Spitzlicht-Schutz nur, wenn genug Fläche bleibt
  const weiss = punktAus(p, wo), schwarz = punktAus(p, so);
  // Graupunkt A: Differenz zu 50 % Grau (kodiert) – findet Mitteltöne, die schon grau sind
  const diff = new Float32Array(p.n);
  for (let i = 0; i < p.n; i++) diff[i] = ok[i] ? Math.abs(kod(p.r[i]) - 0.5) + Math.abs(kod(p.g[i]) - 0.5) + Math.abs(kod(p.bl[i]) - 0.5) : 3;
  const qd = quantilFkt(diff.map((v) => v / 3), null)(0.001) * 3, ad = new Uint8Array(p.n);
  for (let i = 0; i < p.n; i++) if (diff[i] <= qd) ad[i] = 1;
  const grauDifferenz = punktAus(p, ad);
  // Graupunkt B: Grauheits-Index (Grau-Pixel) – findet graue Flächen auch bei Farbstich
  const kand = new Uint8Array(p.n); let werte = [];
  for (let i = 0; i < p.n; i++) if (ok[i] && gi[i] < 9 && p.le[i] > 0.05 && p.le[i] < 0.95) werte.push(gi[i]);
  werte.sort((a, b) => a - b);
  const anz = Math.max(Math.min(werte.length, 50), Math.round(p.n * 0.001)), sw = werte[Math.min(werte.length - 1, anz - 1)] ?? 0;
  for (let i = 0; i < p.n; i++) if (ok[i] && gi[i] <= sw && p.le[i] > 0.05 && p.le[i] < 0.95) kand[i] = 1;
  // Graupunkt = Mittel der Chromatizität der Kandidaten, auf deren mittlere Helligkeit skaliert
  let cr = 0, cg = 0, cb = 0, cy = 0, n = 0, sx = 0, sy = 0;
  for (let i = 0; i < p.n; i++) if (kand[i]) { const Y = p.Y[i] + 1e-6; cr += p.r[i] / Y; cg += p.g[i] / Y; cb += p.bl[i] / Y; cy += p.Y[i]; sx += i % p.b; sy += (i / p.b) | 0; n++; }
  const grau = n ? { rgb: [cr / n * cy / n, cg / n * cy / n, cb / n * cy / n], x: (sx / n + 0.5) / p.b, y: (sy / n + 0.5) / p.h, anteil: n / p.n } : grauDifferenz;
  const sicherheit = klemme(Math.min(weiss.anteil, schwarz.anteil) / 2e-4) * 0.5 + klemme(werte.length / (p.n * 0.02)) * 0.5;
  return { schwarz, weiss, grau, grauDifferenz, sicherheit, q001, q999 };
}
export function findePunkte(bild, opts = {}) { const p = vorbereite(bild); return punkteIntern(p, gueltig(p, opts.raender), grauIntern(p)); }

/** Grauheits-Index je Pixel (klein = grau): Streuung der lokalen Log-Kontraste der drei Kanäle, normiert auf den Luminanz-Kontrast. */
function grauIntern(p) {
  const { b, h, n } = p, e = 1e-3;
  const lr = new Float32Array(n), lg = new Float32Array(n), lb = new Float32Array(n);
  for (let i = 0; i < n; i++) { lr[i] = Math.log(p.r[i] + e); lg[i] = Math.log(p.g[i] + e); lb[i] = Math.log(p.bl[i] + e); }
  const sr = kasten(lr, b, h, 1), sg = kasten(lg, b, h, 1), sb = kasten(lb, b, h, 1), gi = new Float32Array(n).fill(99);
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < b - 1; x++) {
    const i = y * b + x, lap = (a) => Math.abs(4 * a[i] - a[i - 1] - a[i + 1] - a[i - b] - a[i + b]);
    const dr = lap(sr), dg = lap(sg), db = lap(sb), dm = (dr + dg + db) / 3;
    if (dm < 0.004) continue;                                // flach: keine Aussage
    gi[i] = Math.hypot(dr - dm, dg - dm, db - dm) / (dm + 0.01);
  }
  return gi;
}
export function grauheitsIndex(bild) { return grauIntern(vorbereite(bild, Infinity)); }

// ---------------------------------------------------------------- Weißabgleich
const zuUV = (c) => [Math.log((c[0] + 1e-6) / (c[1] + 1e-6)), Math.log((c[2] + 1e-6) / (c[1] + 1e-6))];
const ausUV = (u, v, w) => { const c = [Math.exp(u), 1, Math.exp(v)], Y = w[0] * c[0] + w[1] * c[1] + w[2] * c[2]; return c.map((x) => x / Y); };
function gewMedian(paare) {   // [[wert, gewicht]]
  const s = paare.filter((p) => isFinite(p[0]) && p[1] > 0).sort((a, b) => a[0] - b[0]); const ges = s.reduce((a, p) => a + p[1], 0);
  let acc = 0; for (const [v, w] of s) { acc += w; if (acc >= ges / 2) return v; } return 0;
}
function wbIntern(p, gm, punkte, opts = {}) {
  const { n } = p, ok = new Uint8Array(n);
  for (let i = 0; i < n; i++) ok[i] = gm[i] && !geclippt(p, i) && p.Y[i] > 0.002 ? 1 : 0;
  const sch = {};
  // Grauwelt + Shades-of-Gray (p = 6)
  let m1 = [0, 0, 0], m6 = [0, 0, 0], cnt = 0;
  for (let i = 0; i < n; i++) if (ok[i]) { const c = [p.r[i], p.g[i], p.bl[i]]; for (let j = 0; j < 3; j++) { m1[j] += c[j]; m6[j] += c[j] ** 6; } cnt++; }
  if (!cnt) cnt = 1;
  sch.grauwelt = m1.map((v) => v / cnt); sch.grauStufen = m6.map((v) => (v / cnt) ** (1 / 6));
  // Weißfeld robust: 99,5-%-Quantil je Kanal
  sch.weissfeld = [p.r, p.g, p.bl].map((a) => quantilFkt(a, ok)(0.995));
  // Grau-Kanten 1. Ordnung (p = 6, σ ≈ 2 px)
  { const gk = [0, 0, 0]; let z = 0; const pl = [p.r, p.g, p.bl].map((a) => gauss(a, p.b, p.h, 2));
    for (let y = 1; y < p.h - 1; y++) for (let x = 1; x < p.b - 1; x++) { const i = y * p.b + x; if (!ok[i]) continue;
      for (let j = 0; j < 3; j++) { const a = pl[j]; gk[j] += Math.hypot(a[i + 1] - a[i - 1], a[i + p.b] - a[i - p.b]) ** 6; } z++; }
    sch.grauKanten = gk.map((v) => (v / Math.max(1, z)) ** (1 / 6)); }
  sch.grauPixel = punkte.grau.rgb; sch.weisspunkt = punkte.weiss.rgb;
  const gewicht = { grauwelt: 0.5, grauStufen: 1, weissfeld: 0.8, grauKanten: 1.5, grauPixel: punkte.grau.anteil > 5e-4 ? 2 : 0.5, weisspunkt: punkte.weiss.anteil > 1e-4 ? 0.8 : 0.2 };
  const uv = Object.fromEntries(Object.entries(sch).map(([k, c]) => [k, zuUV(c)]));
  let u0 = gewMedian(Object.keys(uv).map((k) => [uv[k][0], gewicht[k]])), v0 = gewMedian(Object.keys(uv).map((k) => [uv[k][1], gewicht[k]]));
  // Kandidaten-Flächen: iterativ fast-graue Pixel unter der aktuellen Schätzung sammeln (enger werdende Schwelle)
  let fl = null;
  { let u = u0, v = v0;
    for (const th of [0.4, 0.25, 0.15, 0.1, 0.07, 0.05]) {
      let su = 0, sv = 0, z = 0;
      for (let i = 0; i < n; i += 2) { if (!ok[i] || p.le[i] < 0.06 || p.le[i] > 0.96) continue;
        const pu = Math.log((p.r[i] + 1e-4) / (p.g[i] + 1e-4)) - u, pv = Math.log((p.bl[i] + 1e-4) / (p.g[i] + 1e-4)) - v;
        if (pu * pu + pv * pv < th * th) { su += pu; sv += pv; z++; } }
      if (z < n * 0.004) break;
      u += su / z; v += sv / z; fl = { u, v, anteil: (2 * z) / n, schwelle: th };
    } }
  if (fl) { sch.grauFlaechen = ausUV(fl.u, fl.v, p.w); uv.grauFlaechen = [fl.u, fl.v]; gewicht.grauFlaechen = fl.anteil > 0.02 ? 3 : 1; }
  const ks = Object.keys(uv);
  let u = gewMedian(ks.map((k) => [uv[k][0], gewicht[k]])), v = gewMedian(ks.map((k) => [uv[k][1], gewicht[k]]));
  const streu = gewMedian(ks.map((k) => [Math.hypot(uv[k][0] - u, uv[k][1] - v), gewicht[k]]));
  const einigkeit = klemme(1 - streu / 0.2);
  const bestaetigt = !!fl && fl.anteil > 0.03 && fl.schwelle <= 0.07;
  if (bestaetigt) { u = fl.u; v = fl.v; }
  const licht = ausUV(u, v, p.w);
  let staerke = bestaetigt ? 1 : klemme(0.4 + 0.6 * einigkeit, 0.4, 1);
  let gains = licht.map((c) => 1 / c);
  const kt0 = wbAusGains(gains);
  if (!bestaetigt) {     // Stimmung bewahren: warmes Licht ohne Grau-Bestätigung nur halb, höchstens ±1500 K
    if (kt0.kelvin < 4200) staerke = Math.min(staerke, 0.5);
    const dk = Math.abs(kt0.kelvin - 6504) * staerke; if (dk > 1500) staerke *= 1500 / dk;
  }
  // Haut-Prüfung: Hautton muss nach der Korrektur im Hautbereich liegen (OKLCH-Farbton 25°–75°)
  const haut = hautMittel(p, opts);
  let hautTon = null;
  if (haut) for (let k = 0; k < 6; k++) {
    const g = gains.map((x) => x ** staerke), c = haut.map((x, j) => x * g[j]), L = okLab(c[0], c[1], c[2]);
    hautTon = ((Math.atan2(L[2], L[1]) * 180) / Math.PI + 360) % 360;
    if (hautTon >= 25 && hautTon <= 75) break; staerke *= 0.7; if (staerke < 0.2) break;
  }
  // Einheitlicher Farbton (getönter Abzug, blauer Himmel): die „grauen“ Flächen sind dann nur die Tönung selbst → Tönung erhalten.
  // Nur ein übertriebener warmer Stich (Chroma > 4,5) wird auf 4,5 gemildert; blaue Bilder (Himmel, Wasser) bleiben unberührt.
  const ton = opts.toenung || null; let toenungErhalten = false;
  if (ton?.einheitlich) {
    toenungErhalten = true;
    let rest = 0; { let s0 = 0, z0 = 0; const st = Math.max(1, Math.floor(n / 30000));
      for (let i = 0; i < n; i += st) { if (!ok[i] || p.le[i] < 0.12 || p.le[i] > 0.92) continue; const L = okLab(p.r[i] * gains[0], p.g[i] * gains[1], p.bl[i] * gains[2]); s0 += Math.hypot(L[1], L[2]); z0++; }
      rest = z0 ? (100 * s0) / z0 : 0; }
    const ziel = 4.5;
    staerke = ton.blau || ton.chroma <= ziel ? 0 : klemme((ton.chroma - ziel) / Math.max(1e-6, ton.chroma - rest), 0, 1);
  }
  const eff = gains.map((x) => x ** staerke), Y = p.w[0] * eff[0] + p.w[1] * eff[1] + p.w[2] * eff[2];
  const kt = wbAusGains(gains);
  const sicher = toenungErhalten ? 0.5 : bestaetigt ? 0.9 : klemme(0.3 + 0.6 * einigkeit, 0, fl ? 0.85 : 0.55);
  return { gains: eff.map((x) => x / Y), gainsVoll: gains, licht, kelvin: kt.kelvin, toenung: kt.toenung, schaetzer: sch,
    einigkeit, staerke, bestaetigt: bestaetigt && !toenungErhalten, grauAnteil: fl ? fl.anteil : 0, hautTon,
    toenungErhalten, bildTon: ton, sicherheit: sicher };
}
function hautMittel(p, opts) {
  const m = opts.haut; let s = [0, 0, 0], z = 0;
  if (m) { const fx = m.b / p.b, fy = m.h / p.h;
    for (let y = 0; y < p.h; y++) for (let x = 0; x < p.b; x++) { if (m.daten[Math.min(m.h - 1, (y * fy) | 0) * m.b + Math.min(m.b - 1, (x * fx) | 0)] < 128) continue; const i = y * p.b + x; s[0] += p.r[i]; s[1] += p.g[i]; s[2] += p.bl[i]; z++; } }
  else if (opts.gesichter?.length) for (const g of opts.gesichter) {   // innere Gesichtsbox (Wangen/Stirn)
    const x0 = Math.floor((g.box.x + g.box.b * 0.25) * p.b), x1 = Math.ceil((g.box.x + g.box.b * 0.75) * p.b), y0 = Math.floor((g.box.y + g.box.h * 0.3) * p.h), y1 = Math.ceil((g.box.y + g.box.h * 0.7) * p.h);
    for (let y = Math.max(0, y0); y < Math.min(p.h, y1); y++) for (let x = Math.max(0, x0); x < Math.min(p.b, x1); x++) { const i = y * p.b + x; s[0] += p.r[i]; s[1] += p.g[i]; s[2] += p.bl[i]; z++; } }
  return z > 20 ? s.map((v) => v / z) : null;
}
export function schaetzeWeissabgleich(bild, opts = {}) {
  const p = vorbereite(bild), gm = gueltig(p, opts.raender);
  return wbIntern(p, gm, punkteIntern(p, gm, grauIntern(p)), opts);
}

// ---------------------------------------------------------------- Belichtung
function belichtungIntern(p, gm, opts = {}) {
  const { b, h, n, Y } = p, Z = 8, zs = new Float64Array(Z * Z), zw = new Float64Array(Z * Z);
  const gesicht = new Uint8Array(n);
  for (const g of opts.gesichter || []) { const x0 = Math.floor(g.box.x * b), x1 = Math.ceil((g.box.x + g.box.b) * b), y0 = Math.floor(g.box.y * h), y1 = Math.ceil((g.box.y + g.box.h) * h);
    for (let y = Math.max(0, y0); y < Math.min(h, y1); y++) for (let x = Math.max(0, x0); x < Math.min(b, x1); x++) gesicht[y * b + x] = 1; }
  let fs = 0, fz = 0, sLog = 0, sW = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) {
    const i = y * b + x; if (!gm[i]) continue;
    const l = Math.log2(Y[i] + 1e-4), dx = (x + 0.5) / b - 0.5, dy = (y + 0.5) / h - 0.5;
    const w = (1 + 0.6 * (1 - klemme((dx * dx + dy * dy) * 4))) * (gesicht[i] ? 4 : 1);   // mittenbetont, Gesichter ×4
    const z = Math.min(Z - 1, ((y / h) * Z) | 0) * Z + Math.min(Z - 1, ((x / b) * Z) | 0); zs[z] += l * w; zw[z] += w;
    if (gesicht[i]) { fs += l; fz++; }
  }
  for (let z = 0; z < Z * Z; z++) if (zw[z] > 0) { const zm = zs[z] / zw[z]; sLog += zm * zw[z]; sW += zw[z]; }   // Zonen-Mittel, gewichtet
  const lgeo = Math.pow(2, sLog / Math.max(1e-9, sW));
  const qY = quantilFkt(Y.map((v) => Math.sqrt(klemme(v))), gm, 8192), qL = (q) => qY(q) ** 2;
  const lmin = Math.max(1e-4, qL(0.01)), lmax = Math.max(lmin * 2, qL(0.995));
  const l2 = Math.log2, schluessel = 0.18 * Math.pow(4, (2 * l2(lgeo) - l2(lmin) - l2(lmax)) / (l2(lmax) - l2(lmin)));
  let ev = klemme(l2(schluessel / lgeo), -3, 3);
  const ql = quantilFkt(p.le, gm);
  let cl = 0, ck = 0, c2 = 0, ct = 0, z = 0, hell = 0, dunkel = 0, mitte = 0; const dv = [];
  for (let i = 0; i < n; i++) if (gm[i]) { if (weissGeclippt(p, i)) cl++; if (geclippt(p, i)) ck++; if ((p.r[i] > 0.995) + (p.g[i] > 0.995) + (p.bl[i] > 0.995) >= 2) c2++; if (Y[i] < 0.002) ct++; z++;
    const l = p.le[i]; if (l > 0.7) hell++; else if (l < 0.15) { dunkel++; if ((i & 3) === 0) dv.push(l); } else if (l > 0.25 && l < 0.6) mitte++; }
  // Starkes Clipping drückt Lgeo und Lmax zusammen → Schlüssel unterschätzt die Überbelichtung. Rückfall: Median auf Mittelgrau.
  const evMedian = klemme(l2(0.2 / Math.max(1e-4, qL(0.5))), -3, 3);
  // (gezählt: mindestens 2 volle Kanäle – ein einzelner voller Kanal ist ein Farbstich, keine Überbelichtung)
  if (c2 / z > 0.02 && evMedian < ev) ev = ev + (evMedian - ev) * klemme((c2 / z - 0.02) / 0.1);
  // Gegenlicht: großer heller Bereich + dunkles Motiv, kaum Mitteltöne → NICHT abdunkeln (das Motiv versinkt sonst); Tiefen öffnet der Vorschlag.
  let gegenlicht = null;
  if (hell / z >= 0.3 && dunkel / z >= 0.08 && mitte / z <= 0.2) {
    dv.sort((a, b) => a - b); gegenlicht = { hell: hell / z, dunkel: dunkel / z, mitte: mitte / z, motiv: dv.length ? dv[dv.length >> 1] : 0 };
    if (ev < 0) ev = 0;
  }
  const aus = { ev, schluessel, lgeo, lmin, lmax, p001: ql(0.001), p50: ql(0.5), p995: ql(0.995), p999: ql(0.999), clipLichter: cl / z, clipKanal: ck / z, clipTiefen: ct / z, gegenlicht,
    evMedian, sicherheit: klemme(0.85 - Math.max(0, cl / z - 0.1) * 0.5 - Math.max(0, ct / z - 0.05) * 3, 0.45, 0.9) };
  if (fz > 50) aus.gesichtEV = fs / fz - l2(lgeo);
  return aus;
}
export function schaetzeBelichtung(bild, opts = {}) { const p = vorbereite(bild); return belichtungIntern(p, gueltig(p, opts.raender), opts); }

// ---------------------------------------------------------------- Auto-Ton (Rechenvorschrift = Shader 'belichtung' in regler.js)
const SCHULTER = 0.8;
/** Belichtung mit Lichter-Erhalt: hell = weiche Schulter (nichts clippt neu), dunkel = geclipptes Weiß bleibt weiß. */
export function belichte(x, g) {
  if (g >= 1) { const z = x * g; return z <= SCHULTER ? z : SCHULTER + (1 - SCHULTER) * (1 - Math.exp(-(z - SCHULTER) / (1 - SCHULTER))); }
  const c = klemme(x); return g * x + (1 - g) * c * c * c * c * c * c;
}
/** Ein Kanal durch den Auto-Ton (linear rein, linear raus). */
export function autoTonKanal(x, j, q) {
  let y = belichte(x * q.gain[j], q.g);
  let e = kod(y); e = klemme((e - q.s[j]) / (q.w[j] - q.s[j])); e = Math.pow(e, q.gam[j]);
  y = linear(e);
  return x + (y - x) * q.staerke;
}
/** CPU-Referenz des Auto-Ton-Schritts (für Tests, Batch-Rückfall). @returns {import('./typen.js').BildF32} */
export function wendeAutoTonAn(bild, params) {
  const q = autoTonVorbereiten(params), k = bild.kanaele || 4, d = bild.daten, o = new Float32Array(d.length);
  for (let i = 0; i < d.length; i += k) { for (let j = 0; j < 3; j++) o[i + j] = autoTonKanal(d[i + j], j, q); if (k === 4) o[i + 3] = d[i + 3]; }
  return { ...bild, daten: o };
}
/** Auto-Ton-Parameter aus WB + Belichtung: simuliert die Kette auf einer Stichprobe. */
function autoTonIntern(p, gm, wb, bel) {
  const schritt = Math.max(1, Math.floor(p.n / 50000)), idx = [];
  for (let i = 0; i < p.n; i += schritt) if (gm[i]) idx.push(i);
  const lw = p.w, gains = wb.gains;
  const luma = (g, s = 0, w = 1, gam = 1) => { const a = new Float32Array(idx.length);
    for (let k = 0; k < idx.length; k++) { const i = idx[k]; let L = 0;
      for (let j = 0; j < 3; j++) { const c = [p.r, p.g, p.bl][j][i]; let e = kod(belichte(c * gains[j], g)); if (s || w !== 1 || gam !== 1) e = Math.pow(klemme((e - s) / (w - s)), gam); L += lw[j] * e; }
      a[k] = L; } return a; };
  const qv = (a, q) => { const s = Float32Array.from(a).sort(); return s[Math.min(s.length - 1, Math.max(0, Math.round(q * (s.length - 1))))]; };
  let ev = bel.ev;
  if (ev > 0) {   // Lichter-Schutz: P99,5 ≤ 0,97
    let lo = 0, hi = ev; if (qv(luma(2 ** ev), 0.995) > 0.97) { for (let k = 0; k < 7; k++) { const m = (lo + hi) / 2; if (qv(luma(2 ** m), 0.995) > 0.97) hi = m; else lo = m; } ev = lo; }
  }
  const nachEV = luma(2 ** ev), m0 = qv(nachEV, 0.5), p001 = qv(nachEV, 0.001), p999 = qv(nachEV, 0.999), p995 = qv(nachEV, 0.995);
  let mZiel = klemme(qv(luma(2 ** bel.ev), 0.5), 0.36, 0.6);   // Mitte, die die volle Belichtung erreicht hätte (Rest über Gamma = „Tiefen +“)
  // Helle Bilder (Papier, Schnee, High-Key) nur abdunkeln, wenn sie wirklich überbelichtet sind – sonst bleibt die Mitte, wo sie ist.
  const ueberbelichtet = bel.ev < -0.3 && !bel.gegenlicht;
  if (m0 > mZiel && !ueberbelichtet) mZiel = m0;
  const s = p001 > 0.05 ? klemme(p001 - 0.025, 0, 0.35) : 0;
  let w = 1;
  if (p999 < 0.9) w = Math.max(s + 0.3, p999 + 0.03);
  else if (p995 > 0.85 && p995 < 0.955) w = s + (p995 - s) / 0.96;   // fast weißes Papier/Licht sanft auf Weiß ziehen
  if (p995 > 0.965) w = Math.max(w, s + (p995 - s) / 0.96);
  let gam = 1;
  for (let k = 0; k < 4; k++) {   // Gamma hebt/senkt auch die Lichter → Weiß nachführen, bis P99,5 ≤ 0,96 bleibt
    const ml = klemme((m0 - s) / (w - s), 0.02, 0.98); gam = klemme(Math.log(mZiel) / Math.log(ml), 0.6, ueberbelichtet ? 1.6 : 1);
    const ob = klemme((p995 - s) / (w - s)) ** gam; if (ob <= 0.96 || p995 < 0.9) break;
    w = s + (p995 - s) / Math.pow(0.96, 1 / gam);
  }
  const params = { wbGains: gains.slice(), ev, schwarz: [s, s, s], weiss: [w, w, w], gamma: [gam, gam, gam], staerke: 1 };
  const ende = luma(2 ** ev, s, w, gam);
  // Nach-Statistik (Sättigung, Kontrast) auf dem korrigierten Bild – Vorschläge „Farben beleben“/„Mehr Kontrast“ richten sich danach.
  let sc = 0, sr = 0, so = 0, sl = 0, sl2 = 0; const st2 = Math.max(1, Math.floor(idx.length / 12000)); let z2 = 0;
  for (let k = 0; k < idx.length; k += st2) { const i = idx[k], c = [0, 0, 0], r = [0, 0, 0];
    for (let j = 0; j < 3; j++) { const x = [p.r, p.g, p.bl][j][i] * gains[j]; let e = kod(belichte(x, 2 ** ev)); e = Math.pow(klemme((e - s) / (w - s)), gam); c[j] = linear(e); r[j] = belichte(x, 2 ** bel.ev); }
    const L = okLab(c[0], c[1], c[2]), R0 = okLab(klemme(r[0]), klemme(r[1]), klemme(r[2])), O0 = okLab(p.r[i], p.g[i], p.bl[i]); sc += Math.hypot(L[1], L[2]); sr += Math.hypot(R0[1], R0[2]); so += Math.hypot(O0[1], O0[2]); const l = ende[k]; sl += l; sl2 += l * l; z2++; }
  const lstd = Math.sqrt(Math.max(0, sl2 / z2 - (sl / z2) ** 2));
  return { params, vorschau: { median: qv(ende, 0.5), p001: qv(ende, 0.001), p995: qv(ende, 0.995), saettigung: sc / z2, saettigungRef: bel.ev < 0 ? Math.min(sr, so) / z2 : sr / z2, lstd }, evVoll: bel.ev };
}

// ---------------------------------------------------------------- Rauschen, Frequenz, Dunst, Sättigung
function rauschIntern(p, faktorQuelle = 0) {
  const { b, h } = p, gr = new Float32Array(b * h), la = new Float32Array(b * h), ca = new Float32Array(b * h), cb = new Float32Array(b * h);
  const pr = new Float32Array(b * h), pb = new Float32Array(b * h);
  for (let i = 0; i < p.n; i++) { pr[i] = kod(p.r[i]) - p.le[i]; pb[i] = kod(p.bl[i]) - p.le[i]; }
  const N = (a, i) => a[i - b - 1] - 2 * a[i - b] + a[i - b + 1] - 2 * a[i - 1] + 4 * a[i] - 2 * a[i + 1] + a[i + b - 1] - 2 * a[i + b] + a[i + b + 1];
  const sm = kasten(p.le, b, h, 2), hist = new Uint32Array(2048); let hz = 0;
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < b - 1; x++) { const i = y * b + x, a = p.le;
    gr[i] = Math.abs(sm[i + 1] - sm[i - 1]) + Math.abs(sm[i + b] - sm[i - b]); la[i] = Math.abs(N(a, i)); ca[i] = Math.abs(N(pr, i)); cb[i] = Math.abs(N(pb, i)); hist[Math.min(2047, (gr[i] * 4096) | 0)]++; hz++; }
  let grenze = 0; for (let v = 0, acc = 0; v < 2048; v++) { acc += hist[v]; if (acc >= hz / 2) { grenze = (v + 1) / 4096; break; } }
  let sl = 0, sc = 0, z = 0;
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < b - 1; x++) { const i = y * b + x; if (gr[i] > grenze) continue; sl += la[i]; sc += (ca[i] + cb[i]) / 2; z++; }
  const f = Math.sqrt(Math.PI / 2) / 6 / Math.max(1, z);
  // Verkleinern mittelt weißes Rauschen (σ / Faktor) → auf volle Auflösung zurückrechnen (Näherung, Kamera-Rauschen ist leicht korreliert)
  const k = Math.max(1, faktorQuelle || p.faktor);
  return { sigmaL: sl * f * k, sigmaF: sc * f * k, sigmaAnalyse: sl * f, faktor: k };
}
export function rauschen(bild, opts = {}) { const p = vorbereite(bild); return rauschIntern(p, opts.quelle ? Math.max(opts.quelle.b, opts.quelle.h) / Math.max(p.b, p.h) : 0); }

function frequenzIntern(p, sigmaL = 0) {
  let L = p.le, b = p.b, h = p.h; const energie = new Float32Array(5);
  for (let s = 0; s < 5; s++) {
    const g = gauss(L, b, h, 1); let e = 0; for (let i = 0; i < L.length; i++) { const d = L[i] - g[i]; e += d * d; } energie[s] = e / L.length;
    const nb = Math.max(1, b >> 1), nh = Math.max(1, h >> 1), k = new Float32Array(nb * nh);
    for (let y = 0; y < nh; y++) for (let x = 0; x < nb; x++) { const i = 2 * y * b + 2 * x; k[y * nb + x] = (g[i] + g[Math.min(i + 1, g.length - 1)] + g[Math.min(i + b, g.length - 1)] + g[Math.min(i + b + 1, g.length - 1)]) / 4; }
    L = k; b = nb; h = nh;
  }
  const rausch = 0.6 * sigmaL * sigmaL;   // Anteil weißen Rauschens im feinsten Band
  return { energie, schaerfe: Math.max(0, energie[0] - rausch) / Math.max(1e-9, energie[3]) };
}
export function frequenzProfil(bild) { const p = vorbereite(bild); return frequenzIntern(p, rauschIntern(p).sigmaAnalyse); }

function dunstIntern(p) {
  const dk = new Float32Array(p.n); for (let i = 0; i < p.n; i++) dk[i] = kod(Math.min(p.r[i], p.g[i], p.bl[i]));
  const r = Math.max(2, Math.round(7 * Math.max(p.b, p.h) / 1024)), m = minimum(dk, p.b, p.h, r);
  let s = 0; for (const v of m) s += v; const mittel = s / p.n;
  const q = quantilFkt(m, null)(0.999); let a = [0, 0, 0], z = 0;
  for (let i = 0; i < p.n; i++) if (m[i] >= q) { a[0] += p.r[i]; a[1] += p.g[i]; a[2] += p.bl[i]; z++; }
  const atmosLicht = z ? a.map((v) => v / z) : [1, 1, 1];
  return { dunkelkanalMittel: mittel, atmosLicht, staerke: klemme((mittel - 0.12) / 0.3) };
}
export function dunst(bild) { return dunstIntern(vorbereite(bild)); }
function saettigungIntern(p, gm) {
  let s = 0, z = 0; const st = Math.max(1, Math.floor(p.n / 100000));
  for (let i = 0; i < p.n; i += st) { if (!gm[i]) continue; const L = okLab(p.r[i], p.g[i], p.bl[i]); s += Math.hypot(L[1], L[2]); z++; }
  return { mittel: s / Math.max(1, z) };
}

// ---------------------------------------------------------------- Detailkarte (adaptive Schärfe)
/** @returns {import('./typen.js').BildU8} R = Ebene 0 Fläche, G = 1 grob, B = 2 mittel, A = 3 fein (Summe 255) */
export function detailKarte(bild, opts = {}) {
  const p = vorbereite(bild, opts.maxKante || 2048), { b, h, n } = p, L = p.le;
  const sigma = opts.sigmaL ?? rauschIntern(p).sigmaAnalyse;
  const g1 = gauss(L, b, h, 1), g2 = gauss(L, b, h, 2), g4 = gauss(L, b, h, 4), g8 = gauss(L, b, h, 8);
  const band = [new Float32Array(n), new Float32Array(n), new Float32Array(n), new Float32Array(n)];
  for (let i = 0; i < n; i++) { const d0 = L[i] - g1[i], d1 = g1[i] - g2[i], d2 = g2[i] - g4[i], d3 = g4[i] - g8[i]; band[0][i] = d0 * d0; band[1][i] = d1 * d1; band[2][i] = d2 * d2; band[3][i] = d3 * d3; }
  const fen = [3, 4, 6, 10], rms = band.map((a, k) => { const g = gauss(a, b, h, fen[k]); for (let i = 0; i < n; i++) g[i] = Math.sqrt(g[i]); return g; });
  const tau = [1.5, 0.8, 0.45, 0.25].map((f) => Math.max(0.0035, f * sigma));
  // Liniendichte (Kantenpixel je 9×9) + Kohärenz (Struktur-Tensor)
  const kante = new Float32Array(n), schwelle = Math.max(0.012, 3 * sigma);
  for (let i = 0; i < n; i++) kante[i] = Math.abs(L[i] - g1[i]) > schwelle ? 1 : 0;
  const dichte = kasten(kante, b, h, 4);
  const jxx = new Float32Array(n), jyy = new Float32Array(n), jxy = new Float32Array(n);
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < b - 1; x++) { const i = y * b + x, gx = (g1[i + 1] - g1[i - 1]) / 2, gy = (g1[i + b] - g1[i - b]) / 2; jxx[i] = gx * gx; jyy[i] = gy * gy; jxy[i] = gx * gy; }
  const sxx = gauss(jxx, b, h, 2), syy = gauss(jyy, b, h, 2), sxy = gauss(jxy, b, h, 2);
  // Haut / Augen
  const hm = opts.haut, augen = [];
  for (const g of opts.gesichter || []) { const lm = g.landmarken; if (!lm || lm.length < 478 * 3) continue;
    const a = [lm[468 * 3], lm[468 * 3 + 1]], c = [lm[473 * 3], lm[473 * 3 + 1]], d = Math.hypot((a[0] - c[0]) * b, (a[1] - c[1]) * h);
    for (const e of [a, c]) augen.push({ x: e[0] * b, y: e[1] * h - d * 0.12, rx: d * 0.42, ry: d * 0.36 }); }
  const aus = new Uint8ClampedArray(n * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) {
    const i = y * b + x, a = [0, 1, 2, 3].map((k) => Math.max(0, rms[k][i] - tau[k])), ges = a[0] + a[1] + a[2] + a[3] + 1e-9;
    const akt = glatt(0.0015, 0.009, ges);
    const tr = sxx[i] + syy[i], det = Math.sqrt((sxx[i] - syy[i]) ** 2 + 4 * sxy[i] ** 2), koh = tr > 1e-9 ? (det / tr) ** 2 : 0;
    const linien = klemme(dichte[i] * 3);
    let w3 = glatt(0.18, 0.36, a[0] / ges) * (0.6 + 0.4 * Math.max(koh, linien));
    let w2 = glatt(0.3, 0.55, (a[1] + a[2]) / ges) * (1 - w3);
    let w1 = glatt(0.3, 0.6, a[3] / ges) * (1 - w3 - w2);
    if (hm) { const hv = hm.daten[Math.min(hm.h - 1, ((y * hm.h) / h) | 0) * hm.b + Math.min(hm.b - 1, ((x * hm.b) / b) | 0)] / 255; w3 *= 1 - hv; w2 *= 1 - 0.5 * hv; }
    for (const e of augen) { const q = ((x - e.x) / e.rx) ** 2 + ((y - e.y) / e.ry) ** 2; if (q < 1) w3 = Math.max(w3, 0.8 * (1 - q * q)); }
    w3 *= akt; w2 *= akt; w1 *= akt; const w0 = Math.max(0, 1 - w1 - w2 - w3), s = w0 + w1 + w2 + w3;
    aus[i * 4] = Math.round((w0 / s) * 255); aus[i * 4 + 1] = Math.round((w1 / s) * 255); aus[i * 4 + 2] = Math.round((w2 / s) * 255); aus[i * 4 + 3] = Math.round((w3 / s) * 255);
  }
  return { b, h, daten: aus, farbraum: p.farbraum };
}

// ---------------------------------------------------------------- Gesamt-Analyse
const fz = (v, n = 1) => v.toLocaleString('de-DE', { minimumFractionDigits: n, maximumFractionDigits: n });
export function analysiere(bild, opts = {}) {
  const t0 = (typeof performance !== 'undefined' ? performance : Date).now();
  const p0 = vorbereite(bild), gm = gueltig(p0, opts.raender);
  const rs = rauschIntern(p0, opts.quelle ? Math.max(opts.quelle.b, opts.quelle.h) / Math.max(p0.b, p0.h) : 0), frequenz = frequenzIntern(p0, rs.sigmaAnalyse);
  // Sichtbares Rauschen: Farbe/Licht auf einer geglätteten Kopie schätzen (sonst kippen Graupunkte, Clipping und Sicherheit)
  const p = rs.sigmaAnalyse > 0.006 ? geglaettet(p0, klemme(rs.sigmaAnalyse / 0.012, 0.8, 2)) : p0;
  const gi = grauIntern(p), punkte = punkteIntern(p, gm, gi), toenung = toenungIntern(p, gm);
  const wb = wbIntern(p, gm, punkte, { ...opts, toenung });
  const belichtung = belichtungIntern(p, gm, opts);
  const auto = autoTonIntern(p, gm, wb, belichtung);
  // Tönung entfernen (nur auf Wunsch): dieselbe Kette mit vollem Weißabgleich
  const autoVoll = wb.toenungErhalten ? autoTonIntern(p, gm, { ...wb, gains: (() => { const g = wb.gainsVoll, Y = p.w[0] * g[0] + p.w[1] * g[1] + p.w[2] * g[2]; return g.map((x) => x / Y); })() }, belichtung) : null;
  const du = dunstIntern(p), sa = saettigungIntern(p, gm);
  let sl = 0, sl2 = 0, z = 0; for (let i = 0; i < p.n; i++) if (gm[i]) { const l = Math.log2(p.Y[i] + 1e-4); sl += l; sl2 += l * l; z++; }
  const kontrast = Math.sqrt(Math.max(0, sl2 / z - (sl / z) ** 2));
  // Farbstich: ΔE2000 eines mittleren Graus unter der geschätzten Lichtfarbe gegenüber neutralem Grau (wie an Graufeldern gemessen)
  const li = wb.licht.map((v) => v * 0.18), lab = cieLab(li[0], li[1], li[2]), stichDE = deltaE2000(lab, [lab[0], 0, 0]);
  const quelle = opts.quelle || { b: bild.b, h: bild.h };
  const a = {
    version: 1, b: p.b, h: p.h, histogramme: histogramme(bild), punkte, wb, belichtung,
    kontrast, tonumfang: { p001: belichtung.p001, p999: belichtung.p999 }, farbstichDeltaE: stichDE, bildTon: toenung, autoVoll,
    dunst: du, saettigung: sa.mittel, rauschen: rs, frequenz, raender: opts.raender || null,
    gesichter: (opts.gesichter || []).length, gesichtGroesse: Math.max(0, ...(opts.gesichter || []).map((g) => Math.min(g.box.b * quelle.b, g.box.h * quelle.h) / Math.min(quelle.b, quelle.h))),
    megapixel: (quelle.b * quelle.h) / 1e6, auto,
    dauerMs: 0, vorschlaege: [],
  };
  a.vorschlaege = vorschlaege(a);
  a.dauerMs = Math.round((typeof performance !== 'undefined' ? performance : Date).now() - t0);
  return a;
}

// ---------------------------------------------------------------- Vorschläge
const V = (id, titel, grund, wichtig, sicherheit, schritte, extra = {}) => ({ id, titel, grund, wichtig: klemme(wichtig), sicherheit: klemme(sicherheit), schritte, ...extra });
const regler = (params, name) => neuerSchritt(ART.REGLER, params, { name });
/** @returns {import('./typen.js').Vorschlag[]} */
export function vorschlaege(a) {
  const aus = [], b = a.belichtung, wb = a.wb, t = a.auto?.params;
  // 1) Licht und Farbe (Auto-Ton): Farbstich + Belichtung + Tonumfang in EINEM Schritt
  const gruende = [], ton = wb.toenungErhalten;
  if (ton && wb.staerke > 0.05) gruende.push(`starker Farbstich gemildert (ΔE ${fz(a.farbstichDeltaE)}), die Tönung des Bildes bleibt`);
  else if (!ton && a.farbstichDeltaE > 3 && wb.staerke > 0.3) gruende.push(`Farbstich (ΔE ${fz(a.farbstichDeltaE)}, Licht etwa ${Math.round(wb.kelvin / 50) * 50} K)`);
  if (b.ev > 0.3) gruende.push(`zu dunkel (${fz(b.ev)} Blenden)`); else if (b.ev < -0.3) gruende.push(`zu hell (${fz(-b.ev)} Blenden)`);
  if (b.p999 < 0.85 || b.p001 > 0.06) gruende.push('Tonwerte nicht ausgeschöpft');
  // Tonwert-Spreizung macht Farben kräftiger als die bloße Helligkeits-Korrektur → im selben Regler-Schritt ausgleichen
  const vs0 = a.auto?.vorschau, satKomp = vs0 && vs0.saettigungRef > 0.005 && vs0.saettigung > vs0.saettigungRef * 1.12 ? -Math.round(klemme(100 * (1 - (1.06 * vs0.saettigungRef) / vs0.saettigung), 0, 15)) : 0;
  if (t && gruende.length) {
    // Getönt: der Weißabgleich ist bewusst zurückhaltend (sichere Wahl) → Sicherheit kommt aus der Belichtung
    const st = ton ? b.sicherheit : Math.min(wb.sicherheit, b.sicherheit), w = klemme(Math.max(ton ? 0 : a.farbstichDeltaE / 12, Math.abs(b.ev) / 1.5, b.p001 > 0.06 || b.p999 < 0.85 ? 0.5 : 0));
    aus.push(V('auto-ton', ton ? 'Licht richten' : 'Licht und Farbe richten', `${gruende.join(', ')}. ${ton ? 'Weißpunkt und Schwarzpunkt wurden im Bild gefunden.' : 'Weißpunkt, Schwarzpunkt und neutrales Grau wurden im Bild gefunden.'}`, 0.5 + 0.5 * w, st,
      [neuerSchritt(ART.AUTO_TON, structuredClone(t), { name: 'Auto-Ton' }), ...(satKomp < 0 ? [regler({ saettigung: satKomp }, 'Farbtreue')] : [])]));
  }
  if (ton && a.autoVoll && !b.gegenlicht) aus.push(V('toenung', 'Tönung entfernen', `Das Bild hat einen einheitlichen Farbton (${wb.bildTon?.blau ? 'Himmel oder Wasser' : 'getönter Abzug'}). Er bleibt automatisch erhalten; hier neutral machen.`, 0.3, 0.5,
    [neuerSchritt(ART.AUTO_TON, structuredClone(a.autoVoll.params), { name: 'Auto-Ton neutral' })], { auto: false }));
  const gegen = b.gegenlicht;
  if (gegen) { const tief = Math.round(klemme(60 + (0.12 - gegen.motiv) * 250, 55, 90));
    aus.push(V('gegenlicht', 'Gegenlicht ausgleichen', `Heller Hintergrund, dunkles Motiv (${fz(gegen.hell * 100, 0)} % hell, ${fz(gegen.dunkel * 100, 0)} % dunkel): Tiefen öffnen, Himmel halten.`, 0.85, 0.75,
      [regler({ tiefen: tief, lichter: -30 }, 'Gegenlicht')])); }
  // Ausgefressen (alle Kanäle voll) lässt sich in 8 Bit nicht zurückholen – Lichter nur auf Wunsch zurücknehmen (sonst wird Weiß grau)
  if (b.clipLichter > 0.005 && !gegen) aus.push(V('lichter', 'Lichter zurücknehmen', `${fz(b.clipLichter * 100)} % der Fläche sind reines Weiß ohne Zeichnung. Helle Bereiche dämpfen, falls gewünscht.`, 0.3 + b.clipLichter * 2, 0.5, [regler({ lichter: -Math.round(klemme(25 + b.clipLichter * 200, 25, 50)) }, 'Lichter zurücknehmen')], { auto: false }));
  if (b.clipTiefen > 0.02 && !gegen) aus.push(V('tiefen', 'Tiefen öffnen', `${fz(b.clipTiefen * 100)} % der Fläche sind fast schwarz.`, 0.35 + b.clipTiefen * 3, 0.65, [regler({ tiefen: Math.round(klemme(25 + b.clipTiefen * 300, 25, 70)) }, 'Tiefen öffnen')]));
  const vs = a.auto?.vorschau || {}, lstd = vs.lstd ?? 1, satNach = vs.saettigung ?? a.saettigung;
  const mono = a.saettigung < 0.012 || (a.bildTon?.einheitlich && !a.bildTon?.blau);
  if (lstd < 0.12 && !gegen) aus.push(V('flau', 'Mehr Kontrast', `Auch nach dem Tonwert-Ausgleich wirkt das Bild flau (Streuung ${fz(lstd, 2)}).`, 0.45, 0.65, [regler({ kontrast: 15, klarheit: 12 }, 'Kontrast')]));
  else if (a.kontrast > 3.2 && !gegen) aus.push(V('hart', 'Kontrast mildern', `Sehr harter Kontrast (${fz(a.kontrast, 2)}): Lichter und Tiefen ausgleichen.`, 0.4, 0.6, [regler({ lichter: -30, tiefen: 30 }, 'Kontrast mildern')]));
  if (a.dunst.dunkelkanalMittel > 0.38 && a.dunst.staerke > 0.4 && a.saettigung < 0.05 && b.p001 > 0.15 && !mono) aus.push(V('dunst', 'Dunst entfernen', `Schleier über dem Bild (Dunkelkanal ${fz(a.dunst.dunkelkanalMittel, 2)}).`, 0.3 + a.dunst.staerke * 0.5, 0.55, [regler({ dunst: Math.round(20 + 40 * a.dunst.staerke) }, 'Dunst entfernen')]));
  if (satNach < 0.04 && !mono && a.saettigung >= 0.02) aus.push(V('dynamik', 'Farben beleben', 'Die Farben sind auch nach dem Ausgleich sehr blass.', 0.3, 0.6, [regler({ dynamik: 25 }, 'Dynamik')]));
  else if (satNach > 0.16) aus.push(V('bunt', 'Farben beruhigen', 'Die Farben sind sehr kräftig.', 0.25, 0.5, [regler({ saettigung: -12 }, 'Sättigung')]));
  if (a.rauschen.sigmaL > 0.012) { const s = klemme((a.rauschen.sigmaL - 0.008) / 0.03); aus.push(V('rauschen', 'Rauschen mindern', `Sichtbares Bildrauschen (σ ${fz(a.rauschen.sigmaL * 255)} von 255).`, 0.35 + 0.4 * s, 0.7,
    [neuerSchritt(ART.RAUSCHEN, { luminanz: Math.round(20 + 50 * s), farbe: Math.round(25 + 40 * klemme(a.rauschen.sigmaF / 0.02)) }, { name: 'Rauschminderung' })])); }
  const unscharf = a.frequenz.schaerfe < SCHAERFE_GRENZE;
  aus.push(V('schaerfe', unscharf ? 'Nachschärfen' : 'Feine Schärfe', unscharf ? 'Das Bild ist weich: Schärfe je nach Detail (Haare fein, Konturen mittel, Flächen nicht).' : 'Adaptive Schärfe nach Detail-Dichte, Flächen bleiben glatt.',
    unscharf ? 0.6 : 0.2, 0.7, [neuerSchritt(ART.SCHAERFE, { staerke: unscharf ? 0.8 : 0.4, rauschSchwelle: 1.5 }, { name: 'Adaptive Schärfe' })]));
  if (a.megapixel < 2) aus.push(V('hoch', 'Hochskalieren ×2', `Nur ${fz(a.megapixel)} Megapixel.`, 0.35 + (unscharf ? 0.2 : 0), 0.5, [], { aktion: 'hochskalieren', auto: false }));
  if (a.raender?.rechteck && a.raender.sicherheit > 0.5 && (a.raender.rechteck.b < 0.995 || a.raender.rechteck.h < 0.995)) aus.push(V('raender', 'Schwarze Ränder abschneiden', 'Am Bildrand liegen schwarze Streifen.', 0.8, a.raender.sicherheit, [], { geometrie: { zuschnitt: a.raender.rechteck }, auto: false }));
  if (a.gesichter && b.gesichtEV !== undefined && b.gesichtEV < -1) aus.push(V('gesicht-licht', 'Gesicht aufhellen', `Das Gesicht liegt ${fz(-b.gesichtEV)} Blenden unter dem Bild.`, 0.55, 0.6,
    [neuerSchritt(ART.LOKAL, { regler: { tiefen: Math.round(klemme(-b.gesichtEV * 25, 15, 60)), belichtung: klemme(-b.gesichtEV * 0.3, 0.1, 0.6) } }, { name: 'Gesicht aufhellen', maske: { id: neueId('m'), teile: [{ quelle: 'gesicht', modus: 'plus', params: {} }, { quelle: 'haut', modus: 'plus', params: {} }], weich: 0.4, verfeinern: true, umkehren: false } })]));
  if (a.gesichter && a.gesichtGroesse < 0.08 && unscharf) aus.push(V('auffrischen', 'Gesicht auffrischen', 'Das Gesicht ist klein und unscharf (eigene Referenzfotos nötig).', 0.4, 0.4, [], { aktion: 'auffrischen', auto: false }));
  return aus.sort((x, y) => y.wichtig - x.wichtig);
}
/** Grenze für „unscharf“ (Energie Stufe 0 / Stufe 3), an Test-Bildern gemessen (siehe LOG). */
export const SCHAERFE_GRENZE = 0.08;

/** @returns {import('./typen.js').Schritt[]} sichere Schritte; mehrere Regler-Vorschläge werden zu EINEM regler-Schritt zusammengeführt. */
export function autoSchritte(a, opts = {}) {
  const min = opts.mindestSicherheit ?? 0.6, aus = []; let reg = null;
  for (const v of a.vorschlaege || vorschlaege(a)) {
    if (v.sicherheit < min || v.auto === false) continue;
    for (const s of v.schritte) {
      if (s.art === ART.REGLER) {
        if (!reg) { reg = structuredClone(s); reg.name = 'Regler'; aus.push(reg); continue; }
        for (const [k, w] of Object.entries(s.params)) if (typeof w === 'number' && w !== 0 && !reg.params[k]) reg.params[k] = w;
      } else if (!aus.some((x) => x.art === s.art && s.art !== ART.LOKAL)) aus.push(structuredClone(s));
    }
  }
  return aus;
}
