// SPK12 Teil 2 – Transient (16 Snare-Schläge + Pad), Ellipse, Lasso, Obertöne mit Häkchen (nur ungerade → gerade ≤ 1 %), Auto,
// folgt dem Ton mit Rücksprung. Touch über CDP. Messungen statt Bildvergleich. Aufruf: node spk12-test2.mjs <abs. index.html>
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
const ON = Array.from({length: 16}, (_, i) => 2 + i * 0.25);   // Snare-Anschläge
for (const [W, H] of VIEWS) {
  const tag = W + 'x' + H, errs = [];
  const ctx = await b.newContext({viewport: {width: W, height: H}, hasTouch: true, isMobile: true, deviceScaleFactor: 2}), p = await ctx.newPage(), cdp = await ctx.newCDPSession(p);
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
  const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: pts.map((q, i) => ({x: q[0], y: q[1], id: q[2] ?? i, radiusX: 2, radiusY: 2, force: 1}))});
  const wait = ms => p.waitForTimeout(ms);
  const path3 = async (pts, dt = 18) => { await touch('touchStart', [pts[0]]); await wait(40); for (let i = 1; i < pts.length; i++) { await touch('touchMove', [pts[i]]); await wait(dt); } await touch('touchEnd', []); await wait(250); };
  const drag = (a, z, steps = 14) => path3(Array.from({length: steps + 1}, (_, i) => [a[0] + (z[0] - a[0]) * i / steps, a[1] + (z[1] - a[1]) * i / steps]));
  const tap = async q => { if (!q) throw new Error('Knopf fehlt'); await touch('touchStart', [q]); await wait(50); await touch('touchEnd', []); await wait(250); };
  const hold = async (q, ms) => { if (!q) throw new Error('Knopf fehlt'); await touch('touchStart', [q]); await wait(ms); await touch('touchEnd', []); await wait(250); };
  const sel = s => p.evaluate(s => { const e = document.querySelector(s); if (!e || !e.offsetParent) return null; e.scrollIntoView({block: 'nearest', inline: 'nearest'}); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, s);
  const box = s => p.evaluate(s => [...document.querySelectorAll(s)].filter(e => e.offsetParent).map(e => { e.scrollIntoView({block: 'nearest', inline: 'nearest'}); const r = e.getBoundingClientRect(), af = getComputedStyle(e, '::after'), ex = af.content && af.content !== 'none' ? Math.max(0, -parseFloat(af.top) || 0) + Math.max(0, -parseFloat(af.bottom) || 0) : 0; return {t: e.textContent.trim(), w: Math.round(r.width), h: Math.round(r.height + ex), l: Math.round(r.left), r: Math.round(r.right), top: Math.round(r.top), bot: Math.round(r.bottom)}; }), s);
  const inView = L => L.length > 0 && L.every(x => x.w >= 44 && x.h >= 44 && x.l >= 0 && x.r <= W + 0.5 && x.top >= 0 && x.bot <= H + 0.5);
  const shot = n => p.screenshot({path: path.join(fotos, n + '-' + tag + '.png')});
  const U_ = () => p.evaluate(() => { const U = __spk.page.ui(); return {tool: U.tool, n: U.sel.length, arts: U.sel.map(s => s.art + (s.op ? ':' + s.op : '')), stat: __spk.page.info().stat}; });
  const scr = (t, f) => p.evaluate(([t, f]) => { const U = __spk.page.ui(), r = U.mn.getBoundingClientRect(); return [r.left + spk1X(U, t), r.top + spk1Y(U, f)]; }, [t, f]);
  const view = (t0, t1, mTop, mBot) => p.evaluate(([t0, t1, a, z]) => { const U = __spk.page.ui(), v = U.v; v.pps = U.W / (t1 - t0); v.t0 = t0; v.rowH = U.H / (a - z); v.mTop = a; spk1Clamp(U); spk1Dirty(U, 'all'); }, [t0, t1, mTop, mBot]);
  const tool = async (grp, k) => { await hold(await sel(`#spk1Sheet .spk1-tl button[data-s12slot="${grp}"]`), 700); const q = await sel(`#spk1Sheet .spk1-dd [data-s12t="${k}"]`); await tap(q); return p.evaluate(() => __spk.page.info().tool); };
  await p.goto(url); await p.waitForFunction(() => window.SYNQUENZER && window.__spk && window.__spk12, null, {timeout: 60000}); await wait(600);
  await p.evaluate(() => { window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push({t: e.startTime, d: e.duration}); }).observe({entryTypes: ['longtask']}); } catch (e) {} });
  // ---- Testsignal (19 s): Pad + 16 Snare-Schläge (0–8 s), Ton 220 Hz mit 12 Obertönen (9–11,5 s), Ton 196 Hz mit 6 Obertönen (12,5–14,5 s), Gleitton mit Vibrato + Rausch-Lücke (15–18,5 s)
  await p.evaluate(async () => {
    await __spk.page.open({}); const sr = 44100, n = 19 * sr, x = new Float32Array(n), C = window.__c = {sr, pad: new Float32Array(n), sn: new Float32Array(n), odd: new Float32Array(n), even: new Float32Array(n), g1: new Float32Array(n), auto: new Float32Array(n), glide: new Float32Array(n)};
    let s1 = 7; const rnd = () => ((s1 = (s1 * 1103515245 + 12345) >>> 0) / 4294967296) * 2 - 1, TP = 2 * Math.PI;
    const CH = [[0.3, [220, 277.18, 329.63]], [1.2, [196, 246.94, 293.66]], [2.6, [185, 220, 277.18]], [4.1, [146.83, 220, 293.66]], [6.4, [164.81, 207.65, 246.94]], [8.0, []]];
    for (let c = 0; c + 1 < CH.length; c++) { const [ta, fs] = CH[c], tb = CH[c + 1][0] + 0.15;
      for (let i = Math.floor(ta * sr); i < Math.min(n, tb * sr); i++) { const t = i / sr, e = Math.min(1, (t - ta) / 0.15, (tb - t) / 0.15); let v = 0; for (const f of fs) for (let h = 1; h <= 8; h++) v += Math.sin(TP * f * h * t + h) * 0.05 / h; C.pad[i] += v * Math.max(0, e); } }
    const LV = [1, 0.55, 0.8, 0.45, 1, 0.6, 0.85, 0.5, 0.95, 0.55, 0.75, 0.45, 1, 0.6, 0.8, 0.5];
    for (let j = 0; j < 16; j++) { const i0 = Math.round((2 + j * 0.25) * sr); for (let i = 0; i < 0.2 * sr; i++) { const t = i / sr, a = LV[j]; C.sn[i0 + i] += a * (0.35 * rnd() * Math.exp(-t / 0.045) + 0.3 * Math.sin(TP * 190 * t) * Math.exp(-t / 0.06)); } }
    for (let i = Math.floor(9 * sr); i < 11.5 * sr; i++) { const t = i / sr, e = Math.min(1, (t - 9) / 0.02, (11.5 - t) / 0.02); for (let h = 1; h <= 12; h++) { const v = e * 0.2 / Math.pow(h, 0.6) * Math.sin(TP * 220 * h * t); if (h & 1) C.odd[i] += v; else C.even[i] += v; } }
    for (let i = Math.floor(12.5 * sr); i < 14.5 * sr; i++) { const t = i / sr, e = Math.min(1, (t - 12.5) / 0.02, (14.5 - t) / 0.02); for (let h = 1; h <= 6; h++) C.auto[i] += e * 0.2 / Math.sqrt(h) * Math.sin(TP * 196 * h * t); }
    let ph = 0; const fT = t => 330 * Math.pow(2, (4 / 12) * (t - 15) / 3.5 + (40 / 1200) * Math.sin(2 * Math.PI * 5 * (t - 15))); C.fT = fT.toString();
    for (let i = Math.floor(15 * sr); i < 18.5 * sr; i++) { const t = i / sr; ph += TP * fT(t) / sr; const gp = Math.min(1, Math.max(0, Math.abs(t - 16.56) - 0.06) / 0.02), e = Math.min(1, (t - 15) / 0.02, (18.5 - t) / 0.02) * gp;
      C.g1[i] = e * 0.25 * Math.sin(ph); C.glide[i] = C.g1[i] + e * (0.12 * Math.sin(2 * ph) + 0.06 * Math.sin(3 * ph)) + (t > 16.5 && t < 16.62 ? 0.25 * rnd() : 0); }
    for (let i = 0; i < n; i++) x[i] = C.pad[i] + C.sn[i] + C.odd[i] + C.even[i] + C.auto[i] + C.glide[i];
    window.__E = (sig, m0, m1, k1) => { const N = 4096, hop = 1024, re = new Float64Array(N), im = new Float64Array(N), H = k1 + 1, o = new Float64Array((m1 - m0 + 1) * H); for (let m = m0; m <= m1; m++) { const g = spk12Mag(sig, (m - 1) * hop, N, re, im); for (let k = 0; k <= k1; k++) o[(m - m0) * H + k] = g[k] * g[k]; } return o; };
    window.__frac = async (sel, sig, t0, t1, k1) => { const sr = 44100, hop = 1024, m0 = Math.round(t0 * sr / hop + 1), m1 = Math.round(t1 * sr / hop + 1), M = await __spk12.mask(sel, {m0, m1, k0: 0, k1}), E = __E(sig, m0, m1, k1); let a = 0, z = 0; for (let i = 0; i < E.length; i++) { a += E[i] * M.data[i] / 255; z += E[i]; } return z > 0 ? a / z : 0; };
    const r = await __spk.load({name: 'Werkzeugkasten Teil 2', sr, ch: [x]}); await __spk.page.open({id: r.meta.id});
  });
  await p.waitForFunction(() => { const i = __spk.page.info(); return i && !i.nodoc && i.chunks > 0 && !/Spektrum \d/.test(i.stat); }, null, {timeout: 300000}); await wait(500);
  await p.evaluate(() => { window.__lt0 = performance.now(); });
  // ---- Transient: Zeit halten → Transient, über 0,2–7,8 s ziehen ----
  await view(0, 8.2, 100, 40);
  ok(tag + ' werkzeug-transient', await tool('zeit', 'trans'), (await p.evaluate(() => __spk.page.info().tool)) === 'trans');
  const lt = await box('#spk1Sheet .spk1-op .spk1-o.on input');
  ok(tag + ' transient-regler-im-bild', lt.map(x => [x.l, x.r, x.top, x.bot]), lt.length >= 3 && lt.every(x => x.l >= 0 && x.r <= W + 0.5 && x.bot <= H + 0.5));
  await drag(await scr(0.2, 2000), await scr(7.8, 2000), 20);
  await p.waitForFunction(() => { const s = __spk.page.ui().sel[0]; return s && s.art === 'trans'; }, null, {timeout: 30000}).catch(() => {});
  const tr = await p.evaluate(() => { const s = __spk.page.ui().sel[0]; return s && s.art === 'trans' ? {hits: s.hits, ms: __spk12.S().tMs} : null; });
  if (tr) {
    const hit = ON.filter(o => tr.hits.some(h => Math.abs(h - o) <= 0.03)).length, pad = tr.hits.filter(h => h < 1.95 || h > 5.85).length, fals = tr.hits.filter(h => !ON.some(o => Math.abs(h - o) <= 0.03)).length;
    ok(tag + ' transient-16-snare', {treffer: hit + '/16', imPad: pad, falsch: fals, n: tr.hits.length, ms: tr.ms}, hit >= 15 && pad === 0);
    ok(tag + ' transient-kein-falscher', {falsch: fals, abw_ms: tr.hits.map(h => Math.round(1000 * Math.min(...ON.map(o => Math.abs(h - o)))))}, fals === 0);
    const en = await p.evaluate(async () => { const sel = __spk.page.ui().sel; return {snare: +(100 * await __frac(sel, __c.sn, 1.9, 6.1, 1200)).toFixed(1), pad: +(100 * await __frac(sel, __c.pad, 1.9, 6.1, 1200)).toFixed(1)}; });
    ok(tag + ' transient-maske-energie', {snare_pct: en.snare, pad_pct: en.pad}, en.snare >= 50 && en.pad <= 10);
  } else ok(tag + ' transient-16-snare', null, false);
  await shot('t2-transient');
  // Tipp auf einen Schlag (3,0 s) im Modus Neu → genau ein Schlag; ↶ → wieder alle
  await tap(await scr(3.02, 2000)); await p.waitForFunction(() => { const s = __spk.page.ui().sel[0]; return s && s.art === 'trans' && s.hits.length === 1; }, null, {timeout: 20000}).catch(() => {});
  const t1 = await p.evaluate(() => __spk.page.ui().sel.map(s => s.hits));
  await tap(await sel('#spk1Sheet [data-a="undo"]')); const t2 = await p.evaluate(() => __spk.page.ui().sel.map(s => s.hits.length));
  ok(tag + ' transient-tipp-und-undo', {tipp: t1, nachUndo: t2}, t1.length === 1 && t1[0].length === 1 && Math.abs(t1[0][0] - 3) <= 0.03 && t2[0] >= 15);
  // ---- Ellipse (Rechteck halten → Ellipse) ----
  await view(8.6, 14.8, 96, 50);
  ok(tag + ' werkzeug-ellipse', await tool('rect', 'ell'), (await p.evaluate(() => __spk.page.info().tool)) === 'ell');
  const ddL = await p.evaluate(() => 1);
  await drag(await scr(9.3, 1800), await scr(11.0, 300), 14);
  const el1 = await p.evaluate(async () => {
    const U = __spk.page.ui(), s = U.sel[0]; if (!s || s.art !== 'ell') return null; const sr = U.meta.sr, hop = 1024, N = 4096, m0 = Math.round(s.t0 * sr / hop + 1) - 3, m1 = Math.round(s.t1 * sr / hop + 1) + 3, k1 = Math.ceil(s.f1 * 1.3 * N / sr);
    const M = await __spk12.mask([s], {m0, m1, k0: 0, k1}), Hh = k1 + 1, cn = f => f > 0 ? 1200 * Math.log2(f / 440) : -1e9; let bad = 0, nz = 0, soft = 0;
    const tc = (s.t0 + s.t1) / 2, rt = (s.t1 - s.t0) / 2, c0 = cn(s.f0), c1 = cn(s.f1), cc = (c0 + c1) / 2, rc = (c1 - c0) / 2, e = Math.max(s.kt / (2 * rt), s.kf / (2 * rc));
    for (let i = 0; i <= m1 - m0; i++) for (let k = 0; k <= k1; k++) { const u = ((m0 + i - 1) * hop / sr - tc) / rt, v = (cn(k * sr / N) - cc) / rc, r = Math.sqrt(u * u + v * v), w = e > 0 ? Math.round(255 * Math.max(0, Math.min(1, (1 + e / 2 - r) / e))) : (r <= 1 ? 255 : 0); const g = M.data[i * Hh + k]; if (g !== w) bad++; if (g) nz++; if (g > 0 && g < 255) soft++; }
    return {bad, nz, soft, kt: s.kt, kf: s.kf};
  });
  ok(tag + ' ellipse-bit-genau', el1, el1 && el1.bad === 0 && el1.nz > 50);
  await shot('t2-ellipse');
  // ---- Lasso (umfahren, Dreieck) ----
  await p.evaluate(() => { __spk.page.ui().opt.kante = 0; });   // harte Kante → bit-genau prüfbar
  ok(tag + ' werkzeug-lasso', await tool('rect', 'lasso'), (await p.evaluate(() => __spk.page.info().tool)) === 'lasso');
  { const A = await scr(9.2, 400), B = await scr(11.2, 600), Cc = await scr(10.0, 2600), pts = []; for (const [a, z] of [[A, B], [B, Cc], [Cc, A]]) for (let i = 0; i < 10; i++) pts.push([a[0] + (z[0] - a[0]) * i / 10, a[1] + (z[1] - a[1]) * i / 10]); pts.push(A);
    await p.evaluate(() => { window.__ov = []; const o = spk1OvDraw; window.spk1OvDraw = function (U) { const t = performance.now(); o(U); window.__ov.push(performance.now() - t); }; });
    await path3(pts, 22); await p.evaluate(() => { __spk.page.ui().opt.kante = 0.3; }); }
  const la = await p.evaluate(async () => {
    const U = __spk.page.ui(), s = U.sel[0]; if (!s || s.art !== 'lasso') return null; const sr = U.meta.sr, hop = 1024, N = 4096, m0 = Math.round(s.t0 * sr / hop + 1) - 2, m1 = Math.round(s.t1 * sr / hop + 1) + 2, k1 = Math.ceil(s.f1 * 1.2 * N / sr);
    const M = await __spk12.mask([s], {m0, m1, k0: 0, k1}), Hh = k1 + 1, cn = f => f > 0 ? 1200 * Math.log2(f / 440) : -1e9, P = s.pts.map(q => [q[0], cn(q[1])]);
    const inside = (t, c) => { let o = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const a = P[j], b = P[i]; if ((a[0] <= t) !== (b[0] <= t) && c < a[1] + (t - a[0]) / (b[0] - a[0]) * (b[1] - a[1])) o = !o; } return o; };
    let bad = 0, nz = 0, near = 0; for (let i = 0; i <= m1 - m0; i++) for (let k = 1; k <= k1; k++) { const t = (m0 + i - 1) * hop / sr, g = M.data[i * Hh + k], w = inside(t, cn(k * sr / N)) ? 255 : 0; if (g) nz++; if (g !== w) { bad++; } }
    const ov = window.__ov.slice().sort((a, b) => a - b); return {pts: s.pts.length, bad, nz, kt: s.kt, ov_p95: +(ov[Math.floor(ov.length * 0.95)] || 0).toFixed(2), ov_max: +(ov[ov.length - 1] || 0).toFixed(2), nOv: ov.length};
  });
  ok(tag + ' lasso-maske', la, la && la.pts >= 3 && la.nz > 50 && (la.kt > 0 || la.bad <= Math.max(2, la.nz * 0.002)));
  ok(tag + ' lasso-bild-16ms', la && {p95: la.ov_p95, max: la.ov_max, n: la.nOv}, la && la.ov_p95 <= 16);
  await shot('t2-lasso');
  // ---- Obertöne: Harmonische auf 220 Hz, Obertöne ▾ → Ungerade (gerade ≤ 1 %), Häkchen einzeln, Auto ----
  await p.evaluate(() => spk1ToolSet(__spk.page.ui(), 'harm'));
  const hb = await box('#spk1Sheet .spk1-op .spk1-o.on [data-a="s12hd"]');
  ok(tag + ' obertoene-knopf', hb, inView(hb));
  await tap(await scr(10.0, 220)); await p.waitForFunction(() => __spk.page.ui().sel.some(s => s.art === 'harm'), null, {timeout: 30000}).catch(() => {});
  await tap(await sel('#spk1Sheet [data-a="s12hd"]')); await wait(150);
  const hn = await box('#spk1Sheet .spk1-dd [data-s12h]'), hh = await box('#spk1Sheet .spk1-dd [data-s12hh]');
  ok(tag + ' obertoene-klappfenster', {n: hn.length, zeile: hh.map(x => x.t), w: hn.slice(0, 3).map(x => [x.w, x.h])}, hn.length >= 12 && hh.length === 4 && inView(hn) && inView(hh));
  await shot('t2-obertoene');
  await tap(await sel('#spk1Sheet .spk1-dd [data-s12hh="ung"]'));
  const od = await p.evaluate(async () => { const sel = __spk.page.ui().sel, h = sel.find(s => s.art === 'harm'); return {hm: h && h.hm, gerade: +(100 * await __frac(sel, __c.even, 9.3, 11.2, 1500)).toFixed(3), ungerade: +(100 * await __frac(sel, __c.odd, 9.3, 11.2, 1500)).toFixed(1)}; });
  ok(tag + ' obertoene-nur-ungerade', od, od.hm && od.hm.every(h => h & 1) && od.gerade <= 1 && od.ungerade >= 80);
  await tap(await sel('#spk1Sheet [data-a="s12hd"]')); await wait(250); const dbg3 = await p.evaluate(() => ({open: !!document.querySelector('#spk1Sheet .spk1-dd [data-s12h]'), b3: (document.querySelector('#spk1Sheet .spk1-dd [data-s12h="3"]') || {}).textContent})); const q3 = await sel('#spk1Sheet .spk1-dd [data-s12h="3"]'); console.log('dbg3', JSON.stringify(dbg3), JSON.stringify(await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e && (e.outerHTML.slice(0, 80)); }, q3))); await tap(await sel('#spk1Sheet .spk1-dd [data-s12h="3"]'));
  const h3 = await p.evaluate(() => __spk.page.ui().sel.find(s => s.art === 'harm').hm); await p.evaluate(() => spk1Dd(__spk.page.ui(), null));
  await tap(await sel('#spk1Sheet [data-a="undo"]')); const h3u = await p.evaluate(() => __spk.page.ui().sel.find(s => s.art === 'harm').hm);
  ok(tag + ' oberton-haekchen-und-undo', {ohne3: h3, nachUndo: h3u}, h3 && !h3.includes(3) && h3.includes(5) && h3u && h3u.includes(3));
  await tap(await scr(13.5, 196)); await p.waitForFunction(() => { const s = __spk.page.ui().sel; return s.some(x => x.art === 'harm' && x.spur[0][0] > 12); }, null, {timeout: 30000}).catch(() => {});
  await p.evaluate(() => { const U = __spk.page.ui(); U.sel = U.sel.filter(x => x.art === 'harm' && x.spur[0][0] > 12); });
  await tap(await sel('#spk1Sheet [data-a="s12hd"]')); await wait(150); await tap(await sel('#spk1Sheet .spk1-dd [data-s12hh="auto"]'));
  await p.waitForFunction(() => { const s = __spk.page.ui().sel.find(x => x.art === 'harm'); return s && s.hm; }, null, {timeout: 20000}).catch(() => {});
  const au = await p.evaluate(() => { const s = __spk.page.ui().sel.find(x => x.art === 'harm'); return {hm: s && s.hm, K: s && s.K, snr: (__spk12.S().hAutoR || {}).snr}; });
  ok(tag + ' obertoene-auto', au, au.hm && au.hm.join() === '1,2,3,4,5,6' && au.K === 6);
  await p.evaluate(() => { const S = __spk12.S(); S.hAuto = false; S.hm = null; });
  // ---- folgt dem Ton: Rechteck um den Anfang des Gleittons, Auswahl ▾ → Folgt dem Ton ----
  await view(14.6, 18.9, 74, 52);
  await p.evaluate(() => { const U = __spk.page.ui(); spk12Slot(U, 'rect'); spk1ToolSet(U, 'rect'); __spk12.mode('neu'); });
  await drag(await scr(15.1, 365), await scr(18.3, 300), 14);
  const r0 = await p.evaluate(async () => { const sel = __spk.page.ui().sel; return {arts: sel.map(s => s.art), e: +(100 * await __frac(sel, __c.g1, 15.2, 18.2, 300)).toFixed(1)}; });
  await tap(await sel('#spk1Sheet [data-a="s12dd"]')); await wait(150); const fb = await box('#spk1Sheet .spk1-dd [data-s12a="fol"]'); await tap(await sel('#spk1Sheet .spk1-dd [data-s12a="fol"]'));
  await p.waitForFunction(() => { const s = __spk.page.ui().sel; return s.length === 1 && s[0].art === 'fol'; }, null, {timeout: 30000}).catch(() => {});
  const fo = await p.evaluate(async () => {
    const sel = __spk.page.ui().sel; if (!sel[0] || sel[0].art !== 'fol') return null; const r = __spk12.S().fR, fT = eval('(' + __c.fT + ')'), cE = (t, f) => Math.abs(1200 * Math.log2(f / fT(t)));
    const at = (a, z) => r.cur.filter(q => q[0] >= a && q[0] <= z).map(q => cE(q[0], r.fr * q[1])), mx = L => L.length ? +Math.max(...L).toFixed(1) : null, md = L => { const s = L.slice().sort((a, b) => a - b); return s.length ? +s[s.length >> 1].toFixed(1) : null; };
    return {e: +(100 * await __frac(sel, __c.g1, 15.2, 18.2, 300)).toFixed(1), fr: r.fr, held: r.held, ms: r.ms, median_ct: md(at(15.1, 18.3)), luecke_max_ct: mx(at(16.5, 16.62)), danach_max_ct: mx(at(16.75, 17.2))};
  });
  ok(tag + ' folgt-dem-ton-energie', {ohne: r0.e, mit: fo && fo.e}, fo && fo.e >= 90 && fo.e > r0.e + 15);
  ok(tag + ' folgt-dem-ton-ruecksprung', fo, fo && fo.median_ct <= 25 && fo.luecke_max_ct <= 100 && fo.danach_max_ct <= 60 && fo.held > 0);
  ok(tag + ' folgt-knopf', fb, inView(fb));
  await shot('t2-folgt');
  await tap(await sel('#spk1Sheet [data-a="undo"]')); ok(tag + ' folgt-undo', await U_(), (await U_()).arts.join() === 'rect');
  // ---- Hauptfaden ----
  const lts = await p.evaluate(() => window.__lt.filter(e => e.t >= window.__lt0).map(e => Math.round(e.d)));
  ok(tag + ' keine-long-task-50ms', lts, lts.every(d => d <= 50));
  ok(tag + ' guide-eintrag', await p.evaluate(() => { const e = ui1Entries().find(x => x.id === 'spk12'); return e ? e.w : null; }), await p.evaluate(() => /Transient/.test((ui1Entries().find(x => x.id === 'spk12') || {}).w || '')));
  ok(tag + ' keine-fehler', errs.slice(0, 5), errs.length === 0);
  await ctx.close();
}
await b.close(); srv.close();
fs.writeFileSync(path.join(here, 'spk12-test2.json'), JSON.stringify(res, null, 1));
console.log((nF ? 'FEHLER ' : 'ALLES OK ') + nOk + ' OK / ' + nF + ' FEHLER');
