import {loadDsp} from './v3-vs2-corpus.mjs';
import {sing} from './v3-qa-vs2b-acc-synth.mjs';
const Ds = process.argv.slice(2).map(f => [f, loadDsp(f)]);
const BPM = 100, SB = 60 / BPM, LEAD = 0.04, variant = process.env.V || 'gentle';
const MEL = [[0, 1, 57], [1, 1, 60], [2, 2, 64], [4, 1, 62], [5, 1, 60], [6, 2, 57], [8, 1, 59], [9, 1, 62], [10, 2, 65], [12, 1, 64], [13, 1, 60], [14, 1.5, 57]];
const notes = MEL.map(([b, d, m], k) => { const n = {on: LEAD + b * SB, dur: d * SB - 0.12, midi: m, vowel: 'aoeau'[k % 5]};
  if (variant === 'gentle') n.scoop = [1.3, 0.14]; if (variant === 'roomfall' || variant === 'dryfall') n.fall = [2.5, 0.14, 9]; if (d >= 2) n.vib = {ct: 60, hz: 5.5, delay: 0.2, jit: 1}; return n; });
const s = sing(notes, variant === 'roomfall' ? {voice: 'male', seed: 4, sigma: 6, wet: -18, rt: 0.4, snr: 40} : {voice: 'male', seed: 4, sigma: 6, rev: false, snr: 45});
const R = Ds.map(() => ({ex: 0, bad: []}));
for (let off = +(process.env.O0 || -0.045); off <= +(process.env.O1 || 0.06); off += +(process.env.OS || 0.0025)) {
  // window starts at beat 0 minus off (off > 0: window starts before the lead-in; < 0: cuts into the first scoop)
  const i0 = Math.max(0, Math.round((LEAD - off) * 16000)), x = s.x.slice(i0);
  Ds.forEach(([f, D], j) => { const ns = D.segment(D.pyin(x, {fs: 16000}), {snap: false, tuning: 'auto'}).notes; const used = new Set(); let hit = 0;
    for (const [b, , mm] of MEL) { const k = ns.findIndex((n, i) => !used.has(i) && n.n === mm && Math.abs((n.t0 - off) / SB - b) <= 0.2); if (k >= 0) { used.add(k); hit++; } }
    const ex = ns.filter((n, i) => !used.has(i)); R[j].ex += ex.length; if (ex.length && R[j].bad.length < 6) R[j].bad.push([+off.toFixed(4), ...ex.map(n => [+((n.t0 - off) / SB).toFixed(2), +((n.t1 - n.t0) / SB).toFixed(2), n.n])]); });
}
Ds.forEach(([f], j) => console.log(f, JSON.stringify(R[j])));
