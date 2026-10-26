// clean.mjs — VS4 „Säubern“ (DSP-Kern, eigenständig, ohne Abhängigkeiten, ohne DOM)
//
// Kette: Referenz (eigenes Playback) um die geschätzte Laufzeit verschieben → Echo-Abzug (Block-/MDF-Filter im
// Frequenzbereich, AUMDF-Variante mit variabler Lernrate gegen Doppelsprechen) → Nachfilter gegen Rest-Echo und
// Wiener-Entrauschen (a-priori-SNR „decision-directed“, Rauschprofil aus leisen Stellen) → Hochpass 80 Hz.
// Kein Gate: der Boden (−6 … −24 dB) begrenzt jede Dämpfung.
//
// API (alles Float32Array, Abtastrate frei):
//   clean(mic, ref, sr, o?)      → Float32Array gleicher Länge, zeitgleich zum Eingang
//       o.amount   SÄUBERN 0…1 (Standard 1); 0 → bitgleiche Kopie von mic
//       o.way      'hear' (Hör-Weg, Standard) | 'notes' (Noten-Weg = nur Echo-Abzug, ohne Nachfilter/Wiener/HP)
//       o.delay    Laufzeit Referenz→Mikro in Samples (sonst geschätzt per GCC-PHAT)
//       o.noiseRange [t0, t1] in Sekunden für das Rauschprofil (sonst die leisesten 10 % der Rahmen)
//       o.tail     Länge des Echo-Filters in s (Standard 0,25)
//       o.passes   2 (Standard: 1. Lauf über die ersten o.learnSec = 20 s lernt Weg, Rauschprofil und Rest-Echo-Profil;
//                  2. Lauf über alles mit warmem Filter und langsamem Nachlernen o.relearn = 0,1) | 1
//       o.info     Objekt, wird gefüllt: {delay, way, leak, echoDb, hint, ms}
//   new Cleaner(sr, o?)          Block-Verarbeiter für den Worker (keine Allokation in process())
//       .process(mic, ref, out, n?)   beliebige Blocklänge; Ausgabe um .latency Samples verzögert
//       .setAmount(a, sofort?)        geglättet (20 ms Rampe), klickfrei
//       .setDelay(samples) · .setWay('hear'|'notes') · .setNoisePsd(psd|null) (null = Rauschen nachführen)
//       .exportState() / .importState(s)  Filter mitnehmen (warmer Start) · .resetStreams()
//   estimateDelay(mic, ref, sr, o?) → Samples (GCC-PHAT über die ersten 15 s, frühester starker Gipfel)
//   nlms(mic, ref, taps, mu?)    → Float32Array (Zeitbereich, Vergleich/Notbehelf für kurze Wege)
//   srcText()                    → Quelltext „(function(){…})()“, liefert dasselbe API-Objekt (für Worker/Skript)

