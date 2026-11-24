// Werkstatt 3 – silben.js
// Silben- und Worterkennung einer Gesangsaufnahme. Alles lokal im Browser: die Aufnahme verlässt nie das Gerät.
// Läuft im Hauptfaden und im Worker (kein window/document auf oberster Ebene).
//
// export function silben(x, sr, opt)  → [{t0, t1, kern, staerke, db, hz}]
// export async function woerter(x, sr, opt) → [{t0, t1, text, silben:[…], zeile, quelle, p}]
// (Beschreibung der Optionen: siehe SILBEN.md)

// ---------------------------------------------------------------- Grundbausteine

const fin = v => typeof v === 'number' && v === v && v < 1e30 && v > -1e30;
const r3 = v => Math.round(v * 1000) / 1000;
const klemm = (v, a, b) => (v < a ? a : v > b ? b : v);

// Tiefpass + Abwärtstastung auf ~16 kHz (ganzzahliger Faktor), danach Hochpass 80 Hz.
function vorbereiten(x, sr) {
  const D = Math.max(1, Math.floor(sr / 14000)), fs = sr / D;
  let y;
  if (D === 1) y = Float32Array.from(x);
  else {
    const T = 12 * D + 1, h = new Float64Array(T), c = (T - 1) / 2, fc = 0.46 / D;
    let s = 0;
    for (let k = 0; k < T; k++) {
      const t = k - c, si = t === 0 ? 2 * fc : Math.sin(2 * Math.PI * fc * t) / (Math.PI * t);
      const w = 0.42 - 0.5 * Math.cos(2 * Math.PI * k / (T - 1)) + 0.08 * Math.cos(4 * Math.PI * k / (T - 1));
      h[k] = si * w; s += h[k];
    }
    for (let k = 0; k < T; k++) h[k] /= s;
    // symmetrisches FIR: je zwei Abgriffe zusammenfassen
    const n = Math.floor(x.length / D), L = x.length; y = new Float32Array(n);
    const j0 = Math.ceil(c / D), j1 = Math.min(n - 1, Math.floor((L - T + c) / D)), hc = h[c];
    const rand = j => {
      const a = j * D - c; let acc = 0;
      for (let k = 0; k < T; k++) { const q = a + k; if (q >= 0 && q < L) acc += h[k] * x[q]; }
      return acc;
    };
    for (let j = 0; j < Math.min(j0, n); j++) y[j] = rand(j);
    for (let j = j0; j <= j1; j++) {
      const a = j * D - c, e = a + T - 1;
      let acc = hc * x[a + c];
      for (let k = 0; k < c; k++) acc += h[k] * (x[a + k] + x[e - k]);
      y[j] = acc;
    }
    for (let j = Math.max(j0, j1 + 1); j < n; j++) y[j] = rand(j);
    for (let j = 0; j < n; j++) if (!fin(y[j])) y[j] = 0;
  }
  // Hochpass 80 Hz (Biquad, Butterworth)
  const w = 2 * Math.PI * 80 / fs, cw = Math.cos(w), al = Math.sin(w) / Math.SQRT2, a0 = 1 + al;
  const b0 = (1 + cw) / 2 / a0, b1 = -(1 + cw) / a0, a1 = -2 * cw / a0, a2 = (1 - al) / a0;
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < y.length; i++) {
    const v = fin(y[i]) ? y[i] : 0, o = b0 * v + b1 * x1 + b0 * x2 - a1 * y1 - a2 * y2;
    x2 = x1; x1 = v; y2 = y1; y1 = o; y[i] = o;
  }
  return { y, fs };
}

