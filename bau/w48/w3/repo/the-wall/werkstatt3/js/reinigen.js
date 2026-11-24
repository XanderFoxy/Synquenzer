// Werkstatt 3 – reinigen.js
// Automatische Vocal-Reinigung, komplett lokal im Browser (keine Bibliotheken, kein Netz).
// Reihenfolge: klicks → brumm → rauschen → schmatzer → atmer → ausgleich
//
//   import { reinigen } from './reinigen.js';
//   const { y, bericht } = reinigen(x, sr, { rauschen: { staerke: 0.7 }, atmer: false, fortschritt: (schritt, prozent) => … });
//
// opt[schritt] darf sein: true/false (an/aus), Zahl 0–1 (Stärke) oder { an, staerke }.
// x bleibt unverändert; y ist eine neue Float32Array gleicher Länge (keine Zeitverschiebung).

const EPS = 1e-12;

export const STANDARD = {
  klicks:    { an: true, staerke: 0.6 },
  brumm:     { an: true, staerke: 1.0 },
  rauschen:  { an: true, staerke: 0.6 },
  schmatzer: { an: true, staerke: 0.6 },
  atmer:     { an: true, staerke: 0.5 },   // 0.5 → −6 dB (Stärke 1 → −12 dB), nie gelöscht
  ausgleich: { an: true, staerke: 0.6 },
};

export const SCHRITTE = ['klicks', 'brumm', 'rauschen', 'schmatzer', 'atmer', 'ausgleich'];
const GEWICHT = { klicks: 0.14, brumm: 0.08, rauschen: 0.5, schmatzer: 0.1, atmer: 0.06, ausgleich: 0.12 };

const jetzt = () => (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now());
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const dbP = (p) => 10 * Math.log10(p + EPS);           // Leistung → dB
const r1 = (v) => Math.round(v * 10) / 10;

function teil(opt, k) {
  const d = STANDARD[k], v = opt ? opt[k] : undefined;
  if (v === undefined) return { ...d };
  if (v === false || v === null) return { ...d, an: false };
  if (v === true) return { ...d, an: true };
  if (typeof v === 'number') return { ...d, an: v > 0, staerke: clamp(v, 0, 1) };
  return { ...d, ...v, an: v.an !== false, staerke: clamp(v.staerke ?? d.staerke, 0, 1) };
}

export function reinigen(x, sr, opt = {}) {
  const t0 = jetzt();
  const melde = typeof opt.fortschritt === 'function' ? opt.fortschritt : (typeof opt.stand === 'function' ? opt.stand : null);
  const y = new Float32Array(x.length);
  for (let i = 0; i < x.length; i++) { const v = x[i]; y[i] = Number.isFinite(v) ? v : 0; }
  const bericht = {}, ctx = { atem: [] };
  let fertig = 0;
  for (const s of SCHRITTE) {
    const st = teil(opt, s);
    const ts = jetzt();
    const sub = melde ? (p) => melde(s, Math.round(100 * (fertig + GEWICHT[s] * clamp(p, 0, 1)))) : () => {};
    sub(0);
    if (!st.an || st.staerke <= 0 || y.length < sr * 0.1) {
      bericht[s] = { an: false, anzahl: 0, db: 0 };
    } else {
      try { bericht[s] = { an: true, staerke: st.staerke, ...FUNK[s](y, sr, st, sub, ctx) }; }
      catch (e) { bericht[s] = { an: true, fehler: String((e && e.message) || e), anzahl: 0, db: 0 }; }
    }
    bericht[s].ms = Math.round(jetzt() - ts);
    fertig += GEWICHT[s];
  }
  for (let i = 0; i < y.length; i++) if (!Number.isFinite(y[i])) y[i] = 0;
  const ms = jetzt() - t0;
  bericht.gesamt = { ms: Math.round(ms), sekunden: r1(x.length / sr), msProMinute: Math.round(ms / Math.max(1e-6, x.length / sr / 60)) };
  if (melde) melde('fertig', 100);
  return { y, bericht };
}

// ───────────────────────── Grundbausteine ─────────────────────────

const plaene = new Map();
function fftPlan(n) {
  let p = plaene.get(n);
  if (p) return p;
  const lv = Math.round(Math.log2(n));
  const rev = new Uint32Array(n);
  for (let i = 0; i < n; i++) { let r = 0, v = i; for (let j = 0; j < lv; j++) { r = (r << 1) | (v & 1); v >>= 1; } rev[i] = r; }
  const c = new Float64Array(n >> 1), s = new Float64Array(n >> 1);
  for (let i = 0; i < n >> 1; i++) { c[i] = Math.cos(2 * Math.PI * i / n); s[i] = Math.sin(2 * Math.PI * i / n); }
  p = { n, rev, c, s };
  plaene.set(n, p);
  return p;
}

// In-place komplexe FFT (ohne 1/N). inverse=true → e^{+i…}
function fft(re, im, p, inverse) {
  const { n, rev, c, s } = p;
  for (let i = 0; i < n; i++) {
    const j = rev[i];
    if (j > i) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; }
  }
  const sg = inverse ? 1 : -1;
  for (let size = 2; size <= n; size <<= 1) {
    const half = size >> 1, step = n / size;
    for (let j = 0, k = 0; j < half; j++, k += step) {
      const wr = c[k], wi = sg * s[k];
      for (let a = j; a < n; a += size) {
        const b = a + half;
        const tr = re[b] * wr - im[b] * wi, ti = re[b] * wi + im[b] * wr;
        re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti;
      }
    }
  }
}

const hannCache = new Map();
function hann(n) {
  let w = hannCache.get(n);
  if (!w) { w = new Float64Array(n); for (let i = 0; i < n; i++) w[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / n); hannCache.set(n, w); }
  return w;
}

// RBJ-Biquad → [b0,b1,b2,a1,a2]
function koeff(typ, f, q, sr) {
  const w = 2 * Math.PI * Math.min(f, sr * 0.49) / sr, c = Math.cos(w), al = Math.sin(w) / (2 * q);
  const a0 = 1 + al;
  let b0, b1, b2;
  if (typ === 'hp') { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = (1 + c) / 2; }
  else if (typ === 'lp') { b0 = (1 - c) / 2; b1 = 1 - c; b2 = (1 - c) / 2; }
  else { b0 = 1; b1 = -2 * c; b2 = 1; } // notch
  return [b0 / a0, b1 / a0, b2 / a0, -2 * c / a0, (1 - al) / a0];
}

