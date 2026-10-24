// QA group (VS2, Xander's device feedback 24.10.: "falsche Zwischennoten", "es wackelt"): slides between notes, scoops and wide
// vibrato → does Stimme → Noten add intermediate notes or split notes? Core = vsAnalyseSignal (same as the app's offline path).
import {open, check, done} from './v3-qa-grp-lib.mjs';
import {renderVoice} from './v3-qa-grp-corpus.mjs';
const {br, p, errs, E} = await open({mic: false});
const BPM = 100, SB = 60 / BPM, LEAD = 0.1;
// A minor, sung like a pop line: steps and leaps
const MEL = [[0, 1, 57], [1, 1, 60], [2, 2, 64], [4, 1, 62], [5, 1, 60], [6, 2, 59], [8, 1, 57], [9, 1, 64], [10, 2, 67], [12, 1, 65], [13, 1, 64], [14, 2, 60]];
const conds = {
  base: {legato: false, o: {}},
  glide: {legato: true, o: {gMin: 0.15, gRange: 0.1}},
  scoop: {legato: false, o: {scoopP: 1, scoopMin: 1, scoopRange: 1, scoopTau: 0.06}},
  vib: {legato: false, o: {vib: [50, 80], vibDelay: 0.12}},
  all: {legato: true, o: {gMin: 0.15, gRange: 0.1, vib: [50, 80], vibDelay: 0.12}},
};
const out = {};
for (const [name, c] of Object.entries(conds)) {
  let tot = {n: 0, hit: 0, extra: 0, split: 0, seeds: 0};
  for (const seed of [1, 2, 3, 4]) {
    for (const voice of ['male', 'female']) {
      const mel = MEL.map(([b, d, m], k) => ({on: LEAD + b * SB, dur: d * SB, midi: m + (voice === 'female' ? 12 : 0), legato: c.legato && k > 0, rest: 0}));
      const sig = renderVoice(mel, {voice, seed, sigma: 12, bpm: BPM, ...c.o, vib: c.o.vib || [20, 40]});
      const r = await E(([x]) => SYNQUENZER.vsAnalyseSignal(x, {snap: true, scale: Array.from({length: 12}, (_, k) => [0, 2, 3, 5, 7, 8, 10].includes(k)), root: 9}), [Array.from(sig.x)]);
      const ns = r.notes.map(n => ({on: n.t0 != null ? n.t0 : n.on, off: n.t1 != null ? n.t1 : n.off, m: n.n != null ? n.n : n.m}));
      if (seed === 1 && voice === 'male' && name !== 'base') console.log(name, 'notes', JSON.stringify(ns.map(n => [+(n.on - LEAD).toFixed(2), +((n.off - n.on)).toFixed(2), n.m])));
      // match: same pitch and onset within 0.12 s of the truth note; extra = a detected note matching no truth note; split = >1 detected notes inside one truth note with its pitch
      let hit = 0; const used = new Set();
      for (const t of mel) { const k = ns.findIndex((n, i) => !used.has(i) && n.m === t.midi && Math.abs(n.on - t.on) <= 0.12); if (k >= 0) { hit++; used.add(k); } }
      let extra = 0, split = 0;
      ns.forEach((n, i) => { if (used.has(i)) return; const inside = mel.find(t => n.on >= t.on - 0.05 && n.on < t.on + t.dur); if (inside && inside.midi === n.m) split++; else extra++; });
      tot.n += ns.length; tot.hit += hit; tot.extra += extra; tot.split += split; tot.seeds++;
    }
  }
  out[name] = {sung: MEL.length * tot.seeds, detected: tot.n, hits: tot.hit, extraNotes: tot.extra, splitNotes: tot.split, F: +(2 * tot.hit / (MEL.length * tot.seeds + tot.n)).toFixed(3)};
  console.log(name, JSON.stringify(out[name]));
}
check('slides (150–250 ms): no extra intermediate notes', out.glide.extraNotes === 0, out.glide);
check('scoops (1–2 HT from below): no extra notes', out.scoop.extraNotes === 0, out.scoop);
check('wide vibrato (±50–80 ct): no split / extra notes', out.vib.extraNotes + out.vib.splitNotes === 0, out.vib);
check('slides + vibrato: no extra / split notes', out.all.extraNotes + out.all.splitNotes === 0, out.all);
console.log('errs', errs); await br.close(); done();
