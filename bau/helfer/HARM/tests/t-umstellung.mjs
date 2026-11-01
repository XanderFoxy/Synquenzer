// HARM-T3: Umstellung alter Projekte genau EINMAL (Merker harmStd), eine später bewusst gewählte Einstellung bleibt;
// echter Weg: Projekt in 4.30.0 (R-4300) gesichert → HARM startet mit diesem Autosave → neu laden → noch einmal laden
import path from 'path';
import { chromium, mkCheck, APP, ROOT } from './lib.mjs';
const file = process.argv[2] || APP, OLD = path.join(ROOT, 'bau/snapshots/R-4300.html');
const {check, done} = mkCheck('HARM-T3 Umstellung');
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const ctx = await b.newContext({viewport: {width: 428, height: 926}}); const p = await ctx.newPage(); const errs = [];
p.on('pageerror', e => errs.push(String(e)));
const go = async f => { await p.goto('file://' + f); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.runtime, null, {timeout: 30000}); await p.waitForTimeout(900); };
const H = () => p.evaluate(() => Object.assign({}, window.SYNQUENZER.project().settings.harmony));
const toasts = () => p.evaluate(() => [...document.querySelectorAll('.toast, #toast, [class*=toast]')].map(x => x.textContent).join(' | '));
// 1) in 4.30.0: ein Projekt mit den alten Werten (Wechsel Sofort, Eine Skala aus) sichern
await go(OLD);
const st = await p.evaluate(async () => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setHarmony({change: 'now', oneScale: false});
  Q.setClip(0, 0, {len: 1, key: {root: 0, scale: 'ionian'}, notes: [{t: 0, d: .5, n: 60, v: .8}]}); const ok = await Q.save(); return {ok, mode: (Q.storage && Q.storage().mode) || null, id: Q.project().id, h: Q.project().settings.harmony}; });
check('4.30.0: altes Projekt (Sofort, Eine Skala aus, ohne Merker) gesichert', st.ok && st.h.change === 'now' && st.h.oneScale === false && st.h.harmStd === undefined, st);
// 2) HARM startet mit diesem Projekt: einmalige Umstellung
await go(file);
let h = await H(), info = await p.evaluate(() => window.SYNQUENZER.harmInfo()), id = await p.evaluate(() => window.SYNQUENZER.project().id);
check('HARM-Start: dasselbe Projekt ist offen', id === st.id, id);
check('HARM-Start: umgestellt auf Wechsel Takt, Eine Skala an, 100 %, Einrasten; Merker harmStd = 1', h.change === 'bar' && h.oneScale === true && h.osAmt === 1 && h.osPass === false && h.harmStd === 1, h);
check('HARM-Start: genau eine Umstellung gezählt (vorher: Sofort / aus)', info.migrated === 1 && info.last && info.last.was.change === 'now' && info.last.was.oneScale === false, info);
const bootToast = await p.evaluate(async () => { await new Promise(r => setTimeout(r, 2400)); return [...document.querySelectorAll('body *')].filter(x => x.children.length === 0 && x.tagName !== 'SCRIPT' && x.tagName !== 'STYLE' && x.offsetParent && /Harmonie-Standard/.test(x.textContent)).length; });
check('HARM-Start: Hinweis „Harmonie-Standard …“ erscheint einmal', bootToast >= 1, bootToast);
await p.evaluate(() => window.SYNQUENZER.save());
// 3) neu laden: der Merker ist gespeichert – keine zweite Umstellung
await go(file);
info = await p.evaluate(() => window.SYNQUENZER.harmInfo()); h = await H();
const toast2 = await p.evaluate(async () => { await new Promise(r => setTimeout(r, 2400)); return [...document.querySelectorAll('body *')].filter(x => x.children.length === 0 && x.tagName !== 'SCRIPT' && x.tagName !== 'STYLE' && x.offsetParent && /Harmonie-Standard/.test(x.textContent)).length; });
check('neu geladen: kein zweiter Hinweis', toast2 === 0, toast2);
check('neu geladen: keine zweite Umstellung, Werte bleiben', info.migrated === 0 && h.change === 'bar' && h.oneScale === true && h.harmStd === 1, {info, h});
// 4) bewusste Wahl: Sofort + Eine Skala aus + Stärke 60 % + Durchgangstöne erlauben → sichern → neu laden → bleibt
await p.evaluate(async () => { window.SYNQUENZER.setHarmony({change: 'now', oneScale: false, osAmt: .6, osPass: true}); await window.SYNQUENZER.save(); });
await go(file);
info = await p.evaluate(() => window.SYNQUENZER.harmInfo()); h = await H();
check('bewusste Wahl bleibt nach Neuladen (Sofort, aus, 60 %, Erlauben) – keine Umstellung', info.migrated === 0 && h.change === 'now' && h.oneScale === false && h.osAmt === .6 && h.osPass === true, {info, h});
// 5) Datei-Weg: alte Projektdatei (ohne Felder) importieren → umgestellt + Hinweis; dieselbe Datei mit Merker → nichts
const r = await p.evaluate(async () => { const Q = window.SYNQUENZER, o = {};
  const pj = Q.project(); const h = pj.settings.harmony; delete h.harmStd; delete h.oneScale; delete h.osAmt; delete h.osPass; h.change = 'now';
  const n0 = Q.harmInfo().migrated; Q.importJSON(JSON.stringify(pj)); o.a = Object.assign({}, Q.project().settings.harmony); o.n1 = Q.harmInfo().migrated - n0;
  await new Promise(r => setTimeout(r, 2600)); o.toast = [...document.querySelectorAll('body *')].filter(x => x.children.length === 0 && x.tagName !== 'SCRIPT' && x.tagName !== 'STYLE' && x.offsetParent && /Harmonie-Standard/.test(x.textContent)).length;
  Q.importJSON(JSON.stringify(Q.project())); o.n2 = Q.harmInfo().migrated - n0; o.b = Object.assign({}, Q.project().settings.harmony);
  // a file from a newer version (harmStd 2) is never moved back
  const pj3 = Q.project(); pj3.settings.harmony.harmStd = 2; pj3.settings.harmony.change = 'beat'; Q.importJSON(JSON.stringify(pj3)); o.c = Object.assign({}, Q.project().settings.harmony); o.n3 = Q.harmInfo().migrated - n0;
  return o; });