function filtereInPlace(x, k, von = 0, bis = x.length) {
  const b0 = k[0], b1 = k[1], b2 = k[2], a1 = k[3], a2 = k[4];
  let z1 = 0, z2 = 0;
  for (let i = von; i < bis; i++) { const v = x[i]; const o = b0 * v + z1; z1 = b1 * v - a1 * o + z2; z2 = b2 * v - a2 * o; x[i] = o; }
}
function rueckwaerts(x) { for (let i = 0, j = x.length - 1; i < j; i++, j--) { const t = x[i]; x[i] = x[j]; x[j] = t; } }
// Nullphasiges Filtern eines (kurzen) Stücks
function filtfilt(seg, k) { filtereInPlace(seg, k); rueckwaerts(seg); filtereInPlace(seg, k); rueckwaerts(seg); return seg; }

function perzentil(arr, q) {
  if (!arr.length) return 0;
  const s = Float64Array.from(arr).sort();
  return s[clamp(Math.floor(q * (s.length - 1)), 0, s.length - 1)];
}
function median(arr) { return perzentil(arr, 0.5); }

function autokorr(seg, n, p, r) {
  for (let k = 0; k <= p; k++) { let s = 0; for (let i = k; i < n; i++) s += seg[i] * seg[i - k]; r[k] = s; }
}
// Levinson-Durbin: a[0]=1, Vorhersagefehler e[n] = Σ a[k] x[n-k]
function levinson(r, p, a, tmp) {
  a.fill(0); a[0] = 1;
  let err = r[0];
  if (!(err > 0)) return 0;
  for (let i = 1; i <= p; i++) {
    let acc = r[i];
    for (let j = 1; j < i; j++) acc += a[j] * r[i - j];
    const k = -acc / err;
    for (let j = 0; j <= i; j++) tmp[j] = a[j];
    for (let j = 1; j < i; j++) a[j] = tmp[j] + k * tmp[i - j];
    a[i] = k;
    err *= 1 - k * k;
    if (!(err > 0)) break;
  }
  return err;
}

// Mittlere Energie je Block
function blockEnergie(x, bs) {
  const nb = Math.ceil(x.length / bs), e = new Float64Array(nb);
  for (let j = 0; j < nb; j++) {
    const a = j * bs, b = Math.min(x.length, a + bs);
    let s = 0;
    for (let i = a; i < b; i++) { const v = x[i]; s += v * v; }
    e[j] = s / Math.max(1, b - a);
  }
  return e;
}

// ───────────────────────── 1. Klicks ─────────────────────────
// AR-Vorhersagefehler (Ordnung 20, Blöcke ~43 ms). Ein Klick = kurzer Ausreißer im Fehler,
// deutlich über der Umgebung (RMS UND Maximum, 3–12 ms links/rechts) → Glottis-Pulse und
// Konsonanten (wiederkehrend bzw. länger) bleiben unberührt. Reparatur: AR-Extrapolation
// vorwärts + rückwärts, mit sin²-Überblendung.

function klicks(y, sr, st, sub) {
  const len = y.length, p = 20, s = st.staerke;
  const B = Math.max(512, Math.round(sr * 0.0427)), W = 2 * B, win = hann(W);
  const e = new Float32Array(len), seg = new Float64Array(W);
  const a = new Float64Array(p + 1), r = new Float64Array(p + 1), tmp = new Float64Array(p + 1);
  for (let b0 = 0; b0 < len; b0 += B) {
    const s0 = b0 + (B >> 1) - (W >> 1);
    for (let i = 0; i < W; i++) { const j = s0 + i; seg[i] = (j >= 0 && j < len ? y[j] : 0) * win[i]; }
    autokorr(seg, W, p, r);
    r[0] = r[0] * (1 + 1e-6) + 1e-14;
    levinson(r, p, a, tmp);
    const b1 = Math.min(len, b0 + B);
    for (let n = b0; n < b1; n++) {
      let acc = y[n];
      const km = n < p ? n : p;
      for (let k = 1; k <= km; k++) acc += a[k] * y[n - k];
      e[n] = acc;
    }
    if ((b0 / B) % 200 === 0) sub(0.7 * b0 / len);
  }
  const bs = Math.max(8, Math.round(sr / 1000)), nb = Math.ceil(len / bs);
  const be = new Float64Array(nb), bm = new Float32Array(nb);
  for (let j = 0; j < nb; j++) {
    const a0 = j * bs, a1 = Math.min(len, a0 + bs);
    let sm = 0, mx = 0;
    for (let i = a0; i < a1; i++) { const v = e[i], av = v < 0 ? -v : v; sm += v * v; if (av > mx) mx = av; }
    be[j] = sm; bm[j] = mx;
  }
  const K = 14 - 6 * s, K2 = 3.4 - 1.4 * s;            // Std: K≈10.4, K2≈2.6
  const maxLen = Math.round(sr * 0.001 * (1 + 1.5 * s));  // Std: ~1.9 ms
  const nah = 3, weit = 12;
  let anzahl = 0, summeLen = 0;
  const umgebung = (j) => {
    let sm = 0, cnt = 0, mx = 0;
    for (let q = j - weit; q <= j + weit; q++) {
      if (q < 0 || q >= nb || (q > j - nah && q < j + nah)) continue;
      sm += be[q]; cnt += bs; if (bm[q] > mx) mx = bm[q];
    }
    return { sigma: Math.sqrt(sm / Math.max(1, cnt)), mx };
  };
  for (let j = 1; j < nb - 1; j++) {
    const pk = bm[j];
    if (pk < 1e-4 || pk < bm[j - 1] || pk < bm[j + 1]) continue;
    const u = umgebung(j);
    const thr = Math.max(K * u.sigma, K2 * u.mx);
    if (pk <= thr) continue;
    // Lauf bestimmen
    const halb = Math.max(thr * 0.5, pk * 0.12);
    const v0 = Math.max(0, (j - 1) * bs), v1 = Math.min(len, (j + 2) * bs);
    let f = -1, l = -1;
    for (let n = v0; n < v1; n++) { const av = Math.abs(e[n]); if (av > halb) { if (f < 0) f = n; l = n; } }
    if (f < 0) continue;
    // Der Fehler „klingt“ bis zu p Samples nach – das gehört zum selben Klick
    const g0 = Math.max(p + 2, f - 2), g1 = Math.min(len - p - 3, l + 2);
    const m = g1 - g0 + 1;
    if (m < 1 || m > maxLen + p) continue;
    if (!reparieren(y, g0, g1, sr)) continue;
    anzahl++; summeLen += m;
    j = Math.ceil((g1 + 1) / bs) + 1;
  }
  sub(1);
  return { anzahl, db: 0, mittlereLaengeMs: anzahl ? r1(1000 * summeLen / anzahl / sr) : 0 };
}

