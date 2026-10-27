// test-stretch.mjs — VS5b Dehnen (WSOLA, Transient fest): node test-stretch.mjs
import {stretch, cacheKey, srcText} from './stretch.mjs';
import * as MK from './marks.mjs';
import * as T from './test-signals.mjs';
import {suite, maxJump, f0Of, cents} from './test-util.mjs';

const {check, info, done} = suite('VS5b stretch');
const sr = 48000;
const tone = (dur, f0, o = {}) => {   // harmonischer Ton mit Formanten (Vokal „a“), optional Vibrato
  const n = Math.round(dur * sr), x = new Float32Array(n); let ph = 0;
  for (let i = 0; i < n; i++) {
    const f = f0 * Math.pow(2, (o.vib || 0) * Math.sin(2 * Math.PI * 5.5 * i / sr) / 1200); ph += 2 * Math.PI * f / sr;
    let v = 0; for (let h = 1; h * f0 < 7000; h++) { const fh = h * f0; v += Math.sin(h * ph) * (1 / (1 + ((fh - 800) / 90) ** 2) + 0.6 / (1 + ((fh - 1150) / 100) ** 2) + 0.05) / Math.sqrt(h); }
    x[i] = 0.15 * v;
  }
  return x;
};

// 1. Klickfolge mit Ton dazwischen (N7V-28): quantisieren mit 70 % (Standard „Dehnen“) und 100 %
{
  const dur = 20, x = tone(dur, 196), r = T.rng(12), bpm = 110, spb = 60 / bpm;
  for (let i = 0; i < sr; i++) x[i] = 0;                               // 1 s Stille vorn (Rauschboden für die Marken-Erkennung)
  for (let i = 0; i < x.length; i++) x[i] += 1e-4 * T.gauss(r);
  const ons = []; for (let k = 3; k * spb / 2 < dur - 0.6; k++) if (r() < 0.8) ons.push(k * spb / 2 + (r() - 0.5) * 0.08);
  for (const t of ons) { const i0 = Math.round(t * sr); for (let k = 0; k < 0.006 * sr; k++) x[i0 + k] += 0.8 * T.gauss(r) * Math.exp(-k / (0.0012 * sr)); }
  for (const strength of [0.7, 1]) {
    const q = MK.quantizeMarks(ons, {bpm, grid: '1/8', strength});
    const w = MK.makeWarp(ons, Array.from(q.times), dur);
    const R = stretch(x, sr, w), y = R.y;
    const tgtLen = Math.round(w.dst[w.dst.length - 1] * sr);
    check(`Dehnen ${strength * 100} %: Länge exakt (Fehler < 1 %)`, Math.abs(y.length - tgtLen) / tgtLen < 0.01 && y.length === tgtLen, `${y.length} / ${tgtLen}`);
    // Länge je Scheibe ±1 ms und Verhältnisfehler
    let segErr = 0, ratioErr = 0;
    for (const s of R.segs) { segErr = Math.max(segErr, Math.abs((s.d1 - s.d0) - Math.round((MK.warpTime(w, s.s1 / sr) - MK.warpTime(w, s.s0 / sr)) * sr))); if (s.mode === 'wsola') ratioErr = Math.max(ratioErr, Math.abs((s.d1 - s.d0) / (s.s1 - s.s0) / ((MK.warpTime(w, s.s1 / sr) - MK.warpTime(w, s.s0 / sr)) / ((s.s1 - s.s0) / sr)) - 1)); }
    check(`Dehnen ${strength * 100} %: Länge je Scheibe ±1 ms, Verhältnis-Fehler < 1 %`, segErr <= sr * 0.001 && ratioErr < 0.01, {segErrSamples: segErr, ratioErrPct: +(ratioErr * 100).toFixed(3)});
    // erste 20 ms je Scheibe bitgleich
    let bit = 0; for (let k = 0; k < ons.length; k++) { const s0 = Math.round(w.src[k + 1] * sr), d0 = Math.round(w.dst[k + 1] * sr); let same = true; for (let i = 0; i < 0.02 * sr; i++) if (y[d0 + i] !== x[s0 + i]) { same = false; break; } if (same) bit++; }
    check(`N7V-28 Dehnen ${strength * 100} %: erste 20 ms je Scheibe bitgleich`, bit === ons.length, `${bit}/${ons.length}`);
    // Einsätze im Ergebnis (unabhängig erkannt) ±5 ms am Ziel
    const M = MK.detectMarks(y, sr, {pitch: false}).map(m => m.t); let worst = 0, miss = 0;
    for (const t of q.times) { let bd = 1; for (const m of M) bd = Math.min(bd, Math.abs(m - t)); if (bd > 0.03) miss++; else worst = Math.max(worst, bd); }
    check(`Dehnen ${strength * 100} %: Einsätze ±5 ms am Ziel der Zeitkarte`, miss === 0 && worst <= 0.005, {worstMs: +(worst * 1000).toFixed(2), miss});
    check(`Dehnen ${strength * 100} %: Faktoren im Bereich, keine Warnung`, R.warnings.length === 0, R.segs.filter(s => s.mode === 'wsola').length + ' WSOLA-Abschnitte');
    if (strength === 1) {
      const rs = R.segs.filter(s => s.mode === 'wsola').map(s => (s.d1 - s.d0) / (s.s1 - s.s0));
      info('Faktoren (100 %)', {min: +Math.min(...rs).toFixed(3), max: +Math.max(...rs).toFixed(3)});
    }
  }
}

