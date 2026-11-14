// SPK6 Seiten-Test (Playwright, Touch): Ebenen-Menü ⋯ → Werkstatt (Duplizieren, Transponieren, Chor, Effekte), Noten-Klappfenster → Umsetzen,
// Trefferflächen ≥ 36 px hochkant 428×926 und quer 926×428, Abspielen im Worker mit Audio-Ebenen/Effekten, ↶, ZIP rund (Audio mit), keine Fehler.
// Aufruf: node spk6-ui-test.mjs <abs. index.html>   → spk6-ui-test.json, Fotos fotos/spk6-*.png
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const file = path.resolve(process.argv[2] || 'index.html'), dir = path.dirname(file), fotos = path.join(dir, 'fotos'); fs.mkdirSync(fotos, {recursive: true});
const srv = http.createServer((q, r) => { const p = path.join(dir, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': p.endsWith('.html') ? 'text/html' : 'application/octet-stream'}); fs.createReadStream(p).pipe(r); });
await new Promise(ok => srv.listen(0, ok));
const url = 'http://127.0.0.1:' + srv.address().port + '/' + path.basename(file), res = {}, errs = [], T0 = Date.now(); let fails = 0;
const ok = (k, v, cond) => { res[k] = {v, ok: !!cond}; if (!cond) fails++; console.log((cond ? 'OK     ' : 'FEHLER ') + k + ' ' + JSON.stringify(v)); };
const b = await chromium.launch();
async function page(w, h) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 2}), p = await ctx.newPage();
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
  await p.goto(url); await p.waitForFunction(() => window.SYNQUENZER && window.__spk && window.__spk6, null, {timeout: 60000}); await p.waitForTimeout(800);
  return {ctx, p, tap: async q => { await p.touchscreen.tap(q[0], q[1]); await p.waitForTimeout(200); }};
}
const btn = (p, sel) => p.evaluate(s => { const e = [...document.querySelectorAll(s)].find(x => x.offsetParent); if (!e) return null; e.scrollIntoView({block: 'nearest', inline: 'nearest'}); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2, Math.round(r.width), Math.round(r.height)]; }, sel);
const idle = p => p.waitForFunction(() => { const U = __spk.page.ui(); return U && !U.busy; }, null, {timeout: 120000});
const ddInfo = p => p.evaluate(() => { const d = document.querySelector('#spk1Sheet .spk1-dd'); if (!d) return null; const r = d.getBoundingClientRect(), bs = [...d.querySelectorAll('button,input[type=range]')].filter(e => e.offsetParent).map(e => { const q = e.getBoundingClientRect(); return {t: (e.textContent || e.dataset.s6 || '').trim().slice(0, 14), w: Math.round(q.width), h: Math.round(q.height), in: q.left >= -0.5 && q.right <= innerWidth + 0.5}; });
  return {box: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], inView: r.left >= 0 && r.right <= innerWidth + 0.5 && r.top >= 0 && r.bottom <= innerHeight + 0.5, scroll: d.scrollHeight > d.clientHeight + 1, s6: bs.filter(x => x.t && /Kopieren|Noten bearb|Duplizieren|Oktave|−1|\+1|Chor|Effekte|erzeugen|Alle aus|ct|1\/16/.test(x.t)), klein: bs.filter(x => x.h < 36 || x.w < 36).map(x => x.t + ' ' + x.w + '×' + x.h)}; });
const rows = p => p.evaluate(() => [...document.querySelectorAll('#spk1Sheet .spk1-lr')].map(r => r.dataset.l + ':' + (r.querySelector('.spk1-nm') || {}).textContent));

