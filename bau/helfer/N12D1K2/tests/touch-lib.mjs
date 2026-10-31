// shared: page with the app, CDP touch (tap, drag with intermediate points), results
import { chromium } from 'playwright';
export const FILE = process.env.APP || new URL('../index.html', import.meta.url).pathname;
export async function app(vp = {width: 390, height: 844}, file = FILE) {
  const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const ctx = await b.newContext({viewport: vp, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForTimeout(1800);
  const cdp = await ctx.newCDPSession(p);
  const T = (type, pts) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: pts.map(([x, y], i) => ({x, y, id: i + 1, radiusX: 4, radiusY: 4, force: 1}))});
  const tap = async (x, y) => { await T('touchStart', [[x, y]]); await p.waitForTimeout(40); await T('touchEnd', []); await p.waitForTimeout(80); };
  // drag along the points (each [x, y, ms]); hold = ms before the first move
  const drag = async (pts, o = {}) => { await T('touchStart', [pts[0]]); await p.waitForTimeout(o.hold || 60);
    for (let i = 1; i < pts.length; i++) { await T('touchMove', [pts[i]]); await p.waitForTimeout(pts[i][2] || 16); }
    if (!o.keep) { await T('touchEnd', []); await p.waitForTimeout(80); } };
  const end = async () => { await T('touchEnd', []); await p.waitForTimeout(80); };
  return {b, p, cdp, T, tap, drag, end, errs};
}
export function report(name, res) { let bad = 0; for (const r of res) { if (!r.pass) bad++; console.log((r.pass ? 'OK   ' : 'FAIL ') + r.id + ' ' + r.info); } console.log(name + ': ' + (res.length - bad) + '/' + res.length + ' bestanden'); process.exitCode = bad ? 1 : 0; }
