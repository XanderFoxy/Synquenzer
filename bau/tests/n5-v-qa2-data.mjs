// QA VV2-02: more edits – remove track with an entry, part copy/×2/move, Auto → identical, undo deep-equal, save → load deep-equal
import { open } from './n5-v-lib.mjs';
const SONG16 = {bars: 16, lanes: [[{bar: 0, slot: 0}, {bar: 8, slot: 1}], [{bar: 0, slot: 0}], [{bar: 2, slot: 0}, {bar: 14, slot: -1}], [], [{bar: 0, slot: 0}, {bar: 8, slot: 1}], [], []],
  carrier: [], mel: {}, marks: [{id: 'm1', a: 0, len: 8, name: 'Strophe'}, {id: 'm2', a: 8, len: 8, name: 'Refrain'}]};
const {b, p, errs} = await open();
const r = await p.evaluate(s => {
  const out = {}, strip = x => x.replace(/"sum":"[0-9a-f]+"/g, '').replace(/"id":"p-[a-z0-9-]+"/g, '');
  SYNQUENZER.setSong(s);
  // 1) Matrix then Auto → song string identical
  const s0 = JSON.stringify(S.song);
  SYNQUENZER.vvDirSet(8, 16, 'matrix'); SYNQUENZER.vvDirSet(8, 16, 'auto');
  out.autoIdentical = JSON.stringify(S.song) === s0;
  // 2) part copy / ×2 / move
  SYNQUENZER.vvDirSet(8, 12, 'spur', 2);
  const id2 = S.song.marks.find(m => m.name === 'Refrain').id;
  for (const [k, arg] of [['copy', null], ['rep', 2], ['move', 0]]) {
    const b0 = JSON.stringify(S.song); markAction(id2, k, arg); const d = SYNQUENZER.vvDirGet(), marks = S.song.marks.map(m => [m.name, m.a, m.len]); undo(); out[k] = {dir: d, marks, undoEq: JSON.stringify(S.song) === b0};
  }
  // 3) add a track, entry on it, remove it
  const nt0 = S.tracks.length, i = SYNQUENZER.addTrack();
  S.tracks[i].clips[0] = JSON.parse(JSON.stringify(S.tracks[0].clips[0]));
  S.song.lanes[i] = [{bar: 0, slot: 0}];
  SYNQUENZER.vvDirSet(0, 4, 'spur', i);
  const before = SYNQUENZER.vvDirGet();
  const rm = SYNQUENZER.removeTrack(i);
  out.removeTrack = {i, rm, nt: S.tracks.length, dirAfterRemove: SYNQUENZER.vvDirGet(), cutsAfter: SYNQUENZER.vvCuts({range: {a: 0, b: 16}}).shots.map(x => [x.a, x.b, x.v, x.t])};
  // save → load after removing: deep-equal?
  const f1 = serialize(); const songBefore = JSON.stringify(S.song);
  applyProject(normalizeProject(projFromFile(JSON.parse(f1))), {});
  out.removeTrack.loadEq = JSON.stringify(S.song) === songBefore; out.removeTrack.dirAfterLoad = SYNQUENZER.vvDirGet();
  out.removeTrack.fileEq = strip(serialize()) === strip(f1);
  // add a new track again: does the old entry now point at the new track?
  return out;
}, SONG16);
console.log(JSON.stringify(r, null, 1)); console.log('errs', errs);
await b.close();
