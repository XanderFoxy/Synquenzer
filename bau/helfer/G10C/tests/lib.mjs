import { createRequire } from 'module'; const require = createRequire(import.meta.url); const { chromium } = require(process.env.PW || 'playwright');
import path from 'path';
export const FILE = process.env.G10C_FILE || path.resolve(new URL('..', import.meta.url).pathname, 'index.html');
export async function boot(vp = {width: 428, height: 926}, opts = {}) {
  const b = await chromium.launch({args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required']});
  const ctx = await b.newContext({viewport: vp, hasTouch: true, isMobile: true, deviceScaleFactor: 1});
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + FILE); await p.waitForTimeout(1200);
  await p.evaluate(() => { try { document.querySelectorAll('.pop').forEach(x => x.remove()); } catch (e) {} });
  return {b, p, errs};
}
// Testton: Sinus-Bursts an gegebenen Stellen (Sekunden), Rest still
export function pcmBursts(sec, bursts, sr = 48000, amp = 12000) {
  const n = Math.round(sec * sr), a = new Array(n).fill(0);
  for (const [t0, t1] of bursts) for (let i = Math.round(t0 * sr); i < Math.min(n, Math.round(t1 * sr)); i++) a[i] = Math.round(amp * Math.sin(2 * Math.PI * 220 * i / sr));
  return a;
}
export function ok(c, m) { if (!c) { console.log('FAIL', m); process.exitCode = 1; } else console.log('ok', m); }
