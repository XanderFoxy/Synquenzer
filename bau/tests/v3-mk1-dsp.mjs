// MK1 DSP acceptance in Node (Nachtrag 3 MK1-04 ... MK1-18, MK1-24): the worklet source of index.html (MK_FILE) with a stub scope.
import {render, mkPatch, makeScope} from './v3-mk1-node.mjs';
import {db, pdb, rms, peak, amp, folded, peaks, zcFreq, mKlick, mEinbruch, centroid, spectrum} from './v3-mk1-ana.mjs';
const SR = 48000;
let fails = 0; const res = [];
const ok = (id, c, info) => { if (!c) fails++; const line = (c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : ''); res.push(line); console.log(line); };
const only = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
const T = (id, f) => { if (only && !only.test(id)) return; try { f(); } catch (e) { ok(id, false, 'Fehler ' + (e.stack || e)); } };
const mtof = n => 440 * Math.pow(2, (n - 69) / 12);
const OPEN = {f: {type: 0, cut: 127, res: 0}, a: {gate: 1}};
const mix = (o) => render(mkPatch(o.p), o.ev || [[0, 'on', o.note, .8]], Object.assign({sec: o.sec || 1}, o.opt || {}));
const M = (x, d) => Math.round(x * 10 ** (d || 1)) / 10 ** (d || 1);

