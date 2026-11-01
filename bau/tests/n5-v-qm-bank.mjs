// QA musiker VV1-04: Matrix picture when the song plays clips from scenes far apart (scene 1 drums + scene 6 synth)
import { open, OUTQ } from './n5-v-qm-lib.mjs';
import fs from 'fs';
import { execSync } from 'child_process';
const {b, p, errs} = await open({touch: true});
const r = await p.evaluate(async () => { const A = SYNQUENZER; A.setMetronome(false); A.setClip(1, 5, A.getClip(1, 0)); A.setClip(2, 6, A.getClip(2, 0));
  A.setSong({bars: 4, lanes: [[{bar: 0, slot: 0}], [{bar: 0, slot: 5}], [{bar: 2, slot: 6}], [], [{bar: 0, slot: 0}], []], carrier: [], mel: {}, marks: [{id: 'a', a: 0, len: 4, name: 'Strophe'}]});
  A.vvTest({opus: true}); await new Promise(r => setTimeout(r, 300));
  const x = await A.vvMake({fmt: '9:16', view: 'matrix'}); const out = {how: x.how};
  for (const t of [1, 5.5]) { const st = A.vvStateAt(t), cells = A.vvMatrixCells('9:16', t); const playing = st.slots.map((s, i) => [i, s]).filter(([i, s]) => s != null && s >= 0);
    out['t' + t] = {playing: playing.map(([i, s]) => 'T' + (i + 1) + ':S' + (s + 1)), shownScenes: [...new Set(cells.map(c => c.s + 1))], missing: playing.filter(([i, s]) => !cells.some(c => c.t === i && c.s === s)).map(([i, s]) => 'T' + (i + 1) + ':S' + (s + 1))}; }
  return out; });
console.log(JSON.stringify(r));
const bl = await p.evaluate(() => SYNQUENZER.vvBlob()); const f = OUTQ + 'bank-matrix.mp4'; fs.writeFileSync(f, Buffer.from(bl.b64, 'base64'));
execSync(`ffmpeg -v error -ss 1 -i ${f} -frames:v 1 -vf scale=360:-1 -y ${OUTQ}bank-1.png && ffmpeg -v error -ss 5.5 -i ${f} -frames:v 1 -vf scale=360:-1 -y ${OUTQ}bank-5.png && ffmpeg -v error -i ${OUTQ}bank-1.png -i ${OUTQ}bank-5.png -filter_complex hstack=inputs=2 -y ${OUTQ}bank.png`);
console.log('errors', errs);
await b.close();
