// Bildwerk – Auswahl/Masken (Agent D). Signaturen FEST (ARCH.md §4.6). KI-Teile über RpcKanal (wk-ki), Rest rein.
// Rein = kein DOM: läuft im Worker wk-rechnen und im Haupt-Faden. Masken: Uint8 0..255, Arbeitsauflösung, Quell-Koordinaten.
import { KLASSE, MASKE, FEHLER, BildwerkFehler, neueId } from './typen.js';
export { KLASSE, MASKE };

// ================================================================ Hilfen (rein)
const kod = (v) => (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055);
export const leer = (b, h, wert = 0) => { const d = new Uint8Array(b * h); if (wert) d.fill(wert); return { b, h, daten: d }; };
const kl = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const glatt = (a, b, x) => { const t = kl((x - a) / (b - a || 1e-9)); return t * t * (3 - 2 * t); };

/** Kastenfilter (Fenster 2r+1) auf Float32-Feld, separabel mit gleitender Summe, Rand = abgeschnitten (normiert). */
export function kasten(src, b, h, r, ziel = new Float32Array(b * h)) {
  if (r < 1) { ziel.set(src); return ziel; }
  const tmp = new Float32Array(b * h);
  for (let y = 0; y < h; y++) {
    const o = y * b; let s = 0, n = 0;
    for (let x = 0; x < Math.min(r, b); x++) { s += src[o + x]; n++; }
    for (let x = 0; x < b; x++) {
      const re = x + r, li = x - r - 1;
      if (re < b) { s += src[o + re]; n++; }
      if (li >= 0) { s -= src[o + li]; n--; }
      tmp[o + x] = s / n;
    }
  }
  const sp = new Float64Array(b), np = new Int32Array(b);
  for (let y = 0; y < Math.min(r, h); y++) { const o = y * b; for (let x = 0; x < b; x++) { sp[x] += tmp[o + x]; np[x]++; } }
  for (let y = 0; y < h; y++) {
    const re = y + r, li = y - r - 1;
    if (re < h) { const o = re * b; for (let x = 0; x < b; x++) { sp[x] += tmp[o + x]; np[x]++; } }
    if (li >= 0) { const o = li * b; for (let x = 0; x < b; x++) { sp[x] -= tmp[o + x]; np[x]--; } }
    const o = y * b; for (let x = 0; x < b; x++) ziel[o + x] = sp[x] / np[x];
  }
  return ziel;
}

/** Bilinear umrechnen (Float32, 1 Kanal). */
export function skaliereF(src, sb, sh, b, h) {
  if (sb === b && sh === h) return Float32Array.from(src);
  const out = new Float32Array(b * h), fx = sb / b, fy = sh / h;
  if (fx > 2 || fy > 2) {   // stark verkleinern: Flächenmittel
    for (let y = 0; y < h; y++) { const y0 = Math.floor(y * fy), y1 = Math.max(y0 + 1, Math.floor((y + 1) * fy));
      for (let x = 0; x < b; x++) { const x0 = Math.floor(x * fx), x1 = Math.max(x0 + 1, Math.floor((x + 1) * fx)); let s = 0, n = 0;
        for (let yy = y0; yy < Math.min(sh, y1); yy++) for (let xx = x0; xx < Math.min(sb, x1); xx++) { s += src[yy * sb + xx]; n++; }
        out[y * b + x] = n ? s / n : 0; } }
    return out;
  }
  for (let y = 0; y < h; y++) {
    const sy = kl((y + 0.5) * fy - 0.5, 0, sh - 1), y0 = Math.floor(sy), y1 = Math.min(sh - 1, y0 + 1), wy = sy - y0;
    for (let x = 0; x < b; x++) {
      const sx = kl((x + 0.5) * fx - 0.5, 0, sb - 1), x0 = Math.floor(sx), x1 = Math.min(sb - 1, x0 + 1), wx = sx - x0;
      out[y * b + x] = (src[y0 * sb + x0] * (1 - wx) + src[y0 * sb + x1] * wx) * (1 - wy) + (src[y1 * sb + x0] * (1 - wx) + src[y1 * sb + x1] * wx) * wy;
    }
  }
  return out;
}
/** Maske auf andere Größe (bilinear). */
export function skaliereMaske(m, b, h) {
  if (m.b === b && m.h === h) return m;
  const f = new Float32Array(m.daten.length); for (let i = 0; i < f.length; i++) f[i] = m.daten[i];
  const g = skaliereF(f, m.b, m.h, b, h), d = new Uint8Array(b * h); for (let i = 0; i < d.length; i++) d[i] = g[i] + 0.5;
  return { b, h, daten: d };
}
const zuMaske = (f, b, h, faktor = 255) => { const d = new Uint8Array(b * h); for (let i = 0; i < d.length; i++) { const v = f[i] * faktor; d[i] = v <= 0 ? 0 : v >= 255 ? 255 : v + 0.5; } return { b, h, daten: d }; };

/** Führungsbild als kodierte (wahrnehmungsgleiche) Kanäle in Maskengröße. */
function fuehrungKanaele(bild, b, h) {
  const n = bild.b * bild.h, k = bild.kanaele || 4, kan = [new Float32Array(n), new Float32Array(n), new Float32Array(n)];
  const lin = bild.linear !== false;
  for (let i = 0; i < n; i++) for (let j = 0; j < 3; j++) { const v = bild.daten[i * k + j]; kan[j][i] = lin ? kod(kl(v)) : v; }
  return kan.map((c) => skaliereF(c, bild.b, bild.h, b, h));
}

/** OKLab aus linearem sRGB. */
export function oklab(r, g, b) {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b), m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b),
    s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
}

// ================================================================ Grundoperationen (rein)
/** @param {'plus'|'minus'|'schnitt'} modus */
export function kombiniere(a, b, modus) {
  if (!a) return modus === 'plus' ? { b: b.b, h: b.h, daten: Uint8Array.from(b.daten) } : leer(b.b, b.h);
  if (b.b !== a.b || b.h !== a.h) b = skaliereMaske(b, a.b, a.h);
  const n = a.daten.length, d = new Uint8Array(n), x = a.daten, y = b.daten;
  if (modus === 'plus') for (let i = 0; i < n; i++) d[i] = x[i] > y[i] ? x[i] : y[i];
  else if (modus === 'minus') for (let i = 0; i < n; i++) { const v = 255 - y[i]; d[i] = x[i] < v ? x[i] : v; }
  else if (modus === 'schnitt') for (let i = 0; i < n; i++) d[i] = x[i] < y[i] ? x[i] : y[i];
  else throw new BildwerkFehler(FEHLER.UNBEKANNT, `Unbekannter Modus: ${modus}`);
  return { b: a.b, h: a.h, daten: d };
}
export function umkehren(maske) { const d = new Uint8Array(maske.daten.length); for (let i = 0; i < d.length; i++) d[i] = 255 - maske.daten[i]; return { b: maske.b, h: maske.h, daten: d }; }

/** Weiche Kante: 3× Kasten ≈ Gauß, Radius als Anteil der kurzen Seite. */
export function weichzeichnen(maske, radiusAnteil) {
  const { b, h } = maske, r = Math.round(radiusAnteil * Math.min(b, h));
  if (r < 1) return { b, h, daten: Uint8Array.from(maske.daten) };
  const rr = Math.max(1, Math.round(r / Math.sqrt(3)));
  let f = new Float32Array(b * h); for (let i = 0; i < f.length; i++) f[i] = maske.daten[i];
  const t = new Float32Array(b * h);
  kasten(f, b, h, rr, t); kasten(t, b, h, rr, f); kasten(f, b, h, rr, t);
  return zuMaske(t, b, h, 1);
}

