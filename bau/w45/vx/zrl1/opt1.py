import sys
p = sys.argv[1]; s = open(p, encoding='utf-8').read()
def rep(old, new, cnt=1):
    global s
    n = s.count(old)
    assert n == cnt, (n, old[:90])
    s = s.replace(old, new)
# 1) magPair: sqrt statt Math.hypot, ohne Modulo (bitgleich bis auf seltene 1-ulp-Fälle in double, danach float32)
rep("""  function magPair(re, im, N, m1, m2) {
    for (let k = 0; k <= N / 2; k++) {
      const kk = (N - k) % N, zr = re[k], zi = im[k], wr = re[kk], wi = im[kk];
      m1[k] = 0.5 * Math.hypot(zr + wr, zi - wi); m2[k] = 0.5 * Math.hypot(zi + wi, wr - zr);
    }
  }""", """  function magPair(re, im, N, m1, m2) {
    for (let k = 0, H = N / 2; k <= H; k++) {   /* ZRL1: Math.sqrt statt Math.hypot (V8: hypot ein Vielfaches langsamer), kein Modulo */
      const kk = k ? N - k : 0, zr = re[k], zi = im[k], wr = re[kk], wi = im[kk], a = zr + wr, b = zi - wi, c = zi + wi, e = wr - zr;
      m1[k] = 0.5 * Math.sqrt(a * a + b * b); m2[k] = 0.5 * Math.sqrt(c * c + e * e);
    }
  }""")
# 2) medLine: alten Wert durch neuen ersetzen und nur bis zur richtigen Stelle schieben (gleiche Menge → gleicher Median, bitgleich)
rep("""  function medLine(src, o, st, n, L, dst, buf) {
    const h = L >> 1; let c = 0;
    const at = i => i >= 0 && i < n ? src[o + i * st] : 0;
    const ins = v => { let lo = 0, hi = c; while (lo < hi) { const m = (lo + hi) >> 1; if (buf[m] < v) lo = m + 1; else hi = m; } for (let j = c; j > lo; j--) buf[j] = buf[j - 1]; buf[lo] = v; c++; };
    const rem = v => { let lo = 0, hi = c - 1; while (lo < hi) { const m = (lo + hi) >> 1; if (buf[m] < v) lo = m + 1; else hi = m; } for (let j = lo; j < c - 1; j++) buf[j] = buf[j + 1]; c--; };
    for (let i = -h; i <= h; i++) ins(Math.fround(at(i)));
    for (let i = 0; i < n; i++) { dst[o + i * st] = buf[h]; rem(Math.fround(at(i - h))); ins(Math.fround(at(i + h + 1))); }
  }""", """  function medLine(src, o, st, n, L, dst, buf) {
    /* ZRL1: je Schritt den alten Wert durch den neuen ersetzen und nur bis zur richtigen Stelle schieben (gleiches sortiertes Fenster → bitgleicher Median) */
    const h = L >> 1;
    for (let i = -h, c = 0; i <= h; i++, c++) { const v = Math.fround(i >= 0 && i < n ? src[o + i * st] : 0); let j = c; while (j > 0 && buf[j - 1] > v) { buf[j] = buf[j - 1]; j--; } buf[j] = v; }
    for (let i = 0; i < n; i++) {
      dst[o + i * st] = buf[h];
      const ia = i - h, ib = i + h + 1, vo = Math.fround(ia >= 0 && ia < n ? src[o + ia * st] : 0), vn = Math.fround(ib >= 0 && ib < n ? src[o + ib * st] : 0);
      if (vo === vn) continue;
      let lo = 0, hi = L - 1; while (lo < hi) { const m = (lo + hi) >> 1; if (buf[m] < vo) lo = m + 1; else hi = m; }
      let j = lo;
      if (vn > vo) { while (j + 1 < L && buf[j + 1] < vn) { buf[j] = buf[j + 1]; j++; } } else { while (j > 0 && buf[j - 1] > vn) { buf[j] = buf[j - 1]; j--; } }
      buf[j] = vn;
    }
  }""")
