// MK4-03 Ensemble: wet L/R correlation and wet level at ALL frozen LFO phases (24 steps + the tap-coincidence phases), real noise voice
import {render, mkPatch} from './v3-mk1-node.mjs';
const FILE = process.env.MK_FILE;
const FX0 = {mfx: {type: 1, spd: 64, dep: 127}, dly: {type: 0, sync: 0, time: 64, note: 8, dep: 0}, eq: {lf: 320, lg: 0, hf: 6000, hg: 0}};
const pat = (dep) => Object.assign(mkPatch({o1: {w: 0}, mix: {o1: 0, o2: 0, n: 127}, a: {gate: 1}}), JSON.parse(JSON.stringify(FX0)), dep == null ? {} : {mfx: {type: 1, spd: 64, dep}});
const ev = [[0, 'on', 60, .9], [1.4, 'off', 60]];
const dry = render(pat(0), ev, {sec: 1.5, file: FILE});
const w = Math.min(.5, .6 * 127 / 127), i0 = 9600, i1 = 64000;
const out = [];
const phs = []; for (let k = 0; k < 24; k++) phs.push(k / 24); phs.push(1 / 12, 5 / 12, 3 / 12, 9 / 12, 7 / 12, 11 / 12);
for (const ph of phs) {
  const o = render(pat(), ev, {sec: 1.5, file: FILE, at: [[0, {mkFxFrz: ph}]]});
  let lr = 0, ll = 0, rr = 0, xx = 0;
  for (let i = i0; i < i1; i++) { const x = dry.l[i], wl = (o.l[i] - (1 - w) * x) / w, wr = (o.r[i] - (1 - w) * x) / w; lr += wl * wr; ll += wl * wl; rr += wr * wr; xx += x * x; }
  out.push({deg: Math.round(ph * 360), corr: +(lr / Math.sqrt(ll * rr)).toFixed(3), wetL: +(10 * Math.log10(ll / xx)).toFixed(2), wetR: +(10 * Math.log10(rr / xx)).toFixed(2)});
}
out.sort((a, b) => a.deg - b.deg);
for (const r of out) console.log(JSON.stringify(r) + (r.corr > .5 || Math.abs(r.wetL) > 1 || Math.abs(r.wetR) > 1 ? '   <-- verfehlt MK4-03' : ''));
// running LFO: correlation of the wet signals in 20 ms windows over 3 s (TEMPO 64, period 2.16 s)
const ev2 = [[0, 'on', 60, .9], [3.4, 'off', 60]];
const d2 = render(pat(0), ev2, {sec: 3.5, file: FILE}), o2 = render(pat(), ev2, {sec: 3.5, file: FILE});
let mx = -1, at = 0, n = 0, over = 0; const W = 960;
for (let s = 9600; s + W < 3.3 * 48000; s += W) { let lr = 0, ll = 0, rr = 0; for (let i = s; i < s + W; i++) { const x = d2.l[i], wl = (o2.l[i] - (1 - w) * x) / w, wr = (o2.r[i] - (1 - w) * x) / w; lr += wl * wr; ll += wl * wl; rr += wr * wr; } const c = lr / Math.sqrt(ll * rr); n++; if (c > .5) over++; if (c > mx) { mx = c; at = s / 48000; } }
console.log('running LFO, 20 ms windows: max corr', mx.toFixed(3), 'at', at.toFixed(3), 's; windows > 0.5:', over, 'of', n);