// AR-Interpolation einer Lücke [g0, g1] (inklusive)
function reparieren(y, g0, g1, sr) {
  const len = y.length, m = g1 - g0 + 1;
  const ctx = Math.min(Math.max(256, 4 * m, Math.round(sr * 0.006)), 2048);
  const l0 = Math.max(0, g0 - ctx), r0 = g1 + 1, r1e = Math.min(len, g1 + 1 + ctx);
  const nl = g0 - l0, nr = r1e - r0;
  const p = Math.min(32, Math.floor(Math.min(nl, nr) / 3));
  if (p < 4) return false;
  const r = new Float64Array(p + 1), rr = new Float64Array(p + 1), a = new Float64Array(p + 1), tmp = new Float64Array(p + 1);
  const L = new Float64Array(nl), R = new Float64Array(nr);
  const wl = hann(nl), wr = hann(nr);
  for (let i = 0; i < nl; i++) L[i] = y[l0 + i] * wl[i];
  for (let i = 0; i < nr; i++) R[i] = y[r0 + i] * wr[i];
  autokorr(L, nl, p, r); autokorr(R, nr, p, rr);
  for (let k = 0; k <= p; k++) r[k] += rr[k];
  r[0] = r[0] * (1 + 1e-4) + 1e-14;
  levinson(r, p, a, tmp);
  // vorwärts
  const fw = new Float64Array(p + m);
  for (let i = 0; i < p; i++) fw[i] = y[g0 - p + i];
  for (let i = p; i < p + m; i++) { let s = 0; for (let k = 1; k <= p; k++) s -= a[k] * fw[i - k]; fw[i] = s; }
  // rückwärts (gleiche Koeffizienten, gespiegelte Zeit)
  const bw = new Float64Array(p + m);
  for (let i = 0; i < p; i++) bw[i] = y[g1 + p - i];
  for (let i = p; i < p + m; i++) { let s = 0; for (let k = 1; k <= p; k++) s -= a[k] * bw[i - k]; bw[i] = s; }
  for (let i = 0; i < m; i++) {
    const w = Math.sin(0.5 * Math.PI * (i + 1) / (m + 1)) ** 2;
    const v = (1 - w) * fw[p + i] + w * bw[p + m - 1 - i];
    y[g0 + i] = Number.isFinite(v) ? v : 0;
  }
  return true;
}

// ───────────────────────── 2. Brummen ─────────────────────────
// Langzeitspektrum der leisesten (nicht stillen) Stellen, ~0,7 Hz Auflösung. 50 vs. 60 Hz +
// Obertöne (bis 3 kHz) über Abstand zum Nachbarschafts-Median erkannt, Grundfrequenz fein
// geschätzt, dann schmale Kerbfilter (≈1,6–3 Hz breit) nur auf den wirklich vorhandenen Obertönen.

function brumm(y, sr, st, sub) {
  const len = y.length;
  let N = 1 << Math.ceil(Math.log2(sr * 0.6));
  while (N > 8192 && N > len) N >>= 1;
  if (len < N) return { anzahl: 0, db: 0, hz: 0, hinweis: 'zu kurz' };
  const starts = ruhigeSegmente(y, N, 12);
  const P = spektrum(y, N, starts, true);
  sub(0.3);
  const df = sr / N;
  const ana = [50, 60].map((b) => harmonische(P, df, b, sr));
  const score = (h) => h.slice(0, 8).reduce((s, o) => s + Math.max(0, o.prom - 6), 0);
  const best = score(ana[0]) >= score(ana[1]) ? 0 : 1;
  const hs = ana[best];
  const stark = hs.slice(0, 6).some((o) => o.prom >= 10) || hs.slice(0, 8).filter((o) => o.prom >= 8).length >= 2;
  if (!stark) return { anzahl: 0, db: 0, hz: 0, hinweis: 'kein Brummen erkannt' };
  let sw = 0, sf = 0;
  for (const o of hs.slice(0, 12)) if (o.prom >= 8) { sw += o.prom; sf += o.prom * o.f / o.k; }
  const f0 = sw > 0 ? sf / sw : [50, 60][best];
  const thr = 9 - 3 * st.staerke;
  const ziele = hs.filter((o) => o.prom >= thr).sort((a, b) => b.prom - a.prom).slice(0, 24);
  const orig = st.staerke < 1 ? y.slice() : null;
  for (const o of ziele) {
    const f = o.prom >= 12 ? o.f : o.k * f0;
    const bw = 1.6 + 0.05 * o.k;
    filtereInPlace(y, koeff('notch', f, f / bw, sr));
  }
  if (orig) { const s = st.staerke; for (let i = 0; i < len; i++) y[i] = orig[i] + s * (y[i] - orig[i]); }
  sub(0.8);
  const P2 = spektrum(y, N, starts, true);
  let red = 0;
  for (const o of ziele) red += dbP(P[o.bin]) - dbP(P2[o.bin]);
  return {
    anzahl: ziele.length, hz: Math.round(f0 * 100) / 100, db: r1(ziele.length ? red / ziele.length : 0),
    ueberBoden: r1(hs[0].prom), obertoene: ziele.map((o) => o.k).sort((a, b) => a - b),
  };
}

function ruhigeSegmente(y, N, anz) {
  const hop = N >> 1, cand = [];
  for (let s = 0; s + N <= y.length; s += hop) {
    let e = 0;
    for (let i = s; i < s + N; i += 4) { const v = y[i]; e += v * v; }
    cand.push([e / (N / 4), s]);
  }
  const ok = cand.filter((c) => c[0] > 1e-10).sort((a, b) => a[0] - b[0]);
  return (ok.length ? ok : cand).slice(0, anz).map((c) => c[1]);
}

