// Gesangstrainer – stimmanalyse.js
// Liest aus eigenen Gesangsaufnahmen, wie sauber jeder Ton klingt und in welchem Register er vermutlich gesungen ist.
// Alles lokal, nichts wird gesendet. Läuft im Hauptfaden, als Modul-Worker (diese Datei selbst) und in Node.
//
// export function analysiere(x, sr, opt={}) → Analyse
//   Gehaltene Stellen (≥ 0,15 s) aus tonhoehe()/noten() von ton.js. Je Stelle: CPP (Cepstral Peak Prominence, dB),
//   HNR (Autokorrelation, dB), Jitter (PPQ5, %), Shimmer (APQ5, %), Tonhöhen-Streuung der Tonmitte (Cent, Vibrato
//   herausgemittelt), Abweichung zum nächsten Halbton (Cent), H1–H2 (dB), Alpha-Ratio (1–5 kHz gegen 50 Hz–1 kHz, dB),
//   Obertonanteil bis 5 kHz, Pegel. Register je Stelle: Wahrscheinlichkeiten Brust/Misch/Kopf (Schätzung), gemessen
//   gegen die eigene tiefe Lage der Aufnahme. Je Halbton zusammengefasst in .toene.
// export function stimmlageAusLiedern(analysen[], opt={}) → Stimmprofil {tief,hoch,kern,typ,uebergaenge,text, register, sauberkeit, toene, …}
// export function liedHoehe(lied, analyse) → {zeilen, befunde, tipps, text, kipp} – je Zeile/Silbe Register und Sauberkeit.
// export function kompakt(analyse) → kleine Fassung (ohne Stellen) zum Speichern in localStorage.
// export function imHintergrund(x, sr, opt) → Promise<Analyse> (Modul-Worker, sonst Hauptfaden)
// Wichtig: alles sind Schätzungen. Werte werden in Worte übersetzt, nie als Punkte oder Prozent gezeigt.
import { tonhoehe, noten, midiName, hzZuMidi } from './ton.js';

const G = globalThis;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const med = (a) => { const s = a.filter(Number.isFinite).sort((p, q) => p - q); if (!s.length) return NaN; const k = s.length >> 1; return s.length & 1 ? s[k] : 0.5 * (s[k - 1] + s[k]); };
const rund = (v, n = 1) => (Number.isFinite(v) ? Math.round(v * 10 ** n) / 10 ** n : null);
function gewQ(werte, gew, q) {
  const idx = werte.map((_, i) => i).filter((i) => gew[i] > 0).sort((a, b) => werte[a] - werte[b]);
  let sum = 0; for (const i of idx) sum += gew[i];
  if (!sum) return NaN;
  let acc = 0; for (const i of idx) { acc += gew[i]; if (acc >= q * sum) return werte[i]; }
  return werte[idx[idx.length - 1]];
}

// ---------------------------------------------------------------- FFT (radix 2, komplex, in place)
const TW = new Map();
function fft(re, im, inv = false) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit;
    if (i < j) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; }
  }
  let tw = TW.get(n);
  if (!tw) { tw = { c: new Float64Array(n / 2), s: new Float64Array(n / 2) }; for (let k = 0; k < n / 2; k++) { tw.c[k] = Math.cos(2 * Math.PI * k / n); tw.s[k] = Math.sin(2 * Math.PI * k / n); } TW.set(n, tw); }
  const sg = inv ? 1 : -1;
  for (let len = 2; len <= n; len <<= 1) {
    const half = len >> 1, step = n / len;
    for (let i = 0; i < n; i += len) for (let k = 0; k < half; k++) {
      const c = tw.c[k * step], s = sg * tw.s[k * step];
      const a = i + k, b = a + half;
      const xr = re[b] * c - im[b] * s, xi = re[b] * s + im[b] * c;
      re[b] = re[a] - xr; im[b] = im[a] - xi; re[a] += xr; im[a] += xi;
    }
  }
  if (inv) for (let i = 0; i < n; i++) { re[i] /= n; im[i] /= n; }
}

// ---------------------------------------------------------------- Merkmale eines Fensters
const FENSTER = new Map();
function hann(n) { let w = FENSTER.get(n); if (!w) { w = new Float64Array(n); for (let i = 0; i < n; i++) w[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (n - 1)); FENSTER.set(n, w); } return w; }
const WAK = new Map(); // Autokorrelation des Fensters (für HNR nach Boersma)
function fensterAk(n, nfft) {
  const k = n + ':' + nfft; let r = WAK.get(k); if (r) return r;
  const w = hann(n), re = new Float64Array(nfft), im = new Float64Array(nfft);
  for (let i = 0; i < n; i++) re[i] = w[i];
  fft(re, im); for (let i = 0; i < nfft; i++) { re[i] = re[i] * re[i] + im[i] * im[i]; im[i] = 0; } fft(re, im, true);
  r = new Float64Array(n); for (let i = 0; i < n; i++) r[i] = re[i] / re[0]; WAK.set(k, r); return r;
}

