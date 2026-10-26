import fs from 'fs';
const D = new URL('..', import.meta.url).pathname, FILE = D + 'mk-br-MK7/index.html'; process.env.MK_FILE = FILE;
const {render, vocP, rms, db} = await import('./v3-mk7-node.mjs');
const sr = 48000, W = render(vocP({}, {}), [], {sec: .01}).MKW, src = fs.readFileSync(FILE, 'utf8');
const mkVowel = new Function('W', src.slice(src.indexOf('/*MKV{*/'), src.indexOf('/*}MKV*/')) + '\n;return mkVowel;')();
const ch = [[0, 'on', 48, .8], [0, 'on', 52, .8], [0, 'on', 55, .8], [0, 'on', 59, .8]];
// hold at 1.0 with vowel a; vowel changes to i at 1.2 (while held); hold off at 1.5: followers must glide from a to i (attack tau/4, release tau)
const vox = mkVowel({f0: 110, v: ['a', 'i'], seg: 1.2, sec: 4, sr, rms: -20}, W);
for (const efs of [0, 40, 64]) {
  const r = render(vocP({efs, res: 64}, {}), ch, {sec: 2.2, inputs: {e2: vox}, at: [[1, {mkHoldGet: 1}], [1.5, {mkSet: {'voc.hold': null}}]]});
  const lv = []; for (let t = 1.46; t < 1.56; t += .005) lv.push(db(rms(r.l, Math.round(t * sr), Math.round((t + .005) * sr))).toFixed(1));
  let j0 = 0, j1 = 0; for (let n = 1.3 * sr; n < 1.49 * sr; n++) j0 = Math.max(j0, Math.abs(r.l[n] - r.l[n - 1])); for (let n = 1.49 * sr; n < 1.56 * sr; n++) j1 = Math.max(j1, Math.abs(r.l[n] - r.l[n - 1]));
  console.log('FOLGER ' + efs + ': Pegel je 5 ms ab 1.46 s: ' + lv.join(' ') + ' · größter Sprung je Sample vorher ' + j0.toFixed(4) + ' / nach HALTEN aus ' + j1.toFixed(4));
}
