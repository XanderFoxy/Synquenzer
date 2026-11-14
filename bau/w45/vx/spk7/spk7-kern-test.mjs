// SPK7 Kern-Test (Node): Klangkorn-Engine aus der fertigen index.html – Tonhöhe, Klicks (Sprung-Kriterium), CPU, Grundton-Erkennung
// Aufruf: node spk7-kern-test.mjs <abs index.html> [out.json]
import fs from 'node:fs';
const file = process.argv[2], outF = process.argv[3];
const html = fs.readFileSync(file, 'utf8');
const grab = name => { const a = html.indexOf('function ' + name + '('); if (a < 0) throw new Error(name); const b = html.indexOf('\n}\n', a); return html.slice(a, b + 3); };
const code = ['spk7CoreMake', 'spk7Fft', 'spk7Frz', 'spk7F0'].map(grab).join('\n') + ';return {spk7CoreMake, spk7Fft, spk7Frz, spk7F0};';
const K = new Function(code)();
const SR = 48000, res = [], ok = (name, d, pass) => { res.push({name, pass: !!pass, d}); console.log((pass ? 'OK  ' : 'FEHL') + ' ' + name + ' ' + JSON.stringify(d)); };
const sine = (f, sec, sr = SR) => { const x = new Float32Array(Math.round(sec * sr)); for (let i = 0; i < x.length; i++) x[i] = 0.9 * Math.sin(2 * Math.PI * f * i / sr); return x; };
const saw = (f, sec, sr = SR, H = 12) => { const x = new Float32Array(Math.round(sec * sr)); for (let h = 1; h <= H; h++) for (let i = 0; i < x.length; i++) x[i] += 0.5 / h * Math.sin(2 * Math.PI * f * h * i / sr); return x; };
function src(x, f0) { const F = K.spk7Frz(x); return {t: 'src', x, sr: SR, f0, frz: F.frz, FL: F.FL}; }
function render(S, p, notes, dur) {
  const C = K.spk7CoreMake(SR); C.msg(S); C.msg({t: 'p', p}); const n = Math.round(dur * SR), L = new Float32Array(n), R = new Float32Array(n);
  for (const e of notes) C.msg(e);
  const t = process.hrtime.bigint(); for (let o = 0; o < n; o += 128) C.render(L.subarray(o, o + 128), R.subarray(o, o + 128), Math.min(128, n - o), o);
  return {L, R, ms: Number(process.hrtime.bigint() - t) / 1e6, C};
}
function spec(x, a, N = 65536) {
  const re = new Float64Array(N), im = new Float64Array(N); for (let i = 0; i < N; i++) re[i] = (x[a + i] || 0) * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / N));
  K.spk7Fft(re, im, false); const M = new Float64Array(N / 2); for (let b = 0; b < N / 2; b++) M[b] = Math.hypot(re[b], im[b]); return M;
}
function peakHz(x, a) { const M = spec(x, a), N = 65536; let b = 2; for (let k = 2; k < N / 2 - 1; k++) if (M[k] > M[b]) b = k; const l = Math.log(M[b - 1] + 1e-12), c = Math.log(M[b] + 1e-12), r = Math.log(M[b + 1] + 1e-12); return (b + 0.5 * (l - r) / (l - 2 * c + r)) * SR / N; }
function centroid(x, a) { const M = spec(x, a), N = 65536; let s = 0, w = 0; for (let k = 1; k < N / 2; k++) { const f = k * SR / N; if (f > 12000) break; s += f * M[k] * M[k]; w += M[k] * M[k]; } return s / w; }
const ct = (f, g) => 1200 * Math.log2(f / g);
const P0 = {art: 'korn', pos: 0.3, bew: 0, gs: 0.08, dc: 4, spo: 0.1, spt: 0, form: 0.3, a: 0.02, d: 0.3, s: 0.8, r: 0.4, fc: 1, q: 0.1, br: 0.5, vol: 0.7, poly: 8};

