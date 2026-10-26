// QA regression MK6: offline render (app worklet via SYNQUENZER.mkRender) of identical sounds in base 4.12.0 and new 4.14.0
// with the sequencer off (sounds made in base, so no seq block): must be bit-identical (spec MK6-10 neutral case)
import { open } from './v3-qa-mk7reg-pw.mjs';
import fs from 'fs';
const S = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/';
const BASE = S + 'mk6-base-4.12.0.html', APP = S + 'mk-br-MK7/index.html';
// 1) make sounds in base
const {b: b0, p: p0} = await open({width: 390, height: 844}, BASE);
const sounds = await p0.evaluate(async () => { const Q = window.SYNQUENZER, out = [];
  let seed = 12345; Math.random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  Q.newProject({init: true});
  for (const e of ['analog', 'fm6', 'wt']) { Q.setEngine(0, e); out.push(['eng-' + e, Q.getSound(0)]); }
  Q.setEngine(0, 'mk'); out.push(['mk-init', Q.getSound(0)]);
  for (let k = 0; k < 8; k++) { Q.selectTrack(0); window.MKUI.randomize(0); const s = Q.getSound(0);
    if (k % 2) { s.p.mk.t[0].p[0] = {s: 4, d: 3, i: 40}; }   // patch: LFO? -> some target
    if (k % 3 === 0) { s.p.mk.mfx = Object.assign({}, s.p.mk.mfx || {}, {type: 1, depth: 80}); s.p.mk.dly = Object.assign({}, s.p.mk.dly || {}, {depth: 70, time: 40}); }
    if (k === 5) { s.p.mk.mode = 1; }   // split/layer, if supported
    out.push(['mk-rnd' + k, s]); }
  return out; });
await b0.close();
const ev = [[0.05, 'on', 57, .9], [0.3, 'on', 64, .7], [0.55, 'on', 69, .8], [1.0, 'off', 57], [1.1, 'off', 64], [1.2, 'off', 69], [1.3, 'on', 45, 1], [1.8, 'off', 45]];
const render = async file => { const {b, p, errs} = await open({width: 390, height: 844}, file);
  const r = await p.evaluate(async ([sounds, ev]) => { const Q = window.SYNQUENZER, out = {};
    for (const [k, s] of sounds) { try { const x = await Q.mkRender(s, ev, {sec: 2.2, seed: 7}); out[k] = [Array.from(x.l), Array.from(x.r)]; } catch (e) { out[k] = String(e); } }
    return out; }, [sounds, ev]);
  await b.close(); return {r, errs}; };
const A = await render(BASE), B = await render(APP);
for (const [k] of sounds) {
  const a = A.r[k], b = B.r[k];
  if (typeof a === 'string' || typeof b === 'string') { console.log(k, 'ERR', a && a.slice ? String(a).slice(0, 80) : '', b && b.slice ? String(b).slice(0, 80) : ''); continue; }
  let d = 0, pk = 0, at = -1; for (let c = 0; c < 2; c++) for (let i = 0; i < a[c].length; i++) { const x = Math.abs(a[c][i] - b[c][i]); if (x > d) { d = x; at = i; } pk = Math.max(pk, Math.abs(a[c][i])); }
  console.log(k.padEnd(10), 'peak', pk.toFixed(3), 'max|Δ|', d.toExponential(2), d === 0 ? 'BITGLEICH' : 'DIFF at ' + at);
}
console.log('errs base', JSON.stringify(A.errs), 'new', JSON.stringify(B.errs));
