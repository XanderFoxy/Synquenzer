// CHR6 Kern-Test: Formant-Lage der Chor-Stimme (G6-Chor-Weg, renderMulti) bei großen Verschiebungen.
// Aufruf: node kern-test.mjs <index.html> [json-ausgabe]
// Synthetische Vokale a/e/i/o/u (bekannte Formanten, Quelle-Filter, additiv) bei f0 110 und 196 Hz, Verschiebungen
// −12, −7, −4, +4, +7, +12 Halbtöne. Bezug = derselbe Vokal, direkt auf der Ziel-Tonhöhe erzeugt (Ideal).
// Maße: Formant-Abweichung F1/F2 in % (Gipfel der LPC-Hülle aus den Teilton-Pegeln, Ausgabe gegen Ideal),
//        Hüllen-Fehler in dB (leistungsgewichtetes RMS je Teilton bis 5 kHz), Tonhöhe in Cent (gegen Ziel).
import fs from 'node:fs';

const file = process.argv[2];
if (!file) { console.error('Aufruf: node kern-test.mjs <index.html> [out.json]'); process.exit(2); }
const html = fs.readFileSync(file, 'utf8');
const a = html.indexOf('function g6pDspMake(){');
const endTok = 'return{modelRuns,renderMulti,sibGain,kCoef,lufs,anN:0};\n}';
const b = html.indexOf(endTok, a);
if (a < 0 || b < 0) { console.error('g6pDspMake nicht gefunden'); process.exit(2); }
let src = html.slice(a, b + endTok.length);
// Versuche: CHR6_PATCH=<datei.mjs> (export default [[alt, neu], …]) – nur für Messreihen, nicht für den Kern-Test
if (process.env.CHR6_PATCH) { const P = (await import(process.env.CHR6_PATCH)).default; for (const [o, nw] of P) { if (src.split(o).length !== 2) { console.error('Patch-Anker nicht eindeutig'); process.exit(2); } src = src.replace(o, nw); } }
const D = new Function(src + '\nreturn g6pDspMake();')();

