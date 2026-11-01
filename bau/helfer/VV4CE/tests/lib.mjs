// VV4CE test helper: open the app (index.html next to tests/ or APP=…), unlock audio, collect console errors
import { chromium } from 'playwright';
import path from 'path';
const HERE = path.dirname(new URL(import.meta.url).pathname);
export const APP = process.env.APP || path.resolve(HERE, '../index.html');
export const OUT = process.env.OUT || path.resolve(HERE, 'out');
export async function open(o = {}) {
  const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const p = await b.newPage({viewport: {width: o.w || 428, height: o.h || 926}, deviceScaleFactor: 1});
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + APP); await p.waitForTimeout(o.wait || 1500);
  await p.mouse.click(5, 300);
  await p.waitForFunction(() => window.SynthHost && SynthHost.state !== 'loading' && AU.ctx, null, {timeout: 10000}).catch(() => {});
  await p.waitForTimeout(300);
  return {b, p, errs};
}
let fails = 0, passes = 0;
export const ok = (id, c, info) => { if (c) passes++; else fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info != null ? ' — ' + (typeof info === 'string' ? info : JSON.stringify(info)) : '')); };
export const summary = () => ({passes, fails});