function factory() {
  'use strict';
  const TAU = 2 * Math.PI;
  const SC = 32768;                       // intern 16-Bit-Skala (Konstanten der MDF-Lernrate sind darauf abgestimmt)
  const ok = v => (v === v && v < 1e30 && v > -1e30 ? v : 0);   // NaN/Inf → 0
  const dn = v => (v < 1e-25 && v > -1e-25 ? 0 : v);              // Denormal-Schutz für Rückkopplungen

  // ---- komplexe Radix-2-FFT (vorberechnete Tabellen, in place, unskaliert in beide Richtungen) ----
  function FFT(n) {
    const rev = new Uint32Array(n), cs = new Float64Array(n >> 1), sn = new Float64Array(n >> 1);
    let bits = 0; while ((1 << bits) < n) bits++;
    for (let i = 0; i < n; i++) { let r = 0; for (let b = 0; b < bits; b++) r |= ((i >> b) & 1) << (bits - 1 - b); rev[i] = r; }
    for (let i = 0; i < n >> 1; i++) { cs[i] = Math.cos(TAU * i / n); sn[i] = Math.sin(TAU * i / n); }
    function run(re, im, inv) {
      for (let i = 0; i < n; i++) { const j = rev[i]; if (j > i) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; } }
      for (let size = 2; size <= n; size <<= 1) {
        const half = size >> 1, step = n / size;
        for (let i = 0; i < n; i += size) {
          for (let j = i, k = 0; j < i + half; j++, k += step) {
            const l = j + half, c = cs[k], s = inv ? sn[k] : -sn[k];
            const tr = re[l] * c - im[l] * s, ti = re[l] * s + im[l] * c;
            re[l] = re[j] - tr; im[l] = im[j] - ti; re[j] += tr; im[j] += ti;
          }
        }
      }
    }
    return {n, fwd: (re, im) => run(re, im, false), inv: (re, im) => run(re, im, true)};
  }

  // Hochpass 2. Ordnung (Butterworth, RBJ)
  function hpCoefs(sr, fc) {
    const w = TAU * fc / sr, cw = Math.cos(w), al = Math.sin(w) / (2 * Math.SQRT1_2), a0 = 1 + al;
    return {b0: (1 + cw) / 2 / a0, b1: -(1 + cw) / a0, b2: (1 + cw) / 2 / a0, a1: -2 * cw / a0, a2: (1 - al) / a0};
  }

  class Cleaner {
    constructor(sr, o = {}) {
      this.sr = sr;
      // laufende Skalare in einem Float64Array (Schreiben legt so nie ein Zahl-Objekt an): 0 h1, 1 h2 (Hochpass),
      // 2 SÄUBERN-Wert, 3 Pey, 4 Pyy, 5 Leck, 6 Lern-Summe, 7 Echo-Energie, 8 Fehler-Energie
      this.st = new Float64Array(12);
      const N = o.block || (sr >= 32000 ? 256 : 128), M = 2 * N, K = N + 1;
      const P = Math.max(2, Math.min(512, Math.ceil((o.tail != null ? o.tail : 0.25) * sr / N)));
      Object.assign(this, {N, M, K, P});
      this.fm = FFT(M);
      // MDF-Zustand
      this.Wr = new Float64Array(P * K); this.Wi = new Float64Array(P * K);
      this.Xr = new Float64Array(P * K); this.Xi = new Float64Array(P * K); this.head = 0;
      this.tr = new Float64Array(M); this.ti = new Float64Array(M);
      this.Yr = new Float64Array(K); this.Yi = new Float64Array(K);
      this.Er = new Float64Array(K); this.Ei = new Float64Array(K);
      this.Rf = new Float64Array(K); this.Yf = new Float64Array(K); this.pw1 = new Float64Array(K);
      this.pow = new Float64Array(K); this.Eh = new Float64Array(K); this.Yh = new Float64Array(K);
      this.prop = new Float64Array(P);
      this.xOld = new Float64Array(N); this.mb = new Float64Array(N); this.rb = new Float64Array(N);
      this.eb = new Float64Array(N); this.yb = new Float64Array(N); this.fill = 0;
      this.ss = 0.35 / P; this.specAvg = N / sr; this.beta0 = 2 * N / sr; this.betaMax = 0.5 * N / sr;
      // Nachfilter (STFT, Rahmen 4N, Sprung 2N, Wurzel-Hann, 50 % Überlappung = perfekte Rekonstruktion)
      const F = 4 * N, H = 2 * N, KF = F / 2 + 1;
      Object.assign(this, {F, H, KF});
      this.ff = FFT(F);
      this.win = new Float64Array(F); for (let i = 0; i < F; i++) this.win[i] = Math.sqrt(0.5 - 0.5 * Math.cos(TAU * i / F));
      this.eR = new Float64Array(F); this.yR = new Float64Array(F); this.eCnt = 0;
      this.ola = new Float64Array(F); this.fr = new Float64Array(F); this.fi = new Float64Array(F);
      this.noise = new Float64Array(KF); this.noiseFixed = false; this.psm = new Float64Array(KF);
      this.Gp = new Float64Array(KF).fill(1); this.gp = new Float64Array(KF).fill(1);
      // Rest-Echo je Frequenz: R = ρ_k·|Y|²; ρ_k offline aus dem 1. Lauf (endProfile), sonst die Leck-Schätzung des MDF.
      this.prof = null; this.collect = false; this.pd = null; this.pr = null; this.pn = 0;
      this.nFrames = 0;
      // Ausgabe-FIFO (nass), Trocken-Verzögerung, Referenz-Verzögerung
      this.latency = F - 1;
      let q = 1; while (q < 4 * F) q <<= 1; this.wf = new Float32Array(q); this.wfMask = q - 1; this.wfR = 0; this.wfW = H - 1; this.wfN = H - 1;   // H−1 Nullen vorab
      let d = 1; while (d < this.latency + 2) d <<= 1; this.dry = new Float32Array(d); this.dryMask = d - 1; this.dryW = 0;
      const maxDel = Math.ceil((o.maxDelay || 1) * sr) + 1; let r = 1; while (r < maxDel) r <<= 1;
      this.refR = new Float32Array(r); this.refMask = r - 1; this.refW = 0; this.delay = 0;
      this.hp = hpCoefs(sr, 80); this.st[0] = 0; this.st[1] = 0;
      this.st[2] = 0; this.amtT = 0; this.amtStep = 1 / Math.max(1, Math.round(0.02 * sr));
      this.way = 'hear'; this.under = 0; this.rate = 1; this.offline = !!o.offline;   // offline: kein HP/Mischen hier (macht clean() phasenfrei)   // rate: Faktor auf die Lernrate nach dem Einlernen (langsames Nachlernen)
      this.resetAec();
      this.setAmount(o.amount != null ? o.amount : 1, true);
    }
    get leak() { return this.st[5]; }
    get sEcho() { return this.st[7]; }
    get sErr() { return this.st[8]; }
    resetAec() {
      const {P} = this;
      this.Wr.fill(0); this.Wi.fill(0); this.Xr.fill(0); this.Xi.fill(0); this.xOld.fill(0);
      this.pow.fill(0); this.Eh.fill(0); this.Yh.fill(0);
      const dec = Math.exp(-2.4 / P); let s = 0; this.prop[0] = 0.7; for (let i = 1; i < P; i++) this.prop[i] = this.prop[i - 1] * dec;
      for (let i = 0; i < P; i++) s += this.prop[i]; for (let i = 0; i < P; i++) this.prop[i] = 0.8 * this.prop[i] / s;
      this.st[3] = 1; this.st[4] = 1; this.st[5] = 1; this.adapted = false; this.st[6] = 0; this.cnt = 0; this.resets = 0;
      this.st[7] = 0; this.st[8] = 0;
    }
    resetStreams() {   // Puffer leeren, Filter behalten
      this.fill = 0; this.xOld.fill(0); this.Xr.fill(0); this.Xi.fill(0);
      this.eR.fill(0); this.yR.fill(0); this.eCnt = 0; this.ola.fill(0);
      this.wf.fill(0); this.wfR = 0; this.wfW = this.H - 1; this.wfN = this.H - 1; this.dry.fill(0); this.dryW = 0;
      this.refR.fill(0); this.refW = 0; this.st[0] = 0; this.st[1] = 0; this.Gp.fill(1); this.gp.fill(1); this.under = 0;
      this.st[7] = 0; this.st[8] = 0;
    }
    // Rest-Echo-Profil: im 1. Lauf je Rahmen und Frequenz 10·log10(|E|²/|Y|²) (1 dB, Int8) und je Rahmen das
    // Gesamtverhältnis merken; ρ_k = Mittel über die Rahmen mit dem kleinsten Gesamtverhältnis (≈ ohne Stimme).
    startProfile(nFrames) { this.pd = new Int8Array((nFrames + 4) * this.KF); this.pr = new Float32Array(nFrames + 4); this.pn = 0; this.collect = true; }
    endProfile(q = 0.3) {
      this.collect = false; if (!this.pd || this.pn < 8) { this.pd = this.pr = null; return null; }
      const KF = this.KF, n = this.pn, r = Array.from(this.pr.subarray(0, n)).filter(v => v > -900).sort((a, b) => a - b);
      if (r.length < 8) { this.pd = this.pr = null; return null; }
      const th = r[Math.floor(q * (r.length - 1))], prof = new Float64Array(KF), cnt = new Float64Array(KF);
      for (let m = 0; m < n; m++) {
        if (this.pr[m] < -900 || this.pr[m] > th) continue;
        for (let k = 0; k < KF; k++) { const d = this.pd[m * KF + k]; if (d === -128) continue; prof[k] += Math.pow(10, d / 10); cnt[k]++; }
      }
      for (let k = 0; k < KF; k++) prof[k] = cnt[k] >= 4 ? Math.min(1, prof[k] / cnt[k]) : this.st[5];
      this.pd = this.pr = null; return prof;
    }
    setResidualProfile(p) { this.prof = p ? Float64Array.from(p) : null; }
    setDelay(n) { this.delay = Math.max(0, Math.min(this.refMask - this.N, Math.round(+n || 0))); }
    setWay(w) { this.way = w === 'notes' ? 'notes' : 'hear'; }
    setNoisePsd(p) { if (p) { for (let k = 0; k < this.KF; k++) this.noise[k] = ok(p[k]); this.noiseFixed = true; } else this.noiseFixed = false; }
    setAmount(a, now) { a = ok(+a); this.amtT = a < 0 ? 0 : a > 1 ? 1 : a; if (now) this.st[2] = this.amtT; }
    exportState() {
      return {N: this.N, P: this.P, Wr: this.Wr.slice(), Wi: this.Wi.slice(), pow: this.pow.slice(), Eh: this.Eh.slice(), Yh: this.Yh.slice(),
        prop: this.prop.slice(), Pey: this.st[3], Pyy: this.st[4], leak: this.st[5], adapted: this.adapted, sumAdapt: this.st[6], delay: this.delay};
    }
    importState(s) {
      if (!s || s.N !== this.N || s.P !== this.P) return false;
      this.Wr.set(s.Wr); this.Wi.set(s.Wi); this.pow.set(s.pow); this.Eh.set(s.Eh); this.Yh.set(s.Yh); this.prop.set(s.prop);
      this.st[3] = s.Pey; this.st[4] = s.Pyy; this.st[5] = s.leak; this.adapted = s.adapted; this.st[6] = s.sumAdapt; this.setDelay(s.delay);
      return true;
    }

    // ---- ein MDF-Block (N Samples): Echo schätzen, abziehen, Filter nachführen ----
    _aec() {
      const {N, M, K, P, tr, ti, Wr, Wi, Xr, Xi, Yr, Yi, Er, Ei, Rf, Yf, pw1, pow, mb, rb, eb, yb} = this;
      const sM = 1 / M;
      // 1. neue Referenz-Partition X = FFT([alt, neu]) / M
      for (let i = 0; i < N; i++) { tr[i] = this.xOld[i]; tr[i + N] = rb[i]; ti[i] = 0; ti[i + N] = 0; }
      this.fm.fwd(tr, ti);
      this.head = (this.head + P - 1) % P; const h0 = this.head * K;
      let Sxx = 0; for (let i = 0; i < N; i++) { Sxx += rb[i] * rb[i]; this.xOld[i] = rb[i]; }
      for (let k = 0; k < K; k++) { Xr[h0 + k] = tr[k] * sM; Xi[h0 + k] = ti[k] * sM; }
      // 2. Echo-Schätzung Y = Σ W[p]·X[alt p]
      Yr.fill(0); Yi.fill(0);
      for (let p = 0; p < P; p++) {
        const w0 = p * K, x0 = ((this.head + p) % P) * K;
        for (let k = 0; k < K; k++) {
          const wr = Wr[w0 + k], wi = Wi[w0 + k], xr = Xr[x0 + k], xi = Xi[x0 + k];
          Yr[k] += wr * xr - wi * xi; Yi[k] += wr * xi + wi * xr;
        }
      }
      for (let k = 0; k < K; k++) { tr[k] = Yr[k]; ti[k] = Yi[k]; }
      for (let k = K; k < M; k++) { tr[k] = Yr[M - k]; ti[k] = -Yi[M - k]; }
      this.fm.inv(tr, ti);
      // 3. Fehler e = d − y
      let See = 0, Syy = 0, Sey = 0, Sdd = 0;
      for (let i = 0; i < N; i++) {
        const y = tr[i + N], e = mb[i] - y;
        yb[i] = y; eb[i] = e; See += e * e; Syy += y * y; Sey += e * y; Sdd += mb[i] * mb[i];
      }
      // Plausibilität: bei NaN/Explosion Filter zurücksetzen, Mikro durchreichen
      if (!(See >= 0 && Syy >= 0 && Sxx >= 0) || !(Syy < N * 1e9 && Sxx < N * 1e9 && See < N * 1e10)) {
        this.resetAec(); this.resets++; for (let i = 0; i < N; i++) { yb[i] = 0; eb[i] = mb[i]; } return;
      }
      this.st[7] += Syy; this.st[8] += See;
      See = Math.max(See, N * 100);
      // 4. E = FFT([0, e]) und Y' = FFT([0, y]) in einem komplexen Lauf
      for (let i = 0; i < N; i++) { tr[i] = 0; ti[i] = 0; tr[i + N] = eb[i]; ti[i + N] = yb[i]; }
      this.fm.fwd(tr, ti);
      for (let k = 0; k < K; k++) {
        const j = (M - k) % M, ar = tr[k], ai = ti[k], br = tr[j], bi = -ti[j];
        const er = 0.5 * (ar + br) * sM, ei = 0.5 * (ai + bi) * sM, yr = 0.5 * (ai - bi) * sM, yi = -0.5 * (ar - br) * sM;
        Er[k] = er; Ei[k] = ei; Rf[k] = er * er + ei * ei; Yf[k] = yr * yr + yi * yi;
      }
      // 5. Lernrate (variabel, Leck-Schätzung durch Regression; bremst bei Doppelsprechen)
      const ss = this.ss, sa = this.specAvg;
      let Pey = 0, Pyy = 0;
      for (let k = 0; k < K; k++) {
        const xf = Xr[h0 + k] * Xr[h0 + k] + Xi[h0 + k] * Xi[h0 + k];
        pow[k] = dn((1 - ss) * pow[k] + 1 + ss * xf);
        const eh = Rf[k] - this.Eh[k], yh = Yf[k] - this.Yh[k];
        Pey += eh * yh; Pyy += yh * yh;
        this.Eh[k] = dn((1 - sa) * this.Eh[k] + sa * Rf[k]); this.Yh[k] = dn((1 - sa) * this.Yh[k] + sa * Yf[k]);
      }
      Pyy = Math.sqrt(Pyy); Pey = Pyy > 0 ? Pey / Pyy : 0;
      let t32 = this.beta0 * Syy; if (t32 > this.betaMax * See) t32 = this.betaMax * See;
      const al = t32 / See;
      this.st[3] = (1 - al) * this.st[3] + al * Pey; this.st[4] = (1 - al) * this.st[4] + al * Pyy;
      if (this.st[4] < 1) this.st[4] = 1;
      if (this.st[3] < 0.005 * this.st[4]) this.st[3] = 0.005 * this.st[4];
      if (this.st[3] > this.st[4]) this.st[3] = this.st[4];
      this.st[5] = this.st[3] / this.st[4];
      let RER = (0.0001 * Sxx + 3 * this.st[5] * Syy) / See;
      const lb = Sey * Sey / (1 + See * Syy); if (RER < lb) RER = lb; if (RER > 0.5) RER = 0.5;
      if (!this.adapted && this.st[6] > P && this.st[5] * Syy > 0.03 * Syy) this.adapted = true;
      if (this.adapted) {
        for (let k = 0; k < K; k++) {
          const e = Rf[k] + 1; let r = this.st[5] * Yf[k]; if (r > 0.5 * e) r = 0.5 * e;
          r = 0.7 * r + 0.3 * RER * e; pw1[k] = this.rate * r / (e * (pow[k] + 10));
        }
      } else {
        let rate = 0;
        if (Sxx > M * 1000) { let t = 0.25 * Sxx; if (t > 0.25 * See) t = 0.25 * See; rate = t / See; }
        for (let k = 0; k < K; k++) pw1[k] = rate / (pow[k] + 10);
        this.st[6] += rate;
      }
      // 6. Gradient: W[p] += prop[p]·pw1·conj(X)·E; dabei |W[p]|² für die proportionalen Schrittweiten sammeln
      const c2 = P > 1 ? 1 + (this.cnt % (P - 1)) : 0;
      let mx = 1, sum = 0;
      for (let p = 0; p < P; p++) {
        const w0 = p * K, x0 = ((this.head + p) % P) * K, g = this.prop[p];
        let t = 1;
        for (let k = 0; k < K; k++) {
          const xr = Xr[x0 + k], xi = Xi[x0 + k], s = g * pw1[k];
          const wr = Wr[w0 + k] + s * (xr * Er[k] + xi * Ei[k]), wi = Wi[w0 + k] + s * (xr * Ei[k] - xi * Er[k]);
          Wr[w0 + k] = wr; Wi[w0 + k] = wi; t += 2 * (wr * wr + wi * wi);
        }
        this.prop[p] = Math.sqrt(t); if (this.prop[p] > mx) mx = this.prop[p];
      }
      // 7. Zwangsbedingung (AUMDF): Partition 0 immer, dazu eine reihum (beide in einem komplexen FFT-Paar)
      this._constrain(0, c2);
      this.cnt++;
      // 8. Proportionale Schrittweiten je Partition (Summe 0,99)
      for (let p = 0; p < P; p++) { this.prop[p] += 0.1 * mx; sum += this.prop[p]; }
      for (let p = 0; p < P; p++) this.prop[p] = 0.99 * this.prop[p] / sum;
    }
    _constrain(p, q) {      // Partitionen p und q (q = 0: nur p): Z = W_p + i·W_q → IFFT → reell/imag = w_p/w_q
      const {N, M, K, tr, ti, Wr, Wi} = this, a = p * K, b = q * K, sM = 1 / M;
      for (let k = 0; k < K; k++) {
        const qr = q ? Wr[b + k] : 0, qi = q ? Wi[b + k] : 0;
        tr[k] = Wr[a + k] - qi; ti[k] = Wi[a + k] + qr;
        if (k > 0 && k < N) { tr[M - k] = Wr[a + k] + qi; ti[M - k] = -Wi[a + k] + qr; }
      }
      this.fm.inv(tr, ti);
      for (let i = N; i < M; i++) { tr[i] = 0; ti[i] = 0; }
      for (let i = 0; i < N; i++) { tr[i] *= sM; ti[i] *= sM; }
      this.fm.fwd(tr, ti);
      for (let k = 0; k < K; k++) {
        const j = (M - k) % M;
        Wr[a + k] = dn(0.5 * (tr[k] + tr[j])); Wi[a + k] = dn(0.5 * (ti[k] - ti[j]));
        if (q) { Wr[b + k] = dn(0.5 * (ti[k] + ti[j])); Wi[b + k] = dn(-0.5 * (tr[k] - tr[j])); }
      }
    }

    // ---- ein STFT-Rahmen: Nachfilter + Wiener; liefert H fertige Samples in den FIFO ----
    _frame() {
      const {F, H, KF, fr, fi, win, eR, yR, noise, psm, Gp, gp, ola} = this;
      for (let i = 0; i < F; i++) { fr[i] = eR[i] * win[i]; fi[i] = yR[i] * win[i]; }
      this.ff.fwd(fr, fi);
      const notes = this.way === 'notes';
      const a = this.st[2], floor = Math.pow(10, (-6 - 18 * a) / 20), post = 1.5 * a, leak = this.st[5];
      this.nFrames++;
      let sPe = 0, sPy = 0;
      for (let k = 0; k < KF; k++) {
        const j = (F - k) % F, ar = fr[k], ai = fi[k], br = fr[j], bi = -fi[j];
        const er = 0.5 * (ar + br), ei = 0.5 * (ai + bi), yr = 0.5 * (ai - bi), yi = -0.5 * (ar - br);
        const pe = er * er + ei * ei, py = yr * yr + yi * yi;
        let G = 1;
        if (this.collect) {
          let d = -128;
          if (py > 1e-14) { d = Math.round(10 * Math.log10(pe / py + 1e-12)); if (d < -100) d = -100; else if (d > 100) d = 100; }
          if (this.pn * KF + k < this.pd.length) this.pd[this.pn * KF + k] = d;
          sPe += pe; sPy += py;
        }
        if (!notes) {
          if (!this.noiseFixed) {          // Rauschen nachführen (Minimum, langsam steigend)
            psm[k] = this.nFrames < 3 ? pe : dn(0.85 * psm[k] + 0.15 * pe);
            if (this.nFrames < 3 || psm[k] < noise[k]) noise[k] = psm[k]; else noise[k] = dn(noise[k] * 1.002 + 1e-20);
          }
          const nz = this.noiseFixed ? noise[k] : 1.5 * noise[k];
          const rho = this.prof ? this.prof[k] : leak;
          const D = nz + post * rho * py + 1e-20, gam = pe / D;
          const xi = 0.98 * Gp[k] * Gp[k] * gp[k] + 0.02 * (gam > 1 ? gam - 1 : 0);
          G = xi / (1 + xi); if (!(G >= floor)) G = floor; if (G > 1) G = 1;
          Gp[k] = G; gp[k] = gam < 1e3 ? gam : 1e3;
        }
        fr[k] = er * G; fi[k] = ei * G;
      }
      if (this.collect && this.pn < this.pr.length) { this.pr[this.pn] = sPy > 1e-10 ? 10 * Math.log10(sPe / sPy + 1e-12) : -999; this.pn++; }
      for (let k = KF; k < F; k++) { fr[k] = fr[F - k]; fi[k] = -fi[F - k]; }
      this.ff.inv(fr, fi);
      const sF = 1 / F;
      for (let i = 0; i < F; i++) ola[i] += fr[i] * sF * win[i];
      // H fertige Samples ausgeben (mit Hochpass im Hör-Weg)
      const c = this.hp;
      for (let i = 0; i < H; i++) {
        let v = ola[i];
        if (!notes && !this.offline) {
          const y = c.b0 * v + this.st[0]; this.st[0] = dn(c.b1 * v - c.a1 * y + this.st[1]); this.st[1] = dn(c.b2 * v - c.a2 * y); v = y;
        }
        this.wf[this.wfW] = v; this.wfW = (this.wfW + 1) & this.wfMask; this.wfN++;
      }
      ola.copyWithin(0, H); ola.fill(0, F - H);
    }

    process(mic, ref, out, n) {
      n = n == null ? mic.length : n;
      const {N, H, F} = this, SCi = 1 / SC;
      for (let i = 0; i < n; i++) {
        const m = ok(mic[i]), r = ref ? ok(ref[i]) : 0;
        this.refR[this.refW] = r;
        const rd = this.refR[(this.refW - this.delay) & this.refMask]; this.refW = (this.refW + 1) & this.refMask;
        this.dry[this.dryW] = m; this.dryW = (this.dryW + 1) & this.dryMask;   // ok() lässt endliche Werte bitgleich
        this.mb[this.fill] = m * SC; this.rb[this.fill] = rd * SC;
        if (++this.fill === N) {
          this.fill = 0; this._aec();
          // e und y in die STFT-Puffer (Schiebepuffer der Länge F)
          const o0 = F - H + (this.eCnt % H);
          for (let k = 0; k < N; k++) { this.eR[o0 + k] = this.eb[k] * SCi; this.yR[o0 + k] = this.yb[k] * SCi; }
          this.eCnt += N;
          if (this.eCnt % H === 0) { this._frame(); this.eR.copyWithin(0, H); this.yR.copyWithin(0, H); }
        }
        // Ausgabe
        if (this.st[2] !== this.amtT) { const d = this.amtT - this.st[2]; this.st[2] = Math.abs(d) <= this.amtStep ? this.amtT : this.st[2] + Math.sign(d) * this.amtStep; }
        const dry = this.dry[(this.dryW - 1 - this.latency) & this.dryMask];
        let wet = 0;
        if (this.wfN > 0) { wet = this.wf[this.wfR]; this.wfR = (this.wfR + 1) & this.wfMask; this.wfN--; } else this.under++;
        const w = this.way === 'notes' || this.offline ? 1 : Math.min(1, this.st[2] * 5);
        out[i] = w === 0 ? dry : w === 1 ? wet : dry + w * (wet - dry);
      }
    }
  }

  // ---- Laufzeit Referenz → Mikro (GCC-PHAT über bis zu 30 s) ----
  function estimateDelay(mic, ref, sr, o = {}) {
    const maxLag = Math.round((o.maxDelay || 0.5) * sr);
    let L = 1; while (L < 2 * maxLag) L <<= 1; const seg = L, n = 2 * L;
    const f = FFT(n), re = new Float64Array(n), im = new Float64Array(n), Sr = new Float64Array(n), Si = new Float64Array(n);
    const len = Math.min(mic.length, ref.length, Math.round((o.maxSec || 15) * sr));
    let used = 0;
    for (let a = 0; a + seg <= len || (a === 0 && len > maxLag); a += seg) {
      const e = Math.min(len, a + seg); let ex = 0;
      re.fill(0); im.fill(0);
      for (let i = a; i < e; i++) { re[i - a] = ok(mic[i]); im[i - a] = ok(ref[i]); ex += im[i - a] * im[i - a]; }
      if (ex < 1e-8 * (e - a)) continue;
      f.fwd(re, im);
      for (let k = 0; k < n; k++) {        // M = (Z_k + conj Z_-k)/2, R = (Z_k − conj Z_-k)/(2i); S += M·conj(R)
        const j = (n - k) % n, mr = 0.5 * (re[k] + re[j]), mi = 0.5 * (im[k] - im[j]), rr = 0.5 * (im[k] + im[j]), ri = -0.5 * (re[k] - re[j]);
        Sr[k] += mr * rr + mi * ri; Si[k] += mi * rr - mr * ri;
      }
      used++;
      if (e >= len) break;
    }
    if (!used) return 0;
    for (let k = 0; k < n; k++) { const m = Math.hypot(Sr[k], Si[k]) + 1e-20; re[k] = Sr[k] / m; im[k] = Si[k] / m; }
    f.inv(re, im);
    let mx = 0, at = 0; for (let l = 0; l <= maxLag; l++) if (re[l] > mx) { mx = re[l]; at = l; }
    for (let l = 0; l < at; l++) if (re[l] >= 0.5 * mx && re[l] >= re[l - 1 < 0 ? 0 : l - 1] && re[l] >= re[l + 1]) { at = l; break; }
    return at;
  }

  // ---- Rauschprofil aus leisen Stellen (gleiche STFT-Geometrie wie Cleaner) ----
  function noisePsd(e, sr, c, range) {
    const {F, H, KF, win} = c, f = FFT(F), re = new Float64Array(F), im = new Float64Array(F);
    const nF = Math.max(0, Math.floor((e.length - F) / H) + 1), en = new Float64Array(nF);
    let a0 = 0, a1 = nF;
    if (range) { a0 = Math.max(0, Math.floor(range[0] * sr / H)); a1 = Math.min(nF, Math.max(a0 + 1, Math.floor((range[1] * sr - F) / H) + 1)); }
    for (let m = 0; m < nF; m++) { let s = 0; for (let i = 0; i < F; i++) { const v = e[m * H + i]; s += v * v; } en[m] = s; }
    let pick;
    if (range) pick = m => m >= a0 && m < a1;
    else {
      const s = Array.from(en).filter(v => v > 1e-12 * F).sort((x, y) => x - y);
      if (!s.length) return null;
      const th = s[Math.min(s.length - 1, Math.max(9, Math.floor(s.length * 0.1)))];
      pick = m => en[m] > 1e-12 * F && en[m] <= th;
    }
    const psd = new Float64Array(KF); let cnt = 0;
    for (let m = 0; m < nF; m++) {
      if (!pick(m)) continue;
      for (let i = 0; i < F; i++) { re[i] = e[m * H + i] * win[i]; im[i] = 0; }
      f.fwd(re, im);
      for (let k = 0; k < KF; k++) psd[k] += re[k] * re[k] + im[k] * im[k];
      cnt++;
    }
    if (!cnt) return null;
    for (let k = 0; k < KF; k++) psd[k] /= cnt;
    return psd;
  }

  // Hochpass 80 Hz vorwärts und rückwärts (phasenfrei, offline)
  function hpZero(x, sr) {
    const c = hpCoefs(sr, 80), n = x.length; let h1 = 0, h2 = 0;
    const pass = (from, to, st) => {
      h1 = 0; h2 = 0;
      for (let i = from; i !== to; i += st) {
        const v = x[i], y = c.b0 * v + h1; h1 = dn(c.b1 * v - c.a1 * y + h2); h2 = dn(c.b2 * v - c.a2 * y); x[i] = y;
      }
    };
    pass(0, n, 1); pass(n - 1, -1, -1);
    return x;
  }

  function run(c, mic, ref, n) {     // Block-Verarbeiter offline durchlaufen lassen, Latenz entfernen
    const L = c.latency, out = new Float32Array(n), B = 1024;
    const bm = new Float32Array(B), br = new Float32Array(B), bo = new Float32Array(B);
    for (let a = 0; a < n + L; a += B) {
      const len = Math.min(B, n + L - a);
      for (let i = 0; i < len; i++) { const j = a + i; bm[i] = j < n ? mic[j] : 0; br[i] = ref && j < ref.length ? ref[j] : 0; }
      c.process(bm, br, bo, len);
      for (let i = 0; i < len; i++) { const j = a + i - L; if (j >= 0 && j < n) out[j] = bo[i]; }
    }
    return out;
  }

  function clean(mic, ref, sr, o = {}) {
    const t0 = Date.now(), info = o.info || {};
    const amount = o.amount == null ? 1 : +o.amount;
    if (!(amount > 0)) { info.way = 'aus'; info.ms = 0; return Float32Array.from(mic); }    // 0 % = bitgleich
    const n = mic.length, way = o.way === 'notes' ? 'notes' : 'hear';
    const hasRef = !!ref && ref.some(v => v !== 0);
    const delay = o.delay != null ? Math.round(o.delay) : hasRef ? estimateDelay(mic, ref, sr) : 0;
    const c = new Cleaner(sr, {tail: o.tail, amount, offline: true});
    const margin = Math.round(0.0025 * sr);
    c.setDelay(Math.max(0, delay - margin));
    let out;
    if (o.passes === 1) { c.setWay(way); c.setAmount(amount, true); out = run(c, mic, ref, n); }
    else {
      // 1. Lauf: nur Echo-Abzug (lernt den Weg, liefert das Signal für das Rauschprofil)
      const n1 = Math.min(n, Math.round((o.learnSec || 20) * sr));
      c.setWay('notes'); c.setAmount(1, true); c.startProfile(Math.ceil((n1 + c.latency) / c.H) + 2);
      const e1 = run(c, mic, ref, n1);
      info.echoDb = +(10 * Math.log10((c.sEcho + 1e-9) / (c.sErr + 1e-9))).toFixed(1);
      const st = c.exportState(), psd = way === 'hear' ? noisePsd(e1, sr, c, o.noiseRange) : null, prof = c.endProfile(0.3);
      // 2. Lauf: warmes Filter, gewählter Weg
      c.resetStreams(); c.importState(st); c.rate = o.relearn != null ? +o.relearn : 0.1; c.setWay(way); c.setAmount(amount, true); c.setNoisePsd(psd); c.setResidualProfile(prof);
      out = run(c, mic, ref, n);
    }
    if (way === 'hear') {          // HP phasenfrei, dann trocken/nass mischen (wie im Block-Verarbeiter: voll nass ab 20 %)
      hpZero(out, sr);
      const w = Math.min(1, amount * 5);
      if (w < 1) for (let i = 0; i < n; i++) out[i] = mic[i] + w * (out[i] - mic[i]);
    }
    Object.assign(info, {delay, way: way === 'notes' ? '1E' : '1E+NF+W+HP', leak: +c.leak.toFixed(4), resets: c.resets,
      hint: info.echoDb != null && info.echoDb > 0 ? 'Kopfhörer oder leiser' : '', ms: Date.now() - t0});
    return out;
  }

  // ---- NLMS im Zeitbereich (Vergleich; für lange Wege zu teuer) ----
  function nlms(mic, ref, taps, mu = 0.5) {
    const n = mic.length, out = new Float32Array(n), w = new Float64Array(taps), xb = new Float64Array(taps);
    let pw = 0, p = 0;
    for (let i = 0; i < n; i++) {
      const x = ok(ref[i]), old = xb[p]; pw += x * x - old * old; xb[p] = x;
      let y = 0, q = p;
      for (let k = 0; k < taps; k++) { y += w[k] * xb[q]; q = q === 0 ? taps - 1 : q - 1; }
      const e = ok(mic[i]) - y; out[i] = e;
      const g = mu * e / (pw + 1e-6); q = p;
      for (let k = 0; k < taps; k++) { w[k] = dn(w[k] + g * xb[q]); q = q === 0 ? taps - 1 : q - 1; }
      p = p + 1 === taps ? 0 : p + 1;
    }
    return out;
  }

  return {clean, Cleaner, estimateDelay, nlms, VERSION: 'vs4-clean-1'};
}

const api = factory();
export const {clean, Cleaner, estimateDelay, nlms, VERSION} = api;
export function srcText() { return '(' + factory.toString() + ')()'; }
export default api;
