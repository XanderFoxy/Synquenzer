// offline: flags of a tap vs. own note on/offs (base or long run)
import fs from 'fs';
const TAG = process.argv[2] || 'base', TAP = +(process.argv[3] || 2), TR = +(process.argv[4] || 2);
const D = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-gmk5/';
const M = JSON.parse(fs.readFileSync(D + TAG + '-meta.json'));
const R = JSON.parse(fs.readFileSync(D + TAG + '-result.json'));
const b = fs.readFileSync(D + TAG + '-tap' + TAP + '.f32'); const x = new Float32Array(b.buffer, b.byteOffset, b.byteLength / 4);
const sr = M.sr, t0 = M.f0 / sr;
const tapName = M.taps[TAP];
const X = R.A.taps[tapName];
const notes = M.notes.filter(n => TR < 0 || n[1] === TR);
const ons = notes.map(n => n[0]).sort((a, b) => a - b), offs = notes.filter(n => n[4] != null).map(n => n[0] + n[4]).sort((a, b) => a - b);
const near = (arr, t) => { let best = 1e9; for (const a of arr) { const d = t - a; if (Math.abs(d) < Math.abs(best)) best = d; } return best; };
console.log(tapName, 'flags', X.flags.length, 'sflags', X.sflags.length, 'notes', notes.length, 'srcs', JSON.stringify([...new Set(notes.map(n => n[2]))]));
const hist = {};
for (const f of X.flags.concat(X.sflags)) { const dOn = near(ons, f.t), dOff = near(offs, f.t); const k = 'on' + Math.round(dOn * 1000 / 5) * 5 + '|off' + Math.round(dOff * 1000 / 5) * 5; hist[k] = (hist[k] || 0) + 1; }
console.log(Object.entries(hist).sort((a, b) => b[1] - a[1]).slice(0, 25).map(([k, v]) => k + ':' + v).join('  '));
// first 8 flags: details
for (const f of X.flags.slice(0, 12)) { const dOn = near(ons, f.t), dOff = near(offs, f.t); const nOn = notes.filter(n => Math.abs(n[0] - f.t) < .1).map(n => [+(n[0] - f.t).toFixed(4), n[2], n[3], n[4] && +n[4].toFixed(3)]); console.log(f.t, f.db, f.lv, 'dOn', (dOn * 1000).toFixed(1), 'dOff', (dOff * 1000).toFixed(1), JSON.stringify(nOn)); }