function fensterMerkmale(x, a, n, sr, f0) {
  const nfft = n * 2, w = hann(n);
  const re = new Float64Array(nfft), im = new Float64Array(nfft);
  let mu = 0; for (let i = 0; i < n; i++) mu += x[a + i]; mu /= n;
  for (let i = 0; i < n; i++) re[i] = (x[a + i] - mu) * w[i];
  fft(re, im);
  const half = nfft / 2, bin = sr / nfft;
  const p = new Float64Array(half + 1);
  for (let k = 0; k <= half; k++) p[k] = re[k] * re[k] + im[k] * im[k] + 1e-20;
  const db = (k) => 10 * Math.log10(p[k]);
  const spitze = (f, breite) => { const k0 = Math.max(1, Math.floor((f - breite) / bin)), k1 = Math.min(half, Math.ceil((f + breite) / bin)); let m = 0; for (let k = k0; k <= k1; k++) if (p[k] > m) m = p[k]; return 10 * Math.log10(m + 1e-20); };
  const tal = (f, breite) => { const k0 = Math.max(1, Math.floor((f - breite) / bin)), k1 = Math.min(half, Math.ceil((f + breite) / bin)); let m = Infinity; for (let k = k0; k <= k1; k++) if (p[k] < m) m = p[k]; return 10 * Math.log10(m + 1e-20); };
  // H1–H2
  const h1 = spitze(f0, 0.12 * f0), h2 = spitze(2 * f0, 0.12 * f0);
  // Alpha-Ratio: Energie 1–5 kHz gegen 50 Hz–1 kHz
  let eT = 0, eH = 0;
  for (let k = Math.ceil(50 / bin); k <= Math.min(half, Math.floor(5000 / bin)); k++) { if (k * bin < 1000) eT += p[k]; else eH += p[k]; }
  const alpha = 10 * Math.log10((eH + 1e-20) / (eT + 1e-20));
  // Obertöne bis 5 kHz: Spitze ≥ 6 dB über dem Tal daneben und höchstens 50 dB unter der stärksten
  const fMax = Math.min(5000, 0.48 * sr), K = Math.max(1, Math.floor(fMax / f0));
  const sp = []; let smax = -Infinity;
  for (let k = 1; k <= K; k++) { const s = spitze(k * f0, 0.1 * f0); sp.push(s); if (s > smax) smax = s; }
  let zahl = 0;
  for (let k = 1; k <= K; k++) { const t = Math.min(tal((k - 0.5) * f0, 0.12 * f0), tal((k + 0.5) * f0, 0.12 * f0)); if (sp[k - 1] - t >= 6 && sp[k - 1] >= smax - 50) zahl++; }
  // CPP: Cepstrum des log-Leistungsspektrums, Spitze um 1/f0 über der Regressionsgeraden (1 ms … 20 ms)
  const cr = new Float64Array(nfft), ci = new Float64Array(nfft);
  for (let k = 0; k <= half; k++) { cr[k] = db(k); if (k > 0 && k < half) cr[nfft - k] = cr[k]; }
  fft(cr, ci, true);
  const q0 = Math.max(2, Math.floor(0.001 * sr)), q1 = Math.min(half - 1, Math.ceil(0.02 * sr));
  let sx = 0, sy = 0, sxx = 0, sxy = 0, nn = 0;
  for (let q = q0; q <= q1; q++) { const y = cr[q]; sx += q; sy += y; sxx += q * q; sxy += q * y; nn++; }
  const steig = (nn * sxy - sx * sy) / (nn * sxx - sx * sx || 1), abs = (sy - steig * sx) / nn;
  const T0 = sr / f0, qa = Math.max(q0, Math.floor(T0 * 0.85)), qb = Math.min(q1, Math.ceil(T0 * 1.15));
  let cpp = NaN;
  for (let q = qa; q <= qb; q++) { const v = cr[q] - (abs + steig * q); if (!(v <= cpp)) cpp = v; }
  // HNR aus der normierten Autokorrelation (geteilt durch die Fenster-Autokorrelation)
  for (let k = 0; k < nfft; k++) { const pk = k <= half ? p[k] : p[nfft - k]; re[k] = pk; im[k] = 0; }
  fft(re, im, true);
  const rw = fensterAk(n, nfft);
  let r = 0;
  const ta = Math.max(2, Math.floor(T0 * 0.9)), tb = Math.min(n - 2, Math.ceil(T0 * 1.1));
  for (let t = ta; t <= tb; t++) { const v = re[t] / re[0] / (rw[t] || 1); if (v > r) r = v; }
  r = clamp(r, 1e-4, 0.99999);
  const hnr = 10 * Math.log10(r / (1 - r));
  return { h12: h1 - h2, alpha, harm: zahl / K, cpp, hnr };
}

// ---------------------------------------------------------------- Jitter/Shimmer (PPQ5/APQ5) über Nulldurchgänge
function biquadBP(x, sr, f, q) {
  const w0 = 2 * Math.PI * f / sr, al = Math.sin(w0) / (2 * q), a0 = 1 + al;
  const b0 = al / a0, b2 = -al / a0, a1 = -2 * Math.cos(w0) / a0, a2 = (1 - al) / a0;
  const y = new Float64Array(x.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) { const v = b0 * x[i] + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v; }
  return y;
}
function perioden(x, a, b, sr, f0) {
  const seg = x.subarray(a, b);
  const y = biquadBP(biquadBP(seg, sr, f0, 1.2), sr, f0, 1.2);
  const z = [];
  for (let i = Math.floor(0.01 * sr); i < y.length - 1; i++) if (y[i] <= 0 && y[i + 1] > 0) z.push(i + y[i] / (y[i] - y[i + 1]));
  const T = [], A = [];
  for (let k = 0; k + 1 < z.length; k++) {
    const t = (z[k + 1] - z[k]) / sr; T.push(t);
    let lo = Infinity, hi = -Infinity; for (let i = Math.floor(z[k]); i <= Math.ceil(z[k + 1]) && i < seg.length; i++) { const v = seg[i]; if (v < lo) lo = v; if (v > hi) hi = v; }
    A.push(hi - lo);
  }
  const Tm = med(T);
  const ok = T.map((t) => Math.abs(t * f0 - 1) < 0.2 && Math.abs(t / Tm - 1) < 0.2);
  const pq5 = (v) => {
    let s = 0, c = 0, m = 0, mc = 0;
    for (let i = 2; i + 2 < v.length; i++) {
      if (!(ok[i - 2] && ok[i - 1] && ok[i] && ok[i + 1] && ok[i + 2])) continue;
      const loc = (v[i - 2] + v[i - 1] + v[i] + v[i + 1] + v[i + 2]) / 5;
      s += Math.abs(v[i] - loc); c++;
    }
    for (let i = 0; i < v.length; i++) if (ok[i]) { m += v[i]; mc++; }
    return c >= 6 && m > 0 ? (s / c) / (m / mc) * 100 : NaN;
  };
  return { jitter: pq5(T), shimmer: pq5(A), zyklen: ok.filter(Boolean).length };
}

