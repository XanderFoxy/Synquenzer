// Bildwerk – Labor (0.6): Mehrband-Schärfe, Licht & Schatten (Abwedeln/Nachbelichten), Bereiche nach Farbe, Haarfarbe,
// Hintergrund-Fokus. Import ohne Nebenwirkung, kein DOM → läuft im Haupt-Faden und im Rechen-Worker (reine Teile).
//
// ================================================================ SCHNITTSTELLE (für die Oberfläche, Teil 2)
// Laden:     const L = await app.labor();          // lädt dieses Modul einmal und registriert die Stufen
// Schritte:  app.aendere((d) => { d.schritte.push(L.mehrbandSchritt({ haare: 30 })); return d; }, { name: 'Schärfe' });
//            Werte ändern wie gewohnt über app.aendere(…, { zusammenfassen: 'mb-haare' }); die Vorschau rechnet sofort.
// Ansicht beim Ziehen (nur Bildschirm, nie Export/Undo):
//            L.zeigeBand(app, schrittId, 1…5) · L.zeigeKarte(app, schrittId) · L.zeigeMaske(app, schrittId) · L.ansichtAus(app)
//
// Schritt-Arten (params; Zahlen sind Reglerwerte wie in der Oberfläche):
//  'mehrband'  fein, haare, textur, kanten, plastizitaet  −100…100 (+ schärfen, − beruhigen)
//              rauschSchwelle 0…100 (Std 40), halo 0…100 (Std 60 = Überschwinger stark begrenzt), hautschutz 0…100 (Std 60),
//              hautRaster: Raster-ID einer Hautmaske (sonst Schätzung, nur wenn Gesichter erkannt sind)
//              Bänder (Quellpixel): fein ≈ 0,5–1 px · haare ≈ 1–2 px · textur ≈ 2–4 px · kanten ≈ 5–10 px · plastizitaet ≈ 20–60 px
//              (bei 12 MP; Plastizität wächst mit der Bildgröße). L.bandSichtbarkeit(pxProQuelle): welche Bänder die Vorschau zeigen kann.
//              L.autoSchaerfe(app) → { fein, haare, textur, kanten, plastizitaet, rauschSchwelle, hautschutz, grund, energie }
//  'plastik'   stil 'dezent'|'plastisch'|'malerisch', staerke 0…100, auto true/false (automatische Licht-/Schatten-Karte),
//              fein { licht, mikro, glanz, rand, farbe, malen } 0…100 (50 = wie der Stil), pinselStaerke 0…100,
//              pinsel.striche [{ id, punkte:[{x,y}] (Quelle normiert), radius (Anteil kurze Seite), haerte 0…1,
//              deckkraft 0…1, modus 'abwedeln'|'nachbelichten' }]. Malen: L.malePinsel(app, schrittId, strich).
//  'bereich'   punkt {x,y}, ziel [L,a,b] (OKLab, beim Antippen gemessen), modus 'zusammen'|'ueberall', toleranz 0…100,
//              weich 0…100, belichtung −3…3 (EV), lichter −100…100, leuchten 0…100, waerme −100…100, saettigung −100…100.
//              Anlegen: const s = await L.neuerBereich(app, punkt, { modus, toleranz }); dann push. Neu antippen: L.bereichPunkt(…).
//              Jeder Bereich ist ein eigener Schritt = eine Ebene (Ebenen-Blatt: an/aus, Deckkraft).
//  'haarfarbe' farbe '#rrggbb', staerke 0…100, helligkeit −100…100 (Struktur bleibt), glanz 0…100 (Lichter neutral halten);
//              braucht schritt.maske (MaskenRef). Maske: await L.haarMaske(app) (Modell „Haare fein“ 0,8 MB, sonst
//              „Haut, Haare, Kleidung“) – ohne Modell die Auswahl-Werkzeuge Farbe/Pinsel nutzen. Farben: L.HAARFARBEN.
//  'fokus'     unschaerfe, abdunkeln, entsaettigen, kante, lichter 0…100; maskeArt 'motiv'|'hintergrund'; braucht schritt.maske
//              (Motiv- oder Hintergrundmaske). Maske: await L.motivMaske(app) (Modell „Haut, Haare, Kleidung“) oder Auswahl „Antippen“.
// Masken aus Modellen werfen BildwerkFehler(KEIN_MODELL), wenn das Modell nicht im Cache liegt: vorher L.modellBedarf(zweck)
// prüfen und mit modelle.modellUI fragen (lädt nie still).
//
// Technik: alles in WebGL2-Shadern. Feine Bänder werden live auf dem aktuellen Bild gerechnet (Gauß-Differenzen, weiches
// Entkernen unter der Rauschschwelle, Überschwinger auf das örtliche Min/Max geklemmt). Großräumige Teile (Plastizität,
// Licht-/Schatten-Karte, Leuchten) kommen aus globalen Karten, die einmal je Bild auf dem Arbeitsbild gerechnet werden
// (ctx.karte) → Regler ziehen kostet nur den letzten Durchgang, Kacheln beim Export brauchen keinen großen Rand und
// sind nahtlos. Kantenschutz der großen Bänder: geführte Filter (He et al.) mit Halo-Bremse.
import { STUFE, ART, STANDARD, neuerSchritt, neueId, BildwerkFehler, FEHLER, KLASSE, gesichtsKopie } from './typen.js';
import { wbMatrix } from './regler.js';

export const LABOR_ARTEN = Object.freeze([ART.MEHRBAND, ART.PLASTIK, ART.BEREICH, ART.HAARFARBE, ART.FOKUS]);

// ================================================================ Definitionen
/** Schärfe-Bänder. sigma = Gauß-Stufe in Quellpixeln (Band k = G(k−1) − G(k)); plastizitaet = Kanten-erhaltend (Karte). */
export const BAENDER = Object.freeze([
  { id: 'fein', titel: 'Feinste Details', beschreibung: 'Wimpern, Iris, Fasern (≈ 0,5–1 px)', sigma: 0.7 },
  { id: 'haare', titel: 'Haare', beschreibung: 'Strähnen, feine Linien (≈ 1–2 px)', sigma: 1.5 },
  { id: 'textur', titel: 'Textur / Gewebe', beschreibung: 'Stoff, Haut, Laub (≈ 2–4 px)', sigma: 3.2 },
  { id: 'kanten', titel: 'Kanten / Architektur', beschreibung: 'Konturen, Fenster, Gebäude (≈ 5–10 px)', sigma: 8.0 },
  { id: 'plastizitaet', titel: 'Plastizität / Klarheit', beschreibung: 'Örtlicher Kontrast der Formen (≈ 20–60 px)', sigma: null },
]);
const G_MAX = [2.4, 2.0, 1.6, 1.2], G5_MAX = 0.9;        // Verstärkung bei Regler 100
const SIGMA_MIN = [0.5, 0.8, 1.3, 2.0];                 // kleinste Gauß-Stufe in der aktuellen Auflösung (Vorschau verkleinert)
const RAUSCH_BAND = [0.715, 0.295, 0.133, 0.069];       // Anteil (σ) weißen Rauschens je Band – gemessen mit bandEnergie (nu)
const R5 = [20, 60];                                     // Plastizität: Kastenradius der zwei Basen (Quellpixel bei 12 MP)

/** Stil-Vorgaben „Licht und Schatten“ (Faktoren; Feinregler 50 = 1×). */
export const PLASTIK_STILE = Object.freeze({
  dezent: { titel: 'Dezent', licht: 0.55, mikro: 0.25, glanz: 0.25, rand: 0.25, farbe: 0.5, malen: 0.0, kurve: 0.10 },
  plastisch: { titel: 'Plastisch', licht: 1.0, mikro: 0.45, glanz: 0.5, rand: 0.45, farbe: 0.8, malen: 0.0, kurve: 0.22 },
  malerisch: { titel: 'Intensiv-malerisch', licht: 1.5, mikro: 0.3, glanz: 0.8, rand: 0.7, farbe: 1.1, malen: 0.55, kurve: 0.35 },
});
/** Vorschläge für die Haarfarbe (eigene Werte). */
export const HAARFARBEN = Object.freeze([
  { id: 'hellblond', titel: 'Hellblond', farbe: '#c9a46a' }, { id: 'goldblond', titel: 'Goldblond', farbe: '#b8863b' },
  { id: 'kupfer', titel: 'Kupfer', farbe: '#a4522a' }, { id: 'kastanie', titel: 'Kastanie', farbe: '#6b3a24' },
  { id: 'dunkelbraun', titel: 'Dunkelbraun', farbe: '#3d2618' }, { id: 'aschbraun', titel: 'Aschbraun', farbe: '#6a5a4c' },
  { id: 'schwarz', titel: 'Schwarz', farbe: '#1c1716' }, { id: 'rose', titel: 'Rosé', farbe: '#c77a8a' },
  { id: 'blau', titel: 'Blau', farbe: '#3a5a9a' }, { id: 'violett', titel: 'Violett', farbe: '#6a3f8a' },
]);

// ================================================================ reine Hilfen (Node-/Worker-testbar)
const klemme = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const glatt = (a, b, x) => { const t = klemme((x - a) / (b - a || 1e-9)); return t * t * (3 - 2 * t); };
const zahl = (v, std = 0) => (typeof v === 'number' && isFinite(v) ? v : std);
const kod = (v) => (v <= 0.0031308 ? 12.92 * Math.max(v, 0) : 1.055 * Math.pow(v, 1 / 2.4) - 0.055);
const linear = (v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
/** linear sRGB → OKLab */
export function okLab(r, g, b) {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b), m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b),
    s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
}
/** '#rrggbb' → OKLCh [L, C, h (Bogenmaß)] */
export function hexZuOklch(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim()); const n = m ? parseInt(m[1], 16) : 0x8a4b2a;
  const [L, a, b] = okLab(linear(((n >> 16) & 255) / 255), linear(((n >> 8) & 255) / 255), linear((n & 255) / 255));
  return [L, Math.hypot(a, b), Math.atan2(b, a)];
}
/** Pixel je Quellpixel → je Band: Anteil, den die Vorschau zeigen kann (1 = voll, klein = erst beim Hineinzoomen sichtbar). */
export function bandSichtbarkeit(pxProQuelle = 1) {
  return BAENDER.map((b, k) => { if (b.sigma == null) return { id: b.id, anteil: 1, sichtbar: true }; const a = sigmaEff(pxProQuelle)[k].a; return { id: b.id, anteil: a, sichtbar: a > 0.5 }; });
}
function sigmaEff(px) { return BAENDER.slice(0, 4).map((b, k) => { const r = b.sigma * px, e = Math.max(r, SIGMA_MIN[k]); return { s: e, a: Math.min(1, (r / e) ** 2) }; }); }
/** Rauschen (σ kodierte Luma) in der aktuellen Auflösung (wie looks.js). */
function rauschJetzt(analyse, px = 1) { const s = analyse?.rauschen?.sigmaL ?? 0.004; return s * Math.min(1, Math.pow(Math.max(0.05, px), 0.75)); }
const groesseFaktor = (kurzQuelle) => klemme((kurzQuelle || 3024) / 3024, 0.5, 2);

