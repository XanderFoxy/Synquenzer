// SX714 Test-Hilfen: App öffnen (Touch), Song bauen (wie n5-v-qm-lib, ohne MS-2000/Take)
import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('playwright');
import path from 'path'; import { fileURLToPath } from 'url';
export const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../index.html');
export const OUT = process.env.SX_OUT || '/tmp/sx714-out/';
export async function open(w, h) {
  const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const p = await b.newPage({viewport: {width: w, height: h}, deviceScaleFactor: 2, hasTouch: true, isMobile: true});
  const errs = []; p.on('pageerror', e => errs.push('PAGEERR ' + String(e) + ' ' + (e.stack || '').split('\n').slice(0, 3).join(' / '))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + APP); await p.waitForTimeout(1200);
  await p.touchscreen.tap(5, 300);
  await p.waitForFunction(() => window.AU && AU.ctx, null, {timeout: 15000}).catch(() => {});
  await p.waitForTimeout(300);
  return {b, p, errs};
}
export async function buildSong(p) {
  return p.evaluate(async () => {
    const A = SYNQUENZER; A.setMetronome && A.setMetronome(false);
    const nt = NT(), lanes = Array.from({length: nt}, () => []);
    lanes[0] = [{bar: 0, slot: 0}]; lanes[1] = [{bar: 2, slot: 0}, {bar: 6, slot: 1}]; lanes[2] = [{bar: 6, slot: 0}, {bar: 10, slot: 1}];
    lanes[4] = [{bar: 0, slot: 1}, {bar: 2, slot: 0}];
    if (typeof DRUM_T === 'number') lanes[DRUM_T] = [{bar: 0, slot: 0}];
    const mel = {5: {notes: [[24, 72], [26, 74], [28, 76], [30, 74], [32, 72]].map(([t, n]) => ({t, d: 1.5, n, v: .8}))}};
    A.setSong({bars: 12, lanes, carrier: [], mel, melodyTrack: 5, marks: [{id: 'm1', a: 0, len: 2, name: 'Intro'}, {id: 'm2', a: 2, len: 4, name: 'Strophe'}, {id: 'm3', a: 6, len: 4, name: 'Refrain'}, {id: 'm4', a: 10, len: 2, name: 'Outro'}]});
    await new Promise(r => setTimeout(r, 400));
    return {bars: S.song.bars};
  });
}
export const tapEl = async (p, sel, wait = 300) => { const e = await p.$(sel); if (!e) throw new Error('fehlt ' + sel); const q = await e.boundingBox(); await p.touchscreen.tap(q.x + q.width / 2, q.y + q.height / 2); await p.waitForTimeout(wait); return q; };
// Touch-Wisch per CDP (Playwright hat kein touch-move)
export async function swipe(p, x0, y, x1, steps = 20, ms = 16, o = {}) {
  const c = await p.context().newCDPSession(p);
  await c.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: x0, y}]});
  for (let k = 1; k <= steps; k++) { await c.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: x0 + (x1 - x0) * k / steps, y}]}); await p.waitForTimeout(ms); if (o.mid && k === Math.round(steps / 2)) await o.mid(); }
  if (o.before) await o.before();
  await c.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
  await p.waitForTimeout(200);
}
export async function hold(p, x, y, ms = 650) {
  const c = await p.context().newCDPSession(p);
  await c.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y}]});
  await p.waitForTimeout(ms);
  await c.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
  await p.waitForTimeout(300);
}
