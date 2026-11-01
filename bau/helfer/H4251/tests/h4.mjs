// H4 Abnahme H-30 … H-33: Vorzähler sichtbar und hörbar bei laufender Musik und im Song-Vorlauf. node h4.mjs <index.html> [basis.html]
import {open, micOn, g10demo, closeAll, sleep, log, ovlStart, ovlStop, waitBeat, T} from './h-lib.mjs';
const FILE = process.argv[2], OLD = process.argv[3], ok = T();
const clicks = L => L.filter(e => e.src === 'click').map(e => ({b: Math.round(e.beat * 100) / 100, a: e.out}));
const seq = ov => { const o = []; for (const x of ov) { if (!x.show) { if (o[o.length - 1] !== '·') o.push('·'); continue; } const v = x.num; if (o[o.length - 1] !== v) o.push(v); } return o; };
// H-30 Szene läuft, ● auf STIMME bei Schlag 5,5 → Start 8
{
  const H = await open(FILE), p = H.p; await g10demo(p); await micOn(p);
  await p.evaluate(() => { SYNQUENZER.selectSlot(SYNQUENZER.tkInfo().stimme, 0); SYNQUENZER.launchScene(0); });
  await waitBeat(p, 5.5); await p.evaluate(() => SYNQUENZER.clearLog()); await ovlStart(p);
  const r0 = await p.evaluate(() => { SYNQUENZER.rec(); return {st: SYNQUENZER.runtime().rec.state, sb: SYNQUENZER.runtime().rec.startBeat}; });
  await waitBeat(p, 9.5); const ov = await ovlStop(p), L = await log(p);
  const r1 = await p.evaluate(() => SYNQUENZER.runtime().rec);
  const w = ov.filter(x => x.b >= 5.55 && x.b < 9.4), s = seq(w), k = clicks(L);
  ok('H-30 Start am Taktstrich 8 (rec.startBeat)', r0.st === 'armed' && Math.abs(r0.sb - 8) < 1e-6 && r1.state === 'recording', JSON.stringify([r0, r1.state, r1.startBeat]));
  ok('H-30 M-OVL: Overlay 5,5–8 mit 3, 2, 1, dann „●“, danach weg', JSON.stringify(s) === '["3","2","1","●","·"]', JSON.stringify(s));
  const at = n => (w.find(x => x.num === n) || {}).b;
  ok('H-30 Zahlen auf den Schlägen (2 ab 6, 1 ab 7, ● ab 8, ±0,15 = 1 Abtastung)', Math.abs(at('2') - 6) < .15 && Math.abs(at('1') - 7) < .15 && Math.abs(at('●') - 8) < .15, JSON.stringify({2: at('2'), 1: at('1'), go: at('●')}));
  ok('H-30 M-KLICK: Klicks auf 6 und 7, keiner ab 8', JSON.stringify(k.filter(x => x.b < 9.5).map(x => x.b)) === '[6,7]', JSON.stringify(k));
  ok('H-30 Overlay nennt Ziel', w.some(x => /Stimme · Szene 1/.test(x.tgt)), (w.find(x => x.show) || {}).tgt);
  ok('H-30 Konsole', !H.errs.length, H.errs.join('|').slice(0, 200));
  await p.evaluate(() => { SYNQUENZER.rec(); SYNQUENZER.stop(); }); await H.close();
}
// H-31 Song-Punch ab Takt 5 mit Vorlauf (aus dem Stopp)
{
  const H = await open(FILE), p = H.p; await g10demo(p, {song: true}); await sleep(1200); await micOn(p);
  await p.evaluate(() => SYNQUENZER.clearLog()); await ovlStart(p);
  const r = await p.evaluate(() => { SYNQUENZER.songRecFrom({from: 4, preroll: true}); return {sb: R.songRec && R.songRec.startBeat, vox: !!(R.songRec && R.songRec.vox)}; });
  await waitBeat(p, 7.5); const ov = await ovlStop(p), L = await log(p);
  const s = seq(ov.filter(x => x.b != null && x.b >= 0 && x.b < 7.4)), k = clicks(L);
  ok('H-31 sr.startBeat = Takt 5 (Transport-Schlag 4 nach 1 Takt Vorlauf)', r.vox && Math.abs(r.sb - 4) < 1e-6, JSON.stringify(r));
  ok('H-31 Overlay zählt im Vorlauf 4…1, dann „●“', JSON.stringify(s) === '["4","3","2","1","●","·"]', JSON.stringify(s));
  ok('H-31 4 Klicks im Vorlauf (betont auf der 1), danach keiner', JSON.stringify(k.filter(x => x.b < 7.5)) === JSON.stringify([{b: 0, a: 1}, {b: 1, a: 0}, {b: 2, a: 0}, {b: 3, a: 0}]), JSON.stringify(k));
  ok('H-31 Overlay nennt Song-Ziel', ov.some(x => x.show && /Song · Gesang ab Takt 5/.test(x.tgt)), (ov.find(x => x.show) || {}).tgt);
  await p.evaluate(() => { SYNQUENZER.songRecEnd(); SYNQUENZER.stop(); }); await H.close();
}
// H-32 Vorlauf aus + Einzähler aus → kein Klick, kein Overlay; MIDI-Take bei laufendem Transport wie 4.25.0
{
  const H = await open(FILE), p = H.p; await g10demo(p, {song: true, countIn: 0}); await sleep(1200); await micOn(p);
  await p.evaluate(() => SYNQUENZER.clearLog()); await ovlStart(p);
  await p.evaluate(() => SYNQUENZER.songRecFrom({from: 4, preroll: false})); await sleep(3000);
  const ov = await ovlStop(p), k = clicks(await log(p));
  ok('H-32 Song ohne Vorlauf, Einzähler aus: kein Klick, kein Overlay', !k.length && !ov.some(x => x.show), JSON.stringify({k, ov: ov.filter(x => x.show).length}));
  await p.evaluate(() => { SYNQUENZER.songRecEnd(); SYNQUENZER.stop(); }); await H.close();
  // Szene: Einzähler aus → Overlay nur ●? (kein Zählen, keine Klicks)
  const H2 = await open(FILE), q = H2.p; await g10demo(q, {countIn: 0}); await micOn(q);
  await q.evaluate(() => { SYNQUENZER.selectSlot(SYNQUENZER.tkInfo().stimme, 0); SYNQUENZER.launchScene(0); }); await waitBeat(q, 5.5);
  await q.evaluate(() => SYNQUENZER.clearLog()); await ovlStart(q); await q.evaluate(() => SYNQUENZER.rec()); await waitBeat(q, 9.6);
  const ov2 = await ovlStop(q), k2 = clicks(await log(q));
  ok('H-32 Szene, Einzähler aus: keine Klicks, nur das Overlay (Spec H4 Nr. 3)', !k2.length && JSON.stringify(seq(ov2.filter(x => x.b >= 5.55))) === '["3","2","1","●","·"]', JSON.stringify({k2, n: seq(ov2)}));
  await q.evaluate(() => { SYNQUENZER.rec(); SYNQUENZER.stop(); }); await H2.close();
}
async function midiRun(file) {
  const H = await open(file), p = H.p; await g10demo(p);
  await p.evaluate(() => { SYNQUENZER.selectSlot(3, 0); SYNQUENZER.launchScene(0); }); await waitBeat(p, 5.5);
  await p.evaluate(() => SYNQUENZER.clearLog()); await ovlStart(p); await p.evaluate(() => SYNQUENZER.rec()); await waitBeat(p, 9.5);
  const ov = await ovlStop(p), k = clicks(await log(p)); await H.close();
  return {k: k.filter(x => x.b < 9.5), show: ov.filter(x => x.show).length};
}
{
  const n = await midiRun(FILE); let same = n.show === 0, info = JSON.stringify(n);
  if (OLD) { const o = await midiRun(OLD); same = same && JSON.stringify(o) === JSON.stringify(n); info += ' | 4.25.0 ' + JSON.stringify(o); }
  ok('H-32 MIDI-Take bei laufendem Transport: wie 4.25.0 (kein Overlay, gleiche Klicks)', same, info);
}
// H-33 Leistung: Bildzeit p95 (rAF-Abstand und renderTakt-Dauer) bei laufender Szene mit armiertem Gesangs-Take; keine langen Tasks
async function perf(file) {
  const H = await open(file), p = H.p; await g10demo(p); await micOn(p);
  await p.evaluate(() => { window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push(e.duration); }).observe({entryTypes: ['longtask']}); } catch (e) {} });
  await p.evaluate(() => { SYNQUENZER.selectSlot(SYNQUENZER.tkInfo().stimme, 0); SYNQUENZER.launchScene(0); });
  await waitBeat(p, 2);
  const r = await p.evaluate(async () => {
    const rt = []; const orig = window.renderTakt; let n = 0;
    const tm = []; let last = performance.now(); let on = true; const f = () => { const t = performance.now(); tm.push(t - last); last = t; if (on) requestAnimationFrame(f); }; requestAnimationFrame(f);
    for (let k = 0; k < 6; k++) { SYNQUENZER.rec(); await new Promise(r => setTimeout(r, 1500)); SYNQUENZER.rec(); await new Promise(r => setTimeout(r, 2200)); }
    on = false;
    // renderTakt einzeln: 2000 Aufrufe mit armiertem Zustand
    const t0 = performance.now(); for (let i = 0; i < 2000; i++) { UI.last.takt = null; renderTakt(5.5 + (i % 10) / 10); } const per = (performance.now() - t0) / 2000;
    tm.sort((a, b) => a - b);
    return {p95: tm[Math.floor(tm.length * .95)], per, lt: window.__lt.filter(d => d > 50)};
  });
  await p.evaluate(() => SYNQUENZER.stop()); await H.close(); return r;
}
{
  const n = await perf(FILE); let info = 'neu ' + JSON.stringify({p95: +n.p95.toFixed(2), renderTaktMs: +n.per.toFixed(4), lang: n.lt.length}), good = true;
  if (OLD) { const o = await perf(OLD); info += ' | 4.25.0 ' + JSON.stringify({p95: +o.p95.toFixed(2), renderTaktMs: +o.per.toFixed(4), lang: o.lt.length}); good = good && n.per - o.per <= .2 && n.lt.length <= o.lt.length; } else good = n.lt.length === 0;
  ok('H-33 renderTakt ≤ +0,2 ms je Bild, nicht mehr lange Tasks (> 50 ms) als 4.25.0 (Aufnahme-Ende, gleiche Last)', good, info);
}
await closeAll(); process.exit(ok.sum() ? 1 : 0);
