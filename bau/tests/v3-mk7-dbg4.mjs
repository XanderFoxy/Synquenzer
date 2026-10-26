import {render, vocP, rms, db} from './v3-mk7-node.mjs';
import fs from 'fs';
const FILE = new URL('../mk-br-MK7/index.html', import.meta.url).pathname, src = fs.readFileSync(FILE, 'utf8');
const sr = 48000, W = render(vocP({}, {}), [], {sec: .01}).MKW, mkVowel = new Function('W', src.slice(src.indexOf('/*MKV{*/'), src.indexOf('/*}MKV*/')) + '\n;return mkVowel;')();
const vox = mkVowel({f0: 110, v: 'a', sec: 1, sr, rms: -20}, W);
const r = render(vocP({efs: 40}, {}), [[0, 'on', 48, .8], [0, 'on', 55, .8], [0, 'on', 64, .8]], {sec: 4, inputs: {e2: vox}, at: [[.8, {mkHoldGet: 1}]]});
const o = []; for (let t = .5; t < 4; t += .1) o.push(db(rms(r.l, Math.round(t * sr), Math.round((t + .1) * sr))).toFixed(2)); console.log(o.join(' '));
