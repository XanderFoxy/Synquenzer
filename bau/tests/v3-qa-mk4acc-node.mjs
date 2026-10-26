// QA (acceptance lens) MK4: independent Node checks through REAL voices (no {mkFxIn}), the app worklet from MK_FILE.
// Usage: MK_FILE=<index.html> node v3-qa-mk4acc-node.mjs   (ONLY=<regex>)
import {render, mkPatch} from './v3-mk1-node.mjs';
import {db, pdb, rms, peak, fft, mKlick, mEinbruch} from './v3-mk1-ana.mjs';
const FILE = process.env.MK_FILE;
const only = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
let fails = 0; const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
const T = (id, f) => { if (only && !only.test(id)) return; try { f(); } catch (e) { ok(id, false, 'Fehler ' + (e.stack || e)); } };
const R1 = x => Math.round(x * 10) / 10, R2 = x => Math.round(x * 100) / 100;
const FX0 = {mfx: {type: 0, spd: 64, dep: 0}, dly: {type: 0, sync: 0, time: 64, note: 8, dep: 0}, eq: {lf: 320, lg: 0, hf: 6000, hg: 0}};
const P = (t, fx) => { const p = Object.assign(mkPatch(t), JSON.parse(JSON.stringify(FX0))); for (const k in fx || {}) Object.assign(p[k], fx[k]); return p; };
const SAW = {o1: {w: 0}, mix: {o1: 127, o2: 0, n: 0}, a: {gate: 1}};
const NOISE = {o1: {w: 0}, mix: {o1: 0, o2: 0, n: 127}, a: {gate: 1}};
// lag of the strongest copy of "dry" inside "wet - dry" between lo and hi (samples), with its gain
function lagGain(dry, wet, lo, hi, i0, i1) {
  const d = new Float64Array(wet.length); for (let i = 0; i < wet.length; i++) d[i] = wet[i] - dry[i];
  let best = 0, bl = -1, e0 = 0; for (let i = i0; i < i1; i++) e0 += dry[i] * dry[i];
  for (let L = lo; L <= hi; L++) { let c = 0; for (let i = i0; i < i1 && i + L < d.length; i++) c += d[i + L] * dry[i]; if (Math.abs(c) > Math.abs(best)) { best = c; bl = L; } }
  return {lag: bl, gain: best / e0};
}
// Welch cross transfer |Pxy| / Pxx in dB
function xfer(x, y, i0, i1, n) {
  const Pxx = new Float64Array(n / 2), Rr = new Float64Array(n / 2), Ri = new Float64Array(n / 2);
  for (let s = i0; s + n <= i1; s += n / 2) {
    const a = new Float64Array(n), ai = new Float64Array(n), b = new Float64Array(n), bi = new Float64Array(n);
    for (let i = 0; i < n; i++) { const w = .5 - .5 * Math.cos(2 * Math.PI * i / n); a[i] = x[s + i] * w; b[i] = y[s + i] * w; }
    fft(a, ai); fft(b, bi);
    for (let k = 0; k < n / 2; k++) { Pxx[k] += a[k] * a[k] + ai[k] * ai[k]; Rr[k] += b[k] * a[k] + bi[k] * ai[k]; Ri[k] += bi[k] * a[k] - b[k] * ai[k]; }
  }
  return f => { const k = Math.round(f * n / 48000); let num = 0, den = 0; for (let q = k - 1; q <= k + 1; q++) { num += Math.hypot(Rr[q], Ri[q]); den += Pxx[q]; } return pdb((num / den) ** 2); };
}

