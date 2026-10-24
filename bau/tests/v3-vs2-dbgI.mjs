import {loadDsp, melody, renderSynth, score} from './v3-vs2-corpus.mjs';
const D = loadDsp(process.argv[2]);
for (const seed of [1, 2, 3]) {
  const mel = melody(seed * 7 + 3, 45, 72, {n: 40}); const m8 = []; for (const nt of mel) { if (nt.on + nt.dur > 0.6 + 32 * 0.6) break; m8.push(nt); }
  const sig = renderSynth(m8, {sub: process.argv[3] || null}); const tr = D.pyin(sig.x, {fs: 16000, octLock: process.argv[4] === '1', fmin: 40, fmax: 1600});
  const sg = D.segment(tr, {snap: false, attack: true}); const used = new Set();
  for (const t of sig.truth) { const k = sg.notes.findIndex((d, i) => !used.has(i) && d.n === t.midi && Math.abs(d.t0 - t.on) <= 0.05); if (k >= 0) used.add(k); else console.log(seed, 'MISS', t.on.toFixed(3), t.midi, (t.off - t.on).toFixed(2), sg.notes.filter(d => Math.abs(d.t0 - t.on) < 0.3).map(d => d.t0.toFixed(3) + ':' + d.n + '(' + d.m + ')').join(' ')); }
  sg.notes.forEach((d, i) => { if (!used.has(i)) console.log(seed, 'EXTRA', d.t0.toFixed(3), d.t1.toFixed(3), d.n, d.m); });
  console.log(seed, score(tr, sg.notes, sig).F, 'tune', sg.tuneCt);
}
