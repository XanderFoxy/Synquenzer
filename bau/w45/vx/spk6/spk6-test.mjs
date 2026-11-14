// SPK6 Abnahme (Teil 2, Playwright chromium, Touch): Ebenen-Menü ⋯ → Werkstatt (Kopieren, Noten bearbeiten, Chor erzeugen, Effekte),
// Modus „Noten bearbeiten“ (Tipp = wählen, Mehrfachauswahl, Ziehen = Tonhöhe/Zeit, ±12, Vorhören, A/B, Anwenden mit Fortschritt, ↶/↷),
// Chor-Blatt (Stimmen, Art, Breite, Streuung, Vorhören, A/B, neue Ebenen markiert + Blinken), Effekte, ZIP rund,
// hochkant 428×926 und quer 926×428, Messwerte (Tonhöhe in ct, Versatz, bitgleich), Kern-Messwerte aus Teil 1 erneut, Konsole ohne Fehler.
// Aufruf: node spk6-test.mjs <abs. index.html>   → spk6-test.json, Fotos fotos/spk6-1*.png
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { execFileSync } from 'node:child_process';
const file = path.resolve(process.argv[2] || 'index.html'), dir = path.dirname(file), here = path.dirname(new URL(import.meta.url).pathname), fotos = path.join(dir, 'fotos'); fs.mkdirSync(fotos, {recursive: true});
const srv = http.createServer((q, r) => { const p = path.join(dir, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': p.endsWith('.html') ? 'text/html' : 'application/octet-stream'}); fs.createReadStream(p).pipe(r); });
await new Promise(ok => srv.listen(0, ok));
const url = 'http://127.0.0.1:' + srv.address().port + '/' + path.basename(file), res = {}, errs = [], T0 = Date.now(); let fails = 0;
const ok = (k, v, cond) => { res[k] = {v, ok: !!cond}; if (!cond) fails++; console.log((cond ? 'OK     ' : 'FEHLER ') + k + ' ' + JSON.stringify(v)); };
const foto = (p, n) => p.screenshot({path: path.join(fotos, n)});
const b = await chromium.launch();
async function page(w, h) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 2}), p = await ctx.newPage();
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
  await p.goto(url); await p.waitForFunction(() => window.SYNQUENZER && window.__spk && window.__spk6, null, {timeout: 60000}); await p.waitForTimeout(800);
  const cdp = await ctx.newCDPSession(p);
  const tap = async q => { await p.touchscreen.tap(q[0], q[1]); await p.waitForTimeout(220); };
  const drag = async (x0, y0, x1, y1, n = 8) => {   // echter Touch-Zug (touchstart → moves → touchend)
    await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: x0, y: y0}]});
    for (let i = 1; i <= n; i++) { await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: x0 + (x1 - x0) * i / n, y: y0 + (y1 - y0) * i / n}]}); await p.waitForTimeout(16); }
    await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await p.waitForTimeout(220);
  };
  return {ctx, p, tap, drag};
}
const btn = (p, sel) => p.evaluate(s => { const e = [...document.querySelectorAll(s)].find(x => x.offsetParent); if (!e) return null; e.scrollIntoView({block: 'nearest', inline: 'nearest'}); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2, Math.round(r.width), Math.round(r.height)]; }, sel);
const idle = p => p.waitForFunction(() => { const U = __spk.page.ui(); return U && !U.busy; }, null, {timeout: 120000});
const stat = p => p.evaluate(() => __spk.page.info().stat);
const sizes = (p, sel) => p.evaluate(s => [...document.querySelectorAll(s)].filter(e => e.offsetParent).map(e => { const q = e.getBoundingClientRect(); return {t: (e.textContent || e.dataset.s6 || '').trim().slice(0, 16), w: Math.round(q.width), h: Math.round(q.height), inX: q.left >= -0.5 && q.right <= innerWidth + 0.5, inY: q.top >= -0.5 && q.bottom <= innerHeight + 0.5}; }), sel);
const klein = a => a.filter(x => x.w < 36 || x.h < 36).map(x => x.t + ' ' + x.w + '×' + x.h);
const rowInfo = p => p.evaluate(() => [...document.querySelectorAll('#spk1Sheet .spk1-lr[data-l]')].map(r => ({l: r.dataset.l, nm: (r.querySelector('.spk1-nm') || {}).textContent || '', tag: (r.querySelector('.spk6-tg') || {}).textContent || '', blink: /stepFl/.test(r.style.animation || '')})));
// Tonhöhe (Autokorrelation, parabolisch verfeinert) eines Ausschnitts – läuft in der Seite
const PITCH = `window.__p6 = (x, sr, f0, f1) => { const n = x.length, lo = Math.floor(sr / f1), hi = Math.ceil(sr / f0); let best = -1, bl = lo; const r = l => { let s = 0, e1 = 0, e2 = 0; for (let i = 0; i + l < n; i++) { s += x[i] * x[i + l]; e1 += x[i] * x[i]; e2 += x[i + l] * x[i + l]; } return s / Math.sqrt(e1 * e2 + 1e-20); };
  for (let l = lo; l <= hi; l++) { const v = r(l); if (v > best) { best = v; bl = l; } } const a = r(bl - 1), c = r(bl + 1), d = (a - c) / (2 * (a - 2 * best + c)); return sr / (bl + (isFinite(d) ? d : 0)); };
  window.__ct = (f, g) => 1200 * Math.log2(f / g);`;
