import * as N from '../vs5a-fix-bak/marks-dbg.mjs';
import {beatbox} from './v3-qa-vs5a-h2.mjs';
globalThis.__dbg = 1;
const sr = 48000, OFF = [12, -18, 30, -8], PAT = 'btkt', ev = OFF.map((o, k) => ({t: 0.25 + k * 0.25 + o / 1000, s: PAT[k]}));
const x = beatbox(ev, 1.5, sr); const mk = N.detectMarks(x, sr); console.log(mk.map(m => m.t.toFixed(4) + m.src).join(' '));
let pre = 0; for (let i = Math.round(0.436 * sr); i < Math.round(0.457 * sr); i++) pre = Math.max(pre, Math.abs(x[i])); let pk = 0; for (let i = Math.round(0.461 * sr); i < Math.round(0.52 * sr); i++) pk = Math.max(pk, Math.abs(x[i])); console.log('pre', pre, 'pk', pk);
