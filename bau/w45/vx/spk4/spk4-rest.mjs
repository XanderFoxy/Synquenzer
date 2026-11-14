// SPK4 A3 – Seite: ⋯ an der Rest-Zeile, Menü „Rest aufteilen“ (3 Größen: im Bild, Tasten ≥ 44, Zeile springt nicht), Zerlegen → Rest aufteilen
// (Lead + Pads da, ein ↶, Summe = Original), keine Konsolen-Fehler. Aufruf: node spk4-rest.mjs <abs. index.html>   (mess/ neben der Datei; Fotos nach ./fotos)
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright/index.js');
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const file = path.resolve(process.argv[2]), dir = path.dirname(file), fotos = path.join(dir, 'fotos'); fs.mkdirSync(fotos, {recursive: true});
const srv = http.createServer((q, r) => { const p = path.join(dir, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': p.endsWith('.html') ? 'text/html' : 'application/octet-stream'}); fs.createReadStream(p).pipe(r); });
await new Promise(ok => srv.listen(0, ok)); const url = 'http://127.0.0.1:' + srv.address().port + '/' + path.basename(file);
const res = {}, errs = []; let nOk = 0, nF = 0;
const ok = (k, v, c) => { res[k] = {v, ok: !!c}; c ? nOk++ : nF++; console.log((c ? 'OK     ' : 'FEHLER ') + k + ' ' + JSON.stringify(v)); };
const b = await chromium.launch(), ctx = await b.newContext({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true, deviceScaleFactor: 2}), p = await ctx.newPage();
p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
await p.goto(url); await p.waitForFunction(() => window.SYNQUENZER && window.__spk, null, {timeout: 60000}); await p.waitForTimeout(1000);
const tap = async q => { if (!q) throw new Error('Knopf fehlt'); await p.touchscreen.tap(q[0], q[1]); await p.waitForTimeout(150); };
const btn = t => p.evaluate(t => { const e = [...document.querySelectorAll('#spk1Sheet button')].find(x => x.offsetParent && x.textContent.trim().startsWith(t)); if (!e) return null; e.scrollIntoView({block: 'nearest'}); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, t);
const rd = n => new Float32Array(fs.readFileSync(path.join(dir, 'mess', n + '.f32')).buffer.slice(0)), ST = ['spur0', 'spur1', 'spur2', 'spur4'].map(rd), NN = Math.max(...ST.map(x => x.length / 2));
const wav = Buffer.alloc(44 + NN * 4); wav.write('RIFF', 0); wav.writeUInt32LE(36 + NN * 4, 4); wav.write('WAVEfmt ', 8); wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(2, 22); wav.writeUInt32LE(44100, 24); wav.writeUInt32LE(176400, 28); wav.writeUInt16LE(4, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(NN * 4, 40);
for (let i = 0; i < NN * 2; i++) { let v = 0; for (const x of ST) v += x[i] || 0; wav.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(v * 32767))), 44 + i * 2); }
await p.evaluate(() => SYNQUENZER.loadDemo()); await p.waitForTimeout(300); await p.evaluate(() => openMenu()); await p.waitForTimeout(300);
await tap(await p.evaluate(() => { const e = [...document.querySelectorAll('#menu button')].find(x => /Spektral/.test(x.textContent)); e.scrollIntoView({block: 'center'}); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; })); await p.waitForTimeout(400);
{ const [fc] = await Promise.all([p.waitForEvent('filechooser', {timeout: 5000}), tap(await btn('Datei laden'))]); await fc.setFiles({name: 'Demo-Song.wav', mimeType: 'audio/wav', buffer: wav}); }
await p.waitForFunction(() => { const i = __spk.page.info(); return i && !i.nodoc && i.chunks > 0 && !/Spektrum \d/.test(i.stat); }, null, {timeout: 90000}); await p.waitForTimeout(300);

// Zerlegen
const t0 = Date.now(); await tap(await btn('Zerlegen')); await p.waitForFunction(() => /Zerlegt/.test(__spk.page.info().stat), null, {timeout: 120000}); await p.waitForTimeout(400);
const rows = () => p.evaluate(() => [...document.querySelectorAll('#spk1Sheet .spk1-lr')].map(e => { const r = e.getBoundingClientRect(), x = e.querySelector('[data-a="lmore"]'), xr = x && x.getBoundingClientRect(); return {l: e.dataset.l, h: Math.round(r.height), x: x ? [Math.round(xr.left), Math.round(xr.width), Math.round(xr.height)] : null}; }));
const R0 = await rows(), rest = R0.find(r => r.l === 'rest'), lay = R0.find(r => r.l && r.l !== 'orig' && r.l !== 'rest');
ok('rest-zeile-mehr', {rest, lay}, rest && rest.x && lay && lay.x && rest.x[0] === lay.x[0] && rest.x[1] >= 44 && rest.x[2] >= 44 && rest.h === lay.h);
const dd = () => p.evaluate(() => { const d = document.querySelector('#spk1Sheet .spk1-dd'); if (!d) return null; const W = innerWidth, H = innerHeight, r = d.getBoundingClientRect(), bs = [...d.querySelectorAll('button')].filter(e => e.offsetParent), R = bs.map(e => e.getBoundingClientRect());
  return {inV: r.left >= -0.5 && r.top >= -0.5 && r.right <= W + 0.5 && r.bottom <= H + 0.5, small: R.filter(q => q.height < 43.5).length, knopf: bs.map(e => e.textContent), txt: (d.querySelector('p') || {}).textContent}; });
const moreRest = () => p.evaluate(() => { const e = document.querySelector('#spk1Sheet .spk1-lr[data-l="rest"] [data-a="lmore"]'); e.scrollIntoView({block: 'nearest'}); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
for (const [w, h] of [[926, 428], [926, 370], [428, 926]]) {
  await p.setViewportSize({width: w, height: h}); await p.waitForTimeout(400); await p.evaluate(() => spk1Dd(__spk.page.ui(), null));
  await tap(await moreRest()); await p.waitForTimeout(250); const L = await dd(); await p.screenshot({path: path.join(fotos, `82-rest-aufteilen-${w}x${h}.png`)});
  ok('rest-menue-' + w + 'x' + h, L, L && L.inV && !L.small && L.knopf.includes('Rest aufteilen') && /Lead und Pads/.test(L.txt));
}
const sumDb = () => p.evaluate(async () => { const U = __spk.page.ui(), m = SPK1.last.meta, n = Math.min(m.n, 44100 * 8), ids = U.meta.layers.map(l => l.id).concat(['rest']);
  const O = (await spk1Call('render', {doc: SPK1.doc, mix: 'orig', a: 0, b: n})).ch; const acc = O.map(c => new Float32Array(c.length));
  for (const id of ids) { const x = (await spk1Call('render', {doc: SPK1.doc, mix: id, a: 0, b: n})).ch; x.forEach((c, i) => { for (let j = 0; j < c.length; j++) acc[i][j] += c[j]; }); }
  let e = 0, s = 0; O.forEach((c, i) => { for (let j = 0; j < c.length; j++) { e += (acc[i][j] - c[j]) ** 2; s += c[j] ** 2; } }); return +(10 * Math.log10(s / Math.max(e, 1e-20))).toFixed(1); });
const before = await p.evaluate(() => __spk.page.ui().meta.layers.map(l => l.art));
const t1 = Date.now(); await tap(await btn('Rest aufteilen')); await p.waitForFunction(() => /Rest aufgeteilt/.test(__spk.page.info().stat), null, {timeout: 120000}); await p.waitForTimeout(300);
const A = await p.evaluate(() => { const U = __spk.page.ui(); return {stat: __spk.page.info().stat, arts: U.meta.layers.map(l => l.art), undo: U.bU.getAttribute('aria-label')}; }); A.ms = Date.now() - t1; A.summeDb = await sumDb();
await p.screenshot({path: path.join(fotos, '83-rest-aufgeteilt-hochkant.png')});
ok('rest-aufteilen', A, /Lead \d+ %/.test(A.stat) && A.arts.includes('lead') && A.arts.includes('pads') && /Rest aufteilen/.test(A.undo) && A.summeDb > 60);
{ const u = await p.evaluate(() => { const r = document.querySelector('#spk1Sheet .spk1-hd .rb[data-a="undo"]').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }); await tap(u); await p.waitForFunction(() => !__spk.page.info().busy, null, {timeout: 60000}); await p.waitForTimeout(300);
  const arts = await p.evaluate(() => __spk.page.ui().meta.layers.map(l => l.art)); ok('rest-ein-undo', {vorher: before, nachUndo: arts}, JSON.stringify(arts) === JSON.stringify(before)); }
ok('keine-konsolenfehler', errs.slice(0, 5), !errs.length);
console.log(`ERGEBNIS ${nOk} OK / ${nF} FEHLER`); fs.writeFileSync(path.join(dir, 'spk4-rest.json'), JSON.stringify(res, null, 1));
await b.close(); srv.close();
