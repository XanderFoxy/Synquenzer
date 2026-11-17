// Bildwerk – Hochskalieren, Identitätsprüfung, Gesicht auffrischen (Agent E). Signaturen FEST (ARCH.md §4.9).
// Aufbau: (1) reine Rechnung (läuft im Worker und in Node-Tests), (2) Worker-Teil `wkKi` (wk-ki ruft hoch/merkmal),
// (3) Haupt-Faden-Abläufe (Kachel-Brücke, Merkmal, Referenzen in IndexedDB, Prüfung, Auffrischen), (4) Bedienung.
// Import ohne Nebenwirkung: kein DOM, kein fetch beim Import.
import { IDENTITAET, FEHLER, BildwerkFehler, ART, neueId, neuerSchritt, DB_NAME, DB_VERSION, gesichtsKopie } from './typen.js';
import { flickenStufe, merkeFlicken, setzeFlickenLader } from './entfernen.js';
export { IDENTITAET };

/** Größte Ausgabe, die Safari auf dem iPhone als Leinwand kodieren kann (wie app.MAX_AUSGABE_PX). */
const MAX_PX = 16.7e6;
const kl = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const fehler = (code, text) => new BildwerkFehler(code, text);

/** Shader-Stufe für 'auffrischen' – gleicher Flicken-Aufbau wie 'entfernen' (entfernen.flickenStufe, eine Flicken-Ablage). */
export const STUFEN = Object.freeze([flickenStufe([ART.AUFFRISCHEN], 'auffrischen')]);

// ================================================================ (1) Reine Rechnung: Abtasten
const sinc = (x) => (x === 0 ? 1 : Math.sin(Math.PI * x) / (Math.PI * x));
export const KERNE = Object.freeze({
  lanczos3: { r: 3, f: (x) => (Math.abs(x) < 3 ? sinc(x) * sinc(x / 3) : 0) },
  bikubisch: { r: 2, f: (x) => { const a = -0.5, t = Math.abs(x); return t <= 1 ? (a + 2) * t ** 3 - (a + 3) * t ** 2 + 1 : t < 2 ? a * t ** 3 - 5 * a * t ** 2 + 8 * a * t - 4 * a : 0; } },
  linear: { r: 1, f: (x) => Math.max(0, 1 - Math.abs(x)) },
});
function phasen(f, kern) {
  const n = 2 * kern.r, w = new Float32Array(f * n), k0 = new Int32Array(f);
  for (let p = 0; p < f; p++) {
    const d = (p + 0.5) / f - 0.5; k0[p] = Math.floor(d) - kern.r + 1; let s = 0;
    for (let j = 0; j < n; j++) { const v = kern.f(d - (k0[p] + j)); w[p * n + j] = v; s += v; }
    for (let j = 0; j < n; j++) w[p * n + j] /= s;
  }
  return { n, w, k0 };
}
/** Ganzzahlig vergrößern (separabel), c Kanäle verschachtelt, Ränder geklemmt. */
export function hochF(src, b, h, c, f, kern = KERNE.lanczos3) {
  const P = phasen(f, kern), B = b * f, H = h * f, tmp = new Float32Array(B * h * c), out = new Float32Array(B * H * c);
  for (let y = 0; y < h; y++) {
    const zo = y * b;
    for (let X = 0; X < B; X++) {
      const i = (X / f) | 0, p = X - i * f, k0 = i + P.k0[p], wo = p * P.n, o = (y * B + X) * c;
      for (let j = 0; j < P.n; j++) {
        let x = k0 + j; x = x < 0 ? 0 : x >= b ? b - 1 : x; const wv = P.w[wo + j], s = (zo + x) * c;
        for (let k = 0; k < c; k++) tmp[o + k] += wv * src[s + k];
      }
    }
  }
  const zl = B * c;
  for (let Y = 0; Y < H; Y++) {
    const i = (Y / f) | 0, p = Y - i * f, k0 = i + P.k0[p], wo = p * P.n, o = Y * zl;
    for (let j = 0; j < P.n; j++) {
      let y = k0 + j; y = y < 0 ? 0 : y >= h ? h - 1 : y; const wv = P.w[wo + j], s = y * zl;
      for (let x = 0; x < zl; x++) out[o + x] += wv * tmp[s + x];
    }
  }
  return out;
}
/** Flächenmittel f×f (Modell der Bildaufnahme: ein Pixel = Mittel seiner Teilpixel). */
export function runterF(src, B, H, c, f) {
  const b = (B / f) | 0, h = (H / f) | 0, out = new Float32Array(b * h * c), inv = 1 / (f * f);
  for (let Y = 0; Y < h * f; Y++) {
    const yo = ((Y / f) | 0) * b;
    for (let X = 0; X < b * f; X++) { const s = (Y * B + X) * c, o = (yo + ((X / f) | 0)) * c; for (let k = 0; k < c; k++) out[o + k] += src[s + k]; }
  }
  for (let i = 0; i < out.length; i++) out[i] *= inv;
  return out;
}
function minMax3(src, b, h, c) {
  const mn = new Float32Array(src.length), mx = new Float32Array(src.length);
  for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) for (let k = 0; k < c; k++) {
    let lo = Infinity, hi = -Infinity;
    for (let dy = -1; dy <= 1; dy++) { const yy = y + dy < 0 ? 0 : y + dy >= h ? h - 1 : y + dy;
      for (let dx = -1; dx <= 1; dx++) { const xx = x + dx < 0 ? 0 : x + dx >= b ? b - 1 : x + dx, v = src[(yy * b + xx) * c + k]; if (v < lo) lo = v; if (v > hi) hi = v; } }
    const i = (y * b + x) * c + k; mn[i] = lo; mx[i] = hi;
  }
  return { mn, mx };
}
const zuRGBF = (d, n) => { const o = new Float32Array(n * 3); for (let i = 0; i < n; i++) { o[i * 3] = d[i * 4]; o[i * 3 + 1] = d[i * 4 + 1]; o[i * 3 + 2] = d[i * 4 + 2]; } return o; };

/**
 * Klassischer Kern: bikubisch (oder Lanczos-3), dann Rück-Projektion (das Ergebnis muss verkleinert wieder das Eingangsbild ergeben →
 * echte Kanten werden steiler, ohne neue Struktur zu erfinden), dann Begrenzung auf das lokale Min/Max (keine Säume).
 */
export function hochKern(src, b, h, f, o = {}) {
  const iter = o.iter ?? 3, lam = o.lambda ?? 1, t = o.toleranz ?? 2;
  // Start bikubisch (gemessen besser als Lanczos-3 als Start der Rück-Projektion: weniger Überschwingen auf Textur)
  const est = hochF(src, b, h, 3, f, KERNE[o.init || 'bikubisch']), B = b * f, H = h * f;
  for (let it = 0; it < iter; it++) {
    const d = runterF(est, B, H, 3, f); for (let i = 0; i < d.length; i++) d[i] = src[i] - d[i];
    const e = hochF(d, b, h, 3, f, KERNE.bikubisch); for (let i = 0; i < est.length; i++) est[i] += lam * e[i];
  }
  if (o.klemme !== false) {
    const { mn, mx } = minMax3(src, b, h, 3), mnH = hochF(mn, b, h, 3, f, KERNE.linear), mxH = hochF(mx, b, h, 3, f, KERNE.linear);
    for (let i = 0; i < est.length; i++) { const lo = mnH[i] - t, hi = mxH[i] + t, v = est[i]; est[i] = v < lo ? lo : v > hi ? hi : v; }
  }
  return est;
}

/**
 * Rück-Projektion auf ein fertiges Hochskalier-Ergebnis (z. B. Modell): Verkleinert muss es wieder das Eingangsbild
 * ergeben. Entfernt erfundene Helligkeits-/Farbabweichungen des Modells, behält seine scharfen Kanten. In Blöcken.
 */
export function rueckProjektion(klein, gross, f, o = {}) {
  const iter = o.iter ?? 2, block = 192, rand = 8, { b, h } = klein, B = b * f;
  const aus = new Uint8ClampedArray(gross.daten);
  for (let by = 0; by < h; by += block) for (let bx = 0; bx < b; bx += block) {
    const x0 = Math.max(0, bx - rand), y0 = Math.max(0, by - rand), x1 = Math.min(b, bx + block + rand), y1 = Math.min(h, by + block + rand), ib = x1 - x0, ih = y1 - y0, IB = ib * f, IH = ih * f;
    const src = new Float32Array(ib * ih * 3), est = new Float32Array(IB * IH * 3);
    for (let y = 0; y < ih; y++) for (let x = 0; x < ib; x++) { const s2 = ((y0 + y) * b + x0 + x) * 4, o2 = (y * ib + x) * 3; for (let k = 0; k < 3; k++) src[o2 + k] = klein.daten[s2 + k]; }
    for (let y = 0; y < IH; y++) for (let x = 0; x < IB; x++) { const s2 = ((y0 * f + y) * B + x0 * f + x) * 4, o2 = (y * IB + x) * 3; for (let k = 0; k < 3; k++) est[o2 + k] = gross.daten[s2 + k]; }
    for (let it = 0; it < iter; it++) {
      const d = runterF(est, IB, IH, 3, f); for (let i = 0; i < d.length; i++) d[i] = src[i] - d[i];
      const e = hochF(d, ib, ih, 3, f, KERNE.bikubisch); for (let i = 0; i < est.length; i++) est[i] += e[i];
    }
    const cx0 = (bx - x0) * f, cy0 = (by - y0) * f, cb = Math.min(block, b - bx) * f, ch = Math.min(block, h - by) * f;
    for (let y = 0; y < ch; y++) for (let x = 0; x < cb; x++) { const s2 = ((cy0 + y) * IB + cx0 + x) * 3, o2 = ((by * f + y) * B + bx * f + x) * 4; aus[o2] = est[s2]; aus[o2 + 1] = est[s2 + 1]; aus[o2 + 2] = est[s2 + 2]; }
  }
  return { ...gross, daten: aus };
}

/** In Blöcken rechnen (Speicher begrenzt), Kontext-Rand, nur die Mitte schreiben. kern(rgbF, b, h) → rgbF (b·f × h·f). */
function bloecke(kachel, f, kern, { block = 256, rand = 12 } = {}) {
  const { b, h, daten } = kachel, B = b * f, H = h * f, aus = new Uint8ClampedArray(B * H * 4);
  for (let by = 0; by < h; by += block) for (let bx = 0; bx < b; bx += block) {
    const x0 = Math.max(0, bx - rand), y0 = Math.max(0, by - rand), x1 = Math.min(b, bx + block + rand), y1 = Math.min(h, by + block + rand);
    const ib = x1 - x0, ih = y1 - y0, ein = new Float32Array(ib * ih * 3);
    for (let y = 0; y < ih; y++) for (let x = 0; x < ib; x++) { const s = ((y0 + y) * b + x0 + x) * 4, o = (y * ib + x) * 3; ein[o] = daten[s]; ein[o + 1] = daten[s + 1]; ein[o + 2] = daten[s + 2]; }
    const r = kern(ein, ib, ih), RB = ib * f;
    const cx0 = (bx - x0) * f, cy0 = (by - y0) * f, cb = Math.min(block, b - bx) * f, ch = Math.min(block, h - by) * f;
    for (let y = 0; y < ch; y++) for (let x = 0; x < cb; x++) {
      const s = ((cy0 + y) * RB + cx0 + x) * 3, Y = by * f + y, X = bx * f + x, o = (Y * B + X) * 4;
      aus[o] = r[s]; aus[o + 1] = r[s + 1]; aus[o + 2] = r[s + 2]; aus[o + 3] = daten[(((Y / f) | 0) * b + ((X / f) | 0)) * 4 + 3];
    }
  }
  return { b: B, h: H, daten: aus, farbraum: kachel.farbraum };
}

