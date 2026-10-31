// BM3 acceptance (Nachtrag 7 Rev. 2, section 6 BM3-01 ... BM3-11) + the FX parts of BM2-05 (LFO/MW/AT -> fx1t fx2t fx1b fx2b) and
// BM2-09 (TIME FX OFF). Node, processor of bau/helfer/BMK/index.html. ONLY=regex. Writes bm3-fx.out.json.
import fs from 'fs';
import {render, on, off} from './bm-node.mjs';
import {db, pdb, rms, fft, mKlick} from '../../../tests/v3-mk1-ana.mjs';
const HERE = new URL('.', import.meta.url).pathname, SR = 48000;
let fails = 0; const res = [];
const ok = (id, c, info) => { if (!c) fails++; const line = (c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : ''); res.push({id, ok: !!c, info}); console.log(line); };
const only = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
const T = (id, f) => { if (only && !only.test(id)) return; try { f(); } catch (e) { ok(id, false, 'Fehler ' + (e.stack || e)); } };
const R = (x, d = 1) => Math.round(x * 10 ** d) / 10 ** d;
const deep = (a, b) => { const o = JSON.parse(JSON.stringify(a)); for (const k in b || {}) o[k] = b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && o[k] && typeof o[k] === 'object' ? deep(o[k], b[k]) : b[k]; return o; };
const SINE = {o1: {m: 31, e: {l: 99, a: 0, d: 0, s: 15, r: 0}}, o2: {e: {l: 0}}, n: {e: {l: 0}}, f: {md: 'hp', cu: 0}, g: {vo: 80}};
const prog = (x) => ({t: 'prog', ab: 'a', p: deep(SINE, x)});
// a held tone at f Hz (note 69, TUNE = f) through the program x
const tone = (f, x, sec = 1, extra) => render([[0, prog(x)], [0, {t: 'gl', p: {tn: f}}], [0, on(0, 69, .8)]].concat(extra || []), {sec});
function amp(x, i0, n, f) { let re = 0, im = 0, ws = 0; for (let i = 0; i < n; i++) { const w = .5 - .5 * Math.cos(2 * Math.PI * i / n), a = 2 * Math.PI * f * i / SR; re += x[i0 + i] * w * Math.cos(a); im += x[i0 + i] * w * Math.sin(a); ws += w; } return 2 * Math.hypot(re, im) / ws; }
function spec(x, i0, n) { const re = new Float64Array(n), im = new Float64Array(n); for (let i = 0; i < n; i++) re[i] = x[i0 + i] * (.5 - .5 * Math.cos(2 * Math.PI * i / n)); fft(re, im); const P = new Float64Array(n / 2); for (let k = 0; k < n / 2; k++) P[k] = re[k] ** 2 + im[k] ** 2; return P; }
// zero-crossing times (interpolated) of x in [i0, i1)
function zc(x, i0, i1) { const o = []; for (let i = i0 + 1; i < i1; i++) if (x[i - 1] < 0 && x[i] >= 0) o.push(i - 1 + (-x[i - 1]) / (x[i] - x[i - 1])); return o; }

