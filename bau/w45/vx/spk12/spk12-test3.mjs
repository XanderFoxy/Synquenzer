// SPK12 Teil 3 – Ähnliches mit Merkmalen (tonal/Transient/Rauschen/Pegel) + ‹ › Alle, Auswahl merken (Speichern/Laden/Export identisch),
// „Alle Ebenen abtasten“, FFT-Text ms / Hz. Touch über CDP, synthetische Signale, Messungen statt Bildvergleich. Aufruf: node spk12-test3.mjs <abs. index.html>
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
  const mark = n => p.evaluate(n => { (window.__ph = window.__ph || []).push([n, Math.round(performance.now())]); }, n);
  const shot = n => p.screenshot({path: path.join(fotos, n + '-' + tag + '.png')});
  const U_ = () => p.evaluate(() => { const U = __spk.page.ui(); return {tool: U.tool, n: U.sel.length, arts: U.sel.map(s => s.art + (s.op ? ':' + s.op : '')), stat: __spk.page.info().stat}; });
  const scr = (t, f) => p.evaluate(([t, f]) => { const U = __spk.page.ui(), r = U.mn.getBoundingClientRect(); return [r.left + spk1X(U, t), r.top + spk1Y(U, f)]; }, [t, f]);
  const view = (t0, t1, mTop, mBot) => p.evaluate(([t0, t1, a, z]) => { (window.__vj = window.__vj || []).push(performance.now()); const U = __spk.page.ui(), v = U.v; v.pps = U.W / (t1 - t0); v.t0 = t0; v.rowH = U.H / (a - z); v.mTop = a; spk1Clamp(U); spk1Dirty(U, 'all'); }, [t0, t1, mTop, mBot]);
  const tool = async (grp, k) => { await hold(await sel(`#spk1Sheet .spk1-tl button[data-s12slot="${grp}"]`), 700); const q = await sel(`#spk1Sheet .spk1-dd [data-s12t="${k}"]`); await tap(q); return p.evaluate(() => __spk.page.info().tool); };
  await p.goto(url); await p.waitForFunction(() => window.SYNQUENZER && window.__spk && window.__spk12, null, {timeout: 60000}); await wait(600);
  await p.evaluate(() => { window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push({t: e.startTime, d: e.duration}); }).observe({entryTypes: ['longtask']}); } catch (e) {} });
  // ---- Testsignal 24 s: Töne 440 Hz (5 Obertöne, Anstieg 150 ms) bei 1/3/5/7 s laut und 9/11 s −12 dB, Rausch-Stöße 300–3000 Hz (Anstieg 250 ms)
  //      bei 13…20,5 s, 8 Snare-Schläge bei 2/4/6/8/10/12/22/23 s, Grundrauschen −70 dB
  await p.evaluate(async () => {
    await __spk.page.open({}); const sr = 44100, n = 24 * sr, x = new Float32Array(n); let s1 = 11; const rnd = () => ((s1 = (s1 * 1103515245 + 12345) >>> 0) / 4294967296) * 2 - 1, TP = 2 * Math.PI;
    const env = (t, d, a) => t < 0 || t > d ? 0 : Math.min(0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, t / a)), Math.min(1, (d - t) / 0.05));
    window.__T = {ton: [1, 3, 5, 7, 9, 11], laut: [1, 3, 5, 7], rs: [13, 14.5, 16, 17.5, 19, 20.5], sn: [2, 4, 6, 8, 10, 12, 22, 23]};
    for (const t0 of __T.ton) { const g = t0 >= 9 ? 0.25 : 1, i0 = Math.round(t0 * sr); for (let i = 0; i < 0.5 * sr; i++) { const t = i / sr, e = env(t, 0.5, 0.15) * g; let v = 0; for (let h = 1; h <= 5; h++) v += 0.2 / h * Math.sin(TP * 440 * h * t); x[i0 + i] += e * v; } }
    const bn = new Float32Array(Math.round(0.5 * sr) + 10); let h1 = 0, h2 = 0, l1 = 0, l2 = 0, p1 = 0, p2 = 0; const ah = Math.exp(-TP * 300 / sr), al = 1 - Math.exp(-TP * 3000 / sr);
    for (const t0 of __T.rs) { const i0 = Math.round(t0 * sr); for (let i = 0; i < 0.5 * sr; i++) { const w = rnd(); h1 = ah * (h1 + w - p1); p1 = w; h2 = ah * (h2 + h1 - p2); p2 = h1; l1 += al * (h2 - l1); l2 += al * (l1 - l2); x[i0 + i] += env(i / sr, 0.5, 0.25) * 0.5 * l2; } }
    for (const t0 of __T.sn) { const i0 = Math.round(t0 * sr); for (let i = 0; i < 0.2 * sr; i++) { const t = i / sr; x[i0 + i] += 0.35 * rnd() * Math.exp(-t / 0.045) + 0.3 * Math.sin(TP * 190 * t) * Math.exp(-t / 0.06); } }
    for (let i = 0; i < n; i++) x[i] += 3e-4 * rnd();
    const r = await __spk.load({name: 'Werkzeugkasten Teil 3', sr, ch: [x]}); await __spk.page.open({id: r.meta.id});
  });
  await p.waitForFunction(() => { const i = __spk.page.info(); return i && !i.nodoc && i.chunks > 0 && !/Spektrum \d/.test(i.stat); }, null, {timeout: 300000}); await wait(500);
  await p.evaluate(() => { window.__lt0 = performance.now(); });
  const cls = (hits, ev, tol = 0.1) => { const T = {ton: [], rs: [], sn: [], sonst: []}; for (const h of hits) { const k = Object.keys(ev).find(k => ev[k].some(o => Math.abs(h.t0 - o) <= tol)); (T[k] || T.sonst).push(+h.t0.toFixed(2)); } return T; };
  const thr = 0.92 - 0.6 * 0.5, EV = await p.evaluate(() => ({ton: __T.ton, rs: __T.rs, sn: __T.sn}));
  // ---- 1. Kern: Merkmale (Abnahme selbst gesetzt: Beispiel + Merkmal → nur die gleiche Art) ----
  if (tag === '428x926') {
    const A = async (ex, mk) => (await p.evaluate(([ex, mk]) => __spk12.aehn({ex, mk}), [ex, mk]));
    const flt = r => r.hits.filter(h => h.wert >= thr);
    let r = await A({t0: 1.0, t1: 1.5, f0: 250, f1: 3500}, {ton: 1}), c = cls(flt(r), EV);
    ok('kern-tonal', {ton: c.ton, rs: c.rs, sn: c.sn, sonst: c.sonst, bsp: r.bsp, ms: r.ms}, [3, 5, 7, 9, 11].every(t => c.ton.some(h => Math.abs(h - t) <= 0.1)) && !c.rs.length && !c.sn.length && !c.sonst.length);
    r = await A({t0: 1.0, t1: 1.5, f0: 250, f1: 3500}, {ton: 1, pg: 1}); c = cls(flt(r), EV);
    ok('kern-tonal+pegel', {ton: c.ton, rs: c.rs, sn: c.sn, sonst: c.sonst}, [3, 5, 7].every(t => c.ton.some(h => Math.abs(h - t) <= 0.1)) && !c.ton.some(h => h > 8.5) && !c.rs.length && !c.sn.length);
    r = await A({t0: 13.0, t1: 13.5, f0: 250, f1: 3500}, {rs: 1}); c = cls(flt(r), EV);
    ok('kern-rauschen', {ton: c.ton, rs: c.rs, sn: c.sn, sonst: c.sonst, bsp: r.bsp}, c.rs.length >= 5 && !c.ton.length && !c.sn.length && !c.sonst.length);
    r = await A({t0: 2.0, t1: 2.15, f0: 250, f1: 3500}, {tr: 1}); c = cls(flt(r), EV, 0.06);
    ok('kern-transient', {ton: c.ton, rs: c.rs, sn: c.sn, sonst: c.sonst, bsp: r.bsp}, c.sn.length >= 7 && !c.ton.length && !c.rs.length && !c.sonst.length);
    const old = await p.evaluate(async () => { const U = __spk.page.ui(), S = __spk12.S(), ex = {t0: 1.0, t1: 1.5, f0: 250, f1: 3500}; const hook = spk12CallSrc('aehnlich', {doc: SPK1.doc, ex}); const a = await spk1Call('aehnlich', {doc: SPK1.doc, ex}); return {hook, n: a.hits.length, mk: Object.values(S.mk).some(Boolean)}; });
    ok('ohne-merkmal-alter-weg', old, old.hook === null && !old.mk && old.n >= 0);
  }
  // ---- 2. Bedienung: Ähnliche → Merkmale ▾ → Tonal, Beispiel ziehen, ‹ › Alle, ↶ ----
  await view(0, 12.5, 100, 52);
  await tap(await sel('#spk1Sheet .spk1-tl button[data-tool="aehn"]'));
  const lb = await box('#spk1Sheet .spk1-op .spk1-o.on [data-a="s12mk"], #spk1Sheet .spk1-op .spk1-o.on [data-a="s12ap"], #spk1Sheet .spk1-op .spk1-o.on [data-a="s12an"], #spk1Sheet .spk1-op .spk1-o.on [data-a="s12aa"]');
  ok(tag + ' aehnlich-knoepfe', lb.map(x => [x.t, x.w, x.h]), lb.length === 4 && inView(lb));
  await tap(await sel('#spk1Sheet [data-a="s12mk"]')); await wait(150);
  const mb = await box('#spk1Sheet .spk1-dd [data-s12mk]');
  ok(tag + ' merkmale-klappfenster', mb.map(x => [x.t, x.w, x.h]), mb.length === 4 && inView(mb));
  await tap(await sel('#spk1Sheet .spk1-dd [data-s12mk="ton"]')); await shot('t3-merkmale');
  await p.evaluate(() => spk1Dd(__spk.page.ui(), null));
  await drag(await scr(1.0, 3500), await scr(1.5, 250), 12);
  await p.waitForFunction(() => { const U = __spk.page.ui(); return U.hits && U.sel.length > 1; }, null, {timeout: 30000}).catch(() => {});
  const ui1 = await p.evaluate(() => { const U = __spk.page.ui(); return {mk: __spk12.S().mk, n: U.sel.length, t: U.sel.map(s => +s.t0.toFixed(2)), lab: U.hitLab.textContent}; });
  const c1 = cls(ui1.t.map(t => ({t0: t})), EV, 0.12);
  ok(tag + ' aehnlich-touch-tonal', {ton: c1.ton, rs: c1.rs, sn: c1.sn, sonst: c1.sonst, lab: ui1.lab}, ui1.mk.ton && c1.ton.length >= 6 && !c1.rs.length && !c1.sn.length && !c1.sonst.length);
  await shot('t3-aehnlich');
  const st = [];
  for (const a of ['s12an', 's12an', 's12ap']) { await tap(await sel('#spk1Sheet [data-a="' + a + '"]')); st.push(await p.evaluate(() => __spk.page.ui().sel.map(s => +s.t0.toFixed(2)))); }
  await tap(await sel('#spk1Sheet [data-a="s12aa"]')); const all = await p.evaluate(() => __spk.page.ui().sel.length);
  await tap(await sel('#spk1Sheet [data-a="undo"]')); const un = await p.evaluate(() => { const U = __spk.page.ui(); return {t: U.sel.map(s => +s.t0.toFixed(2)), hits: !!U.hits}; });
  await tap(await sel('#spk1Sheet [data-a="s12an"]')); const af = await p.evaluate(() => __spk.page.ui().sel.map(s => +s.t0.toFixed(2)));
  ok(tag + ' weiter-zurueck-alle-undo', {schritte: st, alle: all, nachUndo: un, danachWeiter: af}, st[0].length === 1 && Math.abs(st[0][0] - 3) <= 0.12 && Math.abs(st[1][0] - 5) <= 0.12 && Math.abs(st[2][0] - 3) <= 0.12 && all === ui1.n && un.t.length === 1 && Math.abs(un.t[0] - 3) <= 0.12 && un.hits && af.length === 1 && Math.abs(af[0] - 5) <= 0.12);
  await p.evaluate(() => { const S = __spk12.S(); for (const k in S.mk) S.mk[k] = false; });
  // ---- 3. Auswahl merken: Rechteck − Rechteck, Auswahl ▾ → Merken, andere Auswahl, Speichern/Schließen/Öffnen + Export/Import, Laden ----
  await p.evaluate(() => { const U = __spk.page.ui(); spk12Slot(U, 'rect'); spk1ToolSet(U, 'rect'); __spk12.mode('neu'); U.opt.kante = 0.3; });
  await drag(await scr(2.5, 3000), await scr(6.5, 300), 12); await p.evaluate(() => __spk12.mode('sub'));
  await drag(await scr(3.5, 1500), await scr(4.5, 600), 10); await p.evaluate(() => __spk12.mode('neu'));
  const s0 = await p.evaluate(() => JSON.stringify(__spk.page.ui().sel));
  await tap(await sel('#spk1Sheet [data-a="s12dd"]')); await wait(150);
  const mbt = await box('#spk1Sheet .spk1-dd [data-s12a="mer"], #spk1Sheet .spk1-dd [data-s12a="allL"]');
  ok(tag + ' merken-knopf', mbt.map(x => [x.t, x.w, x.h]), mbt.length === 2 && inView(mbt));
  await tap(await sel('#spk1Sheet .spk1-dd [data-s12a="mer"]')); await wait(300);
  const rg = await p.evaluate(async () => { const S = __spk12.S(); for (let i = 0; i < 40 && !(S.reg && S.reg.length); i++) await new Promise(r => setTimeout(r, 50)); const sel = __spk.page.ui().sel, sr = 44100, hop = 1024; const M = await __spk12.mask(sel, {m0: Math.round(2.3 * sr / hop), m1: Math.round(6.8 * sr / hop), k0: 0, k1: 400}); window.__M1 = Array.from(M.data); return {reg: S.reg, nM: M.data.length, nz: M.data.filter(v => v).length}; });
  ok(tag + ' gemerkt', {n: rg.reg && rg.reg.length, name: rg.reg && rg.reg[0] && rg.reg[0].name, nz: rg.nz}, rg.reg && rg.reg.length === 1 && /^Rechteck \d+$/.test(rg.reg[0].name) && JSON.stringify(rg.reg[0].sel) === s0 && rg.nz > 100);
  await drag(await scr(8.0, 2000), await scr(9.0, 1000), 8);
  const rt = await p.evaluate(async s0 => {
    const S = __spk12.S(), a = JSON.stringify(S.reg); await __spk.save(); await __spk.close(); const b = JSON.stringify((await __spk12.reg()).reg);
    const ex = await spk1Call('export', {id: SPK1.doc}); await spk1Call('import', ex); await spk1Call('close', {doc: SPK1.doc}); const c = JSON.stringify((await __spk12.reg()).reg);
    return {gleichSpeichern: a === b, gleichExport: a === c, bytes: a.length, selGleich: JSON.parse(a)[0] && JSON.stringify(JSON.parse(a)[0].sel) === s0};
  }, s0);
  ok(tag + ' speichern-laden-identisch', rt, rt.gleichSpeichern && rt.gleichExport && rt.selGleich);
  await p.evaluate(() => { __spk12.S().reg = null; });   // Liste aus dem Dokument neu holen (wie nach dem Öffnen)
  await tap(await sel('#spk1Sheet [data-a="s12dd"]')); await wait(400); await p.evaluate(() => spk1Dd(__spk.page.ui(), null)); await tap(await sel('#spk1Sheet [data-a="s12dd"]')); await wait(200);
  await shot('t3-merken');
  const rb = await box('#spk1Sheet .spk1-dd [data-s12r], #spk1Sheet .spk1-dd [data-s12rx]');
  ok(tag + ' region-zeile', rb.map(x => [x.t, x.w, x.h]), rb.length === 2 && inView(rb));
  await tap(await sel('#spk1Sheet .spk1-dd [data-s12r]'));
  const ld = await p.evaluate(async () => { const sel = __spk.page.ui().sel, sr = 44100, hop = 1024; const M = await __spk12.mask(sel, {m0: Math.round(2.3 * sr / hop), m1: Math.round(6.8 * sr / hop), k0: 0, k1: 400}); let bad = 0; for (let i = 0; i < M.data.length; i++) if (M.data[i] !== __M1[i]) bad++; return {sel: JSON.stringify(sel), bad, n: M.data.length}; });
  ok(tag + ' region-laden-bitgenau', {abweichend: ld.bad, zellen: ld.n}, ld.sel === s0 && ld.bad === 0);
  await tap(await sel('#spk1Sheet [data-a="undo"]')); const u1 = await p.evaluate(() => __spk.page.ui().sel.length);
  await p.evaluate(() => __spk12.merk()); const n2 = await p.evaluate(() => __spk12.S().reg.length);
  await tap(await sel('#spk1Sheet [data-a="undo"]')); await wait(200); const n3 = await p.evaluate(async () => { await new Promise(r => setTimeout(r, 200)); return {s: __spk12.S().reg.length, doc: (await __spk12.reg()).reg.length}; });
  await tap(await sel('#spk1Sheet [data-a="redo"]')); await wait(200); const n4 = await p.evaluate(() => __spk12.S().reg.length);
  ok(tag + ' merken-undo-redo', {ladenUndo: u1, merken: n2, undo: n3, redo: n4}, u1 === 1 && n2 === 2 && n3.s === 1 && n3.doc === 1 && n4 === 2);
  await p.evaluate(async () => { const S = __spk12.S(); S.reg = []; await spk12RegPut(__spk.page.ui()); });
  // ---- 4. Alle Ebenen abtasten: Ton bei 1 s in Ebene „X“ verschieben; Rest / X einzeln abtasten ----
  const ab = await p.evaluate(async () => {
    const U = __spk.page.ui(), r = await __spk.mask({von: 'orig', nach: 'neu', name: 'X', sel: [{art: 'rect', t0: 0.85, t1: 1.65, f0: 250, f1: 3500, kt: 0, kf: 0}]}); spk1Got(U, r);
    const X = U.meta.layers.find(l => l.name === 'X'), z = async (t) => { const q = await __spk12.zauber({t, f: 440, tol: 15, lim: 5}); return {cells: q.cells || 0, t0: q.t0 != null ? +q.t0.toFixed(2) : null, src: q.s12src || null}; };
    const o = {lid: X && X.id}; U.act = 'rest'; spk1Layers(U);
    o.allesRest1 = await z(1.25); return o;
  });
  await tap(await sel('#spk1Sheet [data-a="s12dd"]')); await wait(150); await tap(await sel('#spk1Sheet .spk1-dd [data-s12a="allL"]'));
  const ab2 = await p.evaluate(async lid => {
    const U = __spk.page.ui(), z = async (t) => { const q = await __spk12.zauber({t, f: 440, tol: 15, lim: 5}); return {cells: q.cells || 0, t0: q.t0 != null ? +q.t0.toFixed(2) : null, src: q.s12src || null}; };
    const o = {allL: __spk12.S().allL}; o.rest1 = await z(1.25); o.rest3 = await z(3.25); U.act = lid; spk1Layers(U); o.x1 = await z(1.25); o.x3 = await z(3.25);
    const a = await spk1Call('aehnlich', {doc: SPK1.doc, ex: {t0: 1.0, t1: 1.5, f0: 250, f1: 3500}}); o.aehnX = a.hits.filter(h => h.wert >= 0.62).length;
    const h = await spk1Call('harm', {doc: SPK1.doc, t: 3.25, f: 440}); o.harmX3 = h.spur.length; U.act = 'rest'; spk1Layers(U); const h2 = await spk1Call('harm', {doc: SPK1.doc, t: 3.25, f: 440}); o.harmRest3 = h2.spur.length;
    __spk12.allL(); o.allLwieder = __spk12.S().allL; U.act = lid; o.xAlle3 = await z(3.25); U.act = 'orig'; spk1Layers(U); return o;
  }, ab.lid);
  ok(tag + ' alle-ebenen-abtasten', Object.assign({}, ab, ab2), ab.allesRest1.cells > 50 && ab2.allL === false && ab2.rest1.cells < ab.allesRest1.cells * 0.05 && ab2.rest3.cells > 50 && ab2.x1.cells > 50 && ab2.x3.cells === 0 && ab2.aehnX === 0 && ab2.harmX3 === 0 && ab2.harmRest3 > 5 && ab2.allLwieder === true && ab2.xAlle3.cells > 50);
  await tap(await sel('#spk1Sheet [data-a="s12dd"]')); await wait(150); await shot('t3-abtasten'); await p.evaluate(() => spk1Dd(__spk.page.ui(), null));
  // ---- 5. FFT-Text am Regler ----
  await tap(await sel('#spk1Sheet [data-a="view"]')); await wait(150);
  const f1 = await p.evaluate(() => { const e = document.querySelector('#spk1Sheet .spk1-dd .spk12-fft'); return e && e.textContent; });
  const bq = await sel('#spk1Sheet .spk1-dd .spk1-n button:nth-child(4)'); await p.evaluate(() => { (window.__vj = window.__vj || []).push(performance.now()); }); await tap(bq); await wait(150);
  const f2 = await p.evaluate(() => { const e = document.querySelector('#spk1Sheet .spk1-dd .spk12-fft'); return e ? {t: e.textContent, N: __spk.page.ui().N, r: (r => [r.left, r.right, r.top, r.bottom])(e.getBoundingClientRect())} : null; });
  await shot('t3-fft');
  ok(tag + ' fft-text', {vorher: f1, nachher: f2}, f1 === '4096 Punkte: 93 ms / 10,8 Hz' && f2 && f2.N === 8192 && f2.t === '8192 Punkte: 186 ms / 5,4 Hz' && f2.r[0] >= 0 && f2.r[1] <= W && f2.r[3] <= H);
  await p.evaluate(() => { const U = __spk.page.ui(); spk1Dd(U, null); U.N = 4096; spk1SpecLoad(U); });
  await wait(600); const lts = await p.evaluate(() => window.__lt.filter(e => e.t >= window.__lt0 && e.d > 50 && !(window.__vj || []).some(v => e.t >= v - 5 && e.t <= v + 400)).map(e => Math.round(e.d))), ltv = await p.evaluate(() => window.__lt.filter(e => e.t >= window.__lt0 && e.d > 50).length);
  ok(tag + ' hauptfaden-ohne-long-task', {ueber50ms: lts, nachAnsichtSprungAusgenommen: ltv - lts.length}, lts.length === 0);
  ok(tag + ' konsole-ohne-fehler', errs.slice(0, 4), errs.length === 0);
  await ctx.close();
}
await b.close(); srv.close();
console.log('\n' + nOk + ' OK / ' + nF + ' FEHLER');
fs.writeFileSync(path.join(here, 'spk12-test3.json'), JSON.stringify({nOk, nF, res}, null, 1));
