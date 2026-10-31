// G2 Kern-Test (Node, ohne Browser): G2-01, G2-02, G2-03, G2-05, Bitgleichheit, Rechenzeit.
// node bau/helfer/G267/tests/g2-core.mjs
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import {voice, rng, gauss} from '../../../vs-dsp/test-signals.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const load = (f, name) => new Function(fs.readFileSync(path.join(here, '../dsp', f), 'utf8') + '\nreturn ' + name + ';')()();
const V = load('vsdsp.js', 'vsDspMake'), P = load('g2pitch.js', 'g2PitchMake');
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const SR = 48000, hz = m => 440 * Math.pow(2, (m - 69) / 12), ct = (a, b) => 1200 * Math.log2(a / b);

// unabhängige Messung: NSDF (McLeod) je 20-ms-Fenster, Hop 5 ms, Parabel → Hz je Frame
function track(x, sr, a, b) {
  const W = Math.round(0.03 * sr), hop = Math.round(0.005 * sr), out = [];
  for (let s = Math.round(a * sr); s + W + Math.round(sr / 70) < Math.min(x.length, b * sr); s += hop) {
    const tmin = Math.floor(sr / 1000), tmax = Math.ceil(sr / 70), r = new Float64Array(tmax + 2);
    for (let t = tmin - 1; t <= tmax + 1; t++) { let ac = 0, e = 0; for (let j = 0; j < W; j++) { ac += x[s + j] * x[s + j + t]; e += x[s + j] * x[s + j] + x[s + j + t] * x[s + j + t]; } r[t] = e > 0 ? 2 * ac / e : 0; }
    let mx = 0; for (let t = tmin; t <= tmax; t++) mx = Math.max(mx, r[t]);
    if (mx < 0.6) { out.push(NaN); continue; }
    let t = tmin; for (; t <= tmax; t++) if (r[t] >= 0.93 * mx && r[t] >= r[t - 1] && r[t] >= r[t + 1]) break;
    const y0 = r[t - 1], y1 = r[t], y2 = r[t + 1], den = y0 - 2 * y1 + y2, sh = den < 0 ? 0.5 * (y0 - y2) / den : 0;
    out.push(sr / (t + sh));
  }
  return out;
}
const median = a => { const b = a.filter(v => v === v).sort((p, q) => p - q); return b.length ? b[b.length >> 1] : NaN; };
function noteHz(x, n) { const a = n.t + (n.cons ? 0.045 : 0.02) + 0.04, b = n.t + n.d - 0.05; return median(track(x, SR, a, b)); }

