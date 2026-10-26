// QA MK8 persist: WRITE → reload (IndexedDB) keeps bank/slot; project autosave restores the track program; exportSounds/importSounds
import {launch, open, FILE} from './v3-qa8-lib.mjs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0; const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info !== undefined ? ' — ' + (typeof info === 'string' ? info : JSON.stringify(info)) : '')); };
const b = await launch(); const {ctx, page: p, errs} = await open(b, 'P1');
const w1 = await p.evaluate(async () => {
  await SYNQUENZER.libraryReady(); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0);
  mkProg.select(5, 3); SYNQUENZER.mkSet(0, 't.0.f.cut', 44); const a = await mkProg.write(6, 12, 'Meins F12');
  SYNQUENZER.setEngine(1, 'mk'); SYNQUENZER.selectTrack(1); mkProg.select(2, 7);   // track 1 a factory program
  await SYNQUENZER.save(); await new Promise(r => setTimeout(r, 1500));
  return {a: {id: a.id, bank: a.bank, slot: a.slot}, t0: S.tracks[0].sound.origin, t1: S.tracks[1].sound.origin, snd0: JSON.stringify(S.tracks[0].sound), snd1: JSON.stringify(S.tracks[1].sound), lib: JSON.stringify(SYNQUENZER.library())};
});
console.log('written', JSON.stringify(w1.a), w1.t0, w1.t1);
await p.reload(); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000}); await sleep(1500);
const r1 = await p.evaluate(async () => { await SYNQUENZER.libraryReady(); const L = SYNQUENZER.library(); const x = L.find(s => s.name === 'Meins F12');
  SYNQUENZER.selectTrack(0); const c0 = mkProg.current(); SYNQUENZER.selectTrack(1); const c1 = mkProg.current();
  return {x: x && {id: x.id, bank: x.bank, slot: x.slot}, lib: JSON.stringify(L), snd0: JSON.stringify(S.tracks[0].sound), snd1: JSON.stringify(S.tracks[1].sound), c0, c1, own: MKF.ownAt(6, 12) && MKF.ownAt(6, 12).id, ed0: SYNQUENZER.soundEdited(0), ed1: SYNQUENZER.soundEdited(1)}; });
ok('reload: library record keeps bank/slot', r1.x && r1.x.bank === 6 && r1.x.slot === 12 && r1.lib === w1.lib, {x: r1.x, libEq: r1.lib === w1.lib});
ok('reload: track sounds deep-equal', r1.snd0 === w1.snd0 && r1.snd1 === w1.snd1);
ok('reload: current() F12 own on t0, B07 on t1, not edited', r1.c0 && r1.c0.label === 'F12' && r1.c0.own && r1.c1 && r1.c1.label === 'B07' && !r1.ed0 && !r1.ed1, {c0: r1.c0, c1: r1.c1, ed0: r1.ed0, ed1: r1.ed1});
// exportSounds → importSounds in a fresh context
const ex = await p.evaluate(async () => { const L = SYNQUENZER.library(); const x = L.find(s => s.name === 'Meins F12'); let r; try { r = await SYNQUENZER.exportSounds([x.id]); } catch (e) { r = 'ERR ' + e; } return typeof r === 'string' ? r : JSON.stringify(r); });
console.log('exportSounds returns', String(ex).slice(0, 200));
await ctx.close();
const {ctx: c2, page: p2, errs: e2} = await open(b, 'P1');
const im = await p2.evaluate(async ex => { await SYNQUENZER.libraryReady(); let r; try { r = await SYNQUENZER.importSounds(ex); } catch (e) { r = 'ERR ' + e; } const x = SYNQUENZER.library().find(s => s.name === 'Meins F12'); return {r: JSON.stringify(r).slice(0, 200), x: x && {bank: x.bank, slot: x.slot}}; }, ex);
ok('exportSounds → importSounds (fresh device): bank/slot kept', im.x && im.x.bank === 6 && im.x.slot === 12, im);
ok('console', errs.length === 0 && e2.length === 0, errs.concat(e2));
console.log(fails ? 'FAIL ' + fails : 'ALL PASS');
await b.close();
