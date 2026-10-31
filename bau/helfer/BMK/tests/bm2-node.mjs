// BM2 acceptance part 1 (Nachtrag 7 Rev. 2, section 6: BM2-01 filter, -02 ADSR, -03 deltas, -04 LFO, -09 GLOBAL, -10 PORT/PANS/RATE,
// -11 operator smoothing, -14 INIT) in Node with the processor of bau/helfer/BMK/index.html. ONLY=regex. Writes bm2-node.out.json.
import fs from 'fs';
import {render, on, off} from './bm-node.mjs';
import {db, pdb, rms, mKlick} from '../../../tests/v3-mk1-ana.mjs';
import {lufs} from '../../../tests/n5-v-lufs.mjs';
const HERE = new URL('.', import.meta.url).pathname;
let fails = 0; const res = [];
const ok = (id, c, info) => { if (!c) fails++; const line = (c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : ''); res.push({id, ok: !!c, info}); console.log(line); };
const only = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
const T = (id, f) => { if (only && !only.test(id)) return; try { f(); } catch (e) { ok(id, false, 'Fehler ' + (e.stack || e)); } };
const R = (x, d = 1) => Math.round(x * 10 ** d) / 10 ** d;
const SR = 48000, TX = x => (x <= 0 ? 0 : .002 * Math.pow(7500, x / 15)), TD = s => 5 * Math.pow(2500, -(s - 1) / 39);
const prog = p => ({t: 'prog', ab: 'a', p});
const deep = (a, b) => { const o = JSON.parse(JSON.stringify(a)); for (const k in b || {}) o[k] = b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && o[k] && typeof o[k] === 'object' ? deep(o[k], b[k]) : b[k]; return o; };
const E0 = {l: 99, a: 0, d: 0, s: 15, r: 0, lp: 0};
const base = x => deep({o1: {m: 31, e: E0}, o2: {e: {l: 0}}, n: {e: {l: 0}}, f: {md: 'hp', cu: 0}}, x);
// tap rows [frame, slot, e0, e1, e2, e3, M1, M2, f1, fc, p1, gL, gR]
function tapRows(r) { const t = r.msgs.find(m => m.t === 'tap'); const b = t.buf, o = []; for (let i = 0; i + 13 <= b.length; i += 13) o.push(Array.from(b.subarray(i, i + 13))); return o; }
const withTap = (msgs, sec, o) => render([[0, {t: 'tap', on: true, k: 'ctl', all: !!(o && o.all)}]].concat(msgs, [[sec - .003, {t: 'tap', on: false}]]), Object.assign({sec}, o || {}));
// amplitude of the component at f (Hann, exact DFT)
function amp(x, i0, n, f) { let re = 0, im = 0, ws = 0; for (let i = 0; i < n; i++) { const w = .5 - .5 * Math.cos(2 * Math.PI * i / n), a = 2 * Math.PI * f * i / SR; re += x[i0 + i] * w * Math.cos(a); im += x[i0 + i] * w * Math.sin(a); ws += w; } return 2 * Math.hypot(re, im) / ws; }
const tone = (f, P, sec = .5) => render([[0, prog(P)], [0, {t: 'gl', p: {tn: f}}], [0, on(0, 69)]], {sec});
const lvAt = (f, P) => { const r = tone(f, P, .45); return amp(r.l, 9600, 8192, f); };
function zcf(x, i0, i1) { let a = -1, b = -1, n = 0; for (let i = i0 + 1; i < i1; i++) if (x[i - 1] < 0 && x[i] >= 0) { const t = i - 1 + (-x[i - 1]) / (x[i] - x[i - 1]); if (a < 0) a = t; else n++; b = t; } return n * SR / (b - a); }

