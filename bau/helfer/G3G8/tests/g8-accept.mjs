// G8 Abnahme: node g8-accept.mjs [S A B C]   (S = Stück-Weg erzwungen bei kurzer Song-Aufnahme, A = G8-01 5 min, B = G8-02, C = G8-03)
import {fresh, ok, fails, sleep, waitBeat, beatNow, idle, deq, open} from './g3-lib.mjs';
const only = process.argv.slice(2), want = k => !only.length || only.includes(k);
const MIN = +(process.env.G8_MIN || 5);
// Muster ins Mikro (im Seiten-Kontext): ab Kontext-Zeit t0 je Sekunde j ein Ton f(j) = 300 + 25·(j mod 20) Hz, 0,9 s an, 0,1 s Pause
const PATTERN = ([t0, sec]) => {
  const ctx = window.__ctx, F = window.__fake, o = ctx.createOscillator(), g = ctx.createGain(); g.gain.value = 0;
  for (let j = 0; j < sec; j++) { const t = t0 + j; o.frequency.setValueAtTime(300 + 25 * (j % 20), t); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.25, t + .01); g.gain.setValueAtTime(.25, t + .89); g.gain.linearRampToValueAtTime(0, t + .9); }
  o.connect(g); g.connect(F.bus); o.start(t0); o.stop(t0 + sec + .1); window.__pat = {o, g, t0, sec}; return t0;
};
const fOf = j => 300 + 25 * (j % 20);
// Leistung im Seiten-Kontext: lange Aufgaben im Hauptfaden, Takt-Fehler
const PERF = () => { window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push(Math.round(e.duration)); }).observe({entryTypes: ['longtask']}); } catch (e) {} };

async function songTake(H, sec, force) {
  const p = H.p;
  await p.evaluate(PERF);
  const nt = await p.evaluate(() => SYNQUENZER.project().tracks.length);
  await p.evaluate(o => SYNQUENZER.setSong(o), {bars: 2, lanes: Array.from({length: nt}, () => []), carrier: [], mel: {}, marks: []});
  await p.evaluate(f => SYNQUENZER.g8Force(f), !!force);
  const heap0 = await p.evaluate(() => performance.memory ? performance.memory.usedJSHeapSize : null);
  await p.evaluate(() => SYNQUENZER.songRecFrom({from: 0, mode: 'over', targets: {clips: false, chords: false, mel: true}, preroll: false}));
  await p.waitForFunction(() => SYNQUENZER.runtime().song.play && SYNQUENZER.vsClock().playing, null, {timeout: 5000});
  const off = await p.evaluate(() => SYNQUENZER.runtime().song.off || 0);
  const t0 = await p.evaluate(([off, sec, pat]) => { const c = SYNQUENZER.vsClock(); return (new Function('return ' + pat)())([c.start + off * c.spb, sec]); }, [off, sec, PATTERN.toString()]);
  const endBeat = off + sec * 2;                                      // 120 BPM: 2 Schläge je Sekunde
  let peak = 0, heapPk = heap0 || 0;
  while (true) {
    const b = await beatNow(p); if (b >= endBeat + .3) break;
    const i = await p.evaluate(() => ({g: SYNQUENZER.g8Info(), h: performance.memory ? performance.memory.usedJSHeapSize : 0}));
    if (i.g.st) peak = Math.max(peak, i.g.st.kept); heapPk = Math.max(heapPk, i.h);
    await sleep(Math.min(5000, Math.max(200, (endBeat + .3 - b) * 500)));
  }
  await p.evaluate(b => SYNQUENZER.songRecEnd({beat: b}), Math.round(endBeat / 4) * 4);
  const tEnd = Date.now();
  await idle(p, 60000);
  const doneMs = Date.now() - tEnd;
  const I = await p.evaluate(() => ({vox: SYNQUENZER.tkInfo().vox, last: SYNQUENZER.tkInfo().last, g8: SYNQUENZER.g8Info(), lt: window.__lt, tick: SYNQUENZER.tickErrors ? SYNQUENZER.tickErrors() : null, heap: performance.memory ? performance.memory.usedJSHeapSize : 0}));
  return {off, t0, I, heap0, heapPk, peak, doneMs};
}
async function checkTake(p, v, sec, label) {
  // Take-Sekunde j des Musters = in + j (in: Song-Takt 0 liegt auf in); je 10. Sekunde Frequenz, alle Ton-Strecken ohne Loch
  const js = []; for (let j = 0; j < sec; j += Math.max(1, Math.floor(sec / 30))) js.push(j); if (!js.includes(sec - 1)) js.push(sec - 1);
  const gz = []; for (const j of js) { gz.push([v.in + j + .3, fOf(j), .4]); gz.push([v.in + j + .3, fOf(j) + 12.5, .4]); }
  const iv = []; for (let j = 0; j < sec; j++) iv.push([v.in + j + .05, v.in + j + .85]);
  const r = await p.evaluate(([id, o]) => SYNQUENZER.g8Scan(id, o), [v.take, {gz, iv}]);
  const right = [], bad = [];
  for (let k = 0; k < js.length; k++) { const a = r.gz[2 * k], b = r.gz[2 * k + 1]; right.push(a); if (!(a > -30 && a - b > 10)) bad.push([js[k], a, b]); }
  const holes = r.iv.map((x, j) => [j, x]).filter(([, x]) => x < -35);
  ok(r.sec >= v.in + sec, `${label}: Take ${r.sec} s im Speicher (≥ ${(v.in + sec).toFixed(1)} s)`);
  ok(!bad.length, `${label}: Anfang da und alles am Platz – ${js.length} Stichproben (Sek. 0 … ${sec - 1}) mit der richtigen Tonhöhe` + (bad.length ? ' FEHLT: ' + JSON.stringify(bad.slice(0, 5)) : ''));
  ok(!holes.length, `${label}: kein Aussetzer – ${iv.length} Ton-Strecken, kleinster 20-ms-Pegel ${Math.min(...r.iv).toFixed(1)} dB` + (holes.length ? ' LÖCHER: ' + JSON.stringify(holes.slice(0, 5)) : ''));
  return r;
}

