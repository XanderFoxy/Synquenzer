/* G2 Tonhöhe: DSP-Kern (Nachtrag 5 G2, G6, G7). Läuft im Worker (Quelltext als Blob) und im Hauptfaden (Rückfall, Tests).
   Keine DOM-Zugriffe, keine äußeren Namen außer dem übergebenen VS2-Kern (vsDspMake: pyin, segment).
   analyse(x, sr, V)  → {sr, hop (s), n, f0 (Hz je 5-ms-Frame, fein auf voller Rate; 0 = stimmlos), notes: [{t0, t1, m}]}
       pYIN (VS2) auf ≈16 kHz, Noten = VS2-Segmente; Periode je Frame auf voller Rate nachgemessen (YIN-Differenz ±6 %,
       Parabel), Notenhöhe = Median des Kerns (wie VS2 center) aus der feinen Spur.
   render(x, sr, an, plan) → Float32Array (gleich lang). plan = {mode 'soft'|'hard', notes: [{t0, t1, m, to, s, e}]}
       Verschiebung je Note in Cent: e + s·(to − m)·100 (Weich: konstant, Vibrato bleibt) bzw. e + s·(to − f(t))·100
       (Hart: folgt der Stimme, Vibrato und Gleiten werden eingerastet). TD-PSOLA (formant-erhaltend: jede Periode behält
       ihre Form, nur der Abstand ändert sich) NUR in stimmhaften Strecken mit einer verschobenen Note; stimmlose Laute,
       Zisch- und Plosivlaute, Atmer und alles außerhalb bleiben bitgleich. Übergänge: 15 ms Schutz an jedem Rand der
       stimmhaften Strecke (dort klingt noch der Konsonant), dann 10-ms-Kosinus-Blende; zwischen Noten gleitet die
       Verschiebung über 40 ms (Weich) bzw. 15 ms (Hart). Ohne Verschiebung: Ausgabe = Eingabe (bitgleich). */
