// zoom into a recorded tap: 2-ms RMS and peak-to-peak jumps around a time; notes of the track nearby
import fs from 'fs';
const [,, tag, tapIdx, tA, tB, trk] = process.argv;
const OUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-gmk4/';
const meta = JSON.parse(fs.readFileSync(OUT + tag + '-meta.json')); const b = fs.readFileSync(OUT + tag + '-tap' + tapIdx + '.f32'); const x = new Float32Array(b.buffer, b.byteOffset, b.length / 4);
const sr = meta.sr, t0 = meta.f0 / sr; const i0 = Math.round((+tA - t0) * sr), i1 = Math.round((+tB - t0) * sr);
const W = Math.round(sr * .002); const rows = [];
for (let i = i0; i < i1; i += W) { let s = 0, mx = 0; for (let k = i; k < i + W; k++) { s += x[k] * x[k]; if (k > 0) mx = Math.max(mx, Math.abs(x[k] - x[k - 1])); } rows.push([(t0 + i / sr).toFixed(3), (10 * Math.log10(s / W + 1e-20)).toFixed(1), mx.toFixed(4)]); }
const notes = meta.notes.filter(n => n[0] != null && n[0] > +tA - 1 && n[0] < +tB && (trk == null || n[1] === +trk)).map(n => [n[0].toFixed(3), n[1], n[2], n[3], n[4] != null ? n[4].toFixed(3) : null]);
console.log('notes', JSON.stringify(notes));
const acts = meta.acts.filter(a => a.t > +tA - 3 && a.t < +tB).map(a => [a.n.slice(0, 40), a.t.toFixed(3), a.t1.toFixed(3)]); console.log('acts', JSON.stringify(acts));
console.log(rows.map(r => r.join(' ')).join('\n'));
