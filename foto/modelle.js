// Bildwerk – Modell-Katalog, Lader, Cache (Agent D). Signaturen FEST (ARCH.md §4.7).
// Katalog ist geprüft (15.11.2026: Lizenz, Bytes, Revision). URLs sind auf Revisionen gepinnt.
import { MODELL_CACHE, BildwerkFehler, FEHLER } from './typen.js';

const MP = 'https://storage.googleapis.com/mediapipe-models/';
const HF = (repo, rev, datei) => `https://huggingface.co/${repo}/resolve/${rev}/${datei}`;

/** @type {Record<string, {id:string,titel:string,laufzeit:'mediapipe'|'onnx',datei:string,quellen:string[],bytes:number,lizenz:string,eingabe?:object,hinweis?:string}>} */
export const MODELLE = Object.freeze({
  'gesicht-landmarken': { id: 'gesicht-landmarken', titel: 'Gesichtspunkte', laufzeit: 'mediapipe', datei: 'face_landmarker.task',
    quellen: [MP + 'face_landmarker/face_landmarker/float16/1/face_landmarker.task'], bytes: 3758596, lizenz: 'Apache-2.0' },
  'gesicht-schnell': { id: 'gesicht-schnell', titel: 'Gesichter finden', laufzeit: 'mediapipe', datei: 'blaze_face_short_range.tflite',
    quellen: [MP + 'face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite'], bytes: 229746, lizenz: 'Apache-2.0' },
  klassen: { id: 'klassen', titel: 'Haut, Haare, Kleidung', laufzeit: 'mediapipe', datei: 'selfie_multiclass_256x256.tflite',
    quellen: [MP + 'image_segmenter/selfie_multiclass_256x256/float32/1/selfie_multiclass_256x256.tflite'], bytes: 16371837, lizenz: 'Apache-2.0',
    hinweis: 'GPU-Delegat auf iOS vertauscht Klassen (Fehlerbericht) -> CPU-Delegat verwenden' },
  haar: { id: 'haar', titel: 'Haare fein', laufzeit: 'mediapipe', datei: 'hair_segmenter.tflite',
    quellen: [MP + 'image_segmenter/hair_segmenter/float32/1/hair_segmenter.tflite'], bytes: 781618, lizenz: 'Apache-2.0' },
  antippen: { id: 'antippen', titel: 'Auswahl per Antippen', laufzeit: 'mediapipe', datei: 'interactive_segmentation.task',
    quellen: [MP + 'interactive_segmenter_v2/magic_touch/int8/1/interactive_segmentation.task'], bytes: 30525312, lizenz: 'Apache-2.0',
    hinweis: 'API 1.x: setImage() + segment(strokes) mit BrushMode POSITIVE/NEGATIVE/LASSO' },
  'antippen-klein': { id: 'antippen-klein', titel: 'Auswahl per Antippen (klein)', laufzeit: 'mediapipe', datei: 'magic_touch.tflite',
    quellen: [MP + 'interactive_segmenter/magic_touch/float32/1/magic_touch.tflite'], bytes: 6227884, lizenz: 'Apache-2.0',
    hinweis: 'InteractiveSegmenterLegacy, Punkt-ROI' },
  matting: { id: 'matting', titel: 'Feine Kanten (Haarspitzen)', laufzeit: 'onnx', datei: 'modnet_quantized.onnx',
    quellen: [HF('Xenova/modnet', 'fa2fa546052fba4c08921230a26cc69a333fca12', 'onnx/model_quantized.onnx')], bytes: 6632188, lizenz: 'Apache-2.0' },
  tiefe: { id: 'tiefe', titel: 'Tiefe im Bild', laufzeit: 'onnx', datei: 'depth_small_q4f16.onnx',
    quellen: [HF('onnx-community/depth-anything-v2-small', '4472b7362082ad9968fee890ca0f1e5aca36b93d', 'onnx/model_q4f16.onnx')], bytes: 19126267,
    lizenz: 'Apache-2.0 (nur Small)', hinweis: 'WASM ohne fp16: model_int8.onnx (27258801 B) als Alternative' },
  fuellen: { id: 'fuellen', titel: 'Füllen', laufzeit: 'onnx', datei: 'migan_pipeline_v2.onnx',
    quellen: [HF('andraniksargsyan/migan', '406830d0fa60666da0071c342ad2fbc8f30c5c64', 'migan_pipeline_v2.onnx')], bytes: 28079181, lizenz: 'MIT',
    eingabe: { kante: 512 } },
  'fuellen-hoch': { id: 'fuellen-hoch', titel: 'Füllen (hohe Qualität, groß)', laufzeit: 'onnx', datei: 'lama_fp32.onnx',
    quellen: [HF('Carve/LaMa-ONNX', 'c3c0c9e468934d62e79c329e35d82dd09ff8c444', 'lama_fp32.onnx')], bytes: 208044816, lizenz: 'Apache-2.0',
    eingabe: { kante: 512 }, hinweis: 'auf dem iPhone nur nach Speicher-Test anbieten' },
  hoch: { id: 'hoch', titel: 'Hochskalieren', laufzeit: 'onnx', datei: 'realesr_general_x4v3.onnx',
    quellen: [HF('vlad-grig/realesr-general-x4v3-onnx', '0e95d93e454cf6b5de9bdf5a1c9e7ec340d38231', 'onnx/model.onnx')], bytes: 4866420, lizenz: 'BSD-3-Clause',
    eingabe: { faktor: 4, kachel: 256 } },
  merkmal: { id: 'merkmal', titel: 'Gesichts-Merkmale (Identität)', laufzeit: 'onnx', datei: 'face_recognition_sface_2021dec_int8.onnx',
    quellen: [HF('opencv/face_recognition_sface', '3d7082438a6e4551e840c9b2bb60b71e8da4b524', 'face_recognition_sface_2021dec_int8.onnx')], bytes: 9896933,
    lizenz: 'Apache-2.0', eingabe: { kante: 112, ausgerichtet: true } },
  'gesicht-ausrichten': { id: 'gesicht-ausrichten', titel: 'Gesicht ausrichten', laufzeit: 'onnx', datei: 'face_detection_yunet_2023mar.onnx',
    quellen: [HF('opencv/face_detection_yunet', '3cc26e7f1014a5ee5d74a42acee58bafc9d0a310', 'face_detection_yunet_2023mar.onnx')], bytes: 232589, lizenz: 'MIT' },
});

