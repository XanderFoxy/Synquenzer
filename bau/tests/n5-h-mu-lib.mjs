// QA musiker (VC2a branch H): launch with CDP touch, helpers
import { chromium } from 'playwright';
export const APP = process.env.APP || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/n5-br-H/index.html';
export const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vs-base-B.html';
export const OUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/mu';
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export async function open(o = {}) {
  const [w, h] = o.vp || [390, 844];
  const b = o.br || await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required'].concat(o.args || [])});
  const ctx = o.ctx || await b.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 1, acceptDownloads: true});
  if (o.init) await ctx.addInitScript(o.init);
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('PE ' + String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + (o.file || APP)); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.runtime, null, {timeout: 20000});
  await p.waitForTimeout(o.wait || 1500);
  const cdp = await ctx.newCDPSession(p);
  const E = (f, a) => p.evaluate(f, a);
  const send = (type, pts) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: pts});
  const down = (x, y, id = 1) => send('touchStart', [{x, y, id}]);
  const move = (x, y, id = 1) => send('touchMove', [{x, y, id}]);
  const up = () => send('touchEnd', []);
  const glide = async (x0, y0, x1, y1, n = 6, ms = 16) => { for (let k = 1; k <= n; k++) { await move(x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n); await sleep(ms); } };
  const tap = async (x, y, w = 250) => { await down(x, y); await sleep(50); await up(); await sleep(w); };
  const hold = async (x, y, ms = 700, w = 300) => { await down(x, y); await sleep(ms); await up(); await sleep(w); };
  const rectOf = (sel, re) => E(([sel, src]) => { const rx = src ? new RegExp(src) : null; const els = [...document.querySelectorAll(sel)].filter(e => e.offsetWidth && (!rx || rx.test(e.textContent.trim()))); const e = els[0]; if (!e) return null; e.scrollIntoView && e.scrollIntoView({block: 'nearest'}); const r = e.getBoundingClientRect(); return {x: r.x, y: r.y, w: r.width, h: r.height, cx: r.x + r.width / 2, cy: r.y + r.height / 2, t: e.textContent.trim().slice(0, 40)}; }, [sel, re ? re.source : null]);
  const tapSel = async (sel, re, w) => { const r = await rectOf(sel, re); if (!r) return null; await tap(r.cx, r.cy, w); return r; };
  const evN = () => E(() => (HIST.cur ? HIST.cur.strs.length : -1));
  const evSince = n => E(n => (HIST.cur ? HIST.cur.strs.slice(n).map(s => JSON.parse(s)) : []), n);
  const drain = () => E(() => { histDrainNow(); return 1; });
  const hc = o => E(o => historyCheck(o), o);
  return {b, ctx, p, errs, cdp, E, send, down, move, up, glide, tap, hold, rectOf, tapSel, evN, evSince, drain, hc};
}
export const summ = evs => evs.map(e => `${e.u}${e.u === 'ctx' ? ':' + e.z.c : ''}[${(e.z && e.z.p || []).join('|')}] "${e.l}" d${e.d ? e.d.length : '-'}${e.c ? ' c' + e.c.length : ''}`);
