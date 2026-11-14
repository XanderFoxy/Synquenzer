// SPK4 A1 – Seite: Hinweis einstimmig/mehrstimmig, Schalter in Noten ▾ (3 Größen: Tasten ≥ 44, nichts überlappt, im Bild),
// Noten finden mehrstimmig auf dem Original (Text, ein ↶), Bass-Band bleibt einstimmig, keine Konsolen-Fehler.
// Aufruf: node spk4-ui.mjs <abs. index.html>   (mess/ neben der Datei; Fotos nach ./fotos)
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
await tap(await btn('Noten'));
const lab = () => p.evaluate(() => __spk.page.ui().n2lab.textContent);
const l0 = await lab(); await p.evaluate(() => { const U = __spk.page.ui(); U.sel = [{art: 'freq', f0: 28, f1: 400, kt: 0, kf: 0}]; spk4Lab(U); }); const l1 = await lab(); await p.evaluate(() => { const U = __spk.page.ui(); U.sel = []; spk4Lab(U); });
ok('hinweis-original', {ohneAuswahl: l0, bassBand: l1}, l0 === 'mehrstimmig' && l1 === 'einstimmig');
const dd = () => p.evaluate(() => { const d = document.querySelector('#spk1Sheet .spk1-dd'); if (!d) return null; const W = innerWidth, H = innerHeight, r = d.getBoundingClientRect(), bs = [...d.querySelectorAll('button')].filter(e => e.offsetParent), R = bs.map(e => e.getBoundingClientRect());
  const ov = []; for (let i = 0; i < R.length; i++) for (let j = i + 1; j < R.length; j++) { const a = R[i], c = R[j]; if (Math.min(a.right, c.right) - Math.max(a.left, c.left) > 0.5 && Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top) > 0.5) ov.push(i + 'x' + j); }
  const m = d.querySelector('[data-n2="mehr"]'), mr = m && m.getBoundingClientRect();
  return {inV: r.left >= -0.5 && r.top >= -0.5 && r.right <= W + 0.5 && r.bottom <= H + 0.5, small: R.filter(q => q.height < 43.5).length, ov, mehr: m ? {t: m.textContent, pr: m.getAttribute('aria-pressed'), h: Math.round(mr.height), w: Math.round(mr.width)} : null, txt: (d.querySelector('p:last-of-type') || {}).textContent}; });
for (const [w, h] of [[428, 926], [926, 428], [926, 370]]) {
  await p.setViewportSize({width: w, height: h}); await p.waitForTimeout(400); await p.evaluate(() => spk1Dd(__spk.page.ui(), null));
  await tap(await btn('Noten ▾')); await p.waitForTimeout(250); const L = await dd(); await p.screenshot({path: path.join(fotos, `80-noten-mehrstimmig-${w}x${h}.png`)});
  ok('noten-dd-' + w + 'x' + h, L, L && L.inV && !L.small && !L.ov.length && L.mehr && L.mehr.h >= 44 && /Mehrstimmig: an/.test(L.mehr.t) && /^Mehrstimmig/.test(L.txt.replace(/^\d+ bestätigt · /, '')));
}
await p.setViewportSize({width: 428, height: 926}); await p.waitForTimeout(400); await p.evaluate(() => spk1Dd(__spk.page.ui(), null));
// Schalter umlegen → aus (Text + Hinweis), wieder an; springt nicht (Dropdown-Größe gleich)
await tap(await btn('Noten ▾')); await p.waitForTimeout(250);
const sw = async () => { await p.evaluate(() => document.querySelector('#spk1Sheet .spk1-dd [data-n2="mehr"]').click()); await p.waitForTimeout(150); return p.evaluate(() => { const d = document.querySelector('#spk1Sheet .spk1-dd'), r = d.getBoundingClientRect(); return {t: d.querySelector('[data-n2="mehr"]').textContent, lab: __spk.page.ui().n2lab.textContent, w: Math.round(r.width), h: Math.round(r.height)}; }); };
const S1 = await sw(), S2 = await sw();
ok('schalter', {aus: S1, an: S2}, /aus/.test(S1.t) && S1.lab === 'einstimmig' && /an/.test(S2.t) && S2.lab === 'mehrstimmig' && S1.w === S2.w && S1.h === S2.h);
// Noten finden (Original, ohne Auswahl) → mehrstimmig, ein ↶
const t0 = Date.now(); await tap(await btn('Noten finden'));
await p.waitForFunction(() => /Noten in Original/.test(__spk.page.info().stat), null, {timeout: 90000}); await p.waitForTimeout(300);
const F = await p.evaluate(() => { const U = __spk.page.ui(), N = U.meta.teil2.notes.orig || []; let ov = 0; for (const a of N) for (const c of N) if (a !== c && Math.min(a.b, c.b) - Math.max(a.a, c.a) > 0.2) ov++; return {stat: __spk.page.info().stat, n: N.length, gleichzeitig: ov > 0, undo: U.bU.getAttribute('aria-label')}; });
F.ms = Date.now() - t0; await p.screenshot({path: path.join(fotos, '81-noten-mehrstimmig-original.png')});
ok('finden-mehrstimmig', F, /mehrstimmig/.test(F.stat) && F.n > 0 && F.gleichzeitig && /Noten finden/.test(F.undo));
{ const u = await p.evaluate(() => { const r = document.querySelector('#spk1Sheet .spk1-hd .rb[data-a="undo"]').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }); await tap(u); await p.waitForFunction(() => !__spk.page.info().busy, null, {timeout: 60000}); await p.waitForTimeout(300);
  const n = await p.evaluate(() => (__spk.page.ui().meta.teil2.notes.orig || []).length); ok('finden-ein-undo', {nachUndo: n}, n === 0); }
ok('keine-konsolenfehler', errs.slice(0, 5), !errs.length);
console.log(`ERGEBNIS ${nOk} OK / ${nF} FEHLER`); fs.writeFileSync(path.join(dir, 'spk4-ui.json'), JSON.stringify(res, null, 1));
await b.close(); srv.close();
