// MK6 DSP acceptance in Node (Nachtrag 3 MK6-01 ... MK6-08, MK6-09 (worklet part), MK6-10, MK6-14): the worklet of index.html
// (MK_FILE) with the stub scope of v3-mk1-node.mjs. Tap 'gain' = the per-sample amp gain (level x envelope x pan), no signal.
// Usage: MK_FILE=<index.html> MK_PREV=<predecessor.html> node v3-mk6-seq.mjs   (ONLY=<regex> picks tests)
import {renderW, render, mkPatch, mktab} from './v3-mk2-node.mjs';
import {db, rms, zcFreq, mKlick, spectrum, mEinbruch} from './v3-mk1-ana.mjs';
const SR = 48000, FILE = process.env.MK_FILE, PREV = process.env.MK_PREV;
let fails = 0; const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
const only = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
const T = (id, f) => { if (only && !only.test(id)) return; try { f(); } catch (e) { ok(id, false, 'Fehler ' + (e.stack || e)); } };
const M = (x, d) => Math.round(x * 10 ** (d == null ? 1 : d)) / 10 ** (d == null ? 1 : d);
const W = render(mkPatch({}), [], {sec: .01, file: FILE}).MKW;
const Z = () => new Array(16).fill(0);
const Q = (k, m, v) => ({k, m: m == null ? 1 : m, v: v ? v.concat(Z()).slice(0, 16) : Z()});
// a timbre with a sequence block: seq {on, last, type, run, ks, res, q: [3]}
const SP = (t, sq) => { const p = mkPatch(t || {}); const q = (sq.q || []).concat([Q(0), Q(0), Q(0)]).slice(0, 3); p.t[0].seq = Object.assign({on: 1, last: 16, type: 0, run: 1, ks: 1, res: 3}, sq, {q}); return p; };
const R = (p, ev, o) => render(p, ev, Object.assign({file: FILE}, o || {}));
const alt = (a, b) => Array.from({length: 16}, (_, i) => (i & 1 ? b : a));
const GATE = {a: {gate: 1, lvl: 64}};
// the starts of the gain changes (first sample whose value differs from the one before, after a flat stretch of >= 64 samples)
function edges(g, i0) { const out = []; let flat = 0; for (let i = (i0 || 1); i < g.length; i++) { if (Math.abs(g[i] - g[i - 1]) > 1e-9) { if (flat >= 64) out.push(i); flat = 0; } else flat++; } return out; }
// the length of a change from its start (samples until the value is flat for 32 samples)
function rampLen(g, i) { let j = i; while (j < g.length - 32) { let f = true; for (let k = 1; k <= 32; k++) if (Math.abs(g[j + k] - g[j + k - 1]) > 1e-9) { f = false; break; } if (f) return j - i + 1; j++; } return -1; }
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
const scopes = r => r.msgs.filter(m => m.mkScope).map(m => m.mkScope);
const SC = [0, {mkScope: true}];

// ---------------- MK6-01 Zeit ----------------
T('MK6-01', () => {
  const p = SP(GATE, {res: 3, q: [Q(15, 1, alt(63, -63))]}), g = R(p, [[0, 'on', 69, .8]], {sec: 2.1, tap: 'gain'}).l;
  const e = edges(g, 200).slice(0, 12), dev = e.map((x, k) => x - (k + 1) * 6000), rl = e.map(x => rampLen(g, x));
  ok('MK6-01 Raster 1/16 @120', e.length >= 12 && dev.every(d => d <= 0 && d >= -16), 'Rampenbeginn gegen 125-ms-Raster: ' + dev.join(', ') + ' Samples (Steuerblock 16)');
  ok('MK6-01 Rampe 1 ms', rl.every(n => n >= 46 && n <= 49), 'Rampenlängen ' + [...new Set(rl)].join('/') + ' Samples (1 ms = 48)');
  // all 16 resolutions (W-10): the step = value x 4 beats
  const bad = [];
  for (let r = 0; r < 16; r++) {
    const st = W.SRES[r] * 4 * .5 * SR, sec = Math.min(12, 3.6 * st / SR + .2), gg = R(SP(GATE, {res: r, q: [Q(15, 1, alt(63, -63))]}), [[0, 'on', 69, .8]], {sec, tap: 'gain'}).l;
    const ee = edges(gg, 200).slice(0, 3); const d = ee.map((x, k) => x - Math.round((k + 1) * st));
    if (ee.length < 3 || !d.every(x => x <= 0 && x >= -16)) bad.push(W.SRES_T[r] + ':' + d.join('/'));
  }
  ok('MK6-01 alle 16 Auflösungen', !bad.length, bad.length ? bad.join(' ') : '1/48 … 1/1 je 3 Schritte im Raster ±1 Block (1/48 = 41,7 ms … 1/1 = 2 s)');
  // M-KLICK: an amp level step +-63 on a held saw (C5) and on noise
  const ks = [];
  for (const t of [{mix: {o1: 127, o2: 0, n: 0}}, {mix: {o1: 0, o2: 0, n: 127}}]) {
    const y = R(SP(Object.assign({}, GATE, t), {res: 3, q: [Q(15, 1, alt(63, -63))]}), [[0, 'on', 72, .8]], {sec: 2.1}).l;
    ks.push(mKlick(y, SR, [0]).worst);
  }
  ok('MK6-01 M-KLICK Stufe ±63', ks.every(k => k <= 6), 'Säge C5 ' + M(ks[0]) + ' dB, Rauschen ' + M(ks[1]) + ' dB (≤ 6)');
});

