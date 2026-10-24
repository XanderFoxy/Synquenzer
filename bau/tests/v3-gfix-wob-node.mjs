// G-P1b-gruppe-fix: Node version of v3-qa-grp-wobble (+ the independent slide sweep) straight on the app's DSP (VSDSP block)
import {loadDsp} from './v3-vs2-corpus.mjs';
import {renderVoice} from './v3-qa-grp-corpus.mjs';
const D = loadDsp(process.argv[2] || '../dirigent-wt/index.html');
const ana = (x, scale, root) => { const tr = D.pyin(Float32Array.from(x), {fs: 16000}); return D.segment(tr, {snap: true, scale, root, tuning: 'auto'}); };
const BPM = 100, SB = 60 / BPM, LEAD = 0.1;
const MEL = [[0, 1, 57], [1, 1, 60], [2, 2, 64], [4, 1, 62], [5, 1, 60], [6, 2, 59], [8, 1, 57], [9, 1, 64], [10, 2, 67], [12, 1, 65], [13, 1, 64], [14, 2, 60]];
const AM = Array.from({length: 12}, (_, k) => [0, 2, 3, 5, 7, 8, 10].includes(k));
const conds = {
  base: {legato: false, o: {}},
  glide: {legato: true, o: {gMin: 0.15, gRange: 0.1}},
  scoop: {legato: false, o: {scoopP: 1, scoopMin: 1, scoopRange: 1, scoopTau: 0.06}},
  vib: {legato: false, o: {vib: [50, 80], vibDelay: 0.12}},
  all: {legato: true, o: {gMin: 0.15, gRange: 0.1, vib: [50, 80], vibDelay: 0.12}},
};
let bad = 0;
for (const [name, c] of Object.entries(conds)) {
  let tot = {n: 0, hit: 0, extra: 0, split: 0, seeds: 0}; const ex = [];
  for (const seed of [1, 2, 3, 4]) for (const voice of ['male', 'female']) {
    const mel = MEL.map(([b, d, m], k) => ({on: LEAD + b * SB, dur: d * SB, midi: m + (voice === 'female' ? 12 : 0), legato: c.legato && k > 0, rest: 0}));
    const sig = renderVoice(mel, {voice, seed, sigma: 12, bpm: BPM, ...c.o, vib: c.o.vib || [20, 40]});
    const ns = ana(sig.x, AM, 9).notes.map(n => ({on: n.t0, off: n.t1, m: n.n}));
    let hit = 0; const used = new Set();
    for (const t of mel) { const k = ns.findIndex((n, i) => !used.has(i) && n.m === t.midi && Math.abs(n.on - t.on) <= 0.12); if (k >= 0) { hit++; used.add(k); } }
    let extra = 0, split = 0;
    ns.forEach((n, i) => { if (used.has(i)) return; const inside = mel.find(t => n.on >= t.on - 0.05 && n.on < t.on + t.dur); if (inside && inside.midi === n.m) split++; else extra++; if (ex.length < 3) ex.push([voice, seed, +((n.on - LEAD) / SB).toFixed(2), +(n.off - n.on).toFixed(3), n.m]); });
    tot.n += ns.length; tot.hit += hit; tot.extra += extra; tot.split += split; tot.seeds++;
  }
  const r = {sung: MEL.length * tot.seeds, detected: tot.n, hits: tot.hit, extra: tot.extra, split: tot.split, F: +(2 * tot.hit / (MEL.length * tot.seeds + tot.n)).toFixed(3)};
  const ok = r.extra + r.split === 0 && r.hits === r.sung; if (!ok) bad++;
  console.log((ok ? 'PASS ' : 'FAIL ') + name, JSON.stringify(r), ex.length ? JSON.stringify(ex) : '');
}
// independent sweep (C major, 96 BPM, all legato)
{
  const BPM = 96, SB = 60 / BPM;
  const MEL = [[0,1,60],[1,1,62],[2,1,64],[3,1,67],[4,2,65],[6,1,64],[7,1,62],[8,1,60],[9,1,67],[10,2,69],[12,1,67],[13,1,64],[14,2,62]];
  const scale = Array.from({length: 12}, (_, k) => [0,2,4,5,7,9,11].includes(k));
  for (const [gMin, gRange] of [[0.04, 0.04], [0.08, 0.04], [0.10, 0.05], [0.12, 0.06], [0.15, 0.1], [0.2, 0.1]]) {
    let tot = 0, extra = 0, miss = 0; const ex = [];
    for (const seed of [11, 12, 13]) for (const voice of ['male', 'female']) {
      const mel = MEL.map(([b, d, m], k) => ({on: LEAD + b * SB, dur: d * SB, midi: m + (voice === 'female' ? 12 : 0), legato: k > 0, rest: 0}));
      const sig = renderVoice(mel, {voice, seed, sigma: 10, bpm: BPM, gMin, gRange, vib: [20, 40]});
      const ns = ana(sig.x, scale, 0).notes; tot += ns.length;
      const used = new Set();
      for (const t of mel) { const k = ns.findIndex((n, i) => !used.has(i) && n.n === t.midi && Math.abs(n.t0 - t.on) <= 0.12); if (k >= 0) used.add(k); else miss++; }
      ns.forEach((n, i) => { if (!used.has(i)) { extra++; if (ex.length < 3) ex.push([voice, seed, +(n.t0 - LEAD).toFixed(2), +(n.t1 - n.t0).toFixed(3), n.n]); } });
    }
    const ok = extra === 0 && miss === 0; if (!ok) bad++;
    console.log(`${ok ? 'PASS' : 'FAIL'} slide ${Math.round(gMin*1000)}-${Math.round((gMin+gRange)*1000)} ms: sung ${MEL.length*6}, detected ${tot}, extra ${extra}, missed ${miss}`, JSON.stringify(ex));
  }
}
console.log('bad', bad);
