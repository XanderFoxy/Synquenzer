import {renderW, mkPatch} from './v3-mk2-node.mjs';
const FILE = process.env.MK_FILE, SR = 48000;
const Z = () => new Array(16).fill(0);
const Q = (k, m, v) => ({k, m: m == null ? 1 : m, v: v ? v.concat(Z()).slice(0, 16) : Z()});
function hpE(x, sr) { const hp = (v, f, q) => { const w = 2 * Math.PI * f / sr, a = Math.sin(w) / (2 * q), cw = Math.cos(w), b0 = (1 + cw) / 2, b1 = -(1 + cw), a0 = 1 + a, a1 = -2 * cw, a2 = 1 - a; const y = new Float64Array(v.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    for (let i = 0; i < v.length; i++) { const o = (b0 * v[i] + b1 * x1 + b0 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = v[i]; y2 = y1; y1 = o; y[i] = o; } return y; };
  return hp(hp(Float64Array.from(x), 5000, .5412), 5000, 1.3066); }
const all = Array.from({length: 64}, (_, i) => i + 1);
const prof = (y, t, label) => { const h = hpE(y, SR), c = Math.round(t * SR), W = 96; const out = []; for (let i = c - 20 * 48; i < c + 20 * 48; i += W) { let e = 0, p = 0; for (let k = i; k < i + W; k++) { e += h[k] * h[k]; p = Math.max(p, Math.abs(y[k])); } out.push(((i - c) / 48).toFixed(0) + 'ms:' + (10 * Math.log10(e / W + 1e-20)).toFixed(0) + '/' + p.toFixed(2)); } console.log(label + '\n  ' + out.join(' ')); };
for (const [note, c2s, t] of [[45, [0, 30, 60, 90, 120, 10], .5], [33, [0, 126, 60, 4, 90, 30], 1.25]]) {
  const p = mkPatch({o1: {w: 5, c1: 0, c2: 63}, a: {gate: 1, lvl: 64}}); p.t[0].seq = {on: 1, last: 6, type: 0, run: 1, ks: 1, res: 6, q: [Q(5, 1, c2s.map(x => x - 63)), Q(0), Q(0)]};
  const y = renderW(p, [[0, 'on', note, .8]], {sec: 1.6, file: FILE}, all).l;
  prof(y, t, 'SEQ Note ' + note + ' Wechsel bei ' + t + ' s (HP-Energie dB / Spitze je 2 ms)');
  // the same switch by the knob (mkSet STEUER 2) at the same time, no seq
  const k = Math.round(t / .25), from = c2s[k - 1], to = c2s[k % 6];
  const p2 = mkPatch({o1: {w: 5, c1: 0, c2: from}, a: {gate: 1, lvl: 64}});
  const y2 = renderW(p2, [[0, 'on', note, .8]], {sec: 1.6, file: FILE, at: [[t, {mkSet: {'t.0.o1.c2': to}}]]}, all).l;
  prof(y2, t, 'REGLER Note ' + note + ' STEUER 2 ' + from + ' → ' + to + ' bei ' + t + ' s');
}
