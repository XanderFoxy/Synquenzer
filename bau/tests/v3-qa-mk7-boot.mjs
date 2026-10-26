// QA MK7 FP-IPHONE: start time (§15.3, EN3-14) 4.12.0 (G-MK34-merge) vs MK7 4.15.0, fresh profile, 390x844, interleaved, CPU x1 and x4
import { chromium } from 'playwright';
import fs from 'fs';
const D = new URL('..', import.meta.url).pathname;
const NEW = D + 'mk-br-MK7/index.html', BASE = D + 'synq-snapshots/G-MK34-merge.html';
const EXE = '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', TMP = D + 'dirigent-test/v3-qa-mk7-boot-ud';
const N = +process.argv[2] || 5;
const med = a => { const s = a.slice().sort((x, y) => x - y); return s[s.length >> 1]; };
async function once(file, thr, prep) {
  fs.rmSync(TMP, {recursive: true, force: true});
  const ctx = await chromium.launchPersistentContext(TMP, {executablePath: EXE, args: ['--autoplay-policy=no-user-gesture-required'], viewport: {width: 390, height: 844}});
  const p = ctx.pages()[0] || await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)));
  if (thr > 1) { const cdp = await ctx.newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', {rate: thr}); }
  await p.addInitScript(() => { window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push(Math.round(e.duration)); }).observe({entryTypes: ['longtask']}); } catch (e) {} });
  await p.goto('file://' + file);
  await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.storage && window.SYNQUENZER.storage().booted, null, {timeout: 60000, polling: 5});
  const t = await p.evaluate(() => Math.round(performance.now()));
  await p.waitForTimeout(800); const lt = await p.evaluate(() => window.__lt.slice());
  await ctx.close(); return {t, lt, errs: errs.length};
}
for (const thr of [1, 4]) {
  const R = {base: [], neu: []}, L = {base: [], neu: []};
  for (let k = 0; k < N; k++) for (const [nm, f] of [['base', BASE], ['neu', NEW]]) { const r = await once(f, thr); R[nm].push(r.t); L[nm].push(Math.max(0, ...r.lt)); }
  const d = med(R.neu) - med(R.base);
  console.log('CPU ×' + thr + ': booted median base ' + med(R.base) + ' ms, MK7 ' + med(R.neu) + ' ms, Δ ' + d + ' ms (≤ +150, frisches Projekt ohne AM ≤ +20) · all base ' + R.base.join(' ') + ' | MK7 ' + R.neu.join(' ') + ' · längste longtask base ' + L.base.join(' ') + ' | MK7 ' + L.neu.join(' '));
}