/** Bereich: Farbabstand-Grenzen aus Toleranz/Weichheit (gleich für Shader und CPU-Grenze). */
export function bereichGrenzen(toleranz = 35, weich = 30) {
  const t = klemme(zahl(toleranz, 35) / 100), w = klemme(zahl(weich, 30) / 100), T = 0.012 + 0.22 * Math.pow(t, 1.4);
  return { gr: [T * (1 - 0.55 * w), T * (1 + 0.45 * w) + 0.004], gew: [1.0, 1.45] };
}
function aehnlich(L, A, B, z, g) {
  const dL = (L - z[0]) * g.gew[0], da = (A - z[1]) * g.gew[1], db = (B - z[2]) * g.gew[1];
  return 1 - glatt(g.gr[0], g.gr[1], Math.sqrt(dL * dL + da * da + db * db));
}
/** Zielfarbe (OKLab, Mittel 5×5) am Punkt (normiert) eines linearen Bildes (BildF32). */
export function bereichZiel(bild, punkt) {
  const { b, h } = bild, k = bild.kanaele || 4, x0 = Math.round(klemme(punkt.x) * (b - 1)), y0 = Math.round(klemme(punkt.y) * (h - 1));
  let s0 = 0, s1 = 0, s2 = 0, n = 0;
  for (let y = Math.max(0, y0 - 2); y <= Math.min(h - 1, y0 + 2); y++) for (let x = Math.max(0, x0 - 2); x <= Math.min(b - 1, x0 + 2); x++) {
    const i = (y * b + x) * k, o = okLab(Math.max(0, bild.daten[i]), Math.max(0, bild.daten[i + 1]), Math.max(0, bild.daten[i + 2])); s0 += o[0]; s1 += o[1]; s2 += o[2]; n++;
  }
  return [s0 / n, s1 / n, s2 / n].map((v) => Math.round(v * 1e5) / 1e5);
}
/** „Nur zusammenhängend“: Füllen ab dem Punkt über ähnliche Pixel, geschlossen + leicht geweitet → MaskeU8 (Bildgröße).
 *  Die genaue Kante kommt im Shader aus dem Farbabstand in voller Auflösung; diese Grenze sagt nur, WELCHE Fläche. */
export function bereichGate(bild, p) {
  const { b, h } = bild, n = b * h, k = bild.kanaele || 4, z = p.ziel, g = bereichGrenzen(p.toleranz, p.weich), sim = new Float32Array(n);
  for (let i = 0; i < n; i++) { const o = okLab(Math.max(0, bild.daten[i * k]), Math.max(0, bild.daten[i * k + 1]), Math.max(0, bild.daten[i * k + 2])); sim[i] = aehnlich(o[0], o[1], o[2], z, g); }
  let sx = Math.round(klemme(p.punkt?.x ?? 0.5) * (b - 1)), sy = Math.round(klemme(p.punkt?.y ?? 0.5) * (h - 1));
  if (sim[sy * b + sx] < 0.3) { let best = -1; for (let y = Math.max(0, sy - 4); y <= Math.min(h - 1, sy + 4); y++) for (let x = Math.max(0, sx - 4); x <= Math.min(b - 1, sx + 4); x++) if (sim[y * b + x] > best) { best = sim[y * b + x]; sx = x; sy = y; } }
  const drin = new Uint8Array(n), stapel = new Int32Array(n); let sp = 0;
  if (sim[sy * b + sx] >= 0.3) { drin[sy * b + sx] = 1; stapel[sp++] = sy * b + sx; }
  while (sp > 0) {
    const i = stapel[--sp], x = i % b;
    if (x > 0 && !drin[i - 1] && sim[i - 1] >= 0.3) { drin[i - 1] = 1; stapel[sp++] = i - 1; }
    if (x < b - 1 && !drin[i + 1] && sim[i + 1] >= 0.3) { drin[i + 1] = 1; stapel[sp++] = i + 1; }
    if (i >= b && !drin[i - b] && sim[i - b] >= 0.3) { drin[i - b] = 1; stapel[sp++] = i - b; }
    if (i < n - b && !drin[i + b] && sim[i + b] >= 0.3) { drin[i + b] = 1; stapel[sp++] = i + b; }
  }
  const r = Math.max(2, Math.round(0.003 * Math.min(b, h)));
  let m = minMax(minMax(drin, b, h, 1, true), b, h, 1, false);   // Schließen: Nadellöcher (Fensterkreuze, Rauschen) zu
  m = minMax(m, b, h, r, true);                                   // weiten: Feinkante kommt aus dem Shader
  const f = new Float32Array(n); for (let i = 0; i < n; i++) f[i] = m[i];
  const w = kastenF(f, b, h, 1), d = new Uint8Array(n); for (let i = 0; i < n; i++) d[i] = Math.round(klemme(w[i]) * 255);
  return { b, h, daten: d };
}
function minMax(src, b, h, r, max) {
  const t = new Uint8Array(b * h), o = new Uint8Array(b * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) { let v = max ? 0 : 1; for (let k = Math.max(0, x - r); k <= Math.min(b - 1, x + r); k++) { const q = src[y * b + k]; v = max ? (q > v ? q : v) : (q < v ? q : v); } t[y * b + x] = v; }
  for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) { let v = max ? 0 : 1; for (let k = Math.max(0, y - r); k <= Math.min(h - 1, y + r); k++) { const q = t[k * b + x]; v = max ? (q > v ? q : v) : (q < v ? q : v); } o[y * b + x] = v; }
  return o;
}
function kastenF(src, b, h, r) {
  const t = new Float32Array(b * h), o = new Float32Array(b * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) { let s = 0, n = 0; for (let k = Math.max(0, x - r); k <= Math.min(b - 1, x + r); k++) { s += src[y * b + k]; n++; } t[y * b + x] = s / n; }
  for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) { let s = 0, n = 0; for (let k = Math.max(0, y - r); k <= Math.min(h - 1, y + r); k++) { s += t[k * b + x]; n++; } o[y * b + x] = s / n; }
  return o;
}

/** Pinsel-Raster für Abwedeln/Nachbelichten: RGBA8, R = aufhellen, G = abdunkeln (aufbauend wie Deckkraft-Malen). */
export function pinselRaster(striche, b, h, ziel = null, ab = 0) {
  const d = ziel || new Uint8Array(b * h * 4); if (!ziel) for (let i = 3; i < d.length; i += 4) d[i] = 255;
  const kurz = Math.min(b, h);
  for (let k = ab; k < (striche || []).length; k++) {
    const s = striche[k], pts = (s?.punkte || []).map((p) => [klemme(zahl(p.x)) * b, klemme(zahl(p.y)) * h]); if (!pts.length) continue;
    if (pts.length === 1) pts.push([pts[0][0] + 1e-3, pts[0][1]]);
    const r = Math.max(0.75, klemme(zahl(s.radius, 0.04), 0.002, 0.5) * kurz), innen = r * klemme(zahl(s.haerte, 0.3), 0, 0.98);
    const deck = klemme(zahl(s.deckkraft, 0.25)), kanal = s.modus === 'nachbelichten' ? 1 : 0; if (deck <= 0) continue;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    x0 = Math.max(0, Math.floor(x0 - r - 1)); y0 = Math.max(0, Math.floor(y0 - r - 1)); x1 = Math.min(b - 1, Math.ceil(x1 + r + 1)); y1 = Math.min(h - 1, Math.ceil(y1 + r + 1));
    if (x1 < x0 || y1 < y0) continue;
    const bw = x1 - x0 + 1, cov = new Float32Array(bw * (y1 - y0 + 1));
    for (let j = 0; j + 1 < pts.length; j++) {
      const [ax, ay] = pts[j], [cx, cy] = pts[j + 1], dx = cx - ax, dy = cy - ay, L2 = dx * dx + dy * dy || 1e-9;
      const xa = Math.max(x0, Math.floor(Math.min(ax, cx) - r - 1)), xe = Math.min(x1, Math.ceil(Math.max(ax, cx) + r + 1));
      const ya = Math.max(y0, Math.floor(Math.min(ay, cy) - r - 1)), ye = Math.min(y1, Math.ceil(Math.max(ay, cy) + r + 1));
      for (let y = ya; y <= ye; y++) for (let x = xa; x <= xe; x++) {
        const px = x + 0.5 - ax, py = y + 0.5 - ay, t = klemme((px * dx + py * dy) / L2), ex = px - t * dx, ey = py - t * dy, dist = Math.sqrt(ex * ex + ey * ey);
        if (dist >= r) continue; const w = dist <= innen ? 1 : 1 - glatt(innen, r, dist), i = (y - y0) * bw + (x - x0); if (w > cov[i]) cov[i] = w;
      }
    }
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const c = cov[(y - y0) * bw + (x - x0)] * deck; if (c <= 0) continue;
      const o = (y * b + x) * 4 + kanal, v = d[o] / 255; d[o] = Math.round(255 * (v + (1 - v) * c));
    }
  }
  return { b, h, daten: d };
}
const PINSEL = new Map();   // schrittId → { sigs, b, h, daten, version }
const strichSig = (s) => { const p = s?.punkte || [], a = p[0] || {}, z = p[p.length - 1] || {}; return `${s?.id || ''}|${p.length}|${s?.modus}|${s?.deckkraft}|${s?.radius}|${s?.haerte}|${a.x},${a.y}|${z.x},${z.y}`; };
function fnv(t, hsh = 0x811c9dc5) { for (let i = 0; i < t.length; i++) { hsh ^= t.charCodeAt(i); hsh = Math.imul(hsh, 16777619) >>> 0; } return hsh; }
/** Pinsel-Daten eines Schritts, zwischengespeichert; neue Striche werden nur noch dazugemalt. */
function pinselQuelle(id, striche, b, h) {
  const sigs = striche.map(strichSig); let hsh = fnv(`${b}x${h}`); for (const s of sigs) hsh = fnv(s, hsh);
  const version = `${striche.length}:${hsh.toString(36)}`;
  return { version, erzeuge: () => {
    const c = PINSEL.get(id);
    if (c && c.version === version) return c;
    let gleich = 0; if (c && c.b === b && c.h === h) while (gleich < c.sigs.length && gleich < sigs.length && c.sigs[gleich] === sigs[gleich]) gleich++;
    const r = c && c.b === b && c.h === h && gleich === c.sigs.length ? pinselRaster(striche, b, h, c.daten, gleich) : pinselRaster(striche, b, h);
    const neu = { sigs, b, h, daten: r.daten, version }; PINSEL.set(id, neu); if (PINSEL.size > 12) PINSEL.delete(PINSEL.keys().next().value);
    return neu;
  } };
}

