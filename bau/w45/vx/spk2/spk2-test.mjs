// SPK2 Auftrag 5/5 – Gesamt-Test (OK/FEHLER) der Spektral-Seite Teil 2 auf dem Demo-Song (Stems bekannt → Messung gegen die Wahrheit):
//  1 Zerlegen: Bass-Ebene ≥ Ziel (4 dB SDR), Drums ≥ 4 dB, ein ↶            2 Verfeinern (Ziel Bass) verbessert die Bass-Ebene, ein ↶
//  3 Noten erkannt (Trefferquote gegen die Bass-Noten des Demo-Songs), Zuordnung per Tipp (Gehört zu → Bass), Überall finden, Alle übernehmen, ↶/↷
//  4 Verfeinern nach Noten verbessert die Bass-Ebene                          5 Loop → Matrix als MIDI und als Audio, beides taktgenau (gespielt), je ein ↶
//  6 Klang nachbauen: Abstand-Messung (bekannter Klang + Ebenen-Note), A/B gleich laut, Als Klang übernehmen = ein ↶
//  7 Speichern/Laden (Spektral-Dokument mit Noten + Masken), Container (ZIP: Projekt + Take + Spektral) in frischem Speicher, alte Projekte unverändert
//  8 hochkant 428×926 + quer 926×428 / 926×370 ohne Überlappung, Tasten ≥ 44, ✕ sichtbar          9 keine Konsolen-Fehler
// Aufruf: node spk2-test.mjs <abs. index.html>   (Ordner mess/ neben der Datei, basis2.html eine Ebene höher; Fotos nach ./fotos)
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const file = path.resolve(process.argv[2] || 'index.html'), dir = path.dirname(file), fotos = path.join(dir, 'fotos'), basis = path.resolve(dir, '..', 'basis2.html');
fs.mkdirSync(fotos, {recursive: true});
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]), p = u === '/__basis.html' ? basis : path.join(dir, u); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': p.endsWith('.html') ? 'text/html' : 'application/octet-stream'}); fs.createReadStream(p).pipe(r); });
await new Promise(ok => srv.listen(0, ok));
const base = 'http://127.0.0.1:' + srv.address().port + '/', url = base + path.basename(file);
const res = {}, errs = [], info = {};
const ok = (k, v, cond) => { res[k] = {v, ok: !!cond}; console.log((cond ? 'OK     ' : 'FEHLER ') + k + ' ' + JSON.stringify(v)); };
const T0 = Date.now(), el = () => ((Date.now() - T0) / 1000).toFixed(0) + ' s';
const b = await chromium.launch();
async function page(w, h, u) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const p = await ctx.newPage();
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
  await p.addInitScript(() => { const W = window.Worker; window.__wk = []; window.Worker = function (u, o) { window.__wk.push(String(u)); return new W(u, o); }; window.Worker.prototype = W.prototype; });
  await p.goto(u || url); await p.waitForFunction(() => window.SYNQUENZER && (window.__spk || !window.SYNQUENZER.spk1), null, {timeout: 60000}); await p.waitForTimeout(1200);
  const cdp = await ctx.newCDPSession(p);
  const touch = async (type, pts) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: pts.map((q, i) => ({x: q[0], y: q[1], id: i}))});
  const drag = async (a, z, steps = 8) => { await touch('touchStart', [a]); for (let i = 1; i <= steps; i++) { await touch('touchMove', [[a[0] + (z[0] - a[0]) * i / steps, a[1] + (z[1] - a[1]) * i / steps]]); await p.waitForTimeout(16); } await touch('touchEnd', []); await p.waitForTimeout(120); };
  const tap = async q => { if (!q) throw new Error('Knopf fehlt'); await p.touchscreen.tap(q[0], q[1]); await p.waitForTimeout(150); };
  return {ctx, p, touch, drag, tap};
}
const box = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.left, y: r.top, w: r.width, h: r.height}; }, sel);
const btn = (p, txt) => p.evaluate(t => { const e = [...document.querySelectorAll('#spk1Sheet button')].find(x => x.offsetParent && x.textContent.trim().startsWith(t)); if (!e) return null; e.scrollIntoView({block: 'nearest', inline: 'nearest'}); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, txt);
const sbtn = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); if (!e || e.disabled) return null; e.scrollIntoView({block: 'nearest', inline: 'nearest'}); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, sel);
const waitChunks = p => p.waitForFunction(() => { const i = __spk.page.info(); return i && i.chunks > 0 && !/Spektrum \d/.test(i.stat); }, null, {timeout: 60000});
const ddZu = () => p.evaluate(() => spk1Dd(__spk.page.ui(), null));
const layout = p => p.evaluate(() => {
  const parts = ['.spk1-hd', '.spk1-tl', '.spk1-co', '.spk1-ru', '.spk1-ky', '.spk1-mn', '.spk1-op', '.spk1-st', '.spk1-ac', '.spk1-ly'].map(s => { const r = document.querySelector('#spk1Sheet ' + s).getBoundingClientRect(); return {s, l: r.left, t: r.top, r: r.right, b: r.bottom}; });
  const over = []; for (let i = 0; i < parts.length; i++) for (let j = i + 1; j < parts.length; j++) { const a = parts[i], c = parts[j]; if (Math.min(a.r, c.r) - Math.max(a.l, c.l) > 0.5 && Math.min(a.b, c.b) - Math.max(a.t, c.t) > 0.5) over.push(a.s + '×' + c.s); }
  const W = innerWidth, H = innerHeight, out = parts.filter(a => a.l < -0.5 || a.t < -0.5 || a.r > W + 0.5 || a.b > H + 0.5).map(a => a.s);
  const x = document.querySelector('#spk1Sheet .sh-x').getBoundingClientRect();
  const small = [...document.querySelectorAll('#spk1Sheet button')].filter(e => e.offsetParent && !e.closest('.spk1-tl,.spk1-op,.spk1-dd')).map(e => e.getBoundingClientRect()).filter(r => r.height < 43.5 || r.width < 35.5).length;
  const row = document.querySelector('#spk1Sheet .spk2-lp'), ly = document.querySelector('#spk1Sheet .spk1-ly').getBoundingClientRect(), rr = row && row.getBoundingClientRect(), lx = row && row.querySelector('.spk2-lx').getBoundingClientRect();
  const dd = document.querySelector('#spk1Sheet .spk1-dd'), dr = dd && dd.getBoundingClientRect(), db = dd ? [...dd.querySelectorAll('button')].filter(e => e.offsetParent).map(e => e.getBoundingClientRect()) : [];
  const dov = []; for (let i = 0; i < db.length; i++) for (let j = i + 1; j < db.length; j++) { const a = db[i], c = db[j]; if (Math.min(a.right, c.right) - Math.max(a.left, c.left) > 0.5 && Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top) > 0.5) dov.push(i + '×' + j); }
  return {over, out, small, x: {l: Math.round(x.left), t: Math.round(x.top), w: x.width, h: x.height, vis: x.left >= 0 && x.right <= W && x.top >= 0 && x.bottom <= H},
    loop: row ? {inLy: rr.top >= ly.top - 0.5 && rr.bottom <= ly.bottom + 0.5 && rr.left >= ly.left - 0.5 && rr.right <= ly.right + 0.5, x: [Math.round(lx.width), Math.round(lx.height)], xVis: lx.left >= 0 && lx.right <= W && lx.top >= 0 && lx.bottom <= H} : null,
    dd: dd ? {inV: dr.left >= -0.5 && dr.top >= -0.5 && dr.right <= W + 0.5 && dr.bottom <= H + 0.5, small: db.filter(r => r.height < 43.5).length, ov: dov} : null};
});
const layOk = L => !L.over.length && !L.out.length && L.small === 0 && L.x.vis && L.x.w >= 44 && L.x.h >= 44 && (!L.loop || (L.loop.inLy && L.loop.xVis && L.loop.x[0] >= 44)) && (!L.dd || (L.dd.inV && !L.dd.small && !L.dd.ov.length));
// Demo-Song: Stems (mess/spur*.f32, offline aus der App gerendert) → Gemisch = Summe → WAV 16 bit
const rdS = n => new Float32Array(fs.readFileSync(path.join(dir, 'mess', n + '.f32')).buffer.slice(0));
const ST = {bass: rdS('spur0'), lead: rdS('spur1'), pad: rdS('spur2'), drums: rdS('spur4')}, NN = Math.max(...Object.values(ST).map(x => x.length / 2));
function mixWav() {
  const sr = 44100, b = Buffer.alloc(44 + NN * 4);
  b.write('RIFF', 0); b.writeUInt32LE(36 + NN * 4, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(2, 22); b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 4, 28); b.writeUInt16LE(4, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(NN * 4, 40);
  for (let i = 0; i < NN * 2; i++) { let v = 0; for (const k in ST) v += ST[k][i] || 0; b.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(v * 32767))), 44 + i * 2); }
  return b;
}
// Trefferquote: Anschlag ±70 ms und richtiger Ton (wie messk/noten.mjs)
const score = (notes, tr, tol = 0.07) => {
  const used = new Set(); let hit = 0, oct = 0;
  for (const g of tr) { let bi = -1, bd = 1e9; notes.forEach((q, i) => { if (used.has(i)) return; const d = Math.abs(q.a - g.t); if (d < tol && d < bd) { bd = d; bi = i; } }); if (bi < 0) continue; used.add(bi); const q = notes[bi]; if (q.m === g.m) hit++; else if ((q.m - g.m) % 12 === 0) oct++; }
  return {wahr: tr.length, gefunden: notes.length, treffer: hit, oktave: oct, quote: +(hit / tr.length).toFixed(3), praezision: notes.length ? +(hit / notes.length).toFixed(3) : 0};
};
const ZIEL_BASS = 4;   // dB SDR der Bass-Ebene nach Zerlegen (Ziel aus Auftrag 1)
const {p, ctx, drag, tap} = await page(428, 926);
// 0) App-Start lädt nichts (kein Blatt, kein CSS, kein Worker, kein Klang-Worklet-Text)
const st0 = await p.evaluate(() => ({sheet: !!document.getElementById('spk1Sheet'), css: !!document.getElementById('spk1Css'), wk: __wk.length, worker: __spk.state().worker, kl: SPK2_KL.src === null}));
ok('start-laedt-nichts', st0, !st0.sheet && !st0.css && st0.wk === 0 && !st0.worker && st0.kl);
// Demo-Projekt (Matrix + Wahrheit: Bass-Clip Synth 1, Takt 1–4 im Demo-Song)
await p.evaluate(() => SYNQUENZER.loadDemo()); await p.waitForTimeout(400);
const W0 = await p.evaluate(() => { const c = S.tracks[0].clips[0]; return {bpm: S.bpm, len: c.len, pat: c.notes.map(n => [n.t, n.n, n.d])}; });
const beat = 60 / W0.bpm, truth = []; for (let bar = 0; bar < 4; bar++) for (const [t, m] of W0.pat) truth.push({t: (bar * 4 + t) * beat, tb: bar * 4 + t, m, bar});
info.wahrheit = {bpm: W0.bpm, noten: truth.length};
await p.evaluate(() => openMenu()); await p.waitForTimeout(300);
await tap(await p.evaluate(() => { const e = [...document.querySelectorAll('#menu button')].find(x => /Spektral/.test(x.textContent)); e.scrollIntoView({block: 'center'}); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; })); await p.waitForTimeout(400);
const mixB = mixWav();
{ const [fc] = await Promise.all([p.waitForEvent('filechooser', {timeout: 5000}), tap(await btn(p, 'Datei laden'))]); await fc.setFiles({name: 'Demo-Song.wav', mimeType: 'audio/wav', buffer: mixB}); }
await p.waitForFunction(() => { const i = __spk.page.info(); return i && !i.nodoc; }, null, {timeout: 60000}); await waitChunks(p); await p.waitForTimeout(300);
const undoTap = async () => { const u = await box(p, '#spk1Sheet .spk1-hd .rb[data-a="undo"]'); await tap([u.x + u.w / 2, u.y + u.h / 2]); await p.waitForFunction(() => !__spk.page.info().busy, null, {timeout: 60000}); await p.waitForTimeout(400); };
const redoTap = async () => { const u = await box(p, '#spk1Sheet .spk1-hd .rb[data-a="redo"]'); await tap([u.x + u.w / 2, u.y + u.h / 2]); await p.waitForFunction(() => !__spk.page.info().busy, null, {timeout: 60000}); await p.waitForTimeout(400); };
const ulab = () => p.evaluate(() => __spk.page.ui().bU.getAttribute('aria-label'));
// 1) Zerlegen (Knopf) → SDR je Ebene gegen die Stems
{ const tz = Date.now(); await tap(await btn(p, 'Zerlegen')); await p.waitForFunction(() => /^Zerlegt/.test(__spk.page.info().stat), null, {timeout: 240000}); info.zerlegen_ms = Date.now() - tz; }
await p.waitForTimeout(400);
await p.evaluate(async () => {   // Referenzen + Mess-Helfer im Browser (bleiben für die weiteren Schritte)
  const ld = async n => new Float32Array(await (await fetch('mess/' + n + '.f32')).arrayBuffer()), R = {bass: await ld('spur0'), drums: await ld('spur4')}, n = Math.round(__spk.page.ui().dur * 44100);
  const S2 = k => [0, 1].map(c => { const o = new Float32Array(n), x = R[k]; for (let i = 0; i < Math.min(n, x.length / 2); i++) o[i] = x[2 * i + c]; return o; });
  window.__ref = {bass: S2('bass'), drums: S2('drums')}; window.__n = n;
  window.__sdr = async (lid, k) => { const e = (await __spk.render(lid, 0, n)).ch, r = __ref[k]; let a = 0, b = 0; for (let c = 0; c < 2; c++) for (let i = 0; i < n; i++) { a += r[c][i] ** 2; b += (e[c][i] - r[c][i]) ** 2; } return +(10 * Math.log10(a / Math.max(b, 1e-12))).toFixed(2); };
  window.__lid = art => __spk.page.ui().meta.layers.find(l => l.art === art).id;
});
const Z = await p.evaluate(async () => ({ebenen: __spk.page.ui().meta.layers.map(l => l.name), drums: await __sdr(__lid('drums'), 'drums'), bass: await __sdr(__lid('bass'), 'bass')}));
await p.screenshot({path: path.join(fotos, '60-gesamt-zerlegt.png')});
ok('zerlegen-drums', {drums: Z.drums, ebenen: Z.ebenen, ms: info.zerlegen_ms}, Z.drums >= 4 && Z.ebenen.length === 3);
ok('zerlegen-bass-ziel', {bass: Z.bass, ziel: ZIEL_BASS}, Z.bass >= ZIEL_BASS);
{ const l0 = await ulab(); await undoTap(); const a = await p.evaluate(() => __spk.page.ui().meta.layers.length); await redoTap(); const c = await p.evaluate(() => __spk.page.ui().meta.layers.length);
  ok('zerlegen-ein-undo', {label: l0, nachUndo: a, nachRedo: c}, /Zerlegen/.test(l0) && a === 0 && c === 3); }
