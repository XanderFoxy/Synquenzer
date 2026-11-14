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
  const R = n => spk2KlRender(Array(n).fill(s), 57, 0.03, 1.23, 1.73, 48000), T = async f => { const t = performance.now(); await f(); return Math.round(performance.now() - t); };
  const pcs6 = await R(6), F = (p, x3) => spk1Call('klangFeat', {pcs: p, sr: 48000, f: 220, on: 0.03, off: 1.23, x3});
  for (let k = 0; k < 2; k++) {
    out['seq6+6_' + k] = await T(async () => { await R(6); await R(6); });
    out['par6+6_' + k] = await T(() => Promise.all([R(6), R(6)]));
    out['one12_' + k] = await T(() => R(12));
    out['feat6_x0_' + k] = await T(() => F(pcs6, 0));
    out['feat6_x1_' + k] = await T(() => F(pcs6, 1));
    out['par_render6_feat6_' + k] = await T(() => Promise.all([R(6), F(pcs6, 1)]));
  }
  return JSON.stringify(out);
}));
await b.close(); srv.close();
