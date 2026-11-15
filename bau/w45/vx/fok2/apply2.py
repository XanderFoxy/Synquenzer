import sys, re
p = sys.argv[1]; s = open(p, encoding='utf-8').read()
a = s.index("  /* FOK2: „Nur Rest“ genau"); b = s.index("  // ein Stück: Quelle (Original-Bytes) → Fokus-Bytes")
new = """  /* FOK2: „Nur Rest“ genau – wo Ebenen wirken, das Rest-Audio (Original minus Ebenen, wie beim Abspielen: render mit Mix 'rest', ein
     Zwischenspeicher je Ebenen-Stand = restMid, den auch „Noten finden“ nutzt) in der Anzeige-FFT-Größe zerlegen – genau wie die Anzeige
     (gleiches Fenster, gleiche Zeilen-Zuordnung, zwei Spalten je FFT). Byte des Rests wird genommen, wenn es ≥ 2 Stufen (≈ 0,9 dB) dunkler
     ist als das Original; sonst bleibt das Original-Byte (Zellen ohne Wirkung byte-gleich, nie heller). Nur Spalten, deren Fenster einen
     Rahmen mit Ebenen-Wirkung berührt. In Scheiben (≈ 20 ms, dann tick), abbrechbar über ok() → false.
     Rückgabe null (keine Wirkung), false (abgebrochen) oder {aff: Uint8Array(W), rb: Uint8Array(R·W), na}. */
  const FK2 = typeof spk12Fft === 'function' && typeof spk12Win === 'function', RM2 = new Map();
  function rows2(I, sr) {   // wie rmap der Anzeige (Maximum über die Bins im Zeilenband, sonst Zwischenwert an der Mitte)
    const N = I.N, key = N + ':' + sr + ':' + I.rows + ':' + I.m0 + ':' + I.rps; let e = RM2.get(key); if (e) return e;
    const R = I.rows, NB = N / 2, A = new Int32Array(R), B = new Int32Array(R), F = new Float32Array(R), mf = m => 440 * Math.pow(2, (m - 69) / 12);
    for (let r = 0; r < R; r++) {
      const m = I.m0 + r / I.rps, bc = mf(m) * N / sr, lo = mf(m - 0.5 / I.rps) * N / sr, hi = mf(m + 0.5 / I.rps) * N / sr;
      if (bc >= NB) { A[r] = -1; B[r] = -2; continue; }
      const k0 = Math.ceil(lo), k1 = Math.min(NB, Math.floor(hi));
      if (hi - lo >= 1 && k1 >= k0) { A[r] = k0; B[r] = k1; } else { A[r] = Math.floor(bc); B[r] = -1; F[r] = bc - Math.floor(bc); }
    }
    e = {A, B, F}; RM2.set(key, e); return e;
  }
  async function trueRest(d, I, ci, W, src, ok) {
    if (!FK2 || !d.meta.layers.length || !d.mid || d.mid.length < 2) return null;
    const N = I.N, hop = I.hop, sr = d.meta.sr, Nb = d.meta.base.N, hb = d.meta.base.hop, NB = Nb / 2 + 1, R = I.rows, half = (N + Nb) / 2;
    const gf = X.gainFn(d, X.mixOf(d, 'rest')), g = new Float32Array(NB), x0 = ci * 1024;
    const mA = Math.max(0, Math.floor((x0 * hop - half) / hb + 1) - 1), mB = Math.ceil(((x0 + W) * hop + half) / hb + 1) + 1, P = new Int32Array(mB - mA + 2);
    let tY = performance.now();
    for (let m = mA; m <= mB; m++) {   // Rahmen mit Ebenen-Wirkung (Rest-Anteil ≠ 1 in irgendeinem Bin)
      gf(m, g); let one = 1; for (let k = 0; k < NB; k++) if (Math.abs(g[k] - 1) > 1e-6) { one = 0; break; }
      P[m - mA + 1] = P[m - mA] + (one ? 0 : 1);
      if (performance.now() - tY > 20) { await X.tick(); if (!ok()) return false; tY = performance.now(); }
    }
    if (!P[mB - mA + 1]) return null;
    const aff = new Uint8Array(W), cnt = (lo, hi) => { lo = Math.max(mA, lo); hi = Math.min(mB, hi); return hi < lo ? 0 : P[hi - mA + 1] - P[lo - mA]; };
    let na = 0; for (let c = 0; c < W; c++) { const cs = (x0 + c) * hop; if (cnt(Math.floor((cs - half) / hb + 1), Math.ceil((cs + half) / hb + 1))) { aff[c] = 1; na++; } }
    if (!na) return null;
    const rb = src.slice(), w = spk12Win(N), re = new Float64Array(N), im = new Float64Array(N), H = N / 2, m1 = new Float64Array(H + 1), m2 = new Float64Array(H + 1);
    const {A, B, F} = rows2(I, sr), gap = Math.max(1, Math.round(N / hop)), sc = 4 / N, k255 = 255 / DBF;
    const col = (mag, cc) => {
      if (!aff[cc]) return;
      for (let r = 0; r < R; r++) {
        let v; const a = A[r], b = B[r];
        if (b === -2) v = 0; else if (b === -1) v = mag[a] * (1 - F[r]) + (a + 1 < mag.length ? mag[a + 1] : 0) * F[r]; else { v = 0; for (let k = a; k <= b; k++) if (mag[k] > v) v = mag[k]; }
        const dbv = 20 * Math.log10(v * sc + 1e-12) + DBF, y = dbv <= 0 ? 0 : dbv >= DBF ? 255 : Math.round(dbv * k255), i = r * W + cc;
        if (src[i] - y >= 2) rb[i] = y;
      }
    };
    for (let c = 0; c < W;) {
      if (!aff[c]) { c++; continue; }
      let c1 = c; for (let e = c + 1; e < W && e <= c1 + gap; e++) if (aff[e]) c1 = e;   // Lauf betroffener Spalten (Lücken bis N/hop zusammen)
      const mid = await restMid(d, {}, (x0 + c) * hop - N / 2 - hb, (x0 + c1 + 1) * hop + N / 2 + hb, null);
      if (!ok()) return false; tY = performance.now();
      for (let cc = c; cc <= c1; cc += 2) {
        const sA = (x0 + cc) * hop - N / 2, two = cc + 1 <= c1;
        for (let j = 0; j < N; j++) { const i = sA + j, i2 = i + hop; re[j] = (i >= 0 && i < mid.length ? mid[i] : 0) * w[j]; im[j] = two && i2 >= 0 && i2 < mid.length ? mid[i2] * w[j] : 0; }
        spk12Fft(re, im);
        for (let k = 0; k <= H; k++) { const kk = k ? N - k : 0, zr = re[k], zi = im[k], wr = re[kk], wi = im[kk], p = zr + wr, q = zi - wi, u = zi + wi, e = wr - zr; m1[k] = 0.5 * Math.sqrt(p * p + q * q); m2[k] = 0.5 * Math.sqrt(u * u + e * e); }
        col(m1, cc); if (two) col(m2, cc + 1);
        if (performance.now() - tY > 20) { await X.tick(); if (!ok()) return false; tY = performance.now(); }
      }
      c = c1 + 1;
    }
    return {aff, rb, na};
  }
"""
s = s[:a] + new + s[b:]
def rep(old, newv, cnt=1):
    global s
    n = s.count(old); assert n == cnt, (n, old[:90]); s = s.replace(old, newv)
