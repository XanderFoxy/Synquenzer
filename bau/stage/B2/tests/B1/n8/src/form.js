/* ===== I3a form core (Nachtrag 8 A.5, B.3 3.1, 4.1, 4.2): the one form format of I3, I1 and I2. FORM.norm (= formNorm), FORM.eval
   (edges as causal ramps, e = 1 ms for the LFO, wrap), FORM.lib (Pumpen, Gate, Triller as copies), FORM.tab (the flat worklet
   table [x/768, y/1000, t, b/100] x N), FORM.hash. Loaded before SQStore: normSynthP keeps l1f/l2f through it. The worklet
   evaluates the same rules in lfT (ASCII, block sq-worklet-src). ===== */
const FORM = (function () {
  'use strict';
  const TK = 768, KMAX = 65;
  const fin = x => typeof x === 'number' && isFinite(x);
  const cl = (x, a, b) => (x < a ? a : x > b ? b : x);
  // formNorm (§3.1): v 1; x whole ticks 0..768, sorted (stable), at most two knots per x, first 0 / last 768 (a missing end
  // gets a knot with the neighbour's value); y -1000..1000; t 0 hold / 1 straight / 2 curve (b 0 -> straight); last t 0;
  // <= 65 knots (the first 64 plus the end); n without control characters, <= 24; key order v, n, k. Invalid -> null
  function norm(f) {
    if (!f || typeof f !== 'object' || f.v !== 1 || !Array.isArray(f.k)) return null;
    let k = [];
    for (const q of f.k) {
      if (!Array.isArray(q) || !fin(q[0]) || !fin(q[1])) continue;
      let t = fin(q[2]) ? Math.round(cl(q[2], 0, 2)) : 1, b = fin(q[3]) ? Math.round(cl(q[3], -100, 100)) : 0;
      if (t !== 2) b = 0; else if (b === 0) t = 1;
      k.push([Math.round(cl(q[0], 0, TK)), Math.round(cl(q[1], -1000, 1000)), t, b]);
    }
    if (k.length < 2) return null;
    k = k.map((q, i) => [q, i]).sort((a, b) => a[0][0] - b[0][0] || a[1] - b[1]).map(a => a[0]);
    const o = [];
    for (const q of k) { const n = o.length; if (n >= 2 && o[n - 1][0] === q[0] && o[n - 2][0] === q[0]) continue; o.push(q); }
    if (o[0][0] !== 0) o.unshift([0, o[0][1], 0, 0]);
    if (o[o.length - 1][0] !== TK) o.push([TK, o[o.length - 1][1], 0, 0]);
    let r = o.length > KMAX ? o.slice(0, KMAX - 1).concat([o[o.length - 1]]) : o;
    if (r.length > 2 && r[r.length - 2][0] === TK && r[r.length - 3] && r[r.length - 3][0] === TK) r.splice(r.length - 2, 1);
    r[r.length - 1][2] = 0; r[r.length - 1][3] = 0;
    const out = {v: 1};
    if (typeof f.n === 'string') { const n = f.n.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 24); if (n) out.n = n; }
    out.k = r;
    return out;
  }
  // §4.1: value at phase ph (0..1) of one cycle; e = edge width in seconds (0 = sharp), o = {wrap, cyc (cycle in s), emin}
  const g = (s, b) => { const kap = .06 * b; return Math.abs(kap) < 1e-4 ? s : (Math.exp(kap * s) - 1) / (Math.exp(kap) - 1); };
  function seg(K, i, u) {      // value of section i at tick u (sharp)
    const a = K[i], c = K[i + 1]; if (!c) return a[1];
    const L = c[0] - a[0]; if (L <= 0) return c[1];
    const s = (u - a[0]) / L;
    return a[2] === 0 ? a[1] : a[2] === 1 ? a[1] + (c[1] - a[1]) * s : a[1] + (c[1] - a[1]) * g(s, a[3]);
  }
  function find(K, u) { let lo = 0, hi = K.length - 2; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (K[m][0] <= u) lo = m; else hi = m - 1; } while (lo < K.length - 2 && K[lo + 1][0] <= u) lo++; return lo; }
  function sharp(K, u) { if (u >= TK) return K[K.length - 1][1]; return seg(K, find(K, u), u); }
  function evalF(f, ph, e, o) {
    const K = f && f.k; if (!K || K.length < 2) return 0;
    o = o || {}; ph = ph - Math.floor(ph); const u = ph * TK;
    const i = find(K, u), v = seg(K, i, u);
    if (!(e > 0)) return v / 1000;
    const cyc = o.cyc > 0 ? o.cyc : 2, emin = o.emin != null ? o.emin : 2 * 16 / 48000;
    // a jump at the start x0 of the section that holds u: left limit (end of the section before; at 0 only with wrap) vs. start
    const x0 = K[i][0], here = K[i][1];
    if (x0 === 0 && !o.wrap) return v / 1000;
    const left = x0 === 0 ? seg(K, find(K, TK - 1e-9), TK) : seg(K, find(K, x0 - 1e-9), x0);
    if (left === here) return v / 1000;
    const Lsec = ((K[i + 1] ? K[i + 1][0] : TK) - x0) / TK * cyc;
    const ej = Math.min(Lsec, Math.max(emin, Math.min(e, Lsec / 4))), du = (u - x0) / TK * cyc;
    if (!(ej > 0) || du >= ej) return v / 1000;
    return (left + (v - left) * (du / ej)) / 1000;
  }
  // the library (§6.5): copies, fixed knots
  function lib() {
    const P = [], G_ = [], T = [];
    for (let q = 0; q < 4; q++) P.push([192 * q, -1000, 2, -60], [192 * q + 134, 0, 0, 0]);
    P.push([TK, 0, 0, 0]);
    for (const s of [1, 3, 4, 6, 7, 9, 11, 12, 14, 15]) { const i = s - 1; G_.push([48 * i, 0, 0, 0], [48 * i + 41, -1000, 0, 0]); }
    G_.push([TK, -1000, 0, 0]);
    for (let j = 0; j < 32; j++) T.push([24 * j, j % 2 ? 1000 : 0, 0, 0]);
    T.push([TK, 1000, 0, 0]);
    return {Pumpen: {v: 1, n: 'Pumpen', k: P}, Gate: {v: 1, n: 'Gate', k: G_}, Triller: {v: 1, n: 'Triller', k: T}};
  }
  const START = () => ({v: 1, k: [[0, -1000, 1, 0], [384, 1000, 1, 0], [TK, -1000, 0, 0]]});   // §6.2: the start triangle
  function hash(f) { const s = f ? JSON.stringify(f) : ''; let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); } return (h >>> 0).toString(36); }
  // the worklet table (4.2): Float32Array flat [x/768, y/1000, t, b/100] x N
  function tab(f) { const K = f && f.k; if (!K || K.length < 2) return null; const T = new Float32Array(K.length * 4);
    for (let i = 0; i < K.length; i++) { T[i * 4] = K[i][0] / TK; T[i * 4 + 1] = K[i][1] / 1000; T[i * 4 + 2] = K[i][2]; T[i * 4 + 3] = K[i][3] / 100; } return T; }
  return {stub: false, tab, TK, norm, eval: evalF, sharp: (f, ph) => sharp(f.k, (ph - Math.floor(ph)) * TK) / 1000, lib, START, hash};
})();
window.FORM = FORM;
function formNorm(f) { return FORM.norm(f); }
