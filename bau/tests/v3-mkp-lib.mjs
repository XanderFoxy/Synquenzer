import { chromium } from 'playwright';
import path from 'path';
export const FMT = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], W: [844, 1180], X: [926, 428], XH: [428, 926]};
export async function launch() { return chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required', '--disable-touch-adjustment']}); }
export async function open(browser, file, f, o = {}) {
  const [w, h] = FMT[f] || f;
  const ctx = await browser.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: f !== 'W', deviceScaleFactor: o.dpr || 1});
  const page = await ctx.newPage(); page.errs = [];
  page.on('pageerror', e => page.errs.push(String(e.stack || e))); page.on('console', m => { if (m.type() === 'error') page.errs.push(m.text()); });
  if (o.init) await page.addInitScript(o.init);
  await page.goto('file://' + path.resolve(file)); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  if (!o.noMk) { await page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await page.waitForFunction(() => window.MKUI && MKUI.PL.ready && SYNQUENZER.mkPanel(), null, {timeout: 10000}); await page.waitForTimeout(150); }
  page.cdp = await ctx.newCDPSession(page); page.ctx = ctx;
  return page;
}
// one finger: points [[x, y], ...] with dt ms between
export async function touch(page, pts, dt = 16, id = 1) {
  const c = page.cdp; const tp = ([x, y]) => [{x, y, id, radiusX: 2, radiusY: 2, force: 1}];
  await c.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: tp(pts[0])});
  for (let k = 1; k < pts.length; k++) { await page.waitForTimeout(dt); await c.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: tp(pts[k])}); }
  await page.waitForTimeout(dt); await c.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
}
export const tap = (page, x, y) => touch(page, [[x, y]], 30);
export function line(x0, y0, x1, y1, n = 12) { const a = []; for (let k = 0; k <= n; k++) a.push([x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n]); return a; }
export const panel = page => page.evaluate(() => SYNQUENZER.mkPanel());
export async function el(page, id) { const p = await panel(page); return p.elements.find(e => e.id === id); }
export const ctr = e => [e.px.x + e.px.w / 2, e.px.y + e.px.h / 2];