// 2) Verfeinern (Auswahl 20–300 Hz, Ziel Bass) → SDR der Bass-Ebene vorher/nachher; ↶ = vorher
const VF = await p.evaluate(async () => { const U = __spk.page.ui(), lb = __lid('bass'), vor = await __sdr(lb, 'bass'); U.sel = [{art: 'rect', t0: 0, t1: U.dur, f0: 20, f1: 300, kt: 0, kf: 0}]; U.selVer++;
  await __spk.page.verf('bass'); const nach = await __sdr(lb, 'bass'); return {vor, nach}; });
await ddZu(); { const l = await ulab(); await undoTap(); VF.label = l; VF.zurueck = await p.evaluate(() => __sdr(__lid('bass'), 'bass')); await p.evaluate(() => { __spk.page.ui().sel = []; }); }
ok('verfeinern-verbessert', VF, VF.nach > VF.vor + 0.3);
ok('verfeinern-ein-undo', {label: VF.label, vor: VF.vor, zurueck: VF.zurueck}, /Verfeinern/.test(VF.label) && Math.abs(VF.zurueck - VF.vor) < 0.01);
console.log('INFO Zerlegen/Verfeinern fertig (' + el() + ')');
// 3) Noten im Bass-Band des Originals (Werkzeug „Noten“, Noten ▾ → Noten finden)
await tap(await btn(p, 'Noten'));
await p.evaluate(() => { const U = __spk.page.ui(); U.sel = [{art: 'freq', f0: 28, f1: 400, kt: 0, kf: 0}]; });
await tap(await btn(p, 'Noten ▾')); await p.waitForTimeout(200); await tap(await btn(p, 'Noten finden'));
await p.waitForFunction(() => /Noten in Original/.test(__spk.page.info().stat), null, {timeout: 60000}); await p.waitForTimeout(200);
const N1 = await p.evaluate(() => ({N: (__spk.page.ui().meta.teil2.notes.orig || []).map(q => ({id: q.id, a: q.a, m: q.m})), undo: __spk.page.ui().bU.getAttribute('aria-label')}));
{ const s = score(N1.N, truth); ok('noten-erkannt', Object.assign(s, {undo: N1.undo}), N1.N.length >= 16 && s.quote >= 0.4 && /Noten finden/.test(N1.undo)); }
// Zuordnung per Tipp: erste Note von Takt 1 → „Gehört zu“ → Bass (die Bass-Ebene aus dem Zerlegen, ein ↶)
await p.evaluate(() => { const U = __spk.page.ui(); U.sel = []; U.v.mTop = 62; U.v.rowH = 14; U.v.pps = 120; U.v.t0 = 0; spk1Dirty(U, 'all'); }); await p.waitForTimeout(400);
const id1 = (N1.N.find(q => q.m === truth[0].m && Math.abs(q.a - truth[0].t) < 0.07) || N1.N[0]).id;
{ const bx = await p.evaluate(id => SYNQUENZER.spk1.spk2.page.box('orig', id), id1); await tap([bx.x, bx.y]); await p.waitForTimeout(250); }
const dd1 = await p.evaluate(() => { const d = document.querySelector('#spk1Sheet .spk1-dd'); return d ? [...d.querySelectorAll('[data-zu]')].map(b => b.textContent) : null; });
await p.screenshot({path: path.join(fotos, '61-gesamt-gehoert-zu.png')});
await tap(await sbtn(p, '#spk1Sheet .spk1-dd [data-zu="bass"]')); await p.waitForFunction(() => /→ Bass/.test(__spk.page.info().stat), null, {timeout: 30000}); await p.waitForTimeout(200);
const Z1 = await p.evaluate(id => { const U = __spk.page.ui(), lb = __lid('bass'); return {ebenen: U.meta.layers.length, inBass: (U.meta.teil2.notes[lb] || []).some(q => q.id === id && q.st === 'zu'), noch: (U.meta.teil2.notes.orig || []).some(q => q.id === id), undo: U.bU.getAttribute('aria-label')}; }, id1);
ok('zuordnung-tipp', {dd: dd1, ...Z1}, dd1 && dd1.join('|').startsWith('Bass|Gesang|Lead|Pads|Neue Ebene') && Z1.ebenen === 3 && Z1.inBass && !Z1.noch && /Note zuordnen/.test(Z1.undo));
// restliche „unmissverständliche“ Noten aus Takt 1 (richtiger Ton) → Bass, dann Bass-Ebene wählen → Überall finden
await p.evaluate(async T => { const U = __spk.page.ui(), N = (U.meta.teil2.notes.orig || []).filter(q => T.some(g => g.bar === 0 && Math.abs(g.t - q.a) < 0.07 && g.m === q.m)); if (N.length) await SYNQUENZER.spk1.spk2.page.zu('bass', N.map(q => ({lid: 'orig', id: q.id}))); }, truth);
await p.waitForFunction(() => !__spk.page.info().busy, null, {timeout: 30000}); await p.waitForTimeout(300);
const sdrZu = await p.evaluate(() => __sdr(__lid('bass'), 'bass'));
await tap(await p.evaluate(() => { const e = [...document.querySelectorAll('#spk1Sheet .spk1-lr .spk1-nm')].find(x => x.textContent === 'Bass'); e.scrollIntoView({block: 'nearest'}); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }));
await tap(await btn(p, 'Noten ▾')); await p.waitForTimeout(200); await tap(await btn(p, 'Überall finden'));
await p.waitForFunction(() => /ähnliche Töne/.test(__spk.page.info().stat), null, {timeout: 90000}); await p.waitForTimeout(300);
const F1 = await p.evaluate(() => { const U = __spk.page.ui(), lb = __lid('bass'), N = U.meta.teil2.notes[lb]; return {zu: N.filter(q => q.st === 'zu').length, neu: N.filter(q => q.st === 'neu').map(q => ({a: q.a, m: q.m, conf: q.conf})), vorlage: !!U.meta.teil2.tmpl[lb], undo: U.bU.getAttribute('aria-label')}; });
{ const s = score(F1.neu, truth.filter(g => g.bar > 0)); ok('ueberall-finden', Object.assign(s, {bestaetigt: F1.zu, vorlage: F1.vorlage, sicher: F1.neu.slice(0, 4).map(q => +q.conf.toFixed(2)), undo: F1.undo}), F1.neu.length > 0 && F1.vorlage && F1.neu.every(q => q.conf >= 0 && q.conf <= 1) && s.quote >= 0.35 && /finden/i.test(F1.undo)); }
await p.evaluate(() => { const U = __spk.page.ui(); U.v.pps = 40; spk1Dirty(U, 'all'); }); await p.waitForTimeout(300);
await p.screenshot({path: path.join(fotos, '62-gesamt-ueberall.png')});
// Alle übernehmen → ein ↶ / ↷
await tap(await btn(p, 'Noten ▾')); await p.waitForTimeout(200); await tap(await btn(p, 'Alle übernehmen')); await p.waitForFunction(() => /übernommen/.test(__spk.page.info().stat), null, {timeout: 30000});
const cnt = () => p.evaluate(() => { const N = __spk.page.ui().meta.teil2.notes[__lid('bass')]; return {zu: N.filter(q => q.st === 'zu').length, neu: N.filter(q => q.st === 'neu').length}; });
{ const a = await cnt(), l = await ulab(); await undoTap(); const u = await cnt(); await redoTap(); const r = await cnt();
  ok('alle-uebernehmen-undo-redo', {nach: a, label: l, undo: u, redo: r}, a.zu > F1.zu && /Noten zuordnen/.test(l) && u.zu === F1.zu && u.neu > 0 && r.zu === a.zu); }
