import {open, sleep, APP} from './n4-vs-p-qa-h.mjs';
const H = await open({file: process.argv[2] || APP}), p = H.p;
const r = await p.evaluate(() => { SYNQUENZER.loadDemo(); return {bpm: S.bpm, tracks: S.tracks.map((t, i) => ({i, name: t.name, kind: t.kind, eng: t.sound && t.sound.engine, snd: t.sound && t.sound.name, vol: t.sound && t.sound.fx && t.sound.fx.vol, pan: t.sound && t.sound.fx && t.sound.fx.pan, mel: !!t.mel, clips: t.clips.map(c => c ? (c.audio ? 'A' : c.len) : '-').join(',')}))}; });
console.log(JSON.stringify(r, null, 1));
await H.br.close();
