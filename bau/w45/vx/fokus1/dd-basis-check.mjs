// Prüft an basis.html: ändert bloßes Öffnen/Schließen von „Ansicht ▾“ das Bild? (Ursache für die erste Bild-Abweichung)
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright/index.js');
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const file = path.resolve(process.argv[2]), dir = path.dirname(file);
const srv = http.createServer((q, r) => { const p = path.join(dir, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': 'text/html; charset=utf-8'}); fs.createReadStream(p).pipe(r); });
await new Promise(ok => srv.listen(0, ok));
const TOUCH = process.env.TOUCH === '1';
const b = await chromium.launch(), ctx = await b.newContext({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true, deviceScaleFactor: 2}), p = await ctx.newPage();
await p.goto('http://127.0.0.1:' + srv.address().port + '/' + path.basename(file)); await p.waitForFunction(() => window.__spk, null, {timeout: 90000}); await p.waitForTimeout(500);
const out = await p.evaluate(async () => {
  await __spk.page.open({}); const sr = 44100, n = 14 * sr, x = new Float32Array(n); for (let i = 2 * sr; i < 6 * sr; i++) for (let h = 1; h <= 8; h++) x[i] += 0.3 / h * Math.sin(2 * Math.PI * 220 * h * i / sr);
  const r = await __spk.load({name: 't', sr, ch: [x]}); await __spk.page.open({id: r.meta.id});
  const U = __spk.page.ui(); for (let i = 0; i < 200 && (U.specQ || !U.spec || !U.spec.info); i++) await new Promise(o => setTimeout(o, 100));
  const z = await __spk.mask({von: 'orig', nach: 'neu', art: 'bass', modus: 'verschieben', sel: [{art: 'freq', f0: 180, f1: 260, kt: 0, kf: 0}]}); spk1Got(U, z); spk1TintLoad(U);
  await new Promise(o => setTimeout(o, 1500));
  const img = () => { U.dg = true; spk1Frame(U); const gl = U.gl.gl, px = new Uint8Array(U.cw * U.ch * 4); gl.readPixels(0, 0, U.cw, U.ch, gl.RGBA, gl.UNSIGNED_BYTE, px); let h = 0x811c9dc5; for (let i = 0; i < px.length; i++) { h ^= px[i]; h = Math.imul(h, 16777619); } return (h >>> 0).toString(16); };
  window.__img = img; return {h1: img()};
});
if (TOUCH) {
  const cdp = await ctx.newCDPSession(p), touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: pts.map((q, i) => ({x: q[0], y: q[1], id: i, radiusX: 2, radiusY: 2, force: 1}))});
  const tap = async q => { await touch('touchStart', [q]); await p.waitForTimeout(50); await touch('touchEnd', []); await p.waitForTimeout(300); };
  const pos = s => p.evaluate(s => { const e = document.querySelector(s); e.scrollIntoView({block: 'nearest', inline: 'nearest'}); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, s);
  out.nurScroll = await p.evaluate(() => __img());
  await tap(await pos('#spk1Sheet [data-a="view"]')); out.offen = await p.evaluate(() => [!!__spk.page.ui().dd, __img()]);
  await tap(await pos('#spk1Sheet .spk1-st')); out.zu = await p.evaluate(() => [!!__spk.page.ui().dd, __img()]);
  out.zu2 = await p.evaluate(async () => { await new Promise(o => setTimeout(o, 500)); return __img(); });
}
console.log(JSON.stringify(out));
await b.close(); srv.close();