// Leistungsspektrum je Segment; median=true → Median je Bin über die Segmente
// (stationäres Brummen bleibt, wechselnde Gesangs-Obertöne fallen heraus)
function spektrum(y, N, starts, median = false) {
  const p = fftPlan(N), re = new Float64Array(N), im = new Float64Array(N), w = hann(N), K = (N >> 1) + 1;
  const S = starts.length, alle = median && S >= 3 ? new Float64Array(S * K) : null, P = new Float64Array(K);
  starts.forEach((s, si) => {
    for (let i = 0; i < N; i++) { re[i] = y[s + i] * w[i]; im[i] = 0; }
    fft(re, im, p, false);
    for (let k = 0; k < K; k++) { const v = re[k] * re[k] + im[k] * im[k]; if (alle) alle[k * S + si] = v; else P[k] += v; }
  });
  if (alle) {
    const t = new Float64Array(S), h = S >> 1;
    for (let k = 0; k < K; k++) { for (let i = 0; i < S; i++) t[i] = alle[k * S + i]; t.sort(); P[k] = S & 1 ? t[h] : 0.5 * (t[h - 1] + t[h]); }
  } else for (let k = 0; k < K; k++) P[k] /= Math.max(1, S);
  return P;
}

function harmonische(P, df, base, sr) {
  const out = [], tmp = [];
  const kMax = Math.floor(Math.min(3000, sr / 2 - 500) / base);
  for (let k = 1; k <= kMax; k++) {
    const fc = base * k, c0 = Math.round(fc / df), such = Math.max(2, Math.ceil(fc * 0.01 / df));
    let pb = c0, pv = -1;
    for (let b = c0 - such; b <= c0 + such; b++) if (b > 0 && b < P.length - 1 && P[b] > pv) { pv = P[b]; pb = b; }
    const ex = such + Math.ceil(4 / df), weit = Math.ceil(25 / df);
    tmp.length = 0;
    for (let b = c0 - ex - weit; b < c0 - ex; b++) if (b > 0) tmp.push(P[b]);
    for (let b = c0 + ex + 1; b <= c0 + ex + weit; b++) if (b < P.length) tmp.push(P[b]);
    tmp.sort((a, b) => a - b);
    const med = tmp.length ? tmp[tmp.length >> 1] : EPS;
    const al = dbP(P[pb - 1]), be = dbP(P[pb]), ga = dbP(P[pb + 1]);
    const nn = al - 2 * be + ga;
    const d = nn !== 0 ? clamp(0.5 * (al - ga) / nn, -0.5, 0.5) : 0;
    // Schmal? Echtes Netzbrummen ist ein reiner Sinus → ±4 Bins daneben ≥ 12 dB tiefer
    const sm = Math.max(P[Math.max(0, pb - 4)], P[Math.min(P.length - 1, pb + 4)]);
    const schmal = dbP(pv) - dbP(sm) >= 12;
    out.push({ k, f: (pb + d) * df, bin: pb, prom: schmal ? dbP(pv) - dbP(med) : Math.min(5, dbP(pv) - dbP(med)), schmal });
  }
  return out;
}

// ───────────────────────── 3. Rauschen ─────────────────────────
// STFT (≈43 ms, 75 % Überlappung), Rauschprofil aus den leisesten Rahmen, Wiener-Gewinn mit
// „decision-directed“ a-priori-SNR (α=0,98) + Frequenz-Glättung + Mindest-Gewinn → kein
// Musical Noise („Wassergeräusche“). Zwei reelle Rahmen pro komplexer FFT.

