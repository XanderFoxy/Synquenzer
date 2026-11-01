// G9B T1: echter Modell-Download (Modell-Ablage), [Stopp] beim Laden, Weiterladen, Erkennen DE (fester Weg WASM), ein Undo, Cache nach Neuladen,
// offline zweite Erkennung, EN mit „Auto“, [Stopp] während der Erkennung
import {launch, open, sleep, report, cdn, wavTake, HITS, DIR} from './h.mjs';
import path from 'path'; import fs from 'fs';
const ok = report(), br = await launch(), R = {};
let off = false;
const {ctx, p, errs} = await open(br, {q: '?g9how=wasm', route: c => cdn(c, {get offline() { return off; }})});
await sleep(1500);
ok(HITS.length === 0, 'G9-23 kein Abruf von Modell/Bibliothek beim Start (' + HITS.length + ')');
await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); }); await sleep(300);
const tk = await wavTake(p, path.join(DIR, 'daten/de-flite.wav'), 0);
console.log('Marken', tk.marks.length, 'Länge', tk.len.toFixed(2), 's');
// 1) Laden starten, nach ≥ 5 MB [Stopp]
const tL = Date.now();
await p.evaluate(() => { window.__ld = SYNQUENZER.g9AsrLoad().then(() => 'ok', e => 'err:' + e.message); });
await p.waitForFunction(() => (SYNQUENZER.g9Asr().sm.got || 0) > 5e6, null, {timeout: 120000});
const s0 = Date.now(); await p.evaluate(() => SYNQUENZER.g9AsrStop());
const st = await p.evaluate(() => window.__ld), a1 = await p.evaluate(() => SYNQUENZER.g9Asr());
ok(/gestoppt/.test(st) && !a1.worker && a1.sm.state === 'none', 'Stopp beim Laden: Worker beendet, Zustand none (' + st + ', ' + (Date.now() - s0) + ' ms)');
// 2) weiterladen + erkennen (Undo zählt)
const u0 = await p.evaluate(() => SYNQUENZER.undoInfo().n);
const t0 = Date.now();
const res = await p.evaluate(r => SYNQUENZER.g9Recognize(r, {lang: 'de', mode: 'all'}), tk.ref);
R.first = Date.now() - t0;
const a2 = await p.evaluate(() => SYNQUENZER.g9Asr());
console.log('Text:', a2.last && a2.last.text, '| Wörter', res && res.words && res.words.map(w => w.w || w.text).join(' '));
console.log('diag', a2.diag.join(' | '), '| initMs', a2.sm.initMs, '| Laden+Erkennen gesamt', R.first, 'ms');
ok(res && res.words && res.words.length >= 6, 'Erkennen DE: ' + (res && res.words ? res.words.length : 0) + ' Wörter');
const ly = await p.evaluate(id => SYNQUENZER.g9Ly(id), tk.id);
ok(ly && ly.s && ly.s.length >= 6 && ly.src === 'erkannt', 'Silben verteilt (' + (ly && ly.s ? ly.s.length : 0) + ', src ' + (ly && ly.src) + '): ' + (ly && ly.s ? ly.s.map(s => s.x).join(' ') : '') + ' · Marken ' + tk.marks.length);
ok((await p.evaluate(() => SYNQUENZER.undoInfo().n)) === u0 + 1, 'genau ein Undo-Schritt');
await p.evaluate(() => SYNQUENZER.undo());
ok(!(await p.evaluate(id => SYNQUENZER.g9Ly(id), tk.id)), 'Undo nimmt den erkannten Text zurück');
ok(a2.net.every(n => n.method === 'GET') && a2.net.every(n => /^https:\/\/(cdn\.jsdelivr\.net|huggingface\.co)\//.test(n.url)), 'G9-25 nur GET der Liste (' + a2.net.length + ' Abrufe)');
R.mb = a2.sm.bytes / 1048576;
// 3) Neuladen: Cache bleibt, offline zweite Erkennung
off = true; HITS.length = 0;
await p.reload(); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version); await sleep(800);
const a3 = await p.evaluate(async () => { const a = SYNQUENZER.g9Asr(); await new Promise(r => setTimeout(r, 600)); return SYNQUENZER.g9Asr(); });
ok(a3.sm.state === 'cached' && a3.sm.bytes > 90e6, 'nach Neuladen: Modell im Cache (' + Math.round(a3.sm.bytes / 1048576) + ' MB, ' + a3.sm.state + ')');
await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); }); await sleep(300);
const tk2 = await wavTake(p, path.join(DIR, 'daten/en-flite.wav'), 0);
const t2 = Date.now();
const res2 = await p.evaluate(r => SYNQUENZER.g9Recognize(r, {lang: 'auto', mode: 'all'}), tk2.ref);
R.second = Date.now() - t2;
const a4 = await p.evaluate(() => SYNQUENZER.g9Asr());
console.log('EN Text:', a4.last && a4.last.text, '| diag', a4.diag.join(' | '), '| initMs', a4.sm.initMs);
ok(res2 && res2.lang === 'en' && res2.words.length >= 6, 'offline aus dem Cache, Auto → en, ' + (res2 && res2.words.length) + ' Wörter (' + R.second + ' ms inkl. Start)');
ok(HITS.filter(h => !/^blob:/.test(h.url)).length === 0, 'G9-19 offline: kein Abruf an CDN/Modell-Ablage (' + HITS.length + ')');
// 4) [Stopp] während der Erkennung
await p.evaluate(r => { window.__r3 = SYNQUENZER.g9Recognize(r, {lang: 'en', mode: 'all'}); }, tk2.ref);
await sleep(300);
const sm = await p.evaluate(() => { const t = performance.now(); SYNQUENZER.g9AsrStop(); return {ms: performance.now() - t, w: SYNQUENZER.g9Asr().worker}; });
const r3 = await p.evaluate(() => window.__r3);
ok(sm.ms < 500 && !sm.w && r3 && r3.stopped, 'Stopp während Erkennung ≤ 0,5 s (' + sm.ms.toFixed(1) + ' ms), Worker beendet');
ok(errs.length === 0, 'keine Konsolen-Fehler ' + errs.join('|'));
fs.writeFileSync(path.join(DIR, 'ergebnis-t1.json'), JSON.stringify({R, de: a2.last, en: a4.last, diag: a4.diag}, null, 1));
const f = ok.done(); await br.close(); process.exit(f ? 1 : 0);