// ---- Auto-Schärfe: Energie je Band (CPU, auf einem Ausschnitt in Quell-Auflösung)
function gaussF(src, b, h, sigma) {
  if (sigma < 0.2) return Float32Array.from(src);
  const r = Math.ceil(3 * sigma), k = new Float32Array(2 * r + 1); let s = 0;
  for (let i = -r; i <= r; i++) { k[i + r] = Math.exp(-0.5 * i * i / (sigma * sigma)); s += k[i + r]; } for (let i = 0; i < k.length; i++) k[i] /= s;
  const t = new Float32Array(b * h), o = new Float32Array(b * h);
  for (let y = 0; y < h; y++) { const z = y * b; for (let x = 0; x < b; x++) { let v = 0; for (let i = -r; i <= r; i++) { const xx = x + i < 0 ? 0 : x + i >= b ? b - 1 : x + i; v += k[i + r] * src[z + xx]; } t[z + x] = v; } }
  for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) { let v = 0; for (let i = -r; i <= r; i++) { const yy = y + i < 0 ? 0 : y + i >= h ? h - 1 : y + i; v += k[i + r] * t[yy * b + x]; } o[y * b + x] = v; }
  return o;
}
function baenderVarianz(L, b, h, f, rand) {
  const S = BAENDER.slice(0, 4).map((x) => x.sigma), G = []; let prev = L, ps = 0;
  for (const s of S) { const g = gaussF(prev, b, h, Math.sqrt(Math.max(s * s - ps * ps, 0.01))); G.push(g); prev = g; ps = s; }
  const E = [0, 0, 0, 0, 0]; let n = 0;
  for (let y = rand; y < h - rand; y++) for (let x = rand; x < b - rand; x++) {
    const i = y * b + x, d = [L[i] - G[0][i], G[0][i] - G[1][i], G[1][i] - G[2][i], G[2][i] - G[3][i]]; for (let k = 0; k < 4; k++) E[k] += d[k] * d[k]; n++;
  }
  for (let k = 0; k < 4; k++) E[k] /= Math.max(1, n);
  // Plastizität: verkleinert (÷4) als Gauß-Differenz der zwei Radien (Messung, nicht kantenerhaltend)
  const b4 = Math.max(1, b >> 2), h4 = Math.max(1, h >> 2), L4 = new Float32Array(b4 * h4);
  for (let y = 0; y < h4; y++) for (let x = 0; x < b4; x++) { let s = 0; for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) s += L[Math.min(h - 1, y * 4 + j) * b + Math.min(b - 1, x * 4 + i)]; L4[y * b4 + x] = s / 16; }
  const a = gaussF(L4, b4, h4, 0.58 * R5[0] * f / 4), c = gaussF(a, b4, h4, Math.sqrt((0.58 * R5[1] * f / 4) ** 2 - (0.58 * R5[0] * f / 4) ** 2));
  let e5 = 0, n5 = 0; const r4 = Math.ceil(rand / 4);
  for (let y = r4; y < h4 - r4; y++) for (let x = r4; x < b4 - r4; x++) { const d = a[y * b4 + x] - c[y * b4 + x]; e5 += d * d; n5++; }
  E[4] = e5 / Math.max(1, n5);
  return { E, G };
}
let NU = null;   // Anteil weißen Rauschens (σ = 1) je Band – einmal gemessen
function rauschAnteile() {
  if (NU) return NU; const N = 256, L = new Float32Array(N * N); let s = 12345;
  for (let i = 0; i < L.length; i += 2) { s = (Math.imul(s, 1103515245) + 12345) >>> 0; const u1 = (s + 1) / 4294967297; s = (Math.imul(s, 1103515245) + 12345) >>> 0; const u2 = s / 4294967296;
    const r = Math.sqrt(-2 * Math.log(u1)); L[i] = r * Math.cos(2 * Math.PI * u2); L[i + 1] = r * Math.sin(2 * Math.PI * u2); }
  NU = baenderVarianz(L, N, N, 1, 24).E; return NU;
}
/**
 * Energie je Band. bild: { b, h, daten } – Uint8ClampedArray RGBA (sRGB-kodiert) oder Float32Array RGBA (linear).
 * opts: { sigmaL? (Rauschen kodiert, Quell-Auflösung), kurzQuelle? } → { E[5], nu[5], sigmaN, b, h }
 */
export function bandEnergie(bild, opts = {}) {
  const { b, h } = bild, n = b * h, k = bild.kanaele || 4, fl = bild.daten instanceof Float32Array, L = new Float32Array(n);
  const LUT = new Float32Array(256); for (let i = 0; i < 256; i++) LUT[i] = linear(i / 255);
  for (let i = 0; i < n; i++) { const r = fl ? bild.daten[i * k] : LUT[bild.daten[i * k]], g = fl ? bild.daten[i * k + 1] : LUT[bild.daten[i * k + 1]], bb = fl ? bild.daten[i * k + 2] : LUT[bild.daten[i * k + 2]];
    L[i] = kod(Math.min(1, Math.max(0, 0.2126 * r + 0.7152 * g + 0.0722 * bb))); }
  const f = groesseFaktor(opts.kurzQuelle), { E, G } = baenderVarianz(L, b, h, f, 24), nu = rauschAnteile();
  let sigmaN = opts.sigmaL;
  if (!(sigmaN > 0)) {   // Schätzung: 10 % ruhigste 16×16-Blöcke im feinsten Band
    const vs = [];
    for (let y = 24; y + 16 <= h - 24; y += 16) for (let x = 24; x + 16 <= b - 24; x += 16) { let s = 0, q = 0; for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) { const p = (y + j) * b + x + i, d = L[p] - G[0][p]; s += d; q += d * d; } vs.push(q / 256 - (s / 256) ** 2); }
    vs.sort((a, c) => a - c); sigmaN = vs.length ? Math.sqrt(Math.max(0, vs[Math.floor(vs.length * 0.1)]) / nu[0]) : 0.004;
  }
  return { E, nu: [...nu], sigmaN, b, h };
}
/**
 * Startwerte aus der Band-Energie (eigene Faustregel, Vorschlag – kein Messwert): Ein scharfes Naturfoto hat etwa ein
 * 1/f²-Spektrum; gegenüber dem Kanten-Band (5–10 px) erwartete Anteile 0,25 / 0,71 / 0,71 (fein / haare / textur).
 * Fehlt Energie in den feinen Bändern (weich, verwackelt, hochgerechnet), werden sie stärker vorgeschlagen; wo das Band
 * kaum über dem Rauschen liegt, schwächer. opts: { gesichter: Anzahl }
 */