const sdrAlle = await p.evaluate(() => __sdr(__lid('bass'), 'bass'));
// 4) Verfeinern nach Noten (Auswahl = Kämme der bestätigten Noten) → Bass-Ebene vorher/nachher
await tap(await btn(p, 'Noten ▾')); await p.waitForTimeout(200); await tap(await btn(p, 'Verfeinern nach Noten'));
await p.waitForFunction(() => /^Verfeinert/.test(__spk.page.info().stat), null, {timeout: 120000}); await p.waitForTimeout(300);
const VN = await p.evaluate(async () => ({nach: await __sdr(__lid('bass'), 'bass'), dd: !!document.querySelector('#spk1Sheet .spk1-dd'), sel: __spk.page.info().selArts[0], undo: __spk.page.ui().bU.getAttribute('aria-label')}));
await p.screenshot({path: path.join(fotos, '63-gesamt-verfeinern-noten.png')});
await ddZu(); await p.evaluate(() => { __spk.page.ui().sel = []; spk1Dirty(__spk.page.ui(), 'all'); });
info.bass_sdr = {zerlegt: Z.bass, nach_zuordnen_takt1: sdrZu, nach_alle_uebernehmen: sdrAlle, nach_verfeinern_nach_noten: VN.nach};
ok('verfeinern-nach-noten', {vor: sdrAlle, nach: VN.nach, dd: VN.dd, sel: VN.sel, undo: VN.undo}, VN.dd && VN.sel === 'harm' && VN.nach > sdrAlle);
console.log('INFO Noten fertig (' + el() + ')');
// 5) Loop Takt 1–2 (Ansicht ▾ → Loop setzen, rechte Klammer auf Takt 2 ziehen) → In die Matrix ▾ als MIDI und als Audio
await p.evaluate(() => { const U = __spk.page.ui(), g = spk1Grid0(U); U.v.t0 = g.off - 0.3; U.v.pps = U.W / (6.5 * g.bar); U.cur = g.off + 0.01; spk1Clamp(U); spk1Dirty(U, 'all'); }); await p.waitForTimeout(300);
await tap(await btn(p, 'Ansicht ▾')); await p.waitForTimeout(200); await tap(await sbtn(p, '#spk1Sheet .spk1-dd [data-mx="set"]')); await p.waitForTimeout(200);
{ const R0 = await box(p, '#spk1Sheet .spk1-ru'), yR = R0.y + R0.h / 2, bx = b => p.evaluate(b => { const U = __spk.page.ui(), g = spk1Grid0(U), r = U.ru.getBoundingClientRect(); return r.left + spk1X(U, g.off + b * g.bar); }, b);
  await drag([await bx(4), yR], [await bx(2.05), yR], 10); await p.waitForTimeout(200); }
