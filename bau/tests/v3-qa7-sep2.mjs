import * as Q from './v3-qa7-lib.mjs';
const {SR, render, vocSnd, sine, noise, db, welch, bandE, R} = Q;
const br = await Q.launch(); const {page} = await Q.openApp(br);
const base = await Q.baseMk(page);
const C = k => R[k + 3], edge = (a, b) => Math.sqrt(a * b), reg = k => [edge(R[k + 2], R[k + 3]), edge(R[k + 3], R[k + 4])];
for (const k of [9, 10]) for (const seed of [3, 17, 99]) {
  const sec = 12, s = vocSnd(base, {fs: 0, cut: 0, res: 64, efs: 40, ins: 127}, {mix: {o1: 0, o2: 0, n: 0}});
  const out = await render(page, s, [], {sec, inputs: {e2: sine(C(k), sec, .5), e1: noise(sec, .3, seed)}});
  const N = 16384, P = welch(out.l, SR, sec * SR, N), Pr = welch(out.r, SR, sec * SR, N); for (let i = 0; i < P.length; i++) P[i] += Pr[i];
  const E = j => { const [a, b] = reg(j); return bandE(P, N, a, b); };
  console.log(`k ${k} seed ${seed}: k+3 ${db(Math.sqrt(E(k) / E(k + 3))).toFixed(2)} dB, k-3 ${db(Math.sqrt(E(k) / E(k - 3))).toFixed(2)} dB, k+1 ${db(Math.sqrt(E(k) / E(k + 1))).toFixed(2)}`);
}
await br.close();
