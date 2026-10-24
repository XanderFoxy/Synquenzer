// independent repro: legato slides of various lengths through the app's offline analysis (vsAnalyseSignal), C major melody
import {open} from './v3-qa-grp-lib.mjs';
import {renderVoice} from './v3-qa-grp-corpus.mjs';
const {br, E, errs} = await open({mic: false});
const BPM = 96, SB = 60 / BPM, LEAD = 0.1;
// C major line, steps of 1-5 semitones (different from the reporter's melody)
const MEL = [[0,1,60],[1,1,62],[2,1,64],[3,1,67],[4,2,65],[6,1,64],[7,1,62],[8,1,60],[9,1,67],[10,2,69],[12,1,67],[13,1,64],[14,2,62]];
const scale = Array.from({length: 12}, (_, k) => [0,2,4,5,7,9,11].includes(k));
for (const [gMin, gRange] of [[0.04, 0.04], [0.08, 0.04], [0.10, 0.05], [0.12, 0.06], [0.15, 0.1]]) {
  let tot = 0, extra = 0, ex = [];
  for (const seed of [11, 12, 13]) for (const voice of ['male', 'female']) {
    const mel = MEL.map(([b, d, m], k) => ({on: LEAD + b * SB, dur: d * SB, midi: m + (voice === 'female' ? 12 : -12) + (voice==='male'?12:0) - (voice==='male'?12:0), legato: k > 0, rest: 0}));
    const sig = renderVoice(mel, {voice, seed, sigma: 10, bpm: BPM, gMin, gRange, vib: [20, 40]});
    const r = await E(([x, sc]) => SYNQUENZER.vsAnalyseSignal(x, {snap: true, scale: sc, root: 0}), [Array.from(sig.x), scale]);
    const ns = r.notes;
    tot += ns.length;
    const used = new Set();
    for (const t of mel) { const k = ns.findIndex((n, i) => !used.has(i) && n.n === t.midi && Math.abs(n.t0 - t.on) <= 0.12); if (k >= 0) used.add(k); }
    ns.forEach((n, i) => { if (!used.has(i)) { extra++; if (ex.length < 4) ex.push([voice, seed, +(n.t0 - LEAD).toFixed(2), +(n.t1 - n.t0).toFixed(3), n.n]); } });
  }
  console.log(`slide ${Math.round(gMin*1000)}-${Math.round((gMin+gRange)*1000)} ms: sung ${MEL.length*6}, detected ${tot}, unmatched(extra) ${extra}`, JSON.stringify(ex));
}
console.log('errs', errs); await br.close();
