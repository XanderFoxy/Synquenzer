// QA K1: MS 2000 programs whose OSC 1 STEUER 2 (PWM / WFM = LFO 1 depth) is > 0: the LFO 1 moves the oscillator shape, audible,
// but the Mod-Übersicht has no row for it (nothing to tap / delete). Rendered with the stored STEUER 2 and with 0.
import {launch, renderIn, dbDiff} from './n5-k-blib.mjs';
const {b, p, errs} = await launch();
const sr = 48000;
const res = [];
for (const id of ['f-mk-e15', 'f-mk-a11', 'f-mk-k610', 'f-mk-e11']) {
  const s = await p.evaluate(async id => { mkLoad(); for (let i = 0; i < 80 && !mkLoaded(); i++) await new Promise(r => setTimeout(r, 100)); loadPreset(2, id); await new Promise(r => setTimeout(r, 50)); return SYNQUENZER.getSound(2); }, id);
  const list = await p.evaluate(() => SYNQUENZER.k1Mods(2).map(e => e.src + ' → ' + e.dst + ' ' + e.amt));
  const z = JSON.parse(JSON.stringify(s)); const k = s.p.mk.mode === 1 || s.p.mk.mode === 2 ? [0, 1] : [0]; for (const j of k) z.p.mk.t[j].o1.c2 = 0;
  const ev = [[0, 'on', 48, .8], [3.5, 'off', 48]];
  const x = await renderIn(p, s, ev, {sec: 4, seed: 1}), y = await renderIn(p, z, ev, {sec: 4, seed: 1});
  // spectral brightness wobble: zero-crossing rate per 50 ms window between 0.5 s and 3.4 s (the shape moves -> ZCR moves)
  const zcr = a => { const L = []; for (let t = .5; t < 3.4; t += .05) { let n = 0; const i0 = Math.round(t * sr), i1 = Math.round((t + .05) * sr); for (let i = i0 + 1; i < i1; i++) if ((a[i - 1] < 0) !== (a[i] < 0)) n++; L.push(n); } return L; };
  const sd = L => { const m = L.reduce((a, b) => a + b, 0) / L.length; return Math.sqrt(L.reduce((a, b) => a + (b - m) * (b - m), 0) / L.length); };
  res.push({id, name: s.name, o1: s.p.mk.t.slice(0, k.length).map(T => ({w: T.o1.w, c1: T.o1.c1, c2: T.o1.c2, l1f: T.l1.f})), list, diffDb: +dbDiff(y, x).toFixed(1), zcrSdStored: +sd(zcr(x)).toFixed(2), zcrSdC2zero: +sd(zcr(y)).toFixed(2)});
}
for (const r of res) console.log(JSON.stringify(r));
console.log('errors', JSON.stringify(errs.slice(0, 4)));
await b.close();