// ---------------- MK6-02 Glatt ----------------
T('MK6-02', () => {
  const v = alt(63, -63), p = SP(GATE, {res: 3, q: [Q(15, 0, v)]}), g = R(p, [[0, 'on', 69, .8]], {sec: 1.1, tap: 'gain'}).l;
  const g127 = R(mkPatch({a: {gate: 1, lvl: 127}}), [[0, 'on', 69, .8]], {sec: .2, tap: 'gain'}).l[4000];
  let worst = 0; const pts = [];
  for (let k = 0; k < 7; k++) { // the middle of step k (a block end), value = 127 sqrt(g / g127) - 64
    const i = Math.round((k * 6000 + 3000) / 16) * 16 - 1, t = (i + 1) / SR, u = (t - k * .125) / .125, exp = v[k] + (v[k + 1] - v[k]) * u;
    const val = 127 * Math.sqrt(g[i] / g127) - 64; worst = Math.max(worst, Math.abs(val - exp)); pts.push(M(val, 2) + '/' + M(exp, 2)); }
  ok('MK6-02 linear', worst <= .01 * 126, 'Schrittmitte gemessen/erwartet: ' + pts.join(' · ') + ' · größte Abweichung ' + M(worst, 3) + ' Einheiten = ' + M(worst / 126 * 100, 2) + ' % des Hubs (≤ 1 %)');
  // smooth = no ramp edges: the gain changes in every block
  let still = 0; for (let i = 200; i < 40000; i += 16) if (Math.abs(g[i + 16] - g[i]) < 1e-9) still++;
  ok('MK6-02 stetig', still <= 2, still + ' Blöcke ohne Bewegung zwischen 4 ms und 0,8 s');
});

// ---------------- MK6-03 Typen ----------------
const ORD = (ty, L) => { const o = []; for (let s = 1; s <= L; s++) o.push(ty === 1 ? L + 1 - s : s); if (ty === 2) for (let s = L - 1; s >= 2; s--) o.push(s); if (ty === 3) for (let s = L; s >= 1; s--) o.push(s); return o; };
function stepSeq(sq, sec) { const r = R(SP({}, sq), [[0, 'on', 60, .8]], {sec, at: [SC]}); const out = []; for (const m of scopes(r)) if (m.voices[0]) out.push(...m.voices[0].seqStep); return out; }
T('MK6-03', () => {
  const N = ['Vorwärts', 'Rückwärts', 'Wechsel 1', 'Wechsel 2'], res = [];
  for (let ty = 0; ty < 4; ty++) { const exp = ORD(ty, 16), got = stepSeq({type: ty, res: 0, q: [Q(11, 1, [5])]}, (2 * exp.length + 2) * 2000 / SR); const e2 = exp.concat(exp);
    const eq = JSON.stringify(got.slice(0, e2.length)) === JSON.stringify(e2); res.push(eq); ok('MK6-03 ' + N[ty], eq, (eq ? 'deep-equal: ' : 'gelesen ' + got.slice(0, e2.length).join(',') + ' · erwartet: ') + exp.join(',')); }
  const g5 = stepSeq({type: 0, last: 5, res: 0, q: [Q(11, 1, [5])]}, 22 * 2000 / SR);
  ok('MK6-03 LETZTER SCHRITT 5', JSON.stringify(g5.slice(0, 20)) === JSON.stringify([1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5]), 'Länge 5: ' + g5.slice(0, 12).join(','));
  const ga = stepSeq({type: 2, last: 5, res: 0, q: [Q(11, 1, [5])]}, 18 * 2000 / SR), gb = stepSeq({type: 3, last: 5, res: 0, q: [Q(11, 1, [5])]}, 22 * 2000 / SR);
  ok('MK6-03 Wechsel bei 5', ga.slice(0, 8).join(',') === '1,2,3,4,5,4,3,2' && gb.slice(0, 10).join(',') === '1,2,3,4,5,5,4,3,2,1', 'Wechsel 1: ' + ga.slice(0, 8).join(',') + ' · Wechsel 2: ' + gb.slice(0, 10).join(','));
});

