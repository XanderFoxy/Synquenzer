import { open, APP } from './v3-v2d-pw.mjs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/V2c′-fix.html';
for (const f of [BASE, APP]) {
const {b, p, errs} = await open({width: 390, height: 844}, f, true);
await p.evaluate(() => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(160); Q.setClip(0, 0, {len: 1, notes: [{t:0,d:.4,n:57,v:.8}]}); Q.songView(true); Q.launchScene(0); });
for (let i = 0; i < 6; i++) { await p.waitForTimeout(500); console.log(await p.evaluate(() => { const r = window.SYNQUENZER.runtime(); return JSON.stringify({beat: r.beat, playing: r.playing, slots: r.slots, song: r.song.rec}); })); }
console.log(errs); await b.close(); }
