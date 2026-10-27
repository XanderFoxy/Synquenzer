import * as M from '../vs-dsp/marks.mjs';
const f = M.assignLyrics || (M.default && M.default.assignLyrics);
for (const t of ['Lie-be ist ein Feu-er', 'Lie--be  ist', 'Feu- er', '-la la-', 'Lie–be ist', 'la_la', 'a-b-c-d-e-f-g', 'Ich bin\'s, ja-wohl!'])
  console.log(JSON.stringify(t), '6 →', JSON.stringify(f(t, 6)), '| 2 →', JSON.stringify(f(t, 2)));
