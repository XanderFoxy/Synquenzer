// FP-TOUCH: the new lists (STIMMUNG 10, GRUNDTON 12, EINZELN/SCHICHT 3, STIMMEN 3): all rows reachable (visible or touch-scrollable), rows >= 44
import { chromium } from 'playwright';
const FILE = new URL('../mk-br-MK3/index.html', import.meta.url).pathname;
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
for (const [w, h, lab] of [[390, 844, 'P1'], [844, 390, 'L1'], [667, 375, 'L2'], [320, 568, 'P3']]) {
  const ctx = await browser.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true});
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); });
  await page.waitForTimeout(500);
  const cdp = await ctx.newCDPSession(page);
  const out = [];
  for (const [nm, setup, knob] of [['STIMMUNG', () => { MKUI.setWahl(2, 9); MKUI.render(); }, 'k0'], ['GRUNDTON', () => { MKUI.setWahl(2, 9); MKUI.render(); }, 'k1'], ['EINZELN', () => { MKUI.setWahl(1, 0); MKUI.render(); }, 'k1'], ['STIMMEN', () => { SYNQUENZER.mkSet(0, 'mode', 1); MKUI.setWahl(1, 0); MKUI.P.shift = 1; MKUI.render(); }, 'k1']]) {
    await page.evaluate(() => { try { closePop(); } catch (e) {} });
    await page.evaluate(setup); await page.waitForTimeout(150);
    const b = await page.evaluate(k => { const e = document.querySelector('#synthSheet .mkx[data-k="' + k + '"]'); if (!e) return null; const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }, knob);
    if (!b) { out.push(nm + ': kein ' + knob); continue; }
    await page.touchscreen.tap(b[0], b[1]); await page.waitForTimeout(250);
    const r = await page.evaluate(() => { const p = document.querySelector('.pop'); if (!p) return null; const bs = [...p.querySelectorAll('button')]; const H = innerHeight;
      const vis = bs.filter(x => { const q = x.getBoundingClientRect(); return q.top >= 0 && q.bottom <= H + .5; });
      const sc = [p, ...p.querySelectorAll('*')].find(e => e.scrollHeight > e.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(e).overflowY));
      const clip = bs.filter(x => { const q = x.getBoundingClientRect(), pr = (sc || p).getBoundingClientRect(); return q.bottom > pr.bottom + 1 || q.top < pr.top - 1; });
      return {n: bs.length, minH: Math.min(...bs.map(x => Math.round(x.getBoundingClientRect().height))), inView: vis.length - clip.length, clipped: clip.length, scroller: sc ? sc.className + ' ' + sc.scrollHeight + '/' + sc.clientHeight : null, sc0: sc ? sc.scrollTop : null, mid: sc ? (() => { const q = sc.getBoundingClientRect(); return [q.x + q.width / 2, q.y + q.height * .7]; })() : null}; });
    if (!r) { out.push(nm + ': keine Liste'); continue; }
    let st = null;
    if (r.mid) { const [x, y] = r.mid; await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y}]}); for (let s = 1; s <= 12; s++) { await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x, y: y - s * 10}]}); await page.waitForTimeout(16); } await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await page.waitForTimeout(300);
      st = await page.evaluate(() => { const p = document.querySelector('.pop'); if (!p) return 'zu'; const sc = [p, ...p.querySelectorAll('*')].find(e => e.scrollHeight > e.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(e).overflowY)); return sc ? sc.scrollTop : null; }); }
    out.push(nm + ': ' + r.n + ' Zeilen, min h ' + r.minH + ', sichtbar ' + r.inView + ', verdeckt ' + r.clipped + (r.scroller ? ', Scroller ' + r.scroller + ', Wischen scrollTop ' + r.sc0 + '→' + st : ''));
  }
  console.log(lab + ' | ' + out.join(' | ') + ' | Fehler ' + errs.length);
  await ctx.close();
}
await browser.close();