const PLAENE = {};
function fftPlan(N) {
  if (PLAENE[N]) return PLAENE[N];
  const L = Math.round(Math.log2(N)), cos = new Float64Array(N / 2), sin = new Float64Array(N / 2), rev = new Uint32Array(N);
  for (let k = 0; k < N / 2; k++) { cos[k] = Math.cos(2 * Math.PI * k / N); sin[k] = Math.sin(2 * Math.PI * k / N); }
  for (let i = 0; i < N; i++) { let r = 0; for (let b = 0; b < L; b++) r |= ((i >> b) & 1) << (L - 1 - b); rev[i] = r; }
  return (PLAENE[N] = { N, cos, sin, rev });
}
function fft(P, re, im) {
  const { N, cos, sin, rev } = P;
  for (let i = 0; i < N; i++) {
    const j = rev[i];
    if (j > i) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; }
  }
  for (let size = 2; size <= N; size <<= 1) {
    const half = size >> 1, step = N / size;
    for (let i = 0; i < N; i += size) {
      for (let j = i, k = 0; j < i + half; j++, k += step) {
        const l = j + half, c = cos[k], s = sin[k];
        const tr = re[l] * c + im[l] * s, ti = im[l] * c - re[l] * s;
        re[l] = re[j] - tr; im[l] = im[j] - ti; re[j] += tr; im[j] += ti;
      }
    }
  }
}

// ---------------------------------------------------------------- Merkmale je Rahmen (5 ms)

function merkmale(y, fs) {
  const N = fs >= 12000 ? 512 : 256, hop = Math.max(1, Math.round(fs * 0.005)), H = N / 2 + 1;
  const nF = Math.max(0, Math.floor((y.length - N) / hop) + 1), df = fs / N;
  const P = fftPlan(N), win = new Float64Array(N);
  for (let i = 0; i < N; i++) win[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / N);
  // Frequenzbänder: 24 je Oktave (100 Hz … 7 kHz), dreieckig, doppelte entfernt
  const fmax = Math.min(7000, fs * 0.45), mid = [];
  for (let f = 100; f <= fmax; f *= Math.pow(2, 1 / 24)) { const b = Math.round(f / df); if (!mid.length || b > mid[mid.length - 1]) mid.push(b); }
  const B = mid.length - 2, bLo = new Int32Array(B), bAn = new Int32Array(B + 1), wl = [];
  for (let b = 0; b < B; b++) {
    const l = mid[b], c = mid[b + 1], h = mid[b + 2];
    bLo[b] = l; bAn[b] = wl.length;
    for (let k = l; k <= h; k++) wl.push(k < c ? (k - l) / Math.max(1, c - l) : k === c ? 1 : (h - k) / Math.max(1, h - c));
  }
  bAn[B] = wl.length; const W = Float64Array.from(wl);
  const bHoch = mid.findIndex(b => b * df >= 4000) - 1;
  const lam = Math.pow(10, 3.5) / (N / 4);
  const kv0 = Math.round(250 / df), kv1 = Math.min(H - 1, Math.round(3000 / df));
  const kh0 = Math.round(4000 / df), kh1 = Math.min(H - 1, Math.round(Math.min(7500, fs * 0.47) / df));
  const Ev = new Float32Array(nF), Eh = new Float32Array(nF);
  const SFv = new Float32Array(nF), SFh = new Float32Array(nF);
  const MU = 2, ring = []; for (let m = 0; m <= MU; m++) ring.push(new Float32Array(B));
  const re = new Float64Array(N), im = new Float64Array(N), magA = new Float64Array(H), magB = new Float64Array(H);
  const eins = (f, mag, pw) => {
    let sv = 0, sh = 0;
    for (let k = kv0; k <= kv1; k++) sv += pw[k];
    for (let k = kh0; k <= kh1; k++) sh += pw[k];
    Ev[f] = 10 * Math.log10(sv / N + 1e-14); Eh[f] = 10 * Math.log10(sh / N + 1e-14);
    const cur = ring[f % (MU + 1)], prv = ring[(f + 1) % (MU + 1)]; // prv = Rahmen f-MU
    for (let b = 0; b < B; b++) {
      let s = 0, k = bLo[b];
      for (let q = bAn[b], e = bAn[b + 1]; q < e; q++, k++) s += W[q] * mag[k];
      cur[b] = Math.log(1 + lam * s);
    }
    if (f >= MU) {
      let a = 0, c = 0;
      for (let b = 0; b < B; b++) {
        const ref = Math.max(prv[b], b > 0 ? prv[b - 1] : 0, b < B - 1 ? prv[b + 1] : 0), d = cur[b] - ref;
        if (d > 0) { if (b < bHoch) a += d; else c += d; }
      }
      SFv[f] = a; SFh[f] = c;
    }
  };
  const pwA = new Float64Array(H), pwB = new Float64Array(H);
  for (let f = 0; f < nF; f += 2) {
    const a = f * hop, b = (f + 1) * hop, zwei = f + 1 < nF;
    for (let i = 0; i < N; i++) { re[i] = y[a + i] * win[i]; im[i] = zwei ? y[b + i] * win[i] : 0; }
    fft(P, re, im);
    for (let k = 0; k < H; k++) {
      const k2 = (N - k) % N;
      const ar = (re[k] + re[k2]) / 2, ai = (im[k] - im[k2]) / 2;
      const br = (im[k] + im[k2]) / 2, bi = (re[k2] - re[k]) / 2;
      pwA[k] = ar * ar + ai * ai; pwB[k] = br * br + bi * bi;
      magA[k] = Math.sqrt(pwA[k]); magB[k] = Math.sqrt(pwB[k]);
    }
    eins(f, magA, pwA);
    if (zwei) eins(f + 1, magB, pwB);
  }
  return { N, hop, fs, nF, Ev, Eh, SFv, SFh, t: f => (f * hop + N / 2) / fs };
}

