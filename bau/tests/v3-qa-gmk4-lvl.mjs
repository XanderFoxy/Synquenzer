// loudness of the program effects on a sustained chord (pad-like) via mkRender (app worklet offline)
import {open, sleep} from './v3-qa-gmk4-tl.mjs';
const T = await open({viewport: {width: 428, height: 926}}); const {E, errs} = T;
const r = await E(async () => {
  const Q = SYNQUENZER; Q.setEngine(0, 'mk'); await new Promise(r => setTimeout(r, 500));
  const base = JSON.parse(JSON.stringify(Q.getSound(0)));
  const ev = [[0.05, 'on', 48, .8], [0.05, 'on', 55, .8], [0.05, 'on', 60, .8], [0.05, 'on', 64, .8], [2.5, 'off', 48], [2.5, 'off', 55], [2.5, 'off', 60], [2.5, 'off', 64]];
  const lv = async (f) => { const s = JSON.parse(JSON.stringify(base)); f(s.p.mk); const x = await Q.mkRender(s, ev, {sec: 2.6}); const sr = 48000; let a = 0, b = 0, n = 0; for (let i = Math.round(.5 * sr); i < Math.round(2.4 * sr); i++) { a += x.l[i] * x.l[i]; b += x.r[i] * x.r[i]; n++; } return [+(10 * Math.log10(a / n)).toFixed(2), +(10 * Math.log10(b / n)).toFixed(2)]; };
  const out = {dry: await lv(() => {})};
  for (const [nm, t] of [['cho', 0], ['ens', 1], ['pha', 2]]) for (const d of [40, 64, 100, 127]) out[nm + d] = await lv(m => { m.mfx.type = t; m.mfx.dep = d; });
  for (const d of [64, 127]) out['eq0dly' + d] = await lv(m => { m.dly.dep = d; m.dly.sync = 1; m.dly.note = 5; });
  return out;
});
console.log(JSON.stringify(r, null, 0)); console.log('errs', JSON.stringify(errs));
await T.br.close();
