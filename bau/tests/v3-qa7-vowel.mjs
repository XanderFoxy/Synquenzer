import * as Q from './v3-qa7-lib.mjs';
const {SR, spectrum, ok} = Q;
const br = await Q.launch(); const {page, errs} = await Q.openApp(br);
const VOW = {a: [730, 1090, 2440, 3400], e: [530, 1840, 2480, 3500], i: [270, 2290, 3010, 3700], o: [570, 840, 2410, 3300], u: [300, 870, 2240, 3300]};
const N = 8192, df = SR / N;
let worst = 0; const rows = [];
for (const f0 of [65.41, 130.81]) for (const v of 'aeiou') {
  const [x, raw] = await page.evaluate(([f0, v]) => [SYNQUENZER.mkVowel({f0, v: [v], sec: 6, sr: 48000, vib: 700, vibHz: 3}), SYNQUENZER.mkVowel({f0, v: [v], sec: 6, sr: 48000, vib: 700, vibHz: 3, raw: true})], [f0, v]);
  const X = Float32Array.from(x), Rw = Float32Array.from(raw);
  // max-hold of the output spectrum over frames (envelope through harmonic sweep) and of the ratio vowel/raw at harmonic bins
  const env = new Float64Array(N / 2), H = new Float64Array(N / 2);
  for (let s = SR; s + N < X.length; s += 1024) { const P = spectrum(X, s, N), Pr = spectrum(Rw, s, N); let mr = 0; for (let k = 0; k < N / 2; k++) mr = Math.max(mr, Pr[k]);
    for (let k = 1; k < N / 2; k++) { if (P[k] > env[k]) env[k] = P[k]; if (Pr[k] > mr * 1e-9 && P[k] / Pr[k] > H[k]) H[k] = P[k] / Pr[k]; } }
  const pk = (A, f) => { const S = new Float64Array(A.length); for (let k = 3; k < A.length - 3; k++) { let e = 0; for (let j = -3; j <= 3; j++) e += A[k + j]; S[k] = e; } let bf = 0, bd = 1e9; for (let k = Math.floor(f * .6 / df); k <= Math.ceil(f * 1.4 / df); k++) { if (S[k] > 0 && S[k] >= S[k - 1] && S[k] >= S[k + 1] && S[k] > S[k - 6] && S[k] > S[k + 6]) { const d = Math.abs(k * df - f); if (d < bd) { bd = d; bf = k * df; } } } return bf; };
  const F = VOW[v];
  const e1 = pk(env, F[0]), e2 = pk(env, F[1]), h1 = pk(H, F[0]), h2 = pk(H, F[1]);
  const er = [e1 / F[0] - 1, e2 / F[1] - 1, h1 / F[0] - 1, h2 / F[1] - 1].map(z => z * 100);
  worst = Math.max(worst, Math.abs(er[0]), Math.abs(er[1]));
  rows.push(`${f0} ${v}: Hülle F1 ${e1.toFixed(0)}/${F[0]} (${er[0].toFixed(1)} %) F2 ${e2.toFixed(0)}/${F[1]} (${er[1].toFixed(1)} %) · Filter F1 ${h1.toFixed(0)} (${er[2].toFixed(1)} %) F2 ${h2.toFixed(0)} (${er[3].toFixed(1)} %)`);
}
console.log(rows.join('\n'));
ok('MK7-16 F1/F2 der Spektralhülle ± 7 %', worst <= 7, 'max ' + worst.toFixed(1) + ' %');
Q.summary(); await br.close();