const SRC = async () => {
  const sr = 48000, n = sr * 6, L = new Float32Array(n), N = [[1.0, 2.0, 220], [2.2, 3.2, 293.665], [3.4, 4.4, 246.942]], fo = f => 1 / (1 + ((f - 700) / 180) ** 2) + 0.7 / (1 + ((f - 1200) / 220) ** 2);
  for (const [a, b, f] of N) for (let i = Math.round(a * sr); i < Math.round(b * sr); i++) { const t = i / sr, e = Math.min(1, (t - a) / 0.02, (b - t) / 0.03); let v = 0; for (let h = 1; h <= 30 && h * f < 9000; h++) v += fo(h * f) * Math.sin(2 * Math.PI * h * f * t) / Math.sqrt(h); L[i] += 0.12 * e * v; }
  for (let i = 0; i < n; i++) L[i] += 0.2 * Math.sin(2 * Math.PI * 55 * i / sr);
  const r = await __spk.load({name: 'Werkstatt', sr, ch: [L, L.slice()]}); await __spk.page.open({id: r.meta.id});
  await __spk.mask({von: 'orig', nach: {art: 'gesang', name: 'Gesang'}, sel: {art: 'rect', t0: 0.8, t1: 4.7, f0: 150, f1: 9500}});
  const q = await spk1Call('noten', {doc: SPK1.doc, lid: 'L1'}); spk1Got(SPK1.ui, q); spk1TintLoad(SPK1.ui);
  return {id: r.meta.id, notes: (q.meta.teil2.notes.L1 || []).map(z => z.m)};
};

