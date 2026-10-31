// QA K1-03: FM FELD operator LFO sensitivities (lfoFm = LFO 1 -> OP pitch, lfoAm = LFO 1 -> OP level) act without a route:
// does the Mod-Übersicht list them? Is the modulation audible?
import {launch, seedWorklet, renderIn, freqZC} from './n5-k-blib.mjs';
const {b, p, errs} = await launch({});
await seedWorklet(p);
const sr = 48000;
const setup = await p.evaluate(async () => {
  const A = SYNQUENZER, t = 1;
  loadPreset(t, 'f-init-fm'); A.initSound(t);
  const before = {mods: A.k1Mods(t), routes: deep(sndOf(t).mods)};
  const x = A.fmxFromFm6(sndOf(t).p.fm6); x.ops[0].lfoFm = 127; x.ops[0].lfoAm = 0;
  A.setFmx(t, x);
  const s = sndOf(t);
  return {before, after: A.k1Mods(t), routes: deep(s.mods), lfoFm: s.p.fmx.ops.map(o => o.lfoFm), lfoAm: s.p.fmx.ops.map(o => o.lfoAm), pmd: s.p.fmx.pmd, l1rate: s.p.l1rate, l1shape: s.p.l1shape, sound: deep(s)};
});
console.log(JSON.stringify({before: setup.before, after: setup.after, routes: setup.routes, lfoFm: setup.lfoFm, pmd: setup.pmd, l1rate: setup.l1rate}));
// render one held note A3 (220 Hz) 2 s and track the pitch in 20 ms windows
const ev = [[0, 'on', 57, .8, 'n0'], [1.9, 'off', 57, .8, 'n0']];
const x = await renderIn(p, setup.sound, ev, {sec: 2, seed: 1});
const ct = []; for (let k = 0; k < 18; k++) { const i0 = Math.round((.1 + k * .1) * sr), i1 = i0 + Math.round(.05 * sr); const f = freqZC(x, sr, i0, i1); ct.push(+(1200 * Math.log2(f / 220)).toFixed(1)); }
// the same sound with lfoFm 0 for reference
const ref = JSON.parse(JSON.stringify(setup.sound)); ref.p.fmx.ops[0].lfoFm = 0;
const y = await renderIn(p, ref, ev, {sec: 2, seed: 1});
const ct0 = []; for (let k = 0; k < 18; k++) { const i0 = Math.round((.1 + k * .1) * sr), i1 = i0 + Math.round(.05 * sr); const f = freqZC(y, sr, i0, i1); ct0.push(+(1200 * Math.log2(f / 220)).toFixed(1)); }
console.log(JSON.stringify({centsWithLfoFm: ct, spread: +(Math.max(...ct) - Math.min(...ct)).toFixed(1), centsRef: ct0, spreadRef: +(Math.max(...ct0) - Math.min(...ct0)).toFixed(1)}));
// the MOD tab chip of LFO 1: does it move while a note holds?
const chip = await p.evaluate(async () => {
  const A = SYNQUENZER, t = 1; selectTrack(t); ED.tab = 'mod'; openEditor(); await new Promise(r => setTimeout(r, 300));
  A.keyOn(57); const vals = []; for (let k = 0; k < 12; k++) { await new Promise(r => setTimeout(r, 100)); const c = [...(ED.msrc || [])].find(c => c.dataset.src === 'lfo1'); vals.push(c ? c._b.style.transform : 'none'); }
  A.keyOff(57); return [...new Set(vals)];
});
console.log(JSON.stringify({lfo1ChipTransforms: chip}));
console.log('errs', errs);
await b.close();
