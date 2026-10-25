// QA regression MK0 (lens: regression) shared launcher
import { chromium } from 'playwright';
export const SP = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/';
export const NEW = SP + 'mk-wt/index.html', BASE = SP + 'mk-base.html', OUT = SP + 'dirigent-test/v3-mk0rg2/';
export const VP = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], W: [844, 1180]};
export async function launch() { return chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']}); }
export async function open(file, vp = 'P1', touch = true, br = null) {
  const b = br || await launch();
  const [w, h] = VP[vp] || vp;
  const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: touch, isMobile: touch && vp !== 'W', deviceScaleFactor: 1});
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push('PAGEERR ' + String(e))); p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ' ' + m.text()); });
  await p.goto('file://' + file);
  await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.runtime && window.SYNQUENZER.storage().booted, null, {timeout: 30000, polling: 20});
  await p.waitForTimeout(600);
  return {b, ctx, p, errs, close: async () => { await ctx.close(); if (!br) await b.close(); }};
}
