import sys
p = sys.argv[1]; s = open(p, encoding='utf-8').read()
def rep(old, new):
    global s
    c = s.count(old)
    if c != 1: sys.exit('Treffer %d für: %s' % (c, old[:90]))
    s = s.replace(old, new)
BLOCK = r'''  /* ZRL2-BEGIN ===== Zerlegen schneller bei bitgleichem Ergebnis (OFFEN-1611 A4). Nur vom Zerlegen benutzt (drei Haken „ZRL2“ in zerlegen):
     (1) zrl2Mags = magsAt, aber die Rand-Rahmen, die der vorige Streifen schon gerechnet hat, werden übernommen (Streifen-Versatz 128 ist gerade →
         dieselben FFT-Paare [gerade, ungerade] → dieselben Bits); Zwischenspeicher je Dokument (WeakMap, hält das Dokument nicht fest).
     (2) zrl2Hpss = hpss, aber nur für die Zeilen r0…r1, die Zerlegen liest (Streifen ±1 Rahmen); je Zeile dasselbe Median-Fenster (außen 0) →
         derselbe Median; der alte Wert wird linear von der näheren Seite gesucht (Binärsuche sprang oft falsch). H/mh außerhalb r0…r1 bleiben 0.
     (3) zrl2Sm = smRow (ZRL1) je Ebene nur in den Bins, in denen das 3×3-Fenster ≠ 0 sein kann (Bass-Anteil EB nur k < KL, Gesang EV nur
         100 Hz…10 kHz); sonst 0 – genau das, was die volle Summe aus neun +0 ergibt.
     (4) zrl2Tiles = Kacheln schreiben, wenn es keine eigenen Ebenen gibt (frei = 255): ohne Schleife über eigene Ebenen je Zelle, Felder einmal geholt. ===== */
  const zrl2W = new WeakMap();
  function zrl2Mags(d, N, cen, K, a0, neu) {
    const n = cen.length, x = d.mid, w = win(N), out = new Float32Array(n * K);
    let c = zrl2W.get(d); if (neu || !c) { c = {}; zrl2W.set(d, c); }
    let R = 0; const D = a0 - c.a0;
    if (c.X && c.mid === x && c.N === N && c.K === K && D > 0 && !(D & 1) && D < c.n) {
      R = Math.min(n, c.n - D) & ~1;
      for (let j = 0; j < R; j++) if (c.cen[D + j] !== cen[j]) { R = 0; break; }
      if (R > 0) out.set(c.X.subarray(D * K, (D + R) * K));
    }
    const NB = N / 2 + 1, re = new Float64Array(N), im = new Float64Array(N), a = new Float64Array(NB), b = new Float64Array(NB);
    for (let i = R; i < n; i += 2) {   // wie magsAt (zwei Rahmen je FFT, gleiche Paare)
      const sA = cen[i] - N / 2, two = i + 1 < n, sB = two ? cen[i + 1] - N / 2 : 0;
      for (let j = 0; j < N; j++) { const p = sA + j, q = sB + j; re[j] = (p >= 0 && p < x.length ? x[p] : 0) * w[j]; im[j] = two && q >= 0 && q < x.length ? x[q] * w[j] : 0; }
      V.fft(re, im); magPair(re, im, N, a, b);
      for (let k = 0; k < K; k++) out[i * K + k] = a[k];
      if (two) for (let k = 0; k < K; k++) out[(i + 1) * K + k] = b[k];
    }
    c.X = out; c.mid = x; c.N = N; c.K = K; c.a0 = a0; c.n = n; c.cen = cen; c.R = R;
    return out;
  }
  // gleitender Median wie medLine, aber nur Ausgaben i0…i1 (Fenster ±h, außen 0); alter Wert linear von der näheren Seite gesucht
  function zrl2Med(src, o, st, n, L, dst, buf, i0, i1) {
    if (i1 < i0) return;
    const h = L >> 1, W = 2 * h + 1, e = W - 1;
    for (let i = i0 - h, c = 0; i <= i0 + h; i++, c++) { const v = i >= 0 && i < n ? src[o + i * st] : 0; let j = c; while (j > 0 && buf[j - 1] > v) { buf[j] = buf[j - 1]; j--; } buf[j] = v; }
    for (let i = i0; ; i++) {
      const md = buf[h]; dst[o + i * st] = md;
      if (i === i1) break;
      const ia = i - h, ib = i + h + 1, vo = ia >= 0 && ia < n ? src[o + ia * st] : 0, vn = ib >= 0 && ib < n ? src[o + ib * st] : 0;
      if (vo === vn) continue;
      let j;
      if (vo <= md) { j = 0; while (j < e && buf[j] < vo) j++; } else { j = e; while (j > 0 && buf[j] > vo) j--; }
      if (vn > vo) { while (j < e && buf[j + 1] < vn) { buf[j] = buf[j + 1]; j++; } } else { while (j > 0 && buf[j - 1] > vn) { buf[j] = buf[j - 1]; j--; } }
      buf[j] = vn;
    }
  }
  function zrl2Hpss(X, n, K, Lt, Lf, r0, r1) {
    const H = new Float32Array(n * K), P = new Float32Array(n * K), buf = new Float32Array(Math.max(Lt, Lf) + 2), mh = new Float32Array(n * K);
    for (let k = 0; k < K; k++) zrl2Med(X, k, K, n, Lt, H, buf, r0, r1);
    for (let i = r0; i <= r1; i++) zrl2Med(X, i * K, 1, K, Lf, P, buf, 0, K - 1);
    for (let i = r0 * K, e = (r1 + 1) * K; i < e; i++) { const h = H[i] * H[i], p = P[i] * P[i]; mh[i] = h + p > 0 ? h / (h + p) : 0.5; }
    return {H, mh};
  }
  // 3×3-Mittel einer Zeile wie smRow (ZRL1, gleiche Summen-Reihenfolge), nur Bins k0…k1, sonst 0
  function zrl2Row(E, S, i, r, NB, sm, k0, k1) {
    const q0 = (i - 1) * NB, q1 = i * NB, q2 = (i + 1) * NB, d0 = r * NB;
    if (k0 > 0) S.fill(0, d0, d0 + k0); if (k1 < NB - 1) S.fill(0, d0 + k1 + 1, d0 + NB);
    let ka = k0, kb = k1;
    if (ka === 0) { S[d0] = sm(E, i, 0); ka = 1; }
    if (kb === NB - 1) { S[d0 + NB - 1] = sm(E, i, NB - 1); kb = NB - 2; }
    for (let k = ka; k <= kb; k++) { let a = 0; a += E[q0 + k - 1]; a += E[q0 + k]; a += E[q0 + k + 1]; a += E[q1 + k - 1]; a += E[q1 + k]; a += E[q1 + k + 1]; a += E[q2 + k - 1]; a += E[q2 + k]; a += E[q2 + k + 1]; S[d0 + k] = a / 9; }
  }
  function zrl2Sm(ED, EB, EV, zS, mA, mB, a0, NB, KL, KV, voc, sm) {
    let v0 = 0; while (v0 < NB && !(voc[v0] > 0)) v0++;
    const bE = Math.min(NB - 1, KL), vA = Math.max(0, v0 - 1), vE = Math.min(NB - 1, KV);
    for (let m = mA; m <= mB; m++) { const i = m - a0, r = m - mA; zrl2Row(ED, zS[0], i, r, NB, sm, 0, NB - 1); zrl2Row(EB, zS[1], i, r, NB, sm, 0, bE); zrl2Row(EV, zS[2], i, r, NB, sm, vA, vE); }
  }
  function zrl2Tiles(d, zl, s, TR, mA, mB, a0, NB, KL, nosm, ED, EB, zS) {
    const z0 = zS[0], z1 = zS[1], z2 = zS[2];
    for (let tr = 0; tr < TR; tr++) {
      const T = zl.map(id => tileArr(stripe(d, id, s, true), tr)), T0 = T[0], T1 = T[1], T2 = T[2];
      for (const t of T) t.fill(0);
      const kA = tr * BT, kE = Math.min(NB, kA + BT);
      for (let m = mA; m <= mB; m++) {
        const c = (m & 127) * BT - kA, zo = (m - mA) * NB, eo = (m - a0) * NB;
        for (let k = kA; k < kE; k++) {
          const lo4 = k < KL && nosm;
          const vd = Math.round(255 * (lo4 ? ED[eo + k] : z0[zo + k])), vb = Math.min(255 - vd, Math.round(255 * (lo4 ? EB[eo + k] : z1[zo + k]))), vv = Math.min(255 - vd - vb, Math.round(255 * z2[zo + k]));
          T0[c + k] = vd; T1[c + k] = vb < 0 ? 0 : vb; T2[c + k] = vv < 0 ? 0 : vv;
        }
      }
      for (const id of zl) tidy(stripe(d, id, s, true), tr);
    }
  }
  /* ZRL2-END */
'''
rep("  // Zerlegen: ganzes Stück → Drums (perkussiv), Bass (Tiefband + Grundton-Kamm), Gesang (Vordergrund, stimmhaft), Rest. Ein Undo-Schritt.\n",
    BLOCK + "  // Zerlegen: ganzes Stück → Drums (perkussiv), Bass (Tiefband + Grundton-Kamm), Gesang (Vordergrund, stimmhaft), Rest. Ein Undo-Schritt.\n")
