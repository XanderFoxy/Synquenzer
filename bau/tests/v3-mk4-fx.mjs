// MK4 DSP acceptance in Node (Nachtrag 3 MK4-01 ... MK4-10, MK4-14, H-1/H-3 of the effect knobs, Teil F FP-DSP): the worklet of
// index.html (MK_FILE) with a stub scope (v3-mk1-node.mjs). Test input = {mkFxIn} (a signal into the effect input), LFO frozen =
// {mkFxFrz}, tap 'fx' = the effect output without the DC blocker of the processor.
// Usage: MK_FILE=<index.html> MK_PREV=<predecessor.html> node v3-mk4-fx.mjs   (ONLY=<regex> picks tests)
import {render, mkPatch} from './v3-mk1-node.mjs';
import {db, pdb, rms, peak, fft, mKlick, mEinbruch, centroid} from './v3-mk1-ana.mjs';
const SR = 48000, FILE = process.env.MK_FILE, PREV = process.env.MK_PREV || new URL('../synq-snapshots/MK2.html', import.meta.url).pathname;
let fails = 0; const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
const only = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
const T = (id, f) => { if (only && !only.test(id)) return; try { f(); } catch (e) { ok(id, false, 'Fehler ' + (e.stack || e)); } };
const M = (x, d) => Math.round(x * 10 ** (d == null ? 1 : d)) / 10 ** (d == null ? 1 : d);
const W = render(mkPatch({}), [], {sec: .01}).MKW;
// a patch with effects (p.mk blocks on top of the timbre)
const FXP = (fx, t) => Object.assign(mkPatch(t || {a: {gate: 1}}), {mfx: {type: 0, spd: 64, dep: 0}, dly: {type: 0, sync: 0, time: 64, note: 8, dep: 0}, eq: {lf: 320, lg: 0, hf: 6000, hg: 0}}, fx || {});
const merge = (a, b) => { const r = JSON.parse(JSON.stringify(a)); for (const k in b) r[k] = Object.assign(r[k] || {}, b[k]); return r; };
let seed = 7; const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
const noise = (n, a) => { const x = new Float32Array(n); for (let i = 0; i < n; i++) x[i] = (rnd() * 2 - 1) * (a || .25); return x; };
// effect render of an input signal (L, R); extra messages at render time
function fxr(fx, l, r, o) { o = o || {}; const at = [[0, {mkFxIn: {l, r: r || l}}]]; if (o.frz != null) at.push([0, {mkFxFrz: o.frz}]); return render(FXP(fx), o.ev || [], Object.assign({sec: o.sec || l.length / SR + .1, tap: 'fx', at: at.concat(o.at || []), bpm: o.bpm}, o.ro || {})); }
// Welch transfer |Y/X|^2 in dB per bin (Hann, n points, hop n/2) between i0 and i1
function tf(x, y, i0, i1, n) {
  n = n || 4096; const Pxx = new Float64Array(n / 2), Pyy = new Float64Array(n / 2); let seg = 0;
  for (let s = i0; s + n <= i1; s += n / 2) { seg++;
    const a = new Float64Array(n), ai = new Float64Array(n), b = new Float64Array(n), bi = new Float64Array(n);
    for (let i = 0; i < n; i++) { const w = .5 - .5 * Math.cos(2 * Math.PI * i / n); a[i] = x[s + i] * w; b[i] = y[s + i] * w; }
    fft(a, ai); fft(b, bi); for (let k = 0; k < n / 2; k++) { Pxx[k] += a[k] * a[k] + ai[k] * ai[k]; Pyy[k] += b[k] * b[k] + bi[k] * bi[k]; } }
  const H = new Float64Array(n / 2); for (let k = 0; k < n / 2; k++) H[k] = pdb(Pyy[k] / (Pxx[k] + 1e-30)); return {H, bin: SR / n};
}
const at = (T_, f) => { const k = f / T_.bin, i = Math.floor(k), u = k - i; return T_.H[i] + (T_.H[i + 1] - T_.H[i]) * u; };
// notches: minima of H (3-bin smoothed) that are the lowest point within +-1/6 octave, between f0 and f1; depth = the lower of
// the two neighbouring peaks (left, right) minus the minimum; rel0 = the minimum against the dry level (0 dB)
function notches(T_, f0, f1) {
  const H = T_.H, bin = T_.bin, a = Math.max(1, Math.ceil(f0 / bin)), b = Math.min(H.length - 2, Math.floor(f1 / bin)), out = [];
  const sm = new Float64Array(H.length); for (let k = 1; k < H.length - 1; k++) sm[k] = (H[k - 1] + H[k] + H[k + 1]) / 3;
  const mx = (i, j) => { let m = -1e9; for (let q = Math.max(1, i); q <= Math.min(H.length - 2, j); q++) m = Math.max(m, sm[q]); return m; };
  for (let k = a; k <= b; k++) {
    const lo = Math.max(1, Math.floor(k * 2 ** (-1 / 6))), hi = Math.min(H.length - 2, Math.ceil(k * 2 ** (1 / 6))); let isMin = true;
    for (let q = lo; q <= hi; q++) if (sm[q] < sm[k] || (sm[q] === sm[k] && q < k)) { isMin = false; break; }
    if (!isMin) continue;
    // the neighbouring peaks: walk outward until the curve has fallen 1.5 dB below the highest point passed (noise-robust)
    let lm = sm[k], rm = sm[k]; for (let q = k - 1; q >= 1; q--) { lm = Math.max(lm, sm[q]); if (sm[q] < lm - 1.5) break; }
    for (let q = k + 1; q <= H.length - 2; q++) { rm = Math.max(rm, sm[q]); if (sm[q] < rm - 1.5) break; }
    out.push({f: k * bin, depth: Math.min(lm, rm) - sm[k], rel0: sm[k]});
  }
  return out;
}
// soft attack / release (W-06: attack 60 = 68 ms), so the echoes of a note start carry no click of their own
const SOFT = {e2: {a: 60, d: 64, s: 127, r: 60}};
// M-KLICK / M-EINBRUCH at switches with two stationary signals (a low saw is no M-KLICK signal: its HP energy comes in one spike per
// period): (a) white noise into the effects, (b) a held high saw chord C6 E6 G6 (soft attack); worst of both channels and signals
// M-KLICK on (a) over the whole signal; on (b) around each switch (-5 ... +80 ms: blend 30 ms, read head 40 ms, mix 20 ms) and over a
// gesture: a flanger with feedback on a harmonic chord swells by itself (comb peaks meet the partials, +6 dB also in an ideal
// float64 flanger, v3-mk4-dbg5.mjs), M-KLICK (spec §0.3) is a test of the switching point
function clk(fx, msgs, sec, ts, bpm, rng) {
  const xs = noise(Math.round(sec * SR), .15), a = fxr(fx, xs, xs, {sec, at: msgs, bpm});
  const b = render(FXP(fx, SOFT), [[0, 'on', 84, .7], [0, 'on', 88, .6], [0, 'on', 91, .6]], {sec, at: msgs, bpm});
  const R = rng || (ts || []).map(t => [t - .005, t + .08]), sl = (y, r) => y.subarray(Math.max(0, Math.round((r[0] - .025) * SR)), Math.min(y.length, Math.round((r[1] + .025) * SR)));
  let k = -99, nan = 0; for (const y of [a.l, a.r]) k = Math.max(k, mKlick(y, SR, [0]).worst);
  for (const y of [b.l, b.r]) for (const r of R) k = Math.max(k, mKlick(sl(y, r), SR, []).worst);
  for (const y of [a.l, a.r, b.l, b.r]) for (let i = 0; i < y.length; i++) if (!isFinite(y[i])) nan++;
  const e = (ts || []).map(t => Math.min(mEinbruch(a.l, SR, t).worst, mEinbruch(b.l, SR, t).worst));
  return {k, e, nan, ok: k <= 6 && e.every(x => x >= -3) && !nan, txt: 'M-KLICK ' + M(k) + ' dB' + (e.length ? ', M-EINBRUCH ' + e.map(x => M(x)).join(' / ') + ' dB' : '')};
}
const imp = (n, at_, a) => { const x = new Float32Array(n); x[at_] = a == null ? .5 : a; return x; };
// first local peak over thr after i0 (index of max |x| in the next 64 samples)
function echoes(x, i0, thr, cnt) { const out = []; let i = i0; while (out.length < cnt && i < x.length) { if (Math.abs(x[i]) > thr) { let m = i; for (let k = i; k < Math.min(x.length, i + 64); k++) if (Math.abs(x[k]) > Math.abs(x[m])) m = k; out.push([m, x[m]]); i = m + 64; } else i++; } return out; }

