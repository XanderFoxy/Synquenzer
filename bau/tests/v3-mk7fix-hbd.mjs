// group delay of down->up chain with the MK_VHB design (phase vs frequency)
function design(nc, tbw) {
  let k = Math.tan((1 - tbw * 2) * Math.PI / 4); k *= k;
  const kks = Math.pow(1 - k * k, .25), e = .5 * (1 - kks) / (1 + kks), e4 = e ** 4, q = e * (1 + e4 * (2 + e4 * (15 + 150 * e4))), ord = nc * 2 + 1, out = [];
  for (let c = 1; c <= nc; c++) { let i = 0, j = 1, num = 0, t; do { t = q ** (i * (i + 1)) * Math.sin((i * 2 + 1) * c * Math.PI / ord) * j; num += t; j = -j; i++; } while (Math.abs(t) > 1e-100);
    num *= q ** .25; let den = 0; i = 1; j = -1; do { t = q ** (i * i) * Math.cos(i * 2 * c * Math.PI / ord) * j; den += t; j = -j; i++; } while (Math.abs(t) > 1e-100);
    const w = num / (den + .5), w2 = w * w, x = Math.sqrt((1 - w2 * k) * (1 - w2 / k)) / (1 + w2); out.push((1 - x) / (1 + x)); }
  return out;
}
const tbw = +(process.argv[2] || .06), nc = +(process.argv[3] || 4), C = design(nc, tbw), sr = 48000;
const ap = (c, s, x) => { const y = c * (x - s[1]) + s[0]; s[0] = x; s[1] = y; return y; };
for (const f of [100, 300, 1000, 2000, 3000, 5000, 7000, 9000]) {
  const N = 48000; const x = new Float64Array(N); for (let n = 0; n < N; n++) x[n] = Math.sin(2 * Math.PI * f * n / sr);
  const SA = C.map(() => [0, 0]), SB = C.map(() => [0, 0]), UA = C.map(() => [0, 0]), UB = C.map(() => [0, 0]), y = new Float64Array(N);
  for (let n = 0; n < N; n += 2) {
    let a = x[n + 1], b = x[n]; for (let i = 0; i < nc; i += 2) a = ap(C[i], SA[i], a); for (let i = 1; i < nc; i += 2) b = ap(C[i], SB[i], b);
    const h = .5 * (a + b); let p = h, q = h; for (let i = 0; i < nc; i += 2) p = ap(C[i], UA[i], p); for (let i = 1; i < nc; i += 2) q = ap(C[i], UB[i], q);
    y[n] = p; y[n + 1] = q;
  }
  // phase via correlation with sin/cos
  let sc = 0, ss = 0, xc = 0, xs = 0; for (let n = N / 2; n < N; n++) { const c = Math.cos(2 * Math.PI * f * n / sr), s = Math.sin(2 * Math.PI * f * n / sr); sc += y[n] * c; ss += y[n] * s; xc += x[n] * c; xs += x[n] * s; }
  let d = Math.atan2(xc, xs) - Math.atan2(sc, ss); while (d < 0) d += 2 * Math.PI; const gain = Math.hypot(sc, ss) / Math.hypot(xc, xs);
  console.log(f, 'delay samples', (d / (2 * Math.PI * f / sr)).toFixed(3), 'gain', gain.toFixed(4));
}
