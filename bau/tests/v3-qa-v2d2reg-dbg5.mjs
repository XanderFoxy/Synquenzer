import { open, APP } from './v3-v2d-pw.mjs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/V2c′-fix.html';
for (const f of [BASE, APP]) for (const [w, h] of [[320, 568], [375, 667], [390, 844]]) {
const {b, p, errs} = await open({width: w, height: h}, f, true);
await p.evaluate(() => { const Q = window.SYNQUENZER; Q.newProject({init: true}); const K = {root: 9, scale: 'aeolian'}; Q.setClip(0, 0, {len: 1, key: K, notes: [{t: 0, d: .4, n: 57, v: .8}]}); Q.setClip(1, 0, {len: 1, key: K, notes: [{t: 0, d: .4, n: 69, v: .8}]}); Q.selectTrack(0); Q.songFromChain([{scene: 0, bars: 8}]); Q.selectTrack(1); Q.songView(true); Q.songRecTargets({clips: true, chords: true, notes: true, mel: true}); Q.songPos(3); });
await p.waitForTimeout(300);
const c = await p.evaluate(() => { const r = SV.btn.bRec.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; });
await p.touchscreen.tap(c.x, c.y); await p.waitForTimeout(350);
const r = await p.evaluate(() => [...document.querySelectorAll('.pop.rstart .rs-tg button')].map(x => { const cs = getComputedStyle(x); return x.textContent + ' w' + x.clientWidth + ' sw' + x.scrollWidth + ' pad' + cs.paddingLeft + '/' + cs.paddingRight + ' ov' + cs.overflow + ' to' + cs.textOverflow; }));
console.log(f.slice(-12), w, JSON.stringify(r)); await b.close(); }