// 2. Tonhöhe bleibt (< 5 Cent) bei Faktoren 0,55 … 1,9; keine Klicks
{
  const dur = 12, results = [];
  for (const f0 of [110, 196, 330]) {
    const x = tone(dur, f0), marks = [1, 3, 5, 7, 9, 11];
    const fac = [0.55, 1.9, 0.75, 1.4, 0.6, 1.0];
    const dst = []; let acc = 1; dst.push(1);
    for (let k = 1; k < marks.length; k++) { acc += (marks[k] - marks[k - 1]) * fac[k - 1]; dst.push(acc); }
    const w = MK.makeWarp(marks, dst, dur, acc + (dur - 11));
    const R = stretch(x, sr, w), y = R.y, fx = f0Of(x, sr, sr, 11 * sr);
    let worst = 0;
    for (let k = 0; k + 1 < marks.length; k++) {
      const a = Math.round((dst[k] + 0.05) * sr), b = Math.round((dst[k + 1] - 0.05) * sr), fy = f0Of(y, sr, a, b);
      worst = Math.max(worst, Math.abs(cents(fy, fx)));
    }
    const jx = maxJump(x), jy = maxJump(y);
    // Pegel-Einbruch an Nähten (Phasen-Auslöschung): RMS über 2 Perioden, gleitend, gegen den Ton-Pegel
    const P2 = Math.round(2 * sr / f0), ref = T.rms(x, sr, 2 * sr); let dip = 0;
    for (let s = Math.round(1.02 * sr); s + P2 < y.length - sr; s += Math.round(P2 / 4)) dip = Math.max(dip, -20 * Math.log10(T.rms(y, s, s + P2) / ref));
    // Bei streng periodischem Ton und festen Marken ist ein Phasensprung an der Naht unvermeidbar (Endausrichtung mildert ihn)
    check(`Pegel-Einbruch an Nähten ${f0} Hz ≤ 3 dB (2-Perioden-RMS)`, dip <= 3, dip.toFixed(2) + ' dB');
    results.push({f0, worstCents: +worst.toFixed(2), jumpIn: +jx.toFixed(4), jumpOut: +jy.toFixed(4), dipDb: +dip.toFixed(2)});
    check(`Tonhöhe ${f0} Hz unverändert (< 5 Cent) bei Faktor 0,55 … 1,9`, worst < 5, worst.toFixed(2) + ' Cent');
    check(`Keine Klicks ${f0} Hz: max. Sprung ≤ Eingang (+0,01 dB Rechentoleranz)`, jy <= jx * 1.00115, {jx: +jx.toFixed(5), jy: +jy.toFixed(5), ratio: +(jy / jx).toFixed(6)});
  }
  info('Tonhöhe/Sprung je Grundton', results);
}