/** Rückfall ohne Modell: bikubischer Start + Rück-Projektion (3×) + Saum-Begrenzung, in Blöcken (Speicher). */
export function hochskaliereKlassisch(kachel, faktor, opts = {}) {
  const f = faktor | 0; if (f < 1 || f > 8) throw fehler(FEHLER.UNBEKANNT, 'Faktor 2 oder 4');
  const r = bloecke(kachel, f, (s, b, h) => hochKern(s, b, h, f, opts), { rand: 12 });
  if (opts.modus === 'kreativ') detailSynthese(r, opts.staerke ?? 0.6, { faktor: f, ox: opts.ox, oy: opts.oy });
  r.verfahren = 'klassisch'; return r;
}
/** Vergleichs-Verfahren für Tests/Anzeige: reines Bikubisch (Keys a = −0,5). */
export function hochskaliereBikubisch(kachel, faktor) {
  return bloecke(kachel, faktor, (s, b, h) => hochF(s, b, h, 3, faktor, KERNE.bikubisch), { rand: 4 });
}

// ---------------------------------------------------------------- Kreativ: Detail-Synthese (ohne Generator)
const SYN_SCHWELLE = 1.0;   // Textur-Dichte (Stufen von 255), ab der Detail ergänzt wird
const hash = (x, y) => { let n = (x * 374761393 + y * 668265263) | 0; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296 - 0.5; };
/** Gauß-Unschärfe (separabel) auf einer Ebene. */
export function gauss(src, b, h, sigma) {
  if (sigma <= 0.01) return Float32Array.from(src);
  const r = Math.ceil(sigma * 3), k = new Float32Array(2 * r + 1); let s = 0;
  for (let i = -r; i <= r; i++) { k[i + r] = Math.exp(-(i * i) / (2 * sigma * sigma)); s += k[i + r]; }
  for (let i = 0; i < k.length; i++) k[i] /= s;
  const t = new Float32Array(b * h), o = new Float32Array(b * h);
  for (let y = 0; y < h; y++) { const z = y * b; for (let x = 0; x < b; x++) { let v = 0; for (let i = -r; i <= r; i++) { const xx = x + i < 0 ? 0 : x + i >= b ? b - 1 : x + i; v += k[i + r] * src[z + xx]; } t[z + x] = v; } }
  for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) { let v = 0; for (let i = -r; i <= r; i++) { const yy = y + i < 0 ? 0 : y + i >= h ? h - 1 : y + i; v += k[i + r] * t[yy * b + x]; } o[y * b + x] = v; }
  return o;
}
/**
 * „Kreativ“: feine, an der örtlichen Struktur ausgerichtete Textur ergänzen – nur dort, wo das kleine Bild schon Textur
 * hatte (Haare, Stoff, Laub), nicht auf Flächen und nicht an einzelnen harten Kanten (kein Saum). Luminanz-only, fester
 * Zufall je Bildposition (ox/oy = Kachel-Versatz), damit Kacheln zusammenpassen. Ändert bild.daten an Ort und Stelle.
 */
export function detailSynthese(bild, staerke = 0.6, o = {}) {
  const { b, h, daten } = bild, n = b * h, f = o.faktor || 4, ox = o.ox | 0, oy = o.oy | 0;
  if (staerke <= 0) return bild;
  const Y = new Float32Array(n); for (let i = 0; i < n; i++) Y[i] = 0.2126 * daten[i * 4] + 0.7152 * daten[i * 4 + 1] + 0.0722 * daten[i * 4 + 2];
  const g1 = gauss(Y, b, h, f * 0.5), g2 = gauss(Y, b, h, f * 1.5);
  const tex = new Float32Array(n); for (let i = 0; i < n; i++) { const d = g1[i] - g2[i]; tex[i] = d * d; }
  const E = gauss(tex, b, h, f * 2);
  // Struktur-Tensor (Richtung) auf Skala f
  const gx = new Float32Array(n), gy = new Float32Array(n);
  for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) { const i = y * b + x, xl = x > 0 ? i - 1 : i, xr = x < b - 1 ? i + 1 : i, yu = y > 0 ? i - b : i, yd = y < h - 1 ? i + b : i; gx[i] = (g1[xr] - g1[xl]) / 2; gy[i] = (g1[yd] - g1[yu]) / 2; }
  const jxx = new Float32Array(n), jxy = new Float32Array(n), jyy = new Float32Array(n);
  for (let i = 0; i < n; i++) { jxx[i] = gx[i] * gx[i]; jxy[i] = gx[i] * gy[i]; jyy[i] = gy[i] * gy[i]; }
  const Jxx = gauss(jxx, b, h, f), Jxy = gauss(jxy, b, h, f), Jyy = gauss(jyy, b, h, f);
  // Rauschen, band-begrenzt, dann entlang der Struktur verschmiert (Strähnen statt Körnchen)
  const roh = new Float32Array(n); for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) roh[y * b + x] = hash(x + ox, y + oy);
  const nb = gauss(roh, b, h, 0.6), nb2 = gauss(roh, b, h, 1.6); for (let i = 0; i < n; i++) nb[i] -= nb2[i];
  const L = Math.max(2, Math.round(f * 1.2)), add = new Float32Array(n);
  for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) {
    const i = y * b + x, a = Jxx[i], c = Jxy[i], d = Jyy[i], tr = a + d, det = Math.sqrt(Math.max(0, (a - d) * (a - d) + 4 * c * c));
    const l1 = (tr + det) / 2, l2 = (tr - det) / 2, koh = tr > 1e-6 ? (l1 - l2) / (l1 + l2 + 1e-6) : 0;
    let tx = -c, ty = a - l1; if (Math.abs(tx) + Math.abs(ty) < 1e-9) { tx = 1; ty = 0; } const tn = Math.hypot(tx, ty); tx /= tn; ty /= tn;   // Richtung entlang der Kante
    let s = 0, m = 0;
    for (let k = -L; k <= L; k++) { const xx = Math.round(x + tx * k * koh), yy = Math.round(y + ty * k * koh); if (xx < 0 || yy < 0 || xx >= b || yy >= h) continue; s += nb[yy * b + xx]; m++; }
    const strich = m ? s / Math.sqrt(m) : 0;
    // Einzelkante: hoher Gradient bei wenig Textur ringsum → keine Synthese
    const grad = Math.sqrt(tr), dichte = Math.sqrt(E[i]), kante = kl((grad * 0.5 - dichte * 2) / (dichte * 2 + 2));
    add[i] = staerke * 5 * strich * Math.min(12, Math.max(0, dichte - SYN_SCHWELLE)) * (1 - kante);   // unter der Schwelle (glatte Haut, Fläche): nichts
  }
  for (let i = 0; i < n; i++) { const a = add[i]; if (a === 0) continue; const p = i * 4; daten[p] = daten[p] + a; daten[p + 1] = daten[p + 1] + a; daten[p + 2] = daten[p + 2] + a; }
  return bild;
}

// ---------------------------------------------------------------- Modell-Kacheln (Real-ESRGAN-Klasse, ×4 fest)
/**
 * Kachelweise durch ein ×4-Modell. lauf(einNCHW: Float32Array, b, h) → Float32Array NCHW (4b × 4h), Werte 0..1.
 * Kontext-Rand je Kachel, nur die Mitte wird geschrieben (keine Überblendung nötig, Naht gemessen). faktor 2 = ×4, dann Flächenmittel 2×2.
 */
export async function hochModell(kachel, faktor, lauf, o = {}) {
  const { b, h, daten } = kachel, T = o.kachel || 128, R = o.rand ?? 16, F = 4, red = F / faktor;
  if (![2, 4].includes(faktor)) throw fehler(FEHLER.UNBEKANNT, 'Faktor 2 oder 4');
  const B = b * faktor, H = h * faktor, aus = new Uint8ClampedArray(B * H * 4);
  const gesamt = Math.ceil(b / T) * Math.ceil(h / T); let fertig = 0;
  for (let ty = 0; ty < h; ty += T) for (let tx = 0; tx < b; tx += T) {
    if (o.signal?.aborted) throw fehler(FEHLER.ABBRUCH, 'abgebrochen');
    const x0 = Math.max(0, tx - R), y0 = Math.max(0, ty - R), x1 = Math.min(b, tx + T + R), y1 = Math.min(h, ty + T + R), ib = x1 - x0, ih = y1 - y0, m = ib * ih;
    const ein = new Float32Array(3 * m);
    for (let y = 0; y < ih; y++) for (let x = 0; x < ib; x++) { const s = ((y0 + y) * b + x0 + x) * 4, i = y * ib + x; ein[i] = daten[s] / 255; ein[m + i] = daten[s + 1] / 255; ein[2 * m + i] = daten[s + 2] / 255; }
    const r = await lauf(ein, ib, ih), OB = ib * F, OM = OB * ih * F;
    const cb = Math.min(T, b - tx), ch = Math.min(T, h - ty), ox = (tx - x0) * F, oy = (ty - y0) * F;
    for (let y = 0; y < ch * faktor; y++) for (let x = 0; x < cb * faktor; x++) {
      const Y = ty * faktor + y, X = tx * faktor + x, o4 = (Y * B + X) * 4;
      for (let k = 0; k < 3; k++) {
        let v = 0;
        for (let dy = 0; dy < red; dy++) for (let dx = 0; dx < red; dx++) v += r[k * OM + (oy + y * red + dy) * OB + ox + x * red + dx];
        aus[o4 + k] = (v / (red * red)) * 255 + 0.5;
      }
      aus[o4 + 3] = daten[(((Y / faktor) | 0) * b + ((X / faktor) | 0)) * 4 + 3];
    }
    fertig++; o.fortschritt?.(fertig / gesamt, `Teil ${fertig}/${gesamt}`);
  }
  return { b: B, h: H, daten: aus, farbraum: kachel.farbraum };
}

/** Grobe Dauer-Schätzung (Sekunden) – Messwerte siehe LOG.md; ms je Eingangs-Pixel. */
export const DAUER_MS_JE_PX = Object.freeze({ modellWasm: 0.16, modellGpu: 0.02, klassisch: 0.004 });   // gemessen: WASM 1 Faden 0,11–0,16 (Container); GPU geschätzt
export function schaetzeDauer(eingangPx, verfahren = 'modellWasm') { return (eingangPx * (DAUER_MS_JE_PX[verfahren] ?? 0.2)) / 1000; }

