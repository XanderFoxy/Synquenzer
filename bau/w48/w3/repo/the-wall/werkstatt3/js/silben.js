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
  const { H, F0 } = stimme(y, fs, M, laut, 4);
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
    let sth = 0; for (let j = m; j < m + ms(0.25) && j < n; j++) if (H[j] >= 0.6 && Ev[j] > ref - 30) sth++;
    if (sth < ms(0.03)) continue;
    kand.push({ m, wert, lvl, tal: Math.min(dL, dR) });
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
    res.push({ t0: r3(t0), t1: r3(Math.max(t1, t0 + 0.05)), kern: r3(off + M.t(k)), staerke: Math.round(staerke * 100) / 100, db: Math.round((Ev[k] - ref) * 10) / 10, hz, tal: Math.round(s.tal * 10) / 10 });
  }
  return res;
}

// ---------------------------------------------------------------- Text → Silben (Faustregel Englisch/Deutsch)

const VOK = 'aeiouäöüàáâèéêëìíîïòóôùúûæœ';
function istDeutsch(text) {
  const t = ' ' + String(text || '').toLowerCase().replace(/[^\p{L}]+/gu, ' ') + ' ';
  if (/[äöüß]/.test(t)) return true;
  let de = 0, en = 0;
  for (const w of t.split(' ')) {
    if (/^(der|die|das|und|ich|nicht|ist|du|wir|ein|eine|mit|auf|zu|sie|es|mich|dich|mein|dein|wie|was)$/.test(w)) de++;
    if (/^(the|and|you|is|we|it|to|of|my|your|me|i|in|a|on|that|this|what|can|be)$/.test(w)) en++;
  }
  return de > en;
}

// "Welcome" → ["Wel", "come"], "behind" → ["be", "hind"], "Liebe" → ["Lie", "be"] (deutsch)
export function silbenTeilen(wort, deutsch = false) {
  const roh = String(wort || '').replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
  if (!roh) return [];
  const w = roh.toLowerCase(), n = w.length, v = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const c = w[i];
    if (VOK.includes(c)) v[i] = 1;
    else if (c === 'y' && i > 0 && !(i + 1 < n && VOK.includes(w[i + 1]))) v[i] = 1;
  }
  const g = [];
  for (let i = 0; i < n; i++) if (v[i] && (i === 0 || !v[i - 1])) { let e = i; while (e + 1 < n && v[e + 1]) e++; g.push([i, e]); }
  if (!g.length) return [roh];
  if (!deutsch && g.length > 1) { // stummes e am Ende: make, wakes, hypnotised (nicht: little, wanted)
    const [a, e] = g[g.length - 1], rest = w.slice(e + 1), vor = w[a - 1] || '';
    if (a === e && w[a] === 'e' && (rest === '' || rest === 's' || (rest === 'd' && !/[td]/.test(vor))) && !(vor === 'l' && rest === '' && !VOK.includes(w[a - 2] || 'a')) && !VOK.includes(vor)) g.pop();
  }
  if (g.length === 1) return [roh];
  const schnitte = [];
  for (let q = 0; q + 1 < g.length; q++) {
    const a = g[q][1] + 1, b = g[q + 1][0], k = b - a; // Konsonanten zwischen zwei Vokalgruppen
    let s = k <= 1 ? a : a + 1;
    if (k >= 2 && /^(ch|ck|sh|th|ph|sch)/.test(w.slice(a, b)) && k <= 3) s = a;
    schnitte.push(s);
  }
  const out = []; let p = 0;
  for (const s of schnitte) { out.push(roh.slice(p, s)); p = s; }
  out.push(roh.slice(p));
  return out.filter(Boolean);
}

// ---------------------------------------------------------------- Ausrichtung Text ↔ erkannte Silben (DP)

