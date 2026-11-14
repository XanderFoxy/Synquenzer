import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const file = path.resolve(process.argv[2]), dir = path.dirname(file);
const srv = http.createServer((q, r) => { const p = path.join(dir, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': p.endsWith('.html') ? 'text/html' : 'application/octet-stream'}); fs.createReadStream(p).pipe(r); });
await new Promise(ok => srv.listen(0, ok));
const b = await chromium.launch(), p = await (await b.newContext()).newPage();
await p.goto('http://127.0.0.1:' + srv.address().port + '/' + path.basename(file)); await p.waitForFunction(() => window.__spk, null, {timeout: 60000});
const out = await p.evaluate(async () => {
  const K = __spk.spk2.klang, lg = (v, a, b) => Math.log(v / a) / Math.log(b / a), res = [];
  for (const [aD, aS, aR] of [[0.3, 0.6, 0.2], [0.1, 0.6, 0.5], [0.6, 0.3, 1]]) {
    const u = [1, 0, 0.5, 0.5, lg(0.005, 0.001, 2), lg(aD, 0.005, 4), aS, lg(aR, 0.005, 4), 0, 0, 0.5];
    const snd = K.snd('va', {o1: 0, o2: 1}, u), [x] = await K.render([snd], 45, 0.03, 0.83, 2.0, 48000);
    const r = await spk1Call('klangFeat', {pcs: [x], sr: 48000, f: 110, on: 0.03, off: 0.83});
    res.push({aD, aS, aR, adsr: r.fs[0].adsr, env: r.fs[0].env.filter((v, i) => i % 4 === 0)});
  }
  return res;
});
for (const r of out) console.log(JSON.stringify(r));
await b.close(); srv.close();
