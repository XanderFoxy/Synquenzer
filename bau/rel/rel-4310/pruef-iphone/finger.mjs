// Unabhängige Prüfung (nur lesen): Takes-Blatt mit dem Finger, wie Xander. Aufruf: node finger.mjs <app.html> W H
import {createRequire} from 'module'; const {chromium} = createRequire(import.meta.url)('playwright');
import fs from 'fs';
const APP = process.argv[2], W = +process.argv[3] || 428, H = +process.argv[4] || 926, T = W + 'x' + H;
const OUT = new URL('./bilder/', import.meta.url).pathname; fs.mkdirSync(OUT, {recursive: true});
const sleep = ms => new Promise(r => setTimeout(r, ms));
let nOk = 0, nBad = 0;
const ok = (c, m, info) => { if (c) nOk++; else nBad++; console.log((c ? 'ok   ' : 'FAIL ') + T + ' ' + m + (info !== undefined ? ' ' + JSON.stringify(info) : '')); };
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream']});
const ctx = await b.newContext({viewport: {width: W, height: H}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
const p = await ctx.newPage();
const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + APP); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version, null, {timeout: 30000}); await sleep(900);
await p.evaluate(async () => { closePop(); ensureAudio(); for (let k = 0; k < 50 && !(AU.ctx && AU.ctx.state === 'running'); k++) await new Promise(r => setTimeout(r, 100)); });
const cdp = await ctx.newCDPSession(p);
const tStart = (x, y) => cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y}]});
const tMove = (x, y) => cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x, y}]});
const tEnd = () => cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
async function drag(x0, y0, x1, y1, steps = 10, hold = 0) { await tStart(x0, y0); if (hold) await sleep(hold); for (let i = 1; i <= steps; i++) { await tMove(x0 + (x1 - x0) * i / steps, y0 + (y1 - y0) * i / steps); await sleep(16); } await tEnd(); }
async function tap(x, y) { await tStart(x, y); await sleep(40); await tEnd(); }
async function holdAt(x, y, ms) { await tStart(x, y); await sleep(ms); await tEnd(); }
const box = sel => p.evaluate(sel => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2, l: r.left, t: r.top, w: r.width, h: r.height, b: r.bottom, r: r.right}; }, sel);
const tapSel = async sel => { const r = await box(sel); if (!r) return false; await tap(r.x, r.y); return true; };
// der Punkt eines Knopfs, den der Finger wirklich trifft (oben auf, nicht unter dem Kopf)
const hitInfo = sel => p.evaluate(sel => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(), h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return {top: !!(h && (h === e || e.contains(h))), hit: h ? (h.className || h.tagName) + '' : null, r: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]}; }, sel);
const segs = () => p.evaluate(() => SYNQUENZER.g10cInfo().segs.map(s => ({take: s.take, no: s.no, name: s.name, tag: s.tag, fav: s.fav})));
const state = () => p.evaluate(() => { const q = UI.pop && UI.pop.el; return {name: UI.pop && UI.pop.name, st: q ? Math.round(q.scrollTop) : null, max: q ? q.scrollHeight - q.clientHeight : null, ed: G10C.ed, pv: G10C.pv ? G10C.pv.k : null, playing: R.playing, dock: !!PSH.dock}; });

