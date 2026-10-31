/* BM-KLANG: processor 'synq-bm' (Nachtrag 7 Rev. 2, branch K: BM1 oscillator 16x + decimator + control clock).
   ASCII only; loaded from the string constant BM_WK (Blob / data URL). Never contains a backtick, a dollar-brace or the closing script tag.
   Messages main -> processor (section 2.1): {t:'prog', ab, p} {t:'set', ab, k, v} {t:'ly', p} {t:'gl', p}
     {t:'on', list:[{n, v, at, d, id}]} {t:'off', list:[{n, at, id, tau, kill}]} {t:'rt', list:[{n, to, at, tau, id}]}
     {t:'ctl', list:[{k:'bd'|'mw'|'at', v, at}]} or {t:'ctl', bend, mw, pr} {t:'tr', run, at, bpm} {t:'bpm', bpm}
     {t:'stop', at, tau} {t:'panic'} {t:'reset'} {t:'lim', level} {t:'tap', on, k} {t:'seed', v}
   Processor -> main: {t:'load', v, nv, q} once per second, {t:'late', n}, {t:'end', n, id}, {t:'tap', ...} (tests only). */
var BMK = (function () {
  'use strict';
  // one sine period over 32 steps x 1024 (section 2.2); index (m << 10) | fraction
  const SIN = new Float32Array(32768);
  for (let i = 0; i < 32768; i++) SIN[i] = Math.sin(2 * Math.PI * i / 32768);
  const bitsOf = M => (M === 0 ? 0 : 32 - Math.clz32(M));
  // time scale T(x), x 0..15: 0 = one control step; else 2 ms * 7500^(x/15) (section 1.3)
  const TX = x => (x <= 0 ? 0 : 0.002 * Math.pow(7500, x / 15));
  const LN1000 = Math.log(1000);
  // D_ indices of Voice.D: 0 noise phase, 1 noise value, 2/3 compensation delays, 4/5 DC block x/y, 6/7/8 gains x CSC,
  // 9 noise increment, 10 output gain, 11 fast fade level, 12 fast fade factor
  const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
  // halfband 2x -> 1x (Kaiser; 27 taps at 48 kHz, 31 at 44.1 kHz): the nonzero taps at offsets 1, 3, 5 ... (center 0.5)
  const HB27 = [0.312311476, -0.0891139084, 0.0387490769, -0.016535335, 0.00598314122, -0.00153970843, 0.000145257478];
  const HB31 = [0.314066625, -0.0940332962, 0.0452676723, -0.0228811343, 0.0108404689, -0.00443201307, 0.00137129577, -0.000199618299];
  const CSC = 16384;                        // CIC input scale 2^14 (section 2.2 says 2^13; 2^14 keeps BM1-05 within 2 dB, max 3 x 2^14 x 8^5 < 2^31)
  const CICG = 1 / (32768 * CSC);           // 1 / (R^N * scale), R = 8, N = 5
  // the program defaults (section 5.1, INIT)
  const ENV = (l) => ({l: l, a: 0, d: 0, s: 15, r: 2, lp: 0});
  function progInit() {
    return {o1: {m: 7, st: 0, tu: 0, ds: 0, dv: 20, e: ENV(99)}, o2: {m: 7, st: 0, tu: 0, ds: 0, dv: 20, e: ENV(0)},
      n: {fr: 99, e: ENV(0)}, f: {cu: 99, re: 0, md: 'lp', tk: 0, e: ENV(0)}, pe: {ds: 0, dv: 20, de: 0},
      l1: {sp: 50, w: 'sin', dl: 0, dc: 0, t: [['freq', 0], ['flt', 0], ['mask', 0], ['vol', 0]]},
      l2: {sp: 50, w: 'sin', dl: 0, dc: 0, t: [['flt', 0], ['freq', 0], ['mask', 0], ['vol', 0]]},
      mo: {v: [['flt', 0], ['feg', 0], ['vol', 0], ['mask', 0]], mw: [['l1a', 0], ['flt', 0], ['mask', 0], ['vol', 0]], at: [['flt', 0], ['l1a', 0], ['mask', 0], ['vol', 0]]},
      fx: {t1: 'CH1', b1: 0, t2: 'RV1', b2: 0, sy: 0}, ar: {t: 'off', sp: 120, ho: 0, tr: 1}, g: {mo: 'poly', vo: 80, st: 0, po: 0, ps: 0, ra: 0}};
  }
  const glInit = () => ({tm: 'et', st: 0, tn: 440, vc: 4, ac: 4, pb: 2, tf: 1});
  const lyInit = () => ({md: 'ein', semi: 0, bal: 50, pan: 0, tune: 0, sp: 60});
  // deep fill of missing fields from the defaults (the host normalizes; this only guards the processor)
  function fill(d, s) {
    if (!s || typeof s !== 'object') return d;
    for (const k in d) {
      if (!(k in s)) continue;
      const a = d[k], b = s[k];
      if (Array.isArray(a)) { if (Array.isArray(b)) d[k] = b.map(x => (Array.isArray(x) ? x.slice() : x)); }
      else if (a && typeof a === 'object') fill(a, b);
      else if (typeof a === 'number') { const x = +b; if (isFinite(x)) d[k] = x; }
      else if (typeof a === 'string') { if (typeof b === 'string') d[k] = b; }
    }
    return d;
  }
  const num = (x, d) => { x = +x; return isFinite(x) ? x : d; };

  /* ---- one voice: 2 mask oscillators + noise at 16x, CIC5 (R 8) + halfband + droop compensation, DC block ---- */
  class Voice {
    constructor(k, hl) {
      this.k = k; this.on = false; this.id = -1; this.n = 60; this.vel = 0; this.pg = 0; this.t0 = 0; this.gate = false; this.ord = 0;
      // oscillator state: phase (uint32), increment, mask, bits, shift; crossfade (user MASK turn, 10 ms)
      this.M1 = 7; this.b1 = 3; this.M2 = 7; this.b2 = 3;
      // hot numbers in typed arrays (a double or a large int32 in a plain field would allocate a heap number per store):
      // Z = [phase 1, phase 2, noise state, increment 1, increment 2] (int32 = the uint32 bits), D = see the D_ names
      this.Z = new Int32Array(5); this.D = new Float64Array(13);
      this.X1 = 0; this.xb1 = 0; this.xw1 = 0; this.xd1 = 0; this.X2 = 0; this.xb2 = 0; this.xw2 = 0; this.xd2 = 0;
      this.u1 = 7; this.u2 = 7; this.ux1 = 7; this.ux2 = 7;   // user masks (current / fading out)
      // noise: xorshift32, sample-and-hold phase
      
      // gains (x CSC) per control step
      
      // envelopes: [osc1, osc2, noise, filter]: stage 0 off, 1 attack, 2 decay, 3 sustain, 4 release; level; timer
      this.es = new Int8Array(4); this.el = new Float64Array(4); this.et = new Float64Array(4); this.eq = new Float64Array(4);
      // deltas of o1m, o2m and pitch (values) and the pitch target
      this.dm1 = 0; this.dm2 = 0; this.dp = 0; this.dpT = 0;
      this.cc = 0;                            // samples to the next control step of this voice
      this.quiet = 0;                         // control steps with all amp envelopes at 0 in release
      // decimator
      this.I = new Int32Array(5); this.C = new Int32Array(5);
      this.hl = hl; this.hb = new Float64Array(2 * hl); this.hp = 0;
            this.kill = false; this.D[11] = 1;
    }
  }

  class BmProc extends AudioWorkletProcessor {
    constructor(opt) {
      super();
      const sr = sampleRate; this.sr = sr;
      this.ctlN = Math.round(sr / 1000);     // 48 at 48 kHz, 44 at 44.1 kHz (section 2.4)
      this.dt = this.ctlN / sr;
      this.hbT = sr < 46000 ? HB31 : HB27; this.hl = 4 * this.hbT.length - 1;
      this.comp = sr < 46000 ? -0.082923 : -0.076902;   // droop compensation [c, 1-2c, c]
      this.dcR = Math.exp(-2 * Math.PI * 8 / sr);
      this.P = [this.prog(null), null]; this.ly = lyInit(); this.gl = glInit();
      this.V = []; for (let k = 0; k < 16; k++) this.V.push(new Voice(k, this.hl));
      this.q = []; this.late = 0; this.ord = 0; this.noteCnt = 0; this.seed = 0x9e3779b9;
      this.frame = 0; this.busy = 0; this.busyN = 0; this.qMax = 0; this.lastRep = 0;
      this.hasPerf = typeof performance !== 'undefined' && typeof performance.now === 'function';
      this.bend = 0; this.mw = 0; this.at = 0; this.lim = 0; this.trRun = false; this.bpm = 120;
      this.tapOn = false; this.tapK = ''; this.tapBuf = null; this.tapN = 0; this.tapV = -1;
      this.port.onmessage = e => this.msg(e.data);
    }
    prog(p) { return fill(progInit(), p); }
    // ---------------- messages ----------------
    msg(m) {
      if (!m || typeof m !== 'object') return;
      const now = currentTime;
      switch (m.t) {
        case 'prog': { const k = m.ab === 'b' ? 1 : 0; this.P[k] = m.p ? this.prog(m.p) : (k ? null : this.prog(null)); this.retarget(); break; }
        case 'set': this.set(m.ab, String(m.k || ''), m.v); break;
        case 'ly': this.ly = fill(lyInit(), m.p); break;
        case 'gl': this.gl = fill(glInit(), m.p); this.retarget(); break;
        case 'on': for (const x of m.list || []) { const at = num(x.at, 0); if (at < now - 1 / this.sr) this.late++; this.q.push({k: 1, at, n: num(x.n, 60), v: num(x.v, .8), d: x.d | 0, id: x.id == null ? -1 : x.id}); } this.sortQ(); break;
        case 'off': for (const x of m.list || []) this.q.push({k: 2, at: num(x.at, 0), n: num(x.n, 60), id: x.id == null ? -1 : x.id, tau: num(x.tau, 0), kill: x.kill ? 1 : 0}); this.sortQ(); break;
        case 'rt': for (const x of m.list || []) this.q.push({k: 3, at: num(x.at, 0), n: num(x.n, 60), to: num(x.to, 60), id: x.id == null ? -1 : x.id}); this.sortQ(); break;
        case 'ctl': this.ctl(m); break;
        case 'tr': this.trRun = !!m.run; if (m.bpm) this.bpm = +m.bpm || 120; break;
        case 'bpm': this.bpm = +m.bpm || this.bpm; break;
        case 'stop': this.q.push({k: 4, at: num(m.at, 0), tau: num(m.tau, .02)}); this.sortQ(); break;
        case 'panic': this.q.length = 0; for (const v of this.V) if (v.on) this.fadeOut(v, .003); break;
        case 'reset': this.reset(); break;
        case 'lim': this.lim = m.level | 0; break;
        case 'seed': this.seed = (m.v >>> 0) || 0x9e3779b9; break;
        case 'tap': this.tap(m); break;
      }
    }
    sortQ() { this.q.sort((a, b) => a.at - b.at || a.k - b.k); }
    set(ab, k, v) {
      if (ab === 'ly') { const o = fill(lyInit(), this.ly); o[k] = v; this.ly = fill(lyInit(), o); return; }
      if (ab === 'gl') { const o = Object.assign({}, this.gl); o[k] = v; this.gl = fill(glInit(), o); this.retarget(); return; }
      const pi = ab === 'b' ? 1 : 0, P = this.P[pi]; if (!P) return;
      const ks = k.split('.'); let o = P;
      for (let i = 0; i < ks.length - 1 && o; i++) o = o[ks[i]];
      if (!o || typeof o !== 'object') return;
      const last = ks[ks.length - 1], old = o[last];
      if (typeof old === 'number') { const x = +v; if (!isFinite(x)) return; o[last] = x; }
      else if (typeof old === 'string') { if (typeof v === 'string') o[last] = v; }
      else if (Array.isArray(old) && Array.isArray(v)) o[last] = v.map(x => (Array.isArray(x) ? x.slice() : x));
      else return;
      // a turn of MASK: 10 ms crossfade on the sounding voices of this program (rule 12)
      if (last === 'm' && (ks[0] === 'o1' || ks[0] === 'o2') && ks.length === 2) {
        const w = ks[0] === 'o1' ? 1 : 2, m = clamp(Math.round(o.m), 0, 511);
        for (const vc of this.V) if (vc.on && vc.pg === pi) this.maskTurn(vc, w, m);
      }
    }
    ctl(m) {
      if (Array.isArray(m.list)) { for (const x of m.list) this.q.push({k: 5, at: num(x.at, 0), c: x.k, v: num(x.v, 0)}); this.sortQ(); return; }
      if (m.bend != null) this.bend = clamp(num(m.bend, 0), -1, 1);
      if (m.mw != null) this.mw = clamp(num(m.mw, 0), 0, 1);
      if (m.pr != null) this.at = clamp(num(m.pr, 0), 0, 1);
    }
    retarget() {}
    reset() {
      this.q.length = 0; this.noteCnt = 0; this.ord = 0;
      for (const v of this.V) this.clearVoice(v);
      this.bend = 0; this.mw = 0; this.at = 0;
    }
    clearVoice(v) {
      v.on = false; v.id = -1; v.gate = false; v.kill = false; v.D[11] = 1; v.D[12] = 0;
      v.Z[0] = 0; v.Z[1] = 0; v.D[0] = 0; v.D[1] = 0; v.D[6] = v.D[7] = v.D[8] = 0; v.xw1 = v.xw2 = 0;
      v.I.fill(0); v.C.fill(0); v.hb.fill(0); v.hp = 0; v.D[2] = v.D[3] = 0; v.D[4] = v.D[5] = 0;
      v.es.fill(0); v.el.fill(0); v.et.fill(0); v.eq.fill(0); v.quiet = 0;
    }
    tap(m) {
      this.tapOn = !!m.on; this.tapK = String(m.k || 'ctl');
      if (this.tapOn) { this.tapBuf = new Float32Array(this.tapK === 'osc16' ? (m.len | 0) || 16 * 4096 : 10 * 8192); this.tapN = 0; this.tapV = -1; }
      else if (this.tapBuf) { this.port.postMessage({t: 'tap', k: this.tapK, n: this.tapN, buf: this.tapBuf.slice(0, this.tapN)}); this.tapBuf = null; }
    }
    // ---------------- notes ----------------
    noteHz(n, pg, osc) {
      const P = this.P[pg] || this.P[0], gl = this.gl, o = osc === 1 ? P.o1 : P.o2;
      const semi = n - 69 + gl.st + P.g.st + o.st + o.tu / 100;
      return gl.tn * Math.pow(2, semi / 12);
    }
    voiceOn(e) {
      let v = null;
      for (const x of this.V) if (!x.on) { v = x; break; }
      if (!v) { let best = null; for (const x of this.V) if (!best || (!x.gate && best.gate) || (x.gate === best.gate && x.ord < best.ord)) best = x; v = best; }
      this.clearVoice(v);
      const pg = 0, P = this.P[pg];
      v.on = true; v.gate = true; v.id = e.id; v.n = e.n; v.vel = e.v; v.pg = pg; v.ord = ++this.ord;
      v.Z[2] = (Math.imul(this.seed ^ (++this.noteCnt), 0x9e3779b1) >>> 0) || 1;
      v.u1 = clamp(Math.round(P.o1.m), 0, 511); v.u2 = clamp(Math.round(P.o2.m), 0, 511);
      v.dm1 = P.o1.ds; v.dm2 = P.o2.ds; v.dp = 0;
      for (let k = 0; k < 4; k++) { v.es[k] = 1; v.el[k] = 0; v.et[k] = 0; }
      v.cc = 0;   // the first control step happens at the note's own sample
    }
    voiceOff(e) {
      for (const v of this.V) if (v.on && v.gate && (e.id >= 0 ? v.id === e.id : v.n === e.n)) {
        if (e.kill) { this.fadeOut(v, .001); }
        else if (e.tau > 0) this.fadeOut(v, e.tau);
        else { v.gate = false; for (let k = 0; k < 4; k++) { v.es[k] = 4; v.et[k] = 0; } }
        if (e.id < 0) break;
      }
    }
    fadeOut(v, tau) { v.gate = false; v.kill = true; v.D[12] = Math.exp(-1 / (Math.max(tau, 1e-4) * this.sr)); for (let k = 0; k < 4; k++) if (v.es[k]) v.es[k] = 4; }
    maskTurn(v, w, m) {
      const n = Math.round(.01 * this.sr);
      if (w === 1) { if (m === v.u1) return; v.ux1 = v.u1; v.u1 = m; v.xw1 = 1; v.xd1 = 1 / n; }
      else { if (m === v.u2) return; v.ux2 = v.u2; v.u2 = m; v.xw2 = 1; v.xd2 = 1 / n; }
      // the fading mask follows the same modulation; the crossfade starts at once
      this.masks(v);
    }
    ev(e) {
      if (e.k === 1) this.voiceOn(e);
      else if (e.k === 2) this.voiceOff(e);
      else if (e.k === 3) { for (const v of this.V) if (v.on && (e.id >= 0 ? v.id === e.id : v.n === e.n)) v.n = e.to; }
      else if (e.k === 4) { for (const v of this.V) if (v.on) this.fadeOut(v, e.tau); }
      else if (e.k === 5) { if (e.c === 'bd') this.bend = clamp(e.v, -1, 1); else if (e.c === 'mw') this.mw = clamp(e.v, 0, 1); else if (e.c === 'at') this.at = clamp(e.v, 0, 1); }
    }
    // ---------------- control step of one voice (section 2.4) ----------------
    env(v, k, E) {
      const dt = this.dt; let st = v.es[k], l = v.el[k];
      if (st === 1) {   // attack: linear to 1 from the current level
        const T = TX(E.a); l = T <= 0 ? 1 : l + dt / T; if (l >= 1) { l = 1; st = 2; v.et[k] = 0; }
      } else if (st === 2) {   // decay: exponential to S (S + 0.1 % after T(D)); LOOP: back to attack after T(D)
        const S = (E.s / 15) * (E.s / 15), T = TX(E.d);
        if (T <= 0) { l = S; v.et[k] = 1e9; } else { l = S + (l - S) * Math.exp(-dt * LN1000 / T); v.et[k] += dt; }
        if (E.lp && v.et[k] >= T - 1e-9) { st = 1; v.et[k] = 0; }
        else if (!E.lp && v.et[k] >= T - 1e-9) { st = 3; l = S; }
      } else if (st === 3) { l = (E.s / 15) * (E.s / 15); }
      else if (st === 4) { const T = TX(E.r); l = T <= 0 ? 0 : l * Math.exp(-dt * LN1000 / T); if (l < 1e-6) { l = 0; st = 0; } }
      v.es[k] = st; v.el[k] = l;
      const qv = Math.round(l * 1024) / 1024;   // 10 bit (section 2.4)
      v.eq[k] = qv; return qv;
    }
    masks(v) {
      const P = this.P[v.pg] || this.P[0];
      let m = clamp(Math.round(v.u1 + v.dm1), 0, 511); if (m !== v.M1) { v.M1 = m; v.b1 = bitsOf(m); }
      m = clamp(Math.round(v.u2 + v.dm2), 0, 511); if (m !== v.M2) { v.M2 = m; v.b2 = bitsOf(m); }
      if (v.xw1 > 0) { m = clamp(Math.round(v.ux1 + v.dm1), 0, 511); v.X1 = m; v.xb1 = bitsOf(m); }
      if (v.xw2 > 0) { m = clamp(Math.round(v.ux2 + v.dm2), 0, 511); v.X2 = m; v.xb2 = bitsOf(m); }
    }
    ctlVoice(v) {
      const P = this.P[v.pg] || this.P[0], dt = this.dt, sr = this.sr;
      const g1 = this.env(v, 0, P.o1.e), g2 = this.env(v, 1, P.o2.e), g3 = this.env(v, 2, P.n.e); this.env(v, 3, P.f.e);
      // mask deltas: START -> 0, exponential, 1 % rest after T_D(SPD) (section 1.3)
      const kd1 = Math.exp(-dt * Math.log(100) / (5 * Math.pow(2500, -(P.o1.dv - 1) / 39)));
      const kd2 = Math.exp(-dt * Math.log(100) / (5 * Math.pow(2500, -(P.o2.dv - 1) / 39)));
      v.dm1 *= kd1; v.dm2 *= kd2; if (Math.abs(v.dm1) < .5 / 100) v.dm1 = 0; if (Math.abs(v.dm2) < .5 / 100) v.dm2 = 0;
      this.masks(v);
      const f1 = this.noteHz(v.n, v.pg, 1), f2 = this.noteHz(v.n, v.pg, 2), s = 4294967296 / (16 * sr);
      v.Z[3] = Math.round(Math.min(f1, 8 * sr) * s) >>> 0; v.Z[4] = Math.round(Math.min(f2, 8 * sr) * s) >>> 0;
      const L1 = (P.o1.e.l / 99) * (P.o1.e.l / 99), L2 = (P.o2.e.l / 99) * (P.o2.e.l / 99), L3 = (P.n.e.l / 99) * (P.n.e.l / 99);
      v.D[6] = g1 * L1 * CSC; v.D[7] = g2 * L2 * CSC; v.D[8] = g3 * L3 * CSC;
      const fr = clamp(P.n.fr, 0, 99); v.D[9] = Math.min(1, 30 * Math.pow(16 * sr / 30, fr / 99) / (16 * sr));
      const vo = (P.g.vo / 99) * (P.g.vo / 99), vg = 1 - .6 + .6 * v.vel;
      v.D[10] = vo * vg * .5;
      const amp = v.D[6] + v.D[7] + v.D[8];
      if (!v.gate && amp === 0) v.quiet++; else v.quiet = 0;
      if (this.tapOn && this.tapK === 'ctl' && this.tapBuf && v.k === this.tapV && this.tapN + 10 <= this.tapBuf.length) {
        const b = this.tapBuf; let i = this.tapN; b[i++] = this.frame + this.fi; b[i++] = v.eq[0]; b[i++] = v.eq[1]; b[i++] = v.eq[2]; b[i++] = v.eq[3];
        b[i++] = v.M1; b[i++] = v.M2; b[i++] = f1; b[i++] = v.dp; b[i++] = v.n; this.tapN = i;
      }
    }
    // ---------------- render one voice over [a, b) ----------------
    renderVoice(v, L, R, a, b) {
      const comp = this.comp, c1 = 1 - 2 * comp, dcR = this.dcR;
      let i = a;
      while (i < b) {
        if (v.cc <= 0) {
          this.fi = i; this.ctlVoice(v); v.cc = this.ctlN;
          // the end of a voice is decided at its own control step (bit-exact whatever the block phase): the fast fade done,
          // or all amp envelopes at 0 for > 2 steps (decimator flushed) and the DC-block tail under -140 dB
          if ((v.kill && v.D[11] < 1e-5) || (!v.gate && v.quiet > 2 && Math.abs(v.D[5] * v.D[10]) < 1e-7)) { this.endVoice(v); return; }
        }
        const e = Math.min(b, i + v.cc); v.cc -= e - i;
        if (v.quiet > 2 && !v.kill) {   // tail: the decimator is flushed (exact zeros), only the DC block decays
          let dcy = v.D[5], cz1 = v.D[2], cz2 = v.D[3], dcx = v.D[4]; const out = v.D[10];
          for (; i < e; i++) { const yc = comp * cz2 + c1 * cz1; cz2 = cz1; cz1 = 0; dcy = yc - dcx + dcR * dcy; dcx = yc; const s = dcy * out; L[i] += s; R[i] += s; }
          v.D[5] = Math.abs(dcy) < 1e-15 ? 0 : dcy; v.D[4] = dcx; v.D[2] = cz1; v.D[3] = cz2; continue;
        }
        if (v.xw1 > 0 || v.xw2 > 0 || (this.tapOn && this.tapK === 'osc16' && v.k === this.tapV)) this.runX(v, L, R, i, e);
        else this.run(v, L, R, i, e);
        i = e;
      }
    }
    // the decimator tail of one output sample: halfband (taps at hc +- 1, 3, 5 ...), droop compensation, DC block 8 Hz
    // fast path: no crossfade, no tap; phases as int32 (the same bits as uint32)
    run(v, L, R, i, e) {
      const hbT = this.hbT, nT = hbT.length, hl = this.hl, hc = (hl - 1) >> 1, hb = v.hb, I = v.I, C = v.C, comp = this.comp, c1 = 1 - 2 * comp, dcR = this.dcR;
      let p1 = v.Z[0] | 0, p2 = v.Z[1] | 0; const i1 = v.Z[3] | 0, i2 = v.Z[4] | 0, M1 = v.M1, M2 = v.M2, b1 = v.b1, b2 = v.b2, s1 = 32 - b1, s2 = 32 - b2;
      const G1 = v.D[6], G2 = v.D[7], G3 = v.D[8], ninc = v.D[9], out = v.D[10], n2 = G2 !== 0, n3 = G3 !== 0, i0 = i;
      let na = v.D[0], nz = v.D[1], rng = v.Z[2] | 0, hp = v.hp, cz1 = v.D[2], cz2 = v.D[3], dcx = v.D[4], dcy = v.D[5];
      let I0 = I[0], I1 = I[1], I2 = I[2], I3 = I[3], I4 = I[4], C0 = C[0], C1 = C[1], C2 = C[2], C3 = C[3], C4 = C[4];
      for (; i < e; i++) {
        for (let h = 0; h < 2; h++) {
          for (let j = 0; j < 8; j++) {
            p1 = (p1 + i1) | 0;
            const m1 = (p1 >>> s1) & M1;
            let y = m1 < 32 ? SIN[(m1 << 10) | ((p1 << b1) >>> 22)] * G1 : 0;
            if (n2) { p2 = (p2 + i2) | 0; const m2 = (p2 >>> s2) & M2; if (m2 < 32) y += SIN[(m2 << 10) | ((p2 << b2) >>> 22)] * G2; }
            if (n3) { na += ninc; if (na >= 1) { na -= 1; rng ^= rng << 13; rng ^= rng >>> 17; rng ^= rng << 5; nz = rng * 4.656612873077393e-10; } y += nz * G3; }
            I0 = (I0 + (y | 0)) | 0; I1 = (I1 + I0) | 0; I2 = (I2 + I1) | 0; I3 = (I3 + I2) | 0; I4 = (I4 + I3) | 0;
          }
          let c = I4, t;
          t = c; c = (c - C0) | 0; C0 = t; t = c; c = (c - C1) | 0; C1 = t; t = c; c = (c - C2) | 0; C2 = t;
          t = c; c = (c - C3) | 0; C3 = t; t = c; c = (c - C4) | 0; C4 = t;
          const x = c * CICG; hb[hp] = x; hb[hp + hl] = x; if (++hp === hl) hp = 0;
        }
        const q = hp + hc; let y = .5 * hb[q];
        for (let k = 0, o = 1; k < nT; k++, o += 2) y += hbT[k] * (hb[q - o] + hb[q + o]);
        const yc = comp * (y + cz2) + c1 * cz1; cz2 = cz1; cz1 = y;
        dcy = yc - dcx + dcR * dcy; dcx = yc;
        let s = dcy * out;
        if (v.kill) { s *= v.D[11]; v.D[11] *= v.D[12]; }
        L[i] += s; R[i] += s;
      }
      // osc2 off: its phase still runs (16 steps per sample, the same bits)
      if (!n2) p2 = (p2 + Math.imul(i2, 16 * (e - i0))) | 0;
      v.Z[0] = p1; v.Z[1] = p2; v.D[0] = na; v.D[1] = nz; v.Z[2] = rng; v.hp = hp; v.D[2] = cz1; v.D[3] = cz2;
      v.D[4] = dcx; v.D[5] = Math.abs(dcy) < 1e-15 ? 0 : dcy;
      I[0] = I0; I[1] = I1; I[2] = I2; I[3] = I3; I[4] = I4; C[0] = C0; C[1] = C1; C[2] = C2; C[3] = C3; C[4] = C4;
    }
    // slow path: MASK crossfade (10 ms) and the 16x test tap; otherwise the same arithmetic as run()
    runX(v, L, R, i, e) {
      const hbT = this.hbT, nT = hbT.length, hl = this.hl, hc = (hl - 1) >> 1, hb = v.hb, I = v.I, C = v.C, comp = this.comp, c1 = 1 - 2 * comp, dcR = this.dcR;
      const tap16 = this.tapOn && this.tapK === 'osc16' && v.k === this.tapV ? this.tapBuf : null;
      let p1 = v.Z[0] | 0, p2 = v.Z[1] | 0; const i1 = v.Z[3] | 0, i2 = v.Z[4] | 0, M1 = v.M1, M2 = v.M2, b1 = v.b1, b2 = v.b2, s1 = 32 - b1, s2 = 32 - b2;
      const G1 = v.D[6], G2 = v.D[7], G3 = v.D[8], ninc = v.D[9], out = v.D[10];
      const X1 = v.X1, xb1 = v.xb1, xs1 = 32 - xb1, X2 = v.X2, xb2 = v.xb2, xs2 = 32 - xb2;
      let na = v.D[0], nz = v.D[1], rng = v.Z[2] | 0, hp = v.hp, cz1 = v.D[2], cz2 = v.D[3], dcx = v.D[4], dcy = v.D[5];
      let I0 = I[0], I1 = I[1], I2 = I[2], I3 = I[3], I4 = I[4];
      for (; i < e; i++) {
        const xf1 = v.xw1 > 0, xf2 = v.xw2 > 0, wx1 = v.xw1, w1 = 1 - wx1, wx2 = v.xw2, w2 = 1 - wx2;
        if (xf1) v.xw1 = wx1 - v.xd1 > 0 ? wx1 - v.xd1 : 0;
        if (xf2) v.xw2 = wx2 - v.xd2 > 0 ? wx2 - v.xd2 : 0;
        for (let h = 0; h < 2; h++) {
          for (let j = 0; j < 8; j++) {
            p1 = (p1 + i1) | 0; p2 = (p2 + i2) | 0;
            const m1 = (p1 >>> s1) & M1; let o = m1 < 32 ? SIN[(m1 << 10) | ((p1 << b1) >>> 22)] : 0;
            if (xf1) { const mx = (p1 >>> xs1) & X1; o = o * w1 + wx1 * (mx < 32 ? SIN[(mx << 10) | ((p1 << xb1) >>> 22)] : 0); }
            if (tap16 !== null && this.tapN < tap16.length) tap16[this.tapN++] = o;
            let y = o * G1;
            if (G2 !== 0) {
              const m2 = (p2 >>> s2) & M2; let o2 = m2 < 32 ? SIN[(m2 << 10) | ((p2 << b2) >>> 22)] : 0;
              if (xf2) { const mx = (p2 >>> xs2) & X2; o2 = o2 * w2 + wx2 * (mx < 32 ? SIN[(mx << 10) | ((p2 << xb2) >>> 22)] : 0); }
              y += o2 * G2;
            }
            if (G3 !== 0) { na += ninc; if (na >= 1) { na -= 1; rng ^= rng << 13; rng ^= rng >>> 17; rng ^= rng << 5; nz = rng * 4.656612873077393e-10; } y += nz * G3; }
            I0 = (I0 + (y | 0)) | 0; I1 = (I1 + I0) | 0; I2 = (I2 + I1) | 0; I3 = (I3 + I2) | 0; I4 = (I4 + I3) | 0;
          }
          let c = I4, t;
          t = c; c = (c - C[0]) | 0; C[0] = t; t = c; c = (c - C[1]) | 0; C[1] = t; t = c; c = (c - C[2]) | 0; C[2] = t;
          t = c; c = (c - C[3]) | 0; C[3] = t; t = c; c = (c - C[4]) | 0; C[4] = t;
          const x = c * CICG; hb[hp] = x; hb[hp + hl] = x; if (++hp === hl) hp = 0;
        }
        const q = hp + hc; let y = .5 * hb[q];
        for (let k = 0, o = 1; k < nT; k++, o += 2) y += hbT[k] * (hb[q - o] + hb[q + o]);
        const yc = comp * (y + cz2) + c1 * cz1; cz2 = cz1; cz1 = y;
        dcy = yc - dcx + dcR * dcy; dcx = yc;
        let s = dcy * out;
        if (v.kill) { s *= v.D[11]; v.D[11] *= v.D[12]; }
        L[i] += s; R[i] += s;
      }
      v.Z[0] = p1; v.Z[1] = p2; v.D[0] = na; v.D[1] = nz; v.Z[2] = rng; v.hp = hp; v.D[2] = cz1; v.D[3] = cz2;
      v.D[4] = dcx; v.D[5] = Math.abs(dcy) < 1e-15 ? 0 : dcy;
      I[0] = I0; I[1] = I1; I[2] = I2; I[3] = I3; I[4] = I4;
    }
    endVoice(v) { this.port.postMessage({t: 'end', n: v.n, id: v.id}); this.clearVoice(v); }
    seg(L, R, a, b) { if (b <= a) return; const V = this.V; for (let k = 0; k < V.length; k++) if (V[k].on) this.renderVoice(V[k], L, R, a, b); }
    process(ins, outs) {
      const t0 = this.hasPerf ? performance.now() : Date.now();
      const o = outs[0], L = o[0], R = o[1] || o[0], N = L.length, sr = this.sr, tb = currentTime;
      let i0 = 0;
      while (this.q.length && this.q[0].at < tb + (N - .5) / sr) {
        const e = this.q.shift(); let k = Math.round((e.at - tb) * sr); k = k < 0 ? 0 : k > N ? N : k;
        if (k > i0) { this.seg(L, R, i0, k); i0 = k; }
        if (e.k === 1 && this.tapOn && this.tapV < 0) { this.ev(e); for (const v of this.V) if (v.on && v.ord === this.ord) this.tapV = v.k; }
        else this.ev(e);
      }
      this.seg(L, R, i0, N);
      if (this.late) { this.port.postMessage({t: 'late', n: this.late}); this.late = 0; }
      this.frame += N;
      const dq = (this.hasPerf ? performance.now() : Date.now()) - t0; this.busy += dq; this.busyN += N; if (dq > this.qMax) this.qMax = dq;
      if (this.frame - this.lastRep >= sr) {
        let nv = 0; for (const v of this.V) if (v.on) nv++;
        this.port.postMessage({t: 'load', v: this.busy / (this.busyN / sr * 1000), nv, q: this.qMax});
        this.lastRep = this.frame; this.busy = 0; this.busyN = 0; this.qMax = 0;
      }
      return true;
    }
  }
  return {BmProc, SIN, bitsOf, TX, HB27, HB31, progInit};
})();
registerProcessor('synq-bm', BMK.BmProc);
