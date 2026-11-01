/* ---- Nachtrag 8 I1a + I1c in 'dirigent-analog' (B.1 5.1-5.4, A.3): scene morph {morph}/{morphStop} and the super knob {sr}.
   B = the base per key (ground sound or the moving state), P = the end value the voices read. A {set} for such a key writes B
   (onMsg takes lf, morphStop, morph, sr before set). Without a table and without a morph no extra code runs (srOn, mo).
   Work per render quantum: a moving key costs one curve evaluation; the voice derive runs once when a value changed.
   Stepped keys switch through the 30 ms voice crossfade (structReq), at most once per key and 100 ms; from limiter level 2 on
   (xfLite) the switch waits until no voice sounds or the level falls (srDefer), never the 4 ms dip. ASCII only. ---- */
Object.assign(AnalogCore.prototype, {
  srInit() {
    if (this.srB) return;
    this.srB = Object.create(null);      // tracked bases (P keys)
    this.srTab = []; this.srMap = Object.create(null); this.srDisc = []; this.srMk = [];
    this.srOn = false; this.srX = 0; this.srXs = 0; this.srXl = NaN; this.srRamp = null; this.srE0 = 0;
    this.srA = SRCORE.alpha(SR); this.srDefer = 0; this.srDirty = false; this.srN = 0; this.mo = null;
    this.srPrb = false; this.moPrb = false;
  },
  srMsg(m) {
    this.srInit();
    if (m === null) { this.srOff(); return; }
    const was = this.srOn;
    if (m.tab || m.disc) {
      const keep = Object.create(null);
      const tab = [], mk = [], map = Object.create(null);
      for (const e of m.tab || []) {
        if (!e || typeof e.k !== 'string' || !Array.isArray(e.n) || !Array.isArray(e.d) || e.n.length !== e.d.length) continue;
        const o = {k: e.k, law: e.law || 'lin', lo: +e.lo || 0, hi: e.hi == null ? 1 : +e.hi, kk: e.kk == null ? 1 : +e.kk, n: Float64Array.from(e.n), d: Float64Array.from(e.d)};
        if (e.k.startsWith('mk.')) { o.path = e.k.slice(3); o.b = +e.b || 0; o.o = {}; o.o[o.path] = o.b; o.last = NaN; mk.push(o); continue; }
        if (!(e.k in this.P)) continue;
        if (!(e.k in this.srB)) this.srB[e.k] = this.P[e.k];
        keep[e.k] = 1; tab.push(o); map[e.k] = o;
      }
      const disc = [];
      for (const e of m.disc || []) {
        if (!e || typeof e.k !== 'string' || !(e.k in this.P) || !Array.isArray(e.n) || !Array.isArray(e.v)) continue;
        if (!(e.k in this.srB)) this.srB[e.k] = this.P[e.k];
        const old = this.srDisc.find(x => x.k === e.k);
        keep[e.k] = 1; disc.push({k: e.k, n: Float64Array.from(e.n), v: e.v.slice(), xf: e.xf ? 1 : 0, cur: old ? old.cur : -1, tl: -1, o: {}, wait: false});
      }
      // keys that left the table: back to their base (unless a morph still moves them)
      const back = {}; let nb = 0;
      for (const k in this.srB) if (!keep[k] && !(this.mo && this.mo.k.indexOf(k) >= 0)) {
        if (this.P[k] !== this.srB[k]) { back[k] = this.srB[k]; nb++; }
        delete this.srB[k];
      }
      for (const e of this.srMk) if (!mk.some(x => x.path === e.path)) { const o = {}; o[e.path] = e.b; this.mk.set(o); }
      this.srTab = tab; this.srMap = map; this.srDisc = disc; this.srMk = mk;
      this.srOn = tab.length + disc.length + mk.length > 0;
      if (nb) this.setParams(back);
      this.srDirty = true;
    }
    if (m.x != null && isFinite(m.x)) {
      this.srX = Math.max(0, Math.min(1, +m.x)); this.srRamp = null;
      if (!was || m.snap) this.srXs = this.srX;          // a new table starts at its position (the project opens there)
    }
    if (m.ramp && isFinite(m.ramp.t0) && isFinite(m.ramp.t1)) {
      const r = m.ramp; this.srRamp = {x0: +r.x0, x1: +r.x1, t0: +r.t0, t1: Math.max(+r.t1, +r.t0)};
      this.srE0 = this.srXs - this.srRamp.x0; if (Math.abs(this.srE0) < 1e-6) this.srE0 = 0;
    }
    if (!this.srOn && !this.mo) this.srB = Object.create(null);
  },
  srOff() {
    const back = {}; let nb = 0;
    for (const k in this.srB) if (!(this.mo && this.mo.k.indexOf(k) >= 0)) { if (this.P[k] !== this.srB[k]) { back[k] = this.srB[k]; nb++; } }
    for (const e of this.srMk) { const o = {}; o[e.path] = e.b; this.mk.set(o); }
    this.srTab = []; this.srMap = Object.create(null); this.srDisc = []; this.srMk = []; this.srOn = false; this.srRamp = null;
    if (!this.mo) this.srB = Object.create(null);
    if (nb) this.setParams(back);
  },
  // a {set} while a table or a morph is on: its values are bases; the voices get the end values (A2)
  srSetIn(o, xf) {
    for (const k in o) {
      if (!(k in this.srB) || typeof o[k] !== 'number') continue;
      this.srB[k] = o[k];
      if (!xf && this.mo) this.moDrop(k);                 // KZ6: who touches, takes over
      const dc = this.srDisc.find(x => x.k === k);
      o[k] = dc ? (dc.cur > 0 ? dc.v[dc.cur - 1] : o[k]) : this.srEnd(k);
    }
    if (this.srOn) this.srDirty = true;
  },
  srEnd(k) {
    const b = this.srB[k], e = this.srMap[k];
    if (!e || !this.srOn) return b;
    return SRCORE.endVal(e.law, e.lo, e.hi, e.kk, b, SRCORE.path(e.n, e.d, this.srXs));
  },
  // the scene morph (V6a KZ1): continuous keys in the knob space along the S curve, stepped values at `at` for new notes
  moMsg(m) {
    this.srInit();
    const t0 = +m.t0, t1 = Math.max(+m.t1, t0 + 1e-4); if (!isFinite(t0) || !isFinite(t1)) return;
    const k = [], a = [], b = [], ln = [];
    for (const key in m.to || {}) {
      if (!(key in this.P) || typeof m.to[key] !== 'number' || !isFinite(m.to[key])) continue;
      const L = (m.ln && m.ln[key]) || ['lin', 0, 1, 1];
      if (!(key in this.srB)) this.srB[key] = this.P[key];
      const from = this.srB[key];
      k.push(key); ln.push(L); a.push(SRCORE.toN(L[0], L[1], L[2], L[3], from)); b.push(m.to[key]);
    }
    const disc = {}; let nd = 0; for (const key in m.disc || {}) if (key in this.P && typeof m.disc[key] === 'number') { disc[key] = m.disc[key]; nd++; }
    this.mo = {k, a, b, ln, t0, t1, disc: nd ? disc : null, at: m.at == null ? t1 : +m.at, id: m.id};
    if (!k.length && !nd) this.mo = null;
  },
  moDrop(key) {
    const M = this.mo; if (!M) return;
    const i = M.k.indexOf(key); if (i < 0) return;
    M.k.splice(i, 1); M.a.splice(i, 1); M.b.splice(i, 1); M.ln.splice(i, 1);
    if (!M.k.length && !M.disc) this.moEnd();
  },
  moEnd() { this.mo = null; if (!this.srOn) this.srB = Object.create(null); },
  moStep(t) {
    const M = this.mo; if (t < M.t0) return false;
    const u = (t - M.t0) / (M.t1 - M.t0), s = SRCORE.sCurve(u);
    for (let i = 0; i < M.k.length; i++) {
      const L = M.ln[i], n0 = M.a[i], n1 = SRCORE.toN(L[0], L[1], L[2], L[3], M.b[i]);
      this.srB[M.k[i]] = u >= 1 ? M.b[i] : SRCORE.fromN(L[0], L[1], L[2], L[3], n0 + (n1 - n0) * s);
    }
    if (M.disc && t >= M.at) {                             // stepped values: from `at` on, through the voice crossfade
      const d = M.disc; M.disc = null;
      for (const key in d) if (key in this.srB) this.srB[key] = d[key];
      this.setReq(d, false, null);
    }
    if (u >= 1 && !M.disc) { const keys = M.k.slice(); this.mo = null; this.moFin = keys; }
    return true;
  },
  // once per render quantum (process), only with a table or a morph
  srBlock(f0) {
    const t = f0 * ISR, P = this.P; let chg = false;
    if (this.mo) chg = this.moStep(t);
    let keys = this.srTab;
    if (this.srOn) {
      if (this.srRamp) {
        const r = this.srRamp, x = SRCORE.rampAt(r, t); this.srX = x;
        const e = this.srE0 ? SRCORE.rampRest(this.srE0, Math.max(0, t - r.t0)) : 0;
        this.srXs = e ? x + e : x; if (!e) this.srE0 = 0;
        if (t >= r.t1 && !e) { this.srRamp = null; this.srX = this.srXs = r.x1; }
      } else if (this.srXs !== this.srX) this.srXs = SRCORE.smooth(this.srXs, this.srX, this.srA);
      if (this.srXs !== this.srXl || chg || this.srDirty) {
        const xs = this.srXs; let pc = false;
        for (let i = 0; i < keys.length; i++) {
          const e = keys[i], v = SRCORE.endVal(e.law, e.lo, e.hi, e.kk, this.srB[e.k], SRCORE.path(e.n, e.d, xs));
          if (P[e.k] !== v) { P[e.k] = v; pc = true; }
        }
        if (this.mo || this.moFin) for (const k of (this.mo ? this.mo.k : this.moFin)) if (!this.srMap[k] && !this.srDisc.some(x => x.k === k) && P[k] !== this.srB[k]) { P[k] = this.srB[k]; pc = true; }
        for (let i = 0; i < this.srMk.length; i++) {
          const e = this.srMk[i], v = SRCORE.endVal(e.law, e.lo, e.hi, e.kk, e.b, SRCORE.path(e.n, e.d, xs));
          if (v !== e.last) { e.last = v; e.o[e.path] = v; this.mk.set(e.o); }
        }
        for (let i = 0; i < this.srDisc.length; i++) this.srStep(this.srDisc[i], xs, t);
        if (pc) this.derive();
        this.srXl = xs; this.srDirty = false; this.srN++;
      } else for (let i = 0; i < this.srDisc.length; i++) if (this.srDisc[i].wait) this.srStep(this.srDisc[i], this.srXs, t);
    } else if (chg || this.moFin) {
      let pc = false;
      for (const k of (this.mo ? this.mo.k : this.moFin || [])) if (k in this.srB && P[k] !== this.srB[k]) { P[k] = this.srB[k]; pc = true; }
      if (pc) this.derive();
    }
    if (this.moFin) { this.moFin = null; if (!this.srOn && !this.mo) this.srB = Object.create(null); }
    if (this.srPrb) { const o = {}; for (const e of this.srTab) o[e.k] = P[e.k]; for (const e of this.srMk) o[e.k] = e.last; for (const e of this.srDisc) o[e.k] = P[e.k];
      this.port.postMessage({srp: {f: f0, xs: this.srXs, x: this.srX, keys: o, active: this.srXs !== this.srX || !!this.srRamp, defer: this.srDefer, n: this.srN}}); }
    if (this.moPrb && (this.mo || chg)) { const o = {}; for (const k in this.srB) o[k] = P[k]; this.port.postMessage({mop: {f: f0, keys: o, on: !!this.mo}}); }
  },
  // a stepped key: the held point; a change goes through the 30 ms crossfade, at most once per 100 ms, deferred at level >= 2
  srStep(e, xs, t) {
    const idx = SRCORE.stufe(e.n, xs, e.cur);
    if (idx === e.cur) { e.wait = false; return; }
    if (e.tl >= 0 && t - e.tl < 0.1) { e.wait = true; return; }
    let busy = false; for (const v of this.V) if (v.on) { busy = true; break; }
    if (busy && this.P.xfLite >= 1) { if (!e.wait) this.srDefer++; e.wait = true; return; }
    const w = idx === 0 ? this.srB[e.k] : e.v[idx - 1];
    e.cur = idx; e.tl = t; e.wait = false;
    if (this.P[e.k] !== w) { e.o[e.k] = w; for (const k in e.o) if (k !== e.k) delete e.o[k]; this.setReq(e.o, false, null); }
  },
});