// ---------- Aufbau: 7 Takes auf der STIMME-Spur, Szene 1 ----------
await p.evaluate(() => SYNQUENZER.setSong({bars: 8, lanes: []}));
const pcm = k => { const sr = 48000, n = 3 * sr, a = new Array(n).fill(0), t0 = .1 + (k % 5) * .4, t1 = t0 + .6; for (let i = Math.round(t0 * sr); i < Math.round(t1 * sr); i++) a[i] = Math.round(12000 * Math.sin(2 * Math.PI * 220 * i / sr)); return a; };
for (let k = 0; k < 7; k++) { await p.evaluate(a => SYNQUENZER.tkInject({pcm: a, scene: 0, len: 1}), pcm(k)); await sleep(5); }
await p.evaluate(() => { closePop(); UI.dirty.all = true; });
await sleep(400);
// ---------- Blatt öffnen wie Xander: STIMME-Clip halten → Clip-Blatt → ✎ Bearbeiten ----------
const st = await p.evaluate(() => SYNQUENZER.tkInfo().stimme);
const slotSel = `.slot[data-t="${st}"][data-s="0"]`;
await p.evaluate(sel => { const e = document.querySelector(sel); if (e) e.scrollIntoView({block: 'center', inline: 'center'}); }, slotSel); await sleep(200);
const sl = await box(slotSel);
let opened = 'api';
if (sl && sl.t >= 0 && sl.b <= H) {
  await holdAt(sl.x, sl.y, 650); await sleep(300);
  const cs = await p.evaluate(() => { const b = [...document.querySelectorAll('#clipSheet button, .sheet.open button')].find(x => /Bearbeiten/.test(x.textContent) && x.offsetParent); if (!b) return null; const r = b.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2, txt: b.textContent}; });
  await p.screenshot({path: OUT + T + '-0-clipblatt.png'});
  if (cs) { await tap(cs.x, cs.y); await sleep(500); opened = 'finger'; }
}
let s0 = await state();
if (s0.name !== 'takes') { await p.evaluate(() => SYNQUENZER.tkSheet({t: SYNQUENZER.tkInfo().stimme, s: 0})); await sleep(400); opened += '+api'; s0 = await state(); }
ok(s0.name === 'takes', 'Blatt offen über ' + opened, {sl, s0});
await p.evaluate(() => SYNQUENZER.g10cWaitPeaks()); await sleep(200);
await p.screenshot({path: OUT + T + '-1-offen.png'});

// ---------- 1 ✕: genau eins, sichtbar, ≥ 44, oben auf; Kopf-Knöpfe überlappen nicht, nichts abgeschnitten ----------
const g1 = await p.evaluate(() => {
  const q = UI.pop.el, vis = e => { const r = e.getBoundingClientRect(); return e.offsetParent && r.width > 0 && r.height > 0; };
  const allX = [...document.querySelectorAll('button')].filter(vis).filter(x => x.textContent.trim() === '✕' || x.textContent.trim() === '×').map(x => ({c: x.className, l: x.getAttribute('aria-label'), inPop: q.contains(x)}));
  const close = allX.filter(x => !/l.schen/i.test(x.l || ''));
  const x = q.querySelector('.psh-x').getBoundingClientRect(), hit = document.elementFromPoint(x.left + x.width / 2, x.top + x.height / 2);
  const hb = [...q.querySelectorAll('.psh-h button')].map(e => e.getBoundingClientRect());
  let ov = 0; for (let i = 0; i < hb.length; i++) for (let j = i + 1; j < hb.length; j++) { const a = hb[i], c = hb[j]; if (a.left < c.right - .5 && c.left < a.right - .5 && a.top < c.bottom - .5 && c.top < a.bottom - .5) ov++; }
  const tt = q.querySelector('.psh-t'), R = q.getBoundingClientRect();
  return {close, x: {w: x.width, h: x.height, inView: x.top >= 0 && x.bottom <= innerHeight && x.left >= 0 && x.right <= innerWidth, top: !!(hit && q.querySelector('.psh-x').contains(hit))}, ov, title: tt.textContent, titleW: Math.round(tt.getBoundingClientRect().width), titleCut: tt.scrollWidth > tt.clientWidth + 1,
    pop: {l: R.left, t: R.top, r: R.right, b: R.bottom, inView: R.left >= 0 && R.top >= 0 && R.right <= innerWidth + .5 && R.bottom <= innerHeight + .5}, hx: q.scrollWidth - q.clientWidth};
});
ok(g1.close.length === 1 && g1.close[0].inPop && /psh-x/.test(g1.close[0].c), 'genau ein ✕ zum Schließen', g1.close);
ok(g1.x.w >= 44 && g1.x.h >= 44 && g1.x.inView && g1.x.top, '✕ sichtbar, oben auf, ≥ 44 px', g1.x);
ok(g1.ov === 0, 'Kopf-Knöpfe überlappen nicht', g1.ov);
ok(!g1.titleCut && g1.titleW > 20, 'Titel nicht abgeschnitten', {t: g1.title, w: g1.titleW});
ok(g1.pop.inView && g1.hx <= 1, 'Blatt im Bild, kein waagrechter Überlauf', g1);
// alle sichtbaren Knöpfe im Blatt: ≥ 44, Text nicht abgeschnitten, nicht über den Blattrand, keine Überlappung untereinander
const scanAll = () => p.evaluate(() => {
  const q = UI.pop.el, R = q.getBoundingClientRect(), cw = q.clientWidth;
  const bs = [...q.querySelectorAll('button, input, .g10c-chip, .g10c-st, .g10c-sum, .g10c-meta, .g10c-nm, .tk-pick b')].filter(e => e.offsetParent && e.getBoundingClientRect().width > 0);
  const small = [], cut = [], out = [], ov = [];
  for (const e of bs) {
    const r = e.getBoundingClientRect(), nm = (e.className || e.tagName) + ':' + (e.textContent || e.value || '').trim().slice(0, 24);
    if ((e.tagName === 'BUTTON' || e.tagName === 'INPUT') && (r.width < 43.5 || r.height < 43.5)) small.push([nm, Math.round(r.width), Math.round(r.height)]);
    if (e.scrollWidth > e.clientWidth + 1 && !/g10c-nm|g10c-meta/.test(e.className)) cut.push([nm, e.scrollWidth, e.clientWidth]);
    if (r.right > R.left + q.clientLeft + cw + .5 || r.left < R.left - .5) out.push([nm, Math.round(r.left), Math.round(r.right), Math.round(R.left + cw)]);
  }
  const btn = bs.filter(e => e.tagName === 'BUTTON');
  for (let i = 0; i < btn.length; i++) for (let j = i + 1; j < btn.length; j++) {
    if (btn[i].contains(btn[j]) || btn[j].contains(btn[i])) continue;
    const a = btn[i].getBoundingClientRect(), c = btn[j].getBoundingClientRect();
    if (a.left < c.right - 1 && c.left < a.right - 1 && a.top < c.bottom - 1 && c.top < a.bottom - 1) ov.push([btn[i].className + ':' + btn[i].textContent.trim().slice(0, 14), btn[j].className + ':' + btn[j].textContent.trim().slice(0, 14)]);
  }
  return {n: bs.length, small, cut, out, ov};
});
const sc1 = await scanAll();
ok(!sc1.small.length, 'Knöpfe ≥ 44 px', sc1.small);
ok(!sc1.cut.length, 'nichts abgeschnitten (Text)', sc1.cut);
ok(!sc1.out.length, 'nichts über den Blattrand', sc1.out);
ok(!sc1.ov.length, 'keine überlappenden Knöpfe', sc1.ov);

