// QA MK1: the LCD hint on the AM panel promises "2x tippen = Standard · halten = modulieren": does it hold for AM knobs?
import { chromium } from 'playwright';
const FILE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-wt/index.html';
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const sleep = ms => new Promise(r => setTimeout(r, ms));
const ctx = await browser.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
const page = await ctx.newPage();
await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
const cdp = await ctx.newCDPSession(page);
const T = (type, pts) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: pts});
const lcd = () => page.evaluate(() => { const l = document.querySelector('#synthSheet .lcd, #synthSheet .sh-bar .lcdl, #synthSheet [class*="lcd"]'); return ED.lcd ? ED.lcd.textContent.trim() : (l ? l.textContent.trim() : null); });
// VA editor first: the hint and double tap on a VA knob
await page.evaluate(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await sleep(600);
console.log('VA editor LCD:', await lcd());
await page.evaluate(() => { SYNQUENZER.closeEditor(); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.openEditor(); }); await sleep(700);
console.log('AM editor LCD on open:', await lcd());
const kb = await page.evaluate(() => { const r = document.querySelector('#synthSheet .mkx[data-k="k0"]').getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}; });
// drag CUTOFF down, then double tap it
await T('touchStart', [{x: kb.x, y: kb.y, id: 1}]); for (let s = 1; s <= 10; s++) { await T('touchMove', [{x: kb.x, y: kb.y + 8 * s, id: 1}]); await sleep(16); } await T('touchEnd', []); await sleep(400);
const c1 = await page.evaluate(() => SYNQUENZER.mkGet(0).t[0].f.cut), u1 = await page.evaluate(() => SYNQUENZER.undoInfo().n);
for (let k = 0; k < 2; k++) { await T('touchStart', [{x: kb.x, y: kb.y, id: 1}]); await sleep(40); await T('touchEnd', []); await sleep(90); }
await sleep(400);
const c2 = await page.evaluate(() => SYNQUENZER.mkGet(0).t[0].f.cut), u2 = await page.evaluate(() => SYNQUENZER.undoInfo().n);
console.log(`AM CUTOFF after drag ${c1}, after double tap ${c2} (INIT 127), undo ${u1}->${u2}; LCD now: ${await lcd()}`);
// hold 900 ms
await T('touchStart', [{x: kb.x, y: kb.y, id: 1}]); await sleep(900);
const popHold = await page.evaluate(() => { const p = document.querySelector('.pop'); return p && getComputedStyle(p).display !== 'none' ? p.textContent.trim().slice(0, 80) : null; });
await T('touchEnd', []); await sleep(300);
console.log('AM CUTOFF hold 900 ms -> popup:', popHold, '; LCD:', await lcd());
await browser.close();
