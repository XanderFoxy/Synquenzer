import { open, SONG8 } from './n5-v-lib.mjs';
const {b, p, errs} = await open();
const r = await p.evaluate(async (song) => {
  const A = SYNQUENZER; A.setSong(song);
  const proj0 = A.serialize ? JSON.stringify(A.serialize()) : JSON.stringify(S);
  const rs = () => JSON.stringify({slot: R.slot, cstart: R.cstart, playing: R.playing, runId: R.runId, songPlay: R.songPlay, tl: T.timeline.length, voices: VOICES.length, hits: HITS.length, au: Object.keys(AU).map(k => k + ':' + (AU[k] && AU[k].constructor ? AU[k].constructor.name : AU[k])).join(','), ctx: AU.ctx === window.__c});
  window.__c = AU.ctx;
  const r0 = rs();
  const t = performance.now();
  const res = await A.vvRender();
  const dt = performance.now() - t;
  const r1 = rs();
  const proj1 = A.serialize ? JSON.stringify(A.serialize()) : JSON.stringify(S);
  return {res: Object.assign({}, res, {log: res.log ? res.log.length : null, tl: res.tl}), dt, sameR: r0 === r1, r0, r1, sameProj: proj0 === proj1, timerOk: !!AU.timer, logSample: res.log ? res.log.slice(0, 8) : null};
}, SONG8);
console.log(JSON.stringify(r, null, 1).slice(0, 5000));
console.log('errors', errs);
await b.close();
