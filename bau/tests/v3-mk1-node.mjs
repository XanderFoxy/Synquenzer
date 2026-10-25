// MK1 Node harness (B.4 Nr. 1, like fm-node.mjs): the worklet source from index.html, run in Node with a stub
// AudioWorkletGlobalScope. render(pmk, events, o) -> {l, r, msgs, ms}; events [[t, 'on'|'off', note, vel, id?], ...] or raw
// worklet events via o.raw. o.flat = flat VA patch (eng is set from o.eng, default 3), o.sec, o.sr, o.seed, o.bpm, o.tap,
// o.at = [[t, msg]] messages at render time t (gestures), o.quantumMs = true to time each 128 quantum.
import fs from 'fs';
const FILE = process.env.MK_FILE || new URL('../mk-wt/index.html', import.meta.url).pathname;
const cache = new Map();
export function workletSrc(file) {
  file = file || FILE; if (cache.has(file)) return cache.get(file);
  const s = fs.readFileSync(file, 'utf8'); const i = s.indexOf('id="sq-worklet-src">') + 'id="sq-worklet-src">'.length; const src = s.slice(i, s.indexOf('</script>', i));
  cache.set(file, src); return src;
}
function makeScope(sr, file) {
  const procs = {};
  const G = {sampleRate: sr, currentFrame: 0, procs};
  class AWP { constructor() { this.port = {postMessage: m => { (this.__msgs || (this.__msgs = [])).push(m); }, onmessage: null}; } }
  const fn = new Function('sampleRate', 'AudioWorkletProcessor', 'registerProcessor', '__G', 'Math',
    workletSrc(file).replace(/currentFrame/g, '__G.currentFrame') + '\n;return {MKW: typeof MKW !== "undefined" ? MKW : null};');
  const M = Object.create(Math);
  let s = 12345; M.random = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
  const ex = fn(sr, AWP, (n, c) => { procs[n] = c; }, G, M);
  return {G, procs, MKW: ex.MKW};
}
export function mkDefaults() {
  const T = () => ({asg: 1, prio: 0, trig: 1, udet: 10, trans: 0, tune: 0, vib: 0, bend: 2, porta: 0,
    o1: {w: 0, c1: 0, c2: 0}, o2: {w: 0, mod: 0, semi: 0, tune: 0}, mix: {o1: 127, o2: 0, n: 0},
    f: {type: 0, cut: 127, res: 0, eg: 0, vel: 0, kbd: 0}, a: {lvl: 127, pan: 0, gate: 0, dist: 0, vel: 0, kbd: 0},
    e1: {a: 0, d: 64, s: 0, r: 0, rst: 1}, e2: {a: 0, d: 64, s: 127, r: 8, rst: 1},
    l1: {w: 2, ks: 0, sync: 0, f: 64, note: 6}, l2: {w: 2, ks: 0, sync: 0, f: 64, note: 6}});
  return {v: 1, mode: 0, tv: 1, split: 60, scale: 0, skey: 0, usc: null, vmax: 4, t: [T(), T()]};
}
// deep merge of a partial timbre into p.mk.t[0]
export function mkPatch(over) {
  const p = mkDefaults(), t = p.t[0];
  for (const k in over || {}) { if (typeof over[k] === 'object' && over[k] && !Array.isArray(over[k])) Object.assign(t[k], over[k]); else t[k] = over[k]; }
  return p;
}
export function render(pmk, events, o) {
  o = o || {}; const sr = o.sr || 48000, sec = o.sec || 1, N = Math.round(sec * sr / 128) * 128;
  const {G, procs, MKW} = makeScope(sr, o.file);
  const flat = Object.assign({eng: o.eng == null ? 3 : o.eng}, o.flat || {});
  const P = new procs['dirigent-analog']({processorOptions: {patch: flat, mods: o.mods || [], mk: pmk}});
  P.onMsg({tempo: {bpm: o.bpm || 120, start: o.songStart == null ? null : o.songStart}});
  P.onMsg({mkSeed: o.seed == null ? 1 : o.seed});
  if (o.mw0 != null) P.onMsg({mkWheel: {mw0: o.mw0}});
  if (o.tap) P.onMsg({mkTap: o.tap});
  const ev = [];
  let id = 1; const ids = {};
  for (const e of events || []) {
    if (e[1] === 'on') { const k = e[4] != null ? e[4] : e[2]; ids[k] = e[5] != null ? e[5] : id++; ev.push([e[0], 1, ids[k], e[2], e[3] == null ? .8 : e[3], -1]); }
    else if (e[1] === 'off') { const k = e[4] != null ? e[4] : e[2]; ev.push([e[0], 2, ids[k]]); }
  }
  if (o.raw) ev.push(...o.raw);
  P.onMsg({ev});
  const at = (o.at || []).slice().sort((a, b) => a[0] - b[0]);
  const l = new Float32Array(N), r = new Float32Array(N), qms = [];
  const L = new Float32Array(128), R = new Float32Array(128);
  for (let f = 0; f < N; f += 128) {
    while (at.length && at[0][0] * sr <= f) P.onMsg(at.shift()[1]);
    G.currentFrame = f;
    const t0 = o.quantumMs ? performance.now() : 0;
    P.process([], [[L, R]]);
    if (o.quantumMs) qms.push(performance.now() - t0);
    l.set(L, f); r.set(R, f);
  }
  return {l, r, msgs: P.__msgs || [], qms, P, MKW, sr};
}
export {makeScope};
