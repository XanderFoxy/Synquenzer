// QA MK4 (FP-DSP, independent of the builder): extremes, denormals per Teil F, off-again bit identity, limiter stage 2 Ensemble,
// LFO update rate artefacts, misc. MK_FILE=<index.html> node v3-qa-mk4-dsp.mjs [ONLY=regex]
import {render, mkPatch} from './v3-mk1-node.mjs';
import {db, pdb, rms, peak, fft, mKlick, mEinbruch, spectrum, amp} from './v3-mk1-ana.mjs';
const SR = 48000, FILE = process.env.MK_FILE;
const only = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
const T = async (id, f) => { if (only && !only.test(id)) return; try { await f(); } catch (e) { console.log('ERR ' + id + ' ' + (e.stack || e)); } };
const M = (x, d = 1) => Math.round(x * 10 ** d) / 10 ** d;
const FXP = (fx, t) => Object.assign(mkPatch(t || {}), {mfx: {type: 0, spd: 64, dep: 0}, dly: {type: 0, sync: 0, time: 64, note: 8, dep: 0}, eq: {lf: 320, lg: 0, hf: 6000, hg: 0}}, fx || {});
let seed = 99; const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
const noise = (n, a) => { const x = new Float32Array(n); for (let i = 0; i < n; i++) x[i] = (rnd() * 2 - 1) * a; return x; };
const nanCount = (...ys) => { let n = 0; for (const y of ys) for (let i = 0; i < y.length; i++) if (!Number.isFinite(y[i])) n++; return n; };

// 1) extremes: every type combination, all knobs on the stop, 20 s, full chord vel 1 + res 127 and -6 dBFS noise into the FX
await T('EXT', () => {
  const tim = {o1: {w: 0}, mix: {o1: 127, o2: 127, n: 127}, o2: {w: 1}, f: {type: 0, cut: 127, res: 127}, a: {lvl: 127}};
  const ev = []; for (let k = 0; k < 40; k++) for (const n of [36, 48, 60, 72]) { ev.push([k * .5, 'on', n, 1]); ev.push([k * .5 + .45, 'off', n]); }
  const out = [];
  for (const mt of [0, 1, 2]) for (const dt of [0, 1, 2]) for (const sp of [0, 127]) {
    const fx = {mfx: {type: mt, spd: sp, dep: 127}, dly: {type: dt, sync: sp ? 0 : 1, time: 127, note: 14, dep: 127}, eq: {lf: 40, lg: 12, hf: 18000, hg: 12}};
    const r = render(FXP(fx, tim), ev, {sec: 20, file: FILE, bpm: 40});
    const nz = noise(SR * 20, .5), r2 = render(FXP(fx, {}), [], {sec: 20.2, file: FILE, bpm: 40, at: [[0, {mkFxIn: {l: nz, r: nz}}]]});
    out.push({mt, dt, sp, nan: nanCount(r.l, r.r, r2.l, r2.r), pk: M(db(Math.max(peak(r.l), peak(r.r)))), pkN: M(db(Math.max(peak(r2.l), peak(r2.r)))), tail: M(db(peak(r.l, r.l.length - SR))) });
  }
  const bad = out.filter(o => o.nan);
  console.log((bad.length ? 'FAIL' : 'PASS') + ' EXT NaN/Inf 20 s all stops: ' + JSON.stringify(out));
});