/** Erosion/Dilatation (quadratisch, Radius px) über gleitendes Min/Max (separabel). */
export function morph(maske, r, art = 'dilat') {
  const { b, h } = maske; if (r < 1) return { b, h, daten: Uint8Array.from(maske.daten) };
  const max = art === 'dilat', src = maske.daten, tmp = new Uint8Array(b * h), out = new Uint8Array(b * h);
  const op = max ? (p, q) => (p > q ? p : q) : (p, q) => (p < q ? p : q);
  for (let y = 0; y < h; y++) { const o = y * b; for (let x = 0; x < b; x++) { let v = src[o + x]; for (let k = Math.max(0, x - r); k <= Math.min(b - 1, x + r); k++) v = op(v, src[o + k]); tmp[o + x] = v; } }
  for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) { let v = tmp[y * b + x]; for (let k = Math.max(0, y - r); k <= Math.min(h - 1, y + r); k++) v = op(v, tmp[k * b + x]); out[y * b + x] = v; }
  return { b, h, daten: out };
}

/**
 * Kante verfeinern: geführter Filter mit FARB-Führung (He et al., 3×3-Kovarianz) am Originalbild.
 * Die Deckung wird lokal als lineare Funktion der Farbe angesetzt → feine Strähnen vor ruhigem Hintergrund werden
 * sauber getrennt. Nur im unsicheren Band um die Kante wird ersetzt; sicher innen/außen bleibt unverändert.
 * opts: radius (Anteil kurze Seite, Std 0,006), eps (Std 1e-4; haar: 2e-5), haar (feines Band + Kontrast), band (Anteil)
 */
export function verfeinereKante(maske, fuehrung, opts = {}) {
  const { b, h } = maske, n = b * h, kurz = Math.min(b, h);
  const haar = !!opts.haar;
  const r = Math.max(1, Math.round((opts.radius ?? (haar ? 0.004 : 0.006)) * kurz));
  const eps = opts.eps ?? (haar ? 2e-5 : 1e-4);
  // Schneller geführter Filter (He 2015): Koeffizienten auf verkleinertem Gitter, Anwendung in voller Auflösung
  const s = Math.max(1, Math.min(4, Math.floor(r / 3))), sb = Math.max(1, Math.round(b / s)), sh = Math.max(1, Math.round(h / s)), sn = sb * sh, rs = Math.max(1, Math.round(r / s));
  const I = fuehrungKanaele(fuehrung, b, h), [I0, I1, I2] = I;
  const [j0, j1, j2] = s > 1 ? I.map((c) => skaliereF(c, b, h, sb, sh)) : I;
  const p = new Float32Array(n); for (let i = 0; i < n; i++) p[i] = maske.daten[i] / 255;
  const ps = s > 1 ? skaliereF(p, b, h, sb, sh) : p;
  const K = (src) => kasten(src, sb, sh, rs);
  const mul = (a, c) => { const o = new Float32Array(sn); for (let i = 0; i < sn; i++) o[i] = a[i] * c[i]; return o; };
  const m0 = K(j0), m1 = K(j1), m2 = K(j2), mp = K(ps);
  const c00 = K(mul(j0, j0)), c01 = K(mul(j0, j1)), c02 = K(mul(j0, j2)), c11 = K(mul(j1, j1)), c12 = K(mul(j1, j2)), c22 = K(mul(j2, j2));
  const p0 = K(mul(j0, ps)), p1 = K(mul(j1, ps)), p2 = K(mul(j2, ps));
  const a0 = new Float32Array(sn), a1 = new Float32Array(sn), a2 = new Float32Array(sn), bb = new Float32Array(sn);
  for (let i = 0; i < sn; i++) {
    const s00 = c00[i] - m0[i] * m0[i] + eps, s01 = c01[i] - m0[i] * m1[i], s02 = c02[i] - m0[i] * m2[i];
    const s11 = c11[i] - m1[i] * m1[i] + eps, s12 = c12[i] - m1[i] * m2[i], s22 = c22[i] - m2[i] * m2[i] + eps;
    const q0 = p0[i] - m0[i] * mp[i], q1 = p1[i] - m1[i] * mp[i], q2 = p2[i] - m2[i] * mp[i];
    const i00 = s11 * s22 - s12 * s12, i01 = s02 * s12 - s01 * s22, i02 = s01 * s12 - s02 * s11;
    const i11 = s00 * s22 - s02 * s02, i12 = s01 * s02 - s00 * s12, i22 = s00 * s11 - s01 * s01;
    const det = s00 * i00 + s01 * i01 + s02 * i02 || 1e-12;
    const x0 = (i00 * q0 + i01 * q1 + i02 * q2) / det, x1 = (i01 * q0 + i11 * q1 + i12 * q2) / det, x2 = (i02 * q0 + i12 * q1 + i22 * q2) / det;
    a0[i] = x0; a1[i] = x1; a2[i] = x2; bb[i] = mp[i] - x0 * m0[i] - x1 * m1[i] - x2 * m2[i];
  }
  const hoch = (f) => (s > 1 ? skaliereF(K(f), sb, sh, b, h) : K(f));
  const A0 = hoch(a0), A1 = hoch(a1), A2 = hoch(a2), BB = hoch(bb);
  // unsicheres Band (Kastenfilter statt Min/Max: Aufwand unabhängig vom Radius)
  const bandR = Math.max(1, Math.round((opts.band ?? (haar ? 0.02 : 0.01)) * kurz));
  const voll = new Float32Array(n), etwas = new Float32Array(n); for (let i = 0; i < n; i++) { voll[i] = maske.daten[i] >= 250 ? 1 : 0; etwas[i] = maske.daten[i] > 5 ? 1 : 0; }
  const innen = kasten(voll, b, h, bandR), aussen = kasten(etwas, b, h, bandR);
  const out = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    if (innen[i] > 0.9999) { out[i] = 255; continue; }
    if (aussen[i] < 1e-4) { out[i] = 0; continue; }
    let q = A0[i] * I0[i] + A1[i] * I1[i] + A2[i] * I2[i] + BB[i];
    if (haar) q = (q - 0.08) / 0.84;
    out[i] = q <= 0 ? 0 : q >= 1 ? 255 : q * 255 + 0.5;
  }
  return { b, h, daten: out };
}

// ================================================================ Masken aus Quellen (rein)
/** Klassenkarte → Maske. Nutzt die weichen Vertrauenskarten (`roh`, 256²) bilinear, sonst Klassen + Vertrauen. */
export function maskeAusKlassen(karte, klassen, b, h) {
  const set = new Set(klassen);
  if (karte.roh?.kanaele) {
    const { b: rb, h: rh, kanaele } = karte.roh, f = new Float32Array(rb * rh);
    for (const k of set) if (kanaele[k]) { const c = kanaele[k]; for (let i = 0; i < f.length; i++) f[i] += c[i] / 255; }
    const g = skaliereF(f, rb, rh, b, h); return zuMaske(g, b, h);
  }
  const f = new Float32Array(karte.b * karte.h);
  for (let i = 0; i < f.length; i++) f[i] = set.has(karte.klassen[i]) ? (karte.vertrauen ? karte.vertrauen[i] / 255 : 1) : (karte.vertrauen ? 1 - karte.vertrauen[i] / 255 : 0) * 0;
  return zuMaske(skaliereF(f, karte.b, karte.h, b, h), b, h);
}

/** MediaPipe-Gesichtsoval (36 Punkte, im Uhrzeigersinn). */
export const OVAL = Object.freeze([10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109]);

