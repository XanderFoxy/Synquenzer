// SPK2 Auftrag 3 Test: Loop-Klammern auf dem Takt-Lineal (Halten+Ziehen, Kante ziehen, Tipp/Rollen unverändert), In die Matrix als MIDI / als Audio,
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
{
  const {p, ctx, touch, drag, tap} = await openDemo(428, 926);
  const g0 = await p.evaluate(() => { const U = __spk.page.ui(), g = spk1Grid0(U); U.v.t0 = g.off - 0.3; U.v.pps = U.W / (6.5 * g.bar); spk1Clamp(U); spk1Dirty(U, 'all'); return {grid: U.meta.grid, bar: g.bar, off: g.off, bpm: S.bpm, nt: NT()}; });
  await p.waitForTimeout(300);
  const R0 = await ru(p), yR = R0.y + R0.h / 2;
  // 1) Lineal halten (450 ms) + ziehen: neuer Loop Takt 2–3
  { const x0 = await barX(p, 1.5), x1 = await barX(p, 3.05);
    await touch('touchStart', [[x0, yR]]); await p.waitForTimeout(480);
    for (let i = 1; i <= 8; i++) { await touch('touchMove', [[x0 + (x1 - x0) * i / 8, yR]]); await p.waitForTimeout(16); } await touch('touchEnd', []); await p.waitForTimeout(250); }
  const l1 = await p.evaluate(() => ({lp: __spk.spk2.loop.get(), row: (document.querySelector('#spk1Sheet .spk2-lp .spk2-lpt') || {}).textContent || null, stat: __spk.page.info().stat}));
  ok('halten-ziehen-neuer-loop', Object.assign({g0}, l1), l1.lp && l1.lp[0] === 1 && l1.lp[1] === 3 && /Takt 2–3/.test(l1.row || ''));
  // Klammern sichtbar (Bernstein im Lineal innerhalb, nicht außerhalb)
  const px = await p.evaluate(() => { const U = __spk.page.ui(), g = spk1Grid0(U), cv = U.ru.firstChild, c = cv.getContext('2d'), d = U.dpr, [a, b] = __spk.spk2.loop.sec();
    const at = t => { const v = c.getImageData(Math.round(spk1X(U, t) * d), Math.round(cv.height / 2), 1, 1).data; return [v[0], v[1], v[2]]; };
    return {innen: at((a + b) / 2 + g.bar * 0.13), aussen: at(b + g.bar * 0.63), kante: at(a + 1 / U.v.pps)}; });
  ok('klammern-sichtbar', px, px.innen[0] > px.aussen[0] + 12 && px.kante[0] > 150);
  // 2) rechte Klammer ziehen (ohne Halten) → Takt 2–5
  await drag([await barX(p, 3), yR], [await barX(p, 5.1), yR], 10); await p.waitForTimeout(200);
  const l2 = await p.evaluate(() => __spk.spk2.loop.get());
  ok('kante-ziehen', l2, l2 && l2[0] === 1 && l2[1] === 5);
  // 3) Tipp = Abspielposition (Loop bleibt), Ziehen ohne Halten = rollen (Loop bleibt)
  { const x = await barX(p, 5.6); await tap([x, yR]); }
  const t3 = await p.evaluate(() => { const U = __spk.page.ui(), g = spk1Grid0(U); return {cur: (U.cur - g.off) / g.bar, lp: __spk.spk2.loop.get(), t0: U.v.t0}; });
  { const x = await barX(p, 5.8); await drag([x, yR], [x - 120, yR], 6); }
  const t3b = await p.evaluate(() => ({t0: __spk.page.ui().v.t0, lp: __spk.spk2.loop.get()}));
  ok('tipp-und-rollen-wie-bisher', {t3, t3b}, Math.abs(t3.cur - 5.6) < 0.05 && t3.lp[1] === 5 && t3b.t0 > t3.t0 + 0.3 && t3b.lp[0] === 1 && t3b.lp[1] === 5);
  await p.evaluate(() => { const U = __spk.page.ui(), g = spk1Grid0(U); U.v.t0 = g.off - 0.3; spk1Clamp(U); spk1Dirty(U, 'all'); });
  // Loop für die Matrix: Takt 1–2 (Bass spielt in Takt 1–4), per Ansicht ▾ „Loop setzen“ geprüft, dann Kante ziehen auf 2 Takte
  await p.evaluate(() => { const U = __spk.page.ui(); U.cur = spk1Grid0(U).off + 0.01; });
  await tap(await btn(p, 'Ansicht ▾')); await p.waitForTimeout(200);
  { const b = await ddMx(p, 'set'); await tap(b); await p.waitForTimeout(200); }
  const l4 = await p.evaluate(() => __spk.spk2.loop.get());
  ok('ansicht-loop-setzen', l4, l4 && l4[0] === 0 && l4[1] === 4);
  await drag([await barX(p, 4), yR], [await barX(p, 2.05), yR], 10); await p.waitForTimeout(200);
  const l5 = await p.evaluate(() => __spk.spk2.loop.get());
  ok('loop-takt-1-2', l5, l5 && l5[0] === 0 && l5[1] === 2);
  await p.screenshot({path: path.join(fotos, '40-loop-hochkant.png')});
  // 4) In die Matrix ▾ (Quelle Original, noch keine Noten) → Als MIDI: findet erst Noten im Loop, legt sie auf eine Synth-Spur
  await tap(await btn(p, 'In die Matrix ▾')); await p.waitForTimeout(250);
  const d1 = await p.evaluate(() => ({h: [...document.querySelectorAll('#spk1Sheet .spk1-dd h5')].map(e => e.textContent), b: [...document.querySelectorAll('#spk1Sheet .spk1-dd button')].map(e => e.textContent), ziel: __spk.spk2.loop.ziel()}));
  const lay1 = await lpLayout(p);
  ok('dropdown-in-die-matrix', {d1, lay1}, d1.b.some(t => /Als Audio/.test(t)) && d1.b.some(t => /Als MIDI/.test(t)) && lay1.row && lay1.btnOk && lay1.dd && lay1.dd.inV && !lay1.dd.small && !lay1.dd.ov.length);
  await p.screenshot({path: path.join(fotos, '41-in-die-matrix.png')});
  const u0 = await p.evaluate(() => ({n: UNDO.length, st: sx14State(), nt: NT(), bpm: S.bpm}));
  { const b = await ddMx(p, 'midi'); await tap(b); }
  await p.waitForFunction(() => { const m = __spk.spk2.loop.last(); return m && m.kind === 'midi'; }, null, {timeout: 60000}); await p.waitForTimeout(200);
  const m1 = await p.evaluate(() => {
    const U = __spk.page.ui(), r = __spk.spk2.loop.last(), c = S.tracks[r.track].clips[r.scene], g = spk1Grid0(U), [ta, tb] = __spk.spk2.loop.sec(), qs = __spk.spk2.loop.notes('orig'), st = g.beat / 4, sq = st / (60 / U.meta.grid.bpm);
    const soll = qs.map(q => ({t: Math.round((q.t0 - ta) / st) * sq, n: Math.round(q.m)})).sort((a, b) => a.t - b.t || a.n - b.n), ist = c.notes.map(n => ({t: n.t, n: n.n})).sort((a, b) => a.t - b.t || a.n - b.n);
    const gleich = soll.length === ist.length && soll.every((s, i) => Math.abs(s.t - ist[i].t) < 1e-6 && s.n === ist[i].n);
    const lab = UNDO[UNDO.length - 1].label;
    return {r, len: c.len, n: c.notes.length, soll: soll.length, gleich, erste: ist.slice(0, 6), raster: c.notes.every(n => Math.abs(n.t / 0.25 - Math.round(n.t / 0.25)) < 1e-6), name: S.tracks[r.track].name, cat: S.tracks[r.track].sound.cat, role: sx11Role(r.track, c), undo: UNDO.length, lab, bpm: S.bpm};
  });
  ok('als-midi-noten-gleich', m1, m1.r.notes > 0 && m1.gleich && m1.len === 2 && m1.raster && m1.undo === u0.n + 1 && /MIDI/.test(m1.lab));
  ok('als-midi-ziel-rolle', {name: m1.name, cat: m1.cat, role: m1.role, neu: m1.r.neu}, m1.role === 'bass');
  // ein ↶ nimmt alles zurück (Spur, Clip, Tempo), ↷ bringt es
  const un1 = await p.evaluate(b0 => { undo(); const a = {same: sx14State() === b0.st, nt: NT(), bpm: S.bpm}; redo(); const r = __spk.spk2.loop.last(), c = S.tracks[r.track] && S.tracks[r.track].clips[r.scene]; return {a, b: {n: c ? c.notes.length : 0, nt: NT()}}; }, u0);
  ok('midi-ein-undo', un1, un1.a.same && un1.a.nt === u0.nt && un1.b.n === m1.n);
  // 5) Als Audio → Spur „Original“
  await p.waitForTimeout(400);
  await tap(await btn(p, 'In die Matrix ▾')); await p.waitForTimeout(250);
  const u1 = await p.evaluate(() => ({n: UNDO.length, st: sx14State(), nt: NT()}));
  { const b = await ddMx(p, 'audio'); await tap(b); }
  await p.waitForFunction(() => { const m = __spk.spk2.loop.last(); return m && m.kind === 'audio'; }, null, {timeout: 60000}); await p.waitForTimeout(300);
  const a1 = await p.evaluate(async () => {
    const U = __spk.page.ui(), r = __spk.spk2.loop.last(), tr = S.tracks[r.track], c = tr.clips[r.scene], m = S.takes[r.take], pcm = await tkPcm(r.take), [ta, tb] = __spk.spk2.loop.sec();
    return {r, orig: !!tr.orig, name: tr.name, len: c.len, in: c.audio.in, out: c.audio.out, soll: +(tb - ta).toFixed(6), take: {len: m.len, sr: m.sr, name: m.name, pcm: pcm ? pcm.length : 0}, a: Math.round(ta * U.meta.sr), undo: UNDO.length, lab: UNDO[UNDO.length - 1].label,
      probe: pcm ? Array.from(pcm.subarray(20000, 20000 + 64)) : null};
  });
  // Inhalt = Original im Loop-Bereich (gleiche Proben, Mono-Mittel der WAV)
  { const a = a1.a, pr = a1.probe || [], sr = 44100; let mx = 0, pk = 1;
    for (let i = 0; i < pr.length; i++) { const j = a + 20000 + i, L = mixB.readInt16LE(44 + j * 4), Rr = mixB.readInt16LE(46 + j * 4), v = (L + Rr) / 2; mx = Math.max(mx, Math.abs(v - pr[i])); pk = Math.max(pk, Math.abs(v)); }
    ok('als-audio-take', Object.assign({}, a1, {probe: undefined, abw: mx, pk}), a1.orig && a1.len === 2 && Math.abs(a1.in) < 1e-6 && Math.abs(a1.out - a1.soll) < 1e-3 && Math.abs(a1.take.len - Math.round(a1.soll * a1.take.sr)) <= 1 && a1.undo === u1.n + 1 && /Audio/.test(a1.lab) && mx <= Math.max(40, pk * 0.01)); }
  // Matrix: Szene starten, Take-Starts auf dem Taktstrich (±5 ms), Wiederholung = 2 Takte, Ausschnitt ab 0
  const mx = await p.evaluate(async ({o, s}) => {
    const L = []; const f0 = tkStartSrc; window.tkStartSrc = x => { if (x.i === o) L.push({when: x.when, off: x.off}); return f0(x); };
    launchScene(s); await new Promise(r => setTimeout(r, 9500));
    const z = b2t(0), sp = spb(), bb = clipBarB(S.tracks[o].clips[s]); stop(); window.tkStartSrc = f0;
    return {L, z, sp, bb, slot: R.slot[o]};
  }, {o: a1.r.track, s: a1.r.scene});
  { const bar = mx.bb * mx.sp, per = 2 * bar, ws = mx.L.map(x => x.when), d = ws.slice(1).map((w, i) => w - ws[i]), ph = ws.map(w => ((w - mx.z) / bar) - Math.round((w - mx.z) / bar));
    ok('matrix-taktgenau', {n: ws.length, abstand_ms: d.map(v => +(v * 1000).toFixed(2)), soll_ms: +(per * 1000).toFixed(2), phase_ms: ph.map(v => +(v * bar * 1000).toFixed(2)), off: mx.L.map(x => +x.off.toFixed(4))},
      ws.length >= 2 && d.every(v => Math.abs(v - per) < 0.002) && ph.every(v => Math.abs(v * bar) < 0.005) && mx.L.every(x => Math.abs(x.off) < 0.001)); }
  const un2 = await p.evaluate(b0 => { undo(); const a = {same: sx14State() === b0.st, nt: NT()}; redo(); const r = __spk.spk2.loop.last(); return {a, b: !!(S.tracks[r.track] && S.tracks[r.track].clips[r.scene] && S.tracks[r.track].clips[r.scene].audio)}; }, u1);
  ok('audio-ein-undo', un2, un2.a.same && un2.a.nt === u1.nt && un2.b);
  // 6) Loop entfernen (✕)
  { const x = await p.evaluate(() => { const e = document.querySelector('#spk1Sheet .spk2-lp .spk2-lx'); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }); await tap(x); }
  const l6 = await p.evaluate(() => ({lp: __spk.spk2.loop.get(), row: !!document.querySelector('#spk1Sheet .spk2-lp')}));
  ok('loop-entfernen', l6, !l6.lp && !l6.row);
  await ctx.close();
}
// 7) Layout quer (926×428, 926×370): Loop-Zeile + Klappfenster, ✕ sichtbar, Tasten ≥ 44, nichts außerhalb
for (const [w, h] of [[926, 428], [926, 370]]) {
  const {p, ctx, tap} = await openDemo(w, h);
  await p.evaluate(() => __spk.spk2.loop.set(0, 2)); await p.waitForTimeout(300);
  await tap(await btn(p, 'In die Matrix ▾')); await p.waitForTimeout(250);
  const lay = await lpLayout(p), base = await layout(p);
  ok('layout-' + w + 'x' + h, {lay, base}, lay.row && lay.btnOk && lay.dd && lay.dd.inV && !lay.dd.small && !lay.dd.ov.length && base.x.vis && !base.over.length && !base.out.length);
  await p.screenshot({path: path.join(fotos, '42-loop-quer-' + h + '.png')});
  await ctx.close();
}
ok('keine-fehler', errs, !errs.length);
await b.close(); srv.close();
const bad = Object.entries(res).filter(([, v]) => !v.ok).map(([k]) => k);
fs.writeFileSync(path.join(dir, 'spk2-loop-test.json'), JSON.stringify({res, errs, sek: Math.round((Date.now() - T0) / 1000)}, null, 1));
console.log(bad.length ? 'FEHLER: ' + bad.join(', ') : 'ALLE OK (' + Object.keys(res).length + ')');
