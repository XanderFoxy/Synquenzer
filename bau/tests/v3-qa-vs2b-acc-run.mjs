import {loadDsp} from './v3-vs2-corpus.mjs';
import {sing, score} from './v3-qa-vs2b-acc-synth.mjs';
const DN = loadDsp('../dirigent-wt/index.html'), DO = loadDsp('v3-vs2b-base.html');
for (const bpm of [100, 110, 120]) for (const g of [0.025, 0.04]) {
  const T = {n: [0, 0, 0], o: [0, 0, 0]}; const ex = [];
  for (const seed of [1, 2, 3, 4]) for (const [voice, b] of [['male', 50], ['female', 62]]) {
    const sc = []; for (let m = b - 5; m <= b + 14; m++) if ([0, 2, 4, 5, 7, 9, 11].includes(((m % 12) + 12) % 12)) sc.push(m); const st = sc.findIndex(m => m >= b), d = 60 / bpm / 4;
    const notes = [0, 1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1, 0, 1].map((q, k) => { const n = {on: 0.3 + k * d, dur: d, midi: sc[st + q]}; if (k) n.glide = g; return n; });
    const s = sing(notes, {voice, seed, sigma: 6, rev: false, snr: 50}), tr = DN.pyin(s.x, {fs: 16000});
    for (const [k, D] of [['n', DN], ['o', DO]]) { const sc2 = score(D.segment(tr, {snap: false, tuning: 'auto'}).notes, s.truth, 0.1); T[k][0] += sc2.hit; T[k][1] += sc2.sung; T[k][2] += sc2.extra; if (k === 'n' && sc2.miss && ex.length < 3) ex.push([voice, seed, ...sc2.exMiss[0]]); }
  }
  console.log(`legato 1/16 ${bpm} BPM glide ${g * 1000} ms: NEW ${T.n[0]}/${T.n[1]} found (+${T.n[2]} extra) | OLD ${T.o[0]}/${T.o[1]} (+${T.o[2]}) missing e.g. ${JSON.stringify(ex)}`);
}