const LP = await p.evaluate(() => __spk.spk2.loop.get());
ok('loop-takt-1-2', LP, LP && LP[0] === 0 && LP[1] === 2);
await tap(await btn(p, 'In die Matrix ▾')); await p.waitForTimeout(250);
const LD = await layout(p); await p.screenshot({path: path.join(fotos, '64-gesamt-in-die-matrix.png')});
const u0 = await p.evaluate(() => ({n: UNDO.length, st: sx14State(), nt: NT()}));
await tap(await sbtn(p, '#spk1Sheet .spk1-dd [data-mx="midi"]'));
await p.waitForFunction(() => { const m = __spk.spk2.loop.last(); return m && m.kind === 'midi'; }, null, {timeout: 60000}); await p.waitForTimeout(200);
const M1 = await p.evaluate(() => {
  const U = __spk.page.ui(), r = __spk.spk2.loop.last(), c = S.tracks[r.track].clips[r.scene], g = spk1Grid0(U), [ta] = __spk.spk2.loop.sec(), qs = __spk.spk2.loop.notes(r.lid), st = g.beat / 4, sq = st / (60 / U.meta.grid.bpm);
  const soll = qs.map(q => ({t: Math.round((q.t0 - ta) / st) * sq, n: Math.round(q.m)})).sort((a, b) => a.t - b.t || a.n - b.n), ist = c.notes.map(n => ({t: n.t, n: n.n})).sort((a, b) => a.t - b.t || a.n - b.n);
  return {r, len: c.len, ist, gleich: soll.length === ist.length && soll.every((s, i) => Math.abs(s.t - ist[i].t) < 1e-6 && s.n === ist[i].n), raster: c.notes.every(n => Math.abs(n.t / 0.25 - Math.round(n.t / 0.25)) < 1e-6), rolle: sx11Role(r.track, null), lab: UNDO[UNDO.length - 1].label, undo: UNDO.length};
});
{ const tr2 = truth.filter(g => g.bar < 2), hit = tr2.filter(g => M1.ist.some(n => Math.abs(n.t - g.tb) < 1e-6 && n.n === g.m)).length;
  M1.wieOriginal = hit + '/' + tr2.length;
  ok('als-midi', {quelle: M1.r.lid, spur: M1.r.track, rolle: M1.rolle, noten: M1.ist.length, gleich: M1.gleich, raster: M1.raster, len: M1.len, wieOriginal: M1.wieOriginal, lab: M1.lab}, M1.r.lid !== 'orig' && M1.ist.length > 0 && M1.gleich && M1.raster && M1.len === 2 && M1.rolle === 'bass' && M1.undo === u0.n + 1 && /MIDI/.test(M1.lab)); }
