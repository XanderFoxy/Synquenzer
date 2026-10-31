import { open } from './lib.mjs';
const {b, p, errs} = await open();
console.log(await p.evaluate(() => ({n: S.tracks.length, tr: S.tracks.map((t, i) => [i, t.name, t.kind, t.stimme, t.sound && t.sound.engine, t.sound && t.sound.name]), DRUM_T, st: stimmeT(), bpm: S.bpm, song: S.song, keys: Object.keys(SYNQUENZER).filter(k => /vv|mk|tk|set|clip|Clip|song|Song|serial/i.test(k))})));
console.log(errs);
await b.close();
