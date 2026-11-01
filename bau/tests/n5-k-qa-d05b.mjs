import {launch, seedWorklet, renderIn, freqZC} from './n5-k-blib.mjs';
const {b, p, errs} = await launch({});
await seedWorklet(p);
const s = await p.evaluate(async () => { mkLoad(); for (let i = 0; i < 60 && !mkLoaded(); i++) await new Promise(r => setTimeout(r, 100)); loadPreset(2, 'f-mk-d05'); SYNQUENZER.k1Del(2, 't.0.vib'); return SYNQUENZER.getSound(2); });
const sr = 48000, ev = [[0, 'on', 60, .8, 'n'], [1.8, 'off', 60, .8, 'n']];
// pitch by autocorrelation peak (period) per 50 ms window, parabolic refinement: independent of the wave shape
const pitchAC = (x, t0) => { const i0 = Math.round(t0 * sr), N = 2400; let best = -1, bl = 0; const lo = Math.round(sr / 300), hi = Math.round(sr / 200);
  const ac = l => { let q = 0; for (let i = 0; i < N; i++) q += x[i0 + i] * x[i0 + i + l]; return q; };
  for (let l = lo; l <= hi; l++) { const a = ac(l); if (a > best) { best = a; bl = l; } }
  const a = ac(bl - 1), c = ac(bl + 1), d = (a - c) / (2 * (a - 2 * best + c)); return 1200 * Math.log2(sr / (bl + d) / 261.63); };
const run = async (lab, fn) => { const z = JSON.parse(JSON.stringify(s)); fn(z.p.mk); const x = await renderIn(p, z, ev, {sec: 2, seed: 1}); const c = []; for (let t = .2; t < 1.5; t += .05) c.push(pitchAC(x, t)); console.log(lab, JSON.stringify([+Math.min(...c).toFixed(2), +Math.max(...c).toFixed(2)])); };
await run('as is (AC)', () => {});
await run('wave 4, filter open, fx off', m => { const T = m.t[0]; T.f.cut = 127; T.f.res = 0; T.f.eg = 0; m.mfx.dep = 0; m.dly.dep = 0; });
await run('saw, filter as is', m => { m.t[0].o1 = {w: 0, c1: 0, c2: 0}; });
console.log('errs', errs);
await b.close();
