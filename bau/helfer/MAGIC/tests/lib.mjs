// gemeinsamer Starter für die MAGIC-Tests (Touch-Emulation, iPhone 12 Pro Max 428×926)
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright');
import path from 'path'; import { fileURLToPath } from 'url';
export const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'index.html');
export async function open(vp = {width: 428, height: 926}, file = APP) {
  const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const ctx = await b.newContext({viewport: vp, hasTouch: true, isMobile: true, deviceScaleFactor: 1});
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.runtime, null, {timeout: 30000});
  await p.waitForTimeout(600);
  return {b, p, ctx, errs};
}
// Clip setzen und Editor öffnen; key = {root, scale}
export async function roll(p, key, notes = [], len = 1) {
  await p.evaluate(({key, notes, len}) => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setClip(0, 0, {len, key: Object.assign({src: 'manual'}, key), notes}); Q.openRoll(0, 0); }, {key, notes, len});
  await p.waitForTimeout(500);
}
// Wischzug als echte Touch-Pointer-Folge über CDP (pointerType touch)
export async function swipe(p, pts, {stepMs = 16} = {}) {
  const cdp = await p.context().newCDPSession(p);
  const tp = (x, y) => [{x, y, id: 1, radiusX: 2, radiusY: 2, force: 1}];
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: tp(pts[0].x, pts[0].y)});
  for (let i = 1; i < pts.length; i++) { await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: tp(pts[i].x, pts[i].y)}); if (stepMs) await p.waitForTimeout(stepMs); }
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
  await p.waitForTimeout(60); await cdp.detach();
}
export const line = (a, b, n) => Array.from({length: n + 1}, (_, i) => ({x: a.x + (b.x - a.x) * i / n, y: a.y + (b.y - a.y) * i / n}));
export async function xy(p, beat, note) { return p.evaluate(({beat, note}) => window.SYNQUENZER.rollApi()._xy(beat, note), {beat, note}); }
export async function clip(p) { return p.evaluate(() => JSON.parse(JSON.stringify(window.SYNQUENZER.getClip(0, 0)))); }
export const inScale = (n, key) => ({ionian: [0, 2, 4, 5, 7, 9, 11], aeolian: [0, 2, 3, 5, 7, 8, 10]})[key.scale].includes(((n - key.root) % 12 + 12) % 12);
let fails = 0; export const ok = (c, msg) => { console.log((c ? 'OK   ' : 'FAIL ') + msg); if (!c) fails++; };
export const done = () => { console.log(fails ? `== ${fails} FEHLER` : '== alles grün'); process.exitCode = fails ? 1 : 0; };
