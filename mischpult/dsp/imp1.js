// aus Synquenzer 4.76.1, index.html Zeilen 110497–110900 (imp1Core), unverändert.
// Tempo, Taktart, erste „1“ und Songteile aus einem Mono-Signal. Rechte: dasselbe Projekt.
// Erzeugt von tools/extract-imp1.mjs – nicht von Hand ändern.
function imp1Core() {
  const PL = new Map();
  function plan(n) {
    let p = PL.get(n); if (p) return p;
    const rev = new Uint32Array(n), cs = new Float64Array(n >> 1), sn = new Float64Array(n >> 1), win = new Float64Array(n);
    let bits = 0; while ((1 << bits) < n) bits++;
    for (let i = 0; i < n; i++) { let r = 0, v = i; for (let b = 0; b < bits; b++) { r = (r << 1) | (v & 1); v >>= 1; } rev[i] = r; }
    for (let i = 0; i < n >> 1; i++) { cs[i] = Math.cos(2 * Math.PI * i / n); sn[i] = -Math.sin(2 * Math.PI * i / n); }
    for (let i = 0; i < n; i++) win[i] = .5 - .5 * Math.cos(2 * Math.PI * i / n);
    p = {n, rev, cs, sn, win, re: new Float64Array(n), im: new Float64Array(n)}; PL.set(n, p); return p;
  }
  // Betrag des Spektrums von x[i0 … i0 + n) (Hann) → out (n/2 + 1)
  function spec(x, i0, p, out) {
    if (typeof imp2Spec === 'function') return imp2Spec(x, i0, p, out);   /* IMP2: reelle FFT, halbe Arbeit */
    const n = p.n, rev = p.rev, cs = p.cs, sn = p.sn, win = p.win, re = p.re, im = p.im, L = x.length;
    for (let i = 0; i < n; i++) { const j = i0 + i, r = rev[i]; re[r] = j >= 0 && j < L ? x[j] * win[i] : 0; im[r] = 0; }
    for (let size = 2; size <= n; size <<= 1) {
      const h = size >> 1, st = n / size;
      for (let k = 0; k < h; k++) {
        const c = cs[k * st], d = sn[k * st];
        for (let a = k; a < n; a += size) {
          const b = a + h, tr = re[b] * c - im[b] * d, ti = re[b] * d + im[b] * c;
          re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti;
        }
      }
    }
    for (let k = 0; k <= n >> 1; k++) out[k] = Math.sqrt(re[k] * re[k] + im[k] * im[k]);
  }
  // herunterteilen auf ~11–12 kHz (zwei Kastenfilter = Dreieck gegen Spiegelungen), Pegel auf RMS 0.1
  function down(x, sr) {
    if (typeof imp2Down === 'function') return imp2Down(x, sr);   /* IMP2: immer 11 025 Hz mit sauberem Tiefpass */
    const k = Math.max(1, Math.floor(sr / 11000)), fs = sr / k, n = Math.floor(x.length / k), y = new Float32Array(n);
    if (k === 1) y.set(x.subarray(0, n));
    else {
      const ring = new Float64Array(k); let a1 = 0, a2 = 0;
      for (let i = 0, j = 0; i < n * k; i++) {
        a1 += x[i]; if (i >= k) a1 -= x[i - k];
        const b = a1 / k, r = i % k; a2 += b - ring[r]; ring[r] = b;
        if (r === k - 1) y[j++] = a2 / k;
      }
    }
    let e = 0; for (let i = 0; i < n; i++) e += y[i] * y[i];
    const rms = Math.sqrt(e / Math.max(1, n)); if (rms > 1e-9) { const g = .1 / rms; for (let i = 0; i < n; i++) y[i] *= g; }
    return {y, fs, rms};
  }
  /* IMP2-BEGIN · Tempo unabhängig von der Abtastrate (Echttest: Gesang 120,7 BPM bei 44,1 kHz gegen 132,6 bei 48 kHz – vorher 11 025 bzw. 12 000 Hz
     über Kastenfilter, dadurch andere Silben-Spitzen). Jetzt immer genau 11 025 Hz mit sauberem Tiefpass, in Sekunden entworfen (Kaiser-Sinc) →
     bei jeder Eingangsrate dieselbe Kennlinie, Ausgabe-Zeitpunkte j / 11 025 s ab der ersten Probe (wie vorher). Zwei Stufen (schnell):
     1. Eingang → 22 050 Hz, breiter Übergang (flach bis 5 kHz, Sperre ab 16 kHz: alles faltet in die Sperre von Stufe 2), Phasen-Tabelle (44,1 kHz: 1, 48/96 kHz: 147);
     2. Halbband 22 050 → 11 025 Hz (flach bis 5 kHz, Sperre ab 6 kHz, −50 dB; jede zweite Zahl 0). Pegel auf RMS 0,1 wie vorher. Läuft im Worker mit. */
  function imp2Kai(fc, df, at, sr) {   // Kaiser-Sinc in Sekunden: Grenze fc (−6 dB), Übergang df, Sperre at dB → Proben bei sr (ohne 1/sr)
    const beta = .1102 * (at - 8.7), tw = (at - 8) / (2.285 * 2 * Math.PI * df), K = Math.ceil(tw / 2 * sr) + 1;
    const i0 = v => { let s = 1, t = 1; for (let k = 1; k < 50; k++) { t *= (v / (2 * k)) * (v / (2 * k)); s += t; if (t < 1e-12 * s) break; } return s; }, ib = i0(beta);
    return {K, h: tau => { const u = 2 * tau / tw; if (Math.abs(u) >= 1) return 0; const a = 2 * fc * tau; return (a === 0 ? 1 : Math.sin(Math.PI * a) / (Math.PI * a)) * i0(beta * Math.sqrt(1 - u * u)) / ib; }};
  }
  function imp2Rs(x, sr, fo, fc, df) {   // Stufe 1: x (sr) → fo, Ausgabe j bei j / fo s
    const L = x.length, n = Math.floor(L * fo / sr), y = new Float32Array(n), F = imp2Kai(fc, df, 50, sr), K = F.K, T = 2 * K;
    const srI = Math.round(sr), gcd = (a, b) => { while (b) { const r = a % b; a = b; b = r; } return a; };
    const exact = Math.abs(sr - srI) < 1e-6, g = exact ? gcd(srI, fo) : 1, P0 = exact ? fo / g : 4096, P = Math.min(4096, P0), num = exact ? srI / g : 0, tab = new Float32Array(P * T);
    const st = exact && P === P0;   // schrittweise nur bei ganzzahliger Rate mit vollständiger Tabelle; sonst je Probe gerundet (krumme Rate, z. B. 48 000,5)
    for (let p = 0; p < P; p++) {   // Phase p / P: Probe n0 − K + 1 + m liegt (m − K + 1 − p/P) Proben neben dem Ausgabe-Zeitpunkt
      let s = 0; for (let m = 0; m < T; m++) { const v = F.h((m - K + 1 - p / P) / sr); tab[p * T + m] = v; s += v; }
      if (s > 0) for (let m = 0; m < T; m++) tab[p * T + m] /= s;   // Gleichanteil 1 in jeder Phase
    }
    const di = st ? Math.floor(num / P) : 0, dp = st ? num - di * P : 0;   // genau: j·sr/fo = n0 + p/P, schrittweise
    for (let j = 0, n0 = 0, p = 0; j < n; j++) {
      if (!st) { const c = j * sr / fo; n0 = Math.floor(c); p = Math.round((c - n0) * P); if (p === P) { p = 0; n0++; } }
      let a = n0 - K + 1, o = p * T, s = 0;
      if (a >= 0 && a + T <= L) for (const e = o + T; o < e; o += 2, a += 2) s += x[a] * tab[o] + x[a + 1] * tab[o + 1];
      else for (let m = 0; m < T; m++) { const q = a + m; if (q >= 0 && q < L) s += x[q] * tab[o + m]; }
      y[j] = s;
      if (st) { n0 += di; p += dp; if (p >= P) { p -= P; n0++; } }
    }
    return y;
  }
  function imp2Down(x, sr) {
    const F2 = 22050, FS = 11025;
    if (Math.abs(sr - F2) > 1e-6) x = sr > F2 ? imp2Rs(x, sr, F2, 10512.5, 11025)   /* Übergang 5 000 … 16 025 Hz: faltet nur nach ≥ 6 025 Hz (Sperre Stufe 2) */ : imp2Rs(x, sr, F2, Math.min(11025, sr / 2), Math.min(12050, .2 * sr));
    const F = imp2Kai(5512.5, 1025, 50, F2), K = F.K, c = [], L = x.length, n = Math.floor(L / 2), y = new Float32Array(n);   // Stufe 2: Halbband
    let s0 = F.h(0); for (let m = 1; m < K; m += 2) { const v = F.h(m / F2); c.push(v); s0 += 2 * v; }
    const h0 = F.h(0) / s0, NC = c.length; for (let i = 0; i < NC; i++) c[i] /= s0;
    const cf = Float64Array.from(c), R = 2 * NC - 1;
    for (let j = 0; j < n; j++) {
      const q = 2 * j; let s = h0 * x[q];
      if (q - R >= 0 && q + R < L) for (let i = 0, m = 1; i < NC; i++, m += 2) s += cf[i] * (x[q - m] + x[q + m]);
      else for (let i = 0, m = 1; i < NC; i++, m += 2) s += cf[i] * ((q - m >= 0 ? x[q - m] : 0) + (q + m < L ? x[q + m] : 0));
      y[j] = s;
    }
    let e = 0; for (let i = 0; i < n; i++) e += y[i] * y[i];
    const rms = Math.sqrt(e / Math.max(1, n)); if (rms > 1e-9) { const k = .1 / rms; for (let i = 0; i < n; i++) y[i] *= k; }
    return {y, fs: FS, rms};
  }
  function imp2Spec(x, i0, p, out) {   // wie spec(): Betrag des Hann-Spektrums, aber reelle FFT = komplexe FFT halber Länge (gerade/ungerade Proben) + Aufteilung
    const n = p.n, h = n >> 1, L = x.length, win = p.win, cs = p.cs, sn = p.sn;
    let q = p.imp2; if (!q) { const rv = new Uint32Array(h); let bits = 0; while ((1 << bits) < h) bits++; for (let i = 0; i < h; i++) { let r = 0, v = i; for (let b = 0; b < bits; b++) { r = (r << 1) | (v & 1); v >>= 1; } rv[i] = r; } q = p.imp2 = {rv, re: new Float64Array(h), im: new Float64Array(h)}; }
    const rv = q.rv, re = q.re, im = q.im;
    if (i0 >= 0 && i0 + n <= L) for (let m = 0, j = i0; m < h; m++, j += 2) { const r = rv[m]; re[r] = x[j] * win[2 * m]; im[r] = x[j + 1] * win[2 * m + 1]; }
    else for (let m = 0, j = i0; m < h; m++, j += 2) { const r = rv[m]; re[r] = j >= 0 && j < L ? x[j] * win[2 * m] : 0; im[r] = j + 1 >= 0 && j + 1 < L ? x[j + 1] * win[2 * m + 1] : 0; }
    for (let size = 2; size <= h; size <<= 1) {
      const hs = size >> 1, st = n / size;   // Drehfaktoren der Länge-n-Tabelle mit doppeltem Schritt
      for (let k = 0; k < hs; k++) {
        const c = cs[k * st], d = sn[k * st];
        for (let a = k; a < h; a += size) { const b = a + hs, tr = re[b] * c - im[b] * d, ti = re[b] * d + im[b] * c; re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti; }
      }
    }
    for (let k = 0; k <= h; k++) {   // X[k] = G[k] + W^k U[k], G/U = Spektren der geraden/ungeraden Proben aus Z[k] und Z[h − k]
      const k1 = k === h ? 0 : k, k2 = k === 0 || k === h ? 0 : h - k, a = re[k1], b = im[k1], c = re[k2], d = im[k2];
      const gr = (a + c) * .5, gi = (b - d) * .5, ur = (b + d) * .5, ui = (c - a) * .5, wr = k < h ? cs[k] : -1, wi = k < h ? sn[k] : 0;
      const xr = gr + wr * ur - wi * ui, xi = gi + wr * ui + wi * ur; out[k] = Math.sqrt(xr * xr + xi * xi);
    }
  }
  /* IMP2-END */
  const med = a => { const b = Array.from(a).sort((p, q) => p - q); return b.length ? b[b.length >> 1] : 0; };
  const mean = a => { let s = 0; for (let i = 0; i < a.length; i++) s += a[i]; return a.length ? s / a.length : 0; };
  function smooth(a, sig) {
    const r = Math.max(1, Math.ceil(sig * 3)), w = []; let ws = 0;
    for (let i = -r; i <= r; i++) { const v = Math.exp(-.5 * i * i / (sig * sig)); w.push(v); ws += v; }
    const o = new Float32Array(a.length);
    for (let i = 0; i < a.length; i++) { let s = 0; for (let j = -r; j <= r; j++) { const q = i + j; if (q >= 0 && q < a.length) s += a[q] * w[j + r]; } o[i] = s / ws; }
    return o;
  }
  const at = (a, f) => { if (f < 0 || f >= a.length - 1) return 0; const i = Math.floor(f), u = f - i; return a[i] * (1 - u) + a[i + 1] * u; };
  // 1. Merkmale: Einsatz-Hüllkurve (Spektralfluss je Band), Band-Energien, Chroma
  function features(y, fs, prog) {
    const N = 512, H = Math.max(1, Math.round(fs / 100)), fps = fs / H, M = Math.max(1, Math.ceil(y.length / H)), p = plan(N), mag = new Float64Array(N / 2 + 1);
    const ED = [30, 120, 300, 800, 2000, 5000], NB = ED.length - 1, bandOf = new Int8Array(N / 2 + 1).fill(-1);
    for (let k = 1; k <= N / 2; k++) { const f = k * fs / N; for (let b = 0; b < NB; b++) if (f >= ED[b] && f < ED[b + 1]) bandOf[k] = b; }
    const flux = [], en = []; for (let b = 0; b < NB; b++) { flux.push(new Float32Array(M)); en.push(new Float32Array(M)); }
    let prev = new Float64Array(N / 2 + 1), cur = new Float64Array(N / 2 + 1);
    const CN = 4096, cp = plan(CN), cmag = new Float64Array(CN / 2 + 1), CH = 8, CM = Math.ceil(M / CH), chroma = new Float32Array(CM * 12), pcOf = new Int8Array(CN / 2 + 1).fill(-1), pcW = new Float32Array(CN / 2 + 1);
    for (let k = 1; k <= CN / 2; k++) {
      const f = k * fs / CN; if (f < 55 || f > 2100) continue;
      const m = 12 * Math.log2(f / 440) + 69, r = Math.round(m), dev = Math.abs(m - r); if (dev > .4) continue;
      pcOf[k] = ((r % 12) + 12) % 12; pcW[k] = 1 - dev;
    }
    for (let t = 0; t < M; t++) {
      spec(y, t * H - N / 2, p, mag);
      for (let k = 1; k <= N / 2; k++) {
        const b = bandOf[k]; if (b < 0) { cur[k] = 0; continue; }
        const m = mag[k], L = Math.log(1 + 100 * m); cur[k] = L;
        const d = L - prev[k]; if (d > 0) flux[b][t] += d;
        en[b][t] += m * m;
      }
      const sw = prev; prev = cur; cur = sw;
      if (t % CH === 0) {
        spec(y, t * H - CN / 2, cp, cmag);
        const o = (t / CH) * 12; for (let k = 1; k <= CN / 2; k++) { const c = pcOf[k]; if (c >= 0) chroma[o + c] += pcW[k] * Math.sqrt(cmag[k]); }
      }
      if (prog && (t & 2047) === 0) prog(.05 + .45 * t / M);
    }
    return {fps, H, M, NB, flux, en, chroma, CH, CM};
  }
  // 2. Tempo: Autokorrelation + Kamm, Vorliebe um 110 BPM, ½×/2× über die Zwischen-Schläge
  function acf(o, maxL) {
    const n = o.length, m = mean(o), x = new Float32Array(n); for (let i = 0; i < n; i++) x[i] = o[i] - m;
    const r = new Float32Array(maxL + 1);
    for (let l = 0; l <= maxL; l++) { let s = 0; for (let i = 0; i + l < n; i++) s += x[i] * x[i + l]; r[l] = s / n; }
    const r0 = r[0] || 1; for (let l = 0; l <= maxL; l++) r[l] /= r0;
    return r;
  }
  function comb(r, fps, bpm) { const L = 60 * fps / bpm; let s = 0, w = 0; for (let k = 1; k <= 4; k++) { const q = k * L; if (q >= r.length - 1) break; s += at(r, q) / k; w += 1 / k; } return w ? s / w : 0; }
  // Raster mit Tempo bpm (Schlag P Rahmen): beste Phase, Energie auf den Schlägen und dazwischen (½, ⅓, ⅔)
  function gridFit(g, fps, bpm, ph0) {
    const P = 60 * fps / bpm, n = g.length; let best = -1, bph = 0;
    const steps = Math.max(8, Math.round(P)), phs = ph0 == null ? null : [ph0];
    for (let s = 0; s < (phs ? 1 : steps); s++) {
      const ph = phs ? phs[0] : s * P / steps; let v = 0, c = 0;
      for (let f = ph; f < n - 1; f += P) { v += at(g, f); c++; }
      v /= Math.max(1, c); if (v > best) { best = v; bph = ph; }
    }
    const e = q => { let v = 0, c = 0; for (let f = bph + q * P; f < n - 1; f += P) { v += at(g, f); c++; } return v / Math.max(1, c); };
    return {P, ph: bph, on: best, h2: e(.5), h3: (e(1 / 3) + e(2 / 3)) / 2, h4: (e(.25) + e(.75)) / 2};
  }
  // feines Tempo: Raster über den ganzen Song (Summe der geglätteten Hüllkurve auf den Schlägen)
  function fineTempo(g, fps, b0) {
    let best = -1, bb = b0, bp = 0;
    const run = (lo, hi, st) => { for (let b = lo; b <= hi + 1e-9; b += st) { const f = gridFit(g, fps, b); if (f.on > best) { best = f.on; bb = b; bp = f.ph; } } };
    run(b0 * .975, b0 * 1.025, .05); const c = bb; run(c - .06, c + .06, .005);
    return {bpm: bb, ph: bp, on: best};
  }
  // Schlag-Verfolgung (dynamische Programmierung, Ellis 2007)
  function dpBeats(o, P, alpha) {
    const n = o.length, sc = new Float64Array(n), bk = new Int32Array(n).fill(-1), lo = Math.max(1, Math.round(P / 2)), hi = Math.round(2 * P);
    const pen = new Float64Array(hi + 1); for (let d = lo; d <= hi; d++) { const l = Math.log(d / P); pen[d] = alpha * l * l; }
    for (let t = 0; t < n; t++) {
      let best = -Infinity, bi = -1;
      for (let d = lo; d <= hi && d <= t; d++) { const v = sc[t - d] - pen[d]; if (v > best) { best = v; bi = t - d; } }
      if (bi >= 0 && best > 0) { sc[t] = o[t] + best; bk[t] = bi; } else sc[t] = o[t];
    }
    let e = Math.max(0, n - Math.round(P)), bt = e; for (let t = e; t < n; t++) if (sc[t] > sc[bt]) bt = t;
    const out = []; for (let t = bt; t >= 0; t = bk[t]) { out.push(t); if (bk[t] < 0) break; }
    return out.reverse();
  }
  // Einsätze (Spitzen der Hüllkurve) für den Gesang-Weg
  function peaks(o, fps) {
    const n = o.length, r = Math.round(fps * .05), w = Math.round(fps * 1), out = [];
    const cs = new Float64Array(n + 1), cq = new Float64Array(n + 1);
    for (let i = 0; i < n; i++) { cs[i + 1] = cs[i] + o[i]; cq[i + 1] = cq[i] + o[i] * o[i]; }
    let last = -1e9;
    for (let i = 1; i < n - 1; i++) {
      const v = o[i]; if (v <= 0) continue;
      let mx = true; for (let j = Math.max(0, i - r); j <= Math.min(n - 1, i + r); j++) if (o[j] > v || (o[j] === v && j < i)) { mx = false; break; }
      if (!mx) continue;
      const a = Math.max(0, i - w), b = Math.min(n, i + w), c = b - a, m = (cs[b] - cs[a]) / c, sd = Math.sqrt(Math.max(0, (cq[b] - cq[a]) / c - m * m));
      if (v < m + .5 * sd || i - last < fps * .08) continue;
      out.push({t: i / fps, w: v}); last = i;
    }
    return out;
  }
  // Raster-Treue der Einsätze für Periode P (s): |Σ w·e^(2πi t/P)| / Σ w
  function ray(on, P) { let re = 0, im = 0, s = 0; for (const x of on) { const a = 2 * Math.PI * x.t / P; re += x.w * Math.cos(a); im += x.w * Math.sin(a); s += x.w; } return {r: s ? Math.hypot(re, im) / s : 0, ph: Math.atan2(im, re)}; }
  const prior = b => { const l = Math.log2(b / 110) / .9; return Math.exp(-.5 * l * l); };
  const cosv = (a, b) => { let s = 0, p = 0, q = 0; for (let i = 0; i < a.length; i++) { s += a[i] * b[i]; p += a[i] * a[i]; q += b[i] * b[i]; } return p > 1e-12 && q > 1e-12 ? s / Math.sqrt(p * q) : 0; };
  function zs(a) { const m = mean(a); let v = 0; for (const x of a) v += (x - m) * (x - m); const sd = Math.sqrt(v / Math.max(1, a.length)) || 1; return a.map(x => (x - m) / sd); }
  // Chroma (Rahmen) über ein Zeitfenster [t0, t1) s gemittelt
  function chromaAt(F, t0, t1) {
    const fpc = F.fps / F.CH, a = Math.max(0, Math.floor(t0 * fpc)), b = Math.min(F.CM, Math.max(a + 1, Math.ceil(t1 * fpc))), o = new Float64Array(12);
    for (let i = a; i < b; i++) for (let c = 0; c < 12; c++) o[c] += F.chroma[i * 12 + c];
    let mx = 0; for (let c = 0; c < 12; c++) mx = Math.max(mx, o[c]); if (mx > 0) for (let c = 0; c < 12; c++) o[c] /= mx;
    return o;
  }
  function bandAt(F, b, t0, t1) { const a = Math.max(0, Math.floor(t0 * F.fps)), e = Math.min(F.M, Math.max(a + 1, Math.ceil(t1 * F.fps))); let s = 0; for (let i = a; i < e; i++) s += F.en[b][i]; return s / Math.max(1, e - a); }
  const r2 = v => Math.round(v * 100) / 100, r3 = v => Math.round(v * 1000) / 1000;

  function analyse(x, sr, o, prog) {
    o = o || {}; prog = prog || (() => {});
    const T0 = Date.now(), D = down(x, sr), y = D.y, fs = D.fs, dur = x.length / sr;
    if (dur < 3) return {ok: false, err: 'zu kurz'};
    if (!(D.rms > 1e-5)) return {ok: false, err: 'still'};
    const F = features(y, fs, prog), fps = F.fps, M = F.M, NB = F.NB;
    // Hüllkurve: Bänder gleich gewichtet; Bass-Hüllkurve extra
    const nov = new Float32Array(M), low = new Float32Array(M);
    for (let b = 0; b < NB; b++) { const m = mean(F.flux[b]) || 1; for (let t = 0; t < M; t++) { nov[t] += F.flux[b][t] / m; if (b < 2) low[t] += F.flux[b][t] / m; } }
    const loc = smooth(nov, fps * .12), on = new Float32Array(M); for (let t = 0; t < M; t++) on[t] = Math.max(0, nov[t] - loc[t]);
    const g = smooth(on, 2), gl = smooth(low, 2);
    // Gesamtenergie je Band → Anteil Bass, Musik-Anfang
    let eAll = 0, eLow = 0; const eb = []; for (let b = 0; b < NB; b++) { let s = 0; for (let t = 0; t < M; t++) s += F.en[b][t]; eb.push(s); eAll += s; if (b === 0) eLow += s; }
    const lowRatio = eAll ? eLow / eAll : 0;
    const fe = new Float32Array(M); let fmax = 0; for (let t = 0; t < M; t++) { let s = 0; for (let b = 0; b < NB; b++) s += F.en[b][t]; fe[t] = s; if (s > fmax) fmax = s; }
    let start = 0; while (start < M - 1 && fe[start] < fmax * 1e-4) start++;
    const loud = (() => { const a = Array.from(fe).sort((p, q) => p - q); return a[Math.floor(a.length * .95)] || fmax; })();
    let end = M - 1; while (end > start && fe[end] < loud * 1e-3) end--;   // Hall-Ausklang (unter −30 dB) zählt nicht als Takt
    const tStart = start / fps, tEnd = (end + 1) / fps;
    prog(.55);
    // Tempo-Kandidaten
    const maxL = Math.min(M - 2, Math.ceil(fps * 60 / 30 * 4)), R = acf(on, maxL);
    let pulse = 0; for (let b = 60; b <= 180; b += .5) pulse = Math.max(pulse, at(R, 60 * fps / b));
    const cand = []; for (let b = 60; b <= 180.001; b += .25) cand.push({b, s: comb(R, fps, b), w: 0});
    for (const c of cand) c.w = c.s * prior(c.b);
    cand.sort((p, q) => q.w - p.w);
    const ons = peaks(on, fps);
    let qn = 0; for (let t = start; t <= end; t++) if (fe[t] < loud * 1e-3) qn++;   // RV1: Anteil leiser Rahmen (unter −30 dB) zwischen Anfang und Ende
    const quiet = qn / Math.max(1, end - start + 1);
    // RV1: tiefe Männerstimme (Grundton 100–130 Hz) streut ins Bass-Band; bei 48 kHz (Telefon-Browser) lag echter Gesang bei 5 % → „Mix“ ohne Frage.
    // Gesang allein auch bei wenig Bass (< 15 %) mit Atem-/Phrasen-Pausen (≥ 1,5 % der Rahmen leise; Mischungen mit Band ~0 %).
    const vocal = o.gesang === true || (o.gesang !== false && (lowRatio < .03 || (lowRatio < .15 && quiet >= .015)));
    let b0 = cand.length ? cand[0].b : 120, how = 'mix';
    if (vocal) {
      // Gesang: Silben-Einsätze → Raster-Treue (Viertel + Achtel) über 60–180
      let bs = -1;
      for (let b = 60; b <= 180.001; b += .1) { const P = 60 / b, s = (ray(ons, P).r + .5 * ray(ons, P / 2).r) * (.85 + .15 * prior(b)); if (s > bs) { bs = s; b0 = b; } }
      let bf = b0; bs = -1;
      for (let b = b0 - .3; b <= b0 + .3; b += .01) { const P = 60 / b, s = ray(ons, P).r + .5 * ray(ons, P / 2).r; if (s > bs) { bs = s; bf = b; } }
      b0 = bf; how = 'gesang';
    } else {
      // ½× / 2×: Zwischen-Schläge entscheiden
      const fit = b => gridFit(g, fps, b);
      if (b0 / 2 >= 60) { const f = fit(b0 / 2); if (f.h2 < .3 * f.on) b0 /= 2; }
      if (b0 * 2 <= 180) { const f = fit(b0); if (f.h2 > .85 * f.on) b0 *= 2; }
    }
    if (o.bpm > 0) b0 = o.bpm;   // Tempo bekannt
    prog(.65);
    let ft = vocal && !(o.bpm > 0) ? {bpm: b0, ph: 0} : fineTempo(g, fps, b0);
    if (o.bpm > 0) { const f = gridFit(g, fps, o.bpm); ft = {bpm: o.bpm, ph: f.ph}; }
    if (vocal) { const P = 60 / ft.bpm, rr = ray(ons, P); let ph = (rr.ph / (2 * Math.PI)) * P; ph = ((ph % P) + P) % P; ft.ph = ph * fps; }
    let bpmRaw = ft.bpm, bpm = Math.abs(bpmRaw - Math.round(bpmRaw)) < .2 ? Math.round(bpmRaw) : Math.round(bpmRaw * 10) / 10;
    const P = 60 * fps / bpm;
    // Schläge (konstantes Raster) + DP-Verfolgung für die Stabilität
    const gf = gridFit(g, fps, bpm, ((ft.ph % P) + P) % P);
    let f0 = gf.ph % P; if (f0 - P >= -.25 * P) f0 -= P;   // ein Schlag knapp vor 0 (Anfang mitten im Rahmen) zählt mit
    const beats = []; for (let f = f0; f < M - 1; f += P) beats.push(f);
    const dpo = new Float32Array(M), sdv = Math.sqrt(mean(Array.from(on, v => v * v))) || 1; for (let t = 0; t < M; t++) dpo[t] = on[t] / sdv;
    const dp = dpBeats(dpo, P, 100);
    let hit = 0; for (const t of dp) { const k = Math.round((t - gf.ph) / P), d = Math.abs(t - (gf.ph + k * P)) / fps; if (d < .05) hit++; }
    const stab = dp.length ? hit / dp.length : 0;
    prog(.72);
    // Taktart: Unterteilung (2 oder 3) und Gruppe (2, 3, 4) über Schlag-Merkmale
    const sub3 = !vocal && gf.h3 > 1.5 * gf.h2 && gf.h3 > .06 * gf.on;
    const nbt = beats.length, bt = beats.map(f => f / fps), bs = 60 / bpm;
    const bfe = [], blow = [], bon = [];
    for (let k = 0; k < nbt; k++) {
      const c = chromaAt(F, bt[k], bt[k] + bs); bfe.push(c);
      let ml = 0, mo = 0; const a = Math.max(0, Math.round(beats[k] - fps * .04)), e = Math.min(M - 1, Math.round(beats[k] + fps * .04));
      for (let t = a; t <= e; t++) { ml = Math.max(ml, gl[t]); mo = Math.max(mo, g[t]); }
      blow.push(ml); bon.push(mo);
    }
    const cm = new Float64Array(12); for (const c of bfe) for (let i = 0; i < 12; i++) cm[i] += c[i] / Math.max(1, nbt);
    const lz = zs(blow), oz = zs(bon), bvec = bfe.map((c, k) => { const v = []; for (let i = 0; i < 12; i++) v.push(c[i] - cm[i]); v.push(lz[k] * .7, oz[k] * .5); return v; });
    const A = m => { let s = 0, c = 0; for (let k = 0; k + m < nbt; k++) { if (bt[k] < tStart || bt[k + m] > tEnd) continue; s += cosv(bvec[k], bvec[k + m]); c++; } return c ? s / c : 0; };
    const A2 = A(2), A3 = A(3), A4 = A(4), A6 = A(6), A8 = A(8), A9 = A(9);
    let grp = (A3 + A9) / 2 > (A4 + A8) / 2 + .02 ? 3 : 4;
    // Harmonie-Wechsel je Schlag (Fenster m Schläge davor/danach)
    const chg = m => bt.map((t, k) => k < 1 ? 0 : 1 - cosv(chromaAt(F, t - m * bs, t), chromaAt(F, t, t + m * bs)));
    const phaseScores = m => {
      const ch = zs(chg(Math.min(m, 4))), sc = new Array(m).fill(0), cn = new Array(m).fill(0), cc = new Array(m).fill(0);
      for (let k = 0; k < nbt; k++) { if (bt[k] < tStart - .05 || bt[k] > tEnd) continue; const q = k % m; sc[q] += lz[k] + 1.5 * ch[k] + .5 * oz[k]; cc[q] += ch[k]; cn[q]++; }
      return {sc: sc.map((v, i) => v / Math.max(1, cn[i])), ch: cc.map((v, i) => v / Math.max(1, cn[i]))};
    };
    let ts, m, ps = phaseScores(grp), phi = ps.sc.indexOf(Math.max(...ps.sc)), appBpm = bpm, half = false;
    // Zweier oder Vierer: Akkordwechsel auch zur Takt-Mitte? (Fenster 2 Schläge)
    const mg = Math.min(.2, .25 * bs), cw = zs(bt.map((t, k) => k < 1 ? 0 : 1 - cosv(chromaAt(F, t - bs + mg, t - mg), chromaAt(F, t + mg, t + bs - mg)))), chAt = (mm, q) => { let s = 0, c = 0; for (let k = 0; k < nbt; k++) { if (k % mm !== q || bt[k] < tStart - .05 || bt[k] > tEnd) continue; s += cw[k]; c++; } return c ? s / c : 0; };
    // Takt-Akzente: Mitte (½) gegen Drittel (⅓, ⅔) – 6/8 gegen 3/4
    const barAcc = (P0, ph0, L) => { const e = q => { let v = 0, c = 0; for (let f = ph0 + q * L; f < M - 1; f += L) { v += at(g, f) + at(gl, f); c++; } return v / Math.max(1, c); }; return {h: e(.5), t: (e(1 / 3) + e(2 / 3)) / 2}; };
    if (grp === 3) {
      const ac = barAcc(P, f0 + phi * P, 3 * P);
      if (!sub3 && ac.h > 1.25 * ac.t) {
        if (bpm >= 150) { ts = '6/8'; m = 6; appBpm = bpm / 2; ps = phaseScores(6); phi = ps.sc.indexOf(Math.max(...ps.sc)); }
        else {
          ps = phaseScores(6); phi = ps.sc.indexOf(Math.max(...ps.sc)) % 3;
          const a = chAt(6, phi), b = chAt(6, phi + 3), q = a >= b ? phi : phi + 3;
          const need = bpm / 1.5 >= 70 ? .8 : .4;   // punktierter Puls ab 70: 6/8, nur mit deutlichen Wechseln je 2 Takte 12/8
          if (Math.abs(a - b) > need && Math.max(a, b) > .3) { ts = '12/8'; m = 6; phi = q; } else { ts = '6/8'; m = 3; }
        }
      } else { ts = '3/4'; m = 3; }
    } else {
      const a = chAt(4, phi), b = chAt(4, (phi + 2) % 4);
      const c = Math.max(chAt(4, (phi + 1) % 4), chAt(4, (phi + 3) % 4)), two = Math.min(a, b) > c + .3 && b > .6 * a, four = a > b + (sub3 && bpm >= 70 ? .8 : .4) && a > c;
      if (sub3) { if (four) { ts = '12/8'; m = 4; } else { ts = '6/8'; m = 2; half = true; } appBpm = bpm * 1.5; }
      else if (two) { ts = '2/4'; m = 2; half = true; } else { ts = '4/4'; m = 4; }
      if (half) phi = phi % 2;
    }
    if (vocal) { ts = '4/4'; m = 4; appBpm = bpm; }
    appBpm = Math.abs(appBpm - Math.round(appBpm)) < .2 ? Math.round(appBpm) : Math.round(appBpm * 10) / 10;
    // erste „1“: erster Schlag der Phase ab Musik-Anfang (Vorlauf/Auftakt bleibt davor)
    const tol = Math.min(.3, .5 * bs);
    let k1 = -1; for (let k = 0; k < nbt; k++) if (k % m === phi % m && bt[k] >= tStart - tol) { k1 = k; break; }
    if (vocal) { k1 = -1; for (let k = 0; k < nbt; k++) if (bt[k] >= tStart - tol) { k1 = k; break; } }
    if (k1 < 0) k1 = 0;
    let t1 = bt[k1] || 0; if (t1 < 0 && t1 > -.06) t1 = 0;   // Rahmen-Raster: knapp vor 0 = 0
    const barSec = m * bs;
    prog(.8);
    // Teile: Takt-Merkmale → Selbstähnlichkeit → Grenzen (Schachbrett) → 4er-Raster → Gruppen → Namen
    const nBar = Math.max(1, Math.round((tEnd - t1) / barSec)), bars = [];
    for (let j = 0; j < nBar; j++) bars.push(t1 + j * barSec);
    const bc = [], btm = [], bl = [];
    for (const t of bars) {
      bc.push(chromaAt(F, t, t + barSec));
      const v = []; let s = 0; for (let b = 0; b < NB; b++) { const e = bandAt(F, b, t, t + barSec); v.push(Math.log10(e + 1e-9)); s += e; }
      btm.push(v); bl.push(10 * Math.log10(s + 1e-12));
    }
    const cmb = new Float64Array(12); for (const c of bc) for (let i = 0; i < 12; i++) cmb[i] += c[i] / nBar;
    const tz = []; for (let b = 0; b < NB; b++) { const z = zs(btm.map(v => v[b])); z.forEach((v, j) => { (tz[j] || (tz[j] = [])).push(v); }); }
    const lzb = zs(bl); tz.forEach((v, j) => v.push(lzb[j]));
    const cc = bc.map(c => Array.from(c, (v, i) => v - cmb[i]));
    const SS = []; for (let i = 0; i < nBar; i++) { SS.push(new Float32Array(nBar)); }
    for (let i = 0; i < nBar; i++) for (let j = i; j < nBar; j++) { const v = .65 * cosv(cc[i], cc[j]) + .35 * (1 - Math.min(2, Math.hypot(...tz[i].map((q, k) => q - tz[j][k])) / Math.sqrt(tz[i].length)) ); SS[i][j] = SS[j][i] = v; }
    // 4-Takt-Blöcke ab der ersten „1“ (Raster), Ähnlichkeit = Diagonale (gleiche Akkordfolge, gleicher Klang)
    const BL = 4, nBk = Math.ceil(nBar / BL), bsim = (i, j) => { let s = 0, c = 0; for (let d = 0; d < BL; d++) { const p = i * BL + d, q = j * BL + d; if (p < nBar && q < nBar) { s += SS[p][q]; c++; } } return c ? s / c : 0; };
    const lab = [], reps = [];
    for (let i = 0; i < nBk; i++) { let bi = -1, bv = .55; reps.forEach((r, k) => { const v = bsim(r, i); if (v > bv) { bv = v; bi = k; } }); if (bi < 0) { reps.push(i); bi = reps.length - 1; } lab.push(bi); }
    // Läufe gleicher Blöcke → Stücke; folgt Y immer auf X (und nur dort), ist X+Y ein Teil
    let runs = []; lab.forEach((l, i) => { const r = runs[runs.length - 1]; if (r && r.l === l) r.n++; else runs.push({l, n: 1, s: i}); });
    for (let it = 0; it < 8; it++) {
      let done = false;
      const ls = [...new Set(runs.map(r => r.l))];
      for (const X of ls) {
        const ix = runs.map((r, i) => r.l === X ? i : -1).filter(i => i >= 0); if (ix.length < 2) continue;
        const Y = runs[ix[0] + 1] && runs[ix[0] + 1].l; if (Y == null || Y === X) continue;
        if (!ix.every(i => runs[i + 1] && runs[i + 1].l === Y)) continue;
        if (!runs.every((r, i) => r.l !== Y || (i > 0 && runs[i - 1].l === X))) continue;
        const nl = 1000 + it * 100 + X; const out = [];
        for (let i = 0; i < runs.length; i++) { if (runs[i].l === X && runs[i + 1] && runs[i + 1].l === Y) { out.push({l: nl, n: runs[i].n + runs[i + 1].n, s: runs[i].s}); i++; } else out.push(runs[i]); }
        runs = out; done = true; break;
      }
      if (!done) break;
    }
    if (runs.length > 1 && nBar - runs[runs.length - 1].s * BL < 2) { const z = runs.pop(); runs[runs.length - 1].n += z.n; }   // Rest unter 2 Takten hängt am Teil davor
    const seg = runs.map(r => [r.s * BL, Math.min(nBar, (r.s + r.n) * BL)]).filter(s => s[1] > s[0]);
    const nv = lab;
    const grpOf = [], groups = [], gl2 = [];
    runs.forEach((r, i) => { let gi = gl2.indexOf(r.l); if (gi < 0) { gl2.push(r.l); groups.push([]); gi = groups.length - 1; } groups[gi].push(i); grpOf.push(gi); });
    const segE = seg.map(s => mean(lzb.slice(s[0], s[1])));
    const gE = groups.map(G => mean(G.map(i => segE[i])));
    const rep = groups.map((G, gi) => gi).filter(gi => groups[gi].length >= 2);
    rep.sort((p, q) => (groups[q].length + gE[q]) - (groups[p].length + gE[p]));
    const gName = {}; if (rep[0] != null) gName[rep[0]] = 'Refrain'; if (rep[1] != null) gName[rep[1]] = 'Strophe';
    rep.slice(2).forEach((gi, k) => { gName[gi] = 'Teil ' + String.fromCharCode(65 + k); });
    const cnt = {}, tot = {}; seg.forEach((s, i) => { const n = gName[grpOf[i]]; if (n) tot[n] = (tot[n] || 0) + 1; });
    let nBr = 0; const brT = seg.filter((s, i) => !gName[grpOf[i]] && i > 0 && i < seg.length - 1).length;
    const teile = seg.map((s, i) => {
      let n = gName[grpOf[i]];
      if (n) { cnt[n] = (cnt[n] || 0) + 1; if (tot[n] > 1) n += ' ' + cnt[n]; }
      else if (i === 0) n = 'Intro'; else if (i === seg.length - 1) n = 'Outro'; else { nBr++; n = brT > 1 ? 'Bridge ' + nBr : 'Bridge'; }
      return {name: n, a: s[0], b: s[1], t0: r3(t1 + s[0] * barSec), t1: r3(t1 + s[1] * barSec), grp: grpOf[i], e: r2(segE[i])};
    });
    prog(1);
    const alt = []; if (appBpm / 2 >= 40) alt.push(r2(appBpm / 2)); if (appBpm * 2 <= 300) alt.push(r2(appBpm * 2));
    return {ok: true, dauer: r3(dur), bpm: appBpm, bpmRoh: r3(how === 'gesang' ? bpmRaw : bpmRaw * appBpm / bpm), puls: r2(bpm), ts, alt,
      quelle: how, frage: !(o.bpm > 0) && (how === 'gesang' || stab < .5), vorgabe: o.bpm > 0, stabil: r2(stab), t1: r3(t1), takt: r3(barSec), schlag: r3(60 / appBpm),
      start: r3(tStart), ende: r3(tEnd), takte: bars.map(r3), teile,
      diag: {sub3, grp, A: {A2: r3(A2), A3: r3(A3), A4: r3(A4), A6: r3(A6), A8: r3(A8), A9: r3(A9)}, bloecke: nv.slice(), lowRatio: r3(lowRatio), quiet: r3(quiet), pulse: r3(pulse)}, ms: Date.now() - T0};
  }
  return {analyse, peaks, down};
}
export const IMP1 = imp1Core();
