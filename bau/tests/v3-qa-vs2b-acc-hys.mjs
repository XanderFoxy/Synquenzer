import {loadDsp} from './v3-vs2-corpus.mjs';
import {sing} from './v3-qa-vs2b-acc-synth.mjs';
const DN = loadDsp('../dirigent-wt/index.html'), DO = loadDsp('v3-vs2b-base.html');
for (const dev of [1, -1, 2]) { const row = [];
  for (const d of [70, 75, 80, 85, 90, 100]) { let cn = 0, co = 0, k = 0;
    for (const seed of [1, 2, 3]) for (const [voice, b] of [['male', 50], ['female', 62]]) {
      const notes = [{on: 0.3, dur: 0.5, midi: b, vowel: 'a'}, {on: 0.8, dur: d / 1000, midi: b + dev, glide: 0.015, vowel: 'a'}, {on: 0.8 + d / 1000, dur: 0.5, midi: b, glide: 0.015, vowel: 'a'}];
      const s = sing(notes, {voice, seed, sigma: 0, rev: false, snr: 50}), tr = DN.pyin(s.x, {fs: 16000});
      const nN = DN.segment(tr, {snap: false, tuning: 0}).notes, nO = DO.segment(tr, {snap: false, tuning: 0}).notes;
      if (nN.some(n => n.n === b + dev)) cn++; if (nO.some(n => n.n === b + dev)) co++; k++; }
    row.push(`${d}ms: NEW ${cn}/${k} OLD ${co}/${k}`); }
  console.log(`excursion ${dev > 0 ? '+' : ''}${dev} st (15 ms transitions) detected as own note → ${row.join(' | ')}`); }