// ---------------- MK6-04 Lauf ----------------
T('MK6-04', () => {
  const v = [63, -63, 30, -20, 10, 0, 0, 0], p1 = SP(GATE, {last: 5, run: 0, res: 3, q: [Q(15, 1, v)]}), g1 = R(p1, [[0, 'on', 69, .8]], {sec: 2.5, tap: 'gain'}).l;
  const end = 5 * 6000; let mv = 0; for (let i = end + 100; i < g1.length; i++) mv = Math.max(mv, Math.abs(g1[i] - g1[end + 100]));
  const ref = R(SP(GATE, {last: 5, run: 0, res: 3, q: [Q(15, 1, [10, 10, 10, 10, 10])]}), [[0, 'on', 69, .8]], {sec: .3, tap: 'gain'}).l[8000];
  ok('MK6-04 Einmal hält', mv === 0 && Math.abs(g1[end + 100] - ref) < 1e-7, 'nach dem 5. Schritt (Wert +10) bis 2,5 s: Abweichung ' + mv + ', Pegel = Schritt 5 (' + M(db(g1[end + 100]), 2) + ' dB)');
  const p2 = SP(GATE, {last: 5, run: 1, res: 3, q: [Q(15, 1, v)]}), g2 = R(p2, [[0, 'on', 69, .8]], {sec: 2.5, tap: 'gain'}).l;
  let d = 0; for (let i = 3000; i < 30000; i++) d = Math.max(d, Math.abs(g2[i] - g2[i + 30000]), Math.abs(g2[i] - g2[i + 60000]));
  ok('MK6-04 Schleife', d < 1e-9, 'Zyklus 0,625 s wiederholt sich (Zyklus 2 und 3 gegen 1: max |Δ| ' + d.toExponential(1) + ')');
});

