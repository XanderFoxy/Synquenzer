import { open } from './lib.mjs';
const {b, p, errs} = await open();
console.log(await p.evaluate(() => ({keys: Object.keys(SYNQUENZER).filter(k => /eng|sound|set|mk|song|clip/i.test(k)).join(' '), tracks: S.tracks.map((t, i) => [i, t.name, t.kind, t.sound && t.sound.engine, t.clips.filter(Boolean).length, !!t.stimme]), bpm: S.bpm})));
console.log(errs); await b.close();
