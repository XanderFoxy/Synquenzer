// QA V2e′: song view, empty song: the ● button label „● CLIPS+AKK+S4“ in P1 / P2 / W (button narrowed 76 → 64 / 64 → 50 px)
import { chromium } from 'playwright';
import { NEW, BASE, OUT } from './v3-qa-v2e2reg-pw.mjs';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
for (const [name, file] of [['base', BASE], ['new', NEW]]) for (const [vp, w, h] of [['P1', 390, 844], ['P2', 375, 667], ['W', 844, 1180]]) for (const st of ['empty', 'mel']) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, deviceScaleFactor: 3, hasTouch: true, isMobile: true});
  const p = await ctx.newPage(); await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.runtime);
  await p.evaluate(async st => { const Q = window.SYNQUENZER; Q.newProject({init: true}); if (st === 'mel') { await Q.loadDemo(); Q.songFromChain([{scene: 0, bars: 2}]); } Q.songView(true); }, st);
  await p.waitForTimeout(700);
  const i = await p.evaluate(() => { const e = document.querySelector('#songView .sv-rec'); const r = e.getBoundingClientRect(); const kids = [...e.querySelectorAll('*')].map(k => { const q = k.getBoundingClientRect(); return k.className + ':' + k.textContent.trim() + ' [' + Math.round(q.left - r.left) + '..' + Math.round(q.right - r.left) + '] sw' + k.scrollWidth + '/cw' + k.clientWidth + ' ov=' + getComputedStyle(k).overflow + ' to=' + getComputedStyle(k).textOverflow; }); return {w: Math.round(r.width), h: Math.round(r.height), sw: e.scrollWidth, cw: e.clientWidth, txt: e.textContent.trim(), ov: getComputedStyle(e).overflow, kids}; });
  console.log(name, vp, st, JSON.stringify(i));
  const box = await p.evaluate(() => { const e = document.querySelector('#songView .sv-rec'); const r = e.getBoundingClientRect(); return {x: r.left - 4, y: r.top - 4, width: r.width + 8, height: r.height + 8}; });
  await p.screenshot({path: OUT + `recbtn-${name}-${vp}-${st}.png`, clip: box});
  await ctx.close();
}
await b.close();
