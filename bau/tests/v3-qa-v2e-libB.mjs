// QA V2e helpers (own launcher, W = 844×1180 per spec §0.4)
import { chromium } from 'playwright';
import { mk } from './v3-v2e-lib.mjs';
export { mk };
export { SETUP } from './v3-v2d2-lib.mjs';
export const APP = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/v2e-base/index.html';
export const VPS = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], W: [844, 1180]};
export async function openVp(vp, file = APP) {
  const [w, h] = VPS[vp];
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 1});
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.runtime, null, {timeout: 20000});
  await p.waitForTimeout(700);
  const cdp = await ctx.newCDPSession(p);
  return {b, p, errs, cdp};
}
export function mkCheck() {
  const res = []; const check = (id, ok, info) => { res.push({id, ok: !!ok}); console.log((ok ? 'PASS ' : 'FAIL ') + id + (info !== undefined ? ' ' + (typeof info === 'string' ? info : JSON.stringify(info)).slice(0, 900) : '')); };
  return {res, check, done: () => { const f = res.filter(r => !r.ok); console.log(`\n${res.length - f.length}/${res.length} passed` + (f.length ? ' FAILED: ' + f.map(r => r.id).join(' | ') : '')); return f.length; }};
}