// ================================================================ (1b) Reine Rechnung: Gesicht
/** SFace/ArcFace-Vorlage 112×112: rechtes Auge (Bild links), linkes Auge, Nase, Mundwinkel rechts, links. */
export const SFACE_VORLAGE = Object.freeze([38.2946, 51.6963, 73.5318, 51.5014, 56.0252, 71.7366, 41.5493, 92.3655, 70.7299, 92.2041]);
/** Ähnlichkeits-Transformation (kleinste Quadrate) von → nach: x' = a·x − b·y + tx, y' = b·x + a·y + ty. */
export function aehnlichkeit(von, nach) {
  const n = von.length / 2; let mx = 0, my = 0, ux = 0, uy = 0;
  for (let i = 0; i < n; i++) { mx += von[2 * i]; my += von[2 * i + 1]; ux += nach[2 * i]; uy += nach[2 * i + 1]; }
  mx /= n; my /= n; ux /= n; uy /= n; let sxx = 0, sa = 0, sb = 0;
  for (let i = 0; i < n; i++) { const vx = von[2 * i] - mx, vy = von[2 * i + 1] - my, wx = nach[2 * i] - ux, wy = nach[2 * i + 1] - uy; sxx += vx * vx + vy * vy; sa += vx * wx + vy * wy; sb += vx * wy - vy * wx; }
  const a = sa / (sxx || 1), b = sb / (sxx || 1);
  return [a, b, ux - a * mx + b * my, uy - b * mx - a * my];
}
const wende = (T, x, y) => [T[0] * x - T[1] * y + T[2], T[1] * x + T[0] * y + T[3]];
function abtastenU8(d, b, h, x, y, out, o) {
  x = x < 0 ? 0 : x > b - 1 ? b - 1 : x; y = y < 0 ? 0 : y > h - 1 ? h - 1 : y;
  const x0 = x | 0, y0 = y | 0, x1 = Math.min(b - 1, x0 + 1), y1 = Math.min(h - 1, y0 + 1), wx = x - x0, wy = y - y0;
  for (let k = 0; k < 3; k++) out[o + k] = (d[(y0 * b + x0) * 4 + k] * (1 - wx) + d[(y0 * b + x1) * 4 + k] * wx) * (1 - wy) + (d[(y1 * b + x0) * 4 + k] * (1 - wx) + d[(y1 * b + x1) * 4 + k] * wx) * wy;
}
/** Gesicht auf 112×112 ausrichten (5 Punkte in Pixeln von bild). Erwartet ein Bild, in dem der Augenabstand ≲ 2× Vorlage ist (sonst vorher verkleinern). */
export function richteAus(bild, p5, kante = 112) {
  const s = kante / 112, V = SFACE_VORLAGE.map((v) => v * s), T = aehnlichkeit(V, p5), out = new Uint8ClampedArray(kante * kante * 4), px = new Float32Array(3);
  for (let v = 0; v < kante; v++) for (let u = 0; u < kante; u++) { const [x, y] = wende(T, u, v); abtastenU8(bild.daten, bild.b, bild.h, x, y, px, 0); const o = (v * kante + u) * 4; out[o] = px[0]; out[o + 1] = px[1]; out[o + 2] = px[2]; out[o + 3] = 255; }
  return { b: kante, h: kante, daten: out };
}
/** Flächen-Verkleinerung/bilineare Vergrößerung eines Ausschnitts (px) von BildU8 auf dw×dh. */
export function ausschnittU8(bild, r, dw, dh) {
  const { b, h, daten } = bild, out = new Uint8ClampedArray(dw * dh * 4), sx = r.b / dw, sy = r.h / dh, px = new Float32Array(3);
  for (let y = 0; y < dh; y++) for (let x = 0; x < dw; x++) {
    const o = (y * dw + x) * 4;
    if (sx <= 1.01 && sy <= 1.01) { abtastenU8(daten, b, h, r.x + (x + 0.5) * sx - 0.5, r.y + (y + 0.5) * sy - 0.5, px, 0); out[o] = px[0]; out[o + 1] = px[1]; out[o + 2] = px[2]; }
    else {
      const xa = Math.max(0, Math.floor(r.x + x * sx)), xe = Math.min(b, Math.max(xa + 1, Math.floor(r.x + (x + 1) * sx))), ya = Math.max(0, Math.floor(r.y + y * sy)), ye = Math.min(h, Math.max(ya + 1, Math.floor(r.y + (y + 1) * sy)));
      let s0 = 0, s1 = 0, s2 = 0, m = 0; for (let yy = ya; yy < ye; yy++) for (let xx = xa; xx < xe; xx++) { const i = (yy * b + xx) * 4; s0 += daten[i]; s1 += daten[i + 1]; s2 += daten[i + 2]; m++; }
      m = m || 1; out[o] = s0 / m; out[o + 1] = s1 / m; out[o + 2] = s2 / m;
    }
    out[o + 3] = 255;
  }
  return { b: dw, h: dh, daten: out };
}
/** 5 Punkte (normiert, Gesicht.punkte5) → Ausschnitt-Rechteck in px, sodass der Augenabstand ≈ 2× Vorlage wird. */
export function merkmalAusschnitt(p5n, b, h) {
  const P = Array.from(p5n, (v, i) => v * (i % 2 ? h : b)), aug = Math.hypot(P[2] - P[0], P[3] - P[1]) || 1;
  const cx = (P[0] + P[2] + P[6] + P[8]) / 4, cy = (P[1] + P[3] + P[7] + P[9]) / 4, gr = aug * 3.2;
  const r = { x: Math.round(cx - gr / 2), y: Math.round(cy - gr / 2), b: Math.round(gr), h: Math.round(gr) };
  const ziel = Math.max(48, Math.min(r.b, Math.round((r.b / aug) * 70)));   // Augenabstand → ~70 px
  return { r, kante: ziel, punkte: P.map((v, i) => ((v - (i % 2 ? r.y : r.x)) / r.b) * ziel), augenPx: aug };
}
/** Kosinus-Ähnlichkeit zweier L2-normierter Merkmale. */
export function vergleiche(a, b) { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * b[i]; return s; }
export function normiere(v) { let s = 0; for (let i = 0; i < v.length; i++) s += v[i] * v[i]; s = Math.sqrt(s) || 1; const o = new Float32Array(v.length); for (let i = 0; i < v.length; i++) o[i] = v[i] / s; return o; }
/** @param {number[]} werte Kosinus je Referenz @returns {{erlaubt:boolean,median:number,grund:string}} */
export function identitaetsUrteil(werte) {
  if (!werte.length) return { erlaubt: false, median: 0, grund: 'Keine Referenz' };
  const s = [...werte].sort((x, y) => x - y); const m = s[Math.floor(s.length / 2)];
  if (m >= IDENTITAET.median && s[0] >= IDENTITAET.schwelle) return { erlaubt: true, median: m, grund: 'Dieselbe Person' };
  if (m >= IDENTITAET.grau) return { erlaubt: false, median: m, grund: 'Nicht eindeutig dieselbe Person' };
  return { erlaubt: false, median: m, grund: 'Andere Person' };
}
/**
 * Urteil über eine Referenz-Liste: Jede Referenz unter der Schwelle wird ausgeschlossen (nie benutzt). Freigabe nur,
 * wenn die übrigen das Urteil bestehen. Fremde Referenzen machen die Freigabe nicht kaputt, werden aber gemeldet.
 */
export function urteilListe(kosinusse) {
  const passend = [], abgelehnt = [];
  kosinusse.forEach((k, i) => (k >= IDENTITAET.schwelle ? passend : abgelehnt).push(i));
  const u = identitaetsUrteil(passend.map((i) => kosinusse[i]));
  if (!passend.length) { const alle = identitaetsUrteil(kosinusse); return { passend, abgelehnt, urteil: { ...alle, erlaubt: false } }; }
  return { passend, abgelehnt, urteil: u };
}

// ---------------------------------------------------------------- Delaunay, Verformung
/** Bowyer-Watson. pts flach [x0,y0,x1,y1,…] → Dreiecke als Index-Tripel (Uint32Array). */
export function delaunay(pts) {
  const n = pts.length / 2; let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (let i = 0; i < n; i++) { const x = pts[2 * i], y = pts[2 * i + 1]; if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y; }
  const d = Math.max(x1 - x0, y1 - y0) * 20 || 1, mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
  const P = Array.from(pts); P.push(mx - d, my - d, mx + d, my - d, mx, my + d);
  const kreis = (a, b, c) => {
    const ax = P[2 * a], ay = P[2 * a + 1], bx = P[2 * b], by = P[2 * b + 1], cx = P[2 * c], cy = P[2 * c + 1];
    const D = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by)) || 1e-12;
    const ux = ((ax * ax + ay * ay) * (by - cy) + (bx * bx + by * by) * (cy - ay) + (cx * cx + cy * cy) * (ay - by)) / D;
    const uy = ((ax * ax + ay * ay) * (cx - bx) + (bx * bx + by * by) * (ax - cx) + (cx * cx + cy * cy) * (bx - ax)) / D;
    return [a, b, c, ux, uy, (ax - ux) ** 2 + (ay - uy) ** 2];
  };
  let tris = [kreis(n, n + 1, n + 2)];
  for (let i = 0; i < n; i++) {
    const px = P[2 * i], py = P[2 * i + 1], schlecht = [], gut = [];
    for (const t of tris) ((px - t[3]) ** 2 + (py - t[4]) ** 2 < t[5] * (1 + 1e-9) ? schlecht : gut).push(t);
    const kanten = new Map();
    for (const t of schlecht) for (const [a, b] of [[t[0], t[1]], [t[1], t[2]], [t[2], t[0]]]) { const k = a < b ? `${a},${b}` : `${b},${a}`; kanten.set(k, kanten.has(k) ? null : [a, b]); }
    for (const e of kanten.values()) if (e) gut.push(kreis(e[0], e[1], i));
    tris = gut;
  }
  const aus = []; for (const t of tris) if (t[0] < n && t[1] < n && t[2] < n) aus.push(t[0], t[1], t[2]);
  return Uint32Array.from(aus);
}
/**
 * Stückweise affine Verformung: Bild ref (BildU8) so verformen, dass refPts auf zielPts landen. Ergebnis RGB-Float
 * (0..255) in Zielgröße zb×zh. Punkte in Pixeln. tris = Dreiecke über zielPts.
 */
