// test-clean.mjs — VS4 Säubern: node --expose-gc test-clean.mjs
import {clean, Cleaner, estimateDelay, nlms, srcText} from './clean.mjs';
import * as T from './test-signals.mjs';
import {suite, maxJump} from './test-util.mjs';

const {check, info, done} = suite('VS4 clean');
const sr = 48000;
const masks = (S, n) => {
  const pause = new Uint8Array(n), voiced = new Uint8Array(n);
  for (const [a, b] of S.silences) for (let i = Math.round((a + 0.1) * sr); i < Math.min(n, Math.round((b - 0.05) * sr)); i++) pause[i] = 1;
  for (let i = 0; i < n; i++) voiced[i] = S.x[i] !== 0 ? 1 : 0;
  return {pause, voiced};
};
const pw = (z, m) => { let s = 0, c = 0; for (let i = 0; i < z.length; i++) if (m[i]) { s += z[i] * z[i]; c++; } return s / Math.max(1, c); };
const gainDb = (v, o, m) => { let vv = 0, vo = 0; for (let i = 0; i < o.length; i++) if (m[i]) { vv += v[i] * v[i]; vo += v[i] * o[i]; } return 20 * Math.log10(vo / vv); };
function scene(dur, {seed = 3, delay = 0.08, echoDb = 0, snr = 50, calib = 0, sat = false} = {}) {
  const S = T.song(sr, dur, {seed});
  const ref = T.playback(sr, dur, {calib, seed: seed + 1});
  let sp = T.hp1(ref, sr, 250); if (sat) sp = sp.map(v => Math.tanh(2.5 * v) / 2.5);
  const echo = T.convolve(sp, T.roomIR(sr, delay, 0.3, {seed: seed + 2}));
  const g = T.rms(S.x) / T.rms(echo) * Math.pow(10, echoDb / 20); for (let i = 0; i < echo.length; i++) echo[i] *= g;
  const nz = T.noise(sr, dur, T.rms(S.x) * Math.pow(10, -snr / 20), seed + 3);
  const mic = new Float32Array(S.x.length); for (let i = 0; i < mic.length; i++) mic[i] = S.x[i] + echo[i] + nz[i];
  return {S, ref, echo, nz, mic, ...masks(S, mic.length)};
}

// 1. SÄUBERN 0 % = bitgleich (N7V-24)
{
  const sc = scene(6);
  const y0 = clean(sc.mic, sc.ref, sr, {amount: 0});
  let same = y0.length === sc.mic.length; for (let i = 0; same && i < y0.length; i++) if (y0[i] !== sc.mic[i] || Object.is(y0[i], -0) !== Object.is(sc.mic[i], -0)) same = false;
  check('N7V-24 SÄUBERN 0 % bitgleich', same && y0 !== sc.mic);
  check('SÄUBERN NaN/negativ → bitgleich', [NaN, -1].every(a => clean(sc.mic, sc.ref, sr, {amount: a}).every((v, i) => v === sc.mic[i])));
}