export const LAUFZEIT = Object.freeze({ mediapipe: '@mediapipe/tasks-vision@1.2.3', ort: 'onnxruntime-web@1.31.1' });
/** Laufzeit-Dateien (WASM), die beim ersten KI-Einsatz zusätzlich kommen – werden beim Laden mit in den Cache gelegt (offline). */
export const LAUFZEIT_DATEIEN = Object.freeze({
  mediapipe: { paket: 'mediapipe', dateien: ['vision_bundle.mjs', 'wasm/vision_wasm_module_internal.js', 'wasm/vision_wasm_module_internal.wasm'], bytes: 15200000 },
  onnx: { paket: 'ort', dateien: ['dist/ort.wasm.min.mjs', 'dist/ort-wasm-simd-threaded.mjs', 'dist/ort-wasm-simd-threaded.wasm'], bytes: 15000000 },
});
export const LAUFZEIT_CACHE = 'bildwerk-laufzeit-v1';
const laufzeitUrls = (art) => { const l = LAUFZEIT_DATEIEN[art]; return l.dateien.map((d) => `${basisLaufzeit}${LAUFZEIT[l.paket]}/${d}`); };
/** @returns {Promise<boolean>} liegt die Laufzeit für 'mediapipe'|'onnx' vollständig im Cache? */
export async function laufzeitImCache(art) {
  if (typeof caches === 'undefined') return false;
  try { const c = await caches.open(LAUFZEIT_CACHE); for (const u of laufzeitUrls(art)) if (!(await c.match(u))) return false; return true; } catch { return false; }
}
/** Laufzeit-Dateien holen und in den Cache legen (mit Fortschritt). Der Service Worker liefert sie danach auch offline aus. */
export async function sichereLaufzeit(art, opts = {}) {
  if (typeof caches === 'undefined') return;
  const c = await caches.open(LAUFZEIT_CACHE), urls = laufzeitUrls(art), ges = LAUFZEIT_DATEIEN[art].bytes; let fertig = 0;
  for (const u of urls) {
    if (await c.match(u)) continue;
    const r = await fetch(u, { signal: opts.signal, mode: 'cors' });
    if (!r.ok) throw new BildwerkFehler(FEHLER.NETZ || FEHLER.KEIN_MODELL, `Laufzeit nicht erreichbar (${r.status})`);
    const teile = [], leser = r.body?.getReader();
    if (leser) for (;;) { const { done, value } = await leser.read(); if (done) break; teile.push(value); fertig += value.byteLength; opts.onFortschritt?.(Math.min(1, fertig / ges), 'Laufzeit'); }
    const typ = r.headers.get('content-type') || (u.endsWith('.wasm') ? 'application/wasm' : 'text/javascript');
    await c.put(u, new Response(leser ? new Blob(teile, { type: typ }) : await r.blob(), { headers: { 'Content-Type': typ } }));
  }
}