// ---------------------------------------------------------------- Sauberkeit und Register in Worte
export const SAUBER_STUFEN = ['klar', 'meist klar', 'wackelig', 'unsauber'];
export const SAUBER_WORT = { klar: 'klar und ruhig', 'meist klar': 'meist klar', wackelig: 'etwas wackelig', unsauber: 'noch unsauber' };
export const REGISTER = ['Brust', 'Misch', 'Kopf'];
function sauberIndex(s) {
  const qC = Number.isFinite(s.cpp) ? clamp((s.cpp - 0.3) / 1.4) : 0.5; // eigener Maßstab (Cepstrum des dB-Spektrums, 1/N)
  const qH = Number.isFinite(s.hnr) ? clamp((s.hnr - 5) / 15) : 0.5;
  const qJ = Number.isFinite(s.jitter) ? clamp(1 - (s.jitter - 0.4) / 1.4) : 0.6;
  const qS = Number.isFinite(s.shimmer) ? clamp(1 - (s.shimmer - 2.5) / 8) : 0.6;
  const qT = Number.isFinite(s.streuung) ? clamp(1 - (s.streuung - 12) / 40) : 0.6;
  return 0.28 * qC + 0.26 * qH + 0.14 * qJ + 0.12 * qS + 0.2 * qT;
}
const stufeVon = (q) => (q >= 0.66 ? 'klar' : q >= 0.5 ? 'meist klar' : q >= 0.34 ? 'wackelig' : 'unsauber');

/** Analyse einer Aufnahme (am besten nur Gesang). */
export function analysiere(x, sr, opt = {}) {
  const melde = typeof opt.fortschritt === 'function' ? opt.fortschritt : null;
  if (!x || !x.length || !(sr > 0)) return leer();
  const spur = tonhoehe(x, sr, { hop: 0.01, fortschritt: melde ? (p) => melde(Math.round(p * 0.6)) : undefined });
  const hz = spur.hz, hop = spur.hop;
  const nn = noten({ ...spur, f0: hz }, { minSicher: 0.5, minDauer: 0.15 });
  const pg = nn.map((n) => n.pegel).filter(Number.isFinite).sort((a, b) => a - b);
  const laut = pg.length ? pg[Math.floor(0.9 * (pg.length - 1))] : -20;
  const gut = nn.filter((n) => n.pegel >= laut - 26 && n.sicher >= 0.5 && n.t1 - n.t0 >= 0.15);
  let n2 = 1; while (n2 < 0.046 * sr) n2 <<= 1;
  const stellen = [];
  gut.forEach((n, nr) => {
    if (melde && nr % 20 === 0) melde(60 + Math.round(40 * nr / gut.length));
    const d = n.t1 - n.t0, a = n.t0 + 0.15 * d, b = n.t1 - 0.15 * d;
    const fr = [];
    const schritt = Math.max(0.03, (b - a) / 8);
    for (let t = a; t + n2 / sr <= b + 0.02 && fr.length < 8; t += schritt) {
      const i = Math.round(t / hop); const f = hz[i] > 0 ? hz[i] : n.f0Mittel;
      const s0 = Math.round(t * sr); if (s0 + n2 > x.length) break;
      fr.push(fensterMerkmale(x, s0, n2, sr, f));
    }
    if (!fr.length) { const s0 = Math.max(0, Math.round(((n.t0 + n.t1) / 2) * sr - n2 / 2)); if (s0 + n2 <= x.length) fr.push(fensterMerkmale(x, s0, n2, sr, n.f0Mittel)); }
    if (!fr.length) return;
    const pj = perioden(x, Math.round(a * sr), Math.min(x.length, Math.round(Math.min(b, a + 1.2) * sr)), sr, n.f0Mittel);
    // Streuung der Tonmitte: Vibrato über ~200 ms herausgemittelt
    const k = n.kurve, L = Math.max(1, Math.round(0.2 / hop)), mitte = [];
    for (let i = 0; i + L <= k.length; i++) { let s = 0; for (let j = i; j < i + L; j++) s += k[j]; mitte.push(s / L); }
    const mm = mitte.length ? mitte : k, mu = mm.reduce((p, q) => p + q, 0) / mm.length;
    const streuung = Math.sqrt(mm.reduce((p, q) => p + (q - mu) ** 2, 0) / mm.length) * 100;
    const m = (f) => med(fr.map((v) => v[f]));
    const st = { t0: rund(n.t0, 2), t1: rund(n.t1, 2), midi: n.midi, cent: rund(n.cent, 0), pegel: rund(n.pegel, 1),
      cpp: rund(m('cpp')), hnr: rund(m('hnr')), h12: rund(m('h12')), alpha: rund(m('alpha')), harm: rund(m('harm'), 2),
      jitter: rund(pj.jitter, 2), shimmer: rund(pj.shimmer, 2), streuung: rund(streuung, 0), streuungRoh: n.streuung };
    st.q = rund(sauberIndex(st), 2); st.sauber = stufeVon(st.q);
    stellen.push(st);
  });
  registerSchaetzen(stellen);
  anstrengung(stellen);
  const sek = stellen.reduce((s, v) => s + (v.t1 - v.t0), 0);
  return { version: 1, name: opt.name || '', datum: opt.datum || Date.now(), dauer: rund(x.length / sr, 1), sekunden: rund(sek, 1),
    stellen, toene: jeTon(stellen), anstrengung: stellen.anstr || null, basis: stellen.basis || null };
}
function leer() { return { version: 1, dauer: 0, sekunden: 0, stellen: [], toene: {}, anstrengung: null, basis: null }; }

// Register je Stelle – gegen die eigene tiefe Lage (unterstes Drittel der gesungenen Zeit = vermutlich Brust)
function registerSchaetzen(st) {
  if (!st.length) return;
  const w = st.map((s) => s.t1 - s.t0), mid = st.map((s) => s.midi);
  const grenze = gewQ(mid, w, 0.3);
  const tief = st.filter((s) => s.midi <= grenze);
  const b = { midi: med(tief.map((s) => s.midi)), h12: med(tief.map((s) => s.h12)), alpha: med(tief.map((s) => s.alpha)), harm: med(tief.map((s) => s.harm)) };
  st.basis = { midi: b.midi, h12: rund(b.h12), alpha: rund(b.alpha), harm: rund(b.harm, 2) };
  for (const s of st) {
    const rel = 0.45 * ((s.h12 ?? b.h12) - b.h12) / 5 + 0.35 * (b.alpha - (s.alpha ?? b.alpha)) / 6 + 0.2 * (b.harm - (s.harm ?? b.harm)) / 0.2;
    const absol = 0.5 * ((s.h12 ?? 4) - 4) / 6 + 0.5 * (-24 - (s.alpha ?? -24)) / 8; // grobe feste Anker
    let v = 0.65 * rel + 0.25 * absol + 0.12 * (s.midi - b.midi - 6) / 5;
    v = clamp(v, -0.6, 2.6);
    const g = [0, 1, 2].map((c) => Math.exp(-((v - c) ** 2) / (2 * 0.55 * 0.55)));
    const sum = g[0] + g[1] + g[2];
    s.reg = g.map((x) => rund(x / sum, 2));
    s.register = REGISTER[s.reg.indexOf(Math.max(...s.reg))];
    s.regWert = rund(v, 2);
  }
}

