// Regressionen aus der unabhängigen Prüfung (BM8): Ende der festen Aufnahme, eigener Clip + historyCheck, Ersetzen ohne Bewegung,
// kein Streu-Clip, Rad-Startwert, Clip-Kurve vor Melodie-Kurve, Clip-Blatt ×2 hält den Wert
import { open, ok, summary } from './lib.mjs';
const {b, p, errs} = await open();
const sleep = ms => p.waitForTimeout(ms);
await p.evaluate(() => { ensureAudio(); SYNQUENZER.bmcFake(0, true); SYNQUENZER.selectTrack(0); });
// #4 feste Länge 1 Takt bei 120 BPM, Bend-Rampe bis über das Ende: die letzten 100 ms fehlen nicht
await p.evaluate(() => { SYNQUENZER.setBpm(120); SYNQUENZER.setRecOptions({length: 1, countIn: 0}); const s = S.tracks[0].clips.findIndex(c => !c); window.__s = s; SYNQUENZER.selectSlot(0, s); SYNQUENZER.rec(); });
await p.waitForFunction(() => rec.state === 'recording', null, {timeout: 5000});
const r4 = await p.evaluate(async () => {
  const w = ms => new Promise(r => setTimeout(r, ms)), B0 = rec.startBeat; SYNQUENZER.bmcLive(0, 'bd', null, {touch: true});
  while (true) { const x = (bmcBeatNow() - B0) / 4; if (x >= 1.08) break; SYNQUENZER.bmcLive(0, 'bd', Math.max(0, Math.min(1, x))); await w(8); }
  SYNQUENZER.bmcLive(0, 'bd', null, {touch: false}); await w(300);
  const a = S.tracks[0].clips[window.__s].cv.bd; return {v39: cvAt(a, 3.9), soll: 3.9 / 4, last: a.slice(-2), hc: (SYNQUENZER.stop(), SYNQUENZER.historyCheck())};
});
ok('#4 feste Länge: Bewegung bis zum Ende im Clip (Abweichung ≤ 0,005 bei Schlag 3,9)', Math.abs(r4.v39 - r4.soll) <= .005, r4);
// #2 eigener Clip bekommt Kurven: historyCheck bleibt wahr, cv vor from
const r2 = await p.evaluate(() => {
  const A = SYNQUENZER, s = window.__s;
  A.setSong({bars: 4, loop: {on: false, a: 0, b: 4}, melodyTrack: 1, lanes: S.tracks.map((_, i) => i === 0 ? [{bar: 0, slot: s}] : []), carrier: [], mel: {1: {len: 4, key: {root: 0, scale: 'ionian'}, notes: []}}});
  A.makeOwn(0, 1); const id = svCellOwnAt(0, 1); A.clipCurvesClear(0, s); delete S.song.own[id].cv;     // without curves first
  A.setClipCurves(0, {own: id}, {at: [[0, 0], [2, 1]]}); return {keys: Object.keys(S.song.own[id]), hc: A.historyCheck()};
});
ok('#2 eigener Clip mit neuen Kurven: cv vor from, historyCheck() = true', r2.hc && r2.keys.indexOf('cv') < r2.keys.indexOf('from'), r2);
// #3 Ersetzen ohne Bewegung ersetzt die Kurve der Melodie; #6 kein Streu-Clip
const r3 = await p.evaluate(async () => {
  const A = SYNQUENZER, w = ms => new Promise(r => setTimeout(r, ms)); A.stop(); A.setBpm(240);
  A.setSong({bars: 2, loop: {on: false, a: 0, b: 2}, melodyTrack: 0, lanes: S.tracks.map(() => []), carrier: [], mel: {0: {len: 2, key: {root: 0, scale: 'ionian'}, notes: [{t: 1, d: 1, n: 60, v: .8}], cv: {bd: [[0, .5]]}}}});
  A.songRecRange(0, 1, 'replace', {mel: true, clips: false, chords: false}, {track: 0, preroll: false});
  while (R.songRec && !(R.songPlay && songBeatOf(t2b(AU.ctx.currentTime - AU.outLat)) > 7.95)) await w(5);
  if (R.songRec) A.songRecEnd(); A.stop();
  const m = S.song.mel[0]; return {cv: m.cv ? JSON.stringify(m.cv) : null, notes: m.notes.length, own: Object.keys(S.song.own || {}).length};
});
ok('#3 Ersetzen ohne Bewegung: die alte Kurve im Bereich ist ersetzt (Ruhewert)', !r3.cv || !JSON.parse(r3.cv).bd || JSON.parse(r3.cv).bd.every(q => q[1] === 0), r3);
const r6 = await p.evaluate(async () => {
  const A = SYNQUENZER, w = ms => new Promise(r => setTimeout(r, ms)), s = window.__s; A.stop(); A.setBpm(240);
  A.setClip(0, s, {len: 1, key: {root: 0, scale: 'ionian'}, notes: [{t: 0, d: 1, n: 60, v: .8}]});
  A.setSong({bars: 4, loop: {on: false, a: 0, b: 4}, melodyTrack: 1, lanes: S.tracks.map((_, i) => i === 0 ? [{bar: 0, slot: s}] : []), carrier: [], mel: {1: {len: 4, key: {root: 0, scale: 'ionian'}, notes: []}}});
  A.songPlay(0); while (songBeatOf(t2b(AU.ctx.currentTime - AU.outLat)) < .3) await w(5);
  A.songRecRange(0, 3, 'overdub', {mel: true, clips: false, chords: false}, {track: 0, preroll: false});
  while (songBeatOf(t2b(AU.ctx.currentTime - AU.outLat)) < 8.4) await w(5);
  A.bmcLive(0, 'bd', null, {touch: true}); const t0 = performance.now();
  while (songBeatOf(t2b(AU.ctx.currentTime - AU.outLat)) < 11.5) { A.bmcLive(0, 'bd', .5 * Math.sin((performance.now() - t0) / 120)); await w(8); }
  A.bmcLive(0, 'bd', null, {touch: false});
  while (R.songRec && songBeatOf(t2b(AU.ctx.currentTime - AU.outLat)) < 15.9) await w(5);
  if (R.songRec) A.songRecEnd(); A.stop();
  const own = Object.entries(S.song.own || {}).map(([id, c]) => ({id, bar: c.from.bar, cv: !!c.cv}));
  return {own, lanes: JSON.stringify(S.song.lanes[0]), hc: A.historyCheck()};
});
ok('#6 kein Streu-Clip: nur Takt 3 (bewegt) wird ein eigener Clip, mit Kurve; historyCheck', r6.own.length === 1 && r6.own[0].bar === 2 && r6.own[0].cv && r6.hc, r6);
// #7 Rad-Startwert: Rad steht auf 0,2, erste Bewegung auf 0,8 → der Verlauf beginnt bei 0,2
const r7 = await p.evaluate(async () => {
  const A = SYNQUENZER, w = ms => new Promise(r => setTimeout(r, ms)); A.stop(); A.mkWheel(0, 'mod', .2); A.play(); await w(300);
  A.bmcLive(0, 'mw', .8); const H = BMC.h[0]; const v = H.v0.mw, before = bmcVal(H, 'mw', bmcBeatNow() - .2); A.stop(); return {v0: v, before};
});
ok('#7 Rad: Startwert = Stellung vor der ersten Bewegung', Math.abs(r7.v0 - .2) < 1e-9 && Math.abs(r7.before - .2) < 1e-9, r7);
// #5 Clip-Kurve hat Vorrang vor der Melodie-Kurve derselben Spur
const r5 = await p.evaluate(async () => {
  const A = SYNQUENZER, w = ms => new Promise(r => setTimeout(r, ms)), s = window.__s; A.stop(); A.setBpm(240);
  A.setClip(0, s, {len: 1, key: {root: 0, scale: 'ionian'}, notes: [{t: 0, d: 1, n: 60, v: .8}], cv: {bd: [[0, 1]]}});
  A.setSong({bars: 3, loop: {on: false, a: 0, b: 3}, melodyTrack: 0, lanes: S.tracks.map((_, i) => i === 0 ? [{bar: 1, slot: s}, {bar: 2, slot: -1}] : []), carrier: [], mel: {0: {len: 3, key: {root: 0, scale: 'ionian'}, notes: [{t: 0, d: 1, n: 60, v: .8}], cv: {bd: [[0, 0], [11.9, -1]]}}}});
  A.bmcLog(true); A.songPlay(0); await w(3300); A.stop();
  const log = A.bmcLog().filter(e => e.k === 'bd'), sb = e => (e.at - R.startTime) / spb();
  const inBar2 = log.filter(e => sb(e) >= 3.999 && sb(e) < 7.95), after = log.filter(e => sb(e) >= 8.02 && sb(e) < 11);
  return {ev: log.map(e => [+sb(e).toFixed(3), +e.v.toFixed(3)]).filter((x, j) => j < 6 || (x[0] > 3.5 && x[0] < 9)), off: R.songPlay ? R.songPlay.off : BMC.wr, bar2: inBar2.length, bar2Ok: inBar2.length > 0 && inBar2.every(e => e.v === 1), after: after.length, afterMel: after.every(e => e.v < -.6)};
});
ok('#5 Clip-Kurve hat Vorrang in Takt 2; danach wieder die Melodie-Kurve', r5.bar2Ok && r5.after > 0 && r5.afterMel, r5);
ok('Konsole ohne Fehler, kein Supabase-Aufruf', !errs.length, errs);
await b.close(); process.exit(summary());
