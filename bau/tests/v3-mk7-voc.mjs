// MK7 Node-Offline acceptance (Nachtrag 3 MK7-01 … MK7-09, 11 (bands), 12 (bit-equal), 16; FP-DSP extras). Usage: node v3-mk7-voc.mjs [index.html] [predecessor.html]
import path from 'path';
import fs from 'fs';
const FILE = path.resolve(process.argv[2] || new URL('../mk-br-MK7/index.html', import.meta.url).pathname);
const PRE = path.resolve(process.argv[3] || new URL('../synq-snapshots/G-MK34-merge.html', import.meta.url).pathname);
process.env.MK_FILE = FILE;
const {render, vocP, sine, noise, rms, db, spectrum, bandE} = await import('./v3-mk7-node.mjs');
const {mKlick, mEinbruch, centroid} = await import('./v3-mk1-ana.mjs');
const ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
let fails = 0, n = 0; const ok = (id, c, info) => { n++; if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
const T = async (id, f) => { if (ONLY && !ONLY.test(id)) return; try { await f(); } catch (e) { ok(id, false, 'Fehler ' + String(e.stack || e).slice(0, 400)); } };
const sr = 48000, W = render(vocP({}, {}), [], {sec: .01}).MKW, R = W.VR, C = k => R[k + 4];
const src = fs.readFileSync(FILE, 'utf8'), mkVowel = new Function('W', src.slice(src.indexOf('/*MKV{*/'), src.indexOf('/*}MKV*/')) + '\n;return mkVowel;')();
const NZ = {mix: {o1: 0, o2: 0, n: 127}};   // noise carrier
const hold1 = k => { const h = new Array(16).fill(0); h[k] = 127; return h; };
const posHz = p => { const i = Math.min(22, Math.floor(p)), t = p - i; return R[i] * Math.pow(R[i + 1] / R[i], t); };
// the band's peak: an impulse into E1 (EINGANG 1 127, no voice), one band held open; the maximum of |FFT| of the impulse response
// (parabolic interpolation between the bins), searched between f1 and f2
const IMP = (() => { const x = new Float32Array(sr * 2); x[sr / 4] = 1; return x; })();
function bandPeak(over, f1, f2) {
  const r = render(vocP(Object.assign({ins: 127}, over), {mix: {o1: 0, o2: 0, n: 0}}), [], {sec: 1.5, inputs: {e1: IMP}}), N = 65536, x = new Float64Array(N);
  for (let i = 0; i < N; i++) x[i] = r.l[sr / 4 + i] || 0;
  const P = spectrum(Float32Array.from(x), 0, N), df = sr / N; let bk = 0;
  for (let k = Math.floor(f1 / df); k <= Math.ceil(f2 / df); k++) if (!bk || P[k] > P[bk]) bk = k;
  const a = Math.log(P[bk - 1]), b = Math.log(P[bk]), c = Math.log(P[bk + 1]); return (bk + .5 * (a - c) / (a - 2 * b + c)) * df;
}
// FC-MOD (EG2 needs a voice): noise carrier, Welch average of 8 windows, maximum smoothed over +-2 %
function peakHz2(x, f1, f2) { const N = 8192, P = new Float64Array(N / 2), df = sr / N; for (let w = 0; w < 14; w++) { const Q = spectrum(x, Math.round(.25 * sr) + w * N / 2, N); for (let k = 0; k < N / 2; k++) P[k] += Q[k]; }
  let best = 0, bf = 0; for (let f = f1; f <= f2; f *= 1.002) { let e = 0; for (let k = Math.floor(f * .98 / df); k <= Math.ceil(f * 1.02 / df); k++) e += P[k] || 0; if (e > best) { best = e; bf = f; } } return bf; }
await T('MK7-01', () => {
  const edge = (k, s) => Math.sqrt(C(k) * (s > 0 ? R[k + 5] : R[k + 3])), N = 65536; let w1 = 99, w3 = 99, wk = '';
  for (let k = 0; k < 16; k++) {
    const r = render(vocP({res: 64}, NZ), [[0, 'on', 60, .8]], {sec: 2, inputs: {e2: sine(C(k), 2, sr, .3)}}), P = spectrum(r.l, 96000 - N - 100, N);
    const E = j => (j < 0 || j > 15 ? null : bandE(P, sr, N, edge(j, -1), edge(j, 1))), ek = E(k);
    for (const d of [-3, -1, 1, 3]) { const e = E(k + d); if (e == null) continue; const x = 10 * Math.log10(ek / e); if (Math.abs(d) === 1) { if (x < w1) { w1 = x; wk = 'Band ' + (k + 1) + (d > 0 ? '/+1' : '/−1'); } } else w3 = Math.min(w3, x); }
  }
  ok('MK7-01 Bandtrennung k±1', w1 >= 12, 'schlechtestes ' + w1.toFixed(1) + ' dB (' + wk + ', ≥ 12)'); ok('MK7-01 Bandtrennung k±3', w3 >= 30, 'schlechtestes ' + w3.toFixed(1) + ' dB (≥ 30)');
});
await T('MK7-02', () => {
  let worst = 0, info = [];
  for (const [fs_, cut, lab] of [[0, 0, 'FORMANT 0'], [1, 0, 'FORMANT +1'], [-2, 0, 'FORMANT −2'], [0, 63, 'CUTOFF +63']]) for (const k of [0, 5, 10, 15]) {
    const exp = posHz(Math.max(0, Math.min(23, k + 4 + fs_ + 2 * cut / 63)));
    const f = bandPeak({res: 127, fs: fs_, cut, hold: hold1(k)}, exp / 1.5, exp * 1.5), e = Math.abs(f / exp - 1);
    if (e > worst) worst = e; if (k === 15 || k === 0) info.push(lab + ' B' + (k + 1) + ' ' + Math.round(f) + '/' + Math.round(exp));
  }
  ok('MK7-02 Spitzen (W-36, FORMANT, CUTOFF +63)', worst <= .03, 'größte Abweichung ' + (worst * 100).toFixed(2) + ' % (≤ 3) · ' + info.join(', '));
  let w32 = 0; for (const k of [2, 8, 12]) { const exp = posHz(k + 4 + 2 * 32 / 63), f = bandPeak({res: 127, cut: 32, hold: hold1(k)}, exp / 1.5, exp * 1.5); w32 = Math.max(w32, Math.abs(Math.log(f / exp)) / Math.log(posHz(k + 5) / posHz(k + 4))); }
  ok('MK7-02 CUTOFF +32', w32 <= .05, 'zwischen +1 Stufe: Abweichung ' + (w32 * 100).toFixed(1) + ' % einer Stufe (log, ≤ 5)');
  // FC-MOD EG2 +63 at the peak (sustain 127): +2 steps
  let wf = 0; for (const k of [3, 9]) { const exp = posHz(k + 6), r = render(vocP({res: 127, msrc: 1, mint: 63, hold: hold1(k)}, {mix: {o1: 0, o2: 0, n: 127}}), [[0, 'on', 60, .8]], {sec: 1.6}); const f = peakHz2(r.l, exp / 1.5, exp * 1.5); wf = Math.max(wf, Math.abs(f / exp - 1)); }
  ok('MK7-02 FC-MOD EG2 +63', wf <= .03, '+2 Stufen am Gipfel, Abweichung ' + (wf * 100).toFixed(2) + ' %');
});
await T('MK7-03', () => {
  // decay (-20 dB) after the modulator stops: a sine carrier at band 16 (note 111), modulator sine 5000 Hz stops at 1 s
  for (const efs of [0, 64, 126]) {
    const tau = W.vocTau(efs), exp = tau * Math.log(10), sec = 1.2 + exp * 2 + .3, mod = sine(5000, 1, sr, .3);
    const r = render(vocP({efs}, {o1: {w: 3, c1: 0, c2: 0}}), [[0, 'on', 111, .8]], {sec, inputs: {e2: mod}});
    const W2 = 48, lev = i => rms(r.l, i, i + W2), ref = lev(sr - 2400); let t6 = -1, t26 = -1;
    for (let i = sr; i < r.l.length - W2; i += 6) { const d = db(lev(i) / ref); if (t6 < 0 && d <= -6) t6 = i; if (d <= -26) { t26 = i; break; } }
    const t = (t26 - t6) / sr;
    ok('MK7-03 FOLGER ' + efs, t6 > 0 && t26 > 0 && Math.abs(t / exp - 1) <= .1, 'Abfall um 20 dB (−6 → −26 dB) in ' + (t * 1000).toFixed(1) + ' ms, W-38 ' + (exp * 1000).toFixed(1) + ' ms (± 10 %); Beginn des Abfalls (−6 dB) nach ' + ((t6 - sr) / sr * 1000).toFixed(1) + ' ms');
  }
  // hold: FOLGER 127 / TIMBRE (mkHoldGet at 0.8 s), the modulator stops at 1 s, the output stays over 5 s
  for (const how of ['efs127', 'taste']) {
    const vox = mkVowel({f0: 110, v: 'a', sec: 1, sr, rms: -20}, W);
    const at = how === 'taste' ? [[.8, {mkHoldGet: 1}]] : [[.8, {mkSet: {'voc.efs': 127}}]];
    const r = render(vocP({efs: 40}, {}), [[0, 'on', 48, .8]], {sec: 6.6, inputs: {e2: vox}, at});   // one saw note: no beating of a tempered chord
    // the held level (0.85 … 1.0 s, the modulator still on) against every 0.5 s after it went silent (1.0 … 6.5 s)
    const m0 = db(rms(r.l, Math.round(.85 * sr), sr)); let dev = 0; for (let t = 1; t < 6.5; t += .5) dev = Math.max(dev, Math.abs(db(rms(r.l, Math.round(t * sr), Math.round((t + .5) * sr))) - m0));
    const msg = (r.msgs.find(m => m.mkHold) || {}).mkHold;
    ok('MK7-03 Halten (' + (how === 'taste' ? 'TIMBRE/HALTEN' : 'FOLGER 127') + ')', dev <= .5, 'nach dem Verstummen 5 s: max. Abweichung der 1-s-Pegel ' + dev.toFixed(2) + ' dB (≤ 0,5)' + (msg ? ' · gemeldet hold = [' + msg.slice(0, 6).join(',') + '…]' : ''));
    if (how === 'taste') {
      // the reported hold stored in the sound: a sound with hold sounds without any source
      const r2 = render(vocP({efs: 40, hold: msg}, {}), [[0, 'on', 48, .8]], {sec: 1.5});
      const l2 = db(rms(r2.l, 1 * sr, 1.5 * sr)), l1 = db(rms(r.l, 2 * sr, 2.5 * sr));
      ok('MK7-03 hold ohne Quelle', Math.abs(l2 - l1) <= 1 && l2 > -60, 'Sound mit hold, kein Eingang: ' + l2.toFixed(1) + ' dBFS (gehalten ' + l1.toFixed(1) + ')');
    }
  }
});
await T('MK7-04', () => {
  // gate: SCHWELLE 64 (−41.8 dBFS), modulator sine 1 kHz at −20 dBFS, then −60 dBFS from 1 s; GATE 64 / 100
  for (const gs of [64, 100]) {
    const gt = W.vocGate(gs), sec = 1.3 + gt * 1.5, mod = sine(1150, sec, sr, .1); for (let i = sr; i < mod.length; i++) mod[i] *= .01;
    const r = render(vocP({th: 64, gs, efs: 126}, {}), [[0, 'on', 48, .8], [0, 'on', 55, .8]], {sec, inputs: {e2: mod}});
    const W2 = 480, ref = rms(r.l, .8 * sr, sr); let t = -1; for (let i = sr; i < r.l.length - W2; i += 24) if (db(rms(r.l, i, i + W2) / ref) <= -60) { t = (i + W2 / 2 - sr) / sr; break; }
    ok('MK7-04 Gate GATE ' + gs, t > 0 && Math.abs(t / gt - 1) <= .1, '≤ −60 dB nach ' + (t * 1000).toFixed(1) + ' ms, W-39 ' + (gt * 1000).toFixed(1) + ' ms (± 10 %)');
  }
  // SCHWELLE 0: follows the modulator down to −90 dB (10 dB steps), identical to „Gate aus“
  const mod = sine(1150, 11, sr, .1); for (let s = 1; s < 11; s++) for (let i = s * sr; i < (s + 1) * sr; i++) mod[i] = .1 * Math.pow(10, -s / 2) * Math.sin(2 * Math.PI * 1150 * i / sr);
  const r = render(vocP({th: 0, gs: 0, efs: 0}, {o1: {w: 3}, mix: {o1: 127, o2: 0, n: 0}}), [[0, 'on', 81, .8]], {sec: 11, inputs: {e2: mod}});
  let worst = 0; const L0 = db(rms(r.l, .5 * sr, sr)); for (let s = 1; s <= 9; s++) { const d = db(rms(r.l, (s + .5) * sr, (s + 1) * sr)) - L0 + 10 * s; worst = Math.max(worst, Math.abs(d)); }
  ok('MK7-04 SCHWELLE 0', worst <= 1, 'Ausgang folgt dem Modulator in 10-dB-Stufen bis −90 dB: Abweichung ≤ ' + worst.toFixed(2) + ' dB (keine Gate-Schließung)');
});
await T('MK7-05', () => {
  const mod = noise(2, sr, .3, 3), N = 32768, Pm = spectrum(mod, sr, N), hfM = bandE(Pm, sr, N, 7000, 16000);
  const a = render(vocP({hpl: 127, hpg: 0}, {}), [], {sec: 2, inputs: {e2: mod}}), Pa = spectrum(a.l, sr, N), hfA = bandE(Pa, sr, N, 7000, 16000);
  ok('MK7-05 HPF-PEGEL 127 (DIS)', 10 * Math.log10(hfA / hfM) >= -20, 'Modulator > 6 kHz im Ausgang: ' + (10 * Math.log10(hfA / hfM)).toFixed(1) + ' dB relativ (≥ −20)');
  const b = render(vocP({hpl: 127, hpg: 1}, {}), [], {sec: 2, inputs: {e2: mod}}), c = render(vocP({hpl: 127, hpg: 1}, {}), [[0, 'on', 60, .8]], {sec: 2, inputs: {e2: mod}});
  const hb = 10 * Math.log10(bandE(spectrum(b.l, sr, N), sr, N, 7000, 16000) / hfM + 1e-30), hc = 10 * Math.log10(bandE(spectrum(c.l, sr, N), sr, N, 7000, 16000) / hfM);
  ok('MK7-05 HPF-GATE ENA', hb < -80 && hc >= -20, 'ohne Trägerstimme ' + hb.toFixed(0) + ' dB, mit Stimme ' + hc.toFixed(1) + ' dB');
});
await T('MK7-06', () => {
  const mod = mkVowel({f0: 120, v: ['a', 'i'], seg: .5, sec: 1, sr, rms: -20}, W);
  const a = render(vocP({dir: 127}, {}), [], {sec: 1, inputs: {e2: mod}}), b = render(vocP({dir: 0}, {}), [], {sec: 1, inputs: {e2: mod}});
  let xy = 0, xx = 0, yy = 0; for (let i = 4800; i < 48000; i++) { xy += a.l[i] * mod[i]; xx += mod[i] * mod[i]; yy += a.l[i] * a.l[i]; }
  const k = xy / Math.sqrt(xx * yy);
  ok('MK7-06 DIREKT', k >= .95 && rms(b.l) === 0, 'DIREKT 127 ohne Stimme: Korrelation ' + k.toFixed(4) + ' (≥ 0,95) · DIREKT 0: ' + (rms(b.l) === 0 ? 'still' : db(rms(b.l)).toFixed(0) + ' dB'));
});
await T('MK7-07', () => {
  // channel level 0 = the band silent; pan L63 = right silent (bands alone, via hold)
  let w = -999, wr = -999;
  for (const k of [0, 7, 15]) {
    const on = render(vocP({hold: hold1(k)}, NZ), [[0, 'on', 60, .8]], {sec: 1}), chl = new Array(16).fill(127); chl[k] = 0;
    const off = render(vocP({hold: hold1(k), chl}, NZ), [[0, 'on', 60, .8]], {sec: 1}); w = Math.max(w, db(rms(off.l, 24000, 48000) / rms(on.l, 24000, 48000)));
    const chp = new Array(16).fill(0); chp[k] = -63; const p = render(vocP({hold: hold1(k), chp}, NZ), [[0, 'on', 60, .8]], {sec: 1}); wr = Math.max(wr, db(rms(p.r, 24000, 48000) / rms(p.l, 24000, 48000)));
  }
  ok('MK7-07 K-PEGEL 0', w <= -40, 'Band mit Pegel 0: ' + (w < -200 ? '−∞' : w.toFixed(1)) + ' dB (≤ −40)'); ok('MK7-07 K-PAN L63', wr <= -30, 'rechts ' + (wr < -200 ? '−∞' : wr.toFixed(1)) + ' dB (≤ −30)');
});
await T('MK7-08', () => {
  const vox = mkVowel({f0: 110, v: 'a', sec: 1.5, sr, rms: -20}, W), e1 = sine(220, 1.5, sr, .4);
  const lev = [];
  for (let w = 0; w <= 7; w++) { const r = render(vocP({}, {o1: {w, c1: 20, c2: 40}, mix: {o1: 127, o2: 0, n: 0}}), [[0, 'on', 48, .8]], {sec: 1.5, inputs: {e1, e2: vox}, at: w === 5 ? [] : []}); lev.push(db(rms(r.l, .7 * sr, 1.5 * sr))); }
  ok('MK7-08 jede OSZ-1-Welle als Träger', lev.every(x => x > -45), lev.map((x, w) => ['SAG', 'PUL', 'TRI', 'SIN', 'STI', 'SPE', 'RAU', 'EIN'][w] + ' ' + x.toFixed(1)).join(', ') + ' dBFS (Speicherwelle = Platzhalter-Säge ohne Tabelle im Node-Lauf)');
  // chord C-E-G-B: 4 pitches in the spectrum (noise-free saw carrier, vowel modulator 'a' at 110 Hz)
  const r = render(vocP({efs: 40}, {}), [[0, 'on', 48, .8], [0, 'on', 52, .8], [0, 'on', 55, .8], [0, 'on', 59, .8]], {sec: 2, inputs: {e2: mkVowel({f0: 110, v: 'a', sec: 2, sr, rms: -20}, W)}});
  const N = 65536, P = spectrum(r.l, 96000 - N - 10, N), df = sr / N, fr = [48, 52, 55, 59].map(n_ => 440 * Math.pow(2, (n_ - 69) / 12));
  const at = f => { let e = 0; for (let k = Math.round(f * 2 / df) - 2; k <= Math.round(f * 2 / df) + 2; k++) e += P[k]; return e; }, mid = f => { let e = 0; for (let k = Math.round(f * 2.06 / df) - 2; k <= Math.round(f * 2.06 / df) + 2; k++) e += P[k]; return e; };
  const pk = fr.map(f => 10 * Math.log10(at(f) / mid(f)));   // 2nd harmonic of each note against the gap beside it
  ok('MK7-08 Akkord C-E-G-H', pk.every(x => x > 15), '2. Teilton je Note über der Lücke daneben: ' + pk.map(x => x.toFixed(0)).join(' / ') + ' dB');
  // mixer EINGANG 1: E1 in the carrier
  const a = render(vocP({ins: 127}, {mix: {o1: 0, o2: 0, n: 0}}), [], {sec: 1, inputs: {e1: noise(1, sr, .3), e2: vox}}), b = render(vocP({ins: 0}, {mix: {o1: 0, o2: 0, n: 0}}), [], {sec: 1, inputs: {e1: noise(1, sr, .3), e2: vox}});
  ok('MK7-08 Mixer EINGANG 1', db(rms(a.l, 24000, 48000)) > -50 && rms(b.l) === 0, 'E1 im Träger ' + db(rms(a.l, 24000, 48000)).toFixed(1) + ' dBFS, EINGANG 1 = 0: still');
  // sine carrier: STEUER 1 0 -> 127 raises the centroid (of the carrier, no vocoder colour: flat hold) >= 1/3 octave; STEUER 2 + LFO1 moves it
  const h = new Array(16).fill(127), cs = c1 => { const r = render(vocP({hold: h}, {o1: {w: 3, c1, c2: 0}}), [[0, 'on', 48, .8]], {sec: 1}); return centroid(r.l, 24000, 16384, sr); };
  const c0 = cs(0), c7 = cs(127);
  ok('MK7-08 Sinus STEUER 1', Math.log2(c7 / c0) >= 1 / 3, 'M-SP ' + c0.toFixed(0) + ' → ' + c7.toFixed(0) + ' Hz = +' + Math.log2(c7 / c0).toFixed(2) + ' Okt (≥ 0,33)');
  const rl = render(vocP({hold: h}, {o1: {w: 3, c1: 0, c2: 127}, l1: {w: 2, f: 64, ks: 0, sync: 0}}), [[0, 'on', 48, .8]], {sec: 3});
  const cc = []; for (let s = .5; s < 2.8; s += .05) cc.push(centroid(rl.l, Math.round(s * sr), 2048, sr)); const lo = Math.min(...cc), hi = Math.max(...cc);
  ok('MK7-08 Sinus STEUER 2 (LFO 1)', Math.log2(hi / lo) >= 1 / 3, 'M-SP wandert ' + lo.toFixed(0) + ' … ' + hi.toFixed(0) + ' Hz mit LFO 1 (' + W.lfoHz(64).toFixed(2) + ' Hz)');
});
await T('MK7-09', () => {
  const syn = o1 => { const p = vocP({}, Object.assign({o1}, o1.f ? {} : {})); p.mode = 0; return p; };
  const E1 = sine(440, 1, sr, .5), E2 = sine(660, 1, sr, .5);
  const mk = (o1, f, ex) => { const p = vocP({}, {o1, f: Object.assign({type: 0, cut: 127, res: 0, eg: 0, vel: 0, kbd: 0}, f || {})}); p.mode = 0; if (ex) Object.assign(p.t[0], ex); return p; };
  const open = render(mk({w: 7, c1: 0, c2: 0}), [[0, 'on', 60, .8]], {sec: 1, inputs: {e1: E1}}), clo = render(mk({w: 7, c1: 0, c2: 0}, {cut: 40}), [[0, 'on', 60, .8]], {sec: 1, inputs: {e1: E1}});
  const att = db(rms(clo.l, 24000, 48000) / rms(open.l, 24000, 48000)), fc = W.cutHz(40), expA = -40 * Math.log10(1 + Math.pow(440 / fc, 2));   // 4 one-pole stages at fc
  ok('MK7-09 Eingang durch den Filter', Math.abs(att - expA) <= 2, '24LPF Cutoff 40 (' + fc.toFixed(0) + ' Hz) bei 440 Hz: ' + att.toFixed(1) + ' dB, Ladder-Kurve ' + expA.toFixed(1) + ' dB (± 2)');
  const N = 32768, sep = c1 => { const r = render(mk({w: 7, c1, c2: 0}), [[0, 'on', 60, .8]], {sec: 1, inputs: {e1: E1, e2: E2}}), P = spectrum(r.l, 8000, N); return 10 * Math.log10(bandE(P, sr, N, 430, 450) / bandE(P, sr, N, 650, 670)); };
  const s0 = sep(0), s7 = sep(127);
  ok('MK7-09 BALANCE', s0 >= 40 && s7 <= -40, 'BALANCE 0: E1 ' + s0.toFixed(1) + ' dB über E2 · 127: E2 ' + (-s7).toFixed(1) + ' dB über E1 (≥ 40)');
  const a = render(mk({w: 7, c1: 30, c2: 0}), [[0, 'on', 60, .8]], {sec: .5, inputs: {e1: E1, e2: E2}}), b = render(mk({w: 7, c1: 30, c2: 0}, null, {trans: 12, tune: 50}), [[0, 'on', 60, .8]], {sec: .5, inputs: {e1: E1, e2: E2}});
  let md = 0; for (let i = 0; i < a.l.length; i++) md = Math.max(md, Math.abs(a.l[i] - b.l[i]));
  ok('MK7-09 Transponieren/Fein ohne Wirkung', md === 0, 'TRANSP. +12, FEIN +50: max |Δ| = ' + md);
});
await T('MK7-11', () => {
  // limiter stage 1: neighbour damping >= 8 dB (as MK7-01, 2nd order), switching passes M-KLICK and M-PEGEL (+-1 dB) on a vowel / noise
  const edge = (k, s) => Math.sqrt(C(k) * (s > 0 ? R[k + 5] : R[k + 3])), N = 65536; let w1 = 99;
  for (let k = 0; k < 16; k++) { const r = render(vocP({res: 64}, NZ), [[0, 'on', 60, .8]], {sec: 2, inputs: {e2: sine(C(k), 2, sr, .3)}, at: [[0, {set: {mkLim: 1}}]]}), P = spectrum(r.l, 96000 - N - 100, N);
    const E = j => (j < 0 || j > 15 ? null : bandE(P, sr, N, edge(j, -1), edge(j, 1))); for (const d of [-1, 1]) { const e = E(k + d); if (e != null) w1 = Math.min(w1, 10 * Math.log10(E(k) / e)); } }
  ok('MK7-11 Stufe 1 Nachbarband', w1 >= 8, 'schlechtestes ' + w1.toFixed(1) + ' dB (≥ 8)');
  const vox = mkVowel({f0: 110, v: 'a', sec: 4, sr, rms: -20}, W), ch = [[0, 'on', 48, .8], [0, 'on', 55, .8], [0, 'on', 60, .8], [0, 'on', 64, .8]];
  for (const [lab, t0, e2] of [['Rauschen/Rauschen', NZ, noise(4, sr, .2, 9)], ['Säge-Akkord/Vokal', {}, vox]]) {
    const chd = lab.startsWith('R') ? ch.slice(0, 1) : ch;
    const a = render(vocP({res: 64}, t0), chd, {sec: 4, inputs: {e2}}), b = render(vocP({res: 64}, t0), chd, {sec: 4, inputs: {e2}, at: [[1, {set: {mkLim: 1}}], [2.5, {set: {mkLim: 0}}]]});
    const dl = db(rms(b.l, 1.7 * sr, 2.5 * sr)) - db(rms(a.l, 1.7 * sr, 2.5 * sr));
    const c2 = render(vocP({res: 64}, t0), chd, {sec: 4, inputs: {e2}, at: [[0, {set: {mkLim: 1}}]]});
    const k = mKlick(b.l.subarray(.5 * sr, 4 * sr), sr, []).worst, k0 = mKlick(a.l.subarray(.5 * sr, 4 * sr), sr, []).worst, k2 = mKlick(c2.l.subarray(.5 * sr, 4 * sr), sr, []).worst, e1 = mEinbruch(b.l, sr, 1.03).worst, e2_ = mEinbruch(b.l, sr, 2.53).worst;
    ok('MK7-11 Umschalten ' + lab, (lab.startsWith('R') ? Math.abs(dl) <= 1 : true) && k <= Math.max(6, Math.max(k0, k2) + .5) && e1 >= -3 && e2_ >= -3, 'M-PEGEL 2. gegen 4. Ordnung ' + (dl > 0 ? '+' : '') + dl.toFixed(2) + ' dB' + (lab.startsWith('R') ? ' (Bandenergie, ± 1)' : ' (Info: harmonischer Träger)') + ' · M-KLICK mit Umschalten ' + k.toFixed(2) + ' dB (der Klang selbst: 4. Ordnung ' + k0.toFixed(2) + ', 2. Ordnung ' + k2.toFixed(2) + '; Grenze max(6, +0,5)) · M-EINBRUCH ' + e1.toFixed(2) + ' / ' + e2_.toFixed(2) + ' dB');
  }
});
await T('MK7-12', async () => {
  // synth programs without input: bit-equal to the predecessor (VA, FM-less flat VA, AM Single / Dual / Split with FX)
  const {render: rPre} = await import('./v3-mk7-node.mjs');
  const cases = [['AM Säge', vocP({}, {}), 0], ['AM Dual+FX', Object.assign(vocP({}, {o1: {w: 1, c1: 30, c2: 20}, mix: {o1: 127, o2: 80, n: 20}}), {mfx: {type: 2, spd: 40, dep: 90}, dly: {type: 1, sync: 1, time: 64, note: 5, dep: 60}}), 1],
    ['AM Split Rauschen', vocP({}, {o1: {w: 6, c1: 30, c2: 90}, f: {type: 1, cut: 70, res: 100}}), 2], ['VA', null, 0]];
  for (const [lab, p, mode] of cases) {
    if (p) p.mode = mode; const ev = [[0, 'on', 48, .8], [0, 'on', 64, .8], [.6, 'off', 48], [.8, 'off', 64]], o = p ? {sec: 1.5} : {sec: 1.5, eng: 0};
    const a = rPre(p, ev, Object.assign({file: FILE}, o)), b = rPre(p, ev, Object.assign({file: PRE}, o));
    let md = 0; for (let i = 0; i < a.l.length; i++) md = Math.max(md, Math.abs(a.l[i] - b.l[i]), Math.abs(a.r[i] - b.r[i]));
    ok('MK7-12 bitgleich ' + lab, md === 0, 'max |Δ| = ' + md + ' gegen ' + path.basename(PRE));
  }
});
await T('MK7-16', () => {
  // the vowel source: F1 / F2 of the spectral envelope at W-44 +- 7 % for C2 and C3, all 5 vowels. The envelope of the formant
  // filter sampled densely: the vowel and its source alone (mkVowel raw, same pitch track) with a slow wide vibrato (+-200 ct,
  // 0.7 Hz) so the harmonics sweep the whole envelope; per STFT frame (4096, hop 512) the ratio vowel / source at every bin where the
  // source has a harmonic (within 3 dB of its local peak), the maximum per bin over 6 s; a formant = the local maximum nearest W-44
  let worst = 0; const info = [];
  for (const f0 of [65.41, 130.81]) {
    const raw = mkVowel({f0, v: 'a', sec: 6, sr: 24000, raw: 1, vib: 200, vibHz: .7}, W), N = 4096, df = 24000 / N;
    for (const v of ['a', 'e', 'i', 'o', 'u']) {
      const x = mkVowel({f0, v, sec: 6, sr: 24000, vib: 200, vibHz: .7}, W), env = new Float64Array(N / 2).fill(-200);
      for (let a0 = 2400; a0 + N < x.length; a0 += 512) {
        const P = spectrum(x, a0, N), Q = spectrum(raw, a0, N);
        for (let k = 2; k < N / 2 - 2; k++) { const lm = Math.max(Q[k - 2], Q[k - 1], Q[k], Q[k + 1], Q[k + 2]); if (Q[k] < lm * .5 || Q[k] < 1e-12) continue; const h = 10 * Math.log10(P[k] / Q[k]); if (h > env[k]) env[k] = h; }
      }
      const sm = new Float64Array(N / 2); for (let k = 3; k < N / 2 - 3; k++) { let m = -200; for (let j = k - 3; j <= k + 3; j++) m = Math.max(m, env[j]); sm[k] = m; }
      const F = W.VOX[v], est = t => { let bk = 0, bd = 1e9; for (let k = Math.floor(t * .7 / df); k <= Math.ceil(t * 1.3 / df); k++) { if (sm[k] < sm[k - 1] || sm[k] < sm[k + 1]) continue; const f = k * df; if (Math.abs(f - t) < bd) { bd = Math.abs(f - t); bk = k; } } return bk * df; };
      const e1 = est(F[0]) / F[0] - 1, e2 = est(F[1]) / F[1] - 1; worst = Math.max(worst, Math.abs(e1), Math.abs(e2));
      info.push(v + '@' + (f0 < 100 ? 'C2' : 'C3') + ' ' + Math.round(est(F[0])) + '/' + Math.round(est(F[1])));
    }
  }
  ok('MK7-16 Vokal-Quelle F1/F2', worst <= .07, 'größte Abweichung ' + (worst * 100).toFixed(1) + ' % (≤ 7) · ' + info.join(', '));
});
await T('FP-DSP', () => {
  // NaN/Inf at extremes, filter stability (FC-MOD from a 50 Hz LFO at full depth, -6 dBFS noise, 20 s), denormals (60 s silence)
  const nz = noise(20, sr, .5, 5), r = render(vocP({res: 127, msrc: 2, mint: 63, cut: 63, fs: 2, efs: 0, th: 127, gs: 127, hpl: 127, hpg: 0, dir: 127, dist: 1, ins: 127}, {mix: {o1: 127, o2: 0, n: 127}, l1: {w: 1, f: 127, sync: 0, ks: 0}}),
    [[0, 'on', 36, 1], [0, 'on', 60, 1], [0, 'on', 84, 1], [0, 'on', 108, 1]], {sec: 20, inputs: {e1: nz, e2: nz}});
  let bad = 0, pk = 0; for (const y of [r.l, r.r]) for (const v of y) { if (!isFinite(v)) bad++; else pk = Math.max(pk, Math.abs(v)); }
  ok('FP-DSP Stabilität', !bad && db(pk) <= 6, 'Extremwerte 20 s (Resonanz 127, FC-MOD 50 Hz voll, alle Pegel 127): ' + bad + ' NaN/Inf, Spitze ' + db(pk).toFixed(1) + ' dBFS (≤ +6)');
  // 3 runs, per 1-s window the minimum over the runs (other jobs on the machine and JIT steps out), median quantum x quanta
  const per = 375, runs = [0, 1, 2].map(() => { const r2 = render(vocP({res: 127, efs: 126}, NZ), [[0, 'on', 60, 1], [1, 'off', 60]], {sec: 62, inputs: {e2: Float32Array.from({length: sr}, () => Math.random() - .5)}, quantumMs: true});
    const w = []; for (let s = 2; s < 62; s++) { const q = r2.qms.slice(s * per, (s + 1) * per).sort((a, b) => a - b); w.push(q[Math.floor(q.length / 2)] * per); } return w; });
  const win = runs[0].map((_, i) => Math.min(...runs.map(w => w[i])));
  ok('FP-DSP Denormale', Math.max(...win.slice(1)) <= 1.1 * win[0] + .05, '60 s Stille nach Vollaussteuerung: 1-s-Fenster max ' + Math.max(...win.slice(1)).toFixed(2) + ' ms, erstes stilles ' + win[0].toFixed(2) + ' ms');
});
console.log((fails ? 'FEHLER ' : 'OK ') + (n - fails) + '/' + n);
process.exit(fails ? 1 : 0);
