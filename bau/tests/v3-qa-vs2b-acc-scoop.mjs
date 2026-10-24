// QA VS2b: gentle scoops (0.7–1.6 st, 100–160 ms) into detached notes, clean signal, no consonants: 4.5.2 vs 4.5.1
import {loadDsp} from './v3-vs2-corpus.mjs';
import {sing, score} from './v3-qa-vs2b-acc-synth.mjs';
const DN = loadDsp('../dirigent-wt/index.html'), DO = loadDsp('v3-vs2b-base.html');
const dir = +(process.argv[2] || 1);
let TN = {extra: 0, miss: 0, sung: 0}, TO = {extra: 0, miss: 0, sung: 0};
for (const st of [0.7, 1, 1.3, 1.6]) for (const ms of [100, 120, 140, 160]) {
  const R = {n: {extra: 0, miss: 0, sung: 0}, o: {extra: 0, miss: 0, sung: 0}}; let ex = null;
  for (const seed of [1, 2, 3]) for (const [voice, b] of [['male', 50], ['female', 62]]) {
    const notes = [0, 2, 4, 1, 3].map((s, k) => ({on: 0.3 + k * 0.85, dur: 0.6, midi: b + s, scoop: [dir * st, ms / 1000, process.env.SHAPE || 'cos'], vib: {ct: 30, hz: 5.5, delay: 0.25}, vowel: 'aoeau'[k]}));
    const s = sing(notes, {voice, seed, sigma: 6, rev: false, snr: 50}), tr = DN.pyin(s.x, {fs: 16000});
    for (const [k, D] of [['n', DN], ['o', DO]]) { const ns = D.segment(tr, {snap: false, tuning: 'auto'}).notes, sc = score(ns, s.truth, 0.1); R[k].extra += sc.extra; R[k].miss += sc.miss; R[k].sung += sc.sung; if (k === 'n' && sc.exEx.length && !ex) ex = [voice, seed, ...sc.exEx[0]]; }
  }
  for (const q of ['extra', 'miss', 'sung']) { TN[q] += R.n[q]; TO[q] += R.o[q]; }
  console.log(`scoop ${dir > 0 ? 'below' : 'above'} ${st} st ${ms} ms: NEW extra ${R.n.extra} miss ${R.n.miss} / ${R.n.sung} | OLD extra ${R.o.extra} miss ${R.o.miss}${ex ? ' e.g. ' + JSON.stringify(ex) : ''}`);
}
console.log('TOTAL NEW', JSON.stringify(TN), 'OLD', JSON.stringify(TO));