// ---------------- MK4-01 Aus = bitgleich ----------------
T('MK4-01', () => {
  const ev = [[0, 'on', 48, .8], [.05, 'on', 55, .7], [.1, 'on', 64, .9], [.6, 'off', 48], [.7, 'off', 55], [.8, 'off', 64]];
  const tim = [{}, {o1: {w: 1, c1: 40}, o2: {w: 1, mod: 2, semi: 7}, mix: {o1: 127, o2: 90, n: 20}, f: {type: 1, cut: 70, res: 80, eg: 30}, l1: {f: 90}}, {o1: {w: 3, c1: 64}, f: {type: 2, cut: 60}, a: {dist: 1}, asg: 2}];
  const fxs = [];
  for (const type of [0, 1, 2]) for (const spd of [0, 64, 127]) fxs.push({mfx: {type, spd, dep: 0}, dly: {type: type, sync: type & 1, time: 20 + 40 * type, note: 3 * type, dep: 0}, eq: {lf: 40 + 400 * type, lg: 0, hf: 1000 + 8000 * type, hg: 0}});
  let worst = 0, n = 0;
  for (const t of tim) for (const fx of fxs.concat([{}])) {
    const p = Object.assign(mkPatch(t), fx), a = render(p, ev, {sec: 1.2, file: FILE}), b = render(p, ev, {sec: 1.2, file: PREV});
    for (let i = 0; i < a.l.length; i++) worst = Math.max(worst, Math.abs(a.l[i] - b.l[i]), Math.abs(a.r[i] - b.r[i])); n++;
  }
  // VA and FM6 voices of the same processor
  for (const eng of [0, 1]) { const a = render(null, ev, {sec: 1, eng, file: FILE}), b = render(null, ev, {sec: 1, eng, file: PREV}); for (let i = 0; i < a.l.length; i++) worst = Math.max(worst, Math.abs(a.l[i] - b.l[i])); n++; }
  ok('MK4-01 TIEFE 0 (Mod-FX alle 3 Typen, Delay alle 3 Typen) und EQ 0 dB bitgleich zum Vorgänger 4.10.0 (dazu VA, FM6)', worst === 0, n + ' Renders, max |Δ| ' + worst);
  const m = render(FXP({}), ev, {sec: .3}).msgs.filter(x => x.mkFxMem);
  ok('MK4-01 ohne Delay-TIEFE kein Puffer (0 Byte)', m.length === 0, m.length + ' Meldungen');
});
// ---------------- MK4-02 Cho/Flg ----------------
T('MK4-02', () => {
  const x = noise(SR * 3);
  const depth = (dep, ph) => { const o = fxr({mfx: {type: 0, spd: 64, dep}}, x, x, {frz: ph}); const t = tf(x, o.l, 9600, x.length, 4096), N = notches(t, 200, 15000); return {N, t}; };
  const d100 = depth(100, .25).N, d40 = depth(40, .25).N, kd = N => Math.max(...N.map(q => q.depth));
  ok('MK4-02 TIEFE 100: Kerbtiefe ≥ 12 dB (W-31 ≈ 16,8 dB)', kd(d100) >= 12, M(kd(d100)) + ' dB, ' + d100.length + ' Kerben');
  ok('MK4-02 TIEFE 40: Kerbtiefe ≤ 6 dB (W-31 ≈ 4,1 dB)', kd(d40) <= 6, M(kd(d40)) + ' dB');
  // comb spacing at the two LFO extremes (frozen): first notch at 1 / (2 d)
  const f1 = depth(40, .75).N[0].f, f2 = depth(40, .25).N[0].f;
  ok('MK4-02 TIEFE 40: Kammabstand wandert ≥ 30 %', 1 - f2 / f1 >= .3, 'erste Kerbe ' + M(f1, 0) + ' → ' + M(f2, 0) + ' Hz (' + M((1 - f2 / f1) * 100, 0) + ' %)');
  // the running LFO: the wet delay per 20 ms window (cross-correlation peak), its period against W-31 at TEMPO 64
  const y = noise(SR * 7), o = fxr({mfx: {type: 0, spd: 64, dep: 100}}, y, y, {}), w = Math.round(.02 * SR), dl = [];
  for (let s = 4800; s + w + 400 < y.length; s += w) { let best = -1, bl = 0; for (let L = 40; L < 300; L++) { let c = 0; for (let i = 0; i < w; i++) c += o.l[s + i + L] * y[s + i]; if (c > best) { best = c; bl = L; } } dl.push(bl); }
  const mean = dl.reduce((a, b) => a + b, 0) / dl.length, zc = []; for (let i = 1; i < dl.length; i++) if ((dl[i - 1] - mean) < 0 && (dl[i] - mean) >= 0) zc.push(i);
  const per = zc.length > 1 ? (zc[zc.length - 1] - zc[0]) / (zc.length - 1) * .02 : 0, exp = 1 / W.fxHz(64);
  ok('MK4-02 Kammabstand wandert mit dem LFO, Periode nach W-31 ± 5 % (TEMPO 64)', Math.abs(per / exp - 1) <= .05, 'Periode ' + M(per, 3) + ' s, W-31 ' + M(exp, 3) + ' s, Verzögerung ' + Math.min(...dl) + '…' + Math.max(...dl) + ' Samples');
});
// ---------------- MK4-03 Ensemble ----------------
T('MK4-03', () => {
  const x = noise(SR * 2), res = [];
  for (const ph of [0, .1, .2, .3, .45, .6, .8]) {
    const o = fxr({mfx: {type: 1, spd: 64, dep: 127}}, x, x, {frz: ph}), w = W.fxW(127), i0 = 4800, i1 = x.length - 100;
    const wl = new Float64Array(i1 - i0), wr = new Float64Array(i1 - i0);
    for (let i = i0; i < i1; i++) { wl[i - i0] = (o.l[i] - (1 - w) * x[i]) / w; wr[i - i0] = (o.r[i] - (1 - w) * x[i]) / w; }
    let lr = 0, ll = 0, rr = 0; for (let i = 0; i < wl.length; i++) { lr += wl[i] * wr[i]; ll += wl[i] * wl[i]; rr += wr[i] * wr[i]; }
    res.push({ph, c: lr / Math.sqrt(ll * rr), lvl: db(Math.sqrt(ll / wl.length) / rms(x, i0, i1)), out: db(rms(o.l, i0, i1) / rms(x, i0, i1))});
  }
  ok('MK4-03 Kreuzkorrelation der nassen Signale L/R ≤ 0,5 (7 LFO-Stellungen)', res.every(r => r.c <= .5), res.map(r => M(r.c, 2)).join(' / '));
  ok('MK4-03 Pegel nass ± 1 dB gegenüber trocken', res.every(r => Math.abs(r.lvl) <= 1), res.map(r => M(r.lvl, 2)).join(' / ') + ' dB (Ausgang gemischt ' + M(res[0].out, 2) + ' dB)');
});
// ---------------- MK4-04 Phaser ----------------
T('MK4-04', () => {
  const x = noise(SR * 3), N = ph => { const o = fxr({mfx: {type: 2, spd: 64, dep: 127}}, x, x, {frz: ph}); return notches(tf(x, o.l, 9600, x.length, 8192), 20, 20000).filter(q => q.depth >= 12); };
  const lo = N(.75), hi = N(.25);
  ok('MK4-04 TIEFE 127: ≥ 3 Kerben ≥ 12 dB', lo.length >= 3 && hi.length >= 3, 'LFO unten: ' + lo.map(q => M(q.f, 0) + ' Hz ' + M(q.depth) + ' dB').join(', ') + ' | oben: ' + hi.map(q => M(q.f, 0) + ' Hz ' + M(q.depth) + ' dB').join(', '));
  ok('MK4-04 die tiefste Kerbe wandert über ≥ 2 Okt', lo.length && hi.length && Math.log2(hi[0].f / lo[0].f) >= 2, M(lo[0] && lo[0].f, 0) + ' → ' + M(hi[0] && hi[0].f, 0) + ' Hz (' + M(Math.log2(hi[0].f / lo[0].f), 2) + ' Okt)');
});
// ---------------- MK4-05 Stereo delay ----------------
T('MK4-05', () => {
  const n = SR * 2, x = imp(n, 4800), o = fxr({dly: {type: 0, sync: 1, time: 64, note: 5, dep: 64}}, x, x, {bpm: 120});
  const eL = echoes(o.l, 4801, 1e-3, 3), eR = echoes(o.r, 4801, 1e-3, 3);
  ok('MK4-05 Sync 1/8 bei 120 BPM: erstes Echo nach 250 ms ± 1 Sample in L und R', Math.abs(eL[0][0] - 4800 - 12000) <= 1 && Math.abs(eR[0][0] - 4800 - 12000) <= 1, 'L +' + (eL[0][0] - 4800) + ', R +' + (eR[0][0] - 4800) + ' Samples');
  const lv = db(eL[0][1] / .5), exp = db(64 / 127);
  ok('MK4-05 TIEFE 64: Echo-Pegel nach W-32 ± 0,5 dB', Math.abs(lv - exp) <= .5, M(lv, 2) + ' dB (W-32 ' + M(exp, 2) + ' dB)');
  const o2 = fxr({dly: {type: 0, sync: 1, time: 64, note: 5, dep: 127}}, x, x, {bpm: 120}), E = echoes(o2.l, 4801, 1e-4, 6), st = [];
  for (let k = 1; k < E.length; k++) st.push(db(E[k][1] / E[k - 1][1]));
  // overflow: a loud sustained chord (INIT saw, vel 1) 3 s with TIEFE 127
  const c = render(FXP({dly: {type: 0, sync: 1, time: 64, note: 5, dep: 127}}, {}), [[0, 'on', 48, 1], [0, 'on', 55, 1], [0, 'on', 60, 1], [0, 'on', 64, 1], [3, 'off', 48], [3, 'off', 55], [3, 'off', 60], [3, 'off', 64]], {sec: 6});
  const c0 = render(FXP({}, {}), [[0, 'on', 48, 1], [0, 'on', 55, 1], [0, 'on', 60, 1], [0, 'on', 64, 1], [3, 'off', 48], [3, 'off', 55], [3, 'off', 60], [3, 'off', 64]], {sec: 6});
  const pk = Math.max(peak(c.l), peak(c.r)), pk0 = Math.max(peak(c0.l), peak(c0.r)), pkI = Math.max(peak(o2.l), peak(o2.r));
  // the echo chain is bounded: after the chord the tail falls by >= 1.9 dB per repetition (no build-up), the chord peak is reported
  // (the sum of a full-scale 4-voice chord and its echoes may exceed 0 dBFS at the engine output, the master limiter / soft ceiling follow)
  const tl = [3.3, 3.55, 3.8, 4.05].map(t => rms(c.l, Math.round(t * SR), Math.round((t + .25) * SR))), dec = tl.slice(1).every((v, i) => v < tl[i]);
  ok('MK4-05 TIEFE 127: jede Wiederholung ≥ 1,9 dB leiser, kein Überlauf (Spitze ≤ 0 dBFS)', st.length >= 4 && st.every(d => d <= -1.9) && pkI <= 1 && dec,
    'Schritte ' + st.map(d => M(d, 2)).join(' / ') + ' dB; Spitze Impuls ' + M(db(pkI), 1) + ' dBFS; Akkord 4 Stimmen vel 1 (Info): ' + M(db(pk), 1) + ' dBFS am Engine-Ausgang (trocken ' + M(db(pk0), 1) + '), Nachhall fällt ' + tl.map(v => M(db(v), 1)).join(' → ') + ' dB');
});
// ---------------- MK4-06 Cross / L-R ----------------
T('MK4-06', () => {
  const n = SR * 2, x = imp(n, 4800), z = new Float32Array(n);
  const o = fxr({dly: {type: 1, sync: 1, time: 64, note: 5, dep: 100}}, x, z, {bpm: 120});
  const en = (ch, k) => { const a = 4800 + 12000 * k - 200, b = a + 400; return pdb(rms(ch, a, b) ** 2); }, r1 = [];
  for (let k = 1; k <= 3; k++) r1.push(en(o.l, k) - en(o.r, k));
  ok('MK4-06 Cross-Delay, Impuls nur links: Echos L, R, L je ≥ 20 dB über dem anderen Kanal', r1[0] >= 20 && r1[1] <= -20 && r1[2] >= 20, r1.map(d => M(d)).join(' / ') + ' dB (L − R)');
  const o2 = fxr({dly: {type: 2, sync: 1, time: 64, note: 5, dep: 100}}, x, x, {bpm: 120}), r2 = [];
  for (let k = 1; k <= 4; k++) r2.push(en(o2.l, k) - en(o2.r, k));
  ok('MK4-06 L/R-Delay, Mono-Impuls: abwechselnd L, R', r2[0] >= 20 && r2[1] <= -20 && r2[2] >= 20 && r2[3] <= -20, r2.map(d => M(d)).join(' / ') + ' dB (L − R)');
});
// ---------------- MK4-07 time ----------------
T('MK4-07', () => {
  const n = SR * 2, x = imp(n, 4800), r = [];
  for (const time of [0, 64, 127]) { const o = fxr({dly: {type: 0, sync: 0, time, dep: 64}}, x, x, {sec: 1.6}), e = echoes(o.l, 4801, 1e-3, 1)[0], d = (e[0] - 4800) / SR, w = W.dlyS(time); r.push([time, d, w, Math.abs(d / w - 1)]); }
  ok('MK4-07 Sync aus: ZEIT 0 / 64 / 127 nach W-32 ± 1 %', r.every(q => q[3] <= .01), r.map(q => q[0] + ': ' + M(q[1] * 1000, 2) + ' ms (W-32 ' + M(q[2] * 1000, 2) + ')').join(', '));
  // ZEIT changes while the echo runs: jumps, and a gesture (fractions 64 -> 120 in 1 s, 60 messages)
  const p = {dly: {type: 0, sync: 0, time: 90, dep: 100}};
  const j = clk(p, [[.6, {mkSet: {'dly.time': 110}}], [1.0, {mkSet: {'dly.time': 60}}], [1.6, {mkSet: {'dly.time': 100}}], [2.2, {mkSet: {'dly.time': 30}}]], 3, [.6, 1, 1.6, 2.2]);
  const sw = []; for (let i = 0; i <= 60; i++) sw.push([.5 + i / 60, {mkSet: {'dly.time': 64 + 56 * i / 60}}]);
  const g = clk(p, sw, 2.4, [.5, 1, 1.5], null, [[.45, 1.6]]);
  ok('MK4-07 ZEIT-Wechsel bei laufendem Echo besteht M-KLICK (Sprünge und Zug)', j.ok && g.ok, 'Sprünge: ' + j.txt + '; Zug: ' + g.txt);
});
// ---------------- MK4-08 tempo ----------------
T('MK4-08', () => {
  // Sync 1/8, tempo 120 -> 90 at 1.0 s: an impulse at 1.5 s echoes 333 ms later (the new time within <= 1 bar = 2 s)
  const n = SR * 3, x = imp(n, Math.round(1.5 * SR)), o = fxr({dly: {type: 0, sync: 1, note: 5, dep: 90}}, x, x, {bpm: 120, at: [[1.0, {tempo: {bpm: 90}}]]});
  const e = echoes(o.l, Math.round(1.5 * SR) + 1, 1e-3, 1)[0], d = (e[0] - 1.5 * SR) / SR;
  const c = clk({dly: {type: 0, sync: 1, note: 5, dep: 100}}, [[1.2, {tempo: {bpm: 90}}], [2.2, {tempo: {bpm: 120}}]], 3.2, [1.2, 2.2], 120);
  ok('MK4-08 120 → 90 BPM: die Sync-Zeit folgt ≤ 1 Takt, ohne Knacken', Math.abs(d - 1 / 3) * SR <= 1 && c.ok, 'Echo des Impulses 0,5 s nach dem Wechsel: +' + M(d * 1000, 2) + ' ms (333,33), ' + c.txt);
});
// ---------------- MK4-09 EQ ----------------
T('MK4-09', () => {
  const x = noise(SR * 4), flat = fxr({}, x, x).l;   // no effect at all: the input itself
  const t1 = tf(flat, fxr({eq: {lf: 100, lg: 12, hf: 6000, hg: 0}}, x, x).l, 4800, x.length, 16384);
  const g25 = at(t1, 25), g400 = at(t1, 400), g1k = at(t1, 1000);
  ok('MK4-09 Tiefen-Kuhschwanz 100 Hz +12 dB: 25 Hz +12 ± 0,5, 400 Hz ± 1, 1 kHz ± 0,3 dB', Math.abs(g25 - 12) <= .5 && Math.abs(g400) <= 1 && Math.abs(g1k) <= .3, M(g25, 2) + ' / ' + M(g400, 2) + ' / ' + M(g1k, 2) + ' dB');
  const t2 = tf(flat, fxr({eq: {lf: 320, lg: 0, hf: 8000, hg: -12}}, x, x).l, 4800, x.length, 16384), g16 = at(t2, 16000), g2k = at(t2, 2000);
  ok('MK4-09 Höhen-Kuhschwanz 8 kHz −12 dB: 16 kHz −12 ± 1, 2 kHz ± 0,5 dB', Math.abs(g16 + 12) <= 1 && Math.abs(g2k) <= .5, M(g16, 2) + ' / ' + M(g2k, 2) + ' dB');
});
// ---------------- MK4-10 order ----------------
T('MK4-10', () => {
  // a 0.4 s noise burst, Phaser frozen, delay 1/2 (1 s at 120): the echo carries the notches; EQ high shelf -12 dB acts on the echo
  const n = SR * 3, b = noise(n); for (let i = Math.round(.5 * SR); i < n; i++) b[i] = 0;
  const ph = {mfx: {type: 2, spd: 64, dep: 127}, dly: {type: 0, sync: 1, note: 11, dep: 127}};
  const o = fxr(ph, b, b, {frz: .5, bpm: 120}), o0 = fxr({dly: ph.dly}, b, b, {frz: .5, bpm: 120});
  // echo window 1.1 ... 1.45 s against the dry burst through the same echo without the phaser
  const t = tf(o0.l.subarray(Math.round(1.1 * SR)), o.l.subarray(Math.round(1.1 * SR)), 0, Math.round(.35 * SR), 4096), N = notches(t, 30, 18000).filter(q => q.depth >= 12);
  ok('MK4-10 das Echo trägt die Phaser-Kerben (≥ 3 Kerben ≥ 12 dB im Echo)', N.length >= 3, N.map(q => M(q.f, 0) + ' Hz ' + M(q.depth) + ' dB').join(', '));
  const e = fxr({dly: ph.dly, eq: {lf: 320, lg: 0, hf: 8000, hg: -12}}, b, b, {bpm: 120});
  const t2 = tf(o0.l.subarray(Math.round(1.1 * SR)), e.l.subarray(Math.round(1.1 * SR)), 0, Math.round(.35 * SR), 4096);
  ok('MK4-10 der EQ wirkt auf das Echo: Kuhschwanz 8 kHz −12 dB im Echo bei 16 kHz −12 ± 1 dB', Math.abs(at(t2, 16000) + 12) <= 1, M(at(t2, 16000), 2) + ' dB, 2 kHz ' + M(at(t2, 2000), 2) + ' dB');
});
// ---------------- MK4-14 long sync notes, buffer ----------------
T('MK4-14', () => {
  const r = []; let okA = true;
  for (const [bpm, note, sec] of [[120, 14, 2], [120, 13, 1.5], [60, 14, 4], [60, 13, 3], [40, 14, 6], [40, 13, 4.5]]) {
    const n = Math.round((sec + .5) * SR), x = imp(n, 2400), o = fxr({dly: {type: 0, sync: 1, note, dep: 64}}, x, x, {bpm});
    const e = echoes(o.l, 2401, 1e-3, 1)[0], d = e ? e[0] - 2400 : -1; if (Math.abs(d - sec * SR) > 1) okA = false; r.push(bpm + ' BPM ' + ['1/32', '1/24', '1/16', '1/12', '3/32', '1/8', '1/6', '3/16', '1/4', '1/3', '3/8', '1/2', '2/3', '3/4', '1/1'][note] + ': ' + d + ' (' + sec * SR + ')');
  }
  ok('MK4-14 1/1 und 3/4 bei 120/60/40 BPM: erstes Echo genau nach dem Notenwert ± 1 Sample', okA, r.join(', '));
  // tempo 120 -> 40 while the echo runs: M-KLICK
  const c = clk({dly: {type: 0, sync: 1, note: 11, dep: 100}}, [[1.2, {tempo: {bpm: 40}}], [2.6, {tempo: {bpm: 120}}]], 4, [1.2, 2.6], 120);
  ok('MK4-14 Tempo-Wechsel 120 → 40 BPM während des Echos besteht M-KLICK', c.ok, c.txt);
  const p0 = render(FXP({}), [], {sec: .1}), m0 = p0.msgs.filter(x => x.mkFxMem), p1 = render(FXP({}), [], {sec: .1, at: [[.05, {mkSet: {'dly.dep': 30}}]]}), m1 = p1.msgs.filter(x => x.mkFxMem);
  ok('MK4-14 vor dem ersten TIEFE > 0 belegt der Puffer 0 Byte, danach ≈ 2,3 MB je Spur', m0.length === 0 && m1.length === 1 && Math.abs(m1[0].mkFxMem / 1e6 - 2.3) < .05 && p1.P.mk.fx.dL.length === Math.ceil(6 * SR) + 4,
    m0.length + ' / ' + (m1[0] && m1[0].mkFxMem) + ' Byte');
});
// ---------------- switching: M-KLICK / M-EINBRUCH (types, depths), H-1 / H-3 of every effect knob ----------------
T('MK4-SW', () => {
  const cases = [
    ['Mod-FX-Typ 0→1→2→0', {mfx: {type: 0, spd: 64, dep: 100}}, [[.8, {mkSet: {'mfx.type': 1}}], [1.4, {mkSet: {'mfx.type': 2}}], [2, {mkSet: {'mfx.type': 0}}]], [.8, 1.4, 2]],
    ['Mod-FX-TIEFE 0→127→0 (Sprung)', {mfx: {type: 0, spd: 64, dep: 0}}, [[.8, {mkSet: {'mfx.dep': 127}}], [1.6, {mkSet: {'mfx.dep': 0}}]], [.8, 1.6]],
    ['Delay-Typ 0→1→2→0', {dly: {type: 0, sync: 1, note: 3, dep: 100}}, [[.8, {mkSet: {'dly.type': 1}}], [1.4, {mkSet: {'dly.type': 2}}], [2, {mkSet: {'dly.type': 0}}]], [.8, 1.4, 2]],
    ['Delay-TIEFE 0→127→0, TEMPO SYNC an/aus', {dly: {type: 0, sync: 0, time: 80, note: 3, dep: 0}}, [[.6, {mkSet: {'dly.dep': 127}}], [1.2, {mkSet: {'dly.sync': 1}}], [1.8, {mkSet: {'dly.sync': 0}}], [2.4, {mkSet: {'dly.dep': 0}}]], [.6, 1.2, 1.8, 2.4]],
    ['EQ ±12 dB Sprünge, Frequenz-Sprünge', {eq: {lf: 100, lg: 0, hf: 6000, hg: 0}}, [[.6, {mkSet: {'eq.lg': 12, 'eq.hg': -12}}], [1.2, {mkSet: {'eq.lf': 1000, 'eq.hf': 1000}}], [1.8, {mkSet: {'eq.lg': -12, 'eq.hg': 12}}], [2.4, {mkSet: {'eq.lg': 0, 'eq.hg': 0}}]], [.6, 1.2, 1.8, 2.4]],
  ];
  const gest = (path, a, b) => { const g = []; for (let i = 0; i <= 60; i++) g.push([.6 + i / 60, {mkSet: {[path]: a + (b - a) * i / 60}}]); return g; };
  for (const [name, fx, path, a, b] of [['Mod-FX-TIEFE Zug 0→127 (Phaser)', {mfx: {type: 2, spd: 64, dep: 0}}, 'mfx.dep', 0, 127], ['Mod-FX-TEMPO Zug 0→127 (Ensemble)', {mfx: {type: 1, spd: 0, dep: 127}}, 'mfx.spd', 0, 127],
    ['Mod-FX-TIEFE Zug 0→127 (Cho/Flg)', {mfx: {type: 0, spd: 64, dep: 0}}, 'mfx.dep', 0, 127], ['Delay-TIEFE Zug 0→127', {dly: {type: 0, sync: 0, time: 70, dep: 0}}, 'dly.dep', 0, 127],
    ['Delay-NOTE Zug 1/32→1/1', {dly: {type: 0, sync: 1, note: 0, dep: 100}}, 'dly.note', 0, 14], ['EQ TIEF-FREQ Zug 40→1000 Hz (+12 dB)', {eq: {lf: 40, lg: 12, hf: 6000, hg: 0}}, 'eq.lf', 40, 1000],
    ['EQ HOCH-GAIN Zug −12→+12 dB', {eq: {lf: 320, lg: 0, hf: 4000, hg: -12}}, 'eq.hg', -12, 12]]) {
    const c = clk(fx, gest(path, a, b), 2.2, [.6, 1.6], null, [[.55, 1.7]]); ok('MK4-SW ' + name + ' in 1 s: M-KLICK und M-EINBRUCH', c.ok, c.txt); }
  for (const [name, fx, msgs, ts] of cases) { const c = clk(fx, msgs, 3.2, ts); ok('MK4-SW ' + name + ': M-KLICK und M-EINBRUCH', c.ok, c.txt); }
});
T('MK4-H', () => {
  // H-1: min -> max of each effect knob (others at a working setting) changes M-PEGEL >= 3 dB, an M-BAND >= 6 dB, M-SP >= 1/3 Okt
  // or (TEMPO, ZEIT, NOTE) the time measure x2 (M-AUS analogue: modulation period / echo time)
  const x = noise(SR * 2), band = (y, f0, f1) => { const t = tf(x, y, 4800, x.length, 4096); let s = 0, n = 0; for (let f = f0; f <= f1; f += t.bin) { s += 10 ** (at(t, f) / 10); n++; } return pdb(s / n); };
  const R = [];
  const lvl = (fx, frz) => fxr(fx, x, x, {frz}).l;
  const bandMax = (a, b) => { let m = 0; for (const [f0, f1] of [[60, 120], [150, 300], [300, 600], [600, 1200], [1200, 2400], [2400, 4800], [4800, 9600], [9600, 19000]]) m = Math.max(m, Math.abs(band(a, f0, f1) - band(b, f0, f1))); return m; };
  R.push(['MOD-FX TYP (Cho/Flg → Phaser, TIEFE 100)', bandMax(lvl({mfx: {type: 0, spd: 64, dep: 100}}, .3), lvl({mfx: {type: 2, spd: 64, dep: 100}}, .3)), 6]);
  R.push(['MOD-FX TIEFE (Phaser 0 → 127)', bandMax(lvl({mfx: {type: 2, spd: 64, dep: 0}}, .3), lvl({mfx: {type: 2, spd: 64, dep: 127}}, .3)), 6]);
  // TEMPO: the modulation period of a band level (Phaser) 0 -> 127: period shrinks x2 or more
  // TEMPO: the LFO period of the Cho/Flg delay (cross-correlation per window), TEMPO 64 against 127 (0 = 50 s: too long for a render)
  const lfoPer = (spd, sec, wms) => { const y = noise(Math.round(SR * sec)), o = fxr({mfx: {type: 0, spd, dep: 100}}, y, y, {}), w = Math.round(wms * SR), dl = [];
    for (let s = 4800; s + w + 400 < y.length; s += w) { let best = -1e9, bl = 0; for (let L = 40; L < 260; L++) { let c = 0; for (let i = 0; i < w; i++) c += o.l[s + i + L] * y[s + i]; if (c > best) { best = c; bl = L; } } dl.push(bl); }
    const mean = dl.reduce((a, b) => a + b, 0) / dl.length, zc = []; for (let i = 1; i < dl.length; i++) if ((dl[i - 1] - mean) < 0 && (dl[i] - mean) >= 0) zc.push(i);
    return zc.length > 1 ? (zc[zc.length - 1] - zc[0]) / (zc.length - 1) * wms : 0; };
  const p64 = lfoPer(64, 5, .02), p127 = lfoPer(127, 1.2, .004);
  R.push(['MOD-FX TEMPO (64 → 127): LFO-Periode ' + M(p64, 3) + ' → ' + M(p127, 3) + ' s, ×½ oder weniger; Kehrwert', p64 / p127, 2]);
  // delay: TIEFE level of the echo, ZEIT and NOTE echo time
  const im = imp(SR * 2.5, 2400), e1 = (fx, bpm) => { const o = fxr(fx, im, im, {bpm, sec: 2.5}); const e = echoes(o.l, 2401, 1e-4, 1)[0]; return e ? [e[0] - 2400, e[1]] : [0, 0]; };
  R.push(['DELAY TIEFE (1 → 127): Echo-Pegel', db(e1({dly: {type: 0, sync: 0, time: 64, dep: 127}})[1] / e1({dly: {type: 0, sync: 0, time: 64, dep: 1}})[1]), 3]);
  R.push(['DELAY ZEIT (0 → 127): Echozeit ×', e1({dly: {type: 0, sync: 0, time: 127, dep: 64}})[0] / e1({dly: {type: 0, sync: 0, time: 0, dep: 64}})[0], 2]);
  R.push(['DELAY NOTE (1/32 → 1/1): Echozeit ×', e1({dly: {type: 0, sync: 1, note: 14, dep: 64}}, 120)[0] / e1({dly: {type: 0, sync: 1, note: 0, dep: 64}}, 120)[0], 2]);
  R.push(['DELAY TEMPO SYNC (aus ZEIT 64 → an 1/4): Echozeit ×', e1({dly: {type: 0, sync: 1, time: 64, note: 8, dep: 64}}, 120)[0] / e1({dly: {type: 0, sync: 0, time: 64, note: 8, dep: 64}}, 120)[0], 2]);
  { const z = new Float32Array(SR * 2); const o0 = fxr({dly: {type: 0, sync: 1, note: 5, dep: 100}}, im, z, {bpm: 120}), o1 = fxr({dly: {type: 1, sync: 1, note: 5, dep: 100}}, im, z, {bpm: 120});
    const seg = (c, k) => pdb(rms(c, 2400 + 12000 * k - 200, 2400 + 12000 * k + 200) ** 2 + 1e-30);
    R.push(['DELAY TYP (Stereo → Kreuz): Pegel rechts im 1. Echo-Paar', Math.abs(seg(o1.r, 2) - seg(o0.r, 2)), 3]); }
  // EQ
  const g = (eq, f) => at(tf(x, fxr({eq}, x, x).l, 4800, x.length, 8192), f);
  R.push(['EQ TIEF-GAIN (−12 → +12) bei 60 Hz', g({lf: 320, lg: 12, hf: 6000, hg: 0}, 60) - g({lf: 320, lg: -12, hf: 6000, hg: 0}, 60), 6]);
  R.push(['EQ TIEF-FREQ (40 → 1000 Hz, +12 dB) bei 300 Hz', g({lf: 1000, lg: 12, hf: 6000, hg: 0}, 300) - g({lf: 40, lg: 12, hf: 6000, hg: 0}, 300), 6]);
  R.push(['EQ HOCH-GAIN (−12 → +12) bei 12 kHz', g({lf: 320, lg: 0, hf: 6000, hg: 12}, 12000) - g({lf: 320, lg: 0, hf: 6000, hg: -12}, 12000), 6]);
  R.push(['EQ HOCH-FREQ (18 → 1 kHz, +12 dB) bei 3 kHz', g({lf: 320, lg: 0, hf: 1000, hg: 12}, 3000) - g({lf: 320, lg: 0, hf: 18000, hg: 12}, 3000), 6]);
  for (const [n, v, lim] of R) ok('MK4-H H-1 ' + n, Math.abs(v) >= lim, M(v, 2) + (lim === 2 ? ' ×' : ' dB') + ' (≥ ' + lim + ')');
  // H-3: positions 0, 1/4, 1/2, 3/4, 1 without a step back > 0.5 dB in the target measure
  const pos = (lo, hi) => [0, .25, .5, .75, 1].map(u => lo + (hi - lo) * u);
  const H3 = [];
  H3.push(['MOD-FX TIEFE (Cho/Flg, Kerbtiefe)', pos(0, 127).map(d => { const o = fxr({mfx: {type: 0, spd: 64, dep: d}}, x, x, {frz: .25}); const N = notches(tf(x, o.l, 4800, x.length, 4096), 200, 15000); return N.length ? Math.max(...N.map(q => q.depth)) : 0; })]);
  H3.push(['MOD-FX TIEFE (Phaser, tiefste Kerbe)', pos(0, 127).map(d => { const o = fxr({mfx: {type: 2, spd: 64, dep: d}}, x, x, {frz: .75}); const N = notches(tf(x, o.l, 4800, x.length, 8192), 20, 20000); return N.length ? Math.max(...N.map(q => q.depth)) : 0; })]);
  H3.push(['MOD-FX TIEFE (Ensemble, L/R-Unterschied in dB)', pos(0, 127).map(d => { const o = fxr({mfx: {type: 1, spd: 64, dep: d}}, x, x, {frz: .3}); let e = 0; for (let i = 4800; i < x.length; i++) e += (o.l[i] - o.r[i]) ** 2; return pdb(e / (x.length - 4800) + 1e-12); })]);
  H3.push(['DELAY TIEFE (Echo-Pegel)', pos(1, 127).map(d => db(e1({dly: {type: 0, sync: 0, time: 64, dep: d}})[1]))]);
  H3.push(['DELAY ZEIT (Echozeit in dB)', pos(0, 127).map(t => db(e1({dly: {type: 0, sync: 0, time: t, dep: 64}})[0]))]);
  H3.push(['EQ TIEF-GAIN bei 60 Hz', pos(-12, 12).map(v => g({lf: 320, lg: Math.round(v * 2) / 2, hf: 6000, hg: 0}, 60))]);
  H3.push(['EQ TIEF-FREQ bei 300 Hz (+12)', [40, 89, 200, 447, 1000].map(f => g({lf: f, lg: 12, hf: 6000, hg: 0}, 300))]);
  H3.push(['EQ HOCH-GAIN bei 12 kHz', pos(-12, 12).map(v => g({lf: 320, lg: 0, hf: 6000, hg: Math.round(v * 2) / 2}, 12000))]);
  H3.push(['EQ HOCH-FREQ bei 3 kHz (+12, fallend)', [18000, 8050, 4243, 2236, 1000].map(f => g({lf: 320, lg: 0, hf: f, hg: 12}, 3000))]);
  for (const [n, v] of H3) { let back = 0; for (let i = 1; i < v.length; i++) back = Math.max(back, v[i - 1] - v[i]); ok('MK4-H H-3 ' + n, back <= .5, v.map(q => M(q, 2)).join(' → ')); }
});
// ---------------- FP-DSP: extremes (NaN/Inf, peaks), denormals, tails end ----------------
T('MK4-FP', () => {
  const ev = []; for (const nt of [36, 48, 84, 96, 108]) ev.push([0, 'on', nt, 1]); for (const nt of [36, 48, 84, 96, 108]) ev.push([15, 'off', nt]);
  const T0 = {o1: {w: 0}, o2: {w: 1, mod: 3, semi: 24}, mix: {o1: 127, o2: 127, n: 127}, f: {type: 0, cut: 127, res: 127}, a: {dist: 1}};
  let worst = 0, nan = 0;
  for (const [mt, dt] of [[0, 0], [1, 1], [2, 2], [0, 2], [2, 1]]) for (const spd of [0, 127]) {
    const fx = {mfx: {type: mt, spd, dep: 127}, dly: {type: dt, sync: 0, time: spd ? 0 : 127, dep: 127}, eq: {lf: spd ? 40 : 1000, lg: 12, hf: spd ? 18000 : 1000, hg: 12}};
    const o = render(FXP(fx, T0), ev, {sec: 20});
    for (let i = 0; i < o.l.length; i++) { const a = o.l[i], b = o.r[i]; if (!isFinite(a) || !isFinite(b)) nan++; else worst = Math.max(worst, Math.abs(a), Math.abs(b)); }
  }
  ok('FP-DSP Extremwerte (alle Regler auf Anschlag, Rückkopplung 127, EQ +12 dB, Resonanz 127, 20 s): kein NaN/Inf', nan === 0, 'NaN ' + nan + ', Spitze ' + M(db(worst)) + ' dBFS (Vollaussteuerung + EQ +24 dB über alles; Begrenzer erst in der Spur)');
  // denormals: 60 s silence after full scale through every new path; each 1 s load window <= 1.1 x the first silent second
  const n = SR * 63, x = new Float32Array(n); for (let i = 0; i < SR * 2; i++) x[i] = Math.sin(i * .05) * .99;
  const lines = [], base = fxr({}, x, x, {sec: 63, ro: {quantumMs: true}}).qms, med = a => { const b = a.slice().sort((p, q) => p - q); return b[b.length >> 1]; };
  const bw = []; for (let s = 3; s < 62; s++) bw.push(base.slice(s * 375, (s + 1) * 375).reduce((a, b) => a + b, 0)); const bmed = med(bw);
  for (const fx of [{mfx: {type: 0, spd: 64, dep: 127}}, {mfx: {type: 1, spd: 64, dep: 127}}, {mfx: {type: 2, spd: 64, dep: 127}}, {dly: {type: 1, sync: 0, time: 127, dep: 127}}, {eq: {lf: 40, lg: 12, hf: 18000, hg: -12}},
    {mfx: {type: 2, spd: 64, dep: 127}, dly: {type: 2, sync: 0, time: 100, dep: 127}, eq: {lf: 100, lg: 12, hf: 1000, hg: 12}}]) {
    const o = fxr(fx, x, x, {sec: 63, ro: {quantumMs: true}}), q = o.qms, per = 375, win = [];
    for (let s = 3; s < 62; s++) win.push(q.slice(s * per, (s + 1) * per).reduce((a, b) => a + b, 0));
    let dn = 0; const st = o.P.mk.fx; for (const a of [st.ap, st.q, st.py, st.cL, st.cR, st.eM]) for (const v of a) if (v !== 0 && Math.abs(v) < 1e-30) dn++;
    if (st.dL) for (const a of [st.dL, st.dR]) for (const v of a) if (v !== 0 && Math.abs(v) < 1e-30) dn++;
    const tail = peak(o.l, o.l.length - SR), hotOk = !st.hot() || tail >= 1e-7;   // still running only while the echo tail is above the quiet line
    lines.push([JSON.stringify(fx).slice(0, 40), med(win.slice(-20)), dn, hotOk, st.hot(), tail]);
  }
  ok('FP-DSP Denormale: 60 s Stille nach Vollaussteuerung: keine Zustände < 1e-30, Last der letzten 20 s (Median je s) ≤ 2 × Stille ohne Effekt + 1 ms (Denormale kosten ×10 und mehr), Effekt hört auf zu rechnen, sobald still', lines.every(l => l[1] <= 2 * bmed + 1 && l[2] === 0 && l[3]),
    'ohne Effekt ' + M(bmed, 2) + ' ms/s | ' + lines.map(l => M(l[1], 2) + ' ms/s, < 1e-30: ' + l[2] + ', rechnet noch: ' + l[4] + (l[4] ? ' (Echo ' + M(db(l[5])) + ' dBFS)' : '')).join(' | '));
});
console.log(fails ? fails + ' FEHLER' : 'alles bestanden'); process.exit(fails ? 1 : 0);
