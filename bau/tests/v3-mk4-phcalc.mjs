// MK4 helper: analytic phaser response (6 first-order allpasses, feedback over the chain with one sample delay, mix w)
const SR = 48000;
function H(fc, fb, w, f) {
  const t = Math.tan(Math.PI * fc / SR), a = (t - 1) / (t + 1), om = 2 * Math.PI * f / SR;
  const zr = Math.cos(om), zi = -Math.sin(om); // z^-1
  // A1 = (a + z^-1) / (1 + a z^-1)
  const nr = a + zr, ni = zi, dr = 1 + a * zr, di = a * zi, d2 = dr * dr + di * di;
  let Ar = (nr * dr + ni * di) / d2, Ai = (ni * dr - nr * di) / d2;
  let Pr = 1, Pi = 0; for (let k = 0; k < 6; k++) { const r = Pr * Ar - Pi * Ai, i = Pr * Ai + Pi * Ar; Pr = r; Pi = i; }
  // wet = A6 / (1 - fb z^-1 A6)
  const qr = 1 - fb * (zr * Pr - zi * Pi), qi = -fb * (zr * Pi + zi * Pr), q2 = qr * qr + qi * qi;
  const Wr = (Pr * qr + Pi * qi) / q2, Wi = (Pi * qr - Pr * qi) / q2;
  return 20 * Math.log10(Math.hypot(1 - w + w * Wr, w * Wi));
}
for (const fc of [200, 4000]) { const r = []; let p = 0; for (let f = 10; f < 23000; f *= 1.01) { const h = H(fc, +process.argv[2] || .7, .5, f); r.push([f, h]); }
  const mins = []; for (let i = 1; i < r.length - 1; i++) if (r[i][1] < r[i - 1][1] && r[i][1] < r[i + 1][1]) mins.push(Math.round(r[i][0]) + 'Hz ' + r[i][1].toFixed(1));
  const maxs = []; for (let i = 1; i < r.length - 1; i++) if (r[i][1] > r[i - 1][1] && r[i][1] > r[i + 1][1]) maxs.push(Math.round(r[i][0]) + 'Hz ' + r[i][1].toFixed(1));
  console.log(fc, 'min', mins.join(', '), '| max', maxs.join(', '), '| DC', H(fc, .7, .5, 10).toFixed(1)); }
