// ITU-R BS.1770-4 integrated loudness (K-weighting like pyloudnorm), stereo
export function lufs(L, R, fs) {
  const biq = (b, a) => x => { const y = new Float64Array(x.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let n = 0; n < x.length; n++) { const v = b[0] * x[n] + b[1] * x1 + b[2] * x2 - a[1] * y1 - a[2] * y2; x2 = x1; x1 = x[n]; y2 = y1; y1 = v; y[n] = v; } return y; };
  const shelf = (() => { const G = 3.999843853973347, Q = 0.7071752369554196, fc = 1681.974450955533, A = Math.pow(10, G / 40), w0 = 2 * Math.PI * fc / fs, al = Math.sin(w0) / (2 * Q);
    const b0 = A * ((A + 1) + (A - 1) * Math.cos(w0) + 2 * Math.sqrt(A) * al), b1 = -2 * A * ((A - 1) + (A + 1) * Math.cos(w0)), b2 = A * ((A + 1) + (A - 1) * Math.cos(w0) - 2 * Math.sqrt(A) * al);
    const a0 = (A + 1) - (A - 1) * Math.cos(w0) + 2 * Math.sqrt(A) * al, a1 = 2 * ((A - 1) - (A + 1) * Math.cos(w0)), a2 = (A + 1) - (A - 1) * Math.cos(w0) - 2 * Math.sqrt(A) * al;
    return biq([b0 / a0, b1 / a0, b2 / a0], [1, a1 / a0, a2 / a0]); })();
  const hp = (() => { const Q = 0.5003270373238773, fc = 38.13547087602444, w0 = 2 * Math.PI * fc / fs, al = Math.sin(w0) / (2 * Q), c = Math.cos(w0);
    const b0 = (1 + c) / 2, b1 = -(1 + c), b2 = (1 + c) / 2, a0 = 1 + al, a1 = -2 * c, a2 = 1 - al; return biq([b0 / a0, b1 / a0, b2 / a0], [1, a1 / a0, a2 / a0]); })();
  const kL = hp(shelf(L)), kR = hp(shelf(R)), blk = Math.round(.4 * fs), hop = Math.round(.1 * fs), z = [];
  for (let s = 0; s + blk <= kL.length; s += hop) { let a = 0, b = 0; for (let n = s; n < s + blk; n++) { a += kL[n] * kL[n]; b += kR[n] * kR[n]; } z.push((a + b) / blk); }
  const ld = v => -0.691 + 10 * Math.log10(v);
  const g1 = z.filter(v => ld(v) > -70); if (!g1.length) return -Infinity;
  const rel = ld(g1.reduce((x, y) => x + y, 0) / g1.length) - 10;
  const g2 = g1.filter(v => ld(v) > rel); return ld(g2.reduce((x, y) => x + y, 0) / g2.length);
}
export function pcmOf(b64) { const buf = Buffer.from(b64, 'base64'), d = new Int16Array(buf.buffer, buf.byteOffset, buf.length / 2), n = d.length / 2, L = new Float64Array(n), R = new Float64Array(n); for (let k = 0; k < n; k++) { L[k] = d[2 * k] / 32767; R[k] = d[2 * k + 1] / 32767; } return {L, R}; }
