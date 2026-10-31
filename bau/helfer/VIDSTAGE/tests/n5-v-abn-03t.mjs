// VV1-02: tail – moderate and extreme hall/echo; the end of the sound (no hard cut), cap 10 s
import { open, SONG8, OUT } from './n5-v-abn-lib.mjs';
import { pcmOf } from './n5-v-lufs.mjs';
import fs from 'fs';
const {b, p, errs} = await open();
await p.evaluate(s => SYNQUENZER.setSong(s), SONG8);
const res = {};
for (const [name, hall, fb, rev, dly] of [['mild', 4, .45, .5, .35], ['extrem', 30, .95, 1, 1]]) {
  const x = await p.evaluate(async ([hall, fb, rev, dly]) => {
    S.fxBus.hall.decay = hall; S.fxBus.hall.ret = 1; S.fxBus.echo.fb = fb; for (const tr of S.tracks) if (tr.sound && tr.sound.fx) { tr.sound.fx.rev = rev; tr.sound.fx.dly = dly; }
    applyFxBus(); for (let i = 0; i < NT(); i++) applyTrackParams(i, true);
    const r = await SYNQUENZER.vvRender(); return {dur: r.dur, songSec: r.songSec, tail: r.tail, capped: r.capped, hallNow: JSON.stringify(S.fxBus.hall)};
  }, [hall, fb, rev, dly]);
  const pc = await p.evaluate(() => SYNQUENZER.vvPcm()); const {L, R} = pcmOf(pc.b64), sr = pc.sr, n = L.length;
  const pk = (a, bb) => { let m = 0; for (let k = Math.max(0, a); k < Math.min(n, bb); k++) m = Math.max(m, Math.abs(L[k]), Math.abs(R[k])); return 20 * Math.log10(m + 1e-12); };
  const sEnd = Math.round(x.songSec * sr);
  // envelope of the last second in 100-ms steps
  const env = []; for (let t = Math.max(0, x.dur - 1.2); t < x.dur - 1e-6; t += .1) env.push(+pk(Math.round(t * sr), Math.round((t + .1) * sr)).toFixed(1));
  // biggest sample step in the last 200 ms vs the median step there
  res[name] = Object.assign(x, {songEndPeak: +pk(sEnd - 2400, sEnd + 2400).toFixed(1), last20ms: +pk(n - 960, n).toFixed(1), lastSample: +(20 * Math.log10(Math.max(Math.abs(L[n - 1]), Math.abs(R[n - 1])) + 1e-12)).toFixed(1), env});
}
res.errs = errs; console.log(JSON.stringify(res, null, 1)); await b.close();
