// QA (abnahme) helpers for VC2a branch H: launch with CDP touch, event access
import { chromium } from 'playwright';
export const APP = process.env.APP || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/n5-br-H/index.html';
export const VPS = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], X: [926, 428]};
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export async function open(vp = 'P1', o = {}) {
  const [w, h] = VPS[vp] || vp;
  const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required'].concat(o.args || [])});
  const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 1});
  if (o.init) await ctx.addInitScript(o.init);
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('PE ' + String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + APP); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.runtime, null, {timeout: 20000});
  await p.waitForTimeout(o.wait || 1500);
  const cdp = await ctx.newCDPSession(p);
  return {b, ctx, p, errs, cdp};
}
export function T(p, cdp) {
  const E = (f, a) => p.evaluate(f, a);
  const send = (type, pts) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: pts});
  const down = (x, y, id = 1) => send('touchStart', [{x, y, id}]);
  const move = (x, y, id = 1) => send('touchMove', [{x, y, id}]);
  const up = () => send('touchEnd', []);
  const glide = async (x0, y0, x1, y1, n = 6, ms = 16) => { for (let k = 1; k <= n; k++) { await move(x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n); await sleep(ms); } };
  const tap = async (x, y, w = 220) => { await down(x, y); await sleep(40); await up(); await sleep(w); };
  const rect = q => E(q => { const e = document.querySelector(q); if (!e || !e.offsetWidth) return null; const r = e.getBoundingClientRect(); return {x: r.x, y: r.y, w: r.width, h: r.height, cx: r.x + r.width / 2, cy: r.y + r.height / 2}; }, q);
  const info = () => E(() => window.SYNQUENZER.svLayoutInfo());
  const evN = () => E(() => (HIST.cur ? HIST.cur.strs.length : -1));
  const evSince = n => E(n => HIST.cur.strs.slice(n).map(s => JSON.parse(s)), n);
  const drain = () => E(() => { histDrainNow(); return 1; });
  return {E, send, down, move, up, glide, tap, rect, info, evN, evSince, drain};
}
