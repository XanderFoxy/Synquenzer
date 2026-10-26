// print envelope / d2 around a time of a tap (ctx time): node v3-qa-gmk7-wave.mjs TAG tap t0 t1 [stepMs]
import fs from 'fs';
const D = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-gmk7/';
const [TAG, tap, a, b, st] = process.argv.slice(2);
const meta = JSON.parse(fs.readFileSync(D + TAG + '-meta.json')); const sr = meta.sr, T0 = meta.f0 / sr; const j = meta.taps.indexOf(tap);
const x = new Float32Array(fs.readFileSync(D + TAG + '-tap' + j + '.f32').buffer.slice(0));
const i0 = Math.round((+a - T0) * sr), i1 = Math.round((+b - T0) * sr), W = Math.round(sr * (+(st || 5)) / 1000);
for (let i = i0; i < i1; i += W) { let pk = 0, s = 0, d2 = 0, at = 0; for (let k = i; k < i + W; k++) { pk = Math.max(pk, Math.abs(x[k])); s += x[k] * x[k]; const d = Math.abs(x[k] - 2 * x[k - 1] + x[k - 2]); if (d > d2) { d2 = d; at = k; } } console.log(((i / sr) + T0).toFixed(4), 'pk', (20 * Math.log10(pk + 1e-12)).toFixed(1), 'rms', (10 * Math.log10(s / W + 1e-20)).toFixed(1), 'd2max', d2.toFixed(4), '@', ((at / sr) + T0).toFixed(5), 'x', x.subarray(at - 3, at + 3).map(v => +v.toFixed(4)).join(',')); }
