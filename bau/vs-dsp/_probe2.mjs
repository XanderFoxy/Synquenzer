import * as T from './test-signals.mjs';
const E = process.env; if (E.POST) globalThis.__POST = +E.POST; if (E.Q) globalThis.__Q = +E.Q;
const {clean} = await import('./clean.mjs');
const sr = 48000, dur = 20;
const S = T.song(sr, dur, {seed: 3});
const ref0 = T.playback(sr, dur, {calib: +E.CAL || 0});
const ir = T.roomIR(sr, 0.08, 0.3);
let echo = T.convolve(T.hp1(ref0, sr, 250), ir);
const g = T.rms(S.x) / T.rms(echo) * Math.pow(10, (+E.ECHO || 0) / 20); for (let i = 0; i < echo.length; i++) echo[i] *= g;
const nz = T.noise(sr, dur, +E.NZ || 0.0003);
const mic = new Float32Array(S.x.length); for (let i = 0; i < mic.length; i++) mic[i] = S.x[i] + echo[i] + nz[i];
const inPause = new Uint8Array(mic.length), inV = new Uint8Array(mic.length);
for (const [a, b] of S.silences) for (let i = Math.round((a + 0.1) * sr); i < Math.min(mic.length, Math.round((b - 0.05) * sr)); i++) inPause[i] = 1;
for (let i = 0; i < mic.length; i++) inV[i] = Math.abs(S.x[i]) > 0 ? 1 : 0;
const pw = (z, m) => { let s = 0, c = 0; for (let i = 0; i < z.length; i++) if (m[i]) { s += z[i] * z[i]; c++; } return s / c; };
const gain = (o) => { let vv = 0, vo = 0; for (let i = 0; i < o.length; i++) if (inV[i]) { vv += S.x[i] * S.x[i]; vo += S.x[i] * o[i]; } return 20 * Math.log10(vo / vv); };
for (const [lab, o] of [["notes", {way: "notes"}], ["hear", {amount: 1}]]) {
  if (E.RL) o.relearn = +E.RL;
  const info = {}; const out = clean(mic, ref0, sr, {...o, info});
  const res = new Float32Array(out.length); for (let i = 0; i < out.length; i++) res[i] = out[i] - S.x[i];
  console.log(lab, 'pauseRed', T.db(pw(echo, inPause) / pw(out, inPause)).toFixed(1), 'voiceRegionRed', T.db(pw(echo, inV) / pw(res, inV)).toFixed(1), 'gain', gain(out).toFixed(2), info.ms, info.leak, info.echoDb);
}
