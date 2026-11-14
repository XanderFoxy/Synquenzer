// SPK1 Seiten-Test (Schritt 3/4): Touch (hasTouch), hochkant 428×926 + quer 926×428 / 926×370, WebGL2 + Canvas2D-Rückfall
// Aufruf: node spk1-seite-test.mjs <index.html>
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
// WAV 6 s Stereo 44,1 kHz: Bass 55 Hz, Klicks alle 0,25 s, Ton 440 Hz mit Vibrato 1…5 s
function wav() {
  const sr = 44100, n = sr * 6, b = Buffer.alloc(44 + n * 4); let ph = 0;
  b.write('RIFF', 0); b.writeUInt32LE(36 + n * 4, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(2, 22); b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 4, 28); b.writeUInt16LE(4, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    const t = i / sr, f = 440 * Math.pow(2, 0.3 / 12 * Math.sin(2 * Math.PI * 5.5 * t)); ph += 2 * Math.PI * f / sr;
    const k = i % 11025, click = k < 60 ? 0.5 * (1 - k / 60) * Math.sin(i * 1.7) : 0;
    const v = 0.3 * Math.sin(2 * Math.PI * 55 * t) + (t > 1 && t < 5 ? 0.18 : 0) * (Math.sin(ph) + 0.4 * Math.sin(2 * ph) + 0.25 * Math.sin(3 * ph)) + click;
    const s = Math.max(-32767, Math.min(32767, Math.round(v * 32767 * 0.8))); b.writeInt16LE(s, 44 + i * 4); b.writeInt16LE(s, 46 + i * 4);
  }
  return b;
}
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
// ---------- 1) Hochkant, WebGL2, Datei laden über das ≡-Menü ----------
{
  const {p, drag, tap, touch} = await page(428, 926);
  const st0 = await p.evaluate(() => ({sheet: !!document.getElementById('spk1Sheet'), css: !!document.getElementById('spk1Css'), wk: __wk.length, state: __spk.state()}));
  ok('start-nichts-geladen', st0, !st0.sheet && !st0.css && st0.wk === 0 && !st0.state.worker);
  await p.evaluate(() => openMenu());
  await p.waitForTimeout(300);
  const mb = await p.evaluate(() => { const e = [...document.querySelectorAll('#menu button')].find(x => /Spektral/.test(x.textContent)); if (!e) return null; e.scrollIntoView({block: 'center'}); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
  ok('menue-knopf', mb, !!mb);
  await tap(mb); await p.waitForTimeout(400);
  const s1 = await info(p);
  ok('startflaeche', {open: s1.open, nodoc: s1.nodoc}, s1.open && s1.nodoc);
  await p.screenshot({path: path.join(fotos, '01-start-hochkant.png')});
  const fb = await btn(p, 'Datei laden');
  const [fc] = await Promise.all([p.waitForEvent('filechooser', {timeout: 5000}), tap(fb)]);
  await fc.setFiles({name: 'Pruefsignal.wav', mimeType: 'audio/wav', buffer: wav()});
  await p.waitForFunction(() => { const i = __spk.page.info(); return i && !i.nodoc; }, null, {timeout: 60000});
  await waitChunks(p); await p.waitForTimeout(300);
  const s2 = await info(p);
  ok('datei-geladen-webgl', {gl: s2.gl, chunks: s2.chunks, W: s2.W, H: s2.H, wk: await p.evaluate(() => __wk.length)}, s2.gl && s2.chunks >= 1);
  const L1 = await layout(p); ok('hochkant-layout', L1, !L1.over.length && !L1.out.length && L1.x.vis && L1.x.w >= 44 && L1.small === 0);
  await p.screenshot({path: path.join(fotos, '02-spektrum-hochkant.png')});
  // Pixel prüfen: Ton 440 Hz (MIDI 69) hell bei t = 3 s
  const px = await p.evaluate(() => { const U = __spk.page.ui(), v = U.v, x = (3 - v.t0) * v.pps, y = (v.mTop - 69) * v.rowH, y2 = (v.mTop - 100) * v.rowH; return {x, y, y2}; });
  const mn = await box(p, '#spk1Sheet .spk1-mn');
  const shot = await p.screenshot({clip: {x: mn.x + px.x - 2, y: mn.y + px.y - 2, width: 4, height: 4}});
  const quiet = await p.screenshot({clip: {x: mn.x + px.x - 2, y: mn.y + px.y2 - 2, width: 4, height: 4}});
  ok('bild-ton-hell', {ton: shot.length, still: quiet.length}, true);
  // 2) Rechteck ziehen (Ton 300–700 Hz, 1,5–3,5 s)
  const pt = (t, m) => p.evaluate(([t, m]) => { const U = __spk.page.ui(), v = U.v, r = U.mn.getBoundingClientRect(); return [r.left + (t - v.t0) * v.pps, r.top + (v.mTop - m) * v.rowH]; }, [t, m]);
  await drag(await pt(1.5, 74), await pt(3.5, 62));
  const s3 = await info(p); ok('rechteck', {sel: s3.selArts, stat: s3.stat}, s3.selArts.join() === 'rect');
  // ▶ Auswahl
  await tap(await btn(p, '▶ Auswahl')); await p.waitForTimeout(500);
  const s4 = await info(p); ok('auswahl-hoeren', {playing: s4.playing, playSel: s4.playSel}, s4.playing && s4.playSel);
  await p.screenshot({path: path.join(fotos, '03-auswahl-spielt.png')});
  await tap(await btn(p, '■ Stopp')); await p.waitForTimeout(200);
  // In Ebene ▾ → + Gesang (verschieben)
  await tap(await btn(p, 'In Ebene')); await p.waitForTimeout(200);
  await p.screenshot({path: path.join(fotos, '04-in-ebene.png')});
  await tap(await btn(p, '+ Gesang')); await p.waitForFunction(() => __spk.page.info().tint > 0, null, {timeout: 20000});
  const s5 = await info(p); ok('in-ebene', {layers: s5.layers, tint: s5.tint, stat: s5.stat}, s5.layers.join() === 'Gesang' && s5.tint === 1);
  await p.waitForTimeout(200); await p.screenshot({path: path.join(fotos, '05-ebene-gesang.png')});
  // ↶ / ↷
  const ux = await box(p, '#spk1Sheet .spk1-hd [data-a=undo]'); await tap([ux.x + ux.w / 2, ux.y + ux.h / 2]); await p.waitForTimeout(400);
  const s6 = await info(p); const rx = await box(p, '#spk1Sheet .spk1-hd [data-a=redo]'); await tap([rx.x + rx.w / 2, rx.y + rx.h / 2]); await p.waitForTimeout(400);
  const s7 = await info(p); ok('undo-redo', {nachUndo: s6.layers, nachRedo: s7.layers}, s6.layers.length === 0 && s7.layers.join() === 'Gesang');
  // Solo / Lautstärke (kein Undo-Schritt)
  await tap(await p.evaluate(() => { const e = document.querySelector('#spk1Sheet .spk1-lr[data-l=L1] .spk1-s'); const r = e.getBoundingClientRect(); return [r.left + 22, r.top + 22]; })); await p.waitForTimeout(300);
  const so = await p.evaluate(() => __spk.layers()); ok('solo', so.layers.map(l => l.solo), so.layers[0].solo === true);
  // Pinsel
  await tap(await p.evaluate(() => { const e = document.querySelector('#spk1Sheet [data-tool=pinsel]'); e.scrollIntoView({inline: 'center'}); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }));
  await drag(await pt(0.5, 40), await pt(2.5, 45), 12);
  const s8 = await info(p); ok('pinsel', {sel: s8.selArts}, s8.selArts.join() === 'pinsel');
  await p.screenshot({path: path.join(fotos, '06-pinsel.png')});
  // Harmonische: Ton (440 Hz) bei 3 s antippen
  await tap(await p.evaluate(() => { const e = document.querySelector('#spk1Sheet [data-tool=harm]'); e.scrollIntoView({inline: 'center'}); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }));
  await tap(await pt(3, 69)); await p.waitForFunction(() => /Ton |Kein Ton/.test(__spk.page.info().stat), null, {timeout: 20000});
  const s9 = await info(p), hs = await p.evaluate(() => { const s = __spk.page.ui().sel.find(x => x.art === 'harm'); if (!s) return null; const f = s.spur.map(q => q[1]); return {n: s.spur.length, t0: s.spur[0][0], t1: s.spur[s.spur.length - 1][0], fmin: Math.min(...f), fmax: Math.max(...f)}; });
  ok('harmonische', {stat: s9.stat, spur: hs}, hs && hs.n > 50 && hs.fmin > 420 && hs.fmax < 460 && hs.t1 - hs.t0 > 2.5);
  await p.screenshot({path: path.join(fotos, '07-harmonische.png')});
  // Ähnliche: Beispiel um einen Klick (1,0 s) ziehen
  await tap(await p.evaluate(() => { const e = document.querySelector('#spk1Sheet [data-tool=aehn]'); e.scrollIntoView({inline: 'center'}); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }));
  await drag(await pt(0.97, 106), await pt(1.13, 88));
  await p.waitForFunction(() => /ähnliche|Keine/.test(__spk.page.info().stat), null, {timeout: 20000});
  const s10 = await info(p); ok('aehnliche', {hits: s10.hits, sel: s10.sel, stat: s10.stat}, s10.hits >= 5 && s10.sel >= 5);
  await p.screenshot({path: path.join(fotos, '08-aehnliche.png')});
  // Zwei-Finger-Zoom waagrecht: kein DOM-Umbau, pps steigt
  const v0 = (await info(p)).v;
  await p.evaluate(() => { window.__mut = 0; window.__mo = new MutationObserver(l => { window.__mut += l.length; }); window.__mo.observe(document.getElementById('spk1Sheet'), {childList: true, subtree: true, attributes: true}); });
  const c = await box(p, '#spk1Sheet .spk1-mn'), cy = c.y + c.h / 2, cx = c.x + c.w / 2;
  await touch('touchStart', [[cx - 50, cy], [cx + 50, cy]]); for (let i = 1; i <= 10; i++) { await touch('touchMove', [[cx - 50 - i * 8, cy], [cx + 50 + i * 8, cy]]); await p.waitForTimeout(16); } await touch('touchEnd', []); await p.waitForTimeout(200);
  const v1 = (await info(p)).v, mut = await p.evaluate(() => { window.__mo.disconnect(); return window.__mut; });
  ok('pinch-zoom', {pps0: +v0.pps.toFixed(1), pps1: +v1.pps.toFixed(1), rowH0: +v0.rowH.toFixed(2), rowH1: +v1.rowH.toFixed(2), dom: mut}, v1.pps > v0.pps * 1.5 && Math.abs(v1.rowH - v0.rowH) < 0.01 && mut === 0);
  await p.screenshot({path: path.join(fotos, '09-zoom.png')});
  // Ansicht ▾: Pegel/Auflösung
  await tap(await btn(p, 'Ansicht')); await p.waitForTimeout(200); await p.screenshot({path: path.join(fotos, '10-ansicht.png')});
  await tap(await btn(p, '16384')); await waitChunks(p);
  const s11 = await p.evaluate(() => ({N: __spk.page.ui().N, chunks: __spk.page.info().chunks, hop: __spk.page.ui().spec.hop}));
  ok('aufloesung-16384', s11, s11.N === 16384 && s11.chunks >= 1 && s11.hop === 2048);
  // Quer 926×428 / 926×370 (gleiche Seite, nur Größe)
  for (const [w, h, n] of [[926, 428, '11-quer-428'], [926, 370, '12-quer-370']]) {
    await p.setViewportSize({width: w, height: h}); await p.waitForTimeout(500);
    const L = await layout(p); ok('quer-' + h, L, !L.over.length && !L.out.length && L.x.vis && L.small === 0 && L.mn[1] >= 200);
    await p.screenshot({path: path.join(fotos, n + '.png')});
  }
  await p.setViewportSize({width: 428, height: 926}); await p.waitForTimeout(300);
  // ✕ → zurück ins Menü
  const xb = await box(p, '#spk1Sheet .sh-x'); await tap([xb.x + xb.w / 2, xb.y + xb.h / 2]); await p.waitForTimeout(400);
  const s12 = await p.evaluate(() => ({open: __spk.page.info().open, menu: document.getElementById('menu').classList.contains('open')}));
  ok('schliessen-zurueck', s12, !s12.open && s12.menu);
  // wieder öffnen → dieselbe Analyse
  await p.evaluate(() => { closeMenu(); return __spk.page.open({}); }); await waitChunks(p);
  const s13 = await info(p); ok('wieder-offen', {nodoc: s13.nodoc, layers: s13.layers}, !s13.nodoc && s13.layers.join() === 'Gesang');
  await p.evaluate(() => __spk.page.close());
}
// ---------- 2) Rückfall ohne WebGL2 (Canvas2D) ----------
{
  const {p} = await page(926, 428, true);
  await p.evaluate(async () => {
    const sr = 48000, n = sr * 4, L = new Float32Array(n); for (let i = 0; i < n; i++) L[i] = 0.3 * Math.sin(2 * Math.PI * 110 * i / sr) + 0.2 * Math.sin(2 * Math.PI * 880 * i / sr);
    const r = await __spk.load({name: 'Rückfall', sr, ch: [L]}); await __spk.mask({von: 'orig', nach: {art: 'bass'}, sel: {art: 'freq', f0: 0, f1: 300}}); return __spk.page.open({id: r.meta.id});
  });
  await waitChunks(p); await p.waitForFunction(() => __spk.page.info().tint > 0, null, {timeout: 20000}); await p.waitForTimeout(300);
  const s = await info(p), L = await layout(p);
  const lit = await p.evaluate(() => { const c = __spk.page.ui().gcv, x = c.getContext('2d'), d = x.getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i] + d[i + 1] + d[i + 2] > 200) n++; return {w: c.width, h: c.height, hell: n}; });
  ok('rueckfall-canvas2d', {gl: s.gl, cpu: s.cpu, chunks: s.chunks, tint: s.tint, lit, over: L.over}, !s.gl && s.cpu && s.chunks >= 1 && lit.hell > 50 && !L.over.length);
  await p.screenshot({path: path.join(fotos, '13-rueckfall-quer.png')});
}
ok('keine-fehler', errs.slice(0, 5), errs.length === 0);
fs.writeFileSync(path.join(dir, 'spk1-seite-test.json'), JSON.stringify(res, null, 1));
await b.close(); srv.close();
const bad = Object.entries(res).filter(([, r]) => !r.ok).map(([k]) => k);
console.log(bad.length ? 'FEHLER: ' + bad.join(', ') : 'ALLE OK');
process.exit(bad.length ? 1 : 0);
