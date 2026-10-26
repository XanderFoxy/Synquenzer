import {launch, open} from './v3-qa8-lib.mjs';
let fails = 0; const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info !== undefined ? ' — ' + (typeof info === 'string' ? info : JSON.stringify(info)) : '')); };
const b = await launch(); const {ctx, page: p, errs} = await open(b, 'P1');
const ex = await p.evaluate(async () => { await SYNQUENZER.libraryReady(); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0);
  mkProg.select(5, 3); SYNQUENZER.mkSet(0, 't.0.f.cut', 44); const a = await mkProg.write(6, 12, 'Meins F12');
  return JSON.stringify(LIB.lib.exportFile([a.id])); });
console.log('file', ex.slice(0, 120), /"bank":6/.test(ex), /"slot":12/.test(ex));
await ctx.close();
const {ctx: c2, page: p2, errs: e2} = await open(b, 'P1');
const im = await p2.evaluate(async ex => { await SYNQUENZER.libraryReady(); let r; try { r = await SYNQUENZER.importSounds(ex); } catch (e) { r = 'ERR ' + e; } await new Promise(r => setTimeout(r, 300)); const x = SYNQUENZER.library().find(s => s.name === 'Meins F12'); mkLoad(); return {r: JSON.stringify(r).slice(0, 200), x: x && {bank: x.bank, slot: x.slot}, own: window.MKF && MKF.ownAt(6, 12) && MKF.ownAt(6, 12).name}; }, ex);
ok('sounds file → import (fresh device): bank/slot kept, place F12 = own', im.x && im.x.bank === 6 && im.x.slot === 12 && im.own === 'Meins F12', im);
// import the same file again: dedupe (hash) → skipped; and import a file with a different sound on the same place: place dropped
const im2 = await p2.evaluate(async ex => { const j = JSON.parse(ex); j.sounds[0].p.mk.t[0].f.cut = 90; j.sounds[0].name = 'Anderer F12'; await SYNQUENZER.importSounds(JSON.stringify(j)); await new Promise(r => setTimeout(r, 300));
  const y = SYNQUENZER.library().find(s => s.name === 'Anderer F12'); return {y: y && {bank: y.bank, slot: y.slot}, own: MKF.ownAt(6, 12).name}; }, ex);
ok('second sound for an occupied place: imported without place', im2.y && im2.y.bank == null && im2.own === 'Meins F12', im2);
ok('console', errs.length === 0 && e2.length === 0, errs.concat(e2));
console.log(fails ? 'FAIL ' + fails : 'ALL PASS');
await b.close();