/** Polygon (Pixel) mit Kantenglättung füllen (4× vertikale Unterabtastung, exakte horizontale Bedeckung). */
export function fuellePolygon(b, h, punkte, ziel = new Float32Array(b * h)) {
  if (punkte.length < 3) return ziel;
  let y0 = Infinity, y1 = -Infinity; for (const [, y] of punkte) { if (y < y0) y0 = y; if (y > y1) y1 = y; }
  const S = 4, acc = new Float32Array(b + 1);
  for (let y = Math.max(0, Math.floor(y0)); y <= Math.min(h - 1, Math.ceil(y1)); y++) {
    acc.fill(0);
    for (let s = 0; s < S; s++) {
      const sy = y + (s + 0.5) / S, xs = [];
      for (let i = 0, j = punkte.length - 1; i < punkte.length; j = i++) {
        const [xi, yi] = punkte[i], [xj, yj] = punkte[j];
        if ((yi > sy) !== (yj > sy)) xs.push(xi + ((sy - yi) / (yj - yi)) * (xj - xi));
      }
      xs.sort((p, q) => p - q);
      for (let k = 0; k + 1 < xs.length; k += 2) {
        const a = kl(xs[k], 0, b), c = kl(xs[k + 1], 0, b); if (c <= a) continue;
        const ia = Math.floor(a), ic = Math.floor(c);
        if (ia === ic) { if (ia < b) acc[ia] += (c - a) / S; continue; }
        acc[ia] += (ia + 1 - a) / S; for (let x = ia + 1; x < ic; x++) acc[x] += 1 / S; if (ic < b) acc[ic] += (c - ic) / S;
      }
    }
    const o = y * b; for (let x = 0; x < b; x++) if (acc[x] > ziel[o + x]) ziel[o + x] = Math.min(1, acc[x]);
  }
  return ziel;
}
const ellipse = (cx, cy, rx, ry, n = 48) => Array.from({ length: n }, (_, i) => [cx + rx * Math.cos((i / n) * 2 * Math.PI), cy + ry * Math.sin((i / n) * 2 * Math.PI)]);

/** Gesichtsumriss (Pixel) aus Landmarken oder Box. */
export function gesichtUmriss(g, b, h) {
  if (g.landmarken && g.landmarken.length >= 478 * 3) return OVAL.map((k) => [g.landmarken[k * 3] * b, g.landmarken[k * 3 + 1] * h]);
  const bx = g.box; return ellipse((bx.x + bx.b / 2) * b, (bx.y + bx.h / 2) * h, (bx.b / 2) * b, (bx.h / 2) * h);
}

export function maskeAusGesicht(gesicht, b, h, opts = {}) {
  const f = new Float32Array(b * h), um = gesichtUmriss(gesicht, b, h);
  fuellePolygon(b, h, um, f);
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity; for (const [x, y] of um) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  const gb = x1 - x0, gh = y1 - y0, cx = (x0 + x1) / 2;
  if (opts.mitHaar) fuellePolygon(b, h, ellipse(cx, y0 + gh * 0.3, gb * 0.62, gh * 0.55), f);
  if (opts.mitHals) fuellePolygon(b, h, [[cx - gb * 0.3, y1 - gh * 0.15], [cx + gb * 0.3, y1 - gh * 0.15], [cx + gb * 0.36, y1 + gh * 0.45], [cx - gb * 0.36, y1 + gh * 0.45]], f);
  const m = zuMaske(f, b, h);
  return weichzeichnen(m, Math.max(0.5 / Math.min(b, h), (gb / Math.min(b, h)) * 0.015));
}
/** Liegt p (normiert) im Gesicht (Umriss etwas erweitert)? */
export function imGesicht(g, p, rand = 0.08) {
  const um = gesichtUmriss(g, 1, 1); let cx = 0, cy = 0; for (const [x, y] of um) { cx += x; cy += y; } cx /= um.length; cy /= um.length;
  const poly = um.map(([x, y]) => [cx + (x - cx) * (1 + rand), cy + (y - cy) * (1 + rand)]);
  let innen = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > p.y) !== (yj > p.y) && p.x < ((xj - xi) * (p.y - yi)) / (yj - yi) + xi) innen = !innen; }
  return innen;
}

/** Pinsel: Strich = { punkte:[{x,y}] normiert, radiusAnteil, haerte 0..1, modus 'plus'|'minus' }. */
export function pinsel(maske, b, h, liste) {
  const m = maske ? { b, h, daten: Uint8Array.from(maske.b === b && maske.h === h ? maske.daten : skaliereMaske(maske, b, h).daten) } : leer(b, h);
  const d = m.daten, kurz = Math.min(b, h);
  for (const s of liste || []) {
    const r = Math.max(0.5, (s.radiusAnteil ?? 0.03) * kurz), innen = r * kl(s.haerte ?? 0.6, 0, 0.99), minus = s.modus === 'minus';
    const pts = (s.punkte || []).map((p) => [p.x * b, p.y * h]); if (!pts.length) continue;
    if (pts.length === 1) pts.push([pts[0][0] + 1e-3, pts[0][1]]);
    for (let k = 0; k + 1 < pts.length; k++) {
      const [ax, ay] = pts[k], [cx, cy] = pts[k + 1], dx = cx - ax, dy = cy - ay, L2 = dx * dx + dy * dy || 1e-9;
      const xa = Math.max(0, Math.floor(Math.min(ax, cx) - r - 1)), xe = Math.min(b - 1, Math.ceil(Math.max(ax, cx) + r + 1));
      const ya = Math.max(0, Math.floor(Math.min(ay, cy) - r - 1)), ye = Math.min(h - 1, Math.ceil(Math.max(ay, cy) + r + 1));
      for (let y = ya; y <= ye; y++) for (let x = xa; x <= xe; x++) {
        const px = x + 0.5 - ax, py = y + 0.5 - ay, t = kl((px * dx + py * dy) / L2), ex = px - t * dx, ey = py - t * dy, dist = Math.sqrt(ex * ex + ey * ey);
        if (dist >= r + 0.5) continue;
        const w = dist <= innen ? 1 : 1 - glatt(innen, r + 0.5, dist), v = (w * 255 + 0.5) | 0, i = y * b + x;
        if (minus) { const z = 255 - v; if (z < d[i]) d[i] = z; } else if (v > d[i]) d[i] = v;
      }
    }
  }
  return m;
}
/** Lasso: geschlossene Fläche (normierte Punkte). */
export function lasso(b, h, punkte) { return zuMaske(fuellePolygon(b, h, punkte.map((p) => [p.x * b, p.y * h])), b, h); }

/** Verlauf: linear (a → b: 1 → 0) oder radial (Mitte a, Rand b). weich 0..1. */
export function verlauf(b, h, p) {
  const d = new Uint8Array(b * h), A = p.a, B = p.b, weich = kl(p.weich ?? 1, 0.001, 1), asp = b / h;
  for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) {
    const u = (x + 0.5) / b, v = (y + 0.5) / h; let t;
    if (p.art === 'radial') { const rx = (B.x - A.x) * asp, ry = B.y - A.y, R = Math.hypot(rx, ry) || 1e-6; t = Math.hypot((u - A.x) * asp, v - A.y) / R; }
    else { const vx = B.x - A.x, vy = B.y - A.y, L2 = vx * vx + vy * vy || 1e-9; t = ((u - A.x) * vx + (v - A.y) * vy) / L2; }
    let w = 1 - glatt(1 - weich, 1, t); if (p.art !== 'radial') w = 1 - glatt(0.5 - weich / 2, 0.5 + weich / 2, t);
    if (p.umkehren) w = 1 - w; d[y * b + x] = (w * 255 + 0.5) | 0;
  }
  return { b, h, daten: d };
}

