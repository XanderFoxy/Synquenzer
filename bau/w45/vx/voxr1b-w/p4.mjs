import fs from 'fs'; import {core, wav, RV, SRC, f0tab} from './lib.mjs';
const K = core(process.argv[2]); const A = wav(RV + SRC[0]), sr = A.sr, v = A.x;
const notes = fs.readFileSync(RV + SRC[0].replace('.wav', '_notesA1.csv'), 'utf8').trim().split('\n').map(l => l.split(',').map(Number));
const fpos = f0tab.filter(r => r[1] > 0).map(r => r[1]); console.log('f0 min', Math.min(...fpos).toFixed(1), 'p1', fpos.sort((a,b)=>a-b)[Math.floor(fpos.length*0.01)].toFixed(1), 'notes', notes.length);
const Fe = K.done(K.feats(v, sr)); const ev = K.plopFind(Fe, {});
for (const e of ev) { let best = 9; for (const nt of notes) { const d = nt[0] - e.t0; if (Math.abs(d) < Math.abs(best)) best = d; }
  // Tiefband < 70 Hz nullphasig: Spitze, Vorzeichen-Asymmetrie
  const a = Math.round(e.t0 * sr) - 2205, b = Math.round(e.t1 * sr) + 2205; let s = 0, pk = 0, pos = 0, neg = 0;
  console.log(e.t0.toFixed(3), 'nächster Noten-Einsatz', (best * 1000).toFixed(0) + ' ms', 'ex', e.exDb); }
