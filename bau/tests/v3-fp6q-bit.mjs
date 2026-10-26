// QA FP-DSP MK6: "aus = bitgleich" against 4.12.0 with other material (Dual, stealing, waves, patches, seq off with values,
// seq on with zeros at KEY SYNC Stimme / aus with a running song), plus NaN/Inf at extremes (20 s).
import {renderW, mkPatch} from './v3-mk2-node.mjs';
const A = process.env.MK_FILE, B = process.env.MK_PREV;
const Z = () => new Array(16).fill(0);
const rnd = (() => { let s = 99; return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296; })();
const RV = R => Array.from({length: 16}, () => Math.round((rnd() * 2 - 1) * R));
function pat(i) {
  const p = mkPatch({o1: {w: [0, 1, 2, 3, 4, 5, 6][i % 7], c1: 40, c2: 70}, o2: {w: i % 3, mod: i % 4, semi: 5, tune: 10}, mix: {o1: 110, o2: 60, n: 10},
    f: {type: i % 4, cut: 70, res: 90, eg: 30, kbd: 20}, e1: {a: 10, d: 60, s: 40, r: 30}, e2: {a: 5, d: 70, s: 90, r: 40}, l1: {w: i % 4, ks: i % 3, sync: 0, f: 70, note: 6}, l2: {w: 2, ks: 2, sync: i & 1, f: 80, note: 8},
    p: [{s: 2, d: 4, i: 30}, {s: 1, d: 0, i: 10}, {s: 5, d: 5, i: -20}, {s: 3, d: 7, i: 15}]});
  if (i % 2) { p.mode = 1; p.t[1] = JSON.parse(JSON.stringify(p.t[0])); p.t[1].o1.w = 1; p.t[1].f.cut = 50; }   // Dual
  return p;
}
const ev = []; for (let k = 0; k < 6; k++) { ev.push([k * .25, 'on', 48 + 5 * k, .9]); ev.push([k * .25 + 1.1, 'off', 48 + 5 * k]); }
let worst = 0, n = 0; const lines = [];
const W = Array.from({length: 64}, (_, i) => i + 1);
for (let i = 0; i < 8; i++) for (const variant of ['off-with-values', 'on-zero-ks2', 'on-zero-ks0-song', 'on-zero-ks1-glatt']) {
  const p = pat(i); const tg = [11, 15, 23];
  for (const t of p.t) { if (variant === 'off-with-values') t.seq = {on: 0, last: 7, type: 2, run: 0, ks: 2, res: 5, q: [0, 1, 2].map(k => ({k: tg[k], m: k & 1, v: RV(63)}))};
    else t.seq = {on: 1, last: 16, type: i % 4, run: 1, ks: variant === 'on-zero-ks2' ? 2 : variant === 'on-zero-ks0-song' ? 0 : 1, res: i % 16, q: [0, 1, 2].map(k => ({k: [12, 26, 28][k] , m: variant.endsWith('glatt') ? 0 : 1, v: Z()}))}; }
  const o = {sec: 2.2, songStart: variant === 'on-zero-ks0-song' ? 0 : undefined};
  const a = renderW(p, ev, Object.assign({file: A}, o), W), b = renderW(p, ev, Object.assign({file: B}, o), W);
  let d = 0; for (let k = 0; k < a.l.length; k++) d = Math.max(d, Math.abs(a.l[k] - b.l[k]), Math.abs(a.r[k] - b.r[k])); worst = Math.max(worst, d); n++;
  if (d > 1e-6) lines.push(`patch ${i} ${variant}: max |d| ${d.toExponential(2)}`);
}
console.log(`bit-identity vs 4.12.0: ${n} renders, worst max|d| = ${worst.toExponential(2)}` + (lines.length ? '\n' + lines.join('\n') : ''));
// NaN / Inf, extremes
let bad = 0, pk = 0;
for (let i = 0; i < 6; i++) {
  const p = pat(i); p.t[0].f.res = 127; p.t[0].f.cut = 127;
  p.t[0].seq = {on: 1, last: 16, type: 3, run: 1, ks: 2, res: 0, q: [{k: [11, 1, 6, 12, 14, 7][i], m: 1, v: Array.from({length: 16}, (_, s) => (s & 1 ? 63 : -63))}, {k: [12, 13, 15, 16, 4, 5][i], m: 0, v: Array.from({length: 16}, (_, s) => (s & 2 ? 63 : -63))}, {k: 2, m: 1, v: Array.from({length: 16}, (_, s) => (s & 1 ? 6 : -6))}]};
  const r = renderW(p, [[0, 'on', 24, 1], [0, 'on', 108, 1], [0, 'on', 60, 1], [0, 'on', 84, 1]], {file: A, sec: 20}, W);
  for (let k = 0; k < r.l.length; k++) { const x = r.l[k], y = r.r[k]; if (!isFinite(x) || !isFinite(y)) { bad++; break; } pk = Math.max(pk, Math.abs(x), Math.abs(y)); }
}
console.log(`extremes 6 x 20 s (Resonanz 127, ±63 / ±6 at 1/48, KS Stimme): NaN/Inf renders ${bad}, peak ${pk.toFixed(3)} (${(20 * Math.log10(pk)).toFixed(1)} dBFS)`);