// Anstrengung: wird es mit der Höhe deutlich lauter (Steigung dB je Halbton im oberen Teil) und sinkt die Sauberkeit?
function anstrengung(st) {
  if (st.length < 6) return;
  const w = st.map((s) => s.t1 - s.t0), mid = st.map((s) => s.midi);
  const mitte = gewQ(mid, w, 0.5);
  const reg = (arr, f) => { let sx = 0, sy = 0, sxx = 0, sxy = 0, n = 0; for (const s of arr) { const y = f(s); if (!Number.isFinite(y)) continue; sx += s.midi; sy += y; sxx += s.midi ** 2; sxy += s.midi * y; n++; } const d = n * sxx - sx * sx; return n >= 4 && d > 0 ? { m: (n * sxy - sx * sy) / d, c: (sy * sxx - sx * sxy) / d } : null; };
  const alle = reg(st, (s) => s.pegel), oben = reg(st.filter((s) => s.midi >= mitte), (s) => s.pegel), qo = reg(st.filter((s) => s.midi >= mitte), (s) => s.q);
  for (const s of st) {
    const erwartet = alle ? alle.c + alle.m * s.midi : s.pegel;
    s.angestrengt = s.midi > mitte + 1 && ((s.pegel - erwartet > 3 && s.q < 0.55) || (s.alpha > (st.basis ? st.basis.alpha + 6 : -10) && s.q < 0.45 && s.register === 'Brust'));
  }
  st.anstr = { steigung: oben ? rund(oben.m, 2) : null, sauberSteigung: qo ? rund(qo.m, 3) : null,
    lauterNachOben: !!(oben && oben.m > 1.2), sauberFaellt: !!(qo && qo.m < -0.02) };
}

function jeTon(stellen) {
  const by = new Map();
  for (const s of stellen) { if (!by.has(s.midi)) by.set(s.midi, []); by.get(s.midi).push(s); }
  const out = {};
  for (const [m, arr] of [...by.entries()].sort((a, b) => a[0] - b[0])) {
    const w = arr.map((s) => s.t1 - s.t0), sum = w.reduce((a, b) => a + b, 0);
    const wm = (f) => { let s = 0, c = 0; arr.forEach((v, i) => { if (Number.isFinite(v[f])) { s += v[f] * w[i]; c += w[i]; } }); return c ? s / c : null; };
    const reg = [0, 1, 2].map((k) => rund(arr.reduce((a, v, i) => a + v.reg[k] * w[i], 0) / sum, 2));
    const q = wm('q');
    out[m] = { midi: m, name: midiName(m), anzahl: arr.length, dauer: rund(sum, 2), laengste: rund(Math.max(...w), 2),
      q: rund(q, 2), sauber: stufeVon(q), cpp: rund(med(arr.map((v) => v.cpp))), hnr: rund(med(arr.map((v) => v.hnr))),
      jitter: rund(med(arr.map((v) => v.jitter)), 2), shimmer: rund(med(arr.map((v) => v.shimmer)), 2), streuung: rund(med(arr.map((v) => v.streuung)), 0),
      cent: rund(wm('cent'), 0), pegel: rund(wm('pegel'), 1), reg, register: REGISTER[reg.indexOf(Math.max(...reg))],
      angestrengt: rund(arr.filter((v) => v.angestrengt).reduce((a, v) => a + (v.t1 - v.t0), 0) / sum, 2) };
  }
  return out;
}

/** Kleine Fassung zum Speichern (ohne Stellen). */
export function kompakt(a) {
  return { version: 1, name: a.name || '', datum: a.datum || Date.now(), dauer: a.dauer, sekunden: a.sekunden, toene: a.toene, anstrengung: a.anstrengung, basis: a.basis };
}

// ---------------------------------------------------------------- Stimmlage aus mehreren Liedern
const FAECHER = [
  { typ: 'Bass', g: 'm', kern: [45, 59], umfang: [40, 64], wechsel: 59 },
  { typ: 'Bariton', g: 'm', kern: [48, 63], umfang: [43, 67], wechsel: 62 },
  { typ: 'Tenor', g: 'm', kern: [52, 67], umfang: [48, 72], wechsel: 66 },
  { typ: 'Alt', g: 'w', kern: [55, 70], umfang: [53, 77], wechsel: 62 },
  { typ: 'Mezzosopran', g: 'w', kern: [58, 74], umfang: [57, 81], wechsel: 64 },
  { typ: 'Sopran', g: 'w', kern: [62, 79], umfang: [60, 84], wechsel: 66 },
];

function grenzenVon(toene) {
  const ms = Object.keys(toene).map(Number).sort((a, b) => a - b);
  if (!ms.length) return null;
  const T = (m) => toene[m];
  const sicherT = ms.filter((m) => (T(m).dauer >= 0.6 || T(m).anzahl >= 2) && T(m).q >= 0.42 && T(m).angestrengt < 0.5);
  const liste = sicherT.length ? sicherT : ms;
  const w = ms.map((m) => T(m).dauer * (0.3 + (T(m).q || 0)) * (T(m).q >= 0.42 ? 1 : 0.3));
  const lo = Math.round(gewQ(ms, w, 0.12)), hi = Math.round(gewQ(ms, w, 0.88));
  return { tief: liste[0], hoch: liste[liste.length - 1], kern: [Math.min(lo, hi), Math.max(lo, hi)], ms };
}

