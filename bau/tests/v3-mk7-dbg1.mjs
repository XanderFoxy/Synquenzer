import {render, vocP, noise, rms, db} from './v3-mk7-node.mjs';
import {mKlick} from './v3-mk1-ana.mjs';
import fs from 'fs';
const FILE = new URL('../mk-br-MK7/index.html', import.meta.url).pathname, src = fs.readFileSync(FILE, 'utf8');
const sr = 48000, W = render(vocP({}, {}), [], {sec: .01}).MKW, mkVowel = new Function('W', src.slice(src.indexOf('/*MKV{*/'), src.indexOf('/*}MKV*/')) + '\n;return mkVowel;')();
const vox = mkVowel({f0: 110, v: 'a', sec: 4, sr, rms: -20}, W), ch = [[0, 'on', 48, .8], [0, 'on', 55, .8], [0, 'on', 60, .8], [0, 'on', 64, .8]];
const a = render(vocP({res: 64}, {}), ch, {sec: 4, inputs: {e2: vox}}), b = render(vocP({res: 64}, {}), ch, {sec: 4, inputs: {e2: vox}, at: [[1, {set: {mkLim: 1}}], [2.5, {set: {mkLim: 0}}]]});
for (const [x, l] of [[a.l, 'a'], [b.l, 'b']]) { const k = mKlick(x.subarray(.5 * sr, 4 * sr), sr, []); console.log(l, k.worst.toFixed(2), (k.at + .5).toFixed(3)); }
// level of 10 ms windows around switches
for (const t0 of [1, 2.5]) { const o = []; for (let t = t0 - .02; t < t0 + .1; t += .01) o.push((db(rms(b.l, t * sr, (t + .01) * sr)) - db(rms(a.l, t * sr, (t + .01) * sr))).toFixed(1)); console.log(t0, o.join(' ')); }