const SR = 48000, HOP = 0.01, DUR = 1.2;
const VOW = {
  a: [[730, 70], [1090, 90], [2440, 120], [3400, 150], [4500, 200]],
  e: [[530, 60], [1840, 90], [2480, 120], [3400, 150], [4500, 200]],
  i: [[270, 60], [2290, 100], [3010, 120], [3400, 150], [4500, 200]],
  o: [[570, 70], [840, 80], [2410, 120], [3400, 150], [4500, 200]],
  u: [[300, 60], [870, 80], [2240, 120], [3400, 150], [4500, 200]],
};
// Betrag der Hülle bei f: Quelle (−12 dB/Okt. ab 100 Hz) × Formant-Resonatoren (2. Ordnung) × Abstrahlung (+6 dB/Okt.)
function env(v, f, fm = 1) {
  const F = VOW[v]; let g = 1 / (1 + (f / 100) ** 2) * (f / 100 + 0.3);
  for (const [fc0, bw] of F) {
    const fc = fc0 * fm, num = fc * fc + (bw / 2) ** 2;
    const d = Math.sqrt(((fc - f) ** 2 + (bw / 2) ** 2) * ((fc + f) ** 2 + (bw / 2) ** 2));
    g *= num / d;
  }
  return g;
}
function synth(v, f0, fm = 1) {
  const n = Math.round(DUR * SR), x = new Float32Array(n), fade = Math.round(0.02 * SR);
  const H = Math.floor(0.45 * SR / f0);
  let seed = 12345;
  const rnd = () => (seed = (seed * 1103515245 + 12345) >>> 0) / 4294967296;
  const amp = [], ph = [];
  for (let h = 1; h <= H; h++) { amp.push(env(v, h * f0, fm)); ph.push(2 * Math.PI * rnd()); }
  let mx = 0;
  for (let i = 0; i < n; i++) {
    let s = 0; const w = 2 * Math.PI * f0 * i / SR;
    for (let h = 1; h <= H; h++) s += amp[h - 1] * Math.cos(h * w + ph[h - 1]);
    x[i] = s; if (Math.abs(s) > mx) mx = Math.abs(s);
  }
  const k = 0.3 / mx;
  for (let i = 0; i < n; i++) { const g = Math.min(1, i / fade, (n - 1 - i) / fade); x[i] *= k * g; }
  return { x, k, amp: amp.map(z => z * k) };
}
// Teilton-Pegel (Betrag) durch Projektion auf einem Hann-Fenster
function partials(y, f0, t0, t1, fmax) {
  const i0 = Math.round(t0 * SR), i1 = Math.round(t1 * SR), N = i1 - i0, out = [];
  let sw = 0; const w = new Float64Array(N);
  for (let j = 0; j < N; j++) { w[j] = 0.5 - 0.5 * Math.cos(2 * Math.PI * (j + 0.5) / N); sw += w[j]; }
  for (let h = 1; h * f0 < fmax; h++) {
    let re = 0, im = 0; const dw = 2 * Math.PI * h * f0 / SR;
    for (let j = 0; j < N; j++) { const p = dw * (i0 + j), v = w[j] * y[i0 + j]; re += v * Math.cos(p); im -= v * Math.sin(p); }
    out.push(2 * Math.hypot(re, im) / sw);
  }
  return out;
}
// Tonhöhe: Kamm-Suche ±40 ct um das Ziel (5 Teiltöne), Feinsuche 0,1 ct
function pitchCt(y, f0, t0, t1) {
  const i0 = Math.round(t0 * SR), i1 = Math.round(t1 * SR), N = i1 - i0;
  const w = new Float64Array(N); for (let j = 0; j < N; j++) w[j] = 0.5 - 0.5 * Math.cos(2 * Math.PI * (j + 0.5) / N);
  const score = ct => { const f = f0 * 2 ** (ct / 1200); let s = 0; for (let h = 1; h <= 5 && h * f < 5000; h++) { let re = 0, im = 0; const dw = 2 * Math.PI * h * f / SR; for (let j = 0; j < N; j += 2) { const p = dw * j, v = w[j] * y[i0 + j]; re += v * Math.cos(p); im -= v * Math.sin(p); } s += re * re + im * im; } return s; };
  let best = 0, bv = -1;
  for (let c = -40; c <= 40; c += 2) { const v = score(c); if (v > bv) { bv = v; best = c; } }
  for (let c = best - 2; c <= best + 2; c += 0.1) { const v = score(c); if (v > bv) { bv = v; best = c; } }
  return best;
}
// LPC-Hülle aus Teilton-Leistungen (Autokorrelation = Summe von Kosinussen), Ordnung 12, fs 11 kHz
function lpcEnv(amps, f0) {
  const FS = 11000, P = 12, r = new Float64Array(P + 1);
  amps.forEach((A, i) => { const f = (i + 1) * f0; if (f >= 5000) return; for (let t = 0; t <= P; t++) r[t] += A * A / 2 * Math.cos(2 * Math.PI * f * t / FS); });
  r[0] *= 1.0001;
  const aa = new Float64Array(P + 1); aa[0] = 1; let e = r[0];
  for (let i = 1; i <= P; i++) {
    let k = -r[i]; for (let j = 1; j < i; j++) k -= aa[j] * r[i - j]; k /= e;
    const tmp = aa.slice(); for (let j = 1; j < i; j++) aa[j] = tmp[j] + k * tmp[i - j]; aa[i] = k; e *= 1 - k * k;
  }
  return f => { let re = 0, im = 0; for (let j = 0; j <= P; j++) { re += aa[j] * Math.cos(2 * Math.PI * f * j / FS); im -= aa[j] * Math.sin(2 * Math.PI * f * j / FS); } return 1 / (re * re + im * im); };
}
function peak(E, lo, hi) {
  let bf = lo, bv = -1; for (let f = lo; f <= hi; f += 2) { const v = E(f); if (v > bv) { bv = v; bf = f; } }
  return bf;
}
// Formant-Lage: Leistungs-Schwerpunkt der Teiltöne im Band ±5 Halbtöne um den (bekannten) Formanten – Ausgabe gegen Ideal
// auf demselben Teilton-Raster (robust, keine Gipfel-Verwechslung); Zusatz: LPC-Gipfel im Band ±4 Halbtöne
function formants(amps, f0, v, fm = 1) {
  const E = lpcEnv(amps, f0), FF = VOW[v].slice(0, 2).map(z => z[0] * fm);
  const cen = FF.map(F => { let s = 0, sf = 0; amps.forEach((A, i) => { const f = (i + 1) * f0; if (f >= F / 1.335 && f <= F * 1.335) { s += A * A; sf += A * A * f; } }); return s > 0 ? sf / s : F; });
  const lpc = FF.map(F => peak(E, F / 1.26, F * 1.26));
  return { cen, lpc };
}
function runCase(v, f0, st, fm) {
  const S = synth(v, f0);
  const n = S.x.length, nf = Math.floor(n / (HOP * SR));
  const an = { sr: SR, hop: HOP, n: nf, f0: new Float32Array(nf).fill(f0), ap: new Float32Array(nf), notes: [] };
  const have = D.modelRuns(S.x, SR, an, 0, n, new Map());
  const runs = [...have.values()].map(R => [R.i0, R.i1]);
  const c = new Float64Array(nf).fill(st * 100);
  const X = fm ? { ms: 0, f: fm, d: 0, s: 1, r: 0.3, c: 0.12 } : null;
  const cv = { c, runs, x: X };
  const r = D.renderMulti(S.x, SR, an, i0 => have.get(i0), [cv], 0, n);
  const y = r.ys[0], ft = f0 * 2 ** (st / 12), t0 = 0.35, t1 = 0.85;
  const out = partials(y, ft, t0, t1, 5000);
  const ideal = out.map((_, i) => env(v, (i + 1) * ft, fm || 1) * S.k);
  // Hüllen-Fehler dB (leistungsgewichtet)
  let sw = 0, se = 0; out.forEach((A, i) => { const w = ideal[i] ** 2, d = 20 * Math.log10((A + 1e-9) / ideal[i]); sw += w; se += w * d * d; });
  const fo = formants(out, ft, v, fm || 1), fi = formants(ideal, ft, v, fm || 1);
  const d1 = Math.abs(fo.cen[0] / fi.cen[0] - 1) * 100, d2 = Math.abs(fo.cen[1] / fi.cen[1] - 1) * 100;
  const L = (Math.abs(fo.lpc[0] / fi.lpc[0] - 1) + Math.abs(fo.lpc[1] / fi.lpc[1] - 1)) * 50;
  const ct = pitchCt(y, ft, t0, t1);
  return { v, f0, st, fm: fm || 1, dB: Math.sqrt(se / sw), F1: d1, F2: d2, F: (d1 + d2) / 2, L, ct, fo, fi };
}