// 3. Gesang mit Vibrato, Konsonanten, Pausen: Marken → Quantisieren → Dehnen; Klickfreiheit
{
  const S = T.song(sr, 30, {seed: 17}), x = S.x, M = MK.detectMarks(x, sr).map(m => m.t);
  const q = MK.quantizeMarks(M, {bpm: 96, grid: '1/16', strength: 0.7});
  const w = MK.makeWarp(M, Array.from(q.times), 30);
  const R = stretch(x, sr, w), jx = maxJump(x), jy = maxJump(R.y);
  // zweite Ableitung als Klick-Maß (Hochpass-Spitzen)
  const d2 = z => { let m = 0; for (let i = 2; i < z.length; i++) m = Math.max(m, Math.abs(z[i] - 2 * z[i - 1] + z[i - 2])); return m; };
  check('Gesang: keine Klicks (max. Sprung ≤ Eingang +0,01 dB)', jy <= jx * 1.00115, {jx: +jx.toFixed(4), jy: +jy.toFixed(4), d2in: +d2(x).toFixed(4), d2out: +d2(R.y).toFixed(4)});
  check('Gesang: Ausgabe endlich, Länge exakt', R.y.every(Number.isFinite) && R.y.length === Math.round(w.dst[w.dst.length - 1] * sr));
  info('Gesang: Abschnitte', {marks: M.length, wsola: R.segs.filter(s => s.mode === 'wsola').length, copy: R.segs.filter(s => s.mode === 'copy').length, shift: R.segs.filter(s => s.mode === 'shift').length});
}

// 3b. Kurze Abschnitte (Achtel, 120 BPM): Klicks auf einem gehaltenen Ton, Marken 4 ms vor dem Klick (wie die App, WP_LEAD) –
//     kein Einbruch > 3 dB (2-Perioden-RMS) vor den Marken (VS5b-Einbau: letzte Rahmen gesucht, endAlign aus)
{
  const dur = 4.6, x = tone(dur, 196, {vib: 15}), r = T.rng(5), OFF = [14, -22, 31, -9, 26, -35, 18, 4, -27, 12, -16, 33, -6, 21, -30, 9];
  for (let i = 0; i < 0.3 * sr; i++) x[i] = 0;
  const ons = OFF.map((o, k) => 0.5 + k * 0.25 + o / 1000);
  for (const t of ons) { const i0 = Math.round(t * sr); for (let k = 0; k < 0.03 * sr; k++) x[i0 + k] += 0.6 * Math.exp(-k / (0.004 * sr)) * T.gauss(r) * Math.min(1, k / 6); }
  const L = 0.004, src = [0, ...ons.map(t => t - L), dur], dst = [0, ...ons.map(t => Math.round(t / 0.25) * 0.25 - L), dur];
  const R = stretch(x, sr, {src, dst}, {lock: 0.02 + L}), y = R.y;
  const P2 = Math.round(2 * sr / 196), ref = T.rms(x, Math.round(0.35 * sr), Math.round(0.45 * sr)); let dip = 0;
  for (let s = Math.round(0.6 * sr); s + P2 < Math.round(4.3 * sr); s += Math.round(P2 / 4)) dip = Math.max(dip, -20 * Math.log10(T.rms(y, s, s + P2) / ref));
  check('Kurze Abschnitte (Achtel) mit Klicks auf Ton: Einbruch ≤ 3 dB', dip <= 3, dip.toFixed(2) + ' dB');
  let bit = 0; for (let k = 1; k + 1 < src.length; k++) { const s0 = Math.round(src[k] * sr), d0 = Math.round(dst[k] * sr); let same = true; for (let i = 0; i < 0.024 * sr; i++) if (y[d0 + i] !== x[s0 + i]) { same = false; break; } if (same) bit++; }
  check('Kurze Abschnitte: 4 ms Vorlauf + 20 ms ab der Marke bitgleich', bit === ons.length, bit + '/' + ons.length);
}

// 3c. Digitale Stille zwischen Noten (Datei-Takes): die Stille bleibt Stille (keine Ausklang-Reste durch die Suche)
{
  const dur = 6, n = dur * sr, x = new Float32Array(n), on = [], b = tone(0.22, 247);
  for (let k = 0; k < 16; k++) { const t = 0.3 + k * 0.33; on.push(t); x.set(b.map((v, i) => v * Math.min(1, i / 200, (b.length - i) / 400)), Math.round(t * sr)); }
  const dst = on.map((t, k) => t + (k % 2 ? 0.03 : -0.025)), w = MK.makeWarp(on, dst, dur);
  const y = stretch(x, sr, w).y; let bad = 0, worst = 0;
  for (let k = 0; k + 1 < on.length; k++) { const r = (dst[k + 1] - dst[k]) / (on[k + 1] - on[k]), a = Math.round((dst[k] + 0.22 * r + 0.07) * sr), e = Math.round((dst[k + 1] - 0.012) * sr); for (let i = a; i < e; i++) if (y[i] !== 0) { bad++; worst = Math.max(worst, Math.abs(y[i])); } }
  check('Digitale Stille zwischen Noten bleibt Stille', bad === 0, {bad, worstDb: worst ? +(20 * Math.log10(worst)).toFixed(1) : null});
}