// Stimmhaftigkeit (normierte Autokorrelation) und Grundton je 10 ms; nur wo hörbar etwas ist
function stimme(y, fs, M, laut, S = 2) {
  const N = M.N, NF = 2 * N, hop = M.hop, nF = M.nF, P = fftPlan(NF);
  const H = new Float32Array(nF), F0 = new Float32Array(nF);
  const win = new Float64Array(N); for (let i = 0; i < N; i++) win[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / N);
  // Autokorrelation des Fensters (zur Normierung)
  const re = new Float64Array(NF), im = new Float64Array(NF);
  for (let i = 0; i < N; i++) re[i] = win[i];
  fft(P, re, im);
  for (let k = 0; k < NF; k++) { re[k] = re[k] * re[k] + im[k] * im[k]; im[k] = 0; }
  fft(P, re, im);
  const lo = Math.max(2, Math.floor(fs / 1000)), hi = Math.min(N - 2, Math.ceil(fs / 70));
  const wr = new Float64Array(hi + 2); for (let k = 0; k <= hi + 1; k++) wr[k] = re[k] / re[0];
  const rA = new Float64Array(hi + 2), rB = new Float64Array(hi + 2);
  const wert = (r, f) => {
    if (!(r[0] > 0)) return;
    let best = 0;
    const nr = k => r[k] / r[0] / wr[k];
    for (let k = lo; k <= hi; k++) { const v = nr(k); if (v > best) best = v; }
    let lag = -1;
    for (let k = lo; k <= hi; k++) { const v = nr(k); if (v >= 0.9 * best && v >= nr(k - 1) && v >= nr(k + 1)) { lag = k; break; } }
    H[f] = best;
    if (lag > 0) { const a = nr(lag - 1), b = nr(lag), c = nr(lag + 1), d = a - 2 * b + c; F0[f] = fs / (lag + (d < 0 ? 0.5 * (a - c) / d : 0)); }
  };
  // je zwei Rahmen in einer komplexen FFT; nur jeder S-te Rahmen, dazwischen linear
  const sel = []; for (let f = 0; f < nF; f += S) if (laut[f]) sel.push(f);
  for (let q = 0; q < sel.length; q += 2) {
    const fa = sel[q], fb = q + 1 < sel.length ? sel[q + 1] : -1;
    re.fill(0); im.fill(0);
    for (let i = 0; i < N; i++) { re[i] = y[fa * hop + i] * win[i]; if (fb >= 0) im[i] = y[fb * hop + i] * win[i]; }
    fft(P, re, im);
    for (let k = 0; k <= NF / 2; k++) {
      const k2 = (NF - k) % NF;
      const ar = (re[k] + re[k2]) / 2, ai = (im[k] - im[k2]) / 2, br = (im[k] + im[k2]) / 2, bi = (re[k2] - re[k]) / 2;
      const pa = ar * ar + ai * ai, pb = br * br + bi * bi;
      re[k] = pa; im[k] = pb; if (k2 !== k) { re[k2] = pa; im[k2] = pb; }
    }
    fft(P, re, im); // vorwärts statt rückwärts: bei reellen, geraden Spektren gleich (bis auf Faktor)
    for (let k = 0; k <= hi + 1; k++) { rA[k] = re[k]; rB[k] = im[k]; }
    wert(rA, fa); if (fb >= 0) wert(rB, fb);
  }
  for (let f = 0; f < nF; f++) {
    const r = f % S; if (!r) continue;
    const a = f - r, b = a + S < nF ? a + S : a, u = r / S;
    H[f] = H[a] + (H[b] - H[a]) * u; F0[f] = F0[a] && F0[b] ? F0[a] + (F0[b] - F0[a]) * u : 0;
  }
  return { H, F0 };
}

