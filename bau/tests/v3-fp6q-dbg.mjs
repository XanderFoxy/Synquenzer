import {render, mkPatch} from './v3-mk2-node.mjs';
import {mKlick, db, rms, envDb} from './v3-mk1-ana.mjs';
const FILE = process.env.MK_FILE, SR = 48000;
const p = mkPatch({e2: {a: 0, d: 64, s: 127, r: 20}, a: {lvl: 34}});
const r = render(p, [[0, 'on', 48, 1]], {file: FILE, sec: 1, at: [[.55, {mkSet: {'t.0.a.lvl': 94}}]]});
const y = r.l; console.log('rms', db(rms(y, 0, 24000)), db(rms(y, 30000, 40000)));
console.log(envDb(y, SR, 5).slice(100, 125).map(x => x.toFixed(1)).join(' '));
console.log(mKlick(y, SR, [0]));
// HF energy per 2 ms window near 0.656
function biquadHP(x, sr, f, q) { const w = 2 * Math.PI * f / sr, a = Math.sin(w) / (2 * q), cw = Math.cos(w);
  const b0 = (1 + cw) / 2, b1 = -(1 + cw), b2 = (1 + cw) / 2, a0 = 1 + a, a1 = -2 * cw, a2 = 1 - a; const y = new Float64Array(x.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) { const v = (b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v; } return y; }
const h = biquadHP(biquadHP(Float64Array.from(y), SR, 5000, .5412), SR, 5000, 1.3066);
const E = []; for (let w = 300; w < 340; w++) { let e = 0; for (let i = w * 96; i < (w + 1) * 96; i++) e += h[i] * h[i]; E.push((10 * Math.log10(e / 96 + 1e-30)).toFixed(0)); }
console.log(E.join(' '));
let mx = 0; for (let i = 0; i < y.length; i++) mx = Math.max(mx, Math.abs(y[i])); console.log('peak', mx);