// MIDI taktgenau gespielt: Szene starten, gespielte Noten der Spur auf dem 1/16-Raster (±2 ms), Abfolge = Clip
const MP = await p.evaluate(async ({o, s}) => { clearLog(); launchScene(s); await new Promise(r => setTimeout(r, 6000)); const L = noteLog(512).filter(e => e.track === o), z = b2t(0), sp = spb(); stop();
  return {n: L.length, ph: L.map(e => { const x = (e.time - z) / sp; return +((x - Math.round(x / 0.25) * 0.25) * sp * 1000).toFixed(2); }), seq: L.slice(0, 8).map(e => e.out != null ? e.out : e.clipNote)}; }, {o: M1.r.track, s: M1.r.scene});
ok('midi-taktgenau-gespielt', {n: MP.n, phase_ms_max: Math.max(...MP.ph.map(Math.abs)), seq: MP.seq}, MP.n >= Math.min(4, M1.ist.length) && MP.ph.every(v => Math.abs(v) <= 2));
const UM = await p.evaluate(b0 => { undo(); const a = sx14State() === b0.st && NT() === b0.nt; redo(); const r = __spk.spk2.loop.last(); return {gleich: a, wieder: !!(S.tracks[r.track].clips[r.scene] && S.tracks[r.track].clips[r.scene].notes.length)}; }, u0);
// als Audio (Quelle = Bass-Ebene) → Spur „Original“; Inhalt = Ebene im Loop (mono, 16 Bit)
await p.waitForTimeout(300); await tap(await btn(p, 'In die Matrix ▾')); await p.waitForTimeout(250);
const u1 = await p.evaluate(() => ({n: UNDO.length, st: sx14State(), nt: NT()}));
await tap(await sbtn(p, '#spk1Sheet .spk1-dd [data-mx="audio"]'));
await p.waitForFunction(() => { const m = __spk.spk2.loop.last(); return m && m.kind === 'audio'; }, null, {timeout: 60000}); await p.waitForTimeout(300);
const A1 = await p.evaluate(async () => {
  const U = __spk.page.ui(), r = __spk.spk2.loop.last(), tr = S.tracks[r.track], c = tr.clips[r.scene], pcm = await tkPcm(r.take), [ta, tb] = __spk.spk2.loop.sec(), sr = U.meta.sr, a = Math.round(ta * sr), n = Math.round(tb * sr) - a;
  const e = (await __spk.render(U.act, a, a + n)).ch; let mx = 0; for (let i = 0; i < n; i += 7) { let v = 0; for (const ch of e) v += ch[i] / e.length; v = Math.max(-32767, Math.min(32767, Math.round(v * 32767))); mx = Math.max(mx, Math.abs(v - pcm[i])); }
  return {r, orig: !!tr.orig, len: c.len, in: c.audio.in, out: +c.audio.out.toFixed(6), soll: +(tb - ta).toFixed(6), pcm: pcm.length, n, abw: mx, lab: UNDO[UNDO.length - 1].label, undo: UNDO.length};
});
ok('als-audio', {quelle: A1.r.lid, orig: A1.orig, len: A1.len, in: A1.in, out: A1.out, soll: A1.soll, abw_lsb: A1.abw, lab: A1.lab}, A1.orig && A1.len === 2 && Math.abs(A1.in) < 1e-6 && Math.abs(A1.out - A1.soll) < 1e-3 && Math.abs(A1.pcm - A1.n) <= 1 && A1.abw <= 1 && A1.undo === u1.n + 1 && /Audio/.test(A1.lab));
const AP = await p.evaluate(async ({o, s}) => { const L = []; const f0 = tkStartSrc; window.tkStartSrc = x => { if (x.i === o) L.push({when: x.when, off: x.off}); return f0(x); };
  launchScene(s); await new Promise(r => setTimeout(r, 9500)); const z = b2t(0), sp = spb(), bb = clipBarB(S.tracks[o].clips[s]); stop(); window.tkStartSrc = f0; return {L, z, sp, bb}; }, {o: A1.r.track, s: A1.r.scene});
{ const bar = AP.bb * AP.sp, per = 2 * bar, ws = AP.L.map(x => x.when), d = ws.slice(1).map((w, i) => w - ws[i]), ph = ws.map(w => ((w - AP.z) / bar) - Math.round((w - AP.z) / bar));
  ok('audio-taktgenau-gespielt', {n: ws.length, abstand_ms: d.map(v => +(v * 1000).toFixed(2)), soll_ms: +(per * 1000).toFixed(2), phase_ms: ph.map(v => +(v * bar * 1000).toFixed(2))}, ws.length >= 2 && d.every(v => Math.abs(v - per) < 0.002) && ph.every(v => Math.abs(v * bar) < 0.002) && AP.L.every(x => Math.abs(x.off) < 0.001)); }
