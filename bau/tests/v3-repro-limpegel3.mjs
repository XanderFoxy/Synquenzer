import * as Q from './v3-qa7-lib.mjs';
const {SR, render, rms, db} = Q;
const br = await Q.launch(); const {page, errs} = await Q.openApp(br);
const base = await Q.baseMk(page); const sec = 3;
const both = r => { const L = rms(r.l, 1.5 * SR, 3 * SR), R = rms(r.r, 1.5 * SR, 3 * SR); return db(Math.sqrt((L * L + R * R) / 2)); };
const pk = r => { let m = 0; for (const x of r.l) m = Math.max(m, Math.abs(x)); return db(m); };
const chord3 = [[0, 'on', 48, .8], [0, 'on', 52, .8], [0, 'on', 55, .8]];
for (const [nm, t0] of [['saw', {}], ['noise', {mix: {o1: 0, o2: 0, n: 127}}]]) for (const res of [0, 64, 127]) {
  const s = Q.vocSnd(base, {res, hold: new Array(16).fill(60)}, t0);
  const a = await render(page, s, chord3, {sec, at: [[1.0, {set: {mkLim: 1}}]]}), b = await render(page, s, chord3, {sec});
  console.log(`HOLD 60 (synthesis bank only) ${nm} C3-E3-G3 RESO ${res}: ${(both(a) - both(b)).toFixed(2)} dB (ref ${both(b).toFixed(1)} dBFS, peak ${pk(b).toFixed(1)}/${pk(a).toFixed(1)} dBFS)`);
}
console.log('errs', errs.slice(0, 3)); await br.close();
