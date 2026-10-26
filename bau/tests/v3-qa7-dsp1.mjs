import * as Q from './v3-qa7-lib.mjs';
const {SR, render, vocSnd, sine, noise, rms, db, welch, bandE, R, ok} = Q;
const ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
const T = async (id, f) => { if (ONLY && !ONLY.test(id)) return; try { await f(); } catch (e) { ok(id, false, 'Fehler ' + String(e.stack || e).slice(0, 500)); } };
const br = await Q.launch(); const {page, errs} = await Q.openApp(br);
const base = await Q.baseMk(page);
const NZ = {mix: {o1: 0, o2: 0, n: 127}};
const C = k => R[k + 3];   // band k 1..16
const edge = (a, b) => Math.sqrt(a * b);
const reg = k => [edge(R[k + 2], R[k + 3]), edge(R[k + 3], R[k + 4])];
// MK7-01
await T('MK7-01', async () => {
  let minN1 = 1e9, minN3 = 1e9; const rows = [];
  for (let k = 1; k <= 16; k++) {
    const s = vocSnd(base, {fs: 0, cut: 0, res: 64, efs: 40}, NZ);
    const out = await render(page, s, [[0, 'on', 48, .8]], {sec: 2, inputs: {e2: sine(C(k), 2, .5)}});
    const N = 8192, P = welch(out.l, Math.round(.5 * SR), Math.round(2 * SR), N), Pr = welch(out.r, Math.round(.5 * SR), Math.round(2 * SR), N);
    for (let i = 0; i < P.length; i++) P[i] += Pr[i];
    const E = j => { const [a, b] = reg(j); return bandE(P, N, a, b); };
    const ek = E(k); const r = {k};
    for (const d of [-3, -1, 1, 3]) { const j = k + d; if (j < 1 || j > 16) continue; const v = db(Math.sqrt(ek / E(j))) ; r[d] = +v.toFixed(1); if (Math.abs(d) === 1) minN1 = Math.min(minN1, v); else minN3 = Math.min(minN3, v); }
    rows.push(r);
  }
  console.log(JSON.stringify(rows));
  ok('MK7-01 k±1 ≥ 12 dB', minN1 >= 12, 'min ' + minN1.toFixed(1));
  ok('MK7-01 k±3 ≥ 30 dB', minN3 >= 30, 'min ' + minN3.toFixed(1));
});
// MK7-02 band centres via transfer function: E1 white noise as carrier (ins 127), no voice, one band held open
async function bandPeak(voc, k, f1, f2, ev, t0) {
  const hold = new Array(16).fill(0); hold[k - 1] = 127;
  const s = vocSnd(base, Object.assign({ins: 127, res: 127, hold}, voc), Object.assign({mix: {o1: 0, o2: 0, n: 0}}, t0 || {}));
  const sec = 6, x = noise(sec, .3, 11 + k);
  const out = await render(page, s, ev || [], {sec, inputs: {e1: x}});
  // H = Sxy / Sxx (Welch), N = 32768
  const N = 32768, a = Math.round(.5 * SR), b = sec * SR; const Sxy = new Float64Array(N / 2), Syy = new Float64Array(N / 2), Sxx = new Float64Array(N / 2);
  const fft = (sig, s0) => { const re = new Float64Array(N), im = new Float64Array(N); for (let i = 0; i < N; i++) { const w = .5 - .5 * Math.cos(2 * Math.PI * i / (N - 1)); re[i] = (sig[s0 + i] || 0) * w; }
    for (let i = 1, j = 0; i < N; i++) { let bb = N >> 1; for (; j & bb; bb >>= 1) j ^= bb; j ^= bb; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
    for (let len = 2; len <= N; len <<= 1) { const h = len >> 1, ang = -2 * Math.PI / len; for (let i = 0; i < N; i += len) for (let q = 0; q < h; q++) { const c = Math.cos(ang * q), sn = Math.sin(ang * q), u = i + q, v = u + h, tr = re[v] * c - im[v] * sn, ti = re[v] * sn + im[v] * c; re[v] = re[u] - tr; im[v] = im[u] - ti; re[u] += tr; im[u] += ti; } }
    return [re, im]; };
  const H = new Float64Array(N / 2);
  for (let s0 = a; s0 + N <= b; s0 += N / 2) { const [xr, xi] = fft(x, s0), [yr, yi] = fft(out.l, s0), [zr, zi] = fft(out.r, s0);
    for (let q = 0; q < N / 2; q++) { Sxx[q] += xr[q] * xr[q] + xi[q] * xi[q]; Syy[q] += (yr[q] * yr[q] + yi[q] * yi[q]); } }
  for (let q = 0; q < N / 2; q++) H[q] = Syy[q] / Math.max(1e-30, Sxx[q]);
  // smooth over ±1 % and find max
  const df = SR / N; let best = 0, bf = 0; for (let f = f1; f <= f2; f *= 1.001) { let e = 0, c = 0; for (let q = Math.floor(f * .99 / df); q <= Math.ceil(f * 1.01 / df); q++) { e += H[q] || 0; c++; } e /= c; if (e > best) { best = e; bf = f; } }
  return bf;
}
await T('MK7-02', async () => {
  let worst = 0, info = [];
  const cases = [['FS0', {fs: 0}, 0], ['FS+1', {fs: 1}, 1], ['FS-2', {fs: -2}, -2], ['CUT+63', {cut: 63}, 2], ['CUT+32', {cut: 32}, 2 * 32 / 63]];
  for (const [nm, v, sh] of cases) {
    let w = 0;
    for (const k of [1, 4, 8, 12, 16]) {
      const want = Q.posHz(Math.max(0, Math.min(23, k + 3 + sh)));
      const got = await bandPeak(v, k, want / 1.5, want * 1.5);
      const e = Math.abs(got / want - 1) * 100; w = Math.max(w, e);
      if (e > (nm === 'CUT+32' ? 5 : 3)) info.push(nm + ' k' + k + ' ' + got.toFixed(1) + '/' + want.toFixed(1));
    }
    ok('MK7-02 ' + nm + ' Spitze', !info.filter(x => x.startsWith(nm + ' ')).length, 'max ' + w.toFixed(2) + ' %');
  }
  if (info.length) console.log(info.join('\n'));
  // FC-MOD EG2 +63 (sustain 127): +2 steps
  let w = 0, bad = [];
  for (const k of [2, 8, 14]) {
    const want = Q.posHz(Math.min(23, k + 3 + 2));
    const got = await bandPeak({msrc: 1, mint: 63}, k, want / 1.6, want * 1.6, [[0, 'on', 60, .8]]);
    const e = Math.abs(got / want - 1) * 100; w = Math.max(w, e); if (e > 3) bad.push('k' + k + ' ' + got.toFixed(1) + '/' + want.toFixed(1));
  }
  ok('MK7-02 FC-MOD EG2 +63 = +2 Stufen', !bad.length, 'max ' + w.toFixed(2) + ' % ' + bad.join(' '));
});
console.log('errs', errs.slice(0, 5));
Q.summary(); await br.close();
