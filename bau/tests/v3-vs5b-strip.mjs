// strips comments/indentation from vs-dsp/stretch.mjs factory and checks equal behaviour
import fs from 'fs';
import * as X from '../vs-dsp/stretch.mjs';
import * as M from '../vs-dsp/marks.mjs';
const src = X.srcText();
let body = src.replace(/^\(/, '').replace(/\)\(\)$/, '');
const out = [];
for (let line of body.split('\n')) {
  let s = line.trim(); if (!s || s.startsWith('//')) continue;
  let q = null, cut = -1;
  for (let i = 0; i < s.length; i++) { const c = s[i]; if (q) { if (c === '\\') { i++; continue; } if (c === q) q = null; continue; } if (c === '"' || c === "'" || c === '`') { q = c; continue; } if (c === '/' && s[i + 1] === '/') { cut = i; break; } }
  if (cut >= 0) s = s.slice(0, cut).trimEnd();
  if (s) out.push(s);
}
let fn = out.join('\n').replace(/^function factory\(\)/, 'function vsStretchMake()');
const A = new Function(fn + ';return vsStretchMake;')()();
const sr = 48000, n = sr * 6, x = new Float32Array(n);
for (let i = 0; i < n; i++) x[i] = 0.2 * Math.sin(2 * Math.PI * 196 * i / sr) + 0.05 * Math.sin(2 * Math.PI * 590 * i / sr);
for (const w of [M.makeWarp([1, 2, 3, 4], [1.1, 2.05, 3.2, 3.9], 6), M.makeWarp([1, 2, 3, 4], [1, 3.5, 3.85, 4.85], 6, 6.85)]) {
  const a = X.stretch(x, sr, w), b = A.stretch(x, sr, w);
  let same = a.y.length === b.y.length; for (let i = 0; i < a.y.length && same; i++) if (a.y[i] !== b.y[i]) same = false;
  console.log('equal', same, JSON.stringify(a.warnings) === JSON.stringify(b.warnings));
}
console.log('raw', src.length, 'stripped', fn.length);
fs.writeFileSync(process.argv[2], fn);