// T: [{wi, text, zs (Zeilenanfang), erw (erwartete Zeit oder null)}], D: Silben. Ergebnis: paar[k] = j oder -1
function ausrichtenDP(T, D, freiRand) {
  const K = T.length, J = D.length, INF = 1e9;
  const pause = D.map((d, j) => (j === 0 ? 9 : d.t0 - D[j - 1].t1));
  const C = new Float64Array((K + 1) * (J + 1)).fill(INF), W = new Uint8Array((K + 1) * (J + 1));
  const ix = (k, j) => k * (J + 1) + j;
  const ueberD = j => 0.55 + 0.6 * (D[j].staerke || 0);
  const ueberT = () => 1.0;
  const passt = (k, j) => {
    let c = 0;
    const t = T[k];
    if (t.erw != null) c += 0.8 * Math.min(3, Math.abs(D[j].t0 - t.erw) / 0.3);
    if (t.zs === true && pause[j] < 0.25) c += 0.35;
    if (t.zs === false && pause[j] > 0.8) c += 0.35;
    return c;
  };
  C[0] = 0;
  for (let k = 0; k <= K; k++) for (let j = 0; j <= J; j++) {
    const i = ix(k, j); if (k === 0 && j === 0) continue;
    let best = INF, w = 0;
    if (k > 0 && j > 0) { const c = C[ix(k - 1, j - 1)] + passt(k - 1, j - 1); if (c < best) { best = c; w = 1; } }
    if (j > 0) { const c = C[ix(k, j - 1)] + ueberD(j - 1); if (c < best) { best = c; w = 2; } }
    if (k > 0) { const c = C[ix(k - 1, j)] + ((freiRand && (j === 0 || j === J)) ? 0.001 : ueberT()); if (c < best) { best = c; w = 3; } }
    C[i] = best; W[i] = w;
  }
  const paar = new Int32Array(K).fill(-1);
  let k = K, j = J;
  while (k > 0 || j > 0) {
    const w = W[ix(k, j)];
    if (w === 1) { paar[k - 1] = j - 1; k--; j--; } else if (w === 2) j--; else k--;
  }
  return paar;
}

// Wörter (mit Text) auf die Silben legen. quellWoerter: [{text, zeile?, start?, end?, p?}]
function zusammenbauen(quellWoerter, D, opt) {
  const deutsch = opt.deutsch;
  const T = [];
  quellWoerter.forEach((w, wi) => {
    let teile = silbenTeilen(w.text, deutsch);
    if (!teile.length) teile = [w.text];
    const zs = w.zeile != null ? (wi === 0 || quellWoerter[wi - 1].zeile !== w.zeile) : null;
    teile.forEach((tx, q) => {
      const erw = w.start != null ? w.start + (Math.max(w.end, w.start + 0.05) - w.start) * q / teile.length : null;
      T.push({ wi, text: tx, zs: q === 0 ? zs : (zs == null ? null : false), erw });
    });
  });
  const paar = ausrichtenDP(T, D, !!opt.freiRand);
  // erster/letzter getroffener Textteil (bei freiem Rand: Rest liegt außerhalb der Aufnahme)
  let k0 = 0, k1 = T.length - 1;
  if (opt.freiRand) { while (k0 < T.length && paar[k0] < 0) k0++; while (k1 >= 0 && paar[k1] < 0) k1--; }
  const benutzt = new Uint8Array(D.length);
  const silbe = (d, tx) => Object.assign({}, d, { text: tx });
  const proWort = new Map();
  for (let k = k0; k <= k1; k++) {
    const j = paar[k], t = T[k];
    if (!proWort.has(t.wi)) proWort.set(t.wi, []);
    if (j >= 0) { benutzt[j] = 1; proWort.get(t.wi).push(silbe(D[j], t.text)); continue; }
    // ausgelassener Textteil: Zeit schätzen zwischen den Nachbarn
    let a = k - 1; while (a >= k0 && paar[a] < 0) a--;
    let b = k + 1; while (b <= k1 && paar[b] < 0) b++;
    const ta = a >= k0 ? D[paar[a]].kern : (b <= k1 ? D[paar[b]].t0 - 0.3 : 0);
    const tb = b <= k1 ? D[paar[b]].t0 : ta + 0.4;
    const anz = b - a - 1, pos = k - a, t0 = ta + (tb - ta) * pos / (anz + 1);
    proWort.get(t.wi).push({ t0: r3(t0), t1: r3(Math.min(tb, t0 + (tb - ta) / (anz + 1))), kern: r3(t0), staerke: 0, db: null, hz: null, text: t.text, geschaetzt: true });
  }
  const out = [];
  for (const [wi, sl] of proWort) {
    if (!sl.length) continue;
    const w = quellWoerter[wi];
    out.push({ t0: sl[0].t0, t1: sl[sl.length - 1].t1, text: w.text, silben: sl, zeile: w.zeile != null ? w.zeile : null, quelle: opt.quelle, p: w.p != null ? w.p : null });
  }
  // übrige Silben: direkt hinter einem Wort ohne Pause → Dehnung (Melisma) dieses Worts, sonst eigener Kandidat ohne Text
  const lose = [];
  D.forEach((d, j) => { if (!benutzt[j]) lose.push(d); });
  for (const d of lose) {
    let vor = null; for (const w of out) if (w.t0 <= d.t0 && (!vor || w.t0 > vor.t0)) vor = w;
    const nachW = out.find(w => w.t0 > d.t0);
    if (vor && d.t0 - vor.t1 < 0.15 && d.t0 <= (nachW ? nachW.t0 : Infinity) && d.t0 > vor.t0) {
      vor.silben.push(silbe(d, '–')); vor.silben.sort((a, b) => a.t0 - b.t0); vor.t1 = Math.max(vor.t1, d.t1);
    } else out.push({ t0: d.t0, t1: d.t1, text: null, silben: [silbe(d, null)], zeile: null, quelle: 'silben', p: null });
  }
  out.sort((a, b) => a.t0 - b.t0);
  for (let i = 0; i + 1 < out.length; i++) if (out[i].t1 > out[i + 1].t0) out[i].t1 = out[i + 1].t0;
  zeilenSetzen(out, opt.quelle === 'text');
  return out;
}

