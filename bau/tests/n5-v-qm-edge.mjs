// QA musiker VV1: first/last samples of the video sound (hard start?), selection starting mid-song, preview from a playing scene
import { open, buildSong } from './n5-v-qm-lib.mjs';
const {b, p, errs} = await open({touch: true});
await buildSong(p);
const head = async rg => p.evaluate(async rg => { const r = await SYNQUENZER.vvRender(rg ? {range: rg} : {}); const x = VV.last, L = x.ch[0], R = x.ch[1], n = x.n;
  const s = k => +Math.max(Math.abs(L[k]), Math.abs(R[k])).toFixed(4); let pk2 = 0; for (let k = 0; k < 96; k++) pk2 = Math.max(pk2, s(k));
  let pre = 0; const B = x.buf.getChannelData(0), o = Math.round(x.off * x.sr); for (let k = Math.max(0, o - 4800); k < o; k++) pre = Math.max(pre, Math.abs(B[k]));
  return {rg, first8: [0, 1, 2, 3, 4, 5, 6, 7].map(s), peakFirst2ms: pk2, peakBeforeStart100ms: +pre.toFixed(4), last4: [n - 4, n - 3, n - 2, n - 1].map(s), dur: +r.dur.toFixed(3), tail: +r.tail.toFixed(3)}; }, rg);
console.log(JSON.stringify(await head(null)));
console.log(JSON.stringify(await head({a: 6, b: 10})));
console.log(JSON.stringify(await head({a: 7, b: 9})));
// a scene plays live, the sheet opens: ▶ Vorschau, ■ Stopp → what does the app do afterwards?
const st = await p.evaluate(async () => { SYNQUENZER.launchScene(1); if (!R.playing) SYNQUENZER.play(); await new Promise(r => setTimeout(r, 1500));
  const before = {playing: R.playing, song: !!R.songPlay, slots: R.slot.slice()};
  SYNQUENZER.vvOpen(); await new Promise(r => setTimeout(r, 300));
  const inSheet = {playing: R.playing, song: !!R.songPlay};
  SYNQUENZER.vvPreview(true); await new Promise(r => setTimeout(r, 1500)); const inPrev = {playing: R.playing, song: !!R.songPlay, sb: R.songPlay ? +songBeatOf(audBeat()).toFixed(2) : null};
  SYNQUENZER.vvPreview(false); await new Promise(r => setTimeout(r, 1500)); const after = {playing: R.playing, song: !!R.songPlay, slots: R.slot.slice(), voices: VOICES.filter(v => !v.dead).length};
  SYNQUENZER.vvClose(); SYNQUENZER.stop(); return {before, inSheet, inPrev, after}; });
console.log(JSON.stringify(st));
console.log('errors', errs);
await b.close();
