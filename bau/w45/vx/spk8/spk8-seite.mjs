// SPK8 – Seite per Touch, hochkant 428×926 und quer 926×428: Datei laden → Zerlegen (Knopf + Klappfenster) → Bass-Ebene antippen → Noten ▾ →
// Noten finden (im Worker): Treffer/Präzision wie im Kern, Text „einstimmig“, Sicherheit gestuft (nicht alle 100 %); ↶ per Touch nimmt nur
// „Noten finden“ zurück (Text „Rückgängig: Noten finden“, Ebenen bleiben), ↷ bringt die Noten wieder; keine Konsolen-Fehler.
// Aufruf: node spk8-seite.mjs <abs. index.html>   (mess/ neben der Datei; Fotos nach ./fotos)
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright/index.js');
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const file = path.resolve(process.argv[2]), dir = path.dirname(file), fotos = path.join(dir, 'fotos'); fs.mkdirSync(fotos, {recursive: true});
const srv = http.createServer((q, r) => { const p = path.join(dir, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': p.endsWith('.html') ? 'text/html' : 'application/octet-stream'}); fs.createReadStream(p).pipe(r); });
await new Promise(ok => srv.listen(0, ok)); const url = 'http://127.0.0.1:' + srv.address().port + '/' + path.basename(file);
const res = {}; let nOk = 0, nF = 0;
const ok = (k, v, c) => { res[k] = {v, ok: !!c}; c ? nOk++ : nF++; console.log((c ? 'OK     ' : 'FEHLER ') + k + ' ' + JSON.stringify(v)); };
const b = await chromium.launch();
const rd = n => new Float32Array(fs.readFileSync(path.join(dir, 'mess', n + '.f32')).buffer.slice(0)), ST = ['spur0', 'spur1', 'spur2', 'spur4'].map(rd), NN = Math.max(...ST.map(x => x.length / 2));
const wav = Buffer.alloc(44 + NN * 4); wav.write('RIFF', 0); wav.writeUInt32LE(36 + NN * 4, 4); wav.write('WAVEfmt ', 8); wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(2, 22); wav.writeUInt32LE(44100, 24); wav.writeUInt32LE(176400, 28); wav.writeUInt16LE(4, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(NN * 4, 40);
for (let i = 0; i < NN * 2; i++) { let v = 0; for (const x of ST) v += x[i] || 0; wav.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(v * 32767))), 44 + i * 2); }
const html = fs.readFileSync(file, 'utf8'), mm = /p\.tracks\[0\]\.clips\[0\] = \{len: 1, key: K\(\), notes: (\[\[.*?\]\])\.map/.exec(html), pat = new Function('return ' + mm[1])(), beat = 60 / 112;
const truth = []; for (let bar = 0; bar < 4; bar++) for (const [t, m] of pat) truth.push({t: (bar * 4 + t) * beat, m});
for (const [W, H] of [[428, 926], [926, 428]]) {
  const tag = W + 'x' + H, errs = [], ctx = await b.newContext({viewport: {width: W, height: H}, hasTouch: true, isMobile: true, deviceScaleFactor: 2}), p = await ctx.newPage();
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
  await p.goto(url); await p.waitForFunction(() => window.SYNQUENZER && window.__spk, null, {timeout: 60000}); await p.waitForTimeout(1000);
  const tap = async q => { if (!q) throw new Error('Knopf fehlt'); await p.touchscreen.tap(q[0], q[1]); await p.waitForTimeout(150); };
  const btn = t => p.evaluate(t => { const e = [...document.querySelectorAll('#spk1Sheet button')].find(x => x.offsetParent && x.textContent.trim().startsWith(t)); if (!e) return null; e.scrollIntoView({block: 'nearest', inline: 'nearest'}); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, t);
  const sel = s => p.evaluate(s => { const e = document.querySelector(s); if (!e || !e.offsetParent) return null; e.scrollIntoView({block: 'nearest', inline: 'nearest'}); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, s);
  const idle = () => p.waitForFunction(() => { const i = __spk.page.info(); return i && !i.busy; }, null, {timeout: 120000});
  await p.evaluate(() => SYNQUENZER.loadDemo()); await p.waitForTimeout(300); await p.evaluate(() => openMenu()); await p.waitForTimeout(300);
  await tap(await p.evaluate(() => { const e = [...document.querySelectorAll('#menu button')].find(x => /Spektral/.test(x.textContent)); e.scrollIntoView({block: 'center'}); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; })); await p.waitForTimeout(400);
  { const [fc] = await Promise.all([p.waitForEvent('filechooser', {timeout: 5000}), tap(await btn('Datei laden'))]); await fc.setFiles({name: 'Demo-Song.wav', mimeType: 'audio/wav', buffer: wav}); }
  await p.waitForFunction(() => { const i = __spk.page.info(); return i && !i.nodoc && i.chunks > 0 && !/Spektrum \d/.test(i.stat); }, null, {timeout: 90000}); await p.waitForTimeout(300);
  // Zerlegen per Touch (Knopf; Klappfenster → „Zerlegen (schnell …“)
  await tap(await btn('Zerlegen')); await p.waitForTimeout(300); { const zb = await btn('Zerlegen (schnell'); if (zb) await tap(zb); } await p.waitForTimeout(200); await idle(); await p.waitForTimeout(300);
  const L = await p.evaluate(() => __spk.page.ui().meta.layers.map(l => ({id: l.id, art: l.art}))), bl = (L.find(l => l.art === 'bass') || {}).id, how = await p.evaluate(() => SPK1.how);
  ok(tag + ' zerlegen-touch-worker', {ebenen: L.map(l => l.art), how}, how === 'worker' && !!bl);
  // Bass-Ebene antippen
  await tap(await sel(`#spk1Sheet .spk1-lr[data-l="${bl}"] .spk1-nm`)); await p.waitForTimeout(250);
  const act = await p.evaluate(() => __spk.page.ui().act); ok(tag + ' bass-ebene-angetippt', act, act === bl);
  let nb = await btn('Noten ▾'); if (!nb) { await tap(await btn('Noten')); await p.waitForTimeout(250); nb = await btn('Noten ▾'); }
  const t0 = Date.now(); await tap(nb); await p.waitForTimeout(250); await tap(await btn('Noten finden'));
  await p.waitForFunction(() => /Noten in /.test(__spk.page.info().stat) && !__spk.page.info().busy, null, {timeout: 90000}); const ms = Date.now() - t0; await p.waitForTimeout(300);
  await p.screenshot({path: path.join(fotos, '90-noten-bass-ebene' + (W > H ? '-quer' : '') + '.png')});
  const N = await p.evaluate(lid => (__spk.page.ui().meta.teil2.notes[lid] || []).map(q => ({a: q.a, m: q.m, conf: q.conf})), bl), stat = await p.evaluate(() => __spk.page.info().stat);
  let hit = 0; const used = new Set();
  for (const g of truth) { let bi = -1, bd = 1e9; N.forEach((q, i) => { const d = Math.abs(q.a - g.t); if (!used.has(i) && d < 0.07 && d < bd && q.m === g.m) { bd = d; bi = i; } }); if (bi >= 0) { used.add(bi); hit++; } }
  ok(tag + ' noten-bass-ebene', {treffer: hit, wahr: truth.length, gef: N.length, praez: +(used.size / Math.max(1, N.length)).toFixed(3), ms, stat}, hit >= 0.7 * truth.length && used.size >= 0.7 * N.length && /einstimmig/.test(stat));
  const cf = N.map(q => q.conf), cR = N.filter((q, i) => used.has(i)).map(q => q.conf), cF = N.filter((q, i) => !used.has(i)).map(q => q.conf), av = a => +(a.reduce((s, v) => s + v, 0) / Math.max(1, a.length)).toFixed(2);
  ok(tag + ' sicherheit-gestuft', {unter1: cf.filter(v => v < 0.995).length, richtig: av(cR), falsch: av(cF)}, cf.some(v => v < 0.995) && av(cR) > av(cF));
  // ↶ per Touch: nur „Noten finden“ zurück (Text), Ebenen bleiben; ↷ bringt die Noten wieder
  await tap(await sel('#spk1Sheet .spk1-hd .rb[data-a="undo"]')); await idle(); await p.waitForTimeout(400);
  const u = await p.evaluate(lid => ({noten: (__spk.page.ui().meta.teil2 && __spk.page.ui().meta.teil2.notes[lid] || []).length, ebenen: __spk.page.ui().meta.layers.length, stat: __spk.page.info().stat}), bl);
  ok(tag + ' undo-nur-noten-finden', Object.assign(u, {ebenenVorher: L.length}), u.noten === 0 && u.ebenen === L.length && /Rückgängig: Noten finden/.test(u.stat));
  await tap(await sel('#spk1Sheet .spk1-hd .rb[data-a="redo"]')); await idle(); await p.waitForTimeout(400);
  const nR = await p.evaluate(lid => (__spk.page.ui().meta.teil2.notes[lid] || []).length, bl); ok(tag + ' redo-noten-zurueck', nR, nR === N.length);
  ok(tag + ' keine-konsolenfehler', errs.slice(0, 5), !errs.length);
  await ctx.close();
}
console.log(`ERGEBNIS ${nOk} OK / ${nF} FEHLER`); fs.writeFileSync(path.join(dir, 'spk8-seite.json'), JSON.stringify(res, null, 1));
await b.close(); srv.close();
