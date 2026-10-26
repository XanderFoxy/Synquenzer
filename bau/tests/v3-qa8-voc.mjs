import {launch, open} from './v3-qa8-lib.mjs';
const b = await launch(); const {page: p} = await open(b, 'P1');
const r = await p.evaluate(async () => { mkLoad(); const o = {}; for (let s = 9; s <= 14; s++) { const m = MKF.facRec(8, s).p.mk; o['H' + s] = {hold: m.voc.hold, fs: m.voc.fs, cut: m.voc.cut, res: m.voc.res}; } return o; });
for (const [k, v] of Object.entries(r)) { const h = v.hold, lo = h.slice(0, 6).reduce((a, b) => a + b, 0), hi = h.slice(10).reduce((a, b) => a + b, 0); console.log(k, 'fs', v.fs, 'hold', h.join(','), '| low6', lo, 'high6', hi, 'argmax', h.indexOf(Math.max(...h))); }
await b.close();
