import * as Q from './v3-qa7-lib.mjs';
const {SR, render, vocSnd, sine, noise, db, welch, bandE, R, ok} = Q;
const br = await Q.launch(); const {page} = await Q.openApp(br);
const base = await Q.baseMk(page);
const C = k => R[k + 3], edge = (a, b) => Math.sqrt(a * b), reg = k => [edge(R[k + 2], R[k + 3]), edge(R[k + 3], R[k + 4])];
for (const [nm, t0, ins] of [['noise-voice', {mix: {o1: 0, o2: 0, n: 127}}, 0], ['E1-white', {mix: {o1: 0, o2: 0, n: 0}}, 127]]) {
  const rows = []; let m1 = 1e9, m3 = 1e9;
  for (let k = 1; k <= 16; k++) {
    const s = vocSnd(base, {fs: 0, cut: 0, res: 64, efs: 40, ins}, t0), sec = 5;
    const out = await render(page, s, ins ? [] : [[0, 'on', 48, .8]], {sec, inputs: {e2: sine(C(k), sec, .5), e1: ins ? noise(sec, .3, 5) : null}});
    const N = 16384, P = welch(out.l, Math.round(.5 * SR), sec * SR, N), Pr = welch(out.r, Math.round(.5 * SR), sec * SR, N);
    for (let i = 0; i < P.length; i++) P[i] += Pr[i];
    const E = j => { const [a, b] = reg(j); return bandE(P, N, a, b); };
    const r = {k};
    for (const d of [-3, -1, 1, 3]) { const j = k + d; if (j < 1 || j > 16) continue; const v = db(Math.sqrt(E(k) / E(j))); r[d] = +v.toFixed(2); if (Math.abs(d) === 1) m1 = Math.min(m1, v); else m3 = Math.min(m3, v); }
    rows.push(r);
  }
  console.log(nm, JSON.stringify(rows));
  ok('MK7-01 ' + nm + ' k±1 ≥ 12', m1 >= 12, m1.toFixed(2)); ok('MK7-01 ' + nm + ' k±3 ≥ 30', m3 >= 30, m3.toFixed(2));
}
Q.summary(); await br.close();
