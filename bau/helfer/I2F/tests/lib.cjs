// I2f-Tests: gemeinsame Helfer (Playwright, Chromium vorinstalliert)
const {chromium} = require('playwright');
const path = require('path');
const FILE = process.env.I2F_FILE || path.resolve(__dirname, '..', 'index.html');
const FMT = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], W: [926, 428], XH: [428, 926]};
async function launch() { return chromium.launch({args: ['--autoplay-policy=no-user-gesture-required', '--disable-touch-adjustment']}); }
async function open(browser, f = 'P1', o = {}) {
  const [w, h] = FMT[f] || f;
  const ctx = await browser.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: o.dpr || 1});
  const page = await ctx.newPage(); page.errs = [];
  page.on('pageerror', e => page.errs.push(String(e.stack || e))); page.on('console', m => { if (m.type() === 'error') page.errs.push(m.text()); });
  await page.goto('file://' + (o.file || FILE));
  await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
  await page.waitForTimeout(300);
  page.cdp = await ctx.newCDPSession(page); page.ctx = ctx;
  return page;
}
// ein Finger über CDP-Touch: Punkte [[x, y], …], dt ms dazwischen
async function touch(page, pts, dt = 16, id = 1, hold = 0) {
  const c = page.cdp, tp = ([x, y]) => [{x, y, id, radiusX: 2, radiusY: 2, force: 1}];
  await c.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: tp(pts[0])});
  for (let k = 1; k < pts.length; k++) { await page.waitForTimeout(dt); await c.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: tp(pts[k])}); }
  if (hold) await page.waitForTimeout(hold);
  await page.waitForTimeout(dt); await c.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
}
const tap = (page, x, y) => touch(page, [[x, y]], 30);
function line(x0, y0, x1, y1, n = 12) { const a = []; for (let k = 0; k <= n; k++) a.push([x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n]); return a; }
// Synth-Spur t, Szene s: Clip mit Noten anlegen und die ROLLE öffnen
async function rollWith(page, notes, o = {}) {
  return page.evaluate(([notes, o]) => {
    const t = o.t == null ? 1 : o.t, s = o.s || 0;
    S.tracks[t].clips[s] = {len: o.len || 1, key: {root: 0, scale: 'ionian', src: 'auto'}, notes: notes.map(n => Object.assign({d: .5}, n))};
    clipChanged(t, s); ROLLP.view = 'roll'; openRoll(t, s); return {t, s};
  }, [notes, o]);
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
function report(name, rows) {
  let bad = 0; for (const r of rows) { console.log((r.ok ? 'OK  ' : 'FEHL') + ' ' + r.id + ' · ' + r.txt); if (!r.ok) bad++; }
  console.log(name + ': ' + (rows.length - bad) + '/' + rows.length + ' grün'); return bad;
}
module.exports = {launch, open, touch, tap, line, rollWith, sleep, report, FMT, FILE};
