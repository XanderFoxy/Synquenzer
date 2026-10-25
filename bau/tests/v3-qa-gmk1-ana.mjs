// cross-reference click flags with note on/off per track
import fs from 'fs';
const OUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-gmk1/';
const TAG = process.argv[2] || 'long';
const R = JSON.parse(fs.readFileSync(OUT + TAG + '-result.json')); const M = JSON.parse(fs.readFileSync(OUT + TAG + '-meta.json'));
const fl = R.A.flags; const clusters = []; for (const f of fl) { const c = clusters[clusters.length - 1]; if (c && f.t - c.t1 < .02) { c.t1 = f.t; c.db = Math.max(c.db, f.db); c.lv = Math.max(c.lv, f.lv); } else clusters.push({t0: f.t, t1: f.t, db: f.db, lv: f.lv, b: f.b}); }
console.log('flags', fl.length, 'clusters', clusters.length);
const notes = M.notes.filter(n => n[0] != null);
const tracks = [...new Set(notes.map(n => n[1]))].sort();
const near = (t, tr) => { let bestOff = 1e9, bestOn = 1e9; for (const n of notes) { if (n[1] !== tr) continue; const on = n[0], off = n[0] + (n[4] || 0); if (t >= on) bestOn = Math.min(bestOn, t - on); if (n[4] != null && t >= off) bestOff = Math.min(bestOff, t - off); } return [+bestOn.toFixed(3), +bestOff.toFixed(3)]; };
const hist = {};
for (const c of clusters.slice(0, 400)) {
  const per = {}; for (const tr of tracks) per[tr] = near(c.t0, tr);
  // track with a note-off 20..120 ms before
  const cand = tracks.filter(tr => per[tr][1] >= 0.015 && per[tr][1] <= 0.12 && per[tr][0] > per[tr][1]);
  const key = cand.join('+') || 'none'; hist[key] = (hist[key] || 0) + 1; c.cand = key; c.per = per;
}
console.log('candidate track (note-off 15-120 ms before, no newer onset):', JSON.stringify(hist));
console.log(JSON.stringify(clusters.slice(0, 12).map(c => ({t: c.t0, b: c.b, db: c.db, lv: c.lv, cand: c.cand, per: c.per}))));