# 3) zPrep: Ähnlichkeit symmetrisch (jedes Paar einmal rechnen, in beide Listen; Reihenfolge je Liste wie vorher → bitgleich)
rep("""    const nb = new Int32Array(G * KN).fill(-1), minD = Math.max(2, Math.round(sr / (4 * hop))), bv = new Float32Array(KN);
    for (let g = 0; g < G; g++) {
      bv.fill(-2); const o = g * KN;
      for (let h = 0; h < G; h++) {
        if (Math.abs(h - g) < minD) continue; let s = 0; for (let b = 0; b < B; b++) s += fe[g * B + b] * fe[h * B + b];
        if (s <= bv[KN - 1]) continue; let j = KN - 1; while (j > 0 && bv[j - 1] < s) { bv[j] = bv[j - 1]; nb[o + j] = nb[o + j - 1]; j--; } bv[j] = s; nb[o + j] = h;
      }""", """    const nb = new Int32Array(G * KN).fill(-1), minD = Math.max(2, Math.round(sr / (4 * hop))), bv = new Float32Array(G * KN).fill(-2);
    /* ZRL1: jedes Paar (g, h) nur einmal rechnen und in beide Listen eintragen; je Liste kommen die Kandidaten weiter aufsteigend → bitgleich */
    const put2 = (o, h, s) => { if (s <= bv[o + KN - 1]) return; let j = KN - 1; while (j > 0 && bv[o + j - 1] < s) { bv[o + j] = bv[o + j - 1]; nb[o + j] = nb[o + j - 1]; j--; } bv[o + j] = s; nb[o + j] = h; };
    for (let g = 0; g < G; g++) {
      const o = g * KN, gB = g * B;
      for (let h = g + minD; h < G; h++) {
        let s = 0; const hB = h * B; for (let b = 0; b < B; b++) s += fe[gB + b] * fe[hB + b];
        put2(o, h, s); put2(h * KN, g, s);
      }""")
# 4) zerlegen: REPET-Median auf den Bytes (LUT steigt → gleiche Reihenfolge), Zeilen je Rahmen einmal; 3×3-Mittel vorab zeilenweise (gleiche Summen-Reihenfolge)
rep("""          const g = m >> 2, nbo = g * KN, ph = m & 3;
          for (let k = 0; k < NB; k++) {
            const h = mh[o + k], lb = 0;
            let fg = 0;
            if (k < KV && voc[k] > 0) {
              let c = 0; for (let j = 0; j < KN; j++) { const gg = A.nb[nbo + j]; if (gg < 0) continue; const mm = Math.min(F - 1, gg * 4 + ph), v = LUT[A.Q[mm * KV + k]]; let p = c++; while (p > 0 && med[p - 1] > v) { med[p] = med[p - 1]; p--; } med[p] = v; }
              if (c) { const x = X[o + k], R = Math.min(x, c & 1 ? med[c >> 1] : 0.5 * (med[(c >> 1) - 1] + med[c >> 1])), v = x - R; fg = v * v + R * R > 0 ? v * v / (v * v + R * R) : 0; }
            }""", """          const g = m >> 2, nbo = g * KN, ph = m & 3;
          let cR = 0; for (let j = 0; j < KN; j++) { const gg = A.nb[nbo + j]; if (gg < 0) continue; zRow[cR++] = Math.min(F - 1, gg * 4 + ph) * KV; }   /* ZRL1: Nachbar-Zeilen je Rahmen einmal */
          for (let k = 0; k < NB; k++) {
            const h = mh[o + k], lb = 0;
            let fg = 0;
            if (k < KV && voc[k] > 0) {
              const c = cR; for (let j = 0; j < c; j++) { const v = AQ[zRow[j] + k]; let p = j; while (p > 0 && zq[p - 1] > v) { zq[p] = zq[p - 1]; p--; } zq[p] = v; }   /* ZRL1: Median auf den Bytes, LUT erst danach (steigend → gleiche Werte) */
              if (c) { const x = X[o + k], R = Math.min(x, c & 1 ? LUT[zq[c >> 1]] : 0.5 * (LUT[zq[(c >> 1) - 1]] + LUT[zq[c >> 1]])), v = x - R; fg = v * v + R * R > 0 ? v * v / (v * v + R * R) : 0; }
            }""")
