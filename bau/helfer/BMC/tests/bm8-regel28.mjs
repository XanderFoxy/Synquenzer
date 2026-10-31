// Regel 28 / BM8-10: alte Projekte bleiben bitgleich (Basis vs-base-B = App 4.23.0 gegen BMC)
import { createRequire } from 'module';
import path from 'path';
import { ok, summary } from './lib.mjs';
const { chromium } = createRequire(import.meta.url)('playwright');
const ROOT = path.resolve(new URL('../../../..', import.meta.url).pathname);
const BASE = ROOT + '/bau/werkzeug/vs-base-B.html', NEW = ROOT + '/bau/helfer/BMC/index.html';
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
async function page(f) { const p = await b.newPage({viewport: {width: 428, height: 926}}); const errs = []; p.on('pageerror', e => errs.push(String(e)));
  p.on('request', r => { if (/supabase/i.test(r.url())) errs.push('SUPABASE ' + r.url()); });
  await p.goto('file://' + f); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 60000}); return {p, errs}; }
// 1) in der alten App ein reiches Projekt bauen: Clips aller Spuren, Song mit Melodie, eigener Clip, Ganzer Block, Teile
const A = await page(BASE);
const old = await A.p.evaluate(() => {
  const X = SYNQUENZER; X.setClip(0, 5, {len: 2, key: {root: 2, scale: 'dorian'}, notes: [{t: 0, d: .5, n: 62, v: .7}, {t: 3.5, d: 1, n: 69, v: .9, o: 3.47}]});
  X.setSong({bars: 6, loop: {on: false, a: 0, b: 6}, melodyTrack: 5, lanes: S.tracks.map((_, i) => i === 0 ? [{bar: 0, slot: 5}] : i === 1 ? [{bar: 0, slot: 0}] : []), carrier: [],
    mel: {5: {len: 6, key: {root: 0, scale: 'ionian'}, notes: [{t: 1, d: 1, n: 72, v: .8}, {t: 9.5, d: .5, n: 74, v: .6}]}}});
  X.makeOwn(0, 2); X.makeOwn(1, 4, true); X.songRange('copy', 0, 1, 5);
  return {file: JSON.stringify(projectFileObj(S, true, true)), ser: serialize(), demoSer: (() => { const d = demoProject(); return JSON.stringify(SQStore.buildProjectFile(d, null, VERSION).project); })()};
});
// Demo spielen (Notenlog in Schlägen, die ersten 4 Takte)
const playLog = async P => P.evaluate(async () => { applyProject(demoProject(), {}); ensureAudio(); SYNQUENZER.setBpm(240); SYNQUENZER.clearLog(); SYNQUENZER.launchScene(0); SYNQUENZER.play();
  await new Promise(r => setTimeout(r, 2600)); SYNQUENZER.stop(); const sp = 60 / S.bpm;
  return JSON.stringify(SYNQUENZER.noteLog().map(e => [e.track, e.out, e.vel, e.src, +((e.time - R.startTime) / sp).toFixed(6)]).filter(e => e[4] < 16).sort()); });
await playLog(A.p); const oldLog = await playLog(A.p);              // erster Lauf nach dem Laden = Anlauf (in beiden Apps wackelig)
// 2) dieselbe Datei in der neuen App
const B = await page(NEW);
const nw = await B.p.evaluate(({file}) => {
  const r = SQStore.parseFile(file); const p = normalizeProject(r.project || projFromFile(JSON.parse(file))); applyProject(p, {});
  const hasCv = JSON.stringify(S).includes('"cv"');
  return {file: JSON.stringify(projectFileObj(S, true, true)), ser: serialize(), demoSer: (() => { const d = demoProject(); return JSON.stringify(SQStore.buildProjectFile(d, null, VERSION).project); })(), hasCv};
}, {file: old.file});
await playLog(B.p); const nwLog = await playLog(B.p);
const st = await B.p.evaluate(() => ({act: Object.keys(BMC.act).length, h: Object.keys(BMC.h).length, fake: BMC.fake.size}));
ok('Regel 28: altes Projekt → Datei byte-gleich (Laden, Speichern)', nw.file === old.file, nw.file.length + ' / ' + old.file.length);
ok('Regel 28: serialize() gleich', nw.ser === old.ser);
{ const a = JSON.parse(old.demoSer), c = JSON.parse(nw.demoSer), d = []; const walk = (x, y, pa) => { if (JSON.stringify(x) === JSON.stringify(y)) return; if (x && y && typeof x === 'object' && typeof y === 'object') { for (const k of new Set([...Object.keys(x), ...Object.keys(y)])) walk(x[k], y[k], pa + '.' + k); } else d.push(pa + ': ' + JSON.stringify(x) + ' ≠ ' + JSON.stringify(y)); }; walk(a, c, '');
  ok('Regel 28: Demo-Projekt gleich (bis auf zufällige id/uid/Name)', d.every(x => /\.(id|uid|name)(:| )/.test(x)), d.slice(0, 6)); }
ok('Regel 28: kein cv-Feld entsteht', !nw.hasCv);
{ const a = JSON.parse(oldLog), c = JSON.parse(nwLog), sa = new Set(a.map(x => JSON.stringify(x))), sc = new Set(c.map(x => JSON.stringify(x)));
  ok('Regel 28: Demo spielt dieselben Noten zu denselben Schlägen', nwLog === oldLog && c.length > 10, {n: [a.length, c.length], nurAlt: a.filter(x => !sc.has(JSON.stringify(x))).slice(0, 4), nurNeu: c.filter(x => !sa.has(JSON.stringify(x))).slice(0, 4)}); }
ok('Regel 28: keine Kurven-Ereignisse, kein Kurven-Zustand ohne Bit Mask', st.act === 0 && st.h === 0, st);
ok('Konsole ohne Fehler (alt, neu), kein Supabase-Aufruf', !A.errs.length && !B.errs.length, [A.errs, B.errs]);
await b.close(); process.exit(summary());