// 2) denormals (Teil F): 1 s full-scale noise through each path, then 60 s silence; every 1 s window <= 1.1 x the first silent second
await T('DEN', () => {
  const paths = {
    cho: {mfx: {type: 0, spd: 64, dep: 127}}, ens: {mfx: {type: 1, spd: 64, dep: 127}}, pha: {mfx: {type: 2, spd: 64, dep: 127}},
    dly14: {dly: {type: 0, sync: 0, time: 127, note: 8, dep: 127}}, dlyX: {dly: {type: 1, sync: 0, time: 64, note: 8, dep: 127}},
    eqLo: {eq: {lf: 40, lg: 12, hf: 6000, hg: 0}}, eqHi: {eq: {lf: 320, lg: 0, hf: 18000, hg: -12}},
    all: {mfx: {type: 2, spd: 127, dep: 127}, dly: {type: 2, sync: 0, time: 127, note: 8, dep: 127}, eq: {lf: 40, lg: 12, hf: 1000, hg: 12}}};
  for (const k in paths) {
    const nz = noise(SR, 1), r = render(FXP(paths[k]), [], {sec: 62, file: FILE, quantumMs: true, at: [[0, {mkFxIn: {l: nz, r: nz}}]]});
    const q = r.qms, per = []; const QS = SR / 128;
    for (let s = 0; s < 62; s++) { let a = 0; for (let i = Math.round(s * QS); i < Math.round((s + 1) * QS) && i < q.length; i++) a += q[i]; per.push(a); }
    const first = per[1], worst = Math.max(...per.slice(2)), ratio = worst / first;
    const tailDb = db(peak(r.l, r.l.length - SR)), hot = r.P.mk.fx.hot();
    // stuck tiny state values?
    const fx = r.P.mk.fx; let tiny = 0; for (const a of [fx.q, fx.ap, fx.py, fx.dL || [], fx.dR || [], fx.cL, fx.cR]) for (let i = 0; i < a.length; i++) if (a[i] !== 0 && Math.abs(a[i]) < 1e-30) tiny++;
    console.log((ratio <= 1.1 ? 'PASS' : 'INFO') + ` DEN ${k}: first silent s ${M(first, 2)} ms, worst later s ${M(worst, 2)} ms (x${M(ratio, 2)}), per s: ${per.slice(1, 12).map(x => M(x, 1)).join(' ')} … ${per.slice(-5).map(x => M(x, 1)).join(' ')}; still hot ${hot}, tail ${M(tailDb)} dBFS, tiny ${tiny}`);
  }
});

// 3) off again = bit identical: FX on for note 1, all FX back to 0, then note 2 must equal a render that never had FX (|d| <= 1e-6)
await T('OFF', () => {
  const ev = [[0, 'on', 60, .9], [.3, 'off', 60], [2.5, 'on', 64, .8], [3.0, 'off', 64]];
  for (const fx of [{mfx: {type: 0, spd: 64, dep: 127}}, {mfx: {type: 1, spd: 64, dep: 127}}, {mfx: {type: 2, spd: 64, dep: 127}}, {dly: {type: 0, sync: 0, time: 64, note: 8, dep: 100}}, {eq: {lf: 100, lg: 6, hf: 6000, hg: -6}}]) {
    const offMsg = {mkSet: {'mfx.dep': 0, 'dly.dep': 0, 'eq.lg': 0, 'eq.hg': 0}};
    const a = render(FXP(fx), ev, {sec: 3.5, file: FILE, at: [[.6, offMsg]]}), b = render(FXP({}), ev, {sec: 3.5, file: FILE});
    let w = 0; for (let i = Math.round(2.5 * SR); i < a.l.length; i++) w = Math.max(w, Math.abs(a.l[i] - b.l[i]), Math.abs(a.r[i] - b.r[i]));
    const act = a.P.mk.fx.active();
    console.log((w <= 1e-6 ? 'PASS' : 'FAIL') + ` OFF ${JSON.stringify(fx)}: after all FX back to 0, note 2 max |d| ${w.toExponential(2)}, fx.active() ${act}`);
  }
});

// 4) B.4 CPU limiter stage 2 (> 0.60): "Mod-FX Ensemble -> 1 Abgriff" — does lim 2 change the Ensemble?
await T('LIM', () => {
  const nz = noise(SR, .3), mk = lim => { const r = render(FXP({mfx: {type: 1, spd: 64, dep: 127}}), [], {sec: 1.1, file: FILE, tap: 'fx', at: [[0, {set: {eng: 3, mkLim: lim}}], [0, {mkFxIn: {l: nz, r: nz}}]]}); return r; };
  const a = mk(0), b = mk(2); let w = 0; for (let i = 0; i < a.l.length; i++) w = Math.max(w, Math.abs(a.l[i] - b.l[i]), Math.abs(a.r[i] - b.r[i]));
  console.log((w > 1e-3 ? 'PASS' : 'FAIL') + ` LIM stage 2: Ensemble output lim 0 vs lim 2 max |d| ${w.toExponential(2)} (mk.lim after msg: ${b.P.mk.lim})`);
});