T('BM2-01', () => {
  const F = (md, cu, re) => base({o1: {m: 31, e: {l: 40}}, f: {md, cu, re: re || 0}});
  const ref = f => lvAt(f, base({o1: {m: 31, e: {l: 40}}}));
  const gain = (md, cu, f) => db(lvAt(f, F(md, cu)) / ref(f));
  const fc50 = 20 * Math.pow(1000, 50 / 99);
  const lp = gain('lp', 50, 8 * fc50) - gain('lp', 50, 4 * fc50), hp = gain('hp', 50, fc50 / 4) - gain('hp', 50, fc50 / 8);
  const bpU = gain('bp', 50, 8 * fc50) - gain('bp', 50, 4 * fc50), bpL = gain('bp', 50, fc50 / 4) - gain('bp', 50, fc50 / 8);
  const nd = gain('notch', 50, fc50) - gain('notch', 50, fc50 / 10);
  ok('BM2-01 LP/HP 12 ± 1 dB/Okt, BP 6 ± 1 dB/Okt je Seite, NOTCH ≥ 30 dB (RESO 0, CUTF 50)', Math.abs(lp + 12) <= 1 && Math.abs(hp - 12) <= 1 && Math.abs(bpU + 6) <= 1 && Math.abs(bpL - 6) <= 1 && nd <= -30,
    'LP ' + R(lp, 2) + ', HP +' + R(hp, 2) + ', BP oben ' + R(bpU, 2) + ' / unten +' + R(bpL, 2) + ' dB/Okt, Kerbe ' + R(nd) + ' dB');
  const fcs = []; let w = 0;
  for (const cu of [20, 50, 80]) { const want = 20 * Math.pow(1000, cu / 99); let lo = want / 2, hi = want * 2;
    for (let i = 0; i < 18; i++) { const m = Math.sqrt(lo * hi); if (gain('lp', cu, m) > -3.0103) lo = m; else hi = m; }
    const got = Math.sqrt(lo * hi); fcs.push(cu + ': ' + R(got) + '/' + R(want)); w = Math.max(w, Math.abs(got / want - 1)); }
  ok('BM2-01 fc nach §1.3 ± 5 % (CUTF 20/50/80, −3-dB-Punkt LP)', w <= .05, fcs.join(' · ') + ' Hz, größte Abw. ' + R(w * 100, 2) + ' %');
  // RESO 99: a noise burst, then self-oscillation; frequency (zero crossings 0.6..1.6 s) and peak
  const r = render([[0, prog({o1: {m: 7, e: {l: 0}}, o2: {e: {l: 0}}, n: {fr: 99, e: {l: 30, a: 0, d: 3, s: 0, r: 0}}, f: {md: 'lp', cu: 50, re: 99}})], [0, on(0, 60, .8)]], {sec: 1.7});
  const fo = zcf(r.l, Math.round(.6 * SR), Math.round(1.6 * SR)); let pk = 0; for (let i = 0; i < r.l.length; i++) pk = Math.max(pk, Math.abs(r.l[i]), Math.abs(r.r[i]));
  const lvl = rms(r.l, Math.round(1.4 * SR), Math.round(1.6 * SR));
  ok('BM2-01 RESO 99 schwingt bei fc ± 3 %, Spitze ≤ −6 dBFS', Math.abs(fo / fc50 - 1) <= .03 && db(pk) <= -6 && lvl > 1e-3, R(fo) + ' Hz gegen ' + R(fc50) + ' Hz (' + R((fo / fc50 - 1) * 100, 2) + ' %), Spitze ' + R(db(pk), 2) + ' dBFS, Dauerpegel ' + R(db(lvl)) + ' dBFS');
  // TRK 100: fc / f0 over C2..C6 constant; OSC1 SEMI +12 -> fc x 2 (the coefficients of the control steps)
  const fcOf = (n, st) => { const rr = withTap([[0, prog(base({f: {md: 'lp', cu: 40, tk: 100}, o1: {st: st || 0}}))], [0, on(.001, n)]], .03); const rows = tapRows(rr); return rows[rows.length - 1]; };
  const ratios = [36, 48, 60, 72, 84].map(n => { const x = fcOf(n); return x[9] / x[8]; }), rmin = Math.min(...ratios), rmax = Math.max(...ratios);
  const s0 = fcOf(60, 0), s12 = fcOf(60, 12), oct = s12[9] / s0[9];
  ok('BM2-01 TRK 100 %: fc/f0 über C2–C6 ± 2 % konstant; OSC1-SEMI +12 → fc +1 Okt ± 2 %', rmax / rmin - 1 <= .02 && Math.abs(oct / 2 - 1) <= .02, 'fc/f0 ' + ratios.map(x => R(x, 3)).join(' / ') + ', SEMI +12: × ' + R(oct, 4));
  // stepwise: with a fast filter envelope the coefficient changes only on control steps (tap frames on the grid)
  const rr = withTap([[0, prog(base({o1: {m: 7}, f: {md: 'lp', cu: 20, e: {l: 60, a: 0, d: 6, s: 0, r: 0}}}))], [0, on(1001 / SR, 48)]], .1), rows = tapRows(rr);
  let offg = 0, ch = 0; for (let k = 1; k < rows.length; k++) { if (rows[k][0] % 48) offg++; if (rows[k][9] !== rows[k - 1][9]) ch++; }
  ok('BM2-01 Koeffizienten wechseln stufig je Steuerschritt', offg === 0 && ch > 20, ch + ' Wechsel, alle auf dem 1-ms-Raster');
});
T('BM2-02', () => {
  // attack linear, times by T(x) +- max(10 %, 1 ms); decay / release: -20 dB of their way after T/3 (exponential, -60 dB after T)
  const tol = T_ => Math.max(.1 * T_, .001);
  const rows = tapRows(withTap([[0, prog(base({o1: {e: {l: 99, a: 9, d: 9, s: 8, r: 9}}}))], [0, on(.01, 60)], [0, off(1.6, 60)]], 3.2));
  const t0 = rows[0][0] / SR, lv = rows.map(r => [r[0] / SR - t0, r[2]]);
  const ia = lv.findIndex(x => x[1] >= 1), tA = lv[ia][0];
  // linearity of the attack steps
  const pts = lv.slice(1, ia); const mx = pts.reduce((a, b) => a + b[0], 0) / pts.length, my = pts.reduce((a, b) => a + b[1], 0) / pts.length;
  let sxy = 0, sxx = 0, syy = 0; for (const [x, y] of pts) { sxy += (x - mx) * (y - my); sxx += (x - mx) ** 2; syy += (y - my) ** 2; } const r2 = sxy * sxy / (sxx * syy);
  const S = (8 / 15) ** 2, id = lv.findIndex((x, i) => i > ia && x[1] - S <= .1 * (1 - S)), tD = (lv[id][0] - tA) * 3;
  const iro = lv.findIndex(x => x[0] >= 1.6 - t0 - 1e-9), l0 = lv[iro - 1][1], ir = lv.findIndex((x, i) => i >= iro && x[1] <= .1 * l0), tR = (lv[ir][0] - lv[iro][0]) * 3;
  const T9 = TX(9);
  ok('BM2-02 ADSR-Zeiten nach T(x) ± max(10 %, 1 ms); Attack linear (R² ≥ 0,99)', Math.abs(tA - T9) <= tol(T9) && Math.abs(tD - T9) <= tol(T9) && Math.abs(tR - T9) <= tol(T9) && r2 >= .99,
    'T(9) = ' + R(T9 * 1000) + ' ms: A ' + R(tA * 1000) + ' · D ' + R(tD * 1000) + ' · R ' + R(tR * 1000) + ' ms; R² ' + R(r2, 5));
  // sustain and level law on the output (+- 0.2 dB)
  const lev = e => { const r = render([[0, prog(base({o1: {m: 7, e}, f: {md: 'lp', cu: 99}}))], [0, on(0, 60)]], {sec: .6}); return rms(r.l, 14400, 28800); };
  const ref = lev({l: 99, s: 15}), s13 = db(lev({l: 99, s: 13}) / ref), l70 = db(lev({l: 70, s: 15}) / ref);
  ok('BM2-02 Sustain-/L-Gesetz ± 0,2 dB (S 13 → −2,49 dB, L 70 → −6,01 dB)', Math.abs(s13 - 20 * Math.log10((13 / 15) ** 2)) <= .2 && Math.abs(l70 - 20 * Math.log10((70 / 99) ** 2)) <= .2, 'S 13: ' + R(s13, 3) + ' dB, L 70: ' + R(l70, 3) + ' dB');
  // LOOP: period T(A) + T(D) (S 0)
  const lr = tapRows(withTap([[0, prog(base({o1: {e: {l: 99, a: 6, d: 7, s: 0, r: 3, lp: 1}}}))], [0, on(.01, 60)]], 2.2)), tops = [];
  for (let k = 1; k < lr.length; k++) if (lr[k][2] >= 1 && lr[k - 1][2] < 1) tops.push(lr[k][0] / SR);
  const per = (tops[tops.length - 1] - tops[0]) / (tops.length - 1), want = TX(6) + TX(7);
  ok('BM2-02 LOOP-Periode ± max(10 %, 1 ms)', tops.length >= 5 && Math.abs(per - want) <= tol(want), R(per * 1000, 2) + ' ms gegen ' + R(want * 1000, 2) + ' ms (' + (tops.length - 1) + ' Perioden)');
});
T('BM2-03', () => {
  const rows = tapRows(withTap([[0, prog(base({pe: {ds: 32, dv: 15, de: -32}, o1: {e: {r: 12}}}))], [0, on(.01, 69)], [0, off(.8, 69)]], 1.6));
  const t0 = rows[0][0] / SR, d = rows.map(r => [r[0] / SR - t0, r[10] - 69]), start = d[0][1], want = 48 * (32 / 63) ** 2;
  const i1 = d.findIndex(x => x[1] <= .01 * start), t1 = d[i1][0], T15 = TD(15);
  const endV = d[d.length - 1][1], wantE = -want;
  ok('BM2-03 Tonhöhen-Δ START +32 SPD 15 → +12,38 HT ± 2 %, 1 % Rest nach 0,30 s ± 10 %; END beim Loslassen', Math.abs(start / want - 1) <= .02 && Math.abs(t1 / T15 - 1) <= .1 && Math.abs(endV / wantE - 1) <= .02,
    'Start ' + R(start, 3) + ' HT, 1 % nach ' + R(t1 * 1000) + ' ms (Soll ' + R(T15 * 1000) + '), nach dem Loslassen ' + R(endV, 3) + ' HT (END −32 = ' + R(wantE, 3) + ')');
  const mr = tapRows(withTap([[0, prog(base({o1: {m: 100, ds: 24, dv: 20}}))], [0, on(.01, 69)]], .3)), m0 = mr[0][0] / SR, ms = mr.map(r => [r[0] / SR - m0, r[6]]);
  const ints = ms.every(x => Number.isInteger(x[1])), mono = ms.every((x, i) => i === 0 || x[1] <= ms[i - 1][1]), iz = ms.findIndex(x => x[1] === 100), tz = ms[iz][0], T20 = TD(20);
  ok('BM2-03 Masken-Δ START +24 SPD 20 → ganzzahlige Folge, Ziel nach 0,11 s ± 10 %', ints && mono && ms[0][1] === 124 && Math.abs(tz / T20 - 1) <= .1,
    'Folge ' + [...new Set(ms.map(x => x[1]))].join(' ') + '; Ziel nach ' + R(tz * 1000, 1) + ' ms (T = ' + R(T20 * 1000, 1) + ' ms)');
});
T('BM2-04', () => {
  // LFO1 -> freq (slot 1, AMT 99 = +-24 semitones): the LFO value = (pitch - 69) / 24 per control step
  const lfo = (w, sp, extra, msgs, sec) => { const rows = tapRows(withTap([[0, prog(base(deep({l1: {sp, w, t: [['freq', 99], ['flt', 0], ['mask', 0], ['vol', 0]]}}, extra)))], [0, on(0, 69)]].concat(msgs || []), sec || 1.2)); return rows.map(r => [r[0] / SR, (r[10] - 69) / 24]); };
  const sp = Math.round(99 * Math.log(2 / .05) / Math.log(8000)), f = .05 * Math.pow(8000, sp / 99);
  const ideal = {sin: p => Math.sin(2 * Math.PI * p), sqr: p => (p < .5 ? 1 : -1), up: p => 2 * p - 1, down: p => 1 - 2 * p,
    saws: p => { const s = p * 32, q = Math.floor(s), m = q & 23; return Math.sin(2 * Math.PI * (m + s - q) / 32); }, step: p => -1 + 2 * Math.floor(p * 8) / 7, hsin: p => 2 * Math.sin(Math.PI * p) - 1};
  const cors = []; let worst = 1;
  for (const w of Object.keys(ideal)) { const tr = lfo(w, sp).slice(1); let ph = 0, a = [], b = []; for (const [t, v] of tr) { const p = ((t + 1e-9) * f) % 1; a.push(v); b.push(ideal[w](Math.max(0, p - f / 1000 * 0))); }
    const ma = a.reduce((x, y) => x + y) / a.length, mb = b.reduce((x, y) => x + y) / b.length; let sab = 0, saa = 0, sbb = 0; for (let i = 0; i < a.length; i++) { sab += (a[i] - ma) * (b[i] - mb); saa += (a[i] - ma) ** 2; sbb += (b[i] - mb) ** 2; }
    const c = sab / Math.sqrt(saa * sbb); cors.push(w + ' ' + R(c, 4)); worst = Math.min(worst, c); }
  const rr = lfo('rand', sp, null, null, 2.2).slice(1), per = 1 / f; let constIn = true, vals = new Set();
  for (let i = 1; i < rr.length; i++) { const k0 = Math.floor(rr[i - 1][0] * f + 1e-9), k1 = Math.floor(rr[i][0] * f + 1e-9); if (k0 === k1 && rr[i][1] !== rr[i - 1][1]) constIn = false; vals.add(R(rr[i][1], 6)); }
  ok('BM2-04 LFO 8 Formen (Korrelation ≥ 0,99 zur Form an den Schritten; RAND je Periode ein neuer Wert)', worst >= .99 && constIn && vals.size >= 3, cors.join(', ') + '; rand: ' + vals.size + ' Werte, je Periode konstant: ' + constIn);
  // tempo +- 1 % (SPD 50)
  const t50 = lfo('sin', 50, null, null, 2.2).slice(1), f50 = .05 * Math.pow(8000, 50 / 99); const zc = []; for (let i = 1; i < t50.length; i++) if (t50[i - 1][1] < 0 && t50[i][1] >= 0) zc.push(t50[i - 1][0] + (t50[i][0] - t50[i - 1][0]) * (-t50[i - 1][1]) / (t50[i][1] - t50[i - 1][1]));
  const fm = (zc.length - 1) / (zc[zc.length - 1] - zc[0]);
  ok('BM2-04 LFO-Tempo ± 1 % (SPD 50 → 4,7 Hz)', Math.abs(fm / f50 - 1) <= .01, R(fm, 4) + ' Hz gegen ' + R(f50, 4) + ' Hz');
  // sample-equal for all voices, free running, phase 0 at transport start
  const all = tapRows(withTap([[0, prog(base({l1: {sp: 45, w: 'up', t: [['freq', 99], ['flt', 0], ['mask', 0], ['vol', 0]]}}))], [0, on(.0101, 60, .8, 1)], [0, on(.2337, 67, .8, 2)]], .5, {all: true}));
  const byF = {}; for (const r of all) (byF[r[0]] = byF[r[0]] || {})[r[1]] = (r[10] - (r[1] === all[0][1] ? 60 : 67)) / 24;
  let same = 0, diff = 0; for (const fr in byF) { const o = byF[fr], ks = Object.keys(o); if (ks.length === 2) { if (Math.abs(o[ks[0]] - o[ks[1]]) < 1e-5) same++; else diff++; } }

  const tr2 = lfo('up', 45, null, [[.5, {t: 'tr', run: true, at: .5003}]], .8), j = tr2.findIndex(x => Math.round(x[0] * SR) >= Math.round(.5003 * SR));
  const freeRun = Math.abs(tr2[1][1] - tr2[0][1]) > 0;
  ok('BM2-04 sample-gleich für alle Stimmen, frei laufend, Phase 0 bei ▶', diff === 0 && same > 100 && Math.abs(tr2[j][1] + 1) < 1e-6 && freeRun,
    same + ' gemeinsame Schritte, ' + diff + ' verschieden (Abgriff in float32: Toleranz 1e-5); nach ▶ (0,5003 s) Wert ' + R(tr2[j][1], 6) + ' (Phase 0 der Säge = −1)');
  // DLAY 9 (0.424 s): silent until 3/4 T, full at T; MW on LFO1 AMT lifts it; DCAY 9: -60 dB after T
  const T9 = TX(9), dl = lfo('sqr', 60, {l1: {dl: 9}}, null, .8), at = t => { const x = dl.find(r => r[0] >= t); return Math.abs(x[1]); };
  const dlOk = at(.6 * T9) === 0 && at(.74 * T9) === 0 && at(.9 * T9) > 0 && at(.9 * T9) < 1 && Math.abs(at(1.05 * T9) - 1) < 1e-9;
  const lift = lfo('sqr', 60, {l1: {dl: 12}, mo: {mw: [['l1a', 10], ['flt', 0], ['mask', 0], ['vol', 0]]}}, [[.1, {t: 'ctl', mw: .5}]], .4), lifted = Math.abs(lift.find(r => r[0] >= .2)[1]) > .5;
  const dc = lfo('sqr', 60, {l1: {dc: 9}}, null, .8), g1 = Math.abs(dc.find(r => r[0] >= T9)[1]);
  ok('BM2-04 DLAY (Einsatz nach T, Einblendung im letzten Viertel), MW auf LFO-Menge hebt sie auf, DCAY −60 dB nach T', dlOk && lifted && Math.abs(db(g1) + 60) <= 1,
    'DLAY 9: ' + [.6, .74, .9, 1.05].map(x => R(at(x * T9), 3)).join(' / ') + ' bei 0,6/0,74/0,9/1,05 T; aufgehoben ' + lifted + '; DCAY bei T ' + R(db(g1), 2) + ' dB');
});
T('BM2-09', () => {
  const TEMP = {et: [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100], arab: [0, 100, 200, 300, 350, 500, 650, 700, 850, 900, 1000, 1050],
    jmaj: [0, 111.73, 203.91, 315.64, 386.31, 498.04, 590.22, 701.96, 813.69, 884.36, 996.09, 1088.27], jmin: [0, 111.73, 203.91, 315.64, 386.31, 498.04, 609.78, 701.96, 813.69, 884.36, 1017.60, 1088.27],
    mean: [0, 76.05, 193.16, 310.26, 386.31, 503.42, 579.47, 696.58, 772.63, 889.74, 1006.84, 1082.89], pyta: [0, 90.22, 203.91, 294.13, 407.82, 498.04, 611.73, 701.96, 792.18, 905.87, 996.09, 1109.78]};
  let w = 0; const fC = 440 * Math.pow(2, -9 / 12);
  for (const tm in TEMP) for (let k = 0; k < 12; k++) {
    const rows = tapRows(withTap([[0, prog(base())], [0, {t: 'gl', p: {tm}}], [0, on(.001, 60 + k)]], .01)), f = rows[0][8];
    w = Math.max(w, Math.abs(1200 * Math.log2(f / fC) - TEMP[tm][k])); }
  // audio check: JMAJ E4 by zero crossings
  const ra = render([[0, prog(base())], [0, {t: 'gl', p: {tm: 'jmaj'}}], [0, on(0, 64)]], {sec: 1.2}), fa = zcf(ra.l, 9600, 57600), ea = 1200 * Math.log2(fa / fC) - 386.31;
  ok('BM2-09 TEMP-Tabellen ± 0,5 ct (6 Stimmungen × 12 Stufen)', w <= .5 && Math.abs(ea) <= .5, 'größte Abw. ' + R(w, 4) + ' ct; JMAJ E4 im Ausgang ' + R(ea, 3) + ' ct');
  const rs = tapRows(withTap([[0, prog(base())], [0, {t: 'gl', p: {tm: 'jmaj', st: 2}}], [0, on(.001, 64)]], .01))[0][8], cs = 1200 * Math.log2(rs / fC);
  ok('BM2-09 Global-SEMI +2: Stimmung bezogen auf die gespielte Taste (JMAJ, Taste E4 → 386,31 + 200 ct)', Math.abs(cs - 586.31) <= .5, R(cs, 3) + ' ct über C4');
  const rt = render([[0, prog(base())], [0, {t: 'gl', p: {tn: 415}}], [0, on(0, 69)]], {sec: 1.2}), ft = zcf(rt.l, 9600, 57600);
  ok('BM2-09 TUNE 415 Hz → A4 = 415 ± 0,1 Hz', Math.abs(ft - 415) <= .1, R(ft, 4) + ' Hz');
  // VEL CURVE: level ratio v 0.5 / v 1.0 = (0.4 + 0.6 * 0.5^g) / 1 (1 %); MAX = 1
  const lv = (vc, v) => { const r = render([[0, prog(base({o1: {m: 7}}))], [0, {t: 'gl', p: {vc}}], [0, on(0, 60, v)]], {sec: .4}); return rms(r.l, 9600, 19200); };
  let wv = 0; const vs = [];
  for (const [vc, g] of [[1, 2.2], [2, 1.8], [3, 1.4], [4, 1], [5, .7], [6, 0]]) { const got = lv(vc, .5) / lv(vc, 1), want = vc === 6 ? 1 : .4 + .6 * Math.pow(.5, g); wv = Math.max(wv, Math.abs(got / want - 1)); vs.push(vc + ':' + R(got, 4)); }
  // AT CURVE: pressure 0.5 -> AT -> freq (amount 99 = 24 semitones x a')
  const ap = ac => { const rows = tapRows(withTap([[0, prog(base({mo: {at: [['freq', 99], ['l1a', 0], ['mask', 0], ['vol', 0]]}}))], [0, {t: 'gl', p: {ac}}], [0, on(.001, 69)], [.01, {t: 'ctl', pr: .5}]], .06)); return (rows[rows.length - 1][10] - 69) / 24; };
  let wa = 0; const as = [];
  for (const [ac, want] of [[1, Math.pow(.5, 2)], [2, Math.pow(.5, 1.6)], [3, Math.pow(.5, 1.3)], [4, .5], [5, Math.pow(.5, .8)], [6, 1], ['none', 0]]) { const got = ap(ac); wa = Math.max(wa, Math.abs(got - want) / Math.max(want, 1e-9) * (want ? 1 : 0) + (want ? 0 : Math.abs(got))); as.push(ac + ':' + R(got, 4)); }
  ok('BM2-09 VEL CURVE / AT CURVE nach Formel ± 1 %', wv <= .01 && wa <= .01, 'VEL v0,5/v1: ' + vs.join(' ') + '; AT bei 0,5: ' + as.join(' '));
  const pb = r => { const rows = tapRows(withTap([[0, prog(base())], [0, {t: 'gl', p: {pb: r}}], [0, on(.001, 69)], [.01, {t: 'ctl', bend: 1}]], .06)); return (rows[rows.length - 1][10] - 69) * 100; };
  const b2 = pb(2), b12 = pb(12);
  ok('BM2-09 PITCH BEND 2 / 12 HT ± 1 ct', Math.abs(b2 - 200) <= 1 && Math.abs(b12 - 1200) <= 1, R(b2, 3) + ' / ' + R(b12, 3) + ' ct');
});
T('BM2-10', () => {
  // PORT 7 = 134 ms (1 % rest): MONO, legato 60 -> 72
  const want = .008 * Math.pow(1.6, 6);
  const rows = tapRows(withTap([[0, prog(base({g: {mo: 'mono', po: 7}}))], [0, on(.01, 60, .8, 1)], [0, on(.3, 72, .8, 2)]], .7)), t2 = rows.findIndex(r => r[0] >= Math.round(.3 * SR));
  const i1 = rows.findIndex((r, i) => i >= t2 && Math.abs(r[10] - 72) <= .12), tg = (rows[i1][0] - rows[t2][0]) / SR;
  // POLY: the voice glides from its own last pitch (one voice, two notes one after the other)
  const pr = tapRows(withTap([[0, prog(base({g: {mo: 'poly', po: 7}}))], [0, on(.01, 60, .8, 1)], [0, off(.1, 0, 1)], [0, on(.5, 67, .8, 2)]], .9)), j = pr.findIndex(r => r[0] >= Math.round(.5 * SR));
  ok('BM2-10 PORT 7 → 134 ms ± 10 %; in POLY gleitet die Stimme von ihrer letzten Tonhöhe', Math.abs(tg / want - 1) <= .1 && Math.abs(pr[j][10] - 60) < .2,
    'MONO legato: 1 % Rest nach ' + R(tg * 1000, 1) + ' ms (Soll ' + R(want * 1000, 1) + '); POLY: neue Note 67 beginnt bei ' + R(pr[j][10], 3));
  // PANS 15: notes alternate L / R (>= 30 dB)
  const msgs = [[0, prog(base({o1: {m: 7}, g: {ps: 15}, f: {md: 'lp', cu: 99}}))]]; for (let k = 0; k < 4; k++) msgs.push([0, on(.05 + k * .25, 60, .8, k + 1)], [0, off(.2 + k * .25, 0, k + 1)]);
  const rp = render(msgs, {sec: 1.1}); const dd = []; for (let k = 0; k < 4; k++) { const a = Math.round((.08 + k * .25) * SR), b = a + 4800; dd.push(db(rms(rp.l, a, b) / rms(rp.r, a, b))); }
  ok('BM2-10 PANS 15 → abwechselnd L/R (≥ 30 dB Kanalunterschied)', dd.every((x, k) => Math.abs(x) >= 30 && Math.sign(x) === -Math.sign(dd[k ? k - 1 : 1])), dd.map(x => R(x)).join(' / ') + ' dB (L−R)');
  // RATE 15: times x 0.5 per octave (decay time C5 / C4)
  const dt = n => { const rr = tapRows(withTap([[0, prog(base({o1: {e: {l: 99, a: 0, d: 10, s: 0, r: 0}}, g: {ra: 15}}))], [0, on(.001, n)]], 1.2)); const i = rr.findIndex((r, k) => k > 1 && r[2] <= .1); return (rr[i][0] - rr[0][0]) / SR; };
  const q = dt(72) / dt(60);
  ok('BM2-10 RATE 15 → Zeiten je Oktave × 0,5 ± 5 %', Math.abs(q / .5 - 1) <= .05, '× ' + R(q, 4));
});
T('BM2-11', () => {
  // each continuous parameter in 1 s over its range on a sounding chord, 60 sets / s: M-KLICK <= 6 dB
  const P = base({o1: {m: 7, e: {l: 80}}, o2: {m: 24, e: {l: 60}}, n: {fr: 70, e: {l: 20}}, f: {md: 'lp', cu: 60, re: 30}});
  const paths = [['o1.e.l', 20, 99], ['o2.e.l', 0, 99], ['n.e.l', 0, 60], ['n.fr', 20, 99], ['o1.st', -12, 12], ['o1.tu', -50, 50], ['o2.st', -12, 12], ['o2.tu', -50, 50],
    ['f.cu', 20, 90], ['f.re', 0, 90], ['f.tk', 0, 100], ['f.e.l', 0, 60], ['o1.e.s', 15, 3], ['g.vo', 99, 40], ['g.st', -5, 5], ['l1.sp', 10, 90]];
  const out = []; let worst = -99, wp = '';
  for (const [k, a, b] of paths) {
    const msgs = [[0, prog(deep(P, {}))], [0, on(.02, 48, .8, 1)], [0, on(.02, 55, .8, 2)], [0, on(.02, 64, .8, 3)], [0, {t: 'set', ab: 'a', k, v: a}]];
    for (let i = 0; i <= 60; i++) msgs.push([.3 + i / 60, {t: 'set', ab: 'a', k, v: a + (b - a) * i / 60}]);
    const r = render(msgs, {sec: 1.6}), kl = mKlick(r.l.subarray(Math.round(.25 * SR), Math.round(1.45 * SR)), SR);
    out.push(k + ' ' + R(kl.worst)); if (kl.worst > worst) { worst = kl.worst; wp = k; }
  }
  ok('BM2-11 Bedien-Glätten: jede stetige Fahrt in 1 s auf klingendem Akkord M-KLICK ≤ 6 dB', worst <= 6, 'schlimmster ' + R(worst, 2) + ' dB (' + wp + '); ' + out.join(', '));
});
T('BM2-14', () => {
  // INIT (section 5.1): C4, velocity 0.8, 4 s held: -18 +- 1 LUFS; no route; A4 = 440 +- 0.1 ct
  const r = render([[0, prog({})], [0, on(0, 60, .8)]], {sec: 4}), L = lufs(r.l, r.r, SR);
  const ra = render([[0, prog({})], [0, on(0, 69, .8)]], {sec: 1.2}), fa = zcf(ra.l, 9600, 57600), ct = 1200 * Math.log2(fa / 440);
  ok('BM2-14 INIT −18 ± 1 LUFS, 0 ± 0,1 ct', Math.abs(L + 18) <= 1 && Math.abs(ct) <= .1, R(L, 2) + ' LUFS (C4, Anschlag 0,8), A4 ' + R(ct, 4) + ' ct');
});
console.log('\n' + (fails ? fails + ' FEHLER' : 'alles bestanden') + ' (' + res.length + ' Prüfungen)');
fs.writeFileSync(HERE + 'bm2-node.out.json', JSON.stringify(res, null, 1));
process.exit(fails ? 1 : 0);
