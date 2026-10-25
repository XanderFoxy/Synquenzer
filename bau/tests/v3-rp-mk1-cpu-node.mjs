// Independent repro of MK1-24 (CPU AM voice vs VA voice), Node. Own loader: REAL global Math (not Object.create(Math)),
// one shared scope per process (like the browser's AudioWorkletGlobalScope), each run = own child process.
// Per processor: 3 s interleaved warm-up, then 60 rounds; each round renders 0.2 s per processor in random order,
// timed with hrtime; per processor the MEDIAN block time is used (robust against preemption by other load).
import fs from 'fs';
import {spawnSync} from 'child_process';
import {mkPatch} from './v3-mk1-node.mjs';
const FILE = process.env.MK_FILE || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-wt/index.html';
const SR = 48000;
if (process.argv[2] !== 'child') {
  const runs = +(process.env.R || 7), rows = [];
  for (let r = 0; r < runs; r++) {
    const o = spawnSync(process.execPath, [new URL(import.meta.url).pathname, 'child'], {encoding: 'utf8', env: process.env});
    const j = JSON.parse(o.stdout.trim().split('\n').pop()); rows.push(j); console.log('run', r, JSON.stringify(j));
  }
  const med = k => { const a = rows.map(x => +x[k]).sort((a, b) => a - b); return a[a.length >> 1]; };
  console.log('MEDIAN', JSON.stringify({am1: med('am1'), am4: med('am4'), am1noDist: med('am1noDist'), am4noDist: med('am4noDist'), va4: med('va4'), vaPctRT: med('vaPctRT')}));
  process.exit(0);
}
const s = fs.readFileSync(FILE, 'utf8'); const i = s.indexOf('id="sq-worklet-src">') + 'id="sq-worklet-src">'.length; const src = s.slice(i, s.indexOf('</script>', i));
const G = {currentFrame: 0}, procs = {};
class AWP { constructor() { this.port = {postMessage: () => {}, onmessage: null}; } }
globalThis.sampleRate = SR; globalThis.AudioWorkletProcessor = AWP; globalThis.registerProcessor = (n, c) => { procs[n] = c; }; globalThis.__G = G;
(0, eval)(src.replace(/currentFrame/g, '__G.currentFrame'));   // indirect eval: global scope, real Math, real performance
const base = {o1: {w: 0, c1: 30, c2: 40}, o2: {w: 1, mod: 2, semi: 7}, mix: {o1: 127, o2: 100, n: 40}, f: {type: 0, cut: 70, res: 100, eg: 30}, a: {dist: 1}, vib: 20};
const AMP = mkPatch(base), AMND = mkPatch(Object.assign({}, base, {a: {dist: 0}}));
const VA = {o1w: 0, o2w: 1, o3w: 0, o1lvl: 1, o2lvl: .8, o3lvl: .6, cutoff: 900, res: .6, poly: 8};
const mk = (eng, flat, pmk, n) => { const P = new procs['dirigent-analog']({processorOptions: {patch: Object.assign({eng}, flat || {}), mods: [], mk: pmk}});
  P.onMsg({tempo: {bpm: 120, start: null}}); P.onMsg({mkSeed: 1}); if (eng === 3) P.onMsg({mkWheel: {mw0: .5}});
  P.onMsg({ev: [36, 43, 48, 52].slice(0, n).map((x, k) => [0, 1, k + 1, x, .8, -1])}); return P; };
// e2 default sustain 127: notes hold for the whole run (checked below by the voice count)
const P = {amS: mk(3, null, AMP, 0), am1: mk(3, null, AMP, 1), am4: mk(3, null, AMP, 4), amNS: mk(3, null, AMND, 0), amN1: mk(3, null, AMND, 1), amN4: mk(3, null, AMND, 4),
  vaS: mk(0, VA, null, 0), va1: mk(0, VA, null, 1), va4: mk(0, VA, null, 4)};
const ks = Object.keys(P), L = new Float32Array(128), R = new Float32Array(128), fr = {}; for (const k of ks) fr[k] = 0;
const step = k => { G.currentFrame = fr[k]; P[k].process([], [[L, R]]); fr[k] += 128; };
for (let f = 0; f < Math.round(3 * SR / 128); f++) for (const k of ks) step(k);
const BQ = Math.round(.2 * SR / 128), T = {}; for (const k of ks) T[k] = [];
let sink = 0;
for (let r = 0; r < 60; r++) {
  const ord = ks.slice().sort(() => Math.random() - .5);
  for (const k of ord) { const t0 = process.hrtime.bigint(); for (let q = 0; q < BQ; q++) { step(k); sink += L[5]; } T[k].push(Number(process.hrtime.bigint() - t0) / 1e6); }
}
const md = a => { a = a.slice().sort((x, y) => x - y); return a[a.length >> 1]; };
const m = {}; for (const k of ks) m[k] = md(T[k]);
const nv = k => { let n = P[k].mk.count(); for (const v of P[k].V) if (v.on) n++; return n; };
const va1 = m.va1 - m.vaS;
console.log(JSON.stringify({am1: ((m.am1 - m.amS) / va1).toFixed(2), am4: ((m.am4 - m.amS) / va1).toFixed(2), am1noDist: ((m.amN1 - m.amNS) / va1).toFixed(2), am4noDist: ((m.amN4 - m.amNS) / va1).toFixed(2),
  va4: ((m.va4 - m.vaS) / va1).toFixed(2), vaPctRT: (va1 / (BQ * 128 / SR * 1000) * 100).toFixed(2), voices: ks.map(k => k + ':' + nv(k)).join(','), sink: isFinite(sink)}));