export function verforme(ref, refPts, zielPts, tris, zb, zh) {
  const out = new Float32Array(zb * zh * 3), gesetzt = new Uint8Array(zb * zh), px = new Float32Array(3);
  for (let t = 0; t < tris.length; t += 3) {
    const i = tris[t], j = tris[t + 1], k = tris[t + 2];
    const ax = zielPts[2 * i], ay = zielPts[2 * i + 1], bx = zielPts[2 * j], by = zielPts[2 * j + 1], cx = zielPts[2 * k], cy = zielPts[2 * k + 1];
    const D = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy); if (Math.abs(D) < 1e-9) continue;
    const xa = Math.max(0, Math.floor(Math.min(ax, bx, cx))), xe = Math.min(zb - 1, Math.ceil(Math.max(ax, bx, cx))), ya = Math.max(0, Math.floor(Math.min(ay, by, cy))), ye = Math.min(zh - 1, Math.ceil(Math.max(ay, by, cy)));
    for (let y = ya; y <= ye; y++) for (let x = xa; x <= xe; x++) {
      const o = y * zb + x; if (gesetzt[o]) continue;
      const qx = x + 0.5, qy = y + 0.5, l1 = ((by - cy) * (qx - cx) + (cx - bx) * (qy - cy)) / D, l2 = ((cy - ay) * (qx - cx) + (ax - cx) * (qy - cy)) / D, l3 = 1 - l1 - l2;
      if (l1 < -1e-4 || l2 < -1e-4 || l3 < -1e-4) continue;
      const rx = l1 * refPts[2 * i] + l2 * refPts[2 * j] + l3 * refPts[2 * k] - 0.5, ry = l1 * refPts[2 * i + 1] + l2 * refPts[2 * j + 1] + l3 * refPts[2 * k + 1] - 0.5;
      abtastenU8(ref.daten, ref.b, ref.h, rx, ry, px, 0); out[o * 3] = px[0]; out[o * 3 + 1] = px[1]; out[o * 3 + 2] = px[2]; gesetzt[o] = 1;
    }
  }
  return { daten: out, gesetzt };
}
/** Randpunkte (Ecken + Kantenmitten + Drittel) eines Rechtecks b×h, leicht außerhalb. */
export function randPunkte(b, h) {
  const p = []; for (const fx of [0, 1 / 3, 2 / 3, 1]) { p.push(fx * b, -1, fx * b, h + 1); } for (const fy of [1 / 3, 2 / 3]) { p.push(-1, fy * h, b + 1, fy * h); }
  return p;
}

