import {clean, Cleaner} from './clean.mjs';
import * as T from './test-signals.mjs';
const sr = 48000;
// alignment: notes way, no ref → output should equal input
const x = T.noise(sr, 1, 0.1);
const y = clean(x, null, sr, {way: 'notes', passes: 1});
let md = 0; for (let i = 0; i < x.length; i++) md = Math.max(md, Math.abs(x[i] - y[i]));
console.log('notes-way identity maxdiff', md);
// echo scenario
const dur = 20;
const S = T.song(sr, dur, {seed: 3});
const ref = T.playback(sr, dur, {calib: 1});
const ir = T.roomIR(sr, 0.08, 0.3);
const echo = T.convolve(T.hp1(ref, sr, 250), ir);
const mic = new Float32Array(S.x.length);
const nz = T.noise(sr, dur, 0.0003);
for (let i = 0; i < mic.length; i++) mic[i] = S.x[i] + echo[i] + nz[i];
console.log('voice rms', T.rms(S.x), 'echo rms', T.rms(echo));
const info = {};
let t = Date.now();
const out = clean(mic, ref, sr, {amount: 1, info});
console.log('ms', Date.now() - t, info);
const e1 = clean(mic, ref, sr, {way: 'notes', info: {}});
// pause mask: silences
const inPause = new Uint8Array(mic.length);
for (const [a, b] of S.silences) for (let i = Math.round((a + 0.1) * sr); i < Math.min(mic.length, Math.round((b - 0.05) * sr)); i++) inPause[i] = 1;
for (let i = 0; i < 2 * sr; i++) inPause[i] = 0;
const pw = (z, msk) => { let s = 0, c = 0; for (let i = 0; i < z.length; i++) if (msk[i]) { s += z[i] * z[i]; c++; } return s / c; };
console.log('pause echo red hear', T.db(pw(echo, inPause) / pw(out, inPause)), 'notes', T.db(pw(echo, inPause) / pw(e1, inPause)));
let vv = 0, vo = 0; for (let i = 2 * sr; i < mic.length; i++) { vv += S.x[i] * S.x[i]; vo += S.x[i] * out[i]; }
console.log('voice gain dB', 20 * Math.log10(vo / vv));
