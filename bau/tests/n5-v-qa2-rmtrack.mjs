import { open } from './n5-v-lib.mjs';
const SONG16 = {bars: 16, lanes: [[{bar: 0, slot: 0}, {bar: 8, slot: 1}], [{bar: 0, slot: 0}], [{bar: 2, slot: 0}, {bar: 14, slot: -1}], [], [{bar: 0, slot: 0}, {bar: 8, slot: 1}], []],
  carrier: [], mel: {}, marks: [{id: 'm1', a: 0, len: 8, name: 'Strophe'}, {id: 'm2', a: 8, len: 8, name: 'Refrain'}]};
const {b, p, errs} = await open({w: 390, h: 844});
const r = await p.evaluate(s => {
  SYNQUENZER.setSong(s); setSongView(true);
  const i = SYNQUENZER.addTrack(); S.tracks[i].clips[0] = JSON.parse(JSON.stringify(S.tracks[0].clips[0]));
  const sb = songSnapshot(); S.song.lanes[i] = [{bar: 0, slot: 0}]; pushSongUndo(sb, 'lane'); songChanged();
  SYNQUENZER.vvDirSet(0, 4, 'spur', i);
  const nm1 = S.tracks[i].name;
  SYNQUENZER.removeTrack(i);
  const afterRm = {nt: S.tracks.length, dir: SYNQUENZER.vvDirGet(), stripe: SV.vvS};
  // a new track at the same index
  const j = SYNQUENZER.addTrack(); S.tracks[j].clips[0] = JSON.parse(JSON.stringify(S.tracks[1].clips[0]));
  const sb2 = songSnapshot(); S.song.lanes[j] = [{bar: 0, slot: 0}]; pushSongUndo(sb2, 'lane'); songChanged();
  return {i, j, removed: nm1, newName: S.tracks[j].name, afterRm, dirNow: SYNQUENZER.vvDirGet(), ofBars1to4: SYNQUENZER.vvDirOf(0, 4), cuts: SYNQUENZER.vvCuts({range: {a: 0, b: 16}}).shots.map(x => [x.a + 1 + '–' + x.b, x.v, x.t, x.why])};
}, SONG16);
console.log(JSON.stringify(r)); console.log('errs', errs);
await b.close();
