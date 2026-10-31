// I2K Testhilfe: App im Chromium öffnen (file://), Fehler sammeln
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright/index.js');
export const APP = new URL('../index.html', import.meta.url).pathname;
export async function open(file, o = {}) {
  const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const ctx = await b.newContext({viewport: o.vp || {width: 390, height: 844}, deviceScaleFactor: 1, hasTouch: !!o.touch, isMobile: !!o.touch});
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  if (o.init) await p.addInitScript(o.init);
  await p.goto('file://' + (file || APP) + (o.q || ''));
  await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 60000});
  return {b, p, errs};
}
export const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) process.exitCode = 1; return c; };