// ---------- 2 Rollen mit dem Finger (auf Zeile, auf ▶, auf ✕ der Zeile): nichts ausgelöst ----------
const top0 = (await segs())[0].take, n0 = (await segs()).length;
for (const [lab, sel] of [['Zeile', '.tksheet .g10c-row[data-k="1"] .g10c-pick'], ['▶ der Zeile', '.tksheet .g10c-row[data-k="1"] .g10c-pv'], ['✕ der Zeile', '.tksheet .g10c-row[data-k="1"] .tk-del'], ['✎ der Zeile', '.tksheet .g10c-row[data-k="1"] .g10c-edb']]) {
  await p.evaluate(() => { UI.pop.el.scrollTop = 0; }); await sleep(120);
  const r = await box(sel); const s1 = await state();
  if (!r || s1.max < 30) { ok(true, 'Rollen auf ' + lab + ': passt ohne Rollen'); continue; }
  const y0 = Math.min(r.y, H - 20), y1 = Math.max(80, y0 - 200);
  await drag(r.x, y0, r.x + 3, y1, 12); await sleep(700);
  const s2 = await state(), sg = await segs();
  ok(s2.st > 20 && sg.length === n0 && sg[0].take === top0 && s2.ed === -1 && s2.pv === null && s2.name === 'takes', 'Rollen mit Finger auf ' + lab + ': rollt, nichts gelöscht/gewählt/geöffnet', {st: s2.st, n: sg.length, ed: s2.ed, pv: s2.pv});
}
const hd2 = await p.evaluate(() => { const q = UI.pop.el, a = q.querySelector('.psh-h').getBoundingClientRect(), r = q.getBoundingClientRect(), x = q.querySelector('.psh-x').getBoundingClientRect(); return {d: Math.round(a.top - r.top), xIn: x.top >= 0 && x.bottom <= innerHeight}; });
ok(Math.abs(hd2.d) <= 2 && hd2.xIn, 'Kopf bleibt beim Rollen oben, ✕ sichtbar', hd2);
await p.screenshot({path: OUT + T + '-2-gerollt.png'});
// ganz nach unten rollen (Finger, mehrmals) – unten erreichbar?
for (let i = 0; i < 8; i++) { const R = await box('.pop.tksheet'); await drag(R.l + 40, R.b - 30, R.l + 40, R.t + 90, 10); await sleep(250); }
const bot = await p.evaluate(() => { const q = UI.pop.el; return {st: Math.round(q.scrollTop), max: q.scrollHeight - q.clientHeight}; });
ok(bot.max - bot.st <= 2, 'mit dem Finger bis ganz unten', bot);
await p.screenshot({path: OUT + T + '-3-unten.png'});
const sc2 = await scanAll();
ok(!sc2.small.length && !sc2.cut.length && !sc2.out.length && !sc2.ov.length, 'unten: Ziele/Abschneiden/Rand/Überlappung', sc2);
await p.evaluate(() => { UI.pop.el.scrollTop = 0; }); await sleep(150);

