import { open, APP } from './v3-v2d-pw.mjs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/V2c′-fix.html';
for (const f of [BASE, APP]) {
const {b, p, errs} = await open({width: 390, height: 844}, f, true);
const r = await p.evaluate(() => { const Q = window.SYNQUENZER; const o = [];
  for (const sel of [null, 0, 1, 2]) {
    Q.newProject({init: true}); const K = {root: 9, scale: 'aeolian'}, N = (t, n) => ({t, d: .4, n, v: .8});
    Q.setClip(0, 0, {len: 1, key: K, notes: [N(0, 57)]}); Q.setClip(1, 0, {len: 1, key: K, notes: [N(0, 69)]}); Q.setClip(4, 0, {len: 1, key: K, notes: [{t: 0, d: .1, n: 36, v: .9}]});
    const s0 = Q.runtime().selected;
    if (sel != null) Q.selectTrack(sel);
    Q.songFromChain([{scene: 0, bars: 4}]);
    o.push({sel, s0, s1: Q.runtime().selected, mt: Q.song().melodyTrack, names: Q.project().tracks.map(t => t.name).join(',')});
  }
  return o; });
console.log(f.slice(-20), JSON.stringify(r, null, 0)); await b.close(); }
