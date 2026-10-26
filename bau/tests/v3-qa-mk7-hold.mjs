// QA MK7 (FP-DSP): Formant hold + gate threshold. A held sound must sound without any source (MK7-03, HB-MK S. 35:
// "retain that character regardless of whether there is any input"); HALTEN then stop vocalizing must keep the output.
import fs from 'fs';
const FILE = process.env.MK_FILE || new URL('../mk-br-MK7/index.html', import.meta.url).pathname;
process.env.MK_FILE = FILE;
const {render, vocP, sine, rms, db} = await import('./v3-mk7-node.mjs');
const sr = 48000, W = render(vocP({}, {}), [], {sec: .01}).MKW;
const src = fs.readFileSync(FILE, 'utf8'), mkVowel = new Function('W', src.slice(src.indexOf('/*MKV{*/'), src.indexOf('/*}MKV*/')) + '\n;return mkVowel;')();
const hold = new Array(16).fill(0).map((_, b) => 100 - 2 * b);
console.log('--- (a) sound with stored hold, NO input, one saw note C3, level 0.5..1.5 s');
for (const th of [0, 1, 20, 40, 64, 100]) {
  const r = render(vocP({hold, th, gs: 40}, {}), [[0, 'on', 48, .8]], {sec: 1.5});
  console.log('SCHWELLE ' + th + ': ' + db(rms(r.l, .5 * sr, 1.5 * sr)).toFixed(1) + ' dBFS');
}
console.log('--- (b) live: vowel -20 dBFS on E2 until 1.0 s, TIMBRE/HALTEN (mkHoldGet) at 0.8 s, then silence; level per 0.5 s');
for (const th of [0, 30, 64]) {
  const vox = mkVowel({f0: 110, v: 'a', sec: 1, sr, rms: -20}, W);
  const r = render(vocP({efs: 40, th, gs: 40}, {}), [[0, 'on', 48, .8]], {sec: 4, inputs: {e2: vox}, at: [[.8, {mkHoldGet: 1}]]});
  const lv = []; for (let t = .5; t < 4; t += .5) lv.push(db(rms(r.l, Math.round(t * sr), Math.round((t + .5) * sr))).toFixed(1));
  console.log('SCHWELLE ' + th + ' (−' + (-W.vocThDb(th || 1)).toFixed(0) + ' dBFS): ' + lv.join(' | '));
}
console.log('--- (c) FOLGER 127 (hold by knob), mic noise floor -70 dBFS after 1 s');
for (const th of [0, 30]) {
  const vox = mkVowel({f0: 110, v: 'a', sec: 4, sr, rms: -20}, W); for (let i = sr; i < vox.length; i++) vox[i] = 3e-4 * Math.sin(i * .37);
  const r = render(vocP({efs: 40, th, gs: 40}, {}), [[0, 'on', 48, .8]], {sec: 4, inputs: {e2: vox}, at: [[.8, {mkSet: {'voc.efs': 127}}]]});
  const lv = []; for (let t = .5; t < 4; t += .5) lv.push(db(rms(r.l, Math.round(t * sr), Math.round((t + .5) * sr))).toFixed(1));
  console.log('SCHWELLE ' + th + ': ' + lv.join(' | '));
}
