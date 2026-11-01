import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('playwright');
import path from 'path';
export const ROOT = path.resolve(new URL('.', import.meta.url).pathname, '../../../..');
export const APP = path.join(ROOT, 'bau/helfer/G6PA/index.html');
export const OLD = path.join(ROOT, 'bau/snapshots/R-4252.html');
export async function launch() { return chromium.launch({args: ['--autoplay-policy=no-user-gesture-required', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream']}); }
export async function open(b, file, vp) {
  const ctx = await b.newContext({viewport: vp || {width: 390, height: 844}, hasTouch: true, isMobile: true});
  const p = await ctx.newPage(); p.errs = []; p.ctx = ctx;
  p.on('pageerror', e => p.errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') p.errs.push(m.text()); });
  await p.goto('file://' + (file || APP)); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.project, null, {timeout: 20000}); await p.waitForTimeout(800);
  return p;
}
let fails = 0; export const res = [];
export function ok(id, cond, info) { res.push({id, ok: !!cond, info}); if (!cond) fails++; console.log((cond ? '✓ ' : '✗ ') + id + (info !== undefined ? '  ' + (typeof info === 'string' ? info : JSON.stringify(info)).slice(0, 400) : '')); }
export function done() { console.log(fails ? 'FEHLER: ' + fails : 'ALLES GRÜN'); process.exitCode = fails ? 1 : 0; }