// ---------- 3 Halten → Bearbeiten: Name tippen, Farbe, ★ ----------
await p.evaluate(() => UI.pop.el.querySelector('.g10c-row[data-k="2"]').scrollIntoView({block: 'nearest'})); await sleep(150);
let r3 = await box('.tksheet .g10c-row[data-k="2"] .g10c-pick');
await holdAt(r3.x, r3.y, 700); await sleep(250);
let s3 = await state();
ok(s3.ed === 2 && (await segs())[0].take === top0, 'Halten öffnet Bearbeiten, hörbarer Take bleibt', s3);
await p.evaluate(() => { const e = UI.pop.el.querySelector('.g10c-ed'); if (e) e.scrollIntoView({block: 'nearest'}); }); await sleep(150);
await p.screenshot({path: OUT + T + '-4-bearbeiten.png'});
const sc3 = await scanAll();
ok(!sc3.small.length && !sc3.cut.length && !sc3.out.length && !sc3.ov.length, 'Bearbeiten-Zeile: Ziele/Abschneiden/Rand/Überlappung', sc3);
const edw = await p.evaluate(() => { const e = UI.pop.el.querySelector('.g10c-ed'), g = e && e.querySelector('.g10c-sws'); return e ? {ed: [e.scrollWidth, e.clientWidth], sws: g ? [g.scrollWidth, g.clientWidth] : null, sw: [...e.querySelectorAll('.g10c-sw')].map(x => { const r = x.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.right)]; }), edR: Math.round(e.getBoundingClientRect().right), popR: Math.round(UI.pop.el.getBoundingClientRect().right)} : null; });
ok(edw && edw.sws[0] <= edw.sws[1] + 1 && edw.sw.every(z => z[1] <= edw.edR + .5), 'Farbfelder passen in die Bearbeiten-Zeile', edw);
// Name per Finger: Feld antippen, tippen, dann direkt eine Farbe antippen
await tapSel('.tksheet .g10c-name'); await sleep(150);
const foc = await p.evaluate(() => document.activeElement && document.activeElement.className);
await p.keyboard.type('Strophe gut', {delay: 20}); await sleep(100);
await tapSel('.tksheet .g10c-sw[data-v="1"]'); await sleep(250);
let sg3 = await segs();
ok(/g10c-name/.test(foc || '') && sg3[2].name === 'Strophe gut' && sg3[2].tag === 1, 'Name tippen → Farbe grün antippen: beides gespeichert', {foc, s: sg3[2]});
// Name ändern, dann direkt ★ Favorit (in der Bearbeiten-Zeile) antippen
await tapSel('.tksheet .g10c-name'); await sleep(150);
await p.keyboard.press('End'); await p.keyboard.type(' 2', {delay: 20}); await sleep(80);
await tapSel('.tksheet .g10c-fav2'); await sleep(300);
sg3 = await segs();
ok(sg3[2].fav === true && sg3[2].name === 'Strophe gut 2', 'Name ändern → ★ Favorit antippen: Name und ★ gespeichert', {s: sg3[2], val: await p.evaluate(() => (UI.pop.el.querySelector('.g10c-name') || {}).value)});
// Name ändern, dann direkt ★ der Zeile (Seiten-Knopf) antippen
await tapSel('.tksheet .g10c-name'); await sleep(150);
await p.keyboard.press('End'); await p.keyboard.type('x', {delay: 20}); await sleep(80);
await tapSel('.tksheet .g10c-row[data-k="2"] .g10c-fav'); await sleep(300);
sg3 = await segs();
ok(sg3[2].fav !== true && /x$/.test(sg3[2].name || ''), 'Name ändern → ★ der Zeile antippen: Name gespeichert, ★ aus', {s: sg3[2], val: await p.evaluate(() => (UI.pop.el.querySelector('.g10c-name') || {}).value)});
// Name ändern, dann ▶ Vorhören einer anderen Zeile
await tapSel('.tksheet .g10c-name'); await sleep(150);
await p.keyboard.press('End'); await p.keyboard.type('y', {delay: 20}); await sleep(80);
await tapSel('.tksheet .g10c-row[data-k="1"] .g10c-pv'); await sleep(500);
sg3 = await segs();
ok(/y$/.test(sg3[2].name || ''), 'Name ändern → ▶ einer anderen Zeile: Name gespeichert', {s: sg3[2], pv: (await state()).pv, val: await p.evaluate(() => (UI.pop.el.querySelector('.g10c-name') || {}).value)});
await p.evaluate(() => { g10cPvStop(); g10cRepaint(); }); await sleep(100);
// ★ wieder an (für spätere Schritte egal), Fertig
await tapSel('.tksheet button[data-a="g10c-edok"]'); await sleep(200);
s3 = await state();
ok(s3.ed === -1, 'Fertig schließt die Bearbeiten-Zeile', s3);

