// HARM: gemeinsame Helfer der Tests (Playwright aus der globalen Installation, kein node_modules im Repo)
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
const require = createRequire(import.meta.url);
let pw; try { pw = require('playwright'); } catch (e) { pw = require('/opt/node22/lib/node_modules/playwright'); }
export const chromium = pw.chromium;
export const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, '../../../..');
export const APP = path.resolve(HERE, '../index.html');
export async function open(file = APP, vp = {width: 428, height: 926}) {
  const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const ctx = await b.newContext({viewport: vp, deviceScaleFactor: 1});
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.runtime, null, {timeout: 30000});
  await p.waitForTimeout(500);
  return {b, ctx, p, errs};
}
export function mkCheck(name) {
  const res = [];
  const check = (id, ok, info) => { res.push({id, ok: !!ok}); console.log((ok ? 'PASS ' : 'FAIL ') + id + (info !== undefined ? ' ' + (typeof info === 'string' ? info : JSON.stringify(info)) : '')); };
  const done = () => { const f = res.filter(r => !r.ok); console.log(`\n${name || ''} ${res.length - f.length}/${res.length} bestanden` + (f.length ? ' FEHLER: ' + f.map(r => r.id).join(', ') : '')); process.exitCode = f.length ? 1 : 0; return f.length; };
  return {res, check, done};
}
