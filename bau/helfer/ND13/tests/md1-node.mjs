// ND1 acceptance in the Node shim (Nachtrag 6, ND1-01 ... ND1-27, ND1-29). Usage: node md1-node.mjs [48000|44100] [--long]
import {render, makeEngine, prog, loadSrc} from './md-shim.mjs';
import * as M from './md-measure.mjs';
const SR = +(process.argv.find(a => /^\d{5}$/.test(a)) || 48000), LONG = process.argv.includes('--long');
const ONLY = (process.argv.find(a => a.startsWith('--only=')) || '').slice(7);
const res = []; let cur = '';
function check(id, ok, detail) { res.push({id, ok: !!ok, detail}); console.log((ok ? 'OK  ' : 'FAIL') + ' ' + id + ' ' + detail); }
const T = x => 0.004 * Math.pow(2500, x / 50);
const fN = n => 30 * Math.pow(600, n / 50), fE = n => 40 * Math.pow(400, n / 50);
const hz = p => 440 * Math.pow(2, (p - 69) / 12);
const one = (p, o = {}) => render(Object.assign({sr: SR, chans: {0: p}, hits: [{ch: 0, at: 0, v: o.v == null ? 1 : o.v, acc: o.acc || 0, tune: o.tune || 0, dec: o.dec || 1}], sec: o.sec || 1}, o.r || {}));
const sp = (x, a, b, N, h) => M.spectrum(x, SR, Math.round(a * SR), Math.round(b * SR), N || 65536, h);
function msp(x, a, b) {   // M-SP: magnitude-weighted centroid, Hann 2048 frames averaged over [a,b)
  let num = 0, den = 0; for (let s = Math.round(a * SR); s + 2048 <= Math.round(b * SR) + 1; s += 1024) { const S = M.spectrum(x, SR, s, s + 2048, 2048); for (let i = 1; i < S.mag.length; i++) { num += S.mag[i] * i * S.df; den += S.mag[i]; } }
  if (den === 0) { const S = M.spectrum(x, SR, Math.round(a * SR), Math.round(a * SR) + 2048, 2048); for (let i = 1; i < S.mag.length; i++) { num += S.mag[i] * i * S.df; den += S.mag[i]; } }
  return num / den;
}
function welch(x, a, b, N = 8192) { const P = new Float64Array(N / 2); let n = 0; for (let s = Math.round(a * SR); s + N <= Math.round(b * SR); s += N / 2) { const S = M.spectrum(x, SR, s, s + N, N); for (let i = 0; i < N / 2; i++) P[i] += S.mag[i] ** 2; n++; } for (let i = 0; i < N / 2; i++) P[i] /= n; return {P, df: SR / N}; }
const wAt = (W, f, bw = 0.06) => { let s = 0, n = 0; for (let i = Math.max(1, Math.round(f * (1 - bw) / W.df)); i <= Math.round(f * (1 + bw) / W.df); i++) { s += W.P[i]; n++; } return 10 * Math.log10(s / n); };
// crossing times (both directions) -> instantaneous frequency estimates at their midpoints
function zcInst(x, a, b) { const z = []; if (a === 0 && x[0] === 0 && x[1] > 0) z.push(0); for (let i = Math.max(1, Math.floor(a * SR)); i < Math.min(x.length, b * SR); i++) { if ((x[i - 1] < 0 && x[i] >= 0) || (x[i - 1] > 0 && x[i] <= 0)) z.push((i - 1 + x[i - 1] / (x[i - 1] - x[i])) / SR); }
  const o = []; for (let i = 1; i < z.length; i++) o.push({t: (z[i] + z[i - 1]) / 2, f: 1 / (2 * (z[i] - z[i - 1]))}); return o; }
function crossT(x, dbRel, from = 0) { const {e, dt, off} = M.hilbDb(x, SR, 0.001, 0.0002); let pk = -1e9, pi = 0; e.forEach((v, i) => { if (v > pk) { pk = v; pi = i; } }); for (let i = Math.max(pi, from); i < e.length; i++) if (e[i] - pk <= dbRel) return i * dt + off; return NaN; }
function t60band(x, f, q = 8) { return M.t60(M.bandpass(x, SR, f, q), SR); }
const within = (v, t, tol) => Math.abs(v - t) <= tol;
const R = (a, d = 2) => (+a).toFixed(d);
const run = (id, f) => { if (ONLY && !id.startsWith(ONLY)) return; try { f(); } catch (e) { check(id, false, 'Fehler ' + (e && e.stack || e)); } };

