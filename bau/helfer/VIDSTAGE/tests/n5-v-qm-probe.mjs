import { open } from './n5-v-qa-lib.mjs';
const {b, p, errs} = await open({touch: true});
const r = await p.evaluate(() => ({ver: typeof VERSION !== 'undefined' ? VERSION : null, NT: NT(), NS: NS(), tracks: S.tracks.map((t, i) => ({i, name: t.name, kind: t.kind, eng: t.sound && t.sound.engine, clips: t.clips.map(c => c ? (c.audio ? 'A' : (c.notes ? c.notes.length : '?')) : null)})), song: S.song ? {bars: S.song.bars, marks: S.song.marks.length, carrier: S.song.carrier.length} : null, bpm: S.bpm,
  api: Object.keys(SYNQUENZER).filter(k => /song|Song|mel|Mel|carrier|Carrier|chord|take|Take|tk|undo|redo|load|save|serial|arp|Arp|engine|Engine|scene|Scene/.test(k)).join(' ')}));
console.log(JSON.stringify(r, null, 1)); console.log(errs);
await b.close();
