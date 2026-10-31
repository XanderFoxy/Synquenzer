import {loadG4} from './dsp-node.mjs';
import * as M from '../../../vs-dsp/marks.mjs';
import {sylTake, db, rms, pct} from './sig.mjs';
const D = loadG4(), sr = 44100, {y: x, seg} = sylTake(sr), mk = M.detectMarks(x, sr);
const crest = y => seg.map(([a, b]) => { let pk = 0; for (let i = a; i < a + 0.01 * sr; i++) pk = Math.max(pk, Math.abs(y[i])); return 20 * Math.log10(pk + 1e-12) - db(rms(y, a + 0.03 * sr, b - 0.03 * sr)); });
const C0 = crest(x), P = {hp: 100, ds: 4, sy: 80, thr: -24, ra: 3, lo: -1, mid: -2, pre: 3};
for (const v of [{}, {ra: 1}, {lo: 0, mid: 0, pre: 0}, {ra: 1, lo: 0, mid: 0, pre: 0}, {ds: 0}]) { const y = D.render(x, sr, {...P, ...v}, mk).y, d = crest(y).map((c, k) => c - C0[k]); console.log(JSON.stringify(v), pct(d, .5).toFixed(2), pct(d.map(Math.abs), .9).toFixed(2)); }
