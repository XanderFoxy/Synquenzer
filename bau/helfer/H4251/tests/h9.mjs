// Gemeinsame Abnahme: H-90 (M-G28, Teil Projekt + Wiedergabe-Plan) und H-92 (3 min Wiedergabe mit Szenenwechseln und 3 Gesangs-Takes).
// node h9.mjs <neu.html> <basis.html> [sekunden]
import {open, micOn, g10demo, closeAll, sleep, waitBeat, T} from './h-lib.mjs';
const [FILE, OLD] = process.argv.slice(2), SEC = +(process.argv[4] || 180), ok = T();
// H-90: Demo laden → normalisiertes Projekt gleich; 8 Takte Wiedergabe (alle Szenen nacheinander) → gleicher Noten-Plan
async function g28(file) {
  const H = await open(file), p = H.p; await sleep(1500);
  const pj = await p.evaluate(() => JSON.stringify(SYNQUENZER.state().project, (k, v) => (k === 'id' || k === 'uid' ? undefined : v)));   // zufällige Kennungen je Start
  const plan = [];
  for (const sc of [0, 1]) {
    await p.evaluate(sc => { SYNQUENZER.stop(); SYNQUENZER.clearLog(); SYNQUENZER.launchScene(sc); }, sc); await waitBeat(p, 8.2);
    plan.push(await p.evaluate(() => SYNQUENZER.noteLog(4096).filter(e => e.beat < 8 && e.src !== 'click').map(e => [e.track, +e.beat.toFixed(4), e.clipNote, +(e.dur || 0).toFixed(4), +(e.vel || 0).toFixed(3)].join(':')).sort().join('|')));
    await p.evaluate(() => SYNQUENZER.stop()); await sleep(300);
  }
  const errs = H.errs.slice(); await H.close(); return {pj, plan, errs};
}
{
  const n = await g28(FILE), o = await g28(OLD), o2 = await g28(OLD);
  console.log('INFO Basis gegen Basis: Plan gleich ' + o.plan.map((x, k) => x === o2.plan[k]).join(','));
  ok('H-90 Demo: normalisiertes Projekt Zeichen für Zeichen gleich', n.pj === o.pj, n.pj.length + ' / ' + o.pj.length);
  ok('H-90 Demo Szene 1 + 2, je 8 Takte: Noten-Plan (Spur, Schlag, Note, Dauer, Stärke) gleich', n.plan.every((x, k) => x === o.plan[k]) && n.plan[0].length > 100, n.plan.map(x => x.split('|').length).join(',') + ' Einträge');
  ok('H-90 Konsole', !n.errs.length && !o.errs.length, n.errs.concat(o.errs).join('|').slice(0, 200));
}
// H-92: SEC Sekunden: Szenenwechsel alle 4 Takte, 3 Gesangs-Takes (Szene 1, 2, 1), lange Tasks, Fehler, hängende Noten – neu und Basis im selben Ablauf
async function h92(file) {
  const H = await open(file), p = H.p; await g10demo(p); await micOn(p);
  await p.evaluate(() => { window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push(Math.round(e.duration)); }).observe({entryTypes: ['longtask']}); } catch (e) {} });
  const t0 = Date.now(); let takes = 0, sw = 0, lastSw = -1;
  await p.evaluate(() => SYNQUENZER.launchScene(0));
  while (Date.now() - t0 < SEC * 1000) {
    const b = await p.evaluate(() => { const c = SYNQUENZER.vsClock(); return (c.now - c.outLat - c.start) / c.spb; });
    const bar = Math.floor(b / 4);
    if (takes < 3 && bar >= 2 + takes * 12) {
      const sc = [0, 1, 0][takes];
      await p.evaluate(sc => { SYNQUENZER.selectSlot(SYNQUENZER.tkInfo().stimme, sc); SYNQUENZER.rec(); }, sc);
      await waitBeat(p, (bar + 5) * 4 - 3.7, 60000); await p.evaluate(() => SYNQUENZER.rec()); takes++;
    } else if (bar % 4 === 3 && bar !== lastSw) { lastSw = bar; await p.evaluate(s => SYNQUENZER.launchScene(s), ++sw % 2); }
    await sleep(150);
  }
  await p.evaluate(() => SYNQUENZER.stop()); await sleep(2500);
  const r = await p.evaluate(() => ({lt: window.__lt, tick: SYNQUENZER.tickErrors(), voices: SYNQUENZER.voices(), nTakes: Object.keys(SYNQUENZER.takes()).length}));
  const errs = H.errs.slice(); await H.close(); return Object.assign(r, {takes, sw, errs});
}
{
  const n = await h92(FILE), o = await h92(OLD), L = x => x.lt.filter(d => d > 50);
  ok('H-92 ' + SEC + ' s Wiedergabe: 3 Gesangs-Takes, ' + n.sw + ' Szenenwechsel', n.takes === 3 && n.nTakes >= 3, JSON.stringify({takes: n.takes, nTakes: n.nTakes}));
  ok('H-92 keine Konsolen-Fehler, keine Tick-Fehler, keine hängenden Stimmen nach ■', !n.errs.length && !n.tick && (!Array.isArray(n.voices) || !n.voices.length), n.errs.join('|').slice(0, 200) + ' tick ' + n.tick + ' Stimmen ' + JSON.stringify(n.voices).slice(0, 100));
  ok('H-92 lange Tasks > 50 ms nicht mehr als 4.25.0 im selben Ablauf', L(n).length <= L(o).length, 'neu ' + JSON.stringify(L(n)) + ' | 4.25.0 ' + JSON.stringify(L(o)));
}
await closeAll(); process.exit(ok.sum() ? 1 : 0);