function rauschen(y, sr, st, sub) {
  const len = y.length;
  const N = 1 << Math.round(Math.log2(sr * 0.0427)), H = N >> 2, K = (N >> 1) + 1;
  const F = Math.ceil((len + N - H) / H);
  const nb = Math.ceil(len / H);
  const eb = blockEnergie(y, H);
  const fe = new Float64Array(F);
  for (let f = 0; f < F; f++) { let s = 0; for (let q = f - 3; q <= f; q++) if (q >= 0 && q < nb) s += eb[q]; fe[f] = s / 4; }
  const cand = [];
  for (let f = 3; f < nb; f++) if (fe[f] > 1e-10) cand.push(f);
  if (cand.length < 8) return { anzahl: 0, db: 0, hinweis: 'keine Pausen für ein Rauschprofil' };
  cand.sort((a, b) => fe[a] - fe[b]);
  const q = Math.min(400, Math.max(8, Math.ceil(cand.length * 0.06)));
  const ruhe = cand.slice(0, q);
  let em = 0; for (const f of ruhe) em += fe[f];
  const bodenVorher = dbP(em / q);
  const aktiv = dbP(perzentil(cand.map((f) => fe[f]), 0.95));
  if (bodenVorher < -88) return { anzahl: 0, db: 0, bodenVorher: r1(bodenVorher), hinweis: 'Rauschboden schon sehr leise' };
  let s = st.staerke;
  if (aktiv - bodenVorher < 20) s *= 0.5; // kaum echte Pausen → vorsichtig
  const p = fftPlan(N), w = hann(N);
  const re = new Float64Array(N), im = new Float64Array(N);
  // Rauschprofil
  const Nk = new Float64Array(K);
  for (const f of ruhe) {
    const s0 = (f - 3) * H;
    for (let i = 0; i < N; i++) { const j = s0 + i; re[i] = (j >= 0 && j < len ? y[j] : 0) * w[i]; im[i] = 0; }
    fft(re, im, p, false);
    for (let k = 0; k < K; k++) Nk[k] += re[k] * re[k] + im[k] * im[k];
  }
  for (let k = 0; k < K; k++) Nk[k] /= q;
  { const t = Nk.slice(); for (let k = 1; k < K - 1; k++) Nk[k] = 0.25 * t[k - 1] + 0.5 * t[k] + 0.25 * t[k + 1]; }
  // Profil darf nicht „tonal“ sein (dann wären es Gesangsreste statt Rauschen, z. B. bei gegateten Spuren)
  const ton = tonalitaet(Nk, sr / N);
  if (ton > 6) return { anzahl: 0, db: 0, bodenVorher: r1(bodenVorher), tonal: r1(ton), hinweis: 'keine reinen Rauschstellen (Spur wohl schon gegatet)' };
  if (ton > 3) s *= 0.4;
  const beta = 1 + 1.2 * s;                                // Überschätzung des Rauschens
  const gmin = Math.pow(10, -(6 + 14 * s) / 20);           // Std: −14,4 dB max. Absenkung
  const alpha = 0.98;
  const bN = new Float64Array(K); for (let k = 0; k < K; k++) bN[k] = beta * Nk[k] + EPS;
  const Pprev = new Float64Array(K), Gprev = new Float64Array(K).fill(1);
  const Pa = new Float64Array(K), Pb = new Float64Array(K), Ga = new Float64Array(K), Gb = new Float64Array(K), G0 = new Float64Array(K), Gam = new Float64Array(K);
  const gewinn = (P, G) => {
    for (let k = 0; k < K; k++) {
      const gam = P[k] / bN[k];
      const xi = alpha * Gprev[k] * Gprev[k] * Pprev[k] / bN[k] + (1 - alpha) * (gam > 1 ? gam - 1 : 0);
      let g = xi / (1 + xi);
      // klar über dem Rauschen (γ > 8): nicht von der DD-Trägheit an Einsätzen ausbremsen lassen
      if (gam > 8) { const gp = (gam - 1) / gam; if (gp > g) g = gp; }
      G0[k] = g; Gam[k] = gam;
    }
    G[0] = Math.max(gmin, 0.75 * G0[0] + 0.25 * G0[1]);
    G[K - 1] = Math.max(gmin, 0.75 * G0[K - 1] + 0.25 * G0[K - 2]);
    for (let k = 1; k < K - 1; k++) {
      let g = 0.25 * G0[k - 1] + 0.5 * G0[k] + 0.25 * G0[k + 1];   // glättet Einzel-Spitzen (Musical Noise)
      if (Gam[k] > 8 && G0[k] > g) g = G0[k];                       // echte Teiltöne behalten ihre Spitze
      G[k] = g > gmin ? g : gmin;
    }
    for (let k = 0; k < K; k++) { Gprev[k] = G[k]; Pprev[k] = P[k]; }
  };
  const out = new Float32Array(len);
  const norm = 1 / (N * 1.5);
  const meldeAlle = Math.max(2, Math.floor(F / 20) & ~1);
  for (let f = 0; f < F; f += 2) {
    const sa = (f - 3) * H, sb = sa + H, hatB = f + 1 < F;
    for (let i = 0; i < N; i++) {
      const ja = sa + i, jb = sb + i;
      re[i] = (ja >= 0 && ja < len ? y[ja] : 0) * w[i];
      im[i] = hatB && jb >= 0 && jb < len ? y[jb] * w[i] : 0;
    }
    fft(re, im, p, false);
    for (let k = 0; k < K; k++) {
      const m = (N - k) & (N - 1);
      const zr = re[k], zi = im[k], wr = re[m], wi = im[m];
      const ar = 0.5 * (zr + wr), ai = 0.5 * (zi - wi), br = 0.5 * (zi + wi), bi = 0.5 * (wr - zr);
      Pa[k] = ar * ar + ai * ai; Pb[k] = br * br + bi * bi;
    }
    gewinn(Pa, Ga);
    if (hatB) gewinn(Pb, Gb); else Gb.set(Ga);
    for (let k = 0; k < K; k++) {
      const m = (N - k) & (N - 1);
      const pp = 0.5 * (Ga[k] + Gb[k]), qq = 0.5 * (Ga[k] - Gb[k]);
      const zr = re[k], zi = im[k], wr = re[m], wi = im[m];
      // Y[k] = p·Z[k] + q·conj(Z[N−k]);  Y[N−k] = p·Z[N−k] + q·conj(Z[k])
      re[k] = pp * zr + qq * wr; im[k] = pp * zi - qq * wi;
      if (m !== k) { re[m] = pp * wr + qq * zr; im[m] = pp * wi - qq * zi; }
    }
    fft(re, im, p, true);
    for (let i = 0; i < N; i++) {
      const ja = sa + i;
      if (ja >= 0 && ja < len) out[ja] += re[i] * w[i] * norm;
      if (hatB) { const jb = sb + i; if (jb >= 0 && jb < len) out[jb] += im[i] * w[i] * norm; }
    }
    if (f % meldeAlle === 0) sub(f / F);
  }
  // Messung an denselben Ruhe-Rahmen
  let ev = 0, en = 0;
  for (const f of ruhe) {
    const s0 = (f - 3) * H;
    for (let i = 0; i < N; i++) { const j = s0 + i; if (j >= 0 && j < len) { ev += y[j] * y[j]; en += out[j] * out[j]; } }
  }
  y.set(out);
  const nachher = bodenVorher + dbP(en) - dbP(ev);
  return { anzahl: q, db: r1(bodenVorher - nachher), bodenVorher: r1(bodenVorher), bodenNachher: r1(nachher), maxAbsenkungDb: r1(6 + 14 * s), tonal: r1(ton) };
}

// Mittlere lokale Spitzigkeit (arithm./geom. Mittel in 16-Bin-Fenstern, 300–4000 Hz) in dB
function tonalitaet(P, df) {
  const a = Math.max(1, Math.round(300 / df)), b = Math.min(P.length - 16, Math.round(4000 / df));
  let sum = 0, n = 0;
  for (let k = a; k < b; k += 8) {
    let am = 0, gm = 0;
    for (let i = k; i < k + 16; i++) { am += P[i]; gm += Math.log(P[i] + EPS); }
    am /= 16; gm = Math.exp(gm / 16);
    sum += 10 * Math.log10((am + EPS) / (gm + EPS)); n++;
  }
  return n ? sum / n : 0;
}

// ───────────────────────── 4. Schmatzer ─────────────────────────
// Mundgeräusche: kurze (≤ 5 ms) breitbandige Spitzen im Band 2–8 kHz, deutlich über der
// Umgebung (4–25 ms links UND rechts) und nicht unter einem lauten Vokal (HF ≥ LF − 6 dB).
// Nur der Anteil > 2 kHz wird im Ereignis abgesenkt (nullphasig, weiche Flanken) – nicht gelöscht.

