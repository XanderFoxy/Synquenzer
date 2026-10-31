import { chromium } from 'playwright';
import path from 'path';
export const FILE = process.env.APP || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/n5-br-K/index.html';
export const VORG = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-mkp-vorg.html';
export const OUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qmkp';
export const FMT = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], W: [844, 1180], X: [926, 428], XH: [428, 926]};
export async function launch() { return chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']}); }
export async function open(browser, f, o = {}) {
  const [w, h] = FMT[f] || f;
  const ctx = await browser.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: f !== 'W', deviceScaleFactor: o.dpr || 1});
  const page = await ctx.newPage(); page.errs = [];
  page.on('pageerror', e => page.errs.push('PAGEERR ' + String(e.stack || e).slice(0, 400))); page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') page.errs.push(m.type() + ' ' + m.text().slice(0, 300)); });
  if (o.init) await page.addInitScript(o.init);
  await page.goto('file://' + (o.file || FILE)); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  page.cdp = await ctx.newCDPSession(page); page.ctx = ctx;
  return page;
}
export async function openMk(page, t = 0) {
  await page.evaluate(t => { SYNQUENZER.setEngine(t, 'mk'); SYNQUENZER.selectTrack(t); SYNQUENZER.openEditor(); }, t);
  await page.waitForFunction(() => window.MKUI && MKUI.PL.ready && SYNQUENZER.mkPanel(), null, {timeout: 10000}); await page.waitForTimeout(200);
}
export async function touch(page, pts, dt = 16, id = 1) {
  const c = page.cdp; const tp = ([x, y]) => [{x, y, id, radiusX: 1, radiusY: 1, force: 1}];
  await c.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: tp(pts[0])});
  for (let k = 1; k < pts.length; k++) { await page.waitForTimeout(dt); await c.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: tp(pts[k])}); }
  await page.waitForTimeout(dt); await c.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
}
export const tap = (page, x, y) => touch(page, [[x, y]], 30);
export function line(x0, y0, x1, y1, n = 12) { const a = []; for (let k = 0; k <= n; k++) a.push([x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n]); return a; }
export const panel = page => page.evaluate(() => SYNQUENZER.mkPanel());
export async function el(page, id) { const p = await panel(page); return p.elements.find(e => e.id === id); }
export const ctr = e => [e.px.x + e.px.w / 2, e.px.y + e.px.h / 2];
export async function tapSel(page, sel) { const r = await page.evaluate(s => { const e = [...document.querySelectorAll(s)].find(x => x.offsetWidth && !x.closest('[hidden]')); if (!e) return null; const q = e.getBoundingClientRect(); return [q.left + q.width / 2, q.top + q.height / 2]; }, sel); if (!r) throw new Error('no ' + sel); await tap(page, r[0], r[1]); return r; }