export function schaerfeVorschlag(en, opts = {}) {
  const n2 = en.sigmaN * en.sigmaN, s = en.E.map((e, k) => Math.max(e - n2 * en.nu[k], 1e-10)), snr = en.E.map((e, k) => s[k] / Math.max(n2 * en.nu[k], 1e-10));
  const t = [0.25, 0.71, 0.71], ref = Math.max(s[3], 1e-9), def = [0, 1, 2].map((k) => klemme(Math.log2(t[k] / Math.max(s[k] / ref, 1e-4)), -1.5, 3));
  const nf = (k) => 0.3 + 0.7 * glatt(1.5, 8, snr[k]);
  const B = [16, 20, 14], S = [12, 14, 10], MAX = [65, 65, 50];
  const v = [0, 1, 2].map((k) => Math.round(klemme(B[k] + S[k] * def[k], 0, MAX[k]) * nf(k)));
  const mitte = (def[0] + def[1] + def[2]) / 3;
  const kanten = Math.round(klemme(12 + 8 * mitte, 0, 35));
  const def5 = klemme(Math.log2(2.03 / Math.max(s[4] / ref, 1e-3)), -2, 2), plast = Math.round(klemme(10 + 8 * def5, 0, 30));
  if (opts.gesichter) v[2] = Math.round(v[2] * 0.6);
  const rausch = Math.round(klemme(30 + 13 * (en.sigmaN * 255 - 1.5), 25, 80));
  const weich = mitte > 0.8, laut = en.sigmaN * 255 > 3;
  const grund = weich ? 'Feine Bänder schwach – das Foto ist eher weich, mehr Schärfe vorgeschlagen.' : mitte < -0.3 ? 'Schon sehr knackig – nur wenig Schärfe vorgeschlagen.' : 'Ausgewogen – leichte Schärfe vorgeschlagen.';
  return { fein: v[0], haare: v[1], textur: v[2], kanten, plastizitaet: plast, rauschSchwelle: rausch, hautschutz: opts.gesichter ? 70 : 60,
    grund: grund + (laut ? ' Sichtbares Rauschen: höhere Rauschschwelle.' : ''), energie: { anteile: [0, 1, 2].map((k) => s[k] / ref), snr } };
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
// Masken/Raster über uv (auch 1×1-Platzhalter)
float M(sampler2D t){ return clamp(texture(t, uv).r, 0.0, 1.0); }
// verkleinerte Textur (Faktor s, aufgerundete Größen) an der Stelle dieses Pixels
vec4 K(sampler2D t, float s){ return texture(t, gl_FragCoord.xy/(s*vec2(textureSize(t, 0)))); }
float th(float x){ x = clamp(x, -9.0, 9.0); float e = exp(2.0*x); return (e - 1.0)/(e + 1.0); }
// Tonwert e (kodiert) um d verschieben, weich begrenzt: nie über 0,995 / nie unter 15 % des Werts → kein neues Clipping
float grenzeAuf(float e, float d){ if (d >= 0.0){ float h = max(0.995 - e, 0.0); return e + h*th(d/max(h, 1e-4)); } float h = max(e, 0.0)*0.85; return e - h*th(-d/max(h, 1e-4)); }
vec3 mitLuma(vec3 c, float e2){ float Y = dot(c, LW), Y2 = lin1(e2); vec3 o = Y > 1e-6 ? c*(Y2/Y) : vec3(Y2);
  float m = max(o.r, max(o.g, o.b)), gr = max(max(c.r, max(c.g, c.b)), 0.996);
  if (m > gr && m > Y2) o = vec3(Y2) + (o - vec3(Y2))*clamp((gr - Y2)/(m - Y2), 0.0, 1.0);
  return max(o, 0.0); }
vec3 schutz(vec3 o, vec3 c){ float Y = dot(o, LW), m = max(o.r, max(o.g, o.b)), gr = max(max(c.r, max(c.g, c.b)), 0.996);
  if (m > gr && m > Y) o = vec3(Y) + (o - vec3(Y))*clamp((gr - Y)/(m - Y), 0.0, 1.0); return max(o, 0.0); }
float hautTon(vec3 c){ vec3 o = zuOk(max(c, 0.0)); float C = length(o.yz), h = degrees(atan(o.z, o.y));
  return smoothstep(0.02, 0.045, C)*(1.0 - smoothstep(0.15, 0.21, C))*smoothstep(18.0, 35.0, h)*(1.0 - smoothstep(78.0, 95.0, h))*smoothstep(0.28, 0.42, o.x); }
// weiches Entkernen: Ausschläge unter der Rauschschwelle t gehen gegen 0, große bleiben (stetig, steiles Knie, keine Stufe)
float kern(float d, float t){ float d4 = d*d*d*d, t4 = t*t*t*t; return d*d4/(d4 + t4 + 1e-20); }
float Dw(float b){ return b <= 0.25 ? ((16.0*b - 12.0)*b + 4.0)*b : sqrt(b); }
// Mischmodus „weiches Licht“ mit grauer Ebene (0,5 + x)
float weichesLicht(float b, float x){ x = clamp(x, -0.5, 0.5); return x <= 0.0 ? b + 2.0*x*b*(1.0 - b) : b + 2.0*x*(Dw(b) - b); }
// geführter Filter: Basis aus Koeffizienten (ā, b̄) in verkleinerter Auflösung; Halo-Bremse: ā≈1 = harte Kante → Band aus
float B(sampler2D k, float s, float l){ vec2 ab = K(k, s).rg; return ab.x*l + ab.y; }
float A(sampler2D k, float s){ return 1.0 - 0.85*smoothstep(0.55, 0.95, K(k, s).r); }
// Ansicht „wo wirkt es“: Bild grau gedämpft, Farbe f (kodiert) mit Gewicht w
vec3 ansicht(vec3 c, float w, vec3 f){ float g = 0.1 + 0.5*kod1(dot(c, LW)); return lin(mix(vec3(g), f, clamp(w, 0.0, 1.0)*0.88)); }
`;
const FS = {
  luma: KOPF + `void main(){ aus = vec4(kod1(min(dot(max(E().rgb, 0.0), LW), 4.0)), 0.0, 0.0, 1.0); }`,
  halb: KOPF + `void main(){ ivec2 p = PX()*2, g = textureSize(ein, 0) - 1;
  aus = 0.25*(texelFetch(ein, min(p, g), 0) + texelFetch(ein, min(p + ivec2(1, 0), g), 0) + texelFetch(ein, min(p + ivec2(0, 1), g), 0) + texelFetch(ein, min(p + ivec2(1, 1), g), 0)); }`,
  gf1: KOPF + `void main(){ float I = E().r; aus = vec4(I, I*I, 0.0, 1.0); }`,
  gf2: KOPF + `uniform float eps; void main(){ vec4 m = E(); float v = max(m.g - m.r*m.r, 0.0), a = v/(v + eps); aus = vec4(a, m.r - a*m.r, 0.0, 1.0); }`,
  mmH: KOPF + `uniform float r; void main(){ ivec2 P = PX(), G = textureSize(ein, 0) - 1; float lo = 1e4, hi = -1e4;
  for (int k = -8; k <= 8; k++){ if (float(abs(k)) > r) continue; float v = texelFetch(ein, clamp(P + ivec2(k, 0), ivec2(0), G), 0).r; lo = min(lo, v); hi = max(hi, v); } aus = vec4(lo, hi, 0.0, 1.0); }`,
  mmV: KOPF + `uniform float r; void main(){ ivec2 P = PX(), G = textureSize(ein, 0) - 1; float lo = 1e4, hi = -1e4;
  for (int k = -8; k <= 8; k++){ if (float(abs(k)) > r) continue; vec2 v = texelFetch(ein, clamp(P + ivec2(0, k), ivec2(0), G), 0).rg; lo = min(lo, v.r); hi = max(hi, v.g); } aus = vec4(lo, hi, 0.0, 1.0); }`,
  misch: KOPF + `uniform sampler2D neu; uniform sampler2D maske; void main(){ aus = mix(E(), F4(neu), M(maske)); }`,
  maskeMal: KOPF + `uniform sampler2D maske; void main(){ aus = vec4(E().r*M(maske), 0.0, 0.0, 1.0); }`,
  maskeVoll: KOPF + `uniform sampler2D maske; uniform int umk; void main(){ float m = M(maske); aus = vec4(umk == 1 ? 1.0 - m : m, 0.0, 0.0, 1.0); }`,

  // ---------------- 1) Mehrband-Schärfe
  // Karte (einmal je Bild): Plastizität = Differenz zweier kantenerhaltender Basen (geführte Filter), Halo-Bremse eingerechnet
  mb5: KOPF + `uniform sampler2D kA; uniform sampler2D kB; uniform vec2 s5;
void main(){ float l = E().r; float bA = B(kA, s5.x, l), bB = B(kB, s5.y, bA); aus = vec4((bA - bB)*A(kA, s5.x)*A(kB, s5.y), bB, 0.0, 1.0); }`,
  mehrband: KOPF + `uniform sampler2D Lt; uniform sampler2D G1; uniform sampler2D G2; uniform sampler2D G3; uniform sampler2D G4; uniform sampler2D mmK; uniform sampler2D mmG; uniform sampler2D k5; uniform sampler2D haut;
uniform vec4 gP; uniform vec4 gN; uniform float g5; uniform vec4 tau; uniform float ueber; uniform int mitHaut; uniform int hautSchaetzen; uniform float hschutz; uniform int zeige; uniform int mit5; uniform int mitMM;
void main(){ vec4 p = E(); vec3 c = max(p.rgb, 0.0); float l = F(Lt);
  float a1 = F(G1), a2 = F(G2), a3 = F(G3), a4 = F(G4);
  float d1 = l - a1, d2 = a1 - a2, d3 = a2 - a3, d4 = a3 - a4;
  float hs = (mitHaut == 1 ? M(haut) : (hautSchaetzen == 1 ? 0.8*hautTon(c) : 0.0))*hschutz;
  vec4 sp = vec4(1.0 - 0.45*hs, 1.0 - 0.85*hs, 1.0 - 0.85*hs, 1.0 - 0.3*hs);          // Haut: Poren/Textur geschont, Wimpern/Konturen weniger
  vec2 lk = mitMM == 1 ? F4(mmK).rg : vec2(l), lg = mitMM == 1 ? F4(mmG).rg : vec2(l);
  float spK = max(lk.y - lk.x, 0.0), spG = max(lg.y - lg.x, 0.0);
  float br = 1.0 - 0.6*smoothstep(0.25, 0.6, spK);                                    // schon harte Kanten: weniger
  vec4 cb = vec4(kern(d1, tau.x), kern(d2, tau.y), kern(d3, tau.z), kern(d4, tau.w)); // Rauschschwelle
  vec4 w = gP*sp*vec4(br, br, br, 1.0 - 0.7*smoothstep(0.2, 0.6, spG));               // Kanten-Band: harte Kanten sind schon scharf
  float e = l + w.x*cb.x + w.y*cb.y + w.z*cb.z;
  // Halo-Begrenzung: Überschwinger nur bis zu einem Anteil der örtlichen Spanne über das Min/Max (5×5) hinaus
  if (mitMM == 1){ float dk = 0.0015 + ueber*spK*(1.0 - 0.65*smoothstep(0.2, 0.6, spK)); e = clamp(e, lk.x - dk, lk.y + dk); }
  e -= gN.x*d1 + gN.y*d2 + gN.z*d3;                                                  // negative Regler: Band beruhigen
  float e1 = e; e += w.w*cb.w;
  if (mitMM == 1){ float dg = 0.0015 + ueber*spG*(1.0 - 0.8*smoothstep(0.15, 0.5, spG)); e = clamp(e, min(e1, min(l, lg.x) - dg), max(e1, max(l, lg.y) + dg)); }
  e -= gN.w*d4;
  float c5 = 0.0;
  if (mit5 == 1){ float lc = clamp(e, 0.0, 1.0); c5 = F4(k5).r*(0.35 + 0.65*(1.0 - pow(abs(2.0*lc - 1.0), 2.0))); e += g5*c5*(g5 > 0.0 ? 1.0 - 0.4*hs : 1.0); }
  if (zeige > 0){ float v = zeige == 1 ? abs(cb.x)*sp.x*br : zeige == 2 ? abs(cb.y)*sp.y*br : zeige == 3 ? abs(cb.z)*sp.z*br : zeige == 4 ? abs(cb.w)*sp.w : abs(c5);
    aus = vec4(ansicht(c, 1.0 - exp(-v/(zeige == 5 ? 0.012 : 0.006)), vec3(0.96, 0.68, 0.22)), 1.0); return; }
  aus = vec4(mitLuma(c, grenzeAuf(l, e - l)), p.a); }`,

  // ---------------- 2) Licht & Schatten (Abwedeln/Nachbelichten)
  // Karte (einmal je Bild, kantenerhaltend): r = Form (grob), g = Mitte (Struktur), b = Basis grob, a = Basis mittel
  dbKarte: KOPF + `uniform sampler2D k1; uniform sampler2D k2; uniform sampler2D k3; uniform vec3 s;
void main(){ float l = E().r; float b1 = B(k1, s.x, l), b2 = B(k2, s.y, b1), b3 = B(k3, s.z, b1); float a2 = A(k2, s.y), a3 = A(k3, s.z);
  aus = vec4((b2 - b3)*a2*a3, (b1 - b2)*a2, b3, b2); }`,
  plastik: KOPF + `uniform sampler2D Lt; uniform sampler2D Gp; uniform sampler2D Gm; uniform sampler2D mm; uniform sampler2D karte; uniform sampler2D pinsel; uniform sampler2D haut;
uniform int mitAuto; uniform int mitPinsel; uniform int mitHaut; uniform int hautSchaetzen; uniform int zeige;
uniform float st; uniform float kForm; uniform float kMikro; uniform float kGlanz; uniform float kRand; uniform float kSatt; uniform float kMalen; uniform float kKurve; uniform float pv; uniform float kPinsel;
uniform vec3 tau; uniform vec4 reg; uniform float seiten;
void main(){ vec4 p = E(); vec3 c = max(p.rgb, 0.0); float l = F(Lt), e = l;
  float hs = mitHaut == 1 ? M(haut) : (hautSchaetzen == 1 ? 0.8*hautTon(c) : 0.0);
  float wL = 0.0;
  if (mitAuto == 1){
    vec4 k = F4(karte); float dForm = kern(k.r, tau.z), dMitte = kern(k.g, tau.y), b3 = k.b, b2 = k.a;
    wL = smoothstep(0.42, 0.88, b3); float wS = 1.0 - smoothstep(0.08, 0.45, b3);
    // 1) mehrstufiger Hochpass als weiches Licht (Form grob + Struktur mittel) – vorhandenes Licht wird herausmodelliert
    float x = st*kForm*(3.0*dForm + 1.2*dMitte*(1.0 - 0.5*hs));
    float ec = clamp(e, 0.0, 1.0); e = weichesLicht(ec, x) + (e - ec);
    // 2) Abwedeln auf den Lichtern der Formen (Negativ multiplizieren), Nachbelichten in ihren Tiefen (tiefste Tiefen geschont)
    float hell = smoothstep(0.0, 0.05, dForm), dunkel = smoothstep(0.0, 0.05, -dForm);
    e = 1.0 - (1.0 - e)*(1.0 - 0.45*st*kForm*wL*hell);
    e *= 1.0 - 0.35*st*kForm*wS*dunkel*smoothstep(0.03, 0.16, e);
    // 3) Glanz auf Lichtkanten (helle Seite der Strukturen in den Lichtern)
    float gl = smoothstep(0.5, 0.92, b2)*smoothstep(0.0, 0.03, dMitte)*(1.0 - 0.6*hs);
    e = 1.0 - (1.0 - e)*(1.0 - 0.4*st*kGlanz*gl);
    // 4) Mikrokontrast (entkernt, Überschwinger geklemmt); „malerisch“ beruhigt dazu die feinste Textur außerhalb von Kanten
    vec2 mn = F4(mm).rg; float span = max(mn.y - mn.x, 0.0); float a0 = F(Gp), a1 = F(Gm);
    float mik = st*kMikro*2.2*kern(a0 - a1, tau.x)*(1.0 - 0.7*hs)*(1.0 - 0.6*smoothstep(0.25, 0.6, span));
    float del = 0.002 + 0.15*span; e += clamp(l + mik, mn.x - del, mn.y + del) - l;
    e -= st*kMalen*0.9*(l - a0)*(1.0 - smoothstep(0.08, 0.25, span));
    // 5) sanft zum Rand abdunkeln (Lichter etwas geschont)
    vec2 g = reg.xy + uv*reg.zw, d = (g - 0.5)*vec2(seiten, 1.0)/max(seiten, 1.0)*2.0; float r = length(d)/1.41421, v = smoothstep(0.35, 1.05, r);
    e *= 1.0 - 0.32*st*kRand*v*v*(1.0 - 0.5*wL);
    // 6) sanfte S-Kurve um die Bildmitte pv (Tiefe, kein HDR)
    ec = clamp(e, 0.0, 1.0); float sk = 2.0*ec*(1.0 - ec)*(ec - pv); if (sk < 0.0) sk *= smoothstep(0.02, 0.16, ec); e += kKurve*st*sk*(1.0 - 0.6*hs);
  }
  // Pinsel: Abwedeln/Nachbelichten in Blenden (R auf, G ab), Lichter/Tiefen weich begrenzt
  if (mitPinsel == 1){ vec2 pr = texture(pinsel, uv).rg; float dv = kPinsel*(pr.x - pr.y); if (abs(dv) > 1e-4){ float t = kod1(lin1(clamp(e, 0.0, 4.0))*exp2(dv)); e = grenzeAuf(e, t - e); } }
  float e2 = grenzeAuf(l, e - l);
  if (zeige == 1){ aus = vec4(lin(vec3(clamp(0.5 + 2.5*(e2 - l), 0.0, 1.0))), 1.0); return; }   // D&B-Karte (grau)
  vec3 o = mitLuma(c, e2);
  // Farbe: Mitten satter (wenig Bunte mehr), Lichter leicht entsättigt, Haut ruhiger
  if (mitAuto == 1 && kSatt > 0.0){ vec3 q = zuOk(o); float C = length(q.yz), ee = clamp(e2, 0.0, 1.0);
    float wm = 1.0 - pow(abs(2.0*ee - 1.0), 2.0), wh = smoothstep(0.72, 0.97, ee);
    float f = 1.0 + st*kSatt*(0.28*wm*(1.0 - smoothstep(0.1, 0.24, C))*(1.0 - 0.5*hs) - 0.22*wh);
    q.yz *= max(f, 0.0); o = schutz(max(ausOk(q), 0.0), c); }
  aus = vec4(o, p.a); }`,

  // ---------------- 3) Bereiche (lokale Korrekturen nach Farbe/Helligkeit)
  bereichMaske: KOPF + `uniform sampler2D orig; uniform sampler2D gate; uniform int mitGate; uniform vec3 ziel; uniform vec2 gr; uniform vec2 gew;
void main(){ vec3 d = zuOk(max(texelFetch(orig, PX(), 0).rgb, 0.0)) - ziel; float dist = length(vec3(d.x*gew.x, d.yz*gew.y));
  float w = 1.0 - smoothstep(gr.x, gr.y, dist); if (mitGate == 1) w *= M(gate); aus = vec4(w, 0.0, 0.0, 1.0); }`,
  glowQ: KOPF + `uniform sampler2D gate; uniform int mitGate; uniform vec3 ziel; uniform vec2 gr; uniform vec2 gew;
void main(){ vec3 c = max(E().rgb, 0.0), d = zuOk(c) - ziel; float w = 1.0 - smoothstep(gr.x, gr.y, length(vec3(d.x*gew.x, d.yz*gew.y)));
  if (mitGate == 1) w *= M(gate); aus = vec4(c*w*smoothstep(0.1, 0.75, kod1(dot(c, LW))), 1.0); }`,
  glowMisch: KOPF + `uniform sampler2D g2; void main(){ aus = vec4(0.55*E().rgb + 0.45*F4(g2).rgb, 1.0); }`,
  bereich: KOPF + `uniform sampler2D mk; uniform sampler2D glow; uniform int mitGlow; uniform float kGlow; uniform float ev; uniform float li; uniform float sat; uniform mat3 W; uniform int mitW; uniform int zeige;
void main(){ vec4 p = E(); vec3 c = max(p.rgb, 0.0); float m = clamp(F(mk), 0.0, 1.0);
  if (zeige == 1){ aus = vec4(mix(c, vec3(1.0, 0.25, 0.2), 0.6*m), 1.0); return; }
  vec3 o = c;
  if (m > 1e-4){
    if (mitW == 1) o = mix(o, max(W*o, 0.0), m);
    float Y = max(dot(o, LW), 1e-6), e = kod1(Y), e2 = e;
    // Aufhellen nur so weit, wie der Farbraum für diese Farbe reicht (kräftige Farben bleiben satt statt nach Weiß zu kippen)
    if (ev > 0.0){ float mx = max(o.r, max(o.g, o.b)), Ym = Y*max(0.995/max(mx, 1e-5), 1.0), Y2 = Y*exp2(ev*m), h = max(Ym - Y, 1e-6); e2 = kod1(Y + h*th((Y2 - Y)/h)); }
    else if (ev < 0.0) e2 = kod1(Y*exp2(ev*m));
    if (li != 0.0) e2 = grenzeAuf(e2, li*0.22*smoothstep(0.4, 0.95, e2)*m);
    o = mitLuma(o, e2);
    if (sat != 0.0){ vec3 q = zuOk(o); q.yz *= max(1.0 + sat*m, 0.0); o = schutz(max(ausOk(q), 0.0), c); }
  }
  // Leuchten: Licht des Bereichs strahlt über seinen Rand hinaus – linear addiert (Licht addiert sich, warm bleibt warm),
  // danach weich unter Weiß begrenzt; im Kern schwächer, damit die Fläche ihre Farbe behält
  if (mitGlow == 1){ vec3 g = F4(glow).rgb*exp2(max(ev, 0.0))*(1.0 - 0.85*m); if (mitW == 1) g = max(W*g, 0.0);
    vec3 o2 = o + kGlow*g; float e0 = kod1(dot(o, LW)), e1 = kod1(dot(o2, LW)); o = mitLuma(o2, grenzeAuf(e0, e1 - e0)); }
  aus = vec4(o, p.a); }`,

  // ---------------- 4) Haarfarbe (OKLCh, Helligkeit bleibt)
  haar: KOPF + `uniform sampler2D maske; uniform vec3 ziel; uniform float st; uniform float hell; uniform float glanz; uniform int zeige;
bool drin(vec3 r){ return all(greaterThanEqual(r, vec3(-1e-4))) && all(lessThanEqual(r, vec3(1.0001))); }
vec3 imGamut(vec3 o){ vec3 r = ausOk(o); if (drin(r)) return r; float lo = 0.0, hi = 1.0;
  for (int i = 0; i < 7; i++){ float m = 0.5*(lo + hi); if (drin(ausOk(vec3(o.x, o.yz*m)))) lo = m; else hi = m; } return clamp(ausOk(vec3(o.x, o.yz*lo)), 0.0, 1.0); }
void main(){ vec4 p = E(); vec3 c = max(p.rgb, 0.0); float m = M(maske);
  if (zeige == 1){ aus = vec4(mix(c, vec3(1.0, 0.25, 0.2), 0.6*m), 1.0); return; }
  m *= st; if (m < 1e-4){ aus = p; return; }
  vec3 o = zuOk(c); float L = clamp(o.x, 0.0, 1.0);
  float L2 = pow(max(L, 1e-4), exp2(-1.1*hell));                                        // heller/dunkler, Strähnen-Struktur bleibt
  float rel = clamp(L2/max(ziel.x, 0.08), 0.0, 2.5);
  // Buntheit folgt der Helligkeit (dunkle Strähnen weniger bunt), Glanzlichter bleiben neutral
  float fC = smoothstep(0.0, 0.25, L2)*mix(1.0, sqrt(rel), 0.55)*(1.0 - glanz*0.65*smoothstep(0.72, 0.97, L2));
  vec3 n = vec3(L2, ziel.y*fC*cos(ziel.z), ziel.y*fC*sin(ziel.z));
  aus = vec4(mix(c, imGamut(n), m), p.a); }`,

  // ---------------- 5) Hintergrund-Fokus (objektivähnliche Unschärfe, Motiv blutet nicht ein)
  fokusVor: KOPF + `uniform sampler2D mf; void main(){ vec3 c = max(E().rgb, 0.0); float w = 1.0 - smoothstep(0.08, 0.5, F(mf)); aus = vec4(c*w, w); }`,
  fokusBokeh: KOPF + `uniform float maxR; uniform int n; uniform float hl;
void main(){ vec2 gr = vec2(textureSize(ein, 0)), P = gl_FragCoord.xy; vec4 acc = vec4(0.0);
  for (int i = 0; i < 160; i++){ if (i >= n) break; float t = (float(i) + 0.5)/float(n), r = maxR*sqrt(t), w0 = float(i)*2.39996323;
    vec4 v = texture(ein, (P + r*vec2(cos(w0), sin(w0)))/gr); vec3 col = v.a > 1e-4 ? v.rgb/v.a : vec3(0.0);
    float wt = v.a*(1.0 + hl*smoothstep(0.6, 1.0, kod1(dot(col, LW)))); acc += vec4(col*wt, wt); }
  aus = acc/float(n); }`,
  fokus: KOPF + `uniform sampler2D bok; uniform float sk; uniform sampler2D mf; uniform int mitBlur; uniform float dunkel; uniform float entsatt; uniform int zeige;
void main(){ vec4 p = E(); vec3 c = max(p.rgb, 0.0); float ms = smoothstep(0.35, 0.95, clamp(F(mf), 0.0, 1.0));
  if (zeige == 1){ aus = vec4(mix(c, vec3(1.0, 0.25, 0.2), 0.6*(1.0 - ms)), 1.0); return; }
  vec3 bg = c;
  if (mitBlur == 1){ vec4 b = K(bok, sk); vec3 u = b.a > 1e-5 ? b.rgb/b.a : c; bg = mix(c, u, smoothstep(0.0, 0.02, b.a)); }
  bg *= exp2(-dunkel);
  if (entsatt > 0.0){ vec3 q = zuOk(bg); q.yz *= 1.0 - entsatt; bg = max(ausOk(q), 0.0); }
  aus = vec4(mix(bg, c, ms), p.a); }`,
};
export const SHADER = Object.freeze(Object.fromEntries(Object.entries(FS).map(([k, v]) => ['labor-' + k, v])));
const prog = (ctx, n) => ctx.programm('labor-' + n, FS[n]);

// ================================================================ Bausteine (GPU)
const ist1x1 = (t) => !t || (t.b === 1 && t.h === 1);
const luma = (ctx, t) => ctx.pass(prog(ctx, 'luma'), {}, { ein: t }, 'r16f', ctx.temp('r16f', t.b, t.h));
function maskiere(ctx, ein, aus, maske) {
  if (!maske || aus === ein) return aus;
  const m = ctx.pass(prog(ctx, 'misch'), {}, { ein, neu: aus, maske }); ctx.frei(aus); return m;
}
/** Min/Max-Hülle (rg) mit Radius r (Pixel, ≤ 8). */
function minmax(ctx, Lt, r) {
  const a = ctx.pass(prog(ctx, 'mmH'), { r }, { ein: Lt }, 'rgba16f', ctx.temp('rgba16f', Lt.b, Lt.h));
  const b = ctx.pass(prog(ctx, 'mmV'), { r }, { ein: a }, 'rgba16f', ctx.temp('rgba16f', Lt.b, Lt.h)); ctx.frei(a); return b;
}
/** Schneller geführter Filter: Koeffizienten (ā, b̄) in verkleinerter Auflösung; rPx = Kastenradius in Pixeln von Lt. */
function gfKoeff(ctx, Lt, rPx, eps) {
  let s = 1; while (s < 16 && rPx / (s * 2) >= 3) s *= 2;
  let t = Lt, b = Lt.b, h = Lt.h;
  for (let k = 1; k < s; k *= 2) { b = Math.ceil(b / 2); h = Math.ceil(h / 2); const o = ctx.pass(prog(ctx, 'halb'), {}, { ein: t }, 'r16f', ctx.temp('r16f', b, h)); if (t !== Lt) ctx.frei(t); t = o; }
  const m = ctx.pass(prog(ctx, 'gf1'), {}, { ein: t }, 'rgba16f', ctx.temp('rgba16f', b, h)); if (t !== Lt) ctx.frei(t);
  const sig = (0.58 * rPx / s) / ctx.kurzeSeite;   // Gauß gleicher Varianz wie der Kasten
  const mb = ctx.unschaerfe(m, sig); ctx.frei(m);
  const ab = ctx.pass(prog(ctx, 'gf2'), { eps }, { ein: mb }, 'rgba16f', ctx.temp('rgba16f', b, h)); ctx.frei(mb);
  const abm = ctx.unschaerfe(ab, sig); ctx.frei(ab);
  return { tex: abm, s };
}
const hautTex = (ctx, id) => { const t = id ? ctx.raster(id) : (ctx.basis ? ctx.basis('haut') : null); return ist1x1(t) ? null : t; };
const anzeigeFuer = (ctx, s, art) => (ctx.anzeige && ctx.anzeige.schritt === s.id && ctx.anzeige.art === art ? ctx.anzeige : null);
const zeigtProbe = (probe, s) => !!(probe?.anzeige && probe.anzeige.schritt === s.id);

// ---------------- 1) Mehrband
const MB = (s) => ({ ...STANDARD.mehrband, ...(s.params || {}) });
const mbWerte = (p) => BAENDER.map((b) => klemme(zahl(p[b.id]), -100, 100));
function mbKarte(g, quelle) {   // auf dem ganzen Arbeitsbild
  const Lt = luma(g, quelle), px = g.pxProQuelle || 1, f = groesseFaktor(g.kurzeSeite / px);
  const kA = gfKoeff(g, Lt, R5[0] * f * px, 0.002), kB = gfKoeff(g, Lt, R5[1] * f * px, 0.002);
  const o = g.pass(prog(g, 'mb5'), { s5: [kA.s, kB.s] }, { ein: Lt, kA: kA.tex, kB: kB.tex }, 'rgba16f', g.temp('rgba16f', Lt.b, Lt.h));
  g.frei(Lt); g.frei(kA.tex); g.frei(kB.tex); return o;
}
function mbStufen(p, zeige) { const v = mbWerte(p); let n = 0; for (let k = 0; k < 4; k++) if (v[k] !== 0 || zeige === k + 1) n = k + 1; return { v, n, mit5: v[4] !== 0 || zeige === 5 }; }
function rendereMehrband(ctx, ein, s, maske) {
  const p = MB(s), px = ctx.pxProQuelle || 1, an = anzeigeFuer(ctx, s, 'band'), zeige = an ? klemme(an.band | 0, 1, 5) : 0;
  const { v, n, mit5 } = mbStufen(p, zeige); if (!n && !mit5) return ein;
  const sg = sigmaEff(px), Lt = luma(ctx, ein), G = []; let prev = Lt, ps = 0;
  for (let k = 0; k < n; k++) { const inc = Math.sqrt(Math.max(sg[k].s * sg[k].s - ps * ps, 0.0625)); const g = ctx.unschaerfe(prev, inc / ctx.kurzeSeite); G.push(g); prev = g; ps = sg[k].s; }
  while (G.length < 4) G.push(G.length ? G[G.length - 1] : Lt);
  // Grenzen: feine Bänder aus dem Bild selbst (Wimpern dürfen kräftiger werden), Kanten-Band aus der entrauschten Stufe G2 –
  // sonst weiten Rauschspitzen die Grenzen auf und ein breiter Saum bleibt neben harten Kanten stehen
  const mmK = n ? minmax(ctx, Lt, klemme(Math.round(2 * px), 1, 4)) : null, mmG = n >= 4 ? minmax(ctx, G[1], klemme(Math.round(3 * px), 1, 8)) : mmK;
  const k5 = mit5 ? ctx.karte('labor-mb5', mbKarte) : null;
  const ht = hautTex(ctx, p.hautRaster), sig = rauschJetzt(ctx.analyse, px), rs = 0.5 + 3.5 * klemme(zahl(p.rauschSchwelle, 40) / 100);
  const tau = RAUSCH_BAND.map((f) => Math.max(0.003, 2.2 * rs * sig * f));   // Schwelle ≈ 4× Rauschen IM Band (Std) bei Regler 40
  const gP = v.slice(0, 4).map((x, k) => (Math.max(x, 0) / 100) * G_MAX[k] * sg[k].a), gN = v.slice(0, 4).map((x) => Math.max(-x, 0) / 100);
  const o = ctx.pass(prog(ctx, 'mehrband'), {
    gP, gN, g5: (v[4] / 100) * G5_MAX, tau, ueber: 0.02 + 0.25 * (1 - klemme(zahl(p.halo, 60) / 100)), mitHaut: ht ? 1 : 0,
    hautSchaetzen: !ht && (ctx.gesichter || []).length ? 1 : 0, hschutz: klemme(zahl(p.hautschutz, 60) / 100), zeige, mit5: k5 ? 1 : 0, mitMM: mmK ? 1 : 0,
  }, { ein, Lt, G1: G[0], G2: G[1], G3: G[2], G4: G[3], mmK: mmK || Lt, mmG: mmG || Lt, k5: k5 || Lt, haut: ht || Lt });
  for (const t of new Set([Lt, ...G, mmK, mmG])) if (t) ctx.frei(t);
  if (zeige) ctx.anzeigeFertig = true;
  return maskiere(ctx, ein, o, maske);
}
function randMehrband(s, ks, probe) {
  const px = probe?.pxProQuelle ?? 1, { n } = mbStufen(MB(s), zeigtProbe(probe, s) ? 4 : 0); if (!n) return 0;
  return Math.ceil(3 * sigmaEff(px)[n - 1].s) + 8 + 4;
}

// ---------------- 2) Licht & Schatten
const RDB = [0.004, 0.013, 0.032];   // Radien der Karte (Anteil kurze Seite): fein / Struktur / Form
function dbKarte(g, quelle) {
  const Lt = luma(g, quelle), ks = g.kurzeSeite, eps = [0.002, 0.001, 0.0005];
  const k = RDB.map((r, i) => gfKoeff(g, Lt, r * ks, eps[i]));
  const o = g.pass(prog(g, 'dbKarte'), { s: k.map((x) => x.s) }, { ein: Lt, k1: k[0].tex, k2: k[1].tex, k3: k[2].tex }, 'rgba16f', g.temp('rgba16f', Lt.b, Lt.h));
  g.frei(Lt); for (const x of k) g.frei(x.tex); return o;
}
const PL = (s) => ({ ...STANDARD.plastik, ...(s.params || {}) });
const plFein = (p, id, stil) => (stil[id] ?? 0) * (zahl(p.fein?.[id], 50) / 50);
function plAktiv(p) { return (p.auto !== false && zahl(p.staerke, 50) > 0) || (p.pinsel?.striche || []).length > 0; }
function rendereFormat(ctx) {   // Pinsel-Raster: lange Seite 1024, Seitenverhältnis der Quelle
  const gesB = ctx.region ? ctx.b / ctx.region.b : ctx.b, gesH = ctx.region ? ctx.h / ctx.region.h : ctx.h, a = Math.round((gesB / gesH) * 1e4) / 1e4;
  return a >= 1 ? [1024, Math.max(1, Math.round(1024 / a))] : [Math.max(1, Math.round(1024 * a)), 1024];
}
function renderePlastik(ctx, ein, s, maske) {
  const p = PL(s), stil = PLASTIK_STILE[p.stil] || PLASTIK_STILE.plastisch, st = klemme(zahl(p.staerke, 50) / 100, 0, 1.5);
  const zeige = !!anzeigeFuer(ctx, s, 'karte'), auto = p.auto !== false && (st > 0 || zeige), striche = p.pinsel?.striche || [];
  if (!auto && !striche.length && !zeige) return ein;
  const px = ctx.pxProQuelle || 1, ks = ctx.kurzeSeite, Lt = luma(ctx, ein);
  let Gp = Lt, Gm = Lt, mm = null, karte = null;
  if (auto) {
    const sp = Math.max(0.5, 1.0 * px), sm = Math.max(1.2, 3.5 * px);
    Gp = ctx.unschaerfe(Lt, sp / ks); Gm = ctx.unschaerfe(Gp, Math.sqrt(sm * sm - sp * sp) / ks);
    mm = minmax(ctx, Lt, klemme(Math.round(2 * px), 1, 4)); karte = ctx.karte('labor-db', dbKarte);
  }
  let pin = null;
  if (striche.length) { const [rb, rh] = rendereFormat(ctx), q = pinselQuelle(s.id, striche, rb, rh); pin = ctx.textur('labor-pinsel:' + s.id, q.version, q.erzeuge); }
  const reg = ctx.region ? [ctx.region.x, ctx.region.y, ctx.region.b, ctx.region.h] : [0, 0, 1, 1];
  const gesB = ctx.region ? ctx.b / ctx.region.b : ctx.b, gesH = ctx.region ? ctx.h / ctx.region.h : ctx.h;
  const ht = hautTex(ctx), sig = rauschJetzt(ctx.analyse, px);
  const o = ctx.pass(prog(ctx, 'plastik'), {
    mitAuto: auto && karte ? 1 : 0, mitPinsel: pin ? 1 : 0, mitHaut: ht ? 1 : 0, hautSchaetzen: !ht && (ctx.gesichter || []).length ? 1 : 0, zeige: zeige ? 1 : 0,
    st: zeige && st === 0 ? 0.5 : st, kForm: plFein(p, 'licht', stil), kMikro: plFein(p, 'mikro', stil), kGlanz: plFein(p, 'glanz', stil), kRand: plFein(p, 'rand', stil),
    kSatt: plFein(p, 'farbe', stil), kMalen: plFein(p, 'malen', stil), kKurve: stil.kurve, pv: klemme(ctx.analyse?.belichtung?.p50 ?? 0.42, 0.25, 0.42),
    kPinsel: 1.25 * klemme(zahl(p.pinselStaerke, 100) / 100, 0, 2), tau: [1.5, 0.6, 0.3].map((f) => Math.max(0.002, f * sig)), reg, seiten: gesB / gesH,
  }, { ein, Lt, Gp, Gm, mm: mm || Lt, karte: karte || Lt, pinsel: pin || Lt, haut: ht || Lt });
  for (const t of new Set([Lt, Gp, Gm, mm])) if (t) ctx.frei(t);
  if (zeige) ctx.anzeigeFertig = true;
  return maskiere(ctx, ein, o, maske);
}
function randPlastik(s, ks, probe) { const px = probe?.pxProQuelle ?? 1; return PL(s).auto !== false ? Math.ceil(3 * Math.max(1.2, 3.5 * px)) + 8 : 0; }

// ---------------- 3) Bereiche
const BE = (s) => ({ ...STANDARD.bereich, ...(s.params || {}) });
/** Raster-ID der Grenze („nur zusammenhängend“) – hängt nur an Punkt, Zielfarbe, Toleranz, Weichheit. */
export function gateId(p) { return 'labor-gate:' + fnv(JSON.stringify([p.punkt, p.ziel, Math.round(zahl(p.toleranz, 35)), Math.round(zahl(p.weich, 30))])).toString(36); }
const LETZTE_GATES = new Map();   // schrittId → [rasterIds] (neueste zuletzt)
function gateFuer(ctx, s) {
  const t = ctx.raster(gateId(s.params)); if (t) return t;
  const l = LETZTE_GATES.get(s.id); if (l) for (let i = l.length - 1; i >= 0; i--) { const x = ctx.raster(l[i]); if (x) return x; }   // während neu gerechnet wird: letzte Grenze
  return null;
}
const beKorr = (p) => zahl(p.belichtung) !== 0 || zahl(p.lichter) !== 0 || zahl(p.leuchten) > 0 || zahl(p.waerme) !== 0 || zahl(p.saettigung) !== 0;
const waermeMatrix = (w) => { const M = wbMatrix(6504 * Math.pow(2, klemme(w / 100, -1, 1) * 0.9), 0); return new Float32Array([M[0], M[3], M[6], M[1], M[4], M[7], M[2], M[5], M[8]]); };
function rendereBereich(ctx, ein, s, maske) {
  const p = BE(s); if (!Array.isArray(p.ziel)) return ein;
  const zeige = !!anzeigeFuer(ctx, s, 'maske'); if (!beKorr(p) && !zeige) return ein;
  const zus = p.modus !== 'ueberall', gate = zus ? gateFuer(ctx, s) : null; if (zus && !gate) return ein;   // Grenze wird noch gerechnet
  const g = bereichGrenzen(p.toleranz, p.weich), werte = { ziel: p.ziel, gr: g.gr, gew: g.gew, mitGate: gate ? 1 : 0 };
  let mk = ctx.pass(prog(ctx, 'bereichMaske'), werte, { orig: ctx.original || ein, gate: gate || ein }, 'r16f', ctx.temp('r16f', ein.b, ein.h));
  const sw = (klemme(zahl(p.weich, 30) / 100)) * 0.004;
  if (sw * ctx.kurzeSeite >= 0.5) { const b = ctx.unschaerfe(mk, sw); ctx.frei(mk); mk = b; }
  if (maske) { const m2 = ctx.pass(prog(ctx, 'maskeMal'), {}, { ein: mk, maske }, 'r16f', ctx.temp('r16f', mk.b, mk.h)); ctx.frei(mk); mk = m2; }
  const kGlow = klemme(zahl(p.leuchten) / 100) * 1.6;
  let glow = null;
  if (kGlow > 0) {
    const schl = 'labor-glow:' + fnv(JSON.stringify([p.ziel, p.toleranz, p.weich, zus ? gateId(p) : 0])).toString(36);
    glow = ctx.karte(schl, (k, quelle) => {
      const gt = zus ? k.raster(gateId(p)) : null; if (zus && !gt) return null;
      const Q = k.pass(prog(k, 'glowQ'), werte, { ein: quelle, gate: gt || quelle }, 'rgba16f', k.temp('rgba16f', quelle.b, quelle.h));
      let t = Q; for (let i = 0; i < 2; i++) { const h = k.pass(prog(k, 'halb'), {}, { ein: t }, 'rgba16f', k.temp('rgba16f', Math.ceil(t.b / 2), Math.ceil(t.h / 2))); k.frei(t); t = h; }
      const g1 = k.unschaerfe(t, 0.008 / 4), g2 = k.unschaerfe(g1, Math.sqrt(0.025 ** 2 - 0.008 ** 2) / 4); k.frei(t);
      const o = k.pass(prog(k, 'glowMisch'), {}, { ein: g1, g2 }, 'rgba16f', k.temp('rgba16f', g1.b, g1.h)); k.frei(g1); k.frei(g2); return o;
    });
  }
  const w = zahl(p.waerme);
  const o = ctx.pass(prog(ctx, 'bereich'), {
    mitGlow: glow ? 1 : 0, kGlow, ev: klemme(zahl(p.belichtung), -3, 3), li: klemme(zahl(p.lichter) / 100, -1, 1), sat: klemme(zahl(p.saettigung) / 100, -1, 1),
    W: w ? waermeMatrix(w) : new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]), mitW: w ? 1 : 0, zeige: zeige ? 1 : 0,
  }, { ein, mk, glow: glow || mk });
  ctx.frei(mk); if (zeige) ctx.anzeigeFertig = true;
  return o;
}
function randBereich(s, ks) { const p = BE(s); return Math.ceil(3 * klemme(zahl(p.weich, 30) / 100) * 0.004 * ks) + 4; }

// ---------------- 4) Haarfarbe
const HF = (s) => ({ ...STANDARD.haarfarbe, ...(s.params || {}) });
function rendereHaar(ctx, ein, s, maske) {
  if (!maske) return ein;
  const p = HF(s), zeige = !!anzeigeFuer(ctx, s, 'maske');
  const o = ctx.pass(prog(ctx, 'haar'), { ziel: hexZuOklch(p.farbe), st: klemme(zahl(p.staerke, 80) / 100), hell: klemme(zahl(p.helligkeit) / 100, -1, 1), glanz: klemme(zahl(p.glanz, 60) / 100), zeige: zeige ? 1 : 0 }, { ein, maske });
  if (zeige) ctx.anzeigeFertig = true;
  return o;
}

// ---------------- 5) Hintergrund-Fokus
const FO = (s) => ({ ...STANDARD.fokus, ...(s.params || {}) });
const foRadius = (p, ks) => klemme(zahl(p.unschaerfe, 50) / 100) * 0.025 * ks;   // Kreis-Radius (px) bei 100 = 2,5 % der kurzen Seite
const foKante = (p, ks) => (0.0015 + klemme(zahl(p.kante, 40) / 100) * 0.008) * ks;
function rendereFokus(ctx, ein, s, maske) {
  if (!maske) return ein;
  const p = FO(s), ks = ctx.kurzeSeite, zeige = !!anzeigeFuer(ctx, s, 'maske'), R = foRadius(p, ks);
  const dunkel = klemme(zahl(p.abdunkeln, 15) / 100) * 1.0, entsatt = klemme(zahl(p.entsaettigen, 15) / 100);
  if (R < 0.6 && dunkel <= 0 && entsatt <= 0 && !zeige) return ein;
  let mf = ctx.pass(prog(ctx, 'maskeVoll'), { umk: p.maskeArt === 'hintergrund' ? 1 : 0 }, { maske }, 'r16f', ctx.temp('r16f', ein.b, ein.h));
  const mb = ctx.unschaerfe(mf, foKante(p, ks) / ks); ctx.frei(mf); mf = mb;
  let bok = null, sk = 1;
  if (R >= 0.6) {
    let t = ctx.pass(prog(ctx, 'fokusVor'), {}, { ein, mf }, 'rgba16f');
    while (sk < 8 && R / sk > 10 && t.b > 16 && t.h > 16) { const h = ctx.pass(prog(ctx, 'halb'), {}, { ein: t }, 'rgba16f', ctx.temp('rgba16f', Math.ceil(t.b / 2), Math.ceil(t.h / 2))); ctx.frei(t); t = h; sk *= 2; }
    bok = ctx.pass(prog(ctx, 'fokusBokeh'), { maxR: R / sk, n: ctx.qualitaet === 'zieh' ? 40 : 96, hl: 1.5 * klemme(zahl(p.lichter, 50) / 100) }, { ein: t }, 'rgba16f', ctx.temp('rgba16f', t.b, t.h)); ctx.frei(t);
  }
  const o = ctx.pass(prog(ctx, 'fokus'), { sk, mitBlur: bok ? 1 : 0, dunkel, entsatt, zeige: zeige ? 1 : 0 }, { ein, bok: bok || mf, mf });
  ctx.frei(mf); if (bok) ctx.frei(bok); if (zeige) ctx.anzeigeFertig = true;
  return o;
}
function randFokus(s, ks) { const p = FO(s); return Math.ceil(foRadius(p, ks) + 3 * foKante(p, ks)) + 24; }

// ================================================================ Stufen-Module
const modul = (name, stufe, arten, aktiv, rendere, rand, braucht = []) => ({ name, stufe, arten, aktiv, rendere, rand, braucht });
/** StufenModul[] für gl.js (registriereStufen). */
export const STUFEN = Object.freeze([
  modul('labor-mehrband', STUFE.DETAILS, [ART.MEHRBAND], (s, probe) => { const r = mbStufen(MB(s), zeigtProbe(probe, s) ? 1 : 0); return r.n > 0 || r.mit5; }, rendereMehrband, randMehrband, ['haut', 'gesichter']),
  modul('labor-plastik', STUFE.PLASTIK, [ART.PLASTIK], (s, probe) => plAktiv(PL(s)) || zeigtProbe(probe, s), renderePlastik, randPlastik, ['haut', 'gesichter']),
  modul('labor-bereich', STUFE.BEREICH, [ART.BEREICH], (s, probe) => Array.isArray(s.params?.ziel) && (beKorr(BE(s)) || zeigtProbe(probe, s)), rendereBereich, randBereich),
  modul('labor-haarfarbe', STUFE.HAARFARBE, [ART.HAARFARBE], (s, probe) => !!s.maske && (zahl(HF(s).staerke, 80) > 0 || zeigtProbe(probe, s)), rendereHaar, () => 0),
  modul('labor-fokus', STUFE.FOKUS, [ART.FOKUS], (s, probe) => { const p = FO(s); return !!s.maske && (zahl(p.unschaerfe) > 0 || zahl(p.abdunkeln) > 0 || zahl(p.entsaettigen) > 0 || zeigtProbe(probe, s)); }, rendereFokus, randFokus),
]);

// ================================================================ Schritte
/** @returns {import('./typen.js').Schritt} */
export function mehrbandSchritt(params = {}) { return neuerSchritt(ART.MEHRBAND, params, { name: 'Schärfe in Stufen' }); }
export function plastikSchritt(params = {}) { return neuerSchritt(ART.PLASTIK, { pinsel: { striche: [] }, fein: {}, ...params }, { name: 'Licht und Schatten' }); }
export function bereichSchritt(params = {}) { return neuerSchritt(ART.BEREICH, params, { name: 'Bereich' }); }
export function haarfarbeSchritt(maske, params = {}) { return neuerSchritt(ART.HAARFARBE, params, { maske, name: 'Haarfarbe' }); }
export function fokusSchritt(maske, params = {}) { return neuerSchritt(ART.FOKUS, params, { maske, name: 'Hintergrund' }); }

// ================================================================ App-Helfer (Haupt-Faden)
const finde = (app, id) => app.zustand().doc?.schritte.find((s) => s.id === id) || null;
export const zeigeBand = (app, schritt, band) => app.setzeAnzeige(band ? { schritt, art: 'band', band } : null);
export const zeigeKarte = (app, schritt, an = true) => app.setzeAnzeige(an ? { schritt, art: 'karte' } : null);
export const zeigeMaske = (app, schritt, an = true) => app.setzeAnzeige(an ? { schritt, art: 'maske' } : null);
export const ansichtAus = (app) => app.setzeAnzeige(null);

let FUEHRUNG = null;   // { schl, bild } Arbeitsbild 1024 (linear) für Farbe antippen / Grenzen
async function fuehrungsbild(app) {
  const d = app.zustand().doc, schl = `${d?.id}:${d?.quelle?.rasterId}`;
  if (FUEHRUNG?.schl === schl) return FUEHRUNG.bild;
  const bild = await app.arbeitsbild({ kante: 1024 }); FUEHRUNG = { schl, bild }; return bild;
}

/** Bereich anlegen: Farbe am Punkt messen. opts: modus, toleranz, weich und Startwerte (belichtung, leuchten, …). → Schritt (noch nicht im Dokument). */
export async function neuerBereich(app, punkt, opts = {}) {
  const ziel = bereichZiel(await fuehrungsbild(app), punkt);
  return bereichSchritt({ ...opts, punkt: { x: punkt.x, y: punkt.y }, ziel });
}
/** Bereich neu antippen (Farbe neu messen) – im Undo. */
export async function bereichPunkt(app, schrittId, punkt) {
  const ziel = bereichZiel(await fuehrungsbild(app), punkt);
  app.aendere((d) => { const s = d.schritte.find((x) => x.id === schrittId); if (s) s.params = { ...s.params, punkt: { x: punkt.x, y: punkt.y }, ziel }; return d; }, { name: 'Bereich antippen' });
}

const GATE_LAEUFT = new Map();
function merkeGate(app, schrittId, id) {
  const l = LETZTE_GATES.get(schrittId) || []; const i = l.indexOf(id); if (i >= 0) l.splice(i, 1); l.push(id); LETZTE_GATES.set(schrittId, l);
  const benutzt = new Set((app.zustand().doc?.schritte || []).filter((s) => s.art === ART.BEREICH && s.params?.ziel).map((s) => gateId(s.params)));
  while (l.length > 4) { const alt = l.shift(); if (!benutzt.has(alt)) app.pipeline.entferneRaster?.(alt); }
}
function baueGate(app, s) {
  const id = gateId(s.params); if (app.pipeline.hatRaster?.(id)) { merkeGate(app, s.id, id); return; }
  const lauf = GATE_LAEUFT.get(s.id); if (lauf) { lauf.naechste = s; return; }
  const job = { naechste: null }; GATE_LAEUFT.set(s.id, job);
  (async () => {
    try {
      const f = await fuehrungsbild(app), params = { punkt: s.params.punkt, ziel: s.params.ziel, toleranz: s.params.toleranz, weich: s.params.weich };
      let m; try { m = await app.rechnen.rufe('labor-bereich', { bild: f, params }); } catch { m = bereichGate(f, params); }
      if (m?.daten) { app.pipeline.setzeRaster(id, m); merkeGate(app, s.id, id); app.neuZeichnen?.(); }
    } catch (e) { console.warn('Bereich-Grenze', e); }
    finally { GATE_LAEUFT.delete(s.id); if (job.naechste && gateId(job.naechste.params) !== id) baueGate(app, job.naechste); }
  })();
}
/** Fehlende Raster der Labor-Schritte bauen/laden (app.js ruft das nach jeder Änderung; doppelte Aufträge werden zusammengelegt). */
export function sichereRaster(app) {
  const doc = app.zustand().doc; if (!doc || !app.pipeline?.hatQuelle?.()) return;
  for (const s of doc.schritte) {
    if (!s.an) continue;
    if (s.art === ART.BEREICH && Array.isArray(s.params?.ziel) && s.params.modus !== 'ueberall') baueGate(app, s);
    const hr = s.art === ART.MEHRBAND ? s.params?.hautRaster : null;
    if (hr && !app.pipeline.hatRaster?.(hr)) app.raster.hole(hr).then((r) => { if (r && !app.pipeline.hatRaster(hr)) { app.pipeline.setzeRaster(hr, r); app.neuZeichnen?.(); } }).catch(() => {});
  }
}

/** Pinsel-Strich für Abwedeln/Nachbelichten anhängen (im Undo, ein Eintrag je Strich). */
export function malePinsel(app, schrittId, strich) {
  const st = { id: neueId('p'), radius: 0.04, haerte: 0.3, deckkraft: 0.25, modus: 'abwedeln', ...strich };
  app.aendere((d) => { const s = d.schritte.find((x) => x.id === schrittId); if (s) { s.params.pinsel = { ...(s.params.pinsel || {}), striche: [...(s.params.pinsel?.striche || []), st] }; } return d; }, { name: st.modus === 'nachbelichten' ? 'Nachbelichten' : 'Abwedeln' });
  return st;
}
export function pinselLeeren(app, schrittId) { app.aendere((d) => { const s = d.schritte.find((x) => x.id === schrittId); if (s) s.params.pinsel = { striche: [] }; return d; }, { name: 'Pinsel leeren' }); }

/** Auto-Schärfe: misst die Band-Energie auf einem Ausschnitt (768², Quell-Auflösung; Gesicht, sonst Mitte) und schlägt Startwerte vor. */
export async function autoSchaerfe(app) {
  const doc = app.zustand().doc, bmp = app.quelleBitmap(); if (!doc || !bmp) throw new BildwerkFehler(FEHLER.UNBEKANNT, 'Kein Bild');
  const W = bmp.width, H = bmp.height, S = Math.min(768, W, H), g = (doc.gesichter || []).slice().sort((a, b) => b.box.b * b.box.h - a.box.b * a.box.h)[0];
  const cx = g ? g.box.x + g.box.b / 2 : 0.5, cy = g ? g.box.y + g.box.h / 2 : 0.5;
  const sx = Math.round(klemme(cx * W - S / 2, 0, W - S)), sy = Math.round(klemme(cy * H - S / 2, 0, H - S));
  const opts = { sigmaL: doc.analyse?.rauschen?.sigmaL, kurzQuelle: Math.min(W, H) };
  let en = null;
  try { const crop = await createImageBitmap(bmp, sx, sy, S, S); en = await app.rechnen.rufe('labor-energie', { bild: crop, ...opts }, { transfer: [crop] }); } catch { en = null; }
  if (!en) { const c = new OffscreenCanvas(S, S), x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(bmp, sx, sy, S, S, 0, 0, S, S); en = bandEnergie({ b: S, h: S, daten: x.getImageData(0, 0, S, S).data }, opts); }
  return schaerfeVorschlag(en, { gesichter: (doc.gesichter || []).length });
}

/** Welche Modelle eine Masken-Hilfe braucht (für die Lade-Frage). zweck 'haar' | 'motiv'. */
export async function modellBedarf(app, zweck) {
  let st = null; try { st = await app.ki.rufe('status', {}); } catch { st = null; }
  const da = (id) => !!st?.ids?.[id]?.imCache;
  if (zweck === 'haar') return da('haar') ? { bereit: true, modell: 'haar', fehlen: [] } : da('klassen') ? { bereit: true, modell: 'klassen', fehlen: [] } : { bereit: false, modell: 'haar', fehlen: ['haar'] };
  return da('klassen') ? { bereit: true, modell: 'klassen', fehlen: [] } : { bereit: false, modell: 'klassen', fehlen: ['klassen'] };
}
async function maskeAusModell(app, zweck, opts = {}) {
  const bed = await modellBedarf(app, zweck);
  if (!bed.bereit && !opts.laden) throw new BildwerkFehler(FEHLER.KEIN_MODELL, zweck === 'haar' ? 'Für die Haarmaske wird das Modell „Haare fein“ (0,8 MB) gebraucht.' : 'Für die Motivmaske wird das Modell „Haut, Haare, Kleidung“ (16 MB) gebraucht.');
  const q = app.pipeline.quelleGroesse(), b = q.arbeitB, h = q.arbeitH, A = await import('./auswahl.js');
  const kopie = await gesichtsKopie(app.quelleBitmap(), 1280);
  let m;
  if (bed.modell === 'haar') m = await app.ki.rufe('haar', { bild: kopie, b, h }, { transfer: [kopie], signal: opts.signal });
  else { const k = await app.ki.rufe('klassen', { bild: kopie, b, h }, { transfer: [kopie], signal: opts.signal }); m = A.maskeAusKlassen(k, zweck === 'haar' ? [KLASSE.HAAR] : [KLASSE.HAAR, KLASSE.KOERPERHAUT, KLASSE.GESICHTSHAUT, KLASSE.KLEIDUNG, KLASSE.SONSTIGES], b, h); }
  const f = await fuehrungsbild(app);
  try { m = A.skaliereMaske(await app.rechnen.rufe('maske-verfeinern', { maske: A.skaliereMaske(m, f.b, f.h), fuehrung: f, opts: { haar: true } }), b, h); } catch { /* unverfeinert */ }
  const rasterId = await app.raster.lege(m, 'maske'); app.pipeline.setzeRaster(rasterId, m);
  return { id: neueId('maske'), teile: [{ quelle: zweck === 'haar' ? 'haar' : 'person', modus: 'plus', params: { modell: bed.modell }, rasterId }], weich: 0, verfeinern: false, umkehren: false, rasterId };
}
/** Haarmaske (MaskenRef) aus „Haare fein“ (sonst „Haut, Haare, Kleidung“), mit feiner Kante. opts.laden: Modell darf laden. */
export const haarMaske = (app, opts) => maskeAusModell(app, 'haar', opts);
/** Motiv-/Personenmaske (MaskenRef) aus „Haut, Haare, Kleidung“. */
export const motivMaske = (app, opts) => maskeAusModell(app, 'motiv', opts);

/** Alle Labor-Shader einmal übersetzen und die Karten des Bildes vorrechnen (in Ruhe, Mini 48 px). */
export async function vorwaermen(app) {
  const doc = app.zustand().doc; if (!doc || !app.pipeline.hatQuelle?.()) return;
  const id = '_labor-vw'; app.pipeline.setzeRaster(id, { b: 1, h: 1, daten: new Uint8Array([200]) });
  const ref = { id, rasterId: id, teile: [], weich: 0, verfeinern: false, umkehren: false };
  const schritte = [mehrbandSchritt({ fein: 10, haare: 10, textur: 10, kanten: 10, plastizitaet: 10 }), plastikSchritt({ staerke: 40 }),
    bereichSchritt({ ziel: [0.5, 0, 0], punkt: { x: 0.5, y: 0.5 }, modus: 'ueberall', belichtung: 0.2, waerme: 10 }), haarfarbeSchritt(ref), fokusSchritt(ref, { unschaerfe: 40 })];
  try { const bm = await app.pipeline.rendereMini({ doc: { ...doc, schritte }, vergleich: 'nachher' }, 48); bm?.close?.(); } catch (e) { console.warn('Labor vorwärmen', e); }
  app.pipeline.entferneRaster(id);
}
