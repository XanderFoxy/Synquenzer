// SPK6 Prüfung – Seiten-Test zu den Befunden 2, 7–15 (Playwright chromium, Touch, 428×926 und 926×428): Notenmodus nach Dokumentwechsel/Löschen,
// Regler/Kopieren während einer Rechnung (Warteschlange), Kennungen in der Ebenen-Zeile, Fein ±10 ct, Filter-Regler logarithmisch, Chor ohne Noten,
// Trefferfläche, Erfolgsmeldung bleibt stehen; 3-min-Lied: Anwenden während der Wiedergabe ohne Lücke, Speicher. Konsole ohne Fehler.
// Aufruf: node spk6-pruef-ui.mjs <abs. index.html> [TEIL=kurz,lang]   → spk6-pruef-ui.json, Fotos fotos/spk6-p*.png
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { execFileSync } from 'node:child_process';
const file = path.resolve(process.argv[2] || 'index.html'), dir = path.dirname(file), here = path.dirname(new URL(import.meta.url).pathname), fotos = path.join(dir, 'fotos'); fs.mkdirSync(fotos, {recursive: true});
const srv = http.createServer((q, r) => { const p = path.join(dir, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': p.endsWith('.html') ? 'text/html' : 'application/octet-stream'}); fs.createReadStream(p).pipe(r); });
await new Promise(ok => srv.listen(0, ok));
const TEIL = (process.env.TEIL || 'kurz,lang').split(',');
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

const box = (p, id) => p.evaluate(i => __spk6.edBox(i), id);
const tagFit = p => p.evaluate(() => [...document.querySelectorAll('#spk1Sheet .spk1-lr[data-l]')].map(r => { const nm = r.querySelector('.spk1-nm'), tg = r.querySelector('.spk6-tg'), s = r.querySelector('.spk1-s'); if (!tg) return null; const a = tg.getBoundingClientRect(), n = nm.getBoundingClientRect(), b = s.getBoundingClientRect(); return {l: r.dataset.l, tag: tg.textContent, rechtsVonS: Math.round(a.right - b.left), imName: a.right <= n.right + 0.5 && a.width > 0, hinweis: nm.title}; }).filter(Boolean));
const btnT = (p, sel, txt) => p.evaluate(([s, t]) => { const e = [...document.querySelectorAll(s)].find(x => x.offsetParent && x.textContent.trim() === t); if (!e) return null; e.scrollIntoView({block: 'nearest', inline: 'nearest'}); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, [sel, txt]);
const slide = async (P, sel, v) => { const g = await P.p.evaluate(([s, v]) => { const e = document.querySelector(s); e.scrollIntoView({block: 'nearest'}); const r = e.getBoundingClientRect(), mn = +e.min, mx = +e.max, th = 16, x = val => r.left + th / 2 + (r.width - th) * (val - mn) / (mx - mn); return {x0: x(+e.value), x1: x(v), y: r.top + r.height / 2}; }, [sel, v]); await P.drag(g.x0, g.y, g.x1, g.y, 8); };
const menu = async (P, lid, k) => { let m = await btn(P.p, '#spk1Sheet .spk1-lr[data-l="' + lid + '"] [data-a="lmore"]'); await P.tap(m); m = await btn(P.p, '#spk1Sheet .spk1-dd [data-s6="' + k + '"]'); await P.tap(m); };

if (TEIL.includes('kurz')) {
  const P = await page(428, 926), {p, ctx, tap, drag} = P; await p.addScriptTag({content: PITCH});
  await p.evaluate(SRC); await idle(p);
  await menu(P, 'L1', 'dup'); await idle(p);
  // ---- Befund 10: Fein (±10 ct je Tipp, Ziehen 10 ct je Zeile, bis ±50 ct) im Modus „Noten bearbeiten“
  await menu(P, 'L2', 'ed'); await idle(p); await p.waitForTimeout(250);
  const ids = await p.evaluate(() => { const N = SPK1.ui.meta.teil2.notes.L2; const f = m => N.find(q => q.m === m).id; return {a: f(57), d: f(62), h: f(59)}; });
  let m = await btn(p, '#spk1Sheet .spk1-o.on [data-s6="edFine"]'); await tap(m);
  const lab = await p.evaluate(() => [...document.querySelectorAll('#spk1Sheet .spk1-o.on [data-s6^="edM"]')].map(e => e.textContent));
  let bA = await box(p, ids.a); await tap([bA.x, bA.y]);
  m = await btn(p, '#spk1Sheet .spk1-o.on [data-s6="edM1"]'); await tap(m); await tap(m);
  bA = await box(p, ids.a); const rowH = await p.evaluate(() => SPK1.ui.v.rowH); await drag(bA.x, bA.y, bA.x, bA.y - 7 * rowH, 10);   // 7 Zeilen → höchstens +50 ct
  const ed = await p.evaluate(() => __spk6.ed()); await foto(p, 'spk6-p10-fein.png');
  m = await btn(p, '#spk1Sheet .spk1-o.on [data-s6="edGo"]'); await tap(m); await idle(p);
  // ---- Befund 15: Erfolgsmeldung bleibt stehen, auch wenn der Spektrum-Fortschritt kommt
  const s15 = await p.evaluate(() => new Promise(r => { const U = SPK1.ui, t0 = U.st.textContent; spk1Stat(U, 'Spektrum 4096 · 47 %'); setTimeout(() => r({vorher: t0, nachSpektrum: U.st.textContent}), 40); }));
  ok('b15-meldung-bleibt', s15, /neu gerechnet/.test(s15.vorher) && s15.nachSpektrum === s15.vorher);
  const f10 = await p.evaluate(async id => { const q = SPK1.ui.meta.teil2.notes.L2.find(z => z.id === id), r = await __spk.render('L2'), sr = 48000, f = __p6(r.ch[0].subarray(Math.round(1.25 * sr), Math.round(1.8 * sr)), sr, 150, 400); return {m: q.m, c6: q.c6, f: +f.toFixed(2), ct: +__ct(f, 220 * Math.pow(2, 0.7 / 12)).toFixed(2)}; }, ids.a);
  ok('b10-fein', {knoepfe: lab, entwurf: ed.mv, fein: ed.fine, nachher: f10}, lab.includes('+10 ct') && lab.includes('−10 ct') && ed.mv.length === 1 && Math.abs(ed.mv[0].dm - 0.7) < 1e-9 && Math.abs(f10.ct) < 3 && Math.abs(f10.m + (f10.c6 || 0) / 100 - 57.7) < 1e-9);   // 2 × +10 ct + Zug 7 Zeilen (je Zug höchstens ±50 ct)
  // ---- Befund 14: Trefferfläche ≥ 36 px – Tipp 14 px über die Mitte des Balkens trifft die Note
  m = await btn(p, '#spk1Sheet .spk1-o.on [data-s6="edFine"]'); await tap(m);
  await p.evaluate(() => { SPK1.ui.s6e.sel.clear(); });
  const bD = await box(p, ids.d); await tap([bD.x, bD.y - 14]); const s14 = await p.evaluate(() => __spk6.ed().sel);
  ok('b14-trefferflaeche', {balkenH: bD.h, tippAbstand: 14, gewaehlt: s14}, s14.length === 1 && s14[0] === ids.d);
  // ---- Befund 7b: Ebene löschen, während ihr Notenmodus offen ist → Modus endet, Rechteck-Zug wählt wieder aus
  m = await btn(p, '#spk1Sheet .spk1-lr[data-l="L2"] [data-a="lmore"]'); await tap(m);
  m = await btnT(p, '#spk1Sheet .spk1-dd button', 'Ebene löschen'); await tap(m); await p.waitForTimeout(300); m = await btnT(p, '#spk1Sheet .spk1-dd button', 'Wirklich löschen?'); await tap(m); await idle(p); await p.waitForTimeout(200);
  const g7 = await p.evaluate(() => ({ed: __spk6.ed(), tool: SPK1.ui.tool, stat: __spk.page.info().stat, lagen: SPK1.ui.meta.layers.map(l => l.id)}));
  const R = await p.evaluate(() => { const U = SPK1.ui, r = U.mn.getBoundingClientRect(); return {x0: r.left + spk1X(U, 1.1), x1: r.left + spk1X(U, 1.8), y0: r.top + r.height * 0.3, y1: r.top + r.height * 0.6}; });
  await drag(R.x0, R.y0, R.x1, R.y1, 8); const sel7 = await p.evaluate(() => __spk.page.info().sel);
  ok('b7-loeschen-beendet-modus', {...g7, rechteckAuswahl: sel7}, g7.ed === null && g7.tool === 'rect' && /beendet/.test(g7.stat) && !g7.lagen.includes('L2') && sel7 >= 1);
  await p.evaluate(() => { SPK1.ui.sel = []; SPK1.ui.selVer = (SPK1.ui.selVer || 0) + 1; spk1BtnState(SPK1.ui); spk1Dirty(SPK1.ui, 'ov'); });
  // ---- Befund 12: Chor auf einer Ebene ohne Noten → sucht die Noten selbst, keine Fehlermeldung
  await p.evaluate(async () => { const r = await __spk.mask({von: 'orig', nach: {art: 'lead', name: 'Lead'}, modus: 'kopieren', sel: {art: 'rect', t0: 2.1, t1: 3.3, f0: 150, f1: 9500}}); spk1Got(SPK1.ui, r); });
  const lead = await p.evaluate(() => SPK1.ui.meta.layers.find(l => l.name === 'Lead').id), n0 = await p.evaluate(id => (SPK1.ui.meta.teil2 && SPK1.ui.meta.teil2.notes[id] || []).length, lead);
  await menu(P, lead, 'chor'); await p.waitForTimeout(200);
  for (const t of ['2', 'Terzen']) { const q = await btnT(p, '#spk1Sheet .spk1-dd button', t); if (q) await tap(q); }
  m = await btn(p, '#spk1Sheet .spk1-dd [data-s6="chorGo"]'); await tap(m); await p.waitForTimeout(300); await idle(p); await p.waitForTimeout(200);
  const c12 = await p.evaluate(id => ({noten: (SPK1.ui.meta.teil2.notes[id] || []).length, stimmen: SPK1.ui.meta.layers.filter(l => l.r6 === 'chor' && l.q6 === id).map(l => l.name), stat: __spk.page.info().stat}), lead);
  ok('b12-chor-ohne-noten', {vorher: n0, ...c12, konsole: errs.slice(0, 3)}, n0 === 0 && c12.noten >= 1 && c12.stimmen.length === 2 && !errs.length);
  // ---- Befund 8: Regler und Kopieren während einer laufenden Rechnung → warten und werden danach ausgeführt
  await menu(P, 'L1', 'chor'); await p.waitForTimeout(200);
  for (const t of ['6', 'Satz']) { const q = await btnT(p, '#spk1Sheet .spk1-dd button', t); if (q) await tap(q); }
  m = await btn(p, '#spk1Sheet .spk1-dd [data-s6="chorGo"]'); await tap(m);
  await menu(P, lead, 'fx'); await p.waitForTimeout(100); const busy8 = await p.evaluate(() => SPK1.ui.busy);
  await slide(P, '#spk1Sheet .spk1-dd input[data-s6="hall"]', 0.5); const st8 = await stat(p), reg8 = await p.evaluate(() => +document.querySelector('#spk1Sheet .spk1-dd input[data-s6="hall"]').value);
  await menu(P, 'L1', 'dup'); const st8b = await stat(p);
  await idle(p); await p.waitForFunction(() => !SPK1.ui.busy && SPK1.ui.meta.layers.some(l => l.r6 === 'kopie'), null, {timeout: 120000}); await p.waitForTimeout(300); await idle(p);
  const e8 = await p.evaluate(id => ({hall: (SPK1.ui.meta.layers.find(l => l.id === id).fx || {}).hall, kopie: SPK1.ui.meta.layers.filter(l => l.r6 === 'kopie').map(l => l.name), chor: SPK1.ui.meta.layers.filter(l => l.r6 === 'chor' && l.q6 === 'L1').length, stat: __spk.page.info().stat}), lead);
  ok('b8-warten-statt-verwerfen', {busyBeimZiehen: busy8, regler: reg8, statusReger: st8, statusKopieren: st8b, nachher: e8}, busy8 && /wartet/.test(st8) && /wartet/.test(st8b) && Math.abs(e8.hall - reg8) < 1e-6 && e8.kopie.length === 1 && e8.chor === 6);
  // ---- Befund 9: Kennungen bleiben in der Namensspalte (nicht unter S), Stimmen unterscheidbar, Namen eindeutig
  await p.evaluate(async () => { const U = SPK1.ui, c = U.meta.layers.find(l => l.r6 === 'kopie').id, N = U.meta.teil2.notes[c], v = U.meta.layers.find(l => l.r6 === 'chor').id;
    let r = await __spk6.plan(c, [{id: N[0].id, dm: 1, dt: 0}]); r = await __spk6.fx(c, {hall: 0.4}); r = await __spk6.fx(v, {echo: 0.3}); spk1Got(U, r); });
  await p.evaluate(() => { SPK1.ui.ly.scrollTop = 0; }); const t9 = await tagFit(p); await foto(p, 'spk6-p09-kennung-hochkant.png');
  const nm9 = await p.evaluate(() => SPK1.ui.meta.layers.map(l => l.name)), chorTags = t9.filter(x => /Terz|Quint|Okt|Uni/.test(x.tag));
  await p.setViewportSize({width: 926, height: 428}); await p.waitForTimeout(500); await p.evaluate(() => spk1Layers(SPK1.ui)); const t9q = await tagFit(p); await foto(p, 'spk6-p09-kennung-quer.png');
  ok('b9-kennungen', {hochkant: t9.map(x => x.l + ' ' + x.tag + ' ' + x.rechtsVonS), quer: t9q.map(x => x.l + ' ' + x.rechtsVonS), namen: nm9, hinweis: t9[0] && t9[0].hinweis},
    t9.length >= 9 && t9.every(x => x.imName && x.rechtsVonS <= 0) && t9q.every(x => x.imName && x.rechtsVonS <= 0) && new Set(nm9).size === nm9.length && new Set(chorTags.filter(x => !/Uni/.test(x.tag)).map(x => x.tag.split(' · ')[0])).size >= 4 && t9.some(x => /^Kopie · FX · neu/.test(x.tag)));
  await p.setViewportSize({width: 428, height: 926}); await p.waitForTimeout(400);
  // ---- Befund 11: Tiefpass/Hochpass logarithmisch – ein Zug von „aus“ bis zur Mitte ≈ 2 kHz, der erste Schritt wirkt kaum
  await menu(P, 'L1', 'fx'); await p.waitForTimeout(200);
  const r11 = await p.evaluate(() => { const e = document.querySelector('#spk1Sheet .spk1-dd input[data-s6="lp"]'), h = document.querySelector('#spk1Sheet .spk1-dd input[data-s6="hp"]'); return {lpPos: +e.value, lpTxt: e.nextElementSibling.textContent, hpTxt: h.nextElementSibling.textContent, map: [0, 25, 50, 75, 99].map(v => __spk6.hz('lp', v)), hp: [1, 50, 100].map(v => __spk6.hz('hp', v)), schritt1: __spk6.hz('lp', 99)}; });
  await slide(P, '#spk1Sheet .spk1-dd input[data-s6="lp"]', 50); await idle(p); await p.waitForTimeout(200);
  const lp11 = await p.evaluate(() => (SPK1.ui.meta.layers.find(l => l.id === 'L1').fx || {}).lp);
  ok('b11-filter-log', {...r11, nachZugZurMitte: lp11}, r11.lpPos === 100 && r11.lpTxt === 'aus' && r11.hpTxt === 'aus' && r11.schritt1 > 15000 && lp11 >= 1400 && lp11 <= 2900 && Math.abs(r11.map[2] - 2000) < 1);
  await p.evaluate(() => spk1Dd(SPK1.ui, null));
  // ---- Befund 7a: Dokument wechseln, während der Notenmodus mit Entwurf offen ist → Modus endet, Auswahl geht wieder
  await menu(P, 'L1', 'ed'); await idle(p); await p.waitForTimeout(200);
  const q0 = await p.evaluate(() => SPK1.ui.meta.teil2.notes.L1[0].id), b0 = await box(p, q0), rh = await p.evaluate(() => SPK1.ui.v.rowH); await drag(b0.x, b0.y, b0.x, b0.y - 2 * rh, 8);
  const vor7 = await p.evaluate(() => __spk6.ed());
  await p.evaluate(async () => { const sr = 48000, L = new Float32Array(sr * 3); for (let i = 0; i < L.length; i++) L[i] = 0.2 * Math.sin(2 * Math.PI * 330 * i / sr); const r = await __spk.load({name: 'Zweites', sr, ch: [L]}); await __spk.page.open({id: r.meta.id}); });
  await idle(p); await p.waitForTimeout(400);
  const nach7 = await p.evaluate(() => ({ed: __spk6.ed(), tool: SPK1.ui.tool, s6e: !!SPK1.ui.s6e}));
  const R2 = await p.evaluate(() => { const U = SPK1.ui, r = U.mn.getBoundingClientRect(); return {x0: r.left + r.width * 0.3, x1: r.left + r.width * 0.6, y0: r.top + r.height * 0.3, y1: r.top + r.height * 0.6}; });
  await drag(R2.x0, R2.y0, R2.x1, R2.y1, 8); const sel7a = await p.evaluate(() => __spk.page.info().sel);
  ok('b7-dokumentwechsel-beendet-modus', {vorher: vor7 && vor7.mv, nachher: nach7, rechteckAuswahl: sel7a}, vor7 && vor7.mv.length === 1 && nach7.ed === null && !nach7.s6e && nach7.tool === 'rect' && sel7a >= 1);
  await ctx.close();
}

if (TEIL.includes('lang')) {
  // ---- 3-min-Lied (wie in der Prüfung): Anwenden während der Wiedergabe – keine Lücke; Speicher nach 12 Schritten
  const P = await page(428, 926), {p, ctx, tap} = P;
  const t0 = Date.now();
  const ld = await p.evaluate(async () => {
    const sr = 48000, n = sr * 180, L = new Float32Array(n), sc = [220, 246.942, 277.183, 293.665, 329.628, 369.994, 415.305, 440], fo = f => 1 / (1 + ((f - 700) / 180) ** 2) + 0.7 / (1 + ((f - 1200) / 220) ** 2);
    for (let t = 2, k = 0; t < 176; t += 0.5, k++) { const f = sc[(k * 3) % 8], a = Math.round(t * sr), b = Math.round((t + 0.42) * sr); for (let i = a; i < b; i++) { const tt = (i - a) / sr, e = Math.min(1, tt / 0.02, (b - i) / sr / 0.03); let v = 0; for (let h = 1; h <= 16 && h * f < 5000; h++) v += fo(h * f) * Math.sin(2 * Math.PI * h * f * tt) / Math.sqrt(h); L[i] += 0.12 * e * v; } }
    for (let i = 0; i < n; i++) L[i] += 0.15 * Math.sin(2 * Math.PI * 55 * i / sr);
    const r = await __spk.load({name: 'Lang', sr, ch: [L, L.slice()]}); await __spk.page.open({id: r.meta.id});
    const m = await __spk.mask({von: 'orig', nach: {art: 'gesang', name: 'Gesang'}, sel: {art: 'rect', t0: 1.8, t1: 176.3, f0: 150, f1: 9500}}); spk1Got(SPK1.ui, m);
    const q = await spk1Call('noten', {doc: SPK1.doc, lid: 'L1'}); spk1Got(SPK1.ui, q); spk1TintLoad(SPK1.ui); return (q.meta.teil2.notes.L1 || []).length; });
  await idle(p); console.log('lang geladen', Date.now() - t0, 'ms', ld, 'Noten');
  await menu(P, 'L1', 'ed'); await idle(p); await p.waitForTimeout(300);
  const runApply = async k => p.evaluate(async k => {
    const U = SPK1.ui, N = U.meta.teil2.notes.L1, q = N[60 + k * 9]; U.s6e.mv.set(q.id, {dm: 1, dt: 0}); spk6EdStat(U);
    __spk.play(q.a - 1.5); const tA = performance.now(); while (!(SPK1.pl && SPK1.pl.src.length) && performance.now() - tA < 20000) await new Promise(z => setTimeout(z, 10));
    await new Promise(z => setTimeout(z, 800)); const P0 = SPK1.pl; let leer = 0, maxLeer = 0, cur = 0, done = false; const t1 = performance.now();
    U.s6go.click(); const pr = (async () => { while (!U.busy && performance.now() - t1 < 500) await new Promise(z => setTimeout(z, 5)); while (U.busy) await new Promise(z => setTimeout(z, 10)); done = true; })();
    while (!done || performance.now() - t1 < 1500) { await new Promise(z => setTimeout(z, 20)); if (SPK1.pl === P0 && P0.src.length === 0) { cur += 20; leer += 20; maxLeer = Math.max(maxLeer, cur); } else cur = 0; if (performance.now() - t1 > 60000) break; }
    await pr; const ms = Math.round(performance.now() - t1), laeuft = SPK1.pl === P0; __spk.stop(); await new Promise(z => setTimeout(z, 200));
    return {ms, stilleMs: leer, laengsteStilleMs: maxLeer, wiedergabeLief: laeuft, stat: U.st.textContent, m: U.meta.teil2.notes.L1.find(z => z.id === q.id).m - q.m}; }, k);
  const a1 = await runApply(0), a2 = await runApply(1);
  ok('b2-anwenden-waehrend-wiedergabe', {erstes: a1, zweites: a2}, a1.laengsteStilleMs <= 60 && a2.laengsteStilleMs <= 60 && a1.wiedergabeLief && a2.wiedergabeLief && a2.ms < 1500 && a1.m === 1 && a2.m === 1);
  const mem = await p.evaluate(async () => { const N = SPK1.ui.meta.teil2.notes.L1, t = []; for (let k = 0; k < 12; k++) { const a = performance.now(); const r = await __spk6.plan('L1', [{id: N[120 + k * 7].id, dm: 1, dt: 0}]); spk1Got(SPK1.ui, r); t.push(Math.round(performance.now() - a)); } const m = await __spk6.mem(); return {ms: t, benutztMB: +(m.cur / 1e6).toFixed(1), nurUndoMB: +(m.undo / 1e6).toFixed(1), undo: m.undo6}; });
  ok('b1-b3-zwoelf-schritte', mem, mem.ms.every(v => v < 1500) && mem.nurUndoMB < 10);
  await ctx.close();
}
ok('keine-fehler', errs.slice(0, 5), errs.length === 0);
await b.close(); srv.close();
fs.writeFileSync(path.join(dir, 'spk6-pruef-ui.json'), JSON.stringify({ms: Date.now() - T0, fails, res}, null, 1));
console.log(fails ? 'FEHLER: ' + fails : 'ALLES OK', Math.round((Date.now() - T0) / 1000) + ' s');
