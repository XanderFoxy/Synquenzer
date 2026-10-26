// QA MK2-03 wave changes at a sounding note (Node worklet + app mkTables): transient vs both steady states, literal M-KLICK, M-EINBRUCH
import {renderW, mkPatch, mktab} from './v3-mk2-node.mjs';
import {pdb, mKlick, mEinbruch} from './v3-mk1-ana.mjs';
const SR = 48000;
function hp(x) { const f = 5000, sr = SR; const run = (v, q) => { const w = 2 * Math.PI * f / sr, a = Math.sin(w) / (2 * q), cw = Math.cos(w), b0 = (1 + cw) / 2, b1 = -(1 + cw), a0 = 1 + a, a1 = -2 * cw, a2 = 1 - a; const y = new Float64Array(v.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < v.length; i++) { const o = (b0 * v[i] + b1 * x1 + b0 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = v[i]; y2 = y1; y1 = o; y[i] = o; } return y; }; return run(run(Float64Array.from(x), .5412), 1.3066); }
function trans(x, ts) { const h = hp(x), W = 96, E = i => { let e = 0; for (let k = i; k < i + W; k++) e += h[k] * h[k]; return e / W + 1e-20; }; const med = a => a.slice().sort((p, q) => p - q)[a.length >> 1];
  let worst = -99; for (const t of ts) { const c = Math.round(t * SR); let ref = 0; for (let i = c - 1920; i + W <= c - 240; i += 24) ref = Math.max(ref, E(i)); for (let i = c + 480; i + W <= c + 2160; i += 24) ref = Math.max(ref, E(i));
    for (let i = c - W; i < c + 384; i += 24) worst = Math.max(worst, pdb(E(i) / ref)); } return worst; }
let s = 11; const RND = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
const ALL = []; for (let n = 1; n <= 64; n++) ALL.push(n);
let wt = -99, wtp = null, lit = 0, litw = -99, ein = 0, einw = 0, cnt = 0;
for (let k = 0; k < 40; k++) {
  const note = [45, 52, 57, 64, 69, 76][k % 6], seq = []; for (let j = 0; j < 6; j++) seq.push(1 + Math.floor(RND() * 64));
  const at = seq.slice(1).map((n, j) => [.3 + j * .25, {mkSet: {'t.0.o1.c2': 2 * n - 2}}]);
  const r = renderW(mkPatch({o1: {w: 5, c2: 2 * seq[0] - 2}, f: {type: 0, cut: 127, res: 0}, a: {gate: 1}}), [[0, 'on', note, .8]], {sec: 1.7, at}, ALL);
  const ts = at.map(a => Math.ceil(a[0] * SR / 128) * 128 / SR);
  ts.forEach((t, j) => { if (seq[j] === seq[j + 1]) return; cnt++; const w = trans(r.l, [t]); if (w > wt) { wt = w; wtp = [seq[j], seq[j + 1], note]; }
    const e = mEinbruch(r.l, SR, t); if (!e.ok) ein++; einw = Math.min(einw, e.worst); });
  const mk = mKlick(r.l, SR, [0]); if (!mk.ok) lit++; litw = Math.max(litw, mk.worst);
}
console.log('wave changes', cnt, '| transient over the MAX steady 2-ms window: worst', wt.toFixed(1), 'dB at', JSON.stringify(wtp), '| M-EINBRUCH fails', ein, 'worst', einw.toFixed(1), '| literal M-KLICK renders failing', lit, 'of 40, worst', litw.toFixed(1));
// change between a stored wave and saw / Sinus x / Stimmwelle / noise (SXF)
for (const [w0, w1] of [[0, 5], [5, 0], [5, 3], [4, 5], [5, 6], [3, 5]]) {
  const r = renderW(mkPatch({o1: {w: w0, c2: 22}, f: {type: 0, cut: 127, res: 0}, a: {gate: 1}}), [[0, 'on', 57, .8]], {sec: 1, at: [[.4, {mkSet: {'t.0.o1.w': w1}}]]}, [12]);
  const t = Math.ceil(.4 * SR / 128) * 128 / SR; console.log('wave', w0, '->', w1, 'transient', trans(r.l, [t]).toFixed(1), 'dB; M-EINBRUCH', mEinbruch(r.l, SR, t).worst.toFixed(1), 'dB');
}
// with OSC 2 sync / ring on a stored wave: changes
for (const mod of [1, 2, 3]) {
  const at = [[.3, {mkSet: {'t.0.o1.c2': 2 * 40 - 2}}], [.55, {mkSet: {'t.0.o1.c2': 2 * 61 - 2}}], [.8, {mkSet: {'t.0.o1.c2': 2 * 3 - 2}}]];
  const r = renderW(mkPatch({o1: {w: 5, c2: 2 * 20 - 2}, o2: {w: 0, mod, semi: 7}, mix: {o1: 100, o2: 100}, f: {type: 0, cut: 127, res: 0}, a: {gate: 1}}), [[0, 'on', 57, .8]], {sec: 1.1, at}, ALL);
  let nan = 0; for (const v of r.l) if (!isFinite(v)) nan++;
  console.log('OSC MOD', mod, 'transient', trans(r.l, at.map(a => Math.ceil(a[0] * SR / 128) * 128 / SR)).toFixed(1), 'dB NaN', nan);
}