/** Farbbereich in OKLCh (L 0..1, C 0..0.4, H Grad). Bereiche weich ausgeblendet. */
export function farbBereich(bild, p) {
  const n = bild.b * bild.h, k = bild.kanaele || 4, d = new Uint8Array(n), w = Math.max(1e-3, p.weich ?? 0.3);
  const [L0, L1] = p.okL || [0, 1], [C0, C1] = p.okC || [0, 1], [H0, H1] = p.okH || [0, 360];
  const bandL = (L1 - L0) * w * 0.5 + 0.01, bandC = (C1 - C0) * w * 0.5 + 0.005, bandH = ((H1 - H0 + 360) % 360 || 360) * w * 0.5 + 2;
  const inB = (v, a, c, band) => (v < a ? 1 - glatt(0, band, a - v) : v > c ? 1 - glatt(0, band, v - c) : 1);
  for (let i = 0; i < n; i++) {
    const [L, a, bb] = oklab(Math.max(0, bild.daten[i * k]), Math.max(0, bild.daten[i * k + 1]), Math.max(0, bild.daten[i * k + 2]));
    const C = Math.hypot(a, bb); let H = (Math.atan2(bb, a) * 180) / Math.PI; if (H < 0) H += 360;
    let wh = 1;
    if (!(H0 <= 0 && H1 >= 360)) { const breite = (H1 - H0 + 360) % 360, rel = (H - H0 + 360) % 360; wh = rel <= breite ? 1 : 1 - glatt(0, bandH, Math.min(rel - breite, 360 - rel)); wh *= glatt(0.005, 0.02, C); }
    d[i] = (inB(L, L0, L1, bandL) * inB(C, C0, C1, bandC) * wh * 255 + 0.5) | 0;
  }
  return { b: bild.b, h: bild.h, daten: d };
}

/**
 * „Alle Hauttöne“: lernt das Hautmodell aus dem Bild selbst (Gesichter/Klassen), sonst breiter Bereich
 * (OKLCh-Farbton 20°–80°, mäßige Buntheit) – funktioniert für helle bis sehr dunkle Haut, weil L nur grob begrenzt ist.
 * opts: { gesichter?, klassen?: KlassenKarte, b?, h? } → Maske in (b,h) (Std. Bildgröße).
 */
export function hautMaske(bild, opts = {}) {
  const b = opts.b || bild.b, h = opts.h || bild.h, k = bild.kanaele || 4, n = bild.b * bild.h;
  const L = new Float32Array(n), A = new Float32Array(n), Bb = new Float32Array(n);
  for (let i = 0; i < n; i++) { const o = oklab(Math.max(0, bild.daten[i * k]), Math.max(0, bild.daten[i * k + 1]), Math.max(0, bild.daten[i * k + 2])); L[i] = o[0]; A[i] = o[1]; Bb[i] = o[2]; }
  // Lernmenge: Klassen-Haut, sonst innere Gesichtsflächen (Wangen/Stirn ohne Augen/Mund)
  let lern = null;
  if (opts.klassen) { const m = maskeAusKlassen(opts.klassen, [KLASSE.GESICHTSHAUT, KLASSE.KOERPERHAUT], bild.b, bild.h); lern = m.daten; }
  else if (opts.gesichter?.length) {
    const f = new Float32Array(n);
    for (const g of opts.gesichter) { const bx = g.box; for (const [ux, uy] of [[0.3, 0.55], [0.7, 0.55], [0.5, 0.22], [0.5, 0.68]])
      fuellePolygon(bild.b, bild.h, ellipse((bx.x + bx.b * ux) * bild.b, (bx.y + bx.h * uy) * bild.h, bx.b * 0.09 * bild.b, bx.h * 0.06 * bild.h, 16), f); }
    lern = zuMaske(f, bild.b, bild.h).daten;
  }
  const out = new Float32Array(n);
  let modell = null;
  if (lern) {   // Mittel + Kovarianz in (L, a, b) → Mahalanobis
    let s = 0, m0 = 0, m1 = 0, m2 = 0;
    for (let i = 0; i < n; i++) if (lern[i] > 200) { s++; m0 += L[i]; m1 += A[i]; m2 += Bb[i]; }
    if (s > 50) {
      m0 /= s; m1 /= s; m2 /= s; let c = [0, 0, 0, 0, 0, 0];
      for (let i = 0; i < n; i++) if (lern[i] > 200) { const d0 = L[i] - m0, d1 = A[i] - m1, d2 = Bb[i] - m2; c[0] += d0 * d0; c[1] += d0 * d1; c[2] += d0 * d2; c[3] += d1 * d1; c[4] += d1 * d2; c[5] += d2 * d2; }
      c = c.map((v) => v / s); c[0] += 4e-3; c[3] += 2e-4; c[5] += 2e-4;   // Licht variiert stark, Farbe wenig
      const [s00, s01, s02, s11, s12, s22] = c, i00 = s11 * s22 - s12 * s12, i01 = s02 * s12 - s01 * s22, i02 = s01 * s12 - s02 * s11, i11 = s00 * s22 - s02 * s02, i12 = s01 * s02 - s00 * s12, i22 = s00 * s11 - s01 * s01;
      const det = s00 * i00 + s01 * i01 + s02 * i02; if (det > 0) modell = { m: [m0, m1, m2], inv: [i00 / det, i01 / det, i02 / det, i11 / det, i12 / det, i22 / det] };
    }
  }
  for (let i = 0; i < n; i++) {
    const C = Math.hypot(A[i], Bb[i]); let H = (Math.atan2(Bb[i], A[i]) * 180) / Math.PI; if (H < 0) H += 360;
    // allgemeiner Hautbereich (alle Hauttöne): Farbton 20–80°, Buntheit 0,02–0,20, L 0,15–0,95
    const allg = (1 - glatt(0, 12, Math.max(0, 20 - H, H - 80))) * glatt(0.012, 0.03, C) * (1 - glatt(0.2, 0.26, C)) * glatt(0.1, 0.18, L[i]) * (1 - glatt(0.93, 0.98, L[i]));
    let w = allg;
    if (modell) { const d0 = L[i] - modell.m[0], d1 = A[i] - modell.m[1], d2 = Bb[i] - modell.m[2], v = modell.inv;
      const md = d0 * (v[0] * d0 + v[1] * d1 + v[2] * d2) + d1 * (v[1] * d0 + v[3] * d1 + v[4] * d2) + d2 * (v[2] * d0 + v[4] * d1 + v[5] * d2);
      w = Math.max(allg * 0.35, 1 - glatt(4, 16, md)); if (lern[i] > 128) w = Math.max(w, lern[i] / 255); }
    out[i] = w;
  }
  return skaliereMaske(zuMaske(out, bild.b, bild.h), b, h);
}

