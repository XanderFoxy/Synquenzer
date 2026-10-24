import {loadDsp} from './v3-vs2-corpus.mjs';
import {sing} from './v3-qa-vs2b-acc-synth.mjs';
const DN = loadDsp('../dirigent-wt/index.html'), DO = loadDsp('v3-vs2b-base.html');
for (const hz of [5.5, 6.5]) for (const ct of [100, 115, 130]) { let fn = 0, fo = 0, k = 0; const ex = [];
  for (const seed of [1, 2, 3, 4, 5, 6]) for (const [voice, b] of [['male', 50], ['female', 62]]) {
    const notes = [{on: 0.3, dur: 0.5, midi: b - 2}, {on: 1.0, dur: 1.2, midi: b, vib: {ct, hz, delay: 0.15}}, {on: 2.4, dur: 0.5, midi: b + 3}];
    const s = sing(notes, {voice, seed, sigma: 6, rev: false, snr: 50}), tr = DN.pyin(s.x, {fs: 16000});
    const cnt = D => D.segment(tr, {snap: false, tuning: 'auto'}).notes.filter(n => n.t1 > 1.05 && n.t0 < 2.15);
    const a = cnt(DN), o = cnt(DO); if (a.length !== 1 || a[0].n !== b) { fn++; if (ex.length < 2) ex.push([voice, seed, a.map(n => n.n + '@' + n.t0.toFixed(2)).join(' ')]); } if (o.length !== 1 || o[0].n !== b) fo++; k++; }
  console.log(`held 1.2 s note, vibrato ${hz} Hz ±${ct} ct: NOT one correct note in NEW ${fn}/${k}, OLD ${fo}/${k} ${JSON.stringify(ex)}`); }
