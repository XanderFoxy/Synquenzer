import {launch, openApp, R, OPEN, mergeO, SR} from './v3-qa-mk2-lib.mjs';
const b = await launch(); const {page} = await openApp(b, new URL('../mk-wt/index.html', import.meta.url).pathname);
const E = [-2.0, -1.7, -0.1, 0, -0.6, -0.7, -4.1], env = f => { const o = Math.log2(f / 110); if (o <= 0) return E[0] + 6 * o; if (o >= 6) return E[6] - 8 * (o - 6); const j = Math.floor(o), t = o - j; return E[j] + (E[j + 1] - E[j]) * t; };
const dft = (x, i0, n, f) => { let re = 0, im = 0; for (let i = 0; i < n; i++) { const a = 2 * Math.PI * f * i / SR; re += x[i0 + i] * Math.cos(a); im += x[i0 + i] * Math.sin(a); } return 2 * Math.hypot(re, im) / n; };
for (const F of [130.81, 155.56, 187.5, 220.27, 311.13, 466.16]) {
  const note = 69 + 12 * Math.log2(F / 440), x = (await R(page, mergeO({o1: {w: 5, c2: 68}}, OPEN), [[0, 'on', note, .8]], {sec: .8})).l, ft = F / 2, P = Math.round(SR / ft * 8);
  const d = []; for (let k = 1; k <= 64; k *= 2) { const f = k * ft; if (f > 9000) break; d.push(20 * Math.log10(dft(x, 14400, P, f)) - env(f)); }
  const g = d.reduce((s, v) => s + v, 0) / d.length; console.log('35 F', F, 'devs', d.map(v => (v - g).toFixed(2)).join(' '));
}
await b.close();
