import { open, APP } from './v3-v2d-pw.mjs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/V2c′-fix.html';
for (const f of [BASE, APP]) {
const {b, p, errs} = await open({width: 390, height: 844}, f, true);
await p.evaluate(() => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(160); const K = {root: 9, scale: 'aeolian'}, N = (t, n, d) => ({t, d: d || .4, n, v: .8});
  Q.setClip(0, 0, {len: 1, key: K, notes: [N(0, 57)]}); Q.setClip(0, 1, {len: 2, key: K, notes: [N(0, 53)]}); Q.setClip(1, 0, {len: 1, key: K, notes: [N(0, 69)]}); Q.setClip(1, 1, {len: 1, key: K, notes: [N(.5, 76)]});
  Q.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}]); Q.songView(true); Q.songPos(1); Q.songRecTargets({clips: true, chords: false, notes: false, mel: false});
  Q.songRecFrom({from: 1, preroll: 1}); });
for (let i = 0; i < 14; i++) { await p.waitForTimeout(300); const o = await p.evaluate(() => { const r = window.SYNQUENZER.runtime(); return {beat: +r.beat.toFixed(2), sb: r.song.beat != null ? +r.song.beat.toFixed(2) : null, rec: r.song.rec, slots: r.slots.join(','), q: JSON.stringify(r.queued.map(x => x && x.beat))}; }); console.log(JSON.stringify(o)); if (o.sb >= 4.6 && o.sb < 5.6) { console.log('launch'); await p.evaluate(() => window.SYNQUENZER.launchScene(0)); } }
await p.evaluate(() => window.SYNQUENZER.songRecEnd({beat: undefined}));
console.log(JSON.stringify(await p.evaluate(() => window.SYNQUENZER.song().lanes)), errs); await b.close(); }
