// ZRL2: Teilzeiten im Worker (magsLo gesamt, Quantisierung) A/B + Treffer der Rand-Übernahme
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const A = path.resolve(process.argv[2]), B = path.resolve(process.argv[3]), SEK = +(process.env.SEK || 60), RUNDEN = +(process.env.RUNDEN || 2);
const srv = http.createServer((q, r) => { const u = q.url.split('?')[0]; if (u === '/version.json') { r.writeHead(200); r.end('{"version":"4.85.0"}'); return; }
  const p = u === '/A.html' ? A : u === '/B.html' ? B : null; if (!p) { r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': 'text/html; charset=utf-8'}); fs.createReadStream(p).pipe(r); });
await new Promise(ok => srv.listen(0, ok)); const base = 'http://127.0.0.1:' + srv.address().port;
const src = fs.readFileSync(new URL('./test-zr.mjs', import.meta.url), 'utf8');
const b = await chromium.launch();
for (let r = 0; r < RUNDEN; r++) for (const w of (r % 2 ? ['B', 'A'] : ['A', 'B'])) {
  const ctx = await b.newContext({viewport: {width: 428, height: 926}}); const p = await ctx.newPage();
  await p.goto(base + '/' + w + '.html'); await p.waitForFunction(() => typeof spk1Call === 'function', null, {timeout: 90000}); await p.waitForTimeout(500);
  const ms = await p.evaluate(async sek => {
    const sr = 44100, n = sek * sr, ch = [new Float32Array(n), new Float32Array(n)]; let s = 7; const rnd = () => (s = (s * 1103515245 + 12345) >>> 0) / 4294967296 - 0.5;
    for (let i = 0; i < n; i++) { const t = i / sr, tb = t % 0.5357; const v = 0.8 * Math.sin(2 * Math.PI * 55 * t) * 0.3 + 0.5 * Math.sin(2 * Math.PI * 60 * tb) * Math.exp(-tb * 9) + 0.1 * rnd() * Math.exp(-(t % 0.268) * 50) + 0.1 * Math.sin(2 * Math.PI * 440 * t); ch[0][i] = v; ch[1][i] = v; }
    const cr = await spk1Call('create', {name: 'D', sr, ch, grid: {bpm: 112, off: 0, ts: '4/4', from: 'test'}}, [ch[0].buffer, ch[1].buffer]);
    const t0 = performance.now(); await spk1Call('zerlegen', {doc: cr.meta ? cr.meta.id : cr.id}); return Math.round(performance.now() - t0);
  }, SEK);
  let zt = null; for (const wk of p.workers()) { try { const v = await wk.evaluate(() => self.__zt || null); if (v) zt = v; } catch (e) {} }
  console.log(JSON.stringify({w, ms, lo: zt && +zt.lo.toFixed(0), q: zt && +zt.q.toFixed(0), calls: zt && zt.calls, hit: zt && zt.hit, fr: zt && zt.fr}));
  await ctx.close();
}
await b.close(); srv.close();