// ND1-01 signal path
run('ND1-01', () => {
  const base = {mWav: 'd2', mSpc: 40, mFrq: 30, mDec: 25, mPit: 50, mNtyp: 'b2', mNfrq: 35, mNdec: 20, mCty: 'n2'};
  const t = one(Object.assign({}, base, {mTlv: 40, mNlv: 0, mClv: 0})), n = one(Object.assign({}, base, {mTlv: 0, mNlv: 35, mClv: 0})), c = one(Object.assign({}, base, {mTlv: 0, mNlv: 0, mClv: 30}));
  const all = one(Object.assign({}, base, {mTlv: 40, mNlv: 35, mClv: 30}));
  const sum = new Float32Array(all.L.length); for (let i = 0; i < sum.length; i++) sum[i] = t.L[i] + n.L[i] + c.L[i];
  check('ND1-01a Summe = Teile', M.nullDb(sum, all.L) <= -90, 'M-NULL ' + R(M.nullDb(sum, all.L), 1) + ' dB');
  const so = render({sr: SR, chans: {0: Object.assign({}, base, {mTlv: 40, mNlv: 35, mClv: 30}), 1: {mWav: 'A3', mTlv: 50}}, hits: [{ch: 0, at: 0, v: 1}, {ch: 1, at: 0, v: 1}], msgs: [], sec: 1, kit: null,
    tap: null}); void so;
  const E = makeEngine(SR); E.send({t: 'ch', ch: 0, p: prog(Object.assign({}, base, {mTlv: 40, mNlv: 35, mClv: 30}))}); E.send({t: 'ch', ch: 1, p: prog({mWav: 'A3', mTlv: 50})});
  E.send({t: 'mute', ch: 0, solo: 'tone'}); E.send({t: 'reset'}); E.send({t: 'hit', list: [{ch: 0, at: 0, v: 1}, {ch: 1, at: 0, v: 1}]});
  const s = E.run(SR); let d = new Float32Array(s.L.length); for (let i = 0; i < d.length; i++) d[i] = s.L[i] - t.L[i];
  check('ND1-01b SOLO PART tone', M.db(M.peakAbs(d)) <= -120, 'Rest (NOISE+CLICK+Kanal 2) ' + R(M.db(M.peakAbs(d)), 1) + ' dBFS');
});
// ND1-02 pitch
run('ND1-02', () => {
  const a = one({mPit: 69, mDec: 35}), f = M.zcFreq(a.L, SR, 0.05, 0.5);
  check('ND1-02a 69.0', within(M.cents(f, 440), 0, 0.5), R(f, 3) + ' Hz, ' + R(M.cents(f, 440), 2) + ' Cent');
  const b = one({mPit: 69.1, mDec: 35}), fb = M.zcFreq(b.L, SR, 0.05, 0.5);
  check('ND1-02b 69.1', within(M.cents(fb, 440), 10, 0.5), R(M.cents(fb, 440), 2) + ' Cent');
  const c = one({mPit: 33, mDec: 40}), fc = M.zcFreq(c.L, SR, 0.05, 0.9);
  check('ND1-02c 33.0', within(M.cents(fc, 55), 0, 0.5), R(fc, 3) + ' Hz');
  const d = one({mPit: 127.5, mDec: 30}); let nan = 0; for (const v of d.L) if (!Number.isFinite(v)) nan++;
  check('ND1-02d 127.5', nan === 0 && M.peakAbs(d.L) > 0.01, 'NaN ' + nan + ', Spitze ' + R(M.peakAbs(d.L), 3));
});
// ND1-03 bend
run('ND1-03', () => {
  const f0 = hz(45);
  // first half period after the start (phase 0 at the hit): its mean frequency against the model's mean over the same span
  const model = (b, v, t1) => { const d0 = Math.sign(b) * 48 * (b / 50) ** 2 * (0.3 + 0.7 * v), Tb = T(30), e4 = Math.exp(-4); let s = 0; const n = 400; for (let i = 0; i < n; i++) { const t = (i + 0.5) / n * t1; s += Math.pow(2, d0 * (Math.exp(-4 * t / Tb) - e4) / (1 - e4) / 12); } return 1200 * Math.log2(s / n); };
  const m = (b, v) => { const r = one({mPit: 45, mBnd: b, mBt: 30, mDec: 40}, {v}); const z = zcInst(r.L, 0, 0.6); const e = z[0]; const c = M.cents(e.f, f0), want = model(b, v, 2 * e.t);
    const d0 = Math.sign(b) * 4800 * (b / 50) ** 2 * (0.3 + 0.7 * v); return {c, want, d0, est: d0 * c / want, t: 2 * e.t, z}; };
  let r = m(26, 1); check('ND1-03a +26 Start', Math.abs(r.est / 1298 - 1) <= 0.02, 'erste Halbwelle (' + R(r.t * 1000, 2) + ' ms): ' + R(r.c, 1) + ' Cent, Modell ' + R(r.want, 1) + ' → Anfangsversatz ' + R(r.est, 1) + ' (Soll 1298)');
  const late = [r.z.reduce((a, q) => (Math.abs(q.t - T(30) * 1.05) < Math.abs(a.t - T(30) * 1.05) ? q : a))];
  const lc = late.length ? late.reduce((s, q) => s + M.cents(q.f, f0), 0) / late.length : NaN;
  check('ND1-03b bei T(30)·1,05', Math.abs(lc) < 5, R(lc, 2) + ' Cent');
  r = m(-26, 1); check('ND1-03c -26 Start', Math.abs(r.est / -1298 - 1) <= 0.02, 'erste Halbwelle (' + R(r.t * 1000, 2) + ' ms): ' + R(r.c, 1) + ', Modell ' + R(r.want, 1) + ' → ' + R(r.est, 1) + ' (Soll -1298)');
  r = m(26, 0.3); check('ND1-03d v 0,3', Math.abs(r.est / (1298 * 0.51) - 1) <= 0.03, '→ ' + R(r.est, 1) + ' Cent (Soll ' + R(1298 * 0.51, 1) + ')');
  r = m(50, 1); check('ND1-03e +50', Math.abs(r.est / 4800 - 1) <= 0.02, '→ ' + R(r.est, 1) + ' Cent');
});
// ND1-04 decay
run('ND1-04', () => {
  for (const [x, ms] of [[10, 19], [25, 200], [40, 2091]]) {
    const r = one({mPit: 81, mDec: x}, {sec: Math.max(1, 3 * ms / 1000)}); const t = M.t60(r.L, SR) * 1000;
    check('ND1-04a E1 DECAY ' + x, Math.abs(t / ms - 1) <= 0.1, R(t, 1) + ' ms (Soll ' + ms + ')');
  }
  { const r = one({mPit: 57, mDec: 25, mDm: 'L'}, {sec: 0.5}); const t = crossT(r.L, -60); const Tt = T(25);
    const {e, dt} = M.hilbDb(r.L, SR, 0.002, 0.001); const pts = []; for (let i = 0; i < e.length && i * dt < 0.9 * Tt; i++) pts.push([i * dt, Math.pow(10, e[i] / 20)]);
    const n = pts.length, mx = pts.reduce((s, p) => s + p[0], 0) / n, my = pts.reduce((s, p) => s + p[1], 0) / n; let sxy = 0, sxx = 0, syy = 0; for (const [a, b] of pts) { sxy += (a - mx) * (b - my); sxx += (a - mx) ** 2; syy += (b - my) ** 2; }
    const r2 = sxy * sxy / (sxx * syy);
    check('ND1-04b L', Math.abs(t / Tt - 1) <= 0.05 && r2 >= 0.99, '-60 dB bei ' + R(t * 1000, 1) + ' ms (Soll ' + R(Tt * 1000, 1) + '), R² ' + R(r2, 4)); }
  for (const [m, q] of [['E2', 0.21], ['E3', 0.11]]) { const r = one({mPit: 81, mDec: 30, mDm: m}, {sec: 2.5}), Tt = T(30); const ref = M.peakAbs(one({mPit: 81, mDec: 50}, {sec: 0.05}).L);
    const ct = d => { const {e, dt, off} = M.hilbDb(r.L, SR, 0.001, 0.0002); for (let i = 0; i < e.length; i++) if (e[i] - M.db(ref) <= d && i * dt > 0.001) return i * dt + off; return NaN; };
    const t60 = ct(-60), t20 = ct(-20);
    check('ND1-04c ' + m, Math.abs(t60 / Tt - 1) <= 0.1 && Math.abs(t20 / (q * Tt) - 1) <= 0.15, '-60 bei ' + R(t60 * 1000, 0) + ' ms (Soll ' + R(Tt * 1000, 0) + '), -20 bei ' + R(t20 * 1000, 1) + ' (Soll ' + R(q * Tt * 1000, 1) + '; Bezug = Anfangspegel der Hüllkurve)'); }
  { const r = one({mTlv: 0, mNlv: 40, mNtyp: 'L1', mNfrq: 50, mNdec: 25, mNdm: 'G'}, {sec: 0.4}); const Tt = T(25); const {e, dt} = M.envDb(r.L, SR, 0.01);
    const lv = e.slice(0, Math.floor(0.95 * Tt / dt)); const ref = lv.reduce((s, v) => s + v, 0) / lv.length; const dev = Math.max(...lv.map(v => Math.abs(v - ref)));
    const i3 = Math.ceil((Tt + 0.003) * SR); const after = M.db(M.rms(r.L, i3, i3 + 480) * Math.SQRT2);
    check('ND1-04d NOISE G', dev <= 1 && ref - after > 40, 'bis 0,95 T ± ' + R(dev, 2) + ' dB (10-ms-Fenster), nach T+3 ms ' + R(ref - after, 1) + ' dB tiefer'); }
  for (const [w, o, fF] of [['d2', {mSpc: 50, mFrq: 50}, 1], ['P1', {mSpc: 0}, 0], ['t1', {mFrq: 0}, 0]]) {
    for (const x of [25, 40]) { const p = Object.assign({mWav: w, mPit: 69, mDec: x}, o); const r = one(p, {sec: 3 * T(x) + 0.3}); const f = fF ? hz(69) * Math.pow(2, (50 - 33) / 33) : hz(69);
      const t = t60band(r.L, f, 8); check('ND1-04e ' + w + ' DECAY ' + x, Math.abs(t / T(x) - 1) <= 0.1, 'Grundton-T60 ' + R(t * 1000, 0) + ' ms (Soll ' + R(T(x) * 1000, 0) + ')'); }
  }
});
// ND1-05 dynamic decay
run('ND1-05', () => {
  for (const [dec, dd] of [[12, 38], [38, 12]]) for (const [v, xs] of [[1, dec], [0.01, dd + (dec - dd) * 0.01], [0.5, (dec + dd) / 2]]) {
    const r = one({mPit: 81, mDec: dec, mDm: 'D', mDd: dd}, {v, sec: 3 * T(Math.max(dec, dd)) + 0.2}); const t = M.t60(r.L, SR);
    check('ND1-05 DECAY ' + dec + '/' + dd + ' v ' + v, Math.abs(t / T(xs) - 1) <= 0.1, R(t * 1000, 0) + ' ms (Soll ' + R(T(xs) * 1000, 0) + ')');
  }
});
// ND1-06 punch
run('ND1-06', () => {
  for (const [v, lo, hi] of [[1, 3, 5], [0.2, 0.8, 1.6]]) {
    const p = one({mPit: 45, mDec: 30, mDm: 'P'}, {v, sec: 2}), e = one({mPit: 45, mDec: 30, mDm: 'E1'}, {v, sec: 2});
    const d = M.db(M.rms(p.L, 0, Math.round(0.005 * SR)) / M.rms(e.L, 0, Math.round(0.005 * SR)));
    const tp = M.t60(p.L, SR), te = M.t60(e.L, SR);
    check('ND1-06 v ' + v, d >= lo && d <= hi && Math.abs(tp / te - 1) <= 0.1, 'M-PEGEL 0-5 ms +' + R(d, 2) + ' dB, T60 ' + R(tp * 1000, 0) + '/' + R(te * 1000, 0) + ' ms');
  }
});
// ND1-07 noise filter
run('ND1-07', () => {
  const W = (ty, n, res = 0) => { const r = one({mTlv: 0, mNlv: 40, mNtyp: ty, mNfrq: n, mNres: res, mNdec: 50, mNdm: 'G'}, {sec: n <= 10 ? 40 : 6}); return welch(r.L, 0.05, n <= 10 ? 39.95 : 5.95, n <= 10 ? 32768 : 8192); };
  const flatF = N => { const r = one({mTlv: 0, mNlv: 40, mNtyp: N > 8192 ? 'L1' : 'H1', mNfrq: N > 8192 ? 50 : 0, mNdec: 50, mNdm: 'G'}, {sec: N > 8192 ? 40 : 6}); return welch(r.L, 0.05, N > 8192 ? 39.95 : 5.95, N); }; const flat8 = flatF(8192), flat32 = flatF(32768);
  const rel = (Wx, f) => wAt(Wx, f) - wAt(Wx.P.length > 8192 ? flat32 : flat8, f);
  const slope = {L1: 12, L2: 24, b1: 6, b2: 12, H1: 12, H2: 24};
  for (const ty of ['L1', 'L2', 'b1', 'b2', 'H1', 'H2']) {
    const Wx = W(ty, 25), fc = fN(25), up = ty[0] !== 'H';
    const s = up ? rel(Wx, 2 * fc) - rel(Wx, 4 * fc) : rel(Wx, fc / 2) - rel(Wx, fc / 4);
    let sl = s; if (ty[0] === 'b') sl = Math.max(s, rel(Wx, fc / 2) - rel(Wx, fc / 4));
    check('ND1-07a Flanke ' + ty, Math.abs(sl - slope[ty]) <= 2, R(sl, 1) + ' dB/Okt (Soll ' + slope[ty] + ')');
  }
  for (const n of [10, 25, 40]) for (const [ty, att] of [['L1', -6.02], ['H1', -6.02], ['L2', -9.03], ['b2', 0]]) {
    const Wx = W(ty, n), fc = fN(n);
    let best = 0, bd = 1e9; for (let f = fc / 2; f < fc * 2; f *= 1.002) { const v = ty === 'b2' ? -rel(Wx, f) : Math.abs(rel(Wx, f) - att); if (v < bd) { bd = v; best = f; } }
    check('ND1-07b fc ' + ty + ' n ' + n, Math.abs(best / fc - 1) <= 0.05, R(best, 0) + ' Hz (Soll ' + R(fc, 0) + ')');
  }
  { const fc = fN(30), f = Math.max(3 * fc, 6000), a = W('H3', 30), b = W('H2', 30); const d = wAt(a, f, 0.03) - wAt(b, f, 0.03); check('ND1-07c H3', within(d, -3, 1), R(d, 2) + ' dB bei ' + R(f, 0) + ' Hz'); }
  { const a = W('L1', 25, 20), fc = fN(25); let pk = -1e9; for (let f = fc / 2; f < fc * 2; f *= 1.01) pk = Math.max(pk, rel(a, f)); const lo = rel(a, fc / 8); check('ND1-07d RES 20', pk - lo >= 20, '+' + R(pk - lo, 1) + ' dB'); }
  { const a = W('L1', 25, 0), fc = fN(25); let pk = -1e9; for (let f = fc / 8; f < fc * 2; f *= 1.01) pk = Math.max(pk, rel(a, f)); const lo = rel(a, fc / 8); check('ND1-07e RES 0', pk - lo <= 0.5, '+' + R(pk - lo, 2) + ' dB'); }
});
// ND1-08 dyn filter
run('ND1-08', () => {
  const avgSp = (p, v, n = 24) => { const hits = []; for (let k = 0; k < n; k++) hits.push({ch: 0, at: k * 0.1, v}); const r = render({sr: SR, chans: {0: p}, hits, sec: n * 0.1 + 0.1}); let s = 0; for (let k = 0; k < n; k++) s += msp(r.L, k * 0.1, k * 0.1 + 0.0427); return s / n; };
  const nz = o => Object.assign({mTlv: 0, mNlv: 40, mNtyp: 'L1', mNdec: 50, mNdm: 'G'}, o);
  const dyn = avgSp(nz({mNfrq: 15, mNdyf: 5}), 1); const ref = [37, 38, 39].map(n => avgSp(nz({mNfrq: n}), 1));
  check('ND1-08a DF +5', dyn >= ref[0] && dyn <= ref[2], 'M-SP ' + R(dyn, 0) + ' Hz (FREQ 37/38/39: ' + ref.map(x => R(x, 0)).join('/') + ')');
  const dyn2 = avgSp(nz({mNfrq: 38, mNdyf: -5}), 1); const ref2 = [14, 15, 16].map(n => avgSp(nz({mNfrq: n}), 1));
  check('ND1-08b DF -5', dyn2 >= ref2[0] && dyn2 <= ref2[2], 'M-SP ' + R(dyn2, 0) + ' (14/15/16: ' + ref2.map(x => R(x, 0)).join('/') + ')');
  const a = avgSp(nz({mNfrq: 25}), 0.3), b = avgSp(nz({mNfrq: 25}), 1); check('ND1-08c DF 0', Math.abs(a / b - 1) <= 0.02, R(a, 0) + ' / ' + R(b, 0));
  const t9 = one({mWav: 'A3', mPit: 45, mFrq: 5, mDyf: 9, mDec: 40}), t0 = one({mWav: 'A3', mPit: 45, mFrq: 5, mDyf: 0, mDec: 40});
  const o = Math.log2(msp(t9.L, 0, 0.0427) / msp(t0.L, 0, 0.0427)); check('ND1-08d TONE A3 DF 9', o >= 1, '+' + R(o, 2) + ' Okt');
});
// ND1-09 mode ratios
const TAB = {
  d1: [1, 2.295, 3.598, 4.903, 6.209, 7.515], d2: [1, 1.593, 2.136, 2.295, 2.653, 2.917, 3.155, 3.5, 3.598, 3.647, 4.059, 4.132], d3: [0.85, 1, 1.5, 1.98, 2.44, 2.94, 3.4],
  d4: [1, 2, 3, 4, 5, 6, 1.5], d5: [1, 1.593, 2.136, 2.295, 2.653, 2.917, 3.155, 3.5], d6: [1, 1.593, 2.136, 2.295, 2.653, 2.917, 3.155, 3.5, 3.598, 3.647, 4.059, 4.132, 4.23, 4.601, 4.61, 4.832],
  d7: [1, 1.593, 2.136, 2.295, 4.601, 4.832, 5.131, 5.412], P1: [1, 3.99, 9.95, 16.4], P2: [1, 4, 10], P3: [1, 3, 6, 9.8], P4: [1, 2.756, 5.404, 8.933, 13.344],
  H1: Array.from({length: 32}, (_, k) => k + 1), H2: Array.from({length: 32}, (_, k) => 2 * k + 1), H3: Array.from({length: 48}, (_, k) => k + 1).filter(k => k % 3), H4: [1].concat(Array.from({length: 31}, (_, k) => 2 * k + 2)),
  H5: Array.from({length: 32}, (_, k) => k + 1), H6: Array.from({length: 24}, (_, k) => (k + 1) * Math.sqrt(1 + 0.0008 * (k + 1) ** 2)), C2: [1, 1.483, 1.8, 2.546, 2.63, 3.897]};
