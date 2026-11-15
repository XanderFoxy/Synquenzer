// SPK12 Prüfung (Befunde aus PRUEFUNG.md): 1 Ebenen-Stand nach Schließen/Öffnen, 2 ↶-Reihenfolge, 3 Auswahl ▾ bei Ähnliche,
// 4 Abtasten aus mit 3 min (< 150 ms, Fortschritt), 5/6 vorhandene Regler wie in der Basis, a Transient-Maske in der Ebene, b Merkmal-↶.
// Touch über CDP, Messungen statt Bildvergleich. Aufruf: node spk12-test4.mjs <index.html> <basis.html>   (VIEWS=428x926,926x428,926x370)
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright/index.js');
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const file = path.resolve(process.argv[2]), base = path.resolve(process.argv[3] || path.join(path.dirname(file), 'basis.html')), dir = path.dirname(file), here = path.dirname(new URL(import.meta.url).pathname), fotos = path.join(here, 'fotos'); fs.mkdirSync(fotos, {recursive: true});
const srv = http.createServer((q, r) => { const p = path.join(dir, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': p.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream'}); fs.createReadStream(p).pipe(r); });
await new Promise(ok => srv.listen(0, ok)); const U0 = 'http://127.0.0.1:' + srv.address().port + '/';
const res = {}; let nOk = 0, nF = 0;
const ok = (k, v, c) => { res[k] = {v, ok: !!c}; c ? nOk++ : nF++; console.log((c ? 'OK     ' : 'FEHLER ') + k + ' ' + JSON.stringify(v)); };
const b = await chromium.launch({args: ['--disable-renderer-backgrounding', '--autoplay-policy=no-user-gesture-required']});
const VIEWS = (process.env.VIEWS || '428x926,926x428,926x370').split(',').map(s => s.split('x').map(Number));
const ONLY = process.env.ONLY || '';
async function page(f, W, H) {
  const ctx = await b.newContext({viewport: {width: W, height: H}, hasTouch: true, isMobile: true, deviceScaleFactor: 2}), p = await ctx.newPage(), cdp = await ctx.newCDPSession(p), errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
  const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: pts.map((q, i) => ({x: q[0], y: q[1], id: i, radiusX: 2, radiusY: 2, force: 1}))});
  const wait = ms => p.waitForTimeout(ms);
  const T = {p, ctx, errs, wait, touch,
    tap: async q => { if (!q) throw new Error('Knopf fehlt'); await touch('touchStart', [q]); await wait(50); await touch('touchEnd', []); await wait(300); },
    drag: async (a, z, steps = 12) => { await touch('touchStart', [a]); await wait(40); for (let i = 1; i <= steps; i++) { await touch('touchMove', [[a[0] + (z[0] - a[0]) * i / steps, a[1] + (z[1] - a[1]) * i / steps]]); await wait(18); } await touch('touchEnd', []); await wait(300); },
    sel: s => p.evaluate(s => { const e = document.querySelector(s); if (!e || !e.offsetParent) return null; e.scrollIntoView({block: 'nearest', inline: 'nearest'}); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, s),
    scr: (t, f) => p.evaluate(([t, f]) => { const U = __spk.page.ui(), r = U.mn.getBoundingClientRect(); return [r.left + spk1X(U, t), r.top + spk1Y(U, f)]; }, [t, f]),
    view: (t0, t1, a, z) => p.evaluate(([t0, t1, a, z]) => { const U = __spk.page.ui(), v = U.v; v.pps = U.W / (t1 - t0); v.t0 = t0; v.rowH = U.H / (a - z); v.mTop = a; spk1Clamp(U); spk1Dirty(U, 'all'); }, [t0, t1, a, z]),
    ready: () => p.waitForFunction(() => { const i = __spk.page.info(); return i && !i.nodoc && i.chunks > 0 && !/Spektrum \d/.test(i.stat); }, null, {timeout: 600000}),
    shot: n => p.screenshot({path: path.join(fotos, n + '-' + W + 'x' + H + '.png')})};
  await p.goto(U0 + path.basename(f)); await p.waitForFunction(() => window.SYNQUENZER && window.__spk, null, {timeout: 120000}); await wait(700);
  await p.evaluate(() => { window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push({t: e.startTime, d: e.duration}); }).observe({entryTypes: ['longtask']}); } catch (e) {} });
  return T;
}
const mk16 = (T, name) => T.p.evaluate(async name => {   // 16 s: Töne 440 Hz bei 1/3/5/7 s, Snare 2/4/6/8/10/12 s, Rausch-Stöße 9/11/13 s
  await __spk.page.open({}); const sr = 44100, n = 16 * sr, x = new Float32Array(n); let s1 = 7; const rnd = () => ((s1 = (Math.imul(s1, 1103515245) + 12345) >>> 0) / 4294967296) * 2 - 1, TP = 2 * Math.PI;
  for (const t0 of [1, 3, 5, 7]) { const i0 = Math.round(t0 * sr); for (let i = 0; i < 0.5 * sr; i++) { const t = i / sr, e = Math.min(1, t / 0.03, (0.5 - t) / 0.05); let v = 0; for (let h = 1; h <= 5; h++) v += 0.2 / h * Math.sin(TP * 440 * h * t); x[i0 + i] += e * v; } }
  for (const t0 of [2, 4, 6, 8, 10, 12]) { const i0 = Math.round(t0 * sr); for (let i = 0; i < 0.2 * sr; i++) { const t = i / sr; x[i0 + i] += 0.35 * rnd() * Math.exp(-t / 0.045) + 0.3 * Math.sin(TP * 190 * t) * Math.exp(-t / 0.06); } }
  for (const t0 of [9, 11, 13]) { const i0 = Math.round(t0 * sr); for (let i = 0; i < 0.5 * sr; i++) x[i0 + i] += 0.2 * rnd() * Math.min(1, i / (0.2 * sr)); }
  for (let i = 0; i < n; i++) x[i] += 3e-4 * rnd();
  const r = await __spk.load({name, sr, ch: [x]}); await __spk.page.open({id: r.meta.id}); return r.meta.id;
}, name);
// ======== A. Layout: vorhandene Regler wie in der Basis, neue Knöpfe erreichbar (alle 3 Größen) ========
if (!ONLY || ONLY.includes('A')) for (const [W, H] of VIEWS) {
  const tag = W + 'x' + H, L = {};
  for (const f of [base, file]) {
    const T = await page(f, W, H), wh = f === base ? 'basis' : 'paket';
    await T.p.evaluate(async () => { await __spk.page.open({}); const sr = 44100, n = 4 * sr, x = new Float32Array(n); for (let i = 0; i < n; i++) x[i] = 0.2 * Math.sin(i * 0.06); const r = await __spk.load({name: 'L', sr, ch: [x]}); await __spk.page.open({id: r.meta.id}); });
    await T.p.waitForFunction(() => { const i = __spk.page.info(); return i && !i.nodoc && i.chunks > 0; }, null, {timeout: 120000}); await T.wait(400);
    L[wh] = {};
    for (const k of ['rect', 'zeit', 'freq', 'pinsel', 'harm', 'aehn']) L[wh][k] = await T.p.evaluate(k => { __spk.page.tool(k); const U = __spk.page.ui(); U.op.scrollLeft = 0;
      const own = e => e.closest('.spk12-c') || e.matches('.spk12-hd,.spk12-an,.spk12-dd') || e.closest('.spk1-o.on') && [...e.closest('.spk1-o.on').children].some(c => c.matches('.spk12-hd,.spk12-an')) && !e.closest('.spk1-o.on').querySelector('input[aria-label="Empfindlich"],input[aria-label="Obertöne"]');
      return [...U.op.querySelectorAll('.spk1-o.on > *')].filter(e => e.offsetParent && !own(e)).map(e => { const r = e.getBoundingClientRect(); return (e.textContent.trim().slice(0, 12) || e.tagName) + '@' + Math.round(r.left) + '-' + Math.round(r.right); }); }, k);
    // Ansicht ▾: Höhe des Klappfensters wie in der Basis, FFT-Text im Bild
    await T.p.evaluate(() => __spk.page.tool('rect')); await T.tap(await T.sel('#spk1Sheet .spk1-tl [data-a="view"]')); await T.wait(250);
    L[wh].ansicht = await T.p.evaluate(([W, H]) => { const d = document.querySelector('#spk1Sheet .spk1-dd'), f = d && d.querySelector('.spk12-fft'), r = d && d.getBoundingClientRect(), q = f && f.getBoundingClientRect(), h = f && f.closest('h5');
      return d ? {h: Math.round(r.height), sh: d.scrollHeight, fft: f ? {t: f.textContent, im: q.left >= 0 && q.right <= Math.min(W, r.right) + 0.5 && q.bottom <= H, h5: h ? Math.round(h.getBoundingClientRect().height) : null} : null} : null; }, [W, H]);
    if (wh === 'paket') await T.shot('t4-ansicht');
    await T.p.evaluate(() => spk1Dd(__spk.page.ui(), null)); await T.wait(150);
    if (wh === 'paket') {
      // neue Knöpfe: nach Wischen im Bild, ≥ 44 px; Auswahl ▾ bei Ähnliche sichtbar und bedienbar
      const nb = {};
      for (const k of ['rect', 'pinsel', 'harm', 'aehn', 'wand']) nb[k] = await T.p.evaluate(([k, W, H]) => { __spk.page.tool(k); const U = __spk.page.ui(); U.op.scrollLeft = 0;
        return [...U.op.querySelectorAll('.spk12-m,.spk12-dd,.spk12-hd,.spk12-an')].filter(e => e.offsetParent).map(e => { e.scrollIntoView({block: 'nearest', inline: 'nearest'}); const r = e.getBoundingClientRect(), af = getComputedStyle(e, '::after'), ex = af.content && af.content !== 'none' ? Math.max(0, -parseFloat(af.top) || 0) + Math.max(0, -parseFloat(af.bottom) || 0) : 0; return {t: e.textContent.trim(), w: Math.round(r.width), h: Math.round(r.height + ex), ok: r.left >= 0 && r.right <= W + 0.5 && r.top >= 0 && r.bottom <= H + 0.5}; }); }, [k, W, H]);
      ok(tag + ' neue-knoepfe-erreichbar', nb, Object.values(nb).every(a => a.length && a.every(x => x.ok && x.w >= 44 && x.h >= 44)) && nb.aehn.some(x => x.t === 'Auswahl ▾') && nb.rect.some(x => x.t === 'Auswahl ▾'));
      await T.p.evaluate(() => { __spk.page.tool('aehn'); });
      await T.tap(await T.sel('#spk1Sheet [data-a="s12dd"]')); await T.wait(200);
      const dd = await T.p.evaluate(() => [...document.querySelectorAll('#spk1Sheet .spk1-dd [data-s12a]')].map(e => e.dataset.s12a));
      await T.shot('t4-aehn-auswahl'); await T.p.evaluate(() => spk1Dd(__spk.page.ui(), null));
      ok(tag + ' aehnliche-auswahl-dd', dd, dd.includes('mer') && dd.includes('allL') && dd.includes('inv'));
      const ow = await T.p.evaluate(() => { const U = __spk.page.ui(); __spk.page.tool('rect'); U.op.scrollLeft = 0; return {sw: U.op.scrollWidth, cw: U.op.clientWidth}; });
      ok(tag + ' leiste-rechteck-breite', ow, ow.sw >= ow.cw);
      await T.shot('t4-leiste-rect');
      ok(tag + ' konsole', T.errs.slice(0, 3), T.errs.length === 0);
    }
    await T.ctx.close();
  }
  const an = {basis: L.basis.ansicht, paket: L.paket.ansicht}; delete L.basis.ansicht; delete L.paket.ansicht;
  ok(tag + ' ansicht-hoehe-wie-basis', an, an.basis && an.paket && an.paket.h === an.basis.h && an.paket.sh === an.basis.sh && an.paket.fft && an.paket.fft.im && an.paket.fft.t === ' · 93 ms / 10,8 Hz');
  const same = Object.keys(L.basis).every(k => JSON.stringify(L.basis[k]) === JSON.stringify(L.paket[k]));
  ok(tag + ' vorhandene-regler-wie-basis', {basis: L.basis, paket: same ? '= Basis' : L.paket}, same);
}
// ======== B. Funktionen (428×926): 1 Wieder-Öffnen, 2 ↶-Reihenfolge, b Merkmal-↶, a Transient ========
if (!ONLY || ONLY.includes('B')) {
  const T = await page(file, 428, 926), {p, wait} = T; await p.waitForFunction(() => window.__spk12, null, {timeout: 60000});
  const idA = await mk16(T, 'Pruef A'); await T.ready(); await wait(400); await T.view(0, 9, 110, 52);
  // ---- 2. ↶-Reihenfolge: In Ebene EA → Merken → In Ebene EB, dann ↶ ↶ ↶ ----
  const o4 = await p.evaluate(async () => {
    const U = __spk.page.ui(), S = __spk12.S(), L = () => U.meta.layers.map(l => l.name), R = () => (S.reg || []).length;
    let r = await __spk.mask({von: 'orig', nach: 'neu', name: 'EA', sel: [{art: 'rect', t0: 0.9, t1: 1.6, f0: 250, f1: 3500, kt: 0, kf: 0}]}); spk1Got(U, r);
    U.sel = [{art: 'rect', t0: 2.9, t1: 3.6, f0: 250, f1: 3500, kt: 0, kf: 0}]; S.prev = U.sel.slice(); __spk12.merk(); await new Promise(q => setTimeout(q, 300));
    r = await __spk.mask({von: 'orig', nach: 'neu', name: 'EB', sel: [{art: 'rect', t0: 4.9, t1: 5.6, f0: 250, f1: 3500, kt: 0, kf: 0}]}); spk1Got(U, r);
    return {ebenen: L(), regionen: R()};
  });
  const st = async () => { await wait(500); return p.evaluate(async () => ({ebenen: __spk.page.ui().meta.layers.map(l => l.name), regionen: (__spk12.S().reg || []).length, doc: (await __spk12.reg()).reg.length})); };
  await T.tap(await T.sel('#spk1Sheet [data-a="undo"]')); const u1 = await st();
  await T.tap(await T.sel('#spk1Sheet [data-a="undo"]')); const u2 = await st();
  await T.tap(await T.sel('#spk1Sheet [data-a="undo"]')); const u3 = await st();
  await T.tap(await T.sel('#spk1Sheet [data-a="redo"]')); const r1 = await st();
  await T.tap(await T.sel('#spk1Sheet [data-a="redo"]')); const r2 = await st();
  await T.tap(await T.sel('#spk1Sheet [data-a="redo"]')); const r3 = await st();
  ok('undo-reihenfolge-lifo', {start: o4, u1, u2, u3, r1, r2, r3},
    u1.ebenen.join() === 'EA' && u1.regionen === 1 && u2.ebenen.join() === 'EA' && u2.regionen === 0 && u2.doc === 0 && u3.ebenen.length === 0 &&
    r1.ebenen.join() === 'EA' && r1.regionen === 0 && r2.regionen === 1 && r2.doc === 1 && r2.ebenen.join() === 'EA' && r3.ebenen.join() === 'EA,EB' && r3.regionen === 1);
  await p.evaluate(async () => { const U = __spk.page.ui(); for (let i = 0; i < 4 && U.meta.layers.length; i++) { const r = await __spk.undo(); spk1Got(U, r); } const S = __spk12.S(); S.reg = []; S.u.length = 0; S.r.length = 0; await spk12RegPut(U); });
  // ---- b. Merkmal-Häkchen = ein ↶ (Touch) ----
  await T.tap(await T.sel('#spk1Sheet .spk1-tl button[data-tool="aehn"]'));
  await T.drag(await T.scr(1.0, 3500), await T.scr(1.5, 250), 10);
  await p.waitForFunction(() => { const U = __spk.page.ui(); return U.hits && U.sel.length > 1; }, null, {timeout: 30000}).catch(() => {});
  const n0 = await p.evaluate(() => ({n: __spk.page.ui().sel.length, h: JSON.stringify((__spk.page.ui().hits || []).map(h => [h.t0, h.wert]))}));
  await T.tap(await T.sel('#spk1Sheet [data-a="s12mk"]')); await T.tap(await T.sel('#spk1Sheet .spk1-dd [data-s12mk="rs"]')); await wait(1500);
  await p.evaluate(() => spk1Dd(__spk.page.ui(), null)); await wait(200);
  const n1 = await p.evaluate(() => ({n: __spk.page.ui().sel.length, und: __spk.page.ui().bU.disabled, lab: __spk.page.ui().bU.getAttribute('aria-label'), h: JSON.stringify((__spk.page.ui().hits || []).map(h => [h.t0, h.wert]))}));
  await T.tap(await T.sel('#spk1Sheet [data-a="undo"]')); await wait(300);
  const n2 = await p.evaluate(() => ({n: __spk.page.ui().sel.length, h: JSON.stringify((__spk.page.ui().hits || []).map(h => [h.t0, h.wert]))}));
  ok('merkmal-haekchen-ein-undo', {vorher: n0, rauschen: n1, undo: n2}, n0.n > 2 && n1.h !== n0.h && !n1.und && n2.n === n0.n && n2.h === n0.h);
  // ---- 3. Auswahl ▾ im Werkzeug Ähnliche: Treffer merken ohne Werkzeugwechsel ----
  await T.tap(await T.sel('#spk1Sheet [data-a="s12dd"]')); await T.tap(await T.sel('#spk1Sheet .spk1-dd [data-s12a="mer"]')); await wait(400);
  const m3 = await p.evaluate(async () => ({tool: __spk.page.ui().tool, reg: (__spk12.S().reg || []).length, doc: (await __spk12.reg()).reg.length, n: __spk.page.ui().sel.length}));
  ok('aehnliche-auswahl-merken', m3, m3.tool === 'aehn' && m3.reg === 1 && m3.doc === 1);
  await p.evaluate(async () => { const S = __spk12.S(); for (const k in S.mk) S.mk[k] = false; S.reg = []; await spk12RegPut(__spk.page.ui()); __spk.page.tool('rect'); });
  // ---- 1. „Alle Ebenen abtasten“ aus nach Schließen/Öffnen: aktueller Ebenen-Stand ----
  const zz = 'async t => { const q = await __spk12.zauber({t, f: 440, tol: 15, lim: 5}); return {cells: q.cells || 0, src: q.s12src || null}; }';
  const lid = await p.evaluate(async () => { const U = __spk.page.ui(); const r = await __spk.mask({von: 'orig', nach: 'neu', name: 'X', sel: [{art: 'rect', t0: 0.85, t1: 1.65, f0: 250, f1: 3500, kt: 0, kf: 0}]}); spk1Got(U, r); await __spk.save(); return U.meta.layers.find(l => l.name === 'X').id; });
  const reopen = async () => { await p.evaluate(() => __spk.page.close()); await wait(500); await p.evaluate(async id => { await spk1Call('close', {doc: id}); }, idA); await p.evaluate(id => __spk.page.open({id}), idA); await T.ready(); await wait(500); };
  await reopen();
  const o1 = await p.evaluate(async ([lid, zz]) => { const z = eval(zz), U = __spk.page.ui(), S = __spk12.S(); if (S.allL !== false) __spk12.allL(); U.act = lid; spk1Layers(U);
    const a1 = await z(1.25), a3 = await z(3.25); const h3a = (await spk1Call('harm', {doc: SPK1.doc, t: 3.25, f: 440})).spur.length;
    const r = await __spk.mask({von: 'orig', nach: lid, sel: [{art: 'rect', t0: 2.85, t1: 3.65, f0: 250, f1: 3500, kt: 0, kf: 0}]}); spk1Got(U, r);
    const b3 = await z(3.25); await __spk.save(); return {ver: U.meta.layers.map(l => l.id + ':' + l.ver).join(), a1, a3, h3a, b3}; }, [lid, zz]);
  await reopen();
  const o2 = await p.evaluate(async ([lid, zz]) => { const z = eval(zz), U = __spk.page.ui(), S = __spk12.S(); U.act = lid; spk1Layers(U);
    const c3 = await z(3.25), c1 = await z(1.25), h = await spk1Call('harm', {doc: SPK1.doc, t: 3.25, f: 440}); return {ver: U.meta.layers.map(l => l.id + ':' + l.ver).join(), allL: S.allL, c1, c3, harm3: h.spur.length}; }, [lid, zz]);
  ok('abtasten-aus-nach-wiederoeffnen-aktuell', {o1, o2}, o1.a1.cells > 50 && o1.a3.cells === 0 && o1.h3a === 0 && o1.b3.cells > 50 && o2.allL === false && o2.c3.cells > 50 && o2.c1.cells > 50 && o2.harm3 > 5);
  // Ebene mit Effekt (kein Masken-Weg → Ebenen-Signal im Fenster): Ergebnis und Stand stimmen ebenfalls
  const of = await p.evaluate(async ([lid, zz]) => { const z = eval(zz), U = __spk.page.ui(); const r = await __spk6.fx(lid, {lo: 2}); spk1Got(U, r);
    const a3 = await z(3.25), a1 = await z(1.25), a5 = await z(5.25); const r2 = await __spk6.fx(lid, {lo: 0}); spk1Got(U, r2); return {a1, a3, a5}; }, [lid, zz]);
  ok('abtasten-aus-ebene-mit-effekt', of, of.a3.cells > 50 && of.a1.cells > 50 && of.a5.cells === 0 && of.a3.src && of.a3.src.weg === 'signal');
  // ---- a. Transient in der Ebene: Maske nur im Anteil der Ebene (Band 250–3500 Hz) ----
  const oa = await p.evaluate(async lid => {
    const U = __spk.page.ui(); let r = await __spk.mask({von: 'orig', nach: lid, sel: [{art: 'rect', t0: 3.9, t1: 4.4, f0: 250, f1: 3500, kt: 0, kf: 0}]}); spk1Got(U, r);
    U.act = lid; spk1Layers(U); const tr = await __spk12.trans({t0: 3.8, t1: 4.2, hg: 120, del: 3, tap: 4.0});
    const sh = {art: 'trans', hits: tr.hits, hg: 120, len: 0.12, src: tr.s12src && tr.s12src.lid, t0: 3.9, t1: 4.2, f0: 120, f1: 22050, kt: 0, kf: 0, key: 'tA'}, sh0 = Object.assign({}, sh, {src: undefined, key: 'tB'});
    const sr = 44100, hop = 1024, m0 = Math.round(3.9 * sr / hop + 1), m1 = Math.round(4.2 * sr / hop + 1), kHi = Math.ceil(3600 * 4096 / sr), kLo = Math.floor(240 * 4096 / sr);
    const cnt = async s => { const q = await __spk12.mask([s], {m0, m1, k0: 1, k1: 2048, sm: 1, sk: 1}); const H = 2048, W = q.W || Math.floor((m1 - m0) + 1); let ein = 0, aus = 0; const d = q.data; for (let i = 0; i < W; i++) for (let j = 0; j < H; j++) { const k = 1 + j, v = d[i * H + j]; if (!v) continue; if (k >= kLo && k <= kHi) ein++; else aus++; } return {ein, aus}; };
    return {hits: tr.hits, src: tr.s12src, mitEbene: await cnt(sh), ausOriginal: await cnt(sh0)};
  }, lid);
  ok('transient-maske-in-der-ebene', oa, oa.hits.length >= 1 && oa.src && oa.mitEbene.ein > 20 && oa.mitEbene.aus === 0 && oa.ausOriginal.aus > 0);
  await p.evaluate(() => { const S = __spk12.S(); if (S.allL === false) __spk12.allL(); const U = __spk.page.ui(); U.act = 'orig'; spk1Layers(U); });
  ok('B konsole', T.errs.slice(0, 3), T.errs.length === 0);
  await T.ctx.close();
}
// ======== C. 3 min Audio, Abtasten aus: Zauberstab < 150 ms, Fortschritt bei Ähnliche, keine Long Task (926×370) ========
if (!ONLY || ONLY.includes('C')) {
  const T = await page(file, 926, 370), {p, wait} = T; await p.waitForFunction(() => window.__spk12, null, {timeout: 60000});
  await p.evaluate(async () => {
    await __spk.page.open({}); const sr = 44100, n = 180 * sr, x = new Float32Array(n); let s1 = 3; const rnd = () => ((s1 = (Math.imul(s1, 1103515245) + 12345) >>> 0) / 4294967296) * 2 - 1, TP = 2 * Math.PI;
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < n; i++) { const w = rnd(); b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.969 * b2 + w * 0.153852; b3 = 0.8665 * b3 + w * 0.3104856; b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898; x[i] = 0.01 * (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362); b6 = w * 0.115926; }
    for (let t0 = 5; t0 < 178; t0 += 10) { const i0 = Math.round(t0 * sr); for (let i = 0; i < 0.5 * sr; i++) { const t = i / sr, e = Math.min(1, t / 0.03, (0.5 - t) / 0.05); let v = 0; for (let h = 1; h <= 5; h++) v += 0.2 / h * Math.sin(TP * 440 * h * t); x[i0 + i] += e * v; } }
    for (let t0 = 2; t0 < 178; t0 += 7) { const i0 = Math.round(t0 * sr); for (let i = 0; i < 0.2 * sr; i++) { const t = i / sr; x[i0 + i] += 0.35 * rnd() * Math.exp(-t / 0.045); } }
    const r = await __spk.load({name: 'Pruef 3 min', sr, ch: [x]}); await __spk.page.open({id: r.meta.id});
  });
  await T.ready(); await wait(3000);
  const z = await p.evaluate(async () => {
    const U = __spk.page.ui(), r = await __spk.mask({von: 'orig', nach: 'neu', name: 'X', sel: [{art: 'rect', t0: 44.8, t1: 45.7, f0: 250, f1: 3500, kt: 0, kf: 0}, {art: 'rect', t0: 94.8, t1: 95.7, f0: 250, f1: 3500, kt: 0, kf: 0}]}); spk1Got(U, r);
    const q = async (t) => { const T0 = performance.now(), a = await __spk12.zauber({t, f: 440, tol: 15, lim: 5}); return {ms: Math.round(performance.now() - T0), cells: a.cells, load: a.msLoad != null ? Math.round(a.msLoad) : null, gain: a.msGain != null ? Math.round(a.msGain) : null, src: a.s12src || null}; };
    const o = {orig: await q(45.25)}; const S = __spk12.S(); if (S.allL !== false) __spk12.allL(); U.act = U.meta.layers.find(l => l.name === 'X').id; spk1Layers(U);
    window.__lt = []; o.ebene1 = await q(45.25); o.ebene2 = await q(95.25); o.ebeneLeer = await q(55.25); o.ebene3 = await q(45.25);
    const T3 = performance.now(), h = await spk1Call('harm', {doc: SPK1.doc, t: 45.25, f: 440}); o.harm = {ms: Math.round(performance.now() - T3), n: h.spur.length};
    const T4 = performance.now(), f = await __spk12.follow({t0: 44.9, t1: 45.6, f0: 400, f1: 480}); o.folgt = {ms: Math.round(performance.now() - T4), src: f.s12src};
    o.lt = window.__lt.map(e => Math.round(e.d)); return o;
  });
  ok('abtasten-aus-zauberstab-3min', z, z.ebene1.ms < 150 && z.ebene2.ms < 150 && z.ebene3.ms < 150 && z.ebene1.cells > 50 && z.ebene2.cells > 50 && z.ebeneLeer.cells === 0 && z.harm.n > 5 && z.lt.every(d => d <= 50));
  // Ähnliche (ganzes Stück) in der Ebene: Fortschritt in der Status-Zeile, Hauptfaden frei
  await T.view(40, 60, 110, 52);
  await T.tap(await T.sel('#spk1Sheet .spk1-tl button[data-tool="aehn"]'));
  await p.evaluate(() => { const U = __spk.page.ui(); window.__st = []; new MutationObserver(() => window.__st.push(U.st.textContent)).observe(U.st, {childList: true, characterData: true, subtree: true}); window.__lt = []; });
  const T0 = Date.now(); await T.drag(await T.scr(45.0, 3500), await T.scr(45.5, 250), 10);
  await p.waitForFunction(() => { const U = __spk.page.ui(); return U.hits; }, null, {timeout: 120000}).catch(() => {});
  const ae = await p.evaluate(() => ({hits: (__spk.page.ui().hits || []).filter(h => h.wert >= 0.62).length, st: window.__st.filter(s => /abtasten/.test(s)).slice(0, 3).concat(window.__st.filter(s => /abtasten/.test(s)).slice(-1)), lt: window.__lt.map(e => Math.round(e.d))}));
  ae.ms = Date.now() - T0;
  ok('abtasten-aus-aehnlich-fortschritt', ae, ae.st.length > 0 && ae.lt.every(d => d <= 50));
  await T.shot('t4-abtasten-3min');
  ok('C konsole', T.errs.slice(0, 3), T.errs.length === 0);
  await T.ctx.close();
}
await b.close(); srv.close();
console.log('\n' + nOk + ' OK / ' + nF + ' FEHLER');
fs.writeFileSync(path.join(here, 'spk12-test4' + (ONLY ? '-' + ONLY : '') + '.json'), JSON.stringify({nOk, nF, res}, null, 1));
