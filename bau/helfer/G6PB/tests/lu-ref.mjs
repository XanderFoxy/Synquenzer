// unabhängige BS.1770-4-Messung (Prüf-Seite): K-Filter nach dem Kochbuch-Ansatz (Kuhschwanz + Hochpass, wie pyloudnorm), Gating 400 ms/75 %
function biq(fs, type, G, Q, fc) {
  const A = 10 ** (G / 40), w0 = 2 * Math.PI * fc / fs, al = Math.sin(w0) / (2 * Q), c = Math.cos(w0);
  if (type === 'shelf') { const b0 = A * ((A + 1) + (A - 1) * c + 2 * Math.sqrt(A) * al), b1 = -2 * A * ((A - 1) + (A + 1) * c), b2 = A * ((A + 1) + (A - 1) * c - 2 * Math.sqrt(A) * al), a0 = (A + 1) - (A - 1) * c + 2 * Math.sqrt(A) * al, a1 = 2 * ((A - 1) - (A + 1) * c), a2 = (A + 1) - (A - 1) * c - 2 * Math.sqrt(A) * al; return [[b0 / a0, b1 / a0, b2 / a0], [1, a1 / a0, a2 / a0]]; }
  const b0 = (1 + c) / 2, b1 = -(1 + c), b2 = (1 + c) / 2, a0 = 1 + al, a1 = -2 * c, a2 = 1 - al; return [[b0 / a0, b1 / a0, b2 / a0], [1, a1 / a0, a2 / a0]];
}
const filt = (x, [b, a]) => { const y = new Float64Array(x.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < x.length; i++) { const o = b[0] * x[i] + b[1] * x1 + b[2] * x2 - a[1] * y1 - a[2] * y2; x2 = x1; x1 = x[i]; y2 = y1; y1 = o; y[i] = o; } return y; };
export function lufsRef(chs, sr) {
  const S1 = biq(sr, 'shelf', 3.999843853973347, 0.7071752369554196, 1681.974450955533), S2 = biq(sr, 'hp', 0, 0.5003270373238773, 38.13547087602444);
  const z = chs.map(x => filt(filt(Float64Array.from(x), S1), S2)), n = z[0].length, B = Math.round(.4 * sr), St = Math.round(.1 * sr), bl = [];
  for (let s = 0; s + B <= n; s += St) { let e = 0; for (const c of z) { let q = 0; for (let i = s; i < s + B; i++) q += c[i] * c[i]; e += q / B; } bl.push(e); }
  const L = e => -0.691 + 10 * Math.log10(e), g1 = bl.filter(e => L(e) > -70), m1 = g1.reduce((a, b) => a + b, 0) / g1.length, g2 = g1.filter(e => L(e) > L(m1) - 10);
  return L(g2.reduce((a, b) => a + b, 0) / g2.length);
}
