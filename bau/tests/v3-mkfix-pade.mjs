const F = x => { const a = Math.abs(x); return a < 3 ? a * a / 18 + 4 / 3 * Math.log(27 + 9 * a * a) : a - 3 + 9 / 18 + 4 / 3 * Math.log(108); };
const Z = (u, dx) => { const sm = u + dx, W = 6 + u * u + dx * dx, w2 = W * W, w4 = w2 * w2, e = (u - dx) * sm, p = e * e;
  return sm * (.05555555555555555 + 2.6666666666666665 * (945 * w4 - 735 * p * w2 + 64 * p * p) / ((945 * w4 - 1050 * p * w2 + 225 * p * p) * W)); };
const T = x => x >= 3 ? 1 : x <= -3 ? -1 : x * (27 + x * x) / (27 + 9 * x * x);
let worst = 0, wa = 0; for (let i = 0; i < 1e6; i++) { const u = (Math.random() * 2 - 1) * 2.999, x = (Math.random() * 2 - 1) * 2.999; const d = u - x; if (Math.abs(d) < 1e-3) continue;
  const ref = (F(u) - F(x)) / d, z = Z(u, x); worst = Math.max(worst, Math.abs(z - ref)); }
for (let i = 0; i < 1e5; i++) { const u = (Math.random() * 2 - 1) * 2.999, x = u + (Math.random() - .5) * 1e-3; wa = Math.max(wa, Math.abs(Z(u, x) - T((u + x) / 2))); }
console.log('max |err| large steps', worst.toExponential(2), 'small steps vs T(mid)', wa.toExponential(2));
