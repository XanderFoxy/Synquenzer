/* ---- SRCore (Nachtrag 8 I1c, B.1 5.1-5.3): the one DOM-free core of the super knob and the scene morph. The same source text is
   placed into the main thread and into the worklet 'dirigent-analog' (build mk.mjs); there is no second version. ASCII only.
   Curves (law) exactly like toNorm/fromNorm of the main thread: lin (also bip and a missing c), exp, db, hdec, pow (kk), bipow (kk).
   path: piecewise linear over the points of Z_k (point 1 at 0 with delta 0 is implicit), constant after the last point.
   stufe: nearest point with a switch at the middle between two points and a hysteresis of +-0.02 (0 = base, no value).
   Smoothing: one pole per render quantum, tau 20 ms, snaps when closer than 1e-6. Ramps: exact, from t1 on exactly x1. ---- */
const SRCORE = (function () {
  'use strict';
  const H = 0.02, SNAP = 1e-6, TAU = 0.020;
  const fin = v => typeof v === 'number' && v === v && v !== Infinity && v !== -Infinity;
  const cl01 = v => (v < 0 ? 0 : v > 1 ? 1 : v);
  function toN(law, lo, hi, kk, v) {
    let n;
    if (law === 'exp') n = Math.log(v / lo) / Math.log(hi / lo);
    else if (law === 'db') n = v > 0 ? (20 * Math.log10(v) + 40) / 52 : 0;
    else if (law === 'hdec') n = v >= 59 ? 1 : 0.96 * Math.log(Math.max(v, 0.2) / 0.2) / Math.log(100);
    else if (law === 'pow') n = Math.pow(Math.max(0, (v - lo) / (hi - lo)), 1 / kk);
    else if (law === 'bipow') { const u = Math.sign(v) * Math.pow(Math.min(1, Math.abs(v) / hi), 1 / kk); n = (u + 1) / 2; }
    else n = (v - lo) / (hi - lo);
    return fin(n) ? cl01(n) : 0;
  }
  function fromN(law, lo, hi, kk, n) {
    n = cl01(n);
    if (law === 'exp') return lo * Math.pow(hi / lo, n);
    if (law === 'db') return n <= 0 ? 0 : Math.min(hi, Math.pow(10, (52 * n - 40) / 20));
    if (law === 'hdec') return n >= 0.985 ? 60 : Math.min(20, 0.2 * Math.pow(100, n / 0.96));
    if (law === 'pow') return lo + (hi - lo) * Math.pow(n, kk);
    if (law === 'bipow') { const u = 2 * n - 1; return hi * Math.sign(u) * Math.pow(Math.abs(u), kk); }
    return lo + (hi - lo) * n;
  }
  // the shift SR_k(x) in the knob space: points n[] (ascending, > 0) with deltas d[]; point 1 (0, 0) is implicit
  function path(n, d, x) {
    let px = 0, pd = 0;
    for (let i = 0; i < n.length; i++) {
      const p = n[i];
      if (x <= p) return p > px ? pd + (d[i] - pd) * (x - px) / (p - px) : d[i];
      px = p; pd = d[i];
    }
    return pd;
  }
  // a stepped key: the index of the point that holds (0 = point 1 = base, i = n[i - 1]); cur = the index held now (-1 = none yet)
  function stufe(n, x, cur) {
    const m = n.length, pt = i => (i === 0 ? 0 : n[i - 1]);
    let c = cur, h = H;
    if (!(c >= 0 && c <= m)) { c = 0; h = 0; }
    while (c < m && x > (pt(c) + pt(c + 1)) / 2 + h) c++;
    while (c > 0 && x < (pt(c - 1) + pt(c)) / 2 - h) c--;
    return c;
  }
  const alpha = sr => 1 - Math.exp(-128 / (TAU * sr));
  function smooth(xs, x, a) { let y = xs + (x - xs) * a; if (!fin(y)) y = x; if (Math.abs(x - y) < SNAP) y = x; if (Math.abs(y) < 1e-30) y = 0; return y; }
  // a ramp {x0, x1, t0, t1}: linear in the position; exactly x1 from t1 on
  function rampAt(r, t) {
    if (!r) return null;
    if (t >= r.t1 || !(r.t1 > r.t0)) return r.x1;
    if (t <= r.t0) return r.x0;
    return r.x0 + (r.x1 - r.x0) * (t - r.t0) / (r.t1 - r.t0);
  }
  // the rest of a not yet snapped smoothing at the start of a ramp decays with tau 20 ms: xs = x(t) + e
  function rampRest(e0, dt) { const e = e0 * Math.exp(-dt / TAU); return Math.abs(e) < SNAP ? 0 : e; }
  // the end value of a continuous key: delta exactly 0 -> the base unchanged (bit-equal, 5.1)
  function endVal(law, lo, hi, kk, base, dl) {
    if (dl === 0) return base;
    const v = fromN(law, lo, hi, kk, toN(law, lo, hi, kk, base) + dl);
    return fin(v) ? (Math.abs(v) < 1e-30 ? 0 : v) : base;
  }
  // the S curve of the scene morph (KZ1): x^2 (3 - 2x)
  const sCurve = u => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
  return {toN, fromN, path, stufe, alpha, smooth, rampAt, rampRest, endVal, sCurve, H, TAU, fin};
})();
if (typeof module !== 'undefined') module.exports = SRCORE;