// 2. Echo-Abzug: Laufzeit 40/80/120 ms, Raum-Echo RT60 0,3 s, Übersprechen 0 und +6 dB, Rauschen −50 dB
const echoRows = [];
for (const [delay, eDb, seed] of [[0.04, 0, 3], [0.08, 0, 4], [0.12, 0, 5], [0.08, 6, 6], [0.12, 6, 7]]) {
  const sc = scene(30, {delay, echoDb: eDb, seed});
  const d = estimateDelay(sc.mic, sc.ref, sr);
  const row = {delayMs: delay * 1000, echoDb: eDb, estMs: +(d / sr * 1000).toFixed(2)};
  for (const way of ['notes', 'hear']) {
    const info = {}; const out = clean(sc.mic, sc.ref, sr, {way, amount: 1, info});
    const res = new Float32Array(out.length); for (let i = 0; i < out.length; i++) res[i] = out[i] - sc.S.x[i];
    row[way] = {pauseRedDb: +T.db(pw(sc.echo, sc.pause) / pw(out, sc.pause)).toFixed(1),
      voiceRedDb: +T.db(pw(sc.echo, sc.voiced) / pw(res, sc.voiced)).toFixed(1),
      voiceGainDb: +gainDb(sc.S.x, out, sc.voiced).toFixed(2), wayTag: info.way, ms: info.ms};
  }
  echoRows.push(row);
  check(`Laufzeit geschätzt ${delay * 1000} ms`, Math.abs(row.estMs - delay * 1000) <= 1, row.estMs + ' ms');
  check(`Echo ${delay * 1000} ms/${eDb} dB: Minderung in Pausen ≥ 15 dB (Noten-Weg, Hör-Weg)`, row.notes.pauseRedDb >= 15 && row.hear.pauseRedDb >= 15, [row.notes.pauseRedDb, row.hear.pauseRedDb]);
  check(`Echo ${delay * 1000} ms/${eDb} dB: Minderung beim Singen ≥ 15 dB (Noten-Weg, Rest = alles außer Stimme)`, row.notes.voiceRedDb >= 15, row.notes.voiceRedDb);
  check(`Echo ${delay * 1000} ms/${eDb} dB: Stimme ändert sich < 1 dB (beide Wege)`, Math.abs(row.notes.voiceGainDb) < 1 && Math.abs(row.hear.voiceGainDb) < 1, [row.notes.voiceGainDb, row.hear.voiceGainDb]);
  if (delay === 0.08 && eDb === 0) check('N7V-25 Noten-Weg meldet „1E“', row.notes.wayTag === '1E', row.notes.wayTag);
}
info('Echo-Tabelle', echoRows);
// Sättigung (Handy-Lautsprecher laut, N7V-22 sinngemäß) und mit Einmess-Rauschen
{
  const sc = scene(30, {echoDb: 6, sat: true, seed: 8});
  const out = clean(sc.mic, sc.ref, sr, {way: 'notes'});
  let v = 0, e = 0; for (let i = 0; i < out.length; i++) { v += sc.S.x[i] ** 2; e += (out[i] - sc.S.x[i]) ** 2; }
  check('N7V-22 +6 dB mit Sättigung: SDR ≥ 10 dB (Noten-Weg)', T.db(v / e) >= 10, +T.db(v / e).toFixed(1));
  const sc2 = scene(30, {echoDb: 0, calib: 2, seed: 9});
  const o2 = clean(sc2.mic, sc2.ref, sr, {way: 'notes'});
  let v2 = 0, e2 = 0; for (let i = Math.round(2.5 * sr); i < o2.length; i++) { v2 += sc2.S.x[i] ** 2; e2 += (o2[i] - sc2.S.x[i]) ** 2; }
  check('N7V-21 0 dB mit Einmessen: SDR ≥ 15 dB (Noten-Weg)', T.db(v2 / e2) >= 15, +T.db(v2 / e2).toFixed(1));
}

// 3. Rauschen: Stimme + Rauschen (SNR 30 dB), keine Referenz
{
  const S = T.song(sr, 30, {seed: 11}), nz = T.noise(sr, 30, T.rms(S.x) * Math.pow(10, -30 / 20), 12);
  const mic = new Float32Array(S.x.length); for (let i = 0; i < mic.length; i++) mic[i] = S.x[i] + nz[i];
  const {pause, voiced} = masks(S, mic.length), r = {};
  for (const a of [0.25, 0.5, 1]) {
    const out = clean(mic, null, sr, {amount: a});
    r[a] = {noiseRedDb: +T.db(pw(nz, pause) / pw(out, pause)).toFixed(1), voiceGainDb: +gainDb(S.x, out, voiced).toFixed(2)};
  }
  check('Rauschboden −≥ 10 dB bei SÄUBERN 100 %', r[1].noiseRedDb >= 10, r[1]);
  check('Stimme < 1 dB geändert (Entrauschen 100 %)', Math.abs(r[1].voiceGainDb) < 1, r[1].voiceGainDb);
  check('Stärke wirkt stetig (25 % < 50 % < 100 % Minderung)', r[0.25].noiseRedDb < r[0.5].noiseRedDb && r[0.5].noiseRedDb < r[1].noiseRedDb, r);
}

// 4. Kein Gate (N7V-23): ohne Übersprechen, SNR 40, SÄUBERN 100 %
{
  const S = T.song(sr, 30, {seed: 13}), nz = T.noise(sr, 30, T.rms(S.x) * 0.01, 14);
  const mic = new Float32Array(S.x.length); for (let i = 0; i < mic.length; i++) mic[i] = S.x[i] + nz[i];
  const out = clean(mic, null, sr, {amount: 1});
  let v = 0, e = 0; for (let i = 0; i < out.length; i++) { v += S.x[i] ** 2; e += (out[i] - S.x[i]) ** 2; }
  // innerhalb gesungener Noten (ohne 30 ms Rand): kein Abschnitt > 50 ms mit Pegel < −40 dB unter dem Noten-Pegel
  let worst = 0;
  for (const nt of S.notes.filter(q => !q.legato)) {
    const a = Math.round((nt.t + 0.03) * sr), b = Math.round((nt.t + nt.d - 0.05) * sr), ref = T.rms(S.x, a, b), w = Math.round(0.01 * sr);
    let run = 0;
    for (let s = a; s + w <= b; s += w) { if (T.rms(out, s, s + w) < ref * 0.01) { run += 10; worst = Math.max(worst, run); } else run = 0; }
  }
  check('N7V-23 kein Gate: SDR gegen Original-Stimme ≥ 20 dB', T.db(v / e) >= 20, +T.db(v / e).toFixed(1));
  check('N7V-23 kein Abschnitt > 50 ms unter −40 dB in Noten', worst <= 50, worst + ' ms');
}

