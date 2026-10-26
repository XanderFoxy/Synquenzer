// MK2 DSP acceptance in Node (Nachtrag 3 MK2-01 ... MK2-07, MK2-09, Teil F FP-DSP): the worklet of index.html (MK_FILE) with a
// stub scope; the stored waves come from the app's own mkTables (block MKT) as {mkw} messages.
// Usage: MK_FILE=<index.html> MK_PREV=<predecessor.html> node v3-mk2-osc.mjs   (ONLY=<regex> picks tests)
import {render, renderW, mkPatch, mktab} from './v3-mk2-node.mjs';
import {db, pdb, rms, peak, amp, folded, peaks, zcFreq, mKlick, mEinbruch, centroid, spectrum, fft} from './v3-mk1-ana.mjs';
const SR = 48000, FILE = process.env.MK_FILE || new URL('../mk-wt/index.html', import.meta.url).pathname;
const PREV = process.env.MK_PREV || new URL('../mk2work/index.mk1base.html', import.meta.url).pathname;
let fails = 0; const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
const only = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
const T = (id, f) => { if (only && !only.test(id)) return; try { f(); } catch (e) { ok(id, false, 'Fehler ' + (e.stack || e)); } };
const mtof = n => 440 * Math.pow(2, (n - 69) / 12), M = (x, d) => Math.round(x * 10 ** (d == null ? 1 : d)) / 10 ** (d == null ? 1 : d);
const OPEN = {f: {type: 0, cut: 127, res: 0}, a: {gate: 1}};
const merge = (...o) => { const r = {}; for (const x of o) for (const k in x || {}) r[k] = typeof x[k] === 'object' && !Array.isArray(x[k]) ? Object.assign({}, r[k] || {}, x[k]) : x[k]; return r; };
const MKT = mktab(FILE), W = n => [n];
// M-KLICK at a switch between two different timbres: the windows from 2 ms before to 10 ms after the switch must not lie more than
// +6 dB over the LOUDER of the two steady states (median of the 2 ms windows 22 ... 2 ms before and 10 ... 30 ms after); the plain
// M-KLICK (median of +-20 ms) flags every change from a bright to a dark wave, smooth or not
function mKlickSw(x, sr, ts) {
  const hp = (v, f, q) => { const w = 2 * Math.PI * f / sr, a = Math.sin(w) / (2 * q), cw = Math.cos(w), b0 = (1 + cw) / 2, b1 = -(1 + cw), a0 = 1 + a, a1 = -2 * cw, a2 = 1 - a; const y = new Float64Array(v.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    for (let i = 0; i < v.length; i++) { const o = (b0 * v[i] + b1 * x1 + b0 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = v[i]; y2 = y1; y1 = o; y[i] = o; } return y; };
  const h = hp(hp(Float64Array.from(x), 5000, .5412), 5000, 1.3066), W2 = Math.round(.002 * sr), E = i => { let e = 0; for (let k = i; k < i + W2; k++) e += h[k] * h[k]; return e / W2 + 1e-20; };
  const med = a => a.slice().sort((p, q) => p - q)[a.length >> 1];
  let worst = -99, at = 0;
  for (const t of ts) { const c = Math.round(t * sr), pre = [], post = [];
    for (let i = c - Math.round(.022 * sr); i + W2 <= c - Math.round(.002 * sr); i += W2) pre.push(E(i)); for (let i = c + Math.round(.01 * sr); i + W2 <= c + Math.round(.03 * sr); i += W2) post.push(E(i));
    const ref = Math.max(med(pre), med(post)); for (let i = c - W2; i < c + Math.round(.01 * sr); i += W2 / 2) { const d = pdb(E(i) / ref); if (d > worst) { worst = d; at = t; } } }
  return {worst, at, ok: worst <= 6};
}
const wv = n => 2 * (n - 1);   // STEUER 2 value of stored wave n
const ALLW = []; for (let n = 1; n <= 64; n++) ALLW.push(n);

// ---------------- MK2-01 Sinus x ----------------
T('MK2-01', () => {
  const f1 = mtof(57), i0 = 9600, n = 32768;
  let r = render(mkPatch({o1: {w: 3, c1: 0}, mix: {o1: 127, o2: 0}, a: {gate: 1}}), [[0, 'on', 57, .8]], {sec: 1.2, tap: 'mix'});
  const a1 = amp(r.l, i0, n, f1, SR); let e = 0; for (let k = 2; k <= 10; k++) e += amp(r.l, i0, n, k * f1, SR) ** 2;
  ok('MK2-01 X-MOD 0: Klirr ≤ −60 dB', db(Math.sqrt(e) / a1) <= -60, M(db(Math.sqrt(e) / a1)) + ' dB');
  const p64 = merge({o1: {w: 3, c1: 64}, o2: {w: 2, semi: 12}, mix: {o1: 127, o2: 0}}, OPEN), p0 = merge(p64, {o1: {w: 3, c1: 0}});
  r = render(mkPatch(p64), [[0, 'on', 57, .8]], {sec: 1.2, tap: 'mix'});
  const sb = db(amp(r.l, i0, n, f1 + 2 * f1, SR) / amp(r.l, i0, n, f1, SR));
  const c64 = centroid(render(mkPatch(p64), [[0, 'on', 57, .8]], {sec: .6}).l, 9600, 2048, SR), c0 = centroid(render(mkPatch(p0), [[0, 'on', 57, .8]], {sec: .6}).l, 9600, 2048, SR);
  ok('MK2-01 X-MOD 64, OSZ 2 Dreieck +12: Seitenband f₁ + f₂ ≥ −20 dB zum Träger, M-SP ≥ ⅓ Okt höher', sb >= -20 && Math.log2(c64 / c0) >= 1 / 3, 'Seitenband ' + M(sb) + ' dB, M-SP ' + M(c0, 0) + ' → ' + M(c64, 0) + ' Hz (' + M(Math.log2(c64 / c0), 2) + ' Okt)');
  // X-LFO 127: the depth follows LFO1 (triangle 1.3 Hz)
  r = render(mkPatch(merge(p64, {o1: {w: 3, c1: 0, c2: 127}, l1: {w: 2, f: 60}})), [[0, 'on', 57, .8]], {sec: 2, tap: 'mix'});
  const L = []; for (let s = 4800; s + 4096 < 96000; s += 1200) L.push(db(amp(r.l, s, 4096, 3 * f1, SR)));
  ok('MK2-01 X-LFO 127: Seitenband schwankt ≥ 10 dB über eine LFO-Periode', Math.max(...L) - Math.min(...L) >= 10, M(Math.max(...L) - Math.min(...L)) + ' dB');
  // Ring and Ring+Sync: deterministic, finite, = the definition W-27 rebuilt from the taps (OSC 1 phase, OSC 2 after sync)
  let worst = 0, nan = 0, det = 0;
  for (const mod of [1, 3]) for (const [c1, w2, semi] of [[64, 0, 7], [127, 1, 12], [30, 2, -5]]) {
    const base = {o1: {w: 3, c1}, o2: {w: w2, mod, semi}, a: {gate: 1}}, ev = [[0, 'on', 52, .8], [.2, 'on', 64, .7], [.6, 'off', 52]];
    const tap = render(mkPatch(base), ev, {sec: .8, tap: 'sx'});
    const A = render(mkPatch(merge(base, {mix: {o1: 127, o2: 0}})), ev, {sec: .8, tap: 'mix'}), A2 = render(mkPatch(merge(base, {mix: {o1: 127, o2: 0}})), ev, {sec: .8, tap: 'mix'});
    const B = render(mkPatch(merge(base, {mix: {o1: 0, o2: 127}})), ev, {sec: .8, tap: 'mix'});
    // with two voices the taps add up; check only the single-voice part 0 .. 0.2 s
    for (let i = 0; i < 9600; i++) {
      const ph = tap.l[i], o2 = tap.r[i], x = Math.sin(2 * Math.PI * ph + 4 * c1 / 127 * o2);
      if (!isFinite(A.l[i]) || !isFinite(B.l[i])) nan++; if (A.l[i] !== A2.l[i]) det++;
      worst = Math.max(worst, Math.abs(A.l[i] - x), Math.abs(B.l[i] - x * o2));
    }
  }
  ok('MK2-01 Ring und Ring+Sync: deterministisch, ohne NaN, = Referenz W-27 (max |Δ| ≤ 1e-4)', worst <= 1e-4 && !nan && !det, 'max |Δ| ' + worst.toExponential(2) + ', NaN ' + nan + ', ungleich ' + det);
});
// ---------------- MK2-02 Stimmwelle ----------------
const bands = []; for (let i = 0; i <= 10; i++) bands.push(400 * 2 ** (i / 3));
// envelope in Hz: harmonic power per Hz, interpolated in dB over log f at the third-octave centres 400 ... 4000 Hz, normalised
// to the total level of the envelope over these bands
function vEnv(note, c1) {
  const f0 = mtof(note), r = renderW(mkPatch(merge({o1: {w: 4, c1}}, OPEN)), [[0, 'on', note, .8]], {sec: 1.6}, []);
  const H = []; for (let k = 1; k * f0 < 9000; k++) H.push([k * f0, amp(r.l, 24000, 32768, k * f0, SR) ** 2 / 2 / f0]);
  const e = bands.map(fb => { let i = H.findIndex(([f]) => f >= fb); if (i <= 0) i = 1; const [fl, pl] = H[i - 1], [fh, ph] = H[i]; const dl = pdb(pl), dh = pdb(ph); return dl + (dh - dl) * Math.log(fb / fl) / Math.log(fh / fl); });
  const tot = pdb(e.reduce((s, x) => s + 10 ** (x / 10), 0) / e.length); return e.map(x => x - tot);
}
T('MK2-02', () => {
  const dev = [];
  for (const c1 of [0, 64, 127]) { const a = vEnv(36, c1), b = vEnv(60, c1); dev.push(Math.max(...a.map((x, i) => Math.abs(x - b[i])))); }
  ok('MK2-02 Spektralhülle in Hz bei C2 und C4 gleich: ± 3 dB in Terzbändern 400–4000 Hz (FORM 0 / 64 / 127)', dev.every(x => x <= 3), dev.map(x => M(x, 2)).join(' / ') + ' dB');
  const sp = c1 => centroid(renderW(mkPatch(merge({o1: {w: 4, c1}}, OPEN)), [[0, 'on', 48, .8]], {sec: .6}, []).l, 9600, 2048, SR);
  const s0 = sp(0), s1 = sp(127);
  ok('MK2-02 FORM 0 → 127 ändert M-SP ≥ ⅓ Okt', Math.abs(Math.log2(s0 / s1)) >= 1 / 3, M(s0, 0) + ' → ' + M(s1, 0) + ' Hz (' + M(Math.log2(s0 / s1), 2) + ' Okt)');
  const fe = [0, 64, 127].map(c1 => folded(renderW(mkPatch(merge({o1: {w: 4, c1}}, OPEN)), [[0, 'on', 96, .8]], {sec: 1.2}, []).l, 9600, mtof(96), SR));
  ok('MK2-02 C7: gefaltete Energie ≤ −50 dB', fe.every(x => x <= -50), fe.map(x => M(x)).join(' / ') + ' dB');
});
// ---------------- MK2-03 Speicherwellen ----------------
function dft(t, K) { const N = t.length - 1, A = []; for (let k = 1; k <= K; k++) { let a = 0, b = 0; for (let i = 0; i < N; i++) { const p = 2 * Math.PI * k * i / N; a += t[i] * Math.cos(p); b += t[i] * Math.sin(p); } A.push(2 * Math.hypot(a, b) / N); } return A; }
function spec0(t) { const N = t.length - 1, re = new Float64Array(N), im = new Float64Array(N); for (let i = 0; i < N; i++) re[i] = t[i]; fft(re, im); const P = new Float64Array(N / 2); for (let k = 0; k < N / 2; k++) P[k] = (re[k] ** 2 + im[k] ** 2) * 2 / (N * N); return P; }
T('MK2-03', () => {
  const tabs = ALLW.map(n => MKT.mkTables(MKT.isOct(n) ? {n, f: 220.27} : {n}));
  let pkBad = [], dcMax = 0;
  tabs.forEach((T0, i) => { const t = T0[0]; let p = 0, m = 0; for (let k = 0; k < 2048; k++) { p = Math.max(p, Math.abs(t[k])); m += t[k]; } if (Math.abs(p - 1) > 1e-3) pkBad.push(i + 1); dcMax = Math.max(dcMax, Math.abs(m / 2048)); });
  ok('MK2-03 64 Wellen, Spitze 1, kein Gleichanteil (Mip-Stufe 0; 35, 61–64: Tabelle für 220,27 Hz)', tabs.length === 64 && !pkBad.length && dcMax < 1e-6, 'Spitze ≠ 1: [' + pkBad + '], |DC| ≤ ' + dcMax.toExponential(1));
  const L = tabs.map(T0 => dft(T0[0], 16).map(a => Math.max(-60, db(a))));
  let mn = 99, pr = null; for (let i = 0; i < 64; i++) for (let j = i + 1; j < 64; j++) { const mx = Math.max(...L[i]), my = Math.max(...L[j]); let e = 0; for (let k = 0; k < 16; k++) e += ((L[i][k] - mx) - (L[j][k] - my)) ** 2; const d = Math.sqrt(e / 16); if (d < mn) { mn = d; pr = [i + 1, j + 1]; } }
  ok('MK2-03 jede Welle unterscheidet sich von jeder anderen: RMS-Abstand ≥ 1 dB über die Teiltöne 1–16', mn >= 1, 'kleinster ' + M(mn, 2) + ' dB (' + pr + ')');
  // roll-off over the last traced partial: energy per octave against the formula (+-0.5 dB); without roll-off nothing there; 35 only octaves
  let worst = 0, wN = 0, silentBad = [], octBad = 0;
  for (let n = 1; n <= 64; n++) {
    const P = spec0(tabs[n - 1][0]), w = MKT.data()[n], H = MKT.harm(n, MKT.isOct(n) ? 220.27 : 0), g = MKT.norm(n, MKT.isOct(n) ? 220.27 : 0);
    if (n === 35) { let e = 0, t = 0; for (let k = 1; k <= 512; k++) { t += P[k]; if (k & (k - 1)) e += P[k]; } if (pdb(e / t) > -100) octBad = pdb(e / t); continue; }
    const roll = H.A[w.K + 1] > 0;
    for (let lo = w.K; lo < 512; lo *= 2) {
      let e = 0, f = 0; for (let k = lo + 1; k <= Math.min(512, 2 * lo); k++) { e += P[k]; f += (H.A[k] * g) ** 2 / 2; }
      if (!roll) { const t = P.reduce((s, x) => s + x, 0); if (pdb(e / t) > -100) silentBad.push(n); break; }
      const d = Math.abs(pdb(e / f)); if (d > worst) { worst = d; wN = n; }
    }
  }
  ok('MK2-03 über dem letzten Teilton der Nachzeichnung folgt jede Welle dem Abfall (Pegel je Oktave ± 0,5 dB); Ā < −50 dB: keine Teiltöne; 35: nur Oktav-Teiltöne', worst <= .5 && !silentBad.length && !octBad,
    'max ' + M(worst, 3) + ' dB (' + wN + '), ohne Abfall mit Energie: [' + silentBad + '], 35 Nicht-Oktav ' + (octBad ? M(octBad) + ' dB' : '≤ −100 dB'));
  // C7 folded energy, every wave
  // at the oscillator (tap 'mix': the mip tables); the full path is reported too (the ladder's own saturation folds a wave whose
  // energy sits at 12-15 kHz at C7, e.g. 27; MK1 path, not the tables)
  const fe = ALLW.map(n => folded(renderW(mkPatch(merge({o1: {w: 5, c2: wv(n)}}, OPEN)), [[0, 'on', 96, .8]], {sec: 1, tap: 'mix'}, W(n)).l, 9600, mtof(96) / MKT.r(n), SR));   // the table's partials sit on f / r
  const ff = ALLW.map(n => folded(renderW(mkPatch(merge({o1: {w: 5, c2: wv(n)}}, OPEN)), [[0, 'on', 96, .8]], {sec: 1}, W(n)).l, 9600, mtof(96) / MKT.r(n), SR));
  const fw = Math.max(...fe), fv = Math.max(...ff), nOver = ff.filter(x => x > -50).length;
  ok('MK2-03 C7: gefaltete Energie ≤ −50 dB (alle 64, am Oszillator)', fw <= -50, 'schlechteste ' + M(fw) + ' dB (Welle ' + (fe.indexOf(fw) + 1) + '); mit Filter offen: schlechteste ' + M(fv) + ' dB (Welle ' + (ff.indexOf(fv) + 1) + '), ' + nOver + ' Wellen über −50 dB');
  // wave change at a sounding note (STEUER 2 jumps and a sweep with fractions, single and octave waves): M-KLICK, M-EINBRUCH
  const at = [[.4, {mkSet: {'t.0.o1.c2': wv(40)}}], [.7, {mkSet: {'t.0.o1.c2': wv(61)}}], [1.0, {mkSet: {'t.0.o1.c2': wv(35)}}], [1.3, {mkSet: {'t.0.o1.c2': wv(8)}}]];
  for (let k = 0; k < 40; k++) at.push([1.5 + k * .01, {mkSet: {'t.0.o1.c2': 20 + k * .9}}]);
  const r = renderW(mkPatch(merge({o1: {w: 5, c2: wv(12)}, f: {cut: 100}}, {a: {gate: 1}})), [[0, 'on', 57, .8]], {sec: 2.2, at}, ALLW);
  const sw = [.4, .7, 1.0, 1.3]; for (let k = 0; k < 40; k++) { const a = Math.floor((20 + (k - 1) * .9) / 2), b = Math.floor((20 + k * .9) / 2); if (k && a !== b) sw.push(1.5 + k * .01); }
  const kl = mKlickSw(r.l, SR, sw.map(t => Math.ceil(t * SR / 128) * 128 / SR)), eb = [.4, .7, 1.0, 1.3].map(t => mEinbruch(r.l, SR, t));
  // a chord (E-Piano 37 -> 36 -> Orgel 41)
  const r3 = renderW(mkPatch(merge({o1: {w: 5, c2: wv(37)}, f: {cut: 110}}, {a: {gate: 1}})), [[0, 'on', 57, .8], [0, 'on', 61, .8], [0, 'on', 64, .8]], {sec: 1.2, at: [[.4, {mkSet: {'t.0.o1.c2': wv(36)}}], [.8, {mkSet: {'t.0.o1.c2': wv(41)}}]]}, ALLW);
  const k3 = mKlickSw(r3.l, SR, [.4, .8].map(t => Math.ceil(t * SR / 128) * 128 / SR));
  ok('MK2-03 Wellenwechsel bei klingender Note (Sprünge, Oktav-Wellen, Zug mit Bruchwerten): M-KLICK am Wechsel, M-EINBRUCH', kl.ok && k3.ok && eb.every(x => x.ok),
    'Wechsel-Klick ' + M(kl.worst) + ' dB @' + M(kl.at, 3) + ' s über ' + sw.length + ' Wechsel, Akkord ' + M(k3.worst) + ' dB, Einbruch ' + eb.map(x => M(x.worst)).join(' / ') + ' dB');
  // placeholder -> table (the wave arrives while the note sounds): M-KLICK
  const r2 = renderW(mkPatch(merge({o1: {w: 5, c2: wv(20)}}, {a: {gate: 1}})), [[0, 'on', 57, .8]], {sec: 1, at: [[.3, {mkw: MKT.wave(20)}]]}, []);
  const k2 = mKlickSw(r2.l, SR, [Math.ceil(.3 * SR / 128) * 128 / SR]), e2 = mEinbruch(r2.l, SR, .3);
  ok('MK2-03 Platzhalter-Säge → Tabelle (Welle kommt während der Note): M-KLICK, M-EINBRUCH', k2.ok && e2.ok && r2.msgs.some(m => m.mkwNeed === 20), 'Klick ' + M(k2.worst) + ' dB, Einbruch ' + M(e2.worst) + ' dB, Anfrage ' + r2.msgs.filter(m => m.mkwNeed).length);
});
// ---------------- MK2-04 Endlos ----------------
T('MK2-04', () => {
  const lv = (note) => { const r = renderW(mkPatch(merge({o1: {w: 5, c2: wv(35)}}, OPEN)), [[0, 'on', note, .8]], {sec: 1.3}, W(35)); return f => db(amp(r.l, 14400, 32768, f, SR)); };
  let worst = 0, cnt = 0;
  for (const [a, b] of [[48, 60], [54, 66]]) {
    const A = lv(a), B = lv(b), f0 = mtof(b) / 2;   // the partials of the upper note (f / 2 * 2^j) are partials of the lower one too
    for (let f = f0; f < 9000; f *= 2) { if (f < 100) continue; const x = A(f), y = B(f); if (Math.max(x, y) < -60) continue; worst = Math.max(worst, Math.abs(x - y)); cnt++; }
  }
  ok('MK2-04 Endlos: Teiltöne von C3/C4 und Fis3/Fis4 in Hz deckungsgleich (± 1 dB)', worst <= 1 && cnt >= 10, 'max ' + M(worst, 2) + ' dB über ' + cnt + ' Teiltöne');
  const ev = []; for (let k = 0; k <= 24; k++) { ev.push([k * .4, 'on', 48 + k, .8]); ev.push([k * .4 + .35, 'off', 48 + k]); }
  const r = renderW(mkPatch(merge({o1: {w: 5, c2: wv(35)}}, OPEN)), ev, {sec: 10.2}, W(35));
  const lev = []; for (let k = 0; k <= 24; k++) lev.push(db(rms(r.l, Math.round((k * .4 + .05) * SR), Math.round((k * .4 + .3) * SR))));
  let j = 0; for (let k = 1; k < lev.length; k++) j = Math.max(j, Math.abs(lev[k] - lev[k - 1]));
  ok('MK2-04 chromatische Tonleiter über 2 Okt ohne Pegelsprung > 1,5 dB (M-PEGEL)', j <= 1.5, 'größter Sprung ' + M(j, 2) + ' dB, Spanne ' + M(Math.max(...lev) - Math.min(...lev), 2) + ' dB');
});
// ---------------- MK2-05 Rauschen ----------------
function welch(x, i0, n, seg) { const acc = new Float64Array(n / 2); let c = 0; for (let s = i0; s + n <= x.length; s += n / 2) { const P = spectrum(x, s, n, 'hann'); for (let k = 0; k < n / 2; k++) acc[k] += P[k]; c++; if (seg && c >= seg) break; } for (let k = 0; k < n / 2; k++) acc[k] /= c; return acc; }
function peakF(P, n, lo, hi) { const bin = SR / n; let b = 0, k0 = Math.round(lo / bin); for (let k = k0; k < hi / bin; k++) if (P[k] > P[b] || b < k0) b = k; const a = Math.log(P[b - 1]), c = Math.log(P[b]), d = Math.log(P[b + 1]); return (b + .5 * (a - d) / (a - 2 * c + d)) * bin; }
T('MK2-05', () => {
  const nz = (note, c1, c2, sec) => renderW(mkPatch(merge({o1: {w: 6, c1, c2}}, OPEN)), [[0, 'on', note, .8]], {sec: sec || 8}, []).l;
  const res = [];
  for (const [note, c1, want] of [[48, 24, mtof(48)], [72, 24, mtof(72)], [48, 36, 2 * mtof(48)]]) {
    const P = welch(nz(note, c1, 127), 9600, 65536), f = peakF(P, 65536, want / 1.5, want * 1.5); res.push([note, c1, M(1200 * Math.log2(f / want), 1)]);
  }
  ok('MK2-05 RESO. 127, CUTOFF 24: Spitze bei der Notenfrequenz ± 20 ct (C3, C5); CUTOFF 36 eine Oktave höher', res.every(x => Math.abs(x[2]) <= 20), res.map(x => 'n' + x[0] + '/c' + x[1] + ': ' + x[2] + ' ct').join(', '));
  const P = welch(nz(48, 24, 0), 9600, 16384), bin = SR / 16384, fc = mtof(48), band = (f) => { let e = 0, c = 0; for (let k = Math.round(f / 1.12 / bin); k <= Math.round(f * 1.12 / bin); k++) { e += P[k]; c++; } return pdb(e / c); };   // power per Hz
  const slope = band(4 * fc) - band(8 * fc), lowB = band(fc / 4), atFc = band(fc);
  ok('MK2-05 RESO. 0: Tiefpass ohne Spitze, 11–13 dB/Okt', slope >= 11 && slope <= 13 && atFc <= lowB + 1, 'Abfall ' + M(slope, 2) + ' dB/Okt, bei fc ' + M(atFc - lowB, 2) + ' dB über fc/4');
});
// ---------------- MK2-06 Patches ----------------
const P4 = (ps) => { const p = [{s: 0, d: 0, i: 0}, {s: 2, d: 4, i: 0}, {s: 3, d: 0, i: 0}, {s: 4, d: 5, i: 0}]; ps.forEach((x, k) => { p[k] = x; }); return p; };
T('MK2-06', () => {
  const sq = {l1: {w: 1, f: 50}}, f1 = mtof(57);
  let r = render(mkPatch(merge({o1: {w: 0}, a: {gate: 1}}, sq, {p: P4([{s: 2, d: 0, i: 63}])})), [[0, 'on', 57, .8]], {sec: 1.3, tap: 'mix'});
  const up = 1200 * Math.log2(zcFreq(r.l, 2400, 24000, SR) / f1), dn = 1200 * Math.log2(zcFreq(r.l, 38400, 57600, SR) / f1);
  ok('MK2-06 Tonhöhe +63 mit LFO1 Rechteck: ±24 HT ± 10 ct', Math.abs(up - 2400) <= 10 && Math.abs(dn + 2400) <= 10, M(up, 1) + ' / ' + M(dn, 1) + ' ct');
  const scope = (p) => { const r = render(mkPatch(p), [[0, 'on', 57, .8]], {sec: .6, at: [[0, {mkScope: true}]]}); const s = r.msgs.filter(m => m.mkScope && m.mkScope.voices.length); return Math.max(...s.map(m => m.mkScope.voices[0].cutMax || 0)); };
  const c0 = scope(merge({f: {cut: 0}}, {e2: {a: 0, d: 64, s: 127}})), c1 = scope(merge({f: {cut: 0}}, {e2: {a: 0, d: 64, s: 127}, p: P4([{s: 1, d: 4, i: 63}])}));
  const units = 12 * Math.log2(c1 / c0) / (12 * Math.log2(1000) / 127);
  ok('MK2-06 Cutoff +63 mit EG2: +127 Cutoff-Einheiten am Gipfel (mkScope)', Math.abs(units - 127) <= .5, M(c0, 1) + ' Hz → ' + M(c1, 0) + ' Hz = +' + M(units, 2) + ' Einheiten');
  r = render(mkPatch(merge(OPEN, {l2: {w: 2, f: 40}, p: P4([{s: 3, d: 6, i: 63}])})), [[0, 'on', 57, .8]], {sec: 4});
  const pos = []; for (let s = 2400; s + 960 < r.l.length; s += 960) pos.push(Math.atan2(rms(r.r, s, s + 960), rms(r.l, s, s + 960)) / (Math.PI / 2));
  ok('MK2-06 Pan +63 mit LFO2: voller Weg L ↔ R', Math.min(...pos) <= .03 && Math.max(...pos) >= .97, 'Pan-Lage ' + M(Math.min(...pos), 3) + ' … ' + M(Math.max(...pos), 3));
  // LFO2-Freq +63 with EG1 (sustain 127): at the peak W-08(0 + 127) = 51.2 Hz; with Tempo Sync the same patch is bit-identical off
  r = render(mkPatch({l2: {w: 2, f: 0}, e1: {a: 0, d: 64, s: 127}, p: P4([{s: 0, d: 7, i: 63}])}), [[0, 'on', 57, .8]], {sec: 1.2, tap: 'lfo2'});
  const fl = zcFreq(r.l, 12000, 57600, SR);
  const syn = {l2: {w: 2, f: 0, sync: 1}, e1: {a: 0, d: 64, s: 127}, vib: 40}, ev = [[0, 'on', 57, .8], [.6, 'off', 57]];
  const A = render(mkPatch(merge(syn, {p: P4([{s: 0, d: 7, i: 63}])})), ev, {sec: 1, mw0: 1}), B = render(mkPatch(syn), ev, {sec: 1, mw0: 1});
  let dmax = 0; for (let i = 0; i < A.l.length; i++) dmax = Math.max(dmax, Math.abs(A.l[i] - B.l[i]));
  ok('MK2-06 LFO2-Freq +63 mit EG1: 51,2 Hz am Gipfel ± 5 %; mit LFO2 TEMPO SYNC bitgleich wirkungslos', Math.abs(fl / 51.2 - 1) <= .05 && dmax === 0, M(fl, 2) + ' Hz, Sync max |Δ| ' + dmax);
  // OSZ1-Steuer with keytrack: the pulse width follows the pitch
  const duty = note => { const r = render(mkPatch({o1: {w: 1, c1: 0}, a: {gate: 1}, p: P4([{s: 5, d: 2, i: 63}])}), [[0, 'on', note, .8]], {sec: .5, tap: 'mix'}); let h = 0; for (let i = 4800; i < 24000; i++) if (r.l[i] > 0) h++; return h / 19200; };
  const d60 = duty(60), d84 = duty(84);
  ok('MK2-06 OSZ1-Steuer mit Keytrack: Pulsbreite ändert sich mit der Tonhöhe', Math.abs(d60 - .5) < .03 && d84 < .4, 'C4 ' + M(d60 * 100) + ' %, C6 ' + M(d84 * 100) + ' %');
  // amp with velocity, noise with LFO1, OSC2 pitch with EG1
  const lvAt = vel => db(rms(render(mkPatch(merge(OPEN, {a: {gate: 1, lvl: 64}, p: P4([{s: 4, d: 5, i: 63}])})), [[0, 'on', 57, vel]], {sec: .5}).l, 4800, 24000));
  const nzr = render(mkPatch(merge(OPEN, {mix: {o1: 0, n: 0}, l1: {w: 2, f: 70}, p: P4([{s: 2, d: 3, i: 63}])})), [[0, 'on', 57, .8]], {sec: 2});
  const nzL = []; for (let s = 4800; s + 2400 < 96000; s += 2400) nzL.push(db(rms(nzr.l, s, s + 2400)));
  const o2r = render(mkPatch({mix: {o1: 0, o2: 127}, o2: {w: 0}, e1: {a: 0, d: 80, s: 0}, a: {gate: 1}, p: P4([{s: 0, d: 1, i: 63}])}), [[0, 'on', 57, .8]], {sec: 1.5, tap: 'mix'});
  const fe = zcFreq(o2r.l, 480, 2880, SR), fL = zcFreq(o2r.l, 57600, 72000, SR);
  ok('MK2-06 Amp mit Anschlag, Rauschen mit LFO1, OSZ2-Tonhöhe mit EG1 wirken (W-18)', lvAt(1) - lvAt(.2) >= 6 && Math.max(...nzL) - Math.min(...nzL) >= 10 && 1200 * Math.log2(fe / fL) >= 1200,
    'Amp ' + M(lvAt(1) - lvAt(.2)) + ' dB, Rauschen ' + M(Math.max(...nzL) - Math.min(...nzL)) + ' dB, OSZ 2 ' + M(fe, 0) + ' → ' + M(fL, 1) + ' Hz');
  // intensity 0 = bit-identical to no patch; four patches on one destination add up
  const ev2 = [[0, 'on', 50, .8], [.2, 'on', 62, .5], [.7, 'off', 50]], base = merge(OPEN, {o1: {w: 1, c1: 30, c2: 40}, l1: {w: 2, f: 70}});
  const X = render(mkPatch(merge(base, {p: [{s: 7, d: 6, i: 0}, {s: 1, d: 2, i: 0}, {s: 5, d: 7, i: 0}, {s: 6, d: 0, i: 0}]})), ev2, {sec: .9}), Y = render(mkPatch(base), ev2, {sec: .9});
  let d0 = 0; for (let i = 0; i < X.l.length; i++) d0 = Math.max(d0, Math.abs(X.l[i] - Y.l[i]), Math.abs(X.r[i] - Y.r[i]));
  const fq = p => zcFreq(render(mkPatch(merge({o1: {w: 0}, a: {gate: 1}}, sq, {p})), [[0, 'on', 57, .8]], {sec: .5, tap: 'mix'}).l, 2400, 19200, SR);
  const one = fq(P4([{s: 2, d: 0, i: 40}])), four = fq([{s: 2, d: 0, i: 10}, {s: 2, d: 0, i: 10}, {s: 2, d: 0, i: 10}, {s: 2, d: 0, i: 10}]);
  ok('MK2-06 Intensität 0 = bitgleich zu „kein Patch“; vier Patches auf ein Ziel addieren sich', d0 === 0 && Math.abs(1200 * Math.log2(four / one)) <= .5 && Math.abs(1200 * Math.log2(one / f1) - 40 / 63 * 2400) <= 10,
    'max |Δ| ' + d0 + ', 1 × 40: ' + M(1200 * Math.log2(one / f1), 1) + ' ct, 4 × 10: ' + M(1200 * Math.log2(four / f1), 1) + ' ct');
});
// ---------------- MK2-07 bit-identical ----------------
T('MK2-07', () => {
  const cases = [{o1: {w: 0, c1: 40, c2: 30}, o2: {w: 1, mod: 2, semi: 7}, mix: {o1: 127, o2: 90, n: 30}, f: {type: 0, cut: 80, res: 90, eg: 30, kbd: 24}, a: {dist: 1}, vib: 20},
    {o1: {w: 1, c1: 64}, l1: {w: 1, f: 80}, mix: {o2: 60}, o2: {w: 2, mod: 1, semi: 12}}, {o1: {w: 2, c1: 127}, asg: 2, udet: 40, f: {type: 1, cut: 60, res: 120}},
    {o1: {w: 0}, o2: {mod: 3, semi: 19}, mix: {o2: 127}, f: {type: 3, cut: 50}}, {o1: {w: 1, c2: 90}, l1: {w: 3, ks: 2, sync: 1, note: 4}, l2: {w: 1, ks: 1}, vib: -50, asg: 0, porta: 60, a: {gate: 1, pan: -30}},
    {o1: {w: 2}, f: {type: 2, cut: 70, res: 60, vel: 40, eg: -40}, e1: {a: 40, d: 70, s: 30, r: 50}, e2: {a: 20, r: 60}, a: {vel: 30, kbd: -20}}];
  let worst = 0, n = 0;
  for (const c of cases) for (const note of [33, 60, 88]) {
    const ev = [[0, 'on', note, .8], [.3, 'on', note + 7, .6], [.5, 'on', note - 5, .9], [.8, 'off', note], [1.0, 'off', note + 7], [1.1, 'off', note - 5]];
    const a = render(mkPatch(c), ev, {sec: 1.5, file: FILE, mw0: .5}), b = render(mkPatch(c), ev, {sec: 1.5, file: PREV, mw0: .5});
    for (let i = 0; i < a.l.length; i++) worst = Math.max(worst, Math.abs(a.l[i] - b.l[i]), Math.abs(a.r[i] - b.r[i])); n++;
  }
  // VA and FM6 through the same worklet: unchanged
  for (const eng of [0, 1]) { const ev = [[0, 'on', 60, .8], [.5, 'off', 60]]; const a = render(null, ev, {sec: .8, eng, file: FILE}), b = render(null, ev, {sec: .8, eng, file: PREV}); for (let i = 0; i < a.l.length; i++) worst = Math.max(worst, Math.abs(a.l[i] - b.l[i])); n++; }
  ok('MK2-07 MK1-Klänge (Wellen 0–2, Intensität 0), VA und FM6 bitgleich zum Vorgänger (4.9.0)', worst === 0, n + ' Renders, max |Δ| ' + worst);
});
// ---------------- MK2-09 CPU ----------------
// MK2-09 CPU: v3-mk2-cpu.mjs (each case in its own Node process; in one process the JIT state of earlier cases spreads the times ×2)
// ---------------- FP-DSP (Teil F) ----------------
T('FP-DSP', () => {
  const ex = {o1: {w: 0, c1: 127, c2: 127}, o2: {w: 1, mod: 3, semi: 24, tune: 63}, mix: {o1: 127, o2: 127, n: 127}, f: {type: 0, cut: 127, res: 127, eg: 63, vel: 63, kbd: 63},
    a: {lvl: 127, dist: 1, vel: 63, kbd: 63}, l1: {w: 3, f: 127}, l2: {w: 1, f: 127}, vib: 63, p: [{s: 2, d: 0, i: 63}, {s: 3, d: 4, i: 63}, {s: 7, d: 2, i: 63}, {s: 1, d: 7, i: 63}]};
  let bad = 0, pk = 0;
  for (const w of [3, 4, 5, 6]) {
    const ev = []; for (let t = 0; t < 20; t += 1) for (const nt of [24, 60, 108, 120]) { ev.push([t, 'on', nt, 1]); ev.push([t + .9, 'off', nt]); }
    const r = renderW(mkPatch(merge(ex, {o1: {w, c1: 127, c2: w === 5 ? wv(64) : 127}})), ev, {sec: 20, mw0: 1}, [64]);
    for (let i = 0; i < r.l.length; i++) { if (!isFinite(r.l[i]) || !isFinite(r.r[i])) bad++; pk = Math.max(pk, Math.abs(r.l[i]), Math.abs(r.r[i])); }
  }
  ok('FP-DSP Extremwerte (alle Regler auf Anschlag, Resonanz 127, 4 Patches voll, 20 s je Welle 3–6): kein NaN/Inf', !bad, 'NaN/Inf ' + bad + ', Spitze ' + M(db(pk)) + ' dBFS');
  const r = renderW(mkPatch(merge(OPEN, {o1: {w: 6, c1: 127, c2: 127}})), [[0, 'on', 108, 1]], {sec: 20}, []);
  let b2 = 0, p2 = 0; for (let i = 0; i < r.l.length; i++) { if (!isFinite(r.l[i])) b2++; p2 = Math.max(p2, Math.abs(r.l[i])); }
  ok('FP-DSP Filter-Stabilität W-29 (C1 127, C2 127, C8, 20 s): kein NaN/Inf, Spitze ≤ +6 dBFS', !b2 && db(p2) <= 6, M(db(p2)) + ' dBFS');
  // denormals (as MK1): held note, 1 s full drive, then the mixer to 0 (the ladder's input silent, the voice and the new OSC 1
  // paths stay) for 60 s; window load from its median quantum, the rule on the median window and on 95 % of the windows
  const den = [];
  for (const w of [3, 4, 5, 6]) {
    const rr = renderW(mkPatch({mix: {o1: 127, o2: 127, n: 127}, o2: {semi: 7}, o1: {w, c1: 100, c2: w === 5 ? wv(30) : 120}, f: {cut: 90, res: 100}, a: {dist: 1, gate: 1}}), [[0, 'on', 48, 1]],
      {sec: 61, quantumMs: true, at: [[1, {mkSet: {'t.0.mix.o1': 0, 't.0.mix.o2': 0, 't.0.mix.n': 0}}]]}, [30]);
    // a denormal slowdown makes every quantum slower: the window load = its 25 % quantile quantum x quanta; compared are the
    // first silent seconds (2-11) and the last ones (51-60), medians of the windows (single windows catch other processes)
    const per = Math.round(SR / 128), win = []; for (let s = 2; s < 61; s++) { const q = rr.qms.slice(s * per, (s + 1) * per).sort((a, b) => a - b); win.push(q[q.length >> 2] * per); }
    const md = a => a.slice().sort((x, y) => x - y)[a.length >> 1], first = md(win.slice(0, 10)), last = md(win.slice(-10)), mx = Math.max(...win);
    den.push([w, first, last, mx, last <= 1.1 * first]);
  }
  ok('FP-DSP Denormale: 60 s Stille nach Vollaussteuerung (Wellen 3–6, gehaltene Note, Mixer 0): Last der letzten 10 s ≤ 1,1 × der ersten 10 stillen s', den.every(x => x[4]),
    den.map(([w, f, l, x]) => 'W' + w + ' ' + M(f, 2) + ' → ' + M(l, 2) + ' ms (max ' + M(x, 2) + ')').join('; ') + ' (Node, x86)');
});
console.log(fails ? fails + ' FAIL' : 'alles PASS');
process.exit(fails ? 1 : 0);
