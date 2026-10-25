import { openVp, mk, SETUP } from './v3-qa-v2e-lib.mjs';
const {b, p, errs, cdp} = await openVp('P1');
const {E} = mk(p, cdp);
await E(SETUP(false));
console.log(await E(() => {
  const lanes = [[{bar: 0, slot: 0, re: 1}], [{bar: 0, slot: -1}]];
  const p = {id: 'S1', lanes, chords: null, xp: null, slots: [null, null]};
  partLanesFix(p);
  const lanes2 = S.tracks.map((t, i) => [t.clips[0] ? {bar: 0, slot: 0, re: 1} : {bar: 0, slot: -1}]);
  const ch = partChunk({id: 'S1', lanes: lanes2.map(l => l.map(e => Object.assign({}, e))), chords: null, xp: null, slots: lanes2.map(() => null)});
  return JSON.stringify({afterFix: lanes, copyIntact: lanes2, partChunkOwnLanes: ch.lanes});
}));
await b.close();