let basisLaufzeit = 'https://cdn.jsdelivr.net/npm/';
let basisModelle = null;   // null = Original-Quellen; sonst Spiegel-Basis (Test: '/modelle/')

/** @param {{modelle?:string, laufzeit?:string}} o */
export function setzeQuellen(o = {}) {
  if (o.laufzeit) basisLaufzeit = o.laufzeit.endsWith('/') ? o.laufzeit : o.laufzeit + '/';
  if ('modelle' in o) basisModelle = o.modelle;
}

export function laufzeitPfade() {
  return {
    mediapipeJs: `${basisLaufzeit}${LAUFZEIT.mediapipe}/vision_bundle.mjs`,
    mediapipeWasm: `${basisLaufzeit}${LAUFZEIT.mediapipe}/wasm`,
    ortJs: `${basisLaufzeit}${LAUFZEIT.ort}/dist/ort.wasm.min.mjs`,
    ortWasm: `${basisLaufzeit}${LAUFZEIT.ort}/dist/`,
  };
}

/** URL-Liste eines Modells (Spiegel zuerst, falls gesetzt). */
export function urls(id) {
  const m = MODELLE[id];
  if (!m) return [];
  return basisModelle ? [basisModelle + m.datei, ...m.quellen] : [...m.quellen];
}

export const CACHE_NAME = MODELL_CACHE;


// ================================================================ Laden + Cache Storage
const hatCache = () => typeof caches !== 'undefined';
const offeneCache = () => (hatCache() ? caches.open(CACHE_NAME) : Promise.resolve(null));
/** Cache-Schlüssel = Original-URL (mit gepinnter Revision); ein Spiegel liefert dieselben Bytes unter demselben Schlüssel. */
const schluessel = (id) => MODELLE[id]?.quellen[0] || `bildwerk-modell:${id}`;
const laufend = new Map();   // id -> Promise (gleichzeitige Anfragen teilen sich einen Download)

/**
 * Modell laden: Cache Storage zuerst, sonst Streaming-fetch mit Fortschritt (content-length) und danach in den Cache.
 * @returns {Promise<ArrayBuffer>}
 */
