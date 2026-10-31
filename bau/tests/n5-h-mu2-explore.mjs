import {open, sleep, OUT, summ} from './n5-h-mu2-lib.mjs';
const T = await open({vp: [390, 844]});
const {p, E} = T;
await p.screenshot({path: OUT + '/explore-start.png'});
console.log(JSON.stringify(await E(() => ({v: SYNQUENZER.version, h: SYNQUENZER.history(), rt: SYNQUENZER.runtime().history, name: S.name, id: S.id, tracks: S.tracks.map(t => t.name + ':' + (t.sound && t.sound.engine) + ':' + t.clips.filter(Boolean).length), scenes: NS(), parts: (S.parts||[]).filter(Boolean).map(p=>p.name), song: S.song && {bars: S.song.bars}, takes: Object.keys(S.takes||{}).length, sz: serializeProject().length}))));
await sleep(2500);
console.log(JSON.stringify(await E(() => SYNQUENZER.history())), await T.hc());
console.log(T.errs);
await T.b.close();
