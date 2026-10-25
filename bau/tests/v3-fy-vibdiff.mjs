import {loadDsp} from './v3-vs2-corpus.mjs';
import {sing, score} from './v3-qa-vs2b-acc-synth.mjs';
const A = loadDsp(process.argv[2]), B = loadDsp(process.argv[3]); const [hz, ct, jit] = (process.argv[4] || '7.5,130,1').split(',').map(Number);
for (const seed of [1, 2, 3]) for (const [voice, b] of [['male', 50], ['female', 62]]) {
  const notes = [{on: 0.3, dur: 0.5, midi: b - 2, cons: 'l'}, {on: 1.0, dur: 1.2, midi: b, cons: 'n', vib: {ct, hz, delay: 0.15, jit}}, {on: 2.4, dur: 0.5, midi: b + 3, cons: 'd'}];
  const CL = process.env.CLEAN, s = sing(notes, {voice, seed, sigma: 6, snr: CL ? 50 : undefined, rev: CL ? false : undefined}), tr = A.pyin(s.x, {fs: 16000});
  const f = D => D.segment(tr, {snap: false, tuning: 'auto'}).notes.map(n => `${n.t0.toFixed(3)}-${n.t1.toFixed(3)}:${n.n}`).join(' ');
  const a = f(A), bb = f(B); if (a !== bb) console.log(voice, seed, '\n A', a, '\n B', bb);
}
