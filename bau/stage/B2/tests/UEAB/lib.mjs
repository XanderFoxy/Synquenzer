// UE-A/B Testhilfe: App öffnen (Touch-Emulation), Test-Song mit Teilen
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
let PW; try { PW = require('playwright'); } catch (e) { PW = require('/opt/node22/lib/node_modules/playwright'); }
const { chromium } = PW;
import path from 'path'; import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url));
export const APP = process.env.APP || path.resolve(here, '../../index.html');
export const OUT = process.env.OUT || '/tmp/claude-0/-home-user-Synquenzer/ea285464-00d9-5b38-9850-90ab7dc52da1/scratchpad/ue';
export async function open(o = {}) {
  const b = o.browser || await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const p = await (await b.newContext({viewport: {width: o.w || 428, height: o.h || 926}, deviceScaleFactor: o.dpr || 1, hasTouch: o.touch !== false, isMobile: o.touch !== false})).newPage({viewport: {width: o.w || 428, height: o.h || 926}, deviceScaleFactor: o.dpr || 1, hasTouch: o.touch !== false, isMobile: o.touch !== false});
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + (o.app || APP) + (o.q || '')); await p.waitForTimeout(o.wait || 1500);
  await p.evaluate(() => { try { ensureAudio(); } catch (e) {} });
  await p.waitForFunction(() => window.SynthHost && SynthHost.state !== 'loading' && AU.ctx, null, {timeout: 10000}).catch(() => {});
  await p.waitForTimeout(300);
  return {b, p, errs};
}
// 16 Takte: Strophe 0–4, Refrain 4–8, Strophe 8–12, Refrain 12–16 (Kanten 4, 8, 12), Drums laufen durch
export const SONG16 = {bars: 16, lanes: [[{bar: 0, slot: 0}, {bar: 4, slot: 1}, {bar: 8, slot: 0}, {bar: 12, slot: 1}], [{bar: 0, slot: 0}], [], [], [{bar: 0, slot: 0}], []],
  carrier: [], mel: {}, marks: [{id: 'M1', a: 0, len: 4, name: 'Strophe'}, {id: 'M2', a: 4, len: 4, name: 'Refrain'}, {id: 'M3', a: 8, len: 4, name: 'Strophe'}, {id: 'M4', a: 12, len: 4, name: 'Refrain'}]};
