// QA: KEY SYNC Timbre restart while an earlier voice still releases, BEWEGUNG Glatt vs Stufe, target Amp-Pegel: HP energy around the restart
import {render, mkPatch} from './v3-mk2-node.mjs';
const FILE = process.env.MK_FILE, SR = 48000;
const Z = () => new Array(16).fill(0);
const Q = (k, m, v) => ({k, m: m == null ? 1 : m, v: v ? v.concat(Z()).slice(0, 16) : Z()});
function hpE(x, sr) { const hp = (v, f, q) => { const w = 2 * Math.PI * f / sr, a = Math.sin(w) / (2 * q), cw = Math.cos(w), b0 = (1 + cw) / 2, b1 = -(1 + cw), a0 = 1 + a, a1 = -2 * cw, a2 = 1 - a; const y = new Float64Array(v.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    for (let i = 0; i < v.length; i++) { const o = (b0 * v[i] + b1 * x1 + b0 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = v[i]; y2 = y1; y1 = o; y[i] = o; } return y; };
  return hp(hp(Float64Array.from(x), 5000, .5412), 5000, 1.3066); }
for (const [m, vals] of [[1, [-63, 63, 63, 63]], [0, [-63, 63, 63, 63]], [0, [63, 63, 63, 63]]]) {
  const p = mkPatch({mix: {o1: 0, o2: 0, n: 0}, o1: {w: 3, c1: 0, c2: 0}, e2: {a: 0, d: 64, s: 127, r: 100}, a: {lvl: 64, vel: 63}});
  p.t[0].mix.o1 = 127;
  p.t[0].seq = {on: 1, last: 4, type: 0, run: 1, ks: 1, res: 3, q: [Q(15, m, vals), Q(0), Q(0)]};
  const ev = [[0, 'on', 60, 1], [.40, 'off', 60], [.45, 'on', 72, .05]];
  const y = render(p, ev, {file: FILE, sec: .7}).l, h = hpE(y, SR);
  const c = Math.round(.45 * SR), W = 96, out = [];
  for (let i = c - 10 * 48; i < c + 12 * 48; i += W) { let e = 0, pk = 0; for (let k = i; k < i + W; k++) { e += h[k] * h[k]; pk = Math.max(pk, Math.abs(y[k])); } out.push(((i - c) / 48).toFixed(0) + ':' + (10 * Math.log10(e / W + 1e-30)).toFixed(0) + '/' + pk.toFixed(3)); }
  console.log((m ? 'Stufe' : 'Glatt') + ' ' + vals.join(',') + ' (Sinus C4, Neustart bei 0,45 s; HP>5k dB / Spitze je 2 ms)\n  ' + out.join(' '));
}