// ---------- 4 Wisch nach links löscht + Rückgängig (Finger auf dem Hinweis) ----------
await p.evaluate(() => UI.pop.el.querySelector('.g10c-row[data-k="3"]').scrollIntoView({block: 'nearest'})); await sleep(150);
const n4 = (await segs()).length, del = (await segs())[3];
const r4 = await box('.tksheet .g10c-row[data-k="3"] .g10c-pick');
await drag(r4.l + r4.w * .8, r4.y, r4.l + r4.w * .8 - 170, r4.y + 5, 14); await sleep(300);
const sg4 = await segs();
const tst = await p.evaluate(() => { const t = document.getElementById('toast'); if (!t || !t.classList.contains('show')) return null; const b = t.querySelector('button'), r = b && b.getBoundingClientRect(); const hit = r && document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return {txt: t.textContent, b: r ? [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] : null, top: !!(hit && b.contains(hit)), x: r ? r.left + r.width / 2 : 0, y: r ? r.top + r.height / 2 : 0}; });
ok(sg4.length === n4 - 1 && !sg4.some(s => s.take === del.take), 'Wisch nach links löscht', {n: sg4.length});
await p.screenshot({path: OUT + T + '-5-geloescht.png'});
ok(tst && /gelöscht/.test(tst.txt) && tst.top, 'Hinweis „… gelöscht“ mit Rückgängig, oben auf', tst);
if (tst) { await tap(tst.x, tst.y); await sleep(350); }
const sg4b = await segs();
ok(sg4b.length === n4 && sg4b.some(s => s.take === del.take) && (await state()).name === 'takes', 'Rückgängig per Finger holt ihn zurück, Blatt bleibt offen', {n: sg4b.length, st: await state()});

