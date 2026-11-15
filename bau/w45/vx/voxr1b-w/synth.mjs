// gleiche Plopp-Einsetzung wie voxr1-test.mjs
import {f0at} from './lib.mjs';
const TAU = 2 * Math.PI;
export function plops(v, sr, opt = {}) { const n = v.length; let seed = opt.seed || 12345; const rnd = () => { seed = (seed * 1103515245 + 12345) >>> 0; return seed / 4294967296; };
  const T = opt.T || (() => { const T = [], cand = []; for (let t = 0.6; t < n / sr - 0.6; t += 0.01) { let okv = true; for (let d = -0.06; d <= 0.1; d += 0.02) if (!(f0at(t + d) > 0)) { okv = false; break; } if (okv) cand.push(t); }
  let last = -9; for (const t of cand) if (t - last >= (n / sr - 1.2) / 11 && T.length < 10) { T.push(+t.toFixed(3)); last = t; } return T; })();
  const P = new Float32Array(n), gdb = opt.gdb != null ? opt.gdb : 6;
  const L = [[0.5411961], [1.3065630]].map(([q]) => { const w = TAU * 120 / sr, c = Math.cos(w), al = Math.sin(w) / (2 * q), a0 = 1 + al; return [(1 - c) / 2 / a0, (1 - c) / a0, (1 - c) / 2 / a0, -2 * c / a0, (1 - al) / a0]; });
  for (const t of T) { const i0 = Math.round(t * sr), M = Math.round((opt.dur || 0.04) * sr), nz = new Float64Array(M + 2000); for (let i = 0; i < nz.length; i++) nz[i] = rnd() * 2 - 1;
    for (const c of L) { let z1 = 0, z2 = 0; for (let i = 0; i < nz.length; i++) { const x0 = nz[i], o = c[0] * x0 + z1; z1 = c[1] * x0 - c[3] * o + z2; z2 = c[2] * x0 - c[4] * o; nz[i] = o; } }
    let e = 0, es = 0; for (let i = 0; i < M; i++) { e += v[i0 + i] * v[i0 + i]; es += nz[1000 + i] * nz[1000 + i]; }
    const g = Math.pow(10, gdb / 20) * Math.sqrt(e / es);
    for (let i = 0; i < M; i++) { const w = Math.sin(Math.PI * i / M); P[i0 + i] = g * (nz[1000 + i] * w + 0.6 * Math.sqrt(es / M) * Math.sin(Math.PI * i / M) * Math.sin(Math.PI * i / M)); } }
  const x = new Float32Array(n); for (let i = 0; i < n; i++) x[i] = v[i] + P[i]; return {x, P, T}; }
