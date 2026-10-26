// residual flags: not within −3…+40 ms after any note onset, not within ±30 ms of an offset; grouped by action
import fs from 'fs';
const D = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-gmk7/', TAG = process.argv[2] || 'long';
const meta = JSON.parse(fs.readFileSync(D + TAG + '-meta.json')), R = JSON.parse(fs.readFileSync(D + TAG + '-result.json'));
const ons = meta.notes.map(n => n[0]).sort((a, b) => a - b), offs = meta.notes.filter(n => n[4] != null).map(n => n[0] + n[4]).sort((a, b) => a - b);
const explained = t => ons.some(o => t - o >= -0.003 && t - o <= 0.04) || offs.some(o => Math.abs(t - o) <= 0.03);
const acts = meta.acts;
const byAct = t => { const a = acts.filter(a => t >= a.t - .05).pop(); return a ? a.n.slice(0, 64) + ' +' + (t - a.t).toFixed(2) : '-'; };
for (const tap of Object.keys(R.A.taps)) { const X = R.A.taps[tap]; const all = X.flags.map(f => ['f', f]).concat(X.sflags.map(f => ['s', f]), X.d2f.map(f => ['d', f]));
  const rest = all.filter(([k, f]) => !explained(f.t)); console.log(tap, 'all', all.length, 'unexplained', rest.length);
  const g = {}; for (const [k, f] of rest) { const a = byAct(f.t), key = a.replace(/ \+[\d.]+$/, ''); (g[key] = g[key] || []).push(k + '@' + f.t.toFixed(3) + ' ' + f.db + 'dB ' + a.match(/\+[\d.]+$/)[0]); }
  for (const k in g) console.log('   ', k.padEnd(64), g[k].length, g[k].slice(0, 5).join(' | ')); }
