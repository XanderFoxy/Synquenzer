// QA regression MK2: MS 2000 tracks with the new MK2 waves/patches inside the core flows (play, scenes, stop, save/load,
// file roundtrip, undo/redo, MIDI zip), no console errors, no tick errors. Usage: node v3-qa-mk2rg2-mk.mjs [P|L]
import { open, APP } from './v3-mk0reg-pw.mjs';
const VP = process.argv[2] === 'L' ? {width: 844, height: 390} : {width: 390, height: 844};
const {b, p, errs} = await open(VP, APP);
const waitBeat = (x, to = 30000) => p.waitForFunction(x => window.SYNQUENZER.runtime().beat > x, x, {timeout: to, polling: 20});
const r = {};
r.setup = await p.evaluate(async () => {
  const Q = window.SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms));
  Q.newProject({init: true}); Q.setBpm(240); const K = {root: 9, scale: 'aeolian'}, N = (t, n, d) => ({t, d: d || .8, n, v: .8});
  for (let t = 0; t < 4; t++) { Q.setClip(t, 0, {len: 1, key: K, notes: [N(0, 57 + t * 2), N(1, 60 + t * 2), N(2, 64 + t * 2), N(3, 60 + t * 2)]}); Q.setClip(t, 1, {len: 1, key: K, notes: [N(0, 69 - t), N(2, 72 - t)]}); }
  Q.setClip(4, 0, {len: 1, key: K, notes: [{t: 0, d: .1, n: 36, v: .9}, {t: 1, d: .1, n: 42, v: .7}, {t: 2, d: .1, n: 38, v: .9}, {t: 3, d: .1, n: 42, v: .7}]});
  for (let t = 0; t < 4; t++) Q.setEngine(t, 'mk'); await sl(300);
  Q.mkSet(0, 't.0.o1.w', 5); Q.mkSet(0, 't.0.o1.c2', 22);                 // Speicherwelle 12
  Q.mkSet(1, 't.0.o1.w', 3); Q.mkSet(1, 't.0.o1.c1', 64); Q.mkSet(1, 't.0.o2.w', 2); Q.mkSet(1, 't.0.o2.semi', 12);   // Sinus× X-MOD 64
  Q.mkSet(2, 't.0.o1.w', 4); Q.mkSet(2, 't.0.o1.c1', 64);                   // Stimmwelle
  Q.mkSet(3, 't.0.o1.w', 6); Q.mkSet(3, 't.0.f.res', 100);                  // Rauschen
  Q.mkSet(0, 't.0.p.1.i', 32); Q.mkSet(1, 't.0.p.0.i', -20); Q.mkSet(2, 't.0.p.2.d', 3); Q.mkSet(2, 't.0.p.2.i', 40);   // patches
  await sl(600);
  return {snd: [0, 1, 2, 3].map(t => JSON.stringify(Q.mkGet(t).t[0].o1) + JSON.stringify(Q.mkGet(t).t[0].p.map(x => x.i))), info: Q.mkInfo()}; });
// play scene 1 → scene 2, stop a single clip at the bar end, stop now
await p.evaluate(() => { const Q = window.SYNQUENZER; Q.clearLog(); Q.launchScene(0); });
await waitBeat(4.5);
r.meter1 = await p.evaluate(async () => { const Q = window.SYNQUENZER, xs = []; for (let k = 0; k < 20; k++) { xs.push(Q.meter().rmsDb); await new Promise(r => setTimeout(r, 40)); } return Math.max(...xs.filter(isFinite)); });
await p.evaluate(() => window.SYNQUENZER.tapSlot(0, 0)); r.stopQ = await p.evaluate(() => window.SYNQUENZER.runtime().stopQ);
await waitBeat(8.3); r.slotsAfterStop = await p.evaluate(() => window.SYNQUENZER.runtime().slots);
await p.evaluate(() => window.SYNQUENZER.launchScene(1)); await waitBeat(12.5);
await p.evaluate(() => window.SYNQUENZER.stopTrackNow(1)); r.slotsAfterNow = await p.evaluate(() => window.SYNQUENZER.runtime().slots);
await waitBeat(16.3);
r.log = await p.evaluate(() => { const L = window.SYNQUENZER.noteLog(4000).filter(n => n.beat != null && n.beat >= 0); const by = {}; for (const n of L) { const k = n.track + (n.beat < 4.2 ? 'a' : n.beat < 8.2 ? 'b' : n.beat < 12.2 ? 'c' : 'd'); by[k] = (by[k] || 0) + 1; } return by; });
r.voices = await p.evaluate(() => { try { return JSON.stringify(window.SYNQUENZER.voices()).slice(0, 300); } catch (e) { return String(e); } });
r.te = await p.evaluate(() => window.SYNQUENZER.tickErrors());
await p.evaluate(() => window.SYNQUENZER.stop());
// undo / redo of an MK2 edit (wave change and patch intensity)
r.undo = await p.evaluate(async () => { const Q = window.SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms));
  const n0 = Q.undoInfo().n; Q.mkSet(0, 't.0.o1.c2', 100); const a = Q.mkGet(0).t[0].o1.c2, top = Q.undoInfo().top; Q.undo(); const b_ = Q.mkGet(0).t[0].o1.c2; Q.redo(); const c = Q.mkGet(0).t[0].o1.c2; Q.undo();
  Q.mkSet(0, 't.0.p.1.i', -63); const d = Q.mkGet(0).t[0].p[1].i; Q.undo(); const e = Q.mkGet(0).t[0].p[1].i;
  Q.mkSet(0, 't.0.o1.w', 6); Q.undo(); const f = Q.mkGet(0).t[0].o1.w;
  return {n0, n1: Q.undoInfo().n, a, top, b: b_, c, d, e, f}; });
