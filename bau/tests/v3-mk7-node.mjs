// MK7 Node harness: v3-mk1-node.mjs with inputs (E1, E2) per quantum. render(pmk, events, o): o.inputs {e1?, e2?} Float32Array
import {makeScope, mkDefaults} from './v3-mk1-node.mjs';
export const FILE = process.env.MK_FILE || new URL('../mk-br-MK7/index.html', import.meta.url).pathname;
export function vocP(over, t0) {
  const p = mkDefaults(); p.mode = 3;
  p.voc = Object.assign({gs: 0, th: 0, hpl: 0, hpg: 1, ins: 0, fs: 0, cut: 0, res: 0, msrc: 1, mint: 0, efs: 64, hold: null, lvl: 127, dir: 0, dist: 0, vel: 0, kbd: 0,
    chl: new Array(16).fill(127), chp: new Array(16).fill(0)}, over || {});
  const t = p.t[0]; for (const k in t0 || {}) { if (typeof t0[k] === 'object' && t0[k] && !Array.isArray(t0[k])) Object.assign(t[k], t0[k]); else t[k] = t0[k]; }
  return p;
}
export function render(pmk, events, o) {
  o = o || {}; const sr = o.sr || 48000, sec = o.sec || 1, N = Math.round(sec * sr / 128) * 128;
  const {G, procs, MKW} = makeScope(sr, o.file || FILE);
  const flat = Object.assign({eng: o.eng == null ? 3 : o.eng}, o.flat || {});
  const P = new procs['dirigent-analog']({processorOptions: {patch: flat, mods: o.mods || [], mk: pmk}});
  P.onMsg({tempo: {bpm: o.bpm || 120, start: null}}); P.onMsg({mkSeed: o.seed == null ? 1 : o.seed});
  if (o.mw0 != null) P.onMsg({mkWheel: {mw0: o.mw0}});
  if (o.tap) P.onMsg({mkTap: o.tap});
  const ev = []; let id = 1; const ids = {};
  for (const e of events || []) {
    if (e[1] === 'on') { const k = e[4] != null ? e[4] : e[2]; ids[k] = id++; ev.push([e[0], 1, ids[k], e[2], e[3] == null ? .8 : e[3], -1]); }
    else if (e[1] === 'off') { const k = e[4] != null ? e[4] : e[2]; ev.push([e[0], 2, ids[k]]); }
  }
  P.onMsg({ev});
  const at = (o.at || []).slice().sort((a, b) => a[0] - b[0]);
  const l = new Float32Array(N), r = new Float32Array(N), qms = [];
  const L = new Float32Array(128), R = new Float32Array(128), I = o.inputs || null, i1 = new Float32Array(128), i2 = new Float32Array(128);
  for (let f = 0; f < N; f += 128) {
    while (at.length && at[0][0] * sr <= f) P.onMsg(at.shift()[1]);
    G.currentFrame = f;
    let inp = [];
    if (I) { const ch = []; for (const [k, b] of [['e1', i1], ['e2', i2]]) { const x = I[k]; if (x) { b.fill(0); b.set(x.subarray(Math.min(f, x.length), Math.min(f + 128, x.length))); } ch.push(b); } inp = [I.e2 || I.e1 || I.both ? ch : []]; }
    const t0 = o.quantumMs ? performance.now() : 0;
    P.process(inp, [[L, R]]);
    if (o.quantumMs) qms.push(performance.now() - t0);
    l.set(L, f); r.set(R, f);
  }
  return {l, r, msgs: P.__msgs || [], qms, P, MKW, sr};
}
// helpers
export const sine = (f, sec, sr, a) => { const x = new Float32Array(Math.round(sec * sr)); for (let i = 0; i < x.length; i++) x[i] = (a == null ? .5 : a) * Math.sin(2 * Math.PI * f * i / sr); return x; };
export const noise = (sec, sr, a, seed) => { let s = seed || 7; const x = new Float32Array(Math.round(sec * sr)); for (let i = 0; i < x.length; i++) { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; x[i] = (a == null ? .5 : a) * (s / 2147483648 - 1); } return x; };
export const rms = (x, a, b) => { a = a || 0; b = b == null ? x.length : b; let s = 0; for (let i = a; i < b; i++) s += x[i] * x[i]; return Math.sqrt(s / Math.max(1, b - a)); };
export const db = v => 20 * Math.log10(Math.max(1e-12, v));
// band energy by FFT power in [f1, f2]
export function spectrum(x, a, n) {
  const N = n, re = new Float64Array(N), im = new Float64Array(N);
  for (let i = 0; i < N; i++) { const w = .42 - .5 * Math.cos(2 * Math.PI * i / (N - 1)) + .08 * Math.cos(4 * Math.PI * i / (N - 1)); re[i] = (x[a + i] || 0) * w; }
  for (let i = 1, j = 0; i < N; i++) { let b = N >> 1; for (; j & b; b >>= 1) j ^= b; j ^= b; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; } }
  for (let len = 2; len <= N; len <<= 1) { const h = len >> 1, ang = -2 * Math.PI / len; for (let i = 0; i < N; i += len) for (let k = 0; k < h; k++) { const c = Math.cos(ang * k), s = Math.sin(ang * k), u = i + k, v = u + h, tr = re[v] * c - im[v] * s, ti = re[v] * s + im[v] * c; re[v] = re[u] - tr; im[v] = im[u] - ti; re[u] += tr; im[u] += ti; } }
  const P = new Float64Array(N / 2); for (let k = 0; k < N / 2; k++) P[k] = re[k] * re[k] + im[k] * im[k]; return P;
}
export const bandE = (P, sr, N, f1, f2) => { let e = 0; for (let k = Math.max(1, Math.floor(f1 * N / sr)); k <= Math.min(P.length - 1, Math.ceil(f2 * N / sr)); k++) e += P[k]; return e; };
