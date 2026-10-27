import * as X from '../vs-dsp/stretch.mjs';
import {clickTone} from './v3-vs5b-h.mjs';
const x = clickTone([0.5, 0.9, 1.3], 1.8, {f0: 220});
const r = X.stretch(x, 48000, {src: [0, 0.496, 0.896, 1.296, 1.8], dst: [0, 0.496, 0.646, 1.296, 1.8]}, {lock: 0.024});
const S0 = Math.round(0.496 * 48000), n = Math.round(0.4 * 48000); let same = true; for (let j = 0; j < Math.round(0.135 * 48000); j++) if (r.y[S0 + j] !== x[S0 + j]) { same = false; break; }
console.log('warnings', JSON.stringify(r.warnings), 'segment 0.375 shifted bit-identical (first 135 ms):', same, 'finite', r.y.every(Number.isFinite));