// ---------- 5 Ablegen → App bedienbar → Leiste antippen → gleicher Zustand ----------
await p.evaluate(() => UI.pop.el.querySelector('.g10c-row[data-k="4"]').scrollIntoView({block: 'nearest'})); await sleep(150);
await tapSel('.tksheet .g10c-row[data-k="4"] .g10c-edb'); await sleep(250);
await p.evaluate(() => { const q = UI.pop.el; q.scrollTop = Math.round((q.scrollHeight - q.clientHeight) * .5); }); await sleep(150);
const b5 = await state();
await tapSel('#popLayer .pop .psh-dk'); await sleep(400);
const d5 = await p.evaluate(() => { const q = document.querySelector('#pshDock .pop'); const r = q && q.getBoundingClientRect(); return {bar: !!q, h: r && Math.round(r.height), top: r && Math.round(r.top), bottom: r && Math.round(r.bottom), pop: !!UI.pop, layerOpen: EL.popLayer.classList.contains('open'), title: q && q.querySelector('.psh-t').textContent}; });
await p.screenshot({path: OUT + T + '-6-abgelegt.png'});
ok(d5.bar && d5.h <= 60 && d5.bottom <= H && !d5.pop && !d5.layerOpen, 'Ablegen: schmale Leiste unten', d5);
// App bedienbar: Tempo antippen (Pop), schließen; was verdeckt die Leiste?
const cov = await p.evaluate(() => { const q = document.querySelector('#pshDock .pop'), R = q.getBoundingClientRect(); return [...document.querySelectorAll('#app button, #app .slot')].filter(e => e.offsetParent && !q.contains(e)).map(e => { const r = e.getBoundingClientRect(); return {e, r}; }).filter(({r}) => r.width > 0 && r.bottom > R.top && r.top < R.bottom && r.right > R.left && r.left < R.right).map(({e, r}) => { const h = document.elementFromPoint(r.left + r.width / 2, Math.min(r.bottom - 2, r.top + r.height / 2)); return {id: e.id || e.className.slice(0, 30), txt: (e.getAttribute('aria-label') || e.textContent || '').trim().slice(0, 20), r: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], reachable: !!(h && (h === e || e.contains(h)))}; }); });
const unreach = cov.filter(c => !c.reachable);
console.log('info ' + T + ' von der Leiste verdeckte App-Knöpfe: ' + JSON.stringify(unreach));
const bpm = await p.evaluate(() => { const e = EL.bBpm; if (!e || !e.offsetParent) return null; const r = e.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; });
if (bpm) { await tap(bpm.x, bpm.y); await sleep(300); }
const app5 = await p.evaluate(() => ({pop: UI.pop && UI.pop.name, dock: !!document.querySelector('#pshDock .pop')}));
ok(!bpm || (app5.pop === 'bpm' && app5.dock), 'App bedienbar: Tempo-Fenster geht auf, Leiste bleibt', app5);
await p.evaluate(() => closePop()); await sleep(150);
const bt = await box('#pshDock .psh-t');
await tap(bt.l + 10, bt.y); await sleep(450);
const a5 = await state();
const a5b = await p.evaluate(() => ({edRow: !!(UI.pop && UI.pop.el.querySelector('.g10c-ed[data-k="4"]')), heads: UI.pop ? UI.pop.el.querySelectorAll('.psh-h').length : 0}));
ok(a5.name === 'takes' && Math.abs(a5.st - b5.st) <= 2 && a5.ed === 4 && a5b.edRow && a5b.heads === 1, 'Leiste antippen: gleicher Zustand (Scroll, Bearbeiten-Zeile)', {b5, a5, a5b});
await p.screenshot({path: OUT + T + '-7-zurueck.png'});
await tapSel('.tksheet button[data-a="g10c-edok"]'); await sleep(150);

// ---------- 6 Kopf-Transport ▶/■/⏮/Schleife ----------
await p.evaluate(() => { setUiPref('pshLoop', true); pshHeadSync(UI.pop.el); UI.pop.el.scrollTop = 0; }); await sleep(100);
const icon = () => p.evaluate(() => { const q = UI.pop.el.querySelector('.psh-pl'); return {ip: getComputedStyle(q.querySelector('.ip')).display, is: getComputedStyle(q.querySelector('.is')).display, lp: q.parentNode.querySelector('.psh-lp').getAttribute('aria-pressed')}; });
await tapSel('#popLayer .pop .psh-pl'); await sleep(500);
const t6a = await p.evaluate(() => ({playing: R.playing, slot: R.slot[SYNQUENZER.tkInfo().stimme], pop: UI.pop && UI.pop.name})); const i6a = await icon();
ok(t6a.playing && t6a.pop === 'takes' && i6a.is !== 'none' && i6a.ip === 'none', '▶ im Kopf spielt (Symbol ■), Blatt bleibt', {t6a, i6a});
await tapSel('#popLayer .pop .psh-lp'); await sleep(150);
const i6b = await icon();
ok(i6b.lp === 'false', 'Schleife antippen schaltet aus', i6b);
await tapSel('#popLayer .pop .psh-pl'); await sleep(400);
const t6c = await p.evaluate(() => R.playing); const i6c = await icon();
ok(!t6c && i6c.ip !== 'none', '■ im Kopf hält an (Symbol ▶)', {t6c, i6c});
await tapSel('#popLayer .pop .psh-b[data-psh="first"]'); await sleep(400);
const t6d = await p.evaluate(() => R.playing);
ok(t6d, '⏮ im Kopf startet von vorn', t6d);
// Schleife aus: Szene 1 Takt → nach einem Durchgang Stopp
const L6 = await p.evaluate(() => 60 / S.bpm * 4 * Math.max(1, S.tracks[SYNQUENZER.tkInfo().stimme].clips[0].len));
await sleep(Math.round(L6 * 1000) + 900);
const t6e = await p.evaluate(() => R.playing);
ok(!t6e, 'Schleife aus: Stopp nach einem Durchgang (' + L6.toFixed(2) + ' s)', t6e);
await tapSel('#popLayer .pop .psh-lp'); await sleep(150);
await p.evaluate(() => { if (R.playing) stop(); });

