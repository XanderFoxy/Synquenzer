/* ---------- G9b-0/1/2: Sprachmodell im Browser (§4.3–4.5, §6.6, §7.8) ----------
   Mehrsprachiges Spracherkennungs-Modell „base“ (ONNX, mit Kreuz-Aufmerksamkeit für Wort-Zeiten), Bibliothek + Laufzeit von der npm-CDN
   (feste Versionen), Gewichte von der Modell-Ablage (feste Revision). Nie beim Start: erst nach [Laden und erkennen]. Jede Datei wird in Stücken
   geladen (Fortschritt in MB, [Stopp] = Worker beenden), mit SHA-256 geprüft und im Cache-Speicher `synq-g9-asr-v1` abgelegt; danach offline.
   Alles Schwere (Laden, Prüfen, Modell, Rechnen) läuft in einem eigenen Modul-Worker, der Haupt-Faden bleibt frei.
   Weg: WebGPU (Encoder fp16 auf der GPU, Decoder 8-Bit im WASM-Teil) nur mit Adapter + shader-f16, sonst WASM (beide 8-Bit, ein Kern).
   Schlägt WebGPU fehl, gilt für dieses Gerät WASM (merkt sich localStorage `synq-g9-asr-how`). */
const G9A = {
  CACHE: 'synq-g9-asr-v1',
  MODEL: 'onnx-community/whisper-base_timestamped', REV: '608c49e61301901684bc36cac8f74b95ff6b5a8e',
  HF: 'https://huggingface.co/',
  LIB: 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.1/dist/transformers.min.js',
  ORT: 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.31.0-dev.20260914-8d85527a0/dist/',
  IDLE: 180000,                      // Worker nach 3 min ohne Arbeit beenden (Speicher, iPhone); Neustart aus dem Cache
  w: null, q: new Map(), qid: 0, ready: null, loadP: null, net: [], diag: [], idleT: 0
};
// [Datei, Bytes, SHA-256, Wege] – w = WASM, g = WebGPU
G9A.FILES = [
  ['lib', 586230, '8d6716d9086f57c30a4bf367dba61b887593573c770c454465e8019b2703e743', 'wg'],
  ['ort-wasm-simd-threaded.mjs', 24381, 'c57ca56328877353a575e51bbca6f18450027d6c9bf2307a2cb2c41363b4de9f', 'w'],
  ['ort-wasm-simd-threaded.wasm', 14264838, '06ba057753da3847e4c24f02d91ab133455b0817c69a44993a9a53a2146df9e3', 'w'],
  ['ort-wasm-simd-threaded.asyncify.mjs', 53057, '0966b6105cd936744498aa60df7a22cbd47af3374dbc64a9ab561c08a71e3611', 'g'],
  ['ort-wasm-simd-threaded.asyncify.wasm', 26861777, '49871f5a4409519797e127440868a6d1923339d9185907f301a5b2a1d90af082', 'g'],
  ['config.json', 2243, 'f4d0608f7d918166da7edb3e188de5ef1bfe70d9802e785d271fd88111e9cf4b', 'wg'],
  ['generation_config.json', 3832, '61070cf8de25b1e9256e8e102ded49d8d24a8369ed36ef84fdf21549e68125a0', 'wg'],
  ['preprocessor_config.json', 339, 'a6a76d28c93edb273669eb9e0b0636a2bddbb1272c3261e47b7ca6dfdbac1b8d', 'wg'],
  ['tokenizer.json', 2480466, '27fc476bfe7f17299480be2273fc0608e4d5a99aba2ab5dec5374b4482d1a566', 'wg'],
  ['tokenizer_config.json', 282682, '2e036e4dbacfdeb7242c7d4ec4149f4a16e86026048f94d1637e3a8ee9c6a573', 'wg'],
  ['onnx/encoder_model_quantized.onnx', 23159167, '2714484ebe1bae7c1646e8eadb768bb9d415cf11763466d21f23039a29c62e6f', 'w'],
  ['onnx/encoder_model_fp16.onnx', 41270731, '2d31aa4b0c8c74c2e49a5c8d8a5640e38e75aac493cf15290f8c1466ee8c1845', 'g'],
  ['onnx/decoder_model_merged_quantized.onnx', 53712708, 'cf9a8d5bcddc0917a0078135b484cedcaf44f28909cd91910abd29dced9171db', 'wg']
].map(([f, n, h, ways]) => ({f, n, h, ways, u: f === 'lib' ? G9A.LIB : f.startsWith('ort-') ? G9A.ORT + f : G9A.HF + G9A.MODEL + '/resolve/' + G9A.REV + '/' + f}));
const g9AsrSet = how => G9A.FILES.filter(x => x.ways.includes(how === 'webgpu' ? 'g' : 'w'));
const g9AsrMB = n => Math.round(n / 1048576);

