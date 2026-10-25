// QA 7.1: empty song — ● (touch) starts at once with all targets, no Start-Blatt; ● by finger ends after N7-R1 (first take)
import { openT, down, up, tapXY, center, mk } from './v3-qa2d2-lib.mjs';
const {check, done} = mk();
const {b, p, errs, cdp} = await openT({width: 390, height: 844});
await p.evaluate(() => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(240); const K = {root: 9, scale: 'aeolian'}; Q.setClip(0, 0, {len: 1, key: K, notes: [{t: 0, d: .5, n: 45, v: .8}]}); Q.songView(true); });
await p.waitForTimeout(400);
let c = await center(p, '.sv-rec'); await tapXY(p, cdp, c.x, c.y); await p.waitForTimeout(150);
const st = await p.evaluate(() => ({sheet: !!document.querySelector('.pop.rstart'), rec: window.SYNQUENZER.runtime().song.rec, tg: window.SYNQUENZER.runtime().song.targets}));
check('empty song: ● starts at once, no sheet, all targets', !st.sheet && st.rec && st.tg.clips && st.tg.chords && st.tg.mel, st);
await p.evaluate(() => window.SYNQUENZER.launchClip(0, 0));
await p.waitForFunction(() => window.SYNQUENZER.runtime().beat >= 8.6, null, {timeout: 20000, polling: 4});   // bar 3 + 15 %
c = await center(p, '.sv-rec'); await down(cdp, c.x, c.y); await p.waitForTimeout(250); await up(cdp); await p.waitForTimeout(250);
const s = await p.evaluate(() => ({bars: window.SYNQUENZER.song() && window.SYNQUENZER.song().bars, le: window.SYNQUENZER.runtime().song.lastEnd}));
check('first take ended by finger at T3 + 15 % (lift ~ + 40 %) → 2 bars (n0=2 logical, n1=3 not → struktur)', s.bars === 2, s);
await p.evaluate(() => window.SYNQUENZER.stop());
check('0 console errors', !errs.length, errs);
await b.close(); process.exit(done() ? 1 : 0);