// Zeilennummer: aus dem Text (falls vorhanden), sonst neue Zeile nach einer Pause ≥ 0,35 s
function zeilenSetzen(out, ausText) {
  let z = -1, letzte = null, alt = undefined;
  for (const w of out) {
    const neu = ausText && w.zeile != null ? w.zeile !== alt : (!letzte || w.t0 - letzte.t1 >= 0.35);
    if (ausText && w.zeile != null) alt = w.zeile;
    if (neu || z < 0) z++;
    w.zeile = z; letzte = w;
  }
}

// Ohne Text: Silben zu Wort-Kandidaten bündeln (gebunden = kein Konsonanten-Tal, keine Pause)
function kandidaten(D) {
  const out = [];
  for (const d of D) {
    const l = out[out.length - 1], vor = l && l.silben[l.silben.length - 1];
    const gebunden = vor && d.t0 - vor.t1 < 0.03 && (d.tal == null || d.tal < 4) && l.silben.length < 4;
    const s = Object.assign({}, d, { text: null });
    if (gebunden) { l.silben.push(s); l.t1 = d.t1; } else out.push({ t0: d.t0, t1: d.t1, text: null, silben: [s], zeile: null, quelle: 'silben', p: null });
  }
  zeilenSetzen(out, false);
  return out;
}

// ---------------------------------------------------------------- Sprachmodell (wie im Synquenzer: gleiches Modell, gleicher Cache)
// Whisper base mit Wort-Zeitstempeln, läuft lokal (WebAssembly oder WebGPU) in einem Worker.
// Dateien und Prüfsummen 1:1 aus dem Synquenzer (G9A), damit ein dort schon geladenes Modell
// hier ohne zweiten Download benutzt wird (gleiche Herkunft xanderfoxy.github.io → gleicher Cache).

const MODELL = {
  CACHE: 'synq-g9-asr-v1',
  NAME: 'onnx-community/whisper-base_timestamped', REV: '608c49e61301901684bc36cac8f74b95ff6b5a8e',
  HF: 'https://huggingface.co/',
  LIB: 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.1/dist/transformers.min.js',
  ORT: 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.31.0-dev.20260914-8d85527a0/dist/',
  RUHE: 180000
};
MODELL.DATEIEN = [
  ['lib', 586230, '8d6716d9086f57c30a4bf367dba61b887593573c770c454465e8019b2703e743', 'wg'],
  ['ort-wasm-simd-threaded.mjs', 24381, 'c57ca56328877353a575e51bbca6f18450027d6c9bf2307a2cb2c41363b4de9f', 'w'],
  ['ort-wasm-simd-threaded.wasm', 14264838, '06ba057753da3847e4c24f02d91ab133455b0817c69a44993a9a53a2146df9e3', 'w'],
  ['ort-wasm-simd-threaded.asyncify.mjs', 53057, '0966b6105cd936744498aa60df7a22cbd47af3374dbc64a9ab561c08a71e3611', 'g'],
  ['ort-wasm-simd-threaded.asyncify.wasm', 26861777, '49871f5a4409519797e127440868a6d1923339d9185907f301a5b2a1d90af082', 'g'],
  ['config.json', 2243, 'f4d0608f7d918166da7edb3e188de5ef1bfe70d9802e785d271fd88111e9cf4b', 'wg'],
  ['generation_config.json', 3832, '61070cf8de25b1e9256e8e102ded49d8d24a8369ed36ef84fdf21549e68125a0', 'wg'],
  ['preprocessor_config.json', 339, 'a6a76d28c93edb273669eb9e0b0636a2bddbb1272c3261e47b7ca6dfdbac1b8d', 'wg'],
  ['tokenizer.json', 2480466, '27fc476bfe7f17299480be2273fc0608e4d5a99aba2ab5dec5374b4482d1a566', 'wg'],
  ['tokenizer_config.json', 282682, '2e036e4dbacfdeb7242c7d4ec4149f4a16e86026048f94d1637e3a8ee9c6a573', 'wg'],
  ['onnx/encoder_model_quantized.onnx', 23159167, '2714484ebe1bae7c1646e8eadb768bb9d415cf11763466d21f23039a29c62e6f', 'w'],
  ['onnx/encoder_model_fp16.onnx', 41270731, '2d31aa4b0c8c74c2e49a5c8d8a5640e38e75aac493cf15290f8c1466ee8c1845', 'g'],
  ['onnx/decoder_model_merged_quantized.onnx', 53712708, 'cf9a8d5bcddc0917a0078135b484cedcaf44f28909cd91910abd29dced9171db', 'wg']
].map(([f, n, h, wege]) => ({ f, n, h, wege, u: f === 'lib' ? MODELL.LIB : f.startsWith('ort-') ? MODELL.ORT + f : MODELL.HF + MODELL.NAME + '/resolve/' + MODELL.REV + '/' + f }));
const satz = wie => MODELL.DATEIEN.filter(x => x.wege.includes(wie === 'webgpu' ? 'g' : 'w'));
const MB = n => Math.round(n / 1048576);

