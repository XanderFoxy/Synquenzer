// control: does the CDP touch drag scroll a plain list in this page? and the MK1 EDIT-WAHL list in L1?
import { chromium } from 'playwright';
const FILE = new URL('../mk-br-MK3/index.html', import.meta.url).pathname;
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const ctx = await browser.newContext({viewport: {width: 844, height: 390}, hasTouch: true, isMobile: true, deviceScaleFactor: 1});
const page = await ctx.newPage();
await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
await page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); });
await page.waitForTimeout(500);
const cdp = await ctx.newCDPSession(page);
const drag = async (x, y) => { await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y}]}); for (let s = 1; s <= 15; s++) { await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x, y: y - s * 10}]}); await page.waitForTimeout(16); } await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await page.waitForTimeout(400); };
// 1) a plain control list (no guardTouch), same CSS as .plist.mkcp
await page.evaluate(() => { const d = document.createElement('div'); d.id = 'ctl'; d.style.cssText = 'position:fixed;left:10px;top:10px;width:300px;height:200px;overflow-y:auto;touch-action:pan-y;overscroll-behavior:contain;z-index:99999;background:#fff'; for (let k = 0; k < 20; k++) { const b = document.createElement('button'); b.textContent = 'x' + k; b.style.cssText = 'display:block;height:44px;width:100%'; d.appendChild(b); } document.body.appendChild(d); });
await drag(150, 150); const c1 = await page.evaluate(() => document.getElementById('ctl').scrollTop);
// 2) the same control with guardTouch applied
await page.evaluate(() => { const d = document.getElementById('ctl'); d.scrollTop = 0; guardTouch(d); });
await drag(150, 150); const c2 = await page.evaluate(() => document.getElementById('ctl').scrollTop);
await page.evaluate(() => document.getElementById('ctl').remove());
// 3) the MK1 EDIT-WAHL 1 list (tap on the dial) in L1
const kb = k => page.evaluate(k => { const e = document.querySelector('#synthSheet .mkx[data-k="' + k + '"]'); const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }, k);
const w1 = await kb('w1'); await page.touchscreen.tap(w1[0], w1[1]); await page.waitForTimeout(250);
const L = await page.evaluate(() => { const p = document.querySelector('.pop'); if (!p) return null; const sc = [p, ...p.querySelectorAll('*')].find(e => e.scrollHeight > e.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(e).overflowY)); if (!sc) return {none: true, h: p.getBoundingClientRect().height}; const r = sc.getBoundingClientRect(); return {cls: sc.className, sh: sc.scrollHeight, ch: sc.clientHeight, x: r.x + r.width / 2, y: r.y + r.height - 30}; });
let c3 = null; if (L && !L.none) { await drag(L.x, L.y); c3 = await page.evaluate(c => { const p = document.querySelector('.pop'); const sc = [p, ...p.querySelectorAll('*')].find(e => e.className === c); return sc ? sc.scrollTop : null; }, L.cls); }
console.log('Kontrolle ohne guardTouch: scrollTop ' + c1 + '; mit guardTouch: ' + c2 + '; MK1 EDIT-WAHL-1-Liste L1: ' + JSON.stringify(L) + ' → scrollTop ' + c3);
await browser.close();
