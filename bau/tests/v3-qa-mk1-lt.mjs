// QA MK1 (FP-IPHONE): long tasks of the user-facing steps (first tap on MS 2000 incl. panel build, reopening the editor,
// section switches, wheel drags) at CPU x1 and x4, with the demo playing; note lateness from noteLog.
import { chromium } from 'playwright';
const FILE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-wt/index.html';
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const sleep = ms => new Promise(r => setTimeout(r, ms));
const out = [];
for (const fmt of ['L1', 'P1']) for (const rate of [1, 4]) {
  const [w, h] = fmt === 'L1' ? [844, 390] : [390, 844];
  const ctx = await browser.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  const cdp = await ctx.newCDPSession(page);
  await page.evaluate(() => { window.__lt = []; new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push({t: Math.round(e.startTime), d: Math.round(e.duration)}); }).observe({type: 'longtask'}); });
  await page.evaluate(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); });
  await sleep(600);
  // start the transport (demo song) with a real tap on play
  const play = await page.evaluate(() => { const b = document.querySelector('#playBtn, .play, [aria-label*="Start"], [aria-label*="Play"]'); if (!b) return null; const r = b.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2, l: b.getAttribute('aria-label')}; });
  if (play) { await page.touchscreen.tap(play.x, play.y); }
  await sleep(1500);
  await cdp.send('Emulation.setCPUThrottlingRate', {rate});
  const steps = [];
  const step = async (nm, f) => { const n0 = await page.evaluate(() => window.__lt.length); const t0 = Date.now(); await f(); await sleep(400 * rate); const lt = await page.evaluate(n => window.__lt.slice(n), n0); steps.push(nm + ' ' + (Date.now() - t0) + 'ms lt=' + JSON.stringify(lt.map(x => x.d))); };
  await step('tap MS 2000 (first, block cold)', async () => {
    const r = await page.evaluate(() => { const c = document.querySelector('#synthSheet .engchip button') || document.querySelector('#synthSheet .seg.eng .mkeb'); const b = c.getBoundingClientRect(); return {chip: c.parentElement.classList.contains('engchip'), x: b.x + b.width / 2, y: b.y + b.height / 2}; });
    await page.touchscreen.tap(r.x, r.y);
    if (r.chip) { await sleep(300 * rate); const m = await page.evaluate(() => { const b = document.querySelector('.pop button[data-e="mk"]').getBoundingClientRect(); return {x: b.x + b.width / 2, y: b.y + b.height / 2}; }); await page.touchscreen.tap(m.x, m.y); }
  });
  await step('close + reopen editor', async () => { await page.evaluate(() => { SYNQUENZER.closeEditor(); }); await sleep(200); await page.evaluate(() => SYNQUENZER.openEditor()); });
  await step('EDIT-WAHL 1 drag 5 positions', async () => {
    const b = await page.evaluate(() => { const r = document.querySelector('#synthSheet .mkx[data-k="w1"]').getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}; });
    await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: b.x, y: b.y, id: 1}]});
    for (let s = 1; s <= 12; s++) { await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: b.x, y: b.y + 8 * s, id: 1}]}); await sleep(16); }
    await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
  });
  await step('SHIFT on/off', async () => { for (let k = 0; k < 2; k++) { const b = await page.evaluate(() => { const r = document.querySelector('#synthSheet .mkx[data-k="shift"]').getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}; }); await page.touchscreen.tap(b.x, b.y); await sleep(100); } });
  await step('tab FX and back', async () => { for (const t of ['fx', null]) { const b = await page.evaluate(t => { const tabs = [...document.querySelectorAll('#synthSheet .sh-tabs button, #synthSheet .tab')]; const e = t ? tabs.find(x => /FX/.test(x.textContent)) : tabs[0]; const r = e.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}; }, t); await page.touchscreen.tap(b.x, b.y); await sleep(200); } });
  await cdp.send('Emulation.setCPUThrottlingRate', {rate: 1});
  const late = await page.evaluate(() => { const L = SYNQUENZER.noteLog(3000); const ls = L.filter(n => n.late != null).map(n => n.late); return {n: L.length, keys: L[0] ? Object.keys(L[0]).join(',') : '', maxLate: ls.length ? Math.max(...ls) : null}; });
  out.push(`${fmt} CPU x${rate} play=${play ? play.l : 'none'}\n  ` + steps.join('\n  ') + `\n  noteLog ${JSON.stringify(late)} errors ${JSON.stringify(errs)}`);
  await ctx.close();
}
console.log(out.join('\n'));
await browser.close();
