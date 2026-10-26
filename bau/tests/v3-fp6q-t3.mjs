// QA FP-DSP MK6: a value of the RUNNING step changed while a note is held (SCHRITTE painting writes the finger's value at once)
// Glatt vs Stufe, targets A-PEGEL / CUTOFF / PAN, sources saw C5 / noise. M-KLICK (<= 6 dB) in +-60 ms around the edit.
import {render, mkPatch} from './v3-mk2-node.mjs';
import {mKlick} from './v3-mk1-ana.mjs';
const FILE = process.env.MK_FILE, SR = 48000, M = x => Math.round(x * 10) / 10;
const Z = () => new Array(16).fill(0);
const SP = (t, sq) => { const p = mkPatch(t || {}); p.t[0].seq = Object.assign({on: 1, last: 16, type: 0, run: 1, ks: 1, res: 3}, sq); return p; };
function mKlickSw(x, sr, ts) {   // = v3-mk2-osc.mjs
  const hp = (v, f, q) => { const w = 2 * Math.PI * f / sr, a = Math.sin(w) / (2 * q), cw = Math.cos(w), b0 = (1 + cw) / 2, b1 = -(1 + cw), a0 = 1 + a, a1 = -2 * cw, a2 = 1 - a; const y = new Float64Array(v.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    for (let i = 0; i < v.length; i++) { const o = (b0 * v[i] + b1 * x1 + b0 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = v[i]; y2 = y1; y1 = o; y[i] = o; } return y; };
  const h = hp(hp(Float64Array.from(x), 5000, .5412), 5000, 1.3066), W2 = Math.round(.002 * sr), E = i => { let e = 0; for (let k = i; k < i + W2; k++) e += h[k] * h[k]; return e / W2 + 1e-20; };
  const med = a => a.slice().sort((p, q) => p - q)[a.length >> 1], pdb = v => 10 * Math.log10(v);
  let worst = -99, at = 0;
  for (const t of ts) { const c = Math.round(t * sr), pre = [], post = [];
    for (let i = c - Math.round(.022 * sr); i + W2 <= c - Math.round(.002 * sr); i += W2) pre.push(E(i)); for (let i = c + Math.round(.01 * sr); i + W2 <= c + Math.round(.03 * sr); i += W2) post.push(E(i));
    const ref = Math.max(med(pre), med(post)); for (let i = c - W2; i < c + Math.round(.01 * sr); i += W2 / 2) { const d = pdb(E(i) / ref); if (d > worst) { worst = d; at = t; } } }
  return {worst, at, ok: worst <= 6};
}
const rows = [];
for (const [tg, nm, extra] of [[15, 'A-PEGEL', {a: {lvl: 64}}], [11, 'CUTOFF res 0', {f: {cut: 64, res: 0}}], [11, 'CUTOFF res 100', {f: {cut: 64, res: 100}}], [16, 'PAN', {a: {lvl: 100, pan: 0}}]])
  for (const [src, mix, note] of [['Säge C5', {o1: 127, o2: 0, n: 0}, 72], ['Rauschen', {o1: 0, o2: 0, n: 127}, 72]]) {
    const r = [], r2 = [];
    for (const m of [0, 1]) {
      const base = Object.assign({e2: {a: 0, d: 64, s: 127, r: 20}, mix}, JSON.parse(JSON.stringify(extra)));
      const sq = {q: [{k: tg, m, v: new Array(16).fill(-63)}, {k: 0, m: 1, v: Z()}, {k: 0, m: 1, v: Z()}]};
      const y = render(SP(base, sq), [[0, 'on', note, 1]], {file: FILE, sec: 1, at: [[.55, {mkSet: {'t.0.seq.q.0.v.4': 63}}]]});
      const L = y.l.slice(Math.round(.49 * SR), Math.round(.61 * SR)), R_ = y.r.slice(Math.round(.49 * SR), Math.round(.61 * SR));
      const ka = Math.max(mKlick(L, SR, []).worst, mKlick(R_, SR, []).worst), kb = Math.max(mKlickSw(y.l, SR, [.55]).worst, mKlickSw(y.r, SR, [.55]).worst); r.push(kb); r2.push(ka);
    }
    rows.push(`${nm.padEnd(15)} ${src.padEnd(9)} step 5: -63 -> +63 at 0.55 s: Glatt ${M(r[0])} dB · Stufe ${M(r[1])} dB (mKlickSw, Bezug lauterer stehender Zustand) | ana-mKlick Glatt ${M(r2[0])} / Stufe ${M(r2[1])}` + (r[0] > 6 ? '  <-- M-KLICK > 6 dB' : ''));
  }
console.log(rows.join('\n'));