const UA = await p.evaluate(b0 => { undo(); const a = sx14State() === b0.st && NT() === b0.nt; redo(); const r = __spk.spk2.loop.last(); return {gleich: a, wieder: !!(S.tracks[r.track].clips[r.scene] && S.tracks[r.track].clips[r.scene].audio)}; }, u1);
console.log('INFO Loop/Matrix fertig (' + el() + ')');
// 6) Klang nachbauen: a) bekannter App-Klang (VA Säge + Rechteck) → Abstand klein; b) Noten ▾ → Klang nachbauen (beste Note der Bass-Ebene)
const KP = await p.evaluate(async () => { const lg = (v, a, b) => Math.log(v / a) / Math.log(b / a);
  const u = [lg(1200, 30, 18000), 0.3, 0.7, lg(0.25, 0.005, 4), lg(0.005, 0.001, 2), lg(0.3, 0.005, 4), 0.6, lg(0.2, 0.005, 4), 0.3, 0, 0.5];
  const r = await __spk.spk2.klang.probe(__spk.spk2.klang.snd('va', {o1: 0, o2: 1}, u), 45, 0.6, {n: 50}); return {eng: r.best.eng, d: +r.best.dist.toFixed(2), d0: +r.d0.toFixed(2), n: r.n, ms: r.ms, txt: r.best.txt}; });