/** Mehrere Analysen (auch kompakte) zu einem Stimmprofil zusammenführen. */
export function stimmlageAusLiedern(analysen, opt = {}) {
  const liste = (analysen || []).filter((a) => a && a.toene && Object.keys(a.toene).length);
  const N = (m) => midiName(m, opt.tonart);
  if (!liste.length) return { tief: null, hoch: null, kern: [null, null], typ: '', uebergaenge: [], text: 'In den Aufnahmen waren zu wenige klare, gehaltene Töne. Am besten eine Gesangsspur ohne Instrumente nehmen.', register: null, sauberkeit: {}, toene: {} };
  // Töne zusammenführen (nach Dauer gewichtet)
  const z = new Map();
  for (const a of liste) for (const t of Object.values(a.toene)) {
    const o = z.get(t.midi) || { midi: t.midi, anzahl: 0, dauer: 0, laengste: 0, qS: 0, cS: 0, aS: 0, reg: [0, 0, 0], aufnahmen: 0 };
    const d = t.dauer || 0; o.anzahl += t.anzahl; o.dauer += d; o.laengste = Math.max(o.laengste, t.laengste || 0);
    o.qS += (t.q || 0) * d; o.cS += (t.cent || 0) * d; o.aS += (t.angestrengt || 0) * d; o.aufnahmen++;
    for (let k = 0; k < 3; k++) o.reg[k] += (t.reg ? t.reg[k] : 0) * d;
    z.set(t.midi, o);
  }
  const toene = {};
  for (const o of [...z.values()].sort((a, b) => a.midi - b.midi)) {
    const q = o.qS / o.dauer, reg = o.reg.map((v) => rund(v / o.dauer, 2));
    toene[o.midi] = { midi: o.midi, name: N(o.midi), anzahl: o.anzahl, dauer: rund(o.dauer, 1), laengste: rund(o.laengste, 2), aufnahmen: o.aufnahmen,
      q: rund(q, 2), sauber: stufeVon(q), cent: rund(o.cS / o.dauer, 0), angestrengt: rund(o.aS / o.dauer, 2), reg, register: REGISTER[reg.indexOf(Math.max(...reg))] };
  }
  const gz = grenzenVon(toene);
  const { tief, hoch, kern } = gz;
  // Zonen je Ton: bequem (Kern, sauber, viel gesungen) / sicher / Rand
  const gesamt = Object.values(toene).reduce((s, t) => s + t.dauer, 0);
  for (const t of Object.values(toene)) {
    const viel = t.dauer >= 0.04 * gesamt || t.dauer >= 3;
    if (t.midi >= kern[0] && t.midi <= kern[1] && t.q >= 0.5 && t.angestrengt < 0.35 && viel) t.zone = 'bequem';
    else if (t.midi >= tief && t.midi <= hoch && t.q >= 0.38 && t.angestrengt < 0.5) t.zone = 'sicher';
    else { t.zone = 'rand'; t.randGrund = t.angestrengt >= 0.5 ? 'angestrengt' : t.q < 0.42 ? 'unsauber' : 'selten'; }
    t.tendenz = t.cent > 15 ? 'eher zu hoch' : t.cent < -15 ? 'eher zu tief' : 'mittig';
  }
  // Registerwechsel: wo der Brust-Anteil (geglättet über Nachbartöne) unter die Hälfte fällt
  const ms = Object.keys(toene).map(Number).sort((a, b) => a - b);
  const brust = (m) => { let s = 0, c = 0; for (const k of [m - 1, m, m + 1]) if (toene[k]) { const w = k === m ? 2 : 1; s += toene[k].reg[0] * w * Math.sqrt(toene[k].dauer); c += w * Math.sqrt(toene[k].dauer); } return c ? s / c : null; };
  let wAnf = null, wEnde = null;
  // nur oberhalb der unteren Kerngrenze suchen; der Abfall muss auf dem nächsten gesungenen Ton anhalten
  const oberT = ms.filter((m) => m >= kern[0] && toene[m].dauer >= 0.25);
  for (let i = 0; i < oberT.length; i++) {
    const m = oberT[i], b = brust(m), bn = i + 1 < oberT.length ? brust(oberT[i + 1]) : b;
    if (b == null) continue;
    if (wAnf == null && b < 0.62 && bn < 0.62) wAnf = m;
    if (wAnf != null && wEnde == null && b < 0.4) wEnde = m;
  }
  if (wAnf != null && wEnde == null) wEnde = wAnf;
  const kopfTon = ms.find((m) => toene[m].reg[2] >= 0.45 && toene[m].dauer >= 0.3) ?? null;
  let uebergaenge = wAnf != null ? [...new Set([wAnf, wEnde])].sort((a, b) => a - b) : [];
  // kein klarer Wechsel: Ton im oberen Bereich mit dem höchsten Misch-/Kopf-Anteil als angedeuteter Übergang
  let angedeutet = null;
  if (wAnf == null) {
    const mitteK = (kern[0] + kern[1]) / 2;
    const c = ms.filter((m) => m > mitteK && toene[m].dauer >= 0.3).sort((a, b) => toene[a].reg[0] - toene[b].reg[0])[0];
    if (c != null && 1 - toene[c].reg[0] >= 0.3) { angedeutet = c; uebergaenge = [c]; }
  }
  // höchster sauber gehaltener Brustton (spricht gegen Fächer, deren Wechsel darunter liegt)
  const brustOben = ms.filter((m) => toene[m].register === 'Brust' && toene[m].q >= 0.5 && toene[m].dauer >= 0.25).pop();
  // Stimmfach
  let kand = FAECHER;
  if (opt.geschlecht === 'm' || opt.geschlecht === 'w') kand = FAECHER.filter((f) => f.g === opt.geschlecht);
  const mitte = (kern[0] + kern[1]) / 2;
  const bew = kand.map((f) => {
    let d = Math.abs(mitte - (f.kern[0] + f.kern[1]) / 2);
    if (tief < f.umfang[0]) d += 0.5 * (f.umfang[0] - tief);
    if (hoch > f.umfang[1]) d += 0.5 * (hoch - f.umfang[1]);
    if (wAnf != null) d += 0.35 * Math.abs(wAnf - f.wechsel);
    if (brustOben != null && brustOben > f.wechsel) d += 0.6 * (brustOben - f.wechsel);
    return { typ: f.typ, d };
  });
  const gsum = bew.reduce((s, b) => s + Math.exp(-(b.d ** 2) / (2 * 2.6 ** 2)), 0) || 1;
  bew.forEach((b) => { b.p = Math.exp(-(b.d ** 2) / (2 * 2.6 ** 2)) / gsum; });
  bew.sort((a, b) => b.p - a.p);
  const [b1, b2] = bew;
  let fachText;
  if (b1.p >= 0.7 || !b2) fachText = `am ehesten ${b1.typ}`;
  else if (b1.p - b2.p < 0.12) fachText = `zwischen ${b1.typ} und ${b2.typ}`;
  else fachText = `am ehesten ${b1.typ}, ${b2.typ} möglich`;
  // Tagesschwankung: Grenzen je Aufnahme
  const einzeln = liste.map((a) => grenzenVon(a.toene)).filter(Boolean);
  let schwankung = null;
  if (einzeln.length >= 2) {
    const sd = (f) => { const v = einzeln.map(f); const mu = v.reduce((p, q) => p + q, 0) / v.length; return Math.sqrt(v.reduce((p, q) => p + (q - mu) ** 2, 0) / v.length); };
    const span = (f) => { const v = einzeln.map(f); return Math.max(...v) - Math.min(...v); };
    schwankung = { aufnahmen: einzeln.length, hoch: rund(sd((g) => g.hoch), 1), tief: rund(sd((g) => g.tief), 1), kernOben: rund(sd((g) => g.kern[1]), 1), spanneHoch: span((g) => g.hoch), spanneTief: span((g) => g.tief) };
  }
  // Anstrengung über alle Aufnahmen
  const lauter = liste.filter((a) => a.anstrengung && a.anstrengung.lauterNachOben).length;
  const sauberFaellt = liste.filter((a) => a.anstrengung && a.anstrengung.sauberFaellt).length;
  const sek = liste.reduce((s, a) => s + (a.sekunden || 0), 0);
  // Text in Worten
  const randOben = ms.filter((m) => m > kern[1] && toene[m].zone === 'rand');
  const randHart = randOben.filter((m) => toene[m].randGrund !== 'selten');
  const s = [];
  s.push(`Schätzung aus ${liste.length === 1 ? 'einer Aufnahme' : `${liste.length} Aufnahmen`} (${Math.round(sek)} s klar gehaltene Töne): Am meisten, längsten und saubersten singst du zwischen ${N(kern[0])} und ${N(kern[1])} – das ist deine bequeme Lage.`);
  s.push(`Sicher klingt es von ${N(tief)} bis ${N(hoch)}${randHart.length ? `; ab ${N(randHart[0])} wird es unsauberer oder angestrengter – das ist dein Rand im Moment` : randOben.length ? `; ${N(randOben[0])}${randOben.length > 1 ? ` bis ${N(randOben[randOben.length - 1])}` : ''} singst du nur kurz – dafür reichen die Aufnahmen noch nicht` : ''}.`);
  if (wAnf != null) s.push(wEnde > wAnf ? `Zwischen ${N(wAnf)} und ${N(wEnde)} wechselt dein Klang vermutlich von der Brust- in die Misch-/Kopfstimme.` : `Um ${N(wAnf)} wechselt dein Klang vermutlich von der Brust- in die Misch-/Kopfstimme.`);
  else if (angedeutet != null) s.push(`Einen klaren Registerwechsel gibt es in diesen Aufnahmen nicht – du bleibst fast überall in der Bruststimme; um ${N(angedeutet)} wird der Klang am ehesten leichter (erster Schritt Richtung Mischstimme).`);
  else s.push('Einen klaren Registerwechsel gibt es in diesen Aufnahmen nicht – du bleibst fast überall in der Bruststimme.');
  if (brustOben != null && brustOben >= 60) s.push(`${N(brustOben)} hältst du noch sauber in der Bruststimme.`);
  if (lauter) s.push('Nach oben wirst du deutlich lauter – oft ein Zeichen, dass die Höhe gedrückt wird. Oben lieber etwas leiser und leichter.');
  else if (sauberFaellt) s.push('Nach oben wird der Klang etwas weniger sauber – dort hilft Vokal-Ausgleich und Registerübung.');
  s.push(`Das spricht ${fachText}. Männer- und Frauenstimmen überschneiden sich – die Tonhöhe allein ist kein sicheres Urteil.`);
  if (schwankung) { const sdH = Math.max(1, Math.round(schwankung.hoch)); s.push(`Zwischen deinen Aufnahmen verschiebt sich die obere Grenze um etwa ±${sdH === 1 ? 'einen Halbton' : `${sdH} Halbtöne`} – das ist Tagesform, aber auch das Lied selbst: ein tiefes Lied zeigt deine Höhe nicht. Je mehr Aufnahmen, desto ruhiger wird die Schätzung.`); }
  else s.push('Die Tagesform schwankt – mit mehreren Aufnahmen von verschiedenen Tagen wird die Schätzung genauer.');
  const sicherheit = rund(Math.min(1, sek / 60) * Math.min(1, (hoch - tief + 1) / 10) * (b1.p >= 0.6 ? 1 : 0.75) * Math.min(1, 0.6 + 0.2 * liste.length), 2);
  const sauberkeit = {}, registerJe = {};
  for (const t of Object.values(toene)) { sauberkeit[t.midi] = t.sauber; registerJe[t.midi] = { brust: t.reg[0], misch: t.reg[1], kopf: t.reg[2], register: t.register }; }
  return {
    tief, hoch, kern, typ: `${b1.typ} (Schätzung)`, uebergaenge, text: s.join(' '), sicherheit, quelle: 'lieder', datum: Date.now(),
    typen: bew.slice(0, 3).map((b) => ({ typ: b.typ, wort: b.p >= 0.5 ? 'am ehesten' : b.p >= 0.2 ? 'möglich' : 'unwahrscheinlich' })),
    fachText, register: { wechsel: wAnf != null ? [wAnf, wEnde] : null, angedeutet, kopfAb: kopfTon, brustBis: brustOben ?? null, je: registerJe },
    sauberkeit, toene, schwankung, anstrengung: { lauterNachOben: lauter > 0, sauberFaellt: sauberFaellt > 0 },
    aufnahmen: liste.map((a) => ({ name: a.name || '', datum: a.datum || null, sekunden: a.sekunden || 0 })), sekunden: rund(sek, 1),
  };
}

