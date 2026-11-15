// SPK12 Teil 1 – Werkzeugkasten Auswahl: Kombinier-Modi (bit-genau), Umkehren / nur Frequenzen / Wiederherstellen, Erweitern/Weich,
// Rand-Griffe (Rand ziehen, zwei Finger, Mitte verschieben), Zauberstab (440 Hz in rosa Rauschen −20 dB, 3 min, ± 5 s), ein ↶ je Aktion.
// Touch über CDP (Input.dispatchTouchEvent). Messungen statt Bildvergleich. Aufruf: node spk12-test.mjs <abs. index.html>
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright/index.js');
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const file = path.resolve(process.argv[2]), dir = path.dirname(file), here = path.dirname(new URL(import.meta.url).pathname), fotos = path.join(here, 'fotos'); fs.mkdirSync(fotos, {recursive: true});
const srv = http.createServer((q, r) => { const p = path.join(dir, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': p.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream'}); fs.createReadStream(p).pipe(r); });
await new Promise(ok => srv.listen(0, ok)); const url = 'http://127.0.0.1:' + srv.address().port + '/' + path.basename(file);
const res = {}; let nOk = 0, nF = 0;
const ok = (k, v, c) => { res[k] = {v, ok: !!c}; c ? nOk++ : nF++; console.log((c ? 'OK     ' : 'FEHLER ') + k + ' ' + JSON.stringify(v)); };
const b = await chromium.launch({args: ['--disable-renderer-backgrounding']});
const VIEWS = (process.env.VIEWS || '428x926,926x428,926x370').split(',').map(s => s.split('x').map(Number));
for (const [W, H] of VIEWS) {
  const tag = W + 'x' + H, full = W < H, SEC = full ? 180 : 24, TT = full ? 90 : 12, errs = [];
  const ctx = await b.newContext({viewport: {width: W, height: H}, hasTouch: true, isMobile: true, deviceScaleFactor: 2}), p = await ctx.newPage(), cdp = await ctx.newCDPSession(p);
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
  const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: pts.map((q, i) => ({x: q[0], y: q[1], id: q[2] ?? i, radiusX: 2, radiusY: 2, force: 1}))});
  const wait = ms => p.waitForTimeout(ms);
  const drag = async (a, z, steps = 14) => { await touch('touchStart', [a]); await wait(40); for (let i = 1; i <= steps; i++) { await touch('touchMove', [[a[0] + (z[0] - a[0]) * i / steps, a[1] + (z[1] - a[1]) * i / steps]]); await wait(18); } await touch('touchEnd', []); await wait(220); };
  const tap = async q => { if (!q) throw new Error('Knopf fehlt'); await touch('touchStart', [q]); await wait(50); await touch('touchEnd', []); await wait(220); };
  const hold = async (q, ms) => { await touch('touchStart', [q]); await wait(ms); await touch('touchEnd', []); await wait(250); };
  const sel = s => p.evaluate(s => { const e = document.querySelector(s); if (!e || !e.offsetParent) return null; e.scrollIntoView({block: 'nearest', inline: 'nearest'}); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, s);
  const ddBtn = a => sel(`#spk1Sheet .spk1-dd [data-s12a="${a}"]`);
  const shot = n => p.screenshot({path: path.join(fotos, n + '-' + tag + '.png')});
  const st = () => p.evaluate(() => __spk.page.info().stat);
  const nSel = () => p.evaluate(() => __spk.page.ui().sel.length);
  const scr = (t, f) => p.evaluate(([t, f]) => { const U = __spk.page.ui(), r = U.mn.getBoundingClientRect(); return [r.left + spk1X(U, t), r.top + spk1Y(U, f)]; }, [t, f]);
  await p.goto(url); await p.waitForFunction(() => window.SYNQUENZER && window.__spk && window.__spk12, null, {timeout: 60000}); await wait(600);
  await p.evaluate(() => { window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push({t: e.startTime, d: e.duration}); }).observe({entryTypes: ['longtask']}); } catch (e) {} });
  // ---- Testsignal: 440 Hz + rosa Rauschen −20 dB (Leistung), im Seiten-Kontext erzeugt ----
  const T0load = Date.now();
  await p.evaluate(async ([sec]) => {
    await __spk.page.open({}); const sr = 44100, n = sec * sr, x = new Float32Array(n), A = 0.3; let s1 = 1;
    const rnd = () => ((s1 = (s1 * 1103515245 + 12345) >>> 0) / 4294967296) * 2 - 1;
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, e2 = 0; const pk = new Float32Array(n);
    for (let i = 0; i < n; i++) { const w = rnd(); b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.969 * b2 + w * 0.153852; b3 = 0.8665 * b3 + w * 0.3104856; b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898; const v = b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362; b6 = w * 0.115926; pk[i] = v; e2 += v * v; }
    const g = Math.sqrt((A * A / 2) / 100 / (e2 / n));
    for (let i = 0; i < n; i++) x[i] = A * Math.sin(2 * Math.PI * 440 * i / sr) + g * pk[i];
    const r = await __spk.load({name: 'Ton in Rauschen', sr, ch: [x]}); await __spk.page.open({id: r.meta.id});
  }, [SEC]);
  await p.waitForFunction(() => { const i = __spk.page.info(); return i && !i.nodoc && i.chunks > 0 && !/Spektrum \d/.test(i.stat); }, null, {timeout: 300000}); await wait(500);
  ok(tag + ' laden', {sec: SEC, ms: Date.now() - T0load}, true);
  // ---- Layout: Leiste Neu │ + │ − │ ∩ · Auswahl ▾ ----
  const lay = await p.evaluate(() => { const U = __spk.page.ui(), bs = [...U.op.querySelectorAll('.spk12-m, .spk12-dd')], bar = U.op.getBoundingClientRect();
    return {bar: [bar.left, bar.right, bar.top, bar.bottom], vw: innerWidth, vh: innerHeight, b: bs.map(e => { const r = e.getBoundingClientRect(), af = getComputedStyle(e, '::after'); return {t: e.textContent, w: r.width, h: r.height, hit: r.height + Math.max(0, -parseFloat(af.top) || 0) + Math.max(0, -parseFloat(af.bottom) || 0), l: r.left, r: r.right, top: r.top, bot: r.bottom}; })}; });
  ok(tag + ' leiste-knoepfe-44', lay.b.map(x => [x.t, Math.round(x.w), Math.round(x.hit)]), lay.b.length === 5 && lay.b.every(x => x.w >= 44 && x.hit >= 44));
  ok(tag + ' leiste-im-bild', {bar: lay.bar.map(Math.round), vw: lay.vw, vh: lay.vh, knoepfe: lay.b.map(x => [Math.round(x.l), Math.round(x.r), Math.round(x.top), Math.round(x.bot)])}, lay.bar[0] >= 0 && lay.bar[1] <= lay.vw + 0.5 && lay.bar[3] <= lay.vh + 0.5 && lay.b.every(x => x.l >= 0 && x.r <= lay.vw + 0.5 && x.bot <= lay.vh + 0.5));
  // ---- Bit-genau: Mengen-Rechnung (Kern-Masken) ----
  if (full) {
    const bit = await p.evaluate(async ([tt]) => {
      const U = __spk.page.ui(), sr = U.meta.sr, hop = U.meta.base.hop, mOf = t => Math.round(t * sr / hop + 1);
      const A = {art: 'rect', t0: tt - 1, t1: tt + 1, f0: 300, f1: 900, kt: 0.06, kf: 60}, B = {art: 'rect', t0: tt, t1: tt + 2, f0: 500, f1: 1500, kt: 0.03, kf: 30};
      const P = {art: 'pinsel', pts: [[tt - 0.5, 600], [tt + 0.3, 800], [tt + 1.2, 700]], rt: 0.12, rc: 150, weich: 0.5, minus: false};
      const z = await __spk12.zauber({t: tt, f: 440, tol: 15, lim: 5}), Wd = {art: 'wand', N: z.N, hop: z.hop, R: z.R, m0: z.m0, rps: z.rps, c0: z.c0, nc: z.nc, cols: z.cols, b: [z.t0, z.t1, z.f0, z.f1], t0: z.t0, t1: z.t1, f0: z.f0, f1: z.f1, kt: 0, kf: 0, key: 'tw1'};
      const box = {m0: mOf(tt - 2), m1: mOf(tt + 3), k0: 0, k1: 420}, M = async s => (await __spk12.mask(s, box)).data, R = {};
      const a = await M([A]), bb = await M([B]), pp = await M([P]), w = await M([Wd]);
      const cmp = (name, got, fn) => { let bad = 0, soft = 0, n = 0; for (let i = 0; i < got.length; i++) { const e = fn(i); if (got[i] !== e) bad++; if (e > 0 && e < 255) soft++; if (e) n++; } R[name] = {bad, soft, nz: n}; };
      cmp('A∪B', await M([A, B]), i => Math.max(a[i], bb[i]));
      cmp('A−B', await M([A, Object.assign({}, B, {op: 'sub'})]), i => Math.min(a[i], 255 - bb[i]));
      cmp('A∩B', await M([A, Object.assign({}, B, {op: 'and'})]), i => Math.min(a[i], bb[i]));
      cmp('A∪P', await M([A, P]), i => Math.max(a[i], pp[i]));
      cmp('A−P', await M([A, Object.assign({}, P, {op: 'sub'})]), i => Math.min(a[i], 255 - pp[i]));
      cmp('A∩P', await M([A, Object.assign({}, P, {op: 'and'})]), i => Math.min(a[i], pp[i]));
      cmp('A∪Z', await M([A, Wd]), i => Math.max(a[i], w[i]));
      cmp('A−Z', await M([A, Object.assign({}, Wd, {op: 'sub'})]), i => Math.min(a[i], 255 - w[i]));
      cmp('A∩Z', await M([A, Object.assign({}, Wd, {op: 'and'})]), i => Math.min(a[i], w[i]));
      const H = box.k1 - box.k0 + 1, i0 = Math.ceil((tt - 1) * sr / hop + 1), i1 = Math.floor((tt + 1) * sr / hop + 1);
      cmp('¬A', await M([A, {art: 'inv'}]), i => 255 - a[i]);
      cmp('A nur Frequenzen umgekehrt', await M([A, {art: 'inv', nurF: 1, t0: tt - 1, t1: tt + 1}]), i => { const m = box.m0 + Math.floor(i / H); return m >= i0 && m <= i1 ? 255 - a[i] : 0; });
      cmp('(A∪B)−P∩Z', await M([A, B, Object.assign({}, P, {op: 'sub'}), Object.assign({}, Wd, {op: 'and'})]), i => Math.min(Math.min(Math.max(a[i], bb[i]), 255 - pp[i]), w[i]));
      return R;
    }, [TT]);
    for (const [k, v] of Object.entries(bit)) ok(tag + ' bitgenau ' + k, v, v.bad === 0 && v.nz > 0);
  }
  // ---- Touch: Rechteck, + und −, ↶ / ↷ ----
  await p.evaluate(([tt]) => { const U = __spk.page.ui(); U.v.pps = U.W / 8; U.v.t0 = tt - 4; U.v.rowH = Math.max(U.v.rowH, U.H / 48); U.v.mTop = 69 + (U.H / U.v.rowH) * 0.45; spk1Clamp(U); spk1Dirty(U, 'all'); }, [TT]);
  await wait(400);
  await tap(await sel('#spk1Sheet .spk1-tl button[data-s12slot]'));
  const A1 = await scr(TT - 2, 880), A2 = await scr(TT - 0.5, 300); await drag(A1, A2);
  ok(tag + ' rechteck-touch', {n: await nSel(), stat: await st()}, (await nSel()) === 1);
  await tap(await sel('#spk1Sheet .spk12-m[data-m="add"]'));
  const B1 = await scr(TT - 1, 1400), B2 = await scr(TT + 1, 500); await drag(B1, B2);
  const s2 = await p.evaluate(() => __spk.page.ui().sel.map(s => ({art: s.art, op: s.op || ''})));
  ok(tag + ' plus-touch', s2, s2.length === 2 && !s2[1].op);
  await tap(await sel('#spk1Sheet .spk12-m[data-m="sub"]'));
  const C1 = await scr(TT - 1.4, 800), C2 = await scr(TT - 0.2, 550); await drag(C1, C2);
  const s3 = await p.evaluate(async () => { const U = __spk.page.ui(), sel = U.sel.map(s => Object.assign({}, s)), sr = U.meta.sr, hop = U.meta.base.hop;
    const box = {m0: Math.round(Math.max(0, sel[0].t0 - 1) * sr / hop), m1: Math.round((sel[1].t1 + 1) * sr / hop), k0: 0, k1: 400};
    const M = async s => (await __spk12.mask(s, box)).data, a = await M([sel[0]]), b = await M([Object.assign({}, sel[1], {op: undefined})]), c = await M([Object.assign({}, sel[2], {op: undefined})]), g = await M(sel);
    let bad = 0, nz = 0; for (let i = 0; i < g.length; i++) { const e = Math.min(Math.max(a[i], b[i]), 255 - c[i]); if (e !== g[i]) bad++; if (e) nz++; }
    return {ops: sel.map(s => s.op || ''), bad, nz, view: __spk12.view()}; });
  await wait(300); await shot('10-plus-minus');
  ok(tag + ' minus-touch-bitgenau', s3, s3.ops.join(',') === ',,sub' && s3.bad === 0 && s3.nz > 0);
  ok(tag + ' anzeige-ergebnis-flaeche', await p.evaluate(() => __spk12.view()), !!(await p.evaluate(() => __spk12.view())));
  await tap(await sel('#spk1Sheet [data-a="undo"]')); const u1 = await nSel();
  await tap(await sel('#spk1Sheet [data-a="redo"]')); const r1 = await nSel();
  ok(tag + ' ein-undo-je-aktion', {nachUndo: u1, nachRedo: r1, stat: await st()}, u1 === 2 && r1 === 3);
  // ---- Auswahl ▾: Umkehren, nur Frequenzen, Erweitern, Weicher, Wiederherstellen ----
  await tap(await sel('#spk1Sheet .spk12-dd')); await wait(150);
  const dd = await p.evaluate(() => { const d = document.querySelector('#spk1Sheet .spk1-dd'); if (!d) return null; const r = d.getBoundingClientRect(); return {r: [r.left, r.right, r.top, r.bottom], vw: innerWidth, vh: innerHeight, b: [...d.querySelectorAll('button')].map(e => { const q = e.getBoundingClientRect(); return [e.textContent.trim(), Math.round(q.width), Math.round(q.height)]; })}; });
  await shot('20-auswahl-menue');
  ok(tag + ' menue-im-bild-44', dd, !!dd && dd.r[0] >= 0 && dd.r[1] <= dd.vw + 0.5 && dd.r[2] >= 0 && dd.r[3] <= dd.vh + 0.5 && dd.b.every(x => x[2] >= 44 && x[1] >= 44));
  await tap(await ddBtn('inv')); const iv = await p.evaluate(() => __spk.page.ui().sel.map(s => s.art));
  ok(tag + ' umkehren', {arts: iv, stat: await st()}, iv[iv.length - 1] === 'inv');
  await tap(await sel('#spk1Sheet [data-a="undo"]'));
  await p.evaluate(() => { __spk12.mode('neu'); }); await wait(100);
  const E1 = await scr(TT - 2, 1000), E2 = await scr(TT, 400); await drag(E1, E2);
  const g0 = await p.evaluate(() => __spk12.box());
  await tap(await sel('#spk1Sheet .spk12-dd')); await tap(await ddBtn('grow')); const g1 = await p.evaluate(() => __spk12.box());
  ok(tag + ' erweitern', {vor: g0, nach: g1}, Math.abs((g0.t0 - g1.t0) - 0.05) < 0.002 && Math.abs((g1.t1 - g0.t1) - 0.05) < 0.002 && Math.abs(1200 * Math.log2(g1.f1 / g0.f1) - 50) < 1);
  await tap(await sel('#spk1Sheet .spk12-dd')); await tap(await ddBtn('soft')); const kt = await p.evaluate(() => __spk.page.ui().sel[0].kt);
  ok(tag + ' weicher', {kt}, kt > 0.09);
  await tap(await sel('#spk1Sheet [data-a="undo"]')); await tap(await sel('#spk1Sheet [data-a="undo"]')); const g2 = await p.evaluate(() => __spk12.box());
  ok(tag + ' undo-erweitern-weicher', {g0, g2}, Math.abs(g2.t0 - g0.t0) < 1e-6 && Math.abs(g2.t1 - g0.t1) < 1e-6);
  await tap(await sel('#spk1Sheet .spk12-dd')); await tap(await ddBtn('invf')); const nf = await p.evaluate(() => __spk.page.ui().sel.slice(-1)[0]);
  ok(tag + ' nur-frequenzen-umkehren', nf, nf.art === 'inv' && nf.nurF === 1 && Math.abs(nf.t0 - g0.t0) < 0.01);
  await tap(await sel('#spk1Sheet [data-a="undo"]'));
  const keep = await p.evaluate(() => JSON.stringify(__spk.page.ui().sel));
  await tap(await sel('#spk1Sheet [data-a="drop"]')); const nd = await nSel();
  await tap(await sel('#spk1Sheet .spk12-dd')); await tap(await ddBtn('rest')); const back = await p.evaluate(() => JSON.stringify(__spk.page.ui().sel));
  ok(tag + ' wiederherstellen', {nachVerwerfen: nd, gleich: back === keep}, nd === 0 && back === keep);
  // ---- Rand-Griffe: Rand ziehen = Größe, Mitte = verschieben, zwei Finger = Weichheit; Bildzeit ----
  await p.evaluate(() => { window.__ov = []; window.__fr = []; const o = spk1OvDraw; window.spk1OvDraw = function (U) { const t = performance.now(); o(U); window.__ov.push(performance.now() - t); }; let last = 0; const f = t => { if (last) window.__fr.push(t - last); last = t; if (window.__frOn) requestAnimationFrame(f); }; window.__frOn = true; requestAnimationFrame(f); });
  const G0 = await p.evaluate(() => __spk12.geo()), v0 = await p.evaluate(() => Object.assign({}, __spk.page.ui().v)), mn = await p.evaluate(() => { const r = __spk.page.ui().mn.getBoundingClientRect(); return [r.left, r.top]; });
  const q0 = await p.evaluate(() => __spk.page.ui().sel[0]);
  await drag([mn[0] + G0.xR, mn[1] + G0.cy], [mn[0] + G0.xR + 40, mn[1] + G0.cy], 30);
  const q1 = await p.evaluate(() => __spk.page.ui().sel[0]);
  ok(tag + ' rand-rechts-ziehen', {t1: [q0.t1, q1.t1], soll: +(q0.t1 + 40 / v0.pps).toFixed(4), t0gleich: q1.t0 === q0.t0}, Math.abs(q1.t1 - (q0.t1 + 40 / v0.pps)) < 2 / v0.pps + 0.002 && q1.t0 === q0.t0);
  const G1 = await p.evaluate(() => __spk12.geo());
  await drag([mn[0] + G1.cx, mn[1] + G1.yT], [mn[0] + G1.cx, mn[1] + G1.yT - 30], 20);
  const q2 = await p.evaluate(() => __spk.page.ui().sel[0]), dCt = 1200 * Math.log2(q2.f1 / q1.f1);
  ok(tag + ' rand-oben-ziehen', {cent: Math.round(dCt), soll: Math.round(30 / v0.rowH * 100)}, Math.abs(dCt - 30 / v0.rowH * 100) < 3 / v0.rowH * 100 + 2);
  const G2 = await p.evaluate(() => __spk12.geo());
  await drag([mn[0] + G2.cx, mn[1] + G2.cy], [mn[0] + G2.cx + 30, mn[1] + G2.cy - 20], 20);
  const q3 = await p.evaluate(() => __spk.page.ui().sel[0]);
  ok(tag + ' mitte-verschieben', {dt: +(q3.t0 - q2.t0).toFixed(4), sollDt: +(30 / v0.pps).toFixed(4), dHt: +(12 * Math.log2(q3.f0 / q2.f0)).toFixed(3), sollHt: +(20 / v0.rowH).toFixed(3)}, Math.abs(q3.t0 - q2.t0 - 30 / v0.pps) < 2 / v0.pps + 0.002 && Math.abs(12 * Math.log2(q3.f0 / q2.f0) - 20 / v0.rowH) < 2 / v0.rowH + 0.02);
  const G3 = await p.evaluate(() => __spk12.geo()), L0 = [mn[0] + G3.xL, mn[1] + G3.cy];
  await touch('touchStart', [[L0[0], L0[1], 1]]); await wait(60);
  await touch('touchStart', [[L0[0], L0[1], 1], [L0[0] + 50, L0[1] + 10, 2]]); await wait(60);
  for (let i = 1; i <= 12; i++) { await touch('touchMove', [[L0[0], L0[1], 1], [L0[0] + 50 + i * 10, L0[1] + 10, 2]]); await wait(20); }
  await touch('touchEnd', [[L0[0], L0[1], 1]]); await wait(40); await touch('touchEnd', []); await wait(250);
  const q4 = await p.evaluate(() => __spk.page.ui().sel[0]), vz = await p.evaluate(() => __spk.page.ui().v.pps);
  ok(tag + ' zwei-finger-weichheit', {kt: [q3.kt, q4.kt], zoomGleich: Math.abs(vz - v0.pps) < 1e-6, t0gleich: q4.t0 === q3.t0}, q4.kt > q3.kt && Math.abs(vz - v0.pps) < 1e-6);
  const perf = await p.evaluate(() => { window.__frOn = false; const ov = window.__ov.slice().sort((a, b) => a - b), fr = window.__fr.slice(5).sort((a, b) => a - b), q = (a, x) => a.length ? +a[Math.min(a.length - 1, Math.floor(a.length * x))].toFixed(2) : 0; return {ovN: ov.length, ovMax: q(ov, 1), ovP95: q(ov, 0.95), frP50: q(fr, 0.5), frP95: q(fr, 0.95)}; });
  ok(tag + ' bild-je-frame-16ms', perf, perf.ovN > 10 && perf.ovP95 <= 16);
  const un = []; for (let i = 0; i < 4; i++) { await tap(await sel('#spk1Sheet [data-a="undo"]')); un.push(await p.evaluate(() => { const s = __spk.page.ui().sel[0]; return s && [s.t0, s.t1, s.f0, s.f1, s.kt]; })); }
  ok(tag + ' griffe-je-ein-undo', {un, q0: [q0.t0, q0.t1, q0.f0, q0.f1, q0.kt]}, JSON.stringify(un[3]) === JSON.stringify([q0.t0, q0.t1, q0.f0, q0.f1, q0.kt]) && un[0][4] === q3.kt);
  await shot('30-rand-griffe');
  // ---- Zauberstab: Rechteck halten → Liste → Zauberstab; Tipp auf den Ton ----
  await tap(await sel('#spk1Sheet [data-a="drop"]'));
  await hold(await sel('#spk1Sheet .spk1-tl button[data-s12slot]'), 700);
  const wb = await sel('#spk1Sheet .spk1-dd [data-s12t="wand"]'); await shot('40-werkzeug-halten');
  ok(tag + ' halten-liste-zauberstab', {da: !!wb, tool: await p.evaluate(() => __spk.page.info().tool)}, !!wb);
  await tap(wb); ok(tag + ' werkzeug-zauberstab', await p.evaluate(() => [__spk.page.info().tool, document.querySelector('#spk1Sheet .spk1-tl button[data-s12slot]').textContent]), (await p.evaluate(() => __spk.page.info().tool)) === 'wand');
  await p.evaluate(([tt]) => { const U = __spk.page.ui(); U.v.pps = U.W / 10; U.v.t0 = tt - 5; spk1Clamp(U); spk1Dirty(U, 'all'); }, [TT]); await wait(600);
  await p.evaluate(() => { window.__lt0 = performance.now(); });
  await tap(await scr(TT, 440)); await p.waitForFunction(() => /Zauberstab ·|Zauberstab:/.test(__spk.page.info().stat), null, {timeout: 30000}); await wait(200);
  const w1 = await p.evaluate(() => ({ms: __spk12.S().wMs, stat: __spk.page.info().stat, sel: __spk.page.ui().sel.map(s => s.art)}));
  await tap(await sel('#spk1Sheet [data-a="drop"]'));
  await tap(await scr(TT + 0.7, 440)); await p.waitForFunction(() => /Zauberstab ·|Zauberstab:/.test(__spk.page.info().stat), null, {timeout: 30000}); await wait(300);
  const w2 = await p.evaluate(() => ({ms: __spk12.S().wMs, stat: __spk.page.info().stat}));
  const lt = await p.evaluate(() => window.__lt.filter(e => e.t >= window.__lt0).map(e => Math.round(e.d)));
  ok(tag + ' zauberstab-antwort', {erster: w1.ms, zweiter: w2.ms, stat: w2.stat}, w1.sel[0] === 'wand' && w2.ms && w2.ms.all < 150);
  ok(tag + ' hauptfaden-ohne-long-task', {longTasks: lt}, lt.every(d => d <= 50));
  await shot('50-zauberstab');
  if (full) {   // Energie: Ton-Anteil in der Maske ≥ 90 %, Rauschfläche ≤ 5 % (Base-Raster N 4096 / Hop 1024, ± 5 s um den Tipp)
    const en = await p.evaluate(async ([tt]) => {
      const U = __spk.page.ui(), sr = U.meta.sr, N = U.meta.base.N, hop = U.meta.base.hop, NB = N / 2 + 1, A = 0.3, m0 = Math.round((tt + 0.7 - 5) * sr / hop + 1), m1 = Math.round((tt + 0.7 + 5) * sr / hop + 1);
      const mk = await __spk12.mask(U.sel, {m0, m1, k0: 0, k1: NB - 1}), w = mk.data, Hh = mk.H;
      const re = new Float64Array(N), im = new Float64Array(N), win = new Float64Array(N); for (let j = 0; j < N; j++) win[j] = 0.5 - 0.5 * Math.cos(2 * Math.PI * j / N);
      const fft = (re, im) => { const n = re.length; for (let i = 1, j = 0; i < n; i++) { let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } } for (let len = 2; len <= n; len <<= 1) { const a = -2 * Math.PI / len, wr = Math.cos(a), wi = Math.sin(a); for (let i = 0; i < n; i += len) { let cr = 1, ci = 0; for (let j = 0; j < len / 2; j++) { const ur = re[i + j], ui = im[i + j], vr = re[i + j + len / 2] * cr - im[i + j + len / 2] * ci, vi = re[i + j + len / 2] * ci + im[i + j + len / 2] * cr; re[i + j] = ur + vr; im[i + j] = ui + vi; re[i + j + len / 2] = ur - vr; im[i + j + len / 2] = ui - vi; const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t; } } } };
      const E = new Float64Array((m1 - m0 + 1) * NB); let emax = 0;
      for (let m = m0; m <= m1; m++) { const s0 = (m - 3) * hop; for (let j = 0; j < N; j++) { re[j] = A * Math.sin(2 * Math.PI * 440 * (s0 + j) / sr) * win[j]; im[j] = 0; } fft(re, im); for (let k = 0; k < NB; k++) { const e = re[k] * re[k] + im[k] * im[k]; E[(m - m0) * NB + k] = e; if (e > emax) emax = e; } }
      let tot = 0, inn = 0, noise = 0, noiseSel = 0, sel = 0;
      for (let i = 0; i <= m1 - m0; i++) for (let k = 0; k < NB; k++) { const e = E[i * NB + k], ww = w[i * Hh + k] / 255; tot += e; inn += e * ww; if (ww >= 0.5) sel++; if (e < emax * 1e-4) { noise++; if (ww >= 0.5) noiseSel++; } }
      return {tonAnteil: +(inn / tot).toFixed(4), rauschFlaeche: +(noiseSel / noise).toFixed(5), zellen: sel, rauschZellen: noise, fenster: [m0, m1]};
    }, [TT]);
    ok(tag + ' zauberstab-ton-90-rauschen-5', en, en.tonAnteil >= 0.9 && en.rauschFlaeche <= 0.05);
    const k0 = await p.evaluate(() => __spk12.S().u.length);
    await p.evaluate(() => { const U = __spk.page.ui(), r = U.op.querySelector('input[aria-label="Toleranz"]'); r.value = 25; r.dispatchEvent(new Event('input')); });
    await p.waitForFunction(() => /Zauberstab ·/.test(__spk.page.info().stat) && __spk12.S().wLast && __spk12.S().wLast.shape.tol === 25, null, {timeout: 20000}).catch(() => {});
    const k1 = await p.evaluate(() => ({u: __spk12.S().u.length, tol: __spk12.S().wLast.shape.tol, n: __spk.page.ui().sel.length}));
    ok(tag + ' toleranz-regler-neu-rechnen', {k0, k1}, k1.tol === 25 && k1.u === k0 && k1.n === 1);
    // Zauberstab mit + : zweite Fläche dazu, ein ↶
    await p.evaluate(() => __spk12.mode('add'));
    await tap(await scr(TT + 3.5, 440)); await p.waitForFunction(() => __spk.page.ui().sel.length === 2, null, {timeout: 20000}).catch(() => {});
    const n2 = await nSel(); await tap(await sel('#spk1Sheet [data-a="undo"]')); const n3 = await nSel();
    ok(tag + ' zauberstab-plus-undo', {n2, n3}, n2 === 2 && n3 === 1);
    // In Ebene: Auswahl mit Zauberstab wirkt im Kern (Ebene bekommt Anteil)
    await tap(await sel('#spk1Sheet [data-a="into"]')); await wait(200);
    const nb = await p.evaluate(() => { const e = [...document.querySelectorAll('#spk1Sheet .spk1-dd button')].find(x => /\+ Eigene/.test(x.textContent)); if (!e) return null; const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
    await tap(nb); await p.waitForFunction(() => __spk.page.ui().meta.layers.length > 0 && !__spk.page.info().busy, null, {timeout: 60000}).catch(() => {});
    const lay2 = await p.evaluate(async () => { const U = __spk.page.ui(), l = U.meta.layers[0], s = U.sel[0], sr = U.meta.sr, hop = U.meta.base.hop, m = Math.round(((s.t0 + s.t1) / 2) * sr / hop + 1), k = Math.round(440 * U.meta.base.N / sr); return {n: U.meta.layers.length, beiTon: await __spk.maskAt(l.id, m, k), weit: await __spk.maskAt(l.id, m, k * 6)}; });
    ok(tag + ' in-ebene-mit-zauberstab', lay2, lay2.n === 1 && lay2.beiTon > 200 && lay2.weit === 0);
  }
  ok(tag + ' guide-eintrag', await p.evaluate(() => { const e = ui1Entries().find(x => x.id === 'spk12'); return e ? e.w : null; }), await p.evaluate(() => ui1Entries().some(x => x.id === 'spk12')));
  ok(tag + ' keine-fehler', errs.slice(0, 5), errs.length === 0);
  await ctx.close();
}
await b.close(); srv.close();
fs.writeFileSync(path.join(here, 'spk12-test.json'), JSON.stringify(res, null, 1));
console.log((nF ? 'FEHLER ' : 'ALLES OK ') + nOk + ' OK / ' + nF + ' FEHLER');