/** Magischer Bereich: Regionswachstum in OKLab ab dem Punkt (normiert), dann geführte Kante. Rückfall ohne Modell. */
export function magischerBereich(bild, punkt, p = {}) {
  const b = bild.b, h = bild.h, k = bild.kanaele || 4, n = b * h, tol = (p.toleranz ?? 0.5);
  const lab = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const o = oklab(Math.max(0, bild.daten[i * k]), Math.max(0, bild.daten[i * k + 1]), Math.max(0, bild.daten[i * k + 2])); lab[i * 3] = o[0]; lab[i * 3 + 1] = o[1] * 1.5; lab[i * 3 + 2] = o[2] * 1.5; }
  const sx = kl(Math.round(punkt.x * b - 0.5), 0, b - 1), sy = kl(Math.round(punkt.y * h - 0.5), 0, h - 1);
  // Saat-Mittel aus 5×5
  let s0 = 0, s1 = 0, s2 = 0, sn = 0; for (let y = Math.max(0, sy - 2); y <= Math.min(h - 1, sy + 2); y++) for (let x = Math.max(0, sx - 2); x <= Math.min(b - 1, sx + 2); x++) { const i = y * b + x; s0 += lab[i * 3]; s1 += lab[i * 3 + 1]; s2 += lab[i * 3 + 2]; sn++; }
  let m0 = s0 / sn, m1 = s1 / sn, m2 = s2 / sn;
  const grenze = 0.02 + 0.16 * tol * tol, kante = 0.015 + 0.05 * tol;   // Abstand zum Mittel / zum Nachbarn
  const drin = new Uint8Array(n), stapel = new Int32Array(n); let sp = 0, anzahl = 0;
  drin[sy * b + sx] = 1; stapel[sp++] = sy * b + sx;
  while (sp > 0) {
    const i = stapel[--sp], x = i % b, y = (i / b) | 0; anzahl++;
    if ((anzahl & 1023) === 0 && anzahl < 200000) { m0 = (m0 * 0.98 + lab[i * 3] * 0.02); m1 = (m1 * 0.98 + lab[i * 3 + 1] * 0.02); m2 = (m2 * 0.98 + lab[i * 3 + 2] * 0.02); }
    for (const j of [x > 0 ? i - 1 : -1, x < b - 1 ? i + 1 : -1, y > 0 ? i - b : -1, y < h - 1 ? i + b : -1]) {
      if (j < 0 || drin[j]) continue;
      const d0 = lab[j * 3] - m0, d1 = lab[j * 3 + 1] - m1, d2 = lab[j * 3 + 2] - m2;
      const e0 = lab[j * 3] - lab[i * 3], e1 = lab[j * 3 + 1] - lab[i * 3 + 1], e2 = lab[j * 3 + 2] - lab[i * 3 + 2];
      if (d0 * d0 + d1 * d1 + d2 * d2 < grenze * grenze && e0 * e0 + e1 * e1 + e2 * e2 < kante * kante) { drin[j] = 1; stapel[sp++] = j; }
    }
  }
  const m = { b, h, daten: new Uint8Array(n) }; for (let i = 0; i < n; i++) m.daten[i] = drin[i] ? 255 : 0;
  // Löcher < 0,3 % schließen (Schließen = Dilatation + Erosion), dann geführte Kante
  const r = Math.max(1, Math.round(0.003 * Math.min(b, h)));
  const zu = morph(morph(m, r, 'dilat'), r, 'ero');
  return p.verfeinern === false ? zu : verfeinereKante(zu, bild, { radius: 0.004, band: 0.006 });
}

// ================================================================ Rezept auswerten (rein + Cache)
const CACHE = new Map(); const CACHE_MAX = 6;
const teilSchluessel = (t) => JSON.stringify([t.quelle, t.modus, t.params, t.rasterId]);
/**
 * MaskenKontext = { b, h, fuehrung?: BildF32, klassen?: KlassenKarte, gesichter?: Gesicht[], teile?: Record<rasterId, MaskeU8>,
 *                   holeRaster?(id): Promise<MaskeU8>, tiefe?: KarteF32 }
 */
export async function baueMaske(ref, ctx) {
  const { b, h } = ctx, schluessel = JSON.stringify([b, h, ref.teile.map(teilSchluessel), ref.weich, ref.verfeinern, ref.umkehren]);
  if (CACHE.has(schluessel)) return CACHE.get(schluessel);
  let m = null;
  for (const t of ref.teile) {
    const teil = await teilMaske(t, ctx); if (!teil) continue;
    m = m ? kombiniere(m, teil, t.modus || 'plus') : (t.modus === 'minus' ? kombiniere(leer(b, h, 255), teil, 'minus') : (t.modus === 'schnitt' ? leer(b, h) : skaliereMaske(teil, b, h)));
  }
  if (!m) m = leer(b, h);
  if (ref.verfeinern && ctx.fuehrung) m = verfeinereKante(m, ctx.fuehrung, { haar: ref.teile.some((t) => t.quelle === MASKE.HAAR || t.quelle === MASKE.PERSON) });
  if (ref.weich > 0) m = weichzeichnen(m, ref.weich * 0.03);
  if (ref.umkehren) m = umkehren(m);
  CACHE.set(schluessel, m); if (CACHE.size > CACHE_MAX) CACHE.delete(CACHE.keys().next().value);
  return m;
}
const KLASSEN_VON = { [MASKE.HAAR]: [KLASSE.HAAR], [MASKE.KLEIDUNG]: [KLASSE.KLEIDUNG], [MASKE.HINTERGRUND]: [KLASSE.HINTERGRUND],
  [MASKE.PERSON]: [KLASSE.HAAR, KLASSE.KOERPERHAUT, KLASSE.GESICHTSHAUT, KLASSE.KLEIDUNG, KLASSE.SONSTIGES] };
async function teilMaske(t, ctx) {
  const { b, h } = ctx, p = t.params || {};
  if (t.rasterId) { const r = ctx.teile?.[t.rasterId] || (ctx.holeRaster ? await ctx.holeRaster(t.rasterId) : null); if (r) return skaliereMaske(r, b, h); }
  switch (t.quelle) {
    case MASKE.PINSEL: return p.lasso ? lasso(b, h, p.lasso) : pinsel(null, b, h, p.striche || []);
    case MASKE.VERLAUF: return verlauf(b, h, p);
    case MASKE.FARBE: return ctx.fuehrung ? skaliereMaske(farbBereich(ctx.fuehrung, p), b, h) : null;
    case MASKE.MAGISCH: return ctx.fuehrung ? skaliereMaske(magischerBereich(ctx.fuehrung, p.punkt, p), b, h) : null;
    case MASKE.GESICHT: { const g = (ctx.gesichter || []).find((x) => x.id === p.gesichtId) || (ctx.gesichter || [])[p.index || 0]; return g ? maskeAusGesicht(g, b, h, p) : null; }
    case MASKE.HAUT: return ctx.fuehrung ? hautMaske(ctx.fuehrung, { klassen: ctx.klassen, gesichter: ctx.gesichter, b, h }) : (ctx.klassen ? maskeAusKlassen(ctx.klassen, [KLASSE.GESICHTSHAUT, KLASSE.KOERPERHAUT], b, h) : null);
    case MASKE.TIEFE: { const k = ctx.tiefe; if (!k) return null; const f = skaliereF(k.daten, k.b, k.h, b, h), [lo, hi] = p.bereich || [0, 0.5], w = p.weich ?? 0.1;
      for (let i = 0; i < f.length; i++) f[i] = (1 - glatt(hi, hi + w, f[i])) * glatt(lo - w, lo, f[i]); return zuMaske(f, b, h); }
    default: if (KLASSEN_VON[t.quelle] && ctx.klassen) return maskeAusKlassen(ctx.klassen, KLASSEN_VON[t.quelle], b, h);
  }
  return null;
}

// ================================================================ KI-gestützt (Haupt-Faden → wk-ki)
async function kopie(bild) { return typeof createImageBitmap === 'function' ? createImageBitmap(bild) : bild; }
export async function erkenneGesichter(ki, bild, opts = {}) {
  const k = await kopie(bild);
  return ki.rufe('gesichter', { bild: k }, { transfer: [k], signal: opts.signal, onFortschritt: opts.onFortschritt });
}
export async function segmentiereKlassen(ki, bild, opts = {}) {
  const k = await kopie(bild);
  return ki.rufe('klassen', { bild: k, b: opts.b, h: opts.h }, { transfer: [k], signal: opts.signal, onFortschritt: opts.onFortschritt });
}
/** Antippen: im Gesicht → Gesicht schnappt ein; sonst Objekt (Modell), Rückfall Magischer Bereich. */
export async function tippAuswahl(ki, kontext, punkt, opts = {}) {
  const { arbeitB: b, arbeitH: h } = kontext;
  const g = (kontext.gesichter || []).find((x) => imGesicht(x, punkt));
  if (g && opts.modus !== 'objekt') return { maske: maskeAusGesicht(g, b, h, opts), art: 'gesicht', gesichtId: g.id };
  try {
    const m = await striche(ki, kontext, [{ modus: 'plus', punkte: [punkt] }], { nurModell: true });
    return { maske: m, art: 'objekt', verfahren: 'modell' };
  } catch (e) {
    if (!kontext.fuehrung) throw e;
    const m = kontext.rechnen ? await kontext.rechnen.rufe('magisch', { bild: kontext.fuehrung, punkt, toleranz: opts.toleranz ?? 0.5 }) : magischerBereich(kontext.fuehrung, punkt, { toleranz: opts.toleranz });
    return { maske: skaliereMaske(m, b, h), art: 'objekt', verfahren: 'rueckfall' };
  }
}
/** Striche (Plus/Minus/Lasso) → Modell; Rückfall: Pinsel/Lasso direkt. */
export async function striche(ki, kontext, liste, opts = {}) {
  const { arbeitB: b, arbeitH: h } = kontext;
  try {
    const k = await kopie(kontext.bild);
    const m = await ki.rufe('antippen', { bild: k, striche: liste, b, h }, { transfer: [k] });
    return skaliereMaske(m, b, h);
  } catch (e) {
    if (opts.nurModell) throw e;
    let m = null;
    for (const s of liste) {
      const t = s.modus === 'lasso' ? lasso(b, h, s.punkte) : pinsel(null, b, h, [{ punkte: s.punkte, radiusAnteil: s.radiusAnteil ?? 0.02, haerte: 0.7 }]);
      m = kombiniere(m, t, s.modus === 'minus' ? 'minus' : 'plus');
    }
    return m || leer(b, h);
  }
}
export async function schaetzeTiefe(ki, bild, opts = {}) {
  const k = await kopie(bild);
  return ki.rufe('tiefe', { bild: k }, { transfer: [k], signal: opts.signal, onFortschritt: opts.onFortschritt });
}

