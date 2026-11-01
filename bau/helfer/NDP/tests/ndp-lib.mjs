// ND-P Test-Hilfen (Playwright + Chromium, CDP-Touch). Datei: NDP_FILE oder ../index.html
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
export const FILE = process.env.NDP_FILE || path.resolve(HERE, '../index.html');
export const BASE = path.resolve(HERE, '../../../snapshots/R-4300.html');
export const OUT = path.resolve(HERE, 'bilder');
export const FMT = {H: [428, 926], Q: [926, 428], K: [428, 650]};
const EXE = '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
export async function launch() { return chromium.launch({executablePath: EXE, args: ['--autoplay-policy=no-user-gesture-required']}); }
export async function open(browser, f, o = {}) {
  const [w, h] = FMT[f] || f;
  const ctx = await browser.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: o.dpr || 1});
  const page = await ctx.newPage(); page.errs = [];
  page.on('pageerror', e => page.errs.push('PAGEERR ' + String(e.stack || e).slice(0, 400)));
  page.on('console', m => { if (m.type() === 'error') page.errs.push('error ' + m.text().slice(0, 300)); });
  if (o.init) await page.addInitScript(o.init);
  await page.goto('file://' + (o.file || FILE));
  await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
  page.cdp = await ctx.newCDPSession(page); page.ctx = ctx;
  return page;
}
export async function touch(page, pts, dt = 16, id = 1) {
  const c = page.cdp; const tp = ([x, y]) => [{x, y, id, radiusX: 1, radiusY: 1, force: 1}];
  await c.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: tp(pts[0])});
  for (let k = 1; k < pts.length; k++) { await page.waitForTimeout(dt); await c.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: tp(pts[k])}); }
  await page.waitForTimeout(dt); await c.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
}
export const tap = (page, x, y) => touch(page, [[x, y]], 30);
export async function hold(page, x, y, ms = 750) { const c = page.cdp; await c.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y, id: 1}]}); await page.waitForTimeout(ms); await c.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); }
export function line(x0, y0, x1, y1, n = 12) { const a = []; for (let k = 0; k <= n; k++) a.push([x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n]); return a; }
export const info = page => page.evaluate(() => SYNQUENZER.ndpInfo());
export const ctr = r => [r.x + r.w / 2, r.y + r.h / 2];
export async function hit(page, a, k) { const I = await info(page); const h = I.hits.find(x => x.a === a && (k == null || x.k === k)); if (!h) throw new Error('kein Element ' + a + (k ? ' ' + k : '')); return h; }
export async function tapA(page, a, k) { const h = await hit(page, a, k); await tap(page, ...ctr(h)); await page.waitForTimeout(80); return h; }
// Drum-Spur wählen, MD_NAME als Instrument (alle Pads), Platte öffnen
export async function openPlate(page, o) {
  await page.evaluate(() => { SYNQUENZER.selectTrack(4); SYNQUENZER.openEditor(); });
  await page.waitForTimeout(150);
  await page.evaluate(o => { SYNQUENZER.ndpChoose(); return SYNQUENZER.ndpOpen(o); }, o || {});
  await page.waitForFunction(() => SYNQUENZER.ndpInfo().open, null, {timeout: 10000});
  await page.waitForTimeout(250);
}
export function report(rows) { let ok = 0; for (const r of rows) { console.log((r.ok ? 'OK  ' : 'FEHL') + ' ' + r.n + (r.d ? ' – ' + r.d : '')); if (r.ok) ok++; } console.log(`== ${ok}/${rows.length}`); return ok === rows.length; }
export async function drag(page, x, y, dy, n = 14, dt = 16) { await touch(page, line(x, y, x, y + dy, n), dt); await page.waitForTimeout(60); }
export const proj = page => page.evaluate(() => SYNQUENZER.project());
export const md = (page, id) => page.evaluate(id => { const s = SYNQUENZER.project().tracks[4].sound.p.slots[id]; return s && s.md ? s.md : null; }, id);
export const kitMd = page => page.evaluate(() => SYNQUENZER.project().tracks[4].sound.p.md || null);
export async function shot(page, name) { await page.evaluate(() => { const t = document.getElementById('toast'); if (t) t.classList.remove('show'); }); await page.screenshot({path: OUT + '/' + name + '.png'}); }
