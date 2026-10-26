import {launch, open} from './v3-qa8-lib.mjs';
const b = await launch(); const {page: p} = await open(b, 'P1');
const r = await p.evaluate(async () => { mkLoad(); await MKF.decodeAll(); const o = {};
  for (const [bk, s] of [[1, 11], [5, 9], [5, 11], [5, 15], [7, 4], [7, 6], [8, 2], [1, 3], [5, 3]]) { const rec = MKF.facRec(bk, s), m = rec.p.mk, t = m.t[0];
    o[MKF.label(bk, s)] = {p: t.p, vib: t.vib, l1: t.l1, l2: t.l2, o1: t.o1, mw: rec.p.mw, dly: m.dly, seq: t.seq.on, t1p: m.mode ? m.t[1].p : null, t1l: m.mode ? [m.t[1].l1, m.t[1].l2] : null}; }
  return o; });
for (const [k, v] of Object.entries(r)) console.log(k, JSON.stringify(v));
await b.close();
