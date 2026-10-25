// QA MK1-16 / MK1-33: does the MOD wheel (and a held BEND) survive knob gestures, rotary moves, SHIFT, undo?
import { chromium } from 'playwright';
const FILE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-wt/index.html';
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const sleep = ms => new Promise(r => setTimeout(r, ms));
const ctx = await browser.newContext({viewport: {width: 844, height: 390}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
const page = await ctx.newPage();
await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
const cdp = await ctx.newCDPSession(page);
const T = (type, pts) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: pts});
await page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await sleep(800);
await page.touchscreen.tap(700, 360); await sleep(400);   // a key: audio on
const pos = await page.evaluate(() => { const c = s => { const r = document.querySelector(s).getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2, h: r.height}; };
  return {mod: c('#mkWh .mkwheel[data-w="mod"] .mwell'), bend: c('#mkWh .mkwheel[data-w="bend"] .mwell'), k0: c('#synthSheet .mkx[data-k="k0"]')}; });
// MOD wheel up to the top by touch, release
await T('touchStart', [{x: pos.mod.x, y: pos.mod.y + pos.mod.h * .45, id: 1}]); for (let s = 1; s <= 10; s++) { await T('touchMove', [{x: pos.mod.x, y: pos.mod.y + pos.mod.h * .45 - pos.mod.h * s / 10, id: 1}]); await sleep(16); } await T('touchEnd', []); await sleep(200);
const m0 = await page.evaluate(() => SYNQUENZER.mkWheel(0, 'mod'));
// a CUTOFF knob gesture
await T('touchStart', [{x: pos.k0.x, y: pos.k0.y, id: 1}]); for (let s = 1; s <= 8; s++) { await T('touchMove', [{x: pos.k0.x, y: pos.k0.y + 6 * s, id: 1}]); await sleep(16); } await T('touchEnd', []); await sleep(300);
const m1 = await page.evaluate(() => SYNQUENZER.mkWheel(0, 'mod'));
// undo of that gesture
await page.evaluate(() => SYNQUENZER.undo ? SYNQUENZER.undo() : null); await sleep(300);
const m2 = await page.evaluate(() => SYNQUENZER.mkWheel(0, 'mod'));
console.log(`MOD wheel: after drag ${m0.toFixed(3)}; after a CUTOFF gesture ${m1.toFixed(3)}; after undo ${m2.toFixed(3)} (p.mw ${await page.evaluate(() => SYNQUENZER.getSound(0).p.mw)})`);
// BEND held with finger 1 while finger 2 turns CUTOFF
await T('touchStart', [{x: pos.bend.x, y: pos.bend.y, id: 1}]); for (let s = 1; s <= 8; s++) { await T('touchMove', [{x: pos.bend.x, y: pos.bend.y - pos.bend.h * .5 * s / 8, id: 1}]); await sleep(16); }
const b0 = await page.evaluate(() => SYNQUENZER.mkWheel(0, 'bend'));
await T('touchStart', [{x: pos.bend.x, y: pos.bend.y - pos.bend.h * .5, id: 1}, {x: pos.k0.x, y: pos.k0.y, id: 2}]);
for (let s = 1; s <= 8; s++) { await T('touchMove', [{x: pos.bend.x, y: pos.bend.y - pos.bend.h * .5, id: 1}, {x: pos.k0.x, y: pos.k0.y - 6 * s, id: 2}]); await sleep(16); }
// lift only finger 2 (the knob): CDP touchEnd lists the point that ends
await T('touchEnd', [{x: pos.k0.x, y: pos.k0.y - 48, id: 2}]); await sleep(300);
const b1 = await page.evaluate(() => SYNQUENZER.mkWheel(0, 'bend'));
const sc = await page.evaluate(() => { const o = MKWH[S.tracks[0].uid || 't0']; return JSON.stringify(o); });
await T('touchEnd', []); await sleep(200);
console.log(`BEND held by finger 1: ${b0.toFixed(3)}; after finger 2 finished a CUTOFF gesture: ${b1.toFixed(3)} (MKWH ${sc})`);
await browser.close();