// ---------- 7 Vorhören ▶ einer Zeile ----------
await p.evaluate(() => UI.pop.el.querySelector('.g10c-row[data-k="2"]').scrollIntoView({block: 'nearest'})); await sleep(150);
const topB = (await segs())[0].take;
await tapSel('.tksheet .g10c-row[data-k="2"] .g10c-pv'); await sleep(700);
const v7 = await p.evaluate(() => { const ph = UI.pop.el.querySelector('.g10c-row[data-k="2"] .g10c-ph'), b = UI.pop.el.querySelector('.g10c-row[data-k="2"] .g10c-pv'); return {pv: G10C.pv ? {k: G10C.pv.k, s: !!G10C.pv.s} : null, ph: ph ? ph.style.transform : null, on: b.classList.contains('on'), lab: b.getAttribute('aria-label'), playing: R.playing}; });
await p.screenshot({path: OUT + T + '-8-vorhoeren.png'});
ok(v7.pv && v7.pv.k === 2 && v7.pv.s && v7.on && /translateX\((?!0(\.0)?px)/.test(v7.ph || '') && !v7.playing, 'Vorhören ▶: spielt, ■ sichtbar, Lauflinie läuft', v7);
await tapSel('.tksheet .g10c-row[data-k="2"] .g10c-pv'); await sleep(250);
const v7b = await p.evaluate(() => ({pv: G10C.pv, on: !!UI.pop.el.querySelector('.g10c-pv.on')}));
ok(v7b.pv === null && !v7b.on && (await segs())[0].take === topB, 'Vorhören ■ stoppt, hörbarer Take unverändert', v7b);
// Vorhören zu Ende laufen lassen: Knopf wieder ▶
await tapSel('.tksheet .g10c-row[data-k="2"] .g10c-pv'); await sleep(3600);
const v7c = await p.evaluate(() => ({pv: G10C.pv, on: !!UI.pop.el.querySelector('.g10c-pv.on')}));
ok(v7c.pv === null && !v7c.on, 'Vorhören endet von selbst, Knopf wieder ▶', v7c);

// ---------- 8 Wisch nach unten am Kopf ----------
const ht = await box('#popLayer .pop .psh-t');
await drag(ht.l + 10, ht.y, ht.l + 10, ht.y + 30, 8); await sleep(300);
const s8a = await state();
await drag(ht.l + 10, ht.y, ht.l + 10, ht.y + 150, 10); await sleep(350);
const s8b = await state();
ok(s8a.name === 'takes' && s8b.name == null, 'Wisch am Kopf: 30 px bleibt offen, 150 px schließt', {s8a: s8a.name, s8b: s8b.name});
await p.screenshot({path: OUT + T + '-9-zu.png'});
// danach: Grid bedienbar, kein Schild hängt
await sleep(300);
const after = await p.evaluate(() => ({layer: EL.popLayer.classList.contains('open'), dock: !!document.querySelector('#pshDock .pop')}));
ok(!after.layer && !after.dock, 'nach dem Schließen: keine Ebene bleibt', after);
ok(errs.length === 0, 'keine Konsolenfehler', errs.slice(0, 6));
console.log('SUMME ' + T + ': ok ' + nOk + ', FAIL ' + nBad);
await b.close();
