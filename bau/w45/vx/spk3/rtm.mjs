import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const F = path.resolve(process.argv[2]), dir = path.dirname(F);
const srv = http.createServer((q, r) => { const p = decodeURIComponent(q.url.split('?')[0]); const f = p === '/a.html' ? F : path.join(dir, p); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': f.endsWith('.html') ? 'text/html' : 'application/octet-stream'}); fs.createReadStream(f).pipe(r); });
await new Promise(ok => srv.listen(0, ok));
const b = await chromium.launch(), p = await (await b.newContext()).newPage();
await p.goto('http://127.0.0.1:' + srv.address().port + '/a.html'); await p.waitForFunction(() => window.SYNQUENZER && window.__spk, null, {timeout: 90000}); await p.waitForTimeout(500);
console.log(await p.evaluate(async () => {
  const lg = (v, a, b) => Math.log(v / a) / Math.log(b / a);
  const u = [lg(2500, 30, 18000), 0.1, 0.5, lg(0.3, 0.005, 4), lg(0.2, 0.001, 2), lg(1, 0.005, 4), 0.8, lg(0.6, 0.005, 4), 0, 0, 0.5];
  const s = spk2KlSnd({eng: 'va', fix: {o1: 0, o2: 0}, u}); const out = {};
  for (const n of [1, 6, 12, 6, 12, 1]) { const t = performance.now(); const pcs = await spk2KlRender(Array(n).fill(s), 57, 0.03, 1.23, 1.73, 48000); const t1 = performance.now(); await spk1Call('klangFeat', {pcs, sr: 48000, f: 220, on: 0.03, off: 1.23}); out['n' + n] = (out['n' + n] || []).concat([Math.round(t1 - t), Math.round(performance.now() - t1)]); }
  return JSON.stringify(out);
}));
await b.close(); srv.close();
