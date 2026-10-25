import { chromium } from 'playwright';
export const S = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/';
export const APP = S + 'mk-wt/index.html';
export const BASE = S + 'synq-snapshots/MK0-fix.html';
export const OUT = S + 'dirigent-test/v3-qareg-mk1/';
export async function open(vp = {width: 390, height: 844}, file = APP, touch = false, extra = {}) {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext({viewport: vp, hasTouch: touch, isMobile: touch, deviceScaleFactor: 1, ...extra});
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('PE ' + String(e))); p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ' ' + m.text()); });
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.runtime, null, {timeout: 20000});
  await p.waitForTimeout(800);
  return {b, p, errs, ctx};
}
