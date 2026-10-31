// K2: the worklet from index.html in Node (stub scope), FM (eng 1) with an fmx graph; render(flat, fm6, events, o) -> {l, r}
import fs from 'fs';
export const FILE = process.env.K2_FILE || new URL('../index.html', import.meta.url).pathname;
const cache = new Map();
function src(file) { if (cache.has(file)) return cache.get(file); const s = fs.readFileSync(file, 'utf8'); const i = s.indexOf('id="sq-worklet-src">') + 'id="sq-worklet-src">'.length; const w = s.slice(i, s.indexOf('</script>', i)); cache.set(file, w); return w; }
export function scope(sr, file) {
  const procs = {}, G = {currentFrame: 0};
  class AWP { constructor() { this.port = {postMessage: m => { (this.__msgs || (this.__msgs = [])).push(m); }, onmessage: null}; } }
  const fn = new Function('sampleRate', 'AudioWorkletProcessor', 'registerProcessor', '__G', 'Math', src(file).replace(/currentFrame/g, '__G.currentFrame'));
  const M = Object.create(Math); let s = 12345; M.random = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
  fn(sr, AWP, (n, c) => { procs[n] = c; }, G, M); return {G, procs};
}
export function render(flat, fm6, events, o = {}) {
  const sr = o.sr || 48000, N = Math.round((o.sec || 2) * sr / 128) * 128, {G, procs} = scope(sr, o.file || FILE);
  const P = new procs['dirigent-analog']({processorOptions: {patch: Object.assign({eng: 1}, flat), mods: [], fm6}});
  P.onMsg({tempo: {bpm: 120, start: null}});
  let id = 1; const ids = {}, ev = [];
  for (const e of events) { if (e[1] === 'on') { ids[e[2]] = id++; ev.push([e[0], 1, ids[e[2]], e[2], e[3] == null ? .8 : e[3], -1]); } else ev.push([e[0], 2, ids[e[2]]]); }
  P.onMsg({ev});
  const l = new Float32Array(N), r = new Float32Array(N), L = new Float32Array(128), R = new Float32Array(128), qms = [];
  for (let f = 0; f < N; f += 128) { G.currentFrame = f; const t0 = performance.now(); P.process([], [[L, R]]); qms.push(performance.now() - t0); l.set(L, f); r.set(R, f); }
  return {l, r, sr, qms, P};
}
export function mag(a, f, sr, i0, i1) {
  const n = i1 - i0, w = 2 * Math.PI * f / sr; let re = 0, im = 0, ws = 0;
  for (let i = 0; i < n; i++) { const h = .5 - .5 * Math.cos(2 * Math.PI * i / (n - 1)), x = a[i0 + i] * h; re += x * Math.cos(w * i); im -= x * Math.sin(w * i); ws += h; }
  return 2 * Math.hypot(re, im) / ws;
}
export const db = x => 20 * Math.log10(Math.max(1e-9, x));
export const FLAT = {eng: 1, ftype: 1, cutoff: 20000, res: 0, lq: 0, drive: 0, aA: .002, aD: .05, aS: 1, aR: .05, fmAmp: 0, fenv: 0, fvel: 0, kt: 0, bass: 0, analog: 0, spread: 0, level: 1, poly: 8, mode: 0, glide: 0, ampVel: 0};
export const OP = (k, o = {}) => Object.assign({on: 1, c: k, r: 0, wave: 0, ph: 0, phm: 'fix', ol: 99, fixed: 0, coarse: 1, fine: 0, det: 0, fbSrc: 0, fbAmt: 0, vs: 0, lfoAm: 0, lfoFm: 0, rs: 0,
  ks: {bp: 39, ld: 0, rd: 0, lc: 0, rc: 0}, amp: {f: 'dx', r: [80, 45, 40, 55], l: [99, 80, 60, 0]}, pit: null, pr: 'dx'}, o);
export const FM6 = x => ({alg: 1, fb: 0, trans: 0, ops: x.ops.map(o => ({on: 1, fixed: 0, coarse: 1, fine: 0, det: 0, ol: o.ol, r: o.amp.r || [99, 99, 99, 60], l: o.amp.l || [99, 99, 99, 0], vs: 0, rs: 0})), x});
