// MK7-fix: stage 1 level vs 4th order at extreme FORMANT/CUTOFF, LFO FC-MOD, 44.1 kHz; plus M-KLICK / M-EINBRUCH at the switch
import fs from 'fs';
import {render, vocP, noise, rms, db} from './v3-mk7-node.mjs';
import {mKlick, mEinbruch} from './v3-mk1-ana.mjs';
const FILE = process.env.MK_FILE || new URL('../mk-br-MK7/index.html', import.meta.url).pathname, src = fs.readFileSync(FILE, 'utf8');
const W = render(vocP({}, {}), [], {sec: .01}).MKW;
const mkVowel = new Function('W', src.slice(src.indexOf('/*MKV{*/'), src.indexOf('/*}MKV*/')) + '\n;return mkVowel;')();
let fail = 0;
const ok = (c, t) => { if (!c) fail++; console.log((c ? 'PASS ' : 'FAIL ') + t); };
for (const sr of [48000, 44100]) {
  const vow = mkVowel({f0: 110, v: ['a', 'e', 'i', 'o', 'u'], seg: .4, sec: 4, sr, rms: -20}, W);
  const chord = [[0, 'on', 48, .8], [0, 'on', 52, .8], [0, 'on', 55, .8], [0, 'on', 59, .8]];
  const cases = [
    ['FORMANT +2 CUTOFF +63 (Bänder bis 12,6 kHz)', vocP({fs: 2, cut: 63}, {}), chord],
    ['FORMANT -2 CUTOFF -63', vocP({fs: -2, cut: -63}, {}), chord],
    ['FC-MOD LFO 1 (30)', vocP({res: 64, msrc: 2, mint: 30}, {}), chord],
    ['FC-MOD LFO 1 (63) RESO 127', vocP({res: 127, msrc: 2, mint: 63}, {}), chord],
    ['Rauschen-Träger FORMANT +2', vocP({fs: 2}, {mix: {o1: 0, o2: 0, n: 127}}), [[0, 'on', 48, .8]]],
  ];
  for (const [nm, p, ev] of cases) {
    const a = render(p, ev, {sr, sec: 4, inputs: {e2: vow}}), b = render(p, ev, {sr, sec: 4, inputs: {e2: vow}, at: [[1, {set: {mkLim: 1}}], [2.5, {set: {mkLim: 0}}]]});
    const c = render(p, ev, {sr, sec: 4, inputs: {e2: vow}, at: [[0, {set: {mkLim: 1}}]]}), kS = mKlick(c.l, sr, [0]).worst;
    const d = db(rms(b.l, 1.5 * sr, 2.5 * sr)) - db(rms(a.l, 1.5 * sr, 2.5 * sr)), back = db(rms(b.l, 3.1 * sr, 3.9 * sr)) - db(rms(a.l, 3.1 * sr, 3.9 * sr));
    const kA = mKlick(a.l, sr, [0]).worst, kB = mKlick(b.l, sr, [0]).worst, e1 = mEinbruch(b.l, sr, 1.06).worst, e2 = mEinbruch(b.l, sr, 2.56).worst, r1 = mEinbruch(a.l, sr, 1.06).worst, r2 = mEinbruch(a.l, sr, 2.56).worst;
    ok(Math.abs(d) <= 1 && Math.abs(back) <= .2 && kB <= Math.max(6, kA + .5, kS + .5) && e1 >= Math.min(-3, r1 - .5) && e2 >= Math.min(-3, r2 - .5),
      `${sr} ${nm}: M-PEGEL ${d.toFixed(2)} dB, zurück ${back.toFixed(2)} dB, M-KLICK ${kB.toFixed(2)} (ohne Umschalten ${kA.toFixed(2)}), M-EINBRUCH ${e1.toFixed(2)} / ${e2.toFixed(2)} dB (der Klang ohne Umschalten ${r1.toFixed(2)} / ${r2.toFixed(2)}), Stufe 1 allein M-KLICK ${kS.toFixed(2)}`);
  }
}
console.log(fail ? 'FAIL ' + fail : 'ALL PASS');
