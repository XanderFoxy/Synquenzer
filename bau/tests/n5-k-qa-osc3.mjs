// QA K1-01 as a musician: Osz 3 Anteil 0 -> 100 % against Osz 2 Anteil 0 -> 100 % in INIT and some factory sounds (change in dB of the mix)
import {launch, renderIn, dbDiff} from './n5-k-blib.mjs';
const {b, p, errs} = await launch();
const ev = [[0, 'on', 48, .8], [0, 'on', 55, .8], [0, 'on', 60, .8], [1.4, 'off', 48], [1.4, 'off', 55], [1.4, 'off', 60]];
const rms = x => { let s = 0; for (let i = 4800; i < 60000; i++) s += x[i] * x[i]; return 10 * Math.log10(s / 55200 + 1e-20); };
for (const id of ['f-init-analog', 'f-moog-bass', 'f-mini-lead', 'f-juno-pad', 'f-ob-brass']) {
  const s = await p.evaluate(id => { loadPreset(0, id); return SYNQUENZER.getSound(0); }, id);
  const v = (k, val) => { const z = JSON.parse(JSON.stringify(s)); z.p[k] = val; return z; };
  const base = await renderIn(p, v('o3lvl', 0), ev, {sec: 1.6, seed: 1});
  const o3 = await renderIn(p, v('o3lvl', 1), ev, {sec: 1.6, seed: 1});
  const zb = JSON.parse(JSON.stringify(s)); zb.p.o2lvl = 0; zb.p.o3lvl = 0; const b2 = await renderIn(p, zb, ev, {sec: 1.6, seed: 1}); zb.p.o2lvl = 1; const o2 = await renderIn(p, zb, ev, {sec: 1.6, seed: 1});
  console.log(id.padEnd(16), 'o1/o2/o3 lvl', [s.p.o1lvl, s.p.o2lvl, s.p.o3lvl].join('/'), 'o3 w/oct', s.p.o3w, s.p.o3oct, '| Osz 3 0->100 %: change', dbDiff(o3, base).toFixed(1), 'dB, level', (rms(o3) - rms(base)).toFixed(1), 'dB | Osz 2 0->100 %: change', dbDiff(o2, b2).toFixed(1), 'dB, level', (rms(o2) - rms(b2)).toFixed(1), 'dB');
}
console.log('errors', JSON.stringify(errs.slice(0, 3)));
await b.close();
