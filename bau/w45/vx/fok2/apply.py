import sys
p = sys.argv[1]; s = open(p, encoding='utf-8').read()
def rep(old, new, cnt=1):
    global s
    n = s.count(old)
    assert n == cnt, (n, old[:80])
    s = s.replace(old, new)

# 1) Hilfsfunktion trueRest vor piece()
rep("""  // ein Stück: Quelle (Original-Bytes) → Fokus-Bytes; Energie (Leistung je Byte) vorher/nachher
  function piece(d, I, ci, src, o, gf, NT) {""",
"""  /* FOK2: „Nur Rest“ genau – wo Ebenen wirken, das Rest-Audio (Original minus Ebenen, wie beim Abspielen: render mit Mix 'rest') nur für die
     betroffenen Spalten des Stücks rechnen und in der Anzeige-FFT-Größe zerlegen. Eine komplexe FFT trägt Original (re) und Rest (im) zugleich;
     je Zeile Verhältnis q = |Rest| / |Original| (≤ 1, gleiche Zeilen-Zuordnung für beide) → Bild = Original-Byte + 20·log10 q. Spalten ohne
     Ebenen-Wirkung bleiben unberührt (byte-gleich). Rechnet in Scheiben (≤ ~20 ms, dann tick), bricht ab, wenn ok() false meldet → false.
     Rückgabe null (keine Wirkung), false (abgebrochen) oder {aff: Uint8Array(W), q: Float32Array(R·W)}. */
  const FK2 = typeof spk12Fft === 'function' && typeof spk12Win === 'function', RM2 = new Map();
  function rows2(I, sr) {   // Zeile → Anzeige-Bins: Maximum über die Bins im Zeilenband, sonst Zwischenwert an der Mitte (wie die Anzeige)
    const key = I.N + ':' + sr + ':' + I.rows + ':' + I.m0 + ':' + I.rps; let e = RM2.get(key); if (e) return e;
    const R = I.rows, N = I.N, H = N / 2, A = new Int32Array(R), B = new Int32Array(R), F = new Float64Array(R), fr = r => 440 * Math.pow(2, (I.m0 + r / I.rps - 69) / 12) * N / sr;
    for (let r = 0; r < R; r++) { const fa = fr(r - 0.5), fb = fr(r + 0.5), ka = Math.ceil(fa), kb = Math.min(H, Math.floor(fb)), fc = fr(r);
      if (fc >= H) { A[r] = -2; B[r] = -2; } else if (kb >= ka) { A[r] = ka; B[r] = kb; } else { A[r] = Math.floor(fc); B[r] = -1; F[r] = fc - Math.floor(fc); } }
    e = {A, B, F}; RM2.set(key, e); return e;
  }
  async function trueRest(d, I, ci, W, ok) {
    if (!FK2 || !d.meta.layers.length || !d.mid || d.mid.length < 2) return null;
    const N = I.N, hop = I.hop, sr = d.meta.sr, n = d.meta.n, Nb = d.meta.base.N, hb = d.meta.base.hop, NB = Nb / 2 + 1, R = I.rows, half = (N + Nb) / 2;
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
    const q = new Float32Array(R * W).fill(1), mx = X.mixOf(d, 'rest'), BL = X.BLK || 16384, w = spk12Win(N), re = new Float64Array(N), im = new Float64Array(N);
    const H = N / 2, mo = new Float64Array(H + 1), mr = new Float64Array(H + 1), {A, B, F} = rows2(I, sr), gap = Math.max(1, Math.round(N / hop)), xo = d.mid;
    for (let c = 0; c < W;) {
      if (!aff[c]) { c++; continue; }
      let c1 = c; for (let e = c + 1; e < W && e <= c1 + gap; e++) if (aff[e]) c1 = e;   // Lauf betroffener Spalten (Lücken bis N/hop zusammen)
      const a = (x0 + c) * hop - N / 2, b = (x0 + c1) * hop + N / 2 + 1, xr = new Float32Array(b - a);
      for (let o = Math.max(0, a); o < Math.min(n, b);) {   // Rest-Audio blockweise (Zwischenspeicher der Blöcke im Kern)
        const e = Math.min(Math.min(n, b), (Math.floor(o / BL) + 1) * BL), ch = X.render(d, mx, o, e), k = 1 / ch.length;
        for (const y of ch) for (let i = 0; i < y.length; i++) xr[o - a + i] += y[i] * k;
        o = e; if (performance.now() - tY > 20) { await X.tick(); if (!ok()) return false; tY = performance.now(); }
      }
      for (let cc = c; cc <= c1; cc++) {
        if (!aff[cc]) continue;
        const s0 = (x0 + cc) * hop - N / 2;
        for (let j = 0; j < N; j++) { const i = s0 + j; re[j] = (i >= 0 && i < xo.length ? xo[i] : 0) * w[j]; im[j] = xr[i - a] * w[j]; }
        spk12Fft(re, im);
        for (let k = 0; k <= H; k++) { const kk = (N - k) % N, zr = re[k], zi = im[k], wr = re[kk], wi = im[kk], ar = zr + wr, ai = zi - wi, br = zi + wi, bi = zr - wr; mo[k] = ar * ar + ai * ai; mr[k] = br * br + bi * bi; }
        for (let r = 0; r < R; r++) {
          const ka = A[r], kb = B[r]; let vo, vr;
          if (kb === -2) continue;
          if (kb === -1) { const f = F[r], k1 = Math.min(H, ka + 1); vo = Math.sqrt(mo[ka]) * (1 - f) + Math.sqrt(mo[k1]) * f; vr = Math.sqrt(mr[ka]) * (1 - f) + Math.sqrt(mr[k1]) * f; }
          else { vo = 0; vr = 0; for (let k = ka; k <= kb; k++) { if (mo[k] > vo) vo = mo[k]; if (mr[k] > vr) vr = mr[k]; } vo = Math.sqrt(vo); vr = Math.sqrt(vr); }
          if (vo > 1e-12 && vr < vo) q[r * W + cc] = vr / vo;
        }
        if (performance.now() - tY > 20) { await X.tick(); if (!ok()) return false; tY = performance.now(); }
      }
      c = c1 + 1;
    }
    return {aff, q, na};
  }
  // ein Stück: Quelle (Original-Bytes) → Fokus-Bytes; Energie (Leistung je Byte) vorher/nachher
  function piece(d, I, ci, src, o, gf, NT, TR) {   /* FOK2: TR = trueRest (nur „Nur Rest“) */""")

