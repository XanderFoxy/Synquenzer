// VS5a-fix2: marks with / without the fine position on the sung QA phrase (WAV) – how far does the fine step move sung marks?
import fs from 'fs';
const A = await import('../vs-dsp/marks.mjs'), B = await import('../vs5afix2-tmp/marks-nofine.mjs');
const b = fs.readFileSync(process.argv[2]); let o = 12, sr = 48000, x = null;
while (o < b.length) { const id = b.toString('ascii', o, o + 4), n = b.readUInt32LE(o + 4); if (id === 'fmt ') sr = b.readUInt32LE(o + 12); if (id === 'data') { x = new Float32Array(n / 2); for (let i = 0; i < x.length; i++) x[i] = b.readInt16LE(o + 8 + 2 * i) / 32768; } o += 8 + n + (n & 1); }
const ma = A.detectMarks(x, sr), mb = B.detectMarks(x, sr);
const d = ma.map((m, k) => mb[k] ? (m.t - mb[k].t) * 1000 : NaN);
console.log('marks', ma.length, mb.length, 'fine − plain (ms):', d.map(v => v.toFixed(1)).join(' '));
