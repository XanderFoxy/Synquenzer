import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright/index.js');
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const file = path.resolve(process.argv[2]), dir = path.dirname(file);
const srv = http.createServer((q, r) => { const p = path.join(dir, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p)) { r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': 'text/html; charset=utf-8'}); fs.createReadStream(p).pipe(r); });
await new Promise(ok => srv.listen(0, ok));
const b = await chromium.launch(); 
for (const [W,H] of [[926,370],[926,428],[428,926]]) {
const ctx = await b.newContext({viewport: {width: W, height: H}, hasTouch: true, isMobile: true}), p = await ctx.newPage();
await p.goto('http://127.0.0.1:' + srv.address().port + '/' + path.basename(file)); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.clip1, null, {timeout: 60000});
const r = await p.evaluate(() => { setSongView(false); openRoll(0, 0); const e = document.elementFromPoint(250, 22); const chain = []; let x = e; for (let i = 0; i < 4 && x; i++, x = x.parentElement) chain.push(x.tagName + '#' + x.id + '.' + x.className); const R = q => { const r = q.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]; };
  return {chain, ht: R(ED.rollHT), keys: Object.keys(EL).filter(k => EL[k] && EL[k].contains && EL[k].contains(e)).slice(0, 8)}; });
console.log(W, H, JSON.stringify(r));
await ctx.close(); }
await b.close(); srv.close();