// 4. Grenzen 0,5–2,0 (N7V-29): außerhalb nur verschieben + Warnung
{
  const x = tone(6, 220), w = MK.makeWarp([1, 2, 3, 4], [1, 3.5, 3.85, 4.85], 6, 6.85);   // Faktor 2,5 und 0,35, dann 1,0
  const R = stretch(x, sr, w);
  const modes = R.segs.map(s => s.mode);
  check('N7V-29 Faktor 2,5 und 0,35: nur verschoben + Warnung', R.warnings.length === 2 && modes[1] === 'shift' && modes[2] === 'shift', {warnings: R.warnings, modes});
  const s0 = Math.round(2 * sr), d0 = Math.round(3.5 * sr); let same = true; for (let i = 0; i < 0.345 * sr; i++) if (R.y[d0 + i] !== x[s0 + i]) { same = false; break; }
  check('Verschobener Abschnitt: Inhalt unverändert (bitgleich bis zum Übergang 5 ms vor dem Ende)', same);
  check('Verschoben: keine Klicks', maxJump(R.y) <= maxJump(x) * 1.00115, +maxJump(R.y).toFixed(4));
  // Lücke hinter dem verschobenen Abschnitt (Faktor 2,5: 1,5 s): Schleife statt Ausblendung → kein Loch (2-Perioden-RMS ≥ −3 dB)
  const P2 = Math.round(2 * sr / 220), ref = T.rms(x, sr, 2 * sr); let dip = 0;
  for (let s = Math.round(1.05 * sr); s + P2 < Math.round(3.45 * sr); s += Math.round(P2 / 4)) dip = Math.max(dip, -20 * Math.log10(T.rms(R.y, s, s + P2) / ref));
  check('Verschoben mit Lücke: kein Loch (≤ 3 dB unter dem Ton)', dip <= 3, dip.toFixed(2) + ' dB');
}

// 5. Unveränderte Karte bitgleich; deterministisch; Cache-Schlüssel; NaN
{
  const S = T.song(sr, 10, {seed: 19}), M = MK.detectMarks(S.x, sr).map(m => m.t);
  const id = stretch(S.x, sr, MK.makeWarp(M, M, 10));
  check('Stärke 0 % (Karte = Identität) bitgleich', id.y.length === S.x.length && id.y.every((v, i) => v === S.x[i]));
  const q = MK.quantizeMarks(M, {bpm: 100, grid: '1/8', strength: 0.7}), w = MK.makeWarp(M, Array.from(q.times), 10);
  const a = stretch(S.x, sr, w), b = stretch(S.x, sr, w);
  check('Deterministisch: zwei Läufe bitgleich', a.y.length === b.y.length && a.y.every((v, i) => v === b.y[i]));
  const k1 = cacheKey(w, {}, 'take-1'), k2 = cacheKey(w, {}, 'take-1'), k3 = cacheKey(MK.makeWarp(M, M, 10), {}, 'take-1');
  check('Cache-Schlüssel stabil und unterscheidend', k1 === k2 && k1 !== k3, k1);
  const xn = Float32Array.from(S.x); xn[1000] = NaN; xn[2000] = Infinity;
  check('NaN/Inf im Eingang → Ausgabe endlich', stretch(xn, sr, w).y.every(Number.isFinite));
  const api = (0, eval)(srcText()), c = api.stretch(S.x, sr, w);
  check('srcText() eingebettet = Modul', c.y.every((v, i) => v === a.y[i]), srcText().length + ' Zeichen');
}

// 6. Rechenzeit: 60 s Gesang, 48 kHz, Marken je Silbe, Quantisieren 70 %
{
  const S = T.song(sr, 60, {seed: 23}), M = MK.detectMarks(S.x, sr).map(m => m.t);
  const q = MK.quantizeMarks(M, {bpm: 100, grid: '1/16', strength: 0.7}), w = MK.makeWarp(M, Array.from(q.times), 60);
  const t0 = performance.now(); const R = stretch(S.x, sr, w); const ms = performance.now() - t0;
  info('Rechenzeit 60 s @ 48 kHz', {ms: Math.round(ms), rtPct: +(ms / 600).toFixed(2), marks: M.length, wsola: R.segs.filter(s => s.mode === 'wsola').length});
  check('Rechenzeit Dehnen 60 s < 5 s', ms < 5000, Math.round(ms) + ' ms');
}
done();
