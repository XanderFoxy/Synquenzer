import {clean} from './clean.mjs';
import * as T from './test-signals.mjs';
const sr = 48000, dur = 20;
const S = T.song(sr, dur, {seed: 3});
const nz = T.noise(sr, dur, +process.argv[2] || 0.0003);
const mic = new Float32Array(S.x.length); for (let i = 0; i < mic.length; i++) mic[i] = S.x[i] + nz[i];
const inV = new Uint8Array(mic.length); for (let i = 0; i < mic.length; i++) inV[i] = Math.abs(S.x[i]) > 0 ? 1 : 0;
const inP = new Uint8Array(mic.length);
for (const [a, b] of S.silences) for (let i = Math.round((a + 0.1) * sr); i < Math.min(mic.length, Math.round((b - 0.05) * sr)); i++) inP[i] = 1;
const gain = (o) => { let vv = 0, vo = 0; for (let i = 0; i < o.length; i++) if (inV[i]) { vv += S.x[i] * S.x[i]; vo += S.x[i] * o[i]; } return 20 * Math.log10(vo / vv); };
const pw = (z, m) => { let s = 0, c = 0; for (let i = 0; i < z.length; i++) if (m[i]) { s += z[i] * z[i]; c++; } return s / c; };
for (const nr of [undefined, [0.05, 0.55]]) { const out = clean(mic, null, sr, {amount: 1, noiseRange: nr}); 
 let e=0,v=0; for (let i=0;i<out.length;i++){const d=out[i]-S.x[i]; e+=d*d; v+=S.x[i]*S.x[i];}
 console.log(nr, 'gain', gain(out).toFixed(2), 'noiseRed', T.db(pw(nz, inP) / pw(out, inP)).toFixed(1), 'SDR', T.db(v/e).toFixed(1)); }