export async function lade(id, opts = {}) {
  const m = MODELLE[id];
  if (!m) throw new BildwerkFehler(FEHLER.KEIN_MODELL, `Unbekanntes Modell: ${id}`);
  const c = await offeneCache().catch(() => null);
  if (c) { const r = await c.match(schluessel(id)); if (r) { opts.onFortschritt?.(1, `${m.titel}: aus dem Speicher`); return r.arrayBuffer(); } }
  const liste = urls(id);
  if (!liste.length) throw new BildwerkFehler(FEHLER.KEIN_MODELL, `${m.titel}: keine Quelle hinterlegt`);
  if (laufend.has(id)) return (await laufend.get(id)).slice(0);
  const p = (async () => {
    let letzter = null;
    for (const url of liste) {
      try {
        const buf = await holeMitFortschritt(url, m, opts);
        if (c) { try { await c.put(schluessel(id), new Response(buf.slice(0), { headers: { 'content-type': 'application/octet-stream', 'content-length': String(buf.byteLength) } })); } catch (e) { /* Speicher voll: trotzdem nutzen */ } }
        return buf;
      } catch (e) { if (e?.code === FEHLER.ABBRUCH) throw e; letzter = e; }
    }
    throw new BildwerkFehler(FEHLER.NETZ, `${m.titel} konnte nicht geladen werden (${letzter?.message || letzter || 'Netz'})`);
  })();
  laufend.set(id, p);
  try { return (await p).slice(0); } finally { laufend.delete(id); }
}
async function holeMitFortschritt(url, m, opts) {
  const r = await fetch(url, { signal: opts.signal, mode: 'cors', credentials: 'omit' }).catch((e) => { if (opts.signal?.aborted) throw new BildwerkFehler(FEHLER.ABBRUCH, 'abgebrochen'); throw e; });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const gesamt = Number(r.headers.get('content-length')) || m.bytes || 0;
  if (!r.body?.getReader) { const b = await r.arrayBuffer(); opts.onFortschritt?.(1, m.titel); return b; }
  const leser = r.body.getReader(); const teile = []; let n = 0, letzt = 0;
  for (;;) {
    const { done, value } = await leser.read(); if (done) break;
    teile.push(value); n += value.byteLength;
    const f = gesamt ? Math.min(0.999, n / gesamt) : 0;
    if (f - letzt > 0.01) { letzt = f; opts.onFortschritt?.(f, `${m.titel}: ${mb(n)} von ${mb(gesamt)}`); }
  }
  const buf = new Uint8Array(n); let o = 0; for (const t of teile) { buf.set(t, o); o += t.byteLength; }
  opts.onFortschritt?.(1, m.titel); return buf.buffer;
}
export const mb = (b) => `${(b / 1048576).toLocaleString('de-DE', { maximumFractionDigits: b < 1048576 * 10 ? 1 : 0 })} MB`;

export async function istImCache(id) { const c = await offeneCache().catch(() => null); return !!(c && (await c.match(schluessel(id)))); }
export async function cacheGroesse() {
  const c = await offeneCache().catch(() => null), je = {}; let gesamt = 0;
  if (!c) return { gesamt, je };
  for (const id of Object.keys(MODELLE)) { const r = await c.match(schluessel(id)); if (!r) continue; const n = Number(r.headers.get('content-length')) || (await r.clone().arrayBuffer()).byteLength; je[id] = n; gesamt += n; }
  return { gesamt, je };
}
export async function loesche(id) {
  if (!hatCache()) return;
  if (!id) { await caches.delete(CACHE_NAME); sitzungen.clear(); aufgaben.clear(); return; }
  const c = await caches.open(CACHE_NAME); await c.delete(schluessel(id)); sitzungen.delete(id); aufgaben.delete(id);
}