function g2PitchMake() {
'use strict';
const midi = f => 69 + 12 * Math.log2(f / 440);
const med = a => { if (!a.length) return NaN; const b = Float64Array.from(a).sort(); const k = b.length >> 1; return b.length % 2 ? b[k] : (b[k - 1] + b[k]) / 2; };
// Dezimieren um D (gefensterter Sinc, linearphasig, Laufzeit ausgeglichen)
function decim(x, sr) {
  const D = Math.max(1, Math.round(sr / 16000)), fs = sr / D;
  if (D === 1) return {y: Float32Array.from(x), fs, D};
  const L = 12 * D, h = new Float64Array(2 * L + 1), fc = 0.45 / D; let s = 0;
  for (let k = -L; k <= L; k++) { const t = k, sinc = t === 0 ? 2 * fc : Math.sin(2 * Math.PI * fc * t) / (Math.PI * t), w = 0.42 + 0.5 * Math.cos(Math.PI * k / L) + 0.08 * Math.cos(2 * Math.PI * k / L); h[k + L] = sinc * w; s += h[k + L]; }
  for (let k = 0; k < h.length; k++) h[k] /= s;
  const n = Math.floor(x.length / D), y = new Float32Array(n);
  for (let i = 0; i < n; i++) { const c = i * D; let v = 0; const a = Math.max(-L, -c), b = Math.min(L, x.length - 1 - c); for (let k = a; k <= b; k++) v += h[k + L] * x[c + k]; y[i] = v; }
  return {y, fs, D};
}
function analyse(x, sr, V) {
  const d = decim(x, sr), fs = d.fs, hop = Math.max(1, Math.round(fs * 0.005));
  const tr = V.pyin(d.y, {fs, hop, fmin: 55, fmax: 1050});
  const sg = V.segment(tr, {snap: false, tuning: 0});
  const H = hop * d.D / sr, n = tr.n, f0 = new Float32Array(n), ap = new Float32Array(n);
  // feine Periode je Frame auf voller Rate
  for (let i = 0; i < n; i++) {
    const f = tr.f0[i]; if (!(f > 0)) continue;
    const c = Math.round(i * H * sr), t0 = sr / f, lo = Math.max(2, Math.floor(t0 * 0.94)), hi = Math.ceil(t0 * 1.06) + 1;
    const W = Math.round(Math.max(2.5 * t0, 0.025 * sr)), a = c - (W >> 1) - (hi >> 1);
    if (a < 0 || a + W + hi + 1 >= x.length) { f0[i] = f; continue; }
    let best = -1, bv = Infinity; const dv = new Float64Array(hi - lo + 1); let e = 0;
    for (let j = 0; j < W; j++) e += x[a + j] * x[a + j];
    for (let t = lo; t <= hi; t++) { let s = 0; for (let j = 0; j < W; j++) { const q = x[a + j] - x[a + j + t]; s += q * q; } dv[t - lo] = s; if (s < bv) { bv = s; best = t; } }
    let tau = best;
    if (best > lo && best < hi) { const y0 = dv[best - 1 - lo], y1 = dv[best - lo], y2 = dv[best + 1 - lo], den = y0 - 2 * y1 + y2; if (den > 0) tau = best + Math.max(-1, Math.min(1, 0.5 * (y0 - y2) / den)); }
    f0[i] = sr / tau; ap[i] = e > 0 ? bv / (2 * e) : 1;
  }
  const notes = [];
  for (const nt of sg.notes) {
    const a = Math.round(nt.t0 / H), b = Math.round(nt.t1 / H), len = b - a;
    const s = a + Math.min(12, Math.floor(len * 0.25)), t = b - Math.min(6, Math.floor(len * 0.15)), v = [];
    for (let k = s; k < Math.max(t, s + 1); k++) if (k >= 0 && k < n && f0[k] > 0) v.push(midi(f0[k]));
    let m = med(v); if (!(m === m)) m = nt.m;
    notes.push({t0: +nt.t0.toFixed(4), t1: +nt.t1.toFixed(4), m: +m.toFixed(3)});
  }
  return {sr, hop: H, n, f0, ap, notes};
}
// Verschiebung (Cent) je Frame + aktive stimmhafte Strecken
function curve(an, plan) {
  const n = an.n, H = an.hop, f0 = an.f0, c = new Float64Array(n), has = new Uint8Array(n), hard = plan.mode === 'hard';
  const fm = new Float64Array(n);
  for (let i = 0; i < n; i++) {   // 3-Frame-Median der Stimme (Hart)
    const v = []; for (let k = i - 1; k <= i + 1; k++) if (k >= 0 && k < n && f0[k] > 0) v.push(midi(f0[k]));
    fm[i] = v.length ? med(v) : NaN;
  }
  for (const nt of plan.notes || []) {
    const a = Math.max(0, Math.floor(nt.t0 / H)), b = Math.min(n, Math.ceil(nt.t1 / H)), e = +nt.e || 0, s = +nt.s || 0, to = +nt.to, m = +nt.m;
    for (let i = a; i < b; i++) {
      let v = e;
      if (s && to === to) v += s * 100 * (to - (hard && fm[i] === fm[i] ? fm[i] : m));
      c[i] = v; has[i] = 1;
    }
  }
  // stimmhafte Strecken; eine Strecke ist aktiv, wenn eine Note darin verschoben wird
  const runs = [];
  for (let i = 0; i < n;) {
    if (!(f0[i] > 0)) { i++; continue; }
    let j = i; while (j < n && f0[j] > 0) j++;
    let act = false; for (let k = i; k < j; k++) if (has[k] && Math.abs(c[k]) > 0.05) { act = true; break; }
    if (act) {
      // Lücken (Frames ohne Note) mit dem Nachbarn füllen
      let last = NaN, first = NaN; for (let k = i; k < j; k++) { if (has[k]) { last = c[k]; if (!(first === first)) first = c[k]; } else if (last === last) c[k] = last; }
      for (let k = i; k < j && !has[k]; k++) c[k] = first;
      runs.push([i, j]);
    }
    i = j;
  }
  // Glätten (gleiten zwischen Noten): Weich 40 ms, Hart 15 ms (gleitender Mittelwert in der Strecke)
  const R = Math.max(1, Math.round((hard ? 0.015 : 0.04) / H / 2)), cs = new Float64Array(n);
  for (const [i, j] of runs) for (let k = i; k < j; k++) { let s = 0, q = 0; for (let r = Math.max(i, k - R); r <= Math.min(j - 1, k + R); r++) { s += c[r]; q++; } cs[k] = s / q; }
  return {c: cs, runs};
}
// Harmonisches Modell je stimmhafter Strecke (einmal je Take, im Analyse-Ergebnis): Phase Φ(t) = ∫2π f0, alle 5 ms die
// komplexen Teilton-Amplituden c_h (Hann über 3 Perioden, Chirp-fest über Φ), Teiltöne bis 7 kHz
const HMAX = 64, FTOP = 7000;
function model(x, sr, an) {
  const n = x.length, Hs = an.hop * sr, f0 = an.f0, G = Math.round(0.015 * sr), runs = [];
  for (let i = 0; i < an.n;) {
    if (!(f0[i] > 0)) { i++; continue; }
    let j = i; while (j < an.n && f0[j] > 0) j++;
    const A = Math.round(i * Hs) + G, B = Math.min(n, Math.round((j - 1) * Hs) - G);
    if (B - A >= Math.round(0.03 * sr)) {
      const L = B - A, fs = new Float32Array(L), ph = new Float64Array(L);
      for (let q = 0; q < L; q++) { const p = Math.min(j - 1, Math.max(i, (A + q) / Hs)), k = Math.floor(p), fr = p - k; fs[q] = k + 1 < j ? f0[k] + (f0[k + 1] - f0[k]) * fr : f0[k]; }
      let P = 0; for (let q = 0; q < L; q++) { ph[q] = P; P += 2 * Math.PI * fs[q] / sr; }
      const step = Math.round(0.005 * sr), nf = Math.floor((L - 1) / step) + 1, re = new Float32Array(nf * HMAX), im = new Float32Array(nf * HMAX), H = new Uint8Array(nf);
      // Φ außerhalb der Strecke (Fenster ragt hinaus): linear fortgesetzt
      const phA = q => q < 0 ? ph[0] + 2 * Math.PI * fs[0] / sr * q : q >= L ? ph[L - 1] + 2 * Math.PI * fs[L - 1] / sr * (q - L + 1) : ph[q];
      for (let k = 0; k < nf; k++) {
        const c = k * step, f = fs[Math.min(L - 1, c)], N = Math.max(16, Math.round(3 * sr / f)), h2 = N >> 1, Hk = Math.min(HMAX, Math.floor(FTOP / f));
        H[k] = Hk; let sw = 0; const zr = new Float64Array(N), zi = new Float64Array(N), xr = new Float64Array(N), xm = new Float64Array(N);
        for (let j2 = 0; j2 < N; j2++) { const q = c - h2 + j2, w = 0.5 - 0.5 * Math.cos(2 * Math.PI * (j2 + 0.5) / N), v = A + q >= 0 && A + q < n ? x[A + q] : 0, p = phA(q); zr[j2] = Math.cos(p); zi[j2] = -Math.sin(p); xr[j2] = w * v; xm[j2] = w * v; sw += w; }
        // xr/xm = gewichtetes Signal mal e^{-i h Φ} (fortlaufend je Teilton)
        for (let j2 = 0; j2 < N; j2++) xm[j2] = 0;
        for (let h = 1; h <= Hk; h++) {
          let sr2 = 0, si2 = 0;
          for (let j2 = 0; j2 < N; j2++) { const a = xr[j2], b = xm[j2], r2 = a * zr[j2] - b * zi[j2], i2 = a * zi[j2] + b * zr[j2]; xr[j2] = r2; xm[j2] = i2; sr2 += r2; si2 += i2; }
          re[k * HMAX + h - 1] = 2 * sr2 / sw; im[k * HMAX + h - 1] = 2 * si2 / sw;
        }
      }
      runs.push({i0: i, i1: j, A, B, step, nf, fs, ph, re, im, H});
    }
    i = j;
  }
  return runs;
}
// Teilton-Koeffizient (Betrag/Phase) zwischen den Frames: Betrag linear, Phase auf dem kürzeren Bogen
function coef(R, q, h, out) {
  const p = Math.min(R.nf - 1, q / R.step), k = Math.floor(p), fr = p - k, k2 = Math.min(R.nf - 1, k + 1);
  const hh = h - 1, a = k * HMAX + hh, b = k2 * HMAX + hh;
  const ha = h <= R.H[k], hb = h <= R.H[k2];
  const ar = ha ? R.re[a] : 0, ai = ha ? R.im[a] : 0, br = hb ? R.re[b] : 0, bi = hb ? R.im[b] : 0;
  const ma = Math.hypot(ar, ai), mb = Math.hypot(br, bi), m = ma + (mb - ma) * fr;
  let pa = Math.atan2(ai, ar), pb = Math.atan2(bi, br); if (!ma) pa = pb; if (!mb) pb = pa;
  let d = pb - pa; d -= 2 * Math.PI * Math.round(d / (2 * Math.PI));
  out[0] = m; out[1] = pa + d * fr; return out;
}
function render(x, sr, an, plan) {
  const y = Float32Array.from(x), n = x.length, H = an.hop;
  const {c, runs} = curve(an, plan);
  if (!an.mdl) an.mdl = model(x, sr, an);
  const RMP = Math.round(0.010 * sr), BLK = 32, o2 = [0, 0], o3 = [0, 0];
  let segs = 0;
  for (const [i0, i1] of runs) {
    const R = an.mdl.find(z => z.i0 === i0 && z.i1 === i1); if (!R) continue;
    const L = R.B - R.A; if (L < 2 * RMP + 8) continue;
    segs++;
    // Ziel-Phase Φ'(t) = ∫2π f0(t)·r(t), am Anfang der Strecke = Φ (gleiche Lage → die Blende löscht nichts aus)
    const ps = new Float64Array(L), rr = new Float32Array(L);
    { let P = R.ph[0]; for (let q = 0; q < L; q++) { const p = (R.A + q) / (H * sr), k = Math.min(an.n - 1, Math.max(0, Math.floor(p))), fr = Math.min(1, Math.max(0, p - k)), k2 = Math.min(an.n - 1, k + 1);
      const cc = c[k] + (c[k2] - c[k]) * fr, r = Math.pow(2, cc / 1200); rr[q] = r; ps[q] = P; P += 2 * Math.PI * R.fs[q] * r / sr; } }
    const Cm = new Float64Array(2 * HMAX), Cm2 = new Float64Array(2 * HMAX), Cs = new Float64Array(2 * HMAX), Cs2 = new Float64Array(2 * HMAX);
    // Koeffizienten an der Blockgrenze q: Original (h ganz) und verschoben (Hülle an der neuen Frequenz h·f0·r, Phase des nächsten Teiltons)
    const setC = (q, M, S) => {
      const k = Math.min(R.nf - 1, Math.round(q / R.step)), Hk = R.H[k], f = R.fs[Math.min(L - 1, q)], r = rr[Math.min(L - 1, q)];
      for (let h = 1; h <= HMAX; h++) { if (h <= Hk) { coef(R, q, h, o2); M[2 * h - 2] = o2[0] * Math.cos(o2[1]); M[2 * h - 1] = o2[0] * Math.sin(o2[1]); } else { M[2 * h - 2] = 0; M[2 * h - 1] = 0; } }
      for (let h = 1; h <= HMAX; h++) {
        const kk = h * r, F = kk * f; if (F >= FTOP || kk > Hk + 0.5 || F >= 0.45 * sr) { S[2 * h - 2] = 0; S[2 * h - 1] = 0; continue; }
        const lo = Math.max(1, Math.floor(kk)), hi = Math.min(Hk, lo + 1), fr = Math.min(1, Math.max(0, kk - lo));
        coef(R, q, lo, o2); coef(R, q, hi, o3);
        const la = Math.log(o2[0] + 1e-9), lb = Math.log(o3[0] + 1e-9), m = kk < 1 ? o2[0] : Math.exp(la + (lb - la) * fr), p = fr < 0.5 ? o2[1] : o3[1];
        S[2 * h - 2] = m * Math.cos(p); S[2 * h - 1] = m * Math.sin(p);
      }
    };
    setC(0, Cm, Cs);
    for (let b0 = 0; b0 < L; b0 += BLK) {
      const b1 = Math.min(L, b0 + BLK); setC(Math.min(L - 1, b1), Cm2, Cs2);
      for (let q = b0; q < b1; q++) {
        const u = (q - b0) / BLK, P = R.ph[q], Q = ps[q], zr = Math.cos(P), zi = Math.sin(P), wr = Math.cos(Q), wi = Math.sin(Q);
        let pr = 1, pi = 0, sr_ = 1, si_ = 0, mo = 0, ms = 0;
        for (let h = 1; h <= HMAX; h++) {
          const t1 = pr * zr - pi * zi; pi = pr * zi + pi * zr; pr = t1;
          const t2 = sr_ * wr - si_ * wi; si_ = sr_ * wi + si_ * wr; sr_ = t2;
          const k2 = 2 * h - 2, ar = Cm[k2] + (Cm2[k2] - Cm[k2]) * u, ai = Cm[k2 + 1] + (Cm2[k2 + 1] - Cm[k2 + 1]) * u, br = Cs[k2] + (Cs2[k2] - Cs[k2]) * u, bi = Cs[k2 + 1] + (Cs2[k2 + 1] - Cs[k2 + 1]) * u;
          if (ar || ai) mo += ar * pr - ai * pi;
          if (br || bi) ms += br * sr_ - bi * si_;
          if (!(ar || ai || br || bi) && h > 2) break;
        }
        let w = 1; if (q < RMP) w = 0.5 - 0.5 * Math.cos(Math.PI * (q + 0.5) / RMP); else if (L - q <= RMP) w = 0.5 - 0.5 * Math.cos(Math.PI * (L - q - 0.5) / RMP);
        y[R.A + q] = x[R.A + q] + w * (ms - mo);
      }
      Cm.set(Cm2); Cs.set(Cs2);
    }
  }
  return {y, segs};
}
// Schlüssel für den Render-Cache (FNV-1a über den Plan)
function planKey(plan) {
  let h = 0x811c9dc5; const s = (plan.mode === 'hard' ? 'h' : 'w') + JSON.stringify((plan.notes || []).map(k => [k.t0, k.t1, k.m, k.to, k.s, k.e]));
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16);
}
const active = plan => (plan.notes || []).some(k => Math.abs(+k.e || 0) > 0.05 || ((+k.s || 0) > 0 && Math.abs(+k.to - +k.m) * 100 * k.s > 0.05) || (plan.mode === 'hard' && (+k.s || 0) > 0));
return {analyse, render, curve, planKey, active, midi, decim, VERSION: 'g2-hr-1'};
}
