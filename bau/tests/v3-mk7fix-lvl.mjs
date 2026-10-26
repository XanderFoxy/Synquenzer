// MK7-fix: limiter stage 1 level vs 4th order, reference render without switch, window 1.5-3.5 s
import fs from 'fs';
import {render, vocP, noise, rms, db} from './v3-mk7-node.mjs';
const sr = 48000, FILE = process.env.MK_FILE || new URL('../mk-br-MK7/index.html', import.meta.url).pathname, src = fs.readFileSync(FILE, 'utf8');
const W = render(vocP({}, {}), [], {sec: .01}).MKW;
const mkVowel = new Function('W', src.slice(src.indexOf('/*MKV{*/'), src.indexOf('/*}MKV*/')) + '\n;return mkVowel;')();
const NZ = {mix: {o1: 0, o2: 0, n: 127}};
const cases = [];
const vow = v => mkVowel({f0: 110, v, sec: 4, sr, rms: -20}, W);
for (const res of [0, 64, 127]) {
  cases.push(['noise car / noise mod RESO ' + res, vocP({res}, NZ), [[0, 'on', 48, .8]], {e2: noise(4, sr, .2, 9)}]);
  cases.push(['saw C3 / noise mod RESO ' + res, vocP({res}, {}), [[0, 'on', 48, .8]], {e2: noise(4, sr, .2, 9)}]);
  cases.push(['noise car / hold RESO ' + res, vocP({res, hold: new Array(16).fill(100)}, NZ), [[0, 'on', 48, .8]], null]);
  cases.push(['saw C3 / hold RESO ' + res, vocP({res, hold: new Array(16).fill(100)}, {}), [[0, 'on', 48, .8]], null]);
  cases.push(['saw chord / vowel a RESO ' + res, vocP({res}, {}), [[0, 'on', 48, .8], [0, 'on', 52, .8], [0, 'on', 55, .8]], {e2: vow('a')}]);
  for (const n of [36, 60, 72]) cases.push(['saw ' + n + ' / vowel i RESO ' + res, vocP({res}, {}), [[0, 'on', n, .8]], {e2: vow('i')}]);
}
let worst = 0;
for (const [name, p, ev, inp] of cases) {
  const o = {sec: 3.5}; if (inp) o.inputs = inp;
  const a = render(p, ev, o), b = render(p, ev, Object.assign({}, o, {at: [[1, {set: {mkLim: 1}}]]}));
  const d = db(rms(b.l, 1.5 * sr, 3.5 * sr)) - db(rms(a.l, 1.5 * sr, 3.5 * sr)), dr = db(rms(b.r, 1.5 * sr, 3.5 * sr)) - db(rms(a.r, 1.5 * sr, 3.5 * sr));
  if (Math.abs(d) > Math.abs(worst)) worst = d;
  console.log((Math.abs(d) <= 1 ? 'ok   ' : 'FAIL ') + name.padEnd(34) + ' L ' + d.toFixed(2) + ' R ' + dr.toFixed(2) + ' dB  (4th ' + db(rms(a.l, 1.5 * sr, 3.5 * sr)).toFixed(1) + ' dBFS)');
}
console.log('worst', worst.toFixed(2));
