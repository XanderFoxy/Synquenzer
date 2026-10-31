// K1-06 CPU: the worklet of this build against 4.23.0 (Node, same patches): VA 8 voices, AM 4 voices + idle, per quantum
import {makeScope, mkPatch} from './v3-mk1-node.mjs';
import {INIT, FILE} from './n5-k-lib.mjs';
const BASE = process.env.K_BASE || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vs-base-B.html', sr = 48000;
function run(file, kind) {
  const {G, procs} = makeScope(sr, file);
  const P = kind === 'va' ? new procs['dirigent-analog']({processorOptions: {patch: Object.assign({}, INIT, {eng: 0, o2lvl: .7, o3lvl: .5, o1uni: 3, cutoff: 900, res: .5, analog: .15}), mods: [{src: 1, dst: 3, amt: .2}]}})
    : new procs['dirigent-analog']({processorOptions: {patch: {eng: 3}, mods: [], mk: mkPatch({mix: {o1: 127, o2: 100, n: 10}, f: {cut: 70, res: 60, eg: 30}})}});
  P.onMsg({tempo: {bpm: 120, start: null}});
  const ev = []; const nv = kind === 'va' ? 8 : 4; for (let k = 0; k < nv; k++) ev.push([0, 1, k + 1, 48 + k * 3, .8, -1]); ev.push([6, 5, 0]);   // 6 s on, then 2 s idle
  P.onMsg({ev});
  const L = new Float32Array(128), R = new Float32Array(128), N = Math.round(8 * sr / 128) * 128;
  // edits while idle and sounding (the K1 idle snap path): one set per 50 ms
  let t0 = performance.now(), on = 0, idle = 0;
  for (let f = 0, q = 0; f < N; f += 128, q++) {
    if (q % 19 === 0) P.onMsg(kind === 'va' ? {set: {cutoff: 500 + (q % 7) * 100}} : {mkSet: {'t.0.f.cut': 50 + (q % 7) * 5}});
    G.currentFrame = f; const a = performance.now(); P.process([], [[L, R]]); const d = performance.now() - a; if (f < 6 * sr) on += d; else idle += d;
  }
  return {on, idle};
}
const med = a => a.slice().sort((x, y) => x - y)[a.length >> 1];
const out = {};
for (const kind of ['va', 'mk']) {
  const A = [], B = [], Ai = [], Bi = [];
  for (let k = 0; k < 9; k++) { let a, b; if (k % 2) { b = run(BASE, kind); a = run(FILE, kind); } else { a = run(FILE, kind); b = run(BASE, kind); } /* alternating order (JIT warm-up) */ A.push(a.on); B.push(b.on); Ai.push(a.idle); Bi.push(b.idle); }
  out[kind] = {newMs: +med(A).toFixed(1), baseMs: +med(B).toFixed(1), ratio: +(med(A) / med(B)).toFixed(3), idleNew: +med(Ai).toFixed(2), idleBase: +med(Bi).toFixed(2)};
}
out.pass = out.va.ratio <= 1.03 && out.mk.ratio <= 1.03;
console.log(JSON.stringify(out));
