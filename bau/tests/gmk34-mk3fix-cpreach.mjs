// independent repro: SHIFT + 1 copy list (.plist.mkcp) — does a touch swipe scroll it? (iPhone formats, touch emulation)
import { chromium } from 'playwright';
const FILE = new URL('../mk-wt/index.html', import.meta.url).pathname;
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
for (const [w, h, lab] of [[390, 844, 'P1'], [844, 390, 'L1']]) {
  const ctx = await browser.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await page.evaluate(async () => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor();
    for (let k = 0; k < 16; k++) { SYNQUENZER.mkSet(0, 't.0.f.cut', 30 + k * 4); await SYNQUENZER.saveSound(0, 'Src ' + String(k).padStart(2, '0'), 'new'); }
    SYNQUENZER.mkSet(0, 'mode', 1); });
  await page.waitForTimeout(500);
  const cdp = await ctx.newCDPSession(page);
  const kb = k => page.evaluate(k => { const e = document.querySelector('#synthSheet .mkx[data-k="' + k + '"]'); if (!e) return null; const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }, k);
  const tap = async p => { await page.touchscreen.tap(p[0], p[1]); await page.waitForTimeout(200); };
  const drag = async (x, y, dy, steps = 15) => {
    await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y}]});
    for (let s = 1; s <= steps; s++) { await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x, y: y - s * dy / steps}]}); await page.waitForTimeout(16); }
    await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await page.waitForTimeout(500);
  };
  const st = () => page.evaluate(() => { const l = document.querySelector('.pop .plist.mkcp'); return l ? {open: true, st: l.scrollTop, sh: l.scrollHeight, ch: l.clientHeight, rows: l.querySelectorAll('.mkcr').length} : {open: false}; });
  await tap(await kb('shift')); await tap(await kb('n0'));
  const s0 = await st();
  const mk0 = JSON.stringify(await page.evaluate(() => SYNQUENZER.mkGet(0)));
  // swipe on the middle of the list: once on a row name, once on a button, once on the gap between
  const pts = await page.evaluate(() => { const l = document.querySelector('.pop .plist.mkcp'); const rows = [...l.querySelectorAll('.mkcr')]; const lr = l.getBoundingClientRect();
    const vis = rows.filter(r => { const b = r.getBoundingClientRect(); return b.bottom < lr.bottom - 4 && b.top > lr.top; });
    const r = vis[vis.length - 1]; const nb = r.querySelector('b').getBoundingClientRect(), bt = r.querySelector('button').getBoundingClientRect();
    return {name: [nb.x + 10, nb.y + nb.height / 2], btn: [bt.x + bt.width / 2, bt.y + bt.height / 2], lastVisible: vis.length, lr: [lr.top, lr.bottom]}; });
  await drag(pts.name[0], pts.name[1], 150); const s1 = await st();
  await drag(pts.btn[0], pts.btn[1], 150); const s2 = await st();
  const copied = JSON.stringify(await page.evaluate(() => SYNQUENZER.mkGet(0))) !== mk0;
  // MK3-fix check: keep swiping until the end, then tap the last row's [T1] by touch: the last library sound is copied into T2? (Schicht, TIMBRE = T1 → copy goes to T1)
  for (let n = 0; n < 6; n++) await drag(pts.name[0], pts.name[1], 150);
  const s3 = await st();
  const last = await page.evaluate(() => { const l = document.querySelector('.pop .plist.mkcp'), rows = l.querySelectorAll('.mkcr'), r = rows[rows.length - 1], b = r.querySelector('button').getBoundingClientRect(), lr = l.getBoundingClientRect(); return {name: r.querySelector('b').textContent, x: b.x + b.width / 2, y: b.y + b.height / 2, inView: b.bottom <= lr.bottom + 1 && b.top >= lr.top - 1}; });
  await tap([last.x, last.y]); await page.waitForTimeout(300);
  const after = await page.evaluate(() => ({cut: SYNQUENZER.mkGet(0).t[0].f.cut, open: !!document.querySelector('.pop .plist.mkcp'), lcd: (document.querySelector('#synthSheet .mlcd') || {}).textContent || ''}));
  console.log(lab + ' rows=' + s0.rows + ' sh=' + s0.sh + ' ch=' + s0.ch + ' | swipe on name: st ' + s0.st + '->' + s1.st + ' open=' + s1.open + ' | swipe on [T1]: st->' + s2.st + ' open=' + s2.open + ' copied=' + copied + ' | 6 more swipes: st->' + s3.st + ' (max ' + (s0.sh - s0.ch) + ') | last row ' + last.name + ' inView=' + last.inView + ' tapped → T1 CUTOFF ' + after.cut + ' (Src 15 = 90) pop open=' + after.open + ' | errs ' + errs.length);
  // the ⋯ path
  await page.evaluate(() => { try { closePop && closePop(); } catch (e) {} });
  await ctx.close();
}
await browser.close();
