// QA MK7: MODUS switch with a held chord — vocoder vs other modes (and the predecessor for Single -> Dual)
import fs from 'fs';
const D = new URL('..', import.meta.url).pathname, FILE = D + 'mk-br-MK7/index.html', PRE = D + 'synq-snapshots/G-MK34-merge.html';
process.env.MK_FILE = FILE;
const {render, vocP, rms, db} = await import('./v3-mk7-node.mjs');
const {mKlick} = await import('./v3-mk1-ana.mjs');
const sr = 48000, W = render(vocP({}, {}), [], {sec: .01}).MKW, src = fs.readFileSync(FILE, 'utf8');
const mkVowel = new Function('W', src.slice(src.indexOf('/*MKV{*/'), src.indexOf('/*}MKV*/')) + '\n;return mkVowel;')();
const vox = mkVowel({f0: 110, v: 'a', sec: 4, sr, rms: -20}, W);
const ch = [[0, 'on', 48, .8], [0, 'on', 52, .8], [0, 'on', 55, .8], [0, 'on', 59, .8]];
for (const [lab, m0, m1, file, inp, hold] of [['Single → Dual (MK7)', 0, 1, FILE, true], ['Single → Dual (4.12.0)', 0, 1, PRE, false], ['Single → Vocoder', 0, 3, FILE, true], ['Vocoder → Single', 3, 0, FILE, true],
  ['Single → Vocoder (hold, kein Eingang)', 0, 3, FILE, false, true], ['Dual → Vocoder', 1, 3, FILE, true]]) {
  const p = vocP({efs: 40, res: 64, hold: hold ? new Array(16).fill(60) : null}, {}); p.mode = m0; p.t[1] = JSON.parse(JSON.stringify(p.t[0]));
  const r = render(p, ch, Object.assign({sec: 3, at: [[1.5, {mkSet: {mode: m1}}]], file}, inp ? {inputs: {e2: vox}} : {}));
  const k = mKlick(r.l.subarray(1.2 * sr, 1.8 * sr), sr, []), at = (1.2 + k.at).toFixed(4);
  // sample-level: largest jump |x[n]-x[n-1]| near the switch vs before
  let j0 = 0, j1 = 0, jn = 0; for (let n = 1.0 * sr; n < 1.49 * sr; n++) j0 = Math.max(j0, Math.abs(r.l[n] - r.l[n - 1])); for (let n = 1.49 * sr; n < 1.6 * sr; n++) { const d = Math.abs(r.l[n] - r.l[n - 1]); if (d > j1) { j1 = d; jn = n; } }
  console.log(lab.padEnd(38) + ' M-KLICK ' + k.worst.toFixed(2) + ' dB bei ' + at + ' s · größter Sprung je Sample vorher ' + j0.toFixed(4) + ', um den Wechsel ' + j1.toFixed(4) + ' bei ' + (jn / sr).toFixed(4) + ' s');
}