// Worker-Code (wird als Text in einen Blob gelegt). Ablauf wie im Synquenzer: laden (mit Prüfsumme in den Cache),
// starten (transformers.js aus dem Cache, Netz gesperrt), erkennen (Wort-Zeitstempel).
function workerHaupt() {
  let CA = null, T = null, P = null, WIE = null, SPR = null;
  const hex = b => Array.from(new Uint8Array(b), v => v.toString(16).padStart(2, '0')).join('');
  const cache = async name => CA || (CA = await caches.open(name));
  async function laden(m) {
    const ca = await cache(m.cache); let got = 0;
    const total = m.files.reduce((s, x) => s + x.n, 0);
    for (const x of m.files) {
      if (await ca.match(x.u)) { got += x.n; postMessage({ op: 'prog', id: m.id, got, total }); continue; }
      const r = await fetch(x.u, { credentials: 'omit' });
      if (!r.ok || !r.body) throw new Error('Laden fehlgeschlagen (' + r.status + '): ' + x.f);
      const buf = new Uint8Array(x.n), rd = r.body.getReader(); let o = 0, last = 0;
      for (;;) {
        const { done, value } = await rd.read(); if (done) break;
        if (o + value.length > x.n) throw new Error('Datei zu groß: ' + x.f);
        buf.set(value, o); o += value.length;
        const now = performance.now(); if (now - last > 200) { last = now; postMessage({ op: 'prog', id: m.id, got: got + o, total }); }
      }
      if (o !== x.n) throw new Error('Datei unvollständig: ' + x.f);
      if (hex(await crypto.subtle.digest('SHA-256', buf)) !== x.h) throw new Error('Prüfsumme falsch: ' + x.f);
      await ca.put(x.u, new Response(buf, { headers: { 'content-type': x.f.endsWith('.wasm') ? 'application/wasm' : x.f.endsWith('js') || x.f === 'lib' ? 'text/javascript' : 'application/octet-stream', 'content-length': String(x.n) } }));
      got += x.n; postMessage({ op: 'prog', id: m.id, got, total });
    }
    return { got, total };
  }
  async function blobVon(u, type) { const r = await CA.match(u); if (!r) throw new Error('fehlt im Cache: ' + u.split('/').pop()); return URL.createObjectURL(new Blob([await r.arrayBuffer()], { type })); }
  async function starten(m) {
    if (P && WIE === m.how) return { how: WIE };
    await cache(m.cache);
    if (!T) T = await import(await blobVon(m.lib, 'text/javascript'));
    const E = T.env;
    E.allowLocalModels = false; E.allowRemoteModels = true;
    E.fetch = async u => { throw new Error('nicht im Cache: ' + String(u).split('/').pop()); };
    E.remotePathTemplate = '{model}/resolve/' + m.rev + '/';
    E.useBrowserCache = false; E.useCustomCache = true; E.useWasmCache = false;
    E.customCache = { match: k => CA.match(k), put: async () => {} };
    const ow = E.backends.onnx.wasm, sfx = m.how === 'webgpu' ? '.asyncify' : '';
    ow.wasmPaths = { mjs: await blobVon(m.ort + 'ort-wasm-simd-threaded' + sfx + '.mjs', 'text/javascript'), wasm: await blobVon(m.ort + 'ort-wasm-simd-threaded' + sfx + '.wasm', 'application/wasm') };
    ow.numThreads = 1; ow.proxy = false;
    const o = m.how === 'webgpu'
      ? { revision: m.rev, device: { encoder_model: 'webgpu', decoder_model_merged: 'wasm' }, dtype: { encoder_model: 'fp16', decoder_model_merged: 'q8' } }
      : { revision: m.rev, device: 'wasm', dtype: { encoder_model: 'q8', decoder_model_merged: 'q8' } };
    if (P) { try { await P.dispose(); } catch (e) {} P = null; }
    P = await T.pipeline('automatic-speech-recognition', m.model, o);
    WIE = m.how;
    const g = P.model.generation_config || {};
    SPR = { sot: g.decoder_start_token_id || 50258, de: (g.lang_to_id || {})['<|de|>'] || 50261, en: (g.lang_to_id || {})['<|en|>'] || 50259 };
    return { how: WIE };
  }
  async function sprache(x) {
    const f = await P.processor(x);
    const ids = new T.Tensor('int64', BigInt64Array.from([BigInt(SPR.sot)]), [1, 1]);
    const out = await P.model({ input_features: f.input_features, decoder_input_ids: ids });
    const lg = out.logits, V = lg.dims[lg.dims.length - 1], d = lg.data, off = d.length - V;
    return Number(d[off + SPR.de]) >= Number(d[off + SPR.en]) ? 'de' : 'en';
  }
  async function erkennen(m) {
    const x = m.x, lang = m.lang === 'de' || m.lang === 'en' ? m.lang : await sprache(x);
    const r = await P(x, { return_timestamps: 'word', language: lang, task: 'transcribe', max_new_tokens: Math.min(440, Math.ceil(x.length / 16000 * 6) + 16) });
    const words = [];
    for (const c of (r && r.chunks) || []) {
      const t = String(c.text || '').trim(); if (!t) continue;
      const a = c.timestamp && isFinite(c.timestamp[0]) ? c.timestamp[0] : null; if (a == null) continue;
      const b = c.timestamp[1] != null && isFinite(c.timestamp[1]) && c.timestamp[1] > a ? c.timestamp[1] : a + 0.3;
      words.push({ text: t, start: a, end: b });
    }
    return { words, lang };
  }
  onmessage = async e => {
    const m = e.data;
    try {
      const r = m.op === 'load' ? await laden(m) : m.op === 'init' ? await starten(m) : m.op === 'run' ? await erkennen(m) : null;
      postMessage({ op: 'ok', id: m.id, r });
    } catch (err) { postMessage({ op: 'err', id: m.id, err: String((err && err.message) || err) }); }
  };
}

