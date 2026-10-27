import {clean} from '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vs-dsp/clean.mjs';
import * as T from '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vs-dsp/test-signals.mjs';
const sr = 48000;
function scene(dur, {seed = 3, delay = 0.08, echoDb = 0, snr = 50, calib = 0, sat = false} = {}) {
  const S = T.song(sr, dur, {seed}); const ref = T.playback(sr, dur, {calib, seed: seed + 1});
  let sp = T.hp1(ref, sr, 250); if (sat) sp = sp.map(v => Math.tanh(2.5 * v) / 2.5);
  const echo = T.convolve(sp, T.roomIR(sr, delay, 0.3, {seed: seed + 2}));
  const g = T.rms(S.x) / T.rms(echo) * Math.pow(10, echoDb / 20); for (let i = 0; i < echo.length; i++) echo[i] *= g;
  const nz = T.noise(sr, dur, T.rms(S.x) * Math.pow(10, -snr / 20), seed + 3);
  const mic = new Float32Array(S.x.length); for (let i = 0; i < mic.length; i++) mic[i] = S.x[i] + echo[i] + nz[i];
  return {S, ref, echo, mic};
}
const sc = scene(16, {echoDb: 6, sat: true, seed: 41}), cut = Math.round(6 * sr), from = Math.round(8 * sr);
const sdr = (o, a = from, b = o.length) => { let v = 0, e = 0; for (let i = a; i < b; i++) { v += sc.S.x[i] ** 2; e += (o[i] - sc.S.x[i]) ** 2; } return +T.db(v / e).toFixed(1); };
const per = o => { const r = []; for (let a = 0; a + sr <= o.length; a += 2 * sr) r.push(sdr(o, a, a + 2 * sr)); return r.join(' '); };
const chg = Float32Array.from(sc.mic, (v, i) => i < cut ? v - sc.echo[i] : v);
for (const [lab, mic, o] of [['steady', sc.mic, {}], ['steady from', sc.mic, {from: from - sr / 2}], ['change', chg, {}], ['change from', chg, {from: from - sr / 2}]]) {
  const info = {}, y = clean(mic, sc.ref, sr, Object.assign({way: 'notes', info}, o)); console.log(lab.padEnd(22), sdr(y), '| per 2 s:', per(y), JSON.stringify(info));
}
