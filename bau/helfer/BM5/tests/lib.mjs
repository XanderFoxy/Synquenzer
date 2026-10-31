// BM5 test helpers: Chromium (Playwright, preinstalled), the real app fonts, CDP touch
import {createRequire} from 'module';
const require = createRequire(import.meta.url);
const {chromium} = require('playwright');
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export const VP = {XW: [926, 428], XP: [428, 926], P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375]};
const FD = 'file://' + new URL('../../../../fonts/', import.meta.url).pathname;
export async function launch() { return chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']}); }
export async function open(br, w, h, url, o = {}) {
  const ctx = await br.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: o.dpr || 1});
  const p = await ctx.newPage();
  p.errs = []; p.on('pageerror', e => p.errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') p.errs.push(m.text()); });
  await p.route(/supabase|https?:\/\//, r => { p.net = (p.net || 0) + 1; return r.abort(); });
  await p.goto(url); await p.waitForFunction(() => window.SYNQUENZER, null, {timeout: 20000});
  const f = [['Barlow Semi Condensed', 'barlow-semi-condensed', [500, 600, 700]], ['JetBrains Mono', 'jetbrains-mono', [500, 700]]];
  await p.addStyleTag({content: f.map(([fam, file, ws]) => ws.map(wt => `@font-face{font-family:"${fam}";font-style:normal;font-weight:${wt};src:url(${FD}${file}-latin-${wt}-normal.woff2) format("woff2")}`).join('')).join('')});
  await p.evaluate(async () => { await Promise.all(['500 12px "Barlow Semi Condensed"', '700 12px "Barlow Semi Condensed"', '700 12px "JetBrains Mono"'].map(s => document.fonts.load(s))); await document.fonts.ready; });
  await sleep(300);
  p.cdp = await ctx.newCDPSession(p);
  return p;
}
export async function touch(p, type, pts) { await p.cdp.send('Input.dispatchTouchEvent', {type, touchPoints: pts.map((q, k) => ({x: q[0], y: q[1], id: q[2] != null ? q[2] : k}))}); }
export async function tap(p, x, y) { await touch(p, 'touchStart', [[x, y]]); await sleep(30); await touch(p, 'touchEnd', []); await sleep(60); }
export const APP = 'file://' + new URL('../index.html', import.meta.url).pathname;
