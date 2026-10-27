import fs from 'fs';
const D = JSON.parse(fs.readFileSync(process.argv[2])), sr = D.sr, y = D.y, raw = D.raw, m = D.map;
console.log('mode', D.mode, 'sr', sr, 'len', raw.length, y.length, 'marks', m.src.length - 2);
const t = 7.7264, i0 = Math.round(t * sr);
let mx = 0, at = 0; for (let i = i0 - 200; i < i0 + 300; i++) { const d = Math.abs(y[i] - y[i - 1]); if (d > mx) { mx = d; at = i; } }
console.log('max jump near', mx.toFixed(4), 'at', (at / sr).toFixed(5), 'vals', y.slice(at - 3, at + 3).map(v => v.toFixed(4)).join(' '));
const k = m.dst.findIndex(d => d > t); console.log('map around', [k - 2, k - 1, k, k + 1].map(j => m.src[j].toFixed(4) + '→' + m.dst[j].toFixed(4)).join('  '));
// zeros run?
let z = 0, zs = -1; for (let i = i0 - 2000; i < i0 + 2000; i++) { if (y[i] === 0) { if (zs < 0) zs = i; z++; } }
console.log('zeros in ±40ms', z, 'first', zs >= 0 ? (zs / sr).toFixed(5) : '-');
const pr = (x, a, b) => { const o = []; for (let t = a; t < b; t += 0.002) { let s = 0, z = 0; const i = Math.round(t * sr); for (let j = i; j < i + 88; j++) { s += x[j] * x[j]; if (x[j] === 0) z++; } o.push((10 * Math.log10(s / 88 + 1e-14)).toFixed(0) + (z > 80 ? 'z' : '')); } return o.join(' '); };
console.log('raw 7.680-7.735:', pr(raw, 7.680, 7.735));
console.log('y   7.700-7.755:', pr(y, 7.700, 7.755));