rep("""      const Lt = 17, Lf = 17, MG = (Lt >> 1) + 1, low = new Float32Array(NB), voc = new Float32Array(NB), cb = new Float32Array(NB), med = new Float32Array(KN + 1);""",
    """      const Lt = 17, Lf = 17, MG = (Lt >> 1) + 1, low = new Float32Array(NB), voc = new Float32Array(NB), cb = new Float32Array(NB), med = new Float32Array(KN + 1);
      const zRow = new Int32Array(KN), zq = new Int32Array(KN + 1), AQ = A.Q, zS = [new Float64Array(BT * NB), new Float64Array(BT * NB), new Float64Array(BT * NB)];   /* ZRL1: Puffer einmal je Zerlegen */""")
rep("""        const sm = (E, i, k) => { let a = 0, c = 0; for (let di = -1; di <= 1; di++) for (let dk = -1; dk <= 1; dk++) { const kk = k + dk; if (kk < 0 || kk >= NB) continue; a += E[(i + di) * NB + kk]; c++; } return a / c; };""",
    """        const sm = (E, i, k) => { let a = 0, c = 0; for (let di = -1; di <= 1; di++) for (let dk = -1; dk <= 1; dk++) { const kk = k + dk; if (kk < 0 || kk >= NB) continue; a += E[(i + di) * NB + kk]; c++; } return a / c; };
        /* ZRL1: 3×3-Mittel für die Rahmen des Streifens vorab, Zeile für Zeile in derselben Summen-Reihenfolge wie sm (bitgleich, ohne Rand-Abfragen je Zelle) */
        const smRow = (E, S, i, r) => { const q0 = (i - 1) * NB, q1 = i * NB, q2 = (i + 1) * NB, d0 = r * NB;
          S[d0] = sm(E, i, 0); S[d0 + NB - 1] = sm(E, i, NB - 1);
          for (let k = 1; k < NB - 1; k++) { let a = 0; a += E[q0 + k - 1]; a += E[q0 + k]; a += E[q0 + k + 1]; a += E[q1 + k - 1]; a += E[q1 + k]; a += E[q1 + k + 1]; a += E[q2 + k - 1]; a += E[q2 + k]; a += E[q2 + k + 1]; S[d0 + k] = a / 9; } };
        const nosm = !!(Z2 && Z2.o6 && Z2.o6.nosm);
        for (let m = mA; m <= mB; m++) { const i = m - a0, r = m - mA; smRow(ED, zS[0], i, r); smRow(EB, zS[1], i, r); smRow(EV, zS[2], i, r); }""")
rep("""              const lo4 = k < KL && Z2 && Z2.o6 && Z2.o6.nosm;   // SPK4: Tiefband ungeglättet (Kick ↔ Bass: Glätten kostete 0,6 dB Bass)
              const vd = Math.round(free * (lo4 ? ED[i * NB + k] : sm(ED, i, k))), vb = Math.min(free - vd, Math.round(free * (lo4 ? EB[i * NB + k] : sm(EB, i, k)))), vv = Math.min(free - vd - vb, Math.round(free * sm(EV, i, k)));""",
    """              const lo4 = k < KL && nosm, zr = (m - mA) * NB + k;   // SPK4: Tiefband ungeglättet (Kick ↔ Bass: Glätten kostete 0,6 dB Bass) · ZRL1: 3×3-Mittel vorab (zS)
              const vd = Math.round(free * (lo4 ? ED[i * NB + k] : zS[0][zr])), vb = Math.min(free - vd, Math.round(free * (lo4 ? EB[i * NB + k] : zS[1][zr]))), vv = Math.min(free - vd - vb, Math.round(free * zS[2][zr]));""")
open(p, 'w', encoding='utf-8').write(s)
print('ok')