// 1) Grundton-Erkennung
{
  const a = K.spk7F0(sine(440, 1), SR), b = K.spk7F0(saw(220, 1), SR), c = K.spk7F0(saw(110, 1), SR); const nz = new Float32Array(SR); let s = 7; for (let i = 0; i < SR; i++) { s = (s * 1664525 + 1013904223) >>> 0; nz[i] = s / 4294967296 - 0.5; }
  const d = K.spk7F0(nz, SR);
  ok('grundton-erkennung', {sinus440: +a.toFixed(2), saege220: +b.toFixed(2), saege110: +c.toFixed(2), rauschen: d}, Math.abs(ct(a, 440)) < 5 && Math.abs(ct(b, 220)) < 5 && Math.abs(ct(c, 110)) < 5 && d === 0);
}
// 2) Tonhöhe Körnchen: Taste A4 bei Grundton A4 = Quelle; +12 = doppelte Frequenz (±10 ct); −12 = halbe
{
  const S = src(sine(440, 2), 440), out = {};
  for (const m of [69, 81, 57, 76]) { const r = render(S, P0, [{t: 'on', id: 1, m, v: 0.9, at: 0.01}, {t: 'off', id: 1, at: 2.4}], 2.6); out[m] = peakHz(r.L, Math.round(0.6 * SR)); }
  const e = {69: ct(out[69], 440), 81: ct(out[81], 880), 57: ct(out[57], 220), 76: ct(out[76], 659.255)};
  ok('tonhoehe-koernchen-sinus', {hz: Object.fromEntries(Object.entries(out).map(([k, v]) => [k, +v.toFixed(2)])), ct: Object.fromEntries(Object.entries(e).map(([k, v]) => [k, +v.toFixed(2)]))}, Object.values(e).every(v => Math.abs(v) < 10));
}
// 3) Spektrum-Schwerpunkt: Sägezahn A3 (220 Hz), Taste A3 = Schwerpunkt der Quelle (±5 %); Taste A4 = doppelt (±5 %)
{
  const x = saw(220, 2), f0 = K.spk7F0(x, SR), S = src(x, f0), c0 = centroid(x, 20000);
  const P3 = Object.assign({}, P0, {spo: 0, vol: +(process.env.V || 0.7)}), r0 = render(S, P3, [{t: 'on', id: 1, m: 57, v: 0.9, at: 0.01}], 2.2), r1 = render(S, P3, [{t: 'on', id: 1, m: 69, v: 0.9, at: 0.01}], 2.2);
  const c1 = centroid(r0.L, Math.round(0.5 * SR)), c2 = centroid(r1.L, Math.round(0.5 * SR)), p1 = peakHz(r1.L, Math.round(0.5 * SR));
  ok('schwerpunkt-saege', {f0: +f0.toFixed(2), quelle: Math.round(c0), tasteA3: Math.round(c1), tasteA4: Math.round(c2), verh: +(c2 / c1).toFixed(3), grundA4: +p1.toFixed(1)}, Math.abs(c1 / c0 - 1) < 0.05 && Math.abs(c2 / c1 / 2 - 1) < 0.05 && Math.abs(ct(p1, 440)) < 10);
}
// 4) Spektral-Schleife: Tonhöhe folgt der Taste (+12 = doppelt ±10 ct), Schleife ohne Sprung
{
  const S = src(sine(440, 2), 440), P = Object.assign({}, P0, {art: 'frz'});
  const r0 = render(S, P, [{t: 'on', id: 1, m: 69, v: 0.9, at: 0.01}], 2.0), r1 = render(S, P, [{t: 'on', id: 1, m: 81, v: 0.9, at: 0.01}], 2.0);
  const a = peakHz(r0.L, Math.round(0.4 * SR)), b = peakHz(r1.L, Math.round(0.4 * SR));
  let pk = 0; for (const v of r0.L) pk = Math.max(pk, Math.abs(v));
  ok('tonhoehe-spektral-schleife', {a4: +a.toFixed(2), a5: +b.toFixed(2), ct: [+ct(a, 440).toFixed(2), +ct(b, 880).toFixed(2)], spitze: +pk.toFixed(3)}, Math.abs(ct(a, 440)) < 10 && Math.abs(ct(b, 880)) < 10 && pk > 0.05);
}
// 5) Klicks (Sprung-Kriterium): Sinus-Quelle, Anschlag/Ausklang, Überlappung, Stimmen-Abgabe (poly 4, 6 Töne), Schnell-Aus, Regler mitten im Ton.
//    Kein Sprung größer als 1,5 × (2π·f_max/sr) × örtliche Spitze (±3 ms) – ein Klick wäre ein Vielfaches davon.
{
  const S = src(sine(220, 2), 220), fmax = 220 * Math.pow(2, (76 - 57) / 12), w = 2 * Math.PI * fmax / SR, worst = [];
  for (const art of ['korn', 'frz']) for (const form of [0, 0.3, 1]) {
    const P = Object.assign({}, P0, {art, form, poly: 4, a: 0.003, r: 0.05, spo: 0.2, bew: 0.5});
    const ev = []; const ms = [57, 60, 64, 67, 72, 76]; ms.forEach((m, k) => ev.push({t: 'on', id: k + 1, m, v: 0.9, at: 0.05 + k * 0.15}));
    ev.push({t: 'off', id: 5, at: 1.2}, {t: 'fast', id: 6, at: 1.3, tau: 0.004}, {t: 'kill', id: 4});
    const C = K.spk7CoreMake(SR); C.msg(S); C.msg({t: 'p', p: P}); for (const e of ev) C.msg(e);
    const n = Math.round(2.4 * SR), L = new Float32Array(n), R = new Float32Array(n);
    for (let o = 0; o < n; o += 128) { if (o === Math.round(0.9 * SR / 128) * 128) C.msg({t: 'p', p: {gs: 0.03, dc: 6, pos: 0.7}}); C.render(L.subarray(o, o + 128), R.subarray(o, o + 128), 128, o); }
    let bad = 0, maxQ = 0; const H = Math.round(0.003 * SR);
    for (const y of [L, R]) for (let i = 1; i < n; i++) { const j = Math.abs(y[i] - y[i - 1]); if (j < 1e-4) continue; let loc = 0; for (let q = Math.max(0, i - H); q < Math.min(n, i + H); q++) loc = Math.max(loc, Math.abs(y[q])); const qq = j / (w * Math.max(loc, 1e-3)); if (qq > maxQ) maxQ = qq; if (qq > 1.5) bad++; }
    worst.push({art, form, maxQ: +maxQ.toFixed(3), bad});
  }
  ok('keine-klicks', {grenze: 1.5, laeufe: worst}, worst.every(w => !w.bad));
}
// 6) CPU: 8 Stimmen × 5 s offline < Echtzeit/4 (1,25 s) – Standard und schwer (Dichte 8, Filter, Breite, Streuung Ton)
{
  const x = saw(110, 8), S = src(x, 110), out = [];
  for (const [nm, p] of [['standard', {}], ['schwer', {dc: 8, gs: 0.2, fc: 0.6, q: 0.5, spt: 3, spo: 0.5}], ['spektral-schleife', {art: 'frz'}]]) {
    const ev = []; [48, 52, 55, 59, 62, 64, 67, 71].forEach((m, k) => ev.push({t: 'on', id: k + 1, m, v: 0.8, at: 0}));
    const r = render(S, Object.assign({}, P0, p), ev, 5); render(S, Object.assign({}, P0, p), ev, 0.2);
    const r2 = render(S, Object.assign({}, P0, p), ev, 5); let pk = 0; for (const v of r2.L) pk = Math.max(pk, Math.abs(v));
    out.push({nm, ms: Math.round(Math.min(r.ms, r2.ms)), echtzeitAnteil: +(Math.min(r.ms, r2.ms) / 5000).toFixed(3), stimmen: r2.C.info().voices, spitze: +pk.toFixed(3)});
  }
  ok('cpu-8-stimmen-5s', {grenze_ms: 1250, out}, out.every(o => o.ms < 1250 && o.stimmen === 8 && o.spitze > 0.05 && o.spitze <= 1));
}
// 7) Polyfonie: 10 Töne bei poly 8 → höchstens 8 gehalten, abgegebene Stimmen enden (Meldung), danach Stille
{
  const S = src(sine(220, 1), 220), C = K.spk7CoreMake(SR), ends = []; C.onEnd = id => ends.push(id); C.msg(S); C.msg({t: 'p', p: Object.assign({}, P0, {r: 0.1})});
  for (let k = 0; k < 10; k++) C.msg({t: 'on', id: k + 1, m: 50 + k, v: 0.8, at: k * 0.01});
  const L = new Float32Array(128), R = new Float32Array(128); let f = 0; for (; f < SR * 0.5; f += 128) C.render(L, R, 128, f);
  const held = C.info().held; for (let k = 0; k < 10; k++) C.msg({t: 'off', id: k + 1, at: f / SR}); for (let q = 0; q < SR * 0.4; q += 128, f += 128) C.render(L, R, 128, f);
  let pk = 0; for (const v of L) pk = Math.max(pk, Math.abs(v));
  ok('polyfonie-8', {gehalten: held, beendet: ends.length, still: pk === 0, aktiv: C.info().voices}, held === 8 && ends.length === 10 && pk === 0 && C.info().voices === 0);
}
const pass = res.every(r => r.pass); console.log(pass ? 'ALLES OK (' + res.length + ')' : 'FEHLER');
if (outF) fs.writeFileSync(outF, JSON.stringify(res, null, 1));
process.exit(pass ? 0 : 1);