T('BM3-01', () => {
  const a = tone(100, {fx: {t1: 'CH5', b1: 0}}, .6), b = tone(100, {fx: {t1: 'DT9', b1: 0, t2: 'RV3', b2: 0}}, .6); let d = 0; for (let i = 0; i < a.l.length; i++) d = Math.max(d, Math.abs(a.l[i] - b.l[i]));
  // BAL 50 / 100 with a ring modulator (wet has no 100 Hz component)
  const lv = b1 => amp(tone(100, {fx: {t1: 'RM16', b1}}, .6).l, 9600, 16384, 100), l0 = lv(0), l50 = db(lv(50) / l0), l100 = db(lv(100) / l0);
  ok('BM3-01 BAL 0 → trocken bitgleich (Weg umgangen); 50 → trocken −6,02 ± 0,1 dB; 100 → trocken ≤ −90 dB', d === 0 && Math.abs(l50 + 6.02) <= .1 && l100 <= -90, 'Differenz bei 0: ' + d + '; 50: ' + R(l50, 3) + ' dB; 100: ' + R(l100) + ' dB');
});
T('BM3-02', () => {
  // CH1-14: pitch swing of a 1 kHz sine (wet only): f(t) = f0 (1 - d'(t)), d(t) = 7 ms + D sin(2 pi f t): swing +- 2 pi f D, rate f
  const CH = [[.15, 2.5], [.25, 3.0], [.35, 1.5], [.5, 2.5], [.7, 1.2], [.9, 2.0], [1.2, 1.0], [1.5, 1.8], [2.0, .8], [2.5, 1.4], [3.2, .6], [4.0, 1.0], [5.5, .5], [7.0, .8]];
  let wr = 0, wd = 0; const rows = [];
  for (let n = 1; n <= 14; n++) {
    const [hz, D] = CH[n - 1], sec = Math.max(2.2, 2.5 / hz + .5), r = tone(1000, {fx: {t1: 'CH' + n, b1: 100}}, sec);
    for (const ch of ['l', 'r']) {
      const z = zc(r[ch], 4800, r[ch].length - 10), fi = [], ti = []; for (let k = 1; k < z.length; k++) { fi.push(SR / (z[k] - z[k - 1])); ti.push((z[k] + z[k - 1]) / 2 / SR); }
      // fit f(t) = f0 + A sin(2 pi F t + p) by a scan over F around hz and least squares
      let best = null; for (let F = hz * .8; F <= hz * 1.2; F += hz * .002) { let sc = 0, cc = 0, ss = 0, sc2 = 0, m = 0; for (let k = 0; k < fi.length; k++) m += fi[k]; m /= fi.length;
        for (let k = 0; k < fi.length; k++) { const a = 2 * Math.PI * F * ti[k], s = Math.sin(a), c = Math.cos(a), y = fi[k] - m; sc += y * s; cc += y * c; ss += s * s; sc2 += c * c; }
        const A = Math.hypot(sc / ss, cc / sc2), q = Math.hypot(sc, cc); if (!best || q > best.q) best = {F, A, q}; }
      const wantA = 1000 * 2 * Math.PI * hz * D / 1000; wr = Math.max(wr, Math.abs(best.F / hz - 1)); wd = Math.max(wd, Math.abs(best.A / wantA - 1)); if (ch === 'l') rows.push('CH' + n + ' ' + R(best.F, 3) + ' Hz/' + R(best.A, 2) + ' Hz');
    }
  }
  ok('BM3-02 CH1–14 Tempo und Tiefe ± 5 % (Tonhöhenschwankung eines 1-kHz-Sinus, L und R)', wr <= .05 && wd <= .05, 'größte Abw. Tempo ' + R(wr * 100, 2) + ' %, Tiefe ' + R(wd * 100, 2) + ' %; ' + rows.join(', '));
  // CH15 / 16 on the unit: white noise; the notch sits at the allpass frequency, which sweeps 200 Hz (LFO -1) ... 3 kHz (LFO +1)
  const {BMK} = render([], {sec: .01}), notch = [];
  for (const n of [15, 16]) {
    const hz = n === 15 ? .25 : .8, N = Math.round(SR / hz) + 8192, U = new BMK.FxUnit(1, SR); U.set('CH', n); const x = new Float32Array(N), yl = new Float32Array(N), yr = new Float32Array(N);
    let z = 7; for (let i = 0; i < N; i++) { z ^= z << 13; z ^= z >>> 17; z ^= z << 5; x[i] = z / 2147483648 * .3; } U.run(x, x, yl, yr, 0, N, {sy: 0, bpm: 120});
    const at = (frac, f) => { const c = Math.round(frac / hz * SR) - 2048; let P = new Float64Array(2048); for (let o = -2; o <= 2; o++) { const Q = spec(yl, c + o * 512, 4096); for (let k = 0; k < 2048; k++) P[k] += Q[k]; }
      const k0 = Math.round(f / SR * 4096); let band = 0, nb = 0; for (let k = Math.round(k0 / 2); k <= k0 * 2; k++) { band += P[k]; nb++; } return pdb(P[k0] / (band / nb)); };
    notch.push([n, at(.75, 200), at(.25, 3000)]);
  }
  ok('BM3-02 CH15/16 wandernde Kerben 200 Hz – 3 kHz (Kerbe am unteren und oberen Ende ≥ 10 dB unter dem Umfeld)', notch.every(([, a, b]) => a <= -10 && b <= -10), notch.map(([n, a, b]) => 'CH' + n + ' 200 Hz ' + R(a) + ' dB, 3 kHz ' + R(b) + ' dB').join(', '));
});
T('BM3-03', () => {
  // DT1-16 on a 220 Hz sine (INIT level chain): THD rises with n; odd n: even harmonics <= -50 dB; even n: 2nd >= -30 dB; level +- 3 dB
  const h = (x, k) => amp(x, 9600, 32768, 220 * k);
  const FS = {g: {vo: 99}}, VEL = [[0, {t: 'ctl', mw: 0}]];
  const toneF = (x) => render([[0, prog(deep(FS, x))], [0, {t: 'gl', p: {tn: 220}}], [0, on(0, 69, 1)]], {sec: .9});
  const dry = toneF({fx: {t1: 'DT1', b1: 0}}), ld = rms(dry.l, 9600, 41536);
  let prev = [-999, -999], mono = true, oddEven = -999, evenH2 = 0, lvl = 0; const rows = [];
  for (let n = 1; n <= 16; n++) {
    const r = toneF({fx: {t1: 'DT' + n, b1: 100}}), a1 = h(r.l, 1); let hh = 0; for (let k = 2; k <= 20; k++) hh += h(r.l, k) ** 2;
    const thd = pdb(hh / a1 ** 2); if (thd <= prev[n % 2]) mono = false; prev[n % 2] = thd;
    let ev = -999; for (let k = 2; k <= 10; k += 2) ev = Math.max(ev, db(h(r.l, k) / a1));
    if (n % 2) oddEven = Math.max(oddEven, ev); else evenH2 = Math.min(evenH2, db(h(r.l, 2) / a1));
    const lc = db(rms(r.l, 9600, 41536) / ld); if (Math.abs(lc) > Math.abs(lvl)) lvl = lc; rows.push('DT' + n + ' ' + R(thd) + '/' + R(lc, 2));
  }
  ok('BM3-03 DT1–16 (Sinus 220 Hz voll ausgesteuert, VOL 99, Anschlag 1): Klirrfaktor steigt streng (je ungerade / gerade n); ungerade n gerade Obertöne ≤ −50 dB; gerade n 2. Oberton ≥ −30 dB; Pegel ± 3 dB', mono && oddEven <= -50 && evenH2 >= -30 && Math.abs(lvl) <= 3,
    'streng steigend je Reihe ' + mono + ', ungerade: gerade max ' + R(oddEven) + ' dB, gerade: 2. min ' + R(evenH2) + ' dB, Pegel größte Abw. ' + R(lvl, 2) + ' dB; THD/Pegel ' + rows.join(', '));
});
T('BM3-04', () => {
  // BC: images of a 1 kHz sine at rate - f (rate from the image +- 2 %); output levels on the bit grid; BC9-16: rate swings with 0.3 Hz
  const RATE = [SR / 2, SR / 3, SR / 4, SR / 6, SR / 8, 11025, 8000, 5512], BITS = [12, 10, 9, 8, 7, 6, 5, 4]; let w = 0, grid = 0; const rows = [];
  for (let k = 1; k <= 8; k++) {
    const r = tone(1000, {fx: {t1: 'BC' + k, b1: 100}}, .6), P = spec(r.l, 9600, 16384), want = RATE[k - 1] - 1000, k0 = Math.round(want / SR * 16384); let kb = k0, vb = 0;
    for (let j = k0 - 40; j <= k0 + 40; j++) if (j > 0 && j < 8192 && P[j] > vb) { vb = P[j]; kb = j; }
    const got = kb * SR / 16384 + 1000; w = Math.max(w, Math.abs(got / RATE[k - 1] - 1)); rows.push('BC' + k + ' ' + R(got));
  }
  // the bit grid on BC1 (odd: no low pass): every held value is a multiple of 2^-(bits-1) before the output gain
  // (the unit itself: BC5 = 7 bits, odd = no low pass; a sine through it, every output on the grid 2^-6)
  const {BMK} = render([], {sec: .01}), U = new BMK.FxUnit(1, SR); U.set('BC', 5); const xi = new Float32Array(4096), yo = new Float32Array(4096), yo2 = new Float32Array(4096);
  for (let i = 0; i < 4096; i++) xi[i] = .7 * Math.sin(2 * Math.PI * 1000 * i / SR); U.run(xi, xi, yo, yo2, 0, 4096, {sy: 0, bpm: 120}); const tp = {n: 4096};
  const lv = new Set(); for (let i = 0; i < 4096; i++) { if (Math.abs(yo[i] * 64 - Math.round(yo[i] * 64)) > 1e-9) grid++; lv.add(yo[i]); }
  // BC9: the image moves with 0.3 Hz
  const r9 = tone(1000, {fx: {t1: 'BC13', b1: 100}}, 7.2), pos = []; for (let s = 9600; s + 4096 <= r9.l.length; s += 960) { const P = spec(r9.l, s, 4096); let kb = 0, vb = 0; for (let j = 120; j < 900; j++) if (P[j] > vb) { vb = P[j]; kb = j; } pos.push(kb); }
  const m9 = pos.reduce((a, b) => a + b) / pos.length, up = []; for (let i = 1; i < pos.length; i++) if (pos[i - 1] < m9 && pos[i] >= m9) up.push(i); const per = (up[up.length - 1] - up[0]) / (up.length - 1) * 960 / SR;
  ok('BM3-04 BC1–8 Rate nach Tabelle (Spiegelbild ± 2 %), Raster der Auflösung; BC9–16 Rate schwankt mit 0,3 Hz ± 5 % (an BC13)', w <= .02 && grid === 0 && Math.abs(1 / per / .3 - 1) <= .05,
    'Rate größte Abw. ' + R(w * 100, 2) + ' % (' + rows.join(', ') + '); BC5 7 Bit: ' + (tp ? tp.n : 0) + ' Werte, ' + grid + ' neben dem Raster; BC9 Schwankung ' + R(1 / per, 3) + ' Hz');
});
T('BM3-05', () => {
  // RM n >= 8: sidebands at f +- fn (+- 1 %); RM1-4: L / R envelopes 90 degrees apart (+- 5)
  let w = 0; const rows = [];
  for (let n = 8; n <= 16; n++) { const fn = .4 * Math.pow(2, .84 * (n - 1)), r = tone(3000, {fx: {t1: 'RM' + n, b1: 100}}, .6), P = spec(r.l, 9600, 16384);
    for (const want of [3000 + fn, 3000 - fn]) { const k0 = Math.round(want / SR * 16384), wdw = Math.max(1, Math.min(20, Math.floor(fn / (SR / 16384) / 2))); let kb = k0, vb = 0; for (let j = k0 - wdw; j <= k0 + wdw; j++) if (P[j] > vb) { vb = P[j]; kb = j; } const la = Math.log(P[kb - 1]), lb = Math.log(P[kb]), lc = Math.log(P[kb + 1]), got = (kb + .5 * (la - lc) / (la - 2 * lb + lc)) * SR / 16384; w = Math.max(w, Math.abs(got - want) / fn); }
    rows.push('RM' + n + ' ' + R(fn)); }
  let wp = 0; const ph = [];
  for (let n = 1; n <= 4; n++) { const fn = .4 * Math.pow(2, .84 * (n - 1)), sec = 2 / fn + .3, r = tone(1000, {fx: {t1: 'RM' + n, b1: 100}}, sec);
    // signed envelope: product with the 1 kHz carrier... use the envelope of |x| low passed, fit the phase of fn on L and R
    const NP = Math.floor((x0 => x0)(Math.round(Math.floor((sec - .2) * fn) / fn * SR))); const fit = x => { let s = 0, c = 0; for (let i = 4800; i < 4800 + NP; i++) { const a = 2 * Math.PI * fn * i / SR; s += x[i] * Math.sin(2 * Math.PI * 1000 * i / SR) * Math.sin(a); c += x[i] * Math.sin(2 * Math.PI * 1000 * i / SR) * Math.cos(a); } return Math.atan2(c, s); };
    let d = (fit(r.l) - fit(r.r)) * 180 / Math.PI; d = ((d % 360) + 540) % 360 - 180; ph.push(R(d)); wp = Math.max(wp, Math.abs(Math.abs(d) - 90)); }
  ok('BM3-05 RM8–16 Seitenbänder bei f ± fn (± 1 %); RM1–4 L/R 90° ± 5°', w <= .01 && wp <= 5, 'größte Abw. ' + R(w * 100, 2) + ' % von fn; Phasen L−R ' + ph.join(' / ') + '°');
});
// an impulse-like source: a short noise-free click (mask 31 at 2 kHz, 1 ms) through FX2 at BAL 100
const click = (x, sec, extra) => render([[0, prog(deep({o1: {m: 31, e: {l: 99, a: 0, d: 1, s: 0, r: 0}}, f: {md: 'hp', cu: 0}}, x))], [0, {t: 'gl', p: {tn: 500}}], [0, on(.01, 69, .8)], [0, off(.012, 69)]].concat(extra || []), {sec});
T('BM3-06', () => {
  // DL1-16 on the unit itself (an impulse): echo time = centroid of echo 1 (linear interpolation keeps sum and centroid),
  // decay per echo = sum(echo 3) / sum(echo 1) / 2 in dB against the feedback; ping-pong (n <= 4): echo 1 left, 2 right, 3 left
  const {BMK} = render([], {sec: .01}); let wt = 0, wdk = 0, pp = true; const rows = [];
  for (let n = 1; n <= 16; n++) {
    const t = 800 * Math.pow(1 / 800, (n - 1) / 15) / 1000, fb = n <= 6 ? .45 : n <= 10 ? .6 : .75, ts = t * SR, N = Math.ceil(3.6 * ts) + 400;
    const U = new BMK.FxUnit(2, SR); U.set('DL', n); const x = new Float32Array(N), yl = new Float32Array(N), yr = new Float32Array(N); x[100] = 1; U.run(x, x, yl, yr, 0, N, {sy: 0, bpm: 120});
    const ech = (y, k) => { const c = 100 + k * ts, a = Math.max(0, Math.floor(c - Math.min(ts / 2, 50))), e = Math.min(N, Math.ceil(c + Math.min(ts / 2, 50))); let s0 = 0, s1 = 0; for (let i = a; i < e; i++) { s0 += y[i]; s1 += i * y[i]; } return {sum: s0, c: s1 / s0}; };
    const yE = (k) => (n <= 4 && k % 2 === 0 ? yr : yl);
    const e1 = ech(yE(1), 1), e3 = ech(yE(3), 3), t1 = (e1.c - 100) / SR, tol = n >= 10 ? .00005 : .001;
    wt = Math.max(wt, Math.abs(t1 - t) / tol); const dk = db(e3.sum / e1.sum) / 2; wdk = Math.max(wdk, Math.abs(dk - db(fb)));
    if (n <= 4) { const l2 = Math.abs(ech(yl, 2).sum), r2 = Math.abs(ech(yr, 2).sum), r1 = Math.abs(ech(yr, 1).sum); if (!(l2 < 1e-6 && r1 < 1e-6 && r2 > 1e-3)) pp = false; }
    rows.push('DL' + n + ' ' + R(t1 * 1000, 3) + ' ms/' + R(dk, 2) + ' dB');
  }
  // the whole path (processor, BAL 100): comb peaks for n >= 11 with noise at multiples of 1 / t
  const t = 800 * Math.pow(1 / 800, 12 / 15) / 1000, rn = render([[0, {t: 'prog', ab: 'a', p: deep(SINE, {o1: {e: {l: 0}}, n: {fr: 99, e: {l: 99, a: 0, d: 0, s: 15}}, fx: {t2: 'DL13', b2: 50}})}], [0, on(0, 60)]], {sec: 3});
  const P = new Float64Array(8192); for (let s0 = 9600; s0 + 16384 <= rn.l.length; s0 += 8192) { const Q = spec(rn.l, s0, 16384); for (let k = 0; k < 8192; k++) P[k] += Q[k]; }
  let comb = 0; for (let m = 1; m <= 5; m++) { const k0 = Math.round(m / t / SR * 16384); let km = k0, vm = 0; for (let j = k0 - 6; j <= k0 + 6; j++) if (P[j] > vm) { vm = P[j]; km = j; } if (Math.abs(km - k0) <= 2) comb++; }
  ok('BM3-06 DL1–16 Zeit ± 1 ms (n ≥ 10 ± 0,05 ms), Abfall je Wiederholung ± 0,3 dB, Ping-Pong n ≤ 4, Kammspitzen bei Vielfachen von 1/t', wt <= 1 && wdk <= .3 && pp && comb === 5,
    'Zeit (Anteil der Toleranz) max ' + R(wt, 3) + ', Abfall größte Abw. ' + R(wdk, 3) + ' dB (Soll −6,94 / −4,44 / −2,50 dB), Ping-Pong ' + pp + ', Kamm ' + comb + '/5; ' + rows.join(', '));
});
T('BM3-07', () => {
  // RV1-16: M-T60 (envelope = |x| smoothed 2 ms, in dB; regression -5 ... -35 dB under the peak, to -60 dB), noise burst 20 ms
  let w = 0; const rows = [];
  for (const n of [1, 2, 4, 6, 8, 10, 12, 14, 16]) {
    const rt = 8 * Math.pow(.3 / 8, (n - 1) / 15), sec = Math.min(10, rt * 1.1 + .4);
    const r = render([[0, {t: 'prog', ab: 'a', p: deep(SINE, {o1: {e: {l: 0}}, n: {fr: 99, e: {l: 99, a: 0, d: 0, s: 15, r: 0}}, fx: {t2: 'RV' + n, b2: 100}})}], [0, on(.01, 60)], [0, off(.03, 60)]], {sec});
    const W = 96, env = []; for (let i = 0; i + W <= r.l.length; i += W) { let e = 0; for (let j = i; j < i + W; j++) e += r.l[j] ** 2 + r.r[j] ** 2; env.push(pdb(e / W)); }
    let ip = 0; for (let i = 0; i < env.length; i++) if (env[i] > env[ip]) ip = i;
    const pts = []; for (let i = ip; i < env.length; i++) { const d = env[i] - env[ip]; if (d <= -5 && d >= -35) pts.push([i * W / SR, d]); if (d < -35) break; }
    const mx = pts.reduce((a, b) => a + b[0], 0) / pts.length, my = pts.reduce((a, b) => a + b[1], 0) / pts.length; let sxy = 0, sxx = 0; for (const [x, y] of pts) { sxy += (x - mx) * (y - my); sxx += (x - mx) ** 2; }
    const got = -60 / (sxy / sxx); w = Math.max(w, Math.abs(got / rt - 1)); rows.push('RV' + n + ' ' + R(got, 2) + '/' + R(rt, 2) + ' s');
  }
  ok('BM3-07 RV1–16 RT60 ± 15 % der Formel (M-T60)', w <= .15, 'größte Abw. ' + R(w * 100, 1) + ' %; ' + rows.join(', '));
});
T('BM3-08', () => {
  // LFO1 -> fx1t (square, 99): the type steps inside its family, every change with a 30 ms crossfade; M-KLICK <= 6 dB
  const r = render([[0, prog({o1: {m: 7, e: {l: 99, a: 8, d: 0, s: 15, r: 0}}, fx: {t1: 'CH4', b1: 70}, l1: {sp: 30, w: 'sqr', t: [['fx1t', 99], ['flt', 0], ['mask', 0], ['vol', 0]]}})], [0, on(0, 81, .8)]], {sec: 3});
  const after = x => x.subarray(Math.round(.4 * SR)), k = mKlick(after(r.l), SR);
  const r2 = render([[0, prog({o1: {m: 7, e: {l: 99, a: 8, d: 0, s: 15, r: 0}}, fx: {t2: 'DL5', b2: 50}, l1: {sp: 30, w: 'step', t: [['fx2t', 99], ['flt', 0], ['mask', 0], ['vol', 0]]}})], [0, on(0, 81, .8)]], {sec: 3}), k2 = mKlick(after(r2.l), SR);
  ok('BM3-08 LFO → FX1-/FX2-Typ: Wechsel in der Familie mit 30-ms-Blende, M-KLICK ≤ 6 dB (Säge A5, nach dem Attack)', k.worst <= 6 && k2.worst <= 6, 'FX1 CH: ' + R(k.worst, 2) + ' dB, FX2 DL: ' + R(k2.worst, 2) + ' dB');
});
T('BM3-09', () => {
  for (const t2 of ['DL16', 'RV1']) {
    const x = {fx: {t2, b2: 100}, o1: {m: 7, e: {l: 99, a: 0, d: 0, s: 15, r: 0}}};
    const a = render([[0, prog(x)], [0, on(.01, 60)], [.4, {t: 'panic'}]], {sec: .6}), i0 = Math.floor(.4 * SR / 128) * 128 + Math.round(.05 * SR);
    let pk = 0; for (let i = i0; i < a.l.length; i++) pk = Math.max(pk, Math.abs(a.l[i]), Math.abs(a.r[i]));
    const b = render([[0, prog(x)], [0, on(.01, 60)], [0, {t: 'stop', at: .4, tau: .02}]], {sec: .6}), tail = rms(b.l, Math.round((t2 === 'DL16' ? .41 : .5) * SR), Math.round((t2 === 'DL16' ? .42 : .55) * SR));
    ok('BM3-09 Panik: Fahne ' + t2 + ' ≤ −90 dBFS nach 50 ms; ■: Fahne klingt aus', db(pk) <= -90 && db(tail) > -60, 'nach Panik ' + R(db(pk)) + ' dBFS; nach ■ Fahne ' + R(db(tail)) + ' dBFS');
  }
});
T('BM3-11', () => {
  const tOf = (n, sy, bpm) => { const r = click({fx: {t2: 'DL' + n, b2: 100, sy}}, .03 + 1.2, [[0, {t: 'tr', run: true, at: 0, bpm}]]); const dry = click({fx: {t2: 'DL1', b2: 0}}, .1).l;
    const corr = j => { let s = 0; for (let i = 0; i < 960; i++) s += r.l[j + i] * dry[480 + i]; return s; }; let best = 0, bv = -1e9; for (let j = 480 + 200; j < r.l.length - 1000; j++) { const v = corr(j); if (v > bv) { bv = v; best = j; } }
    const a = corr(best - 1), b = corr(best), c = corr(best + 1); return ((best + .5 * (a - c) / (a - 2 * b + c)) - 480) / SR; };
  const want = [750, 500, 375, 187.5, 125, 93.75, 62.5, 31.25]; let w = 0; const rows = [];
  for (let n = 1; n <= 8; n++) { const t = tOf(n, 1, 120) * 1000; w = Math.max(w, Math.abs(t - want[n - 1])); rows.push('DL' + n + ' ' + R(t, 3)); }
  let w2 = 0; for (const n of [9, 12, 16]) w2 = Math.max(w2, Math.abs(tOf(n, 1, 120) - tOf(n, 0, 120)) * 1000);
  // OFF: bit-equal to a program without the field
  const a = click({fx: {t2: 'DL3', b2: 60, sy: 0}}, .8), b = render([[0, {t: 'prog', ab: 'a', p: (() => { const p = deep(SINE, {o1: {m: 31, e: {l: 99, a: 0, d: 1, s: 0, r: 0}}, fx: {t2: 'DL3', b2: 60}}); delete p.fx.sy; return p; })()}], [0, {t: 'gl', p: {tn: 500}}], [0, on(.01, 69, .8)], [0, off(.012, 69)]], {sec: .8});
  let d = 0; for (let i = 0; i < a.l.length; i++) d = Math.max(d, Math.abs(a.l[i] - b.l[i]));
  // tempo 120 -> 90 while a held saw goes through DL2 SYNC: the time glides in 50 ms, M-KLICK
  const rk = render([[0, prog({o1: {m: 7, e: {l: 99, a: 8, d: 0, s: 15, r: 0}}, fx: {t2: 'DL2', b2: 50, sy: 1}})], [0, {t: 'tr', run: true, at: 0, bpm: 120}], [0, on(.01, 81, .8)], [1, {t: 'bpm', bpm: 90}]], {sec: 2.2}), k = mKlick(rk.l.subarray(Math.round(.85 * SR)), SR);   // after the attack and its first echo
  ok('BM3-11 SYNC: ON bei 120 BPM DL1–8 = Notenwerte ± 0,1 ms; DL9–16 unverändert; OFF bitgleich ohne Feld; 120 → 90 BPM gleitet, M-KLICK ≤ 6 dB', w <= .1 && w2 <= .01 && d === 0 && k.worst <= 6,
    rows.join(', ') + ' ms (größte Abw. ' + R(w, 3) + '); DL9–16 Abw. ' + R(w2, 4) + ' ms; OFF Differenz ' + d + '; Tempowechsel M-KLICK ' + R(k.worst, 2) + ' dB');
});
T('BM2-05fx', () => {
  // the four FX targets act (LFO -> fx1t / fx2t / fx2b, MW -> fx1b / fx2b, AT -> fx1b)
  const P = x => deep({o1: {m: 7, e: {l: 99}}, fx: {t1: 'CH4', b1: 50, t2: 'DL5', b2: 40}, l1: {sp: 60, w: 'sqr'}}, x);
  const run = (x, ctl) => render([[0, prog(P(x))], [0, on(.01, 57, .8)]].concat(ctl ? [[0, {t: 'ctl', mw: 1, pr: 1}]] : []), {sec: .8});
  const diff = (a, b) => { const d = new Float32Array(a.l.length); for (let i = 0; i < d.length; i++) d[i] = a.l[i] - b.l[i]; return db(rms(d, 4800) / rms(b.l, 4800)); };
  const L = (t, a) => ({l1: {t: [[t, a], ['flt', 0], ['mask', 0], ['vol', 0]]}}), M = (t, a) => ({mo: {mw: [[t, a], ['flt', 0], ['mask', 0], ['vol', 0]]}}), A = (t, a) => ({mo: {at: [[t, a], ['flt', 0], ['mask', 0], ['vol', 0]]}});
  const rows = [['LFO→fx1t', diff(run(L('fx1t', 99)), run(L('fx1t', 0)))], ['LFO→fx2t', diff(run(L('fx2t', 99)), run(L('fx2t', 0)))], ['LFO→fx2b', diff(run(L('fx2b', 99)), run(L('fx2b', 0)))],
    ['MW→fx1b', diff(run(M('fx1b', 99), 1), run(M('fx1b', 0), 1))], ['MW→fx2b', diff(run(M('fx2b', -99), 1), run(M('fx2b', 0), 1))], ['AT→fx1b', diff(run(A('fx1b', -99), 1), run(A('fx1b', 0), 1))]];
  ok('BM2-05 FX-Ziele wirken messbar (fx1t, fx2t, fx1b, fx2b)', rows.every(r => r[1] > -40), rows.map(r => r[0] + ' ' + R(r[1]) + ' dB').join(', '));
});
T('BM2-09fx', () => {
  // TIME FX OFF: DL and RV bypassed (bit-equal to BAL 0), DT stays
  const run = (t2, b2, tf) => render([[0, prog({o1: {m: 7, e: {l: 99}}, fx: {t2, b2}})], [0, {t: 'gl', p: {tf}}], [0, on(.01, 57, .8)], [0, off(.3, 57)]], {sec: .8});
  const same = (a, b) => { let d = 0; for (let i = 0; i < a.l.length; i++) d = Math.max(d, Math.abs(a.l[i] - b.l[i]), Math.abs(a.r[i] - b.r[i])); return d; };
  const dl = same(run('DL3', 70, 0), run('DL3', 0, 1)), rv = same(run('RV2', 70, 0), run('RV2', 0, 1)), dt = same(run('DT6', 70, 0), run('DT6', 0, 1));
  ok('BM2-09 TIME FX OFF → DL/RV umgangen (bitgleich trocken), DT bleibt', dl === 0 && rv === 0 && dt > 1e-3, 'DL3 Differenz ' + dl + ', RV2 ' + rv + ', DT6 wirkt (' + R(dt, 3) + ')');
});
console.log('\n' + (fails ? fails + ' FEHLER' : 'alles bestanden') + ' (' + res.length + ' Prüfungen)');
fs.writeFileSync(HERE + 'bm3-fx.out.json', JSON.stringify(res, null, 1));
process.exit(fails ? 1 : 0);
