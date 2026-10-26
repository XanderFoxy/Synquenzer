// E09 „der LFO2 gibt eine kleine Tonhöhen-Wellenbewegung“: pitch over time of a held note (autocorrelation per 50 ms) vs. the same with vib/LFO2 patch;
// G04 „das Echo bleibt ganz leise“: energy 0.3–1.5 s after a short note vs. with delay depth 40
import {launch, open} from './v3-qa8-lib.mjs';
const b = await launch(); const {page: p} = await open(b, 'P1');
const r = await p.evaluate(async () => { mkLoad(); await MKF.decodeAll();
  const f0s = x => { const sr = 48000, W = 4096, out = []; for (let a = 4800; a + W + 2000 < x.length; a += 2400) { let best = 0, bl = 0; for (let lag = 300; lag < 1600; lag++) { let s = 0; for (let i = 0; i < W; i += 2) s += x[a + i] * x[a + i + lag]; if (s > best) { best = s; bl = lag; } } out.push(+(sr / bl).toFixed(2)); } return out; };
  const snd = factorySound('f-mk-e09'); const x = await SYNQUENZER.mkRender(snd, [[0, 'on', 36, .8], [2.5, 'off', 36]], {sec: 2.6, seed: 1});
  const fa = f0s(x.l);
  const s2 = factorySound('f-mk-e09'); s2.p.mk.t[0].p[2].i = 6; s2.p.mk.t[0].l2.f = 70;   // what the text describes: LFO2 → pitch, small
  const y = await SYNQUENZER.mkRender(s2, [[0, 'on', 36, .8], [2.5, 'off', 36]], {sec: 2.6, seed: 1}); const fb = f0s(y.l);
  const span = a => +(Math.max(...a) - Math.min(...a)).toFixed(2);
  const g = factorySound('f-mk-g04'); const z = await SYNQUENZER.mkRender(g, [[0, 'on', 36, .8], [.15, 'off', 36]], {sec: 1.6, seed: 1});
  const g2 = factorySound('f-mk-g04'); g2.p.mk.dly.dep = 40; const z2 = await SYNQUENZER.mkRender(g2, [[0, 'on', 36, .8], [.15, 'off', 36]], {sec: 1.6, seed: 1});
  const e = (q, a, b) => { let s = 0; for (let i = Math.round(a * 48000); i < Math.round(b * 48000); i++) s += q.l[i] * q.l[i]; return +(10 * Math.log10(s / ((b - a) * 48000) + 1e-30)).toFixed(1); };
  return {e09: {f0span: span(fa), f0: fa.slice(0, 12), withLfo2span: span(fb)}, g04: {tail: e(z, .6, 1.5), tailWithDelay40: e(z2, .6, 1.5)}}; });
console.log(JSON.stringify(r));
await b.close();
