// flags not explained by an onset ≤ 20 ms before (any track) or a drum onset ≤ 40 ms; grouped by the action before
import fs from 'fs';
const OUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-gmk1/';
const TAG = process.argv[2] || 'long', LIM = +(process.argv[3] || .020);
const R = JSON.parse(fs.readFileSync(OUT + TAG + '-result.json')); const M = JSON.parse(fs.readFileSync(OUT + TAG + '-meta.json'));
const fl = R.A.flags; const cl = []; for (const f of fl) { const c = cl[cl.length - 1]; if (c && f.t - c.t1 < .02) { c.t1 = f.t; c.db = Math.max(c.db, f.db); } else cl.push({t0: f.t, t1: f.t, db: f.db, lv: f.lv, b: f.b}); }
const ons = M.notes.filter(n => n[0] != null).map(n => [n[0], n[1], n[0] + (n[4] || 0)]);
const un = cl.filter(c => !ons.some(([t, tr]) => c.t0 - t >= -.002 && c.t0 - t <= (tr === 4 ? .04 : LIM)));
const acts = R.A.acts;
const by = {}; for (const c of un) { const a = acts.filter(a => c.t0 >= a.t - .05).pop(); const k = a ? a.n : '-'; (by[k] = by[k] || []).push({t: c.t0, b: c.b, db: c.db, lv: c.lv, dt: a ? +(c.t0 - a.t).toFixed(2) : null, offs: ons.filter(([t, tr, off]) => c.t0 - off >= 0 && c.t0 - off < .1).map(([t, tr, off]) => tr + '@' + Math.round((c.t0 - off) * 1000))}); }
console.log(TAG, 'clusters', cl.length, 'unexplained', un.length);
for (const k in by) console.log(k.padEnd(60), by[k].length, JSON.stringify(by[k].slice(0, 4)));
