// G-P1b-gruppe-fix: real short legato notes (1/16 runs, grace-like steps) must survive the transition suppression
import {loadDsp} from './v3-vs2-corpus.mjs';
import {renderVoice} from './v3-qa-grp-corpus.mjs';
const file = process.argv[2] || '../dirigent-wt/index.html';
const D = loadDsp(file);
const AM = Array.from({length: 12}, (_, k) => [0, 2, 3, 5, 7, 8, 10].includes(k));
let bad = 0;
for (const bpm of [100, 120, 140]) for (const [gMin, gRange] of [[0.03, 0.03], [0.06, 0.04]]) {
  const SB = 60 / bpm, LEAD = 0.2;
  // 1/16 runs up and down, 1/8 steps, a held note, legato everywhere
  const MEL = [[0, .25, 57], [.25, .25, 59], [.5, .25, 60], [.75, .25, 62], [1, 1, 64], [2, .25, 62], [2.25, .25, 60], [2.5, .25, 59], [2.75, .25, 57], [3, .5, 60], [3.5, .5, 64], [4, 2, 62]];
  let tot = 0, hit = 0, sung = 0;
  for (const seed of [1, 2, 3]) for (const voice of ['male', 'female']) {
    const mel = MEL.map(([b, d, m], k) => ({on: LEAD + b * SB, dur: d * SB, midi: m + (voice === 'female' ? 12 : 0), legato: k > 0, rest: 0}));
    const sig = renderVoice(mel, {voice, seed, sigma: 10, bpm, gMin, gRange, vib: [20, 40]});
    const ns = D.segment(D.pyin(Float32Array.from(sig.x), {fs: 16000}), {snap: true, scale: AM, root: 9, tuning: 'auto'}).notes;
    const used = new Set(); for (const t of mel) { const k = ns.findIndex((n, i) => !used.has(i) && n.n === t.midi && Math.abs(n.t0 - t.on) <= 0.07); if (k >= 0) { hit++; used.add(k); } }
    tot += ns.length; sung += mel.length;
  }
  const F = 2 * hit / (sung + tot); if (F < 0.9) bad++;
  console.log(`${F >= 0.9 ? 'PASS' : 'FAIL'} ${bpm} BPM glide ${gMin * 1000}-${(gMin + gRange) * 1000} ms: sung ${sung}, detected ${tot}, hits ${hit}, F ${F.toFixed(3)}`);
}
console.log('bad', bad);