// ---------------------------------------------------------------- Regionen aus 478 Gesichtspunkten
export const REGION = Object.freeze({
  oval: [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109],
  augeL: [263, 249, 390, 373, 374, 380, 381, 382, 362, 398, 384, 385, 386, 387, 388, 466, 276, 283, 282, 295, 285, 300, 293, 334, 296, 336],
  augeR: [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246, 46, 53, 52, 65, 55, 70, 63, 105, 66, 107],
  lippen: [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185],
});
function huelle(P) {   // konvexe Hülle (monotone Kette), P = [[x,y]]
  const p = [...P].sort((a, b) => a[0] - b[0] || a[1] - b[1]), x = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const u = [], l = []; for (const q of p) { while (l.length >= 2 && x(l[l.length - 2], l[l.length - 1], q) <= 0) l.pop(); l.push(q); }
  for (const q of p.reverse()) { while (u.length >= 2 && x(u[u.length - 2], u[u.length - 1], q) <= 0) u.pop(); u.push(q); }
  return l.slice(0, -1).concat(u.slice(0, -1));
}
function fuelle(poly, b, h, wert, ziel) {
  let y0 = Infinity, y1 = -Infinity; for (const p of poly) { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
  for (let y = Math.max(0, Math.floor(y0)); y <= Math.min(h - 1, Math.ceil(y1)); y++) {
    const xs = [], cy = y + 0.5;
    for (let i = 0; i < poly.length; i++) { const a = poly[i], c = poly[(i + 1) % poly.length]; if ((a[1] <= cy) !== (c[1] <= cy)) xs.push(a[0] + ((cy - a[1]) / (c[1] - a[1])) * (c[0] - a[0])); }
    xs.sort((p, q) => p - q);
    for (let k = 0; k + 1 < xs.length; k += 2) for (let x = Math.max(0, Math.ceil(xs[k] - 0.5)); x <= Math.min(b - 1, Math.floor(xs[k + 1] - 0.5)); x++) ziel[y * b + x] = Math.max(ziel[y * b + x], wert);
  }
}
/** Gewichtskarte (0..1) für den Detail-Übertrag: Augen+Brauen, Lippen, Haut, Haare. pts = 478 Punkte (px, flach x,y). */
export function regionsKarte(pts, b, h, p) {
  const P = (ids) => ids.map((i) => [pts[2 * i], pts[2 * i + 1]]);
  const oval = huelle(P(REGION.oval)), augen = [huelle(P(REGION.augeL)), huelle(P(REGION.augeR))], lippen = huelle(P(REGION.lippen));
  const aug = Math.hypot(pts[2 * 468] - pts[2 * 473], pts[2 * 468 + 1] - pts[2 * 473 + 1]) || Math.hypot(pts[2 * 33] - pts[2 * 263], pts[2 * 33 + 1] - pts[2 * 263 + 1]) || b / 4;
  const grow = (poly, s) => { let cx = 0, cy = 0; for (const q of poly) { cx += q[0]; cy += q[1]; } cx /= poly.length; cy /= poly.length; return poly.map(([x, y]) => [cx + (x - cx) * s, cy + (y - cy) * s]); };
  const haut = new Float32Array(b * h), au = new Float32Array(b * h), li = new Float32Array(b * h), haar = new Float32Array(b * h);
  fuelle(oval, b, h, 1, haut); for (const a of augen) fuelle(grow(a, 1.35), b, h, 1, au); fuelle(grow(lippen, 1.1), b, h, 1, li);
  // Haare: Ring außerhalb des Ovals (aufwärts/seitlich), weich auslaufend
  const ovalGross = new Float32Array(b * h); fuelle(grow(oval, 1.6), b, h, 1, ovalGross);
  for (let i = 0; i < haar.length; i++) haar[i] = ovalGross[i] * (1 - haut[i]);
  const w = aug * 0.06, ws = aug * 0.15;
  const A = gauss(au, b, h, w), Li = gauss(li, b, h, w), Hh = gauss(haut, b, h, ws), Ha = gauss(haar, b, h, ws);
  const m = new Float32Array(b * h);
  for (let i = 0; i < m.length; i++) {
    const aw = A[i] * (p.augen ?? 1), lw = Li[i] * (p.haut ?? 0.5), hw = Math.max(0, Hh[i] - A[i] - Li[i]) * (p.haut ?? 0.5), hr = Ha[i] * (p.haare ?? 0.8);
    m[i] = kl(Math.max(aw, lw, hw, hr));
  }
  return { karte: m, augenPx: aug };
}

// ---------------------------------------------------------------- Detail-Übertrag (Kern von „Gesicht auffrischen“)
const lum = (d, i, c) => 0.2126 * d[i * c] + 0.7152 * d[i * c + 1] + 0.0722 * d[i * c + 2];
/**
 * Nur feine Bänder (log-Luminanz, Differenz von Gauß, σ = 0 | s | 2s | 4s) aus den verformten Referenzen übernehmen –
 * und nur dort, wo dem Foto Detail fehlt (Defizit) UND die gröbere Struktur von Foto und Referenz übereinstimmt
 * (örtliche Korrelation, verhindert Geisterbilder). Farbe, Licht, Form bleiben die des Fotos → keine Identitäts-Drift.
 * ziel: Float32 RGB 0..255 (b×h). refs: [{ daten: Float32 RGB, gesetzt?: Uint8Array }]. Liefert Δlog-Luminanz.
 */
export function detailUebertrag(ziel, refs, b, h, karte, o = {}) {
  const n = b * h, s0 = o.sigma ?? Math.max(0.7, (o.augenPx || 60) / 90), stufen = o.stufen ?? 3, staerke = o.staerke ?? 0.6;
  const lT = new Float32Array(n); for (let i = 0; i < n; i++) lT[i] = Math.log(lum(ziel, i, 3) + 2);
  const sig = [0]; for (let l = 0; l < stufen; l++) sig.push(s0 * 2 ** l);
  const baender = (l0) => { const G = sig.map((s) => (s ? gauss(l0, b, h, s) : l0)); return { B: sig.slice(0, -1).map((_, l) => { const o2 = new Float32Array(n); for (let i = 0; i < n; i++) o2[i] = G[l][i] - G[l + 1][i]; return o2; }), grob: G[G.length - 1] }; };
  const T = baender(lT), delta = new Float32Array(n), info = { refs: [] };
  const num = T.B.map(() => new Float32Array(n)), den = new Float32Array(n);
  for (const r of refs) {
    const lW = new Float32Array(n); for (let i = 0; i < n; i++) lW[i] = Math.log(lum(r.daten, i, 3) + 2);
    const W = baender(lW);
    // Struktur-Übereinstimmung auf den beiden gröberen Bändern
    const tS = new Float32Array(n), wS = new Float32Array(n); for (let i = 0; i < n; i++) { tS[i] = T.B[stufen - 1][i] + (T.B[stufen - 2]?.[i] || 0); wS[i] = W.B[stufen - 1][i] + (W.B[stufen - 2]?.[i] || 0); }
    const pr = new Float32Array(n), tt = new Float32Array(n), ww = new Float32Array(n); for (let i = 0; i < n; i++) { pr[i] = tS[i] * wS[i]; tt[i] = tS[i] * tS[i]; ww[i] = wS[i] * wS[i]; }
    const ws = sig[stufen] * 2, P = gauss(pr, b, h, ws), TT = gauss(tt, b, h, ws), WW = gauss(ww, b, h, ws);
    const g = new Float32Array(n); let gs = 0, gm = 0;
    for (let i = 0; i < n; i++) { const ncc = P[i] / Math.sqrt(TT[i] * WW[i] + 1e-8); g[i] = kl((ncc - 0.25) / 0.45) * (r.gesetzt ? r.gesetzt[i] : 1); if (karte[i] > 0.05) { gs += g[i]; gm++; } }
    info.refs.push({ uebereinstimmung: gm ? gs / gm : 0 });
    for (let l = 0; l < stufen; l++) {
      const tl = T.B[l], wl = W.B[l], et = new Float32Array(n), ew = new Float32Array(n); for (let i = 0; i < n; i++) { et[i] = tl[i] * tl[i]; ew[i] = wl[i] * wl[i]; }
      const ET = gauss(et, b, h, sig[l + 1] * 2), EW = gauss(ew, b, h, sig[l + 1] * 2), nl = num[l];
      for (let i = 0; i < n; i++) { const def = kl(1 - Math.sqrt(ET[i] / (EW[i] + 1e-9))); nl[i] += g[i] * def * (wl[i] - tl[i]); }
    }
    for (let i = 0; i < n; i++) den[i] += g[i];
  }
  let summe = 0, m = 0;
  for (let i = 0; i < n; i++) {
    if (den[i] < 1e-4) continue; let v = 0; const sk = Math.min(1, den[i]) / den[i];
    for (let l = 0; l < stufen; l++) v += num[l][i] * sk * (l === stufen - 1 ? 0.5 : 1);   // gröbstes übertragenes Band nur halb
    delta[i] = kl(v * staerke * karte[i], -0.5, 0.5); summe += Math.abs(delta[i]); m++;
  }
  info.mittel = summe / n; info.anteil = m / n;   // mittleres |Δ| über das ganze Bild, Anteil berührter Pixel
  return { delta, info };
}

/**
 * Ganzer Rechenteil „Gesicht auffrischen“ (Worker). d = { ziel: BildU8 (Arbeitsgröße), zielPts: Float32Array 478·2 px,
 * refs: [{ bild: BildU8, pts: Float32Array 478·2 px }], p: { staerke, augen, haut, haare }, voll?: BildU8 (Quell-Ausschnitt) }
 * → { flicken: BildU8 RGBA (Größe von voll oder ziel, A = weiche Deckung), info }.
 */
export function auffrischenRechnen(d) {
  const { ziel, zielPts, refs, p } = d, b = ziel.b, h = ziel.h, n = b * h;
  const zielF = zuRGBF(ziel.daten, n), rand = randPunkte(b, h);
  const { karte, augenPx } = regionsKarte(zielPts, b, h, p);
  const npts = Math.min(478, zielPts.length / 2), zp = Array.from(zielPts.subarray(0, npts * 2));
  const alleZiel = zp.concat(rand), tris = delaunay(alleZiel), verformt = [];
  for (const r of refs) {
    const T = aehnlichkeit(zp, Array.from(r.pts.subarray(0, npts * 2)));
    const refRand = []; for (let i = 0; i < rand.length; i += 2) refRand.push(...wende(T, rand[i], rand[i + 1]));
    verformt.push(verforme(r.bild, Array.from(r.pts.subarray(0, npts * 2)).concat(refRand), alleZiel, tris, b, h));
  }
  const { delta, info } = detailUebertrag(zielF, verformt, b, h, karte, { staerke: p.staerke ?? 0.6, augenPx });
  // Auf Quell-Auflösung anwenden: Δ bilinear hoch, Farbe bleibt (Verhältnis auf alle Kanäle)
  const voll = d.voll || ziel, VB = voll.b, VH = voll.h, aus = new Uint8ClampedArray(VB * VH * 4);
  const sx = b / VB, sy = h / VH;
  for (let y = 0; y < VH; y++) for (let x = 0; x < VB; x++) {
    const fx = kl((x + 0.5) * sx - 0.5, 0, b - 1), fy = kl((y + 0.5) * sy - 0.5, 0, h - 1), x0 = fx | 0, y0 = fy | 0, x1 = Math.min(b - 1, x0 + 1), y1 = Math.min(h - 1, y0 + 1), wx = fx - x0, wy = fy - y0;
    const bi = (a) => (a[y0 * b + x0] * (1 - wx) + a[y0 * b + x1] * wx) * (1 - wy) + (a[y1 * b + x0] * (1 - wx) + a[y1 * b + x1] * wx) * wy;
    const dv = bi(delta), mk = bi(karte), r = Math.exp(dv), o = (y * VB + x) * 4;
    for (let k = 0; k < 3; k++) aus[o + k] = (voll.daten[o + k] + 2) * r - 2;
    aus[o + 3] = kl(mk * 3) * 255;
  }
  info.augenPx = augenPx; info.dreiecke = tris.length / 3;
  return { flicken: { b: VB, h: VH, daten: aus }, info };
}

// ================================================================ (2) Worker-Teil (wk-ki ruft das auf)
async function schliesseBild(bild) { try { bild?.close?.(); } catch {} }
export const wkKi = {
  /** daten: { kachel, faktor, modus, laden?, staerke?, ox?, oy?, aufgabe?: 'hoch'|'klassisch'|'auffrischen' } */
  async hoch(d, h, { modelle }) {
    const aufgabe = d.aufgabe || 'hoch';
    if (aufgabe === 'auffrischen') {
      // 0.4: Ausschnitt in voller Auflösung kommt als ImageBitmap (übertragen) und wird erst hier gelesen – kein getImageData im Haupt-Faden
      if (d.vollBmp) { const vb = d.vollBmp; d.voll = bitmapAusschnitt(vb, { x: 0, y: 0, b: vb.width, h: vb.height }, vb.width, vb.height); try { vb.close(); } catch {} d.vollBmp = null; }
      const res = auffrischenRechnen(d);
      if (d.mitMisch) {   // Flicken über das Original gelegt (für die Nachprüfung) – auch hier, nicht im Haupt-Faden
        const vd = d.voll.daten, fd = res.flicken.daten, md = new Uint8ClampedArray(vd.length);
        for (let i = 0; i < md.length; i += 4) { const a = fd[i + 3] / 255; md[i] = vd[i] * (1 - a) + fd[i] * a; md[i + 1] = vd[i + 1] * (1 - a) + fd[i + 1] * a; md[i + 2] = vd[i + 2] * (1 - a) + fd[i + 2] * a; md[i + 3] = vd[i + 3]; }
        res.misch = { b: d.voll.b, h: d.voll.h, daten: md };
      }
      return res;
    }
    if (aufgabe === 'klassisch') return hochskaliereKlassisch(d.kachel, d.faktor, { modus: d.modus, staerke: d.staerke, ox: d.ox, oy: d.oy });
    const id = d.modus === 'kreativ' && modelle.MODELLE['hoch-kreativ']?.quellen?.length && (await modelle.istImCache('hoch-kreativ')) ? 'hoch-kreativ' : 'hoch';
    if (!d.laden && !(await modelle.istImCache(id))) throw fehler(FEHLER.KEIN_MODELL, 'Hochskalier-Modell ist nicht geladen');
    const ort = await modelle.ladeOrt(); ort.env.logLevel = 'error'; const s = await modelle.onnxSitzung(id);
    const lauf = async (ein, b, hh) => { const r = await s.run({ [s.inputNames[0]]: new ort.Tensor('float32', ein, [1, 3, hh, b]) }); const o = r[s.outputNames[0]]; return o.data; };
    let aus = await hochModell(d.kachel, d.faktor, lauf, { signal: h.signal, fortschritt: h.fortschritt, kachel: d.modellKachel });
    // Treu: Modell-Kanten behalten, aber verkleinert muss wieder das Original herauskommen (gemessen: PSNR/SSIM steigen deutlich)
    if (d.modus !== 'kreativ' && d.rueck !== false) aus = rueckProjektion(d.kachel, aus, d.faktor, { iter: 2 });
    if (d.modus === 'kreativ') detailSynthese(aus, (d.staerke ?? 0.6) * 0.6, { faktor: d.faktor, ox: d.ox, oy: d.oy });
    aus.verfahren = id === 'hoch-kreativ' ? 'modell-kreativ' : 'modell'; return aus;
  },
  /** daten: { gesicht112: BildU8 112×112 } → Float32Array(128), L2-normiert. Ohne Modell: Fehler (Funktion bleibt gesperrt). */
  async merkmal(d, h, { modelle }) {
    if (!d.laden && !(await modelle.istImCache('merkmal'))) throw fehler(FEHLER.KEIN_MODELL, 'Prüfmodell für Gesichter ist nicht geladen');
    const ort = await modelle.ladeOrt(); ort.env.logLevel = 'error'; const s = await modelle.onnxSitzung('merkmal');
    const g = d.gesicht112, n = 112 * 112, ein = new Float32Array(3 * n);
    for (let i = 0; i < n; i++) { ein[i] = g.daten[i * 4]; ein[n + i] = g.daten[i * 4 + 1]; ein[2 * n + i] = g.daten[i * 4 + 2]; }   // RGB, 0..255 (wie die Vorlage der Autoren)
    const r = await s.run({ [s.inputNames[0]]: new ort.Tensor('float32', ein, [1, 3, 112, 112]) });
    return normiere(r[s.outputNames[0]].data);
  },
};
void schliesseBild;

// ================================================================ (3) Haupt-Faden
const leinwand = (b, h) => (typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(b, h) : Object.assign(document.createElement('canvas'), { width: b, height: h }));
function bitmapAusschnitt(bmp, r, b, h) {
  const c = leinwand(b, h), x = c.getContext('2d', { willReadFrequently: true }); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
  x.drawImage(bmp, r.x, r.y, r.b, r.h, 0, 0, b, h); return { b, h, daten: x.getImageData(0, 0, b, h).data };
}
const kopie = (k) => ({ b: k.b, h: k.h, daten: new Uint8ClampedArray(k.daten), farbraum: k.farbraum });
export let letztesVerfahren = null;

/** Kachel-Brücke für gl.exportiere (über app.hochKachel): Modell im KI-Worker (nur wenn geladen), sonst klassisch im Worker. */
export async function hochskaliereKachel(ki, kachel, faktor, modus = 'treu', opts = {}) {
  if (!ki) { const r = hochskaliereKlassisch(kachel, faktor, { modus }); letztesVerfahren = r.verfahren; return r; }
  if (!opts.nurKlassisch) {
    try {
      const k = kopie(kachel);
      const r = await ki.rufe('hoch', { kachel: k, faktor, modus, laden: !!opts.laden, staerke: opts.staerke }, { transfer: [k.daten.buffer], signal: opts.signal, onFortschritt: opts.onFortschritt });
      letztesVerfahren = r.verfahren || 'modell'; return r;
    } catch (e) { if (e.code === FEHLER.ABBRUCH) throw e; }
  }
  const k = kopie(kachel);
  const r = await ki.rufe('hoch', { aufgabe: 'klassisch', kachel: k, faktor, modus, staerke: opts.staerke }, { transfer: [k.daten.buffer], signal: opts.signal });
  letztesVerfahren = 'klassisch'; return r;
}

/** Merkmal (128, L2) eines Gesichts in bild (BildU8 oder ImageBitmap), Gesicht in normierten Koordinaten von bild. */
export async function gesichtsMerkmal(ki, bild, g) {
  if (!ki) throw fehler(FEHLER.KEIN_MODELL, 'Prüfmodell nicht verfügbar');
  const B = bild.b ?? bild.width, H = bild.h ?? bild.height, a = merkmalAusschnitt(g.punkte5, B, H);
  const aus = bild.daten ? ausschnittU8(bild, a.r, a.kante, a.kante) : bitmapAusschnitt(bild, a.r, a.kante, a.kante);
  const g112 = richteAus(aus, a.punkte, 112);
  return ki.rufe('merkmal', { gesicht112: g112 }, { transfer: [g112.daten.buffer] });
}

// ---------------------------------------------------------------- Referenzen (IndexedDB 'referenzen', bleiben auf dem Gerät)
let dbP = null; const ersatzSpeicher = new Map();
function db() {
  if (dbP) return dbP;
  dbP = new Promise((ok) => {
    if (typeof indexedDB === 'undefined') { ok(null); return; }
    const r = indexedDB.open(DB_NAME, DB_VERSION);
    r.onupgradeneeded = () => { const d = r.result; for (const [n, k] of [['dokumente', 'id'], ['raster', 'rasterId'], ['referenzen', 'id']]) if (!d.objectStoreNames.contains(n)) d.createObjectStore(n, { keyPath: k }); };
    r.onsuccess = () => ok(r.result); r.onerror = () => ok(null); r.onblocked = () => ok(null);
  });
  return dbP;
}
async function idb(modus, f) {
  const d = await db(); if (!d) return f(null);
  return new Promise((ok, fehl) => { const t = d.transaction('referenzen', modus), s = t.objectStore('referenzen'), q = f(s); t.oncomplete = () => ok(q?.result); t.onerror = () => fehl(t.error); });
}
export async function ladeReferenzen() {
  const alle = await idb('readonly', (s) => (s ? s.getAll() : null)).catch(() => null);
  const liste = alle || [...ersatzSpeicher.values()];
  return liste.sort((a, b) => a.erstellt - b.erstellt);
}
async function speichereReferenz(ref) { ersatzSpeicher.set(ref.id, ref); await idb('readwrite', (s) => s?.put(ref)).catch(() => {}); }
export async function loescheReferenz(app, ref) { ersatzSpeicher.delete(ref.id); await idb('readwrite', (s) => s?.delete(ref.id)).catch(() => {}); if (ref.rasterId) await app?.raster?.loesche(ref.rasterId).catch(() => {}); }
export async function loescheAlleReferenzen(app) { for (const r of await ladeReferenzen()) await loescheReferenz(app, r); }

function schaerfeMass(bild) {
  const { b, h, daten } = bild; let s = 0, m = 0;
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < b - 1; x++) { const i = (y * b + x) * 4, v = 4 * daten[i + 1] - daten[i - 3] - daten[i + 5] - daten[i - b * 4 + 1] - daten[i + b * 4 + 1]; s += v * v; m++; }
  return Math.sqrt(s / (m || 1));
}
const p5AusLandmarken = (L) => { const P = (k) => [L[k * 3], L[k * 3 + 1]]; const m = (a, c) => [(L[a * 3] + L[c * 3]) / 2, (L[a * 3 + 1] + L[c * 3 + 1]) / 2];
  const r = L.length >= 474 * 3 ? P(468) : m(33, 133), l = L.length >= 474 * 3 ? P(473) : m(362, 263); return new Float32Array([...r, ...l, ...P(1), ...P(61), ...P(291)]); };
