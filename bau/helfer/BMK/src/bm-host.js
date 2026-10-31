/* BMK-TEST (branch K only; BM6 brings the real host BmHost): helpers to drive the processor 'synq-bm' in tests and probes.
   bmkModule(ctx) adds the module once; bmkRender(msgs, o) renders offline: msgs = [[timeSec, message], ...] posted at the
   128-frame boundary at or before timeSec (each message's own 'at' fields stay sample exact). */
const BMK_MOD = new WeakMap();
function bmkModule(c) {
  if (!BMK_MOD.has(c)) BMK_MOD.set(c, c.audioWorklet.addModule('data:application/javascript;base64,' + btoa(BM_WK)));
  return BMK_MOD.get(c);
}
async function bmkRender(msgs, o) {
  o = o || {}; const sr = o.sr || 48000, sec = o.sec || 1;
  const oc = new OfflineAudioContext(2, Math.round(sec * sr), sr);
  await bmkModule(oc);
  const node = new AudioWorkletNode(oc, 'synq-bm', {numberOfInputs: 0, numberOfOutputs: 1, outputChannelCount: [2]});
  node.connect(oc.destination); const got = [];
  node.port.onmessage = ev => got.push(ev.data);
  const first = [], later = [];
  for (const [t, m] of msgs || []) (t <= 0 ? first : later).push([t, m]);
  for (const [, m] of first) node.port.postMessage(m);
  for (const [t, m] of later) oc.suspend(Math.floor(t * sr / 128) * 128 / sr).then(() => { node.port.postMessage(m); oc.resume(); }).catch(() => {});
  await new Promise(r => setTimeout(r, 30));
  const b = await oc.startRendering();
  return {l: b.getChannelData(0), r: b.getChannelData(1), msgs: got};
}
/* bmkProbe (branch K, for the iPhone gate of section 2.5 until BM6's perfProbe case 'bm' is merged): one unheard 'synq-bm' node
   in the app's AudioContext plays o.voices notes (default 12) for o.sec seconds (default 10); load = the processor's own
   time per second of audio (its {t:'load'} reports), median and maximum. o.p = program (default: both oscillators + noise). */
async function bmkProbe(o) {
  o = o || {}; if (!AU.ctx) ensureAudio(); const c = AU.ctx; if (!c) return {fall: 'bm', err: 'kein AudioContext'};
  try { await bmkModule(c); } catch (e) { return {fall: 'bm', err: String(e && e.message || e)}; }
  const sec = o.sec || 10, nv = o.voices == null ? 12 : o.voices, sink = c.createGain(); sink.gain.value = 0; sink.connect(c.destination);
  const node = new AudioWorkletNode(c, 'synq-bm', {numberOfInputs: 0, numberOfOutputs: 1, outputChannelCount: [2]}); node.connect(sink);
  const rep = []; node.port.onmessage = ev => { const m = ev.data; if (m && m.t === 'load') rep.push(m); };
  node.port.postMessage({t: 'prog', ab: 'a', p: o.p || {o1: {m: 78, e: {l: 99, a: 0, d: 0, s: 15, r: 3}}, o2: {m: 255, st: 7, e: {l: 80, a: 0, d: 0, s: 15, r: 3}}, n: {fr: 99, e: {l: 40, a: 0, d: 0, s: 15, r: 3}}}});
  const notes = [36, 43, 48, 52, 55, 59, 60, 62, 64, 67, 71, 72].slice(0, nv), t0 = c.currentTime + .05;
  node.port.postMessage({t: 'on', list: notes.map((n, k) => ({n, v: .8, at: t0, d: 0, id: k + 1}))});
  const w0 = performance.now(); while (performance.now() - w0 < sec * 1000 + 300) await new Promise(r => setTimeout(r, 250));
  node.port.postMessage({t: 'panic'}); await new Promise(r => setTimeout(r, 60)); node.disconnect(); sink.disconnect();
  const v = rep.slice(1).map(m => m.v).sort((a, b) => a - b), q = rep.map(m => m.q).sort((a, b) => a - b);
  return {fall: 'bm', app: typeof VERSION !== 'undefined' ? VERSION : '', ua: navigator.userAgent, sr: c.sampleRate, voices: nv, reports: rep.length,
    load_med: +(v.length ? v[v.length >> 1] : 0).toFixed(4), load_max: +(v.length ? v[v.length - 1] : 0).toFixed(4), quantum_max_ms: +(q.length ? q[q.length - 1] : 0).toFixed(3)};
}
