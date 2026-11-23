/* KE2-BEGIN Welle aus dem Anschlag: die hellsten Rahmen kurz nach dem Einsatz (Filter noch offen) mit kurzem Fenster messen; je Quell-Hypothese zählt der Fehler dort mit */
function ke2Frames(x, f0, K, on, L5) {
const N = Math.min(4096, Math.max(1024, nextPow2(3 * SR / f0))), w = hann(N), re = new Float64Array(N), im = new Float64Array(N), sp = f0 * N / SR, s0 = on * L5, fr = [];
for (let s = s0; s <= s0 + Math.round(.18 * SR) && s + N <= x.length; s += Math.round(.005 * SR)) {
for (let i = 0; i < N; i++) { re[i] = x[s + i] * w[i]; im[i] = 0; } fft(re, im);
const m = new Float64Array(K + 1), fl = new Float64Array(K + 1), g = new Float64Array(K + 1); let mx = -1e9, pw = 0, cen = 0;
for (let k = 1; k <= K; k++) { const c = k * sp, r = Math.min(.35 * sp, Math.max(1.5, .03 * c)), p = peakIn(re, im, c - r, c + r, N, 4 / N); m[k] = dB(p.a * p.a); if (m[k] > mx) mx = m[k]; pw += p.a * p.a; cen += k * p.a * p.a;
const g0 = Math.round((k + .35) * sp), g1 = Math.max(g0, Math.round((k + .65) * sp)), v = []; for (let i = g0; i <= g1 && i < N / 2; i++) v.push((re[i] * re[i] + im[i] * im[i]) * 16 / (N * N)); v.sort((a, b) => a - b); g[k] = v.length ? v[v.length >> 1] : 0; }
for (let k = 1; k <= K; k++) fl[k] = Math.max(mx - 65, dB(k > 1 ? Math.min(g[k], g[k - 1]) : g[k]) + 6);
fr.push({M: {m, fl}, pw, cen: cen / Math.max(1e-30, pw)});
}
if (fr.length < 2) return [];
const pmx = Math.max(...fr.map(f => f.pw)); return fr.filter(f => f.pw > .1 * pmx).sort((a, b) => b.cen - a.cen).slice(0, 3).map(f => f.M);
}
function ke2Add(list, sel, frameErr, nFC) {
const lam = typeof globalThis.__KE2L === 'number' ? globalThis.__KE2L : 6; if (!(lam > 0) || !sel.length) return;
const ft = (m, lo) => { const v = k => Math.max(m[k], lo(k)); const ev = [2, 4].map(k => Math.max(-30, v(k) - .5 * (v(k - 1) + v(k + 1)))), cu = Math.max(-20, Math.min(40, v(1) - 2 * v(3) + v(5))); return [ev[0], ev[1], cu]; };
const ok = sel.filter(M => M.m.length > 6), F = ok.map(M => ft(M.m, k => M.fl[k]));
if (!F.length) return;
for (const s of list) { const P = ft(s.sPdb, () => -1e9); let e = 0; for (const f of F) for (let i = 0; i < 3; i++) e += ((f[i] - P[i]) / 6) ** 2; s.score += lam * e / F.length / 3; }
}
/* KE2-END */