rep("        const X = magsAt(d, N, cen, NB), {H, mh} = hpss(X, n, NB, Lt, Lf);\n",
    "        const X = zrl2Mags(d, N, cen, NB, a0, s === s0), {H, mh} = zrl2Hpss(X, n, NB, Lt, Lf, MG - 1, n - MG);   /* ZRL2: Rand-Rahmen weiterreichen, HPSS nur gebrauchte Zeilen */\n")
rep("        for (let m = mA; m <= mB; m++) { const i = m - a0, r = m - mA; smRow(ED, zS[0], i, r); smRow(EB, zS[1], i, r); smRow(EV, zS[2], i, r); }\n",
    "        zrl2Sm(ED, EB, EV, zS, mA, mB, a0, NB, KL, KV, voc, sm);   /* ZRL2: 3×3 nur, wo die Ebene ≠ 0 sein kann (sonst 0 wie die volle Summe) */\n")
rep("        for (const id of zl) uTouch(d, id, s);\n        for (let tr = 0; tr < TR; tr++) {\n          const T = zl.map(id => tileArr(stripe(d, id, s, true), tr)), OW",
    "        for (const id of zl) uTouch(d, id, s);\n        if (!own.length) zrl2Tiles(d, zl, s, TR, mA, mB, a0, NB, KL, nosm, ED, EB, zS); else for (let tr = 0; tr < TR; tr++) {   /* ZRL2: ohne eigene Ebenen ohne Schleife je Zelle */\n          const T = zl.map(id => tileArr(stripe(d, id, s, true), tr)), OW")
open(p, 'w', encoding='utf-8').write(s)
print('ok')
