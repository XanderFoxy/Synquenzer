// SPK3 Auftrag 3 Test: Loop im Dokument (↶/↷, neu öffnen) + ▶ in der Loop-Zeile spielt im Kreis (Naht lückenlos). Aufruf: node spk3-loop-test.mjs <index.html>
// ein ↶ je Aktion, Matrix taktgenau (Start ±5 ms), MIDI-Noten = Ebenen-Noten, Layout hochkant + quer. Aufruf: node spk2-loop-test.mjs <index.html>
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
const ru = p => box(p, '#spk1Sheet .spk1-ru');
// Lineal-x eines Takts (Bruch) und Ruler-Pixel
const barX = (p, bar) => p.evaluate(b => { const U = __spk.page.ui(), g = spk1Grid0(U), r = U.ru.getBoundingClientRect(); return r.left + spk1X(U, g.off + b * g.bar); }, bar);
const ddMx = (p, k) => p.evaluate(z => { const e = document.querySelector('#spk1Sheet .spk1-dd [data-mx="' + z + '"]'); if (!e) return null; e.scrollIntoView({block: 'nearest'}); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2, e.disabled, e.textContent]; }, k);
const lpLayout = p => p.evaluate(() => {
  const row = document.querySelector('#spk1Sheet .spk2-lp'), W = innerWidth, H = innerHeight; if (!row) return {row: false};
  const bs = [...row.querySelectorAll('button')].map(e => e.getBoundingClientRect()), rr = row.getBoundingClientRect(), ly = document.querySelector('#spk1Sheet .spk1-ly').getBoundingClientRect();
  const dd = document.querySelector('#spk1Sheet .spk1-dd'), db = dd ? [...dd.querySelectorAll('button')].filter(e => e.offsetParent).map(e => e.getBoundingClientRect()) : [];
  const ov = []; for (let i = 0; i < db.length; i++) for (let j = i + 1; j < db.length; j++) { const a = db[i], c = db[j]; if (Math.min(a.right, c.right) - Math.max(a.left, c.left) > 0.5 && Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top) > 0.5) ov.push(i + '×' + j); }
  const dr = dd && dd.getBoundingClientRect();
  return {row: true, inLy: rr.top >= ly.top - 0.5 && rr.bottom <= ly.bottom + 0.5 && rr.left >= ly.left - 0.5 && rr.right <= ly.right + 0.5, btn: bs.map(r => [Math.round(r.width), Math.round(r.height)]), btnOk: bs.every(r => r.height >= 43.5 && r.width >= 43.5 && r.left >= 0 && r.right <= W),
    dd: dd ? {l: Math.round(dr.left), t: Math.round(dr.top), r: Math.round(dr.right), b: Math.round(dr.bottom), inV: dr.left >= 0 && dr.top >= 0 && dr.right <= W && dr.bottom <= H, small: db.filter(r => r.height < 43.5).length, ov} : null};
});
const mixB = mixWav();
async function openDemo(w, h) {
  const P = await page(w, h), {p, tap} = P;
  await p.evaluate(() => SYNQUENZER.loadDemo()); await p.waitForTimeout(400);
  await p.evaluate(() => openMenu()); await p.waitForTimeout(300);
  const mb = await p.evaluate(() => { const e = [...document.querySelectorAll('#menu button')].find(x => /Spektral/.test(x.textContent)); e.scrollIntoView({block: 'center'}); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
  await tap(mb); await p.waitForTimeout(400);
  const fb = await btn(p, 'Datei laden');
  const [fc] = await Promise.all([p.waitForEvent('filechooser', {timeout: 5000}), tap(fb)]);
  await fc.setFiles({name: 'Demo-Song.wav', mimeType: 'audio/wav', buffer: mixB});
  await p.waitForFunction(() => { const i = __spk.page.info(); return i && !i.nodoc; }, null, {timeout: 60000});
  await waitChunks(p); await p.waitForTimeout(300);
  return P;
}
const lpBtn = p => box(p, '#spk1Sheet .spk3-lpp');
{
  const {p, ctx, tap} = await openDemo(428, 926);
  const r1 = await p.evaluate(async () => { await __spk.spk3.loop.set(0, 2); return {doc: __spk.spk3.loop.doc(), get: __spk.spk3.loop.get(), id: SPK1.doc}; });
  ok('loop-im-dokument', r1.doc, r1.doc.length === 1 && r1.doc[0].a === 0 && r1.doc[0].b === 2);
  const un = await p.evaluate(async () => { await spk1UndoRedo(SPK1.ui, 'undo'); const a = {doc: __spk.spk3.loop.doc(), get: __spk.spk3.loop.get()}; await spk1UndoRedo(SPK1.ui, 'redo'); return {u: a, r: {doc: __spk.spk3.loop.doc(), get: __spk.spk3.loop.get()}}; });
  ok('loop-undo-redo', un, un.u.doc.length === 0 && un.u.get === null && un.r.get && un.r.get[0] === 0 && un.r.get[1] === 2);
  const lay = await lpLayout(p); ok('loop-zeile-hochkant', lay, lay.row && lay.inLy && lay.btnOk && lay.btn.length === 3);
  // ▶ in der Loop-Zeile: Starts aller Puffer mitschreiben
  await p.evaluate(() => { window.__st = []; const o = AudioBufferSourceNode.prototype.start; AudioBufferSourceNode.prototype.start = function (w, off, du) { if (SPK1.pl && SPK1.pl.lp) window.__st.push([w, off, du, this.buffer.length]); return o.call(this, w, off, du); }; });
  await p.evaluate(() => { SPK1.ui.cur = 0; });
  const lb = await lpBtn(p); await tap([lb.x + lb.w / 2, lb.y + lb.h / 2]); await p.waitForTimeout(200);
  const st0 = await p.evaluate(() => ({lauf: __spk.spk3.loop.lauf(), txt: document.querySelector('#spk1Sheet .spk3-lpp').textContent, sec: __spk.spk3.loop.sec()}));
  const ps = []; for (let i = 0; i < 50; i++) { ps.push(await p.evaluate(() => __spk.spk3.loop.pos())); await p.waitForTimeout(220); }
  const sec = st0.sec, inside = ps.every(v => v != null && v >= sec[0] - 1e-3 && v <= sec[1] + 1e-3), wraps = ps.filter((v, i) => i && v < ps[i - 1] - 0.5).length;
  ok('loop-spielt-im-kreis', {lauf: st0.lauf, knopf: st0.txt, sec: sec.map(v => +v.toFixed(3)), wraps, min: +Math.min(...ps).toFixed(2), max: +Math.max(...ps).toFixed(2)}, st0.lauf && st0.txt === '■' && inside && wraps >= 2);
  // Naht: je Durchgang lückenlos (Puffer-Stücke aneinander) und Durchgang p+1 beginnt genau len später
  const nt = await p.evaluate(() => { const sr = SPK1.last.meta.sr, B = SPK1_BLK, L = __spk.spk3.loop.sec(), len = Math.round(L[1] * sr) - Math.round(L[0] * sr); const S = window.__st.map(([w, off, du]) => ({w, off, du})); S.sort((a, b) => a.w - b.w);
    const X = Math.max(1, Math.round(sr * 0.003)) / sr; let gap = 0, ov = [], bad = 0; for (let i = 1; i < S.length; i++) { const e = S[i - 1].w + S[i - 1].du, d = S[i].w - e; if (d > 0) gap = Math.max(gap, d); if (d < -2e-5) { ov.push(+(-d * 1000).toFixed(3)); if (-d < X - 2e-5 || -d > 2 * X + 2e-5) bad++; } }
    return {n: S.length, lueckeMs: +(gap * 1000).toFixed(4), naehte: ov.length, blendeMs: ov, schlecht: bad, lenS: +(len / sr).toFixed(4)}; });
  ok('loop-naht', nt, nt.n >= 10 && nt.lueckeMs < 0.05 && nt.naehte >= 2 && nt.schlecht === 0);
  await tap([lb.x + lb.w / 2, lb.y + lb.h / 2]); await p.waitForTimeout(200);
  const st1 = await p.evaluate(() => ({lauf: __spk.spk3.loop.lauf(), pl: !!SPK1.pl, txt: document.querySelector('#spk1Sheet .spk3-lpp').textContent}));
  ok('loop-stopp', st1, !st1.lauf && !st1.pl && st1.txt === '▶');
  await p.screenshot({path: path.join(fotos, '70-loop-im-kreis-hochkant.png')});
  // neu laden: Loop kommt aus dem Dokument
  await p.evaluate(() => __spk.save && __spk.save());
  await p.waitForTimeout(2600);
  const id = r1.id; await p.reload(); await p.waitForFunction(() => window.SYNQUENZER && window.__spk, null, {timeout: 60000}); await p.waitForTimeout(800);
  await p.evaluate(() => openMenu()); await p.waitForTimeout(300);
  const mb = await p.evaluate(() => { const e = [...document.querySelectorAll('#menu button')].find(x => /Spektral/.test(x.textContent)); e.scrollIntoView({block: 'center'}); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
  await tap(mb); await p.waitForTimeout(500);
  await p.evaluate(id => spk1OpenId(SPK1.ui, id), id); await p.waitForFunction(() => { const i = __spk.page.info(); return i && !i.nodoc; }, null, {timeout: 60000}); await p.waitForTimeout(400);
  const r2 = await p.evaluate(() => ({doc: __spk.spk3.loop.doc(), get: __spk.spk3.loop.get(), row: !!document.querySelector('#spk1Sheet .spk2-lp')}));
  ok('loop-nach-neu-laden', r2, r2.get && r2.get[0] === 0 && r2.get[1] === 2 && r2.row);
  const wg = await p.evaluate(async () => { await __spk.spk3.loop.weg(); return {doc: __spk.spk3.loop.doc(), get: __spk.spk3.loop.get()}; });
  ok('loop-weg-im-dokument', wg, wg.doc.length === 0 && wg.get === null);
  await ctx.close();
}
{
  const {p, ctx} = await openDemo(926, 370);
  await p.evaluate(async () => { await __spk.spk3.loop.set(1, 3); });
  const lay = await lpLayout(p); ok('loop-zeile-quer-370', lay, lay.row && lay.inLy && lay.btnOk && lay.btn.length === 3);
  await p.screenshot({path: path.join(fotos, '71-loop-quer-370.png')});
  await ctx.close();
}
ok('keine-fehler', errs.slice(0, 5), errs.length === 0);
fs.writeFileSync(path.join(dir, 'spk3-loop-test.json'), JSON.stringify(res, null, 1));
const bad = Object.entries(res).filter(([, v]) => !v.ok).map(([k]) => k);
console.log((bad.length ? 'FEHLER: ' + bad.join(', ') : 'ALLE OK (' + Object.keys(res).length + ')') + ' · ' + Math.round((Date.now() - T0) / 1000) + ' s');
await b.close(); srv.close();
