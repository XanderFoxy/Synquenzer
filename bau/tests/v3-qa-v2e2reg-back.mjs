// song view while ▶ SONG plays and a clip overrides (↩ SONG visible, 'tight' row): transport texts, base vs new, P1 P2 P3 L1 W
import { chromium } from 'playwright';
import { NEW, BASE, OUT } from './v3-qa-v2e2reg-pw.mjs';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
for (const [name, file] of [['base', BASE], ['new', NEW]]) for (const [vp, w, h] of [['P1', 390, 844], ['P2', 375, 667], ['P3', 320, 568], ['L1', 844, 390], ['W', 844, 1180]]) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, deviceScaleFactor: 2, hasTouch: true, isMobile: true});
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.runtime);
  await p.evaluate(async () => { const Q = window.SYNQUENZER; await Q.loadDemo(); Q.setBpm(120); Q.songFromChain([{scene: 0, bars: 4}, {scene: 1, bars: 4}]); Q.songView(true); Q.songPlay(0); });
  await p.waitForTimeout(800);
  await p.evaluate(() => window.SYNQUENZER.launchClip(1, 1)); await p.waitForTimeout(2500);
  const i = await p.evaluate(() => [...document.querySelectorAll('#songView .sv-top > *')].filter(e => e.offsetWidth).map(e => { const r = e.getBoundingClientRect(); const kids = [...e.querySelectorAll('*')].filter(k => k.getClientRects().length && k.textContent.trim()); const spill = kids.some(k => { const q = k.getBoundingClientRect(); return q.left < r.left - .5 || q.right > r.right + .5 || q.top < r.top - .5 || q.bottom > r.bottom + .5; }); return e.className.split(' ').filter(c => c.startsWith('sv-')).join('.') + ' ' + Math.round(r.width) + 'x' + Math.round(r.height) + ' "' + e.textContent.trim().replace(/\s+/g, ' ') + '"' + (e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1 || spill ? ' CLIPPED' : ''); }));
  const tight = await p.evaluate(() => document.getElementById('songView').classList.contains('tight'));
  console.log(name, vp, 'tight', tight, JSON.stringify(i), errs.length ? JSON.stringify(errs) : '');
  const box = await p.evaluate(() => { const t = document.querySelector('#songView .sv-top'); const r = t.getBoundingClientRect(); return {x: r.left, y: r.top, width: r.width, height: r.height}; });
  await p.screenshot({path: OUT + `back-${name}-${vp}.png`, clip: box});
  await ctx.close();
}
await b.close();