// 4b. VS4-fix: Legato ohne Pause und gehaltene Töne (N7V-23 sinngemäß): das Rauschprofil darf nicht die Stimme sein
{
  const scale = [0, 3, 7, 5, 3, 7, 2, 0], notes = scale.map((s, k) => ({t: 0.2 + k * 0.9, d: 0.9, f0: 220 * Math.pow(2, s / 12), vowel: 'aeiou'[k % 5]}));
  const V = T.voice(sr, 8, notes, {seed: 31}).x, nz = T.noise(sr, 8, T.rms(V, Math.round(0.3 * sr), Math.round(7.3 * sr)) * 0.01, 32);
  const mic = Float32Array.from(V, (v, i) => v + nz[i]), a = Math.round(0.4 * sr), b = Math.round(7.2 * sr), r = {};
  for (const amt of [0.6, 1]) {
    const out = clean(mic, null, sr, {amount: amt});
    const hpV = T.hp1(V, sr, 150), hpO = T.hp1(out, sr, 150);
    let vo = 0, vv = 0; for (let i = a; i < b; i++) { vo += hpV[i] * hpO[i]; vv += hpV[i] * hpV[i]; } const g = vo / vv;
    let s = 0, e = 0; for (let i = a; i < b; i++) { s += (g * hpV[i]) ** 2; e += (hpO[i] - g * hpV[i]) ** 2; }
    r[amt] = {sdr: +T.db(s / e).toFixed(1), gainDb: +(20 * Math.log10(g)).toFixed(2)};
  }
  check('Legato ohne Pause, SNR 40: SDR ≥ 20 dB und Stimme < 1 dB (60 % und 100 %)', [0.6, 1].every(k => r[k].sdr >= 20 && Math.abs(r[k].gainDb) < 1), r);
  const tone = {};
  for (const f of [220, 440]) {
    const x = Float32Array.from({length: Math.round(4.2 * sr)}, (_, i) => 0.3 * Math.sin(2 * Math.PI * f * i / sr));
    for (const amt of [0.6, 1]) { const out = clean(x, null, sr, {amount: amt}); tone[f + '@' + amt * 100] = +T.db(T.rms(out, sr / 2, x.length - sr / 2) ** 2 / T.rms(x, sr / 2, x.length - sr / 2) ** 2).toFixed(2); }
  }
  check('Gehaltener Sinus 220/440 Hz bleibt im Pegel (< 1 dB, 60 % und 100 %)', Object.values(tone).every(v => Math.abs(v) < 1), tone);
  // Lautsprecher-Weg ohne Echo (Referenz da, Mikro hört sie nicht): Legato in der Tonart der Begleitung → kein Echo-Abzug
  const ref = T.playback(sr, 8, {seed: 33}), rl = {};
  for (const amt of [0.6, 1]) {
    const info = {}, out = clean(mic, ref, sr, {amount: amt, info});
    const hpV = T.hp1(V, sr, 150), hpO = T.hp1(out, sr, 150);
    let vo = 0, vv = 0; for (let i = a; i < b; i++) { vo += hpV[i] * hpO[i]; vv += hpV[i] * hpV[i]; } const g = vo / vv;
    let s = 0, e = 0; for (let i = a; i < b; i++) { s += (g * hpV[i]) ** 2; e += (hpO[i] - g * hpV[i]) ** 2; }
    rl[amt] = {sdr: +T.db(s / e).toFixed(1), gainDb: +(20 * Math.log10(g)).toFixed(2), pk: info.pk, aec: info.aec || 'an'};
  }
  check('Legato, Referenz ohne Echo: kein Echo-Abzug, SDR ≥ 20 dB, Stimme < 1 dB (60 % und 100 %)', [0.6, 1].every(k => rl[k].sdr >= 20 && Math.abs(rl[k].gainDb) < 1 && rl[k].aec === 'aus'), rl);
}
// 4c. VS4-fix: o.from – Echo-Weg ändert sich im Vorlauf (erst ohne Echo, dann +6 dB mit Sättigung): Ergebnis ab „from“
{
  const sc = scene(16, {echoDb: 6, sat: true, seed: 41}), cut = Math.round(6 * sr), from = Math.round(8 * sr);
  const mic = Float32Array.from(sc.mic, (v, i) => i < cut ? v - sc.echo[i] : v);
  const sdr = o => { let v = 0, e = 0; for (let i = from; i < o.length; i++) { v += sc.S.x[i] ** 2; e += (o[i] - sc.S.x[i]) ** 2; } return +T.db(v / e).toFixed(1); };
  const a = sdr(clean(mic, sc.ref, sr, {way: 'notes'})), b = clean(mic, sc.ref, sr, {way: 'notes', from: from - Math.round(0.5 * sr)}), bb = sdr(b);
  check('o.from: Vorlauf mit anderem Echo-Weg verdirbt das Ergebnis nicht (SDR ab from ≥ 8 dB, ≥ 3 dB besser als ohne from)', bb >= 8 && bb >= a + 3, {ohne: a, mit: bb});
  const sa = sdr(clean(sc.mic, sc.ref, sr, {way: 'notes'})), sb = sdr(clean(sc.mic, sc.ref, sr, {way: 'notes', from: from - Math.round(0.5 * sr)}));
  check('o.from: gleicher Echo-Weg im Vorlauf → höchstens 1 dB schlechter als ohne from', sb >= sa - 1, {ohne: sa, mit: sb});
  check('o.from: vor „from“ bleibt das Mikro bitgleich', b.subarray(0, from - Math.round(0.5 * sr)).every((v, i) => v === mic[i]));
}