/** Ausschnitt um ein Gesicht (Quelle px): quadratisch, 1,9× Kasten (Haare), geklemmt. */
export function gesichtsRechteck(g, B, H, faktor = 1.9) {
  const cx = (g.box.x + g.box.b / 2) * B, cy = (g.box.y + g.box.h / 2) * H, s = Math.max(g.box.b * B, g.box.h * H) * faktor;
  const x = Math.max(0, Math.round(cx - s / 2)), y = Math.max(0, Math.round(cy - s * 0.55));
  return { x, y, b: Math.max(8, Math.min(B - x, Math.round(s))), h: Math.max(8, Math.min(H - y, Math.round(s))) };
}

/** Referenzfoto hinzufügen: Gesicht finden, Ausschnitt (≤ 1024) speichern, Merkmal rechnen. Nichts verlässt das Gerät. */
export async function referenzHinzufuegen(app, datei, opts = {}) {
  const bmp = await createImageBitmap(datei, { imageOrientation: 'from-image' }).catch(() => createImageBitmap(datei));
  try {
    const k = await gesichtsKopie(bmp);
    const gs = await app.ki.rufe('gesichter', { bild: k }, { transfer: [k] });
    if (!gs?.length) throw fehler(FEHLER.UNBEKANNT, 'Im Referenzfoto wurde kein Gesicht gefunden');
    // PERSONEN: Referenz einer Person nur aus Fotos mit EINEM deutlichen Gesicht (sonst könnte das falsche Gesicht gelernt werden)
    if (opts.einzeln && gs.length > 1 && gs[1].box.b * gs[1].box.h >= 0.4 * gs[0].box.b * gs[0].box.h) throw fehler(FEHLER.FREMDE_PERSON, 'Mehrere Gesichter im Foto – bitte ein Foto, auf dem nur diese Person zu sehen ist');
    const g = gs[0], r = gesichtsRechteck(g, bmp.width, bmp.height), s = Math.min(1, 1024 / Math.max(r.b, r.h)), cb = Math.round(r.b * s), ch = Math.round(r.h * s);
    const aus = bitmapAusschnitt(bmp, r, cb, ch);
    const L = new Float32Array(g.landmarken.length);
    for (let i = 0; i < L.length; i += 3) { L[i] = (g.landmarken[i] * bmp.width - r.x) / r.b; L[i + 1] = (g.landmarken[i + 1] * bmp.height - r.y) / r.h; L[i + 2] = g.landmarken[i + 2]; }
    const gc = { id: neueId('refg'), box: { x: (g.box.x * bmp.width - r.x) / r.b, y: (g.box.y * bmp.height - r.y) / r.h, b: (g.box.b * bmp.width) / r.b, h: (g.box.h * bmp.height) / r.h }, landmarken: L, punkte5: p5AusLandmarken(L), sicherheit: g.sicherheit };
    gc.augenAbstandPx = Math.hypot((gc.punkte5[2] - gc.punkte5[0]) * cb, (gc.punkte5[3] - gc.punkte5[1]) * ch);
    if (gc.augenAbstandPx < IDENTITAET.mindestAugenPx) throw fehler(FEHLER.ZU_KLEIN, 'Das Gesicht im Referenzfoto ist zu klein – bitte ein näheres Foto nehmen');
    const merkmal = await gesichtsMerkmal(app.ki, aus, gc);
    const c = leinwand(cb, ch); c.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(aus.daten), cb, ch), 0, 0);
    const blob = c.convertToBlob ? await c.convertToBlob({ type: 'image/jpeg', quality: 0.95 }) : await new Promise((ok) => c.toBlob(ok, 'image/jpeg', 0.95));
    const rasterId = await app.raster.lege(blob, 'referenz');
    const ref = { id: neueId('ref'), rasterId, merkmal, gesicht: gc, qualitaet: { schaerfe: schaerfeMass(aus), augenPx: gc.augenAbstandPx, gesichter: gs.length }, erstellt: Date.now(), b: cb, h: ch };
    if (opts.speichern !== false) await speichereReferenz(ref);
    return ref;
  } finally { try { bmp.close(); } catch {} }
}

function gesichtInQuelle(g, q) {
  const L = g.landmarken, p5 = g.punkte5?.length === 10 && g.punkte5.some((v) => v) ? g.punkte5 : p5AusLandmarken(L);
  return { ...g, punkte5: p5, augenAbstandPx: Math.hypot((p5[2] - p5[0]) * q.b, (p5[3] - p5[1]) * q.h) };
}
/** Prüfung: jede Referenz gegen das Gesicht im Foto (Kosinus). Fremde Referenzen werden nie benutzt. */
export async function pruefeReferenzen(app, gesicht, refs, quelle = null) {
  const doc = app.zustand().doc; if (!doc && !quelle) throw fehler(FEHLER.UNBEKANNT, 'Kein Bild');
  const g = gesichtInQuelle(gesicht, quelle || doc.quelle);   // PERSONEN: quelle = { bmp, b, h } für den Batch (ohne offenes Dokument)
  if (!refs?.length) return { passend: [], abgelehnt: [], urteil: { erlaubt: false, median: 0, grund: 'Keine Referenz' } };
  if (g.augenAbstandPx < IDENTITAET.mindestAugenPx) return { passend: [], abgelehnt: refs.map((ref) => ({ ref, kosinus: null, grund: 'Gesicht im Foto zu klein zum Prüfen' })), urteil: { erlaubt: false, median: 0, grund: 'Gesicht zu klein zum Prüfen – zuerst „Treu“ hochskalieren' }, kosinus: [] };
  const m = quelle?.merkmal || await gesichtsMerkmal(app.ki, quelle?.bmp || app.quelleBitmap(), g);
  const kos = refs.map((r) => vergleiche(m, r.merkmal)), u = urteilListe(kos);
  return {
    passend: u.urteil.erlaubt ? u.passend.map((i) => refs[i]) : [],
    abgelehnt: refs.map((ref, i) => ({ ref, kosinus: kos[i], grund: kos[i] >= IDENTITAET.schwelle ? (u.urteil.erlaubt ? '' : u.urteil.grund) : kos[i] >= IDENTITAET.grau ? 'Nicht eindeutig dieselbe Person' : 'Andere Person' })).filter((x, i) => !(u.urteil.erlaubt && kos[i] >= IDENTITAET.schwelle)),
    urteil: u.urteil, kosinus: kos, merkmal: m,
  };
}

/**
 * Gesicht auffrischen mit eigenen Referenzen → Schritt 'auffrischen' mit Flicken. Läuft nur nach bestandener Prüfung.
 * Nach der Rechnung wird das Ergebnis erneut geprüft; weicht die Identität ab, wird die Stärke halbiert (max. 2×), sonst Abbruch.
 */