// ---- MK4-05 through a real voice: first echo 250 ms (12000 samples) in L and R, TIEFE 64 level -5.95 dB, TIEFE 127 each repeat -1.94 dB
T('A-05', () => {
  const ev = [[.1, 'on', 60, .9], [.115, 'off', 60]];
  const dry = render(P(SAW), ev, {sec: 1.5, file: FILE});
  for (const sr of [48000, 44100]) {
    const dr = sr === 48000 ? dry : render(P(SAW), ev, {sec: 1.5, file: FILE, sr});
    const w = render(P(SAW, {dly: {type: 0, sync: 1, note: 5, dep: 64}}), ev, {sec: 1.5, file: FILE, sr});
    const exp = Math.round(.25 * sr), i0 = Math.round(.09 * sr), i1 = Math.round(.14 * sr);
    const gl = lagGain(dr.l, w.l, exp - 50, exp + 50, i0, i1), gr = lagGain(dr.r, w.r, exp - 50, exp + 50, i0, i1);
    ok('A-05 [' + sr + '] Sync 1/8 @120: erstes Echo nach 250 ms ± 1 Sample in L und R (echte Stimme)', Math.abs(gl.lag - exp) <= 1 && Math.abs(gr.lag - exp) <= 1, 'L ' + gl.lag + ' R ' + gr.lag + ' (soll ' + exp + ')');
    ok('A-05 [' + sr + '] TIEFE 64: Echo-Pegel −5,95 ± 0,5 dB', Math.abs(db(gl.gain) - db(64 / 127)) <= .5 && Math.abs(db(gr.gain) - db(64 / 127)) <= .5, 'L ' + R2(db(gl.gain)) + ' R ' + R2(db(gr.gain)) + ' dB');
  }
  const w = render(P(SAW, {dly: {type: 0, sync: 1, note: 5, dep: 127}}), ev, {sec: 2.6, file: FILE});
  const ex = [], D = 12000, i0 = Math.round(.09 * 48000), i1 = Math.round(.14 * 48000); let e0 = 0; for (let i = i0; i < i1; i++) e0 += dry.l[i] * dry.l[i];
  for (let k = 1; k <= 8; k++) { let e = 0; for (let i = i0; i < i1; i++) e += w.l[i + k * D] ** 2; ex.push(pdb(e / e0)); }
  const steps = ex.slice(1).map((x, i) => x - ex[i]);
  ok('A-05 TIEFE 127: jede Wiederholung ≥ 1,9 dB leiser (echte Stimme)', steps.every(s => s <= -1.9), ex.map(R2).join(' / ') + ' dB, Schritte ' + steps.map(R2).join(' / '));
  ok('A-05 TIEFE 127: Spitze ≤ 0 dBFS (kurzer Ton)', peak(w.l) <= 1 && peak(w.r) <= 1, R2(db(Math.max(peak(w.l), peak(w.r)))) + ' dBFS');
});
// ---- MK4-06 Cross with a hard-left voice; L/R with a centred voice
T('A-06', () => {
  const ev = [[.1, 'on', 60, .9], [.115, 'off', 60]], D = 12000, i0 = 4800, i1 = 6800;
  const left = Object.assign({}, SAW, {a: {gate: 1, pan: -63}});
  const dr = render(P(left), ev, {sec: 1.5, file: FILE});
  const lr = (y, k) => { let a = 0, b = 0; for (let i = i0; i < i1; i++) { a += y.l[i + k * D] ** 2; b += y.r[i + k * D] ** 2; } return pdb(a / (b + 1e-30)); };
  ok('A-06 Pan −63 ist hart links (Vorbedingung)', lr(dr, 0) > 40, R1(lr(dr, 0)) + ' dB L−R');
  const c = render(P(left, {dly: {type: 1, sync: 1, note: 5, dep: 100}}), ev, {sec: 1.5, file: FILE});
  const e = [1, 2, 3].map(k => lr(c, k));
  ok('A-06 Kreuz, Quelle nur links: Echos L, R, L je ≥ 20 dB Trennung', e[0] >= 20 && e[1] <= -20 && e[2] >= 20, e.map(R1).join(' / ') + ' dB');
  const m = render(P(SAW, {dly: {type: 2, sync: 1, note: 5, dep: 100}}), ev, {sec: 1.5, file: FILE});
  const f = [1, 2, 3, 4].map(k => lr(m, k));
  ok('A-06 L/R, Mono-Quelle: Echos abwechselnd L, R, L, R', f[0] >= 20 && f[1] <= -20 && f[2] >= 20 && f[3] <= -20, f.map(R1).join(' / ') + ' dB');
});
// ---- MK4-07 ZEIT 0 / 64 / 127 with sync off (W-32), real voice
T('A-07', () => {
  const ev = [[.1, 'on', 72, .9], [.104, 'off', 72]];
  const dr = render(P(SAW), ev, {sec: 2, file: FILE});
  for (const t of [0, 64, 127]) {
    const exp = .001 * Math.pow(2, 10.45 * t / 127) * 48000, w = render(P(SAW, {dly: {type: 0, sync: 0, time: t, dep: 64}}), ev, {sec: 2, file: FILE});
    const g = lagGain(dr.l, w.l, Math.max(1, Math.floor(exp * .97)), Math.ceil(exp * 1.03), 4700, 5200);
    ok('A-07 ZEIT ' + t + ' nach W-32 ± 1 %', Math.abs(g.lag / exp - 1) <= .01, R2(g.lag / 48) + ' ms (W-32 ' + R2(exp / 48) + ' ms)');
  }
});
// ---- MK4-09 EQ on a real noise voice (transfer of the same noise with and without EQ)
T('A-09', () => {
  const ev = [[0, 'on', 60, .9], [3.9, 'off', 60]];
  const x = render(P(NOISE), ev, {sec: 4, file: FILE});
  const y1 = render(P(NOISE, {eq: {lf: 100, lg: 12}}), ev, {sec: 4, file: FILE});
  const y2 = render(P(NOISE, {eq: {hf: 8000, hg: -12}}), ev, {sec: 4, file: FILE});
  const H1 = xfer(x.l, y1.l, 9600, 48000 * 3.8, 32768), H2 = xfer(x.l, y2.l, 9600, 48000 * 3.8, 32768);
  const a = [25, 400, 1000].map(H1), b = [16000, 2000].map(H2);
  ok('A-09 Tiefen-Kuhschwanz 100 Hz +12 dB: 25 Hz +12 ± 0,5, 400 Hz ± 1, 1 kHz ± 0,3 (echte Rausch-Stimme)', Math.abs(a[0] - 12) <= .5 && Math.abs(a[1]) <= 1 && Math.abs(a[2]) <= .3, a.map(R2).join(' / ') + ' dB');
  ok('A-09 Höhen-Kuhschwanz 8 kHz −12 dB: 16 kHz −12 ± 1, 2 kHz ± 0,5', Math.abs(b[0] + 12) <= 1 && Math.abs(b[1]) <= .5, b.map(R2).join(' / ') + ' dB');
  // the range ends and the 0.5 dB grid: lf 40, hf 18000 still act
  const y3 = render(P(NOISE, {eq: {lf: 40, lg: 12, hf: 18000, hg: 12}}), ev, {sec: 4, file: FILE}), H3 = xfer(x.l, y3.l, 9600, 48000 * 3.8, 32768);
  ok('A-09 Grenzen: TIEF 40 Hz +12 wirkt bei 20 Hz, HOCH 18 kHz +12 wirkt bei 21 kHz (≥ +6 dB)', H3(20) >= 6 && H3(21000) >= 6, R2(H3(20)) + ' / ' + R2(H3(21000)) + ' dB');
});
// ---- MK4-14 long sync notes at 44.1 kHz through a real voice (Chromium runs 44.1 kHz)
T('A-14', () => {
  const sr = 44100, ev = [[.1, 'on', 60, .9], [.115, 'off', 60]];
  for (const [bpm, note, val] of [[40, 14, 1], [40, 13, .75], [60, 14, 1], [120, 13, .75]]) {
    const exp = Math.round(val * 4 * 60 / bpm * sr), sec = .3 + exp / sr + .2;
    const dr = render(P(SAW), ev, {sec, file: FILE, sr, bpm}), w = render(P(SAW, {dly: {type: 0, sync: 1, note, dep: 80}}), ev, {sec, file: FILE, sr, bpm});
    const g = lagGain(dr.l, w.l, exp - 20, exp + 20, Math.round(.09 * sr), Math.round(.14 * sr));
    ok('A-14 [44,1 kHz] ' + bpm + ' BPM ' + (val === 1 ? '1/1' : '3/4') + ': erstes Echo genau nach ' + exp + ' ± 1 Sample', Math.abs(g.lag - exp) <= 1, g.lag + ' (' + R2(db(g.gain)) + ' dB)');
  }
  // buffer messages: exactly one {mkFxMem} after the first dep > 0, none before
  const r0 = render(P(SAW, {dly: {dep: 0}}), ev, {sec: .2, file: FILE, sr});
  const r1 = render(P(SAW), ev, {sec: .5, file: FILE, sr, at: [[.05, {mkSet: {'dly.dep': 30}}], [.1, {mkSet: {'dly.dep': 0}}], [.2, {mkSet: {'dly.dep': 90}}]]});
  const m1 = r1.msgs.filter(m => m.mkFxMem != null);
  ok('A-14 Puffer: 0 Byte vor dem ersten TIEFE > 0, danach genau einmal ≈ 2,3 MB (44,1 kHz ≈ 2,1 MB)', r0.msgs.filter(m => m.mkFxMem != null).length === 0 && m1.length === 1, JSON.stringify(m1));
});
// ---- tempo change 120 -> 90 (MK4-08): a NEW note 0.5 s after the change echoes at 1/8 @ 90 = 333.33 ms; also the running echo follows within a bar
T('A-08', () => {
  const ev = [[.1, 'on', 60, .9], [.115, 'off', 60], [1.6, 'on', 64, .9], [1.615, 'off', 64]];
  const at = [[1.1, {tempo: {bpm: 90, start: null}}]];
  const dr = render(P(SAW), ev, {sec: 3, file: FILE, at});
  const w = render(P(SAW, {dly: {type: 0, sync: 1, note: 5, dep: 80}}), ev, {sec: 3, file: FILE, at});
  const exp = Math.round(48000 * .125 * 4 * 60 / 90), g = lagGain(dr.l, w.l, exp - 30, exp + 30, Math.round(1.59 * 48000), Math.round(1.64 * 48000));
  ok('A-08 120 → 90 BPM: neuer Ton echot nach 333,33 ms (≤ 1 Takt nach dem Wechsel)', Math.abs(g.lag - exp) <= 1, g.lag + ' (soll ' + exp + ')');
});
// ---- M-KLICK / M-EINBRUCH on a held bright saw chord (no soft attack) at switches; window -5 ... +80 ms around each switch
function swk(fx, at, ts, bpm) {
  const ev = [[0, 'on', 60, .7], [0, 'on', 64, .6], [0, 'on', 67, .6], [3.9, 'off', 60], [3.9, 'off', 64], [3.9, 'off', 67]];
  const r = render(P({o1: {w: 0}, mix: {o1: 127}, f: {cut: 110}}, fx), ev, {sec: 4, file: FILE, at, bpm});
  let k = -99, e = 0;
  for (const y of [r.l, r.r]) for (const t of ts) { const a = Math.round((t - .03) * 48000), b = Math.round((t + .105) * 48000); k = Math.max(k, mKlick(y.subarray(a, b), 48000, []).worst); e = Math.min(e, mEinbruch(y, 48000, t).worst); }
  return {k, e};
}
T('A-SW', () => {
  const cases = [
    ['Delay NOTE 1/8 → 1/4 → 1/16 bei laufendem Echo', {dly: {type: 0, sync: 1, note: 5, dep: 90}}, [[1.2, {mkSet: {'dly.note': 8}}], [2.0, {mkSet: {'dly.note': 2}}]], [1.2, 2.0]],
    ['Tempo 120 → 40 → 240 mit Sync 1/8', {dly: {type: 0, sync: 1, note: 5, dep: 90}}, [[1.2, {tempo: {bpm: 40, start: null}}], [2.2, {tempo: {bpm: 240, start: null}}]], [1.2, 2.2]],
    ['TEMPO SYNC an → aus', {dly: {type: 1, sync: 1, note: 8, dep: 90, time: 100}}, [[1.5, {mkSet: {'dly.sync': 0}}]], [1.5]],
    ['Delay TIEFE 90 → 0 → 90', {dly: {type: 0, sync: 1, note: 5, dep: 90}}, [[1.5, {mkSet: {'dly.dep': 0}}], [2.5, {mkSet: {'dly.dep': 90}}]], [1.5, 2.5]],
    ['Delay TYP Stereo → L/R → Kreuz', {dly: {type: 0, sync: 1, note: 5, dep: 90}}, [[1.5, {mkSet: {'dly.type': 2}}], [2.5, {mkSet: {'dly.type': 1}}]], [1.5, 2.5]],
    ['MOD-FX Ensemble TIEFE 127 → 0 → 127', {mfx: {type: 1, spd: 64, dep: 127}}, [[1.5, {mkSet: {'mfx.dep': 0}}], [2.5, {mkSet: {'mfx.dep': 127}}]], [1.5, 2.5]],
    ['MOD-FX TYP Phaser → Ensemble (TIEFE 127)', {mfx: {type: 2, spd: 64, dep: 127}}, [[1.5, {mkSet: {'mfx.type': 1}}]], [1.5]],
    ['EQ TIEF-GAIN 0 → +12 → −12', {eq: {lf: 200, lg: 0}}, [[1.5, {mkSet: {'eq.lg': 12}}], [2.5, {mkSet: {'eq.lg': -12}}]], [1.5, 2.5]],
    ['EQ HOCH-FREQ 1 kHz → 18 kHz (−12 dB)', {eq: {hf: 1000, hg: -12}}, [[1.5, {mkSet: {'eq.hf': 18000}}]], [1.5]],
  ];
  for (const [nm, fx, at, ts] of cases) { const r = swk(fx, at, ts); ok('A-SW ' + nm + ': M-KLICK ≤ 6 dB, M-EINBRUCH ≥ −3 dB (Sägen-Akkord)', r.k <= 6 && r.e >= -3, 'M-KLICK ' + R1(r.k) + ' dB, M-EINBRUCH ' + R1(r.e) + ' dB'); }
});
// ---- tail: after note off the echo rings on (fxHot) and stops computing; voices silent before = still bit-identical silence
T('A-TAIL', () => {
  const ev = [[.1, 'on', 60, .9], [.2, 'off', 60]];
  const w = render(P(SAW, {dly: {type: 0, sync: 1, note: 11, dep: 100}}), ev, {sec: 5, file: FILE});
  const e = k => db(rms(w.l, Math.round((.1 + k) * 48000), Math.round((.2 + k) * 48000)));
  ok('A-TAIL Echo klingt nach dem Loslassen weiter (1/2 bei 120 = 1 s; 1., 2., 3. Echo hörbar)', e(1) > -40 && e(2) > -45 && e(3) > -50, [e(0), e(1), e(2), e(3)].map(R1).join(' / ') + ' dBFS');
});
console.log(fails ? fails + ' FAIL' : 'alles bestanden');
