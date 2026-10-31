// QA K1-03: Hauchlead (D05) after ✕ VIBRATO: where do the remaining 3,2 ct of the builder's measurement come from?
import {launch, seedWorklet, renderIn, freqZC} from './n5-k-blib.mjs';
const {b, p, errs} = await launch({});
await seedWorklet(p);
const s = await p.evaluate(async () => { mkLoad(); for (let i = 0; i < 60 && !mkLoaded(); i++) await new Promise(r => setTimeout(r, 100));
  loadPreset(2, 'f-mk-d05'); SYNQUENZER.k1Del(2, 't.0.vib'); return {snd: SYNQUENZER.getSound(2), list: SYNQUENZER.k1Mods(2).map(e => e.src + ' → ' + e.dst + ' [' + e.amt + ']'), t0: deep(sndOf(2).p.mk.t[0])}; });
console.log(JSON.stringify({list: s.list, mix: s.t0.mix, o1: s.t0.o1, o2: s.t0.o2, mfx: s.snd.p.mk.mfx}));
const sr = 48000, ev = [[0, 'on', 60, .8, 'n'], [1.8, 'off', 60, .8, 'n']];
const spread = x => { const f = []; for (let t = .2; t < 1.5; t += .05) f.push(1200 * Math.log2(freqZC(x, sr, Math.round(t * sr), Math.round((t + .05) * sr)) / 261.63)); return [+Math.min(...f).toFixed(2), +Math.max(...f).toFixed(2)]; };
const v = (fn) => { const z = JSON.parse(JSON.stringify(s.snd)); fn(z.p.mk); return z; };
console.log('as is', JSON.stringify(spread(await renderIn(p, s.snd, ev, {sec: 2, seed: 1}))));
console.log('noise 0', JSON.stringify(spread(await renderIn(p, v(m => { m.t[0].mix.n = 0; }), ev, {sec: 2, seed: 1}))));
console.log('noise 0, osc1 saw, osc2 0, mfx off, filter open', JSON.stringify(spread(await renderIn(p, v(m => { const T = m.t[0]; T.mix.n = 0; T.mix.o2 = 0; T.o1 = {w: 0, c1: 0, c2: 0}; T.f.cut = 127; T.f.res = 0; T.f.eg = 0; m.mfx.dep = 0; m.mfx.type = 0; m.dly.dep = 0; }), ev, {sec: 2, seed: 1}))));
console.log('errs', errs);
await b.close();