const MW = { w: null, q: new Map(), id: 0, ruheT: 0, wie: null, bereit: false };
function mwWorker() {
  if (MW.w) return MW.w;
  const u = URL.createObjectURL(new Blob(['(' + workerHaupt.toString() + ')();'], { type: 'text/javascript' }));
  const w = MW.w = new Worker(u, { type: 'module', name: 'silben-asr' });
  setTimeout(() => { try { URL.revokeObjectURL(u); } catch (e) {} }, 30000);
  MW.bereit = false;
  w.onmessage = e => {
    const m = e.data, q = MW.q.get(m.id); if (!q) return;
    if (m.op === 'prog') { if (q.prog) q.prog(m.got, m.total); return; }
    MW.q.delete(m.id); if (m.op === 'err') q.no(new Error(m.err)); else q.ok(m.r);
  };
  w.onerror = e => { try { e.preventDefault(); } catch (x) {} modellBeenden('Worker-Fehler'); };
  return w;
}
function mwRuf(op, o, prog, tr) {
  const w = mwWorker(); clearTimeout(MW.ruheT);
  return new Promise((ok, no) => {
    const id = ++MW.id; MW.q.set(id, { ok, no, prog });
    try { w.postMessage(Object.assign({ op, id }, o), tr || []); } catch (e) { MW.q.delete(id); no(e); }
  }).finally(() => { if (!MW.q.size) { clearTimeout(MW.ruheT); MW.ruheT = setTimeout(() => { if (!MW.q.size) modellBeenden('ruht'); }, MODELL.RUHE); } });
}
// Worker anhalten (gibt Speicher frei; das Modell bleibt im Cache)
export function modellBeenden(grund) {
  const w = MW.w; if (!w) return false;
  MW.w = null; MW.bereit = false; clearTimeout(MW.ruheT);
  try { w.terminate(); } catch (e) {}
  for (const q of MW.q.values()) q.no(new Error(grund || 'gestoppt'));
  MW.q.clear();
  return true;
}

