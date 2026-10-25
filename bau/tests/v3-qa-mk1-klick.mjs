import {render, mkPatch} from './v3-mk1-node.mjs';
import {db, pdb, rms, peak} from './v3-mk1-ana.mjs';
const SR = 48000;
function hp(x) { const bq = (x, f, q) => { const w = 2 * Math.PI * f / SR, a = Math.sin(w) / (2 * q), cw = Math.cos(w); const b0 = (1 + cw) / 2, b1 = -(1 + cw), b2 = b0, a0 = 1 + a, a1 = -2 * cw, a2 = 1 - a; const y = new Float64Array(x.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < x.length; i++) { const v = (b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v; } return y; }; return bq(bq(Float64Array.from(x), 5000, .5412), 5000, 1.3066); }
const p = JSON.parse(process.argv[2] || '{"a":{"dist":1},"f":{"cut":80}}'), note = +(process.argv[3] || 48), at = process.argv[4] ? JSON.parse(process.argv[4]) : [];
const r = render(mkPatch(p), [[0, 'on', note, .8]], {sec: 1.2, at});
const h = hp(r.l), W = 96, E = []; for (let w = 0; w < h.length / W - 1; w++) { let e = 0; for (let i = w * W; i < (w + 1) * W; i++) e += h[i] * h[i]; E.push(e / W + 1e-20); }
const s = E.slice().sort((a, b) => a - b); console.log('median HP energy dB', pdb(s[s.length >> 1]).toFixed(1), 'max', pdb(s[s.length - 1]).toFixed(1));
const top = E.map((e, i) => [i, e]).sort((a, b) => b[1] - a[1]).slice(0, 8); for (const [i, e] of top) console.log('win', i, 't', (i * W / SR).toFixed(4), pdb(e).toFixed(1));
// raw signal: largest sample-to-sample jump
let mj = 0, mi = 0; for (let i = 1; i < r.l.length; i++) { const d = Math.abs(r.l[i] - r.l[i - 1]); if (d > mj) { mj = d; mi = i; } }
console.log('max jump', mj.toExponential(3), 'at', (mi / SR).toFixed(5), 'signal rms', db(rms(r.l, 4800, 48000)).toFixed(1));
const i0 = +(process.argv[5] || 0); if (i0) { const c = Math.round(i0 * SR); console.log(Array.from(r.l.slice(c - 8, c + 8)).map(v => v.toFixed(6)).join(' ')); }
