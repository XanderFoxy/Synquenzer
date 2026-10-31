// selection end in the middle of a sung take (STIMME clip, 2 bars, a 4-s tone): does the sound stop at the end of the selection (+ hall tail) or does the take sing on?
import { open, OUT } from './n5-v-abn-lib.mjs';
import { pcmOf } from './n5-v-lufs.mjs';
const {b, p, errs} = await open();
const setup = await p.evaluate(async () => {
  const A = SYNQUENZER, sr = 48000, n = sr * 4, pcm = new Array(n);
  for (let k = 0; k < n; k++) { const t = k / sr; pcm[k] = Math.round(9000 * Math.sin(2 * Math.PI * 220 * t) * Math.min(1, t * 50, (4 - t) * 50)); }
  const r = await A.tkInject({pcm, sr, scene: 0, len: 2});
  const st = stimmeT(); const lanes = []; for (let i = 0; i < NT(); i++) lanes.push([]); lanes[st] = [{bar: 0, slot: 0}];
  A.setSong({bars: 4, lanes, carrier: [], mel: {}, marks: []});
  S.fxBus.hall.ret = 0; S.fxBus.echo.fb = 0; for (const tr of S.tracks) if (tr.sound && tr.sound.fx) { tr.sound.fx.rev = 0; tr.sound.fx.dly = 0; } applyFxBus(); for (let i = 0; i < NT(); i++) applyTrackParams(i, true);
  await new Promise(r => setTimeout(r, 500));
  return {st, r, nt: NT()};
});
const res = {setup};
const sp = 60 / 112, bar = 4 * sp;
for (const [name, range] of [['sel-bar1', {a: 0, b: 1}], ['whole', null]]) {
  const x = await p.evaluate(async range => { const r = await SYNQUENZER.vvRender(range ? {range} : {}); return {dur: r.dur, songSec: r.songSec, tail: r.tail}; }, range);
  const pc = await p.evaluate(() => SYNQUENZER.vvPcm()); const {L, R} = pcmOf(pc.b64), sr = pc.sr;
  const db = (t0, t1) => { let s = 0, n = 0; for (let k = Math.round(t0 * sr); k < Math.min(L.length, Math.round(t1 * sr)); k++) { s += L[k] * L[k] + R[k] * R[k]; n += 2; } return n ? +(10 * Math.log10(s / n + 1e-12)).toFixed(1) : null; };
  res[name] = Object.assign(x, {rms_0_1: db(.2, 1), rms_before_end: db(bar - .3, bar - .05), rms_after_end_100_400ms: db(bar + .1, bar + .4), rms_2_5_3_5: db(2.5, 3.5), rms_3_5_3_9: db(3.5, 3.9)});
}
res.errs = errs; console.log(JSON.stringify(res, null, 1)); await b.close();