// ================================================================ Laufzeiten + Sitzungen (lazy, nur bei Bedarf)
let ortPromise = null, mpPromise = null, filesetPromise = null;
const sitzungen = new Map(), aufgaben = new Map();
let erzeugeKette = Promise.resolve();
export function ladeOrt(opts = {}) {
  if (!ortPromise) ortPromise = (async () => {
    const p = laufzeitPfade(); const ort = await import(/* @vite-ignore */ opts.webgpu ? p.ortJs.replace('ort.wasm.min.mjs', 'ort.webgpu.min.mjs') : p.ortJs);
    const o = ort.default?.env ? ort.default : ort;
    o.env.wasm.wasmPaths = p.ortWasm;
    o.env.wasm.numThreads = (typeof crossOriginIsolated !== 'undefined' && crossOriginIsolated) ? Math.min(4, navigator.hardwareConcurrency || 2) : 1;
    o.env.wasm.proxy = false;
    return o;
  })().catch((e) => { ortPromise = null; throw new BildwerkFehler(FEHLER.KEIN_MODELL, `Rechen-Laufzeit nicht verfügbar (${e.message || e})`); });
  return ortPromise;
}
// MediaPipe Tasks schickt sonst alle 60 s ein Nutzungsprotokoll an Google (odml.pa.googleapis.com/v1/log, XMLHttpRequest POST).
// Bildwerk sendet nichts außer Modell-Downloads → Anfragen an diesen Host still verwerfen (vor dem ersten Import der Laufzeit).
const GESPERRT = /^https?:\/\/[^/]*\.pa\.googleapis\.com\//i;
function sperreProtokoll() {
  const g = globalThis; if (g.__bwSperre) return; g.__bwSperre = true;
  const X = g.XMLHttpRequest?.prototype;
  if (X) {
    const open = X.open, send = X.send;
    X.open = function (m, u, ...r) { this.__bwAus = GESPERRT.test(String(u)); return open.call(this, m, this.__bwAus ? 'data:,' : u, ...r); };
    X.send = function (b) { if (this.__bwAus) { try { Object.defineProperty(this, 'status', { value: 204 }); } catch {} return; } return send.call(this, b); };
  }
  if (typeof g.fetch === 'function') { const f = g.fetch; g.fetch = function (e, o) { const u = typeof e === 'string' ? e : e?.url || String(e); return GESPERRT.test(u) ? Promise.resolve(new Response(null, { status: 204 })) : f.call(this, e, o); }; }
  if (g.navigator?.sendBeacon) { const sb = g.navigator.sendBeacon.bind(g.navigator); g.navigator.sendBeacon = (u, d) => (GESPERRT.test(String(u)) ? true : sb(u, d)); }
}
export function ladeMediapipe() {
  sperreProtokoll();
  if (!mpPromise) mpPromise = import(/* @vite-ignore */ laufzeitPfade().mediapipeJs).catch((e) => { mpPromise = null; throw new BildwerkFehler(FEHLER.KEIN_MODELL, `Bild-Laufzeit nicht verfügbar (${e.message || e})`); });
  return mpPromise;
}
async function fileset() {
  if (!filesetPromise) filesetPromise = (async () => {
    const mp = await ladeMediapipe();
    // Im Modul-Worker gibt es kein importScripts → Modul-Variante des WASM-Laders verwenden
    const modulWorker = typeof document === 'undefined';
    return mp.FilesetResolver.forVisionTasks(laufzeitPfade().mediapipeWasm, modulWorker);
  })().catch((e) => { filesetPromise = null; throw e; });
  return filesetPromise;
}

/** @returns {Promise<object>} ort.InferenceSession (gecacht je id) */
export async function onnxSitzung(id, opts = {}) {
  if (sitzungen.has(id)) return sitzungen.get(id);
  const m = MODELLE[id]; if (!m || m.laufzeit !== 'onnx') throw new BildwerkFehler(FEHLER.KEIN_MODELL, `Kein ONNX-Modell: ${id}`);
  const p = (async () => {
    const [ort, buf] = await Promise.all([ladeOrt(opts), lade(id, opts)]);
    const ep = opts.webgpu ? ['webgpu', 'wasm'] : ['wasm'];
    try { return await ort.InferenceSession.create(new Uint8Array(buf), { executionProviders: ep, graphOptimizationLevel: 'all', logSeverityLevel: 3 }); }
    catch (e) { throw new BildwerkFehler(/memory|Speicher|alloc/i.test(String(e)) ? FEHLER.SPEICHER : FEHLER.KEIN_MODELL, `${m.titel}: ${e.message || e}`); }
  })();
  sitzungen.set(id, p);
  try { return await p; } catch (e) { sitzungen.delete(id); throw e; }
}