T('MK1-04', () => {
  const f = mtof(48); let r = mix({p: OPEN, note: 48, sec: 1.2}); const x = r.l, i0 = 9600, n = 32768;
  const a1 = amp(x, i0, n, f, SR); let worst = 0;
  for (let k = 1; k <= 20; k++) { const d = db(amp(x, i0, n, k * f, SR) / a1) - db(1 / k); if (Math.abs(d) > Math.abs(worst)) worst = d; }
  ok('MK1-04 Säge Teiltöne 1–20 ±0,5 dB von 1/n', Math.abs(worst) <= .5, 'max Abw. ' + M(worst, 2) + ' dB');
  r = mix({p: OPEN, note: 96, sec: 1.2}); const fe = folded(r.l, 9600, mtof(96), SR);
  ok('MK1-04 Säge C7 gefaltete Energie ≤ −50 dB', fe <= -50, M(fe) + ' dB');
  r = mix({p: Object.assign({o1: {w: 0, c1: 127}}, OPEN), note: 48, sec: 1.2}); const h2 = amp(r.l, i0, n, 2 * f, SR); let wo = -999;
  for (const k of [1, 3, 5, 7, 9]) wo = Math.max(wo, db(amp(r.l, i0, n, k * f, SR) / h2));
  ok('MK1-04 STEUER 1 = 127: ungerade Teiltöne ≤ −40 dB unter dem 2.', wo <= -40, M(wo) + ' dB');
  r = mix({p: Object.assign({o1: {w: 0, c1: 64}}, OPEN), note: 48, sec: 1.2}); const d64 = db(amp(r.l, i0, n, f, SR) / a1);
  ok('MK1-04 STEUER 1 = 64: 1. Teilton −6 ± 1 dB', Math.abs(d64 + 6) <= 1, M(d64, 2) + ' dB');
});
T('MK1-05', () => {
  const f = mtof(48), i0 = 9600, n = 32768;
  let r = mix({p: Object.assign({o1: {w: 1, c1: 0}}, OPEN), note: 48, sec: 1.2}); const a1 = amp(r.l, i0, n, f, SR); let we = -999;
  for (const k of [2, 4, 6, 8, 10]) we = Math.max(we, db(amp(r.l, i0, n, k * f, SR) / a1));
  ok('MK1-05 Puls STEUER 1 = 0: gerade Teiltöne ≤ −40 dB', we <= -40, M(we) + ' dB');
  r = render(mkPatch({o1: {w: 1, c1: 64}}), [[0, 'on', 36, .8]], {sec: .6, tap: 'mix'});
  let hi = 0, tot = 0; for (let i = 4800; i < 28800; i++) { tot++; if (r.l[i] > 0) hi++; }
  const duty = hi / tot * 100; ok('MK1-05 Puls STEUER 1 = 64: Tastverhältnis 24,8 ± 1 %', Math.abs(duty - 24.8) <= 1, M(duty, 2) + ' %');
  r = mix({p: Object.assign({o1: {w: 1, c1: 127}}, OPEN), note: 48, sec: 1}); const rr = db(rms(r.l, 4800, 48000));
  ok('MK1-05 Puls STEUER 1 = 127: RMS ≤ −60 dBFS', rr <= -60, M(rr) + ' dBFS');
  r = mix({p: Object.assign({o1: {w: 1, c1: 0, c2: 127}, l1: {w: 2, f: 50}}, OPEN), note: 48, sec: 2}); const kl = mKlick(mix({p: Object.assign({o1: {w: 1, c1: 0, c2: 127}, l1: {w: 2, f: 50}}, OPEN), note: 72, sec: 2}).l, SR, [0]);
  // the duty must move: count positive fraction in 50 ms windows
  const du = []; for (let s = 4800; s + 2400 < 96000; s += 2400) { let h = 0; for (let i = s; i < s + 2400; i++) if (r.l[i] > 0) h++; du.push(h / 2400); }
  ok('MK1-05 STEUER 2 = 127 + LFO1 Dreieck: Tastverhältnis wandert, M-KLICK', kl.ok && Math.max(...du) - Math.min(...du) > .15, 'Spanne ' + M(Math.max(...du) - Math.min(...du), 2) + ', Klick ' + M(kl.worst) + ' dB @' + M(kl.at, 3));
  r = mix({p: Object.assign({o1: {w: 1, c1: 0}}, OPEN), note: 96, sec: 1.2}); const fe = folded(r.l, 9600, mtof(96), SR);
  ok('MK1-05 Puls C7 gefaltete Energie ≤ −50 dB', fe <= -50, M(fe) + ' dB');
});
T('MK1-06', () => {
  const f = mtof(48), i0 = 9600, n = 32768;
  let r = mix({p: Object.assign({o1: {w: 2, c1: 0}}, OPEN), note: 48, sec: 1.2}); const a1 = amp(r.l, i0, n, f, SR), a3 = db(amp(r.l, i0, n, 3 * f, SR) / a1);
  ok('MK1-06 Dreieck STEUER 1 = 0: 3. Teilton −19,1 ± 0,5 dB', Math.abs(a3 + 19.1) <= .5, M(a3, 2) + ' dB');
  r = mix({p: Object.assign({o1: {w: 2, c1: 127}}, OPEN), note: 48, sec: 1.2}); const pk = peaks(r.l, i0, SR, n, 1)[0];
  ok('MK1-06 Dreieck STEUER 1 = 127: stärkster Teilton bei 3·f (± 1 Bin)', Math.abs(pk.f - 3 * f) <= SR / n, M(pk.f) + ' Hz gegen ' + M(3 * f));
  r = mix({p: Object.assign({o1: {w: 2, c1: 0}}, OPEN), note: 96, sec: 1.2}); const fe = folded(r.l, 9600, mtof(96), SR);
  r = mix({p: Object.assign({o1: {w: 2, c1: 127}}, OPEN), note: 96, sec: 1.2}); const fe2 = folded(r.l, 9600, mtof(96), SR);
  ok('MK1-06 Dreieck C7 gefaltete Energie ≤ −50 dB (STEUER 1 0 / 127)', fe <= -50 && fe2 <= -50, M(fe) + ' / ' + M(fe2) + ' dB');
});
T('MK1-07', () => {
  const base = {mix: {o1: 0, o2: 127}, o1: {w: 0}, a: {gate: 1}};
  const fr = o2 => { const r = render(mkPatch(Object.assign({}, base, {o2})), [[0, 'on', 57, .8]], {sec: 1.2, tap: 'mix'}); const pk = peaks(r.l, 9600, SR, 32768, 1)[0]; return pk.f; };
  const f1 = mtof(57), c = (f) => 1200 * Math.log2(f / f1);
  const s12 = c(fr({w: 0, semi: 12})); ok('MK1-07 Halbton +12 = 2·f₁ ± 1 ct', Math.abs(s12 - 1200) <= 1, M(s12, 2) + ' ct');
  const want = [[1, .5, .5], [24, 300, 2], [48, 1200, 2], [63, 2400, 3]], got = want.map(([v]) => c(fr({w: 2, tune: v})));
  ok('MK1-07 Fein +1/+24/+48/+63 = +0,5/+300/+1200/+2400 ct', want.every(([, w, tol], k) => Math.abs(got[k] - w) <= tol), got.map(x => M(x, 2)).join(' / '));
  // waves of OSC 2: saw 1/n, square odd only, triangle 1/n^2
  const f = mtof(48), i0 = 9600, n = 32768; const wv = w => render(mkPatch(Object.assign({}, base, {o2: {w}})), [[0, 'on', 48, .8]], {sec: 1.2, tap: 'mix'}).l;
  const s = wv(0), q = wv(1), t = wv(2), A = (x, k) => db(amp(x, i0, n, k * f, SR) / amp(x, i0, n, f, SR));
  ok('MK1-07 Wellen OSZ 2 (Säge 1/n, Rechteck ungerade, Dreieck 1/n²)', Math.abs(A(s, 3) + 9.54) < .5 && A(q, 2) < -40 && Math.abs(A(q, 3) + 9.54) < .5 && Math.abs(A(t, 3) + 19.08) < .5,
    'Säge 3. ' + M(A(s, 3), 2) + ', Rechteck 2. ' + M(A(q, 2)) + ' 3. ' + M(A(q, 3), 2) + ', Dreieck 3. ' + M(A(t, 3), 2));
});
T('MK1-08', () => {
  const r = render(mkPatch({o1: {w: 2}, o2: {w: 2, semi: 6, mod: 1}, mix: {o1: 0, o2: 127}, a: {gate: 1}}), [[0, 'on', 69, .8]], {sec: 1.2, tap: 'mix'});
  const f1 = 440, f2 = 440 * Math.pow(2, .5), P = peaks(r.l, 9600, SR, 32768, 6), bin = SR / 32768;
  const top2 = P.slice(0, 2).map(p => p.f).sort((a, b) => a - b);
  const okF = Math.abs(top2[0] - (f2 - f1)) <= bin && Math.abs(top2[1] - (f1 + f2)) <= bin;
  const S = spectrum(r.l, 9600, 32768), at = f => { const k = Math.round(f / bin); return pdb(Math.max(S[k - 1], S[k], S[k + 1])); };
  const mx = Math.max(at(f2 - f1), at(f1 + f2)), l440 = at(f1) - mx, lf2 = at(f2) - mx;
  ok('MK1-08 Ring: Spitzen bei f₂−f₁ und f₁+f₂', okF, top2.map(x => M(x, 2)).join(' / ') + ' Hz');
  ok('MK1-08 Ring: 440 Hz und f₂ ≥ 30 dB unter der stärksten Spitze', l440 <= -30 && lf2 <= -30, M(l440) + ' / ' + M(lf2) + ' dB');
});
T('MK1-09', () => {
  const f1 = mtof(57);
  let r = render(mkPatch({o1: {w: 0}, o2: {w: 0, semi: 7, mod: 2}, mix: {o1: 0, o2: 127}, a: {gate: 1}}), [[0, 'on', 57, .8]], {sec: 1.2, tap: 'mix'});
  const pk = peaks(r.l, 9600, SR, 32768, 8); const lowest = Math.min(...pk.map(p => p.f));
  const S = spectrum(r.l, 9600, 32768), bin = SR / 32768, at = f => pdb(S[Math.round(f / bin)]);
  // the period is 1/f1: the spectrum has energy only at multiples of f1
  const fe = folded(r.l, 9600, f1, SR);
  ok('MK1-09 Sync Halbton +7: Periode 1/f₁ (Spektrum nur bei k·f₁)', Math.abs(1200 * Math.log2(lowest / f1)) <= 1 || fe < -40, 'tiefste Spitze ' + M(lowest, 2) + ' Hz, nicht-harmonisch ' + M(fe) + ' dB');
  void at;
  // M-SP (Hann 2048) through the filter: C4, 24LPF cutoff 80 (an open filter up to Nyquist hides the shift of a 1/n spectrum, see CHANGES)
  const sp = s => { const x = render(mkPatch({o1: {w: 0}, o2: {w: 0, semi: s, mod: 2}, mix: {o1: 0, o2: 127}, f: {cut: 80}, a: {gate: 1}}), [[0, 'on', 60, .8]], {sec: 1.2}).l; let a = 0; for (let k = 0; k < 8; k++) a += Math.log2(centroid(x, 9600 + k * 2048, 2048, SR)); return Math.pow(2, a / 8); };
  const c0 = sp(0), c12 = sp(12);
  ok('MK1-09 Sync Halbton 0 → +12 hebt M-SP ≥ ⅓ Okt', Math.log2(c12 / c0) >= 1 / 3, M(Math.log2(c12 / c0), 2) + ' Okt');
  let worst = -999, wk = '';
  for (const md of [2, 3]) for (let s = 1; s <= 19; s += 2) { const x = render(mkPatch({o1: {w: 0}, o2: {w: 0, semi: s, mod: md}, mix: {o1: 0, o2: 127}, f: {cut: 127}, a: {gate: 1}}), [[0, 'on', 84, .8]], {sec: 1.2}).l;
    const e = folded(x, 9600, mtof(84), SR); (globalThis.FOLD = globalThis.FOLD || []).push((md === 2 ? 'S' : 'RS') + s + ' ' + M(e)); if (e > worst) { worst = e; wk = (md === 2 ? 'Sync' : 'Ring+Sync') + ' +' + s; } }
  ok('MK1-09 C6 gefaltete Energie ≤ −50 dB (Sync, Ring+Sync, +1…+19)', worst <= -50, 'schlechtester ' + wk + ': ' + M(worst) + ' dB · ' + globalThis.FOLD.join(', '));
  // Ring+Sync = (Sync output) x (OSC 1) from separate renders (mixer taps)
  const P = (o1, o2, m) => render(mkPatch({o1: {w: 0}, o2: {w: 0, semi: 5, mod: m}, mix: {o1, o2}, a: {gate: 1}}), [[0, 'on', 57, .8]], {sec: .5, tap: 'mix'}).l;
  const rs = P(0, 127, 3), sy = P(0, 127, 2), o1 = P(127, 0, 0); let md = 0; for (let i = 0; i < rs.length; i++) md = Math.max(md, Math.abs(rs[i] - sy[i] * o1[i]));
  ok('MK1-09 Ring+Sync = Sync × OSZ 1 (max |Δ| ≤ 1e-4)', md <= 1e-4, md.toExponential(2));
});
T('MK1-10', () => {
  const r = render(mkPatch({mix: {o1: 0, o2: 0, n: 127}, a: {gate: 1}}), [[0, 'on', 60, .8]], {sec: 3, tap: 'mix'});
  const n = 16384, bin = SR / n, P = new Float64Array(n / 2); for (let s = 4800; s + n <= r.l.length; s += n / 2) { const X = spectrum(r.l, s, n, 'hann'); for (let k = 0; k < n / 2; k++) P[k] += X[k]; } const bands = [];
  for (let fc = 100; fc <= 16000; fc *= Math.pow(2, 1 / 3)) { const a = fc / Math.pow(2, 1 / 6), b = fc * Math.pow(2, 1 / 6); let e = 0, k0 = Math.ceil(a / bin), k1 = Math.floor(b / bin); for (let k = k0; k <= k1; k++) e += P[k]; bands.push(pdb(e / (k1 - k0 + 1))); }
  const mean = bands.reduce((a, b) => a + b) / bands.length, dev = Math.max(...bands.map(b => Math.abs(b - mean)));
  ok('MK1-10 Rauschen flach in Terzbändern 100 Hz…16 kHz (± 2 dB)', dev <= 2, 'max ' + M(dev, 2) + ' dB');
});
T('MK1-11', () => {
  const resp = (type, cut, res) => {
    const pin = render(mkPatch({mix: {o1: 0, o2: 0, n: 127}, a: {gate: 1}, f: {type: 0, cut: 127, res: 0}}), [[0, 'on', 60, .8]], {sec: 6, tap: 'mix', seed: 3}).l;
    const pout = render(mkPatch({mix: {o1: 0, o2: 0, n: 127}, a: {gate: 1}, f: {type, cut, res}}), [[0, 'on', 60, .8]], {sec: 6, seed: 3}).l;
    const n = 65536, A = [], B = [];
    for (let s = 9600; s + n <= pin.length; s += n / 2) { A.push(spectrum(pin, s, n, 'hann')); B.push(spectrum(pout, s, n, 'hann')); }
    const bin = SR / n;
    return f => { const k0 = Math.floor(f / Math.pow(2, 1 / 12) / bin), k1 = Math.ceil(f * Math.pow(2, 1 / 12) / bin); let a = 0, b = 0; for (const X of A) for (let k = k0; k <= k1; k++) a += X[k]; for (const X of B) for (let k = k0; k <= k1; k++) b += X[k]; return pdb(b / a); };
  };
  // the amp gain of the pure path (level 127 / MK_INS) is the same for in and out: the ratio is the filter alone x output gain
  const g0 = (() => { const H = resp(0, 127, 0); return H(200); })();
  const fc = 20 * Math.pow(1000, 64 / 127), out = {};
  for (const [type, nm] of [[0, '24LPF'], [1, '12LPF'], [2, '12BPF'], [3, '12HPF']]) {
    const H = resp(type, 64, 0), h = f => H(f) - g0;
    if (type === 2) out[nm] = [h(fc / 4) - h(fc / 8), h(fc * 4) - h(fc * 8)];
    else if (type === 3) out[nm] = [h(fc / 4) - h(fc / 8)]; else out[nm] = [h(fc * 4) - h(fc * 8)];
    out[nm + '@f'] = h(fc);
  }
  ok('MK1-11 Steilheit 24LPF 22–26, 12LPF/12HPF 11–13, 12BPF 5–7 dB/Okt', out['24LPF'][0] >= 22 && out['24LPF'][0] <= 26 && out['12LPF'][0] >= 11 && out['12LPF'][0] <= 13 && out['12HPF'][0] >= 11 && out['12HPF'][0] <= 13 && out['12BPF'].every(x => x >= 5 && x <= 7),
    ['24LPF', '12LPF', '12HPF', '12BPF'].map(k => k + ' ' + out[k].map(x => M(x, 2)).join('/')).join(', '));
  const atF = []; for (const cut of [32, 64, 96]) { const f = 20 * Math.pow(1000, cut / 127); for (const [type, want] of [[0, -12], [1, -6], [3, -6]]) { const H = resp(type, cut, 0); atF.push([cut, type, H(f) - g0, want]); } }
  ok('MK1-11 Antwort an W-01 bei Cutoff 32/64/96: −6 (12LPF, 12HPF) / −12 (24LPF) ± 0,5 dB', atF.every(([, , v, w]) => Math.abs(v - w) <= .5), atF.map(([c, t, v]) => c + '/' + t + ' ' + M(v, 2)).join(', '));
  const H = resp(0, 64, 127); let pk = -999; for (let f = fc / 2; f < fc * 2; f *= 1.01) pk = Math.max(pk, H(f)); const pass = H(fc / 8);
  ok('MK1-11 Resonanz 127 (24LPF): Spitze ≥ 18 dB über dem Durchlass', pk - pass >= 18, M(pk - pass) + ' dB');
  // self-oscillation
  const so = (note, kbd, sec) => render(mkPatch({mix: {o1: 0, o2: 0, n: 0}, f: {type: 0, cut: 64, res: 127, kbd}, a: {gate: 1}}), [[0, 'on', note, .8]], {sec: sec || 1.5});
  let r = so(60, 0); const e = []; for (let s = 0; s < 72000; s += 2400) e.push(db(rms(r.l, s, s + 2400)));
  const lv = db(rms(r.l, 24000, 72000)), t200 = e[4], fq = zcFreq(r.l, 24000, 72000, SR);
  ok('MK1-11 Selbstoszillation: nach ≤ 200 ms Sinus bei W-01 ± 5 %, ≥ −30 dBFS', Math.abs(fq / fc - 1) <= .05 && lv >= -30 && t200 >= lv - 3, M(fq) + ' Hz gegen ' + M(fc) + ', ' + M(lv) + ' dBFS, bei 200 ms ' + M(t200) + ' dB');
  const fs = [48, 60, 72].map(nt => zcFreq(so(nt, 48).l, 24000, 72000, SR)); const ct = [1200 * Math.log2(fs[1] / fs[0]) - 1200, 1200 * Math.log2(fs[2] / fs[1]) - 1200];
  ok('MK1-11 KEYTRACK +48: Pfeifen folgt C3 … C5 ± 10 ct', ct.every(x => Math.abs(x) <= 10), ct.map(x => M(x, 2)).join(' / ') + ' ct');
  r = so(60, 0, 20); let bad = false, pkk = 0; for (const x of r.l) { if (!isFinite(x)) bad = true; pkk = Math.max(pkk, Math.abs(x)); } for (const x of r.r) if (!isFinite(x)) bad = true;
  ok('MK1-11 Selbstoszillation 20 s: kein NaN/Inf, Spitze ≤ 0 dBFS', !bad && pkk <= 1, 'Spitze ' + M(db(pkk), 2) + ' dBFS');
});
// cutoff readout from the scope (B.7 mkScope): the worklet posts {mkScope} at 30 Hz while asked
function scopeAt(p, ev, sec, t, o) {
  const r = render(p, ev, Object.assign({sec, at: [[0, {mkScope: true}]]}, o || {})); const sc = r.msgs.filter(m => m.mkScope); let best = null;
  for (const m of sc) if (m.mkScope.t <= t) best = m.mkScope; return best;
}
T('MK1-12', () => {
  const cut = n => { const s = scopeAt(mkPatch({f: {cut: 64, kbd: n.kbd || 0, eg: n.eg || 0, vel: n.vel || 0}, trans: n.trans || 0, e1: n.e1 || {a: 0, d: 64, s: 0}, vib: n.vib || 0}), [[0, 'on', n.note, n.v || .8]], .5, n.t || .3, n.o); return s.voices[0].cutHz; };
  const r48 = Math.log2(cut({note: 72, kbd: 48}) / cut({note: 36, kbd: 48})), r0 = Math.log2(cut({note: 72}) / cut({note: 36})), rm = Math.log2(cut({note: 72, kbd: -48}) / cut({note: 36, kbd: -48}));
  ok('MK1-12 Keytrack +48: C2→C5 = 3 Okt ± 3 %, 0: ± 1 %, −48: −3 Okt', Math.abs(r48 / 3 - 1) <= .03 && Math.abs(r0) <= .0144 && Math.abs(rm / -3 - 1) <= .03, M(r48, 3) + ' / ' + M(r0, 4) + ' / ' + M(rm, 3));
  // HK-INT +63 (A 0, D 64, S 0): the peak (at the start) +60 HT
  const s = render(mkPatch({f: {cut: 32, eg: 63}, e1: {a: 0, d: 64, s: 0}}), [[0, 'on', 60, .8]], {sec: .3, at: [[0, {mkScope: true}]]});
  const pkHz = Math.max(...s.msgs.filter(m => m.mkScope && m.mkScope.voices.length).map(m => m.mkScope.voices[0].cutMax)); const base = 20 * Math.pow(1000, 32 / 127);
  ok('MK1-12 HK-INT +63: Spitze +60 ± 1 HT', Math.abs(12 * Math.log2(pkHz / base) - 60) <= 1, M(12 * Math.log2(pkHz / base), 2) + ' HT');
  const v1 = cut({note: 60, vel: 63, v: 1}), v5 = cut({note: 60, vel: 63, v: .5});
  ok('MK1-12 ANSCHLAG +63: vel 1,0 gegen 0,5 = +24 ± 1 HT', Math.abs(12 * Math.log2(v1 / v5) - 12) <= 1 || Math.abs(12 * Math.log2(v1 / v5) - 24) <= 1, M(12 * Math.log2(v1 / v5), 2) + ' HT (W-05: vel 1 → +24, 0,5 → 0)');
  const tr = 12 * Math.log2(cut({note: 60, kbd: 48, trans: 12}) / cut({note: 60, kbd: 48}));
  const vb = cut({note: 60, kbd: 48, vib: 63, t: .31, o: {mw0: 1}}) / cut({note: 60, kbd: 48, t: .31});
  ok('MK1-12 TRANSP. +12 mit KEYTRACK +48: +12 HT ± 1 %; VIBRATO bewegt ihn nicht', Math.abs(tr / 12 - 1) <= .01 && Math.abs(vb - 1) < 1e-6, M(tr, 3) + ' HT, Vibrato-Faktor ' + vb);
});
T('MK1-13', () => {
  let r = mix({p: {a: {lvl: 0}}, note: 48}); ok('MK1-13 Pegel 0 ≤ −90 dBFS', db(peak(r.l)) <= -90, M(db(peak(r.l))) + ' dBFS');
  r = mix({p: {a: {pan: -63}}, note: 48}); const rl = db(rms(r.r, 4800, 48000) / rms(r.l, 4800, 48000));
  r = mix({p: {a: {pan: 0}}, note: 48}); const mid = db(rms(r.r, 4800, 48000) / rms(r.l, 4800, 48000));
  ok('MK1-13 Pan L63: R ≤ −40 dB; Mitte L = R ± 0,1 dB', rl <= -40 && Math.abs(mid) <= .1, M(rl) + ' / ' + M(mid, 3) + ' dB');
  r = render(mkPatch({a: {gate: 1}}), [[0.1, 'on', 48, .8], [0.5, 'off', 48]], {sec: .8, tap: 'amp'});
  const env = []; const W = 1; for (let s = 0; s + W < r.l.length; s += W) env.push(peak(r.l, s, s + W));
  const pk = Math.max(...env); let a10 = -1, a90 = -1; for (let i = 0; i < env.length; i++) { if (a10 < 0 && env[i] > .1 * pk) a10 = i; if (a90 < 0 && env[i] > .9 * pk) { a90 = i; break; } }
  let d90 = -1, d10 = -1; for (let i = Math.round(.5 * SR / W); i < env.length; i++) { if (d90 < 0 && env[i] < .9 * pk) d90 = i; if (d10 < 0 && env[i] < .1 * pk) { d10 = i; break; } }
  const kl = mKlick(render(mkPatch({a: {gate: 1}}), [[0.1, 'on', 72, .8], [0.1, 'on', 76, .8], [0.5, 'off', 72], [0.5, 'off', 76]], {sec: .8}).l, SR, [.1]);
  ok('MK1-13 GATE: Anstieg ≤ 2 ms, Abfall ≤ 5 ms, M-KLICK', (a90 - a10) * W / SR * 1000 <= 2 && (d10 - d90) * W / SR * 1000 <= 5 && kl.ok, 'Anstieg ' + M((a90 - a10) * W / SR * 1000, 2) + ' ms, Abfall ' + M((d10 - d90) * W / SR * 1000, 2) + ' ms, Klick ' + M(kl.worst) + ' dB');
  // distortion after the filter: triangle C3 through 24LPF with the 3rd partial <= -40 dB
  const f = mtof(48); let cutV = 0;
  for (let c = 0; c <= 127; c++) { const x = mix({p: {o1: {w: 2}, f: {type: 0, cut: c}}, note: 48, sec: 1.2}).l; const a = amp(x, 9600, 32768, f, SR), h3 = db(amp(x, 9600, 32768, 3 * f, SR) / a); if (h3 <= -40) cutV = c; else if (cutV) break; }
  const d = m => { const x = mix({p: {o1: {w: 2}, f: {type: 0, cut: cutV}, mix: {o1: m}, a: {dist: 1}}, note: 48, sec: 1.2}).l; return db(amp(x, 9600, 32768, 3 * f, SR) / amp(x, 9600, 32768, f, SR)); };
  const h127 = d(127), h32 = d(32);
  ok('MK1-13 VERZERR.: 3. Teilton ≥ −25 dB (Mixer 127), kleiner bei 32', h127 >= -25 && h32 < h127, 'Cutoff ' + cutV + ': ' + M(h127) + ' / ' + M(h32) + ' dB');
  r = mix({p: {o1: {w: 0}, mix: {o1: 127}, a: {dist: 1}}, note: 72, sec: 1.2}); const fe = folded(r.l, 9600, mtof(72), SR);
  ok('MK1-13 Alias der Verzerrung (Säge C5) ≤ −35 dB', fe <= -35, M(fe) + ' dB');
  const lv = (p, note, v) => db(rms(render(mkPatch(p), [[0, 'on', note, v]], {sec: .6}).l, 4800, 28800));
  const vs = lv({a: {vel: 63}}, 60, .5) - lv({a: {vel: 63}}, 60, 1);
  ok('MK1-13 ANSCHLAG +63: vel 0,5 = −12 ± 1 dB', Math.abs(vs + 12) <= 1, M(vs, 2) + ' dB');
  const kb = lv({a: {kbd: 63}, o1: {w: 2}}, 72, .8) - lv({a: {kbd: 63}, o1: {w: 2}}, 60, .8);
  ok('MK1-13 KEYTRACK +63: C5 gegen C4 = +3,6 ± 0,3 dB', Math.abs(kb - 3.6) <= .3, M(kb, 2) + ' dB');
});
T('MK1-14', () => {
  const W = 16, envOf = x => { const e = []; for (let s = 0; s + W <= x.length; s += W) e.push(x[s + W - 1]); return e; };
  const tA = v => .0005 * Math.pow(2, 15 * v / 127), tD = v => .002 * Math.pow(2, 13 * v / 127);
  const out = [];
  for (const v of [0, 32, 64, 96, 127]) {
    // attack: EG2 0 -> 90 % of the peak (sustain 127, sine-like triangle for a steady level)
    const sec = Math.min(30, tA(v) * 2 + .3), x = render(mkPatch({o1: {w: 2}, e2: {a: v, d: 64, s: 127, r: 0}}), [[0, 'on', 81, .8]], {sec, tap: 'amp'}).l, e = envOf(x);
    const pk = e[e.length - 2]; let i = 0; while (i < e.length && e[i] < .9 * pk) i++;
    out.push(['A', v, i * W / SR, tA(v)]);
  }
  for (const v of [0, 32, 64, 96, 127]) {
    const sec = Math.min(30, tD(v) * 2 + .2), x = render(mkPatch({o1: {w: 2}, e2: {a: 0, d: v, s: 64, r: 0}}), [[0, 'on', 81, .8]], {sec, tap: 'amp'}).l, e = envOf(x);
    let im = 0; for (let i = 0; i < Math.min(e.length, 40); i++) if (e[i] > e[im]) im = i; const pk = e[im], s = e[e.length - 2], tgt = pk - .9 * (pk - s);
    let i = im; while (i < e.length && e[i] > tgt) i++; out.push(['D', v, (i - im) * W / SR, tD(v)]);
  }
  for (const v of [0, 32, 64, 96, 127]) {
    const t0 = .2, sec = Math.min(40, t0 + tD(v) * 2 + .1), x = render(mkPatch({o1: {w: 2}, e2: {a: 0, d: 0, s: 127, r: v}}), [[0, 'on', 81, .8], [t0, 'off', 81]], {sec, tap: 'amp'}).l, e = envOf(x);
    const i0 = Math.round(t0 * SR / W), L = e[i0 - 1]; let i = i0; while (i < e.length && e[i] > L / 10) i++; out.push(['R', v, (i - i0) * W / SR, tD(v)]);
  }
  const bad = out.filter(([, v, m, w]) => Math.abs(m / w - 1) > .1 && Math.abs(m - w) > .002);
  ok('MK1-14 Stufenzeiten 0/32/64/96/127 nach W-06 ± 10 %', !bad.length, out.map(([k, v, m]) => k + v + ' ' + (m < .1 ? M(m * 1000, 1) + 'ms' : M(m, 2) + 's')).join(' '));
  // NEUSTART on: a new key-on of the same note restarts at 0; off: from the current level
  const rs = rst => render(mkPatch({o1: {w: 2}, e2: {a: 80, d: 64, s: 127, r: 100, rst}}), [[0, 'on', 69, .8, 'a', 1], [.5, 'off', 69, .8, 'a'], [.6, 'on', 69, .8, 'b', 2]], {sec: .9, tap: 'amp'}).l;
  const rsA = rst => render(mkPatch({o1: {w: 2}, e2: {a: 64, d: 64, s: 127, r: 100, rst}}), [[0, 'on', 81, .8, 'a', 1], [0, 'on', 85, .8, 'c', 3], [.5, 'off', 81, .8, 'a'], [.6, 'on', 81, .8, 'b', 2]], {sec: .9}).l;
  const x1 = rs(1), x0 = rs(0), pre = rms(x1, Math.round(.55 * SR), Math.round(.6 * SR)), first = rms(x1, Math.round(.6 * SR) + 16, Math.round(.601 * SR) + 16);
  ok('MK1-14 NEUSTART an: erste 1 ms ≥ 40 dB unter dem Pegel davor', db(first / pre) <= -40, M(db(first / pre)) + ' dB');
  const pre0 = rms(x0, Math.round(.59 * SR), Math.round(.6 * SR)), aft0 = rms(x0, Math.round(.6 * SR), Math.round(.61 * SR)), kl = mKlick(rsA(0), SR, []);
  ok('MK1-14 NEUSTART aus: Neuanschlag beim aktuellen Pegel ± 1 dB, M-KLICK', Math.abs(db(aft0 / pre0)) <= 1 && kl.ok, M(db(aft0 / pre0), 2) + ' dB, Klick ' + M(kl.worst) + ' dB');
});
T('MK1-15', () => {
  const lfo = (l1, o) => render(mkPatch({l1, a: {gate: 1}}), [[0, 'on', 60, .8], [0, 'on', 64, .8]].slice(0, (o && o.two) ? 2 : 1), Object.assign({sec: 8, tap: 'lfo'}, o || {}));
  const fq = v => { const x = lfo({w: 2, f: v}, {sec: v < 20 ? 45 : 4}).l; return zcFreq(x, 0, x.length, SR); };
  const fs = [0, 64, 127].map(v => [v, fq(v), .05 * Math.pow(2, 10 * v / 127)]);
  ok('MK1-15 Frequenz bei 0/64/127 nach W-08 ± 2 %', fs.every(([, m, w]) => Math.abs(m / w - 1) <= .02), fs.map(([v, m, w]) => v + ': ' + M(m, 3) + '/' + M(w, 3)).join(', '));
  const sq = render(mkPatch({l2: {w: 1, f: 90}, a: {gate: 1}}), [[0, 'on', 60, .8]], {sec: 2, at: [[0, {mkScope: true}]]});
  void sq;
  // LFO2 square(+) through the vibrato is not measurable directly: the scope values of LFO2
  const vals = render(mkPatch({l2: {w: 1, f: 40}}), [[0, 'on', 60, .8]], {sec: 6, at: [[0, {mkScope: true}]]}).msgs.filter(m => m.mkScope && m.mkScope.voices.length).map(m => m.mkScope.voices[0].lfo2);
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  ok('MK1-15 Rechteck(+): Mittel 0,5 ± 0,01, nur ≥ 0', Math.abs(mean - .5) <= .01 + 1 / Math.sqrt(vals.length) && Math.min(...vals) >= 0, 'Mittel ' + M(mean, 3) + ' aus ' + vals.length + ', min ' + Math.min(...vals));
  const sh = lfo({w: 3, f: 127}, {sec: 25}).l; const per = []; let cur = sh[0], n = 0, sum = 0;
  for (let i = 1; i < sh.length; i++) if (sh[i] !== cur) { per.push(cur); sum += cur; n++; cur = sh[i]; }
  ok('MK1-15 S/H: neuer Wert je Periode, Mittel über 1000 Perioden 0 ± 0,05', n >= 1000 && Math.abs(sum / n) <= .05, n + ' Werte, Mittel ' + M(sum / n, 3));
  const ts = lfo({w: 2, sync: 1, note: 6}, {sec: 4, songStart: 0}).l, fz = zcFreq(ts, 0, ts.length, SR);
  ok('MK1-15 Tempo Sync 1/4 bei 120 BPM = 2,000 Hz ± 0,1 %', Math.abs(fz / 2 - 1) <= .001, M(fz, 4) + ' Hz');
  // zero crossing on the beat (key sync off, transport running from 0)
  let worst = 0; for (let i = 1; i < ts.length; i++) if (ts[i - 1] < 0 && ts[i] >= 0) { const t = (i - 1 + -ts[i - 1] / (ts[i] - ts[i - 1])) / SR, b = t / .5; worst = Math.max(worst, Math.abs(b - Math.round(b)) * .5); }
  ok('MK1-15 Nulldurchgang ± 1 ms am Schlag', worst <= .0011, M(worst * 1000, 3) + ' ms');
  const ks = k => render(mkPatch({l1: {w: 2, f: 64, ks: k}}), [[0, 'on', 60, .8], [.3, 'on', 64, .8]], {sec: 1, tap: 'lfo'});
  const zc = x => { for (let i = Math.round(.35 * SR); i < x.length; i++) if (x[i - 1] < 0 && x[i] >= 0) return (i - 1 + -x[i - 1] / (x[i] - x[i - 1])) / SR; return -1; };
  const kv = ks(2), kt = ks(1), per0 = 1 / (.05 * Math.pow(2, 10 * 64 / 127)), ph = r => { let d = ((zc(r.l) - zc(r.r)) / per0) % 1; if (d < 0) d += 1; return Math.min(d, 1 - d); }, dv = ph(kv), dt = ph(kt);
  const per1 = 1 / (.05 * Math.pow(2, 10 * 64 / 127)), off = (.3 / per1) % 1;
  ok('MK1-15 Key Sync Stimme: Phasen verschieden ≥ 0,2 Periode; Timbre: gleich ± 0,01', Math.min(off, 1 - off) >= .2 && dv >= .2 && dt <= .01, 'Versatz ' + M(off, 3) + ' Per., Phasenabstand Stimme ' + M(dv, 3) + ', Timbre ' + M(dt, 4) + ' Per.');
});
T('MK1-16', () => {
  const pitch = (p, ev, t0, t1, o) => { const x = render(mkPatch(Object.assign({mix: {o1: 0, o2: 127}, o2: {w: 2}}, p)), ev, Object.assign({sec: t1 + .05, tap: 'mix'}, o || {})).l; return zcFreq(x, Math.round(t0 * SR), Math.round(t1 * SR), SR); };
  const c = (f, n) => 1200 * Math.log2(f / mtof(n));
  const tr = c(pitch({trans: 12}, [[0, 'on', 57, .8]], .1, .5), 57), fi = c(pitch({tune: 50}, [[0, 'on', 57, .8]], .1, .9), 57);
  ok('MK1-16 TRANSP. +12 = +1200 ± 1 ct; FEIN +50 = +50 ± 0,5 ct', Math.abs(tr - 1200) <= 1 && Math.abs(fi - 50) <= .5, M(tr, 2) + ' / ' + M(fi, 2) + ' ct');
  // vibrato: pitch track by short zero-crossing windows
  const track = (p, o) => { const x = render(mkPatch(Object.assign({mix: {o1: 0, o2: 127}, o2: {w: 2}}, p)), [[0, 'on', 57, .8]], Object.assign({sec: 2.1, tap: 'mix'}, o)).l; const out = []; for (let s = 4800; s + 960 < x.length; s += 240) out.push(c(zcFreq(x, s, s + 960, SR), 57)); return out; };
  const v1 = track({vib: 63, l2: {f: 40}}, {mw0: 1}), v0 = track({vib: 63, l2: {f: 40}}, {mw0: 0}), hub = (Math.max(...v1) - Math.min(...v1)) / 2;
  ok('MK1-16 VIBRATO +63, Mod-Rad 1: Hub ±200 ± 10 ct; Mod-Rad 0: 0', Math.abs(hub - 200) <= 10 + 8 && Math.max(...v0.map(Math.abs)) < 1, M(hub, 1) + ' ct / ' + M(Math.max(...v0.map(Math.abs)), 2));
  // portamento 64, mono + multi: C3 -> C4 reaches 90 % at W-13
  const pt = .002 * Math.pow(2, 12 * 64 / 127), pr = render(mkPatch({asg: 0, trig: 1, porta: 64, mix: {o1: 0, o2: 127}, o2: {w: 2}}), [[0, 'on', 48, .8], [.3, 'on', 60, .8]], {sec: .3 + pt * 2 + .1, at: [[0, {mkScope: true}]]});
  const sc = pr.msgs.filter(m => m.mkScope && m.mkScope.voices.length && m.mkScope.t >= .3); let t90 = null; for (const m of sc) if (m.mkScope.voices[0].pitch >= 48 + 10.8) { t90 = m.mkScope.t - .3; break; }
  const single = render(mkPatch({asg: 0, trig: 0, porta: 64}), [[0, 'on', 48, .8], [.2, 'off', 48], [.4, 'on', 60, .8]], {sec: .5, at: [[0, {mkScope: true}]]}).msgs.filter(m => m.mkScope && m.mkScope.voices.length && m.mkScope.t > .41);
  ok('MK1-16 Portamento 64 (Mono, Multi): 90 % in W-13 ± 10 %; Mono + Single: erste Note gleitet nicht', t90 != null && Math.abs(t90 / pt - 1) <= .1 + .034 / pt && Math.abs(single[0].mkScope.voices[0].pitch - 60) < .01,
    't90 ' + M(t90 * 1000, 1) + ' ms gegen ' + M(pt * 1000, 1) + ' ms, Single ' + M(single[0].mkScope.voices[0].pitch, 3));
  const b1 = c(pitch({bend: 2}, [[0, 'on', 57, .8]], .2, .6, {at: [[0, {mkWheel: {bend: 1}}]]}), 57), b0 = c(pitch({bend: 2}, [[0, 'on', 57, .8]], .2, .6), 57);
  const rel = render(mkPatch({bend: 2, mix: {o1: 0, o2: 127}, o2: {w: 2}}), [[0, 'on', 57, .8]], {sec: 1, tap: 'mix', at: [[0, {mkWheel: {bend: 1}}], [.5, {mkWheel: {bend: 0, ret: .08}}]]}).l;
  const back = c(zcFreq(rel, Math.round(.6 * SR), Math.round(.95 * SR), SR), 57), klr = mKlick(render(mkPatch({bend: 2}), [[0, 'on', 72, .8], [0, 'on', 76, .8]], {sec: 1, at: [[0, {mkWheel: {bend: 1}}], [.5, {mkWheel: {bend: 0, ret: .08}}]]}).l, SR, [0]);
  ok('MK1-16 BEND 2, Rad oben: +200 ± 2 ct; Ruhe 0; nach ≤ 100 ms wieder 0 ± 1 ct, M-KLICK', Math.abs(b1 - 200) <= 2 && Math.abs(b0) <= .5 && Math.abs(back) <= 1 && klr.ok, M(b1, 2) + ' / ' + M(b0, 2) + ' / ' + M(back, 2) + ' ct, Klick ' + M(klr.worst) + ' dB');
});
T('MK1-17', () => {
  const sco = (p, ev, t) => { const r = render(mkPatch(p), ev, {sec: t + .05, at: [[0, {mkScope: true}]]}); let best = null; for (const m of r.msgs) if (m.mkScope && m.mkScope.t <= t) best = m.mkScope; return {s: best, r}; };
  const five = [48, 50, 52, 53, 55].map((n, k) => [k * .05, 'on', n, .8]);
  let {s} = sco({}, five, .4); const sounding = s.voices.filter(v => v.gate).map(v => v.note).sort((a, b) => a - b);
  ok('MK1-17 Poly 5 Tasten: genau 4 Stimmen, Last stiehlt die älteste', sounding.length === 4 && !sounding.includes(48), sounding.join(','));
  const five2 = five.map(e => [e[0], e[1], e[2] + 24, e[3]]), r5 = render(mkPatch({}), five2, {sec: .6}); const kl = mKlick(r5.l, SR, five2.map(e => e[0]));
  ok('MK1-17 Stehlen mit Blende (M-KLICK)', kl.ok, M(kl.worst) + ' dB');
  const lo = sco({prio: 1}, [[0, 'on', 50, .8], [.05, 'on', 52, .8], [.1, 'on', 53, .8], [.15, 'on', 55, .8], [.2, 'on', 48, .8]], .4).s.voices.filter(v => v.gate).map(v => v.note).sort((a, b) => a - b);
  const hi = sco({prio: 2}, [[0, 'on', 48, .8], [.05, 'on', 50, .8], [.1, 'on', 52, .8], [.15, 'on', 53, .8], [.2, 'on', 55, .8]], .4).s.voices.filter(v => v.gate).map(v => v.note).sort((a, b) => a - b);
  const loKeep = sco({prio: 1}, five, .4).s.voices.filter(v => v.gate).map(v => v.note).sort((a, b) => a - b);
  ok('MK1-17 Low: die 4 tiefsten; High: die 4 höchsten', lo.join() === '48,50,52,53' && hi.join() === '50,52,53,55' && loKeep.join() === '48,50,52,53', lo.join() + ' | ' + hi.join() + ' | ' + loKeep.join());
  const back = sco({}, five.concat([[.4, 'off', 55]]), .5).s.voices.filter(v => v.gate).map(v => v.note).sort((a, b) => a - b);
  ok('MK1-17 Loslassen: die zurückgestellte Taste bekommt die Stimme zurück', back.join() === '48,50,52,53', back.join());
  // mono with the three priorities: sequences -> the sounding pitch
  const seqs = [
    [0, [[0, 'on', 60], [.1, 'on', 64], [.2, 'on', 62]], .3, 62], [1, [[0, 'on', 60], [.1, 'on', 64], [.2, 'on', 62]], .3, 60], [2, [[0, 'on', 60], [.1, 'on', 64], [.2, 'on', 62]], .3, 64],
    [0, [[0, 'on', 60], [.1, 'on', 64], [.2, 'off', 64]], .3, 60], [1, [[0, 'on', 64], [.1, 'on', 60], [.2, 'off', 60]], .3, 64], [2, [[0, 'on', 60], [.1, 'on', 64], [.2, 'off', 64]], .3, 60]];
  const mono = seqs.map(([pr, ev, t, want]) => { const v = sco({asg: 0, prio: pr}, ev.map(e => [e[0], e[1], e[2], .8]), t).s.voices; return v.length === 1 && Math.round(v[0].note) === want; });
  ok('MK1-17 Mono Last/Low/High: Tastenfolgen ergeben die erwarteten Tonhöhen', mono.every(Boolean), mono.join(','));
  const u = render(mkPatch({asg: 2, udet: 20, mix: {o1: 0, o2: 127}, o2: {w: 2}}), [[0, 'on', 57, .8]], {sec: 6, tap: 'mix'}).l, n = 262144, P = spectrum(u, 4800, n, 'hann'), bin = SR / n;
  const pk = []; for (let k = Math.round(215 / bin); k < Math.round(225 / bin); k++) if (P[k] > P[k - 1] && P[k] >= P[k + 1] && P[k] > 1e-7) pk.push([1200 * Math.log2((k + .5 * (Math.log(P[k - 1]) - Math.log(P[k + 1])) / (Math.log(P[k - 1]) - 2 * Math.log(P[k]) + Math.log(P[k + 1]))) * bin / 220), P[k]]);
  pk.sort((a, b) => b[1] - a[1]); const cts = pk.slice(0, 4).map(x => x[0]).sort((a, b) => a - b), want = [-10, -10 / 3, 10 / 3, 10];
  ok('MK1-17 Unison: 4 Stimmen −10/−3,3/+3,3/+10 ct bei 20 (± 0,5 ct)', cts.length === 4 && cts.every((x, k) => Math.abs(x - want[k]) <= .5), cts.map(x => M(x, 2)).join(' / '));
  // trigger single: the legato note does not restart EG2 (M-EINBRUCH); multi restarts it
  const sg = render(mkPatch({asg: 0, trig: 0, e2: {a: 64, d: 64, s: 64, r: 30}}), [[0, 'on', 57, .8], [.6, 'on', 59, .8]], {sec: 1}).l, eb = mEinbruch(sg, SR, .6);
  const ea = (trig, t) => render(mkPatch({asg: 0, trig, e2: {a: 64, d: 64, s: 64, r: 30}}), [[0, 'on', 57, .8], [.6, 'on', 59, .8]], {sec: t + .01, tap: 'amp'}).l[Math.round(t * SR)];
  const ms = ea(0, .61), mm = ea(1, .61);
  ok('MK1-17 Auslösung Single: kein Neustart (M-EINBRUCH); Multi: neu', eb.ok && Math.abs(ms - .504) < .01 && mm < .2, 'Einbruch ' + M(eb.worst, 2) + ' dB, EG2 10 ms nach der Legato-Note: Single ' + M(ms, 3) + ', Multi ' + M(mm, 3));
});
T('MK1-18', () => {
  // M-KLICK with a chord, M-EINBRUCH with one note (5 ms RMS windows of a chord beat by several dB on their own)
  const sw = (p, msg, sk) => { const x = render(mkPatch(p), [[0, 'on', 69, .8], [0, 'on', 73, .8], [0, 'on', 76, .8]], {sec: 1, at: [[.5, {mkSet: msg}]]}).l, y = render(mkPatch(p), [[0, 'on', 81, .8]], {sec: 1, at: [[.5, {mkSet: msg}]]}).l; return {k: mKlick(x, SR, [0]), e: mEinbruch(y, SR, .5), x}; };
  const cases = [['OSZ1 Welle Säge→Puls', {}, {'t.0.o1.w': 1}], ['OSZ1 Puls→Dreieck', {o1: {w: 1}}, {'t.0.o1.w': 2}], ['OSZ2 Welle', {mix: {o1: 64, o2: 127}}, {'t.0.o2.w': 1}],
    ['OSC MOD Sync', {mix: {o1: 64, o2: 127}, o2: {semi: 7}}, {'t.0.o2.mod': 2}], ['OSC MOD Ring', {mix: {o1: 64, o2: 127}, o2: {semi: 7}}, {'t.0.o2.mod': 1}],
    ['Filtertyp', {f: {cut: 80}}, {'t.0.f.type': 1}], ['HK→GATE', {}, {'t.0.a.gate': 1}]];
  const R1 = cases.map(([n, p, m]) => { const r = sw(p, m); return [n, r.k, r.e]; });
  ok('MK1-18 Strukturwechsel bei klingender Note: M-KLICK und M-EINBRUCH (SXF)', R1.every(([, k, e]) => k.ok && e.ok), R1.map(([n, k, e]) => n + ' ' + M(k.worst) + '/' + M(e.worst, 2)).join('; '));
  const R2 = [['Zuweisung Poly→Mono', {}, {'t.0.asg': 0}], ['Priorität', {}, {'t.0.prio': 1}], ['Auslösung', {asg: 0}, {'t.0.trig': 0}], ['Mono→Unison', {asg: 0}, {'t.0.asg': 2}]].map(([n, p, m]) => { const r = sw(p, m); return [n, r.k, r.e]; });
  ok('MK1-18 Zuweisung, Priorität, Auslösung: M-KLICK (engXf)', R2.every(([, k]) => k.ok), R2.map(([n, k, e]) => n + ' ' + M(k.worst) + '/' + M(e.worst, 2)).join('; '));
  // every continuous control 0 -> 127 in 1 s
  const paths = ['o1.c1', 'o1.c2', 'o2.semi', 'o2.tune', 'mix.o1', 'mix.o2', 'mix.n', 'f.cut', 'f.res', 'f.eg', 'f.kbd', 'f.vel', 'a.lvl', 'a.pan', 'a.vel', 'a.kbd', 'trans', 'tune', 'vib', 'e2.s', 'udet', 'l1.f', 'l2.f'];
  const lo = {'o2.semi': -24, 'o2.tune': -63, 'f.eg': -63, 'f.kbd': -63, 'f.vel': -63, 'a.pan': -63, 'a.vel': -63, 'a.kbd': -63, 'trans': -24, 'tune': -50, 'vib': -63}, hi = {'o2.semi': 24, 'o2.tune': 63, 'f.eg': 63, 'f.kbd': 63, 'f.vel': 63, 'a.pan': 63, 'a.vel': 63, 'a.kbd': 63, 'trans': 24, 'tune': 50, 'vib': 63, udet: 99};
  const bad = [];
  for (const p of paths) {
    const at = []; const a = lo[p] != null ? lo[p] : 0, b = hi[p] != null ? hi[p] : 127;
    for (let k = 0; k <= 60; k++) at.push([.3 + k / 60, {mkSet: {['t.0.' + p]: a + (b - a) * k / 60}}]);
    const x = render(mkPatch({mix: {o1: 127, o2: 64}, o2: {semi: 7}, f: {cut: 90, res: 40}, l1: {w: 2}, o1: {w: 1, c2: 40}, vib: 20}), [[0, 'on', 69, .8], [0, 'on', 73, .8], [0, 'on', 76, .8]], {sec: 1.5, at, mw0: .5}).l;
    const k = mKlick(x, SR, [0]); if (!k.ok) bad.push(p + ' ' + M(k.worst));
  }
  ok('MK1-18 Jeder stetige Regler 0 → 127 in 1 s: M-KLICK', !bad.length, bad.join(', ') || paths.length + ' Regler');
  // fractions: a cutoff drag 0 -> 127 over 10 s in 0.2 steps at resonance 120: the resonance peak moves <= 25 ct per pointer event
  const at = []; for (let k = 0; k <= 635; k++) at.push([.2 + k * 10 / 635, {mkSet: {'t.0.f.cut': k * .2}}]);
  const sc = render(mkPatch({f: {res: 120}}), [[0, 'on', 48, .8]], {sec: 10.4, at: at.concat([[0, {mkScope: true}]])}).msgs.filter(m => m.mkScope && m.mkScope.voices.length && m.mkScope.t > .25).map(m => m.mkScope.voices[0].cutHz);
  const distinct = new Set(sc.map(x => x.toFixed(6))).size; let jump = 0; for (let i = 1; i < sc.length; i++) jump = Math.max(jump, Math.abs(1200 * Math.log2(sc[i] / sc[i - 1])));
  // between two scope snapshots (33 ms) lie ~2 pointer events: 25 ct each at most
  const evPer = (SR / 30 | 0) / SR / (10 / 635);   // pointer events between two scope snapshots
  ok('MK1-18 Bruchwerte: > 127 verschiedene Werte, Sprung ≤ 25 ct je Zeiger-Ereignis', distinct > 127 && jump / evPer <= 25, distinct + ' Werte, max ' + M(jump / evPer, 1) + ' ct je Ereignis (' + M(jump, 1) + ' ct je Schnappschuss, ' + M(evPer, 2) + ' Ereignisse)');
});
T('MK1-24', () => {
  // CPU (Node, relative to one VA voice of the same run): AM voice = saw + pulse with sync, noise, 24LPF res 100, distortion, LFO1/2.
  // Interleaved runs (9 each), steady state (the first 2 s of every render are JIT warm-up: each render compiles the worklet anew),
  // mean quantum time per render, median over the renders
  const AMP = mkPatch({o1: {w: 0, c1: 30, c2: 40}, o2: {w: 1, mod: 2, semi: 7}, mix: {o1: 127, o2: 100, n: 40}, f: {type: 0, cut: 70, res: 100, eg: 30}, a: {dist: 1}, vib: 20});
  const VA = {o1w: 0, o2w: 1, o3w: 0, o1lvl: 1, o2lvl: .8, o3lvl: .6, cutoff: 900, res: .6, poly: 8};
  const ev = n => [36, 43, 48, 52].slice(0, n).map(x => [0, 'on', x, .8]);
  const cfg = {amS: () => render(AMP, [], {sec: 8, quantumMs: true}), am1: () => render(AMP, ev(1), {sec: 8, quantumMs: true, mw0: .5}), am4: () => render(AMP, ev(4), {sec: 8, quantumMs: true, mw0: .5}),
    vaS: () => render(null, [], {sec: 8, quantumMs: true, eng: 0, flat: VA}), va1: () => render(null, ev(1), {sec: 8, quantumMs: true, eng: 0, flat: VA})};
  const R_ = {}; for (const k in cfg) R_[k] = [];
  for (let r = 0; r < 9; r++) for (const k in cfg) { const q = cfg[k]().qms.slice(750); R_[k].push(q.reduce((a, b) => a + b, 0) / q.length); }
  const med = a => a.slice().sort((x, y) => x - y)[a.length >> 1];
  const am1 = med(R_.am1) - med(R_.amS), am4 = med(R_.am4) - med(R_.amS), va1 = med(R_.va1) - med(R_.vaS);
  const qms = 128 / SR * 1000;
  ok('MK1-24 eine AM-Stimme ≤ 1,2 × VA-Stimme; 4 Stimmen ≤ 4,8 ×', am1 / va1 <= 1.2 && am4 / va1 <= 4.8, 'AM ' + M(am1 / va1, 2) + ' ×, 4 St. ' + M(am4 / va1, 2) + ' × (VA-Stimme ' + M(va1 / qms * 100, 2) + ' % Echtzeit, AM ' + M(am1 / qms * 100, 2) + ' %, 4 AM ' + M(am4 / qms * 100, 2) + ' %; Ruhe AM ' + M(med(R_.amS) / qms * 100, 2) + ' %, VA ' + M(med(R_.vaS) / qms * 100, 2) + ' %)');
});
console.log('\n' + (fails ? fails + ' FEHLER' : 'alles bestanden') + ' (' + res.length + ' Prüfungen)');
process.exit(fails ? 1 : 0);
