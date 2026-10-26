import { chromium } from 'playwright';
import path from 'path';
export const FILE = path.resolve('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-br-MK8/index.html');
export const BASE = path.resolve('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-mk8-base-4150.html');
export const FMT = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], W: [844, 1180], PM: [428, 926], LM: [926, 428]};
export async function launch() { return chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']}); }
export async function open(browser, fmt, file, opt) {
  const [w, h] = FMT[fmt || 'P1'];
  const ctx = await browser.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: fmt !== 'W', deviceScaleFactor: 1, ...(opt || {})});
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push('pageerror ' + String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('file://' + (file || FILE)); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
  return {ctx, page, errs};
}
