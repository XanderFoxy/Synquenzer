/* ---- I3a in 'dirigent-analog' (Nachtrag 8 B.3 4.1-4.3): LFO shape 5 = drawn. The table comes as {lf: [a1, a2]} (Float32Array =
   new table, null = none, false = unchanged) before {set} in onMsg. lfT evaluates exactly the rules of FORM.eval in the main
   thread: sections hold / straight / curve g(s) = (e^(ks) - 1) / (e^k - 1), k = 6 b; every jump is a causal ramp of
   e_j = min(L_j, max(e_min, min(1 ms, L_j / 4))), e_min = 2 CR / SR; with wrap the cycle end is a jump too. Shape 5 without
   its table plays the triangle and counts lfMiss. The free phase of a TAKT form follows the SONG beat (mkSong). ASCII only. ---- */
function lfSeg(T, i, u) {
  const N = T.length >> 2, a = i * 4;
  if (i >= N - 1) return T[a + 1];
  const x0 = T[a], x1 = T[a + 4], y0 = T[a + 1], y1 = T[a + 5], L = x1 - x0;
  if (!(L > 0)) return y1;
  const s = (u - x0) / L, t = T[a + 2];
  if (t === 0) return y0;
  if (t === 1) return y0 + (y1 - y0) * s;
  const kap = 6 * T[a + 3];
  return y0 + (y1 - y0) * (Math.abs(kap) < 1e-4 ? s : (Math.exp(kap * s) - 1) / (Math.exp(kap) - 1));
}
function lfFind(T, u) {
  const N = T.length >> 2; let lo = 0, hi = N - 2;
  while (lo < hi) { const m = (lo + hi + 1) >> 1; if (T[m * 4] <= u) lo = m; else hi = m - 1; }
  while (lo < N - 2 && T[(lo + 1) * 4] <= u) lo++;
  return lo;
}
function lfT(T, ph, cyc, wrap) {
  const N = T.length >> 2; if (N < 2) return 0;
  const u = ph - Math.floor(ph), i = lfFind(T, u), v = lfSeg(T, i, u);
  if (!(cyc > 0)) return v;
  const x0 = T[i * 4], here = T[i * 4 + 1];
  if (x0 === 0 && !wrap) return v;
  const left = x0 === 0 ? lfSeg(T, lfFind(T, 1 - 1e-9), 1) : lfSeg(T, lfFind(T, x0 - 1e-9), x0);
  if (left === here) return v;
  const Ls = ((i + 1 < N ? T[(i + 1) * 4] : 1) - x0) * cyc, emin = 2 * CR / SR;
  const ej = Math.min(Ls, Math.max(emin, Math.min(0.001, Ls / 4))), du = (u - x0) * cyc;
  if (!(ej > 0) || du >= ej) return v;
  return left + (v - left) * (du / ej);
}
Object.assign(AnalogCore.prototype, {
  lfMsg(a) {
    if (!Array.isArray(a)) return;
    for (let n = 0; n < 2; n++) { const x = a[n]; if (x === false || x === undefined) continue; const k = n ? 'lf2' : 'lf1'; this[k] = x && x.length >= 8 ? x : null; }
  },
  lf5(n, ph, sync) {
    const T = n === 2 ? this.lf2 : this.lf1;
    if (!T) { this.lfMiss = (this.lfMiss || 0) + 1; return ph < .5 ? 4 * ph - 1 : 3 - 4 * ph; }
    return lfT(T, ph, (sync > 0 ? sync : 4) * 60 / this.bpm, true);
  },
  // the phase of a TAKT form at the song beat (4.3): song beat = transport beat - off (prev before the wrap)
  lfSongPh(frame, sync) {
    if (!(sync > 0) || this.songStart < 0) return -1;
    let b = (frame * ISR - this.songStart) * this.bpm / 60; const g = this.sqSong;
    if (g) b -= g.wrap != null && b < g.wrap - 1e-9 ? g.prev : g.off;
    return ((b / sync) % 1 + 1) % 1;
  },
});
