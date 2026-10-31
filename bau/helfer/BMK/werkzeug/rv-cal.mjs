// Eichung der Hall-Typen RV1-16: die interne Zeit, mit der M-T60 (Hüllkurve 2 ms, Regression -5 ... -35 dB, auf -60 dB) die
// Formel 8 s * (0,3/8)^((n-1)/15) trifft. Eigene Rechnung; Ergebnis = Tabelle RV_CAL in src/bm-fx.js.
import {render} from '../tests/bm-node.mjs';
const SR = +process.env.SR || 48000, {BMK} = render([], {sec: .01, sr: SR});
function t60(rtInt, n) {
  const U = new BMK.FxUnit(2, SR); U.fam = 'RV'; U.rsize(Math.min(1, Math.max(.35, 8 * Math.pow(.3 / 8, (n - 1) / 15)))); const sec = Math.min(12, rtInt * 1.6 + .5), N = Math.round(sec * SR), x = new Float32Array(N), yl = new Float32Array(N), yr = new Float32Array(N);
  let s = 12345; for (let i = Math.round(.01 * SR); i < Math.round(.03 * SR); i++) { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; x[i] = s / 2147483648 * .3; }
  for (let i = 0; i < N; i += 128) U.reverb(x, x, yl, yr, i, Math.min(N, i + 128), rtInt);
  const W = 96, env = []; for (let i = 0; i + W <= N; i += W) { let e = 0; for (let j = i; j < i + W; j++) e += yl[j] ** 2 + yr[j] ** 2; env.push(10 * Math.log10(e / W + 1e-30)); }
  let ip = 0; for (let i = 0; i < env.length; i++) if (env[i] > env[ip]) ip = i;
  const pts = []; for (let i = ip; i < env.length; i++) { const d = env[i] - env[ip]; if (d <= -5 && d >= -35) pts.push([i * W / SR, d]); if (d < -35) break; }
  const mx = pts.reduce((a, b) => a + b[0], 0) / pts.length, my = pts.reduce((a, b) => a + b[1], 0) / pts.length; let sxy = 0, sxx = 0; for (const [x0, y] of pts) { sxy += (x0 - mx) * (y - my); sxx += (x0 - mx) ** 2; }
  return -60 / (sxy / sxx);
}
const cal = [];
for (let n = 1; n <= 16; n++) {
  const want = 8 * Math.pow(.3 / 8, (n - 1) / 15); let a = want * .3, b = want * 2;
  for (let it = 0; it < 14; it++) { const m = Math.sqrt(a * b); if (t60(m, n) < want) a = m; else b = m; }
  const k = Math.sqrt(a * b) / want; cal.push(+k.toFixed(4)); console.log('RV' + n, want.toFixed(3), 'x', k.toFixed(4), '->', t60(k * want, n).toFixed(3));
}
console.log(JSON.stringify(cal));
