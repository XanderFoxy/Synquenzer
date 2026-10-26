// QA FP-DSP MK6: KEY SYNC switched at a held note (Timbre <-> Stimme), Amp-Pegel target with a constant value +40: the offset
// should stay +40 (no change at all), measured on the gain tap and with M-KLICK / M-EINBRUCH on audio
import {render, mkPatch} from './v3-mk2-node.mjs';
import {mKlick, mEinbruch} from './v3-mk1-ana.mjs';
const FILE = process.env.MK_FILE, SR = 48000;
const Z = () => new Array(16).fill(0);
const SP = (t, sq) => { const p = mkPatch(t || {}); p.t[0].seq = Object.assign({on: 1, last: 16, type: 0, run: 1, ks: 1, res: 3}, sq); return p; };
const M = x => Math.round(x * 10) / 10;
for (const [a, b] of [[1, 2], [2, 1], [0, 2], [2, 0]]) for (const m of [1, 0]) {
  const sq = {ks: a, q: [{k: 15, m, v: new Array(16).fill(40)}, {k: 0, m: 1, v: Z()}, {k: 0, m: 1, v: Z()}]};
  const base = {e2: {a: 0, d: 64, s: 127, r: 20}, a: {lvl: 64}, mix: {o1: 127, o2: 0, n: 0}};
  const at = [[.55, {mkSet: {'t.0.seq.ks': b}}]];
  const g = render(SP(base, sq), [[0, 'on', 72, 1]], {file: FILE, sec: 1, tap: 'gain', at}).l;
  const i0 = Math.round(.5 * SR), i1 = Math.round(.6 * SR); let mn = Infinity, mx = -Infinity; for (let i = i0; i < i1; i++) { mn = Math.min(mn, g[i]); mx = Math.max(mx, g[i]); }
  const ref = g[i0], dip = 20 * Math.log10(mn / ref), up = 20 * Math.log10(mx / ref);
  const y = render(SP(base, sq), [[0, 'on', 72, 1]], {file: FILE, sec: 1, at}).l;
  const k = mKlick(y.slice(Math.round(.45 * SR), Math.round(.65 * SR)), SR, []), e = mEinbruch(y, SR, .55);
  console.log(`KEY SYNC ${['aus', 'Timbre', 'Stimme'][a]} -> ${['aus', 'Timbre', 'Stimme'][b]} at a held note, ${m ? 'Stufe' : 'Glatt'}, A-PEGEL +40 constant: gain ${M(dip)} / +${M(up)} dB around the switch · M-KLICK ${M(k.worst)} dB · M-EINBRUCH ${M(e.worst)} dB`);
}
