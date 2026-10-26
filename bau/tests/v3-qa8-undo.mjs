import {launch, open} from './v3-qa8-lib.mjs';
const b = await launch(); const {page: p, errs} = await open(b, 'P1');
const r = await p.evaluate(async () => {
  const w = ms => new Promise(r => setTimeout(r, ms));
  await SYNQUENZER.libraryReady(); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); await w(300);
  const snap = () => ({s: JSON.stringify(S.tracks[0].sound), lib: JSON.stringify(SYNQUENZER.library().map(x => [x.id, x.bank, x.slot, x.name]).sort()), u: SYNQUENZER.undoInfo().n, top: SYNQUENZER.undoInfo().top && SYNQUENZER.undoInfo().top.label});
  const states = [snap()];
  mkProg.step(1); await w(100); states.push(snap());                 // A01
  mkProg.step(1); await w(100); states.push(snap());                 // A02
  SYNQUENZER.mkSet(0, 't.0.f.cut', 21); await w(100); states.push(snap());
  await mkProg.write(3, 5); await w(100); states.push(snap());
  mkProg.step(1); await w(100); states.push(snap());                 // C06
  mkProg.step(-1); await w(100); states.push(snap());                // C05 own
  const back = []; for (let k = 0; k < 6; k++) { SYNQUENZER.undo(); await w(150); back.push(snap()); }
  const fwd = []; for (let k = 0; k < 6; k++) { SYNQUENZER.redo(); await w(150); fwd.push(snap()); }
  const N = states.length - 1, rep = [];
  for (let k = 0; k < 6; k++) { const want = states[N - 1 - k], got = back[k]; rep.push({undo: k + 1, top: got.top, sEq: got.s === want.s, libEq: got.lib === want.lib}); }
  for (let k = 0; k < 6; k++) { const want = states[N - 5 + k], got = fwd[k]; rep.push({redo: k + 1, sEq: got.s === want.s, libEq: got.lib === want.lib, sd: got.s === want.s ? '' : [got.s.slice(0, 200), want.s.slice(0, 200)]}); }
  return {rep, tops: states.map(s => s.top + '/' + s.u)};
});
console.log(JSON.stringify(r.tops));
for (const x of r.rep) console.log(JSON.stringify(x));
console.log(errs);
await b.close();