const SHIFTS = [-12, -7, -4, 4, 7, 12], F0S = [110, 196], V = Object.keys(VOW);
const res = [];
const t0 = Date.now();
for (const f0 of F0S) for (const st of SHIFTS) for (const v of V) res.push(runCase(v, f0, st, 0));
// „echt“-Kopie (eigene Formant-Lage f = 1,035 bzw. 0,97): Bezug = Hülle × f
for (const st of [-12, 12]) for (const v of V) { res.push(runCase(v, 196, st, 1.035)); res.push(runCase(v, 110, st, 0.97)); }
const avg = a => a.reduce((s, z) => s + z, 0) / a.length;
const plain = res.filter(z => z.fm === 1);
console.log('Fassung:', file);
console.log('Verschiebung | Formant % (F1/F2) | LPC-Formant % | Hülle dB | Ton ct (max |·|)');
for (const st of SHIFTS) {
  const g = plain.filter(z => z.st === st);
  console.log(`${st > 0 ? '+' : ''}${st} | ${avg(g.map(z => z.F)).toFixed(2)} (${avg(g.map(z => z.F1)).toFixed(2)}/${avg(g.map(z => z.F2)).toFixed(2)}) | ${avg(g.map(z => z.L)).toFixed(2)} | ${avg(g.map(z => z.dB)).toFixed(2)} | ${Math.max(...g.map(z => Math.abs(z.ct))).toFixed(1)}`);
}
for (const v of V) { const g = plain.filter(z => z.v === v); console.log(`Vokal ${v}: Formant ${avg(g.map(z => z.F)).toFixed(2)} % · Hülle ${avg(g.map(z => z.dB)).toFixed(2)} dB`); }
const big = plain.filter(z => Math.abs(z.st) >= 7), echt = res.filter(z => z.fm !== 1);
const sum = {
  formantPct: +avg(plain.map(z => z.F)).toFixed(3), formantPctGross: +avg(big.map(z => z.F)).toFixed(3),
  formantPctMax: +Math.max(...plain.map(z => z.F)).toFixed(2), lpcFormantPct: +avg(plain.map(z => z.L)).toFixed(3), huelleDb: +avg(plain.map(z => z.dB)).toFixed(3),
  echtFormantPct: +avg(echt.map(z => z.F)).toFixed(3), echtHuelleDb: +avg(echt.map(z => z.dB)).toFixed(3),
  tonMaxCt: +Math.max(...res.map(z => Math.abs(z.ct))).toFixed(2), faelle: res.length, sek: +((Date.now() - t0) / 1000).toFixed(1),
};
console.log('Gesamt:', JSON.stringify(sum));
if (process.argv[3]) fs.writeFileSync(process.argv[3], JSON.stringify({ sum, res }, null, 1));
