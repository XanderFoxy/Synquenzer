import {render, vocP, rms, db} from './v3-mk7-node.mjs';
import {mKlick} from './v3-mk1-ana.mjs';
import fs from 'fs';
const FILE = new URL('../mk-br-MK7/index.html', import.meta.url).pathname, src = fs.readFileSync(FILE, 'utf8');
const sr = 48000, W = render(vocP({}, {}), [], {sec: .01}).MKW, mkVowel = new Function('W', src.slice(src.indexOf('/*MKV{*/'), src.indexOf('/*}MKV*/')) + '\n;return mkVowel;')();
const vox = mkVowel({f0: 110, v: 'a', sec: 3, sr, rms: -20}, W), ch = [[0, 'on', 48, .8], [0, 'on', 55, .8], [0, 'on', 60, .8], [0, 'on', 64, .8]];
const a = render(vocP({res: 64}, {}), ch, {sec: 3, inputs: {e2: vox}}), b = render(vocP({res: 64}, {}), ch, {sec: 3, inputs: {e2: vox}, at: [[1, {set: {mkLim: 1}}]]});
const k = mKlick(b.l.subarray(.5 * sr, 3 * sr), sr, []), k0 = mKlick(a.l.subarray(.5 * sr, 3 * sr), sr, []); console.log('b', k.worst.toFixed(2), (k.at + .5).toFixed(4), 'a', k0.worst.toFixed(2), (k0.at + .5).toFixed(4));
// HP energy windows (2 ms) around 1.00 .. 1.10, a and b
import('./v3-mk1-ana.mjs').then(() => {});
const hp = x => { const y = new Float64Array(x.length); let p = 0, q = 0; for (let i = 0; i < x.length; i++) { const v = x[i] - p; p = x[i]; y[i] = v - q * 0; } return y; };
const A = hp(a.l), B = hp(b.l), E = (y, t) => { const i0 = Math.round(t * sr); let e = 0; for (let i = i0; i < i0 + 96; i++) e += y[i] * y[i]; return 10 * Math.log10(e + 1e-30); };
const o = []; for (let t = 1.0; t < 1.1; t += .002) o.push((E(B, t) - E(A, t)).toFixed(1)); console.log(o.join(' '));
console.log('level 2nd vs 4th', (db(rms(b.l, 2 * sr, 3 * sr)) - db(rms(a.l, 2 * sr, 3 * sr))).toFixed(2));
console.log('steady 2nd', mKlick(b.l.subarray(1.5 * sr, 3 * sr), sr, []).worst.toFixed(2), 'steady 4th', mKlick(a.l.subarray(1.5 * sr, 3 * sr), sr, []).worst.toFixed(2));
