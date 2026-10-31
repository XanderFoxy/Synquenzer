// QA K1-03 repro run 2: (a) FELD lfoFm/lfoAm at moderate values (DX PMS 1 = lfoFm 18, AMS 1 = lfoAm 42) via the UI-equivalent setFmx,
// (b) both vocoder programs with VOCODER INTENSITÄT, (c) all 22 vocoder programs: entries, (d) „±0 %“ amounts in the list
import {launch, seedWorklet, renderIn, dbDiff, freqZC} from './n5-k-blib.mjs';
const {b, p, errs} = await launch({});
await seedWorklet(p);
const sr = 48000;
// (a)
for (const [fm, am] of [[18, 0], [0, 127], [36, 42]]) {
  const s = await p.evaluate(([fm, am]) => { const A = SYNQUENZER, t = 1; loadPreset(t, 'f-init-fm'); A.initSound(t); const x = A.fmxFromFm6(sndOf(t).p.fm6); x.ops[0].lfoFm = fm; x.ops[0].lfoAm = am; A.setFmx(t, x);
    return {mods: A.k1Mods(t).length, ed: A.soundEdited(t), snd: deep(sndOf(t))}; }, [fm, am]);
  const ev = [[0, 'on', 57, .8, 'n'], [1.9, 'off', 57, .8, 'n']];
  const x = await renderIn(p, s.snd, ev, {sec: 2, seed: 1});
  const z = JSON.parse(JSON.stringify(s.snd)); z.p.fmx.ops[0].lfoFm = 0; z.p.fmx.ops[0].lfoAm = 0;
  const y = await renderIn(p, z, ev, {sec: 2, seed: 1});
  const ct = []; for (let k = 0; k < 18; k++) { const i0 = Math.round((.1 + k * .1) * sr); ct.push(1200 * Math.log2(freqZC(x, sr, i0, i0 + 2400) / 220)); }
  // level wobble in 20 ms RMS windows
  const lv = []; for (let k = 0; k < 80; k++) { let q = 0; for (let i = 0; i < 960; i++) { const v = x[Math.round(.2 * sr) + k * 960 + i]; q += v * v; } lv.push(10 * Math.log10(q / 960 + 1e-30)); }
  console.log(JSON.stringify({lfoFm: fm, lfoAm: am, overviewEntries: s.mods, pitchCents: [+Math.min(...ct).toFixed(1), +Math.max(...ct).toFixed(1)], levelDb: [+Math.min(...lv).toFixed(1), +Math.max(...lv).toFixed(1)], vsNoLfo: +dbDiff(y, x).toFixed(1)}));
}
// (b)(c)
const v = await p.evaluate(async () => {
  mkLoad(); for (let i = 0; i < 60 && !mkLoaded(); i++) await new Promise(r => setTimeout(r, 100));
  const out = [];
  for (const [id, f] of FACTORY_BY_ID) if (f.engine === 'mk') { const s = factorySound(id); if (s.p.mk.mode === 3) { loadPreset(2, id); out.push([id, s.name, s.p.mk.voc.msrc, s.p.mk.voc.mint, SYNQUENZER.k1Mods(2).map(e => e.src + ' → ' + e.dst)]); } }
  return out;
});
for (const o of v) if (o[3] || o[4].length) console.log('voc', JSON.stringify(o));
console.log('vocPrograms', v.length, 'withIntensity', v.filter(o => o[3]).length, 'withEntries', v.filter(o => o[4].length).length);
const vow = await p.evaluate(() => Array.from(MKUI.mkVowel({f0: 110, v: ['a', 'e', 'i', 'o', 'u'], seg: .5, sec: 3, sr: 48000, rms: -20, vib: 0})));
for (const id of v.filter(o => o[3]).map(o => o[0])) {
  const s = await p.evaluate(id => factorySound(id), id);
  const ev = [[0.05, 'on', 57, .8, 'a'], [2.8, 'off', 57, .8, 'a']], o = {sec: 3, seed: 1, inputs: {e1: vow, e2: vow}};
  const a = await renderIn(p, s, ev, o); const z = JSON.parse(JSON.stringify(s)); z.p.mk.voc.mint = 0; const c = await renderIn(p, z, ev, o);
  console.log(JSON.stringify({id, name: s.name, mint: s.p.mk.voc.mint, diffVsMint0: +dbDiff(c, a).toFixed(1)}));
}
// (d)
const z0 = await p.evaluate(() => { const out = []; for (const [id, f] of FACTORY_BY_ID) if (f.engine === 'analog' || f.engine === 'fm6') { loadPreset(2, id); for (const e of SYNQUENZER.k1Mods(2)) if (/^±0 %/.test(e.amt)) out.push([f.name, e.src + ' → ' + e.dst, e.amt]); } return out; });
console.log('zeroAmt', z0.length, JSON.stringify(z0.slice(0, 12)));
console.log('errs', errs);
await b.close();
