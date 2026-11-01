// G9B T2: Bedienung im Text-Modus – [Erkennen] sichtbar, Blatt mit Größe, [Laden und erkennen] (Tipp), Taste wird [Stopp], Haupt-Faden frei
// (lange Aufgaben), automatische Erkennung nach Aufnahme nur mit Modell im Cache (ohne Undo-Schritt), [Entfernen] gibt den Cache frei
import {launch, open, sleep, report, cdn, wavTake, DIR} from './h.mjs';
import path from 'path';
const ok = report(), br = await launch();
const {p, errs} = await open(br, {q: '?g9how=wasm&g9diag=1', route: c => cdn(c)});
await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); }); await sleep(300);
const tk = await wavTake(p, path.join(DIR, 'daten/en-flite.wav'), 0);
// Automatik ohne Modell: nichts lädt
const q0 = await p.evaluate(id => (g9Load(), g9AutoQueue(id)), tk.id);
ok(q0 === false, 'automatisch erkennen ohne Modell im Cache: kein Auftrag, kein Download');
await p.evaluate(r => SYNQUENZER.wpOpen(r), tk.ref); await sleep(200);
await p.evaluate(r => SYNQUENZER.g9Text(r, true), tk.ref); await sleep(300);
const rb = p.locator('#wpSheet .g9rec');
ok(await rb.isVisible(), '[Erkennen] im Text-Modus sichtbar');
await rb.tap(); await sleep(300);
const sheet = await p.evaluate(() => { const q = document.querySelector('.g9rs'); return q ? q.innerText : ''; });
ok(/≈ 9\d MB/.test(sheet) && /Laden und erkennen/.test(sheet), 'Blatt zeigt Größe vorher: ' + sheet.replace(/\s+/g, ' ').slice(0, 160));
await p.evaluate(() => { window.__lt = []; new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push(e.duration); }).observe({type: 'longtask', buffered: false}); });
await p.locator('.g9rs button[data-a="go"]').tap();
await p.waitForFunction(() => (SYNQUENZER.g9Asr().sm.got || 0) > 1e6, null, {timeout: 60000});
const t1 = await rb.textContent(), info1 = await p.evaluate(() => document.querySelector('#wpSheet').innerText.match(/Sprachmodell lädt[^\n]*/));
ok(t1 === 'Stopp' && info1, 'beim Laden: Taste [Stopp], Fortschritt „' + (info1 && info1[0]) + '“');
await p.waitForFunction(id => SYNQUENZER.g9Ly(id), tk.id, {timeout: 300000});
await sleep(300);
const ly = await p.evaluate(id => SYNQUENZER.g9Ly(id), tk.id), lt = await p.evaluate(() => window.__lt);
ok(ly && ly.s.length >= 10, 'per Tipp geladen + erkannt: ' + ly.s.map(s => s.x).join(' '));
ok((await rb.textContent()) === 'Erkennen', 'danach wieder [Erkennen]');
ok(Math.max(0, ...lt) <= 120, 'Haupt-Faden: längste Aufgabe ' + Math.round(Math.max(0, ...lt)) + ' ms während Laden + Erkennen (' + lt.length + ' lange Aufgaben; Modell im Worker)');
// Blatt „später“: Größe + [Entfernen] + Diagnose
await rb.tap(); await sleep(300);
const sh2 = await p.evaluate(() => { const q = document.querySelector('.g9rs'); return q ? q.innerText : ''; });
ok(/Sprachmodell auf diesem Gerät: 9\d MB/.test(sh2) && /Entfernen/.test(sh2) && /Lücken füllen/.test(sh2), 'Blatt später: ' + sh2.replace(/\s+/g, ' ').slice(0, 220));
await p.evaluate(() => closePop()); await p.evaluate(() => SYNQUENZER.g9Text(null, false)).catch(() => {}); await sleep(200);
// automatisch nach Aufnahme (Modell im Cache): Ergebnis ohne Undo-Schritt, src erkannt
await p.evaluate(() => { try { wpClose(); } catch (e) {} });
const tk2 = await wavTake(p, path.join(DIR, 'daten/en-flite.wav'), 1);
const u0 = await p.evaluate(() => SYNQUENZER.undoInfo().n);
const q1 = await p.evaluate(id => g9AutoQueue(id), tk2.id);
await p.waitForFunction(id => SYNQUENZER.g9Ly(id), tk2.id, {timeout: 120000});
const ly2 = await p.evaluate(id => SYNQUENZER.g9Ly(id), tk2.id);
ok(q1 && ly2.src === 'erkannt' && (await p.evaluate(() => SYNQUENZER.undoInfo().n)) === u0, 'automatisch erkannt (Modell im Cache), ohne eigenen Undo-Schritt: ' + ly2.s.length + ' Silben');
// [Entfernen]
const e0 = await p.evaluate(() => navigator.storage.estimate().then(e => e.usage));
await p.evaluate(() => SYNQUENZER.g9AsrRemove());
const e1 = await p.evaluate(() => navigator.storage.estimate().then(e => e.usage)), a = await p.evaluate(() => SYNQUENZER.g9Asr());
ok(a.sm.state === 'none' && !(await p.evaluate(() => caches.has('synq-g9-asr-v1'))) && e0 - e1 > 0.95 * 90e6, '[Entfernen]: Cache weg, Speicher −' + Math.round((e0 - e1) / 1048576) + ' MB');
ok(errs.length === 0, 'keine Konsolen-Fehler ' + errs.join('|'));
const f = ok.done(); await br.close(); process.exit(f ? 1 : 0);