// 5. Block-Verarbeiter (Worker): 128er-Blöcke, Latenz, Rampe, NaN, keine Allokation je Block
{
  const c = new Cleaner(sr); c.setWay('notes');
  const n = sr * 2, x = T.noise(sr, 2, 0.1, 21), out = new Float32Array(n), B = 128, z = new Float32Array(B);
  for (let a = 0; a < n; a += B) c.process(x.subarray(a, a + B), z, out.subarray(a, a + B), B);
  let md = 0; for (let i = 0; i + c.latency < n; i++) md = Math.max(md, Math.abs(out[i + c.latency] - x[i]));
  check('Block: Latenz exakt ' + c.latency + ' Samples, ohne Referenz = Eingang (Noten-Weg)', md < 1e-6 && c.under === 0, {md, under: c.under});
  // Rampe 100 % → 0 % mitten im Strom: klickfrei, danach bitgleich (verzögert)
  const sc = scene(8, {seed: 22});
  const c2 = new Cleaner(sr), o2 = new Float32Array(sc.mic.length);
  for (let a = 0; a < sc.mic.length; a += B) { if (a === 4 * sr) c2.setAmount(0); c2.process(sc.mic.subarray(a, a + B), sc.ref.subarray(a, a + B), o2.subarray(a, a + B), B); }
  const L = c2.latency, a0 = 4 * sr + Math.round(0.03 * sr); let bit = true;
  for (let i = a0; i < sc.mic.length; i++) if (o2[i] !== sc.mic[i - L]) { bit = false; break; }
  const jIn = maxJump(sc.mic), jOut = maxJump(o2, 4 * sr - 2000, 4 * sr + 4000);
  check('Block: SÄUBERN-Rampe ohne Klick (max. Sprung ≤ Eingang)', jOut <= jIn, {jOut: +jOut.toFixed(4), jIn: +jIn.toFixed(4)});
  check('Block: nach Rampe auf 0 % bitgleich (verzögert)', bit);
  // NaN/Inf im Eingang → Ausgabe endlich, Filter erholt sich
  const c3 = new Cleaner(sr), xn = Float32Array.from(sc.mic), o3 = new Float32Array(xn.length);
  for (let i = sr; i < sr + 300; i++) xn[i] = i % 2 ? NaN : Infinity;
  for (let a = 0; a < xn.length; a += B) c3.process(xn.subarray(a, a + B), sc.ref.subarray(a, a + B), o3.subarray(a, a + B), B);
  check('NaN/Inf-Schutz: Ausgabe endlich', o3.subarray(2 * sr).every(Number.isFinite), o3.slice(0, 2 * sr + 5000).filter(v => !Number.isFinite(v)).length + ' nicht endliche Samples');
  // winzige Werte (Denormal-Gefahr): Rechenzeit darf nicht einbrechen
  const tiny = new Float32Array(sr * 2).map((_, i) => (i % 2 ? 1 : -1) * 1e-38), c4 = new Cleaner(sr), o4 = new Float32Array(B);
  let t0 = performance.now(); for (let a = 0; a < tiny.length; a += B) c4.process(tiny.subarray(a, a + B), tiny.subarray(a, a + B), o4, B); const tTiny = performance.now() - t0;
  const c5 = new Cleaner(sr); t0 = performance.now(); for (let a = 0; a < sc.mic.length && a < 2 * sr; a += B) c5.process(sc.mic.subarray(a, a + B), sc.ref.subarray(a, a + B), o4, B); const tNorm = performance.now() - t0;
  check('Denormal-Schutz: 2 s Kleinstwerte nicht langsamer als 2 s Musik (×1,5)', tTiny <= 1.5 * tNorm + 20, {tTiny: Math.round(tTiny), tNorm: Math.round(tNorm)});
  if (globalThis.gc) {
    // Blöcke in feste Puffer kopieren (subarray() im Test würde selbst Objekte anlegen)
    const c6 = new Cleaner(sr), bm = new Float32Array(B), br = new Float32Array(B);
    const feed = (a) => { for (let i = 0; i < B; i++) { bm[i] = sc.mic[a + i]; br[i] = sc.ref[a + i]; } c6.process(bm, br, o4, B); };
    for (let a = 0; a + B <= 4 * sr; a += B) feed(a);
    globalThis.gc(); const h0 = process.memoryUsage().heapUsed;
    for (let a = 0; a + B <= 4 * sr; a += B) feed(a);
    const h1 = process.memoryUsage().heapUsed;
    check('Keine Allokation je Block (Heap-Zuwachs über 1500 Blöcke < 16 KB)', h1 - h0 < 16384, (h1 - h0) + ' B');
  } else info('Allokation je Block', 'nicht gemessen (node --expose-gc fehlt)');
}

