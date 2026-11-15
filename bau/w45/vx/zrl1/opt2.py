import sys
p = sys.argv[1]; s = open(p, encoding='utf-8').read()
def rep(old, new, cnt=1):
    global s
    n = s.count(old); assert n == cnt, (n, old[:90]); s = s.replace(old, new)
NW=[[0,8],[1,9],[2,7],[3,5],[4,6],[0,2],[1,4],[5,8],[7,9],[0,3],[2,4],[5,7],[6,9],[0,1],[3,6],[8,9],[1,5],[2,3],[4,8],[6,7],[1,2],[3,5],[4,6],[7,8],[2,3],[4,5],[6,7],[3,4],[5,6]]
net = ' '.join('t = Math.min(q%d, q%d); q%d = Math.max(q%d, q%d); q%d = t;' % (x, y, y, x, y, x) for x, y in NW)
# REPET-Median: bei 10 Nachbarn (Normalfall) Sortiernetz (29 Vergleiche, ohne Sprünge), sonst wie bisher
rep("""              const c = cR; for (let j = 0; j < c; j++) { const v = AQ[zRow[j] + k]; let p = j; while (p > 0 && zq[p - 1] > v) { zq[p] = zq[p - 1]; p--; } zq[p] = v; }   /* ZRL1: Median auf den Bytes, LUT erst danach (steigend → gleiche Werte) */
              if (c) { const x = X[o + k], R = Math.min(x, c & 1 ? LUT[zq[c >> 1]] : 0.5 * (LUT[zq[(c >> 1) - 1]] + LUT[zq[c >> 1]])), v = x - R; fg = v * v + R * R > 0 ? v * v / (v * v + R * R) : 0; }""",
"""              const c = cR; let R = 0;   /* ZRL1: Median auf den Bytes, LUT erst danach (steigend → gleiche Werte); 10 Nachbarn = Sortiernetz (29 Vergleiche, geprüft für alle 0-1-Folgen) */
              if (c === 10) { let q0 = AQ[zRow[0] + k], q1 = AQ[zRow[1] + k], q2 = AQ[zRow[2] + k], q3 = AQ[zRow[3] + k], q4 = AQ[zRow[4] + k], q5 = AQ[zRow[5] + k], q6 = AQ[zRow[6] + k], q7 = AQ[zRow[7] + k], q8 = AQ[zRow[8] + k], q9 = AQ[zRow[9] + k], t = 0;
                """ + net + """
                R = 0.5 * (LUT[q4] + LUT[q5]); }
              else if (c) { for (let j = 0; j < c; j++) { const v = AQ[zRow[j] + k]; let p = j; while (p > 0 && zq[p - 1] > v) { zq[p] = zq[p - 1]; p--; } zq[p] = v; } R = c & 1 ? LUT[zq[c >> 1]] : 0.5 * (LUT[zq[(c >> 1) - 1]] + LUT[zq[c >> 1]]); }
              if (c) { const x = X[o + k]; R = Math.min(x, R); const v = x - R; fg = v * v + R * R > 0 ? v * v / (v * v + R * R) : 0; }""")
# bassTrack4: Oberton-Bins je Kandidat einmal, Spitzen (±1 Bin) je Rahmen einmal (gleiche Ausdrücke/Reihenfolge → bitgleich)
rep("""      const S = C.length, NH = 8, E = new Float32Array(n * S), q = new Float32Array(n), Z = new Float32Array(K);
      for (let i = 0; i < n; i++) {
        const o = i * K; for (let k = 0; k < K; k++) Z[k] = Math.sqrt(Y[o + k]);
        const pk = kf => { const k = Math.round(kf); if (k < 1 || k >= K - 1) return 0; return Math.max(Z[k - 1], Z[k], Z[k + 1]); };
        const ka = Math.floor(30 / df);
        let best = 0;
        for (let j = 0; j < S; j++) {
          const f = C[j]; let s = 0, g = 1;
          for (let h = 1; h <= NH; h++, g *= 0.86) { const kf = h * f / df; if (kf >= K - 2) break; s += g * pk(kf); }
          // SPK4: Grundton-Pflicht – der Grundton muss als Spitze da sein (≥ φ × stärkster 2./3. Oberton), sonst Abschlag (Pads: C2/C3 aus C3+G3+C4)
          if (o6.pf) { const v1 = pk(f / df), u = Math.max(pk(2 * f / df), pk(3 * f / df)); if (v1 < o6.phi * u) s *= Math.pow(v1 / (o6.phi * u) + 1e-6, o6.pf); }""",
"""      const S = C.length, NH = 8, E = new Float32Array(n * S), q = new Float32Array(n), Z = new Float32Array(K);
      /* ZRL1: Oberton-Bins je Kandidat einmal (dieselben Ausdrücke wie pk → gleiche Bins), Spitzen (±1 Bin) je Rahmen einmal in PK; Summen-Reihenfolge wie vorher → bitgleich */
      const zIx = new Int32Array(S * NH), zN = new Int32Array(S), zG = new Float64Array(NH), zP = new Int32Array(S * 3); let zMx = K;
      { let g = 1; for (let h = 1; h <= NH; h++, g *= 0.86) zG[h - 1] = g; }
      for (let j = 0; j < S; j++) { const f = C[j]; let c = 0; for (let h = 1; h <= NH; h++) { const kf = h * f / df; if (kf >= K - 2) break; zIx[j * NH + c++] = Math.round(kf); } zN[j] = c;
        zP[3 * j] = Math.round(f / df); zP[3 * j + 1] = Math.round(2 * f / df); zP[3 * j + 2] = Math.round(3 * f / df); zMx = Math.max(zMx, zP[3 * j + 2] + 2); }
      const PK = new Float32Array(zMx);   // PK[k] = 0 für k < 1 und k ≥ K − 1 (wie pk)
      for (let i = 0; i < n; i++) {
        const o = i * K; for (let k = 0; k < K; k++) Z[k] = Math.sqrt(Y[o + k]);
        for (let k = 1; k < K - 1; k++) PK[k] = Math.max(Z[k - 1], Z[k], Z[k + 1]);
        const ka = Math.floor(30 / df);
        let best = 0;
        for (let j = 0; j < S; j++) {
          let s = 0; const jb = j * NH, nh = zN[j];
          for (let h = 0; h < nh; h++) s += zG[h] * PK[zIx[jb + h]];
          // SPK4: Grundton-Pflicht – der Grundton muss als Spitze da sein (≥ φ × stärkster 2./3. Oberton), sonst Abschlag (Pads: C2/C3 aus C3+G3+C4)
          if (o6.pf) { const v1 = PK[zP[3 * j]], u = Math.max(PK[zP[3 * j + 1]], PK[zP[3 * j + 2]]); if (v1 < o6.phi * u) s *= Math.pow(v1 / (o6.phi * u) + 1e-6, o6.pf); }""")
open(p, 'w', encoding='utf-8').write(s); print('ok')
