// QA MK4 FP-IPHONE: §15.3 cold start (navigation -> window.SYNQUENZER ready and first frame), median of 5, P1; MK2 vs MK4, x1 and x4
import {chromium} from 'playwright';
const S = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/';
const files = {MK2: S + 'synq-snapshots/MK2.html', MK4: S + 'mk-br-MK4/index.html'};
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const res = {};
for (const thr of [1, 4]) for (let rep = 0; rep < 5; rep++) for (const k of ['MK2', 'MK4']) {
  const ctx = await b.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true}); const p = await ctx.newPage();
  if (thr > 1) { const c = await ctx.newCDPSession(p); await c.send('Emulation.setCPUThrottlingRate', {rate: thr}); }
  await p.addInitScript(() => { window.__t0 = performance.now(); const chk = () => { if (window.SYNQUENZER) requestAnimationFrame(() => { window.__ready = performance.now(); }); else setTimeout(chk, 5); }; chk(); });
  await p.goto('file://' + files[k]); await p.waitForFunction(() => window.__ready, null, {timeout: 60000, polling: 10});
  const t = await p.evaluate(() => window.__ready);   // performance.now() origin = navigation start
  (res[k + 'x' + thr] = res[k + 'x' + thr] || []).push(Math.round(t));
  await ctx.close();
}
const med = a => a.slice().sort((x, y) => x - y)[a.length >> 1];
for (const k in res) console.log(k, JSON.stringify(res[k]), 'median', med(res[k]));
console.log('delta x1', med(res.MK4x1) - med(res.MK2x1), 'ms; delta x4', med(res.MK4x4) - med(res.MK2x4), 'ms');
await b.close();
