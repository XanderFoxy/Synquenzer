// QA K1-03: MS 2000 vocoder programs: VOCODER QUELLE/INTENSITÄT (voc.msrc / voc.mint) modulate the formant shift
// in the engine (MkVoc.block: sSh = fs + 2 (cut + mint * src) / 63). Does the Mod-Übersicht list it? Is it audible?
import {launch, seedWorklet, renderIn, dbDiff} from './n5-k-blib.mjs';
const {b, p, errs} = await launch({});
await seedWorklet(p);
const info = await p.evaluate(async () => {
  mkLoad(); for (let i = 0; i < 60 && !mkLoaded(); i++) await new Promise(r => setTimeout(r, 100));
  const voc = [];
  for (const [id, f] of FACTORY_BY_ID) if (f.engine === 'mk') { const s = factorySound(id); if (s.p.mk.mode === 3) voc.push([id, s.name, s.p.mk.voc.msrc, s.p.mk.voc.mint]); }
  const pick = voc.find(v => v[3] !== 0);
  let mods = null, sound = null;
  if (pick) { loadPreset(2, pick[0]); mods = SYNQUENZER.k1Mods(2); sound = deep(sndOf(2)); }
  return {nVoc: voc.length, withMint: voc.filter(v => v[3] !== 0).map(v => v.slice(0, 4)), pick, mods, sound};
});
console.log(JSON.stringify({nVoc: info.nVoc, withMint: info.withMint, pick: info.pick, k1Mods: info.mods}));
if (info.pick) {
  // a vowel signal into both inputs (the vocoder's modulator), one held chord on the carrier
  const vow = await p.evaluate(() => Array.from(MKUI.mkVowel({f0: 110, v: ['a', 'e', 'i', 'o', 'u'], seg: .5, sec: 3, sr: 48000, rms: -20, vib: 0})));
  const ev = [[0.05, 'on', 57, .8, 'a'], [0.05, 'on', 64, .8, 'b'], [2.8, 'off', 57, .8, 'a'], [2.8, 'off', 64, .8, 'b']];
  const o = {sec: 3, seed: 1, inputs: {e1: vow, e2: vow}};
  const a1 = await renderIn(p, info.sound, ev, o);
  const a2 = await renderIn(p, info.sound, ev, o);
  const z = JSON.parse(JSON.stringify(info.sound)); z.p.mk.voc.mint = 0;
  const c1 = await renderIn(p, z, ev, o);
  let rms = 0; for (const v of a1) rms += v * v; rms = 10 * Math.log10(rms / a1.length + 1e-30);
  console.log(JSON.stringify({rmsDb: +rms.toFixed(1), sameTwice: +dbDiff(a1, a2).toFixed(1), mintVsZero: +dbDiff(c1, a1).toFixed(1)}));
}
console.log('errs', errs);
await b.close();
