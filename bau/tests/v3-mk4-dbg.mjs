import {render, mkPatch} from './v3-mk1-node.mjs';
import {pdb, fft} from './v3-mk1-ana.mjs';
const SR = 48000; let seed = 7; const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
const n = SR * 3, x = new Float32Array(n); for (let i = 0; i < n; i++) x[i] = (rnd() * 2 - 1) * .25;
const p = Object.assign(mkPatch({}), {mfx: {type: 2, spd: 64, dep: 127}});
const o = render(p, [], {sec: 3.1, tap: 'fx', at: [[0, {mkFxIn: {l: x, r: x}}], [0, {mkFxFrz: +process.argv[2]}]]});
const N = 8192, Pxx = new Float64Array(N / 2), Pyy = new Float64Array(N / 2);
for (let s = 9600; s + N <= n; s += N / 2) { const a = new Float64Array(N), ai = new Float64Array(N), b = new Float64Array(N), bi = new Float64Array(N);
  for (let i = 0; i < N; i++) { const w = .5 - .5 * Math.cos(2 * Math.PI * i / N); a[i] = x[s + i] * w; b[i] = o.l[s + i] * w; } fft(a, ai); fft(b, bi);
  for (let k = 0; k < N / 2; k++) { Pxx[k] += a[k] ** 2 + ai[k] ** 2; Pyy[k] += b[k] ** 2 + bi[k] ** 2; } }
const out = []; for (const f of [20, 40, 54, 80, 116, 160, 202, 260, 342, 500, 781, 1175, 2000, 2221, 4457, 5888, 13184, 15769]) { const k = Math.round(f / (SR / N)); out.push(f + ':' + pdb(Pyy[k] / Pxx[k]).toFixed(1)); }
console.log(out.join(' '));