function modellMoeglich() {
  try { return typeof Worker === 'function' && typeof WebAssembly === 'object' && typeof caches === 'object' && !!(globalThis.crypto && crypto.subtle); } catch (e) { return false; }
}
async function cacheStand() {
  const r = { have: new Set(), voll: { wasm: false, webgpu: false } };
  try {
    if (!(await caches.has(MODELL.CACHE))) return r;
    const ks = await (await caches.open(MODELL.CACHE)).keys(), alle = new Set(MODELL.DATEIEN.map(x => x.u));
    for (const k of ks) if (alle.has(k.url)) r.have.add(k.url);
    r.voll.wasm = satz('wasm').every(x => r.have.has(x.u)); r.voll.webgpu = satz('webgpu').every(x => r.have.has(x.u));
  } catch (e) {}
  return r;
}
async function wegWaehlen(st) {
  if (MW.wie) return MW.wie;
  let wie = 'wasm';
  try {
    let nurWasm = false; try { nurWasm = globalThis.localStorage && localStorage.getItem('synq-g9-asr-how') === 'wasm'; } catch (e) {}
    if (!nurWasm && globalThis.navigator && navigator.gpu) { const ad = await navigator.gpu.requestAdapter(); if (ad && ad.features && ad.features.has('shader-f16')) wie = 'webgpu'; }
  } catch (e) {}
  const ander = wie === 'webgpu' ? 'wasm' : 'webgpu';
  if (!st.voll[wie] && st.voll[ander]) wie = ander; // was schon da ist, wird benutzt
  return wie;
}

// Stand des Sprachmodells: {moeglich, da, wie, mb (noch zu laden), gesamtMb, cache}
export async function modellStatus() {
  if (!modellMoeglich()) return { moeglich: false, da: false, wie: null, mb: 0, gesamtMb: 0, cache: MODELL.CACHE };
  const st = await cacheStand(), wie = await wegWaehlen(st), s = satz(wie);
  const fehlt = s.filter(x => !st.have.has(x.u)).reduce((a, x) => a + x.n, 0);
  return { moeglich: true, da: fehlt === 0, wie, mb: MB(fehlt), gesamtMb: MB(s.reduce((a, x) => a + x.n, 0)), cache: MODELL.CACHE, modell: MODELL.NAME };
}

// Modell aus dem Cache löschen. Achtung: derselbe Cache wie im Synquenzer – dort ist es danach auch weg.
export async function modellEntfernen() {
  modellBeenden('entfernt');
  try { await caches.delete(MODELL.CACHE); } catch (e) {}
  MW.wie = null;
}