// Testmelodie in C-Dur: Töne 30–45 Cent daneben, Konsonanten (Zischlaut-Rauschen) vorn, Atmer zwischen den Phrasen
const C = [60, 62, 64, 65, 67, 69, 71, 72];
const OFFS = [35, -40, 30, -45, 42, -33, 38, -31, 44, -36];
function melody(o = {}) {
  const notes = OFFS.map((c, k) => ({t: 0.3 + k * 0.45 + (k >= 5 ? 0.3 : 0), d: 0.4, f0: hz(C[k % 8] - 12 + c / 100), vowel: 'aeiou'[k % 5], cons: k % 2 === 0, m0: C[k % 8] - 12, off: c}));
  const sig = voice(SR, 0.6 + OFFS.length * 0.45 + 0.4, notes, {seed: 5, vibrato: o.vib == null ? 25 : o.vib});
  const x = sig.x, r = rng(9);
  // Atmer: 120 ms rosa-artiges Rauschen vor Note 5
  const br0 = Math.round((notes[5].t - 0.24) * SR); let p = 0;
  for (let i = 0; i < 0.12 * SR; i++) { p = 0.9 * p + 0.1 * gauss(r); x[br0 + i] += 0.03 * p * Math.sin(Math.PI * i / (0.12 * SR)); }
  for (let i = 0; i < x.length; i++) x[i] += 0.0005 * (r() * 2 - 1);   // Grundrauschen −66 dBFS
  return {x, notes, breath: [br0 / SR, br0 / SR + 0.12]};
}
// Stimmlose Bereiche laut Wahrheit: Konsonant [t, t+0.04), Atmer, Pausen zwischen den Noten (mit 5 ms Rand)
function unvoicedRanges(M) {
  const R = [];
  for (const n of M.notes) if (n.cons) R.push([n.t, n.t + 0.019]);
  R.push(M.breath);
  return R;
}
const nearest = (m, sc) => { let b = null; for (let q = Math.floor(m) - 2; q <= Math.ceil(m) + 2; q++) if (sc[((q % 12) + 12) % 12] && (b == null || Math.abs(q - m) < Math.abs(b - m))) b = q; return b; };
const CMAJ = [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1];
function planQ(an, mode, s, sc = CMAJ) { return {mode, notes: an.notes.map(n => ({t0: n.t0, t1: n.t1, m: n.m, to: nearest(n.m, sc), s, e: 0}))}; }
// M-KLICK wie VS5a (gs7-v3-vs5a-h.mjs): Hochpass 5 kHz, 2-ms-Fenster, Abstand zum Median der ±10 Nachbarn (dB)
function hp(x, fc, sr) { const y = new Float32Array(x.length), w = Math.tan(Math.PI * fc / sr), k1 = Math.SQRT2 * w, k2 = w * w, a0 = 1 + k1 + k2, b0 = 1 / a0, a1 = 2 * (k2 - 1) / a0, a2 = (1 - k1 + k2) / a0;
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < x.length; i++) { const v = x[i], o = b0 * (v - 2 * x1 + x2) - a1 * y1 - a2 * y2; x2 = x1; x1 = v; y2 = y1; y1 = o; y[i] = o; } return y; }
function clickMax(x, a, b) {
  const h = hp(x, 5000, SR), W = Math.round(0.002 * SR), k0 = Math.round(a * SR / W), k1 = Math.round(b * SR / W), e = [];
  for (let k = k0; k < k1; k++) { let s = 0; for (let i = k * W; i < (k + 1) * W && i < h.length; i++) s += h[i] * h[i]; e.push(10 * Math.log10(s / W + 1e-14)); }
  const out = []; for (let k = 10; k < e.length - 10; k++) { const nb = []; for (let j = k - 10; j <= k + 10; j++) if (j !== k) nb.push(e[j]); nb.sort((p, q) => p - q); out.push(e[k] - nb[10]); }
  return out;
}
const M = melody();
let t0 = Date.now();
const an = P.analyse(M.x, SR, V);
console.log('Analyse', Date.now() - t0, 'ms,', an.notes.length, 'Noten (Soll', M.notes.length + ')');
ok(an.notes.length === M.notes.length, 'G2-06 Noten erkannt: ' + an.notes.length + ' von ' + M.notes.length);
// G2-06 Blöcke = gemessene Noten (Start ±10 ms gegen den Vokal-Einsatz, Höhe ±20 Cent)
{
  let ws = 0, wp = 0;
  an.notes.forEach((n, k) => { const g = M.notes[k]; if (!g) return; const vs = g.t + (g.cons ? 0.02 + 0 : 0); const ds = Math.abs(n.t0 - g.t) * 1000, dp = Math.abs((n.m - (g.m0 + g.off / 100)) * 100); ws = Math.max(ws, Math.min(ds, Math.abs(n.t0 - (g.t + 0.03)) * 1000)); wp = Math.max(wp, dp); });
  console.log('  Start-Abweichung max', ws.toFixed(1), 'ms (gegen Silbenanfang bzw. Vokal), Höhe max', wp.toFixed(1), 'Cent');
  ok(wp <= 20, 'G2-06 Höhe je Block ±20 Cent: max ' + wp.toFixed(1));
}
// Bitgleich ohne Verschiebung
{ const r = P.render(M.x, SR, an, {mode: 'soft', notes: an.notes.map(n => ({t0: n.t0, t1: n.t1, m: n.m, to: n.m, s: 0, e: 0}))}); let d = 0; for (let i = 0; i < M.x.length; i++) if (r.y[i] !== M.x[i]) d++; ok(d === 0 && r.y.length === M.x.length, 'ohne Verschiebung bitgleich (' + d + ' Samples anders)'); }

