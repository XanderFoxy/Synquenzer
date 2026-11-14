// SPK2 Auftrag 2 Test: Noten je Ebene (Kästchen), Zuordnen per Tipp/Rahmen, Überall finden, alle übernehmen, Verfeinern nach Noten, Undo je Aktion, hochkant + quer
// Aufruf: node spk2-noten-test.mjs <index.html>
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
  // 1) Werkzeug „Noten“ per Tipp, Optionszeile mit „Noten ▾“
  await tap(await btn(p, 'Noten'));
  const w1 = await p.evaluate(() => ({tool: __spk.page.info().tool, pane: !!document.querySelector('#spk1Sheet .spk1-o.on [aria-label^="Noten der Ebene"]'), lab: document.querySelector('#spk1Sheet .spk1-o.on label:last-child').textContent}));
  ok('werkzeug-noten', w1, w1.tool === 'noten' && w1.pane && /einstimmig/.test(w1.lab));
  // 2) Noten finden im Bass-Band des Originals (Auswahl Frequenz 28–400 Hz) per Knopf
  await p.evaluate(() => { const U = __spk.page.ui(); U.sel = [{art: 'freq', f0: 28, f1: 400, kt: 0, kf: 0}]; });
  await tap(await btn(p, 'Noten ▾')); await p.waitForTimeout(200);
  await tap(await btn(p, 'Noten finden'));
  await p.waitForFunction(() => /Noten in Original/.test(__spk.page.info().stat), null, {timeout: 60000});
  const n1 = await p.evaluate(() => { const U = __spk.page.ui(), N = U.meta.teil2.notes.orig || []; return {n: N.length, nu: SYNQUENZER.spk1.page.info ? __spk.page.info().stat : '', undo: U.bU.getAttribute('aria-label'), erste: N.slice(0, 3).map(q => [q.t0, q.m, q.st])}; });
  ok('noten-finden', n1, n1.n >= 16 && /Noten finden/.test(n1.undo));
  await p.evaluate(() => { const U = __spk.page.ui(); U.v.mTop = 62; U.v.rowH = 14; U.v.pps = 120; U.v.t0 = 0; __spk.page.ui().sel = []; }); await p.evaluate(() => { const U = __spk.page.ui(); spk1Dirty(U, 'all'); }); await p.waitForTimeout(400);
  await p.screenshot({path: path.join(fotos, '30-noten-hochkant.png')});
  // Kästchen sichtbar: Pixel der Overlay-Ebene an der Mitte der ersten Note nicht leer
  const pix = await p.evaluate(() => { const U = __spk.page.ui(), q = U.meta.teil2.notes.orig[0], b = SYNQUENZER.spk1.spk2.page.box('orig', q.id), r = U.mn.getBoundingClientRect(), x = U.ov.getContext('2d').getImageData(Math.round((b.x - r.left) * U.dpr), Math.round((b.y - r.top) * U.dpr), 1, 1).data; return {a: x[3], box: b}; });
  ok('kaestchen-sichtbar', pix, pix.a > 0);
  // 3) Note antippen → „Gehört zu“ → Bass (neue Bass-Ebene, ein ↶)
  const id1 = await p.evaluate(() => { const N = __spk.page.ui().meta.teil2.notes.orig; const q = N.find(x => x.m === 36 && x.a < 0.1) || N[0]; return q.id; });
  const bx = await p.evaluate(id => SYNQUENZER.spk1.spk2.page.box('orig', id), id1);
  await tap([bx.x, bx.y]); await p.waitForTimeout(250);
  const dd = await p.evaluate(() => { const d = document.querySelector('#spk1Sheet .spk1-dd'); return d ? {txt: d.textContent.slice(0, 80), zu: [...d.querySelectorAll('[data-zu]')].map(b => b.textContent), small: [...d.querySelectorAll('button')].filter(b => b.getBoundingClientRect().height < 43.5).length} : null; });
  ok('tipp-gehoert-zu', dd, dd && dd.zu.join('|').startsWith('Bass|Gesang|Lead|Pads|Neue Ebene') && dd.small === 0);
  await p.screenshot({path: path.join(fotos, '31-gehoert-zu.png')});
  const nu0 = await p.evaluate(() => __spk.page.info().layers.length);
  await tap(await ddBtn(p, 'bass')); await p.waitForFunction(() => /→ Bass/.test(__spk.page.info().stat), null, {timeout: 30000});
  const z1 = await p.evaluate(id => { const U = __spk.page.ui(), L = U.meta.layers.find(l => l.art === 'bass'), N = L ? (U.meta.teil2.notes[L.id] || []) : []; return {ebenen: U.meta.layers.map(l => l.name), inBass: N.filter(q => q.st === 'zu').map(q => q.id), noch: (U.meta.teil2.notes.orig || []).some(q => q.id === id), undo: U.bU.getAttribute('aria-label')}; }, id1);
  ok('zuordnen-tipp', z1, z1.ebenen.includes('Bass') && z1.inBass.includes(id1) && !z1.noch && /Note zuordnen/.test(z1.undo));
  // 4) Rahmen über Takt 1 (Bass-Band) → mehrere Noten → Bass (ein ↶)
  const T = await p.evaluate(() => { const U = __spk.page.ui(), r = U.mn.getBoundingClientRect(); return {x0: r.left + spk1X(U, 0.2), x1: r.left + spk1X(U, 60 / 112 * 4 - 0.05), y0: r.top + spk1Y(U, 140), y1: r.top + spk1Y(U, 55)}; });
  const nuA = await p.evaluate(() => SYNQUENZER.spk1.state().doc && __spk.page.ui().bU.getAttribute('aria-label'));
  await drag([T.x0, T.y0], [T.x1, T.y1]); await p.waitForTimeout(250);
  const sel2 = await p.evaluate(() => SYNQUENZER.spk1.spk2.page.sel().length);
  await tap(await ddBtn(p, 'bass')); await p.waitForFunction(n => (n > 1 ? /Noten → Bass/ : /Note → Bass/).test(__spk.page.info().stat) && /Noten? zuordnen/.test(__spk.page.ui().bU.getAttribute('aria-label')) && __spk.page.ui().bU.getAttribute('aria-label') !== 'Rückgängig: Note zuordnen' || n === 1, sel2, {timeout: 30000}); await p.waitForTimeout(300);
  const z2 = await p.evaluate(() => { const U = __spk.page.ui(), L = U.meta.layers.find(l => l.art === 'bass'); return {ebenen: U.meta.layers.length, zu: (U.meta.teil2.notes[L.id] || []).filter(q => q.st === 'zu').length, undo: U.bU.getAttribute('aria-label'), stat: __spk.page.info().stat}; });
  ok('zuordnen-rahmen', {gewaehlt: sel2, z2}, sel2 >= 2 && z2.ebenen === 1 && z2.zu >= 1 + sel2 - 1 && /\d+ Noten zuordnen/.test(z2.undo));
  // 5) Bass-Ebene wählen → Überall finden (Vorlage aus den bestätigten Noten), Treffer mit Sicherheit
  const bl = await p.evaluate(() => { const e = [...document.querySelectorAll('#spk1Sheet .spk1-lr .spk1-nm')].find(x => x.textContent === 'Bass'); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
  await tap(bl);
  await tap(await btn(p, 'Noten ▾')); await p.waitForTimeout(200); await tap(await btn(p, 'Überall finden'));
  await p.waitForFunction(() => /ähnliche Töne/.test(__spk.page.info().stat), null, {timeout: 90000}); await p.waitForTimeout(300);
  const f1 = await p.evaluate(() => { const U = __spk.page.ui(), L = U.meta.layers.find(l => l.art === 'bass'), N = U.meta.teil2.notes[L.id]; return {neu: N.filter(q => q.st === 'neu').length, sicher: N.filter(q => q.st === 'neu').slice(0, 5).map(q => q.conf), vorlage: !!U.meta.teil2.tmpl[L.id], stat: __spk.page.info().stat}; });
  ok('ueberall-finden', f1, f1.neu > 0 && f1.vorlage && f1.sicher.every(v => v >= 0 && v <= 1));
  await p.evaluate(() => { const U = __spk.page.ui(); U.v.pps = 40; spk1Dirty(U, 'all'); }); await p.waitForTimeout(300);
  await p.screenshot({path: path.join(fotos, '32-ueberall-finden.png')});
  // 6) Alle übernehmen (ab „Sicher ab“) → ein ↶; ↶ nimmt es zurück, ↷ wieder
  await tap(await btn(p, 'Noten ▾')); await p.waitForTimeout(200);
  const al = await p.evaluate(() => [...document.querySelectorAll('#spk1Sheet .spk1-dd button')].find(b => /^Alle übernehmen/.test(b.textContent)).textContent);
  await tap(await btn(p, 'Alle übernehmen')); await p.waitForFunction(() => /übernommen/.test(__spk.page.info().stat), null, {timeout: 30000});
  const cnt = () => p.evaluate(() => { const U = __spk.page.ui(), L = U.meta.layers.find(l => l.art === 'bass'), N = U.meta.teil2.notes[L.id]; return {zu: N.filter(q => q.st === 'zu').length, neu: N.filter(q => q.st === 'neu').length, undo: U.bU.getAttribute('aria-label')}; });
  const a1 = await cnt(); const ub = await box(p, '#spk1Sheet .spk1-hd .rb[data-a="undo"]'); await tap([ub.x + ub.w / 2, ub.y + ub.h / 2]); await p.waitForTimeout(500); const a2 = await cnt();
  const rb = await box(p, '#spk1Sheet .spk1-hd .rb[data-a="redo"]'); await tap([rb.x + rb.w / 2, rb.y + rb.h / 2]); await p.waitForTimeout(500); const a3 = await cnt();
  ok('alle-uebernehmen-undo-redo', {knopf: al, nach: a1, undo: a2, redo: a3}, a1.zu > z2.zu && /Noten zuordnen/.test(a1.undo) && a2.zu === z2.zu && a2.neu > 0 && a3.zu === a1.zu);
  // 7) Verfeinern auf Basis der bestätigten Noten (Auswahl = Kämme der Noten) → Klappfenster Vorher/Nachher
  await tap(await btn(p, 'Noten ▾')); await p.waitForTimeout(200); await tap(await btn(p, 'Verfeinern nach Noten'));
  await p.waitForFunction(() => /^Verfeinert/.test(__spk.page.info().stat), null, {timeout: 120000}); await p.waitForTimeout(300);
  const v1 = await p.evaluate(() => ({stat: __spk.page.info().stat, dd: !!document.querySelector('#spk1Sheet .spk1-dd'), sel: __spk.page.info().selArts.slice(0, 2)}));
  ok('verfeinern-nach-noten', v1, v1.dd && v1.sel[0] === 'harm');
  await p.screenshot({path: path.join(fotos, '33-verfeinern-nach-noten.png')});
  await p.evaluate(() => spk1Dd(__spk.page.ui(), null));
  // 8) quer 926×428 und 926×370: keine Überlappung, ✕ sichtbar, Noten-Werkzeug erreichbar
  for (const [w, h] of [[926, 428], [926, 370], [428, 926]]) {
    await p.setViewportSize({width: w, height: h}); await p.waitForTimeout(600);
    const L = await layout(p), nb = await btn(p, 'Noten ▾');
    ok('layout-' + w + 'x' + h, {over: L.over, out: L.out, x: L.x, noten: !!nb}, !L.over.length && !L.out.length && L.x.vis && L.x.w >= 44 && !!nb);
    if (h === 428) await p.screenshot({path: path.join(fotos, '34-noten-quer-428.png')});
  }
  ok('keine-fehler', errs, errs.length === 0);
  await ctx.close();
}
await b.close(); srv.close();
const bad = Object.entries(res).filter(([, v]) => !v.ok).map(([k]) => k);
console.log(bad.length ? bad.length + ' FEHLER: ' + bad.join(', ') : 'ALLE OK', ((Date.now() - T0) / 1000).toFixed(0) + ' s');
fs.writeFileSync(path.join(dir, 'spk2-noten-test.json'), JSON.stringify({res, errs}, null, 1));
