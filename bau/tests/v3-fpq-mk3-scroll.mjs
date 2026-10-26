// FP-TOUCH: SHIFT + 1 copy list with many library sounds: can it be scrolled by touch, and does a scroll start on a button copy?
import { chromium } from 'playwright';
const FILE = new URL('../mk-br-MK3/index.html', import.meta.url).pathname;
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
for (const [w, h, lab] of [[390, 844, 'P1'], [844, 390, 'L1']]) {
  const ctx = await browser.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 1});
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await page.evaluate(async () => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor();
    for (let k = 0; k < 16; k++) { SYNQUENZER.mkSet(0, 't.0.f.cut', 20 + k); await SYNQUENZER.saveSound(0, 'Quelle ' + String(k).padStart(2, '0'), 'new'); }
    SYNQUENZER.mkSet(0, 'mode', 1); MKUI.render(); });
  await page.waitForTimeout(400);
  const cdp = await ctx.newCDPSession(page);
  const tapAt = async (x, y) => { await page.touchscreen.tap(x, y); await page.waitForTimeout(150); };
  const kb = k => page.evaluate(k => { const e = document.querySelector('#synthSheet .mkx[data-k="' + k + '"]'); const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }, k);
  await tapAt(...await kb('shift')); await tapAt(...await kb('n0'));
  const info = await page.evaluate(() => { const l = document.querySelector('.pop .plist.mkcp'); if (!l) return null; const r = l.getBoundingClientRect(); const rows = l.querySelectorAll('.mkcr').length; const b = l.querySelectorAll('.mkcr button')[4].getBoundingClientRect(); return {rows, sh: l.scrollHeight, ch: l.clientHeight, st: l.scrollTop, box: [r.x, r.y, r.width, r.height], btn: [b.x + b.width / 2, b.y + b.height / 2], pop: (() => { const p = document.querySelector('.pop'); const q = p.getBoundingClientRect(); return [Math.round(q.y), Math.round(q.height)]; })()}; });
  const mk0 = JSON.stringify(await page.evaluate(() => SYNQUENZER.mkGet(0)));
  // a touch drag of 150 px upward on the list, starting on a [T1] button (as a thumb would)
  const [x, y] = info.btn;
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y}]});
  for (let s = 1; s <= 15; s++) { await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x, y: y - s * 10}]}); await page.waitForTimeout(16); }
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
  await page.waitForTimeout(400);
  const after = await page.evaluate(() => { const l = document.querySelector('.pop .plist.mkcp'); return l ? {st: l.scrollTop, open: true} : {open: false}; });
  const copied = JSON.stringify(await page.evaluate(() => SYNQUENZER.mkGet(0))) !== mk0;
  // a drag starting on a row name (not a button)
  let after2 = null;
  if (after.open) {
    const nm = await page.evaluate(() => { const b = document.querySelectorAll('.pop .mkcp .mkcr b')[3].getBoundingClientRect(); return [b.x + 20, b.y + b.height / 2]; });
    await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: nm[0], y: nm[1]}]});
    for (let s = 1; s <= 15; s++) { await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: nm[0], y: nm[1] - s * 10}]}); await page.waitForTimeout(16); }
    await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await page.waitForTimeout(400);
    after2 = await page.evaluate(() => { const l = document.querySelector('.pop .plist.mkcp'); return l ? l.scrollTop : null; });
  }
  // the same gesture on the EDIT-WAHL 1 list of MK1 (11 rows) for comparison
  console.log(lab + ': Kopier-Liste ' + info.rows + ' Zeilen, scrollHeight ' + info.sh + ' / sichtbar ' + info.ch + ' (Pop y ' + info.pop[0] + ' h ' + info.pop[1] + '); Wischen 150 px ab [T1]: scrollTop ' + info.st + ' → ' + after.st + ', Liste offen ' + after.open + ', kopiert ' + copied + '; Wischen ab Name: scrollTop → ' + after2 + '; Fehler ' + errs.length);
  await page.screenshot({path: new URL('./v3-fpq-mk3-copylist-' + lab + '.png', import.meta.url).pathname});
  await ctx.close();
}
await browser.close();