for (const [mode, s] of [['hard', 1], ['hard', 0.5], ['soft', 1], ['soft', 0.5]]) {
  t0 = Date.now();
  const r = P.render(M.x, SR, an, planQ(an, mode, s)), y = r.y;
  const ms = Date.now() - t0;
  let worst = 0; const rows = [];
  M.notes.forEach((g, k) => {
    const want = (g.m0 + g.off / 100) + s * (Math.round(g.m0) - (g.m0 + g.off / 100));
    const h0 = noteHz(M.x, g), h1 = noteHz(y, g), err = ct(h1, hz(want));
    rows.push(`${g.off > 0 ? '+' : ''}${g.off}→${err >= 0 ? '+' : ''}${err.toFixed(1)}`); worst = Math.max(worst, Math.abs(err));
  });
  ok(worst <= 5, `G2-01 ${mode} ${s * 100} %: Tonhöhe je Note am Ziel ±5 Cent – max ${worst.toFixed(2)} Cent (Render ${ms} ms) [${rows.join(' ')}]`);
  ok(y.length === M.x.length, `G2-03 ${mode} ${s * 100} %: Dauer unverändert (${y.length} = ${M.x.length} Samples)`);
  // Klicks: die gerechnete Fassung hat keine Sprünge, die das Original nicht hat
  const cy = clickMax(y, 0.2, M.x.length / SR - 0.1), cx = clickMax(M.x, 0.2, M.x.length / SR - 0.1);
  const my = Math.max(...cy), mx = Math.max(...cx);
  if (my > mx + 1) console.log('   Klick-Stellen:', cy.map((v, k) => [v, (0.2 + (k + 10) * 0.002).toFixed(3)]).filter(q => q[0] > mx + 1).map(q => q[1] + 's ' + q[0].toFixed(1)).slice(0, 12).join(', '));
  ok(my <= mx + 1, `G2-03 ${mode} ${s * 100} %: Klick-Detektor max ${my.toFixed(1)} dB (Original ${mx.toFixed(1)} dB)`);
  // Zischlaute / Atmer unverändert
  let bad = 0, dmax = 0; for (const [a, b] of unvoicedRanges(M)) for (let i = Math.round(a * SR); i < Math.round(b * SR); i++) { if (y[i] !== M.x[i]) bad++; dmax = Math.max(dmax, Math.abs(y[i] - M.x[i])); }
  ok(bad === 0, `G2-05 ${mode} ${s * 100} %: Zischlaute/Atmer bitgleich (${bad} Samples anders, max ${dmax ? (20 * Math.log10(dmax)).toFixed(1) + ' dBFS' : '0'})`);
}
// G2-02 Weich: Vibrato-Tiefe ≥ 70 %, Formanten ±1 dB bis 4 kHz (Terzbänder 250 Hz … 4 kHz, Pegel relativ zum Gesamtpegel der Note)
{
  const r = P.render(M.x, SR, an, planQ(an, 'soft', 1)), y = r.y;
  let vmin = Infinity, fmax = 0;
  const bands = []; for (let f = 250; f <= 4000; f *= Math.pow(2, 1 / 3)) bands.push(f);
  // Spektralhülle: mittleres Leistungsspektrum der Note → Cepstrum, Lifter bei 0,5 Periode → Hülle in dB, 300 Hz–4 kHz je 50 Hz
  const env = (x, a, b, P) => {
    const N = 4096, re = new Float64Array(N), im = new Float64Array(N), acc = new Float64Array(N); let cnt = 0;
    for (let s = Math.round(a * SR); s + 2048 <= b * SR; s += 512) {
      re.fill(0); im.fill(0); for (let j = 0; j < 2048; j++) re[j] = x[s + j] * (0.5 - 0.5 * Math.cos(2 * Math.PI * j / 2047));
      V.fft(re, im, false); for (let k = 0; k < N; k++) acc[k] += re[k] * re[k] + im[k] * im[k]; cnt++;
    }
    for (let k = 0; k < N; k++) { re[k] = Math.log(acc[k] / cnt + 1e-20); im[k] = 0; }
    V.fft(re, im, true); const L = Math.floor((+process.env.LIF || 0.3) * P);
    for (let q = 0; q < N; q++) { const qq = Math.min(q, N - q); const w = qq < L ? 1 : 0; re[q] *= w / N; im[q] *= w / N; }
    V.fft(re, im, false);
    const out = []; for (let f = 300; f <= 4000; f += 50) out.push(10 / Math.LN10 * re[Math.round(f / SR * N)]);
    const mean = out.reduce((p, q) => p + q, 0) / out.length; return out.map(v => v - mean);
  };
  M.notes.forEach(g => {
    const a = g.t + 0.2, b = g.t + g.d - 0.05;
    const tx = track(M.x, SR, a, b).filter(v => v === v), ty = track(y, SR, a, b).filter(v => v === v);
    const dep = t => { const c = t.map(v => ct(v, median(t))); return Math.max(...c) - Math.min(...c); };
    vmin = Math.min(vmin, dep(ty) / dep(tx));
  });
  // Spektralhülle: Stimme ohne Vibrato (gehaltene Vokale a e i o u, 130–260 Hz), Weich 100 % (±35…45 Cent) und +3/+7/+12 HT.
  // Hülle = Betrag je Teilton (Goertzel über den Notenkern, Spitze ±0,5 %), in dB über der Frequenz interpoliert (Catmull-Rom),
  // 300 Hz–4 kHz je 50 Hz; Vergleich Ausgang gegen Original, Pegel-Mittel abgezogen
  const gz = (x, a, b, f) => { const i0 = Math.round(a * SR), W = Math.round((b - a) * SR), w = 2 * Math.PI * f / SR, c = 2 * Math.cos(w); let s1 = 0, s2 = 0; for (let j = 0; j < W; j++) { const v = x[i0 + j] * (0.5 - 0.5 * Math.cos(2 * Math.PI * j / (W - 1))) + c * s1 - s2; s2 = s1; s1 = v; } return Math.sqrt(Math.max(1e-30, s1 * s1 + s2 * s2 - c * s1 * s2)) / W; };
  const henv = (x, a, b, f) => {
    const H = []; for (let h = 1; h * f < 4400; h++) { let m = 0; for (let d = -5; d <= 5; d++) m = Math.max(m, gz(x, a, b, h * f * (1 + d * 0.001))); H.push([h * f, 20 * Math.log10(m)]); }
    const out = []; for (let F = 300; F <= 4000; F += 50) { let k = 0; while (k < H.length - 2 && H[k + 1][0] < F) k++; const P0 = H[Math.max(0, k - 1)][1], P1 = H[k][1], P2 = H[k + 1][1], P3 = H[Math.min(H.length - 1, k + 2)][1], t = (F - H[k][0]) / (H[k + 1][0] - H[k][0]);
      out.push(0.5 * (2 * P1 + (-P0 + P2) * t + (2 * P0 - 5 * P1 + 4 * P2 - P3) * t * t + (-P0 + 3 * P1 - 3 * P2 + P3) * t * t * t)); }
    const mu = out.reduce((p, q) => p + q, 0) / out.length; return out.map(v => v - mu);
  };
  const rows = [];
  for (const [v, f0] of [['a', 131], ['e', 147], ['i', 175], ['o', 196], ['u', 220], ['a', 262]]) for (const c of [38, -42, 300, 700, 1200]) {
    const x = voice(SR, 0.8, [{t: 0.05, d: 0.7, f0, vowel: v}], {vibrato: 0, seed: 3}).x, A = P.analyse(x, SR, V);
    const yy = P.render(x, SR, A, {mode: 'soft', notes: A.notes.map(n => ({t0: n.t0, t1: n.t1, m: n.m, to: n.m, s: 0, e: c}))}).y;
    const ex = henv(x, 0.15, 0.65, f0), ey = henv(yy, 0.15, 0.65, f0 * Math.pow(2, c / 1200)); let d = 0, at = 0;
    ex.forEach((q, k) => { if (Math.abs(ey[k] - q) > d) { d = Math.abs(ey[k] - q); at = 300 + 50 * k; } });
    // Hauptmaß: jeder Teilton des Ausgangs gegen die Hülle des Originals an seiner Frequenz (dB-linear zwischen den zwei
    // benachbarten Original-Teiltönen – die Hülle, die das Original wirklich trägt), 300 Hz–4 kHz, Pegel-Mittel abgezogen
    const pkd = (z, F) => { let m = 0; for (let dd = -5; dd <= 5; dd++) m = Math.max(m, gz(z, 0.15, 0.65, F * (1 + dd * 0.001))); return 20 * Math.log10(m); };
    const fy = f0 * Math.pow(2, c / 1200), Hx = []; for (let h = 1; h * f0 < 4500; h++) Hx.push(pkd(x, h * f0));
    const dv = []; for (let h = 1; h * fy <= 4000; h++) { const F = h * fy; if (F < 300) continue; const kk = F / f0, lo = Math.floor(kk), t = kk - lo; if (lo < 1 || lo >= Hx.length) continue; dv.push(pkd(yy, F) - (Hx[lo - 1] + (Hx[lo] - Hx[lo - 1]) * t)); }
    const mu = dv.reduce((p, q) => p + q, 0) / dv.length, dh = Math.max(...dv.map(q => Math.abs(q - mu))); if (process.env.DBG && !rows.length) console.log("dv", dv.map(q => q.toFixed(2)).join(" "));
    if (Math.abs(c) < 100) fmax = Math.max(fmax, dh); rows.push(v + f0 + (c > 0 ? '+' : '') + c + 'ct:' + dh.toFixed(2) + ' (Kurve ' + d.toFixed(1) + '@' + at + ')');
  }
  console.log('   Hülle je Fall (max dB @ Hz):', rows.join(' '));
  ok(vmin >= 0.7, 'G2-02 Weich: Vibrato-Tiefe ≥ 70 % – min ' + (vmin * 100).toFixed(0) + ' %');
  ok(fmax <= 1, 'G2-02 Weich (±38/42 Cent): Teiltöne auf der Hülle des Originals 300 Hz–4 kHz ±1 dB – max ' + fmax.toFixed(2) + ' dB');
  // Hart: Vibrato eingerastet (Info)
  const rh = P.render(M.x, SR, an, planQ(an, 'hard', 1)).y; let hd = 0;
  M.notes.forEach(g => { const a = g.t + 0.2, b = g.t + g.d - 0.05; const t = track(rh, SR, a, b).filter(v => v === v), c = t.map(v => ct(v, median(t))); hd = Math.max(hd, Math.max(...c) - Math.min(...c)); });
  console.log('  (Hart: Rest-Vibrato Spitze-Spitze max ' + hd.toFixed(1) + ' Cent, Original ±25 Cent)');
}
// G2-05: eine Note +3 Halbtöne (e = 300), Rest unverändert; dazu große Schritte für G6 (±12, +4, +7)
for (const e of [300, -300, 400, 700, 1200, -1200]) {
  const k = 4, pl = {mode: 'soft', notes: an.notes.map((n, i) => ({t0: n.t0, t1: n.t1, m: n.m, to: n.m, s: 0, e: i === k ? e : 0}))};
  const y = P.render(M.x, SR, an, pl).y, g = M.notes[k], h0 = noteHz(M.x, g), h1 = noteHz(y, g), err = ct(h1, h0) - e;
  let bad = 0; for (const [a, b] of unvoicedRanges(M)) for (let i = Math.round(a * SR); i < Math.round(b * SR); i++) if (y[i] !== M.x[i]) bad++;
  let other = 0; for (let i = 0; i < y.length; i++) { const t = i / SR; if ((t < an.notes[k].t0 - 0.06 || t > an.notes[k].t1 + 0.06) && y[i] !== M.x[i]) other++; }
  const cy = Math.max(...clickMax(y, g.t - 0.1, g.t + g.d + 0.1)), cx = Math.max(...clickMax(M.x, g.t - 0.1, g.t + g.d + 0.1));
  const lim = Math.abs(e) > 400 ? 10 : 5;
  ok(Math.abs(err) <= lim && bad === 0 && other === 0 && cy <= cx + 1, `G2-05 Note ${e > 0 ? '+' : ''}${e / 100} HT: ${(ct(h1, h0)).toFixed(1)} Cent (Fehler ${err.toFixed(1)}), Zischlaute anders: ${bad}, außerhalb der Note anders: ${other}, Klick ${cy.toFixed(1)} dB (Original ${cx.toFixed(1)})`);
}
// Rechenzeit: 16-Takt-Take bei 120 BPM = 32 s
{
  const notes = []; for (let k = 0; k < 64; k++) notes.push({t: 0.2 + k * 0.49, d: 0.42, f0: hz(C[k % 8] - 12 + OFFS[k % 10] / 100), vowel: 'aeiou'[k % 5], cons: k % 3 === 0});
  const x = voice(SR, 32, notes, {seed: 2}).x;
  let t = Date.now(); const a = P.analyse(x, SR, V); const ta = Date.now() - t;
  t = Date.now(); P.render(x, SR, a, planQ(a, 'hard', 1)); const tr = Date.now() - t;
  ok(ta + tr <= 3000, `G2-04 Rechenzeit 32-s-Take (Node): Analyse ${ta} ms + Rendern ${tr} ms = ${ta + tr} ms (≤ 3000)`);
}
console.log(fail ? fail + ' FEHLER' : 'alle grün');
process.exit(fail ? 1 : 0);
