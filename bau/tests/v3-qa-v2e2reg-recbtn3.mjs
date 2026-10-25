import { chromium } from 'playwright';
import { NEW, BASE, OUT } from './v3-qa-v2e2reg-pw.mjs';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
for (const [name, file] of [['base', BASE], ['new', NEW]]) for (const [vp, w, h] of [['P1', 390, 844]]) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, deviceScaleFactor: 3, hasTouch: true, isMobile: true});
  const p = await ctx.newPage(); await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.runtime);
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.newProject({init: true}); const K = {root: 9, scale: 'aeolian'}; Q.setClip(0, 0, {len: 1, key: K, notes: [{t: 0, d: 1, n: 57, v: .8}]}); Q.selectTrack(0); Q.songFromChain([{scene: 0, bars: 4}]); Q.selectTrack(1); Q.songView(true); Q.songRecTargets({clips: true, chords: true, notes: true, mel: true}); });
  await p.waitForTimeout(600);
  await p.screenshot({path: OUT + `recbtn3-${name}-${vp}.png`, clip: {x: 0, y: 48, width: 390, height: 56}});
  await ctx.close();
}
await b.close();
