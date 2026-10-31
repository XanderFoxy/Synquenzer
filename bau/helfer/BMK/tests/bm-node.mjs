// Node harness for the processor 'synq-bm' (BM_WK of bau/helfer/BMK/index.html, or BM_SRC=src file) with a stub AudioWorkletGlobalScope.
// render(msgs, o) -> {l, r, msgs, P, qms}; msgs = [[timeSec, message], ...] (time <= 0 = before the first quantum).
// o.sr, o.sec, o.quantumMs (time every quantum), o.before(P) hook.
import fs from 'fs';
const HERE = new URL('.', import.meta.url).pathname;
const FILE = process.env.BM_FILE || HERE + '../index.html';
let SRC = null;
export function bmSrc() {
  if (SRC) return SRC;
  if (process.env.BM_SRC) return (SRC = fs.readFileSync(process.env.BM_SRC, 'utf8'));
  const s = fs.readFileSync(FILE, 'utf8'), a = s.indexOf('const BM_WK = `') + 'const BM_WK = `'.length; SRC = s.slice(a, s.indexOf('`;', a));
  return SRC;
}
export function makeScope(sr) {
  const procs = {}, T = new Float64Array(1), G = {T, set currentTime(x) { T[0] = x; }, get currentTime() { return T[0]; }};
  class AWP { constructor() { this.__msgs = []; this.port = {postMessage: m => { this.__msgs.push(m); }, onmessage: null}; } }
  const fn = new Function('sampleRate', 'AudioWorkletProcessor', 'registerProcessor', '__T', bmSrc().replace(/\bcurrentTime\b/g, '__T[0]') + '\n;return BMK;');
  const BMK = fn(sr, AWP, (n, c) => { procs[n] = c; }, T);
  return {G, procs, BMK};
}
export function render(msgs, o) {
  o = o || {}; const sr = o.sr || 48000, sec = o.sec || 1, N = Math.ceil(sec * sr / 128) * 128;
  const {G, procs, BMK} = o.scope || makeScope(sr);
  const P = new procs['synq-bm']({});
  const send = m => P.port.onmessage({data: m});
  const ms = (msgs || []).slice().sort((a, b) => a[0] - b[0]);
  if (o.before) o.before(P, send);
  const l = new Float32Array(N), r = new Float32Array(N), qms = o.quantumMs ? new Float64Array(N / 128) : null;
  const L = new Float32Array(128), R = new Float32Array(128), INS = [], OUTS = [[L, R]];
  let mi = 0;
  for (let f = 0, q = 0; f < N; f += 128, q++) {
    G.T[0] = f / sr;
    while (mi < ms.length && ms[mi][0] * sr < f + 128 - 1e-9 && Math.floor(ms[mi][0] * sr / 128) * 128 <= f) send(ms[mi++][1]);
    if (o.each) o.each(P, f, send);
    L.fill(0); R.fill(0);
    const t0 = qms ? performance.now() : 0;
    P.process(INS, OUTS);
    if (qms) qms[q] = performance.now() - t0;
    l.set(L, f); r.set(R, f);
  }
  return {l, r, msgs: P.__msgs, P, qms, sr, BMK};
}
// helpers for events
export const on = (at, n, v = .8, id) => ({t: 'on', list: [{n, v: v, at, d: 0, id: id == null ? n : id}]});
export const off = (at, n, id) => ({t: 'off', list: [{n, at, id: id == null ? n : id}]});
