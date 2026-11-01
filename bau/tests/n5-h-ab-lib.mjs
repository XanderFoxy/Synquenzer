// Abnahme-QA VC2a (Zweig H): helpers
import { chromium } from 'playwright';
export const APP = process.env.APP || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/n5-br-H/index.html';
export const OUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test';
export async function launch(o = {}) {
  const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required'].concat(o.args || [])});
  const ctx = await b.newContext({viewport: o.viewport || {width: 390, height: 844}, hasTouch: o.touch !== false, isMobile: !!o.mobile, deviceScaleFactor: o.dpr || 1, acceptDownloads: true});
  if (o.init) await ctx.addInitScript(o.init);
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + (o.app || APP)); await p.waitForTimeout(o.wait || 2500);
  return {b, ctx, p, errs};
}
export const allEv = p => p.evaluate(async () => { histDrainNow(); const out = []; await histFlush(); await histWalk(null, e => { out.push(e); }); return out; });
export const curEv = p => p.evaluate(() => (HIST.cur ? HIST.cur.strs.map(s => JSON.parse(s)) : []));
export const nCur = p => p.evaluate(() => (HIST.cur ? HIST.cur.strs.length : 0));
export const since = (p, n) => p.evaluate(n => (HIST.cur ? HIST.cur.strs.slice(n).map(s => JSON.parse(s)) : []), n);
export const short = e => ({u: e.u, l: e.l, z: e.z && (e.z.p || e.z.c), ops: e.d ? e.d.length : 0, paths: e.d ? [...new Set(e.d.map(o => o.path.split('/').slice(0, 4).join('/')))].slice(0, 6) : [], c: e.c ? e.c.length : 0});
// real touch drag via CDP (pointerType touch), steps at ~60 Hz
export async function touchDrag(p, x0, y0, fn, ms) {
  const cdp = await p.context().newCDPSession(p);
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: x0, y: y0, id: 1}]});
  const t0 = Date.now(); let n = 0;
  while (Date.now() - t0 < ms) { const t = (Date.now() - t0) / ms; const [x, y] = fn(t); await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x, y, id: 1}]}); n++; await new Promise(r => setTimeout(r, 16)); }
  const [x, y] = fn(1); await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x, y, id: 1}]});
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
  await cdp.detach();
  return {n, ms: Date.now() - t0};
}
export async function tapXY(p, x, y) { await p.touchscreen.tap(x, y); }
export async function center(p, sel) { return p.evaluate(sel => { const e = typeof sel === 'string' ? document.querySelector(sel) : null; if (!e) return null; const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2, r.width, r.height]; }, sel); }
