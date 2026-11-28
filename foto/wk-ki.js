// Bildwerk – KI-Worker (Agent D; Rechenteile hoch/merkmal von Agent E über hoch.js `wkKi`). Nachrichten FEST (ARCH.md §5).
// Laufzeiten (MediaPipe, onnxruntime-web) werden erst bei Bedarf über modelle.laufzeitPfade() importiert.
import { bediene } from './rpc.js';
import { nichtGebaut, VERSION, BildwerkFehler, FEHLER, neueId, KLASSE } from './typen.js';
import * as modelle from './modelle.js';

// ---------------------------------------------------------------- Hilfen
function pixel(bild, b = bild.width, h = bild.height) {
  const c = new OffscreenCanvas(b, h), x = c.getContext('2d', { willReadFrequently: true });
  x.drawImage(bild, 0, 0, b, h); return x.getImageData(0, 0, b, h);
}
function verkleinert(bild, kante) {
  const s = Math.min(1, kante / Math.max(bild.width, bild.height));
  const b = Math.max(1, Math.round(bild.width * s)), h = Math.max(1, Math.round(bild.height * s));
  const c = new OffscreenCanvas(b, h); c.getContext('2d').drawImage(bild, 0, 0, b, h); return c;
}
const zuU8 = (f, faktor = 255) => { const d = new Uint8Array(f.length); for (let i = 0; i < f.length; i++) { const v = f[i] * faktor; d[i] = v <= 0 ? 0 : v >= 255 ? 255 : v + 0.5; } return d; };
function skaliere(src, sb, sh, b, h) {   // bilinear, Float32
  const out = new Float32Array(b * h), fx = sb / b, fy = sh / h;
  for (let y = 0; y < h; y++) { const sy = Math.min(sh - 1, Math.max(0, (y + 0.5) * fy - 0.5)), y0 = Math.floor(sy), y1 = Math.min(sh - 1, y0 + 1), wy = sy - y0;
    for (let x = 0; x < b; x++) { const sx = Math.min(sb - 1, Math.max(0, (x + 0.5) * fx - 0.5)), x0 = Math.floor(sx), x1 = Math.min(sb - 1, x0 + 1), wx = sx - x0;
      out[y * b + x] = (src[y0 * sb + x0] * (1 - wx) + src[y0 * sb + x1] * wx) * (1 - wy) + (src[y1 * sb + x0] * (1 - wx) + src[y1 * sb + x1] * wx) * wy; } }
  return out;
}
const schliesse = (bild) => { try { bild?.close?.(); } catch {} };
async function mitBild(bild, f) { try { return await f(); } finally { schliesse(bild); } }

/** Gesicht aus 478 Landmarken (normiert). */
function gesichtAus(lm, b, h) {
  const L = new Float32Array(lm.length * 3); let x0 = 1, y0 = 1, x1 = 0, y1 = 0;
  lm.forEach((p, i) => { L[i * 3] = p.x; L[i * 3 + 1] = p.y; L[i * 3 + 2] = p.z || 0; if (p.x < x0) x0 = p.x; if (p.x > x1) x1 = p.x; if (p.y < y0) y0 = p.y; if (p.y > y1) y1 = p.y; });
  const P = (k) => (lm[k] ? [lm[k].x, lm[k].y] : [0, 0]);
  const mitte = (a, c) => { const p = P(a), q = P(c); return [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]; };
  // 5 Punkte wie SFace/ArcFace: rechtes Auge (Bild links), linkes Auge, Nasenspitze, Mundwinkel r/l
  const augeR = lm.length > 468 ? P(468) : mitte(33, 133), augeL = lm.length > 473 ? P(473) : mitte(362, 263);
  const p5 = new Float32Array([...augeR, ...augeL, ...P(1), ...P(61), ...P(291)]);
  return { id: neueId('gesicht'), box: { x: x0, y: y0, b: x1 - x0, h: y1 - y0 }, landmarken: L, punkte5: p5, sicherheit: 0.9,
    augenAbstandPx: Math.hypot((augeR[0] - augeL[0]) * b, (augeR[1] - augeL[1]) * h) };
}