// 5) LFO updated once per 128-sample quantum (linear delay inside): spurious sidebands at k x 375 Hz on a sine through Cho/Flg and
//    Ensemble at TEMPO 127 against an ideal per-sample-LFO reference (float64, same formulas W-31)
await T('LFO', () => {
  const W = render(FXP({}), [], {sec: .01, file: FILE}).MKW;
  const f0 = 1000, n = SR * 3, x = new Float32Array(n); for (let i = 0; i < n; i++) x[i] = .5 * Math.sin(2 * Math.PI * f0 * i / SR);
  for (const [type, spd] of [[0, 127], [1, 127], [0, 100]]) {
    const r = render(FXP({mfx: {type, spd, dep: 127}}), [], {sec: 3.1, file: FILE, tap: 'fx', at: [[0, {mkFxIn: {l: x, r: x}}]]});
    // ideal reference: cubic-free (linear interp) per-sample LFO, same depth
    const hz = W.fxHz(spd), w = W.fxW(127), ref = new Float64Array(n);
    if (type === 0) { const hub = W.cho.hub, d0 = W.cho.d, fb = Math.max(0, (127 - 64) / 63) * W.cho.fb, buf = new Float64Array(n);
      for (let i = 0; i < n; i++) { const ph = (hz * i / SR) % 1, D = (d0 + hub * (.5 + .5 * Math.sin(2 * Math.PI * ph))) * SR, p = i - D, j = Math.floor(p), f = p - j; const y = j >= 1 ? buf[j] + (buf[j + 1] - buf[j]) * f : 0; buf[i] = x[i] + fb * y; ref[i] = x[i] * (1 - w) + y * w; } }
    else { const b = W.ens.d * SR, hs = W.ens.hub * SR;
      for (let i = 0; i < n; i++) { const ph = (hz * i / SR) % 1, rd = d => { const p = i - d, j = Math.floor(p), f = p - j; return j >= 1 ? x[j] + (x[j + 1] - x[j]) * f : 0; };
        const a = rd(b + hs * Math.sin(2 * Math.PI * ph)), c = rd(b + hs * Math.sin(2 * Math.PI * (ph + 1 / 3))); ref[i] = x[i] * (1 - w) + (a + .5 * c) * w; } }
    // spectra (Blackman 2^16) of app and ref: energy within +-60 Hz of k*375 Hz (k=1..4) away from f0 +- (LFO sidebands) relative to total
    const N = 65536, i0 = SR, Pa = spectrum(r.l, i0, N), Pr = spectrum(Float32Array.from(ref), i0, N), bin = SR / N;
    const band = (P, fc) => { let e = 0; for (let k = Math.round((fc - 40) / bin); k <= Math.round((fc + 40) / bin); k++) e += P[k]; return e; };
    let tot = 0; for (let k = 1; k < N / 2; k++) tot += Pa[k];
    let ea = 0, er = 0; const fq = SR / 128; for (const s of [-2, -1, 1, 2]) { ea += band(Pa, f0 + s * fq); er += band(Pr, f0 + s * fq); }
    let totR = 0; for (let k = 1; k < N / 2; k++) totR += Pr[k];
    console.log(`INFO LFO type ${type} spd ${spd} (${M(hz, 2)} Hz): energy near f0 ± k·375 Hz (k=1,2): app ${M(pdb(ea / tot))} dB, ideal per-sample LFO ${M(pdb(er / totR))} dB re total`);
  }
});

