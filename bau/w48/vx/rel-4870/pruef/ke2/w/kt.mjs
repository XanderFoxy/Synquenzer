// KE2-Kern-Test: Testtöne der App-eigenen Engine 3 (renderH, bekannte Welle/Filter) -> Erkennung (run, wie im Worker) -> Welle + Eichung.
// Aufruf: node kt.mjs <index.html> <aus.json> [saat=20261118] [n=24] [teil=0/1] [modus=full|s1]
import fs from 'node:fs'; import {kern} from './kern.mjs';
const [file, outF, seedA, nA, partA, modeA] = process.argv.slice(2);
const SEED = +(seedA || 20261118), NK = +(nA || 24), [pi, pn] = (partA || '0/1').split('/').map(Number), MODE = modeA || 'full';
const tpl = JSON.parse(fs.readFileSync(new URL('./tpl.json', import.meta.url))), C = kern(file, tpl);
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const R = rng(SEED), U = (a, b) => a + (b - a) * R(), UI = (a, b) => Math.round(U(a, b)), pick = a => a[Math.floor(R() * a.length)];
const CAT = [['Bass', [33, 45]], ['Lead', [60, 72]], ['Fläche', [48, 60]], ['Zupf', [52, 64]], ['Bläser', [48, 60]], ['Orgel', [55, 67]]];
const gen = cat => {   // wie KE1-Test Abschnitt K
  const h = {o1w: 0, c1: 0, o2: 0, o2w: 0, semi: 0, o2lvl: 0, o2tune: 0, n: 0, cut: 64, res: 0, eg: 0, e1a: 0, e1d: 64, e1s: 0, e1r: 30, e2a: 0, e2d: 64, e2s: 127, e2r: 30, vib: 0, l2f: 64, tune: 0, sw: 0, ft: 0, hold: 1.0};
  const o1 = ws => { h.o1w = pick(ws); if (h.o1w === 1) h.c1 = R() < .4 ? 0 : UI(10, 100); };
  const osc2 = (pr, semis, tmax) => { if (R() < pr) { h.o2 = 1; h.o2w = UI(0, 2); h.semi = pick(semis); h.o2lvl = UI(50, 127); h.o2tune = UI(1, tmax); } };
  switch (cat) {
    case 'Bass': o1([0, 0, 1, 1, 2, 3]); osc2(.6, [0, 12, 12], 6); Object.assign(h, {cut: UI(15, 55), res: UI(0, 90), eg: UI(15, 50), e1a: UI(0, 8), e1d: UI(35, 75), e1s: UI(0, 50), e1r: UI(20, 60), e2a: UI(0, 6), e2d: UI(40, 80), e2s: UI(50, 120), e2r: UI(15, 45), n: R() < .15 ? UI(5, 30) : 0}); break;
    case 'Lead': o1([0, 0, 1, 1, 2]); osc2(.6, [0, 0, 12], 7); Object.assign(h, {cut: UI(55, 105), res: UI(10, 85), eg: UI(-5, 30), e1a: UI(0, 30), e1d: UI(40, 85), e1s: UI(30, 110), e1r: UI(30, 65), e2a: UI(0, 25), e2d: UI(50, 90), e2s: UI(90, 127), e2r: UI(30, 60)}); if (R() < .6) { h.vib = UI(3, 10); h.l2f = UI(78, 92); } h.n = R() < .2 ? UI(5, 25) : 0; break;
    case 'Fläche': o1([0, 0, 1, 2]); osc2(.85, [0, 0, 12], 9); Object.assign(h, {cut: UI(40, 90), res: UI(0, 60), eg: UI(-10, 30), e1a: UI(50, 90), e1d: UI(60, 95), e1s: UI(40, 110), e1r: UI(55, 85), e2a: UI(55, 85), e2d: UI(60, 95), e2s: UI(85, 127), e2r: UI(55, 85), n: R() < .3 ? UI(5, 35) : 0}); if (R() < .3) { h.vib = UI(2, 6); h.l2f = UI(70, 85); } break;
    case 'Zupf': o1([0, 1, 1, 2, 3]); osc2(.4, [0, 12], 5); Object.assign(h, {cut: UI(15, 60), res: UI(0, 80), eg: UI(25, 55), e1a: 0, e1d: UI(35, 70), e1s: UI(0, 25), e1r: UI(25, 60), e2a: 0, e2d: UI(50, 80), e2s: UI(0, 40), e2r: UI(30, 60)}); break;
    case 'Bläser': o1([0, 0, 1]); osc2(.7, [0, 0, 12], 6); Object.assign(h, {cut: UI(30, 60), res: UI(0, 40), eg: UI(25, 45), e1a: UI(35, 55), e1d: UI(50, 80), e1s: UI(40, 90), e1r: UI(30, 55), e2a: UI(15, 40), e2d: UI(50, 80), e2s: UI(90, 127), e2r: UI(25, 50)}); if (R() < .4) { h.vib = UI(2, 6); h.l2f = UI(78, 90); } h.n = R() < .3 ? UI(5, 20) : 0; break;
    case 'Orgel': o1([1, 2, 3, 1]); if (h.o1w === 1) h.c1 = R() < .5 ? 0 : UI(20, 90); osc2(.6, [12, 12, 0], 3); Object.assign(h, {cut: UI(70, 115), res: UI(0, 20), eg: 0, e1a: 0, e1d: 64, e1s: 0, e1r: 30, e2a: UI(0, 10), e2d: UI(40, 80), e2s: UI(110, 127), e2r: UI(15, 40)}); break;
  }
  if (R() < .25) h.ft = 1;
  return h;
};
const cases = []; for (let i = 0; i < NK; i++) { const [cat, notes] = CAT[i % CAT.length], h = gen(cat); h.note = notes[i % 2]; cases.push({id: i, cat, h, mic: R() < .4 ? 1000 + i : 0}); }
function micSim(x, R) {   // Raum (Kamm-/Allpass-Hall 0,4–0,9 s, nass 20–35 %), Rauschen −40 dB, Verstimmung ±5–20 ct
  const sr = 44100, rt = .4 + .5 * R(), wet = .2 + .15 * R(), y = new Float32Array(x.length + Math.round(rt * sr)); y.set(x);
  const combs = [1557, 1617, 1491, 1422].map(d => ({d, b: new Float32Array(d), i: 0, g: Math.pow(10, -3 * d / sr / rt)})), w = new Float32Array(y.length);
  for (let n = 0; n < y.length; n++) { let s = 0; for (const c of combs) { const o = c.b[c.i]; c.b[c.i] = y[n] + o * c.g; c.i = (c.i + 1) % c.d; s += o; } w[n] = s / 4; }
  for (let n = 0; n < y.length; n++) y[n] = y[n] * (1 - wet) + w[n] * wet * 3;
  const r = Math.pow(2, ((R() < .5 ? -1 : 1) * (5 + 15 * R())) / 1200), N = Math.floor((y.length - 2) / r), z = new Float32Array(N);
  for (let n = 0; n < N; n++) { const p = n * r, i = Math.floor(p), u = p - i; z[n] = y[i] * (1 - u) + y[i + 1] * u; }
  let e = 0; for (const v of z) e += v * v; const g = Math.sqrt(e / z.length) * .01 * Math.sqrt(3); for (let i = 0; i < z.length; i++) z[i] += g * (2 * R() - 1);
  return z;
}
const W = C.W, st = h => 12 * Math.log2(W.cutHz(h.cut) / 20) + W.egHt(h.eg) * h.e1s / 127, oc = (a, b) => Math.abs(Math.log2(Math.max(.003, a) / Math.max(.003, b)));
const rows = [];
for (const c of cases) {
  if (c.id % pn !== pi) continue;
  const pre = Math.round(.2 * 44100); let x = C.renderH(c.h, {sr: 44100, sec: c.h.hold + .6}); { const y = new Float32Array(x.length + pre); y.set(x, pre); x = y; }
  if (c.mic) x = micSim(x, rng(c.mic));
  let pk = 0; for (const v of x) pk = Math.max(pk, Math.abs(v)); const pcm = Int16Array.from(x, v => Math.round(v * .4 * 32767 / pk));
  const t = c.h, q = {id: c.id, cat: c.cat, mic: !!c.mic, t: {o1w: t.o1w, c1: t.c1, o2: t.o2, ft: t.ft}};
  if (MODE === 's1') {
    const s1 = C.analyse(C.to44(pcm, 44100).subarray(pre - 900)); q.s1w = s1.h.o1w; q.s1ok = s1.h.o1w === t.o1w; rows.push(q); console.log(c.id, c.cat, c.mic ? 'mikro' : 'sauber', 'w', t.o1w, '->', s1.h.o1w); continue;
  }
  const job = {stop: false}; const t0 = Date.now();
  const r = await C.run({pcm, sr: 44100, o: {budgetMs: 60000, maxEvals: 450}, tpl}, job);
  const m = r.eng.mk.p, E = r.eng.mk;
  Object.assign(q, {D: E.D, s1w: r.s1.h.o1w, mw: m.o1w, sw: m.sw, welle: !m.sw && m.o1w === t.o1w, s1ok: r.s1.h.o1w === t.o1w, o2: m.o2 === t.o2, ft: m.ft === t.ft, cutHold: Math.abs(st(m) - st(t)),
    att: oc(W.atk(m.e2a), W.atk(t.e2a)), sus: Math.abs(m.e2s - t.e2s), rel: oc(W.dec(m.e2r), W.dec(t.e2r)), noise: Math.abs((m.n || 0) - (t.n || 0)), vibOk: (m.vib > 0) === (t.vib > 0),
    cal: E.cal, fx: E.fx, ms: Date.now() - t0, evals: r.evals});
  q.ok = {src: q.welle && q.o2, flt: q.cutHold <= 3 && q.ft, amp: q.att <= 1 && q.sus <= 25 && q.rel <= 1, noi: q.noise <= 15, mov: q.vibOk};
  rows.push(q); console.log(c.id, c.cat, c.mic ? 'mikro' : 'sauber', 'w', t.o1w, 's1', q.s1w, 'end', q.mw, 'D', q.D, 'ms', q.ms, JSON.stringify(q.cal));
}
fs.writeFileSync(outF, JSON.stringify(rows)); process.exit(0);
