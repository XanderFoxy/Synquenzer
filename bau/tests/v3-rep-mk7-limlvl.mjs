// Independent repro: limiter stage 1 level vs 4th order, compared against a no-switch reference render in the SAME window.
import fs from 'fs';
const FILE = new URL('../mk-br-MK7/index.html', import.meta.url).pathname; process.env.MK_FILE = FILE;
const {render, vocP, noise, rms, db} = await import('./v3-mk7-node.mjs');
const sr = 48000, W = render(vocP({}, {}), [], {sec: .01}).MKW, src = fs.readFileSync(FILE, 'utf8');
const mkVowel = new Function('W', src.slice(src.indexOf('/*MKV{*/'), src.indexOf('/*}MKV*/')) + '\n;return mkVowel;')();
const cfgs = [['probe res64 efs40', {res: 64, efs: 40}], ['defaults res0 efs64', {}]];
const notes = [48, 55, 60, 64, 67, 72];
const out = [];
for (const [cl, vo] of cfgs) for (const v of ['a', 'i', 'u']) {
  const e2 = mkVowel({f0: 110, v, sec: 4, sr, rms: -20}, W), row = [];
  for (const n of notes) {
    const p = vocP(vo, {});
    const ref = render(p, [[0, 'on', n, .8]], {sec: 4, inputs: {e2}});
    const sw = render(p, [[0, 'on', n, .8]], {sec: 4, inputs: {e2}, at: [[1, {set: {mkLim: 1}}], [2.5, {set: {mkLim: 0}}]]});
    const L4 = db(rms(ref.l, 1.5 * sr, 2.5 * sr)), L2 = db(rms(sw.l, 1.5 * sr, 2.5 * sr)), back = db(rms(sw.l, 3.1 * sr, 4 * sr)) - db(rms(ref.l, 3.1 * sr, 4 * sr));
    row.push(n + ':' + (L2 - L4 >= 0 ? '+' : '') + (L2 - L4).toFixed(2) + '(' + L4.toFixed(1) + ')');
    out.push(Math.abs(L2 - L4));
    if (Math.abs(back) > .2) row.push('[back ' + back.toFixed(2) + ']');
  }
  console.log(cl + ' vowel ' + v + ': ' + row.join('  '));
}
console.log('cases > 1 dB: ' + out.filter(x => x > 1).length + ' / ' + out.length);
