// unabhängige BS.1770-4-Messung (Prüf-Seite): K-Filter mit den Beiwerten der Norm-Tabelle (48 kHz); andere Raten werden vorher mit
// gefenstertem Sinc auf 48 kHz umgerechnet (also ein anderer Weg als die App, die Beiwerte je Rate berechnet). Gating 400 ms / 75 %.
const T = [[[1.53512485958697, -2.69169618940638, 1.19839281085285], [1, -1.69065929318241, 0.73248077421585]], [[1, -2, 1], [1, -1.99004745483398, 0.99007225036621]]];
const filt = (x, [b, a]) => { const y = new Float64Array(x.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < x.length; i++) { const o = b[0] * x[i] + b[1] * x1 + b[2] * x2 - a[1] * y1 - a[2] * y2; x2 = x1; x1 = x[i]; y2 = y1; y1 = o; y[i] = o; } return y; };
function to48(x, sr) {
  if (sr === 48000) return Float64Array.from(x);
  const R = 48000 / sr, n = Math.floor(x.length * R), y = new Float64Array(n), Z = 24, fc = Math.min(1, 1 / R) * 0.98;
  for (let i = 0; i < n; i++) { const t = i / R, c = Math.floor(t); let s = 0; for (let k = c - Z + 1; k <= c + Z; k++) { if (k < 0 || k >= x.length) continue; const d = t - k, u = Math.PI * d * fc, sinc = d === 0 ? 1 : Math.sin(u) / u, w = 0.5 + 0.5 * Math.cos(Math.PI * d / Z); s += x[k] * fc * sinc * w; } y[i] = s; }
  return y;
}
export function lufsRef(chs, sr) {
  const z = chs.map(x => filt(filt(to48(x, sr), T[0]), T[1])), n = z[0].length, B = 19200, St = 4800, bl = [];
  for (let s = 0; s + B <= n; s += St) { let e = 0; for (const c of z) { let q = 0; for (let i = s; i < s + B; i++) q += c[i] * c[i]; e += q / B; } bl.push(e); }
  const L = e => -0.691 + 10 * Math.log10(e), g1 = bl.filter(e => L(e) > -70), m1 = g1.reduce((a, b) => a + b, 0) / g1.length, g2 = g1.filter(e => L(e) > L(m1) - 10);
  return L(g2.reduce((a, b) => a + b, 0) / g2.length);
}