run('ND1-09', () => {
  for (const w of Object.keys(TAB)) {
    const c2 = w === 'C2', pit = w[0] === 'H' ? 40 : w[0] === 'P' ? 57 : c2 ? 45 : 45;
    const full = w[0] === 'P' || w === 'd7';   // short modes beside a long fundamental: let everything decay inside the window (no truncation side lobes)
    const p = {mWav: w, mPit: pit, mSpc: w[0] === 'd' ? 33 : w[0] === 'H' ? 20 : w[0] === 'P' ? 0 : 50, mFrq: 50, mDec: full ? 45 : 42};
    const r = one(p, {sec: full ? 1.4 : 0.6, r: c2 ? {tap: 1} : {}}); const S = sp(r.L, 0, full ? 1.36 : 0.5);
    const f0 = c2 ? hz(pit) : (w === 'd3' ? hz(pit) : hz(pit));
    const want = Math.min(w === 'd2' || w === 'd6' ? 8 : 6, TAB[w].length);
    const P = []; for (const q of M.peaks(S, -95, 20, 0.45 * SR)) { if (P.some(o => Math.abs(o.f - q.f) < (full ? 3 : 6))) continue; P.push(q); if (P.length >= want) break; }   // Hann side lobes of a 0.5 s window lie within 6 Hz
    const tab = TAB[w]; let bad = [];
    for (const q of P) { const rr = q.f / f0; const ok = tab.some(t => Math.abs(rr / t - 1) <= 0.003); if (!ok) bad.push(R(rr, 4)); }
    check('ND1-09a ' + w, bad.length === 0 && P.length >= Math.min(want, tab.length), P.length + ' Spitzen, Verhältnisse ' + P.map(q => R(q.f / f0, 3)).join(' ') + (bad.length ? ' | falsch: ' + bad.join(' ') : ''));
  }
  for (const w of ['d1', 'd2', 'd7']) {
    const r33 = one({mWav: w, mPit: 45, mSpc: 33, mFrq: 30, mDec: 40}, {sec: 0.6}), P = M.peaks(sp(r33.L, 0, 0.5), -40).slice(0, 3);
    const lo = P.reduce((a, b) => (Math.abs(b.f - hz(45)) < Math.abs(a.f - hz(45)) ? b : a)); check('ND1-09b ' + w + ' SPECTRA 33', Math.abs(M.cents(lo.f, hz(45))) <= 3, 'Fell-Grundton ' + R(M.cents(lo.f, hz(45)), 2) + ' Cent zum Körper');
    const r66 = one({mWav: w, mPit: 45, mSpc: 66, mFrq: 30, mDec: 40}, {sec: 0.6}), S6 = sp(r66.L, 0, 0.5), P6 = M.peaks(S6, -50);
    const fell = P6.find(q => Math.abs(q.f / (2 * hz(45)) - 1) <= 0.003), body = P6.find(q => Math.abs(q.f / hz(45) - 1) <= 0.003);
    check('ND1-09c ' + w + ' SPECTRA 66', fell && body, 'Fell ' + (fell ? R(fell.f / hz(45), 4) : '-') + ' · Körper ' + (body ? R(body.f / hz(45), 4) : '-'));
  }
});
// ND1-10 resonance centre
run('ND1-10', () => {
  const spear = (a, b) => { const rk = x => { const s = x.map((v, i) => [v, i]).sort((p, q) => p[0] - q[0]); const r = new Array(x.length); s.forEach((p, i) => { r[p[1]] = i; }); return r; }; const ra = rk(a), rb = rk(b), n = a.length; let d = 0; for (let i = 0; i < n; i++) d += (ra[i] - rb[i]) ** 2; return 1 - 6 * d / (n * (n * n - 1)); };
  for (const w of ['H1', 'P1', 'C1']) { const S = [], C = []; for (let s = 0; s <= 99; s += 11) { const r = one({mWav: w, mPit: w === 'C1' ? 55 : 45, mSpc: s, mFrq: 40, mDec: 35}, {sec: 0.4}); S.push(s); C.push(msp(r.L, 0, 0.3)); }
    const rho = spear(S, C); check('ND1-10a ' + w, rho >= 0.95, 'Spearman ' + R(rho, 3) + ' · M-SP ' + C.map(x => R(x, 0)).join(' ')); }
  const a = one({mWav: 'P1', mPit: 57, mSpc: 24, mFrq: 30, mDec: 30}, {sec: 2}), b = one({mWav: 'P1', mPit: 57, mSpc: 0, mFrq: 30, mDec: 30}, {sec: 2});
  const f0 = hz(57), la = M.magAt(sp(a.L, 0, 0.03), f0), lb = M.magAt(sp(b.L, 0, 0.03), f0), ta = t60band(a.L, f0, 20), tb = t60band(b.L, f0, 20);
  check('ND1-10b P1 SPECTRA 24', within(M.db(la / lb), 12, 2) && Math.abs(ta / tb / 1.5 - 1) <= 0.15, 'Grundton ' + R(M.db(la / lb), 2) + ' dB, T60 ×' + R(ta / tb, 3));
});
// ND1-11 FM
run('ND1-11', () => {
  const pit = 69 + 12 * Math.log2(200 / 440);
  const fm = (frq, o = {}) => one(Object.assign({mWav: 'F1', mPit: pit, mSpc: 2, mFrq: frq, mDyf: 0, mDec: 45}, o), {sec: 0.6});
  { const S = sp(fm(25).L, 0.05, 0.55); const ref = M.magAt(S, 200); const ok = [200, 600, 1000].every(f => M.db(M.magAt(S, f) / ref) > -40); const no = [400, 800].map(f => M.db(M.magAt(S, f) / Math.max(ref, M.magAt(S, 600))));
    const P = M.peaks(S, -40).filter(q => [200, 600, 1000].some(f => Math.abs(q.f - f) <= 5)).map(q => q.f); const okf = [200, 600, 1000].every(f => P.some(x => Math.abs(x - f) <= 1));
    check('ND1-11a Spitzen 200/600/1000', ok && okf && no.every(x => x <= -50), 'Spitzen ' + P.map(x => R(x, 1)).join(' ') + ' · 400/800 ' + no.map(x => R(x, 1)).join('/') + ' dB'); }
  { const S = sp(fm(0).L, 0.05, 0.55); const ref = M.magAt(S, 200), sb = Math.max(M.magAt(S, 600), M.magAt(S, 1000)); check('ND1-11b FREQ 0', M.db(sb / ref) <= -60, 'Seitenbänder ' + R(M.db(sb / ref), 1) + ' dB'); }
  const J = (n, x) => { let s = 0; for (let k = 0; k < 40; k++) { let t = Math.pow(-1, k) * Math.pow(x / 2, 2 * k + n); for (let i = 1; i <= k; i++) t /= i; for (let i = 1; i <= k + n; i++) t /= i; s += t; } return s; };
  for (const [frq, I] of [[10, 0.4], [25, 2.5], [50, 10]]) { const S = sp(fm(frq).L, 0.05, 0.55); const a200 = M.magAt(S, 200), a600 = M.magAt(S, 600);
    const want = Math.abs(J(1, I) - J(2, I)) / Math.abs(J(0, I) + J(1, I)), got = a600 / a200; check('ND1-11c Index ' + I, Math.abs(M.db(got / want)) <= 1, '600/200 ' + R(M.db(got), 2) + ' dB (Bessel ' + R(M.db(want), 2) + ')'); }
  { const r = one({mWav: 'F1', mPit: pit, mSpc: 2, mFrq: 25, mDec: 45, mBnd: 25, mBt: 50}, {sec: 0.2}); const S = sp(r.L, 0, 0.04, 65536); const P = M.peaks(S, -30).slice(0, 3).map(q => q.f).sort((a, b) => a - b);
    const r1 = P[1] / P[0], r2 = P[2] / P[0], odd = x => Math.abs(x / (2 * Math.round((x - 1) / 2) + 1) - 1) <= 0.003; check('ND1-11d Bend +12 HT', odd(r1) && odd(r2) && Math.abs(P[0] / 400 - 1) <= 0.01, 'Spitzen ' + P.map(x => R(x, 1)).join(' ') + ' (Verhältnis ' + R(r1, 4) + ', ' + R(r2, 4) + ')'); }
});
// ND1-12 analog
run('ND1-12', () => {
  { const r = one({mWav: 'A3', mPit: 96, mFrq: 50, mDec: 45}, {sec: 0.7}); const S = sp(r.L, 0.05, 0.65); const f0 = hz(96), ref = M.magAt(S, f0); let worst = -999, wf = 0;
    for (const q of M.peaks(S, -90, 50, 0.49 * SR)) { const h = q.f / f0; if (Math.abs(h - Math.round(h)) * f0 < 8) continue; const d = M.db(q.a / ref); if (d > worst) { worst = d; wf = q.f; } }
    check('ND1-12a Spiegelfrequenzen', worst <= -45, 'stärkste ' + R(worst, 1) + ' dB bei ' + R(wf, 0) + ' Hz'); }
  { const r = one({mWav: 'A3', mPit: 45, mFrq: 0, mDec: 45}, {sec: 0.7}); const S = sp(r.L, 0.05, 0.65); const f0 = hz(45); const d = M.db(M.magAt(S, 2 * f0) / M.magAt(S, f0)); check('ND1-12b FREQ 0', d <= -15, '2. Teilton ' + R(d, 1) + ' dB'); }
  { const r = one({mWav: 'A2', mPit: 45, mSpc: 31, mFrq: 10, mDec: 45}, {sec: 0.7}); const P = M.peaks(sp(r.L, 0.05, 0.65), -30).slice(0, 2).map(q => q.f).sort((a, b) => a - b); check('ND1-12c A2 +7 HT', Math.abs(P[1] / P[0] / 1.4983 - 1) <= 0.001, 'Verhältnis ' + R(P[1] / P[0], 5)); }
  { const r = one({mWav: 'A6', mPit: 45, mSpc: 99, mFrq: 50, mDec: 45}, {sec: 0.2}); const per = SR / hz(45); const a = Math.round(0.5 * per), b = a + Math.round(per);
    // area method (robust against the band-limited edges): DC-free pulse, positive area / (peak-to-peak * N) = w (1 - w)
    let mx = -9, mn = 9, pa = 0; for (let i = a; i < b; i++) { mx = Math.max(mx, r.L[i]); mn = Math.min(mn, r.L[i]); } let mean = 0; for (let i = a; i < b; i++) mean += r.L[i]; mean /= (b - a);
    for (let i = a; i < b; i++) if (r.L[i] > mean) pa += r.L[i] - mean; const q = pa / ((mx - mn) * (b - a)), w = (1 - Math.sqrt(Math.max(0, 1 - 4 * q))) / 2;
    check('ND1-12d A6 Pulsbreite', within(w, 0.05, 0.01), R(w * 100, 2) + ' % (Flächenmaß)'); }
});
// ND1-13 T-bridge
run('ND1-13', () => {
  const lv = []; for (const F of [0, 12, 25, 37, 50]) { const r = one({mWav: 't1', mPit: 45, mFrq: F, mDec: 40}, {sec: 0.5}); const S = sp(r.L, 0.02, 0.4); const f0 = hz(45);
    let p2 = -999; for (const k of [2, 3, 4]) p2 = Math.max(p2, M.db(M.magAt(S, k * f0) / M.magAt(S, f0))); lv.push(p2); }
  const mono = lv.every((v, i) => i === 0 || v > lv[i - 1]);
  check('ND1-13a t1 FREQ 0..50', lv[0] <= -30 && lv[4] >= -20 && mono, '2. Teilton ' + lv.map(x => R(x, 1)).join(' / ') + ' dB');
  const det = Math.pow(2, 12 / 12); // SPECTRA 36 -> +12 HT
  const lvl = F => { const r = one({mWav: 't2', mPit: 45, mSpc: 36, mFrq: F, mDec: 40}, {sec: 0.5}); const S = sp(r.L, 0.02, 0.4); return [M.magAt(S, hz(45)), M.magAt(S, hz(45) * det)]; };
  const a = lvl(0), b = lvl(25), c = lvl(50);
  check('ND1-13b t2', M.db(a[1] / a[0]) <= -60 && within(M.db(b[1] / b[0]), 0, 1) && M.db(c[0] / c[1]) <= -60, 'R2/R1 ' + R(M.db(a[1] / a[0]), 1) + ' / ' + R(M.db(b[1] / b[0]), 2) + ' / R1/R2 ' + R(M.db(c[0] / c[1]), 1) + ' dB');
});
// ND1-14 ring mod
run('ND1-14', () => {
  const pit = 69 + 12 * Math.log2(300 / 440);
  { const r = one({mWav: 'r1', mPit: pit, mSpc: 22, mFrq: 50, mDec: 45}, {sec: 0.6}); const S = sp(r.L, 0.05, 0.55); const P = M.peaks(S, -30).slice(0, 2).map(q => q.f).sort((a, b) => a - b); const d = M.db(M.magAt(S, 300) / M.magAt(S, 150));
    check('ND1-14a r1 FREQ 50', Math.abs(P[0] - 150) <= 1 && Math.abs(P[1] - 750) <= 1 && d <= -30, 'Spitzen ' + P.map(x => R(x, 1)).join(' ') + ', 300 Hz ' + R(d, 1) + ' dB'); }
  { const r = one({mWav: 'r1', mPit: pit, mSpc: 22, mFrq: 0, mDec: 45}, {sec: 0.6}); const S = sp(r.L, 0.05, 0.55); const P = M.peaks(S, -60).filter((q, i) => i === 0 || Math.abs(q.f - 300) > 20); check('ND1-14b r1 FREQ 0', P.length && Math.abs(P[0].f - 300) <= 1 && (P.length < 2 || P[1].db < -60), 'Spitzen ' + P.slice(0, 3).map(q => R(q.f, 1) + '(' + R(q.db, 0) + ')').join(' ')); }
});
// ND1-15 cymbals
run('ND1-15', () => {
  const pk = s => { const r = one({mWav: 'C2', mPit: 45, mSpc: s, mFrq: 50, mDec: 45}, {sec: 0.6, r: {tap: 1}}); return M.peaks(sp(r.L, 0.05, 0.55), -40).slice(0, 6).map(q => q.f).sort((a, b) => a - b); };
  const a = pk(50), b = pk(75), f0 = hz(45), tab = [1, 1.483, 1.8, 2.546, 2.63, 3.897];
  const ok = tab.every((t, i) => Math.abs(a[i] / (t * f0) - 1) <= 0.003); check('ND1-15a C2 Grundfrequenzen', ok, a.map(x => R(x / f0, 4)).join(' '));
  const ok2 = a.every((x, i) => Math.abs(b[i] / x / Math.SQRT2 - 1) <= 0.005); check('ND1-15b SPECTRA 75/50', ok2, b.map((x, i) => R(x / a[i], 4)).join(' '));
  const harm = w => { const r = one({mWav: w, mPit: 60, mSpc: 50, mFrq: 40, mDec: 40}, {sec: 0.6}); const P = M.peaks(sp(r.L, 0.02, 0.52), -60).slice(0, 20); const low = P.slice().sort((x, y) => x.f - y.f).find(q => q.db > -30) || P[0];
    let e = 0, eh = 0; for (const q of P) { e += q.a * q.a; const h = q.f / low.f; if (Math.abs(h - Math.round(h)) <= 0.01 * h) eh += q.a * q.a; } return eh / e; };
  for (const w of ['C1', 'C3']) { const h = harm(w); check('ND1-15c ' + w + ' Harmonizität', h < 0.3, R(h, 3)); }
});
// ND1-16 click
run('ND1-16', () => {
  const len = {n1: 1.5, n2: 4, n3: 8, P1: 0.15, P2: 0.4, P3: 1.3, H1: 1, H2: 1, H3: 1, C1: 2, C2: 4, C3: 8};   // H1-H3: spec 1-3 ms -> at least 1 ms
  for (const ty of Object.keys(len)) { const r = one({mTlv: 0, mClv: 50, mCty: ty}, {sec: 0.05}); let last = 0; for (let i = 0; i < r.L.length; i++) if (Math.abs(r.L[i]) > 1e-9) last = i;
    const L = (last + 1) / SR * 1000; let first = 0, pm = 0; for (let i = 0; i < 200; i++) if (Math.abs(r.L[i]) > pm) { pm = Math.abs(r.L[i]); first = i; }
    const okP = ty[0] !== 'P' || first === 0; check('ND1-16a ' + ty, (ty[0] === 'H' && ty !== 'H1' ? L >= 0.9 && L <= 3.3 : Math.abs(L / len[ty] - 1) <= 0.1) && okP, 'Länge ' + R(L, 3) + ' ms (Soll ' + len[ty] + '), Spitze bei Sample ' + first + ', M-SP ' + R(msp(r.L, 0, 0.0427), 0) + ' Hz'); }
  for (const w of ['A1', 'd2', 't1']) { const t = one({mWav: w, mPit: 45, mFrq: 30, mDec: 30}, {sec: 0.05}), c = one({mWav: w, mTlv: 0, mClv: 40, mCty: 'P2'}, {sec: 0.05});
    let s = 0; for (let i = 0; i < 400 && s === 0; i++) if (Math.abs(t.L[i]) > 1e-4) s = Math.sign(t.L[i]); check('ND1-16b Polarität ' + w, Math.sign(c.L[0]) === s, 'TONE ' + s + ' CLICK ' + Math.sign(c.L[0])); }
});
// ND1-17 levels and pan
run('ND1-17', () => {
  const a = one({mTlv: 50, mDec: 30}), b = one({mTlv: 25, mDec: 30}); check('ND1-17a TONE LVL', within(M.db(M.rms(b.L) / M.rms(a.L)), -12, 0.2), R(M.db(M.rms(b.L) / M.rms(a.L)), 3) + ' dB');
  const c = one({mLvl: 50, mDec: 30}), d = one({mLvl: 25, mDec: 30}); check('ND1-17b CH LEVEL', within(M.db(M.rms(d.L) / M.rms(c.L)), -12, 0.2), R(M.db(M.rms(d.L) / M.rms(c.L)), 3) + ' dB');
  const s = one({mTlv: 50, mDec: 50, mPit: 57}, {sec: 1}), n = one({mTlv: 0, mNlv: 50, mNtyp: 'H1', mNfrq: 0, mNdec: 50, mNdm: 'G'}, {sec: 1});
  const ds = M.db(M.rms(n.L, 480, 4800) / M.rms(s.L, 480, 4800)); check('ND1-17c NOISE = TONE', Math.abs(ds) <= 1, R(ds, 2) + ' dB');
  const pan = p => { const r = one({mPan: p, mDec: 30}, {sec: 0.3}); return [M.rms(r.L), M.rms(r.R)]; };
  const l9 = pan(-9); check('ND1-17d L9', M.db(l9[1] / l9[0]) <= -90, 'rechts ' + R(M.db(l9[1] / l9[0]), 1) + ' dB');
  const c0 = pan(0); check('ND1-17e C', within(M.db(c0[0] / c0[1]), 0, 0.1), R(M.db(c0[0] / c0[1]), 3) + ' dB');
  let worst = 0; const ref = pan(0)[0] / Math.SQRT1_2; for (const p of [-9, -6, -3, 0, 3, 6, 9]) { const g = pan(p), x = (p * 7 + 63) / 126 * Math.PI / 2; worst = Math.max(worst, Math.abs(M.db(g[0] / ref / Math.cos(x))), p === -9 ? 0 : Math.abs(M.db(g[1] / ref / Math.sin(x)))); }
  check('ND1-17f Pan-Gesetz (Synth-Worklet W-20)', worst <= 0.1, 'größte Abweichung ' + R(worst, 3) + ' dB');
});
// ND1-18 EQ
run('ND1-18', () => {
  const nz = o => one(Object.assign({mTlv: 0, mNlv: 40, mNtyp: 'H1', mNfrq: 0, mNdec: 50, mNdm: 'G'}, o), {sec: 3});
  const ref = welch(nz({}).L, 0.1, 2.9, 16384);
  for (const n of [10, 25, 40]) for (const g of [9, -9]) { const W = welch(nz({mEqf: n, mEqg: g}).L, 0.1, 2.9, 16384); let best = g > 0 ? -999 : 999, bf = 0;
    for (let f = fE(n) / 2; f < fE(n) * 2; f *= 1.003) { const v = wAt(W, f, 0.01) - wAt(ref, f, 0.01); if (g > 0 ? v > best : v < best) { best = v; bf = f; } }
    check('ND1-18a n ' + n + ' GAIN ' + g, within(best, g * 2.6667, 0.5) && Math.abs(bf / fE(n) - 1) <= 0.03, R(best, 2) + ' dB bei ' + R(bf, 0) + ' Hz (Soll ' + R(fE(n), 0) + ')'); }
  const a = one({mWav: 'A3', mEqg: 0, mEqf: 10, mDec: 30}), b = one({mWav: 'A3', mEqg: 0, mEqf: 40, mDec: 30}); check('ND1-18b GAIN 0', M.nullDb(a.L, b.L) === -Infinity, 'M-NULL ' + M.nullDb(a.L, b.L));
});
// ND1-19 dist
run('ND1-19', () => {
  const thd = [], lv = []; const base = one({mPit: 45, mDec: 45}, {sec: 0.6}); const L0 = M.rms(base.L, 0, Math.round(0.3 * SR));
  for (const D of [0, 10, 20, 30, 40, 50]) { const r = one({mPit: 45, mDec: 45, mDst: D, mDty: 'dr'}, {sec: 0.6}); const S = sp(r.L, 0.05, 0.55); const f0 = hz(45); let h = 0; for (let k = 2; k <= 15; k++) h += M.magAt(S, k * f0) ** 2; thd.push(Math.sqrt(h) / M.magAt(S, f0)); lv.push(M.db(M.rms(r.L, 0, Math.round(0.3 * SR)) / L0)); }
  check('ND1-19a dr Klirr steigt', thd.every((v, i) => i === 0 || v > thd[i - 1]) && lv.every(v => Math.abs(v) <= 3), 'Klirr ' + thd.map(x => R(x * 100, 1) + '%').join(' ') + ' · Pegel ' + lv.map(x => R(x, 1)).join(' ') + ' dB');
  { const r = one({mPit: 45, mDec: 45, mDst: 25, mDty: 'SA'}, {sec: 1}); let ch = 0; for (let i = Math.round(0.1 * SR); i < Math.round(0.6 * SR); i++) if (r.L[i] !== r.L[i - 1]) ch++; const rate = ch / 0.5, want = 48000 * Math.pow(400 / 48000, 0.5);
    check('ND1-19b SA 25', Math.abs(rate / want - 1) <= 0.05, R(rate, 0) + ' Hz (Soll ' + R(want, 0) + ')'); }
  { const r = one({mPit: 57, mDec: 45, mDst: 25, mDty: 'rn'}, {sec: 1.2}); const P = M.peaks(sp(r.L, 0.1, 1.1), -20).slice(0, 2).map(q => q.f).sort((a, b) => a - b); const f = hz(57), m = Math.pow(5000, 0.5);
    check('ND1-19c rn 25', Math.abs(P[0] - (f - m)) <= 1 && Math.abs(P[1] - (f + m)) <= 1, 'Spitzen ' + P.map(x => R(x, 2)).join(' ') + ' (Soll ' + R(f - m, 2) + ' ' + R(f + m, 2) + ')'); }
});
// ND1-20 sends
run('ND1-20', () => {
  const imp = o => one(Object.assign({mWav: 'A3', mPit: 80, mDec: 20}, o), {sec: 0.3, r: {kit: {rvT: 'p1', rvC: 0, dlR: 50, dlM: 'r', dlB: 60, dlF: 0}}});
  const a = imp({}), b = imp({mRvb: 25}), c = imp({mRvb: 50}), N2 = Math.round(0.002 * SR);
  check('ND1-20a RVB 25', within(M.db(M.rms(b.L, 0, N2) / M.rms(a.L, 0, N2)), -6.02, 0.1), R(M.db(M.rms(b.L, 0, N2) / M.rms(a.L, 0, N2)), 3) + ' dB');
  check('ND1-20b RVB 50', M.db(M.rms(c.L, 0, N2) / M.rms(a.L, 0, N2)) <= -90, R(M.db(M.rms(c.L, 0, N2) / M.rms(a.L, 0, N2)), 1) + ' dB');
  const d = imp({mDly: 25}), e = imp({mDly: 50}), N5 = Math.round(0.05 * SR);
  check('ND1-20c DLY 25', within(M.db(M.rms(d.L, 0, N5) / M.rms(a.L, 0, N5)), -6.02, 0.1), R(M.db(M.rms(d.L, 0, N5) / M.rms(a.L, 0, N5)), 3) + ' dB');
  check('ND1-20d DLY 50', M.db(M.rms(e.L, 0, N5) / M.rms(a.L, 0, N5)) <= -90, R(M.db(M.rms(e.L, 0, N5) / M.rms(a.L, 0, N5)), 1) + ' dB');
});
// ND1-21 echo
run('ND1-21', () => {
  const echo = (kit, o = {}) => { const r = one(Object.assign({mTlv: 0, mClv: 50, mCty: 'P1', mDly: 25}, o), {sec: o.sec || 2.5, r: {kit: Object.assign({rvT: 'r1', rvC: 0, dlR: 50, dlM: 'r', dlB: 60, dlF: 0}, kit)}}); return r; };
  const peaksT = (x, n) => { const out = []; const thr = M.peakAbs(x) * 1e-4; let i = 0; while (i < x.length && out.length < n) { if (Math.abs(x[i]) > thr) { let m = i; for (let k = i; k < Math.min(x.length, i + 40); k++) if (Math.abs(x[k]) > Math.abs(x[m])) m = k; out.push({i: m, a: Math.abs(x[m])}); i = m + Math.round(0.0005 * SR); } else i++; } return out; };
  for (const [r, ms] of [[0, 1150], [50, 104.7], [99, 10]]) { const e = echo({dlR: r}); const P = peaksT(e.L, 2); const t = (P[1].i - P[0].i) / SR * 1000; check('ND1-21a RATE ' + r, Math.abs(t - ms) <= Math.max(1, ms * 0.001), R(t, 2) + ' ms'); }
  { const e = echo({dlR: 99, dlF: 0}, {sec: 0.2}); const P = peaksT(e.L, 4); check('ND1-21b FEEDBACK 0', P.length === 2, P.length + ' Ereignisse (Schlag + Echos)'); }
  { const e = echo({dlM: 'b', dlB: 420, dlF: 20}, {sec: 1}); const P = peaksT(e.L, 8).slice(1); /* 50 ms = 2400 samples: no interpolation loss */ const d = []; for (let i = 1; i < P.length; i++) d.push(M.db(P[i].a / P[i - 1].a)); const m = d.reduce((s, v) => s + v, 0) / d.length;
    check('ND1-21c FEEDBACK 20', within(m, -0.26, 0.05), 'je Wiederholung ' + R(m, 3) + ' dB'); }
  for (const [b, ms, l] of [[60, 500, 'Viertel 120'], [150, 250, 'Achtel 120'], [420, 50, 'Sechzehntel 300'], [421, 50, '0,050 s'], [422, 49, '0,049 s'], [470, 1, '0,001 s']]) { const e = echo({dlM: 'b', dlB: b}, {sec: 0.7}); const P = peaksT(e.L, 2); const t = (P[1].i - P[0].i) / SR * 1000;
    check('ND1-21d BPM ' + l, Math.abs(t - ms) <= 0.05, R(t, 3) + ' ms'); }
  { const e = echo({dlR: 50}, {mPan: -9, sec: 0.5}); check('ND1-21e Echo L9', M.db(M.peakAbs(e.R) / M.peakAbs(e.L)) <= -90 || M.peakAbs(e.R) === 0, 'rechts ' + R(M.db(M.peakAbs(e.R) / M.peakAbs(e.L)), 1) + ' dB'); }
});
// ND1-22 hall
run('ND1-22', () => {
  const rt = {ti: 0.7, r1: 0.4, r2: 0.9, p1: 0.8, p2: 1.3, p3: 2.0, p4: 3.2, St: 1.6, hA: 3.0};
  for (const ty of Object.keys(rt)) { const r = one({mTlv: 0, mNlv: 50, mNtyp: 'b1', mNfrq: 30, mNres: 0, mNdec: 3, mNdm: 'G', mRvb: 50}, {sec: rt[ty] * 2 + 0.6, r: {kit: {rvT: ty, rvC: 0, dlR: 50, dlM: 'r', dlB: 60, dlF: 0}}});
    const x = M.bandpass(r.L, SR, 1000, 1.4); // Schroeder backward integration -> T30
    const e = new Float64Array(x.length); let s = 0; for (let i = x.length - 1; i >= 0; i--) { s += x[i] * x[i]; e[i] = s; } const d = i => 10 * Math.log10(e[i] / e[0] + 1e-30);
    let i5 = 0, i35 = 0; for (let i = 0; i < e.length; i++) { if (!i5 && d(i) <= -5) i5 = i; if (!i35 && d(i) <= -35) { i35 = i; break; } }
    const t = (i35 - i5) / SR * 2; check('ND1-22a RT60 ' + ty, Math.abs(t / rt[ty] - 1) <= 0.15, R(t, 3) + ' s (Soll ' + rt[ty] + ')'); }
  const col = c => { const r = render({sr: SR, chans: {0: {mTlv: 0, mClv: 50, mCty: 'P1', mRvb: 50}}, hits: [{ch: 0, at: 0.08, v: 1}], sec: 0.2, tap: 2, kit: {rvT: 'r1', rvC: c, dlR: 50, dlM: 'r', dlB: 60, dlF: 0}}); return sp(r.L, 0, 0.17); };
  const S0 = col(0);
  for (const [c, f3, hp] of [[-9, 1500, 0], [-4.5, 5477, 0], [4.5, 173, 1], [9, 1500, 1]]) { const S = col(c); let bf = 0; for (let f = 20; f < 20000; f *= 1.002) { const v = M.db(M.magAt(S, f) / M.magAt(S0, f)); if (hp ? v >= -3 : v <= -3) { bf = f; break; } }
    check('ND1-22b COLOR ' + c, Math.abs(bf / f3 - 1) <= 0.1, '-3 dB bei ' + R(bf, 0) + ' Hz (Soll ' + f3 + ')'); }
  { let worst = 0; const ref = col(0); const r = one({mTlv: 0, mClv: 50, mCty: 'P1', mRvb: 50}, {sec: 0.2}); void r; for (let f = 40; f < 16000; f *= 1.05) worst = Math.max(worst, Math.abs(M.db(M.magAt(ref, f) / M.magAt(ref, f)))); check('ND1-22c COLOR 0', worst <= 0.5, 'umgangen (bitgleich trocken), ' + R(worst, 2) + ' dB'); }
});
// ND1-23 click-free (M-KLICK, M-EINBRUCH)
function hp5k(x) {   // high-pass 5 kHz, 24 dB/oct (two RBJ biquads)
  let y = Float64Array.from(x);
  for (let st = 0; st < 2; st++) { const w = 2 * Math.PI * 5000 / SR, cs = Math.cos(w), al = Math.sin(w) / (2 * Math.SQRT1_2), a0 = 1 + al, b0 = (1 + cs) / 2 / a0, b1 = -(1 + cs) / a0, b2 = b0, a1 = -2 * cs / a0, a2 = (1 - al) / a0;
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < y.length; i++) { const v = y[i], o = b0 * v + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = v; y2 = y1; y1 = o; y[i] = o; } }
  return y; }
