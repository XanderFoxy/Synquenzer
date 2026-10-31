import { open } from './lib.mjs';
import fs from 'fs';
const {b, p, errs} = await open();
const res = {};
// 1) a long held note (> 20 s) on the MS track
res.longNote = await p.evaluate(async () => {
  const A = SYNQUENZER; A.setBpm(60); A.setEngine(2, 'mk');
  const s = (k, v) => A.mkSet(2, 't.0.' + k, v); s('e2.a', 0); s('e2.s', 100); s('e2.r', 30); s('l1.ks', 1); s('l1.sync', 0);
  A.setClip(2, 0, {len: 8, notes: [{t: 0, d: 32, n: 48, v: .9}]});
  const lanes = []; for (let i = 0; i < NT(); i++) lanes.push([]); lanes[2] = [{bar: 0, slot: 0}];
  A.setSong({bars: 8, lanes, carrier: [], mel: {}, marks: []});
  await A.vvRender({});
  const notes = A.vv3Notes(2), out = {dur: VV.last.dur, notes};
  for (const t of [5, 19, 21, 25, 31]) { const q = A.vv3Probe(2, t, '16:9'); out['t' + t] = {e2: q && +q.e2.toFixed(3), cut: q && q.cut}; }
  return out;
});
// 2) Key Sync Timbre group with > 24 overlapping notes (held pad + 16ths)
res.manyNotes = await p.evaluate(async () => {
  const A = SYNQUENZER; A.setBpm(120);
  const N = [{t: 0, d: 15.9, n: 48, v: .9}]; for (let k = 0; k < 60; k++) N.push({t: k * .25, d: .2, n: 60 + (k % 5), v: .7});
  A.setClip(2, 0, {len: 4, notes: N});
  const lanes = []; for (let i = 0; i < NT(); i++) lanes.push([]); lanes[2] = [{bar: 0, slot: 0}];
  A.setSong({bars: 4, lanes, carrier: [], mel: {}, marks: []});
  await A.vvRender({});
  const out = {};
  for (const t of [2, 5, 7.5]) { const st = vvStateAt(VV.last, t); const ms = vv3MkState(2, t, st, VV.last); out['t' + t] = {from: ms.l1.from, ph: +ms.l1.ph.toFixed(3), phExpected: +vv3Frac(ms.l1.rate * (t - vv3Notes(VV.last, 2, 0.001, 1)[0].a)).toFixed(3), firstA: A.vv3Notes(2)[0].a}; }
  return out;
});
// 3) VA: mod KEY -> cutoff (worklet src KEY = (pitch - 60) / 24), LFO tempo sync + retrig
res.va = await p.evaluate(async () => {
  const A = SYNQUENZER; A.setBpm(120);
  A.setClip(0, 0, {len: 1, notes: [{t: 0, d: 3, n: 84, v: 1}]});
  const lanes = []; for (let i = 0; i < NT(); i++) lanes.push([]); lanes[0] = [{bar: 0, slot: 0}];
  A.setSong({bars: 2, lanes, carrier: [], mel: {}, marks: []});
  const snd = S.tracks[0].sound, keep = JSON.stringify(snd.mods), kp = {fenv: snd.p.fenv, kt: snd.p.kt, l1sync: snd.p.l1sync, l1retrig: snd.p.l1retrig, cutoff: snd.p.cutoff, l1fade: snd.p.l1fade};
  snd.mods = [{src: 'key', dst: 'cutoff', amt: .25}]; snd.p.fenv = 0; snd.p.kt = 0; snd.p.cutoff = 440; snd.p.l1sync = 1; snd.p.l1retrig = 1; snd.p.l1fade = 0;
  await A.vvRender({});
  const t = .3, vs = vv3VaState(0, t, VV.last), nv = vs.nv;
  const exp = 440 * Math.pow(2, (.25 * (nv.n - 60) / 24 * 120) / 12);
  const ex = {model: +vs.cutHz.toFixed(1), workletFormula: +Math.min(20000, exp).toFixed(1), note: nv.n,
    lfo: {modelPh: +vs.l1.ph.toFixed(3), workletPh_retrig: +vv3Frac(1 / (1 * .5) * (t - nv.a)).toFixed(3), noteA: nv.a}};
  snd.mods = JSON.parse(keep); Object.assign(snd.p, kp);
  return ex;
});
// 4) the project does not change around a video job
res.serialize = await p.evaluate(async () => {
  const A = SYNQUENZER; A.setBpm(120);
  A.setClip(2, 0, {len: 1, notes: [{t: 0, d: 2, n: 57, v: .9}]});
  const lanes = []; for (let i = 0; i < NT(); i++) lanes.push([]); lanes[2] = [{bar: 0, slot: 0}]; lanes[4] = [{bar: 0, slot: 0}];
  A.setSong({bars: 2, lanes, carrier: [], mel: {}, marks: []});
  const before = JSON.stringify(A.serialize());
  A.vvTest({opus: true, spur: 2});
  let x, err = null; try { x = await A.vvMake({fmt: '9:16', view: 'song'}); } catch (e) { err = String(e); }
  A.vvTest({});
  const after = JSON.stringify(A.serialize());
  let d = null; if (before !== after) { let k = 0; while (before[k] === after[k]) k++; d = {at: k, b: before.slice(k - 80, k + 80), a: after.slice(k - 80, k + 80)}; }
  return {same: before === after, len: before.length, err, dur: x && x.dur, diff: d};
});
res.errs = errs;
console.log(JSON.stringify(res, null, 1));
fs.writeFileSync(new URL('./out-c.json', import.meta.url), JSON.stringify(res, null, 1));
await b.close();