// Worker-Quelle (Modul-Worker aus Blob, wie VS5a): Laden/Prüfen/Cache, Modell, Erkennen
function g9AsrWorkerMain() {
  let CA = null, T = null, P = null, HOW = null, LANG = null;
  const hex = b => Array.from(new Uint8Array(b), v => v.toString(16).padStart(2, '0')).join('');
  const cache = async name => CA || (CA = await caches.open(name));
  // Abrufe zählen (Datenschutz-Nachweis g9Net, §4.5): nur GET der Liste, nie Upload
  const net = (u, m, n) => postMessage({op: 'net', u: String(u).slice(0, 160), m, n});
  async function load(m) {
    const ca = await cache(m.cache); let got = 0;
    const total = m.files.reduce((s, x) => s + x.n, 0);
    for (const x of m.files) {
      if (await ca.match(x.u)) { got += x.n; postMessage({op: 'prog', id: m.id, got, total}); continue; }
      const r = await fetch(x.u, {credentials: 'omit'}); net(x.u, 'GET', x.n);
      if (!r.ok || !r.body) throw new Error('Laden fehlgeschlagen (' + r.status + '): ' + x.f);
      const buf = new Uint8Array(x.n), rd = r.body.getReader(); let o = 0, last = 0;
      for (;;) {
        const {done, value} = await rd.read(); if (done) break;
        if (o + value.length > x.n) throw new Error('Datei zu groß: ' + x.f);
        buf.set(value, o); o += value.length;
        const now = performance.now(); if (now - last > 200) { last = now; postMessage({op: 'prog', id: m.id, got: got + o, total}); }
      }
      if (o !== x.n) throw new Error('Datei unvollständig: ' + x.f);
      const h = hex(await crypto.subtle.digest('SHA-256', buf));
      if (h !== x.h) throw new Error('Prüfsumme falsch: ' + x.f);
      await ca.put(x.u, new Response(buf, {headers: {'content-type': x.f.endsWith('.wasm') ? 'application/wasm' : x.f.endsWith('js') || x.f === 'lib' ? 'text/javascript' : 'application/octet-stream', 'content-length': String(x.n)}}));
      got += x.n; postMessage({op: 'prog', id: m.id, got, total});
    }
    return {got, total};
  }
  async function blobOf(u, type) { const r = await CA.match(u); if (!r) throw new Error('fehlt im Cache: ' + u.split('/').pop()); return URL.createObjectURL(new Blob([await r.arrayBuffer()], {type})); }
  async function init(m) {
    if (P && HOW === m.how) return {how: HOW};
    await cache(m.cache);
    if (!T) T = await import(await blobOf(m.lib, 'text/javascript'));
    const E = T.env;
    E.allowLocalModels = false; E.allowRemoteModels = true;            // Pfade wie Modell-Ablage, Inhalt nur aus dem eigenen Cache:
    E.fetch = async u => { throw new Error('nicht im Cache: ' + String(u).split('/').pop()); };   // die Bibliothek lädt nie selbst
    E.remotePathTemplate = '{model}/resolve/' + m.rev + '/';         // feste Revision für alle Dateien (die Bibliothek reicht revision nicht überall durch)
    E.useBrowserCache = false; E.useCustomCache = true; E.useWasmCache = false;
    E.customCache = {match: k => CA.match(k), put: async () => {}};
    const ow = E.backends.onnx.wasm, sfx = m.how === 'webgpu' ? '.asyncify' : '';
    ow.wasmPaths = {mjs: await blobOf(m.ort + 'ort-wasm-simd-threaded' + sfx + '.mjs', 'text/javascript'), wasm: await blobOf(m.ort + 'ort-wasm-simd-threaded' + sfx + '.wasm', 'application/wasm')};
    ow.numThreads = 1; ow.proxy = false;
    const o = m.how === 'webgpu'
      ? {revision: m.rev, device: {encoder_model: 'webgpu', decoder_model_merged: 'wasm'}, dtype: {encoder_model: 'fp16', decoder_model_merged: 'q8'}}
      : {revision: m.rev, device: 'wasm', dtype: {encoder_model: 'q8', decoder_model_merged: 'q8'}};
    if (P) { try { await P.dispose(); } catch (e) {} P = null; }
    P = await T.pipeline('automatic-speech-recognition', m.model, o);
    HOW = m.how;
    const g = P.model.generation_config || {}; LANG = {sot: g.decoder_start_token_id || 50258, de: (g.lang_to_id || {})['<|de|>'] || 50261, en: (g.lang_to_id || {})['<|en|>'] || 50259};
    return {how: HOW};
  }
  // eigene Sprach-Erkennung (§6.6.4): ein Decoder-Schritt nach <|startoftranscript|>, nur <|de|> gegen <|en|>
  async function detect(x) {
    const f = await P.processor(x);
    const ids = new T.Tensor('int64', BigInt64Array.from([BigInt(LANG.sot)]), [1, 1]);
    const out = await P.model({input_features: f.input_features, decoder_input_ids: ids});
    const lg = out.logits, V = lg.dims[lg.dims.length - 1], d = lg.data, off = d.length - V;
    return Number(d[off + LANG.de]) >= Number(d[off + LANG.en]) ? 'de' : 'en';
  }
  async function run(m) {
    const t0 = performance.now(), x = m.x;
    const lang = m.lang === 'de' || m.lang === 'en' ? m.lang : await detect(x);
    const t1 = performance.now();
    // Obergrenze nach Fensterlänge (Gesang ≤ ≈ 6 Token/s): eine Wiederholungs-Schleife kostet so höchstens Sekunden statt eines vollen Laufs
    const r = await P(x, {return_timestamps: 'word', language: lang, task: 'transcribe', max_new_tokens: Math.min(440, Math.ceil(x.length / 16000 * 6) + 16)});
    const words = [];
    for (const c of (r && r.chunks) || []) {
      const t = String(c.text || '').trim(); if (!t) continue;
      const a = c.timestamp && isFinite(c.timestamp[0]) ? c.timestamp[0] : null; if (a == null) continue;
      const b = c.timestamp[1] != null && isFinite(c.timestamp[1]) && c.timestamp[1] > a ? c.timestamp[1] : a + 0.3;
      words.push({text: t, start: a, end: b});
    }
    return {words, lang, text: r && r.text || '', ms: Math.round(performance.now() - t0), msLang: Math.round(t1 - t0)};
  }
  onmessage = async e => {
    const m = e.data;
    try {
      const r = m.op === 'load' ? await load(m) : m.op === 'init' ? await init(m) : m.op === 'run' ? await run(m) : null;
      postMessage({op: 'ok', id: m.id, r});
    } catch (err) { postMessage({op: 'err', id: m.id, err: String(err && err.message || err)}); }
  };
}
function g9AsrWorker() {
  if (G9A.w) return G9A.w;
  const u = URL.createObjectURL(new Blob(['(' + g9AsrWorkerMain.toString() + ')();'], {type: 'text/javascript'}));
  const w = G9A.w = new Worker(u, {type: 'module', name: 'g9-asr'}); setTimeout(() => { try { URL.revokeObjectURL(u); } catch (e) {} }, 30000);
  G9A.ready = null;
  w.onmessage = e => {
    const m = e.data;
    if (m.op === 'net') { G9A.net.push({url: m.u, method: m.m, bytes: m.n}); return; }
    const q = G9A.q.get(m.id); if (!q) return;
    if (m.op === 'prog') { if (q.prog) q.prog(m.got, m.total); return; }
    G9A.q.delete(m.id); if (m.op === 'err') q.no(new Error(m.err)); else q.ok(m.r);
  };
  w.onerror = e => { try { e.preventDefault(); } catch (x) {} g9AsrKill('Worker-Fehler: ' + (e && e.message || '')); };
  return w;
}
function g9AsrCall(op, o, prog, tr) {
  const w = g9AsrWorker(); clearTimeout(G9A.idleT);
  return new Promise((ok, no) => {
    const id = ++G9A.qid; G9A.q.set(id, {ok, no, prog});
    try { w.postMessage(Object.assign({op, id}, o), tr || []); } catch (e) { G9A.q.delete(id); no(e); }
  }).finally(() => { if (!G9A.q.size) { clearTimeout(G9A.idleT); G9A.idleT = setTimeout(() => { if (!G9A.q.size && !g9RecBusy()) g9AsrKill('ruht'); }, G9A.IDLE); } });
}
// Worker beenden (Stopp, Aufnahme hat Vorrang, Projektwechsel, Ruhe): sofort; laufende Aufrufe enden mit Fehler
function g9AsrKill(why) {
  const w = G9A.w; if (!w) return false;
  G9A.w = null; G9A.ready = null; clearTimeout(G9A.idleT);
  try { w.terminate(); } catch (e) {}
  for (const q of G9A.q.values()) q.no(new Error(why || 'gestoppt')); G9A.q.clear();
  if (G9.sm.state === 'loading') G9.sm = Object.assign({}, G9.sm, {state: 'none'});
  else if (G9.sm.state === 'ready') G9.sm = Object.assign({}, G9.sm, {state: 'cached'});
  g9RbPaint();
  return true;
}
// Weg wählen (ohne Netz): gemerkter Fehlschlag → WASM; sonst WebGPU nur mit Adapter + shader-f16
async function g9AsrHow() {
  if (G9.sm.how) return G9.sm.how;
  let how = 'wasm';
  try {
    const want = new URLSearchParams(location.search).get('g9how');
    if (want === 'wasm' || want === 'webgpu') how = want;
    else if (localStorage.getItem('synq-g9-asr-how') !== 'wasm' && navigator.gpu) {
      const ad = await navigator.gpu.requestAdapter();
      if (ad && ad.features && ad.features.has('shader-f16')) how = 'webgpu';
    }
  } catch (e) {}
  // liegt der andere Satz schon vollständig im Cache, wird er genommen (kein zweiter Download)
  const st = await g9AsrScan();
  if (!st.full[how] && st.full[how === 'webgpu' ? 'wasm' : 'webgpu']) how = how === 'webgpu' ? 'wasm' : 'webgpu';
  G9.sm = Object.assign({}, G9.sm, {how});
  return how;
}
// Cache prüfen (nur lesen, kein Netz): welche Dateien liegen da, wie viele Bytes, welcher Satz ist vollständig
async function g9AsrScan() {
  const r = {bytes: 0, have: new Set(), full: {wasm: false, webgpu: false}};
  try {
    if (!(await caches.has(G9A.CACHE))) return r;
    const ca = await caches.open(G9A.CACHE), ks = await ca.keys();
    const by = new Map(G9A.FILES.map(x => [x.u, x])), seen = new Set();
    for (const k of ks) { const x = by.get(k.url); if (x) { seen.add(x.u); r.bytes += x.n; } else { const q = await ca.match(k); if (q) r.bytes += (await q.blob()).size; } }
    r.have = seen; r.full.wasm = g9AsrSet('wasm').every(x => seen.has(x.u)); r.full.webgpu = g9AsrSet('webgpu').every(x => seen.has(x.u));
  } catch (e) {}
  return r;
}
async function g9AsrRefresh() {
  const st = await g9AsrScan(), how = G9.sm.how || 'wasm';
  G9A.scan = st;
  const full = st.full[how];
  if (G9.sm.state !== 'loading' && G9.sm.state !== 'ready') G9.sm = Object.assign({}, G9.sm, {state: full ? 'cached' : 'none'});
  G9.sm = Object.assign({}, G9.sm, {bytes: st.bytes, rev: G9A.REV});
  try { if (full) localStorage.setItem('synq-g9-asr', '1'); else localStorage.removeItem('synq-g9-asr'); } catch (e) {}
  return st;
}
// laden (falls nötig) und Modell starten; Fortschritt in der Info-Zeile, [Stopp] = Worker beenden
async function g9AsrEnsure() {
  if (G9A.ready) return G9A.ready;
  if (G9A.loadP) return G9A.loadP;
  const p = G9A.loadP = (async () => {
    const how = await g9AsrHow(), files = g9AsrSet(how);
    const st = await g9AsrRefresh();
    if (!st.full[how]) {
      G9.sm = Object.assign({}, G9.sm, {state: 'loading', got: 0, total: files.reduce((s, x) => s + x.n, 0)}); g9RbPaint();
      try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {}
      g9RecMsg('Sprachmodell lädt … 0/' + g9AsrMB(G9.sm.total) + ' MB');
      await g9AsrCall('load', {cache: G9A.CACHE, files: files.map(x => ({u: x.u, n: x.n, h: x.h, f: x.f}))}, (got, total) => {
        G9.sm = Object.assign({}, G9.sm, {got, total}); g9RecMsg('Sprachmodell lädt … ' + g9AsrMB(got) + '/' + g9AsrMB(total) + ' MB · ' + Math.round(got / total * 100) + ' %');
      });
      await g9AsrRefresh();
    }
    G9.sm = Object.assign({}, G9.sm, {state: 'starting'}); g9RecMsg('Sprachmodell startet …');
    const t0 = performance.now();
    try { await g9AsrCall('init', {cache: G9A.CACHE, how, lib: G9A.LIB, ort: G9A.ORT, model: G9A.MODEL, rev: G9A.REV}); }
    catch (e) {
      if (how !== 'webgpu' || !G9A.w) throw e;                       // gestoppt/beendet: nicht umschalten
      G9A.loadP = null; await g9AsrToWasm(e);
      return g9AsrEnsure();
    }
    G9.sm = Object.assign({}, G9.sm, {state: 'ready', initMs: Math.round(performance.now() - t0)}); g9RbPaint();
    return true;
  })();
  G9A.ready = null;
  try { await p; G9A.ready = p; return true; }
  catch (e) { if (G9.sm.state === 'loading' || G9.sm.state === 'starting') G9.sm = Object.assign({}, G9.sm, {state: 'none'}); throw e; }
  finally { if (G9A.loadP === p) G9A.loadP = null; g9RbPaint(); }
}
// WebGPU klappt auf diesem Gerät nicht → WASM-Satz (einmal nachladen), gemerkt; die nur für WebGPU geladenen Dateien (≈ 68 MB) wieder freigeben
async function g9AsrToWasm(e) {
  try { localStorage.setItem('synq-g9-asr-how', 'wasm'); } catch (x) {}
  G9A.diag.push('webgpu: ' + String(e && e.message || e).slice(0, 120));
  g9AsrKill('Weg'); G9.sm = Object.assign({}, G9.sm, {how: 'wasm', state: 'none'}); G9A.ready = null;
  try { const ca = await caches.open(G9A.CACHE); await Promise.all(G9A.FILES.filter(x => x.ways === 'g').map(x => ca.delete(x.u))); } catch (x) {}
}
// Andock-Stelle G9.asr (§6.6.5): ein Fenster (16 kHz, schon entzerrt) → Wörter mit Zeiten ab Fenster-Beginn
async function g9AsrRun(x, o) {
  await g9AsrEnsure();
  let c = new Float32Array(x), r;
  try { r = await g9AsrCall('run', {x: c, lang: o.lang}, null, [c.buffer]); }
  catch (e) {                                                         // WebGPU scheitert erst beim Rechnen → einmal auf WASM wechseln
    if (G9.sm.how !== 'webgpu' || !G9A.w) throw e;
    await g9AsrToWasm(e); await g9AsrEnsure(); c = new Float32Array(x);
    r = await g9AsrCall('run', {x: c, lang: o.lang}, null, [c.buffer]);
  }
  G9A.diag.push(G9.sm.how + ' Fenster ' + (o.k + 1) + ': ' + r.ms + ' ms' + (r.msLang ? ' (Sprache ' + r.msLang + ' ms)' : ''));
  if (G9A.diag.length > 20) G9A.diag.shift();
  G9A.last = r;
  return {words: r.words, lang: r.lang};
}
// [Erkennen] → laden (nur nach Tipp) → Erkennung; [Stopp] während Laden oder Erkennen
async function g9AsrRecognize(id, o) {
  try { await g9AsrEnsure(); }
  catch (e) {
    const stopped = /gestoppt|Aufnahme|Projekt/.test(String(e && e.message));
    g9RecMsg(stopped ? 'Laden gestoppt' : 'Sprachmodell: ' + String(e && e.message || e));
    if (!stopped) logErr(e);
    if (WP.ed && WP.ed.g9) wpInfoTxt(G9.recMsg);
    return {applied: true, words: [], stopped, err: stopped ? null : String(e && e.message || e)};
  }
  return g9RecJob(id, o || {});
}
function g9AsrStop() {
  const t0 = performance.now(), loading = G9.sm.state === 'loading' || G9.sm.state === 'starting';
  if (loading) { g9AsrKill('gestoppt'); g9RecMsg('Laden gestoppt'); if (WP.ed && WP.ed.g9) wpInfoTxt(G9.recMsg); }
  else g9RecStop();
  G9.stopMs = performance.now() - t0; g9RbPaint();
  return true;
}
async function g9AsrRemove() {
  g9AsrKill('entfernt');
  try { await caches.delete(G9A.CACHE); } catch (e) {}
  try { localStorage.removeItem('synq-g9-asr'); } catch (e) {}
  G9.sm = Object.assign({}, G9.sm, {state: 'none', bytes: 0}); G9A.scan = null;
  await g9AsrRefresh(); g9RbPaint();
}
const g9AsrBusy = () => G9.sm.state === 'loading' || G9.sm.state === 'starting' || g9RecBusy();
// Kopf-Taste: [Erkennen] ↔ [Stopp] (während Laden oder Erkennen)
function g9RbPaint() {
  const E = WP.ed, rb = E && E.g9 && E.g9.rb; if (!rb) return;
  const busy = g9AsrBusy(); rb.hidden = !G9.rec;
  rb.textContent = busy ? 'Stopp' : 'Erkennen'; rb.classList.toggle('on', busy); rb.setAttribute('aria-label', busy ? 'Erkennen stoppen' : 'Worte erkennen');
}
function g9AsrOk() { try { return typeof Worker === 'function' && typeof WebAssembly === 'object' && typeof caches === 'object' && !!(self.crypto && crypto.subtle); } catch (e) { return false; } }
function g9AsrDock() {
  if (G9.asr && G9.asr !== g9AsrRun) return;                          // Test-Ersatz (g9AsrSim) hat Vorrang
  if (!g9AsrOk()) return;
  G9.asr = g9AsrRun;
  G9.rec = {
    cached: () => G9.sm.state === 'cached' || G9.sm.state === 'ready',
    size: () => { const how = G9.sm.how || 'wasm', st = G9A.scan; const has = st && st.full[how]; return {how, mb: g9AsrMB(has ? st.bytes : g9AsrSet(how).reduce((s, x) => s + (st && st.have.has(x.u) ? 0 : x.n), 0))}; },
    load: () => g9AsrEnsure(),
    recognize: (id, o) => g9AsrRecognize(id, o),
    remove: () => g9AsrRemove(),
    stop: () => g9AsrStop()
  };
  g9AsrHow().then(g9AsrRefresh).then(() => g9RbPaint(), e => logErr(e));
}
g9AsrDock();