async function modellBereit(opt) {
  if (MW.bereit && MW.w) return MW.wie;
  const st = await cacheStand(), wie = await wegWaehlen(st), s = satz(wie);
  const fehlend = s.filter(x => !st.have.has(x.u)), mb = MB(fehlend.reduce((a, x) => a + x.n, 0));
  if (fehlend.length) {
    const info = { mb, gesamtMb: MB(s.reduce((a, x) => a + x.n, 0)), wie, modell: MODELL.NAME, quellen: ['huggingface.co', 'cdn.jsdelivr.net'] };
    const ja = typeof opt.zustimmung === 'function' ? await opt.zustimmung(info) : false;
    if (!ja) return null;
    try { if (globalThis.navigator && navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {}
    const total = s.reduce((a, x) => a + x.n, 0);
    await mwRuf('load', { cache: MODELL.CACHE, files: s.map(x => ({ u: x.u, n: x.n, h: x.h, f: x.f })) },
      (got, tot) => melde(opt, 0.6 * got / (tot || total), 'Sprachmodell lädt … ' + MB(got) + '/' + MB(tot) + ' MB'));
  }
  melde(opt, 0.62, 'Sprachmodell startet …');
  try { await mwRuf('init', { cache: MODELL.CACHE, how: wie, lib: MODELL.LIB, ort: MODELL.ORT, model: MODELL.NAME, rev: MODELL.REV }); }
  catch (e) {
    if (wie !== 'webgpu') throw e;
    modellBeenden('Weg'); MW.wie = 'wasm';   // WebGPU klappt nicht → WebAssembly
    return modellBereit(opt);
  }
  MW.wie = wie; MW.bereit = true;
  return wie;
}
function melde(opt, a, text) { try { if (typeof opt.fortschritt === 'function') opt.fortschritt(Math.max(0, Math.min(1, a)), text); } catch (e) {} }

// ---------------------------------------------------------------- Strom für das Modell: nur hörbare Strecken, 16 kHz, ≤ 30-s-Fenster

const KERN = (() => { // gefensterter Sinc, 16 Nullstellen je Seite, 256 Stützstellen je Nullstelle
  const Z = 16, R = 256, n = Z * R + 1, t = new Float32Array(n);
  for (let i = 0; i < n; i++) { const u = i / R, s = u === 0 ? 1 : Math.sin(Math.PI * u) / (Math.PI * u), w = 0.42 + 0.5 * Math.cos(Math.PI * u / Z) + 0.08 * Math.cos(2 * Math.PI * u / Z); t[i] = s * w; }
  return { Z, R, t };
})();
function zu16k(x, sr, a, b) {
  const FS = 16000, r = sr / FS, fc = Math.min(1, 1 / r) * 0.94, n = Math.max(0, Math.floor((b - a) / r)), y = new Float32Array(n);
  const hw = KERN.Z / fc, { R, t } = KERN, L = x.length;
  for (let j = 0; j < n; j++) {
    const c = a + j * r, k0 = Math.ceil(c - hw), k1 = Math.floor(c + hw);
    let s = 0;
    for (let k = k0; k <= k1; k++) {
      if (k < 0 || k >= L) continue;
      const u = Math.abs(k - c) * fc * R, i = u | 0; if (i + 1 >= t.length) continue;
      s += x[k] * (t[i] + (t[i + 1] - t[i]) * (u - i));
    }
    y[j] = s * fc;
  }
  return y;
}
function strom(x, sr, D) {
  const FS = 16000, dauer = x.length / sr, st = [];
  for (const d of D) {
    const a = Math.max(0, d.t0 - 0.25), b = Math.min(dauer, d.t1 + 0.25), l = st[st.length - 1];
    if (l && a - l.b < 0.6) l.b = Math.max(l.b, b); else st.push({ a, b });
  }
  // zu lange Strecken (> 28 s) an Silbengrenzen teilen
  const teile = [];
  for (const s of st) {
    let a = s.a;
    while (s.b - a > 28) {
      let c = a + 24; for (const d of D) if (d.t0 > a + 18 && d.t0 < a + 28) c = d.t0 - 0.05;
      teile.push({ a, b: c }); a = c;
    }
    teile.push({ a, b: s.b });
  }
  const LUECKE = 0.3, map = []; let tot = 0;
  for (const s of teile) { if (map.length) tot += LUECKE; map.push({ s0: tot, t0: s.a, len: s.b - s.a }); tot += s.b - s.a; }
  const y = new Float32Array(Math.ceil(tot * FS) + 1);
  for (const m of map) { const z = zu16k(x, sr, Math.floor(m.t0 * sr), Math.ceil((m.t0 + m.len) * sr)); y.set(z.subarray(0, Math.min(z.length, y.length - Math.round(m.s0 * FS))), Math.round(m.s0 * FS)); }
  // Hochpass 80 Hz, Spitze auf −3 dB
  const w = 2 * Math.PI * 80 / FS, cw = Math.cos(w), al = Math.sin(w) / Math.SQRT2, a0 = 1 + al;
  const b0 = (1 + cw) / 2 / a0, b1 = -(1 + cw) / a0, a1 = -2 * cw / a0, a2 = (1 - al) / a0;
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0, pk = 0;
  for (let i = 0; i < y.length; i++) { const v = y[i], o = b0 * v + b1 * x1 + b0 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = v; y2 = y1; y1 = o; y[i] = o; if (Math.abs(o) > pk) pk = Math.abs(o); }
  if (pk > 0) { const g = Math.pow(10, -3 / 20) / pk; for (let i = 0; i < y.length; i++) y[i] *= g; }
  // Fenster ≤ 30 s, geschnitten in den Lücken zwischen Strecken
  const fen = []; let w0 = 0;
  const gr = map.slice(1).map(m => m.s0 - LUECKE / 2);
  while (tot - w0 > 30) {
    let c = -1; for (const g of gr) if (g > w0 + 1 && g <= w0 + 30) c = g;
    if (c < 0) c = w0 + 30;
    fen.push({ a: w0, b: c }); w0 = c;
  }
  if (tot - w0 > 0.05) fen.push({ a: w0, b: tot });
  return { y, map, fen, FS };
}
function zurueckLegen(woerterJeFenster, S, D) {
  const out = [];
  S.fen.forEach((f, k) => {
    for (const x of woerterJeFenster[k] || []) {
      const s = f.a + Math.max(0, +x.start || 0), e = f.a + Math.max(+x.start || 0, +x.end || 0), mid = (s + Math.min(e, f.b)) / 2;
      const m = S.map.find(q => mid >= q.s0 - 1e-6 && mid <= q.s0 + q.len + 1e-6);
      if (!m) continue; // in der eingefügten Stille: erfunden
      const kl = v => Math.min(m.s0 + m.len, Math.max(m.s0, v));
      const start = m.t0 + kl(s) - m.s0, end = Math.max(start + 0.05, m.t0 + kl(e) - m.s0);
      if (!D.some(d => d.t1 > start - 0.05 && d.t0 < end + 0.05)) continue; // keine Silbe dort: erfunden
      out.push({ text: String(x.text).trim(), start, end });
    }
  });
  // Wiederholungsschleifen (typischer Fehler solcher Modelle) kürzen: mehr als 2 gleiche Folgen → 2
  const nw = w => String(w || '').toLowerCase().replace(/[^\p{L}\p{N}']/gu, '');
  let a = out, geaendert = true;
  while (geaendert) {
    geaendert = false;
    for (let L = 1; L * 3 <= a.length && !geaendert; L++) for (let i = 0; i + 3 * L <= a.length && !geaendert; i++) {
      const gleich = (p, q) => { for (let k = 0; k < L; k++) if (nw(a[p + k].text) !== nw(a[q + k].text)) return false; return true; };
      let r = 1; while (i + (r + 1) * L <= a.length && gleich(i, i + r * L)) r++;
      if (r > 2) { a = a.slice(0, i + 2 * L).concat(a.slice(i + r * L)); geaendert = true; }
    }
  }
  return a.filter(w => nw(w.text));
}

// ---------------------------------------------------------------- Wörter

// woerter(x, sr, opt) → [{t0, t1, text, silben:[…], zeile, quelle, p}]
//   opt.text        bekannter Songtext → wird ohne Modell auf die Silben gelegt (quelle 'text')
//   opt.modell      true → lokales Sprachmodell (nur mit opt.zustimmung, falls es erst geladen werden muss)
//   opt.zustimmung  async ({mb, gesamtMb, wie, modell, quellen}) → true/false
//   opt.sprache     'en' | 'de' | 'auto' (Standard: auto)
//   opt.fortschritt (anteil 0…1, text) → void
//   opt.silben      fertige Silbenliste (sonst wird silben(x, sr, opt) gerechnet)
// Das Ergebnis-Array trägt .quelle ('modell' | 'text' | 'silben') und .hinweis (Klartext für die Anzeige).
export async function woerter(x, sr, opt = {}) {
  const D = (opt.silben || silben(x, sr, opt)).slice().sort((a, b) => a.t0 - b.t0);
  const fertig = (arr, quelle, hinweis) => { arr.quelle = quelle; arr.hinweis = hinweis; return arr; };
  if (opt.text && String(opt.text).trim()) {
    const zeilen = String(opt.text).split(/\r?\n/).map(z => z.trim()).filter(Boolean), qw = [];
    zeilen.forEach((z, zi) => z.split(/\s+/).forEach(w => { if (w.replace(/[^\p{L}\p{N}]/gu, '')) qw.push({ text: w, zeile: zi }); }));
    const deutsch = opt.sprache === 'de' || (opt.sprache !== 'en' && istDeutsch(opt.text));
    const out = zusammenbauen(qw, D, { deutsch, quelle: 'text', freiRand: true });
    return fertig(out, 'text', 'Bekannter Text auf die erkannten Silben gelegt (ohne Sprachmodell). Unsichere Stellen: Silben mit geschaetzt=true oder text=null.');
  }
  if (opt.modell && D.length) {
    if (!modellMoeglich()) return fertig(kandidaten(D), 'silben', 'Wörter ohne Text: Dieser Browser kann das Sprachmodell nicht ausführen. Gruppiert nur nach Silben und Pausen.');
    const wie = await modellBereit(opt);
    if (!wie) return fertig(kandidaten(D), 'silben', 'Wörter ohne Text: Sprachmodell nicht geladen (keine Zustimmung). Gruppiert nur nach Silben und Pausen.');
    const S = strom(x, sr, D), jeFenster = [];
    let lang = opt.sprache === 'de' || opt.sprache === 'en' ? opt.sprache : null;
    for (let k = 0; k < S.fen.length; k++) {
      if (opt.signal && opt.signal.aborted) { modellBeenden('gestoppt'); throw new Error('gestoppt'); }
      melde(opt, 0.65 + 0.33 * k / S.fen.length, 'Wörter erkennen … ' + (k + 1) + '/' + S.fen.length);
      const f = S.fen[k], c = S.y.slice(Math.round(f.a * S.FS), Math.round(f.b * S.FS));
      const r = await mwRuf('run', { x: c, lang: lang || 'auto' }, null, [c.buffer]);
      if (!lang) lang = r && (r.lang === 'en' || r.lang === 'de') ? r.lang : 'en';
      jeFenster[k] = (r && r.words) || [];
    }
    const qw = zurueckLegen(jeFenster, S, D);
    melde(opt, 1, qw.length + ' Wörter erkannt');
    const out = zusammenbauen(qw, D, { deutsch: lang === 'de', quelle: 'modell', freiRand: false });
    return fertig(out, 'modell', 'Wörter vom lokalen Sprachmodell (' + MODELL.NAME + ', ' + (lang === 'de' ? 'deutsch' : 'englisch') + '), auf die erkannten Silben gelegt. Gesungener Text wird nicht immer richtig erkannt.');
  }
  return fertig(kandidaten(D), 'silben', 'Wörter ohne Text: nur aus Silben gebündelt (gebunden gesungen = ein Wort, Pause = neue Zeile). Für echten Text: opt.text oder opt.modell.');
}