rep("""      if (tc) { for (let r = 0; r < R; r++) gl[r] = TR.q[r * W + c]; mP = -1; }   /* FOK2: genauer Rest (Ebenen) */""",
    """      if (tc) { gl.fill(1); mP = -1; for (let r = 0; r < R; r++) SB[r] = TR.rb[r * W + c]; }   /* FOK2: Bild-Quelle = genauer Rest (Ebenen schon drin) */""")
rep("""    const FM = new Map(), wide = I.N > Nb,""", """    const SB = new Uint8Array(R), FM = new Map(), wide = I.N > Nb,""")
rep("""      if (tc) {   /* FOK2: Ebenen sind im Verhältnis schon genau – nur die Noten-Bänder weich (Flanken), dann × Verhältnis */
        let anyN = false;
        for (let r = 0; r < R; r++) { let ln = 1; if (anyW) { const w = wv[r]; if (w > 0) ln = 1 - w * (1 - att); } LC[r] = ln; SC[r] = src[r * W + c]; if (ln < 0.99999) anyN = true; }
        if (anyN) {
          for (let r = 0; r < R; r++) { const gg = gl[r], pw = PW[SC[r]] * gg * gg, l = LC[r]; PP[r + 1] = PP[r] + pw; PQ[r + 1] = PQ[r] + pw * l * l; }
          for (let r = 0; r < R; r++) { const a = ba[r], b = bb[r] + 1, sp = PP[b] - PP[a]; if (!(sp > 0)) continue; const qq = (PQ[b] - PQ[a]) / sp, l = LC[r]; if (qq < l * l) LC[r] = Math.sqrt(qq > 0 ? qq : 0); }
        }
        for (let r = 0; r < R; r++) LC[r] *= gl[r];
      }""",
"""      if (tc) {   /* FOK2: Ebenen sind im Rest-Bild schon genau – nur die Noten-Bänder weich (Flanken, Gewicht = Leistung des Rest-Bilds) */
        let anyN = false;
        for (let r = 0; r < R; r++) { let ln = 1; if (anyW) { const w = wv[r]; if (w > 0) ln = 1 - w * (1 - att); } LC[r] = ln; SC[r] = src[r * W + c]; if (ln < 0.99999) anyN = true; }
        if (anyN) {
          for (let r = 0; r < R; r++) { const pw = PW[SB[r]], l = LC[r]; PP[r + 1] = PP[r] + pw; PQ[r + 1] = PQ[r] + pw * l * l; }
          for (let r = 0; r < R; r++) { const a = ba[r], b = bb[r] + 1, sp = PP[b] - PP[a]; if (!(sp > 0)) continue; const qq = (PQ[b] - PQ[a]) / sp, l = LC[r]; if (qq < l * l) LC[r] = Math.sqrt(qq > 0 ? qq : 0); }
        }
      }""")
rep("""        const lin = LC[r], i = r * W + c, s = SC[r]; let v;
        if (lin >= 0.99999) v = s; else if (lin < 1e-5 || !s) v = 0; else { v = s + 20 * Math.log10(lin) * k255;""",
"""        const lin = LC[r], i = r * W + c, s = SC[r], sb = tc ? SB[r] : s; let v;   /* FOK2: sb = Bild-Quelle (Rest-Byte), s = Original (Energie-Anteil) */
        if (lin >= 0.99999) v = sb; else if (lin < 1e-5 || !sb) v = 0; else { v = sb + 20 * Math.log10(lin) * k255;""")
rep("""        const TR = o.mode === 'rest' ? await trueRest(d, I, ci, W, same) : null;""", """        const TR = o.mode === 'rest' ? await trueRest(d, I, ci, W, src, same) : null;""")
rep("""const TR = await trueRest(d, I, ci, W, () => true);""", """const TR = await trueRest(d, I, ci, W, src, () => true);""")
open(p, 'w', encoding='utf-8').write(s); print('ok')
