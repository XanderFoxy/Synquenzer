import { chromium } from 'playwright';
const FILE = new URL('../mk-wt/index.html', import.meta.url).pathname;
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
for (const order of ['wheel-first-up', 'key-first-up', 'wheel-alone']) {
  const ctx = await browser.newContext({viewport: {width: 844, height: 390}, hasTouch: true, isMobile: true});
  const page = await ctx.newPage(); await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await page.evaluate(() => ensureAudio()); await page.waitForFunction(() => SynthHost.state === 'ready');
  await page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor();
    window.__ev = []; for (const t of ['pointerdown', 'pointerup', 'pointercancel', 'lostpointercapture']) document.addEventListener(t, e => window.__ev.push(t + '#' + e.pointerId + '@' + (e.target.closest('[data-w]') ? 'wheel-' + e.target.closest('[data-w]').dataset.w : e.target.closest('#kb') ? 'kb' : e.target.tagName)), true); });
  await page.waitForTimeout(400);
  const cdp = await ctx.newCDPSession(page);
  const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: pts.map(p => ({x: p[0], y: p[1], id: p[2]}))});
  const wb = await page.evaluate(() => { const r = document.querySelector('#mkWh .mkwheel[data-w="bend"]').getBoundingClientRect(); return {x: r.x, y: r.y, w: r.width, h: r.height}; });
  const key = await page.evaluate(() => { const k = [...document.querySelectorAll('#kb .white, #kb .w, #kb [data-n]')][2]; const b = k.getBoundingClientRect(); return [b.x + b.width / 2, b.y + b.height - 10]; });
  const cx = wb.x + wb.w / 2, y0 = wb.y + wb.h / 2;
  if (order !== 'wheel-alone') { await touch('touchStart', [[key[0], key[1], 5]]); await page.waitForTimeout(100); }
  const base = order !== 'wheel-alone' ? [[key[0], key[1], 5]] : [];
  await touch(order === 'wheel-alone' ? 'touchStart' : 'touchMove', base.concat([[cx, y0, 6]]));
  for (let s = 1; s <= 10; s++) await touch('touchMove', base.concat([[cx, y0 - (wb.h / 2 + 8) * s / 10, 6]]));
  await page.waitForTimeout(100);
  const up = await page.evaluate(() => SYNQUENZER.mkWheel(0, 'bend'));
  if (order === 'wheel-first-up') { await touch('touchEnd', [[cx, wb.y - 8, 6]]); }
  else if (order === 'key-first-up') { await touch('touchMove', [[cx, wb.y - 8, 6]]); await page.waitForTimeout(100); await touch('touchEnd', []); }
  else await touch('touchEnd', []);
  await page.waitForTimeout(300);
  const after = await page.evaluate(() => [SYNQUENZER.mkWheel(0, 'bend'), window.__ev.join(' ')]);
  if (order === 'wheel-first-up') { await touch('touchEnd', []); await page.waitForTimeout(300); }
  const fin = await page.evaluate(() => SYNQUENZER.mkWheel(0, 'bend'));
  console.log(order, '| bend while dragged', up, '| 300 ms after wheel finger lifted', after[0], '| after all fingers up', fin, '\n  events:', after[1]);
  await ctx.close();
}
await browser.close();
