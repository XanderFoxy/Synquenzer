/* ===== I3 form core (Nachtrag 8 A.5, B.3 §3.1, §4.1) — PLACEHOLDER of branch i3-br-U (Teil C: I3c + I3d against a FORM
   placeholder). I3a (branch i3-br-K) brings the real core under the same names and replaces this script when it is merged:
   FORM.norm (= formNorm), FORM.eval, FORM.lib, wkLf. Until then a drawn LFO (shape 5) sounds as the triangle - the rule of
   §3.2/§4.2 for „form 5 without its table“; the worklet case 5, the table message lf and the song-beat phase come with I3a.
   The blocks sq-form-src (FORMCLEAN, the form sheet, the library) and sq-sr-src (TILT logic, I1f) load on first need. ===== */
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
  return {stub: true, TK, norm, eval: evalF, sharp: (f, ph) => sharp(f.k, (ph - Math.floor(ph)) * TK) / 1000, lib, START, hash};
})();
window.FORM = FORM;
function formNorm(f) { return FORM.norm(f); }
// wkLf (§4.2 b/c): the table of LFO n of track i to the engine. Placeholder: counted for the tests (preview rate, the old state
// back on abort); I3a sends {lf} in the same message as set
const FORMSENT = [];
function wkLf(i, n, f) { FORMSENT.push({i, n, h: f ? FORM.hash(f) : null, t: performance.now()}); if (FORMSENT.length > 600) FORMSENT.splice(0, 300); }
// sq-form-src / sq-sr-src: evaluated on first need (pattern mkLoad), tickAhead first
const FORML = {loaded: false, ms: 0, err: null}, SRL = {loaded: false, ms: 0, err: null};
function blockLoad(id, L, ok) {
  if (L.loaded && ok()) return true;
  try { if (typeof tickAhead === 'function') tickAhead(.3); } catch (e) {}
  const t0 = performance.now(), el = document.getElementById(id);
  try {
    if (!el) throw new Error(id + ' fehlt');
    const sc = document.createElement('script'); sc.textContent = el.textContent; document.head.appendChild(sc); sc.remove();
    if (!ok()) throw new Error(id + ' nicht geladen');
    L.loaded = true;
  } catch (e) { L.err = String(e && e.message || e); if (typeof logErr === 'function') logErr(e); }
  L.ms = performance.now() - t0;
  return L.loaded;
}
function formLoad() { return blockLoad('sq-form-src', FORML, () => typeof FORMCLEAN !== 'undefined' && typeof FUI !== 'undefined'); }
function srLoad() { return blockLoad('sq-sr-src', SRL, () => typeof NEIGEN !== 'undefined'); }
// one call from the existing close paths (sheet closed, panic, scene change, project loaded): a running stroke or wipe is
// dropped and the old state goes back to the engine (§5.5, §6.3); nothing happens while the block is not loaded
function formAbort(why) { if (FORML.loaded && typeof FUI !== 'undefined') { try { FUI.close(why || 'zu'); } catch (e) { if (typeof logErr === 'function') logErr(e); } } }
