import { createRequire } from 'module'; import { execSync as _ex } from 'child_process';
const _req = createRequire(_ex('npm root -g').toString().trim() + '/'); const { chromium } = _req('playwright');
import path from 'path'; import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url));
export const APP = process.env.APP || path.resolve(here, '../index.html');
export const OUT = path.resolve(here, 'out');
export async function open(o = {}) {
  const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required'].concat(o.args || [])});
  const p = await b.newPage({viewport: {width: o.w || 428, height: o.h || 926}, deviceScaleFactor: o.dpr || 1, hasTouch: !!o.touch, isMobile: !!o.touch});
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + (o.app || APP) + (o.q || '')); await p.waitForTimeout(o.wait || 1500);
  if (!o.noUnlock) await p.mouse.click(5, 300);
  await p.waitForFunction(() => window.SynthHost && SynthHost.state !== 'loading' && AU.ctx, null, {timeout: 10000}).catch(() => {});
  await p.waitForTimeout(300);
  return {b, p, errs};
}
export const SONG8 = {bars: 8, lanes: [[{bar: 0, slot: 0}, {bar: 4, slot: 1}], [{bar: 0, slot: 0}], [{bar: 2, slot: 0}, {bar: 6, slot: -1}], [], [{bar: 0, slot: 0}, {bar: 4, slot: 1}], []],
  carrier: [], mel: {}, marks: [{id: 'm1', a: 0, len: 4, name: 'Strophe'}, {id: 'm2', a: 4, len: 4, name: 'Refrain'}]};
const results = [];
export function check(name, ok, info) { results.push({name, ok: !!ok, info}); console.log((ok ? 'OK   ' : 'FEHL ') + name + (info !== undefined ? '  ' + JSON.stringify(info) : '')); }
export function summary() { const n = results.filter(r => r.ok).length; console.log(`ERGEBNIS ${n}/${results.length}`); return {n, total: results.length, results}; }
