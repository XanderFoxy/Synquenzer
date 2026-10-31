// QA K1 (musiker) helpers: launch branch K (or APP env) with touch via CDP
import {chromium} from 'playwright';
export const APP = process.env.APP || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/n5-br-K/index.html';
export const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vs-base-B.html';
export const OUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/n5-k-qa/';
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export async function open(o = {}) {
  const [w, h] = o.vp || [390, 844];
  const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required'].concat(o.args || [])});
  const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: o.dpr || 1});
  if (o.init) await ctx.addInitScript(o.init);
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('PE ' + String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + (o.file || APP)); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.runtime, null, {timeout: 30000});
  await p.waitForTimeout(o.wait || 1500);
  const cdp = await ctx.newCDPSession(p);
  const E = (f, a) => p.evaluate(f, a);
  const send = (type, pts) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: pts});
  const down = (x, y) => send('touchStart', [{x, y, id: 1}]);
  const move = (x, y) => send('touchMove', [{x, y, id: 1}]);
  const up = () => send('touchEnd', []);
  const glide = async (x0, y0, x1, y1, n = 8, ms = 16) => { for (let k = 1; k <= n; k++) { await move(x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n); await sleep(ms); } };
  const tap = async (x, y, w = 250) => { await down(x, y); await sleep(50); await up(); await sleep(w); };
  // the visible element matching selector + text regexp
  const find = (sel, re) => E(([sel, src, fl]) => { const rx = src ? new RegExp(src, fl) : null; const els = [...document.querySelectorAll(sel)].filter(e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && (!rx || rx.test((e.textContent || '').trim())); });
    return els.map(e => { const r = e.getBoundingClientRect(); return {x: r.x, y: r.y, w: r.width, h: r.height, cx: r.x + r.width / 2, cy: r.y + r.height / 2, t: (e.textContent || '').trim().slice(0, 60)}; }); }, [sel, re ? re.source : null, re ? re.flags : '']);
  const tapSel = async (sel, re, w) => { const L = await find(sel, re); if (!L.length) return null; const r = L[0]; await tap(r.cx, r.cy, w); return r; };
  const shot = async name => p.screenshot({path: OUT + name + '.png'});
  return {b, ctx, p, errs, cdp, E, send, down, move, up, glide, tap, find, tapSel, shot};
}