// ---------------------------------------------------------------- Höhe in einem bestimmten Lied
const VOKAL_HOEHE = { a: '„a“ etwas runder Richtung offenes „o“', e: '„e“ Richtung „ä“/„ö“', i: '„i“ Richtung „ü“ (Lippen etwas runder)', o: '„o“ etwas offener, Kiefer locker', u: '„u“ etwas offener Richtung „o“' };
function vokalVon(text) { const m = String(text || '').toLowerCase().match(/[aeiouyäöü]/); if (!m) return 'a'; const v = m[0]; return v === 'y' ? 'i' : v === 'ä' ? 'e' : v === 'ö' ? 'o' : v === 'ü' ? 'u' : v; }

/** Ordnet die Stellen einer Analyse den Silben eines Lieds zu (mit kleiner Zeitverschiebung, falls die Aufnahme versetzt ist). */
export function liedHoehe(lied, analyse, opt = {}) {
  const N = (m) => midiName(m, lied && lied.tonart);
  const st = (analyse && analyse.stellen) || [];
  const zeilen = ((lied && lied.zeilen) || []).filter((z) => (z.silben || []).some((s) => Number.isFinite(s.t)));
  if (!st.length || !zeilen.length) return { zeilen: [], befunde: [], tipps: [], text: st.length ? 'Zu diesem Lied gibt es keine Silbenzeiten – die Aufnahme lässt sich nicht den Zeilen zuordnen.' : 'In der Aufnahme waren zu wenige klare, gehaltene Töne.', versatz: 0 };
  // Versatz suchen: −3 … +3 s, Treffer = Silbe mit gemessenem Ton im Abstand ≤ 1 HT zur Liedmelodie
  const silben = zeilen.flatMap((z) => z.silben.filter((s) => Number.isFinite(s.t)));
  const tonBei = (t0, t1, dv) => { let best = null, bw = 0; for (const s of st) { const o = Math.min(t1, s.t1 + dv) - Math.max(t0, s.t0 + dv); if (o > bw) { bw = o; best = s; } } return best; };
  let versatz = 0, bestT = -1;
  for (let dv = -3; dv <= 3.001; dv += 0.1) {
    let tr = 0; for (const s of silben) { if (!Number.isFinite(s.midi)) continue; const g = tonBei(s.t, s.t + (s.dauer || 0.3), dv); if (g && Math.abs(g.midi - s.midi) <= 1) tr++; }
    if (tr > bestT + 1 || (tr >= bestT && Math.abs(dv) < Math.abs(versatz) && tr === bestT)) { bestT = tr; versatz = rund(dv, 1); }
  }
  const zOut = zeilen.map((z) => {
    const ss = z.silben.map((s) => {
      if (!Number.isFinite(s.t)) return { text: s.text, wort: s.wort || s.text };
      const t0 = s.t, t1 = s.t + (s.dauer || 0.3);
      const teil = st.filter((g) => Math.min(t1, g.t1 + versatz) - Math.max(t0, g.t0 + versatz) > 0.05);
      if (!teil.length) return { text: s.text, wort: s.wort || s.text, midi: s.midi };
      const w = teil.map((g) => Math.min(t1, g.t1 + versatz) - Math.max(t0, g.t0 + versatz)), sum = w.reduce((a, b) => a + b, 0);
      const reg = [0, 1, 2].map((k) => teil.reduce((a, g, i) => a + g.reg[k] * w[i], 0) / sum);
      const q = teil.reduce((a, g, i) => a + g.q * w[i], 0) / sum;
      const gemessen = teil[w.indexOf(Math.max(...w))].midi;
      return { text: s.text, wort: s.wort || s.text, midi: Number.isFinite(s.midi) ? s.midi : gemessen, gemessen, q: rund(q, 2), sauber: stufeVon(q),
        reg: reg.map((v) => rund(v, 2)), register: REGISTER[reg.indexOf(Math.max(...reg))], angestrengt: teil.some((g) => g.angestrengt), vokal: vokalVon(s.text) };
    });
    const gem = ss.filter((s) => s.q != null);
    const hoechste = gem.length ? Math.max(...gem.map((s) => s.midi)) : null;
    return { zid: z.id, teil: z.teil, text: z.text, silben: ss, hoechste, gemessen: gem.length };
  });
  // Befunde: hohe Silben (oberes Drittel des Lieds), die unsauber/angestrengt sind oder in Misch/Kopf kippen
  const alleMidi = zOut.flatMap((z) => z.silben.filter((s) => s.q != null).map((s) => s.midi)).sort((a, b) => a - b);
  const oben = alleMidi.length ? alleMidi[Math.floor(0.6 * (alleMidi.length - 1))] : 99;
  const befunde = [];
  for (const z of zOut) {
    const hoch = z.silben.filter((s) => s.q != null && s.midi >= oben);
    if (!hoch.length) continue;
    const unsauber = hoch.filter((s) => s.q < 0.45), angestr = hoch.filter((s) => s.angestrengt), kopf = hoch.filter((s) => s.register !== 'Brust');
    const brustVorher = z.silben.some((s) => s.register === 'Brust' && s.q != null);
    if (!unsauber.length && !angestr.length && !kopf.length) continue;
    const woerter = [...new Set([...angestr, ...unsauber, ...kopf].map((s) => s.wort))].slice(0, 3);
    const top = hoch.reduce((a, b) => (b.midi > a.midi ? b : a));
    befunde.push({ zid: z.zid, text: z.text, woerter, midi: top.midi, name: N(top.midi), vokal: top.vokal,
      unsauber: unsauber.length > 0, angestrengt: angestr.length > 0, kippt: kopf.length > 0 && brustVorher, kopf: kopf.length > 0,
      gewicht: unsauber.length * 1.2 + angestr.length * 1.5 + kopf.length * 0.8 + (top.midi - oben) * 0.3 });
  }
  befunde.sort((a, b) => b.gewicht - a.gewicht);
  // Kipp-Punkt im Lied: tiefster Ton, auf dem Misch/Kopf überwiegt
  const misch = zOut.flatMap((z) => z.silben.filter((s) => s.q != null && s.midi >= oben && s.register !== 'Brust')).map((s) => s.midi);
  const kipp = misch.length ? Math.min(...misch) : null;
  // Tipps (konkret mit den Wörtern der schwierigsten Zeilen)
  const tipps = [];
  const b0 = befunde[0], zitat = (b) => `„${b.woerter.join(' … ')}“`;
  const mitAnstr = befunde.find((b) => b.angestrengt), mitUnsauber = befunde.find((b) => b.unsauber), mitKipp = befunde.find((b) => b.kippt);
  if (mitAnstr) tipps.push({ titel: 'Lautstärke zurücknehmen', uebung: 'messa-di-voce', zid: mitAnstr.zid, ziel: mitAnstr.midi,
    text: `Auf ${zitat(mitAnstr)} (${mitAnstr.name}) wirst du lauter und der Klang drückt. Sing die Zeile „${mitAnstr.text}“ zuerst nur halb so laut – die Höhe kommt leichter, wenn du nicht schiebst. Dann Schritt für Schritt wieder lauter, solange es leicht bleibt.` });
  if (mitUnsauber) tipps.push({ titel: 'Vokal-Ausgleich in der Höhe', uebung: 'register-ausgleich', zid: mitUnsauber.zid, ziel: mitUnsauber.midi,
    text: `Auf ${zitat(mitUnsauber)} (${mitUnsauber.name}) wird der Ton unruhiger. Mach dort den Vokal ${VOKAL_HOEHE[mitUnsauber.vokal] || 'etwas runder und höher im Kopf'} – der Kiefer öffnet nach unten, nicht in die Breite.` });
  if (mitKipp) tipps.push({ titel: 'Misch-Stimme mit „ng“', uebung: 'ng-sirene', zid: mitKipp.zid, ziel: mitKipp.midi,
    text: `In „${mitKipp.text}“ kippst du auf ${zitat(mitKipp)} vermutlich in die ${mitKipp.midi >= (kipp ?? 0) + 2 ? 'Kopfstimme' : 'Misch-/Kopfstimme'}. Sing die Melodie der Zeile erst auf „ng“, dann auf „nga“, dann mit Text – so bleibt die Verbindung ohne Bruch.` });
  if (b0) tipps.push({ titel: `Sirene bis ${b0.name}`, uebung: 'oktav-glissando', zid: b0.zid, ziel: b0.midi, sirene: true,
    text: `Gleite auf „u“ oder „ng“ von ${N(b0.midi - 7)} bis ${b0.name} (dem höchsten Ton auf ${zitat(b0)}) und zurück – leise, ohne anzuhalten. Danach die Zeile mit Text.` });
  if (befunde.length && kipp != null) tipps.push({ titel: 'Registerausgleich', uebung: 'register-ausgleich', zid: (mitKipp || b0).zid, ziel: kipp,
    text: `Dein Wechsel liegt in diesem Lied um ${N(kipp)}. Tonleiter auf „a“ durch ${N(kipp)} hindurch, oben nicht lauter werden – dann dieselbe Stelle mit den Wörtern ${zitat(mitKipp || b0)}.` });
  // Zusammenfassung in Worten
  const klarBis = (() => { const kl = zOut.flatMap((z) => z.silben.filter((s) => s.q != null && s.q >= 0.5 && s.register === 'Brust')).map((s) => s.midi); return kl.length ? Math.max(...kl) : null; })();
  const t = [];
  if (klarBis != null) t.push(`Bis ${N(klarBis)} klingt deine Stimme in diesem Lied klar in der Bruststimme.`);
  if (befunde.length) {
    const u = befunde.filter((b) => b.unsauber || b.angestrengt).slice(0, 2);
    if (u.length) t.push(`Unsauberer oder angestrengter wird es auf ${u.map((b) => `${zitat(b)} (${b.name})`).join(' und ')}.`);
    if (kipp != null) t.push(`Ab etwa ${N(kipp)} gehst du vermutlich in die Misch- oder Kopfstimme${mitKipp ? ` – zuerst auf ${zitat(mitKipp)}` : ''}.`);
  } else t.push('In der Höhe dieses Lieds bleibt dein Klang ruhig – keine auffälligen Stellen.');
  t.push('Eine Schätzung aus deiner Aufnahme – Tagesform und Mikrofon spielen mit.');
  return { zeilen: zOut, befunde: befunde.slice(0, 6), tipps, kipp, klarBis, versatz, text: t.join(' ') };
}

