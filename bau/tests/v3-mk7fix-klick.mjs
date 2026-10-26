import fs from 'fs';
import {render, vocP, rms, db} from './v3-mk7-node.mjs';
import {mKlick} from './v3-mk1-ana.mjs';
const FILE = process.env.MK_FILE || new URL('../mk-br-MK7/index.html', import.meta.url).pathname, src = fs.readFileSync(FILE, 'utf8');
const W = render(vocP({}, {}), [], {sec: .01}).MKW, sr = 48000;
const mkVowel = new Function('W', src.slice(src.indexOf('/*MKV{*/'), src.indexOf('/*}MKV*/')) + '\n;return mkVowel;')();
const vow = mkVowel({f0: 110, v: ['a', 'e', 'i', 'o', 'u'], seg: .4, sec: 4, sr, rms: -20}, W);
const chord = [[0, 'on', 48, .8], [0, 'on', 52, .8], [0, 'on', 55, .8], [0, 'on', 59, .8]];
const sw = +(process.argv[2] || 1);
const p = vocP({res: 64, msrc: 2, mint: 30}, {});
const a = render(p, chord, {sec: 4, inputs: {e2: vow}}), b = render(p, chord, {sec: 4, inputs: {e2: vow}, at: [[sw, {set: {mkLim: 1}}], [sw + 1.5, {set: {mkLim: 0}}]]});
const kb = mKlick(b.l, sr, [0]), ka = mKlick(a.l, sr, [0]); console.log('klick b', kb.worst.toFixed(2), 'at', kb.at.toFixed(4), ' a', ka.worst.toFixed(2), 'at', ka.at.toFixed(4));
// difference signal around the switch, 2ms windows
const t0 = Math.round(sw * sr);
const row = []; for (let w = -5; w < 40; w++) { const s = t0 + w * 96; let e = 0, ea = 0; for (let i = s; i < s + 96; i++) { e += (b.l[i] - a.l[i]) ** 2; ea += a.l[i] ** 2; } row.push((w * 2) + 'ms:' + (10 * Math.log10(e / ea + 1e-30)).toFixed(0)); }
console.log(row.join(' '));
