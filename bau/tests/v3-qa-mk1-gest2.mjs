// QA MK1 debug: pointer events on a knob and on the BEND wheel under CDP touch.
import { chromium } from 'playwright';
const FILE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-wt/index.html';
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const sleep = ms => new Promise(r => setTimeout(r, ms));
const [w, h] = (process.env.SZ || '390x844').split('x').map(Number);
const ctx = await browser.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
const page = await ctx.newPage();
await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
const cdp = await ctx.newCDPSession(page);
const T = (type, pts) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: pts});
await page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); });
await sleep(800);
await page.evaluate(() => { window.__ev = []; for (const t of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'lostpointercapture', 'touchstart', 'touchend', 'touchcancel']) document.addEventListener(t, e => { const k = e.target.closest && e.target.closest('[data-k],[data-w]'); window.__ev.push(t + ':' + (e.pointerId != null ? e.pointerId : '') + ':' + (k ? (k.dataset.k || k.dataset.w) : e.target.tagName) + (e.pointerType ? ':' + e.pointerType : '')); }, true); });
const kb = await page.evaluate(() => { const e = document.querySelector('#synthSheet .mkx[data-k="k0"]'); const r = e.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2, html: e.outerHTML.slice(0, 300)}; });
console.log('k1', kb.html);
const c0 = await page.evaluate(() => SYNQUENZER.mkGet(0).t[0].f.cut);
await T('touchStart', [{x: kb.x, y: kb.y, id: 1}]);
for (let s = 1; s <= 10; s++) { await T('touchMove', [{x: kb.x, y: kb.y + 6 * s, id: 1}]); await sleep(16); }
await T('touchEnd', []); await sleep(200);
const c1 = await page.evaluate(() => SYNQUENZER.mkGet(0).t[0].f.cut); console.log('undo', await page.evaluate(() => SYNQUENZER.undoInfo().n));
console.log('knob touch drag down 60: cut', c0, '->', c1);
console.log((await page.evaluate(() => window.__ev.splice(0))).join(' '));
// mouse drag for comparison
await page.mouse.move(kb.x, kb.y); await page.mouse.down(); for (let s = 1; s <= 10; s++) await page.mouse.move(kb.x, kb.y + 6 * s); await page.mouse.up(); await sleep(200);
console.log('mouse drag down 60: cut ->', await page.evaluate(() => SYNQUENZER.mkGet(0).t[0].f.cut));
await page.evaluate(() => window.__ev.splice(0));
// VA knob by touch for comparison (the existing app knob)
// BEND wheel: finger 1 holds at the top, finger 2 taps on the wheel and lifts
const wb = await page.evaluate(() => { const r = document.querySelector('#mkWh .mkwheel[data-w="bend"] .mwell').getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2, h: r.height}; });
await T('touchStart', [{x: wb.x, y: wb.y, id: 1}]);
for (let s = 1; s <= 8; s++) { await T('touchMove', [{x: wb.x, y: wb.y - wb.h * .5 * s / 8, id: 1}]); await sleep(16); }
const b1 = await page.evaluate(() => SYNQUENZER.mkWheel(0, 'bend'));
await T('touchStart', [{x: wb.x, y: wb.y - wb.h * .5, id: 1}, {x: wb.x, y: wb.y + wb.h * .3, id: 2}]); await sleep(50);
await T('touchMove', [{x: wb.x, y: wb.y - wb.h * .5, id: 1}]); await sleep(50);
const b2 = await page.evaluate(() => SYNQUENZER.mkWheel(0, 'bend'));
console.log('bend held', b1, 'after 2nd finger tap on the wheel', b2);
console.log((await page.evaluate(() => window.__ev.splice(0))).join(' '));
await T('touchEnd', []); await sleep(200);
await browser.close();
