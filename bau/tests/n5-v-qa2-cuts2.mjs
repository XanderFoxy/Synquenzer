import { open } from './n5-v-lib.mjs';
const {b, p, errs} = await open();
const r = await p.evaluate(() => {
  const out = {};
  const L = [[{bar: 0, slot: 0}], [{bar: 0, slot: 0}], [], [], [{bar: 0, slot: 0}], []];
  // A: one 13-bar part, no entry → auto; then bars 4–8 → Song
  SYNQUENZER.setSong({bars: 13, lanes: L, carrier: [], mel: {}, marks: [{id: 'm1', a: 0, len: 13, name: 'Strophe'}]});
  out.A_auto = SYNQUENZER.vvCuts({range: {a: 0, b: 13}}).shots.map(s => (s.a + 1) + '–' + s.b + ' ' + s.v);
  SYNQUENZER.vvDirSet(3, 8, 'song');
  out.A_user = SYNQUENZER.vvCuts({range: {a: 0, b: 13}}).shots.map(s => (s.a + 1) + '–' + s.b + ' ' + s.v);
  // B: 16-bar part, bars 1–4 → Song (the Song entry at the part start)
  SYNQUENZER.setSong({bars: 16, lanes: L, carrier: [], mel: {}, marks: [{id: 'm1', a: 0, len: 16, name: 'Strophe'}]});
  out.B_auto = SYNQUENZER.vvCuts({range: {a: 0, b: 16}}).shots.map(s => (s.a + 1) + '–' + s.b + ' ' + s.v);
  SYNQUENZER.vvDirSet(0, 4, 'song');
  out.B_user = SYNQUENZER.vvCuts({range: {a: 0, b: 16}}).shots.map(s => (s.a + 1) + '–' + s.b + ' ' + s.v);
  // C: short auto shots next to an entry: 16-bar part, entry Matrix on bars 2–8 → bar 1 alone?
  SYNQUENZER.setSong({bars: 16, lanes: L, carrier: [], mel: {}, marks: [{id: 'm1', a: 0, len: 16, name: 'Strophe'}]});
  SYNQUENZER.vvDirSet(1, 8, 'matrix');
  out.C_user = SYNQUENZER.vvCuts({range: {a: 0, b: 16}}).shots.map(s => (s.a + 1) + '–' + s.b + ' ' + s.v);
  return out;
});
console.log(JSON.stringify(r, null, 1)); console.log('errs', errs);
await b.close();