// ---------------- MK6-05 Key Sync ----------------
T('MK6-05', () => {
  // Timbre: reset at the first note after all keys up; a second note in the same phase
  const p = SP(Object.assign({e2: {a: 0, d: 64, s: 127, r: 0}}, GATE), {ks: 1, res: 3, q: [Q(15, 1, alt(63, -63))]});
  const g = R(p, [[0, 'on', 69, .8], [.31, 'on', 72, .8], [.5, 'off', 69], [.5, 'off', 72], [.8, 'on', 69, .8]], {sec: 1.3, tap: 'gain'}).l;
  const e = edges(g, 200), afterSecond = e.filter(x => x > .31 * SR && x < .5 * SR), after3 = e.filter(x => x > .8 * SR + 100).slice(0, 3);
  const a2 = afterSecond.every(x => Math.abs(((x + 16) % 6000)) <= 16), a3 = after3.map(x => x - .8 * SR);
  ok('MK6-05 Timbre', a2 && a3.length === 3 && a3.every((x, k) => x - (k + 1) * 6000 <= 0 && x - (k + 1) * 6000 >= -16), 'Note 2 (0,31 s) bleibt im Raster der ersten: ' + afterSecond.map(x => x % 6000).join('/') + ' · neue Note nach „alle los“ (0,8 s): Stufen bei ' + a3.join(', ') + ' Samples danach');
  // Stimme: two notes 0.3 s apart are on different steps
  const pv = SP({}, {ks: 2, res: 3, q: [Q(11, 1, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16])]});
  const r = R(pv, [[0, 'on', 60, .8], [.3, 'on', 67, .8]], {sec: .62, at: [SC]}), S = {};
  for (const m of scopes(r)) for (const v of m.voices) { (S[v.t] = S[v.t] || []).push(...v.seqStep); }
  const ks_ = Object.keys(S).sort((a, b) => a - b), A = S[ks_[0]], B = S[ks_[1]];
  ok('MK6-05 Stimme', A && B && A[A.length - 1] !== B[B.length - 1] && A[A.length - 1] === 5 && B[B.length - 1] === 3, 'bei 0,62 s: Note 1 Schritt ' + (A && A[A.length - 1]) + ' (erwartet 5), Note 2 Schritt ' + (B && B[B.length - 1]) + ' (erwartet 3)');
  // Aus: the song grid (song running from 0 s); step length +-2 on SEQ 1; two notes from different bars, same step at the same beat
  const sq = {ks: 0, res: 3, q: [Q(2, 1, [2, -2, 0, 1, -1, 2, 0, 0, -2, 0, 1, 0, 0, 0, 0, 0]), Q(11, 1, [1, 2, 3])]};
  const info = (t0) => { const rr = R(SP({}, sq), [[t0, 'on', 60, .8], [t0 + .9, 'off', 60]], {sec: 6, songStart: 0, at: [SC]}); return scopes(rr).map(m => ({t: m.t, st: m.seq[0].step})); };
  const a = info(1.0), b = info(4.0), win = (L, t0) => L.filter(x => x.t >= t0 + .05 && x.t <= t0 + .85);
  // the expected step from the formula: cycle C = sum of the step lengths, step where (beat mod C) lies
  const D = sq.q[0].v.map(x => W.SRES[3 + x] * 4); let C = 0; for (const d of D) C += d;
  const expAt = t => { let x = (t * 2) % C, j = 0; while (j < 15 && x >= D[j]) { x -= D[j]; j++; } return j + 1; };
  const ea = win(a, 1.0), eb = win(b, 4.0), fa = ea.filter(x => x.st !== expAt(x.t)).length, fb = eb.filter(x => x.st !== expAt(x.t)).length;
  // the same song beat mod C in both: 4.0 - 1.0 = 3 s = 6 beats; shift b by a whole number of cycles is not needed: compare with the formula
  ok('MK6-05 Aus (Song-Raster)', ea.length > 20 && eb.length > 20 && fa <= 1 && fb <= 1, 'Zyklus C = ' + M(C, 3) + ' Schläge; Start 1,0 s: ' + (ea.length - fa) + '/' + ea.length + ', Start 4,0 s: ' + (eb.length - fb) + '/' + eb.length + ' Berichte auf dem Schritt (Song-Schlag mod C) (je ≤ 1 am Schrittwechsel)');
  // two starts from different bars (beat 4 and beat 8), both held to beat 12: the same step at the same song beat
  const two = t0 => { const rr = R(SP({}, sq), [[t0, 'on', 60, .8], [6.0, 'off', 60]], {sec: 6.1, songStart: 0, at: [SC]}); return scopes(rr).map(m => ({t: m.t, st: m.seq[0].step})); };
  const A2 = two(2.0).filter(x => x.t >= 4.05 && x.t <= 5.95), B2 = two(4.0).filter(x => x.t >= 4.05 && x.t <= 5.95), same = A2.filter((x, k) => B2[k] && B2[k].t === x.t && B2[k].st === x.st).length;
  ok('MK6-05 Aus zwei Starts', A2.length > 50 && same === A2.length, 'Start Takt 2 (Schlag 4) und Takt 3 (Schlag 8): ' + same + '/' + A2.length + ' Berichte zwischen Schlag 8 und 12 auf demselben Schritt');
});