// S — Stück-Weg (erzwungen) bei einer kurzen Song-Aufnahme: gleiches Ergebnis wie der Ringpuffer-Weg, Neuladen bitgleich
if (want('S')) {
  const H = await fresh(), p = H.p, br = H.br, ctx = H.ctx;
  const r = await songTake(H, 24, true);
  const v = r.I.vox && r.I.vox[0];
  ok(r.I.last && r.I.last.stream === true && r.I.g8.last && r.I.g8.last.chunks >= 1, 'Take aus dem Strom: ' + JSON.stringify(r.I.g8.last));
  ok(v && v.bar === 0 && v.len >= 12, 'Song-Stimme ab Takt 1: ' + JSON.stringify(v && [v.bar, v.len, v.in]));
  if (v) await checkTake(p, v, 24, 'Strom 24 s');
  const h0 = v && await p.evaluate(id => SYNQUENZER.tkPcmHash(id), v.take);
  const P0 = await p.evaluate(() => SYNQUENZER.project());
  await p.evaluate(() => SYNQUENZER.save()); await sleep(1500); await p.close();
  const H2 = await open({br, ctx}); await sleep(1500);
  const h1 = v && await H2.p.evaluate(id => SYNQUENZER.tkPcmHash(id), v.take), P1 = await H2.p.evaluate(() => SYNQUENZER.project());
  const strip = o => { const x = JSON.parse(JSON.stringify(o)); for (const k of ['id', 'name', 'view', 'saved', 'updated']) delete x[k]; return x; };
  ok(h0 && h0 === h1 && deq(strip(P0), strip(P1)), 'Neuladen: Take bitgleich (' + h0 + '), Projekt deep-equal');
  ok(!H.errs.length && !H2.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.concat(H2.errs).slice(0, 3)));
  await br.close();
}

// A — G8-01: Song-Aufnahme 5 min mit 🎤 → Take vollständig (Anfang da), kein Aussetzer; G8-04 Speicher/CPU
if (want('A')) {
  const H = await fresh(), p = H.p, sec = Math.round(MIN * 60);
  const ring = await p.evaluate(() => SYNQUENZER.g8Info().ringSec);
  console.log('  Ringpuffer', ring, 's – Aufnahme', sec, 's');
  const r = await songTake(H, sec, false);
  const v = r.I.vox && r.I.vox[0];
  ok(sec > ring + 10, `die Aufnahme (${sec} s) ist länger als der Ringpuffer (${ring} s)`);
  ok(r.I.last && r.I.last.stream === true, 'Take aus den mitgeschriebenen Stücken: ' + JSON.stringify(r.I.g8.last));
  ok(v && v.bar === 0, 'Song-Stimme ab Takt 1, ' + (v && v.len) + ' Takte');
  if (v) await checkTake(p, v, sec, `${MIN} min`);
  const lt = r.I.lt || [];
  console.log('  G8-04: Stücke im Speicher während der Aufnahme (max)', r.peak, '× 1 MB; Heap', r.heap0 && (r.heap0 / 1e6).toFixed(1), '→ Spitze', (r.heapPk / 1e6).toFixed(1), '→ danach', (r.I.heap / 1e6).toFixed(1), 'MB; lange Aufgaben', JSON.stringify(lt.slice(0, 20)), '; fertig', r.doneMs, 'ms nach dem Ende');
  ok(!lt.some(d => d > 200), 'keine lange Aufgabe > 200 ms im Hauptfaden (größte ' + (lt.length ? Math.max(...lt) : 0) + ' ms, Anzahl > 50 ms: ' + lt.length + ')');
  ok(!H.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 3)));
  await H.br.close();
}
console.log(fails() ? `FEHLER: ${fails()}` : 'ALLE OK');
process.exit(fails() ? 1 : 0);
