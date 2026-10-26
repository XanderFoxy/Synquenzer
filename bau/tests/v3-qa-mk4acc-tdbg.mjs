import {render, mkPatch} from './v3-mk1-node.mjs';
const FILE = process.env.MK_FILE;
const FX0 = {mfx: {type: 0, spd: 64, dep: 0}, dly: {type: 0, sync: 1, time: 64, note: 5, dep: 60}, eq: {lf: 320, lg: 0, hf: 6000, hg: 0}};
const P = () => Object.assign(mkPatch({o1: {w: 0}, mix: {o1: 127}, a: {gate: 1}}), JSON.parse(JSON.stringify(FX0)));
const sr = 44100;
function lag(x, t0) { const i0 = Math.round(t0 * sr); let s = i0; while (Math.abs(x[s]) < 1e-3) s++; const n = Math.round(.03 * sr); let best = 0, bl = -1; for (let L = Math.round(.1 * sr); L <= Math.round(.45 * sr); L++) { let c = 0; for (let i = 0; i < n; i++) c += x[s + i] * x[s + i + L]; if (c > best) { best = c; bl = L; } } return bl; }
for (const [nm, at] of [['tempo change in silence (no at)', [[2.5, {tempo: {bpm: 90, start: null}}]]], ['tempo change with at in future', [[2.5, {tempo: {bpm: 90, start: null, at: 2.6}}]]], ['tempo change during echo tail', [[0.3, {tempo: {bpm: 90, start: null}}]]]]) {
  const ev = [[.1, 'on', 72, .9], [.15, 'off', 72], [4.5, 'on', 72, .9], [4.55, 'off', 72]];
  const r = render(P(), ev, {sec: 5.5, file: FILE, sr, at});
  console.log(nm, 'note1 lag', lag(r.l, .1), 'note2 lag', lag(r.l, 4.5), '(expect 11025 / 14700)');
}
