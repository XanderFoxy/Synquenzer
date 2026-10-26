// offline look at the long run: actions (ctx time), flags vs notes, drops envelopes
import fs from 'fs';
const D = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-gmk7/', TAG = process.argv[2] || 'long';
const meta = JSON.parse(fs.readFileSync(D + TAG + '-meta.json')), R = JSON.parse(fs.readFileSync(D + TAG + '-result.json'));
const sr = meta.sr, t0 = meta.f0 / sr;
const taps = meta.taps.map((k, j) => [k, new Float32Array(fs.readFileSync(D + TAG + '-tap' + j + '.f32').buffer.slice(0))]);
const X = Object.fromEntries(taps);
const acts = meta.acts; console.log('t0', t0.toFixed(3));
for (const a of acts) console.log('act', (a.t - t0).toFixed(2), '→', (a.t1 - t0).toFixed(2), a.n.slice(0, 70));
const notes = meta.notes; // [time, track, src, out, dur]
const near = (t, tr) => { let best = null; for (const n of notes) if (n[1] === tr) { const d = t - n[0]; if (d >= -0.05 && (best == null || Math.abs(d) < Math.abs(best))) best = d; } return best == null ? null : +best.toFixed(3); };
const nearOff = (t, tr) => { let best = null; for (const n of notes) if (n[1] === tr && n[4] != null) { const d = t - (n[0] + n[4]); if (best == null || Math.abs(d) < Math.abs(best)) best = d; } return best == null ? null : +best.toFixed(3); };
const which = process.argv[3] || 'master';
const A = R.A.taps[which];
console.log(which, 'flags', A.flags.length, 'drops', A.drops.length, 'sflags', A.sflags.length, 'd2f', A.d2f.length);
const show = (lab, arr) => { for (const f of arr.slice(0, +(process.argv[4] || 40))) { const tt = f.t + 0; console.log(lab, (tt - 0).toFixed(3), 'rel', (tt - t0).toFixed(3), JSON.stringify(f).slice(0, 80), 'on t0/t1/t2/t3/t4', [0, 1, 2, 3, 4].map(tr => near(tt, tr)).join(' '), 'off t2/t3', [2, 3].map(tr => nearOff(tt, tr)).join(' ')); } };
show('F', A.flags); show('D', A.drops); show('S', A.sflags); show('2', A.d2f);
// late notes
console.log('late', JSON.stringify(R.A.late.slice(0, 10)));
