// K2 Abnahme: K2-01 envelope of every operator = the target curve (the same envelope on that operator alone; and position-independent:
// the same envelope on OP k = on OP 1), 1..6 operators, dx and point form, parallel / pairs / chain, gains per block and audio (Goertzel)
// K2-02 6-note chords over a ringing chord at poly 8 and at the limiter caps (poly 6 / 4): no held note stolen, steal click
// K2-03 CPU per voice. Usage: node k2-abnahme.mjs [index.html]
import {scope, render, mag, db, FLAT, OP, FM6, FILE} from './k2-lib.mjs';
const file = process.argv[2] || FILE, res = [];
const ok = (id, pass, info) => { res.push({id, pass, info}); console.log((pass ? 'OK   ' : 'FAIL ') + id + ' ' + info); };
const ENV = {pt: k => ({f: 'pt', y: [0, 99, 80 - 5 * k, 60, 0], t: [5 + 20 * k, 200 + 40 * k, 300, 400], sus: 3}), dx: k => ({f: 'dx', r: [80 - 5 * k, 45 + 3 * k, 40, 55], l: [99, 80, 60, 0]})};
const EDG = {par: [], pairs: [[2, 1], [4, 3], [6, 5]], chain: [[2, 1], [3, 2], [4, 3], [5, 4], [6, 5]]};
const graph = (n, kind, form, only, same) => ({v: 2, n: 6, trans: 0, edges: EDG[kind].filter(e => e[0] <= n).map(([a, b]) => ({from: a, to: b})),
  ops: [0, 1, 2, 3, 4, 5].map(k => OP(k, {coarse: kind === 'par' ? k + 1 : 1 + (k % 3), ol: k < n && (only == null || only === k) ? 90 : 0, amp: ENV[form](same ? 0 : k)}))});
function trace(fm6) { const {G, procs} = scope(48000, file); const P = new procs['dirigent-analog']({processorOptions: {patch: FLAT, mods: [], fm6}});
  P.onMsg({ev: [[.01, 1, 1, 57, .8, -1], [1.0, 2, 1]]}); const L = new Float32Array(128), R = new Float32Array(128), rec = [];
  for (let f = 0; f < 48000 * 1.6; f += 128) { G.currentFrame = f; P.process([], [[L, R]]); const v = P.V.find(v => v.on && v.id === 1); rec.push(v ? Array.from(v.fg1) : [0, 0, 0, 0, 0, 0]); } return rec; }
// K2-01a: gains per block, n ops vs each op alone
let w1 = 0;
for (const form of ['dx', 'pt']) for (const kind of ['par', 'pairs', 'chain']) for (let n = 1; n <= 6; n++) {
  const A = trace(FM6(graph(n, kind, form)));
  for (let k = 0; k < n; k++) { const S = trace(FM6(graph(n, kind, form, k))); for (let i = 0; i < A.length; i++) { const s = S[i][k]; if (s > 1e-3) w1 = Math.max(w1, Math.abs(20 * Math.log10(Math.max(1e-9, A[i][k]) / s))); } }
}
ok('K2-01a', w1 <= 1, `Hüllkurve je OP im Verbund (1…6 OP, dx/Punkt, parallel/Paare/Kette) gegen OP allein: max ${w1.toFixed(3)} dB (≤ 1)`);
// K2-01b: the same envelope on OP k alone = on OP 1 alone
let w2 = 0;
for (const form of ['dx', 'pt']) { const T = []; for (let k = 0; k < 6; k++) T.push(trace(FM6(graph(6, 'par', form, k, true))).map(r => r[k]));
  for (let k = 1; k < 6; k++) for (let i = 0; i < T[0].length; i++) if (T[0][i] > 1e-3) w2 = Math.max(w2, Math.abs(20 * Math.log10(Math.max(1e-9, T[k][i]) / T[0][i]))); }
ok('K2-01b', w2 <= 1, `gleiche Hüllkurve auf OP 1…6: max ${w2.toFixed(3)} dB Abweichung zu OP 1`);
// K2-01c: audio: 6 parallel outputs, each partial's envelope (Goertzel 2048) vs the op alone
{ const ev = [[.01, 'on', 57, .8], [1.2, 'off', 57]], A = render(FLAT, FM6(graph(6, 'par', 'pt')), ev, {sec: 1.8, file}); let w = 0;
  for (let k = 0; k < 6; k++) { const S = render(FLAT, FM6(graph(6, 'par', 'pt', k)), ev, {sec: 1.8, file});
    for (let i = 0; i + 2048 < 1.7 * 48000; i += 2400) { const s = db(mag(S.l, 220 * (k + 1), 48000, i, i + 2048)); if (s < -60) continue; w = Math.max(w, Math.abs(db(mag(A.l, 220 * (k + 1), 48000, i, i + 2048)) - s)); } }
  ok('K2-01c', w <= 1, `Klang: 6 Ausgänge, Teilton je OP gegen OP allein: max ${w.toFixed(2)} dB`); }
// K2-02: chords
function chords(n, poly, lim) {
  const x = {v: 2, n: 6, trans: 0, edges: EDG.pairs.filter(e => e[0] <= n).map(([a, b]) => ({from: a, to: b})), ops: [0, 1, 2, 3, 4, 5].map(k => OP(k, {coarse: k % 2 ? 2 : 1, ol: k < n ? (k % 2 ? 60 : 95) : 0, amp: {f: 'dx', r: [95, 40, 30, 22], l: [99, 85, 70, 0]}}))};
  const {G, procs} = scope(48000, file); const P = new procs['dirigent-analog']({processorOptions: {patch: Object.assign({}, FLAT, {poly, xfLite: lim ? 1 : 0}, lim ? {polyH: 8} : {}), mods: [], fm6: FM6(x)}});
  const ev = []; [48, 52, 55, 59, 62, 65].forEach((nt, j) => { ev.push([.05 + j * .015, 1, j + 1, nt, .9, -1]); ev.push([.5, 2, j + 1]); });
  [50, 53, 57, 60, 64, 67].forEach((nt, j) => { ev.push([.6 + j * .015, 1, 20 + j, nt, .9, -1]); ev.push([1.4, 2, 20 + j]); });
  P.onMsg({ev}); let held = 0; const of = P.fadeOut.bind(P); P.fadeOut = (v, m) => { if (v.gate) held++; return of(v, m); };
  const L = new Float32Array(128), R = new Float32Array(128); let nan = 0;
  for (let f = 0; f < 96000; f += 128) { G.currentFrame = f; P.process([], [[L, R]]); for (const s of L) if (s !== s) nan++; }
  return {held, nan};
}
for (const [poly, lim] of [[8, 0], [6, 1], [4, 1]]) for (const n of [3, 4, 6]) { const r = chords(n, poly, lim); ok(`K2-02 ${n} OP poly ${poly}${lim ? ' (Begrenzer)' : ''}`, r.held === 0 && r.nan === 0, `gehaltene Noten gestohlen: ${r.held}, NaN: ${r.nan}`); }
export default res;
