// Ladezeit A/B: basis.html (rel-4750) gegen index.html (TEIL1), abwechselnd je N Läufe, 428x926. Aufruf: node laden-ab.mjs <ordner> [N]
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright/index.js');
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const dir = path.resolve(process.argv[2]), N = +(process.argv[3] || 4);
const srv = http.createServer((q, r) => { const p = path.join(dir, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': 'text/html'}); fs.createReadStream(p).pipe(r); });
await new Promise(ok => srv.listen(0, ok)); const base = 'http://127.0.0.1:' + srv.address().port + '/';
const b = await chromium.launch(), out = {'basis.html': [], 'index.html': []};
for (let i = 0; i < N; i++) for (const f of ['basis.html', 'index.html']) {
  const ctx = await b.newContext({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true}), p = await ctx.newPage();
  const t0 = Date.now(); await p.goto(base + f); await p.waitForFunction(() => window.SYNQUENZER && window.__spk && window.__spk11, null, {timeout: 90000}); out[f].push(Date.now() - t0); await ctx.close();
}
const med = a => a.slice().sort((x, y) => x - y)[a.length >> 1];
console.log(JSON.stringify({basis: out['basis.html'], teil1: out['index.html'], medBasis: med(out['basis.html']), medTeil1: med(out['index.html'])}));
await b.close(); srv.close();
