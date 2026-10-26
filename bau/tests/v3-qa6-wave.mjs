// QA MK6-08 extra: wave sequence at other pitches / KEY SYNC Stimme (Stufe), and Glatt (all waves present)
import {renderW, mkPatch} from './v3-mk2-node.mjs';
import {mKlick} from './v3-mk1-ana.mjs';
const FILE = process.env.MK_FILE, SR = 48000;
const Z = () => new Array(16).fill(0);
const Q = (k, m, v) => ({k, m: m == null ? 1 : m, v: v ? v.concat(Z()).slice(0, 16) : Z()});
function mKlickSw(x, sr, ts) {   // = v3-mk6-seq.mjs / v3-mk2-osc.mjs
  const hp = (v, f, q) => { const w = 2 * Math.PI * f / sr, a = Math.sin(w) / (2 * q), cw = Math.cos(w), b0 = (1 + cw) / 2, b1 = -(1 + cw), a0 = 1 + a, a1 = -2 * cw, a2 = 1 - a; const y = new Float64Array(v.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    for (let i = 0; i < v.length; i++) { const o = (b0 * v[i] + b1 * x1 + b0 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = v[i]; y2 = y1; y1 = o; y[i] = o; } return y; };
  const h = hp(hp(Float64Array.from(x), 5000, .5412), 5000, 1.3066), W2 = Math.round(.002 * sr), E = i => { let e = 0; for (let k = i; k < i + W2; k++) e += h[k] * h[k]; return e / W2 + 1e-20; };
  const med = a => a.slice().sort((p, q) => p - q)[a.length >> 1], pdb = v => 10 * Math.log10(v);
  let worst = -99, at = 0;
  for (const t of ts) { const c = Math.round(t * sr), pre = [], post = [];
    for (let i = c - Math.round(.022 * sr); i + W2 <= c - Math.round(.002 * sr); i += W2) pre.push(E(i)); for (let i = c + Math.round(.01 * sr); i + W2 <= c + Math.round(.03 * sr); i += W2) post.push(E(i));
    const ref = Math.max(med(pre), med(post)); for (let i = c - W2; i < c + Math.round(.01 * sr); i += W2 / 2) { const d = pdb(E(i) / ref); if (d > worst) { worst = d; at = t; } } }
  return {worst, at};
}
const all = Array.from({length: 64}, (_, i) => i + 1);
for (const [note, ks, c2s] of [[45, 1, [0, 30, 60, 90, 120, 10]], [69, 2, [0, 126, 2, 124, 50, 80]], [81, 1, [20, 100, 40, 110, 6, 64]], [33, 1, [0, 126, 60, 4, 90, 30]]]) {
  const p = mkPatch({o1: {w: 5, c1: 0, c2: 63}, a: {gate: 1, lvl: 64}}); p.t[0].seq = {on: 1, last: 6, type: 0, run: 1, ks, res: 6, q: [Q(5, 1, c2s.map(x => x - 63)), Q(0), Q(0)]};
  const y = renderW(p, [[0, 'on', note, .8]], {sec: 1.6, file: FILE}, all).l;
  const k = mKlickSw(y, SR, [1, 2, 3, 4, 5, 6].map(k => k * .25));
  console.log((k.worst <= 6 ? 'PASS' : 'FAIL') + ' Wellenfolge Stufe Note ' + note + ' KS ' + ks + ' Wellen ' + c2s.map(x => Math.floor(x / 2) + 1).join(',') + ': M-KLICK ' + k.worst.toFixed(1) + ' dB bei ' + k.at + ' s');
}
// Glatt: sweep 0 -> 126 within each step (1/8 = 250 ms): continuous wave changes
{
  const p = mkPatch({o1: {w: 5, c1: 0, c2: 63}, a: {gate: 1, lvl: 64}}); p.t[0].seq = {on: 1, last: 2, type: 0, run: 1, ks: 1, res: 6, q: [Q(5, 0, [-63, 63]), Q(0), Q(0)]};
  const y = renderW(p, [[0, 'on', 57, .8]], {sec: 1.6, file: FILE}, all).l;
  const ts = []; for (let t = .1; t < 1.5; t += .05) ts.push(+t.toFixed(2));
  const k = mKlickSw(y, SR, ts);
  console.log('INFO Wellenfolge GLATT (Steuer 2 0→126 je 250 ms): M-KLICK ' + k.worst.toFixed(1) + ' dB bei ' + k.at + ' s');
}