function schmatzer(y, sr, st, sub) {
  const len = y.length, s = st.staerke;
  const bs = Math.max(8, Math.round(sr / 1000)), nb = Math.ceil(len / bs);
  const hp = koeff('hp', 2000, 0.707, sr), lp = koeff('lp', Math.min(8000, sr * 0.45), 0.707, sr);
  const eh = new Float64Array(nb), ea = new Float64Array(nb);
  {
    let h1 = 0, h2 = 0, g1 = 0, g2 = 0, l1 = 0, l2 = 0;
    const [a0, a1, a2, a3, a4] = hp, [b0, b1, b2, b3, b4] = lp;
    for (let j = 0; j < nb; j++) {
      const i0 = j * bs, i1 = Math.min(len, i0 + bs);
      let sh = 0, sa = 0;
      for (let i = i0; i < i1; i++) {
        const v = y[i];
        let o = a0 * v + h1; h1 = a1 * v - a3 * o + h2; h2 = a2 * v - a4 * o;
        const v2 = o; o = a0 * v2 + g1; g1 = a1 * v2 - a3 * o + g2; g2 = a2 * v2 - a4 * o;
        const v3 = o; o = b0 * v3 + l1; l1 = b1 * v3 - b3 * o + l2; l2 = b2 * v3 - b4 * o;
        sh += o * o; sa += v * v;
      }
      eh[j] = sh / Math.max(1, i1 - i0); ea[j] = sa / Math.max(1, i1 - i0);
    }
  }
  sub(0.5);
  const T = Math.pow(10, (18 - 10 * s) / 10);  // Std: 12 dB über Umgebung
  const maxBl = Math.round(3 + 4 * s);          // Std: ≤ ~5 ms
  const gmin = Math.pow(10, -(8 + 16 * s) / 20);
  const hpRep = koeff('hp', 2000, 0.707, sr);
  let anzahl = 0, summeDb = 0;
  for (let j = 26; j < nb - 26; j++) {
    const v = eh[j];
    if (v < 1e-9 || v < eh[j - 1] || v < eh[j + 1] || v < eh[j - 2] || v < eh[j + 2]) continue;
    let le = 0, ri = 0;
    for (let q = j - 25; q <= j - 5; q++) le += eh[q];
    for (let q = j + 5; q <= j + 25; q++) ri += eh[q];
    const ref = Math.max(le, ri) / 21 + 1e-14;
    if (v < T * ref) continue;
    let a = j, b = j;
    while (a > j - 10 && eh[a - 1] > v * 0.25) a--;
    while (b < j + 10 && eh[b + 1] > v * 0.25) b++;
    if (b - a + 1 > maxBl) continue;
    let hf = 0, lf = 0;
    for (let q = a - 1; q <= b + 1; q++) { hf += eh[q]; lf += Math.max(0, ea[q] - eh[q]); }
    if (hf < lf * 0.25) continue;   // unter lautem Vokal: nicht anfassen
    let evt = 0; for (let q = a; q <= b; q++) evt += eh[q]; evt /= (b - a + 1);
    const g = clamp(Math.sqrt(2 * ref / evt), gmin, 1);
    if (g > 0.9) continue;
    const ramp = bs;                           // 1 ms Flanken
    const i0 = (a - 1) * bs, i1 = Math.min(len, (b + 2) * bs);
    const m0 = Math.max(0, i0 - 8 * bs), m1 = Math.min(len, i1 + 8 * bs);
    const seg = Float64Array.from(y.subarray(m0, m1));
    filtfilt(seg, hpRep);
    for (let i = i0 - ramp; i < i1 + ramp; i++) {
      if (i < 0 || i >= len) continue;
      let wgt = 1;
      if (i < i0) wgt = 0.5 - 0.5 * Math.cos(Math.PI * (i - (i0 - ramp)) / ramp);
      else if (i >= i1) wgt = 0.5 + 0.5 * Math.cos(Math.PI * (i - i1) / ramp);
      y[i] -= (1 - g) * wgt * seg[i - m0];
    }
    anzahl++; summeDb += 20 * Math.log10(g);
    j = b + 5;
  }
  sub(1);
  return { anzahl, db: r1(anzahl ? summeDb / anzahl : 0) };
}

// ───────────────────────── 5. Atmer ─────────────────────────
// Atemgeräusche: zusammenhängende, unstimmhafte (wenig Energie < 600 Hz), nicht-zischende
// (wenig > 5 kHz) Stellen deutlich unter dem Gesangspegel, 150 ms – 1,5 s lang.
// Nur absenken (Std. −6 dB) mit weichen 20-ms-Blenden.

function atmer(y, sr, st, sub, ctx) {
  const len = y.length, s = st.staerke;
  const bs = Math.max(16, Math.round(sr / 100)), nb = Math.ceil(len / bs);
  const lpk = koeff('lp', 600, 0.707, sr), hpk = koeff('hp', 5000, 0.707, sr);
  const ea = new Float64Array(nb), el = new Float64Array(nb), eh = new Float64Array(nb);
  {
    let l1 = 0, l2 = 0, m1 = 0, m2 = 0, h1 = 0, h2 = 0;
    const [a0, a1, a2, a3, a4] = lpk, [b0, b1, b2, b3, b4] = hpk;
    for (let j = 0; j < nb; j++) {
      const i0 = j * bs, i1 = Math.min(len, i0 + bs);
      let sa = 0, sl = 0, sh = 0;
      for (let i = i0; i < i1; i++) {
        const v = y[i];
        let o = a0 * v + l1; l1 = a1 * v - a3 * o + l2; l2 = a2 * v - a4 * o;
        const v2 = o; o = a0 * v2 + m1; m1 = a1 * v2 - a3 * o + m2; m2 = a2 * v2 - a4 * o;
        sl += o * o;
        const u = b0 * v + h1; h1 = b1 * v - b3 * u + h2; h2 = b2 * v - b4 * u;
        sh += u * u; sa += v * v;
      }
      const n = Math.max(1, i1 - i0);
      ea[j] = sa / n; el[j] = sl / n; eh[j] = sh / n;
    }
  }
  sub(0.5);
  const lv = new Float64Array(nb), lf = new Float64Array(nb), hf = new Float64Array(nb);
  for (let j = 0; j < nb; j++) {
    let a = 0, l = 0, h = 0;
    for (let q = Math.max(0, j - 1); q <= Math.min(nb - 1, j + 1); q++) { a += ea[q]; l += el[q]; h += eh[q]; }
    lv[j] = dbP(a / 3);
    lf[j] = l / (a + EPS); hf[j] = h / (a + EPS);   // Anteile < 600 Hz bzw. > 5 kHz
  }
  const gueltig = []; for (let j = 0; j < nb; j++) if (lv[j] > -90) gueltig.push(lv[j]);
  if (gueltig.length < 20) return { anzahl: 0, db: 0 };
  const A = perzentil(gueltig, 0.95), Fl = perzentil(gueltig, 0.1);
  if (A - Fl < 20) return { anzahl: 0, db: 0, hinweis: 'zu wenig Dynamik' };
  const vorab = (j) => lv[j] < A - 8 && lv[j] > Fl + 6 && lf[j] < 0.35 && hf[j] < 0.45;
  const stimm = new Float32Array(nb).fill(-1);
  const istAtem = (j) => {
    if (!vorab(j)) return false;
    if (stimm[j] < 0) stimm[j] = periodizitaet(y, sr, j * bs + (bs >> 1));
    return stimm[j] < 0.5;        // stimmhaft (leise Silbe) ≠ Atem
  };
  const minB = 15, maxB = 150, luecke = 2;
  const att = Math.pow(10, -(12 * s) / 20);
  const fade = Math.max(1, Math.round(sr * 0.02));
  let anzahl = 0, gesamtMs = 0;
  let j = 0;
  while (j < nb) {
    if (!istAtem(j)) { j++; continue; }
    let a = j, b = j, miss = 0, k = j + 1;
    while (k < nb && miss <= luecke) { if (istAtem(k)) { b = k; miss = 0; } else miss++; k++; }
    j = b + 1;
    const lenB = b - a + 1;
    if (lenB < minB || lenB > maxB) continue;
    // stimmhafte Nachbarn: wenn direkt links UND rechts lauter Gesang ohne Pause, eher Konsonant (h/ch)
    const i0 = a * bs, i1 = Math.min(len, (b + 1) * bs);
    for (let i = i0; i < i1; i++) {
      let g = att;
      if (i - i0 < fade) g = 1 - (1 - att) * (0.5 - 0.5 * Math.cos(Math.PI * (i - i0) / fade));
      else if (i1 - 1 - i < fade) g = 1 - (1 - att) * (0.5 - 0.5 * Math.cos(Math.PI * (i1 - 1 - i) / fade));
      y[i] *= g;
    }
    ctx.atem.push([i0, i1]);
    anzahl++; gesamtMs += lenB * 10;
  }
  sub(1);
  return { anzahl, db: anzahl ? r1(-12 * s) : 0, gesamtMs };
}

