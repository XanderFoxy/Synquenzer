import fs from 'fs';
import {render, vocP, rms, db} from './v3-mk7-node.mjs';
import {mKlick} from './v3-mk1-ana.mjs';
const FILE = process.env.MK_FILE || new URL('../mk-br-MK7/index.html', import.meta.url).pathname, src = fs.readFileSync(FILE, 'utf8');
const W = render(vocP({}, {}), [], {sec: .01}).MKW, sr = 48000;
const mkVowel = new Function('W', src.slice(src.indexOf('/*MKV{*/'), src.indexOf('/*}MKV*/')) + '\n;return mkVowel;')();
const vow = mkVowel({f0: 110, v: ['a', 'e', 'i', 'o', 'u'], seg: .4, sec: 4, sr, rms: -20}, W);
const chord = [[0, 'on', 48, .8], [0, 'on', 52, .8], [0, 'on', 55, .8], [0, 'on', 59, .8]];
for (const [nm, p] of [['lfo30', vocP({res: 64, msrc: 2, mint: 30}, {})], ['static', vocP({res: 64}, {})]]) {
  const a = render(p, chord, {sec: 4, inputs: {e2: vow}}), b = render(p, chord, {sec: 4, inputs: {e2: vow}, at: [[0, {set: {mkLim: 1}}]]});
  const ka = mKlick(a.l, sr, [0]), kb = mKlick(b.l, sr, [0]);
  console.log(nm, 'stage0 klick', ka.worst.toFixed(2), '@', ka.at.toFixed(3), ' stage1 klick', kb.worst.toFixed(2), '@', kb.at.toFixed(3));
  for (const sw of [.7, 1, 1.3, 1.9]) { const c = render(p, chord, {sec: 4, inputs: {e2: vow}, at: [[sw, {set: {mkLim: 1}}]]}); const kc = mKlick(c.l, sr, [0]); console.log('   switch at', sw, 'klick', kc.worst.toFixed(2), '@', kc.at.toFixed(3)); }
}