// ================= hochkant 428×926 =================
const {p, ctx, tap, drag} = await page(428, 926);
await p.addScriptTag({content: PITCH});
const st0 = await p.evaluate(SRC); await idle(p); ok('quelle-ebene-noten', st0, st0.notes.length === 3);
// ---- ⋯ → Werkstatt oben im Menü
let m = await btn(p, '#spk1Sheet .spk1-lr[data-l="L1"] [data-a="lmore"]'); await tap(m); await p.waitForTimeout(250);
let s = await sizes(p, '#spk1Sheet .spk1-dd [data-s6]'), first = await p.evaluate(() => (document.querySelector('#spk1Sheet .spk1-dd h5') || {}).textContent);
await foto(p, 'spk6-10-werkstatt-hochkant.png');
ok('menue-werkstatt', {erstes: first, knoepfe: s.map(x => x.t + ' ' + x.w + '×' + x.h), klein: klein(s)}, first === 'Werkstatt' && ['Kopieren', 'Noten bearbeiten', 'Chor erzeugen …', 'Effekte …', 'Oktave −', 'Oktave +'].every(t => s.some(x => x.t === t)) && !klein(s).length && s.every(x => x.inX));
// ---- Kopieren
m = await btn(p, '#spk1Sheet .spk1-dd [data-s6="dup"]'); await tap(m); await idle(p); await p.waitForTimeout(150);
let ri = await rowInfo(p), sx = await stat(p);
ok('kopieren-markiert-blinkt', {rows: ri.map(r => r.l + ':' + r.nm), stat: sx}, ri.some(r => r.l === 'L2' && /Gesang Kopie/.test(r.nm) && r.tag === 'Kopie' && r.blink) && /Echte Kopie/.test(sx));
await foto(p, 'spk6-11-kopie-blinkt.png');
const bg = await p.evaluate(async () => { const a = await __spk.render('L1'), c = await __spk.render('L2'); let d = 0; for (let k = 0; k < a.ch.length; k++) for (let i = 0; i < a.ch[k].length; i++) d = Math.max(d, Math.abs(a.ch[k][i] - c.ch[k][i])); return d; });
ok('kopie-bitgleich', {maxAbw: bg}, bg === 0);
// ---- Noten bearbeiten (Kopie L2)
m = await btn(p, '#spk1Sheet .spk1-lr[data-l="L2"] [data-a="lmore"]'); await tap(m); m = await btn(p, '#spk1Sheet .spk1-dd [data-s6="ed"]'); await tap(m); await idle(p); await p.waitForTimeout(250);
let ed = await p.evaluate(() => __spk6.ed()); s = await sizes(p, '#spk1Sheet .spk1-o.on [data-s6]');
await foto(p, 'spk6-12-noten-bearbeiten.png');
ok('modus-noten-bearbeiten', {ed, knoepfe: s.map(x => x.t + ' ' + x.w + '×' + x.h), klein: klein(s), stat: await stat(p)}, ed && ed.lid === 'L2' && ed.tool === 's6ed' && s.length === 11 && !klein(s));
const ids = await p.evaluate(() => { const N = SPK1.ui.meta.teil2.notes.L2; const f = m => N.find(q => q.m === m).id; return {a: f(57), d: f(62), h: f(59)}; });
// Tipp = wählen, Tipp auf zweite = Mehrfachauswahl, nochmal = abwählen
const box = id => p.evaluate(i => __spk6.edBox(i), id);
let bA = await box(ids.a), bD = await box(ids.d); await tap([bA.x, bA.y]); await tap([bD.x, bD.y]);
const sel2 = (await p.evaluate(() => __spk6.ed())).sel; await tap([bD.x, bD.y]); const sel1 = (await p.evaluate(() => __spk6.ed())).sel;
ok('tipp-waehlen-mehrfach', {nachZwei: sel2.length, nachAbwahl: sel1, boxA: bA}, sel2.length === 2 && sel1.length === 1 && sel1[0] === ids.a && bA.h >= 3);
// Ziehen: A3 3 Halbtöne hoch, 1/16 später
const geo = await p.evaluate(() => { const U = SPK1.ui; return {rowH: U.v.rowH, pps: U.v.pps, step: spk1Grid0(U).beat / 4}; });
await drag(bA.x, bA.y, bA.x + geo.step * geo.pps, bA.y - 3 * geo.rowH, 10);
ed = await p.evaluate(() => __spk6.ed()); await foto(p, 'spk6-13-note-gezogen.png');
const z0 = ed.mv.find(z => z.id === ids.a) || {};
ok('ziehen-tonhoehe-zeit', {mv: ed.mv, geo, stat: await stat(p)}, ed.mv.length === 1 && z0.dm === 3 && Math.abs(z0.dt - geo.step) < 1e-4);
// ±12-Knöpfe
m = await btn(p, '#spk1Sheet .spk1-o.on [data-s6="edM12"]'); await tap(m); const up12 = (await p.evaluate(() => __spk6.ed())).mv[0].dm;
m = await btn(p, '#spk1Sheet .spk1-o.on [data-s6="edM-12"]'); await tap(m); const dn12 = (await p.evaluate(() => __spk6.ed())).mv[0].dm;
ok('plus-minus-12', {nachPlus: up12, nachMinus: dn12}, up12 === 15 && dn12 === 3);
// Vorhören (Entwurf, noch nichts angewendet) + A/B
const verVor = await p.evaluate(() => SPK1.ui.meta.layers.find(l => l.id === 'L2').ver);
m = await btn(p, '#spk1Sheet .spk1-o.on [data-s6="edPv"]'); await tap(m);
await p.waitForFunction(() => SPK1.pl && SPK1.pl.s6, null, {timeout: 60000}); await p.waitForTimeout(300);
const pv = await p.evaluate(() => ({A: !!SPK1.pl.s6.A, B: !!SPK1.pl.s6.B, gB: SPK1.pl.s6.B.g.gain.value, pos: +spk1PlayPos().toFixed(2), stat: __spk.page.info().stat, a6: !!SPK1.ui.meta.layers.find(l => l.id === 'L2').a6, mv: __spk6.ed().mv.length}));
m = await btn(p, '#spk1Sheet .spk1-o.on [data-s6="edAB"]'); await tap(m); await p.waitForTimeout(60);
const ab = await p.evaluate(() => ({ab: SPK1.ui.s6ab, gA: SPK1.pl && SPK1.pl.s6 ? +SPK1.pl.s6.A.g.gain.value.toFixed(2) : null, txt: document.querySelector('#spk1Sheet .spk1-o.on [data-s6="edAB"]').textContent}));
await foto(p, 'spk6-14-vorhoeren-ab.png');
m = await btn(p, '#spk1Sheet .spk1-o.on [data-s6="edAB"]'); await tap(m);
ok('vorhoeren-a-b', {pv, ab}, pv.A && pv.B && pv.gB === 1 && pv.pos > 0.5 && /Vorhören/.test(pv.stat) && !pv.a6 && pv.mv === 1 && ab.ab === 'A' && /Original/.test(ab.txt));
// Vorhör-Messung (dieselbe Rechnung über die API): B = +3 Halbtöne / 1/16 später, A = Original
const pm = await p.evaluate(async ([id, step]) => {
  const r = await __spk6.plan('L2', [{id, dm: 3, dt: step}], 1, [0.6, 3.0]), sr = r.sr, cut = (s, t0, t1) => s.ch[0].subarray(Math.round(t0 * sr) - s.o, Math.round(t1 * sr) - s.o);
  const fB = __p6(cut(r.b, 1.25 + step, 1.75 + step), sr, 150, 400), fA = __p6(cut(r.a, 1.25, 1.75), sr, 150, 400);
  return {fB: +fB.toFixed(2), ctB: +__ct(fB, 261.626).toFixed(2), fA: +fA.toFixed(2), ctA: +__ct(fA, 220).toFixed(2), ver: SPK1.ui.meta.layers.find(l => l.id === 'L2').ver};
}, [ids.a, geo.step]);
ok('vorhoeren-messung', pm, Math.abs(pm.ctB) < 10 && Math.abs(pm.ctA) < 10);
await p.evaluate(() => { spk1Stop(); spk1BtnState(SPK1.ui); });
// Anwenden: Fortschritt sichtbar, ein ↶-Schritt, Ebene blinkt
await p.evaluate(() => { window.__st6 = []; const o = new MutationObserver(() => { const U = SPK1.ui; __st6.push(U.st.textContent + ' | ' + (U.s6go ? U.s6go.textContent : '')); }); o.observe(SPK1.ui.st, {childList: true, characterData: true, subtree: true}); o.observe(SPK1.ui.s6go, {childList: true, characterData: true, subtree: true}); window.__ob6 = o; });
m = await btn(p, '#spk1Sheet .spk1-o.on [data-s6="edGo"]'); const tg = Date.now(); await tap(m); await idle(p); await p.waitForTimeout(150);
const ap = await p.evaluate(() => { __ob6.disconnect(); const U = SPK1.ui, q = U.meta.teil2.notes.L2.find(z => z.o6 && z.o6.m === 57); return {prog: __st6.filter(x => /%/.test(x)).slice(0, 4), m: q && q.m, o6: q && q.o6.m, a: q && q.a, mv: __spk6.ed().mv.length, undo: SPK1.last.undo, stat: U.st.textContent}; });
ri = await rowInfo(p); await foto(p, 'spk6-15-angewendet.png');
ok('anwenden-fortschritt', {ms: Date.now() - tg, ...ap, rowL2: ri.find(r => r.l === 'L2')}, ap.prog.length >= 1 && ap.m === 60 && ap.o6 === 57 && Math.abs(ap.a - (1 + geo.step)) < 0.05 && ap.mv === 0 && ap.undo === 'Noten bearbeiten' && /neu gerechnet/.test(ap.stat) && ri.find(r => r.l === 'L2').blink && /neu/.test(ri.find(r => r.l === 'L2').tag));
// Messung nach Anwenden (Wiedergabe-Weg im Worker): Tonhöhe, Nachbarnote unverändert
const mm = await p.evaluate(async step => { const r = await __spk.render('L2'), sr = SPK1.ui.meta.sr, x = r.ch[0], cut = (t0, t1) => x.subarray(Math.round(t0 * sr), Math.round(t1 * sr));
  const f = __p6(cut(1.25 + step, 1.75 + step), sr, 150, 400), fd = __p6(cut(2.45, 2.95), sr, 150, 450);
  return {f: +f.toFixed(2), ct: +__ct(f, 261.626).toFixed(2), nachbar: +__ct(fd, 293.665).toFixed(2)}; }, geo.step);