// Normierte Autokorrelation (40 ms, grob auf ~6 kHz heruntergemittelt), Maximum für 60–500 Hz
function periodizitaet(y, sr, mitte) {
  const d = Math.max(1, Math.round(sr / 6000)), fs = sr / d;
  const n = Math.round(0.04 * fs), lmin = Math.floor(fs / 500), lmax = Math.ceil(fs / 60);
  const start = mitte - ((n + lmax) * d >> 1);
  const m = n + lmax, z = new Float64Array(m);
  for (let i = 0; i < m; i++) {
    let s = 0;
    for (let k = 0; k < d; k++) { const j = start + i * d + k; if (j >= 0 && j < y.length) s += y[j]; }
    z[i] = s / d;
  }
  let mean = 0; for (let i = 0; i < m; i++) mean += z[i]; mean /= m;
  for (let i = 0; i < m; i++) z[i] -= mean;
  let e0 = 0; for (let i = 0; i < n; i++) e0 += z[i] * z[i];
  let el = e0;
  for (let i = 0; i < lmin; i++) el += z[i + n] * z[i + n] - z[i] * z[i];
  let best = 0;
  for (let L = lmin; L <= lmax; L++) {
    let r = 0;
    for (let i = 0; i < n; i++) r += z[i] * z[i + L];
    const v = r / Math.sqrt(e0 * el + EPS);
    if (v > best) best = v;
    el += z[L + n] !== undefined ? z[L + n] * z[L + n] - z[L] * z[L] : 0;
  }
  return best;
}

// ───────────────────────── 6. Ausgleich ─────────────────────────
// (a) Silben finden (Hüllkurve 50 ms, Spitzen ≥ 120 ms Abstand), Pegel je Silbe.
// (b) Langsame Pegelfahrt: Phrasenpegel (±1,5 s Median) → Gesamt-Median.
// (c) Silben-Angleichung: Abweichung vom Phrasenpegel teilweise ausgleichen; Gewinn ist je
//     Silbe konstant und wechselt nur in den Tälern zwischen Silben → Form innerhalb der Silbe bleibt.
// (d) Sanfte Transienten-Angleichung: überstehende Anschläge (Spitze/RMS) leicht absenken,
//     zu schwache leicht anheben (max. −6/+2 dB, 2 ms Anlauf, 15 ms Rücklauf).