// Bild-Cache für den interaktiven Segmentierer (setImage ist der teure Teil)
let tippBild = null;

const H = {
  async hallo() { return { version: VERSION, worker: 'ki' }; },
  async quellen(o) { modelle.setzeQuellen(o); return modelle.laufzeitPfade(); },
  async status() {
    const ids = {};
    for (const [id, m] of Object.entries(modelle.MODELLE)) ids[id] = { imCache: await modelle.istImCache(id).catch(() => false), bytes: m.bytes, titel: m.titel, lizenz: m.lizenz, quelle: m.quellen.length > 0 };
    return { ids, webgpu: typeof navigator !== 'undefined' && 'gpu' in navigator, threads: (typeof crossOriginIsolated !== 'undefined' && crossOriginIsolated) ? (navigator.hardwareConcurrency || 1) : 1 };
  },
  async lade({ ids }, h) {
    for (const [i, id] of ids.entries()) await modelle.lade(id, { signal: h.signal, onFortschritt: (f, t) => h.fortschritt((i + f) / ids.length, t) });
    return { ok: true };
  },

  async gesichter({ bild }) {
    return mitBild(bild, async () => {
      const t = await modelle.mediapipeAufgabe('gesicht-landmarken');
      const c = verkleinert(bild, 1280);
      const r = t.detect(c);
      return (r.faceLandmarks || []).map((lm) => gesichtAus(lm, bild.width, bild.height)).sort((a, b) => b.box.b * b.box.h - a.box.b * a.box.h);
    });
  },

  /** Mehrklassen: Hintergrund, Haar, Körperhaut, Gesichtshaut, Kleidung, Sonstiges. Ergebnis in (b,h) + weiche Rohkarten. */
  async klassen({ bild, b, h }) {
    return mitBild(bild, async () => {
      const t = await modelle.mediapipeAufgabe('klassen');
      const c = verkleinert(bild, 512);
      const r = t.segment(c);
      const masken = r.confidenceMasks || []; if (masken.length < 6) throw new BildwerkFehler(FEHLER.KEIN_MODELL, 'Segmentierung lieferte keine Klassen');
      const rb = masken[0].width, rh = masken[0].height, kanaele = masken.map((m) => zuU8(m.getAsFloat32Array()));
      for (const m of masken) m.close?.(); r.categoryMask?.close?.();
      const B = b || bild.width, Hh = h || bild.height, n = B * Hh;
      const klassen = new Uint8Array(n), vertrauen = new Uint8Array(n);
      const hoch = kanaele.map((k) => skaliere(Float32Array.from(k), rb, rh, B, Hh));
      for (let i = 0; i < n; i++) { let best = 0, bw = -1; for (let k = 0; k < 6; k++) if (hoch[k][i] > bw) { bw = hoch[k][i]; best = k; } klassen[i] = best; vertrauen[i] = bw; }
      return { b: B, h: Hh, klassen, vertrauen, roh: { b: rb, h: rh, kanaele } };
    });
  },

  /** 0.6 Labor: Haare fein (Hair Segmenter, 0,8 MB; Klassen 0 = Hintergrund, 1 = Haar) → MaskeU8 in (b,h). */
  async haar({ bild, b, h }) {
    return mitBild(bild, async () => {
      const t = await modelle.mediapipeAufgabe('haar');
      const c = verkleinert(bild, 512);
      const r = t.segment(c);
      const masken = r.confidenceMasks || []; if (!masken.length) throw new BildwerkFehler(FEHLER.KEIN_MODELL, 'Haar-Modell lieferte keine Maske');
      const m = masken[Math.min(1, masken.length - 1)], rb = m.width, rh = m.height, f = Float32Array.from(m.getAsFloat32Array());
      for (const x of masken) x.close?.(); r.categoryMask?.close?.();
      const B = b || bild.width, Hh = h || bild.height;
      return { b: B, h: Hh, daten: zuU8(skaliere(f, rb, rh, B, Hh)) };
    });
  },

  /** Interaktiv: Striche { modus: 'plus'|'minus'|'lasso', punkte:[{x,y}] } → Deckung. */
  async antippen({ bild, striche, bildId }) {
    return mitBild(bild, async () => {
      const c = verkleinert(bild, 1024);
      try {
        const t = await modelle.mediapipeAufgabe('antippen');
        const schl = bildId || `${bild.width}x${bild.height}`;
        if (!tippBild || tippBild.schl !== schl || !bildId) { t.setImage(c); tippBild = { schl }; }
        const MODUS = { plus: 1, minus: 2, lasso: 3 };
        const m = t.segment(striche.map((s) => ({ brushMode: MODUS[s.modus] || 1, point: s.punkte.map((p) => ({ x: p.x, y: p.y })), isCompleted: true })));
        const d = m.hasFloat32Array?.() || !m.hasUint8Array?.() ? zuU8(m.getAsFloat32Array()) : Uint8Array.from(m.getAsUint8Array());
        const aus = { b: m.width, h: m.height, daten: d }; m.close?.(); return aus;
      } catch (e) {
        // Rückfall: alte Punkt-Variante (6 MB), nur der erste Plus-Punkt
        const p = striche.find((s) => s.modus === 'plus')?.punkte[0]; if (!p) throw e;
        const t = await modelle.mediapipeAufgabe('antippen-klein');
        const r = t.segment(c, { keypoint: { x: p.x, y: p.y } }); const m = r.confidenceMasks?.[0]; if (!m) throw e;
        const aus = { b: m.width, h: m.height, daten: zuU8(m.getAsFloat32Array()) }; r.close?.(); return aus;
      }
    });
  },

  /** Porträt-Matting (Haarspitzen): MODNet, Eingabe 512 (Vielfaches von 32), [-1,1]. */
  async matting({ bild }) {
    return mitBild(bild, async () => {
      const s = await modelle.onnxSitzung('matting'), ort = await modelle.ladeOrt();
      const sk = Math.min(1, 512 / Math.max(bild.width, bild.height));
      const b = Math.max(32, Math.round((bild.width * sk) / 32) * 32), h = Math.max(32, Math.round((bild.height * sk) / 32) * 32);
      const px = pixel(bild, b, h).data, n = b * h, ein = new Float32Array(3 * n);
      for (let i = 0; i < n; i++) for (let k = 0; k < 3; k++) ein[k * n + i] = px[i * 4 + k] / 127.5 - 1;
      const r = await s.run({ [s.inputNames[0]]: new ort.Tensor('float32', ein, [1, 3, h, b]) });
      const o = r[s.outputNames[0]]; return { b, h, daten: zuU8(o.data) };
    });
  },

  /** Tiefe (Depth Anything V2 Small): 0 nah … 1 fern. */
  async tiefe({ bild }) {
    return mitBild(bild, async () => {
      const s = await modelle.onnxSitzung('tiefe'), ort = await modelle.ladeOrt();
      const N = 518, px = pixel(bild, N, N).data, n = N * N, ein = new Float32Array(3 * n), M = [0.485, 0.456, 0.406], S = [0.229, 0.224, 0.225];
      for (let i = 0; i < n; i++) for (let k = 0; k < 3; k++) ein[k * n + i] = (px[i * 4 + k] / 255 - M[k]) / S[k];
      const r = await s.run({ [s.inputNames[0]]: new ort.Tensor('float32', ein, [1, 3, N, N]) });
      const o = r[s.outputNames[0]], d = o.data; let lo = Infinity, hi = -Infinity; for (const v of d) { if (v < lo) lo = v; if (v > hi) hi = v; }
      const f = new Float32Array(d.length); for (let i = 0; i < d.length; i++) f[i] = 1 - (d[i] - lo) / (hi - lo || 1);   // Modell: groß = nah
      const sk = Math.min(1, 1024 / Math.max(bild.width, bild.height)), b = Math.round(bild.width * sk), h = Math.round(bild.height * sk);
      return { b, h, daten: skaliere(f, N, N, b, h), art: 'tiefe' };
    });
  },

  /** Füllen: MI-GAN (512², uint8, Maske 255 = bekannt) oder LaMa (hoch). bild BildU8 RGBA, maske 255 = füllen. */
  async fuellen({ bild, maske, qualitaet }) {
    const { b, h } = bild, n = b * h;
    if (qualitaet === 'hoch' && (await modelle.istImCache('fuellen-hoch'))) {
      const s = await modelle.onnxSitzung('fuellen-hoch'), ort = await modelle.ladeOrt();
      const im = new Float32Array(3 * n), mk = new Float32Array(n);
      for (let i = 0; i < n; i++) { for (let k = 0; k < 3; k++) im[k * n + i] = bild.daten[i * 4 + k] / 255; mk[i] = maske.daten[i] >= 128 ? 1 : 0; }
      const r = await s.run({ [s.inputNames[0]]: new ort.Tensor('float32', im, [1, 3, h, b]), [s.inputNames[1]]: new ort.Tensor('float32', mk, [1, 1, h, b]) });
      const o = r[s.outputNames[0]].data, skal = o.length && Math.max(...o.slice(0, 3000)) <= 1.5 ? 255 : 1, aus = new Uint8ClampedArray(n * 4);
      for (let i = 0; i < n; i++) { for (let k = 0; k < 3; k++) aus[i * 4 + k] = o[k * n + i] * skal; aus[i * 4 + 3] = 255; }
      return { bild: { b, h, daten: aus }, verfahren: 'lama' };
    }
    const s = await modelle.onnxSitzung('fuellen'), ort = await modelle.ladeOrt();
    const im = new Uint8Array(3 * n), mk = new Uint8Array(n);
    for (let i = 0; i < n; i++) { for (let k = 0; k < 3; k++) im[k * n + i] = bild.daten[i * 4 + k]; mk[i] = maske.daten[i] >= 128 ? 0 : 255; }
    const r = await s.run({ image: new ort.Tensor('uint8', im, [1, 3, h, b]), mask: new ort.Tensor('uint8', mk, [1, 1, h, b]) });
    const o = r[s.outputNames[0]], d = o.data, [, , oh, ob] = o.dims, aus = new Uint8ClampedArray(n * 4);
    if (oh !== h || ob !== b) throw new BildwerkFehler(FEHLER.UNBEKANNT, 'Füll-Modell: unerwartete Größe');
    for (let i = 0; i < n; i++) { for (let k = 0; k < 3; k++) aus[i * 4 + k] = d[k * n + i]; aus[i * 4 + 3] = 255; }
    return { bild: { b, h, daten: aus }, verfahren: 'mi-gan' };
  },

  // Rechenteile von Agent E (hoch.js exportiert `wkKi = { hoch(daten, h, umgebung), merkmal(daten, h, umgebung) }`)
  async hoch(d, h) { const E = await import('./hoch.js').catch(() => ({})); if (E.wkKi?.hoch) return E.wkKi.hoch(d, h, { modelle }); return nichtGebaut('wk-ki.hoch'); },
  async merkmal(d, h) { const E = await import('./hoch.js').catch(() => ({})); if (E.wkKi?.merkmal) return E.wkKi.merkmal(d, h, { modelle }); return nichtGebaut('wk-ki.merkmal'); },
  async frei({ ids } = {}) { await modelle.freigeben(ids); if (!ids || ids.includes('antippen')) tippBild = null; return { ok: true }; },
};
export const _handler = H;   // für Tests
if (typeof self !== 'undefined' && typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) bediene(self, H);
void KLASSE;
