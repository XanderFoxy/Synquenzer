import fs from 'node:fs';
const n = process.argv[2] || 'hart', J = JSON.parse(fs.readFileSync('dump/' + n + '.json')), b = fs.readFileSync('dump/' + n + '.f32'), x = new Float32Array(b.buffer, b.byteOffset, b.length / 4);
const sr = J.sr, st = J.stepS, nS = Math.floor((x.length / sr - 0.1) / st), N = 2048;
function fft(re, im) { const n = re.length; for (let i = 1, j = 0; i < n; i++) { let b = n >> 1; for (; j & b; b >>= 1) j ^= b; j ^= b; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } } for (let len = 2; len <= n; len <<= 1) { const a = -2 * Math.PI / len, wr = Math.cos(a), wi = Math.sin(a); for (let i = 0; i < n; i += len) { let cr = 1, ci = 0; for (let j = 0; j < len / 2; j++) { const p = i + j, q = p + len / 2, tr = re[q] * cr - im[q] * ci, ti = re[q] * ci + im[q] * cr; re[q] = re[p] - tr; im[q] = im[p] - ti; re[p] += tr; im[p] += ti; const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t; } } } }
const edges = [30, 60, 90, 130, 180, 250, 400, 800, 1600, 3200, 6400, 12000];
const lab = k => { const t = J.a0 + k * st, nr = a => a.some(u => Math.abs(u - t) <= 0.05); return nr(J.truth.kick) ? 'K' : nr(J.truth.snare) ? 'S' : nr(J.truth.hat) ? 'h' : '-'; };
const acc = {};
for (let k = 1; k < nS; k++) { const i0 = Math.round((k * st - 0.005) * sr); if (i0 + N > x.length) break; const re = new Float32Array(N), im = new Float32Array(N); for (let i = 0; i < N; i++) re[i] = x[i0 + i] * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / N)); fft(re, im);
  const v = edges.slice(0, -1).map((e, j) => { let s = 0; for (let q = Math.ceil(e * N / sr); q < edges[j + 1] * N / sr; q++) s += re[q] * re[q] + im[q] * im[q]; return s; });
  const L = lab(k) + (k % Math.round(J.bar / st)); (acc[L] || (acc[L] = [])).push(v); }
for (const [L, a] of Object.entries(acc).sort()) { const m = a[0].map((_, j) => a.reduce((s, v) => s + v[j], 0) / a.length), tot = m.reduce((s, v) => s + v, 0); console.log(L.padEnd(4), String(a.length).padStart(3), (10 * Math.log10(tot)).toFixed(0).padStart(4), m.map(v => (10 * Math.log10(v / tot)).toFixed(0).padStart(4)).join('')); }
console.log('     n   tot ' + edges.slice(0, -1).map(e => String(e).padStart(4)).join(''));
