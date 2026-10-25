// polyphase IIR halfband design (elliptic, after the published HIIR algorithm) + measured response of the 2x decimator
function design(nc, tbw) {
  let k = Math.tan((1 - tbw * 2) * Math.PI / 4); k *= k;
  const kk = Math.pow(1 - k * k, .25), e = .5 * (1 - kk) / (1 + kk), e2 = e * e, e4 = e2 * e2;
  const q = e * (1 + e4 * (2 + e4 * (15 + 150 * e4))), order = nc * 2 + 1, c = [];
  for (let i = 0; i < nc; i++) { const cc = i + 1;
    let num = 0, j = 1, ii = 0, t; do { t = Math.pow(q, ii * (ii + 1)) * Math.sin((ii * 2 + 1) * cc * Math.PI / order) * j; num += t; j = -j; ii++; } while (Math.abs(t) > 1e-100);
    let den = 0; j = -1; ii = 1; do { t = Math.pow(q, ii * ii) * Math.cos(ii * 2 * cc * Math.PI / order) * j; den += t; j = -j; ii++; } while (Math.abs(t) > 1e-100);
    num *= Math.pow(q, .25); den += .5; const ww = num / den, w2 = ww * ww, x = Math.sqrt((1 - w2 * k) * (1 - w2 / k)) / (1 + w2); c.push((1 - x) / (1 + x)); }
  return c;
}
export function makeDec(c) {
  const n = c.length, xm = new Float64Array(n), ym = new Float64Array(n);
  return (a, b) => { // a = earlier sample, b = later
    let s0 = b, s1 = a;
    for (let i = 0; i < n; i += 2) { const t0 = s0; s0 = (s0 - ym[i]) * c[i] + xm[i]; xm[i] = t0; ym[i] = s0;
      if (i + 1 < n) { const t1 = s1; s1 = (s1 - ym[i + 1]) * c[i + 1] + xm[i + 1]; xm[i + 1] = t1; ym[i + 1] = s1; } }
    return .5 * (s0 + s1);
  };
}
function resp(c, f) { // f in Hz at 96k: steady-state amplitude
  const d = makeDec(c), N = 96000; let re = 0, im = 0, m = 0;
  for (let j = 0; j < N / 2; j++) { const y = d(Math.sin(2 * Math.PI * f * 2 * j / 96000), Math.sin(2 * Math.PI * f * (2 * j + 1) / 96000)); if (j > 4000) { re += y * Math.cos(2 * Math.PI * f * 2 * j / 96000); im += y * Math.sin(2 * Math.PI * f * 2 * j / 96000); m++; } }
  return 20 * Math.log10(2 * Math.hypot(re, im) / m);
}
if (process.argv[1].endsWith('v3-mkfix-hiir.mjs')) {
  for (const [nc, tbw] of [[6, .08], [8, .08], [8, .1], [10, .08], [8, .06], [6, .1], [7, .08]]) {
    const c = design(nc, tbw); const fs = [1000, 10000, 15000, 18000, 19000, 20000, 22000, 26000, 28000, 30000, 34000, 38000, 42000, 46000];
    console.log(nc, tbw, fs.map(f => (f / 1000) + 'k:' + resp(c, f).toFixed(f < 24000 ? 3 : 0)).join(' '));
    console.log('   c=', JSON.stringify(c.map(x => +x.toPrecision(17))));
  }
}
export {design};