// ================================================================ Bedienung (DOM)
const WERKZEUGE = [
  ['antippen', 'Antippen'], ['gesicht', 'Gesicht'], ['haut', 'Haut'], ['haar', 'Haare'], ['kleidung', 'Kleidung'],
  ['person', 'Person'], ['hintergrund', 'Hintergrund'], ['farbe', 'Farbe'], ['pinsel', 'Pinsel'], ['verlauf', 'Verlauf'],
];
const STIL = `
.aw{display:flex;flex-direction:column;gap:8px;padding:4px 0;color:var(--text,#e8e6e1);font:14px/1.3 system-ui,-apple-system,sans-serif}
.aw-zeile{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.aw button{min-height:44px;min-width:44px;padding:0 12px;border-radius:10px;border:1px solid var(--linie,#33363c);background:var(--flaeche2,#202226);color:inherit;font:inherit}
.aw button[aria-pressed="true"]{border-color:var(--akzent,#d9a441);color:var(--akzent,#d9a441)}
.aw button.haupt{background:var(--akzent,#d9a441);color:#111;border-color:transparent;font-weight:600}
.aw .seg{display:flex}.aw .seg button{border-radius:0}.aw .seg button:first-child{border-radius:10px 0 0 10px}.aw .seg button:last-child{border-radius:0 10px 10px 0}
.aw label{display:flex;align-items:center;gap:8px;min-height:44px;flex:1 1 140px}
.aw input[type=range]{flex:1;min-height:44px;accent-color:var(--akzent,#d9a441)}
.aw .status{color:var(--leise,#9a9890);font-size:13px;min-height:18px}
.aw .balken{height:4px;background:var(--linie,#33363c);border-radius:2px;overflow:hidden}.aw .balken i{display:block;height:100%;width:0;background:var(--akzent,#d9a441)}
.aw-ueber{position:absolute;inset:0;pointer-events:none;touch-action:none}
#werkzeug [data-wz]{flex:0 0 auto;white-space:nowrap;padding:0 14px}
`;
function stil(doc) { if (doc.getElementById('aw-stil')) return; const s = doc.createElement('style'); s.id = 'aw-stil'; s.textContent = STIL; doc.head.appendChild(s); }
const MODELL_FUER = { antippen: ['gesicht-landmarken', 'antippen'], haut: ['klassen'], haar: ['klassen'], kleidung: ['klassen'], person: ['klassen'], hintergrund: ['klassen'], gesicht: ['gesicht-landmarken'] };

/**
 * Auswahl-Bedienung. opts: { app, werkzeug?: HTMLElement (Leiste), onFertig(ref: MaskenRef) }.
 * Ablauf: Werkzeug wählen → antippen/malen → Plus/Minus/Schnitt → Kante/Weichheit → Fertig → lokale Regler.
 */