# 2) im Spalten-Loop: TR-Spalten nehmen das genaue Verhältnis statt der Masken-Näherung
rep("""      const gc = ci * 1024 + c, t = gc * I.hop / sr, mm = Math.round(gc * I.hop / hb + 1);
      if (!wide) {""",
"""      const gc = ci * 1024 + c, t = gc * I.hop / sr, mm = Math.round(gc * I.hop / hb + 1), tc = !!(TR && TR.aff[c]);   /* FOK2 */
      if (tc) { for (let r = 0; r < R; r++) gl[r] = TR.q[r * W + c]; mP = -1; }   /* FOK2: genauer Rest (Ebenen) */
      else if (!wide) {""")

# 3) Kombination: bei TR-Spalten glätten nur den Noten-Anteil (Gewicht = Leistung des Rest-Bilds), dann × Rest-Verhältnis
rep("""      let anyM = false;
      for (let r = 0; r < R; r++) { let lin = gl[r];""",
"""      let anyM = false;
      if (tc) {   /* FOK2: Ebenen sind im Verhältnis schon genau – nur die Noten-Bänder weich (Flanken), dann × Verhältnis */
        let anyN = false;
        for (let r = 0; r < R; r++) { let ln = 1; if (anyW) { const w = wv[r]; if (w > 0) ln = 1 - w * (1 - att); } LC[r] = ln; SC[r] = src[r * W + c]; if (ln < 0.99999) anyN = true; }
        if (anyN) {
          for (let r = 0; r < R; r++) { const gg = gl[r], pw = PW[SC[r]] * gg * gg, l = LC[r]; PP[r + 1] = PP[r] + pw; PQ[r + 1] = PQ[r] + pw * l * l; }
          for (let r = 0; r < R; r++) { const a = ba[r], b = bb[r] + 1, sp = PP[b] - PP[a]; if (!(sp > 0)) continue; const qq = (PQ[b] - PQ[a]) / sp, l = LC[r]; if (qq < l * l) LC[r] = Math.sqrt(qq > 0 ? qq : 0); }
        }
        for (let r = 0; r < R; r++) LC[r] *= gl[r];
      }
      else for (let r = 0; r < R; r++) { let lin = gl[r];""")
rep("""      if (rest && anyM) {   // „Nur Rest“""", """      if (rest && anyM && !tc) {   // „Nur Rest“""")

# 4) ops.fokus: TR rechnen (nur Rest), abbrechbar
rep("""        const src = have && have.byteLength === I.rows * W ? new Uint8Array(have) : X.specChunk(d, N, ci).data;
        e = piece(d, I, ci, src, o, gf, NT); neu++;""",
"""        const src = have && have.byteLength === I.rows * W ? new Uint8Array(have) : X.specChunk(d, N, ci).data;
        const TR = o.mode === 'rest' ? await trueRest(d, I, ci, W, same) : null;   /* FOK2: genauer Rest, wo Ebenen wirken */
        if (TR === false || !same()) { stop = d.fkTok !== tok ? 'abgeloest' : 'geaendert'; break; }
        e = piece(d, I, ci, src, o, gf, NT, TR); neu++;""")

# 5) Zauberstab: gleiches Stück wie die Anzeige
rep("""    let e = C.get(ck); if (!e) { e = piece(d, I, ci, src, o, gainOf(d, o), NT); C.set(ck, e); while (C.size > 6) C.delete(C.keys().next().value); }""",
"""    let e = C.get(ck); if (!e) { const TR = await trueRest(d, I, ci, W, () => true); e = piece(d, I, ci, src, o, gainOf(d, o), NT, TR || null); C.set(ck, e); while (C.size > 6) C.delete(C.keys().next().value); }   /* FOK2 */""")
open(p, 'w', encoding='utf-8').write(s)
print('ok')
