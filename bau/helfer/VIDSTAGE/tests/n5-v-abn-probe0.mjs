import { open } from './n5-v-abn-lib.mjs';
const {b, p, errs} = await open();
const r = await p.evaluate(() => ({ver: SYNQUENZER.version, song: S.song ? {bars: S.song.bars, marks: S.song.marks.length, lanes: S.song.lanes.map(l => l.length)} : null, bpm: S.bpm, nt: NT(), names: S.tracks.map(t => t.name + ':' + (t.kind||'') + ':' + t.clips.filter(Boolean).length),
  ve: typeof VideoEncoder, ae: typeof AudioEncoder, mr: typeof MediaRecorder, keys: Object.keys(SYNQUENZER).filter(k => /^vv|setSong|songSelect|demo/i.test(k))}));
console.log(JSON.stringify(r, null, 1));
console.log(JSON.stringify(await p.evaluate(async () => [await SYNQUENZER.vvPath('9:16'), await AudioEncoder.isConfigSupported({codec:'mp4a.40.2', sampleRate:48000, numberOfChannels:2, bitrate:192000}).then(x=>x.supported), MediaRecorder.isTypeSupported('video/mp4;codecs=avc1,mp4a'), MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')])));
console.log(errs); await b.close();