/** MediaPipe-Aufgabe (FaceLandmarker | FaceDetector | ImageSegmenter | InteractiveSegmenter), CPU-Delegat (iOS: GPU vertauscht Klassen). */
export async function mediapipeAufgabe(id, opts = {}) {
  if (aufgaben.has(id)) return aufgaben.get(id);
  const m = MODELLE[id]; if (!m || m.laufzeit !== 'mediapipe') throw new BildwerkFehler(FEHLER.KEIN_MODELL, `Kein MediaPipe-Modell: ${id}`);
  const p = (async () => {
    const [mp, fs, buf] = await Promise.all([ladeMediapipe(), fileset(), lade(id, opts)]);
    // MediaPipe räumt globalThis.ModuleFactory nach jeder Aufgabe weg; im Modul-Worker selbst wieder setzen (sonst
    // „ModuleFactory not set“ bei der zweiten Aufgabe). Erzeugen nacheinander, damit sich die Aufgaben nicht stören.
    const vorher = erzeugeKette; let fertig; erzeugeKette = new Promise((r) => { fertig = r; });
    await vorher.catch(() => {});
    try {
      if (typeof document === 'undefined' && !globalThis.ModuleFactory && fs.wasmLoaderPath) { const m = await import(/* @vite-ignore */ fs.wasmLoaderPath); globalThis.ModuleFactory = m.default || globalThis.ModuleFactory; }
      return await erzeuge(mp, fs, buf);
    } finally { fertig(); }
  })();
  async function erzeuge(mp, fs, buf) {
    const baseOptions = { modelAssetBuffer: new Uint8Array(buf), delegate: opts.delegate || 'CPU' };
    switch (id) {
      case 'gesicht-landmarken': return mp.FaceLandmarker.createFromOptions(fs, { baseOptions, runningMode: 'IMAGE', numFaces: opts.numFaces || 6, minFaceDetectionConfidence: 0.4, minFacePresenceConfidence: 0.4 });
      case 'gesicht-schnell': return mp.FaceDetector.createFromOptions(fs, { baseOptions, runningMode: 'IMAGE', minDetectionConfidence: 0.4 });
      case 'klassen': case 'haar': return mp.ImageSegmenter.createFromOptions(fs, { baseOptions, runningMode: 'IMAGE', outputCategoryMask: true, outputConfidenceMasks: true });
      case 'antippen': return mp.InteractiveSegmenter.createFromOptions(fs, { baseOptions, outputCategoryMask: false, outputConfidenceMasks: true });
      case 'antippen-klein': return mp.InteractiveSegmenterLegacy.createFromOptions(fs, { baseOptions, outputCategoryMask: false, outputConfidenceMasks: true });
      default: throw new BildwerkFehler(FEHLER.KEIN_MODELL, `Aufgabe unbekannt: ${id}`);
    }
  }
  aufgaben.set(id, p);
  try { return await p; } catch (e) { aufgaben.delete(id); throw e instanceof BildwerkFehler ? e : new BildwerkFehler(FEHLER.KEIN_MODELL, `${m.titel}: ${e.message || e}`); }
}
/** Sitzungen/Aufgaben freigeben (Speicher). */
export async function freigeben(ids) {
  for (const id of ids || [...sitzungen.keys(), ...aufgaben.keys()]) {
    const s = sitzungen.get(id); if (s) { sitzungen.delete(id); try { (await s).release?.(); } catch {} }
    const a = aufgaben.get(id); if (a) { aufgaben.delete(id); try { (await a).close?.(); } catch {} }
  }
}

// ================================================================ Bedienung „Modell laden?“ (DOM)
/**
 * Zeigt Größe, Lizenz und „Laden“ / „Ohne Modell“. opts: { ids, onFertig(geladen: boolean), ki?: RpcKanal (lädt im Worker), hinweis? }.
 * Ohne ki wird im Haupt-Faden geladen (Cache Storage ist zwischen Seite und Worker geteilt).
 */
