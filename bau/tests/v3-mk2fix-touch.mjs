// MK2-fix: the 64-row wave list scrolls by finger (CDP touch, P1 390x844 and L1 844x390, DPR 3) and a tap on a row that came
// into view by scrolling selects it (row 61 -> STEUER 2 = 120, row 64 -> 126); a swipe never selects a row
import {chromium} from 'playwright';
const FILE = process.argv[2] || new URL('../mk-wt/index.html', import.meta.url).pathname;
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
for (const [nm, w, h] of [['P1', 390, 844], ['L1', 844, 390]]) {
  const ctx = await browser.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 3});
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await page.evaluate(() => { try { ensureAudio(); } catch (e) {} SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); });
  await page.waitForTimeout(1000);
  await page.evaluate(() => { SYNQUENZER.mkSet ? SYNQUENZER.mkSet(0, 't.0.o1.w', 5) : null; });
  const cdp = await ctx.newCDPSession(page);
  const touch = async (type, x, y) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: type === 'touchEnd' ? [] : [{x, y}]});
  const tap = async (x, y) => { await touch('touchStart', x, y); await page.waitForTimeout(40); await touch('touchEnd'); await page.waitForTimeout(300); };
  const swipe = async (x, y, dy) => { await touch('touchStart', x, y); for (let s = 1; s <= 10; s++) { await touch('touchMove', x, y - dy * s / 10); await page.waitForTimeout(16); } await touch('touchEnd'); await page.waitForTimeout(350); };
  const c = k => page.evaluate(k => { const e = document.querySelector('#synthSheet .mkx[data-k="' + k + '"]'); if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}; }, k);
  // EDIT-WAHL 1 -> OSZ 1, WELLE -> Speicherwelle (by touch)
  let p = await c('w1'); await tap(p.x, p.y);
  const row = async re => page.evaluate(src => { const R = new RegExp(src); const b = [...document.querySelectorAll('.pop .plist button')].find(b => R.test(b.textContent)); if (!b) return null; const r = b.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}; }, re);
  let r = await row('OSZ ?1'); if (r) await tap(r.x, r.y);
  p = await c('k0'); await tap(p.x, p.y); r = await row('Speicherwelle'); if (r) await tap(r.x, r.y);
  ok(await page.evaluate(() => SYNQUENZER.mkGet(0).t[0].o1.w) === 5, nm + ' WELLE = Speicherwelle by touch');
  p = await c('k2'); await tap(p.x, p.y);
  const L = () => page.evaluate(() => { const e = document.querySelector('.pop .plist.mkwv'); if (!e) return null; const b = e.getBoundingClientRect(); return {x: b.x + b.width / 2, y: b.y, h: b.height, st: e.scrollTop, max: e.scrollHeight - e.clientHeight}; });
  let l = await L(); ok(!!l, nm + ' STEUER 2 tap opens the list');
  const c2a = await page.evaluate(() => SYNQUENZER.mkGet(0).t[0].o1.c2);
  await swipe(l.x, l.y + l.h * .8, l.h * .5); const l2 = await L();
  ok(l2 && l2.st > 40, nm + ' one swipe scrolls the list: scrollTop ' + l.st + ' -> ' + (l2 && l2.st));
  ok(await page.evaluate(() => SYNQUENZER.mkGet(0).t[0].o1.c2) === c2a && !!(await L()), nm + ' the swipe selects nothing and the list stays open');
  const vis = n => page.evaluate(n => { const e = document.querySelector('.pop .plist.mkwv'), b = e.getBoundingClientRect(), x = [...e.querySelectorAll('button')].find(q => q.dataset.v === String(n)), r = x.getBoundingClientRect(); return r.top >= b.top - 1 && r.bottom <= b.bottom + 1 ? {x: r.x + r.width / 2, y: r.y + r.height / 2} : null; }, n);
  let v61 = null; for (let k = 0; k < 20 && !(v61 = await vis(61)); k++) { l = await L(); await swipe(l.x, l.y + l.h * .8, l.h * .5); }
  ok(!!v61, nm + ' row 61 scrolled into view by finger (scrollTop ' + (await L()).st + ')');
  if (v61) { await tap(v61.x, v61.y); ok(await page.evaluate(() => SYNQUENZER.mkGet(0).t[0].o1.c2) === 120, nm + ' tap on row 61 -> STEUER 2 = 120 (wave 61)'); }
  p = await c('k2'); await tap(p.x, p.y);
  let v64 = null; for (let k = 0; k < 20 && !(v64 = await vis(64)); k++) { l = await L(); await swipe(l.x, l.y + l.h * .8, l.h * .5); }
  ok(!!v64, nm + ' row 64 reachable by finger');
  if (v64) { await tap(v64.x, v64.y); ok(await page.evaluate(() => SYNQUENZER.mkGet(0).t[0].o1.c2) === 126, nm + ' tap on row 64 -> STEUER 2 = 126'); }
  ok(!errs.length, nm + ' no page errors ' + errs.slice(0, 2).join(' | '));
  await ctx.close();
}
console.log(fails ? 'FAILS ' + fails : 'ALL OK'); await browser.close();
