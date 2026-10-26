// MK4 helper: magnitude of the TPT shelves (Simper) at a few frequencies, analytic (bilinear)
const SR = 48000, k = Math.SQRT2;
function H(type, f0, dB, f) {
  const A = 10 ** (dB / 40), g = Math.tan(Math.PI * f0 / SR) * (type === 'lo' ? 1 / Math.sqrt(A) : Math.sqrt(A));
  const [m0, m1, m2] = type === 'lo' ? [1, k * (A - 1), A * A - 1] : [A * A, k * (1 - A) * A, 1 - A * A];
  // analog prototype at warped s: s = j*tan(pi f / SR)/tan(pi f0/SR) scaled: SVF with g: LP = g^2/(s^2+gk s+g^2) with s = j tan(pi f/SR)
  const w = Math.tan(Math.PI * f / SR); const re = g * g - w * w, im = g * k * w; // denominator s^2 + g k s + g^2 with s = jw
  const den2 = re * re + im * im;
  // HP = s^2/den, BP = g s/den, LP = g^2/den ; v0 = in, v1 = BP, v2 = LP
  const num = (a, b) => [a, b];
  const LP = [g * g * re / den2, -g * g * im / den2];
  const BP = [(g * w) * im / den2, (g * w) * re / den2];
  const y = [m0 + m1 * BP[0] + m2 * LP[0], m1 * BP[1] + m2 * LP[1]];
  return 20 * Math.log10(Math.hypot(...y));
}
for (const f of [25, 100, 400, 1000]) console.log('lo100+12', f, H('lo', 100, 12, f).toFixed(2));
for (const f of [2000, 8000, 16000]) console.log('hi8k-12', f, H('hi', 8000, -12, f).toFixed(2));