/** Kurzfassung für localStorage (nur Zeilen mit Befund + Tipps). */
export function liedHoeheKompakt(r) {
  if (!r) return null;
  const ids = new Set((r.befunde || []).map((b) => b.zid));
  return { ...r, zeilen: (r.zeilen || []).filter((z) => ids.has(z.zid)), datum: Date.now() };
}

// ---------------------------------------------------------------- Worker
let arbeiter = null, nr = 0;
const offen = new Map();
export function imHintergrund(x, sr, opt = {}) {
  const o = { ...opt }; delete o.fortschritt;
  if (!G.Worker || typeof document === 'undefined') return Promise.resolve().then(() => analysiere(x, sr, opt));
  try {
    if (!arbeiter) {
      arbeiter = new Worker(new URL('./stimmanalyse.js', import.meta.url), { type: 'module' });
      arbeiter.onmessage = (e) => {
        const p = offen.get(e.data.id); if (!p) return;
        if (e.data.stand != null) { if (p.fortschritt) p.fortschritt(e.data.stand); return; }
        offen.delete(e.data.id); e.data.ok ? p.res(e.data.r) : p.rej(new Error(e.data.fehler));
      };
      arbeiter.onerror = () => { for (const [, p] of offen) p.lokal(); offen.clear(); arbeiter = null; };
    }
    return new Promise((res, rej) => {
      const id = ++nr;
      offen.set(id, { res, rej, fortschritt: opt.fortschritt, lokal: () => { try { res(analysiere(x, sr, opt)); } catch (e) { rej(e); } } });
      arbeiter.postMessage({ id, x, sr, opt: o });
    });
  } catch (e) { return Promise.resolve().then(() => analysiere(x, sr, opt)); }
}
if (typeof G.WorkerGlobalScope !== 'undefined' && G.self instanceof G.WorkerGlobalScope && typeof document === 'undefined') {
  G.self.onmessage = (e) => {
    const { id, x, sr, opt = {} } = e.data || {};
    try { const r = analysiere(x, sr, { ...opt, fortschritt: (p) => G.self.postMessage({ id, stand: p }) }); G.self.postMessage({ id, ok: true, r }); }
    catch (err) { G.self.postMessage({ id, ok: false, fehler: String((err && err.message) || err) }); }
  };
}
export { hzZuMidi };
