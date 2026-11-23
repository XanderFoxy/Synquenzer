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
    const T = 16 * D + 1, h = new Float32Array(T), c = (T - 1) / 2, fc = 0.46 / D;
    let s = 0;
    for (let k = 0; k < T; k++) {
      const t = k - c, si = t === 0 ? 2 * fc : Math.sin(2 * Math.PI * fc * t) / (Math.PI * t);
      const w = 0.42 - 0.5 * Math.cos(2 * Math.PI * k / (T - 1)) + 0.08 * Math.cos(4 * Math.PI * k / (T - 1));
      h[k] = si * w; s += h[k];
    }
    for (let k = 0; k < T; k++) h[k] /= s;
    const n = Math.floor(x.length / D); y = new Float32Array(n);
    for (let j = 0; j < n; j++) {
      const a = j * D - c; let acc = 0;
      if (a >= 0 && a + T <= x.length) for (let k = 0; k < T; k++) acc += h[k] * x[a + k];
      else for (let k = 0; k < T; k++) { const q = a + k; if (q >= 0 && q < x.length) acc += h[k] * x[q]; }
      y[j] = fin(acc) ? acc : 0;
    }
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
  const B = mid.length - 2, bandLo = [], bandW = [];
  for (let b = 0; b < B; b++) {
    const l = mid[b], c = mid[b + 1], h = mid[b + 2], w = [];
    for (let k = l; k <= h; k++) w.push(k < c ? (k - l) / Math.max(1, c - l) : k === c ? 1 : (h - k) / Math.max(1, h - c));
    bandLo.push(l); bandW.push(Float64Array.from(w));
  }
  const bHoch = mid.findIndex(b => b * df >= 4000) - 1;
  const lam = Math.pow(10, 3.5) / (N / 4);
  const kv0 = Math.round(250 / df), kv1 = Math.min(H - 1, Math.round(3000 / df));
  const kh0 = Math.round(4000 / df), kh1 = Math.min(H - 1, Math.round(Math.min(7500, fs * 0.47) / df));
  const kf0 = Math.round(300 / df), kf1 = Math.min(H - 1, Math.round(4000 / df));
  const Ev = new Float32Array(nF), Eh = new Float32Array(nF), flach = new Float32Array(nF);
  const SFv = new Float32Array(nF), SFh = new Float32Array(nF);
  const MU = 2, ring = []; for (let m = 0; m <= MU; m++) ring.push(new Float32Array(B));
  const re = new Float64Array(N), im = new Float64Array(N), magA = new Float64Array(H), magB = new Float64Array(H);
  const eins = (f, mag, pw) => {
    let sv = 0, sh = 0, lg = 0, ar = 0;
    for (let k = kv0; k <= kv1; k++) sv += pw[k];
    for (let k = kh0; k <= kh1; k++) sh += pw[k];
    for (let k = kf0; k <= kf1; k++) { lg += Math.log(pw[k] + 1e-14); ar += pw[k]; }
    const nk = kf1 - kf0 + 1;
    Ev[f] = 10 * Math.log10(sv / N + 1e-14); Eh[f] = 10 * Math.log10(sh / N + 1e-14);
    flach[f] = Math.exp(lg / nk) / (ar / nk + 1e-14);
    const cur = ring[f % (MU + 1)], prv = ring[(f + 1) % (MU + 1)]; // prv = Rahmen f-MU
    for (let b = 0; b < B; b++) {
      const lo = bandLo[b], w = bandW[b]; let s = 0;
      for (let q = 0; q < w.length; q++) s += w[q] * mag[lo + q];
      cur[b] = Math.log10(1 + lam * s);
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
  return { N, hop, fs, nF, Ev, Eh, flach, SFv, SFh, t: f => (f * hop + N / 2) / fs };
}

// Grundton (YIN) an einer Stelle, für die Tonhöhe der Silbe
function yin(y, fs, mitte) {
  const W = Math.round(fs * 0.03), tMin = Math.floor(fs / 1100), tMax = Math.ceil(fs / 65);
  const a = Math.round(mitte - W / 2);
  if (a < 0 || a + W + tMax >= y.length) return null;
  const d = new Float64Array(tMax + 1);
  for (let tau = 1; tau <= tMax; tau++) { let s = 0; for (let i = 0; i < W; i++) { const e = y[a + i] - y[a + i + tau]; s += e * e; } d[tau] = s; }
  let run = 0, best = -1;
  for (let tau = 1; tau <= tMax; tau++) { run += d[tau]; d[tau] = run > 0 ? d[tau] * tau / run : 1; }
  for (let tau = tMin; tau <= tMax; tau++) if (d[tau] < 0.15) { while (tau + 1 <= tMax && d[tau + 1] < d[tau]) tau++; best = tau; break; }
  if (best < 0) { let m = 1; for (let tau = tMin; tau <= tMax; tau++) if (d[tau] < m) { m = d[tau]; best = tau; } if (m > 0.35) return null; }
  const x0 = d[best - 1], x1 = d[best], x2 = best + 1 <= tMax ? d[best + 1] : x1, den = x0 - 2 * x1 + x2;
  const tt = best + (den > 0 ? 0.5 * (x0 - x2) / den : 0);
  return { hz: fs / tt, ap: d[best] };
}

function perzentil(arr, p) {
  const s = Array.from(arr).filter(fin).sort((a, b) => a - b);
  return s.length ? s[Math.min(s.length - 1, Math.max(0, Math.floor(p * (s.length - 1))))] : 0;
}
function glatt(a, r) {
  const n = a.length, o = new Float32Array(n); let s = 0;
  const c = new Float64Array(n + 1); for (let i = 0; i < n; i++) c[i + 1] = c[i] + a[i];
  for (let i = 0; i < n; i++) { const l = Math.max(0, i - r), h = Math.min(n, i + r + 1); o[i] = (c[h] - c[l]) / (h - l); }
  return o;
}

// ---------------------------------------------------------------- Silben

export function silben(x, sr, opt = {}) {
  if (!x || !x.length || !(sr > 0)) return [];
  const von = Math.max(0, +opt.von || 0), bis = Math.min(x.length / sr, opt.bis != null ? +opt.bis : Infinity);
  if (!(bis > von)) return [];
  const pad = 0.1, a0 = Math.max(0, Math.floor((von - pad) * sr)), a1 = Math.min(x.length, Math.ceil((bis + pad) * sr));
  const off = a0 / sr;
  const { y, fs } = vorbereiten(x.subarray(a0, a1), sr);
  const M = merkmale(y, fs), n = M.nF;
  if (n < 10) return [];
  const empf = klemm(opt.empfindlich != null ? +opt.empfindlich : 0.5, 0, 1);
  const Ev = glatt(M.Ev, 2), Eh = glatt(M.Eh, 2), fl = glatt(M.flach, 2);
  const ref = perzentil(Ev, 0.99), boden = perzentil(Ev, 0.05);
  const ms = s => Math.max(1, Math.round(s / 0.005));
  // Einsatzfunktion: SuperFlux (Vokalband + halbes Höhenband)
  const odf = new Float32Array(n);
  for (let i = 0; i < n; i++) odf[i] = M.SFv[i] + 0.5 * M.SFh[i];
  const od = glatt(odf, 1);
  if (opt._frames) Object.assign(opt._frames, { off, t0: M.t(0), dt: M.hop / M.fs, Ev: Array.from(Ev), Eh: Array.from(Eh), fl: Array.from(fl), od: Array.from(od), sv: Array.from(M.SFv), sh: Array.from(M.SFh) });
  const aktiv = []; for (let i = 0; i < n; i++) if (Ev[i] > ref - 40 && Ev[i] > boden + 10) aktiv.push(od[i]);
  const odMed = perzentil(aktiv, 0.5) || 1e-6;
  const delta = odMed * (1.6 - 1.2 * empf);
  const preMax = ms(0.03), postMax = ms(0.03), preAvg = ms(0.1), postAvg = ms(0.07), kombi = ms(+opt.minAbstand || 0.09);
  const kand = [];
  const cs = new Float64Array(n + 1); for (let i = 0; i < n; i++) cs[i + 1] = cs[i] + od[i];
  for (let i = 1; i < n - 1; i++) {
    const v = od[i]; if (v <= 0) continue;
    let ok = true;
    for (let j = Math.max(0, i - preMax); j <= Math.min(n - 1, i + postMax); j++) if (od[j] > v) { ok = false; break; }
    if (!ok) continue;
    const l = Math.max(0, i - preAvg), h = Math.min(n, i + postAvg + 1), mean = (cs[h] - cs[l]) / (h - l);
    if (v < mean + delta) continue;
    kand.push(i);
  }
  // Prüfen: folgt ein stimmhafter, lauter Vokal-Kern?
  const out = [];
  for (let c = 0; c < kand.length; c++) {
    const i = kand[c], nx = c + 1 < kand.length ? kand[c + 1] : n;
    const e = Math.min(n - 1, i + ms(0.25), nx - 1);
    let k = i; for (let j = i; j <= e; j++) if (Ev[j] > Ev[k]) k = j;
    if (Ev[k] < ref - 32 || Ev[k] < boden + 12) continue;
    if (fl[k] > 0.3) continue;
    if (Eh[k] - Ev[k] > -3) continue;
    let mn = Ev[i]; for (let j = Math.max(0, i - ms(0.06)); j <= i; j++) mn = Math.min(mn, Ev[j]);
    const hub = Ev[k] - mn;
    const st = od[i] / (odMed * 4);
    if (opt._diag) { // Untersuchung
      let vor = -200; for (let j = Math.max(0, i - ms(0.2)); j <= Math.max(0, i - ms(0.03)); j++) vor = Math.max(vor, Ev[j]);
      let flmin = 1; for (let j = Math.max(0, i - ms(0.06)); j <= i; j++) flmin = Math.min(flmin, fl[j]);
      let ehmax = -200; for (let j = Math.max(0, i - ms(0.04)); j <= i + ms(0.02) && j < n; j++) ehmax = Math.max(ehmax, Eh[j] - Ev[j]);
      opt._diag.push({ t: off + M.t(i), od: od[i] / odMed, hub, tal: vor - mn, db: Ev[k] - ref, fl: fl[k], flmin, ehmax, sv: M.SFv[i] / odMed, sh: M.SFh[i] / odMed });
    }
    if (hub < 1.5 && st < 1) continue;
    out.push({ i, k, hub, st });
  }
  // zu nahe Einsätze zusammenfassen
  const sil = [];
  for (const s of out) {
    const l = sil[sil.length - 1];
    if (l && s.i - l.i < kombi) { if (od[s.i] > od[l.i]) sil[sil.length - 1] = s; continue; }
    sil.push(s);
  }
  // Grenzen
  const res = [];
  for (let q = 0; q < sil.length; q++) {
    const s = sil[q], nx = q + 1 < sil.length ? sil[q + 1].i : n;
    // Anfang: vom Gipfel der Einsatzfunktion zurück bis zum Fuß des Anstiegs
    let a = s.i; const pk = od[s.i];
    while (a > 0 && s.i - a < ms(0.04) && od[a - 1] > 0.25 * pk && od[a - 1] <= od[a]) a--;
    // Ende: Stimme fällt 25 dB unter den Kern oder nächste Silbe
    let b = s.k; while (b + 1 < nx && Ev[b + 1] > Ev[s.k] - 25 && fl[b + 1] < 0.45) b++;
    const t0 = off + M.t(a), t1 = off + Math.min(M.t(b), nx < n ? M.t(nx) : M.t(n - 1)), kern = off + M.t(s.k);
    if (t0 < von || t0 > bis) continue;
    let hz = null;
    if (opt.tonhoehe !== false) {
      const p = [];
      for (const dt of [0, 0.04, 0.08]) { const tt = M.t(s.k) + dt; if (tt < M.t(b)) { const r = yin(y, fs, tt * fs); if (r) p.push(r.hz); } }
      if (p.length) { p.sort((u, v) => u - v); hz = Math.round(p[p.length >> 1] * 10) / 10; }
    }
    const db = Ev[s.k] - ref;
    const staerke = klemm(0.5 * klemm(s.st, 0, 1) + 0.25 * klemm(s.hub / 6, 0, 1) + 0.25 * klemm(1 + db / 30, 0, 1), 0, 1);
    res.push({ t0: r3(t0), t1: r3(Math.max(t1, t0 + 0.03)), kern: r3(kern), staerke: Math.round(staerke * 100) / 100, db: Math.round(db * 10) / 10, hz });
  }
  return res;
}
