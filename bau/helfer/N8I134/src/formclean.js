/* FORMCLEAN (I3b, Nachtrag 8 B.3 §3.1, §5.2, §5.4, §5.5, §6.3): the DOM-free core behind the form sheet. A form is
   {v: 1, n?, k: [[x, y, t, b], …]} with x in ticks 0…768 of the cycle, y −1000…1000, t 0 hold · 1 line · 2 curve, b −100…100.
   clean() turns a scribble (one value per tick, NaN = untouched) into straight ramps, clean stairs and curves on the grid;
   norm()/eval() are stand-alone copies of the form format (the placeholder FORM uses the same text). */
const FORMCLEAN = (() => {
  const TK = 768, YM = 1000, CR = 16;
  const RASTER = [['1/4', 1], ['1/8', .5], ['1/16', .25], ['1/32', .125], ['1/8T', 1 / 3], ['1/16T', 1 / 6]];
  const clampN = (v, a, b) => (v < a ? a : v > b ? b : v);

  /* ---------- the form format (§3.1) ---------- */
  function norm(f) {
    if (!f || typeof f !== 'object' || !Array.isArray(f.k)) return null;
    if (f.v != null && f.v !== 1) return null;
    let k = [];
    for (const q of f.k) {
      if (!Array.isArray(q) || q.length < 2) continue;
      const x = +q[0], y = +q[1]; if (!isFinite(x) || !isFinite(y)) continue;
      let t = Math.round(+q[2]); if (!(t >= 0 && t <= 2)) t = 1;
      let b = Math.round(clampN(+q[3] || 0, -100, 100)); if (t !== 2) b = 0; else if (b === 0) t = 1;
      k.push([Math.round(clampN(x, 0, TK)), Math.round(clampN(y, -YM, YM)), t, b]);
    }
    if (k.length < 2) return null;
    k = k.map((q, i) => [q, i]).sort((a, c) => a[0][0] - c[0][0] || a[1] - c[1]).map(a => a[0]);   // stable
    const o = [];
    for (const q of k) { const n = o.length; if (n >= 2 && o[n - 1][0] === q[0] && o[n - 2][0] === q[0]) continue; o.push(q); }
    if (o[0][0] > 0) o.unshift([0, o[0][1], 0, 0]);
    if (o[o.length - 1][0] < TK) o.push([TK, o[o.length - 1][1], 0, 0]);
    const kk = o.length > 65 ? o.slice(0, 64).concat([o[o.length - 1]]) : o;
    const L = kk[kk.length - 1]; kk[kk.length - 1] = [TK, L[1], 0, 0];
    const r = {v: 1};
    if (typeof f.n === 'string') { const n = f.n.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 24); if (n) r.n = n; }
    r.k = kk;
    return r;
  }
  const gK = (s, kap) => (Math.abs(kap) < 1e-4 ? s : (Math.exp(kap * s) - 1) / (Math.exp(kap) - 1));
  // §4.1: value of the form at phase ph ∈ [0, 1); e = edge width in seconds (1 ms for the LFO, 20 ms for a ride), o.cyc = cycle
  // length in seconds, o.sr / o.cr the worklet rates; o.wrap: the cycle end is an edge too. Without e or cyc: no edge ramps.
  function evalF(f, ph, e, o) {
    const k = f.k, n = k.length; o = o || {};
    const u = (ph - Math.floor(ph)) * TK;
    const base = (uu, i) => {
      const a = k[i], c = k[i + 1]; if (!c) return a[1];
      const L = c[0] - a[0]; if (L <= 0 || a[2] === 0) return a[1];
      const s = (uu - a[0]) / L;
      return a[1] + (c[1] - a[1]) * (a[2] === 2 ? gK(s, .06 * a[3]) : s);
    };
    let i = 0, lo = 0, hi = n - 1;
    while (lo <= hi) { const m = (lo + hi) >> 1; if (k[m][0] <= u) { i = m; lo = m + 1; } else hi = m - 1; }
    if (i >= n - 1) i = n - 2;
    let v = base(u, i);
    if (e > 0 && o.cyc > 0) {
      const sr = o.sr || 48000, cr = o.cr || CR, emin = 2 * cr / sr;
      // the jump at x = k[j][0] (j = the first knot at that x that starts a segment of length > 0, or the end)
      // left limit at X = the end value of the last segment of length > 0 before X (at 0 with wrap: the cycle end)
      const X = k[i][0], endOf = q => (k[q][2] === 0 ? k[q][1] : k[q + 1][1]);
      let left = null, q = i - 1; while (q >= 0 && k[q][0] >= X) q--;
      if (q >= 0) left = endOf(q);
      else if (o.wrap) { q = n - 2; while (q >= 0 && k[q][0] >= TK) q--; if (q >= 0) left = endOf(q); }
      const right = base(X, i);
      if (left != null && left !== right) {
        const Lj = (k[i + 1][0] - X) / TK * o.cyc;
        const ej = Math.min(Lj, Math.max(emin, Math.min(e, Lj / 4))), w = ej / o.cyc * TK;
        if (w > 0 && u < X + w) { const tgt = base(X + w, i); v = left + (tgt - left) * (u - X) / w; }
      }
    }
    return v / YM;
  }

  /* ---------- grid (§6.3) ---------- */
  const BYV = RASTER.slice().sort((a, b) => a[1] - b[1]);       // finest first
  function raster(zyk, g) {
    let j = BYV.findIndex(r => Math.abs(r[1] - g) < 1e-9); if (j < 0) j = BYV.findIndex(r => r[0] === '1/16');
    const j0 = j;
    while (zyk / BYV[j][1] < 2 - 1e-9 && j > 0) j--;
    while (zyk / BYV[j][1] > 64 + 1e-9 && j < BYV.length - 1) j++;
    const gg = BYV[j][1], q = zyk / gg, Z = TK * gg / zyk, N = Math.ceil(q - 1e-9), rest = Math.abs(q - Math.round(q)) > 1e-6;
    const lines = []; for (let r = 0; r * Z < TK - 1e-9; r++) { const x = Math.round(r * Z); if (!lines.length || lines[lines.length - 1] !== x) lines.push(x); }
    if (lines[lines.length - 1] !== TK) lines.push(TK);
    return {g: gg, name: BYV[j][0], Z, N, lines, rest, auto: j !== j0};
  }
  const rasterText = (zykName, R) => zykName + ' · ' + (R.rest ? Math.floor(R.N - 1 + 1e-9) + ' Felder + Rest' : R.N + ' Felder');

  /* ---------- the paint buffer (§5.1) ---------- */
  const newRaw = () => { const r = new Float32Array(TK + 1); r.fill(NaN); return r; };
  function paint(raw, pts) {
    let u0 = Infinity, u1 = -Infinity;
    const put = (x, y) => { if (x < 0 || x > TK) return; raw[x] = y; if (x < u0) u0 = x; if (x > u1) u1 = x; };
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i - 1] || pts[i], c = pts[i];
      const ua = clampN(a[0], 0, TK), ub = clampN(c[0], 0, TK), ya = clampN(a[1], -YM, YM), yb = clampN(c[1], -YM, YM);
      if (Math.abs(ub - ua) < 1e-9) { put(Math.round(ub), yb); continue; }
      const lo = Math.ceil(Math.min(ua, ub)), hi = Math.floor(Math.max(ua, ub));
      const fwd = ub > ua;
      if (lo > hi) { put(Math.round(ub), yb); continue; }
      for (let s = 0; s <= hi - lo; s++) { const x = fwd ? lo + s : hi - s; put(x, ya + (yb - ya) * (x - ua) / (ub - ua)); }
    }
    return u1 < u0 ? null : {u0, u1};
  }
  function sample(f) {
    const d = new Float32Array(TK + 1), k = f.k;
    let i = 0;
    for (let x = 0; x <= TK; x++) {
      while (i < k.length - 2 && k[i + 1][0] <= x) i++;
      const a = k[i], c = k[i + 1];
      if (!c || c[0] <= a[0] || a[2] === 0) d[x] = a[1];
      else { const s = (x - a[0]) / (c[0] - a[0]); d[x] = a[1] + (c[1] - a[1]) * (a[2] === 2 ? gK(Math.min(1, s), .06 * a[3]) : Math.min(1, s)); }
    }
    return d;
  }

  /* ---------- fitting helpers on the data array D (ticks a…b inclusive) ---------- */
  function fitMean(D, a, b) { let s = 0, n = 0; for (let x = a; x <= b; x++) { s += D[x]; n++; } const m = s / n; let e = 0; for (let x = a; x <= b; x++) e += (D[x] - m) ** 2; return {m, rms: Math.sqrt(e / n)}; }
  // least squares line over ticks a…b, expressed by its values at the segment ends sa, sb
  function fitLine(D, a, b, sa, sb) {
    let n = 0, sx = 0, sy = 0, sxx = 0, sxy = 0;
    for (let x = a; x <= b; x++) { n++; sx += x; sy += D[x]; sxx += x * x; sxy += x * D[x]; }
    const den = n * sxx - sx * sx, be = den > 1e-9 ? (n * sxy - sx * sy) / den : 0, al = (sy - be * sx) / n;
    let e = 0; for (let x = a; x <= b; x++) e += (D[x] - al - be * x) ** 2;
    return {y0: al + be * sa, y1: al + be * sb, rms: Math.sqrt(e / n), slope: be};
  }
  // curve y0 + (y1 − y0) g(s): for a fixed bend the ends are linear least squares; the bend by golden section (24 steps)
  function curveAt(D, a, b, sa, sb, bb, fix) {
    const kap = .06 * bb; let n = 0, A11 = 0, A12 = 0, A22 = 0, r1 = 0, r2 = 0;
    for (let x = a; x <= b; x++) { const g = gK((x - sa) / (sb - sa), kap), h = 1 - g; n++; A11 += h * h; A12 += h * g; A22 += g * g; r1 += h * D[x]; r2 += g * D[x]; }
    let y0, y1;
    if (fix) { y0 = fix[0]; y1 = fix[1]; }
    else { const det = A11 * A22 - A12 * A12; if (Math.abs(det) < 1e-9) return null; y0 = (r1 * A22 - r2 * A12) / det; y1 = (A11 * r2 - A12 * r1) / det; }
    let e = 0; for (let x = a; x <= b; x++) e += (D[x] - y0 - (y1 - y0) * gK((x - sa) / (sb - sa), kap)) ** 2;
    return {y0, y1, b: bb, rms: Math.sqrt(e / n)};
  }
  function fitCurve(D, a, b, sa, sb, fix) {
    const R = (Math.sqrt(5) - 1) / 2; let lo = -100, hi = 100;
    let c = hi - R * (hi - lo), d = lo + R * (hi - lo), fc = curveAt(D, a, b, sa, sb, c, fix), fd = curveAt(D, a, b, sa, sb, d, fix);
    for (let it = 0; it < 24; it++) {
      if (!fc || !fd) break;
      if (fc.rms < fd.rms) { hi = d; d = c; fd = fc; c = hi - R * (hi - lo); fc = curveAt(D, a, b, sa, sb, c, fix); }
      else { lo = c; c = d; fc = fd; d = lo + R * (hi - lo); fd = curveAt(D, a, b, sa, sb, d, fix); }
    }
    const best = fc && fd ? (fc.rms < fd.rms ? fc : fd) : fc || fd;
    if (!best) return null;
    best.b = Math.round(best.b);
    return curveAt(D, a, b, sa, sb, best.b, fix);
  }
  // vertical-distance Ramer-Douglas-Peucker (the form is a function of u)
  function rdp(D, a, b, eps) {
    const keep = [a, b], st = [[a, b]];
    while (st.length) {
      const [p, q] = st.pop(); if (q - p < 2) continue;
      let m = -1, md = eps;
      for (let x = p + 1; x < q; x++) { const dv = Math.abs(D[x] - (D[p] + (D[q] - D[p]) * (x - p) / (q - p))); if (dv > md) { md = dv; m = x; } }
      if (m >= 0) { keep.push(m); st.push([p, m], [m, q]); }
    }
    return keep.sort((x, y) => x - y);
  }
  function median5(d, a, b) {
    const o = new Float32Array(TK + 1), w = [0, 0, 0, 0, 0];
    for (let x = 0; x <= TK; x++) o[x] = d[x];
    for (let x = a; x <= b; x++) {
      let n = 0; for (let j = x - 2; j <= x + 2; j++) if (j >= a && j <= b) w[n++] = d[j];
      const s = w.slice(0, n).sort((p, q) => p - q); o[x] = n % 2 ? s[n >> 1] : (s[n / 2 - 1] + s[n / 2]) / 2;
    }
    return o;
  }
  const snapH = y => {
    if (Math.abs(y) >= 920) return y < 0 ? -YM : YM;
    if (Math.abs(y) <= 40) return 0;
    const m = Math.round(y / 125) * 125; if (Math.abs(m - y) <= 40) return m;
    return Math.round(y / 5) * 5;
  };

  /* ---------- clean (§5.2, §5.4) ---------- */
  // segments: {a, b, t: 0|1|2, y0, y1, bb, eL (edge at a: true), lo, hi (data range)}
  function classify(D, s, Z, tol, edgeBoth) {
    const {lo, hi, a, b} = s, n = hi - lo + 1;
    if (n < 2) { const m = D[Math.max(lo, Math.min(hi, lo))]; return {t: 0, y0: m, y1: m, bb: 0, rms: 0}; }
    const mm = fitMean(D, lo, hi), ln = fitLine(D, lo, hi, a, b);
    // §5.2 step 4 (flat): |Δy| ≤ 60 over at least ½ field; a flat piece between two edges counts at any length
    if (Math.abs(ln.y1 - ln.y0) <= 60 && mm.rms <= tol && (b - a >= Z / 2 || edgeBoth)) return {t: 0, y0: mm.m, y1: mm.m, bb: 0, rms: mm.rms};
    if (ln.rms <= tol) return {t: 1, y0: ln.y0, y1: ln.y1, bb: 0, rms: ln.rms};
    const cv = n >= 4 ? fitCurve(D, lo, hi, a, b) : null;
    if (cv && cv.rms <= tol && cv.b !== 0) return {t: 2, y0: cv.y0, y1: cv.y1, bb: cv.b, rms: cv.rms};
    return {t: -1, y0: ln.y0, y1: ln.y1, bb: 0, rms: cv ? Math.min(cv.rms, ln.rms) : ln.rms, cv};
  }
  function splitFit(D, s, Z, tol, depth, eB, out) {
    const c = classify(D, s, Z, tol, eB);
    if (c.t >= 0 || depth >= 4 || s.hi - s.lo < 6) {
      if (c.t < 0) { if (c.cv && c.cv.rms < c.rms + 1e-9 && c.cv.b !== 0) Object.assign(c, {t: 2, y0: c.cv.y0, y1: c.cv.y1, bb: c.cv.b}); else c.t = 1; }
      out.push(Object.assign({}, s, c)); return;
    }
    // split at the largest deviation from the chord (§5.2 step 5)
    const ya = D[s.lo], yb = D[s.hi]; let m = -1, md = -1;
    for (let x = s.lo + 3; x <= s.hi - 3; x++) { const dv = Math.abs(D[x] - (ya + (yb - ya) * (x - s.lo) / (s.hi - s.lo))); if (dv > md) { md = dv; m = x; } }
    if (m < 0) { c.t = c.t < 0 ? 1 : c.t; out.push(Object.assign({}, s, c)); return; }
    splitFit(D, {a: s.a, b: m, lo: s.lo, hi: m, eL: s.eL}, Z, tol, depth + 1, false, out);
    splitFit(D, {a: m, b: s.b, lo: m, hi: s.hi, eL: false}, Z, tol, depth + 1, false, out);
  }

  function cleanRegion(raw, base, A, B, o, epsF) {
    const Z = o.Z, lines = o.lines || [], on = o.on !== false;
    const d = new Float32Array(TK + 1);
    for (let x = 0; x <= TK; x++) d[x] = isNaN(raw[x]) ? base[x] : raw[x];
    const D = median5(d, A, B);                                             // step 1
    let segs = [];
    if (!on) {                                                              // §5.4: only RDP ε 10, all lines
      const v = rdp(D, A, B, 10 * epsF);
      for (let i = 0; i < v.length - 1; i++) segs.push({a: v[i], b: v[i + 1], t: 1, y0: D[v[i]], y1: D[v[i + 1]], bb: 0, eL: false});
      return {segs, D};
    }
    const tol = 60 * epsF;
    // steps 2–3: coarse RDP; steep short pieces are edges
    const v = rdp(D, A, B, 40 * epsF), edges = [];
    for (let i = 0; i < v.length - 1; i++) {
      let p = v[i], q = v[i + 1], dy = D[q] - D[p];
      const steep = (pp, qq) => { const dd = D[qq] - D[pp]; return Math.abs(dd) >= 150 && (qq - pp <= 6 || (Math.abs(dd) / (qq - pp) >= 25 && qq - pp <= Z / 3)); };
      if (!steep(p, q)) continue;
      while (i + 2 < v.length && Math.sign(D[v[i + 2]] - D[v[i + 1]]) === Math.sign(dy) && steep(v[i + 1], v[i + 2]) && v[i + 2] - p <= Math.max(6, Z / 3)) { i++; q = v[i + 1]; dy = D[q] - D[p]; }
      // the edge sits at the largest one-tick jump of the painted data inside the steep span
      let x = q, mj = -1;
      for (let k = p + 1; k <= q; k++) { const j = (d[k] - d[k - 1]) * Math.sign(dy); if (j > mj + 1e-6) { mj = j; x = k; } }
      if (x <= A || x >= B) continue;
      edges.push({x, p, q});
    }
    // pieces between edges, each fitted top-down (steps 4, 5)
    const cuts = [{x: A, q: A}].concat(edges).concat([{x: B, p: B}]);
    for (let i = 0; i < cuts.length - 1; i++) {
      const L = cuts[i], Rr = cuts[i + 1];
      const a = L.x, b = Rr.x; if (b <= a) continue;
      let lo = i === 0 ? A : Math.max(L.q, a), hi = i === cuts.length - 2 ? B : Math.min(Rr.p, b - 1);
      if (hi < lo) { lo = Math.min(a, b - 1); hi = lo; }
      const out = [];
      splitFit(D, {a, b, lo, hi, eL: i > 0}, Z, tol, 0, i > 0 && i < cuts.length - 2, out);
      out[0].eL = i > 0;
      segs.push(...out);
    }
    // merge pass: neighbours without an edge between them that one model fits
    for (let guard = 0; guard < 64; guard++) {
      let best = -1, bc = null;
      for (let i = 0; i < segs.length - 1; i++) {
        const s1 = segs[i], s2 = segs[i + 1]; if (s2.eL) continue;
        const m = {a: s1.a, b: s2.b, lo: s1.lo, hi: s2.hi};
        const c = classify(D, m, Z, tol, false);
        if (c.t < 0) continue;
        if (!bc || c.rms < bc.rms) { bc = Object.assign(m, c, {eL: s1.eL}); best = i; }
      }
      if (best < 0) break;
      segs.splice(best, 2, bc);
    }
    return {segs, D, d};
  }

  // knots of the region from its segments: joints, edges, pins at the region ends
  function joinSegs(segs, D, base, A, B, fixA, fixB) {
    const n = segs.length;
    for (let i = 0; i < n - 1; i++) {
      const s = segs[i], r = segs[i + 1];
      if (r.eL) continue;
      if (s.t === 0 && r.t === 0) { if (Math.abs(s.y0 - r.y0) > 20) r.eL = true; continue; }
      const v = s.t === 0 ? s.y0 : r.t === 0 ? r.y0 : (s.y1 + r.y0) / 2;
      if (s.t !== 0) s.y1 = v; if (r.t !== 0) r.y0 = v;
    }
    const s0 = segs[0], sn = segs[n - 1];
    if (fixA) { if (Math.abs(s0.y0 - base[A]) < 150) { if (s0.t === 0) s0.y0 = s0.y1 = base[A]; else s0.y0 = base[A]; s0.pinA = true; } else s0.eA = base[A]; }
    if (fixB) { if (Math.abs(sn.y1 - base[B]) < 150) { if (sn.t === 0) sn.y0 = sn.y1 = base[B]; else sn.y1 = base[B]; sn.pinB = true; } }
  }
  function refit(D, s) {
    if (s.t !== 2) return;
    const lo = Math.max(s.lo, s.a), hi = Math.min(s.hi, s.b); if (hi - lo < 3 || s.b <= s.a) { s.t = 1; s.bb = 0; return; }
    const c = fitCurve(D, lo, hi, s.a, s.b, [s.y0, s.y1]);
    if (!c || c.b === 0) { s.t = 1; s.bb = 0; } else s.bb = c.b;
  }
  function snapTime(segs, lines, Z, A, B) {
    if (!lines.length) return;
    const near = x => { let best = x, bd = Z / 3 + 1e-9; for (const L of lines) { const dd = Math.abs(L - x); if (dd <= bd) { bd = dd; best = L; } } return best; };
    const old = segs.map(s => [s.a, s.b]);
    for (let i = 1; i < segs.length; i++) {
      const x = segs[i].a; if (x <= A || x >= B) continue;
      const nx = near(x); if (nx === x) continue;
      segs[i - 1].b = nx; segs[i].a = nx;
    }
    // guards: a hold never shrinks to nothing; boundaries keep their order
    for (let pass = 0; pass < 3; pass++) for (let i = 0; i < segs.length; i++) {
      const s = segs[i];
      if (s.b < s.a || (s.t === 0 && s.b <= s.a && old[i][1] > old[i][0])) {
        const ma = Math.abs(s.a - old[i][0]), mb = Math.abs(s.b - old[i][1]);
        if (mb >= ma && i < segs.length - 1) { s.b = old[i][1]; segs[i + 1].a = old[i][1]; } else if (i > 0) { s.a = old[i][0]; segs[i - 1].b = old[i][0]; }
        else { s.b = old[i][1]; if (segs[i + 1]) segs[i + 1].a = old[i][1]; }
      }
    }
    // a line or curve pushed to zero length becomes an edge
    for (let i = segs.length - 1; i >= 0; i--) {
      const s = segs[i]; if (s.b > s.a || s.t === 0) continue;
      if (segs.length < 2) break;
      const r = segs[i + 1];
      if (r) { r.eL = true; r.wasL = s.y0; segs.splice(i, 1); }
      else { segs[i - 1].b = s.a; segs.splice(i, 1); }
    }
  }
  // §5.2 step 8: clean stairs
  function stairs(segs, Z, B, hl) {
    let i = 0;
    while (i < segs.length) {
      let j = i; while (j + 1 < segs.length && segs[i].t === 0 && segs[j + 1].t === 0 && segs[j + 1].eL) j++;
      const n = j - i + 1;
      if (segs[i].t === 0 && n >= 3) {
        const run = segs.slice(i, j + 1), len = run.map(s => s.b - s.a), jmp = [];
        for (let k = 1; k < n; k++) jmp.push(run[k].y0 - run[k - 1].y0);
        const med = a => { const s = a.slice().sort((p, q) => p - q), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
        const ml = med(len), mj = med(jmp);
        const okL = len.every(l => Math.abs(l - ml) <= .2 * ml), okJ = mj !== 0 && jmp.every(q => Math.sign(q) === Math.sign(mj) && Math.abs(q - mj) <= .25 * Math.abs(mj));
        if (okL && okJ) {
          const fl = Math.round(ml / Z) * Z, L = fl > 0 && Math.abs(fl - ml) <= Z / 3 ? fl : ml;
          const e1 = run[1].a, edges = []; for (let k = 1; k < n; k++) edges.push(Math.round(e1 + (k - 1) * L));
          const end = run[n - 1].b;
          if (edges[n - 2] < end && edges[0] > run[0].a) for (let k = 1; k < n; k++) { run[k].a = edges[k - 1]; run[k - 1].b = edges[k - 1]; }
          const y0 = run[0].y0, y1 = run[n - 1].y0;
          run.forEach((s, k) => { s.y0 = s.y1 = Math.round((y0 + (y1 - y0) * k / (n - 1)) / 5) * 5; });
          hl.push([run[0].a, run[n - 1].b]);
        }
      }
      i = j + 1;
    }
  }
  function mergeNb(segs) {
    for (let i = 0; i < segs.length - 1; i++) {
      const s = segs[i], r = segs[i + 1];
      if (s.t === 0 && r.t === 0 && Math.abs(s.y0 - r.y0) <= 20 && !(s.pinA && r.pinB)) {
        const v = s.pinA ? s.y0 : r.pinB ? r.y0 : snapH((s.y0 * (s.b - s.a) + r.y0 * (r.b - r.a)) / Math.max(1, r.b - s.a));
        s.b = r.b; s.y0 = s.y1 = v; s.pinB = r.pinB; s.hi = r.hi; segs.splice(i + 1, 1); i--; continue;
      }
      if (s.t === 1 && r.t === 1 && !r.eL) {
        const k1 = (s.y1 - s.y0) / Math.max(1, s.b - s.a), k2 = (r.y1 - r.y0) / Math.max(1, r.b - r.a);
        if (Math.sign(k1) === Math.sign(k2) && Math.abs(k1 - k2) <= .1 * Math.max(Math.abs(k1), Math.abs(k2))) { s.b = r.b; s.y1 = r.y1; s.pinB = r.pinB; s.hi = r.hi; segs.splice(i + 1, 1); i--; }
      }
    }
  }
  // segments → knots (canonical: no knot after a hold at the same x, the last knot is [768, end, 0, 0])
  function toKnots(segs, A, base) {
    const k = [];
    for (let i = 0; i < segs.length; i++) {
      const s = segs[i], prev = segs[i - 1];
      if (i === 0 && s.eA != null) k.push([A, Math.round(base[A]), 0, 0]);
      if (s.eL && prev && prev.t !== 0) k.push([s.a, Math.round(prev.y1), 0, 0]);
      if (s.eL && prev && prev.t === 0 && s.wasL != null) { /* a line pushed to nothing after a hold: the jump stays implicit */ }
      k.push([s.a, Math.round(s.y0), s.t, s.t === 2 ? s.bb : 0]);
    }
    const L = segs[segs.length - 1]; k.push([L.b, Math.round(L.t === 0 ? L.y0 : L.y1), 0, 0]);
    return k;
  }
  function canon(k) {
    const o = [];
    for (const q of k) {
      const c = q.slice();
      if (c[2] === 2 && c[3] === 0) c[2] = 1;
      if (c[2] !== 2) c[3] = 0;
      o.push(c);
    }
    for (let i = 0; i < o.length - 1; i++) if (o[i][2] === 1 && o[i][1] === o[i + 1][1] && o[i + 1][0] > o[i][0]) o[i][2] = 0;   // a flat line is a hold
    let ch = true;
    while (ch) {
      ch = false;
      for (let i = 1; i < o.length - 1; i++) {
        const p = o[i - 1], c = o[i], nx = o[i + 1];
        if (p[2] === 0 && c[0] === nx[0] && p[0] < c[0]) { o.splice(i, 1); ch = true; break; }      // redundant knot after a hold
        if (p[2] === 0 && c[2] === 0 && p[1] === c[1] && c[0] > p[0]) { o.splice(i, 1); ch = true; break; }   // two equal holds
        if (c[0] === p[0] && c[0] === nx[0]) { o.splice(i, 1); ch = true; break; }
      }
    }
    for (let i = 0; i < o.length - 1; i++) if (o[i][0] === o[i + 1][0] && o[i][1] === o[i + 1][1]) { o.splice(i + 1, 1); i--; }   // an edge without a jump
    const n = o.length - 1;
    if (n >= 1 && o[n - 1][2] === 0) o[n][1] = o[n - 1][1];
    o[n][2] = 0; o[n][3] = 0;
    return o;
  }
  const nSeg = k => k.length - 1;

  function clean(raw, u0, u1, prev, o) {
    o = o || {};
    if (u0 > u1) {                                                 // a wiped range across the cycle end
      const r1 = clean(raw, u0, TK, prev, o); if (!r1.f) return r1;
      const r2 = clean(raw, 0, u1, r1.f, o); if (!r2.f) return Object.assign(r2, {f: null});
      return {f: r2.f, stats: {rampen: r1.stats.rampen + r2.stats.rampen, stufen: r1.stats.stufen + r2.stats.stufen, kanten: r1.stats.kanten + r2.stats.kanten}, hl: r1.hl.concat(r2.hl), err: null};
    }
    u0 = Math.max(0, Math.round(u0)); u1 = Math.min(TK, Math.round(u1));
    if (u1 - u0 < 4) return {f: null, stats: {rampen: 0, stufen: 0, kanten: 0}, hl: [], err: 'tipp'};
    const on = o.on !== false, Z = o.Z || 48, lines = o.lines || [], maxS = on ? 32 : 64;
    const pv = prev ? norm(prev) : null;
    const base = pv ? sample(pv) : new Float32Array(TK + 1);
    const A = pv ? Math.max(0, Math.ceil(u0 - Z - 1e-9)) : 0, B = pv ? Math.min(TK, Math.floor(u1 + Z + 1e-9)) : TK;
    const keepL = pv ? pv.k.filter(q => q[0] < A) : [], keepR = pv ? pv.k.filter(q => q[0] > B) : [];
    // the segment of prev that runs on after B: its type continues from our last knot (a curve keeps its shape exactly)
    let tailT = 0, tailB = 0;
    if (pv && B < TK) {
      let j = 0; while (j < pv.k.length - 1 && pv.k[j + 1][0] <= B) j++;
      const a = pv.k[j], c = pv.k[j + 1];
      tailT = a[2]; tailB = a[2] === 2 && c ? Math.round(a[3] * (c[0] - B) / Math.max(1, c[0] - a[0])) : 0; if (tailT === 2 && !tailB) tailT = 1;
    }
    for (let att = 0, epsF = 1; att <= 6; att++, epsF *= 1.25) {
      const {segs, D} = cleanRegion(raw, base, A, B, Object.assign({}, o, {Z, lines, on}), epsF);
      if (!segs.length) return {f: null, stats: {rampen: 0, stufen: 0, kanten: 0}, hl: [], err: 'tipp'};
      const hl = [];
      if (on) {
        joinSegs(segs, D, base, A, B, A > 0, B < TK);
        snapTime(segs, lines, Z, A, B);                                         // step 6
        for (const s of segs) {                                                 // step 7
          if (!s.pinA) s.y0 = snapH(s.y0);
          if (!s.pinB) s.y1 = s.t === 0 ? s.y0 : snapH(s.y1);
          if (s.t === 0) s.y1 = s.y0;
        }
        // joints stay joints after the height snap
        for (let i = 0; i < segs.length - 1; i++) { const s = segs[i], r = segs[i + 1]; if (r.eL) continue; if (s.t === 0 && r.t !== 0) r.y0 = s.y0; else if (r.t === 0 && s.t !== 0) s.y1 = r.y0; else if (s.t !== 0 && r.t !== 0) r.y0 = s.y1; else if (s.y0 !== r.y0) r.eL = true; }
        stairs(segs, Z, B, hl);                                                 // step 8
        mergeNb(segs);                                                          // step 9
        for (const s of segs) { if (s.t !== 0 && Math.abs(s.y1 - s.y0) < .5 && s.t === 1) s.t = 0; refit(D, s); }
        for (const s of segs) if (s.t === 1 && s.b > s.a) hl.push([s.a, s.b]);
      } else {
        segs[0].y0 = base[A]; segs[segs.length - 1].y1 = base[B];
        if (A > 0) segs[0].pinA = true;
      }
      let kk = toKnots(segs, A, base);
      if (B < TK) { const L = kk[kk.length - 1]; L[1] = Math.round(base[B]); L[2] = tailT; L[3] = tailB; if (kk.length >= 2 && kk[kk.length - 2][2] === 0 && kk[kk.length - 2][0] < B) kk[kk.length - 1][1] = Math.round(base[B]); }
      let all = keepL.map(q => q.slice()).concat(kk, keepR.map(q => q.slice()));
      all = canon(all);
      // step 11: the seam
      if (on && B === TK && all.length >= 2) {
        const n = all.length - 1, y0 = all[0][1];
        const endV = all[n - 1][2] === 0 ? all[n - 1][1] : all[n][1];
        if (endV !== y0 && Math.abs(endV - y0) <= 60) {
          if (all[n - 1][2] === 0 && all[n - 1][0] >= A) { all[n - 1][1] = y0; all[n][1] = y0; }
          else if (all[n - 1][2] !== 0) all[n][1] = y0;
          all = canon(all);
        }
      }
      if (nSeg(all) <= maxS) {
        const f = norm({v: 1, k: all});
        const st = {rampen: 0, stufen: 0, kanten: 0};
        for (let i = 0; i < kk.length - 1; i++) {
          const a = kk[i], c = kk[i + 1]; if (a[0] < A || a[0] >= B) continue;
          if (c[0] === a[0]) { st.kanten++; continue; }
          if (a[2] === 0) { st.stufen++; if (c[1] !== a[1] && c[0] < B) st.kanten++; } else st.rampen++;
        }
        return {f, stats: st, hl, err: null};
      }
    }
    return {f: null, stats: {rampen: 0, stufen: 0, kanten: 0}, hl: [], err: 'zu-viele'};
  }

  /* ---------- library (§6.5) ---------- */
  function lib() {
    const P = []; for (let q = 0; q < 4; q++) P.push([192 * q, -1000, 2, -60], [192 * q + 134, 0, 0, 0]); P.push([768, 0, 0, 0]);
    const G = []; for (const s of [1, 3, 4, 6, 7, 9, 11, 12, 14, 15]) { const i = s - 1; G.push([48 * i, 0, 0, 0], [48 * i + 41, -1000, 0, 0]); } G.push([768, -1000, 0, 0]);
    const Tr = []; for (let j = 0; j < 32; j++) Tr.push([24 * j, j % 2 ? 1000 : 0, 0, 0]); Tr.push([768, 1000, 0, 0]);
    // Gate step 1 starts at 0: the first knot is [0, 0, 0, 0]
    return {Pumpen: {v: 1, n: 'Pumpen', k: P}, Gate: {v: 1, n: 'Gate', k: G}, Triller: {v: 1, n: 'Triller', k: Tr}};
  }

  /* ---------- wiping in (§5.5): the heard place u of the cycle ---------- */
  const frac = x => x - Math.floor(x);
  const wischU = {
    lfo: (Bs, sync) => TK * frac(Bs / sync),
    // D[s] = step durations in beats, O = play order of the first pass; eq: equal windows (the target is the step-length sequence)
    seq: (Bs, D, O, eq) => {
      let C = 0; for (const s of O) C += D[s];
      if (!(C > 0)) return 0;
      const p = Bs - Math.floor(Bs / C) * C;
      if (!eq) return TK * p / C;
      let c = 0; for (let j = 0; j < O.length; j++) { const w = D[O[j]]; if (p < c + w || j === O.length - 1) return TK * (j + Math.min(1, (p - c) / w)) / O.length; c += w; }
      return 0;
    },
    // free lane: step k from the clip start cs with step length sb (beats), swingOffset(beatsFromStart) shifts the step starts
    lane: (Bh, cs, sb, len, swingOffset, jOf) => {
      const sw = swingOffset || (() => 0), st = k => cs + k * sb + sw(k * sb);
      let k = Math.floor((Bh - cs) / sb);
      if (Bh < st(k)) k--; else if (Bh >= st(k + 1)) k++;
      const a = st(k), b = st(k + 1), part = b > a ? clampN((Bh - a) / (b - a), 0, 1) : 0;
      const j = jOf ? jOf(k) : ((k % len) + len) % len;
      return TK * (j + part) / len;
    },
  };
  // paint one wiped point: linear from the last point, on over the cycle end at 0; a new lap overwrites the old one
  function wischPaint(raw, st, u, y) {
    y = clampN(y, -YM, YM); u = clampN(u, 0, TK);
    if (st.u == null) { raw[Math.round(u) % (TK + 1)] = y; st.u = u; st.y = y; st.s0 = u; st.n = 0; st.laps = 0; return {u0: Math.round(u), u1: Math.round(u)}; }
    let du = u - st.u; if (du < -TK / 2) du += TK;                    // the place only runs forward
    if (du < 0) du = 0;
    if (st.u + du > TK) {
      const yc = st.y + (y - st.y) * (TK - st.u) / du;
      paint(raw, [[st.u, st.y], [TK, yc]]); paint(raw, [[0, yc], [u, y]]); raw[0] = yc; raw[TK] = yc;
      st.laps++;
    } else paint(raw, [[st.u, st.y], [st.u + du, y]]);
    st.n += du; st.u = u; st.y = y;
    if (st.n >= TK) return {u0: 0, u1: TK};
    const a = Math.round(st.s0), b = Math.round(u);
    return {u0: a, u1: b};                                             // a > b: the range runs over the cycle end
  }
  // heard time of a touch (A.10, I3 hint 1): the clock bridge ctxOf (max of ctx − perf over 2 s) or one pair ctxNow / perfNow
  function bridge() {
    const ring = []; let last = null;
    return {
      push(ctxTime, perfMs) { const ofs = ctxTime - perfMs / 1000; if (last != null && Math.abs(ofs - last) > .05) ring.length = 0; last = ofs; ring.push([perfMs, ofs]); while (ring.length > 80 || (ring.length && perfMs - ring[0][0] > 2000)) ring.shift(); },
      reset() { ring.length = 0; last = null; },
      ofs() { let m = -Infinity; for (const r of ring) if (r[1] > m) m = r[1]; return ring.length ? m : null; },
      ctxOf(P) { const o = this.ofs(); return o == null ? null : P / 1000 + o; },
    };
  }
  function hoerZeit(evTs, o) {
    const tau = o.tau != null ? o.tau : .030, dOut = o.dOut || 0, outLat = o.outLat || 0;
    let P = evTs; const now = o.perfNow;
    if (now != null && (P > now + 5 || P < now - 2000)) P = now;          // implausible stamp: the time of handling
    let c = null;
    if (o.bridge) c = o.bridge.ctxOf(P);
    if (c == null) c = o.ctxNow - ((now != null ? now : P) - P) / 1000;
    return c - outLat - (tau + dOut);
  }
  // §4.1: a section shorter than 4 · e_min at this cycle length (hint "Sehr fein …")
  function fine(f, cycSec, sr) {
    const emin = 2 * CR / (sr || 48000), k = f.k;
    for (let i = 0; i < k.length - 1; i++) { const L = (k[i + 1][0] - k[i][0]) / TK * cycSec; if (L > 0 && L < 4 * emin) return true; }
    return false;
  }

  return {TK, RASTER, norm, eval: evalF, raster, rasterText, newRaw, paint, sample, clean, lib, wischU, wischPaint, bridge, hoerZeit, fine, canon, snapH};
})();
if (typeof module !== 'undefined') module.exports = FORMCLEAN;
