// QA MK7 regression: load times: boot (DOMContentLoaded, booted), first MS 2000 editor open, base vs new, alternating runs
import { chromium } from 'playwright';
const S = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/';
const F = {base: S + 'mk6-base-4.12.0.html', new: S + 'mk-br-MK7/index.html'};
const br = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const R = {base: [], new: []};
for (let i = 0; i < +(process.argv[2] || 5); i++) for (const n of ['base', 'new']) {
  const ctx = await br.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true});
  const p = await ctx.newPage();
  await p.addInitScript(() => { window.__t0 = performance.now(); });
  await p.goto('file://' + F[n]); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000, polling: 5});
  const t = await p.evaluate(() => { const nav = performance.getEntriesByType('navigation')[0]; return {dcl: Math.round(nav.domContentLoadedEventEnd), boot: Math.round(performance.now())}; });
  await p.waitForTimeout(600);
  t.mkOpen = await p.evaluate(async () => { const Q = SYNQUENZER; const t0 = performance.now(); Q.setEngine(0, 'mk'); Q.selectTrack(0); Q.openEditor(); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); return Math.round(performance.now() - t0); });
  R[n].push(t); await ctx.close();
}
const med = (a, k) => { const s = a.map(x => x[k]).sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
for (const n of ['base', 'new']) console.log(n, 'dcl', med(R[n], 'dcl'), 'boot(ready)', med(R[n], 'boot'), 'mkOpen', med(R[n], 'mkOpen'), JSON.stringify(R[n]));
await br.close();
