// gemeinsamer Start für die BM8-Tests
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright');
import path from 'path';
export const FILE = path.resolve(new URL('..', import.meta.url).pathname, 'index.html');
export async function open(opts = {}) {
  const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const p = await b.newPage({viewport: opts.vp || {width: 428, height: 926}}); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  p.on('request', r => { if (/supabase/i.test(r.url())) errs.push('SUPABASE ' + r.url()); });
  await p.goto('file://' + FILE); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 60000});
  return {b, p, errs};
}
export const R = []; export function ok(id, cond, info) { R.push({id, ok: !!cond, info}); console.log((cond ? 'OK  ' : 'FAIL') + ' ' + id + (info !== undefined ? ' · ' + (typeof info === 'string' ? info : JSON.stringify(info)) : '')); }
export function summary() { const f = R.filter(r => !r.ok); console.log(`\n${R.length - f.length}/${R.length} OK`); return f.length; }