// ---------------- MK6-06 Ziele ----------------
T('MK6-06', () => {
  // Tonhoehe +12 at step 3: +1200 +- 1 ct, only in step 3 (sine: Sinus x with X-MOD 0)
  const sine = {o1: {w: 3, c1: 0, c2: 0}, ...GATE};
  const y = R(SP(sine, {res: 3, q: [Q(1, 1, [0, 0, 12, 0, 0])]}), [[0, 'on', 57, .8]], {sec: .7}).l, f0 = 220;
  const ct = k => 1200 * Math.log2(zcFreq(y, k * 6000 + 1000, k * 6000 + 5400, SR) / f0);
  const c = [0, 1, 2, 3, 4].map(ct);
  ok('MK6-06 Tonhöhe', Math.abs(c[2] - 1200) <= 1 && [0, 1, 3, 4].every(k => Math.abs(c[k]) <= 1), 'Schritte 1–5: ' + c.map(x => M(x, 2)).join(' / ') + ' ct');
  // Cutoff +63 = +63 units, clamped at 127 (scope cutHz)
  const cut = (base, v) => { const r = R(SP({f: {cut: base}}, {res: 3, q: [Q(11, 1, [v, 0])]}), [[0, 'on', 60, .8]], {sec: .2, at: [SC]}); const m = scopes(r).filter(x => x.t > .03 && x.t < .11); return m.length ? m[m.length - 1].voices[0].cutHz : 0; };
  const c1 = cut(40, 63), c2 = cut(100, 63), c0 = cut(40, 0);
  ok('MK6-06 Cutoff', Math.abs(c1 / W.cutHz(103) - 1) < 1e-6 && Math.abs(c2 / W.cutHz(127) - 1) < 1e-6 && Math.abs(c0 / W.cutHz(40) - 1) < 1e-6, '40+63 → ' + M(c1, 0) + ' Hz (W-01 103: ' + M(W.cutHz(103), 0) + ') · 100+63 → ' + M(c2, 0) + ' Hz (geklemmt 127: ' + M(W.cutHz(127), 0) + ') · ohne: ' + M(c0, 0) + ' Hz');
  // Schrittlaenge +2 at step 1 (1/16): step 1 = 3/32 = 187.5 ms
  const g = R(SP(GATE, {res: 3, q: [Q(2, 1, [2]), Q(15, 1, alt(63, -63))]}), [[0, 'on', 69, .8]], {sec: .6, tap: 'gain'}).l, e = edges(g, 200);
  ok('MK6-06 Schrittlänge', e[0] - 9000 <= 0 && e[0] - 9000 >= -16 && e[1] - 15000 <= 0 && e[1] - 15000 >= -16, 'Schritt 1 endet bei ' + e[0] + ' (187,5 ms = 9000), Schritt 2 bei ' + e[1] + ' (+125 ms = 15000) Samples');
  // OSZ2-Halbton +-24 +- 1 ct (OSC 2 alone, triangle)
  const o2 = {o2: {w: 2, semi: 0}, mix: {o1: 0, o2: 127, n: 0}, ...GATE};
  const y2 = R(SP(o2, {res: 6, q: [Q(6, 1, [24, -24, 0])]}), [[0, 'on', 72, .8]], {sec: .8}).l, F = 523.2511;   // 1/8 = 250 ms per step, C5
  const s = [0, 1, 2].map(k => 1200 * Math.log2(zcFreq(y2, k * 12000 + 1000, k * 12000 + 11000, SR) / F));
  ok('MK6-06 OSZ2-Halbton', Math.abs(s[0] - 2400) <= 1 && Math.abs(s[1] + 2400) <= 1 && Math.abs(s[2]) <= 1, '+24 / −24 / 0: ' + s.map(x => M(x, 2)).join(' / ') + ' ct');
  // EG times from the next stage: A-HK DECAY +63 from step 2 does not change a decay that runs; A-HK RELEASE +63 from step 2 acts on the release starting there
  const eg = {e2: {a: 0, d: 80, s: 30, r: 40}, a: {lvl: 100}};
  const gd = R(SP(eg, {res: 3, q: [Q(22, 1, [0, 63, 63, 63])]}), [[0, 'on', 69, .8]], {sec: .5, tap: 'gain'}).l, gr = R(mkPatch(eg), [[0, 'on', 69, .8]], {sec: .5, tap: 'gain'}).l;
  let dd = 0; for (let i = 0; i < gd.length; i++) dd = Math.max(dd, Math.abs(gd[i] - gr[i]));
  const ge = R(SP(eg, {res: 3, q: [Q(24, 1, [0, 63, 63, 63])]}), [[0, 'on', 69, .8], [.2, 'off', 69]], {sec: .6, tap: 'gain'}).l, gf = R(mkPatch(eg), [[0, 'on', 69, .8], [.2, 'off', 69]], {sec: .6, tap: 'gain'}).l;
  let pre = 0; for (let i = 0; i < .2 * SR; i++) pre = Math.max(pre, Math.abs(ge[i] - gf[i]));
  const l1 = db(ge[Math.round(.3 * SR)] / ge[Math.round(.2 * SR) + 32]), l0 = db(gf[Math.round(.3 * SR)] / gf[Math.round(.2 * SR) + 32]);
  ok('MK6-06 HK-Zeiten', dd === 0 && pre === 0 && l1 > l0 + 6, 'DECAY-Schritt mitten im Decay: bitgleich (max |Δ| ' + dd + ') · RELEASE +63 ab Schritt 2: vor dem Loslassen bitgleich, 100 ms danach ' + M(l1) + ' dB statt ' + M(l0) + ' dB');
  // PATCH intensity: PATCH 2 (LFO 1 -> Cutoff, intensity 0) +63 by SEQ moves the cutoff
  const pc = v => { const r = R(SP({l1: {f: 100}, f: {cut: 64}}, {res: 3, q: [Q(28, 1, new Array(16).fill(v))]}), [[0, 'on', 60, .8]], {sec: .6, at: [SC]}); const h = scopes(r).filter(m => m.voices[0]).map(m => m.voices[0].cutHz); return Math.max(...h) / Math.min(...h); };
  const pr = pc(63), p0 = pc(0);
  ok('MK6-06 Patch-Intensität', pr > 4 && p0 < 1.0001, 'Cutoff-Bereich (max/min) mit SEQ +63: ×' + M(pr, 2) + ', ohne: ×' + M(p0, 4));
  // LFO1-FREQ at Tempo Sync on: bit-equal, no effect
  const lt = {l1: {sync: 1, note: 9, f: 30}, p: [{s: 0, d: 0, i: 0}, {s: 2, d: 4, i: 40}, {s: 3, d: 0, i: 0}, {s: 4, d: 5, i: 0}], f: {cut: 64}};
  const la = R(SP(lt, {res: 3, q: [Q(25, 1, alt(63, -63))]}), [[0, 'on', 60, .8]], {sec: 1}).l, lb = R(mkPatch(lt), [[0, 'on', 60, .8]], {sec: 1}).l;
  let ld = 0; for (let i = 0; i < la.length; i++) ld = Math.max(ld, Math.abs(la[i] - lb[i]));
  const lc = R(SP(Object.assign({}, lt, {l1: {sync: 0, note: 9, f: 30}}), {res: 3, q: [Q(25, 1, alt(63, -63))]}), [[0, 'on', 60, .8]], {sec: 1}).l, ld2 = R(mkPatch(Object.assign({}, lt, {l1: {sync: 0, note: 9, f: 30}})), [[0, 'on', 60, .8]], {sec: 1}).l;
  let lx = 0; for (let i = 0; i < lc.length; i++) lx = Math.max(lx, Math.abs(lc[i] - ld2[i]));
  ok('MK6-06 LFO1-Freq bei Tempo Sync', ld === 0 && lx > .01, 'Tempo Sync an: max |Δ| ' + ld + ' (bitgleich) · Kontrolle Sync aus: ' + M(lx, 3));
});

