// SPK8 – Seite: Zerlegen → Bass-Ebene wählen → Noten ▾ → Noten finden (im Worker): Treffer/Präzision wie im Kern, Text „einstimmig“,
// ein ↶ „Noten finden“, keine Konsolen-Fehler. Aufruf: node spk8-seite.mjs <abs. index.html>   (mess/ neben der Datei; Fotos nach ./fotos)
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

const html = fs.readFileSync(file, 'utf8'), mm = /p\.tracks\[0\]\.clips\[0\] = \{len: 1, key: K\(\), notes: (\[\[.*?\]\])\.map/.exec(html), pat = new Function('return ' + mm[1])(), beat = 60 / 112;
const truth = []; for (let bar = 0; bar < 4; bar++) for (const [t, m] of pat) truth.push({t: (bar * 4 + t) * beat, m});
const z = await p.evaluate(async () => { const r = await __spk.zerlegen(); const U = __spk.page.ui(); U.meta = r.meta; return {lids: r.lids, how: __spk.state().how}; });
ok('zerlegen-worker', z, z.how === 'worker' && !!z.lids.bass);
await p.evaluate(lid => { const U = __spk.page.ui(); U.act = lid; spk1Layers(U); spk1Dd(U, null); }, z.lids.bass); await p.waitForTimeout(300);
await tap(await btn('Noten')); await p.waitForTimeout(250);
const t0 = Date.now(); await tap(await btn('Noten ▾')); await p.waitForTimeout(250); await tap(await btn('Noten finden'));
await p.waitForFunction(() => /Noten in /.test(__spk.page.info().stat) && !__spk.page.info().busy, null, {timeout: 90000}); const ms = Date.now() - t0; await p.waitForTimeout(300);
await p.screenshot({path: path.join(fotos, '90-noten-bass-ebene.png')});
const N = await p.evaluate(lid => (__spk.page.ui().meta.teil2.notes[lid] || []).map(q => ({a: q.a, m: q.m})), z.lids.bass), stat = await p.evaluate(() => __spk.page.info().stat);
let hit = 0, good = 0; const used = new Set();
for (const g of truth) { let bi = -1, bd = 1e9; N.forEach((q, i) => { const d = Math.abs(q.a - g.t); if (!used.has(i) && d < 0.07 && d < bd && q.m === g.m) { bd = d; bi = i; } }); if (bi >= 0) { used.add(bi); hit++; } }
good = used.size;
ok('noten-bass-ebene', {treffer: hit, wahr: truth.length, gef: N.length, praez: +(good / Math.max(1, N.length)).toFixed(3), ms, stat}, hit >= 0.7 * truth.length && good >= 0.7 * N.length && /einstimmig/.test(stat));
const u = await p.evaluate(() => { const U = __spk.page.ui(); return (U.meta.undo || []).slice(-1)[0] || null; });
{ const r = await p.evaluate(() => { const e = document.querySelector('#spk1Sheet .spk1-hd .rb[data-a="undo"]'); if (!e) return null; const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
  await tap(r); await p.waitForFunction(() => !__spk.page.info().busy, null, {timeout: 30000}); await p.waitForTimeout(400);
  const n = await p.evaluate(lid => (__spk.page.ui().meta.teil2.notes[lid] || []).length, z.lids.bass); ok('noten-ein-undo', {nachUndo: n, letzter: u && (u.label || u.l || u)}, n === 0); }
ok('keine-konsolenfehler', errs.slice(0, 5), !errs.length);
console.log(`ERGEBNIS ${nOk} OK / ${nF} FEHLER`); fs.writeFileSync(path.join(dir, 'spk8-seite.json'), JSON.stringify(res, null, 1));
await b.close(); srv.close();
