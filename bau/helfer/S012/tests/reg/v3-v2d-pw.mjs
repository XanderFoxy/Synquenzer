// shared launcher (copy of bau/tests/v3-v2d-pw.mjs for this machine): APP = S012, BASE = 4.23.0 base
import {createRequire} from 'module'; import path from 'path'; import {fileURLToPath} from 'url';
const rq = createRequire(import.meta.url); let PW; try { PW = rq('playwright'); } catch (e) { PW = rq('/opt/node22/lib/node_modules/playwright'); } const {chromium} = PW;
const HERE = path.dirname(fileURLToPath(import.meta.url));
export const APP = path.resolve(HERE, '../../index.html');
export const BASE = path.resolve(HERE, '../../../../werkzeug/vs-base-B.html');
export async function open(vp = {width: 390, height: 844}, file = APP, touch = false) {
  const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const ctx = await b.newContext({viewport: vp, hasTouch: touch, isMobile: touch, deviceScaleFactor: 1});
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.runtime, null, {timeout: 20000});
  await p.waitForTimeout(800);
  return {b, p, errs};
}