check('Datei ohne Felder: einmal umgestellt, Hinweis „Harmonie-Standard …“ erscheint', r.n1 === 1 && r.a.change === 'bar' && r.a.oneScale === true && r.toast >= 1, r);
check('dieselbe Datei mit Merker: keine zweite Umstellung', r.n2 === 1 && r.b.change === 'bar', r);
check('Merker einer neueren Fassung (2) bleibt, Werte unverändert', r.n3 === 1 && r.c.harmStd === 2 && r.c.change === 'beat', r.c);
// 6) Neu / Leer / Demo: Standard-Werte
const nn = await p.evaluate(() => { const Q = window.SYNQUENZER, o = {}; Q.newProject(); o.neu = Q.project().settings.harmony; Q.newProject({init: true}); o.init = Q.project().settings.harmony; Q.loadDemo(); o.demo = Q.project().settings.harmony; return o; });
check('Neu, Leer (Init), Demo: Wechsel Takt + Eine Skala an + 100 % + Einrasten + Drums bleiben', ['neu', 'init', 'demo'].every(k => nn[k].change === 'bar' && nn[k].oneScale && nn[k].osAmt === 1 && !nn[k].osPass && !nn[k].drums && nn[k].octaveMode === 'nearest'), nn);
// 7) Menü › Harmonie: Zeilen + Hilfetexte, Knöpfe ≥ 44 px
const m = await p.evaluate(async () => { const o = {}; if (typeof openMenu === 'function') openMenu(); await new Promise(r => setTimeout(r, 400));
  const help = [...document.querySelectorAll('.harm-help')]; o.help = help.map(x => x.textContent.slice(0, 40));
  const seg = [...document.querySelectorAll('button')].filter(x => x.offsetParent && /^(Sofort|Schlag|Takt|Einrasten|Erlauben)$/.test(x.textContent.trim()));
  o.btn = seg.map(x => [x.textContent.trim(), Math.round(x.getBoundingClientRect().height), Math.round(x.getBoundingClientRect().width)]);
  o.takt = seg.filter(x => x.textContent.trim() === 'Takt').map(x => x.classList.contains('on') || x.getAttribute('aria-pressed') === 'true' || x.classList.contains('sel'));
  return o; });
check('Menü › Harmonie: zwei Hilfetexte unter Wechsel / Durchgangstöne', m.help.length === 2, m.help);
check('Menü: Wechsel- und Durchgangstöne-Knöpfe ≥ 44 px hoch', m.btn.length >= 5 && m.btn.every(x => x[1] >= 44), m.btn);
check('Menü: „Takt“ ist gewählt', m.takt.length === 1 && m.takt[0] === true, m.takt);
check('keine Fehler auf der Seite', errs.length === 0, errs.slice(0, 3));
await b.close(); done();
