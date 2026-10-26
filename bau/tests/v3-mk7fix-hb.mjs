// halfband polyphase IIR design check (hiir-style)
function design(nc, tbw) {
  let k = Math.tan((1 - tbw * 2) * Math.PI / 4); k *= k;
  const kks = Math.pow(1 - k * k, .25), e = .5 * (1 - kks) / (1 + kks), e2 = e * e, e4 = e2 * e2;
  const q = e * (1 + e4 * (2 + e4 * (15 + 150 * e4))), order = nc * 2 + 1, out = [];
  for (let idx = 0; idx < nc; idx++) {
    const c = idx + 1;
    let i = 0, j = 1, num = 0, t; do { t = Math.pow(q, i * (i + 1)) * Math.sin((i * 2 + 1) * c * Math.PI / order) * j; num += t; j = -j; i++; } while (Math.abs(t) > 1e-100);
    num *= Math.pow(q, .25);
    i = 1; j = -1; let den = 0; do { t = Math.pow(q, i * i) * Math.cos(i * 2 * c * Math.PI / order) * j; den += t; j = -j; i++; } while (Math.abs(t) > 1e-100);
    den += .5;
    const ww = num / den, wq = ww * ww, x = Math.sqrt((1 - wq * k) * (1 - wq / k)) / (1 + wq);
    out.push((1 - x) / (1 + x));
  }
  return out;
}
const sr = 48000;
for (const [nc, tbw] of [[4, .06], [6, .05], [6, .04], [8, .04], [8, .03]]) {
  const C = design(nc, tbw), A = C.filter((_, i) => i % 2 === 0), B = C.filter((_, i) => i % 2 === 1);
  // decimate a sine, measure gain
  const res = [];
  for (const f of [100, 1000, 5000, 8000, 9600, 10500, 12000, 13500, 15000, 20000]) {
    const N = 48000, sA = A.map(() => [0, 0]), sB = B.map(() => [0, 0]); let e = 0, cnt = 0;
    for (let n = 0; n < N; n += 2) {
      let a = Math.sin(2 * Math.PI * f * n / sr), b = Math.sin(2 * Math.PI * f * (n - 1) / sr);
      for (let i = 0; i < A.length; i++) { const s = sA[i], y = A[i] * (a - s[1]) + s[0]; s[0] = a; s[1] = y; a = y; }
      for (let i = 0; i < B.length; i++) { const s = sB[i], y = B[i] * (b - s[1]) + s[0]; s[0] = b; s[1] = y; b = y; }
      const y = .5 * (a + b); if (n > N / 2) { e += y * y; cnt++; }
    }
    res.push(f + ':' + (10 * Math.log10(e / cnt / .5)).toFixed(2));
  }
  console.log(nc, tbw, C.map(x => x.toFixed(6)).join(','), '\n  ', res.join(' '));
}
