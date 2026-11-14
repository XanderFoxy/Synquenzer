// SPK1 Test Schritt 4/4 (OK/FEHLER): Seite, Start lädt nichts, Rekonstruktion, Werkzeuge, Transfer, Zerlegen (Demo-Stems → SDR), Verfeinern, Undo, Speichern/Laden, hochkant + quer
// Aufruf: node spk1-test.mjs <index.html>
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
{
  const {p, ctx, drag, tap} = await page(428, 926);
  // 1) Start: nichts geladen (kein Blatt, kein CSS, kein Worker)
  const st0 = await p.evaluate(() => ({sheet: !!document.getElementById('spk1Sheet'), css: !!document.getElementById('spk1Css'), wk: __wk.length, state: __spk.state()}));
  ok('start-laedt-nichts', st0, !st0.sheet && !st0.css && st0.wk === 0 && !st0.state.worker);
  // 2) ≡-Menü → Spektral → Datei laden (Demo-Gemisch)
  await p.evaluate(() => openMenu()); await p.waitForTimeout(300);
  const mb = await p.evaluate(() => { const e = [...document.querySelectorAll('#menu button')].find(x => /Spektral/.test(x.textContent)); if (!e) return null; e.scrollIntoView({block: 'center'}); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
  await tap(mb); await p.waitForTimeout(400);
  const fb = await btn(p, 'Datei laden');
  const [fc] = await Promise.all([p.waitForEvent('filechooser', {timeout: 5000}), tap(fb)]);
  await fc.setFiles({name: 'Demo-Song.wav', mimeType: 'audio/wav', buffer: mixWav()});
  await p.waitForFunction(() => { const i = __spk.page.info(); return i && !i.nodoc; }, null, {timeout: 60000});
  await waitChunks(p); await p.waitForTimeout(300);
  const s1 = await info(p);
  ok('seite-offen-datei-geladen', {gl: s1.gl, chunks: s1.chunks, worker: (await p.evaluate(() => __spk.state())).how}, s1.open && s1.gl && s1.chunks >= 1);
  // 3) Rekonstruktion STFT → ISTFT (Kern im Worker)
  const rt = await p.evaluate(async () => { const x = new Float32Array(44100 * 2); let s = 3; for (let i = 0; i < x.length; i++) { s = (s * 16807) % 2147483647; x[i] = 0.3 * (s / 2147483647 * 2 - 1) + 0.4 * Math.sin(i * 0.031); } const out = []; for (const N of [1024, 4096, 16384]) { const r = await __spk.stft(x, N); out.push(+r.maxDb.toFixed(1)); } return out; });
  ok('rekonstruktion', rt, rt.every(v => v < -80));
  // 4) Auswahl-Werkzeuge (Rechteck ziehen, Zeit, Frequenz, Pinsel) + Transfer (In Ebene kopieren) + Undo
  const mn = await box(p, '#spk1Sheet .spk1-mn');
  await drag([mn.x + mn.w * 0.2, mn.y + mn.h * 0.3], [mn.x + mn.w * 0.5, mn.y + mn.h * 0.6]);
  const a1 = await info(p);
  await p.evaluate(() => __spk.page.tool('zeit')); await drag([mn.x + mn.w * 0.3, mn.y + mn.h * 0.5], [mn.x + mn.w * 0.6, mn.y + mn.h * 0.5]); const a2 = await info(p);
  await p.evaluate(() => __spk.page.tool('freq')); await drag([mn.x + mn.w * 0.5, mn.y + mn.h * 0.2], [mn.x + mn.w * 0.5, mn.y + mn.h * 0.4]); const a3 = await info(p);
  await p.evaluate(() => __spk.page.tool('pinsel')); await drag([mn.x + mn.w * 0.2, mn.y + mn.h * 0.5], [mn.x + mn.w * 0.4, mn.y + mn.h * 0.55]); const a4 = await info(p);
  ok('auswahl-werkzeuge', [a1.selArts, a2.selArts, a3.selArts, a4.selArts], a1.selArts[0] === 'rect' && a2.selArts[0] === 'zeit' && a3.selArts[0] === 'freq' && a4.selArts.includes('pinsel'));
  await p.evaluate(() => __spk.page.tool('rect')); await drag([mn.x + mn.w * 0.1, mn.y + mn.h * 0.2], [mn.x + mn.w * 0.6, mn.y + mn.h * 0.7]);
  const tr = await p.evaluate(async () => { const U = __spk.page.ui(); U.modus = 'kopieren'; await __spk.page.into('neu', 'lead'); const i = __spk.page.info(), s = await __spk.sum(); return {layers: i.layers, over: s.over, part: s.part}; });
  ok('transfer-in-ebene', tr, tr.layers.includes('Lead') && tr.part > 0);
  const un = await p.evaluate(async () => { const r = await __spk.undo(); await __spk.page.ui && null; return {layers: r.meta.layers.length, label: r.redo}; });
  await p.evaluate(() => { const U = __spk.page.ui(); U.modus = 'verschieben'; U.sel = []; });
  ok('undo-transfer', un, un.layers === 0 && /kopieren/.test(un.label));
  await p.evaluate(async () => { const r = await __spk.open(__spk.state().doc); __spk.page.ui().meta = r.meta; });
  // 5) Zerlegen: Abbrechen (nichts geändert), dann ganz (Knopf), ein Undo-Schritt
  const zb = await btn(p, 'Zerlegen'); await tap(zb);
  await p.waitForFunction(() => /Zerlegen ·/.test(__spk.page.info().stat), null, {timeout: 30000});
  const ab = await btn(p, '■ Abbrechen'); await tap(ab);
  await p.waitForFunction(() => !__spk.page.info().busy, null, {timeout: 60000});
  const z0 = await p.evaluate(async () => ({stat: __spk.page.info().stat, layers: (await __spk.layers()).layers.length}));
  ok('zerlegen-abbrechen', z0, /abgebrochen/.test(z0.stat) && z0.layers === 0);
  const tz = Date.now(); await tap(await btn(p, 'Zerlegen'));
  await p.waitForFunction(() => /^Zerlegt/.test(__spk.page.info().stat), null, {timeout: 240000});
  const zms = Date.now() - tz; await p.waitForTimeout(500);
  await p.screenshot({path: path.join(fotos, '20-zerlegt-hochkant.png')});
  // Messung im Browser: Stems laden (über den Prüf-Server), Ebenen rendern, SDR + Anteil je Ebene
  const M = await p.evaluate(async () => {
    const ld = async n => new Float32Array(await (await fetch('mess/' + n + '.f32')).arrayBuffer());
    const R = {bass: await ld('spur0'), lead: await ld('spur1'), pad: await ld('spur2'), drums: await ld('spur4')}, i0 = __spk.page.info(), L = (await __spk.layers()).layers, n = Math.round(i0.v ? __spk.page.ui().dur * 44100 : 0);
    const S = k => [0, 1].map(c => { const o = new Float32Array(n); const x = R[k]; for (let i = 0; i < Math.min(n, x.length / 2); i++) o[i] = x[2 * i + c]; return o; });
    const ref = {bass: S('bass'), drums: S('drums'), lead: S('lead'), pad: S('pad')}, lid = a => L.find(l => l.z === a).id, rend = async m => (await __spk.render(m, 0, n)).ch;
    const Y = {drums: await rend(lid('drums')), bass: await rend(lid('bass')), gesang: await rend(lid('gesang')), rest: await rend('rest')}, O = await rend('orig');
    const sdr = (r, e) => { let a = 0, b = 0; for (let c = 0; c < 2; c++) for (let i = 0; i < n; i++) { a += r[c][i] ** 2; b += (e[c][i] - r[c][i]) ** 2; } return +(10 * Math.log10(a / Math.max(b, 1e-12))).toFixed(2); };
    const add = (...a) => [0, 1].map(c => { const o = new Float32Array(n); for (const x of a) for (let i = 0; i < n; i++) o[i] += x[c][i]; return o; });
    const proj = (r, e) => { let a = 0, b = 0; for (let c = 0; c < 2; c++) for (let i = 0; i < n; i++) { a += r[c][i] * e[c][i]; b += r[c][i] ** 2; } return +(a / b).toFixed(3); };
    const rms = x => { let s = 0; for (let i = 0; i < n; i++) s += x[0][i] ** 2; return +(10 * Math.log10(s / n + 1e-20)).toFixed(1); };
    window.__ref = ref; window.__n = n;
    return {n, ebenen: L.map(l => l.name), summe: sdr(O, add(Y.drums, Y.bass, Y.gesang, Y.rest)),
      sdr: {drums: sdr(ref.drums, Y.drums), bass: sdr(ref.bass, Y.bass), tonal: sdr(add(ref.lead, ref.pad), add(Y.gesang, Y.rest)), bass_in_drums_ebene: sdr(ref.bass, Y.drums), drums_in_bass_ebene: sdr(ref.drums, Y.bass)},
      anteil: {drums_in: {drums: proj(ref.drums, Y.drums), bass: proj(ref.drums, Y.bass)}, bass_in: {bass: proj(ref.bass, Y.bass), drums: proj(ref.bass, Y.drums)}},
      pegel_dB: {orig: rms(O), drums: rms(Y.drums), bass: rms(Y.bass), gesang: rms(Y.gesang), rest: rms(Y.rest), ref_drums: rms(ref.drums), ref_bass: rms(ref.bass)}, undo: __spk.page.info().layers};
  });
  M.ms = zms; res.messung = M;
  ok('zerlegen-summe-gleich-original', {summe: M.summe, ebenen: M.ebenen}, M.summe > 60 && M.ebenen.length === 3);
  // Grenzwert „Drums/Bass getrennt“: Drums-Ebene ≥ 4 dB SDR; jede Ebene gleicht ihrer eigenen Spur mehr als der anderen
  ok('zerlegen-drums-bass-getrennt', {sdr: M.sdr, anteil: M.anteil, ms: zms}, M.sdr.drums >= 4 && M.sdr.bass > M.sdr.bass_in_drums_ebene && M.sdr.drums > M.sdr.drums_in_bass_ebene && M.sdr.bass > 0);
  // 6) Verfeinern (Auswahl Bass-Bereich 20–300 Hz, Ziel Bass) über die Seite → Vorher/Nachher, SDR der Ziel-Ebene
  const vf = await p.evaluate(async () => {
    const U = __spk.page.ui(), n = window.__n, ref = window.__ref, L = (await __spk.layers()).layers, lb = L.find(l => l.z === 'bass').id;
    const sdr = async () => { const e = (await __spk.render(lb, 0, n)).ch; let a = 0, b = 0; for (let c = 0; c < 2; c++) for (let i = 0; i < n; i++) { a += ref.bass[c][i] ** 2; b += (e[c][i] - ref.bass[c][i]) ** 2; } return +(10 * Math.log10(a / b)).toFixed(2); };
    const vor = await sdr();
    U.sel = [{art: 'rect', t0: 0, t1: U.dur, f0: 20, f1: 300, kt: 0, kf: 0}]; U.selVer++;
    const r = await __spk.page.verf('bass'); const nach = await sdr(); const i1 = __spk.page.info();
    await __spk.page.vfAb(false); const back = await sdr(); const i2 = __spk.page.info(); await __spk.page.vfAb(true);
    return {vor, nach, zurueck: back, N: r && r.N, anteil: r && [r.vorher, r.nachher], vf1: i1.vf, vf2: i2.vf, dd: !!document.querySelector('#spk1Sheet .spk1-dd .spk1-vf')};
  });
  await p.screenshot({path: path.join(fotos, '21-verfeinern-vorher-nachher.png')});
  ok('verfeinern-vorher-nachher', vf, vf.vf1 && vf.vf1.nach && vf.vf2 && !vf.vf2.nach && Math.abs(vf.zurueck - vf.vor) < 0.01 && vf.dd);
  ok('verfeinern-verbessert-ziel', {vor: vf.vor, nach: vf.nach}, vf.nach > vf.vor + 0.3);
  // 7) Undo Zerlegen (ein Schritt) → keine Ebenen; Redo → wieder da
  const uz = await p.evaluate(async () => { await __spk.undo(); const a = (await __spk.layers()).layers.length; const r = await __spk.undo(); const b = (await __spk.layers()).layers.length; await __spk.redo(); await __spk.redo(); const c = (await __spk.layers()).layers.length; return {nachVerf: a, nachZerl: b, label: r.redo, redo: c}; });
  ok('undo-zerlegen-ein-schritt', uz, uz.nachZerl === 0 && uz.redo === 3 && /Zerlegen/.test(uz.label));
  // 8) Speichern / Neu laden (Worker zu, wieder auf) → gleiche Masken
  const sv = await p.evaluate(async () => {
    const id = __spk.state().doc, pts = [], L = (await __spk.layers()).layers; for (const l of L) for (const [m, k] of [[30, 3], [200, 10], [400, 60], [600, 300]]) pts.push([l.id, m, k]);
    const rd = async () => { const o = []; for (const [l, m, k] of pts) o.push(await __spk.maskAt(l, m, k)); return o; };
    const a = await rd(); await __spk.save(); await __spk.close(); await __spk.open(id); const b = await rd();
    return {gleich: a.join() === b.join(), werte: a.slice(0, 8)};
  });
  ok('speichern-laden', sv, sv.gleich && sv.werte.some(v => v > 0));
  // 9) hochkant ohne Überlappung, ✕ sichtbar; ✕ schließt ohne Fehler
  await p.evaluate(() => { const U = __spk.page.ui(); if (U.dd) { U.dd.remove(); U.dd = null; } });
  const L1 = await layout(p); ok('hochkant-layout', L1, !L1.over.length && !L1.out.length && L1.x.vis && L1.x.w >= 44 && L1.small === 0);
  await tap([L1.x.l + 22, L1.x.t + 22]); await p.waitForTimeout(300);
  const cl = await p.evaluate(() => ({open: __spk.page.info().open, menu: !!document.querySelector('#menu.open, #menu:not([hidden])')}));
  ok('schliessen', cl, !cl.open);
  // 10) quer 926×428 und 926×370 (gleiches Gerät): wieder öffnen = dieselbe Analyse, Ebenen da, ohne Überlappung, ✕ sichtbar
  for (const [w, h] of [[926, 428], [926, 370]]) {
    await p.setViewportSize({width: w, height: h}); await p.waitForTimeout(300);
    await p.evaluate(async () => { await __spk.page.open(); }); await waitChunks(p); await p.waitForTimeout(600);
    const i = await info(p), L = await layout(p);
    await p.screenshot({path: path.join(fotos, '22-quer-' + h + '.png')});
    ok('quer-' + h, {L, layers: i.layers, tint: i.tint}, !L.over.length && !L.out.length && L.x.vis && L.x.w >= 44 && i.layers.length === 3);
    await p.evaluate(() => __spk.page.close()); await p.waitForTimeout(200);
  }
  await ctx.close();
}
ok('keine-konsolen-fehler', errs.slice(0, 5), errs.length === 0);
res.sek = Math.round((Date.now() - T0) / 1000);
fs.writeFileSync(path.join(dir, 'spk1-test.json'), JSON.stringify(res, null, 1));
const bad = Object.entries(res).filter(([k, v]) => v && v.ok === false).map(([k]) => k);
console.log(bad.length ? 'FEHLER: ' + bad.join(', ') : 'ALLE OK');
await b.close(); srv.close();
