// SPK2 Auftrag 4 Test: Klang nachbauen auf der Seite (Note antippen → Klang nachbauen, Periode + Obertöne, A/B gleich laut, Als Klang übernehmen + ↶), Layout hochkant + quer
// Aufruf: node spk2-klang-test.mjs <index.html>
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const file = path.resolve(process.argv[2] || 'index.html'), dir = path.dirname(file), fotos = path.join(dir, 'fotos');
fs.mkdirSync(fotos, {recursive: true});
const srv = http.createServer((q, r) => { const p = path.join(dir, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': p.endsWith('.html') ? 'text/html' : 'application/octet-stream'}); fs.createReadStream(p).pipe(r); });
await new Promise(ok => srv.listen(0, ok));
const url = 'http://127.0.0.1:' + srv.address().port + '/' + path.basename(file);
const res = {}, errs = [];
const ok = (k, v, cond) => { res[k] = {v, ok: !!cond}; console.log((cond ? 'OK  ' : 'FEHL') + ' ' + k + ' ' + JSON.stringify(v)); };
const b = await chromium.launch();
async function page(w, h, noGl) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const p = await ctx.newPage();
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
  await p.addInitScript(() => { const W = window.Worker; window.__wk = []; window.Worker = function (u, o) { window.__wk.push(String(u)); return new W(u, o); }; window.Worker.prototype = W.prototype; });
  await p.goto(url); await p.waitForFunction(() => window.SYNQUENZER && window.__spk, null, {timeout: 60000}); await p.waitForTimeout(1200);
  if (noGl) await p.evaluate(() => __spk.page.noGl(true));
  const cdp = await ctx.newCDPSession(p);
  const touch = async (type, pts) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: pts.map((q, i) => ({x: q[0], y: q[1], id: i}))});
  const drag = async (a, z, steps = 8) => { await touch('touchStart', [a]); for (let i = 1; i <= steps; i++) { await touch('touchMove', [[a[0] + (z[0] - a[0]) * i / steps, a[1] + (z[1] - a[1]) * i / steps]]); await p.waitForTimeout(16); } await touch('touchEnd', []); await p.waitForTimeout(120); };
  const tap = async q => { await p.touchscreen.tap(q[0], q[1]); await p.waitForTimeout(150); };
  return {ctx, p, touch, drag, tap};
}
const box = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.left, y: r.top, w: r.width, h: r.height}; }, sel);
const btn = (p, txt) => p.evaluate(t => { const e = [...document.querySelectorAll('#spk1Sheet button')].find(x => x.offsetParent && x.textContent.trim().startsWith(t)); if (!e) return null; e.scrollIntoView({block: 'nearest', inline: 'nearest'}); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, txt);
const info = p => p.evaluate(() => __spk.page.info());
const waitChunks = p => p.waitForFunction(() => { const i = __spk.page.info(); return i && i.chunks > 0 && !/Spektrum \d/.test(i.stat); }, null, {timeout: 60000});
const layout = p => p.evaluate(() => {
  const parts = ['.spk1-hd', '.spk1-tl', '.spk1-co', '.spk1-ru', '.spk1-ky', '.spk1-mn', '.spk1-op', '.spk1-st', '.spk1-ac', '.spk1-ly'].map(s => { const r = document.querySelector('#spk1Sheet ' + s).getBoundingClientRect(); return {s, l: r.left, t: r.top, r: r.right, b: r.bottom}; });
  const over = []; for (let i = 0; i < parts.length; i++) for (let j = i + 1; j < parts.length; j++) { const a = parts[i], c = parts[j]; if (Math.min(a.r, c.r) - Math.max(a.l, c.l) > 0.5 && Math.min(a.b, c.b) - Math.max(a.t, c.t) > 0.5) over.push(a.s + '×' + c.s); }
  const W = innerWidth, H = innerHeight, out = parts.filter(a => a.l < -0.5 || a.t < -0.5 || a.r > W + 0.5 || a.b > H + 0.5).map(a => a.s);
  const x = document.querySelector('#spk1Sheet .sh-x').getBoundingClientRect();
  const small = [...document.querySelectorAll('#spk1Sheet button')].filter(e => e.offsetParent && !e.closest('.spk1-tl,.spk1-op')).map(e => e.getBoundingClientRect()).filter(r => r.height < 43.5 || r.width < 35.5).length;
  const mn = document.querySelector('#spk1Sheet .spk1-mn').getBoundingClientRect();
  return {over, out, x: {l: Math.round(x.left), t: Math.round(x.top), w: x.width, h: x.height, vis: x.left >= 0 && x.right <= W && x.top >= 0 && x.bottom <= H}, small, mn: [Math.round(mn.width), Math.round(mn.height)]};
});
// Demo-Song: Stems (mess/spur*.f32, offline aus der App gerendert) → Gemisch = Summe → WAV 16 bit
const rdS = n => new Float32Array(fs.readFileSync(path.join(dir, 'mess', n + '.f32')).buffer.slice(0));
const ST = {bass: rdS('spur0'), lead: rdS('spur1'), pad: rdS('spur2'), drums: rdS('spur4')}, NN = Math.max(...Object.values(ST).map(x => x.length / 2));
function mixWav() {
  const sr = 44100, b = Buffer.alloc(44 + NN * 4);
  b.write('RIFF', 0); b.writeUInt32LE(36 + NN * 4, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(2, 22); b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 4, 28); b.writeUInt16LE(4, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(NN * 4, 40);
  for (let i = 0; i < NN * 2; i++) { let v = 0; for (const k in ST) v += ST[k][i] || 0; b.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(v * 32767))), 44 + i * 2); }
  return b;
}
const T0 = Date.now();
const ddBtn2 = (p, k) => p.evaluate(z => { const e = document.querySelector('#spk1Sheet .spk1-dd [data-kl="' + z + '"]'); if (!e) return null; e.scrollIntoView({block: 'nearest'}); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, k);
const ddBtn = (p, zu) => p.evaluate(z => { const e = document.querySelector('#spk1Sheet .spk1-dd [data-zu="' + z + '"]'); if (!e) return null; const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, zu);
{
  const {p, ctx, drag, tap} = await page(428, 926);
  await p.evaluate(() => SYNQUENZER.loadDemo()); await p.waitForTimeout(400);
  await p.evaluate(() => openMenu()); await p.waitForTimeout(300);
  const mb = await p.evaluate(() => { const e = [...document.querySelectorAll('#menu button')].find(x => /Spektral/.test(x.textContent)); e.scrollIntoView({block: 'center'}); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
  await tap(mb); await p.waitForTimeout(400);
  const fb = await btn(p, 'Datei laden');
  const [fc] = await Promise.all([p.waitForEvent('filechooser', {timeout: 5000}), tap(fb)]);
  await fc.setFiles({name: 'Demo-Song.wav', mimeType: 'audio/wav', buffer: mixWav()});
  await p.waitForFunction(() => { const i = __spk.page.info(); return i && !i.nodoc; }, null, {timeout: 60000});
  await waitChunks(p); await p.waitForTimeout(300);
  // Noten im Bass-Band finden, fünf Noten → Bass (eigene Ebene mit bestätigten Noten)
  await p.evaluate(async () => { const U = __spk.page.ui(); U.sel = [{art: 'freq', f0: 28, f1: 400, kt: 0, kf: 0}]; await SYNQUENZER.spk1.spk2.page.finden(); });
  await p.waitForFunction(() => /Noten in Original/.test(__spk.page.info().stat), null, {timeout: 60000});
  await p.evaluate(async () => { const U = __spk.page.ui(), N = (U.meta.teil2.notes.orig || []).filter(q => q.a < 2.2).slice(0, 5); U.sel = []; await SYNQUENZER.spk1.spk2.page.zu('bass', N.map(q => ({lid: 'orig', id: q.id}))); });
  await p.waitForFunction(() => /→ Bass/.test(__spk.page.info().stat), null, {timeout: 60000});
  await tap(await btn(p, 'Noten'));
  await p.evaluate(() => { const U = __spk.page.ui(); U.v.mTop = 62; U.v.rowH = 14; U.v.pps = 120; U.v.t0 = 0; spk1Dirty(U, 'all'); }); await p.waitForTimeout(400);
  const L0 = await p.evaluate(() => { const U = __spk.page.ui(), L = U.meta.layers.find(l => l.art === 'bass'); return {lid: L.id, q: spk2KlPick(U, L.id)}; });
  ok('bass-ebene-mit-noten', {lid: L0.lid, note: L0.q && [L0.q.m, +(L0.q.b - L0.q.a).toFixed(2)]}, !!L0.q);
  // Kästchen antippen → Klappfenster mit „Klang nachbauen“
  const bx = await p.evaluate(([lid, id]) => SYNQUENZER.spk1.spk2.page.box(lid, id), [L0.lid, L0.q.id]);
  await tap([bx.x, bx.y]); await p.waitForTimeout(250);
  const kb = await ddBtn(p, 'klang'); ok('note-klappfenster-klang', !!kb, !!kb);
  const t0 = Date.now(); await tap(kb);
  await p.waitForFunction(() => { const K = __spk.page.ui().kl; return K && /Abstand .* dB \(Start/.test(K.tb || ''); }, null, {timeout: 120000});
  const ms = Date.now() - t0, st = await p.evaluate(() => SYNQUENZER.spk1.spk2.klang.stand());
  ok('nachbau-fertig', {ms, eng: st.best.eng, dist: +st.best.dist.toFixed(2), d0: +st.d0.toFixed(2), txt: st.best.txt, ta: st.ta.slice(0, 120)}, st.best.dist <= st.d0 && st.best.dist < 12 && ms < 60000);
  const dd = await p.evaluate(() => { const d = document.querySelector('#spk1Sheet .spk1-dd'), r = d.getBoundingClientRect(), cv = d.querySelector('canvas.spk2-klc'), c = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let lit = 0; for (let i = 0; i < c.length; i += 4) if (c[i] + c[i + 1] + c[i + 2] > 300) lit++;
    const bs = [...d.querySelectorAll('button')].filter(e => e.offsetParent).map(e => e.getBoundingClientRect());
    return {h5: d.querySelector('h5').textContent, lit, small: bs.filter(r => r.height < 43.5 || r.width < 43.5).length, n: bs.length, inView: r.left >= 0 && r.top >= 0 && r.right <= innerWidth + 0.5 && r.bottom <= innerHeight + 0.5, w: Math.round(r.width), hh: Math.round(r.height)}; });
  ok('anzeige-periode-obertoene', dd, dd.lit > 300 && dd.small === 0 && /Klang nachbauen/i.test(dd.h5));
  await p.screenshot({path: path.join(fotos, '50-klang-nachbauen-hochkant.png')});
  // A/B gleich laut: A und B abwechselnd
  const ab = await p.evaluate(() => { const r = [...document.querySelectorAll('#spk1Sheet .spk2-klab button')]; return r.map(e => { const q = e.getBoundingClientRect(); return [q.left + q.width / 2, q.top + q.height / 2]; }); });
  await tap(ab[1]); await p.waitForTimeout(150);
  const pb = await p.evaluate(() => ({kl: SPK1.pl && SPK1.pl.kl, g: SPK1.pl && SPK1.pl.g}));
  await tap(ab[0]); await p.waitForTimeout(150);
  const pa = await p.evaluate(() => ({kl: SPK1.pl && SPK1.pl.kl, g: SPK1.pl && SPK1.pl.g}));
  const lau = await p.evaluate(() => { const K = __spk.page.ui().kl, b = K.res.best; return {rA: K.src.feat.rms, rB: b.F.rms}; });
  ok('ab-gleich-laut', {pb, pa, lau}, pb.kl === 'b' && pa.kl === 'a' && Math.abs(pb.g * lau.rB - pa.g * lau.rA) / (pa.g * lau.rA) < 0.01);
  await p.evaluate(() => spk1Stop());
  // Als Klang übernehmen → Spur (Standard = passende Rolle), ein ↶
  const vor = await p.evaluate(() => { const K = __spk.page.ui().kl; return {t: K.t, n: S.tracks.length, snd: K.t >= 0 ? JSON.stringify(S.tracks[K.t].sound) : null, undo: UNDO.length}; });
  await tap(await ddBtn2(p, 'nehmen')); await p.waitForTimeout(300);
  const nach = await p.evaluate(t => ({t: SPK1.kl && SPK1.kl.track, name: S.tracks[t] && S.tracks[t].sound.name, eng: S.tracks[t] && S.tracks[t].sound.engine, undo: UNDO.length, stat: __spk.page.info().stat}), vor.t);
  ok('als-klang-uebernehmen', {vor: {t: vor.t, undo: vor.undo}, nach}, nach.t === vor.t && /Nachbau/.test(nach.name) && nach.undo === vor.undo + 1);
  await p.evaluate(() => undo()); await p.waitForTimeout(200);
  const zur = await p.evaluate(t => JSON.stringify(S.tracks[t].sound), vor.t);
  ok('ein-undo', {gleich: zur === vor.snd}, zur === vor.snd);
  // Noten ▾ → Klang nachbauen (beste Note der Ebene), Layout quer
  for (const [w, h] of [[926, 428], [926, 370]]) {
    await p.evaluate(() => spk1Dd(__spk.page.ui(), null));
    await p.setViewportSize({width: w, height: h}); await p.waitForTimeout(500);
    await p.evaluate(() => { const U = __spk.page.ui(), L = U.meta.layers.find(l => l.art === 'bass'); U.act = L.id; spk1Layers(U); });
    await tap(await btn(p, 'Noten ▾')); await p.waitForTimeout(200);
    const kb2 = await p.evaluate(() => { const e = document.querySelector('#spk1Sheet .spk1-dd [data-n2="klang"]'); if (!e || e.disabled) return null; e.scrollIntoView({block: 'nearest'}); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
    await tap(kb2);
    await p.waitForFunction(() => { const K = __spk.page.ui().kl; return K && K.res && /Abstand .* dB \(Start/.test(K.tb || ''); }, null, {timeout: 120000});
    const q = await p.evaluate(() => { const d = document.querySelector('#spk1Sheet .spk1-dd'), r = d.getBoundingClientRect(), bs = [...d.querySelectorAll('button')].filter(e => e.offsetParent).map(e => e.getBoundingClientRect()), x = document.querySelector('#spk1Sheet .sh-x').getBoundingClientRect();
      return {top: Math.round(r.top), bottom: Math.round(r.bottom), inView: r.top >= 0 && r.bottom <= innerHeight + 0.5 && r.right <= innerWidth + 0.5, small: bs.filter(b => b.height < 43.5 || b.width < 43.5).length, x: x.width >= 44 && x.top >= 0 && x.right <= innerWidth}; });
    ok('quer-' + w + 'x' + h, q, q.inView && q.small === 0 && q.x);
    if (h === 370) await p.screenshot({path: path.join(fotos, '51-klang-nachbauen-quer-370.png')});
  }
  ok('keine-fehler', errs.slice(0, 5), errs.length === 0);
  await ctx.close();
}
await b.close(); srv.close();
const bad = Object.entries(res).filter(([, v]) => !v.ok).map(([k]) => k);
console.log(bad.length ? bad.length + ' FEHLER: ' + bad.join(', ') : 'ALLE OK', ((Date.now() - T0) / 1000).toFixed(0) + ' s');
fs.writeFileSync(path.join(dir, 'spk2-klang-test.json'), JSON.stringify({res, errs}, null, 1));
