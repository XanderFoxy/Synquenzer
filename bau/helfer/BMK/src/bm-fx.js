  /* ---- BM3: effects FX1 (CH / DT / BC / RM) and FX2 (DL / RV / DT), section 1.12. Inserted into the processor's scope. ----
     FxUnit: one instance of one type (all buffers of its slot kind made once); FxSlot: two units (30 ms crossfade on a type
     change), BAL (dry x (1 - b) + wet x b; 0 = the dry signal untouched), sleep in silence, fade-out on panic. */
  const FX_CH = [[.15, 2.5], [.25, 3.0], [.35, 1.5], [.5, 2.5], [.7, 1.2], [.9, 2.0], [1.2, 1.0], [1.5, 1.8], [2.0, .8], [2.5, 1.4], [3.2, .6], [4.0, 1.0], [5.5, .5], [7.0, .8]];
  const FX_BC = [[12, 1 / 2, 0], [10, 1 / 3, 0], [9, 1 / 4, 0], [8, 1 / 6, 0], [7, 1 / 8, 0], [6, 0, 11025], [5, 0, 8000], [4, 0, 5512]];
  const FX_NOTE = [4, 3, 2, 1.5, 1, .75, .5, .375, .25, .1875, .125, .0625];   // 1/1 1/2. 1/2 1/4. 1/4 1/8. 1/8 1/16. 1/16 1/32. 1/32 1/64 in beats
  const FAM1 = ['CH', 'DT', 'BC', 'RM'], FAM2 = ['DL', 'RV', 'DT'];
  const DSR = 29761, RV_IN = [142, 107, 379, 277], RV_B = [672, 4453, 1800, 3720, 908, 4217, 2656, 3163];
  const RV_TL = [266, 2974, 1913, 1996, 1990, 187, 1066], RV_TR = [353, 3627, 1228, 2673, 2111, 335, 121];
  const p2 = n => { let p = 1; while (p < n) p <<= 1; return p; };
  const rdB = (b, p) => { const m = b.length - 1, k = Math.floor(p), f = p - k; return b[k & m] * (1 - f) + b[(k + 1) & m] * f; };
  const atB = (b, p) => b[p & (b.length - 1)];
  const lcosh = u => { const a = u < 0 ? -u : u; return a > 20 ? a - Math.LN2 : Math.log(Math.cosh(u)); };
  // the delay time of DL n (ms, section 1.12) and its note value at a tempo (SYNC, DL1-DL8)
  // RV n: RT60 of the formula; tank scale min(1, max(0.35, RT60 / 1 s)); RV_CAL = the internal decay per type, measured by
  // werkzeug/rv-cal.mjs so that M-T60 gives the formula (the damping in the loop shortens long halls)
  const rvT = n => 8 * Math.pow(.3 / 8, (n - 1) / 15), rvSize = n => Math.min(1, Math.max(.35, rvT(n)));
  const RV_CAL = [1.3377, 1.3045, 1.2739, 1.2476, 1.216, 1.1851, 1.1585, 1.1251, 1.0874, 1.0133, 0.9748, 1.0025, 0.9985, 0.9637, 0.9933, 0.9075];
  const dlMs = n => 800 * Math.pow(1 / 800, (n - 1) / 15);
  function dlSync(n, bpm) {
    const t = dlMs(n) / 1000, b = 60 / bpm; let best = 0, bd = 1e9;
    for (let i = 0; i < FX_NOTE.length; i++) { const d = Math.abs(Math.log(FX_NOTE[i] * b / t)); if (d < bd - 1e-12) { bd = d; best = i; } }
    return FX_NOTE[best] * b;
  }
  class FxUnit {
    constructor(kind, sr) {
      this.kind = kind; this.sr = sr; this.fam = ''; this.n = 0; this.e = 0;   // e: output energy of the last run (sleep)
      if (kind === 1) {
        this.cb = [new Float32Array(1024), new Float32Array(1024)];          // chorus lines (<= 10 ms)
        this.ap = new Float64Array(12); this.fb = new Float64Array(2);          // phaser: 6 allpass states per side, feedback
      } else {
        const m = p2(Math.ceil(1.05 * sr) + 8); this.db = [new Float32Array(m), new Float32Array(m)]; this.dm = m - 1;   // echo lines (800 ms + glide)
        const r = sr / DSR; this.rr = r;
        this.ri = RV_IN.map(n => { const b = new Float32Array(p2(Math.round(n * r) + 4)); return b; }); this.rn = RV_IN.map(n => Math.round(n * r));
        this.rl = RV_B.map(n => new Float32Array(p2(Math.ceil((n + 34) * r) + 4)));
        this.rlen = new Float64Array(8); this.rg = new Float64Array(4); this.rtl = new Int32Array(7); this.rtr = new Int32Array(7); this.rsize(1);
      }
      this.st = new Float64Array(16);                                            // filters, holds, phases
      this.w = 1 << 20; this.ph = 0; this.lfs = 0; this.lfc = 1; this.tCur = 0; this.tTgt = 0; this.tStep = 0; this.t0 = 0;
      this.clear();
    }
    clear() {
      if (this.kind === 1) { this.cb[0].fill(0); this.cb[1].fill(0); this.ap.fill(0); this.fb.fill(0); }
      else { this.db[0].fill(0); this.db[1].fill(0); for (const b of this.ri) b.fill(0); for (const b of this.rl) b.fill(0); }
      this.st.fill(0); this.ph = 0; this.lfs = 0; this.lfc = 1; this.tCur = 0; this.tTgt = 0; this.tStep = 0; this.t0 = 0; this.e = 0; this.apA = 0; this.apC = 0; this.inR = 0; this.inN = Math.round(.03 * this.sr);
    }
    set(fam, n) { this.fam = fam; this.n = n; this.clear(); if (fam === 'RV') this.rsize(rvSize(n)); }
    // the tank scale (as 'size' of dirigent-hall): short halls need a smaller tank, else one loop is longer than the decay
    rsize(z) { const r = this.rr; for (let k = 0; k < 8; k++) this.rlen[k] = RV_B[k] * r * z; for (let k = 0; k < 7; k++) { this.rtl[k] = Math.round(RV_TL[k] * r * z); this.rtr[k] = Math.round(RV_TR[k] * r * z); } }
    // a type change inside the family: the new unit starts with the old one's input history (lines, tank), so the
    // crossfade has no onset step (rule 12); filters and phases start fresh
    copyHist(o) {
      if (this.kind === 1) { this.cb[0].set(o.cb[0]); this.cb[1].set(o.cb[1]); }
      else { this.db[0].set(o.db[0]); this.db[1].set(o.db[1]); for (let k = 0; k < 4; k++) this.ri[k].set(o.ri[k]); for (let k = 0; k < 8; k++) this.rl[k].set(o.rl[k]); }
      this.w = o.w;
    }
    // wet signal of [i, e) into yL / yR (the input x is not changed)
    run(xL, xR, yL, yR, i, e, P) {
      const f = this.fam, n = this.n, sr = this.sr; let en = 0;
      if (this.kind === 1 && !(f === 'CH' && n <= 14)) {   // every FX1 type keeps the chorus lines' input history (copyHist)
        const b0 = this.cb[0], b1 = this.cb[1]; let wi = this.w; for (let j = i; j < e; j++) { b0[wi & 1023] = xL[j]; b1[wi & 1023] = xR[j]; wi++; } this.w = wi > 0x3f000000 ? wi - 0x20000000 : wi;
      }
      if (f === 'CH' && n <= 14) {
        const hz = FX_CH[n - 1][0], dep = FX_CH[n - 1][1], w = 2 * Math.PI * hz / sr, b0 = this.cb[0], b1 = this.cb[1];
        let s = this.lfs, c = this.lfc, wi = this.w;
        for (; i < e; i++) {
          s += w * c; c -= w * s;
          b0[wi & 1023] = xL[i]; b1[wi & 1023] = xR[i];
          const dl = (7 + dep * s) * sr / 1000, dr = (7 + dep * c) * sr / 1000;   // L / R 90 degrees apart
          let p = wi - dl, k = Math.floor(p), fr = p - k; const a = b0[k & 1023] * (1 - fr) + b0[(k + 1) & 1023] * fr;
          p = wi - dr; k = Math.floor(p); fr = p - k; const b = b1[k & 1023] * (1 - fr) + b1[(k + 1) & 1023] * fr;
          yL[i] = a; yR[i] = b; en += a * a + b * b; wi++;
        }
        const m = Math.sqrt(s * s + c * c); this.lfs = s / m; this.lfc = c / m; this.w = wi > 0x3f000000 ? wi - 0x20000000 : wi;
      } else if (f === 'CH') {
        // CH15 / CH16: 6 first-order allpasses, 200 Hz - 3 kHz, feedback, internal 50 / 50 (the coefficient every 8 samples,
        // linear in between)
        const hz = n === 15 ? .25 : .8, fbk = n === 15 ? .3 : .5, w = 2 * Math.PI * hz / sr, A = this.ap, F = this.fb, LN15 = Math.log(15);
        let s = this.lfs, c = this.lfc, a = this.apA, da = 0, cnt = this.apC;
        let A0 = A[0], A1 = A[1], A2 = A[2], A3 = A[3], A4 = A[4], A5 = A[5], B0 = A[6], B1 = A[7], B2 = A[8], B3 = A[9], B4 = A[10], B5 = A[11], fl = F[0], fr = F[1];
        for (; i < e; i++) {
          s += w * c; c -= w * s;
          if (cnt <= 0) { const fc = 200 * Math.exp(LN15 * (1 + s) / 2), t = Math.tan(Math.PI * fc / sr), an = (t - 1) / (t + 1); if (this.apA === 0 && a === 0) a = an; da = (an - a) / 8; cnt = 8; }
          a += da; cnt--;
          const xl = xL[i], xr = xR[i];
          let u = xl + fbk * fl, y;
          y = a * u + A0; A0 = u - a * y; u = y; y = a * u + A1; A1 = u - a * y; u = y; y = a * u + A2; A2 = u - a * y; u = y;
          y = a * u + A3; A3 = u - a * y; u = y; y = a * u + A4; A4 = u - a * y; u = y; y = a * u + A5; A5 = u - a * y; u = y; fl = u;
          let v = xr + fbk * fr;
          y = a * v + B0; B0 = v - a * y; v = y; y = a * v + B1; B1 = v - a * y; v = y; y = a * v + B2; B2 = v - a * y; v = y;
          y = a * v + B3; B3 = v - a * y; v = y; y = a * v + B4; B4 = v - a * y; v = y; y = a * v + B5; B5 = v - a * y; v = y; fr = v;
          const ol = .5 * xl + .5 * u, or = .5 * xr + .5 * v; yL[i] = ol; yR[i] = or; en += ol * ol + or * or;
        }
        A[0] = A0; A[1] = A1; A[2] = A2; A[3] = A3; A[4] = A4; A[5] = A5; A[6] = B0; A[7] = B1; A[8] = B2; A[9] = B3; A[10] = B4; A[11] = B5; F[0] = fl; F[1] = fr;
        this.apA = a + da * cnt; this.apC = 0;
        const m = Math.sqrt(s * s + c * c); this.lfs = s / m; this.lfc = c / m;
      } else if (f === 'DT') {
        // drive +2n dB; odd n symmetric, even n offset 0.25 (before the drive: the asymmetry grows with it); low pass
        // 12 kHz * 0.8^floor((n-1)/2); level 1 / (1 + 0.1 n); ADAA 1st order on the algebraic sigmoid u / sqrt(1 + u^2)
        // (antiderivative sqrt(1 + u^2): one square root per sample); even n: DC block 5 Hz
        const g = Math.pow(10, 2 * n / 20), off = n % 2 ? 0 : .25, go = g * off, t0 = go / Math.sqrt(1 + go * go), comp = 1 / (1 + .1 * n), Q = this.st;
        const fl = Math.min(12000 * Math.pow(.8, Math.floor((n - 1) / 2)), .45 * sr), al = 1 - Math.exp(-2 * Math.PI * fl / sr), dcR = Math.exp(-2 * Math.PI * 5 / sr);
        let ul = Q[0], ur = Q[1], Fl = Math.sqrt(1 + ul * ul), Fr = Math.sqrt(1 + ur * ur), ll = Q[2], lr = Q[3], dxl = Q[4], dxr = Q[5], dyl = Q[6], dyr = Q[7];
        for (; i < e; i++) {
          const a = g * xL[i] + go, b = g * xR[i] + go, Fa = Math.sqrt(1 + a * a), Fb = Math.sqrt(1 + b * b);
          let ya, yb, d = a - ul;
          if (d > 1e-5 || d < -1e-5) ya = (Fa - Fl) / d; else { const mm = .5 * (a + ul); ya = mm / Math.sqrt(1 + mm * mm); }
          d = b - ur; if (d > 1e-5 || d < -1e-5) yb = (Fb - Fr) / d; else { const mm = .5 * (b + ur); yb = mm / Math.sqrt(1 + mm * mm); }
          ul = a; ur = b; Fl = Fa; Fr = Fb;
          ya = (ya - t0) * comp; yb = (yb - t0) * comp;
          ll += al * (ya - ll); lr += al * (yb - lr); ya = ll; yb = lr;
          if (off) { let z = ya - dxl + dcR * dyl; dxl = ya; dyl = z; ya = z; z = yb - dxr + dcR * dyr; dxr = yb; dyr = z; yb = z; }
          yL[i] = ya; yR[i] = yb; en += ya * ya + yb * yb;
        }
        Q[0] = ul; Q[1] = ur; Q[2] = ll; Q[3] = lr; Q[4] = dxl; Q[5] = dxr; Q[6] = Math.abs(dyl) < 1e-15 ? 0 : dyl; Q[7] = Math.abs(dyr) < 1e-15 ? 0 : dyr;
      } else if (f === 'BC') {
        // (bits; rate), even n with a low pass 0.45 x rate; 9-16: rate x (1 +- 0.5 x triangle 0.3 Hz)
        const k = n > 8 ? n - 8 : n, T = FX_BC[k - 1], bits = T[0], rate0 = T[1] ? T[1] * sr : T[2], q = Math.pow(2, bits - 1), iq = 1 / q, Q = this.st, lp = k % 2 === 0;
        const fc = Math.min(.45 * rate0, .45 * sr), g1 = Math.tan(Math.PI * fc / sr), A1 = 1 / (1 + g1 * (g1 + Math.SQRT2)), A2 = g1 * A1, A3 = g1 * A2, inc0 = rate0 / sr, tri = n > 8, dph = .3 / sr;
        let ph = Q[0], hl = Q[1], hr = Q[2], s1 = Q[3], s2 = Q[4], s3 = Q[5], s4 = Q[6], tp = this.ph;
        for (; i < e; i++) {
          let inc = inc0;
          if (tri) { tp += dph; if (tp >= 1) tp -= 1; inc = inc0 * (1 + .5 * (tp < .5 ? 4 * tp - 1 : 3 - 4 * tp)); }
          ph += inc; if (ph >= 1) { ph -= Math.floor(ph); hl = Math.round(xL[i] * q) * iq; hr = Math.round(xR[i] * q) * iq; }
          let a = hl, b = hr;
          if (lp) {   // 2-pole Butterworth (TPT SVF low pass) at 0.45 x rate
            let v3 = a - s2, v1 = A1 * s1 + A2 * v3, v2 = s2 + A2 * s1 + A3 * v3; s1 = 2 * v1 - s1; s2 = 2 * v2 - s2; a = v2;
            v3 = b - s4; v1 = A1 * s3 + A2 * v3; v2 = s4 + A2 * s3 + A3 * v3; s3 = 2 * v1 - s3; s4 = 2 * v2 - s4; b = v2;
          }
          yL[i] = a; yR[i] = b; en += a * a + b * b;
        }
        Q[0] = ph; Q[1] = hl; Q[2] = hr; Q[3] = s1; Q[4] = s2; Q[5] = s3; Q[6] = s4; this.ph = tp;
      } else if (f === 'RM') {
        // sine carrier 0.4 Hz * 2^(0.84 (n - 1)), right 90 degrees later
        const hz = .4 * Math.pow(2, .84 * (n - 1)), w = 2 * Math.PI * hz / sr;
        let s = this.lfs, c = this.lfc;
        for (; i < e; i++) { const a = xL[i] * s, b = xR[i] * -c; yL[i] = a; yR[i] = b; en += a * a + b * b; s += w * c; c -= w * s; }
        const m = Math.sqrt(s * s + c * c); this.lfs = s / m; this.lfc = c / m;
      } else if (f === 'DL') {
        // time 800 ms * (1/800)^((n-1)/15); feedback 0.45 / 0.6 / 0.75; 5 kHz low pass in the loop (n <= 6); ping-pong (n <= 4); SYNC (DL1-8)
        const want = (P.sy && n <= 8 ? dlSync(n, P.bpm) : dlMs(n) / 1000) * sr, fbk = n <= 6 ? .45 : n <= 10 ? .6 : .75, lp = n <= 6, pp = n <= 4;
        // a new time (tempo change with SYNC): the read pointer glides there in 50 ms (raised cosine: no kink in the speed)
        if (this.tCur <= 0) { this.tCur = want; this.tTgt = want; this.tStep = 0; }
        if (want !== this.tTgt) { this.t0 = this.tCur; this.tTgt = want; this.tStep = 1; }
        const al = 1 - Math.exp(-2 * Math.PI * 5000 / sr), Q = this.st, B0 = this.db[0], B1 = this.db[1], m = this.dm, gn = Math.round(.05 * sr);
        let wi = this.w, t = this.tCur;
        for (; i < e; i++) {
          if (this.tStep > 0) { const x = this.tStep / gn; t = x >= 1 ? want : this.t0 + (want - this.t0) * .5 * (1 - Math.cos(Math.PI * x)); this.tStep = x >= 1 ? 0 : this.tStep + 1; }
          let p = wi - t, k = Math.floor(p), fr = p - k;
          const a = B0[k & m] * (1 - fr) + B0[(k + 1) & m] * fr, b = B1[k & m] * (1 - fr) + B1[(k + 1) & m] * fr;
          let fa = a, fb_ = b;
          if (lp) { Q[0] += al * (a - Q[0]); Q[1] += al * (b - Q[1]); fa = Q[0]; fb_ = Q[1]; }
          let gi = 1; if (this.inR > 0) { gi = 1 - this.inR / this.inN; this.inR--; }
          if (pp) { B0[wi & m] = .5 * (xL[i] + xR[i]) * gi + fbk * fb_; B1[wi & m] = fbk * fa; }
          else { B0[wi & m] = xL[i] * gi + fbk * fa; B1[wi & m] = xR[i] * gi + fbk * fb_; }
          yL[i] = a; yR[i] = b; en += a * a + b * b; wi++;
        }
        this.tCur = t; this.w = wi > 0x3f000000 ? wi - 0x20000000 : wi;
      } else if (f === 'RV') {
        en = this.reverb(xL, xR, yL, yR, i, e, rvT(n) * RV_CAL[n - 1]);
      } else { for (; i < e; i++) { yL[i] = 0; yR[i] = 0; } }
      this.e = en;
    }
    // Dattorro figure-of-eight tank as 'dirigent-hall' with its defaults (size 1, damp 7 kHz, low cut 70 Hz, tone 12 kHz, mod 0.5,
    // width 1); RT60 of the mid band = rt
    reverb(xL, xR, yL, yR, i, e, rt) {
      const sr = this.sr, r = this.rr, Q = this.st, kd = -3 / (sr * rt), I = this.ri, N = this.rn, Lb = this.rl, len = this.rlen, g = this.rg;
      g[0] = Math.pow(10, kd * (len[0] + len[1])); g[1] = Math.pow(10, kd * (len[2] + len[3])); g[2] = Math.pow(10, kd * (len[4] + len[5])); g[3] = Math.pow(10, kd * (len[6] + len[7]));
      const dampA = 1 - Math.exp(-2 * Math.PI * Math.min(7000, .45 * sr) / sr), lowA = 1 - Math.exp(-2 * Math.PI * 70 / sr), bwA = 1 - Math.exp(-2 * Math.PI * Math.min(12000, .45 * sr) / sr);
      const exc = .5 * 16 * r, lw = 2 * Math.PI * (.35 + .65 * .5) / sr, dd1 = -.7, dd2 = .5, rd = rdB, at = atB, tl = this.rtl, tr = this.rtr;
      const AP1 = Lb[0], D1 = Lb[1], AP2 = Lb[2], D2 = Lb[3], AP3 = Lb[4], D3 = Lb[5], AP4 = Lb[6], D4 = Lb[7];
      let w = this.w, s = this.lfs, c = this.lfc, lpL = Q[0], lpR = Q[1], hpL = Q[2], hpR = Q[3], bw = Q[4], en = 0;
      for (; i < e; i++) {
        s += lw * c; c -= lw * s;
        let x = .5 * (xL[i] + xR[i]); if (this.inR > 0) { x *= 1 - this.inR / this.inN; this.inR--; } bw += bwA * (x - bw); x = bw;
        let d, v;
        for (let k = 0; k < 4; k++) { const b = I[k], m = b.length - 1, gg = k < 2 ? .75 : .625; d = b[(w - N[k]) & m]; v = x - gg * d; b[w & m] = v; x = d + gg * v; }
        x += (w & 1) ? 1e-20 : -1e-20;
        const fR = rd(D4, w - len[7]) * g[3], fL = rd(D2, w - len[3]) * g[1];
        let a = x + fR;
        d = rd(AP1, w - (len[0] + exc * (1 + s))); v = a - dd1 * d; AP1[w & (AP1.length - 1)] = v; a = d + dd1 * v;
        D1[w & (D1.length - 1)] = a; a = rd(D1, w - len[1]) * g[0];
        lpL += dampA * (a - lpL); a = lpL; hpL += lowA * (a - hpL); a -= hpL;
        d = rd(AP2, w - len[2]); v = a - dd2 * d; AP2[w & (AP2.length - 1)] = v; a = d + dd2 * v; D2[w & (D2.length - 1)] = a;
        let b = x + fL;
        d = rd(AP3, w - (len[4] + exc * (1 + c))); v = b - dd1 * d; AP3[w & (AP3.length - 1)] = v; b = d + dd1 * v;
        D3[w & (D3.length - 1)] = b; b = rd(D3, w - len[5]) * g[2];
        lpR += dampA * (b - lpR); b = lpR; hpR += lowA * (b - hpR); b -= hpR;
        d = rd(AP4, w - len[6]); v = b - dd2 * d; AP4[w & (AP4.length - 1)] = v; b = d + dd2 * v; D4[w & (D4.length - 1)] = b;
        const yl = at(D3, w - tl[0]) + at(D3, w - tl[1]) - at(AP4, w - tl[2]) + at(D4, w - tl[3]) - at(D1, w - tl[4]) - at(AP2, w - tl[5]) - at(D2, w - tl[6]);
        const yr = at(D1, w - tr[0]) + at(D1, w - tr[1]) - at(AP2, w - tr[2]) + at(D2, w - tr[3]) - at(D3, w - tr[4]) - at(AP4, w - tr[5]) - at(D4, w - tr[6]);
        const ol = (yl + yr) * .3 + (yl - yr) * .3, or = (yl + yr) * .3 - (yl - yr) * .3;
        yL[i] = ol; yR[i] = or; en += ol * ol + or * or; w++;
      }
      if (w > 0x3f000000) w -= 0x20000000;
      const m = Math.sqrt(s * s + c * c); this.lfs = s / m; this.lfc = c / m; this.w = w; Q[0] = lpL; Q[1] = lpR; Q[2] = hpL; Q[3] = hpR; Q[4] = bw;
      return en;
    }
  }
  class FxSlot {
    constructor(kind, sr) {
      this.kind = kind; this.sr = sr; this.u = [new FxUnit(kind, sr), new FxUnit(kind, sr)]; this.cur = 0; this.type = '';
      this.xf = 0; this.xn = Math.round(.03 * sr);   // 30 ms crossfade on a type change
      this.wL = new Float32Array(128); this.wR = new Float32Array(128); this.oL = new Float32Array(128); this.oR = new Float32Array(128);
      this.quiet = 1e9; this.kill = 0; this.kn = Math.round(.01 * sr); this.par = {sy: 0, bpm: 120}; this.silN = 1e12; this.mute = 0;
    }
    grow(N) { if (this.wL.length < N) { this.wL = new Float32Array(N); this.wR = new Float32Array(N); this.oL = new Float32Array(N); this.oR = new Float32Array(N); } }
    clear() { this.u[0].clear(); this.u[1].clear(); this.xf = 0; this.quiet = 1e9; this.silN = 1e12; this.mute = 0; this.kill = 0; }
    // samples a silent input still sounds (the sleep must not cut a tail): echo repeats down to -140 dB, reverb 140 / 60 x RT60
    tailN() {
      const U = this.u[this.cur], n = U.n, sr = this.sr;
      if (U.fam === 'DL') { const fb = n <= 6 ? .45 : n <= 10 ? .6 : .75, t = Math.max(U.tCur / sr, dlMs(n) / 1000); return ((1 + 140 / -(20 * Math.log10(fb))) * t + .05) * sr; }
      if (U.fam === 'RV') return 8 * Math.pow(.3 / 8, (n - 1) / 15) * 140 / 60 * 1.5 * sr;
      return .03 * sr;
    }
    // the type to play (fam + n); a change starts the 30 ms crossfade into the other unit
    setType(t) {
      if (t === this.type) return;
      const fam = t.slice(0, 2), n = +t.slice(2) | 0;
      if (!this.type || this.quiet > 4) { this.u[this.cur].set(fam, n); this.type = t; this.xf = 0; return; }
      // chorus family: the new unit takes the old input history; echo / reverb: a fresh unit whose input fades in over the
      // crossfade (its first echo then has no onset step)
      const nx = 1 - this.cur, old = this.u[this.cur]; this.u[nx].set(fam, n); if (old.fam === fam && this.kind === 1) this.u[nx].copyHist(old); else this.u[nx].inR = this.xn; this.cur = nx; this.type = t; this.xf = this.xn;
    }
    // in place over [i, e): x = x (1 - b) + wet b; b = 0 (and no fade running): untouched
    process(L, R, i, e, b) {
      if (this.mute > 0) { this.mute -= e - i; return; }   // after a panic: 60 ms without FX (the voices' own 3 ms fades end meanwhile)
      if (b <= 0 && this.xf === 0) { if (this.kill > 0) { this.clear(); this.kill = 0; this.mute = Math.round(.05 * this.sr); } this.quiet = 1e9; return; }
      // sleep: the input silent and the tail done (the input is scanned only while the slot may sleep)
      let peak = 1;
      if (this.quiet > 4 && this.xf === 0) {
        peak = 0; for (let j = i; j < e; j++) if (L[j] !== 0 || R[j] !== 0) { peak = 1; break; }
        if (peak) this.silN = 0; else { this.silN += e - i; if (this.silN > this.tailN()) return; }
      }
      this.grow(e);
      const U = this.u[this.cur], wL = this.wL, wR = this.wR;
      U.run(L, R, wL, wR, i, e, this.par);
      let en = U.e;
      if (this.xf > 0) {
        const O = this.u[1 - this.cur], oL = this.oL, oR = this.oR; O.run(L, R, oL, oR, i, e, this.par);
        for (let j = i; j < e; j++) { const x = this.xf > 0 ? this.xf / this.xn : 0; if (this.xf > 0) this.xf--; wL[j] = wL[j] * (1 - x) + oL[j] * x; wR[j] = wR[j] * (1 - x) + oR[j] * x; }
        en += O.e;
      }
      const d = 1 - b;
      if (this.kill > 0) {   // panic / double stop: the wet path fades out in 10 ms, then all tails are cleared
        for (let j = i; j < e; j++) { const k = this.kill > 0 ? this.kill / this.kn : 0; if (this.kill > 0) this.kill--; L[j] = L[j] * d + wL[j] * b * k; R[j] = R[j] * d + wR[j] * b * k; }
        if (this.kill <= 0) { this.clear(); this.kill = 0; this.mute = Math.round(.05 * this.sr); }
        return;
      }
      for (let j = i; j < e; j++) { L[j] = L[j] * d + wL[j] * b; R[j] = R[j] * d + wR[j] * b; }
      if (en < 1e-14 * (e - i + 1)) {   // the wet path is silent: is the input too?
        if (peak === 1 && this.quiet <= 4) { peak = 0; for (let j = i; j < e; j++) if (L[j] !== 0 || R[j] !== 0) { peak = 1; break; } if (!peak) this.silN += e - i; else this.silN = 0; }
        this.quiet = peak ? 0 : this.quiet + 1;
      } else { this.quiet = 0; if (peak) this.silN = 0; }
    }
    asleep() { return this.mute > 0 || (this.xf === 0 && this.kill === 0 && this.quiet > 4 && (this.silN > 1e11 || this.silN > this.tailN())); }
    panic() { if (this.quiet < 1e9) this.kill = this.kn; else { this.clear(); this.mute = Math.round(.06 * this.sr); } }
  }