ok('messung-nach-anwenden', mm, Math.abs(mm.ct) < 10 && Math.abs(mm.nachbar) < 10);
// ↶ / ↷ über die Kopf-Tasten (Touch)
m = await btn(p, '#spk1Sheet [data-a="undo"]'); await tap(m); await idle(p); const u1 = await p.evaluate(id => SPK1.ui.meta.teil2.notes.L2.find(z => z.id === id).m, ids.a);
m = await btn(p, '#spk1Sheet [data-a="redo"]'); await tap(m); await idle(p); const r1 = await p.evaluate(id => SPK1.ui.meta.teil2.notes.L2.find(z => z.id === id).m, ids.a);
ok('undo-redo-anwenden', {nachUndo: u1, nachRedo: r1}, u1 === 57 && r1 === 60);
// Rahmen ziehen auf leerer Fläche = Mehrfachauswahl, Fertig beendet den Modus
const fr = await p.evaluate(() => { const U = SPK1.ui, R = U.mn.getBoundingClientRect(), cx = v => Math.max(R.left + 2, Math.min(R.right - 2, v)), cy = v => Math.max(R.top + 2, Math.min(R.bottom - 2, v)); return {x0: cx(R.left + spk1X(U, 0.85)), x1: cx(R.left + spk1X(U, 4.5)), y0: cy(R.top + (U.v.mTop - 66) * U.v.rowH), y1: cy(R.top + (U.v.mTop - 55) * U.v.rowH)}; });
await drag(fr.x0, fr.y0, fr.x1, fr.y1, 8); const rs = (await p.evaluate(() => __spk6.ed())).sel.length;
m = await btn(p, '#spk1Sheet .spk1-o.on [data-s6="edEnd"]'); await tap(m); const fe = await p.evaluate(() => ({ed: __spk6.ed(), tool: SPK1.ui.tool}));
ok('rahmen-mehrfach-fertig', {rahmen: rs, fertig: fe}, rs === 3 && fe.ed === null && fe.tool !== 's6ed');
// ---- Chor erzeugen (aus L1): Blatt, Vorhören, A/B, neue Ebenen markiert
m = await btn(p, '#spk1Sheet .spk1-lr[data-l="L1"] [data-a="lmore"]'); await tap(m); m = await btn(p, '#spk1Sheet .spk1-dd [data-s6="chor"]'); await tap(m); await p.waitForTimeout(250);
for (const t of ['3 Stimmen', 'Terzen']) { const q = await p.evaluate(t => { const e = [...document.querySelectorAll('#spk1Sheet .spk1-dd button')].find(x => x.textContent.trim() === t); if (!e) return null; const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, t); if (q) await tap(q); }
await p.evaluate(() => { const e = document.querySelector('#spk1Sheet .spk1-dd input[data-s6="cbr"]'); e.value = 0.5; e.dispatchEvent(new Event('input')); });
s = await sizes(p, '#spk1Sheet .spk1-dd button,#spk1Sheet .spk1-dd input[type=range]'); const arts = await p.evaluate(() => [...document.querySelectorAll('#spk1Sheet .spk1-dd .seg button')].map(e => e.textContent.trim()));
await foto(p, 'spk6-16-chor-blatt.png');
ok('chor-blatt', {arts, n: s.length, klein: klein(s), st: await p.evaluate(() => SPK1.ui.s6c)}, ['Terzen', 'Quinten', 'Oktave', 'Unisono'].every(a => arts.includes(a)) && !klein(s) && s.length >= 15 && s.every(x => x.inX));
m = await btn(p, '#spk1Sheet .spk1-dd [data-s6="chorPv"]'); const tv = Date.now(); await tap(m);
await p.waitForFunction(() => SPK1.pl && SPK1.pl.s6, null, {timeout: 60000});
const cpv = await p.evaluate(() => ({A: !!SPK1.pl.s6.A, B: !!SPK1.pl.s6.B, stat: __spk.page.info().stat, layers: SPK1.ui.meta.layers.length}));
m = await btn(p, '#spk1Sheet .spk1-dd [data-s6="chorAB"]'); await tap(m); const cab = await p.evaluate(() => SPK1.ui.s6ab);
m = await btn(p, '#spk1Sheet .spk1-dd [data-s6="chorAB"]'); await tap(m);
ok('chor-vorhoeren-a-b', {ms: Date.now() - tv, ...cpv, ab: cab}, cpv.A && cpv.B && /3 Stimmen/.test(cpv.stat) && cpv.layers === 2 && cab === 'A');
m = await btn(p, '#spk1Sheet .spk1-dd [data-s6="chorGo"]'); const tc = Date.now(); await tap(m); await idle(p); await p.waitForTimeout(150);
ri = await rowInfo(p); const vs = await p.evaluate(() => SPK1.ui.meta.layers.filter(l => l.r6 === 'chor').map(l => ({id: l.id, nm: l.name, pan: l.fx && l.fx.pan, dt: l.a6.dt})));
await foto(p, 'spk6-17-chor-ebenen.png');
const chorRows = ri.filter(r => vs.some(v => v.id === r.l));
ok('chor-neue-ebenen-markiert', {ms: Date.now() - tc, vs, rows: chorRows, stat: await stat(p)}, vs.length === 3 && chorRows.every(r => r.tag === 'Chor' && r.blink) && Math.abs(vs[0].pan + 0.275) < 1e-3 && Math.abs(vs[1].pan - 0.275) < 1e-3 && vs[0].dt === 11);
// Chor-Messung: Terz ↑ über A3 (D-Dur → Cis4) + 6 ct Streuung, Versatz 11 ms
const cm = await p.evaluate(async lid => { const r = await __spk.render(lid), sr = SPK1.ui.meta.sr, x = r.ch[0].map((v, i) => v + (r.ch[1] ? r.ch[1][i] : 0)), f = __p6(x.subarray(Math.round(1.3 * sr), Math.round(1.8 * sr)), sr, 150, 450);
  return {f: +f.toFixed(2), abstandCt: +__ct(f, 277.183).toFixed(2), key: await __spk6.key('L1')}; }, vs[0].id);
ok('chor-messung-terz', cm, Math.abs(cm.abstandCt - 6) < 3);
// ---- Effekte (Kopie): Echo-Regler → Kennung FX
await p.evaluate(() => spk1Dd(SPK1.ui, null));
m = await btn(p, '#spk1Sheet .spk1-lr[data-l="L2"] [data-a="lmore"]'); await tap(m); m = await btn(p, '#spk1Sheet .spk1-dd [data-s6="fx"]'); await tap(m); await p.waitForTimeout(200);
s = await sizes(p, '#spk1Sheet .spk1-dd input[type=range]'); await foto(p, 'spk6-18-effekte.png');
await p.evaluate(() => { const e = document.querySelector('#spk1Sheet .spk1-dd input[data-s6="echo"]'); e.value = 0.4; e.dispatchEvent(new Event('input')); e.dispatchEvent(new Event('change')); }); await idle(p);
ri = await rowInfo(p); const fxv = await p.evaluate(() => SPK1.ui.meta.layers.find(l => l.id === 'L2').fx);
ok('effekte-blatt', {regler: s.length, klein: klein(s), fx: fxv, tag: ri.find(r => r.l === 'L2').tag}, s.length === 9 && !klein(s) && fxv && fxv.echo === 0.4 && /FX/.test(ri.find(r => r.l === 'L2').tag));
// ---- Abspielen (Worker): umgesetzte Ebene + Chor + Echo
const pl = await p.evaluate(async () => { __spk.play(0.9); await new Promise(z => setTimeout(z, 1300)); const s = __spk.state(), pos = __spk.pos(); __spk.stop(); return {playing: s.playing, pos: +(pos || 0).toFixed(2)}; });
ok('abspielen', pl, pl.playing && pl.pos > 1.2);
// ---- ZIP rund (Audio der bearbeiteten Ebene + Chorstimmen mit)
const zp = await p.evaluate(async () => {
  const id = SPK1.doc, before = await __spk.render(null), v0 = await __spk.render('L2');
  __spk.link(); const f = []; await spk1ZipAdd(f); const names = f.map(x => x.name.replace(/^spektral\/[a-z0-9]+\//, ''));
  spk1Close(); await __spk.remove(id); SPK1.doc = null; SPK1.last = null;
  const n = await spk1ZipRead(f.map(x => ({name: x.name, data: x.data}))); await __spk.open(id);
  const after = await __spk.render(null), v1 = await __spk.render('L2'); let d = 0, dv = 0;
  for (let c = 0; c < before.ch.length; c++) for (let i = 0; i < before.ch[c].length; i++) d = Math.max(d, Math.abs(before.ch[c][i] - after.ch[c][i]));
  for (let c = 0; c < v0.ch.length; c++) for (let i = 0; i < v0.ch[c].length; i++) dv = Math.max(dv, Math.abs(v0.ch[c][i] - v1.ch[c][i]));
  return {n, audio: names.filter(x => /^aA\d+\.bin$/.test(x)).length, maxAbwMix: d, maxAbwL2: dv};
});
ok('zip-rund', zp, zp.n === 1 && zp.audio >= 4 && zp.maxAbwMix === 0 && zp.maxAbwL2 === 0);
await ctx.close();

// ================= quer 926×428 =================
{
  const {p, ctx, tap, drag} = await page(926, 428); await p.addScriptTag({content: PITCH});
  await p.evaluate(async () => { const sr = 48000, n = sr * 3, L = new Float32Array(n); for (let i = sr; i < 2 * sr; i++) L[i] = 0.3 * Math.sin(2 * Math.PI * 220 * i / sr) * Math.min(1, (i - sr) / 960, (2 * sr - i) / 960); const r = await __spk.load({name: 'Quer', sr, ch: [L]}); await __spk.page.open({id: r.meta.id}); const q = await __spk.mask({von: 'orig', nach: {art: 'lead', name: 'Lead'}, sel: {art: 'rect', t0: 0.8, t1: 2.2, f0: 150, f1: 2000}}); spk1Got(SPK1.ui, q); });
  await idle(p); let m = await btn(p, '#spk1Sheet .spk1-lr[data-l="L1"] [data-a="lmore"]'); await tap(m); await p.waitForTimeout(250);
  let s = await sizes(p, '#spk1Sheet .spk1-dd [data-s6]'); await foto(p, 'spk6-19-werkstatt-quer.png');
  ok('quer-menue', {knoepfe: s.map(x => x.t + ' ' + x.w + '×' + x.h + (x.inY ? '' : ' (rollen)')), klein: klein(s)}, s.length >= 8 && !klein(s) && s.every(x => x.inX) && s.filter(x => /Kopieren|Noten bearbeiten|Chor|Effekte/.test(x.t)).every(x => x.inY));
  // Noten bearbeiten ohne Noten: findet sie zuerst selbst
  m = await btn(p, '#spk1Sheet .spk1-dd [data-s6="ed"]'); await tap(m); await p.waitForFunction(() => window.__spk6.ed(), null, {timeout: 60000}); await idle(p); await p.waitForTimeout(200);
  const e0 = await p.evaluate(() => ({ed: __spk6.ed(), n: (SPK1.ui.meta.teil2.notes.L1 || []).length}));
  s = await sizes(p, '#spk1Sheet .spk1-o.on [data-s6]');
  const reach = await p.evaluate(() => { const o = SPK1.ui.op; return {scrollW: o.scrollWidth, clientW: o.clientWidth, ox: getComputedStyle(o).overflowX}; });
  ok('quer-noten-bearbeiten', {e0, knoepfe: s.map(x => x.t + ' ' + x.w + '×' + x.h + (x.inX ? '' : ' (rollen)')), klein: klein(s), reach}, e0.ed && e0.n >= 1 && s.length === 11 && !klein(s) && (s.every(x => x.inX) || /auto|scroll/.test(reach.ox)));
  const q0 = await p.evaluate(() => SPK1.ui.meta.teil2.notes.L1[0]), bx = await p.evaluate(i => __spk6.edBox(i), q0.id), gq = await p.evaluate(() => SPK1.ui.v.rowH);
  await drag(bx.x, bx.y, bx.x, bx.y - 2 * gq, 8); const e1 = await p.evaluate(() => __spk6.ed()); await foto(p, 'spk6-20-noten-quer.png');
  m = await btn(p, '#spk1Sheet .spk1-o.on [data-s6="edGo"]'); await tap(m); await idle(p);
  const e2 = await p.evaluate(id => ({m: SPK1.ui.meta.teil2.notes.L1.find(z => z.id === id).m, stat: __spk.page.info().stat}), q0.id);
  const fq = await p.evaluate(async m => { const r = await __spk.render('L1'), sr = 48000; return +__ct(__p6(r.ch[0].subarray(Math.round(1.2 * sr), Math.round(1.8 * sr)), sr, 150, 450), 440 * Math.pow(2, (m - 69) / 12)).toFixed(2); }, q0.m + 2);
  ok('quer-ziehen-anwenden', {mv: e1.mv, nachher: e2, m0: q0.m, abwCt: fq}, e1.mv.length === 1 && e1.mv[0].dm === 2 && e2.m === q0.m + 2 && /neu gerechnet/.test(e2.stat) && Math.abs(fq) < 10);
  await ctx.close();
}
ok('keine-fehler', errs.slice(0, 5), errs.length === 0);
await b.close(); srv.close();
// ---- Kern-Messwerte aus Teil 1 erneut (Node, gleiche Datei)
let kern = null; try { execFileSync('node', [path.join(here, 'spk6-kern-test.mjs'), file], {stdio: 'pipe', timeout: 300000}); } catch (e) {}
try { const j = JSON.parse(fs.readFileSync(path.join(dir, 'spk6-kern-test.json'), 'utf8')); kern = {fails: j.fails, n: Object.keys(j.res || {}).length, ton: (j.res['note-plus-3'] || j.res['a3-plus-3'] || {}).v}; } catch (e) {}
ok('kern-messwerte-teil1', kern, kern && kern.fails === 0 && kern.n >= 20);
fs.writeFileSync(path.join(dir, 'spk6-test.json'), JSON.stringify({ms: Date.now() - T0, fails, res}, null, 1));
console.log(fails ? 'FEHLER: ' + fails : 'ALLES OK', Math.round((Date.now() - T0) / 1000) + ' s');
