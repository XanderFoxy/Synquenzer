// strips comments/indentation from vs-dsp/marks.mjs factory and checks equal behaviour
import fs from 'fs';
import * as M from '../vs-dsp/marks.mjs';
const src = M.srcText();                       // "(function factory(){...})()"
let body = src.replace(/^\(/, '').replace(/\)\(\)$/, '');
const out = [];
for (let line of body.split('\n')) {
  let s = line.trim(); if (!s || s.startsWith('//')) continue;
  // drop trailing // comment outside of strings (marks.mjs has no '//' in strings or regex; checked below)
  let q = null, cut = -1;
  for (let i = 0; i < s.length; i++) { const c = s[i]; if (q) { if (c === '\\') { i++; continue; } if (c === q) q = null; continue; } if (c === '"' || c === "'" || c === '`') { q = c; continue; } if (c === '/' && s[i + 1] === '/') { cut = i; break; } }
  if (cut >= 0) s = s.slice(0, cut).trimEnd();
  if (s) out.push(s);
}
let fn = out.join('\n').replace(/^function factory\(\)/, 'function vsMarksMake()');
const make = new Function(fn + ';return vsMarksMake;')();
const A = make();
// equivalence on a synthetic signal
const sr = 48000, n = sr * 6, x = new Float32Array(n);
for (let k = 0; k < 12; k++) { const a = Math.round((0.3 + k * 0.45 + (k % 3) * 0.013) * sr); for (let i = 0; i < 0.3 * sr && a + i < n; i++) x[a + i] += 0.3 * Math.sin(2 * Math.PI * (200 + 20 * k) * i / sr) * Math.exp(-i / (0.1 * sr)) * Math.min(1, i / 48); }
for (let i = 0; i < n; i++) x[i] += 1e-4 * Math.sin(i * 1.7);
const r1 = JSON.stringify(M.detectMarks(x, sr)), r2 = JSON.stringify(A.detectMarks(x, sr));
const ts = JSON.parse(r1).map(m => m.t), q1 = M.quantizeMarks(ts, {bpm: 120, t0: 0.05, grid: '1/16'}), q2 = A.quantizeMarks(ts, {bpm: 120, t0: 0.05, grid: '1/16'});
const y1 = M.renderSlices(x, sr, ts, q1.times), y2 = A.renderSlices(x, sr, ts, q2.times);
let same = y1.length === y2.length; for (let i = 0; i < y1.length && same; i++) if (y1[i] !== y2[i]) same = false;
console.log('marks', JSON.parse(r1).length, 'detect equal', r1 === r2, 'quant equal', JSON.stringify(Array.from(q1.times)) === JSON.stringify(Array.from(q2.times)), 'render equal', same);
console.log('raw', src.length, 'stripped', fn.length);
fs.writeFileSync(process.argv[2], fn);
