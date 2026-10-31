// model vs engine (mkRender test taps): EG2 (amp tap), LFO2 with PATCH -> LFO2 FREQ, LFO1 Key Sync Timbre with legato notes
import { open } from './lib.mjs';
import fs from 'fs';
const {b, p, errs} = await open();
const res = {};
await p.evaluate(() => { SYNQUENZER.setBpm(120); SYNQUENZER.setEngine(2, 'mk'); });
const set = (o) => p.evaluate(o => { for (const k in o) SYNQUENZER.mkSet(2, 't.0.' + k, o[k]); }, o);
// --- EG2 via the amp tap
for (const [name, eg, N] of [
  ['A64 D64 S64 R64', {a: 64, d: 64, s: 64, r: 64}, [[.2, 1.6, 60]]],
  ['A100 (slow) off during attack', {a: 100, d: 40, s: 100, r: 80}, [[.2, .7, 60]]],
  ['A0 D90 S0 R30', {a: 0, d: 90, s: 0, r: 30}, [[.2, 2.5, 60]]],
]) {
  await set({'e2.a': eg.a, 'e2.d': eg.d, 'e2.s': eg.s, 'e2.r': eg.r, 'a.gate': 0, 'p.0.i': 0, 'p.1.i': 0, 'p.2.i': 0, 'p.3.i': 0});
  res['eg2 ' + name] = await p.evaluate(async N => {
    const snd = JSON.parse(JSON.stringify(S.tracks[2].sound)), sr = 48000, T = snd.p.mk.t[0];
    const ev = []; for (const [a, b, n] of N) ev.push([a, 'on', n, .8], [b, 'off', n]); ev.sort((x, y) => x[0] - y[0]);
    const out = await SYNQUENZER.mkRender(snd, ev, {tap: 'amp', sec: 4, sr, bpm: 120, songStart: 0});
    let worst = 0, at = null; const sm = [];
    for (let f = 0; f < 4 * 100; f++) { const t = f / 100, k = Math.round(t * sr), e = out.l[k], m = vv3MkEnv(T.e2, N[0][0], N[0][1], t); const d = Math.abs(e - m); if (d > worst) { worst = d; at = {t, engine: +e.toFixed(4), model: +m.toFixed(4)}; } if (f % 40 === 0) sm.push([t, +e.toFixed(3), +m.toFixed(3)]); }
    return {maxAbsErr: +worst.toFixed(4), at, sm};
  }, N);
}
// --- LFO2 with PATCH 1 (velocity) -> LFO2 FREQ (dest 7), saw, free; Key Sync off and Stimme
for (const ks of [0, 2]) {
  await set({'l2.w': 0, 'l2.sync': 0, 'l2.ks': ks, 'l2.f': 40, 'p.0.s': 4, 'p.0.d': 7, 'p.0.i': 63, 'e2.a': 0, 'e2.s': 127, 'e2.r': 10});
  res['lfo2 patch->freq ks' + ks] = await p.evaluate(async ks => {
    const snd = JSON.parse(JSON.stringify(S.tracks[2].sound)), sr = 48000, T = snd.p.mk.t[0];
    const out = await SYNQUENZER.mkRender(snd, [[.5, 'on', 60, .8], [3.5, 'off', 60]], {tap: 'lfo2', sec: 4, sr, bpm: 120, songStart: 0});
    const notes = [{a: .5, b: 3.5, n: 60, v: .8}], src = {t0: 0, bpm: 120};
    // engine phase from the saw value; compare rate by counting wraps between 1 s and 3 s
    let wrapsE = 0, prev = null; for (let k = sr; k < 3 * sr; k += 16) { const v = out.l[k]; if (prev != null && v < prev - .5) wrapsE++; prev = v; }
    let wrapsM = 0; prev = null; for (let k = sr; k < 3 * sr; k += 16) { const L = vv3MkLfo(T, 2, k / sr, src, notes, 120); if (prev != null && L.v < prev - .5) wrapsM++; prev = L.v; }
    const L = vv3MkLfo(T, 2, 2, src, notes, 120);
    return {modelRateHz: +L.rate.toFixed(3), engineWraps1to3s: wrapsE, modelWraps1to3s: wrapsM, engineHzApprox: wrapsE / 2, lfoHzBase: +MKW_().lfoHz(T.l2.f).toFixed(3), lfoHzWithPatch: +MKW_().lfoHz(Math.min(127, T.l2.f + 127 * .8)).toFixed(3)};
  }, ks);
}
// --- LFO1 Key Sync Timbre with legato notes (note off == next note on), saw 1 Hz
await set({'l1.w': 0, 'l1.sync': 0, 'l1.ks': 1, 'l1.f': 127 * Math.log2(20) / 10, 'p.0.i': 0, 'e2.a': 0, 'e2.s': 127, 'e2.r': 10});
res['lfo1 ks timbre legato'] = await p.evaluate(async () => {
  const snd = JSON.parse(JSON.stringify(S.tracks[2].sound)), sr = 48000, T = snd.p.mk.t[0];
  const N = [[.5, 1.3, 60], [1.3, 2.1, 62], [2.1, 3.0, 64]];
  const ev = []; for (const [a, b, n] of N) ev.push([b, 'off', n], [a, 'on', n, .8]); ev.sort((x, y) => x[0] - y[0]);
  const out = await SYNQUENZER.mkRender(snd, ev, {tap: 'lfo', sec: 3.5, sr, bpm: 120, songStart: 0});
  const notes = N.map(([a, b, n]) => ({a, b, n, v: .8})), r = [];
  for (const t of [1.0, 1.5, 1.9, 2.5, 2.9]) { const v = out.l[Math.round(t * sr)], phE = v >= 0 ? v / 2 : (v + 2) / 2, L = vv3MkLfo(T, 1, t, {t0: 0, bpm: 120}, notes.filter(x => x.a <= t), 120); r.push({t, engine: +phE.toFixed(3), model: +L.ph.toFixed(3), from: L.from}); }
  return r;
});
res.errs = errs;
console.log(JSON.stringify(res, null, 1));
fs.writeFileSync(new URL('./out-b.json', import.meta.url), JSON.stringify(res, null, 1));
await b.close();
