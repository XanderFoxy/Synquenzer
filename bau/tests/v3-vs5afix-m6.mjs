import * as N from '../vs-dsp/marks.mjs';
import {legato} from './v3-vs5a-h.mjs';
const TT = [0.5, 0.762, 0.98, 1.27, 1.49, 1.77, 2.01, 2.24, 2.52, 2.75, 3.03, 3.23, 3.52, 3.74, 4.03, 4.27];
const x = legato(TT, 4.6); let sd = 3; for (let i = 0; i < x.length; i++) { sd = (sd * 16807) % 2147483647; x[i] += 3e-4 * (sd / 2147483647 - .5); } const q = Float32Array.from(x, v => Math.round(v * 32767) / 32767);
const mk = N.detectMarks(q, 48000); console.log(mk.length, mk.map(m => m.t.toFixed(3) + m.src[0]).join(' '));
const t = mk.map(m => m.t), Q = N.quantizeMarks(t, {bpm: 120, t0: 0.5, grid: '1/8'}); console.log(Array.from(Q.times).map((v, k) => ((v - t[k]) * 1000).toFixed(0)).join(' '));