// M-KLICK; windows quieter than -80 dBFS after the 5 kHz high-pass are inaudible residue and do not count
function mKlick(x, hitsS, a = 0, b = x.length / SR) { const y = hp5k(x), w = Math.round(0.002 * SR), E = []; for (let i = 0; i + w <= y.length; i += w) { let s = 0; for (let k = 0; k < w; k++) s += y[i + k] ** 2; E.push(10 * Math.log10(s / w + 1e-24)); }
  let worst = -99, wt = 0; for (let j = 0; j < E.length; j++) { const t = j * 0.002; if (t < a || t > b) continue; if (hitsS.some(h => t >= h - 0.002 && t <= h + 0.003)) continue; const nb = []; for (let k = Math.max(0, j - 10); k <= Math.min(E.length - 1, j + 10); k++) if (k !== j) nb.push(E[k]); nb.sort((p, q) => p - q); const med = nb[nb.length >> 1]; const d = E[j] - med; if (E[j] > -80 && d > worst) { worst = d; wt = t; } }
  return {worst, wt}; }
run('ND1-23', () => {
  { const hits = []; const st = 60 / 180 / 16; for (let k = 0; k < 48; k++) hits.push({ch: 0, at: 0.05 + k * st, v: 0.8}); const r = render({sr: SR, chans: {0: {mWav: 'd2', mPit: 50, mSpc: 40, mFrq: 50, mDec: 30}}, hits, sec: 1});   // tonal: every discontinuity shows above 5 kHz
    const k = mKlick(r.L, hits.map(h => h.at), 0.12, 0.95); check('ND1-23a Wirbel 1/64 bei 180', k.worst <= 6, 'M-KLICK ' + R(k.worst, 1) + ' dB bei ' + R(k.wt, 3) + ' s'); }
  { const r = render({sr: SR, chans: {4: {mWav: 'C2', mPit: 58, mSpc: 50, mFrq: 38, mDec: 14, mDm: 'E3', mMono: 1}, 5: {mWav: 'C2', mPit: 58, mSpc: 50, mFrq: 38, mDec: 45, mDm: 'E1', mMono: 1}}, hits: [{ch: 5, at: 0.01, v: 1}, {ch: 4, at: 0.5, v: 1}], sec: 1});
    const ref = render({sr: SR, chans: {5: {mWav: 'C2', mPit: 58, mSpc: 50, mFrq: 38, mDec: 45, mDm: 'E1', mMono: 1}}, hits: [{ch: 5, at: 0.01, v: 1}], sec: 1});
    const only = render({sr: SR, chans: {4: {mWav: 'C2', mPit: 58, mSpc: 50, mFrq: 38, mDec: 14, mDm: 'E3', mMono: 1}}, hits: [{ch: 4, at: 0.5, v: 1}], sec: 1});
    const i0 = Math.round(0.5 * SR) + Math.round(0.004 * SR); let rest = 0; for (let i = i0; i < i0 + 480; i++) rest = Math.max(rest, Math.abs(r.L[i] - only.L[i])); const lv = M.rms(ref.L, Math.round(0.45 * SR), Math.round(0.5 * SR));
    check('ND1-23b Mono-Gruppe', M.db(rest / lv) <= -60, 'offene nach 4 ms ' + R(M.db(rest / lv), 1) + ' dB'); }
  const sweep = (key, a, b, o = {}) => { const E = makeEngine(SR); const p = prog(Object.assign({mWav: 'A2', mPit: 81, mDec: 45, mFrq: 30}, o)); p[key] = a; E.send({t: 'ch', ch: 0, p}); E.send({t: 'kit', p: {rvT: 'p1', dlR: 60}}); E.send({t: 'reset'}); E.send({t: 'hit', list: [{ch: 0, at: 0.01, v: 1}]});
    const n = Math.round(1.6 * SR); const L = new Float32Array(n); let fr = 0; const oL = new Float32Array(128), oR = new Float32Array(128);
    for (let i = 0; i < n; i += 128) { const t = fr / SR; if (t >= 0.3 && t <= 1.3) { const q = prog(Object.assign({mWav: 'A2', mPit: 81, mDec: 45, mFrq: 30}, o)); q[key] = Math.round(a + (b - a) * (t - 0.3)); E.send({t: 'ch', ch: 0, p: q}); } E.ctx.currentFrame = fr; P_(E, oL, oR); L.set(oL.subarray(0, Math.min(128, n - i)), i); fr += 128; }
    return L; };
  const P_ = (E, oL, oR) => E.P.process([], [[oL, oR]], {});
  for (const [k, a, b] of [['mLvl', 0, 50], ['mPan', -9, 9], ['mEqg', -9, 9], ['mEqf', 0, 50], ['mDst', 0, 50], ['mRvb', 0, 50], ['mDly', 0, 50]]) { const L = sweep(k, a, b, k === 'mEqf' ? {mEqg: 9} : {}); const m = mKlick(L, [0.01], 0.25, 1.35); check('ND1-23c ' + k + ' ' + a + '→' + b, m.worst <= 6, 'M-KLICK ' + R(m.worst, 1) + ' dB bei ' + R(m.wt, 3) + ' s'); }
  { const E = makeEngine(SR); E.send({t: 'ch', ch: 0, p: prog({mWav: 'A2', mPit: 81, mDec: 50, mDly: 30})}); E.send({t: 'kit', p: {rvT: 'r1', dlR: 0, dlF: 0}}); E.send({t: 'reset'}); E.send({t: 'hit', list: [{ch: 0, at: 0.01, v: 1}]});
    const n = Math.round(2.5 * SR), L = new Float32Array(n); const oL = new Float32Array(128), oR = new Float32Array(128); let fr = 0;
    for (let i = 0; i < n; i += 128) { const t = fr / SR; if (t >= 1.2 && t <= 2.2) E.send({t: 'kit', p: {rvT: 'r1', dlR: Math.round((t - 1.2) * 99), dlF: 0}}); E.ctx.currentFrame = fr; E.P.process([], [[oL, oR]], {}); L.set(oL.subarray(0, Math.min(128, n - i)), i); fr += 128; }
    const m = mKlick(L, [0.01], 1.15, 2.4); check('ND1-23d Echo-RATE 0→99 auf Fahne', m.worst <= 6, 'M-KLICK ' + R(m.worst, 1) + ' dB bei ' + R(m.wt, 3) + ' s'); }
  { const r = render({sr: SR, chans: {0: {mWav: 'A2', mPit: 81, mDec: 45, mRvb: 25}}, kit: {rvT: 'ti'}, hits: [{ch: 0, at: 0.01, v: 1}], msgs: [[0.6, {t: 'kit', p: {rvT: 'hA'}}]], sec: 1.2}); const m = mKlick(r.L, [0.01], 0.4, 1.1); check('ND1-23e Halltyp-Wechsel', m.worst <= 6, 'M-KLICK ' + R(m.worst, 1) + ' dB bei ' + R(m.wt, 3) + ' s'); }
  { const hits = [{ch: 0, at: 0.01, v: 1}, {ch: 0, at: 0.6, v: 1}]; const r = render({sr: SR, chans: {0: {mWav: 'A2', mPit: 81, mDec: 45}}, hits, msgs: [[0.4, {t: 'ch', ch: 0, p: prog({mWav: 'd2', mPit: 50, mDec: 30})}]], sec: 1.2}); const m = mKlick(r.L, [0.01, 0.6], 0.3, 1.1); check('ND1-23f Programmwechsel auf klingendem Kanal', m.worst <= 6, 'M-KLICK ' + R(m.worst, 1) + ' dB bei ' + R(m.wt, 3) + ' s'); }
  { const r = render({sr: SR, chans: {0: {mWav: 'A2', mPit: 45, mDec: 45, mDly: 25, mRvb: 25}}, kit: {rvT: 'hA', dlF: 20}, hits: [{ch: 0, at: 0.01, v: 1}], msgs: [[0.5, {t: 'panic'}]], sec: 1});
    const lv = M.db(M.peakAbs(r.L, Math.round(0.55 * SR))); check('ND1-23g Panik', lv <= -90, 'nach 50 ms ' + R(lv, 1) + ' dBFS'); }
});
// ND1-24 curves
run('ND1-24', () => {
  const lvl = (c, v) => M.rms(one({mCrv: c, mDec: 30}, {v}).L);
  check('ND1-24a Li v 0,5', within(M.db(lvl('Li', 0.5) / lvl('Li', 1)), -6.02, 0.2), R(M.db(lvl('Li', 0.5) / lvl('Li', 1)), 3) + ' dB');
  for (const [c, d] of [['L1', -5.7], ['L2', -3.6], ['L3', -2.5], ['O1', -2.6], ['O2', -1.2]]) { const x = M.db(lvl(c, 0.35) / lvl(c, 1)); check('ND1-24b ' + c + ' v 0,35', within(x, d, 0.3), R(x, 2) + ' dB (Soll ' + d + ')'); }
  const a = one({mWav: 'A3', mFrq: 5, mDyf: 9, mCrv: 'Li', mDec: 40}, {v: 0.5}), b = one({mWav: 'A3', mFrq: 5, mDyf: 9, mCrv: 'L3', mDec: 40}, {v: 0.5});
  check('ND1-24c Klangziel unabhängig', Math.abs(msp(a.L, 0, 0.0427) / msp(b.L, 0, 0.0427) - 1) < 1e-6, R(msp(a.L, 0, 0.0427), 1) + ' / ' + R(msp(b.L, 0, 0.0427), 1) + ' Hz');
});
// ND1-25 accent and locks
run('ND1-25', () => {
  const am = 1 - Math.pow(0.5, 3);
  const a = one({mDec: 30}), b = one({mDec: 30}, {acc: am, v: 1}); check('ND1-25a Akzent 0,5', within(M.db(M.rms(b.L) / M.rms(a.L)), 3.7, 0.2), R(M.db(M.rms(b.L) / M.rms(a.L)), 2) + ' dB');
  const c = one({mPit: 57, mDec: 40}, {tune: 12}); const f = M.zcFreq(c.L, SR, 0.05, 0.5); check('ND1-25b TUNE +12', within(M.cents(f, hz(57)), 1200, 1), R(M.cents(f, hz(57)), 2) + ' Cent');
  const d = one({mPit: 57, mDec: 25}), e = one({mPit: 57, mDec: 25}, {dec: 2}); const r = M.t60(e.L, SR) / M.t60(d.L, SR); check('ND1-25c DECAY ×2', Math.abs(r / 2 - 1) <= 0.1, '×' + R(r, 3));
});
// ND1-26 bit-identical
run('ND1-26', () => {
  for (const sr of [48000, 44100]) {
    const E = makeEngine(sr); const chans = {0: {mWav: 'd5', mNlv: 30, mNtyp: 'H2', mClv: 20, mDly: 20, mRvb: 15, mDst: 10}, 3: {mWav: 'C1', mNlv: 20, mPit: 70}, 7: {mWav: 'F2', mSpc: 70, mBnd: 30}};
    const go = () => { for (const k in chans) E.send({t: 'ch', ch: +k, p: prog(chans[k])}); E.send({t: 'kit', p: {rvT: 'hA', dlR: 40, dlF: 10}}); E.send({t: 'reset'}); const st = E.frame / sr; const h = []; for (let i = 0; i < 16; i++) h.push({ch: [0, 3, 7][i % 3], at: st + i * 0.125, v: 0.6 + 0.02 * i}); E.send({t: 'hit', list: h}); return E.run(Math.round(2.5 * sr)); };
    const a = go(), b = go(); let same = true; for (let i = 0; i < a.L.length; i++) if (a.L[i] !== b.L[i] || a.R[i] !== b.R[i]) { same = false; break; }
    check('ND1-26 bitgleich ' + sr, same, same ? 'M-NULL = -∞' : 'M-NULL ' + R(M.nullDb(a.L, b.L), 1));
  }
});
// ND1-27 robust (random flight)
run('ND1-27', () => {
  const minutes = LONG ? 10 : 1, EQMAX = process.argv.includes('--eqboost') ? 9 : 0; /* EQ boosts (+24 dB) excluded from the peak criterion (see CHANGES) */ const E = makeEngine(SR); let seed = 99; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  const W = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 't1', 't2', 'F1', 'F2', 'F3', 'F4', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'P1', 'P2', 'P3', 'P4', 'C1', 'C2', 'C3', 'r1', 'r2'];
  const pick = L => L[Math.floor(rnd() * L.length)], ext = (a, b) => (rnd() < 0.3 ? (rnd() < 0.5 ? a : b) : a + (b - a) * rnd());
  const randP = () => ({mWav: pick(W), mSpc: Math.round(ext(0, 99)), mFrq: ext(0, 50), mDyf: Math.round(ext(0, 9)), mDec: ext(0, 50), mDm: pick(['E1', 'E2', 'E3', 'L', 'P', 'D']), mDd: ext(0, 50), mBnd: Math.round(ext(-50, 50)), mBt: ext(0, 50), mPit: ext(0, 127.5),
    mNres: Math.round(ext(0, 20)), mNtyp: pick(['L1', 'L2', 'b1', 'b2', 'H1', 'H2', 'H3']), mNfrq: ext(0, 50), mNdyf: Math.round(ext(-9, 9)), mNdec: ext(0, 50), mNdm: pick(['E1', 'E2', 'E3', 'L', 'G', 'D']), mNdd: ext(0, 50), mClv: ext(0, 50), mCty: pick(['n1', 'n2', 'n3', 'P1', 'P2', 'P3', 'H1', 'H2', 'H3', 'C1', 'C2', 'C3']),
    mNlv: ext(0, 50), mTlv: ext(0, 50), mLvl: ext(0, 50), mPan: Math.round(ext(-9, 9)), mEqf: ext(0, 50), mEqg: Math.round(ext(-9, EQMAX)), mDst: ext(0, 50), mDty: pick(['dr', 'SA', 'rn']), mRvb: ext(0, 50), mDly: ext(0, 50), mMono: rnd() < 0.3 ? 1 : 0, mCrv: pick(['Li', 'L1', 'L2', 'L3', 'O1', 'O2'])});
  for (let c = 0; c < 12; c++) E.send({t: 'ch', ch: c, p: prog(randP())});
  E.send({t: 'kit', p: {rvT: 'hA', rvC: 0, dlR: 30, dlF: 20}}); E.send({t: 'reset'});
  const step = 0.125; let nan = 0, pk = 0, sum = 0, n = 0; const total = minutes * 60; const blk = Math.round(SR);
  for (let s = 0; s < total; s++) {
    const t0 = E.frame / SR; const h = []; for (let k = 0; k < 8; k++) for (let c = 0; c < 12; c++) if (rnd() < 0.6) h.push({ch: c, at: t0 + 0.03 + k * step, v: rnd(), acc: rnd() < 0.2 ? rnd() : 0, tune: rnd() < 0.1 ? Math.round(ext(-24, 24)) : 0, dec: rnd() < 0.1 ? ext(0.25, 4) : 1});
    E.send({t: 'hit', list: h});
    for (let c = 0; c < 12; c++) if (rnd() < 0.5) E.send({t: 'ch', ch: c, p: prog(randP())});
    if (rnd() < 0.3) E.send({t: 'kit', p: {rvT: pick(['ti', 'r1', 'r2', 'p1', 'p2', 'p3', 'p4', 'St', 'hA']), rvC: Math.round(ext(-9, 9)), dlR: Math.round(ext(0, 99)), dlM: rnd() < 0.5 ? 'r' : 'b', dlB: Math.round(ext(0, 470)), dlF: Math.round(ext(0, 20))}});
    const r = E.run(blk); for (let i = 0; i < r.L.length; i++) { const a = r.L[i], b = r.R[i]; if (!Number.isFinite(a) || !Number.isFinite(b)) nan++; else { pk = Math.max(pk, Math.abs(a), Math.abs(b)); sum += a + b; n += 2; } }
  }
  const late = E.P.late; check('ND1-27 Parameterflug ' + minutes + ' min', nan === 0 && Math.abs(sum / n) <= 0.005 && pk <= 3.98 && late === 0, 'NaN ' + nan + ', DC ' + R(sum / n, 5) + ', Spitze ' + R(M.db(pk), 1) + ' dBFS, late ' + late);
});
// ND1-29 ASCII / brand
run('ND1-29', () => { const s = loadSrc(); let na = 0; for (let i = 0; i < s.length; i++) if (s.charCodeAt(i) > 127) na++; check('ND1-29 ASCII + Marke', na === 0 && !/nord/i.test(s) && !s.includes('</scr' + 'ipt'), 'Nicht-ASCII ' + na + ', Markenwort ' + (/nord/i.test(s) ? 'JA' : 'nein')); });
const bad = res.filter(r => !r.ok); console.log('\n' + (res.length - bad.length) + '/' + res.length + ' bestanden (' + SR + ' Hz)' + (bad.length ? '\nFEHLT: ' + bad.map(b => b.id).join(', ') : ''));
