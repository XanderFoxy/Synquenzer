// QA MK4: echo of a played voice offline through the app worklet (mkRender)
import { open } from './v3-qa-mk4reg-pw.mjs';
const {b, p, errs} = await open({width: 390, height: 844});
const r = await p.evaluate(async () => { const Q = window.SYNQUENZER; Q.setEngine(0, 'mk'); await new Promise(r => setTimeout(r, 300));
  const s = JSON.parse(JSON.stringify(Q.getSound(0))); s.p.mk.dly = {type: 0, sync: 0, time: 110, note: 8, dep: 127};
  const out = {};
  for (const [name, ev] of [['voice', [[0, 'on', 57, .9], [.15, 'off', 57]]], ['voiceLate', [[.5, 'on', 57, .9], [.65, 'off', 57]]]]) {
    const x = await Q.mkRender(s, ev, {sec: 2});
    const rms = (a, t0, t1) => { let s2 = 0, n = 0; for (let i = Math.round(t0 * 48000); i < Math.round(t1 * 48000); i++) { s2 += a[i] * a[i]; n++; } return +(10 * Math.log10(s2 / n + 1e-30)).toFixed(1); };
    out[name] = [0, .1, .2, .3, .4, .5, .6, .7, .8, .9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9].map(t => t.toFixed(1) + ':' + rms(x.l, t, t + .1)).join(' ');
  }
  return out; });
console.log(JSON.stringify(r, null, 1), errs);
await b.close();