// ---------------- MK6-07 Vorrang ----------------
T('MK6-07', () => {
  const a = R(SP({f: {cut: 64}}, {res: 3, q: [Q(11, 1, alt(63, -63)), Q(0), Q(11, 1, alt(-30, 20))]}), [[0, 'on', 60, .8]], {sec: .8}).l;
  const b = R(SP({f: {cut: 64}}, {res: 3, q: [Q(0), Q(0), Q(11, 1, alt(-30, 20))]}), [[0, 'on', 60, .8]], {sec: .8}).l;
  const c = R(SP({f: {cut: 64}}, {res: 3, q: [Q(11, 1, alt(63, -63)), Q(0), Q(0)]}), [[0, 'on', 60, .8]], {sec: .8}).l;
  let d = 0, d1 = 0; for (let i = 0; i < a.length; i++) { d = Math.max(d, Math.abs(a[i] - b[i])); d1 = Math.max(d1, Math.abs(a[i] - c[i])); }
  ok('MK6-07 Vorrang', d === 0 && d1 > .01, 'SEQ 1 + SEQ 3 auf CUTOFF = nur SEQ 3 (max |Δ| ' + d + '); gegen nur SEQ 1: ' + M(d1, 3));
});

// ---------------- MK6-08 Wellenfolge ----------------
T('MK6-08', () => {
  const c2 = [0, 20, 40, 60, 80, 100], ws = c2.map(x => Math.floor(x / 2) + 1);
  const pw = {o1: {w: 5, c1: 0, c2: 0}, ...GATE};
  const pw40 = {o1: {w: 5, c1: 0, c2: 40}, ...GATE};   // stored STEUER 2 = 40, step values -40 ... +60 (the step range is +-63)
  const y = renderW(SP(pw40, {last: 6, res: 6, q: [Q(5, 1, c2.map(x => x - 40))]}), [[0, 'on', 57, .8]], {sec: 1.6, file: FILE}, ws).l;   // 1/8 = 250 ms per step
  const lin = P => { let s = 0; for (const x of P) s += x; return P.map(x => x / s); };
  let worst = 0, own = 0; const bad = [];
  for (let k = 0; k < 6; k++) {
    const ref = renderW(mkPatch(Object.assign({}, pw, {o1: {w: 5, c1: 0, c2: c2[k]}})), [[0, 'on', 57, .8]], {sec: .3, file: FILE}, [ws[k]]).l;
    const A = spectrum(y, k * 12000 + 3000, 8192), B = spectrum(ref, 4000, 8192), H = k2 => { const out = []; for (let h = 1; h <= 24; h++) { const b = Math.round(h * 220 * 8192 / SR); out.push(Math.max(A[b - 1], A[b], A[b + 1]) ); } return out; };
    const Hb = []; for (let h = 1; h <= 24; h++) { const b = Math.round(h * 220 * 8192 / SR); Hb.push(Math.max(B[b - 1], B[b], B[b + 1])); }
    const a = lin(H()), b = lin(Hb); let e = 0; for (let h = 0; h < 24; h++) e += Math.abs(a[h] - b[h]); worst = Math.max(worst, e);
    // against the other waves: the own one must be the nearest
    let best = 1e9; for (let j = 0; j < 6; j++) { if (j === k) continue; const r2 = renderW(mkPatch(Object.assign({}, pw, {o1: {w: 5, c1: 0, c2: c2[j]}})), [[0, 'on', 57, .8]], {sec: .3, file: FILE}, [ws[j]]).l; const C = spectrum(r2, 4000, 8192); const Hc = []; for (let h = 1; h <= 24; h++) { const bb = Math.round(h * 220 * 8192 / SR); Hc.push(Math.max(C[bb - 1], C[bb], C[bb + 1])); } const c = lin(Hc); let f = 0; for (let h = 0; h < 24; h++) f += Math.abs(a[h] - c[h]); best = Math.min(best, f); }
    if (e >= best) bad.push(k + 1); own = Math.max(own, e / best);
  }
  ok('MK6-08 Wellenfolge', !bad.length && worst < .05, 'Wellen ' + ws.join(', ') + ' je Schritt: Spektrum-Abstand zum Einzel-Render ≤ ' + M(worst, 4) + ' (Anteile, Summe |Δ|), jeweils ≤ ' + M(own * 100, 1) + ' % des Abstands zur nächstähnlichen Welle' + (bad.length ? ' · falsch bei ' + bad.join(',') : ''));
  // M-KLICK at a switch between two different waves as in MK2 (v3-mk2-osc.mjs mKlickSw): against the louder of the two steady states
  const kk = mKlickSw(y, SR, [1, 2, 3, 4, 5, 6].map(k => k * .25)).worst;
  ok('MK6-08 M-KLICK', kk <= 6, 'Wellenwechsel mit 2-ms-Blende (6 Wechsel, Stufe ohne Zwischenwellen): M-KLICK ' + M(kk) + ' dB (≤ 6; Bezug der lautere stehende Zustand wie MK2)');
});

