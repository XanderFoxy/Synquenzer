// shared launcher for V2d tests
import { chromium } from 'playwright';
export const APP = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-br-MK6/index.html';
export async function open(vp = {width: 390, height: 844}, file = APP, touch = false) {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext({viewport: vp, hasTouch: touch, isMobile: touch, deviceScaleFactor: 1});
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.runtime, null, {timeout: 20000});
  await p.waitForTimeout(800);
  return {b, p, errs};
}
