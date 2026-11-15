// LT1 Spur: CDP-Trace während FFT-Wechsel (b) bzw. Ansicht-Sprung (a); listet Haupt-Faden-Aufgaben > 45 ms mit den größten Kind-Ereignissen.
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright/index.js');
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const F = path.resolve(process.argv[2]), SC = process.argv[3] || 'b';
const srv = http.createServer((q, r) => { r.writeHead(200, {'content-type': 'text/html; charset=utf-8'}); fs.createReadStream(F).pipe(r); }); await new Promise(ok => srv.listen(0, ok));
const b = await chromium.launch({args: ['--disable-renderer-backgrounding']}); const ctx = await b.newContext({viewport: {width: 926, height: 428}, hasTouch: true, isMobile: true, deviceScaleFactor: 2}); const p = await ctx.newPage();
await p.goto('http://127.0.0.1:' + srv.address().port + '/x.html'); await p.waitForFunction(() => window.SYNQUENZER && window.__spk, null, {timeout: 90000}); await p.waitForTimeout(500);
await p.evaluate(async () => { await __spk.page.open({}); const sr = 44100, n = 90 * sr, x = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / sr; x[i] = 0.15 * Math.sin(2 * Math.PI * 440 * t) * (1 + Math.sin(t)) + 0.1 * Math.sin(2 * Math.PI * (220 + 30 * Math.sin(t * 0.7)) * t); } const r = await __spk.load({name: 'LT1', sr, ch: [x]}); await __spk.page.open({id: r.meta.id}); });
await p.waitForFunction(() => { const i = __spk.page.info(); return i && !i.nodoc && i.chunks > 0 && !/Spektrum \d/.test(i.stat) && !__spk.page.ui().specQ; }, null, {timeout: 300000}); await p.waitForTimeout(1500);
const cdp = await ctx.newCDPSession(p); const ev = []; cdp.on('Tracing.dataCollected', d => ev.push(...d.value));
await cdp.send('Tracing.start', {categories: 'toplevel,devtools.timeline,v8,v8.execute,disabled-by-default-devtools.timeline,blink,gpu,cc', transferMode: 'ReportEvents'});
if (SC === 'b') { await p.evaluate(() => { const U = __spk.page.ui(); U.N = 8192; spk1SpecLoad(U); }); await p.waitForFunction(() => !__spk.page.ui().specQ, null, {timeout: 120000}); await p.waitForTimeout(1500); }
else { for (const j of [[0, 4, 100, 40], [80, 86, 110, 50], [-0.05, 90, 110, 26]]) { await p.evaluate(([t0, t1, a, z]) => { const U = __spk.page.ui(), v = U.v; v.pps = U.W / (t1 - t0); v.t0 = t0; v.rowH = U.H / (a - z); v.mTop = a; spk1Clamp(U); spk1Dirty(U, 'all'); }, j); await p.waitForTimeout(700); } }
const done = new Promise(r => cdp.once('Tracing.tracingComplete', r)); await cdp.send('Tracing.end'); await done;
const main = ev.find(e => e.name === 'thread_name' && e.args && e.args.name === 'CrRendererMain'); const pid = main.pid, tid = main.tid;
const M = ev.filter(e => e.pid === pid && e.tid === tid && e.ph === 'X').sort((a, c) => a.ts - c.ts);
const tops = M.filter(e => (e.name === 'ThreadControllerImpl::RunTask' || e.name === 'RunTask') && e.dur > 45000);
for (const t of tops) {
  const kids = M.filter(e => e !== t && e.ts >= t.ts && e.ts + (e.dur || 0) <= t.ts + t.dur && e.dur > 3000);
  const agg = new Map(); for (const k of kids) { const n = k.name + (k.args && k.args.data && (k.args.data.functionName || k.args.data.url) ? ':' + (k.args.data.functionName || '') : ''); agg.set(n, Math.max(agg.get(n) || 0, k.dur)); }
  console.log(`Aufgabe ${(t.dur / 1000).toFixed(1)} ms: ` + [...agg].sort((a, c) => c[1] - a[1]).slice(0, 14).map(([n, d]) => n + ' ' + (d / 1000).toFixed(1)).join(' | '));
}
await b.close(); srv.close();