// ---- Quelle wie im Kern-Test (Gesang A3, D4, B3 + Bass), Ebene + Noten
const {p, ctx, tap} = await page(428, 926);
const st = await p.evaluate(async () => {
  const sr = 48000, n = sr * 6, L = new Float32Array(n), N = [[1.0, 2.0, 220], [2.2, 3.2, 293.665], [3.4, 4.4, 246.942]], fo = f => 1 / (1 + ((f - 700) / 180) ** 2) + 0.7 / (1 + ((f - 1200) / 220) ** 2);
  for (const [a, b, f] of N) for (let i = Math.round(a * sr); i < Math.round(b * sr); i++) { const t = i / sr, e = Math.min(1, (t - a) / 0.02, (b - t) / 0.03); let v = 0; for (let h = 1; h <= 30 && h * f < 9000; h++) v += fo(h * f) * Math.sin(2 * Math.PI * h * f * t) / Math.sqrt(h); L[i] += 0.12 * e * v; }
  for (let i = 0; i < n; i++) L[i] += 0.2 * Math.sin(2 * Math.PI * 55 * i / sr);
  const r = await __spk.load({name: 'Werkstatt', sr, ch: [L, L.slice()]}); await __spk.page.open({id: r.meta.id});
  await __spk.mask({von: 'orig', nach: {art: 'gesang', name: 'Gesang'}, sel: {art: 'rect', t0: 0.8, t1: 4.7, f0: 150, f1: 9500}});
  const q = await spk1Call('noten', {doc: SPK1.doc, lid: 'L1'}); spk1Got(SPK1.ui, q); spk1TintLoad(SPK1.ui);
  return {id: r.meta.id, notes: (q.meta.teil2.notes.L1 || []).map(z => z.m)};
});
await idle(p); ok('quelle-ebene-noten', st, st.notes.length === 3);
// ---- ⋯ → Werkstatt
let m = await btn(p, '#spk1Sheet .spk1-lr[data-l="L1"] [data-a="lmore"]'); await tap(m); await p.waitForTimeout(300);
let dd = await ddInfo(p); await p.screenshot({path: path.join(fotos, 'spk6-01-menue-hochkant.png')});
ok('menue-werkstatt-hochkant', {s6: dd && dd.s6.map(x => x.t + ' ' + x.w + '×' + x.h), klein: dd && dd.klein, inView: dd && dd.inView}, dd && dd.s6.length >= 7 && dd.s6.every(x => x.h >= 36 && x.w >= 36 && x.in));
m = await btn(p, '#spk1Sheet .spk1-dd [data-s6="dup"]'); await tap(m); await idle(p); await p.waitForTimeout(300);
let r = await rows(p), stat = await p.evaluate(() => __spk.page.info().stat);
ok('duplizieren-tipp', {rows: r, stat}, r.some(x => /Gesang Kopie/.test(x)) && /Kopie/.test(stat));
// bitgleich über die Seiten-API (Worker)
const bg = await p.evaluate(async () => { const a = await __spk.render('L1'), c = await __spk.render('L2'); let d = 0; for (let k = 0; k < a.ch.length; k++) for (let i = 0; i < a.ch[k].length; i++) d = Math.max(d, Math.abs(a.ch[k][i] - c.ch[k][i])); return d; });
ok('kopie-bitgleich-worker', {maxAbw: bg}, bg === 0);
// ↶ / ↷ über die Kopf-Taste
const und = await p.evaluate(async () => { const U = SPK1.ui; await spk1UndoRedo(U, 'undo'); const a = U.meta.layers.length; await spk1UndoRedo(U, 'redo'); return {nachUndo: a, nachRedo: U.meta.layers.length}; });
ok('undo-redo-duplizieren', und, und.nachUndo === 1 && und.nachRedo === 2);
// ---- Noten-Klappfenster → Umsetzen +1 (Kopie L2, Note A3)
const nd = await p.evaluate(() => { const U = SPK1.ui, q = U.meta.teil2.notes.L2.find(z => z.m === 57); U.n2sel = [{lid: 'L2', id: q.id}]; const R = U.mn.getBoundingClientRect(); spk2NoteDd(U, {getBoundingClientRect: () => ({left: R.left + 60, top: R.top + 80, right: R.left + 120, bottom: R.top + 100, width: 60, height: 20})}, [q]); return q.id; });
dd = await ddInfo(p); await p.screenshot({path: path.join(fotos, 'spk6-02-note-umsetzen.png')});
ok('noten-klappfenster-umsetzen', {s6: dd && dd.s6.map(x => x.t + ' ' + x.w + '×' + x.h)}, dd && dd.s6.filter(x => /−1|\+1|ct|1\/16/.test(x.t)).length === 6 && dd.s6.every(x => x.h >= 36 && x.w >= 36));
m = await btn(p, '#spk1Sheet .spk1-dd [data-s6="dm1"]'); await tap(m); await idle(p);
const nm = await p.evaluate(id => { const q = SPK1.ui.meta.teil2.notes.L2.find(z => z.id === id); return {m: q.m, o6: q.o6 && q.o6.m, a6: !!SPK1.ui.meta.layers.find(l => l.id === 'L2').a6, stat: __spk.page.info().stat}; }, nd);
ok('note-plus-1', nm, nm.m === 58 && nm.o6 === 57 && nm.a6);
// ---- Effekte … (Kopie): Hall per Regler
m = await btn(p, '#spk1Sheet .spk1-lr[data-l="L2"] [data-a="lmore"]'); await tap(m); m = await btn(p, '#spk1Sheet .spk1-dd [data-s6="fx"]'); await tap(m); await p.waitForTimeout(250);
dd = await ddInfo(p); await p.screenshot({path: path.join(fotos, 'spk6-03-effekte.png')});
const regler = await p.evaluate(() => [...document.querySelectorAll('#spk1Sheet .spk1-dd input[type=range]')].map(e => e.dataset.s6 + ' ' + Math.round(e.getBoundingClientRect().height)));
ok('effekte-regler', {regler, inView: dd && dd.inView, scroll: dd && dd.scroll}, regler.length === 9 && regler.every(x => +x.split(' ')[1] >= 36));
await p.evaluate(() => { const e = document.querySelector('#spk1Sheet .spk1-dd input[data-s6="hall"]'); e.value = 0.6; e.dispatchEvent(new Event('input')); e.dispatchEvent(new Event('change')); }); await idle(p);
const fxv = await p.evaluate(() => SPK1.ui.meta.layers.find(l => l.id === 'L2').fx); ok('effekt-hall-gesetzt', fxv, fxv && fxv.hall === 0.6);
// ---- Chor … (aus L1): 4 Stimmen
await p.evaluate(() => spk1Dd(SPK1.ui, null));
m = await btn(p, '#spk1Sheet .spk1-lr[data-l="L1"] [data-a="lmore"]'); await tap(m); m = await btn(p, '#spk1Sheet .spk1-dd [data-s6="chor"]'); await tap(m); await p.waitForTimeout(250);
await p.evaluate(() => { const s = [...document.querySelectorAll('#spk1Sheet .spk1-dd button')].find(e => e.textContent.trim() === '4'); if (s) s.click(); });
dd = await ddInfo(p); await p.screenshot({path: path.join(fotos, 'spk6-04-chor.png')});
const chk = await p.evaluate(() => [...document.querySelectorAll('#spk1Sheet .spk1-dd button')].filter(e => e.offsetParent).map(e => { const q = e.getBoundingClientRect(); return Math.round(q.height); }));
ok('chor-klappfenster', {hoehen: chk, inView: dd && dd.inView}, chk.length >= 11 && chk.every(h => h >= 36));
m = await btn(p, '#spk1Sheet .spk1-dd [data-s6="chorGo"]'); const tc = Date.now(); await tap(m); await idle(p);
r = await rows(p); stat = await p.evaluate(() => __spk.page.info().stat);
ok('chor-erzeugt', {ms: Date.now() - tc, rows: r, stat}, r.filter(x => /Terz|Quinte|Unisono|Oktave/.test(x)).length === 4 && /4 Stimmen/.test(stat));
await p.screenshot({path: path.join(fotos, 'spk6-05-ebenen-nach-chor.png')});
// ---- Abspielen (Worker, Audio-Ebenen + Hall): Blöcke kommen, keine Fehler
const pl = await p.evaluate(async () => { __spk.play(0.9); await new Promise(z => setTimeout(z, 1500)); const s = __spk.state(); const pos = __spk.pos(); __spk.stop(); return {playing: s.playing, pos: +(pos || 0).toFixed(2)}; });
ok('abspielen', pl, pl.playing && pl.pos > 1.2);
// ---- ZIP rund: Projekt-Verweis → Dateien → Analyse weg → einlesen → gleich
const zp = await p.evaluate(async () => {
  const id = SPK1.doc, before = await __spk.render(null), lv = SPK1.ui.meta.layers.find(l => /Terz/.test(l.name)).id, v0 = await __spk.render(lv);
  __spk.link(); const f = []; await spk1ZipAdd(f); const names = f.map(x => x.name.replace(/^spektral\/[a-z0-9]+\//, ''));
  spk1Close(); await __spk.remove(id); SPK1.doc = null; SPK1.last = null;
  const n = await spk1ZipRead(f.map(x => ({name: x.name, data: x.data}))); await __spk.open(id);
  const after = await __spk.render(null), v1 = await __spk.render(lv); let d = 0, dv = 0;
  for (let c = 0; c < before.ch.length; c++) for (let i = 0; i < before.ch[c].length; i++) d = Math.max(d, Math.abs(before.ch[c][i] - after.ch[c][i]));
  for (let c = 0; c < v0.ch.length; c++) for (let i = 0; i < v0.ch[c].length; i++) dv = Math.max(dv, Math.abs(v0.ch[c][i] - v1.ch[c][i]));
  return {n, files: names, maxAbwMix: d, maxAbwStimme: dv};
});
ok('zip-rund-audio-mit', zp, zp.n === 1 && zp.files.filter(x => /^aA\d+\.bin$/.test(x)).length >= 5 && zp.maxAbwMix === 0 && zp.maxAbwStimme === 0);
await ctx.close();
// ---- quer 926×428: Menü erreichbar, Trefferflächen
{
  const {p, ctx, tap} = await page(926, 428);
  await p.evaluate(async () => { const sr = 48000, n = sr * 3, L = new Float32Array(n); for (let i = sr; i < 2 * sr; i++) L[i] = 0.3 * Math.sin(2 * Math.PI * 220 * i / sr); const r = await __spk.load({name: 'Quer', sr, ch: [L]}); await __spk.page.open({id: r.meta.id}); const q = await __spk.mask({von: 'orig', nach: {art: 'lead', name: 'Lead'}, sel: {art: 'rect', t0: 0.8, t1: 2.2, f0: 150, f1: 2000}}); spk1Got(SPK1.ui, q); });
  await idle(p); const m = await btn(p, '#spk1Sheet .spk1-lr[data-l="L1"] [data-a="lmore"]'); await tap(m); await p.waitForTimeout(300);
  await p.evaluate(() => { const b = document.querySelector('#spk1Sheet .spk1-dd [data-s6="dup"]'); if (b) b.scrollIntoView({block: 'nearest'}); });
  const dq = await ddInfo(p); await p.screenshot({path: path.join(fotos, 'spk6-06-menue-quer.png')});
  ok('menue-werkstatt-quer', {s6: dq && dq.s6.map(x => x.t + ' ' + x.w + '×' + x.h), inView: dq && dq.inView, scroll: dq && dq.scroll}, dq && dq.s6.length >= 7 && dq.s6.every(x => x.h >= 36 && x.w >= 36 && x.in));
  const m2 = await btn(p, '#spk1Sheet .spk1-dd [data-s6="tr12"]'); await tap(m2); await idle(p);
  const tq = await p.evaluate(() => ({stat: __spk.page.info().stat, a6: SPK1.ui.meta.layers[0].a6 && SPK1.ui.meta.layers[0].a6.tr}));
  ok('transponieren-quer', tq, tq.a6 === 12 && /\+12/.test(tq.stat));
  await ctx.close();
}
ok('keine-fehler', errs.slice(0, 5), errs.length === 0);
await b.close(); srv.close();
fs.writeFileSync(path.join(dir, 'spk6-ui-test.json'), JSON.stringify({ms: Date.now() - T0, fails, res}, null, 1));
console.log(fails ? 'FEHLER: ' + fails : 'ALLES OK', Math.round((Date.now() - T0) / 1000) + ' s');