function perzentil(arr, p) {
  const s = Array.from(arr).filter(fin).sort((a, b) => a - b);
  return s.length ? s[Math.min(s.length - 1, Math.max(0, Math.floor(p * (s.length - 1))))] : 0;
}
function glatt(a, r) {
  const n = a.length, o = new Float32Array(n), c = new Float64Array(n + 1);
  for (let i = 0; i < n; i++) c[i + 1] = c[i] + a[i];
  for (let i = 0; i < n; i++) { const l = Math.max(0, i - r), h = Math.min(n, i + r + 1); o[i] = (c[h] - c[l]) / (h - l); }
  return o;
}
function median(a) { if (!a.length) return null; const s = a.slice().sort((u, v) => u - v); return s[s.length >> 1]; }

// ---------------------------------------------------------------- Silben

// Kandidaten: Gipfel der Einsatzfunktion (SuperFlux, vibratofest) und Täler der Vokal-Energie.
// Bewertung je Kandidat: Einsatzstärke, Tal-Tiefe (links/rechts), Lautstärke danach,
// Stimmhaftigkeit davor gegen Einbruch im Tal (Konsonant). Danach je 0,2 s nur der beste.
export function silben(x, sr, opt = {}) {
  if (!x || !x.length || !(sr > 0)) return [];
  const dauer = x.length / sr;
  const von = Math.max(0, +opt.von || 0), bis = Math.min(dauer, opt.bis != null ? +opt.bis : Infinity);
  if (!(bis > von)) return [];
  const rand = 0.35, a0 = Math.max(0, Math.floor((von - rand) * sr)), a1 = Math.min(x.length, Math.ceil((bis + rand) * sr));
  const off = a0 / sr;
  const { y, fs } = vorbereiten(x.subarray(a0, a1), sr);
  const M = merkmale(y, fs), n = M.nF;
  if (n < 20) return [];
  const ms = s => Math.max(1, Math.round(s / 0.005));
  const Ev = glatt(M.Ev, 2);
  const ref = opt.bezug != null ? +opt.bezug : perzentil(Ev, 0.99);
  const laut = new Uint8Array(n); for (let i = 0; i < n; i++) laut[i] = Ev[i] > ref - 45 ? 1 : 0;
  const { H, F0 } = stimme(y, fs, M, laut, opt._S || 4);
  const Hs = glatt(H, 1);
  const od = glatt(Float32Array.from(M.SFv, (v, i) => v + 0.5 * M.SFh[i]), 1);
  const akt = []; for (let i = 0; i < n; i++) if (Ev[i] > ref - 40) akt.push(od[i]);
  const odMed = perzentil(akt, 0.5) || 1e-6;
  // Kandidaten
  const ist = new Uint8Array(n);
  for (let i = 1; i < n - 1; i++) {
    const o = od[i] / odMed;
    if (o >= 1.5 && od[i] >= od[i - 1] && od[i] > od[i + 1]) ist[i] = 1;
    if (Ev[i] <= Ev[i - 1] && Ev[i] < Ev[i + 1]) ist[i] = 1;
  }
  const empf = klemm(opt.empfindlich != null ? +opt.empfindlich : 0.5, 0, 1);
  const schwelle = 3.5 - 3 * empf;
  const kand = [];
  const r30 = ms(0.03), r300 = ms(0.3), r200 = ms(0.2);
  for (let m = r300; m < n - r300; m++) {
    if (!ist[m]) continue;
    let emin = Infinity; for (let j = m - r30; j <= m + ms(0.01); j++) if (Ev[j] < emin) emin = Ev[j];
    let rmax = -Infinity; for (let j = m; j < m + r200; j++) if (Ev[j] > rmax) rmax = Ev[j];
    let lmax = -Infinity; for (let j = m - r300; j <= m; j++) if (Ev[j] > lmax) lmax = Ev[j];
    const lvl = rmax - ref; if (lvl < -35) continue;
    const dR = rmax - emin, dL = lmax - emin;
    let omax = 0; for (let j = m - ms(0.04); j <= m + ms(0.06); j++) if (od[j] > omax) omax = od[j];
    let hmin = Infinity; for (let j = m - r30; j <= m + r30; j++) if (Hs[j] < hmin) hmin = Hs[j];
    let hb = 0, nb = 0; for (let j = m - ms(0.12); j < m - ms(0.02); j++) { hb += H[j]; nb++; }
    hb /= Math.max(1, nb);
    const wert = 0.9 * Math.log(omax / odMed + 0.2) + 0.25 * Math.min(dR, 30) / 3 + 0.12 * Math.min(dL, 30) / 3 +
      0.5 * Math.max(lvl, -35) / 6 + 1.5 * (hb - hmin);
    if (wert < schwelle) continue;
    // es muss ein stimmhafter Kern folgen (Atmer, Klicks, Zischen allein zählen nicht)
    let sth = 0; for (let j = m; j < m + ms(0.25) && j < n; j++) if (H[j] >= (opt._hv || 0.7) && Ev[j] > ref - 30) sth++;
    if (sth < ms(opt._hd || 0.04)) continue;
    kand.push({ m, wert, lvl, dR });
  }
  // je Umgebung (Standard 0,2 s) nur der stärkste Kandidat
  const abst = ms(opt.minAbstand != null ? +opt.minAbstand : 0.2);
  const nach = kand.slice().sort((a, b) => b.wert - a.wert), belegt = [], gew = [];
  for (const k of nach) {
    let frei = true;
    for (const g of belegt) if (Math.abs(g - k.m) < abst) { frei = false; break; }
    if (frei) { belegt.push(k.m); gew.push(k); }
  }
  gew.sort((a, b) => a.m - b.m);
  // Grenzen, Kern, Tonhöhe
  const res = [];
  for (let q = 0; q < gew.length; q++) {
    const s = gew[q], nx = q + 1 < gew.length ? gew[q + 1].m : n;
    const t0 = off + M.t(s.m);
    if (t0 < von || t0 >= bis) continue;
    let k = s.m; for (let j = s.m; j < Math.min(nx, s.m + ms(0.35)); j++) if (Ev[j] > Ev[k]) k = j;
    // Ende: vor der nächsten Silbe; früher, wenn die Stimme 25 dB unter den Kern fällt oder 60 ms lang stimmlos ist
    let b = k, still = 0;
    for (let j = k + 1; j < nx; j++) {
      if (Ev[j] < Ev[k] - 25) break;
      still = H[j] < 0.45 ? still + 1 : 0;
      if (still > ms(0.06)) { b = j - still; break; }
      b = j;
    }
    const t1 = off + M.t(Math.min(b, nx - 1));
    let hz = null;
    const f0 = []; for (let j = k; j <= Math.min(b, k + ms(0.25)); j++) if (H[j] > 0.75 && F0[j] > 0) f0.push(F0[j]);
    if (f0.length >= 3) hz = Math.round(median(f0) * 10) / 10;
    const staerke = klemm((s.wert - schwelle) / 4 + 0.35, 0, 1);
    res.push({ t0: r3(t0), t1: r3(Math.max(t1, t0 + 0.05)), kern: r3(off + M.t(k)), staerke: Math.round(staerke * 100) / 100, db: Math.round((Ev[k] - ref) * 10) / 10, hz });
  }
  return res;
}
