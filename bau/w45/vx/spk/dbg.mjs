import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const file = path.resolve(process.argv[2]); const dir = path.dirname(file);
const srv = http.createServer((q, r) => { const p = path.join(dir, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p)) { r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': 'text/html'}); fs.createReadStream(p).pipe(r); });
await new Promise(ok => srv.listen(0, ok));
const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 428, height: 926}});
p.on('console', m => console.log('C', m.type(), m.text().slice(0, 300))); p.on('pageerror', e => console.log('E', String(e)));
await p.goto('http://127.0.0.1:' + srv.address().port + '/' + path.basename(file)); await p.waitForFunction(() => window.__spk, null, {timeout: 60000});
const r = await p.evaluate(async () => {
  const sr = 48000, n = sr * 4, L = new Float32Array(n); for (let i = 0; i < n; i++) L[i] = 0.3 * Math.sin(2 * Math.PI * 110 * i / sr);
  const r = await __spk.load({name: 'x', sr, ch: [L]}); await __spk.page.open({id: r.meta.id});
  await new Promise(ok => setTimeout(ok, 1500));
  const U = __spk.page.ui(); U.sel = [{art: 'rect', t0: 1, t1: 2, f0: 50, f1: 300, kt: 0, kf: 0}];
  try { await __spk.page.into('neu', 'gesang'); } catch (e) { return 'into ' + e; }
  await new Promise(ok => setTimeout(ok, 2500));
  let t = null; try { t = await spk1Call('tint', {doc: SPK1.doc, maxW: 4096}); } catch (e) { t = 'ERR ' + e.message; }
  return {stat: U.st.textContent, layers: U.meta.layers.length, tint: U.tint && U.tint.ids, direct: t && t.W ? {W: t.W, H: t.H, ids: t.ids} : t};
});
console.log(JSON.stringify(r)); await b.close(); srv.close();
