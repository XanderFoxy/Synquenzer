// QA MK7-11 / B.4: limiter stage 1 level match (M-PEGEL ± 1 dB to 4th order) for typical carriers and modulators
import fs from 'fs';
const FILE = new URL('../mk-br-MK7/index.html', import.meta.url).pathname; process.env.MK_FILE = FILE;
const {render, vocP, noise, rms, db} = await import('./v3-mk7-node.mjs');
const sr = 48000, W = render(vocP({}, {}), [], {sec: .01}).MKW, src = fs.readFileSync(FILE, 'utf8');
const mkVowel = new Function('W', src.slice(src.indexOf('/*MKV{*/'), src.indexOf('/*}MKV*/')) + '\n;return mkVowel;')();
const ch4 = [[0, 'on', 48, .8], [0, 'on', 52, .8], [0, 'on', 55, .8], [0, 'on', 59, .8]];
const cases = [
  ['Säge C3, Vokal a 110 Hz', {}, [[0, 'on', 48, .8]], mkVowel({f0: 110, v: 'a', sec: 3, sr, rms: -20}, W)],
  ['Säge C2, Vokal a', {}, [[0, 'on', 36, .8]], mkVowel({f0: 110, v: 'a', sec: 3, sr, rms: -20}, W)],
  ['Säge C4, Vokal i', {}, [[0, 'on', 60, .8]], mkVowel({f0: 110, v: 'i', sec: 3, sr, rms: -20}, W)],
  ['Säge-Akkord C-E-G-H, Vokalfolge', {}, ch4, mkVowel({f0: 110, v: ['a', 'e', 'i', 'o', 'u'], seg: .5, sec: 3, sr, rms: -20}, W)],
  ['Puls C3, Vokal o', {o1: {w: 1, c1: 30, c2: 0}}, [[0, 'on', 48, .8]], mkVowel({f0: 110, v: 'o', sec: 3, sr, rms: -20}, W)],
  ['Säge C3, Rauschen-Modulator', {}, [[0, 'on', 48, .8]], noise(3, sr, .2, 9)],
  ['Säge C3 RESO 127, Vokal e', {}, [[0, 'on', 48, .8]], mkVowel({f0: 110, v: 'e', sec: 3, sr, rms: -20}, W), {res: 127}],
  ['Säge C3 RESO 0, Vokal e', {}, [[0, 'on', 48, .8]], mkVowel({f0: 110, v: 'e', sec: 3, sr, rms: -20}, W), {res: 0}],
];
for (const [lab, t0, ev, e2, vo] of cases) {
  const p = vocP(Object.assign({res: 64, efs: 40}, vo || {}), t0);
  const a = render(p, ev, {sec: 3, inputs: {e2}}), b = render(p, ev, {sec: 3, inputs: {e2}, at: [[0, {set: {mkLim: 1}}]]});
  const d = db(rms(b.l, 1 * sr, 3 * sr)) - db(rms(a.l, 1 * sr, 3 * sr));
  console.log((Math.abs(d) <= 1 ? 'ok   ' : 'OVER ') + lab + ': Stufe 1 gegen 4. Ordnung ' + (d > 0 ? '+' : '') + d.toFixed(2) + ' dB');
}