ok('klang-abstand-bekannt', KP, KP.eng === 'va' && KP.d < 4 && KP.d <= 0.9 * KP.d0 && KP.n >= 45);
await tap(await btn(p, 'Noten ▾')); await p.waitForTimeout(200); await tap(await sbtn(p, '#spk1Sheet .spk1-dd [data-n2="klang"]'));
{ const t0 = Date.now(); await p.waitForFunction(() => { const K = __spk.page.ui().kl; return K && K.res && /Abstand .* dB \(Start/.test(K.tb || ''); }, null, {timeout: 120000}); info.klang_ms = Date.now() - t0; }
const KE = await p.evaluate(() => { const s = SYNQUENZER.spk1.spk2.klang.stand(), d = document.querySelector('#spk1Sheet .spk1-dd'), cv = d.querySelector('canvas.spk2-klc'), c = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let lit = 0; for (let i = 0; i < c.length; i += 4) if (c[i] + c[i + 1] + c[i + 2] > 300) lit++;
  return {nm: s.nm, eng: s.best.eng, d: +s.best.dist.toFixed(2), d0: +s.d0.toFixed(2), lit, h5: d.querySelector('h5').textContent}; });
await p.screenshot({path: path.join(fotos, '65-gesamt-klang.png')});
ok('klang-abstand-ebene', Object.assign(KE, {ms: info.klang_ms}), KE.d < KE.d0 && KE.lit > 300 && /Klang nachbauen/.test(KE.h5) && info.klang_ms < 60000);   // Wert hängt an der Trennung (Bass-Ebene), Güte prüft klang-abstand-bekannt
const ab = await p.evaluate(() => [...document.querySelectorAll('#spk1Sheet .spk2-klab button')].map(e => { const q = e.getBoundingClientRect(); return [q.left + q.width / 2, q.top + q.height / 2]; }));
await tap(ab[1]); await p.waitForTimeout(150); const pB = await p.evaluate(() => ({kl: SPK1.pl && SPK1.pl.kl, g: SPK1.pl && SPK1.pl.g}));
await tap(ab[0]); await p.waitForTimeout(150); const pA = await p.evaluate(() => ({kl: SPK1.pl && SPK1.pl.kl, g: SPK1.pl && SPK1.pl.g}));
const rr = await p.evaluate(() => { const K = __spk.page.ui().kl; return {rA: K.src.feat.rms, rB: K.res.best.F.rms}; }); await p.evaluate(() => spk1Stop());
{ const dB = 20 * Math.log10((pB.g * rr.rB) / (pA.g * rr.rA)); ok('klang-ab-gleich-laut', {A: pA.kl, B: pB.kl, unterschied_dB: +dB.toFixed(3)}, pA.kl === 'a' && pB.kl === 'b' && Math.abs(dB) < 0.1); }
const kv = await p.evaluate(() => { const K = __spk.page.ui().kl; return {t: K.t, snd: K.t >= 0 ? JSON.stringify(S.tracks[K.t].sound) : null, undo: UNDO.length}; });
await tap(await sbtn(p, '#spk1Sheet .spk1-dd [data-kl="nehmen"]')); await p.waitForTimeout(300);
const kn = await p.evaluate(t => ({name: S.tracks[t] && S.tracks[t].sound.name, undo: UNDO.length, lab: UNDO[UNDO.length - 1].label}), kv.t);
ok('klang-uebernehmen', {spur: kv.t, name: kn.name, lab: kn.lab}, kv.t >= 0 && /Nachbau/.test(kn.name) && kn.undo === kv.undo + 1);
const UK = await p.evaluate(v => { undo(); const a = JSON.stringify(S.tracks[v.t].sound) === v.snd; redo(); return {gleich: a, wieder: /Nachbau/.test(S.tracks[v.t].sound.name)}; }, kv);
await ddZu();
// Undo je Aktion (App-↶): MIDI, Audio, Klang – je ein Schritt bringt den Stand von vorher, ↷ wieder
ok('undo-je-aktion', {midi: UM, audio: UA, klang: UK}, UM.gleich && UM.wieder && UA.gleich && UA.wieder && UK.gleich && UK.wieder);
console.log('INFO Klang fertig (' + el() + ')');
// 7) Speichern/Laden des Spektral-Dokuments (Noten, Vorlage, Masken) + Container in frischem Speicher
const SV = await p.evaluate(async () => {
  const id = __spk.state().doc, pts = [], L = (await __spk.layers()).layers; for (const l of L) for (const [m, k] of [[30, 3], [200, 10], [400, 60], [600, 300]]) pts.push([l.id, m, k]);
  const rd = async () => { const o = []; for (const [l, m, k] of pts) o.push(await __spk.maskAt(l, m, k)); return o; };
  const a = await rd(), t2a = JSON.stringify((await __spk.open(id)).meta.teil2); await __spk.save(); await __spk.close(); const r = await __spk.open(id), b = await rd(), t2b = JSON.stringify(r.meta.teil2);
  __spk.page.ui().meta = r.meta;
  return {id, masken: a.join() === b.join(), noten: t2a === t2b, n: Object.values(r.meta.teil2.notes).reduce((s, x) => s + x.length, 0), t2: t2a, mk: a, pts, linked: (S.spk || []).some(x => x.id === id)};
});
ok('speichern-laden-spektral', {masken: SV.masken, noten: SV.noten, n: SV.n, verknuepft: SV.linked}, SV.masken && SV.noten && SV.n > 0 && SV.linked);
const CB = await p.evaluate(async () => { const r = __spk.spk2.loop.last(), D = window.SYNQUENZER, aud = S.tracks.findIndex(t => t.orig), ac = S.tracks[aud].clips.findIndex(c => c && c.audio), take = S.tracks[aud].clips[ac].audio.take;
  const mid = S.tracks.map((t, i) => ({i, c: t.clips.findIndex((c, s) => c && !c.audio && c.notes && c.notes.length && s > 0)})).filter(x => x.c > 0)[0];
  return {b64: await D.va1BoxB64(), h: await D.tkPcmHash(take), take, aud, ac, mid: mid && {i: mid.i, s: mid.c, notes: JSON.stringify(S.tracks[mid.i].clips[mid.c].notes)}, snd: S.tracks[0].sound.name, files: (await __spk.zipAdd()).map(f => f.name)}; });
{ const p2 = await page(428, 926);
  const C = await p2.p.evaluate(async ({c, sv}) => {
    const D = window.SYNQUENZER, r = await D.va1BoxImport(c.b64); await new Promise(x => setTimeout(x, 2500));
    const loaded = await D.tkLoadAll(), h2 = await D.tkPcmHash(c.take), list = await __spk.list(), o = await __spk.open(sv.id), b = []; for (const [l, m, k] of sv.pts) b.push(await __spk.maskAt(l, m, k));
    return {ok: r.ok, audio: h2 === c.h && loaded.includes(c.take), orig: !!(S.tracks[c.aud] && S.tracks[c.aud].orig && S.tracks[c.aud].clips[c.ac] && S.tracks[c.aud].clips[c.ac].audio), midi: !!c.mid && JSON.stringify(S.tracks[c.mid.i].clips[c.mid.s].notes) === c.mid.notes,
      klang: S.tracks[0].sound.name === c.snd, spk: JSON.stringify(list).includes(sv.id), noten: JSON.stringify(o.meta.teil2) === sv.t2, masken: b.join() === sv.mk.join(), verkn: (S.spk || []).some(x => x.id === sv.id)};
  }, {c: CB, sv: SV});
  ok('container-frisch', {dateien: CB.files.filter(f => /doc\.json|\.bin$/.test(f)).length, ...C}, C.ok && C.audio && C.orig && C.midi && C.klang && C.spk && C.noten && C.masken && C.verkn);
  await p2.ctx.close(); }
// alte Projekte unverändert: Demo-Projekt + gespeichertes Projekt (ohne SPK2-Felder) ergeben in Basis und neuer Fassung dieselbe Projektdatei
{ const mk = async u => { const q = await page(428, 926, u); const s = await q.p.evaluate(() => { SYNQUENZER.loadDemo(); const f = SQStore.buildProjectFile(S, null, 'x'); const g = normalizeProject(projFromFile(JSON.parse(JSON.stringify(f)))); return JSON.stringify([f, SQStore.buildProjectFile(g, null, 'x')]).replace(/"(saved|time|ts0|created|modified|id)":("[^"]*"|\d+)/g, ''); }); await q.ctx.close(); return s; };
  const a = await mk(base + '__basis.html'), c = await mk(url);
  ok('alte-projekte-unveraendert', {gleich: a === c, laenge: [a.length, c.length]}, a === c); }
console.log('INFO Speichern/Container fertig (' + el() + ')');
// 8) Layout hochkant + quer (Loop-Zeile, Klappfenster „In die Matrix“ offen), ✕ sichtbar; ✕ schließt
ok('layout-428x926-matrix-offen', LD, layOk(LD) && !!LD.loop && !!LD.dd);
for (const [w, h] of [[926, 428], [926, 370], [428, 926]]) {
  await ddZu(); await p.setViewportSize({width: w, height: h}); await p.waitForTimeout(600);
  const L0 = await layout(p); await tap(await btn(p, 'Noten ▾')); await p.waitForTimeout(250); const L1 = await layout(p);
  await ddZu(); await tap(await btn(p, 'In die Matrix ▾')); await p.waitForTimeout(250); const L2 = await layout(p);
  if (h !== 926) await p.screenshot({path: path.join(fotos, '66-gesamt-quer-' + h + '.png')});
  ok('layout-' + w + 'x' + h, {zu: L0, noten: L1.dd, matrix: L2.dd, x: L0.x, loop: L0.loop}, layOk(L0) && layOk(L1) && layOk(L2) && !!L1.dd && !!L2.dd && !!L0.loop);
}
await ddZu(); { const L = await layout(p); await tap([L.x.l + 22, L.x.t + 22]); await p.waitForTimeout(400); }
ok('x-schliesst', await p.evaluate(() => ({offen: __spk.page.info().open})), !(await p.evaluate(() => __spk.page.info().open)));
await ctx.close();
ok('keine-konsolen-fehler', errs.slice(0, 5), errs.length === 0);
await b.close(); srv.close();
const bad = Object.entries(res).filter(([, v]) => !v.ok).map(([k]) => k);
fs.writeFileSync(path.join(dir, 'spk2-test.json'), JSON.stringify({res, info, errs, sek: Math.round((Date.now() - T0) / 1000)}, null, 1));
console.log('INFO ' + JSON.stringify(info));
console.log(bad.length ? bad.length + ' FEHLER von ' + Object.keys(res).length + ': ' + bad.join(', ') : 'ALLE OK (' + Object.keys(res).length + ')', el());
