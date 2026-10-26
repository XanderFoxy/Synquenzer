// QA MK7-11: limiter stage 1 switching mid-note (at 1.0 s, back at 2.5 s): level before / during / after, sweep over notes and vowels
import fs from 'fs';
const FILE = new URL('../mk-br-MK7/index.html', import.meta.url).pathname; process.env.MK_FILE = FILE;
const {render, vocP, rms, db} = await import('./v3-mk7-node.mjs');
const sr = 48000, W = render(vocP({}, {}), [], {sec: .01}).MKW, src = fs.readFileSync(FILE, 'utf8');
const mkVowel = new Function('W', src.slice(src.indexOf('/*MKV{*/'), src.indexOf('/*}MKV*/')) + '\n;return mkVowel;')();
let worst = [0, ''], cnt = 0, over = 0;
for (const v of ['a', 'e', 'i', 'o', 'u']) {
  const e2 = mkVowel({f0: 110, v, sec: 4, sr, rms: -20}, W), row = [];
  for (const n of [36, 43, 48, 55, 60, 67, 72]) {
    const r = render(vocP({res: 64, efs: 40}, {}), [[0, 'on', n, .8]], {sec: 4, inputs: {e2}, at: [[1, {set: {mkLim: 1}}], [2.5, {set: {mkLim: 0}}]]});
    const b = db(rms(r.l, .6 * sr, 1 * sr)), d = db(rms(r.l, 1.5 * sr, 2.5 * sr)), a = db(rms(r.l, 3.1 * sr, 4 * sr)), x = d - b;
    row.push(n + ':' + (x > 0 ? '+' : '') + x.toFixed(1)); cnt++; if (Math.abs(x) > 1) over++; if (Math.abs(x) > Math.abs(worst[0])) worst = [x, 'Vokal ' + v + ', Note ' + n + ' (vorher ' + b.toFixed(1) + ', Stufe 1 ' + d.toFixed(1) + ', danach ' + a.toFixed(1) + ' dBFS)'];
  }
  console.log('Vokal ' + v + ': ' + row.join('  '));
}
console.log('über ±1 dB: ' + over + ' von ' + cnt + ' · größter Sprung ' + worst[0].toFixed(2) + ' dB bei ' + worst[1]);