// serialize → new → import; save → load (IndexedDB); compare sounds
r.save = await p.evaluate(async () => { const Q = window.SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms));
  const snap = () => JSON.stringify(Q.project().tracks.map(t => t.sound));
  const s0 = snap(), j = Q.serialize(); await Q.newProject({init: true}); await sl(200); const ok = Q.importJSON(j); await sl(500); const s1 = snap();
  await Q.save(); Q.mkSet(0, 't.0.o1.c2', 90); Q.mkSet(2, 't.0.o1.w', 0); const ld = await Q.load(); await sl(500); const s2 = snap();
  const o = JSON.parse(j); return {ok, ld, eq1: s0 === s1, eq2: s0 === s2, fmt: o.format, app: o.appVersion, info: Q.mkInfo()}; });
// after the import: everything still plays (the stored waves come back)
await p.evaluate(() => { const Q = window.SYNQUENZER; Q.setBpm(240); Q.clearLog(); Q.launchScene(0); });
await waitBeat(2.5);
r.meter2 = await p.evaluate(async () => { const Q = window.SYNQUENZER, xs = []; for (let k = 0; k < 20; k++) { xs.push(Q.meter().rmsDb); await new Promise(r => setTimeout(r, 40)); } return Math.max(...xs.filter(isFinite)); });
r.solo = await p.evaluate(async () => { const Q = window.SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms)), o = {};
  for (let t = 0; t < 4; t++) { for (let u = 0; u < 5; u++) Q.setMute(u, u !== t); await sl(450); const xs = []; for (let k = 0; k < 12; k++) { xs.push(Q.meter().rmsDb); await sl(40); } o['t' + t] = +Math.max(...xs.filter(isFinite)).toFixed(1); }
  for (let u = 0; u < 5; u++) Q.setMute(u, false); return o; });
await waitBeat(10);
r.te2 = await p.evaluate(() => window.SYNQUENZER.tickErrors());
await p.evaluate(() => window.SYNQUENZER.stop());
// MIDI export (zip via viewer download mock)
r.midi = await p.evaluate(async () => { const Q = window.SYNQUENZER; const got = [];
  window.claude = {use: async k => (k === 'downloads' ? {save: async ({filename, data}) => { got.push({filename, bytes: Array.from(new Uint8Array(await data.arrayBuffer()))}); }} : null)};
  await Q.exportMidi({mode: 'all', scene: 0}); await new Promise(r => setTimeout(r, 800));
  const g = got[0]; if (!g) return null; const z = g.bytes; const dv = new DataView(new Uint8Array(z).buffer); let i = 0, out = [];
  while (i + 4 <= z.length && dv.getUint32(i, true) === 0x04034b50) { const m = dv.getUint16(i + 8, true), cs = dv.getUint32(i + 18, true), nl = dv.getUint16(i + 26, true), xl = dv.getUint16(i + 28, true); const name = String.fromCharCode(...z.slice(i + 30, i + 30 + nl)); const d = z.slice(i + 30 + nl + xl, i + 30 + nl + xl + cs); out.push({name, m, mthd: String.fromCharCode(...d.slice(0, 4)), names: (String.fromCharCode(...d).match(/(Synth|Drums)[^\x00-\x1f]{0,40}/g) || []).slice(0, 8)}); i += 30 + nl + xl + cs; }
  delete window.claude; return {filename: g.filename, files: out}; });
r.errs = errs.slice();
console.log(JSON.stringify(r, null, 1));
await b.close();