// ---------------- MK6-09 (worklet part): motion recording ----------------
T('MK6-09', () => {
  // knob CUTOFF moved from 40 upwards while a note sounds; recording armed at 0.30 s (step 3 at 1/16), ends after LETZTER SCHRITT 8
  const p = SP({f: {cut: 40}}, {on: 0, last: 8, type: 1, run: 0, res: 3, q: [Q(0), Q(15, 1, alt(5, 5))]});
  const at = [[.30, {mkRec: {ti: 0, k: 0, tg: 11, base: 40}}]]; for (let t = .30; t < 1.4; t += .01) at.push([t + .001, {mkSet: {'t.0.f.cut': 40 + Math.min(80, (t - .3) * 120)}}]);
  const r = R(p, [[0, 'on', 60, .8]], {sec: 1.5, at: at.concat([SC])}), done = r.msgs.filter(m => m.mkRecDone).map(m => m.mkRecDone);
  const d = done[0], exp = []; for (let s = 1; s <= 8; s++) exp.push(s);
  ok('MK6-09 Aufnahme endet', done.length === 1 && d.from === 3 && d.to === 8, done.length ? 'Schritte ' + d.from + '…' + d.to + ' (Start im 3. Schritt bei 0,30 s, LETZTER SCHRITT 8), dann Ende' : 'keine Meldung');
  ok('MK6-09 Werte', d && d.tg === 11 && d.v[0] === 0 && d.v[1] === 0 && d.v.slice(2, 8).every((x, k, a) => x > 0 && (k === 0 || x >= a[k - 1])) && d.v.slice(8).every(x => x === 0), d ? 'Ziel ' + d.tg + ' (CUTOFF), Werte ' + d.v.join(',') : '');
  // forward loop while recording, also at TYP Rueckwaerts and LAUF Einmal (MK6-14)
  const st = []; for (const m of scopes(r)) if (m.t > .3 && m.t < 1.0 && m.seq[0].rec) st.push(m.seq[0].step);
  const fw = st.every((x, k) => k === 0 || x >= st[k - 1]);
  ok('MK6-14 vorwärts beim Aufnehmen', fw && st.length > 5, 'TYP Rückwärts, LAUF Einmal: Schritte während AUFN. ' + [...new Set(st)].join(','));
  // a second knob is not taken (the target stays the first one): the worklet records only its target
  const r2 = R(p, [[0, 'on', 60, .8]], {sec: 1.5, at: at.concat([[.5, {mkSet: {'t.0.f.res': 90}}]])}), d2 = r2.msgs.filter(m => m.mkRecDone).map(m => m.mkRecDone)[0];
  ok('MK6-09 nur der erste Regler', d2 && d2.tg === 11 && JSON.stringify(d2.v) === JSON.stringify(d.v), 'RESONANZ dazwischen bewegt: dasselbe Ergebnis');
});