export function modellUI(container, opts) {
  const doc = container.ownerDocument, ids = (opts.ids || []).filter((id) => MODELLE[id]);
  const gesamt = ids.reduce((s, id) => s + MODELLE[id].bytes, 0);
  const arten = [...new Set(ids.map((id) => MODELLE[id].laufzeit))].filter((a) => LAUFZEIT_DATEIEN[a]);
  let fehlend = arten.slice();   // Laufzeiten, die noch nicht im Cache liegen (Größe ehrlich mit anzeigen)
  const extra = () => fehlend.reduce((s, a) => s + LAUFZEIT_DATEIEN[a].bytes, 0);
  const knopfText = () => `Laden (${mb(gesamt)}${extra() ? ` + ${mb(extra())} Laufzeit` : ''})`;
  const el = doc.createElement('div'); el.className = 'mo';
  el.innerHTML = `<style>.mo{display:flex;flex-direction:column;gap:10px;color:var(--text,#e8e6e1);font:14px/1.4 system-ui,-apple-system,sans-serif}
.mo ul{margin:0;padding-left:18px;color:var(--leise,#9a9890)}.mo .zeile{display:flex;gap:8px;flex-wrap:wrap}
.mo button{min-height:44px;min-width:44px;padding:0 14px;border-radius:10px;border:1px solid var(--linie,#33363c);background:var(--flaeche2,#202226);color:inherit;font:inherit}
.mo button.haupt{background:var(--akzent,#d9a441);color:#111;border-color:transparent;font-weight:600}
.mo .balken{height:6px;background:var(--linie,#33363c);border-radius:3px;overflow:hidden}.mo .balken i{display:block;height:100%;width:0;background:var(--akzent,#d9a441);transition:width .15s}</style>
<p>${opts.hinweis || 'Für diese Funktion wird ein Modell gebraucht. Es wird einmal geladen und bleibt danach auf dem Gerät (auch offline).'}</p>
<ul>${ids.map((id) => `<li>${MODELLE[id].titel} – ${mb(MODELLE[id].bytes)} (${MODELLE[id].lizenz})</li>`).join('')}</ul>
<div class="balken" hidden><i></i></div><p class="text" aria-live="polite"></p>
<div class="zeile"><button class="haupt" data-a="laden">${knopfText()}</button><button data-a="ohne">Ohne Modell</button></div>`;
  container.appendChild(el);
  Promise.all(arten.map(async (a) => ((await laufzeitImCache(a)) ? null : a))).then((l) => { fehlend = l.filter(Boolean); const k = el.querySelector('[data-a="laden"]'); if (k && !k.disabled) k.textContent = knopfText(); }).catch(() => {});
  const balken = el.querySelector('.balken'), text = el.querySelector('.text'); let ac = null, fertig = false;
  const ende = (ok) => { if (fertig) return; fertig = true; opts.onFertig?.(ok); };
  el.addEventListener('click', async (e) => {
    const a = e.target.closest('[data-a]')?.dataset.a; if (!a) return;
    if (a === 'ohne') { ac?.abort(); ende(false); return; }
    if (a === 'laden') {
      e.target.disabled = true; balken.hidden = false; ac = new AbortController(); let geladen = 0;
      try {
        for (const a of fehlend) await sichereLaufzeit(a, { signal: ac.signal, onFortschritt: (f, t) => { balken.firstElementChild.style.width = `${Math.round(f * 100)}%`; text.textContent = `${t} wird geladen (${mb(LAUFZEIT_DATEIEN[a].bytes)})`; } });
        for (const id of ids) {
          const melde = (f, t) => { balken.firstElementChild.style.width = `${Math.round(((geladen + f * MODELLE[id].bytes) / gesamt) * 100)}%`; text.textContent = t || MODELLE[id].titel; };
          if (opts.ki) await opts.ki.rufe('lade', { ids: [id] }, { signal: ac.signal, onFortschritt: melde }); else await lade(id, { signal: ac.signal, onFortschritt: melde });
          geladen += MODELLE[id].bytes;
        }
        text.textContent = 'Fertig – Modell ist auf dem Gerät gespeichert.'; ende(true);
      } catch (err) { text.textContent = `${err.text || err.message || err}. Ohne Modell geht es mit dem einfacheren Verfahren weiter.`; e.target.disabled = false; }
    }
  });
  return { setze() {}, zerstoere() { ac?.abort(); el.remove(); ende(false); } };
}