// 6. NLMS (Vergleich, kurzer Weg)
{
  const sr2 = 16000, n = sr2 * 4, r = T.rng(5), ref = new Float32Array(n), mic = new Float32Array(n);
  for (let i = 0; i < n; i++) ref[i] = T.gauss(r) * 0.1;
  for (let i = 40; i < n; i++) mic[i] = 0.6 * ref[i - 40] + 0.3 * ref[i - 41] - 0.2 * ref[i - 60];
  const e = nlms(mic, ref, 128, 0.5);
  check('NLMS (128 Taps) lernt kurzen Weg ≥ 30 dB', T.db(T.rms(mic, n / 2, n) ** 2 / T.rms(e, n / 2, n) ** 2) >= 30, +T.db(T.rms(mic, n / 2, n) ** 2 / T.rms(e, n / 2, n) ** 2).toFixed(1));
}

// 7. srcText(): eingebetteter Text liefert dasselbe Ergebnis
{
  const api = (0, eval)(srcText()), sc = scene(4, {seed: 30});
  const a = clean(sc.mic, sc.ref, sr, {amount: 0.7}), b = api.clean(sc.mic, sc.ref, sr, {amount: 0.7});
  check('srcText() eingebettet = Modul (bitgleich, deterministisch)', a.every((v, i) => v === b[i]), srcText().length + ' Zeichen');
}

// 8. Rechenzeit: 60 s, 48 kHz
{
  const sc = scene(60, {seed: 40});
  const r = {};
  for (const way of ['notes', 'hear']) { const info = {}; const t0 = performance.now(); clean(sc.mic, sc.ref, sr, {way, info}); r[way] = Math.round(performance.now() - t0); }
  const c = new Cleaner(sr), B = 128, o = new Float32Array(B); const t0 = performance.now();
  for (let a = 0; a + B <= sc.mic.length; a += B) c.process(sc.mic.subarray(a, a + B), sc.ref.subarray(a, a + B), o, B);
  r.block1pass = Math.round(performance.now() - t0);
  info('Rechenzeit 60 s @ 48 kHz (ms; Offline 2 Läufe, Block 1 Lauf)', {...r, rtPctHear: +(r.hear / 600).toFixed(1), rtPctBlock: +(r.block1pass / 600).toFixed(1)});
  check('Rechenzeit Offline Hör-Weg 60 s < 15 s', r.hear < 15000, r.hear + ' ms');
}
done();