// 6) delay: depth 127 -> 0 jump while the echo of a saw chord rings (no input): M-KLICK on the cut; and 0 -> 127 back while signal runs
await T('DCUT', () => {
  const ev = [[0, 'on', 72, .8], [0, 'on', 76, .8], [0, 'on', 79, .8], [.3, 'off', 72], [.3, 'off', 76], [.3, 'off', 79]];
  const r = render(FXP({dly: {type: 0, sync: 0, time: 100, note: 8, dep: 127}}, {e2: {a: 30, d: 64, s: 127, r: 40}}), ev, {sec: 3, file: FILE, at: [[1.5, {mkSet: {'dly.dep': 0}}]]});
  const k = Math.max(mKlick(r.l.subarray(Math.round(1.3 * SR), Math.round(1.8 * SR)), SR, []).worst, mKlick(r.r.subarray(Math.round(1.3 * SR), Math.round(1.8 * SR)), SR, []).worst);
  console.log((k <= 6 ? 'PASS' : 'FAIL') + ` DCUT delay TIEFE 127 -> 0 jump on a ringing echo: M-KLICK ${M(k)} dB`);
});

// 7) EQ HOCH-FREQ jump / sweep at +12 dB on a saw chord (not covered by builder: HOCH-FREQ sweep)
await T('EQHF', () => {
  const ev = [[0, 'on', 60, .7], [0, 'on', 64, .6], [0, 'on', 67, .6]];
  const at = []; for (let i = 0; i <= 60; i++) at.push([.5 + i / 60, {mkSet: {'eq.hf': 1000 * Math.pow(18, i / 60)}}]);
  const r = render(FXP({eq: {lf: 320, lg: 0, hf: 1000, hg: 12}}, {e2: {a: 30, d: 64, s: 127, r: 40}}), ev, {sec: 2, file: FILE, at});
  const k = Math.max(mKlick(r.l.subarray(Math.round(.4 * SR), Math.round(1.7 * SR)), SR, []).worst, mKlick(r.r.subarray(Math.round(.4 * SR), Math.round(1.7 * SR)), SR, []).worst);
  const r2 = render(FXP({eq: {lf: 320, lg: 0, hf: 1000, hg: 12}}, {e2: {a: 30, d: 64, s: 127, r: 40}}), ev, {sec: 2, file: FILE, at: [[.8, {mkSet: {'eq.hf': 18000}}], [1.3, {mkSet: {'eq.hf': 1000}}]]});
  const k2 = Math.max(mKlick(r2.l.subarray(Math.round(.4 * SR), Math.round(1.7 * SR)), SR, []).worst, mKlick(r2.r.subarray(Math.round(.4 * SR), Math.round(1.7 * SR)), SR, []).worst);
  console.log((k <= 6 && k2 <= 6 ? 'PASS' : 'FAIL') + ` EQHF HOCH-FREQ sweep 1->18 kHz at +12 dB in 1 s: M-KLICK ${M(k)} dB; jumps 1k->18k->1k: ${M(k2)} dB; NaN ${nanCount(r.l, r2.l)}`);
});

// 8) program change (whole p.mk load) while the echo rings: no click
await T('LOAD', () => {
  const ev = [[0, 'on', 72, .8], [0, 'on', 76, .8], [.25, 'off', 72], [.25, 'off', 76], [1.2, 'on', 67, .8], [1.6, 'off', 67]];
  const A = FXP({mfx: {type: 2, spd: 64, dep: 127}, dly: {type: 1, sync: 1, time: 64, note: 5, dep: 100}, eq: {lf: 100, lg: 6, hf: 8000, hg: -6}}, {e2: {a: 20, d: 64, s: 127, r: 30}});
  const B = FXP({mfx: {type: 0, spd: 30, dep: 110}, dly: {type: 2, sync: 0, time: 90, note: 8, dep: 60}, eq: {lf: 500, lg: -6, hf: 3000, hg: 6}}, {e2: {a: 20, d: 64, s: 127, r: 30}});
  const r = render(A, ev, {sec: 3, file: FILE, at: [[.8, {mk: B}]]});
  const seg = y => y.subarray(Math.round(.7 * SR), Math.round(1.1 * SR));
  const k = Math.max(mKlick(seg(r.l), SR, []).worst, mKlick(seg(r.r), SR, []).worst);
  console.log((k <= 6 ? 'PASS' : 'FAIL') + ` LOAD program change with all FX different while the echo rings: M-KLICK ${M(k)} dB`);
});