export async function frischeAuf(app, gesicht, refs, p = {}) {
  const doc = app.zustand().doc; if (!doc && !p.quelle) throw fehler(FEHLER.UNBEKANNT, 'Kein Bild');
  // PERSONEN: p.quelle = { bmp, b, h, merkmal? } rechnet ohne offenes Dokument (Batch), p.pipeline bekommt die Stufe
  const q = p.quelle ? { b: p.quelle.b, h: p.quelle.h } : doc.quelle, bmp = p.quelle?.bmp || app.quelleBitmap(), melde = p.onFortschritt || (() => {}), t0 = performance.now();
  app.pipeline?.registriereStufen?.(STUFEN); p.pipeline?.registriereStufen?.(STUFEN); setzeFlickenLader((id) => app.raster.hole(id), () => app.neuZeichnen?.());
  melde(0.05, 'Prüfe Identität');
  const pr = await pruefeReferenzen(app, gesicht, refs, p.quelle || null);
  if (!pr.urteil.erlaubt) throw fehler(FEHLER.FREMDE_PERSON, `Auffrischen verweigert: ${pr.urteil.grund}`);
  const g = gesichtInQuelle(gesicht, q), r = gesichtsRechteck(g, q.b, q.h, 1.9);
  const sP = Math.min(1, 768 / Math.max(r.b, r.h)), pb = Math.round(r.b * sP), ph = Math.round(r.h * sP);
  // 0.4: mit KI-Worker wird der volle Ausschnitt nicht im Haupt-Faden gelesen (ImageBitmap → Worker), Puffer werden übertragen statt kopiert
  const imWorker = !!app.ki && typeof createImageBitmap === 'function';
  const ziel = bitmapAusschnitt(bmp, r, pb, ph), voll = imWorker ? null : bitmapAusschnitt(bmp, r, r.b, r.h);
  const zielPts = new Float32Array(956); for (let i = 0; i < 478; i++) { zielPts[2 * i] = (g.landmarken[i * 3] * q.b - r.x) * sP; zielPts[2 * i + 1] = (g.landmarken[i * 3 + 1] * q.h - r.y) * sP; }
  melde(0.15, 'Lade Referenzen');
  const rs = [];
  for (const ref of pr.passend.slice(0, 5)) {
    const blob = await app.raster.hole(ref.rasterId); if (!blob) continue;
    const rb = await createImageBitmap(blob), bild = bitmapAusschnitt(rb, { x: 0, y: 0, b: rb.width, h: rb.height }, rb.width, rb.height); rb.close?.();
    const pts = new Float32Array(956); for (let i = 0; i < 478; i++) { pts[2 * i] = ref.gesicht.landmarken[i * 3] * bild.b; pts[2 * i + 1] = ref.gesicht.landmarken[i * 3 + 1] * bild.h; }
    rs.push({ bild, pts });
  }
  if (!rs.length) throw fehler(FEHLER.UNBEKANNT, 'Referenzfotos nicht mehr gespeichert');
  const vorher = pr.merkmal, refM = pr.passend.map((x) => x.merkmal), median = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
  const vorherRef = median(refM.map((m) => vergleiche(vorher, m)));
  let staerke = p.staerke ?? 0.6, ergebnis = null, pruefung = null;
  for (let versuch = 0; versuch < 3; versuch++) {
    melde(0.3 + versuch * 0.2, versuch ? 'Sanfter nachrechnen' : 'Details übertragen');
    const daten = { aufgabe: 'auffrischen', ziel: kopie(ziel), zielPts: zielPts.slice(), refs: rs.map((x) => ({ bild: kopie(x.bild), pts: x.pts.slice() })), p: { staerke, augen: p.augen ?? 1, haut: p.haut ?? 0.5, haare: p.haare ?? 0.8 } };   // nur klonbare Werte (kein Signal)
    let res, misch;
    if (imWorker) {
      daten.vollBmp = await createImageBitmap(bmp, r.x, r.y, r.b, r.h); daten.mitMisch = true;
      res = await app.ki.rufe('hoch', daten, { signal: p.signal, transfer: [daten.vollBmp, daten.ziel.daten.buffer, ...daten.refs.map((x) => x.bild.daten.buffer)] });
      misch = res.misch; delete res.misch;
    } else {
      daten.voll = kopie(voll);
      res = auffrischenRechnen(daten);
      // erneute Prüfung auf dem Ergebnis (Flicken über Original gelegt), in Scheiben – keine lange Aufgabe bei großen Gesichtern
      misch = kopie(voll); const md = misch.daten, vd = voll.daten, fd = res.flicken.daten, SCHEIBE = 1 << 20;
      for (let s0 = 0; s0 < md.length; s0 += SCHEIBE) {
        const e = Math.min(md.length, s0 + SCHEIBE);
        for (let i = s0; i < e; i += 4) { const a = fd[i + 3] / 255; for (let k = 0; k < 3; k++) md[i + k] = vd[i + k] * (1 - a) + fd[i + k] * a; }
        if (e < md.length) await new Promise((ok) => setTimeout(ok, 0));
      }
    }
    const gLokal = { punkte5: Float32Array.from(g.punkte5, (v, i) => (i % 2 ? (v * q.h - r.y) / r.h : (v * q.b - r.x) / r.b)) };
    const nachher = await gesichtsMerkmal(app.ki, misch, gLokal);
    const nachRef = median(refM.map((m) => vergleiche(nachher, m))), selbst = vergleiche(nachher, vorher);
    pruefung = { vorherRef, nachRef, selbst, staerke, versuch };
    if (nachRef >= vorherRef - 0.03 && selbst >= 0.6 && nachRef >= IDENTITAET.schwelle) { ergebnis = res; break; }
    staerke *= 0.5;
  }
  if (!ergebnis) throw fehler(FEHLER.FREMDE_PERSON, 'Abgebrochen: das Ergebnis hätte die Person verändert');
  melde(0.9, 'Speichern');
  const rasterId = await app.raster.lege(ergebnis.flicken, 'flicken'); merkeFlicken(rasterId, ergebnis.flicken);
  const f = { id: neueId('flicken'), art: 'auffrischen', px: r, rasterId, maskeId: null, verfahren: 'referenz-detail', erstellt: Date.now(), quelle: { b: q.b, h: q.h } };
  const s = neuerSchritt(ART.AUFFRISCHEN, { staerke: pruefung.staerke, augen: p.augen ?? 1, haut: p.haut ?? 0.5, haare: p.haare ?? 0.8, flicken: f, pruefung, refs: pr.passend.map((x) => x.id) }, { flickenId: f.id, name: 'Auffrischen' });
  s._info = { dauerMs: Math.round(performance.now() - t0), ...ergebnis.info };
  melde(1, 'Fertig');
  return s;
}

// ================================================================ (4) Bedienung
const STIL = `.ho{display:flex;flex-direction:column;gap:8px;color:var(--text,#e8e6e1);font:14px/1.35 system-ui,-apple-system,sans-serif}
.ho .zeile{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.ho label{display:flex;align-items:center;gap:8px;min-height:44px;flex:1 1 140px}
.ho label span{min-width:64px}.ho input[type=range]{flex:1;min-height:44px;accent-color:var(--akzent,#d9a441)}
.ho button{min-height:44px;min-width:44px;padding:0 12px;border-radius:10px;border:1px solid var(--linie,#33363c);background:var(--flaeche2,#202226);color:inherit;font:inherit}
.ho button[aria-pressed="true"]{border-color:var(--akzent,#d9a441);color:var(--akzent,#d9a441)}.ho button.haupt{background:var(--akzent,#d9a441);color:#111;border-color:transparent;font-weight:600}
.ho button:disabled{opacity:.45}.ho .leise{color:var(--leise,#9a9890);font-size:13px;margin:0}.ho .status{color:var(--leise,#9a9890);font-size:13px;min-height:18px;margin:0}
.ho .balken{height:4px;background:var(--linie,#33363c);border-radius:2px;overflow:hidden}.ho .balken i{display:block;height:100%;width:0;background:var(--akzent,#d9a441)}
.ho .refs{display:grid;grid-template-columns:repeat(auto-fill,minmax(72px,1fr));gap:8px}.ho .ref{position:relative;border-radius:10px;overflow:hidden;border:1px solid var(--linie,#33363c);background:#000;min-height:72px}
.ho .ref img{display:block;width:100%;aspect-ratio:1;object-fit:cover}.ho .ref small{position:absolute;left:0;right:0;bottom:0;padding:2px 4px;background:rgba(0,0,0,.65);font-size:11px;line-height:1.2}
.ho .ref.nein{border-color:#b5534a}.ho .ref.ja{border-color:#6c9a5b}.ho .ref button{position:absolute;top:0;right:0;min-height:44px;min-width:44px;padding:0;border:0;background:transparent;color:#fff;font-size:18px}
.ho .ok{color:#8fbf7a}.ho .nein-t{color:#e08b80}`;
const mpx = (b, h) => (b * h / 1e6).toLocaleString('de-DE', { maximumFractionDigits: 1 });
const sek = (s) => (s < 90 ? `${Math.max(1, Math.round(s))} s` : `${Math.round(s / 60)} min`);
const komma = (v) => (v == null ? '–' : v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));