// ---------------- MK6-10 Neutral ----------------
T('MK6-10', () => {
  if (!PREV) { ok('MK6-10', false, 'MK_PREV fehlt'); return; }
  const ev = [[0, 'on', 48, .8], [.05, 'on', 55, .7], [.1, 'on', 64, .9], [.6, 'off', 48], [.7, 'off', 55], [.8, 'off', 64]];
  const tims = [{}, {o1: {w: 1, c1: 40}, o2: {w: 1, mod: 2, semi: 7}, mix: {o1: 127, o2: 90, n: 20}, f: {type: 1, cut: 70, res: 80, eg: 30}, l1: {f: 90, ks: 2}, porta: 30}, {o1: {w: 3, c1: 64}, f: {type: 2, cut: 60}, a: {dist: 1}, asg: 2, e2: {a: 20, d: 50, s: 60, r: 40}}, {asg: 0, trig: 0, porta: 40, l2: {ks: 2, f: 80}, vib: 30}];
  let w0 = 0, w1 = 0, n = 0;
  for (const t of tims) {
    const b = render(mkPatch(t), ev, {sec: 1.2, file: PREV, mw0: .6});
    const a0 = R(mkPatch(t), ev, {sec: 1.2, mw0: .6}); for (let i = 0; i < a0.l.length; i++) w0 = Math.max(w0, Math.abs(a0.l[i] - b.l[i]), Math.abs(a0.r[i] - b.r[i]));
    // seq on, all values 0, every target except step length, all key syncs, types and motions
    for (const ks of [0, 1, 2]) for (const tgs of [[1, 3, 4], [5, 6, 7], [8, 9, 10], [11, 12, 13], [14, 15, 16], [17, 18, 19], [20, 21, 22], [23, 24, 25], [26, 27, 28], [29, 30, 11]]) {
      const a = R(SP(t, {ks, type: n % 4, run: n & 1, res: n % 16, q: tgs.map((k, j) => Q(k, j & 1))}), ev, {sec: 1.2, mw0: .6, songStart: ks === 0 ? 0 : null}); n++;
      for (let i = 0; i < a.l.length; i++) w1 = Math.max(w1, Math.abs(a.l[i] - b.l[i]), Math.abs(a.r[i] - b.r[i]));
    }
  }
  ok('MK6-10 Seq aus', w0 === 0, '4 Timbres gegen den Vorgänger-Stand: max |Δ| ' + w0);
  ok('MK6-10 Seq an, alle Werte 0', w1 === 0, n + ' Renders (alle 29 Ziele außer Schrittlänge, KEY SYNC aus/Timbre/Stimme, alle TYP/LAUF/AUFLÖSUNG): max |Δ| ' + w1);
  // VA / FM6 voices of the same processor
  let wv = 0; for (const eng of [0, 1]) { const a = render(null, ev, {sec: 1, eng, file: FILE}), b = render(null, ev, {sec: 1, eng, file: PREV}); for (let i = 0; i < a.l.length; i++) wv = Math.max(wv, Math.abs(a.l[i] - b.l[i])); }
  ok('MK6-10 VA/FM6', wv === 0, 'max |Δ| ' + wv);
});

// ---------------- MK6-14 Keytrack ----------------
T('MK6-14', () => {
  const cut = v => { const r = R(SP({f: {cut: 60, kbd: 48}}, {res: 3, q: [Q(1, 1, [v, v])]}), [[0, 'on', 60, .8]], {sec: .2, at: [SC]}); const m = scopes(r).filter(x => x.t > .03 && x.t < .11); return m[m.length - 1].voices[0].cutHz; };
  const a = cut(12), b = cut(0), ht = 12 * Math.log2(a / b);
  ok('MK6-14 Keytrack', Math.abs(ht - 12) <= .12, 'Seq-Tonhöhe +12 mit KEYTRACK +48: Cutoff +' + M(ht, 3) + ' HT (12 ± 1 %)');
});
console.log(fails ? fails + ' FEHLER' : 'alle bestanden');
process.exit(fails ? 1 : 0);
