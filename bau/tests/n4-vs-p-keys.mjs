import {open} from './n4-vs-p-h.mjs';
const H = await open({file: process.argv[2]}); const p = H.p;
console.log(await p.evaluate(() => Object.keys(SYNQUENZER).filter(k => /scene|slot|bpm|metro|launch|rec|vol|fx/i.test(k)).join(' ')));
console.log(await p.evaluate(() => { SYNQUENZER.loadDemo(); return {song: !!S.song, scenes: S.scenes.length, clips: S.tracks.map(t => t.clips.map(c => c ? c.len : 0).join('')), bpm: S.bpm, vols: S.tracks.map(t => t.sound.fx.vol)}; }));
await H.br.close();
