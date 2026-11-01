// MIX-A Abnahme 5: Hauptthread frei – keine Aufgabe ≥ 50 ms (PerformanceObserver „longtask“) während Analysieren, Messen,
// Übernehmen und Blätter zeichnen; Vergleich: derselbe Video-Render ohne MIX-A (die Render-Scheibchen gehören 4.30.0).
// Dazu: Spur-/Master-Knoten kosten im Worklet wenig (Offline-Zeitmessung). node mixa-perf.mjs [index.html]
import { open, buildSong, vocalWav, ok, failed, APP } from './mixa-lib.mjs';
const LT = `(() => { window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push([Math.round(e.startTime), Math.round(e.duration), window.__ltTag || '']); }).observe({entryTypes: ['longtask']}); } catch (e) {} })();`;
const {p, errs, close} = await open(APP, null, {init: LT});
const bpm = await p.evaluate(() => window.SYNQUENZER.project().bpm), spb = 60 / bpm;
await buildSong(p, {vocal: vocalWav(12 * 4 * spb + 1, 48000, 4 * 4 * spb)});
const phase = async (tag, fn) => { await p.evaluate(t => { window.__lt = []; window.__ltTag = t; }, tag); await p.evaluate(fn); await p.waitForTimeout(300); return p.evaluate(() => window.__lt.slice()); };
const ref = await phase('video (4.30.0-Teil)', async () => { await window.SYNQUENZER.vvRender({}); });
const an = await phase('analysieren', async () => { await window.SYNQUENZER.mixaAnalyze(); });
const am = await phase('messen', async () => { await window.SYNQUENZER.mixaMeasureAm(-14); });
const sh = await phase('blätter', async () => { const Q = window.SYNQUENZER; Q.mixaSheet(); await new Promise(r => setTimeout(r, 100)); Q.mixaClose(); Q.amSheet(); await new Promise(r => setTimeout(r, 100)); Q.mixaClose(); });
const ap = await phase('übernehmen', async () => { const Q = window.SYNQUENZER; Q.mixaAll(); Q.amApply(); await new Promise(r => setTimeout(r, 500)); Q.undo(); Q.undo(); });
const mx = a => a.reduce((m, x) => Math.max(m, x[1]), 0);
ok('Vergleich: Video-Render 4.30.0 (gleiche Scheibchen)', true, {max: mx(ref), n: ref.length});
ok('Analysieren: keine Aufgabe ≥ 50 ms', mx(an) < 50, {max: mx(an), n: an.length, lt: an.slice(0, 5)});
ok('Auto-Master messen: keine Aufgabe ≥ 50 ms', mx(am) < 50, {max: mx(am), n: am.length, lt: am.slice(0, 5)});
ok('Blätter zeichnen: keine Aufgabe ≥ 50 ms', mx(sh) < 50, {max: mx(sh), lt: sh});
ok('Übernehmen / ↶: keine Aufgabe ≥ 50 ms', mx(ap) < 50, {max: mx(ap), lt: ap});
// Rechenkosten im Worklet: 6 Spur-Knoten + Master gegen ohne (Offline, gleiche Szene)
const cost = await p.evaluate(async () => {
  const Q = window.SYNQUENZER; Q.mixaAll(); await Q.mixaMeasureAm(-14); Q.amApply();
  const t0 = performance.now(); await Q.vvRender({}); const mit = performance.now() - t0;
  Q.undo(); Q.undo();
  const t1 = performance.now(); await Q.vvRender({}); const ohne = performance.now() - t1;
  return {mit: Math.round(mit), ohne: Math.round(ohne)};
});
ok('Worklet-Kosten: Video-Render mit allen Knoten ≤ 1,5 × ohne', cost.mit <= cost.ohne * 1.5, cost);
ok('keine Fehler', !errs.length, errs.slice(0, 3));
await close();
console.log(failed() ? 'FEHLER: ' + failed() : 'ALLES GRÜN');
process.exit(failed() ? 1 : 0);
