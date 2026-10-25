import { chromium } from 'playwright';
import { NEW, BASE, OUT } from './v3-qa-v2e2reg-pw.mjs';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
for (const [name, file] of [['base', BASE], ['new', NEW]]) for (const [vp, w, h] of [['P3', 320, 568], ['L1', 844, 390], ['L2', 667, 375], ['P2', 375, 667]]) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, deviceScaleFactor: 3, hasTouch: true, isMobile: true});
  const p = await ctx.newPage(); await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.runtime);
  await p.evaluate(async () => { const Q = window.SYNQUENZER; await Q.loadDemo(); Q.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}]); Q.songView(true); });
  await p.waitForTimeout(800);
  const info = await p.evaluate(() => [...document.querySelectorAll('#songView .sv-top > *')].filter(e => e.offsetWidth).map(e => { const r = e.getBoundingClientRect(); return e.className.split(' ').filter(c => c.startsWith('sv-')).join('.') + ' ' + [r.left, r.top, r.width, r.height].map(Math.round).join(',') + ' sw' + e.scrollWidth + '/' + e.clientWidth + ' sh' + e.scrollHeight + '/' + e.clientHeight + ' "' + e.textContent.trim().replace(/\s+/g, ' ') + '"'; }));
  console.log(name, vp, JSON.stringify(info, null, 1));
  const box = await p.evaluate(() => { const t = document.querySelector('#songView .sv-top'); const r = t.getBoundingClientRect(); return {x: r.left, y: r.top, width: Math.min(r.width, 400), height: Math.min(r.height, 300)}; });
  await p.screenshot({path: OUT + `zoom-${name}-${vp}.png`, clip: box});
  await ctx.close();
}
await b.close();
