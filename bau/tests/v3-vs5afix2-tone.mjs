import * as M from '../vs-dsp/marks.mjs';
const LEN = 4.6, n = Math.round(48000 * LEN), xs = new Float32Array(n); let ph = 0;
const TT = [0.5, 0.762, 0.98, 1.27, 1.49, 1.77, 2.01, 2.24, 2.52, 2.75, 3.03, 3.23, 3.52, 3.74, 4.03, 4.27];
for (let i = 0; i < n; i++) { const t = i / 48000; let k = 0; for (let j = 0; j < TT.length; j++) if (t >= TT[j]) k = j; ph += 2 * Math.PI * [220, 247, 262, 294][k % 4] / 48000; let v = 0; for (let h = 1; h <= 5; h++) v += Math.sin(h * ph) / h; xs[i] = 0.2 * v * Math.min(1, t / 0.02, (LEN - t) / 0.02); }
const q = Float32Array.from(xs, v => Math.round(v * 32767) / 32767);
console.log(M.detectMarks(q, 48000).map(m => m.t.toFixed(3) + m.src).join(' '));