function ausgleich(y, sr, st, sub, ctx) {
  const len = y.length, s = st.staerke;
  const bs = Math.max(8, Math.round(sr / 1000)), nb = Math.ceil(len / bs);   // 1-ms-Blöcke
  const hpk = koeff('hp', 120, 0.707, sr);
  const e1 = new Float64Array(nb), pk1 = new Float64Array(nb);
  {
    let z1 = 0, z2 = 0;
    const [b0, b1, b2, a1, a2] = hpk;
    for (let j = 0; j < nb; j++) {
      const i0 = j * bs, i1 = Math.min(len, i0 + bs);
      let sm = 0, mx = 0;
      for (let i = i0; i < i1; i++) {
        const v = y[i]; const o = b0 * v + z1; z1 = b1 * v - a1 * o + z2; z2 = b2 * v - a2 * o;
        sm += o * o; const ao = o < 0 ? -o : o; if (ao > mx) mx = ao;
      }
      e1[j] = sm / Math.max(1, i1 - i0); pk1[j] = mx;
    }
  }
  // Präfixsummen für gleitende Mittel
  const pre = new Float64Array(nb + 1);
  for (let j = 0; j < nb; j++) pre[j + 1] = pre[j] + e1[j];
  const mittel = (j, h) => { const a = Math.max(0, j - h), b = Math.min(nb, j + h + 1); return (pre[b] - pre[a]) / Math.max(1, b - a); };
  // 10-ms-Raster, 50-ms-Lautheit
  const ts = 10, nt = Math.ceil(nb / ts);
  const L = new Float64Array(nt);
  for (let t = 0; t < nt; t++) L[t] = dbP(mittel(t * ts + 5, 25));
  sub(0.3);
  const gueltig = []; for (let t = 0; t < nt; t++) if (L[t] > -90) gueltig.push(L[t]);
  if (gueltig.length < 20) return { anzahl: 0, db: 0 };
  const A = perzentil(gueltig, 0.95), Fl = perzentil(gueltig, 0.1);
  const gate = Math.max(A - 30, Fl + 12);
  // Silbenspitzen
  let peaks = [];
  for (let t = 0; t < nt; t++) {
    if (L[t] < gate) continue;
    let ok = true;
    for (let q = Math.max(0, t - 6); q <= Math.min(nt - 1, t + 6); q++) if (L[q] > L[t] || (L[q] === L[t] && q < t)) { ok = false; break; }
    if (ok) peaks.push(t);
  }
  // zusammenlegen, wenn kein echtes Tal (≥ 1,5 dB) dazwischen
  let changed = true;
  while (changed && peaks.length > 1) {
    changed = false;
    const np = [peaks[0]];
    for (let i = 1; i < peaks.length; i++) {
      const p0 = np[np.length - 1], p1 = peaks[i];
      let mn = Infinity; for (let q = p0; q <= p1; q++) if (L[q] < mn) mn = L[q];
      if (Math.min(L[p0], L[p1]) - mn < 1.5 && p1 - p0 < 40) { if (L[p1] > L[p0]) np[np.length - 1] = p1; changed = true; }
      else np.push(p1);
    }
    peaks = np;
  }
  const n = peaks.length;
  if (n < 3) return { anzahl: n, db: 0, hinweis: 'zu wenige Silben' };
  const Ls = peaks.map((t) => L[t]);
  const T = median(Ls);
  const g = new Float64Array(n);
  const fenster = 150; // ±1,5 s in 10-ms-Schritten
  for (let i = 0; i < n; i++) {
    const nbh = [];
    for (let k = i; k >= 0 && peaks[i] - peaks[k] <= fenster; k--) nbh.push(Ls[k]);
    for (let k = i + 1; k < n && peaks[k] - peaks[i] <= fenster; k++) nbh.push(Ls[k]);
    const P = median(nbh);
    g[i] = clamp((T - P) * Math.min(1, 1.2 * s) + (P - Ls[i]) * 0.85 * s, -12, 9);
  }
  // Grenzen: Tal zwischen Silben; Phrasenränder: wo Pegel unter Gate fällt
  const gT = new Float64Array(nt);       // dB je 10 ms
  for (let i = 0; i < n; i++) {
    let a, b;
    if (i > 0) { let mn = Infinity; a = peaks[i]; for (let q = peaks[i - 1]; q <= peaks[i]; q++) if (L[q] < mn) { mn = L[q]; a = q; } }
    else { a = peaks[i]; while (a > 0 && L[a - 1] >= gate - 6) a--; }
    if (i < n - 1) { let mn = Infinity; b = peaks[i]; for (let q = peaks[i]; q <= peaks[i + 1]; q++) if (L[q] < mn) { mn = L[q]; b = q; } }
    else { b = peaks[i]; while (b < nt - 1 && L[b + 1] >= gate - 6) b++; }
    // Anheben nur im Silbenkörper: 12–24 dB unter der Silbenspitze (Ausklang, Atmer, Rauschen)
    // läuft die Anhebung stetig auf 0 dB aus; Absenkungen gelten überall.
    for (let q = a; q <= b; q++) gT[q] = g[i] > 0 ? g[i] * clamp((L[q] - (Ls[i] - 24)) / 12, 0, 1) : g[i];
  }
  // Atemzonen (aus Schritt „atmer“) nie anheben
  for (const [i0, i1] of (ctx && ctx.atem) || []) {
    for (let t = Math.floor(i0 / bs / ts); t <= Math.min(nt - 1, Math.ceil(i1 / bs / ts)); t++) if (gT[t] > 0) gT[t] = 0;
  }
  // weiche Übergänge (±20 ms)
  const gS = new Float64Array(nt);
  for (let t = 0; t < nt; t++) { let sm = 0, c = 0; for (let q = t - 2; q <= t + 2; q++) if (q >= 0 && q < nt) { sm += gT[q]; c++; } gS[t] = sm / c; }
  sub(0.55);
  // Transienten: Spitze (1 ms) gegen RMS (40 ms)
  const d = new Float64Array(nb);
  for (let j = 0; j < nb; j++) d[j] = 20 * Math.log10((pk1[j] + 1e-9) / Math.sqrt(2 * mittel(j, 20) + EPS));
  const ev = [];
  for (let j = 0; j < nb; j++) {
    const lt = Math.min(nt - 1, Math.floor(j / ts));
    if (L[lt] < gate || d[j] < 4) continue;
    let ok = true;
    for (let q = Math.max(0, j - 20); q <= Math.min(nb - 1, j + 20); q++) if (d[q] > d[j] || (d[q] === d[j] && q < j)) { ok = false; break; }
    if (ok) ev.push(j);
  }
  const gTr = new Float64Array(nb);
  let trVor = [], trNach = [];
  if (ev.length >= 5) {
    const ref = median(ev.map((j) => d[j]));
    for (const j of ev) {
      const ex = d[j] - ref;
      let gd = 0;
      if (ex > 1.5) gd = -Math.min(6, (ex - 1.5) * 0.6 * s);
      else if (ex < -3) gd = Math.min(2, (-3 - ex) * 0.3 * s);
      trVor.push(d[j]); trNach.push(d[j] + gd);
      if (gd === 0) continue;
      for (let q = j - 2; q <= j + 15; q++) {
        if (q < 0 || q >= nb) continue;
        const form = q <= j ? 0.5 - 0.5 * Math.cos(Math.PI * (q - (j - 2) + 1) / 3) : 0.5 + 0.5 * Math.cos(Math.PI * (q - j) / 15);
        const v = gd * form;
        if (Math.abs(v) > Math.abs(gTr[q])) gTr[q] = v;
      }
    }
  }
  // Gesamtgewinn je 1-ms-Block → linear interpoliert je Sample
  const glin = new Float32Array(nb + 1);
  for (let j = 0; j < nb; j++) {
    const tf = (j + 0.5) / ts - 0.5, t0 = clamp(Math.floor(tf), 0, nt - 1), t1 = Math.min(nt - 1, t0 + 1), fr = clamp(tf - t0, 0, 1);
    const gd = gS[t0] * (1 - fr) + gS[t1] * fr + gTr[j];
    glin[j] = Math.pow(10, gd / 20);
  }
  glin[nb] = glin[nb - 1];
  for (let j = 0; j < nb; j++) {
    const i0 = j * bs, i1 = Math.min(len, i0 + bs), ga = glin[j], gb = glin[j + 1], inv = 1 / bs;
    for (let i = i0; i < i1; i++) y[i] *= ga + (gb - ga) * (i - i0) * inv;
  }
  sub(1);
  const std = (a) => { const m = a.reduce((x, v) => x + v, 0) / a.length; return Math.sqrt(a.reduce((x, v) => x + (v - m) * (v - m), 0) / a.length); };
  const nach = Ls.map((v, i) => v + g[i]);
  const vor = std(Ls), na = std(nach);
  return {
    anzahl: n, db: r1(vor - na), streuungVorher: r1(vor), streuungNachher: r1(na),
    transienten: ev.length, transStreuungVorher: trVor.length ? r1(std(trVor)) : 0, transStreuungNachher: trNach.length ? r1(std(trNach)) : 0,
  };
}

const FUNK = { klicks, brumm, rauschen, schmatzer, atmer, ausgleich };
