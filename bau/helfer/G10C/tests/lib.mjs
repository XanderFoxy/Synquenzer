import { createRequire } from 'module'; const require = createRequire(import.meta.url); const { chromium } = require(process.env.PW || 'playwright');
import path from 'path';
export const FILE = process.env.G10C_FILE || path.resolve(new URL('..', import.meta.url).pathname, 'index.html');
export async function boot(vp = {width: 428, height: 926}, opts = {}) {
  const b = await chromium.launch({args: [...(opts.args || []), '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required']});
  const ctx = await b.newContext({viewport: vp, hasTouch: true, isMobile: true, deviceScaleFactor: 1});
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + (opts.file || FILE)); await p.waitForTimeout(1200);
  await p.evaluate(() => { try { document.querySelectorAll('.pop').forEach(x => x.remove()); } catch (e) {} });
  return {b, p, errs};
}
// Testton: Sinus-Bursts an gegebenen Stellen (Sekunden), Rest still
export function pcmBursts(sec, bursts, sr = 48000, amp = 12000) {
  const n = Math.round(sec * sr), a = new Array(n).fill(0);
  for (const [t0, t1, g] of bursts) for (let i = Math.round(t0 * sr); i < Math.min(n, Math.round(t1 * sr)); i++) a[i] = Math.round(amp * (g || 1) * Math.sin(2 * Math.PI * 220 * i / sr) * Math.min(1, (i / sr - t0) / .01, (t1 - i / sr) / .01));
  return a;
}
export function ok(c, m) { if (!c) { console.log('FAIL', m); process.exitCode = 1; } else console.log('ok', m); }
// CDP-Touch: Finger ziehen (Wisch) / halten
export async function touchDrag(p, x0, y0, x1, y1, steps = 10, holdMs = 0) {
  const s = await p.context().newCDPSession(p);
  await s.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: x0, y: y0}]});
  if (holdMs) await p.waitForTimeout(holdMs);
  for (let i = 1; i <= steps; i++) { await s.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: x0 + (x1 - x0) * i / steps, y: y0 + (y1 - y0) * i / steps}]}); await p.waitForTimeout(16); }
  await s.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
  await s.detach();
}
export async function inject(p, n, opts = {}) {
  const ids = [];
  for (let k = 0; k < n; k++) {
    const sec = opts.sec || 2, bursts = opts.bursts ? opts.bursts(k) : [[0.1 + (k % 5) * .3, 0.4 + (k % 5) * .3]];
    const r = await p.evaluate(([a, s, len]) => SYNQUENZER.tkInject({pcm: a, scene: s, len}), [pcmBursts(sec, bursts), opts.scene || 0, opts.len || 1]);
    ids.push(r.id);
    await p.evaluate(() => new Promise(r => setTimeout(r, 3)));   // created (ms) verschieden
  }
  return ids;
}
export const sheet = (p, s = 0) => p.evaluate(s => { SYNQUENZER.tkSheet({t: SYNQUENZER.tkInfo().stimme, s}); }, s);
export const R0 = p => p.evaluate(() => ({t: SYNQUENZER.tkInfo().stimme, s: 0}));
export const labels = p => p.$$eval('.tksheet .g10c-row b', bs => bs.map(b => b.textContent));