export function auswahlUI(container, opts) {
  const { app } = opts, doc = container.ownerDocument; stil(doc);
  const aus = [];   // Aufräumen
  const st = { werkzeug: 'antippen', modus: 'plus', teile: [], weich: 0.15, verfeinern: true, umkehren: false, maske: null, rasterIds: {}, pinsel: 0.03,
    kontext: null, klassen: null, fuehrung: null, maskeId: neueId('maske'), lokal: null, ohneModell: new Set() };
  const wurzel = doc.createElement('div'); wurzel.className = 'aw'; container.appendChild(wurzel);
  wurzel.innerHTML = `
    <div class="aw-zeile seg" role="group" aria-label="Verknüpfen">
      <button data-modus="plus" aria-pressed="true">Plus</button><button data-modus="minus" aria-pressed="false">Minus</button><button data-modus="schnitt" aria-pressed="false">Schnitt</button>
    </div>
    <div class="aw-zeile"><button data-a="umkehren" aria-pressed="false">Umkehren</button><button data-a="verfeinern" aria-pressed="true">Kante verfeinern</button><button data-a="leeren">Leeren</button></div>
    <div class="aw-zeile"><label>Weichheit <input type="range" min="0" max="100" value="15" data-r="weich"></label><label data-pinsel hidden>Pinsel <input type="range" min="1" max="15" value="3" data-r="pinsel"></label></div>
    <div class="status" aria-live="polite">Werkzeug wählen und ins Bild tippen.</div><div class="balken" hidden><i></i></div>
    <div class="aw-zeile"><button class="haupt" data-a="fertig" disabled>Fertig</button></div>
    <div class="aw-lokal"></div>`;
  const $ = (s) => wurzel.querySelector(s), statusEl = $('.status'), balken = $('.balken'), fertigKnopf = $('[data-a="fertig"]');
  const status = (t) => { statusEl.textContent = t; };
  const fortschritt = (f) => { balken.hidden = f == null || f >= 1; balken.firstElementChild.style.width = `${Math.round((f || 0) * 100)}%`; };

  if (opts.werkzeug) {
    const wz = opts.werkzeug; wz.innerHTML = WERKZEUGE.map(([id, t]) => `<button class="chip" data-wz="${id}" aria-pressed="${id === st.werkzeug}">${t}</button>`).join('');
    wz.onclick = (e) => { const k = e.target.closest('[data-wz]'); if (k) waehle(k.dataset.wz); };
    aus.push(() => { wz.onclick = null; });
  }
  function waehle(id) {
    st.werkzeug = id; for (const k of (opts.werkzeug || wurzel).querySelectorAll('[data-wz]')) k.setAttribute('aria-pressed', String(k.dataset.wz === id));
    app.tippModus = id === 'pinsel' || id === 'verlauf'; $('[data-pinsel]').hidden = id !== 'pinsel';
    const sofort = ['gesicht', 'haut', 'haar', 'kleidung', 'person', 'hintergrund'].includes(id);
    if (sofort) ausfuehren({ werkzeug: id }).catch(fehler);
    else status({ antippen: 'Ins Bild tippen: Gesicht oder Objekt.', farbe: 'Auf die Farbe tippen, die gewählt werden soll.', pinsel: 'Mit dem Finger malen.', verlauf: 'Ziehen: Anfang → Ende des Verlaufs.' }[id] || '');
  }
  const fehler = (e) => { fortschritt(null); status(e?.text || e?.message || String(e)); };

  async function kontext() {
    if (st.kontext) return st.kontext;
    const q = app.pipeline.quelleGroesse?.() || { arbeitB: 1024, arbeitH: 1024 };
    const fuehrung = await app.arbeitsbild({ kante: 1024 });
    st.fuehrung = fuehrung;
    st.kontext = { bild: app.quelleBitmap(), arbeitB: q.arbeitB, arbeitH: q.arbeitH, gesichter: app.zustand().doc?.gesichter || [], fuehrung, rechnen: app.rechnen };
    return st.kontext;
  }
  async function brauchtModell(werkzeug) {
    const ids = MODELL_FUER[werkzeug]; if (!ids || st.ohneModell.has(werkzeug)) return false;
    let status0; try { status0 = await app.ki.rufe('status', {}); } catch { return false; }
    const fehlt = ids.filter((id) => !status0.ids?.[id]?.imCache);
    if (!fehlt.length) return true;
    const M = await import('./modelle.js');
    return new Promise((ok) => {
      const h = app.blatt('Modell laden', (c) => M.modellUI(c, { ids: fehlt, ki: app.ki, onFertig: (geladen) => { h.schliesse(); if (!geladen) st.ohneModell.add(werkzeug); ok(!!geladen); } }));
    });
  }
  async function ausfuehren(ein) {
    const k = await kontext(); const { arbeitB: b, arbeitH: h } = k; let teil = null, teilMaske = null;
    const mitModell = await brauchtModell(ein.werkzeug);
    status('Rechne …'); fortschritt(0.1);
    if (ein.werkzeug === 'gesicht' || ein.werkzeug === 'antippen') {
      if (mitModell && !k.gesichter.length) { try { k.gesichter = await erkenneGesichter(app.ki, k.bild); if (k.gesichter.length) app.setzeGesichter?.(k.gesichter); } catch {} }
    }
    if (['haut', 'haar', 'kleidung', 'person', 'hintergrund'].includes(ein.werkzeug) && mitModell && !st.klassen) {
      try { st.klassen = await segmentiereKlassen(app.ki, k.bild, { b, h }); } catch (e) { st.klassen = null; }
    }
    k.klassen = st.klassen;
    switch (ein.werkzeug) {
      case 'antippen': {
        const r = await tippAuswahl(mitModell ? app.ki : { rufe: () => Promise.reject(new BildwerkFehler(FEHLER.KEIN_MODELL, 'ohne Modell')) }, k, ein.punkt);
        teilMaske = r.maske; teil = r.art === 'gesicht' ? { quelle: MASKE.GESICHT, params: { gesichtId: r.gesichtId } } : { quelle: MASKE.OBJEKT, params: { punkt: ein.punkt } };
        status(r.art === 'gesicht' ? 'Gesicht erkannt und eingerastet.' : (r.verfahren === 'rueckfall' ? 'Bereich gewählt (ohne Modell: nach Farbe/Helligkeit).' : 'Objekt gewählt.'));
        break;
      }
      case 'gesicht': {
        if (!k.gesichter.length) { fortschritt(null); status(mitModell ? 'Kein Gesicht gefunden.' : 'Ohne Gesichts-Modell nicht möglich – Antippen oder Pinsel nutzen.'); return; }
        teil = { quelle: MASKE.GESICHT, params: { gesichtId: k.gesichter[0].id } }; teilMaske = maskeAusGesicht(k.gesichter[0], b, h); status(`${k.gesichter.length} Gesicht(er) – das größte ist gewählt.`); break;
      }
      case 'haut': teil = { quelle: MASKE.HAUT, params: {} }; teilMaske = hautMaske(k.fuehrung, { klassen: st.klassen, gesichter: k.gesichter, b, h });
        status(st.klassen ? 'Alle Hautflächen gewählt.' : 'Hauttöne nach Farbe gewählt (ohne Modell, kann Holz/Sand mitnehmen).'); break;
      case 'haar': case 'kleidung': case 'person': case 'hintergrund':
        if (!st.klassen) { fortschritt(null); status('Dafür wird das Modell „Haut, Haare, Kleidung“ gebraucht. Ohne Modell: Antippen, Farbe oder Pinsel.'); return; }
        teil = { quelle: ein.werkzeug, params: {} }; teilMaske = maskeAusKlassen(st.klassen, KLASSEN_VON[ein.werkzeug], b, h);
        if (ein.werkzeug === 'haar' || ein.werkzeug === 'person') teilMaske = await verfeinereImWorker(teilMaske, true);
        status('Gewählt.'); break;
      case 'farbe': {
        const f = k.fuehrung, x = Math.round(ein.punkt.x * (f.b - 1)), y = Math.round(ein.punkt.y * (f.h - 1)), i = (y * f.b + x) * (f.kanaele || 4);
        const [L, a, bb] = oklab(f.daten[i], f.daten[i + 1], f.daten[i + 2]); const C = Math.hypot(a, bb); let H = (Math.atan2(bb, a) * 180) / Math.PI; if (H < 0) H += 360;
        const p = { okL: [L - 0.12, L + 0.12], okC: [Math.max(0, C - 0.05), C + 0.05], okH: C < 0.02 ? [0, 360] : [(H - 18 + 360) % 360, (H + 18) % 360], weich: 0.5 };
        teil = { quelle: MASKE.FARBE, params: p }; teilMaske = skaliereMaske(farbBereich(f, p), b, h); status('Farbbereich gewählt.'); break;
      }
      case 'pinsel': teil = { quelle: MASKE.PINSEL, params: { striche: [ein.strich] } }; teilMaske = pinsel(null, b, h, [ein.strich]); status('Gemalt.'); break;
      case 'verlauf': teil = { quelle: MASKE.VERLAUF, params: { art: 'linear', a: ein.a, b: ein.b, weich: 1 } }; teilMaske = verlauf(b, h, teil.params); status('Verlauf gesetzt.'); break;
    }
    if (!teilMaske) { fortschritt(null); return; }
    // Teil-Raster ablegen (für Rezept und Neustart), dann kombinieren
    teil.modus = st.teile.length ? st.modus : (st.modus === 'minus' ? 'minus' : 'plus');
    try { teil.rasterId = await app.raster.lege(teilMaske, 'maske-teil'); } catch {}
    st.teile.push(teil); st.rasterIds[teil.rasterId] = teilMaske;
    await neuBauen(); fortschritt(null);
  }
  async function verfeinereImWorker(m, haar) {
    const f = st.fuehrung; if (!f) return m;
    try { return skaliereMaske(await app.rechnen.rufe('maske-verfeinern', { maske: m, fuehrung: f, opts: { haar } }), m.b, m.h); }
    catch { return verfeinereKante(m, f, { haar }); }
  }
  async function neuBauen() {
    const k = st.kontext; if (!k) return;
    const bau = st.bau = (st.bau || 0) + 1; fertigKnopf.disabled = true;   // „Fertig“ erst, wenn die Maske steht
    let m = null;
    for (const t of st.teile) { const tm = st.rasterIds[t.rasterId]; if (!tm) continue; m = m ? kombiniere(m, tm, t.modus) : (t.modus === 'minus' ? kombiniere(leer(tm.b, tm.h, 255), tm, 'minus') : tm); }
    if (!m) { st.maske = null; app.zeigeMaske(null); fertigKnopf.disabled = true; return; }
    if (st.verfeinern && st.teile.some((t) => [MASKE.OBJEKT, MASKE.FARBE, MASKE.GESICHT].includes(t.quelle))) m = await verfeinereImWorker(m, false);
    // Weichzeichnen im Rechen-Worker (im Haupt-Faden war es eine lange Aufgabe von 160–240 ms direkt nach „Fertig“)
    if (st.weich > 0) { const r = st.weich * 0.03; try { m = await app.rechnen.rufe('maske-weich', { maske: m, radius: r }); } catch { m = weichzeichnen(m, r); } }
    if (bau !== st.bau) return;   // inzwischen neuer Auftrag
    if (st.umkehren) m = umkehren(m);
    st.maske = m; app.pipeline.setzeRaster(st.maskeId, m); app.zeigeMaske(st.maskeId); fertigKnopf.disabled = false;
  }
  const ref = () => ({ id: st.maskeId, teile: st.teile.map((t) => ({ ...t })), weich: st.weich, verfeinern: st.verfeinern, umkehren: st.umkehren });

  wurzel.addEventListener('click', (e) => {
    const m = e.target.closest('[data-modus]'); if (m) { st.modus = m.dataset.modus; for (const k of wurzel.querySelectorAll('[data-modus]')) k.setAttribute('aria-pressed', String(k === m)); return; }
    const a = e.target.closest('[data-a]')?.dataset.a; if (!a) return;
    if (a === 'umkehren' || a === 'verfeinern') { st[a] = !st[a]; e.target.setAttribute('aria-pressed', String(st[a])); neuBauen().catch(fehler); }
    else if (a === 'leeren') { st.teile = []; st.rasterIds = {}; neuBauen(); status('Auswahl geleert.'); }
    else if (a === 'fertig') fertig().catch(fehler);
  });
  $('[data-r="weich"]').addEventListener('change', (e) => { st.weich = e.target.value / 100; neuBauen().catch(fehler); });
  $('[data-r="pinsel"]').addEventListener('input', (e) => { st.pinsel = e.target.value / 100; });

  // Tippen (Antippen, Farbe)
  aus.push(app.on('tipp', (p) => { if (['antippen', 'farbe'].includes(st.werkzeug) && !st.lokal) ausfuehren({ werkzeug: st.werkzeug, punkt: { x: p.x, y: p.y } }).catch(fehler); }));
  // Malen / Verlauf ziehen auf der Bildfläche
  const flaeche = app.bildflaeche, ueber = doc.createElement('canvas'); ueber.className = 'aw-ueber';
  if (flaeche) { if (getComputedStyle(flaeche).position === 'static') flaeche.style.position = 'relative'; flaeche.appendChild(ueber); aus.push(() => ueber.remove()); }
  let zug = null;
  const zuQuelle = async (e) => { const r = flaeche.getBoundingClientRect(); const Z = await import('./zuschnitt.js'); const d = app.zustand().doc;
    return Z.bildschirmZuQuelle({ x: e.clientX - r.left, y: e.clientY - r.top }, app.ansicht(), d.geometrie, d.quelle.b, d.quelle.h); };
  const zeichneZug = () => {
    const r = flaeche.getBoundingClientRect(), dpr = (typeof devicePixelRatio === 'number' ? devicePixelRatio : 1);
    ueber.width = r.width * dpr; ueber.height = r.height * dpr; ueber.style.width = r.width + 'px'; ueber.style.height = r.height + 'px';
    const c = ueber.getContext('2d'); c.clearRect(0, 0, ueber.width, ueber.height); if (!zug) return;
    c.scale(dpr, dpr); c.strokeStyle = st.modus === 'minus' ? 'rgba(120,180,255,0.5)' : 'rgba(255,77,77,0.45)'; c.lineCap = c.lineJoin = 'round';
    c.lineWidth = st.werkzeug === 'pinsel' ? Math.max(4, st.pinsel * Math.min(r.width, r.height) * 2 * (app.ansicht().zoom || 1)) : 3;
    c.beginPath(); zug.css.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
  };
  const runter = (e) => { if (!['pinsel', 'verlauf'].includes(st.werkzeug) || st.lokal || !app.zustand().doc) return; const r = flaeche.getBoundingClientRect();
    zug = { id: e.pointerId, css: [[e.clientX - r.left, e.clientY - r.top]], ev: [e] }; };
  const bewegt = (e) => { if (!zug || e.pointerId !== zug.id) return; const r = flaeche.getBoundingClientRect(); zug.css.push([e.clientX - r.left, e.clientY - r.top]); zug.ev.push(e); requestAnimationFrame(zeichneZug); };
  const hoch = async (e) => {
    if (!zug || e.pointerId !== zug.id) return; const z = zug; zug = null; zeichneZug();
    const pts = []; const schritt = Math.max(1, Math.floor(z.ev.length / 400));
    for (let i = 0; i < z.ev.length; i += schritt) pts.push(await zuQuelle(z.ev[i]));
    if (st.werkzeug === 'pinsel') ausfuehren({ werkzeug: 'pinsel', strich: { punkte: pts, radiusAnteil: st.pinsel, haerte: 0.6, modus: 'plus' } }).catch(fehler);
    else if (pts.length > 1) ausfuehren({ werkzeug: 'verlauf', a: pts[0], b: pts[pts.length - 1] }).catch(fehler);
  };
  if (flaeche) { flaeche.addEventListener('pointerdown', runter); flaeche.addEventListener('pointermove', bewegt); flaeche.addEventListener('pointerup', hoch); flaeche.addEventListener('pointercancel', hoch);
    aus.push(() => { flaeche.removeEventListener('pointerdown', runter); flaeche.removeEventListener('pointermove', bewegt); flaeche.removeEventListener('pointerup', hoch); flaeche.removeEventListener('pointercancel', hoch); }); }

  async function fertig() {
    if (!st.maske) return;
    const r = ref(); r.rasterId = await app.raster.lege(st.maske, 'maske'); app.pipeline.setzeRaster(r.rasterId, st.maske);
    app.zeigeMaske(null); app.tippModus = false; app.pipeline.entferneRaster?.(st.maskeId);   // Vorschau-Raster freigeben (GPU)
    opts.onFertig?.(r);
    zeigeLokal(r);
  }
  /** Lokale Regler für den eben angelegten Schritt (alle Regler außer Kurve). */
  async function zeigeLokal(r) {
    const s = app.zustand().doc?.schritte.find((x) => x.maske?.id === r.id); if (!s) return;
    st.lokal = s.id; status('Lokale Regler: wirken nur in der Auswahl.');
    for (const el of wurzel.children) if (!el.classList.contains('aw-lokal') && !el.classList.contains('status')) el.hidden = true;
    const R = await import('./regler.js'); const ziel = $('.aw-lokal');
    const defs = R.REGLER.filter((d) => d.id !== 'vignette' && d.id !== 'korn');
    const h = R.reglerUI(ziel, { params: s.params.regler || {}, defs, onAendern: (id, wert, phase) => {
      if (phase === 'start') app.setzeQualitaet?.('zieh');
      app.aendere((d) => { const x = d.schritte.find((y) => y.id === st.lokal); if (x) x.params = { ...x.params, regler: { ...(x.params.regler || {}), [id]: wert } }; return d; }, { zusammenfassen: `lokal-${st.lokal}-${id}`, name: 'Lokal' });
      if (phase === 'ende') { app.setzeQualitaet?.('voll'); app.zugEnde?.(); }
    } });
    const neu = doc.createElement('button'); neu.textContent = 'Neue Auswahl'; neu.onclick = () => { h.zerstoere(); neu.remove(); st.lokal = null; st.teile = []; st.rasterIds = {}; st.maske = null; st.maskeId = neueId('maske');
      for (const el of wurzel.children) el.hidden = false; balken.hidden = true; $('[data-pinsel]').hidden = st.werkzeug !== 'pinsel'; fertigKnopf.disabled = true; status('Werkzeug wählen und ins Bild tippen.'); };
    ziel.prepend(neu); aus.push(() => h.zerstoere());
  }

  return {
    setze(p) { if (p?.werkzeug) waehle(p.werkzeug); },
    zerstoere() { for (const f of aus) try { f(); } catch {} app.tippModus = false; app.zeigeMaske(null); if (!st.lokal) app.pipeline.entferneRaster?.(st.maskeId); wurzel.remove(); },
    _zustand: st, _ausfuehren: ausfuehren,
  };
}