/** Retusche-Blatt: Hochskalieren (modus 'hoch') oder Gesicht auffrischen (modus 'auffrischen'). */
export function retuscheUI(container, opts) {
  const { app } = opts, modus = opts.modus === 'auffrischen' ? 'auffrischen' : 'hoch', d = container.ownerDocument;
  const el = d.createElement('div'); el.className = 'ho'; el.dataset.modus = modus; container.appendChild(el);
  const st = d.createElement('style'); st.textContent = STIL; el.appendChild(st);
  const teil = d.createElement('div'); teil.style.display = 'contents'; el.appendChild(teil);
  let ac = null, weg = false; const aufraeumen = [];
  const status = (t, art) => { const s = el.querySelector('.status'); if (s) { s.textContent = t || ''; s.className = 'status' + (art ? ' ' + art : ''); } };
  const balken = (f) => { const b = el.querySelector('.balken'); if (!b) return; b.hidden = f == null; b.firstElementChild.style.width = `${Math.round((f || 0) * 100)}%`; };
  const imCache = async (id) => { try { const s = await app.ki.rufe('status', {}); return !!s.ids?.[id]?.imCache; } catch { return false; } };
  async function modellFrage(ids, hinweis) {
    const M = await import('./modelle.js'); const box = d.createElement('div'); el.appendChild(box);
    return new Promise((ok) => { const hnd = M.modellUI(box, { ids, ki: app.ki, hinweis, onFertig: (g) => { setTimeout(() => { hnd?.zerstoere?.(); box.remove(); }, 0); ok(g); } }); });
  }

  // ---------------------------------------------------------------- Hochskalieren
  if (modus === 'hoch') {
    const z = { faktor: 2, art: 'treu', modell: false };
    teil.innerHTML = `<div class="zeile" role="group" aria-label="Faktor"><button data-f="2">×2</button><button data-f="4">×4</button>
<span style="flex:1"></span><button data-m="treu">Treu</button><button data-m="kreativ">Kreativ</button></div>
<p class="leise" data-t="info"></p><p class="leise" data-t="weg"></p>
<div class="zeile"><button class="haupt" data-a="los" style="flex:1">Hochskaliert sichern</button><button data-a="stop" hidden>Abbrechen</button></div>
<div class="balken" hidden><i></i></div><p class="status" aria-live="polite"></p>`;
    const neu = async () => {
      const doc = app.zustand().doc;
      for (const b of teil.querySelectorAll('[data-f]')) b.setAttribute('aria-pressed', String(Number(b.dataset.f) === z.faktor));
      for (const b of teil.querySelectorAll('[data-m]')) b.setAttribute('aria-pressed', String(b.dataset.m === z.art));
      const info = teil.querySelector('[data-t="info"]'), wegT = teil.querySelector('[data-t="weg"]');
      if (!doc) { info.textContent = 'Zuerst ein Foto öffnen.'; teil.querySelector('[data-a="los"]').disabled = true; return; }
      const zb = Math.round(doc.quelle.b * doc.geometrie.zuschnitt.b) * z.faktor, zh = Math.round(doc.quelle.h * doc.geometrie.zuschnitt.h) * z.faktor;
      const ein = (zb * zh) / (z.faktor * z.faktor);
      info.textContent = `Ergebnis ${zb} × ${zh} Pixel (${mpx(zb, zh)} MP). ${z.art === 'treu' ? 'Treu: schärfer, nichts dazu erfunden.' : 'Kreativ: feine Strukturen (Haare, Stoff) werden plausibel ergänzt.'}${zb * zh > MAX_PX ? ` Zu groß: mehr als ${(MAX_PX / 1e6).toFixed(1).replace('.', ',')} MP kann das iPhone nicht sichern – kleineren Faktor wählen oder vorher zuschneiden.` : ''}`;
      teil.querySelector('[data-a="los"]').disabled = zb * zh > MAX_PX;
      z.modell = await imCache('hoch');
      wegT.innerHTML = z.modell ? `Rechenweg: Bild-Modell auf dem Gerät, etwa ${sek(schaetzeDauer(ein, 'modellWasm'))}.` : `Rechenweg: klassisch (ohne Modell), etwa ${sek(schaetzeDauer(ein, 'klassisch'))}. <button data-a="modell">Modell laden (4,6 MB)</button>`;
    };
    teil.addEventListener('click', async (e) => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.f || b.dataset.m) teil.querySelector('.haupt.breit:not([data-a])')?.remove();
      if (b.dataset.f) { z.faktor = Number(b.dataset.f); neu(); return; }
      if (b.dataset.m) { z.art = b.dataset.m; neu(); return; }
      if (b.dataset.a === 'modell') { b.disabled = true; await modellFrage(['hoch'], 'Für bessere Hochskalierung wird ein kleines Bild-Modell geladen. Es bleibt danach auf dem Gerät.'); neu(); return; }
      if (b.dataset.a === 'stop') { ac?.abort(); return; }
      if (b.dataset.a === 'los') {
        const doc = app.zustand().doc; if (!doc) return;
        ac = new AbortController(); b.disabled = true; teil.querySelector('[data-a="stop"]').hidden = false; balken(0); status('Rechne …');
        const t0 = performance.now();
        try {
          const blob = await app.exportiere({ format: 'image/jpeg', qualitaet: 0.92, skala: z.faktor, hochModus: z.art, signal: ac.signal, onFortschritt: (f, t) => { balken(f); status(t || 'Rechne …'); } });
          status(`Fertig in ${sek((performance.now() - t0) / 1000)} (${letztesVerfahren === 'klassisch' ? 'klassisch' : letztesVerfahren ? 'mit Modell' : 'Grafik'}).`, 'ok');
          if (!weg) await app.teile(blob, `${doc.name || 'Foto'}-x${z.faktor}.jpg`, { seit: t0, nach: b.parentNode, status: teil.querySelector('.status') });
        } catch (err) { status(err.code === FEHLER.ABBRUCH ? 'Abgebrochen.' : (err.text || err.message || String(err)), err.code === FEHLER.ABBRUCH ? '' : 'nein-t'); }
        finally { ac = null; b.disabled = false; teil.querySelector('[data-a="stop"]').hidden = true; balken(null); }
      }
    });
    aufraeumen.push(app.on?.('zustand', () => neu()) || (() => {}));
    neu();
  }

  // ---------------------------------------------------------------- Gesicht auffrischen
  // PERSONEN: mehrere gespeicherte Personen (personen.js). Die alte Ein-Personen-Bedienung bleibt nur mit opts.einzelReferenzen.
  if (modus === 'auffrischen' && !opts.einzelReferenzen) {
    import('./personen.js').then((P) => { if (weg) return; const hnd = P.personenUI(teil, { app, status, balken, modellFrage, imCache }); aufraeumen.push(() => hnd.zerstoere()); })
      .catch((e) => status(e.text || e.message || String(e), 'nein-t'));
  }
  if (modus === 'auffrischen' && opts.einzelReferenzen) {
    const z = { gesichter: [], wahl: 0, refs: [], pruefung: null, p: { staerke: 60, augen: 100, haut: 50, haare: 80 }, bereit: false };
    teil.innerHTML = `<p class="leise">Frischt das Gesicht mit eigenen Fotos derselben Person auf. Die Fotos bleiben nur auf diesem Gerät. Fremde Gesichter werden abgelehnt.</p>
<div class="zeile" data-t="gesichter"></div>
<div class="refs" data-t="refs"></div>
<div class="zeile"><button data-a="hinzu" type="button">Referenzfoto hinzufügen</button><input type="file" accept="image/*" multiple hidden data-t="datei">
<button data-a="alleweg" type="button">Alle löschen</button></div>
<p class="leise" data-t="urteil"></p>
${['staerke:Stärke', 'augen:Augen', 'haut:Haut', 'haare:Haare'].map((x) => { const [k, t] = x.split(':'); return `<label><span>${t}</span><input type="range" min="0" max="100" step="1" data-p="${k}" value="${z.p[k]}" aria-label="${t}"></label>`; }).join('')}
<div class="zeile"><button class="haupt" data-a="los" style="flex:1" disabled>Auffrischen</button><button data-a="stop" hidden>Abbrechen</button></div>
<div class="balken" hidden><i></i></div><p class="status" aria-live="polite"></p>`;
    const datei = teil.querySelector('[data-t="datei"]'), urteilT = teil.querySelector('[data-t="urteil"]'), los = teil.querySelector('[data-a="los"]');
    const url = new Map();
    const zeigeRefs = () => {
      const box = teil.querySelector('[data-t="refs"]'); box.innerHTML = '';
      for (const r of z.refs) {
        const k = z.pruefung?.kosinus?.[z.refs.indexOf(r)], ok = k != null && k >= IDENTITAET.schwelle && z.pruefung?.urteil?.erlaubt;
        const div = d.createElement('div'); div.className = 'ref' + (k == null ? '' : ok ? ' ja' : ' nein'); div.dataset.id = r.id;
        div.innerHTML = `<img alt="Referenz"><small>${k == null ? 'nicht geprüft' : ok ? `passt ${komma(k)}` : `${k >= IDENTITAET.grau ? 'unklar' : 'andere Person'} ${komma(k)}`}</small><button data-weg="${r.id}" aria-label="Referenz löschen">×</button>`;
        box.appendChild(div);
        app.raster.hole(r.rasterId).then((blob) => { if (!blob || weg) return; if (!url.has(r.id)) url.set(r.id, URL.createObjectURL(blob)); div.querySelector('img').src = url.get(r.id); }).catch(() => {});
      }
      if (!z.refs.length) box.innerHTML = '<p class="leise">Noch keine Referenzfotos. Am besten 2–5 scharfe Fotos von vorn.</p>';
    };
    const zeigeGesichter = () => {
      const box = teil.querySelector('[data-t="gesichter"]');
      box.innerHTML = z.gesichter.length > 1 ? z.gesichter.map((_, i) => `<button data-g="${i}" aria-pressed="${i === z.wahl}">Gesicht ${i + 1}</button>`).join('') : z.gesichter.length ? '<p class="leise">Gesicht erkannt.</p>' : '<p class="leise">Kein Gesicht erkannt.</p>';
    };
    const pruefe = async () => {
      z.pruefung = null; los.disabled = true;
      const g = z.gesichter[z.wahl];
      if (!g) { urteilT.textContent = 'Kein Gesicht im Foto.'; zeigeRefs(); return; }
      if (!z.refs.length) { urteilT.textContent = 'Bitte Referenzfotos hinzufügen.'; zeigeRefs(); return; }
      urteilT.textContent = 'Prüfe, ob es dieselbe Person ist …';
      try {
        z.pruefung = await pruefeReferenzen(app, g, z.refs);
        const u = z.pruefung.urteil;
        urteilT.innerHTML = u.erlaubt ? `<span class="ok">Dieselbe Person (Ähnlichkeit ${komma(u.median)}).</span> ${z.pruefung.abgelehnt.length ? `${z.pruefung.abgelehnt.length} Foto(s) passen nicht und werden nicht benutzt.` : ''}` : `<span class="nein-t">${u.grund}.</span> Auffrischen ist gesperrt.`;
        los.disabled = !u.erlaubt;
      } catch (e) { urteilT.textContent = e.code === FEHLER.KEIN_MODELL ? 'Ohne Prüfmodell bleibt diese Funktion gesperrt.' : (e.text || e.message || String(e)); }
      zeigeRefs();
    };
    const start = async () => {
      const brauche = []; if (!(await imCache('gesicht-landmarken'))) brauche.push('gesicht-landmarken'); if (!(await imCache('merkmal'))) brauche.push('merkmal');
      if (brauche.length) {
        const ok = await modellFrage(brauche, 'Zum Prüfen, ob Foto und Referenzen dieselbe Person zeigen, braucht es zwei Modelle. Ohne sie bleibt die Funktion gesperrt.');
        if (!ok) { urteilT.textContent = 'Ohne Prüfmodell bleibt diese Funktion gesperrt.'; return; }
      }
      z.bereit = true;
      const doc = app.zustand().doc;
      if (!doc) { urteilT.textContent = 'Zuerst ein Foto öffnen.'; return; }
      z.gesichter = doc.gesichter?.length && doc.gesichter[0].landmarken?.length >= 478 * 3 ? doc.gesichter : [];
      if (!z.gesichter.length) {
        status('Suche Gesichter …');
        try { const k = await gesichtsKopie(app.quelleBitmap()); z.gesichter = await app.ki.rufe('gesichter', { bild: k }, { transfer: [k] }); if (z.gesichter?.length) app.setzeGesichter?.(z.gesichter); } catch (e) { status(e.text || e.message || String(e), 'nein-t'); }
        status('');
      }
      z.refs = await ladeReferenzen(); zeigeGesichter(); zeigeRefs(); pruefe();
    };
    teil.addEventListener('input', (e) => { const k = e.target.dataset?.p; if (k) z.p[k] = Number(e.target.value); });
    datei.addEventListener('change', async () => {
      const liste = [...(datei.files || [])]; datei.value = '';
      for (const [i, f] of liste.entries()) {
        status(`Referenz ${i + 1}/${liste.length} wird geprüft …`);
        try { z.refs.push(await referenzHinzufuegen(app, f)); } catch (e) { status(e.text || e.message || String(e), 'nein-t'); await new Promise((ok) => setTimeout(ok, 1200)); }
      }
      status(''); zeigeRefs(); pruefe();
    });
    teil.addEventListener('click', async (e) => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.g) { z.wahl = Number(b.dataset.g); zeigeGesichter(); pruefe(); return; }
      if (b.dataset.weg) { const r = z.refs.find((x) => x.id === b.dataset.weg); if (r) { await loescheReferenz(app, r); z.refs = z.refs.filter((x) => x !== r); } pruefe(); return; }
      if (b.dataset.a === 'hinzu') { if (!z.bereit) await start(); if (z.bereit) datei.click(); return; }
      if (b.dataset.a === 'alleweg') { await loescheAlleReferenzen(app); z.refs = []; pruefe(); return; }
      if (b.dataset.a === 'stop') { ac?.abort(); return; }
      if (b.dataset.a === 'los') {
        if (!z.pruefung?.urteil?.erlaubt) return;
        ac = new AbortController(); los.disabled = true; teil.querySelector('[data-a="stop"]').hidden = false; balken(0);
        try {
          const p = { staerke: z.p.staerke / 100, augen: z.p.augen / 100, haut: z.p.haut / 100, haare: z.p.haare / 100, signal: ac.signal, onFortschritt: (f, t) => { balken(f); status(t); } };
          const s = await frischeAuf(app, z.gesichter[z.wahl], z.refs, p);
          app.aendere((dd) => { dd.schritte.push(s); return dd; }, { name: 'Auffrischen' });
          status(`Fertig – Identität geprüft (${komma(s.params.pruefung.nachRef)}).`, 'ok');
        } catch (err) { status(err.code === FEHLER.ABBRUCH ? 'Abgebrochen.' : (err.text || err.message || String(err)), err.code === FEHLER.ABBRUCH ? '' : 'nein-t'); }
        finally { ac = null; los.disabled = !z.pruefung?.urteil?.erlaubt; teil.querySelector('[data-a="stop"]').hidden = true; balken(null); }
      }
    });
    aufraeumen.push(() => { for (const u of url.values()) URL.revokeObjectURL(u); });
    start();
  }
  return {
    setze() {},
    zerstoere() { weg = true; ac?.abort(); for (const f of aufraeumen) try { f(); } catch {} el.remove(); },
  };
}
