function vsDspMake() {
  const FFTS = {};
  function fftTab(N) {
    if (FFTS[N]) return FFTS[N];
    const rev = new Uint32Array(N), cs = new Float64Array(N / 2), sn = new Float64Array(N / 2); let b = 0; while ((1 << b) < N) b++;
    for (let i = 0; i < N; i++) { let r = 0; for (let k = 0; k < b; k++) r |= ((i >> k) & 1) << (b - 1 - k); rev[i] = r; }
    for (let i = 0; i < N / 2; i++) { cs[i] = Math.cos(2 * Math.PI * i / N); sn[i] = -Math.sin(2 * Math.PI * i / N); }
    return (FFTS[N] = {rev, cs, sn});
  }
  // radix-2 in place; inv: conjugate twiddles, no scaling
  function fft(re, im, inv) {
    const N = re.length, T = fftTab(N), rev = T.rev, cs = T.cs, sn = T.sn, sg = inv ? -1 : 1;
    for (let i = 0; i < N; i++) { const j = rev[i]; if (j > i) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; } }
    for (let s = 2; s <= N; s <<= 1) {
      const h = s >> 1, st = N / s;
      for (let i = 0; i < N; i += s) for (let k = 0; k < h; k++) {
        const wr = cs[k * st], wi = sg * sn[k * st];
        const a = i + k, c = a + h, xr = re[c] * wr - im[c] * wi, xi = re[c] * wi + im[c] * wr;
        re[c] = re[a] - xr; im[c] = im[a] - xi; re[a] += xr; im[a] += xi;
      }
    }
  }
  // Beta(2, 18): F(x) = 1 − (1 − x)^18 (1 + 18 x)
  const betaCdf = x => 1 - Math.pow(1 - x, 18) * (1 + 18 * x);
  const NTH = 100, TH = new Float64Array(NTH), TP = new Float64Array(NTH);
  for (let i = 0; i < NTH; i++) { TH[i] = (i + 1) / NTH; TP[i] = betaCdf(TH[i]) - betaCdf(i / NTH); }
  const midiOf = f => 69 + 12 * Math.log2(f / 440);
  // energy of harmonic h of f0 in frame x[s..s+W) (Goertzel with Hann)
  function harmE(x, s, W, fs, f, win) {
    if (f >= fs / 2) return 0;
    const w = 2 * Math.PI * f / fs, c = 2 * Math.cos(w); let s1 = 0, s2 = 0;
    for (let j = 0; j < W; j++) { const v = (x[s + j] || 0) * win[j] + c * s1 - s2; s2 = s1; s1 = v; }
    return s1 * s1 + s2 * s2 - c * s1 * s2;
  }
  function octLockF(x, s, W, fs, f, win) {
    for (let g = 0; g < 2; g++) {                           // höchstens zwei Oktaven hoch
      if (2 * f > 1600) break;
      const odd = harmE(x, s, W, fs, 3 * f, win) + harmE(x, s, W, fs, 5 * f, win) + harmE(x, s, W, fs, 7 * f, win);
      const even = harmE(x, s, W, fs, 2 * f, win) + harmE(x, s, W, fs, 4 * f, win) + harmE(x, s, W, fs, 6 * f, win);
      // nur verdoppeln, wenn die geraden Teiltöne den Grundton wirklich tragen (Sub-Oszillator/Unisono); reiner Ton, Pfeifen, Flöte bleiben
      if (even > 0 && odd < 0.1 * even && even > 0.5 * harmE(x, s, W, fs, f, win)) f *= 2; else break;
    }
    return f;
  }
  /* pYIN-lite. x: Float32Array (fs), o: {fs, hop, fmin, fmax, mask (Uint8Array je Frame), octLock, from, to (Frames)} */
  function pyin(x, o) {
    o = o || {};
    const fs = o.fs || 16000, hop = o.hop || Math.round(fs * 0.005), fmin = o.fmin || 55, fmax = o.fmax || 1050;
    const N = 1024 * Math.max(1, Math.round(fs / 16000)), tauMax = Math.ceil(fs / fmin) + 1, W = N - tauMax - 1, tauMin = Math.max(2, Math.floor(fs / fmax));
    const M = 2 * N, nF = Math.max(0, Math.floor((x.length - 1) / hop) + 1);
    const BPS = 5, nB = Math.floor(12 * BPS * Math.log2(fmax / fmin)) + 1;
    const re = new Float64Array(M), im = new Float64Array(M), d = new Float64Array(tauMax + 2), dn = new Float64Array(tauMax + 2), cum = new Float64Array(N + 1);
    const vp = new Float32Array(nF), rms = new Float32Array(nF), e10 = new Float32Array(nF), cands = new Array(nF);
    const h10 = Math.round(fs * 0.01);
    const win = new Float64Array(W); for (let j = 0; j < W; j++) win[j] = 0.5 - 0.5 * Math.cos(2 * Math.PI * j / (W - 1));
    const mask = o.mask || null;
    for (let i = 0; i < nF; i++) {
      const s = i * hop - (W >> 1);
      re.fill(0); im.fill(0);
      let e0 = 0;
      for (let j = 0; j < N; j++) { const v = s + j >= 0 && s + j < x.length ? x[s + j] : 0; re[j] = v; if (j < W) { im[j] = v; e0 += v * v; } }
      cum[0] = 0; for (let j = 0; j < N; j++) cum[j + 1] = cum[j] + re[j] * re[j];
      rms[i] = e0 > 0 ? 10 * Math.log10(e0 / W) : -200;
      { let q = 0; const c = i * hop; for (let j = c - h10; j < c + h10; j++) if (j >= 0 && j < x.length) q += x[j] * x[j]; e10[i] = q > 0 ? 10 * Math.log10(q / (2 * h10)) : -200; }
      if ((mask && mask[i]) || e0 < 1e-10 * W) { cands[i] = null; continue; }
      fft(re, im, false);
      // z = a + i b → A = (Z_k + conj Z_-k)/2, B = (Z_k − conj Z_-k)/(2i); P = conj(B)·A
      const Pr = new Float64Array(M), Pi = new Float64Array(M);
      for (let k = 0; k < M; k++) {
        const k2 = (M - k) % M, zr = re[k], zi = im[k], cr = re[k2], ci = -im[k2];
        const ar = (zr + cr) / 2, ai = (zi + ci) / 2, br = (zi - ci) / 2, bi = -(zr - cr) / 2;
        Pr[k] = br * ar + bi * ai; Pi[k] = br * ai - bi * ar;
      }
      fft(Pr, Pi, true);
      for (let t = 0; t <= tauMax; t++) { const c = Pr[t] / M, et = cum[t + W] - cum[t]; d[t] = Math.max(0, e0 + et - 2 * c); }
      dn[0] = 1; let run = 0;
      for (let t = 1; t <= tauMax; t++) { run += d[t]; dn[t] = run > 0 ? d[t] * t / run : 1; }
      // troughs (local minima) in [tauMin, tauMax-1]
      const tr = [];
      for (let t = tauMin; t < tauMax; t++) if (dn[t] < dn[t - 1] && dn[t] <= dn[t + 1]) {
        const a = dn[t - 1], b = dn[t], c = dn[t + 1], den = a - 2 * b + c, sh = den > 0 ? 0.5 * (a - c) / den : 0;
        tr.push({tau: t + Math.max(-1, Math.min(1, sh)), h: b, p: 0});
      }
      if (!tr.length) { cands[i] = null; continue; }
      let gmin = 0; for (let j = 1; j < tr.length; j++) if (tr[j].h < tr[gmin].h) gmin = j;
      // threshold k: the first trough (in lag order) below it gets its Beta weight; none below → the global minimum × 0.01
      for (let k = 0; k < NTH; k++) {
        let f = -1; for (let r = 0; r < tr.length; r++) if (tr[r].h < TH[k]) { f = r; break; }
        if (f >= 0) tr[f].p += TP[k]; else tr[gmin].p += TP[k] * 0.01;
      }
      const cs = [];
      let tot = 0;
      for (const c of tr) {
        if (!(c.p > 0)) continue;
        let f = fs / c.tau;
        if (o.octLock) f = octLockF(x, s, W, fs, f, win);
        if (f < fmin || f > fmax) continue;
        const b = Math.round(12 * BPS * Math.log2(f / fmin));
        if (b < 0 || b >= nB) continue;
        tot += c.p; cs.push({f, b, p: c.p});
      }
      vp[i] = Math.min(1, tot); cands[i] = cs;
    }
    // Viterbi: states 0..nB-1 stimmhaft, nB..2nB-1 stimmlos; Übergang Dreieck ±HW Bins, Wechsel 0,01
    const msf = Math.round(35.92 * 12 * hop / fs), HW = msf * BPS, TW = 2 * HW + 1, tw = new Float64Array(TW);
    for (let k = 0; k < TW; k++) tw[k] = 1 - Math.abs(k - HW) / (HW + 1);
    const S2 = 2 * nB, ltr = new Float64Array(nB * TW);     // per bin normalised (edges renormalised)
    for (let b = 0; b < nB; b++) { let s = 0; for (let k = 0; k < TW; k++) { const q = b + k - HW; if (q >= 0 && q < nB) s += tw[k]; } for (let k = 0; k < TW; k++) { const q = b + k - HW; ltr[b * TW + k] = q >= 0 && q < nB ? Math.log(tw[k] / s) : -Infinity; } }
    const lst = Math.log(0.99), lsw = Math.log(0.01), TINY = 1e-30;
    let V = new Float64Array(S2), V2 = new Float64Array(S2);
    const bp = new Uint8Array(nF * S2);
    // Beobachtung je Frame dicht nur für den laufenden Frame (statt nF × nB Werte: bei 60 s rund 14 MB weniger)
    const ob = new Float64Array(nB); let obI = -1;
    const lobs = (i, s) => {
      if (!cands[i] && (!mask || !mask[i])) return s < nB ? Math.log(TINY) : Math.log(1 / nB);   // still: stimmlos
      if (!cands[i]) return Math.log(1 / S2);                                                   // maskiert: unbekannt
      if (obI !== i) { ob.fill(0); for (const c of cands[i]) ob[c.b] += c.p; obI = i; }
      return s < nB ? Math.log(ob[s] + TINY) : Math.log((1 - vp[i]) / nB + TINY);
    };
    for (let s = 0; s < S2; s++) V[s] = Math.log(1 / S2) + (nF ? lobs(0, s) : 0);
    for (let i = 1; i < nF; i++) {
      for (let s = 0; s < S2; s++) {
        const v = s < nB, b = v ? s : s - nB; let best = -Infinity, arg = 0;
        for (let k = 0; k < TW; k++) {
          const q = b - (k - HW); if (q < 0 || q >= nB) continue;   // from bin q to b: weight of offset b−q
          const lt = ltr[q * TW + (b - q + HW)];
          const a1 = V[v ? q : q + nB] + lt + lst, a2 = V[v ? q + nB : q] + lt + lsw;
          if (a1 > best) { best = a1; arg = k; } if (a2 > best) { best = a2; arg = k + TW; }
        }
        V2[s] = best + lobs(i, s); bp[i * S2 + s] = arg;
      }
      const t = V; V = V2; V2 = t;
    }
    const st = new Int32Array(nF); let bs = 0; for (let s = 1; s < S2; s++) if (V[s] > V[bs]) bs = s;
    if (nF) st[nF - 1] = bs;
    for (let i = nF - 1; i > 0; i--) { const s = st[i], v = s < nB, b = v ? s : s - nB, a = bp[i * S2 + s], flip = a >= TW, k = flip ? a - TW : a, q = b - (k - HW); st[i - 1] = (v !== flip) ? q : q + nB; }
    const f0 = new Float32Array(nF), unk = new Uint8Array(nF);
    for (let i = 0; i < nF; i++) {
      if (mask && mask[i]) unk[i] = 1;
      const s = st[i]; if (s >= nB) continue;
      if (!cands[i]) { if (mask && mask[i]) f0[i] = fmin * Math.pow(2, s / (12 * BPS)); continue; }
      let best = null; for (const c of cands[i]) if (Math.abs(c.b - s) <= 2 && (!best || Math.abs(c.b - s) < Math.abs(best.b - s) || (Math.abs(c.b - s) === Math.abs(best.b - s) && c.p > best.p))) best = c;
      f0[i] = best ? best.f : fmin * Math.pow(2, s / (12 * BPS));
    }
    return {fs, hop, n: nF, f0, vp, rms, e10, unk};
  }
  const median = a => { if (!a.length) return NaN; const b = Float64Array.from(a).sort(); const m = b.length >> 1; return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2; };
  /* Noten aus der Spur. o: {scale: [12 bools] relativ zu Tonart-Grundton root, root, snap, tuning ('auto' | Halbtöne), minMs} */
  function segment(tr, o) {
    o = o || {};
    const hop = tr.hop / tr.fs, nF = tr.n, F = k => Math.max(1, Math.round(k / 1000 / hop));
    const m = new Float64Array(nF), voiced = new Uint8Array(nF);
    const unk = tr.unk || new Uint8Array(nF);
    // masked frames: voiced as the HMM says (the stretch stays one), pitch unknown
    for (let i = 0; i < nF; i++) { if (tr.f0[i] > 0) { m[i] = unk[i] ? NaN : midiOf(tr.f0[i]); voiced[i] = 1; } else m[i] = NaN; }
    // Energie (dB) geglättet über 15 ms
    const E0 = tr.e10 || tr.rms, e = new Float64Array(nF); for (let i = 0; i < nF; i++) { let s = 0, k = 0; for (let j = i - 1; j <= i + 1; j++) if (j >= 0 && j < nF) { s += E0[j]; k++; } e[i] = s / k; }
    const notes = [];
    // stimmhafte Strecken
    let i = 0;
    while (i < nF) {
      if (!voiced[i]) { i++; continue; }
      let j = i; while (j < nF && voiced[j]) j++;
      // Energie-Einbrüche ≥ 6 dB → Schnitte
      const cuts = [i];
      const W = F(150);
      for (let k = i + F(40); k < j - F(40); k++) {
        // a click only adds energy: a dip is real even inside a mask (plateaus of silence count as one valley)
        if (!(e[k] <= e[k - 1] && e[k] < e[k + 1])) continue;
        let L = -Infinity, R = -Infinity; for (let q = Math.max(i, k - W); q < k; q++) L = Math.max(L, e[q]); for (let q = k + 1; q <= Math.min(j - 1, k + W); q++) R = Math.max(R, e[q]);
        if (Math.min(L, R) - e[k] >= 6 && k - cuts[cuts.length - 1] >= F(60)) {
          let r = k; while (r + 1 < j && e[r + 1] < e[k] + 3) r++;    // the rise after the dip
          cuts.push(r);
        }
      }
      // Instrument: ein neuer Anschlag (Pegel +6 dB in ≤ 20 ms) ohne Einbruch davor ist auch ein Schnitt
      if (o.attack) for (let k = i + F(40); k < j - F(40); k++) {
        const E1 = E0[k]; let lo = Infinity, at = k; for (let q = k - F(20); q < k; q++) if (E0[q] < lo) { lo = E0[q]; at = q; }
        if (!(E1 - lo >= 6 && E1 >= E0[k + 1] - 0.5)) continue;
        let sa = 0, na = 0, sb = 0, nb = 0; for (let q = k; q < Math.min(j, k + F(30)); q++) { sa += E0[q]; na++; } for (let q = Math.max(i, k - F(45)); q < k - F(10); q++) { sb += E0[q]; nb++; }
        if (na && nb && sa / na - sb / nb >= 1.5 && cuts.every(c => Math.abs(c - at) >= F(60))) { cuts.push(at); k += F(40); }
      }
      cuts.sort((p, q) => p - q); cuts.push(j);
      for (let c = 0; c + 1 < cuts.length; c++) splitPitch(cuts[c], cuts[c + 1]);
      i = j;
    }
    function center(a, b) { const len = b - a, s = a + Math.min(F(60), Math.floor(len * 0.25)), t = b - Math.min(F(30), Math.floor(len * 0.15)), v = []; for (let k = s; k < Math.max(t, s + 1); k++) if (!isNaN(m[k]) && !unk[k]) v.push(m[k]); if (!v.length) for (let k = a; k < b; k++) if (!isNaN(m[k])) v.push(m[k]); return median(v); }
    function splitPitch(a, b) {
      // note-local centred 120-ms mean (masked frames: the HMM's continuation), from prefix sums
      const H = F(60), n = b - a, ps = new Float64Array(n + 1), pc = new Float64Array(n + 1), sm = new Float64Array(n);
      for (let k = 0; k < n; k++) { const v = m[a + k]; ps[k + 1] = ps[k] + (isNaN(v) ? 0 : v); pc[k + 1] = pc[k] + (isNaN(v) ? 0 : 1); }
      for (let k = a; k < b; k++) { const v = []; for (let r = k - 1; r <= k + 1; r++) if (r >= a && r < b && !isNaN(m[r]) && !unk[r]) v.push(m[r]); sm[k - a] = v.length ? median(v) : NaN; }
      const mean = (lo, hi) => { lo = Math.max(a, lo) - a; hi = Math.min(b, hi) - a; const c = pc[hi] - pc[lo]; return c > 0 ? (ps[hi] - ps[lo]) / c : NaN; };
      const Ml = (k, s0) => mean(Math.max(s0, k - H), k + H + 1);
      // VS2b Hysterese: ein Notenwechsel erst, wenn die Stimme ≥ 70 ms am Stück ≥ 60 ct neben der Mitte der laufenden Note
      // liegt (3-Frame-Median, nicht das 120-ms-Mittel: kurze Läufe bleiben getrennt; ein Vibrato bis ±130 ct bei 5–7 Hz
      // liegt je Halbwelle < 70 ms über 60 ct und bleibt eine Note)
      const hold = F(70), warm = F(60), step = F(25), dv = k => { const v = sm[k - a]; return isNaN(v) ? Ml(k, s0) : v; };
      let s0 = a, k = s0 + warm, c = NaN, cAt = -1;
      while (k < b) {
        if (cAt < 0 || k - cAt >= step) { const v = []; for (let j = s0 + F(20); j < k; j++) { const x = Ml(j, s0); if (!isNaN(x)) v.push(x); } c = v.length ? median(v) : NaN; cAt = k; }
        const Mk = dv(k);
        if (isNaN(c) || isNaN(Mk) || Math.abs(Mk - c) <= 0.6) { k++; continue; }
        const sg = Math.sign(Mk - c);
        let q = k; while (q < b && (dv(q) - c) * sg > 0.6) q++;
        if (q - k < (q >= b ? F(45) : hold)) { if (q >= b) break; k = q + 1; continue; }   // bis zum Ende der Strecke: der Ton kehrt nicht zurück
        // Vibrato-Toleranz: eine Halbwelle (< 160 ms), nach der die Stimme klar auf die andere Seite der Mitte schwingt, ist
        // Vibrato um dieselbe Note, kein Wechsel (ein Triller kehrt nur zur Mitte zurück); ein Wackler ganz am Ende entscheidet
        // die Übergangs-Regel unten (inVib)
        // (Ausschlag ≤ 1,6 Halbtöne, Gegenseite 0,3 … 1,6 und ≥ 35 % davon; ein Lauf, der umkehrt, schwingt weiter oder größer)
        if (q - k < F(160)) {
          let pk = 0; for (let j = k; j < q; j++) { const v = (dv(j) - c) * sg; if (v > pk) pk = v; }
          // Gegenseite: von der Halbwelle aus direkt durch die Mitte (≤ 45 ms im Band ±0,3), dann die tiefste Stelle der Gegen-
          // Halbwelle; ein Ton auf der Mitte (Umkehr eines Laufs, Triller) bleibt länger im Band und zählt nicht
          const depth = (from, dir, lim) => { let j = from, band = 0, d = 0; const fin = jj => dir > 0 ? jj < lim : jj >= lim;
            for (; fin(j); j += dir) { const v = -(dv(j) - c) * sg; if (v > 0.3) break; if (v >= -0.3 && ++band > F(45)) return 0; }
            for (; fin(j); j += dir) { const v = -(dv(j) - c) * sg; if (v <= 0.3) break; if (v > d) d = v; } return d; };
          let od = depth(q, 1, Math.min(b, q + F(130)));
          if (pk <= 1.6 && od > 0.3 && od <= 1.6 && od >= 0.35 * pk) { k = q + 1; continue; }
        }
        const nl = mean(k, Math.min(q, k + F(150)));
        if (isNaN(nl) || (nl - c) * sg < 0.6) { k = q; continue; }
        const mid = (c + nl) / 2; let bd = Math.max(s0 + F(30), k - H);
        while (bd < q && !((sm[bd - a] - mid) * sg > 0)) bd++;
        if (bd - s0 < F(30) || b - bd < F(30)) { k = q; continue; }
        push(s0, bd, 'p'); s0 = bd; k = s0 + warm; cAt = -1;
      }
      push(s0, b);
    }
    function medianRange(a, b) { const v = []; for (let k = a; k < b; k++) if (!isNaN(m[k]) && !unk[k]) v.push(m[k]); return v.length ? median(v) : NaN; }
    function push(a, b, why) { if (b <= a) return; notes.push({a, b, m: center(a, b), pe: why === 'p'}); }
    // kürzer als minMs: mit dem Nachbarn verbinden (gleiche Höhe oder anliegend), sonst weg
    const minF = F(o.minMs || 60);
    const lvE = (a, b) => { const v = []; for (let k = a; k < b; k++) if (e[k] > -150) v.push(e[k]); return v.length ? median(v) : -200; };
    for (let k = 0; k < notes.length; k++) {
      const n = notes[k]; if (n.b - n.a >= minF) continue;
      // (VS2b-fix: ein Rest ≥ 10 dB unter dem folgenden Ton vor dessen Pegel-Schnitt ist Nachklang des Tons davor, kein früherer
      // Einsatz – QA Raum: der Nachhall-Rest zog den Einsatz des nächsten Tons 50 ms und mehr nach vorn; hängt er am Ton davor,
      // endet dieser jetzt am Schnitt)
      const p = notes[k - 1], q = notes[k + 1], pa = p && p.b === n.a;
      const tl = !!(q && q.a === n.b && !n.pe && lvE(n.a, n.b) <= lvE(q.a, Math.min(q.b, q.a + F(150))) - 10), qa = q && q.a === n.b && !tl;
      if (pa && (!qa || Math.abs(p.m - n.m) <= Math.abs(q.m - n.m))) { p.b = n.b; if (tl) p.pe = false; notes.splice(k--, 1); }
      else if (qa) { q.a = n.a; notes.splice(k--, 1); }
      else notes.splice(k--, 1);
    }
    for (const n of notes) n.m = center(n.a, n.b);
    /* G-P1b-gruppe-fix (VS2b, fragen-xander-9 „falsche Zwischennoten“, „es wackelt“): Übergänge unterdrücken. Ein kurzes Stück
       (< 115 ms, kürzer als eine 1/16 bei 130 BPM), das per Tonhöhe an einen Nachbarn grenzt (legato), ist kein eigener Ton,
       (a) wenn es nie ≥ 45 ms ruhig steht (Spanne ≤ 25 ct): der Weg dahin – Gleiten zwischen zwei Tönen (geht an beide, Grenze
           wo die Stimme näher am Ziel ist), Anschleifen von unten/oben vor einem Ton (gehört zum Ton, Einsatz bleibt) oder ein
           Abfall am Ende (gehört zum Ton davor);
       (b) wenn es innerhalb des Vibratos seines Nachbarn liegt (dessen Auslenkung in den angrenzenden 300 ms): ein Wackler. */
    {
      const s3 = k => { const v = []; for (let r = k - 1; r <= k + 1; r++) if (r >= 0 && r < nF && !isNaN(m[r]) && !unk[r]) v.push(m[r]); return v.length ? median(v) : NaN; };
      const flat = n => {                                           // longest window (frames) with a pitch span ≤ 0.25 st
        const v = []; for (let k = n.a; k < n.b; k++) { if (unk[k]) continue; const x = s3(k); if (!isNaN(x)) v.push([k, x]); }
        let best = 0;
        for (let i = 0; i < v.length; i++) { let lo = v[i][1], hi = lo; for (let j = i; j < v.length; j++) { lo = Math.min(lo, v[j][1]); hi = Math.max(hi, v[j][1]); if (hi - lo > 0.25) break; best = Math.max(best, v[j][0] - v[i][0] + 1); } }
        return best;
      };
      const span = (a, b) => { let lo = Infinity, hi = -Infinity; for (let k = a; k < b; k++) { if (unk[k]) continue; const x = s3(k); if (!isNaN(x)) { lo = Math.min(lo, x); hi = Math.max(hi, x); } } return [lo, hi]; };
      const inVib = (n, nb, end) => { if (Math.abs(n.m - nb.m) > 1.5 || nb.b - nb.a < F(200)) return false; const [lo, hi] = end ? span(Math.max(nb.a, nb.b - F(300)), nb.b) : span(nb.a, Math.min(nb.b, nb.a + F(300))); return n.m >= lo - 0.1 && n.m <= hi + 0.1; };
      /* VS2b (Xander am iPhone 24.10.: „falsche Zwischennoten“, „es wackelt“): auch ein Stück bis 170 ms, das sich deutlich
         (≥ 0,4 Halbtöne über seine Mitte) auf den Nachbarn zu bzw. vom Ton davor weg bewegt, ist ein Übergang – Anschleifen in
         den Ton (gehört zum Ton, Einsatz bleibt), Rutscher zwischen zwei Tönen, Abfall am Ende bis 7 Halbtöne (gehört zum Ton
         davor). Die Tonhöhe einer Note bleibt der Median ihres eigenen Kerns (angehängte Übergänge zählen nicht mit). */
      const shortF = F(115), moveF = F(170), stabF = F(45);
      const lvl = (a, b) => { const v = []; for (let k = a; k < b; k++) if (e[k] > -150) v.push(e[k]); return v.length ? median(v) : -200; };
      const trend = n => { const L = n.b - n.a, i0 = n.a + Math.floor(L * 0.2), i1 = n.b - 1 - Math.floor(L * 0.2); return i1 > i0 ? s3(i1) - s3(i0) : NaN; };
      /* VS2b-fix (QA: ein langsam beginnendes Anschleifen, 1–1,6 Halbtöne über 120–160 ms, wurde eine falsche 1/16 vor dem
         Ton): der langsame Anfang eines Anschleifens liegt zwar ≥ 45 ms in 25 ct, steht aber nicht still – die Stimme bewegt
         sich danach ≥ 60 ms stetig auf den Ton zu. Ein echter kurzer Ton steht still (≤ 4 st/s über 20 ms) und wechselt erst
         im kurzen Übergang zum nächsten. Anschleifen = Einsatz-Stück (kein Ton davor), das stetig zum Ton dahinter läuft (nie
         > 15 ct zurück, gesamt ≥ 0,4 Halbtöne), kürzer als 60 ms still steht und danach ≥ 60 ms (zu ≥ 75 % der Frames) weiterläuft. */
      const scoopTo = (n, nb) => {
        const sg = Math.sign(nb.m - n.m), v = []; if (!sg) return false;
        for (let k = n.a; k < n.b; k++) { const x = unk[k] ? NaN : s3(k); v.push(isNaN(x) ? (v.length ? v[v.length - 1] : NaN) : x); }
        let f0 = 0; while (f0 < v.length && isNaN(v[f0])) f0++; for (let k = 0; k < f0; k++) v[k] = v[f0];
        // Einschwingen des Einsatzes (die ersten ≤ 30 ms, oft ein Ausreißer zur Gegenseite): ab dem Punkt am weitesten weg vom Ton
        // (nicht länger: ein Absacken über 50 ms vor dem Anstieg ist bei echtem Gesang oft ein eigener kurzer Ton, vocadito_1 4,36 s)
        let i0 = 0; for (let k = 1; k <= Math.min(v.length - 1, F(30)); k++) if ((v[k] - v[i0]) * sg < 0) i0 = k;
        v.splice(0, i0);
        const L = v.length; if (L < 4 || isNaN(v[0]) || (v[L - 1] - v[0]) * sg < 0.4) return false;
        let mx = -Infinity; for (const x of v) { const y = (x - v[0]) * sg; if (y > mx) mx = y; if (mx - y > 0.15) return false; }
        let best = 0, cur = 0, be = -1; for (let k = 0; k < L; k++) { if (Math.abs(v[Math.min(L - 1, k + 2)] - v[Math.max(0, k - 2)]) <= 0.08) { if (++cur > best) { best = cur; be = k; } } else cur = 0; }
        const tail = L - 1 - be; if (best >= F(60) || tail < F(45) || tail <= best) return false;
        let mvn = 0, pk = 0; for (let k = be + 1; k < L; k++) { const d = (v[k] - v[k - 1]) * sg; if (d > 0.005) mvn++; if (d > pk) pk = d; }
        // 45 … 60 ms Bewegung: nur ein gemächliches Anschleifen (≤ 20 Halbtöne/s); ein Übergang zum nächsten Ton ist schneller
        return mvn >= 0.75 * tail && (tail >= F(60) || pk <= 0.1 * hop / 0.005);
      };
      for (const n of notes) if (n.ca == null) { n.ca = n.a; n.cb = n.b; }
      const core = n => { n.m = center(n.ca, n.cb); if (isNaN(n.m)) n.m = center(n.a, n.b); };
      for (let k = 0; k < notes.length; k++) {
        const n = notes[k]; if (isNaN(n.m)) continue;
        const p = notes[k - 1], q = notes[k + 1], pa = !!(p && p.pe && p.b === n.a && !isNaN(p.m)), qa = !!(q && n.pe && q.a === n.b && !isNaN(q.m));
        /* VS2b-fix (QA: im Raum blieb nach dem Abfall am Ende ein falscher tiefer Ton): der Nachhall hält die tiefste Tonhöhe
           ≥ 70 ms, aber ≥ 10 dB unter dem Ton davor. Beim letzten Stück vor der Stille zählen Länge, Ruhe und Richtung nur im
           gesungenen Teil (Pegel höchstens 10 dB unter dem Ton davor); was danach nur noch nachklingt, ist kein Ton. */
        let act = n, pl = NaN, aeS = n.b;
        const tailEnd = !(q && q.a === n.b && n.pe);                 // danach Stille oder ein neuer Anschlag (Pegel-Schnitt)
        // (nur, wenn das Stück wirklich ≥ 40 ms nachklingt – der Pegel fällt dort um ≥ 8 dB und steigt nicht wieder über den Anfang;
        // ein leiserer echter Ton bleibt gleich laut bis zur Pause oder zum Schnitt)
        if (pa && tailEnd) { pl = lvl(Math.max(p.a, p.b - F(150)), p.b); let ae = n.b; while (ae - 1 > n.a && !(e[ae - 1] >= pl - 10)) ae--;
          let dec = n.b - ae >= F(40) && e[n.b - 1] <= e[ae] - 8; for (let k = ae + 1; dec && k < n.b; k++) if (e[k] > e[ae] + 1) dec = false;
          if (dec) act = {a: n.a, b: Math.min(n.b, ae + F(20)), ae};   // + 20 ms: das Ausklingen eines echten Tons
          if (dec || ae - n.a >= F(20)) aeS = ae; }                          // Ende des gesungenen Teils (−10 dB), auch bei kurzem Ausklingen
        // reiner Nachhall gleich hinter einem Ton (≤ 60 ms Lücke, bis zur Stille oder zum nächsten Anschlag): ≥ 12 dB unter dem Ton,
        // ohne neuen Anstieg (≥ 3 dB) und verklingend (≥ 5 dB) ist kein Ton – anliegend gehört er zum Ton, sonst fällt er weg
        if (p && !isNaN(p.m) && n.a >= p.b && n.a - p.b <= F(150) && tailEnd) {
          // (Pegel des Tons: auch sein ganzer Median – ein angehängter Abfall senkt das Ende)
          const plv = Math.max(lvl(Math.max(p.a, p.b - F(150)), p.b), lvl(p.a, p.b)); let mx = -Infinity, mn = Infinity, up = false;
          for (let r = n.a; r < n.b; r++) { if (e[r] > mx) mx = e[r]; if (e[r] < mn) mn = e[r]; if (e[r] > mn + 3) up = true; }
          // (oder ≥ 24 dB unter dem Ton, dann bis 150 ms Lücke: so leise kommt gleich nach einem Ton kein gesungener Ton, das ist
          // Raum oder Rauschen)
          const far = mx <= plv - 24;
          if ((n.a - p.b <= F(60) || far) && mx <= plv - 12 && !up && (e[n.b - 1] <= mx - 5 || far)) { if (p.b === n.a) { p.b = n.b; p.pe = n.pe; } notes.splice(k, 1); k = Math.max(-1, k - 2); continue; }
        }
        const len = act.b - act.a; if (len >= moveF) continue;
        if (!pa && !qa) {                                            // allein: ein Rutscher ohne ruhige Stelle (≥ 1 Halbton) ist kein Ton
          if (len < shortF && flat(n) < stabF && Math.abs(trend(n)) >= 1) { notes.splice(k, 1); k = Math.max(-1, k - 2); continue; }
          /* VS2b-fix (QA FALL im Raum, 6 Halbtöne): reißt die Tonhöhe mitten im schnellen Abfall kurz ab (≤ 40 ms ohne Tonhöhe),
             bleibt dahinter ein Rest des Abfalls übrig – das letzte Stück vor der Stille, vom Ton weg (≥ 0,4 Halbtöne), leiser
             (≥ 3 dB), nirgends 45 ms ruhig: er gehört zum Ton davor (der Ton reicht bis zu seinem Ende) */
          if (p && !isNaN(p.m) && p.b - p.a >= F(200) && n.a > p.b && n.a - p.b <= F(40) && tailEnd && len < shortF && flat(n) < stabF && Math.abs(n.m - p.m) <= 7) {
            let gapV = 0; for (let r = p.b; r < n.a; r++) if (!unk[r] && !isNaN(m[r])) gapV++;
            const dir = Math.sign(n.m - p.m), tr0 = trend(n);
            if (!gapV && dir && tr0 * dir >= 0.4 && (s3(n.a) - p.m) * dir > 0 && lvl(n.a, n.b) <= lvl(Math.max(p.a, p.b - F(150)), p.b) - 3) { p.b = n.b; p.pe = n.pe; notes.splice(k, 1); k = Math.max(-1, k - 2); }
          }
          continue;
        }
        // bewegt: ≥ 0,8 Halbtöne, oder ≥ 0,4 ohne 60 ms ruhige Stelle (ein kurzer echter Ton steht ≥ 60 ms, auch wenn er gleitet)
        const tr = trend(n), fla = flat(act), mv = Math.abs(tr) >= 0.8 || (Math.abs(tr) >= 0.4 && flat(n) < F(60));
        let toQ = (mv && qa && tr * (q.m - n.m) > 0) || (qa && !pa && scoopTo(n, q)), fromP = mv && pa && tr * (n.m - p.m) > 0;
        // Abfall am Phrasen-Ende: das letzte Stück vor der Stille, vom Ton weg (≥ 0,5 Halbtöne von Anfang bis Ende), ≥ 3 dB leiser
        // und nirgends 70 ms ruhig (ein kurzer Schlusston steht ≥ 70 ms: Hysterese-Regel)
        // (Richtung: vom Anfang bis zum Ende des gesungenen Teils, oder dessen Ende ≥ 0,5 Halbtöne unter/über dem Ton davor)
        if (!fromP && pa && tailEnd) {
          const quiet = lvl(n.a, n.b) <= pl - 3;
          const dir = Math.sign(n.m - p.m), x0 = s3(n.a), x1 = s3(act.b - 1), tf = x1 - x0, tn = s3(n.b - 1) - x0, away = (x1 - p.m) * dir;
          // gesungener Teil: fällt bis zuletzt (≥ 15 ct in den letzten 30 ms vor dem Verklingen – ein echter kurzer Ton im Raum kommt
          // an und steht, bevor er verklingt), danach Nachhall
          const endMv = (s3(aeS - 1) - s3(Math.max(n.a, aeS - 1 - F(30)))) * dir;
          /* VS2b-fix (QA FALL 2–4 Halbtöne über 160–220 ms): ein langsamer Abfall wird unten langsamer und liegt dort 40–60 ms in
             15 ct, bevor er verklingt – im Raum hält der Nachhall die tiefe Höhe noch länger. Ruhe zählt darum nur bis zum
             Verklingen (−10 dB), und es genügt auch, dass die Stimme ihre letzte Höhe erst < 50 ms vor dem Verklingen erreicht
             (ein echter kurzer Schlusston steht dort ≥ 50 ms und ändert sich am Ende nicht mehr) */
          let ar = aeS - 1; const xe = s3(aeS - 1); while (ar - 1 >= n.a && Math.abs(s3(ar - 1) - xe) <= 0.15) ar--;
          // (die neuen Fälle nur hinter einem längeren Ton, ≥ 200 ms: der letzte Ton eines schnellen Laufs vor kurzem Absetzen kommt
          // ebenso spät an und bleibt ein Ton)
          const longP = p.b - p.a >= F(200);
          const flS = aeS < n.b ? flat({a: n.a, b: aeS}) : fla, late = longP && !isNaN(xe) && aeS - ar < F(50);
          if (quiet && (act !== n || longP) && ((Math.min(fla, flS) < F(70) && tf * dir > 0 && Math.max(tf * dir, away) >= 0.5 && (endMv >= 0.15 || late)) || (act !== n && flat(n) < F(70) && tn * dir >= 0.5))) fromP = true;
          // (ohne Pegel-Abfall – manche Stimme wird beim Abfall kaum leiser: stetig ≥ 0,5 Halbtöne weiter und ≥ 1 Halbton vom Ton
          // weg, nie 15 ct zurück, keine 70 ms ruhig und erst kurz vor dem Verklingen unten)
          else if (late && flS < F(70) && (xe - x0) * dir >= 0.5 && (xe - p.m) * dir >= 1) { let mono = true, mx = -Infinity;
            for (let r = n.a; r < aeS && mono; r++) { const y = (s3(r) - x0) * dir; if (isNaN(y)) continue; if (y > mx) mx = y; if (mx - y > 0.15) mono = false; }
            if (mono) fromP = true; }
        }
        if (len >= shortF && !toQ && !fromP) continue;
        if (!toQ && !fromP && flat(n) >= stabF) {                    // steht ruhig: nur ein Vibrato-Wackler des Nachbarn geht
          if (pa && inVib(n, p, true)) { p.b = n.b; p.pe = n.pe; p.cb = n.b; }
          else if (qa && inVib(n, q, false)) { q.a = n.a; q.ca = n.a; }
          else continue;
        } else if (pa && qa && (n.m - p.m) * (q.m - n.m) > 0) {     // dazwischen: Grenze, wo die Stimme näher am Ziel ist
          let bd = n.a; while (bd < n.b) { const v = s3(bd); if (!isNaN(v) && Math.abs(v - q.m) < Math.abs(v - p.m)) break; bd++; }
          p.b = bd; q.a = bd;
        } else if (toQ && !fromP) { if (Math.abs(n.m - q.m) > 7) continue; q.a = n.a; }
        else if (fromP && !toQ) { if (Math.abs(n.m - p.m) > 7) continue; p.b = n.b; p.pe = n.pe; }
        else if (pa && qa) { if (Math.abs(n.m - p.m) <= Math.abs(n.m - q.m)) { p.b = n.b; p.pe = n.pe; } else q.a = n.a; }
        else if (qa) { if (Math.abs(n.m - q.m) > 3) continue; q.a = n.a; }
        else { if (Math.abs(n.m - p.m) > 3) continue; p.b = n.b; p.pe = n.pe; }
        notes.splice(k, 1);
        if (pa) core(p); if (qa) core(q);
        k = Math.max(-1, k - 2);
      }
    }
    for (let k = 0; k + 1 < notes.length; k++) { const p = notes[k], q = notes[k + 1]; if (p.pe && p.b === q.a && Math.abs(p.m - q.m) < 0.5) { p.b = q.b; p.pe = q.pe; notes.splice(k + 1, 1); p.m = center(p.a, p.b); k--; } }
    for (let k = notes.length - 1; k >= 0; k--) { const n = notes[k]; let real = 0; for (let q = n.a; q < n.b; q++) if (!unk[q] && !isNaN(m[q])) real++; if (n.b <= n.a || real < F(30)) notes.splice(k, 1); }
    // Grenze hinter einem Maskenblock → auf dessen Anfang (Fassung 2): ein Einsatz höchstens 25 ms hinter einer Maske
    for (let k = 0; k < notes.length; k++) {
      const n = notes[k]; let q = n.a - 1, g = 0; while (q >= 0 && !unk[q] && g < F(25)) { q--; g++; }
      if (q < 0 || !unk[q]) { if (!unk[n.a]) continue; q = n.a; }
      let s = q; while (s > 0 && unk[s - 1]) s--;
      const prev = notes[k - 1], lo = prev ? prev.a + F(30) : 0;
      if (s >= n.a || s < lo) continue;
      if (prev && prev.b > s) { if (Math.abs(prev.m - n.m) < 0.5 && prev.b === n.a && !prev.cut) continue; prev.b = s; }
      n.a = s; n.mk = true;
    }
    // Stimmung: gewichteter Kreis-Mittelwert der Nachkommastellen
    let tune = 0;
    if (o.tuning === 'auto' || o.tuning == null) {
      let sx = 0, sy = 0; for (const n of notes) { if (isNaN(n.m)) continue; const w = n.b - n.a, ph = 2 * Math.PI * (n.m - Math.round(n.m)); sx += w * Math.cos(ph); sy += w * Math.sin(ph); }
      tune = sx || sy ? Math.atan2(sy, sx) / (2 * Math.PI) : 0;
    } else tune = +o.tuning || 0;
    const out = [], bias = o.bias != null ? o.bias : 0.012;      // the centred 46-ms window turns voiced ≈ 12 ms before the onset (Korpus)
    notes.forEach((n, k) => { const p = notes[k - 1]; n.ps = !!(p && p.pe && p.b === n.a); });
    for (const n of notes) {
      if (isNaN(n.m)) continue;
      const mt = n.m - tune; let p = Math.round(mt);
      if (o.snap && o.scale) {
        const ins = q => !!o.scale[((q - (o.root || 0)) % 12 + 12) % 12];
        if (!ins(p)) { let lo = p - 1, hi = p + 1; while (!ins(lo) && lo > p - 6) lo--; while (!ins(hi) && hi < p + 6) hi++; p = (mt - lo) < (hi - mt) ? lo : hi; }
      }
      out.push({t0: Math.max(0, n.a * hop + (n.ps || n.mk ? 0 : bias)), t1: n.b * hop, m: +n.m.toFixed(3), n: p, raw: Math.round(mt), by: n.mk ? 'maske' : n.ps ? 'ton' : 'einsatz'});
    }
    return {notes: out, tuneCt: Math.round(tune * 1000) / 10};
  }
  return {fft, pyin, segment, midiOf, median};
}
