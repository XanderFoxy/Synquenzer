// Raumton-Teil aus voxr1-test.mjs (gleiche Lücken)
import {core, wav, RV, SRC} from './lib.mjs'; import {band, db} from './meas.mjs';
const K = core(process.argv[2]); const A = wav(RV + SRC[0]), sr = A.sr, v = A.x, n = v.length, H = 441;
const frames = (y, H) => { const L = []; for (let p = 0; p + H <= y.length; p += H) { let s = 0; for (let i = p; i < p + H; i++) s += y[i] * y[i]; L.push(db(s / H)); } return L; };
const Lo = frames(v, H), Lov = Lo.filter(q => q > -110).sort((a, b) => a - b), flo = Lov[Math.floor(0.1 * Lov.length)], holes = [], xh = Float32Array.from(v);
{ let s = -1; for (let j = 0; j <= Lo.length; j++) { const q = j < Lo.length && Lo[j] > -110 && Lo[j] < flo + 6; if (q && s < 0) s = j; if (!q && s >= 0) { if (j - s >= 25 && holes.length < 5) { const c = (s + j) / 2 * H, d = Math.min(0.3, 0.5 * (j - s) * H / sr); holes.push([Math.round(c - d * sr / 2), Math.round(c + d * sr / 2)]); } s = -1; } } }
for (const [a, b] of holes) xh.fill(0, a, b);
const rr = K.done(K.run(xh, sr, {steps: {room: {}}}));
const lev = (y, a, b) => { let s = 0; for (let i = a; i < b; i++) s += y[i] * y[i]; return db(s / Math.max(1, b - a)); };
const oct = (y, a, b) => [250, 500, 1000, 2000, 4000, 8000].map(f => db(band(Float32Array.from(y.subarray(a, b)), sr, f / Math.SQRT2, f * Math.SQRT2)));
console.log(holes.map(([a, b]) => { const R0 = Math.round(0.012 * sr), so = oct(v, a, b), sf = oct(rr.y, a, b), d0 = so.map((q, i) => sf[i] - q), mean = d0.reduce((s, q) => s + q, 0) / 6;
  return [(lev(rr.y, a + R0, b - R0) - lev(v, a + R0, b - R0)).toFixed(1), Math.max(...d0.map(q => Math.abs(q - mean))).toFixed(1), ((b - a) / sr).toFixed(2)].join('/'); }).join('  '));
