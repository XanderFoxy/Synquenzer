import { openT, waitSong, SETUP } from './v3-qa2d2-lib.mjs';
const {b, p, errs} = await openT({width: 390, height: 844}, false);
await p.evaluate(SETUP(true));
await p.evaluate(() => { window.SYNQUENZER.selectTrack(1); });
const r0 = await p.evaluate(() => {
  const tr = [];
  const o1 = window.takeMuteNow; window.takeMuteNow = mu => { tr.push({fn: 'takeMuteNow', ctxT: AU.ctx && AU.ctx.currentTime, st: R.startTime, sched: R.schedBeat, playing: R.playing, sp: !!R.songPlay, off: R.songPlay && R.songPlay.off, voices: VOICES.filter(v => v.track === 1).map(v => v.start)}); return o1(mu); };
  const o2 = window.cancelTrackFrom; window.cancelTrackFrom = (i, t) => { tr.push({fn: 'cancel', i, t, voices: VOICES.filter(v => v.track === 1).map(v => [v.start, v.src, v.dead])}); return o2(i, t); };
  window.SYNQUENZER.clearLog(); window.SYNQUENZER.songRecFrom({from: 3, mode: 'over', targets: {clips: false, chords: false, notes: true}, preroll: 0});
  tr.push({after: VOICES.filter(v => v.track === 1).map(v => [v.start, v.src, v.dead]), st: R.startTime, ctxT: AU.ctx.currentTime});
  return tr; });
console.log(JSON.stringify(r0, null, 0));
await b.close();
