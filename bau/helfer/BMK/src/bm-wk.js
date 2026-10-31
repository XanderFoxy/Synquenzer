/* BM-KLANG: processor 'synq-bm' (Nachtrag 7 Rev. 2, branch K). BM1 oscillators 16x + decimator + control clock; BM2 voice
   (SVF filter, 4 ADSR with LOOP, deltas, 2 LFOs, 4 target slots per source, 9 play modes, GLOBAL, limiter); BM3 FX1 / FX2 + SYNC.
   ASCII only; loaded from the string constant BM_WK (Blob / data URL). Never contains a backtick, a dollar-brace or the closing script tag.
   Messages main -> processor (section 2.1): {t:'prog', ab, p} {t:'set', ab, k, v} {t:'ly', p} {t:'gl', p}
     {t:'on', list:[{n, v, at, d, id}]} {t:'off', list:[{n, at, id, tau, kill}]} {t:'rt', list:[{n, to, at, tau, id}]}
     {t:'ctl', list:[{k:'bd'|'mw'|'at'|'sus', v, at}]} or {t:'ctl', bend, mw, pr} {t:'tr', run, at, bpm} {t:'bpm', bpm}
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
  const LN1000 = Math.log(1000), LN100 = Math.log(100);
  const TD = spd => 5 * Math.pow(2500, -(spd - 1) / 39);     // delta speed 1..40 -> seconds to 1 % rest
  const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
  const num = (x, d) => { x = +x; return isFinite(x) ? x : d; };
  // halfband 2x -> 1x (Kaiser; 27 taps at 48 kHz, 31 at 44.1 kHz): the nonzero taps at offsets 1, 3, 5 ... (center 0.5)
  const HB27 = [0.312311476, -0.0891139084, 0.0387490769, -0.016535335, 0.00598314122, -0.00153970843, 0.000145257478];
  const HB31 = [0.314066625, -0.0940332962, 0.0452676723, -0.0228811343, 0.0108404689, -0.00443201307, 0.00137129577, -0.000199618299];
  const CSC = 16384;                        // CIC input scale 2^14 (section 2.2 says 2^13; 2^14 keeps BM1-05 within 2 dB, max 3 x 2^14 x 8^5 < 2^31)
  const CICG = 1 / (32768 * CSC);           // 1 / (R^N * scale), R = 8, N = 5
  const OUTG = 0.7413;                      // output scale (BM2-14: INIT = -18 LUFS)
  // the band state of the SVF is limited (tanh-like, C1 at the knee) above SAT_T up to SAT_T + SAT_W: self-oscillation at RESO 99
  const SAT_T = .4, SAT_W = .6, SAT_I = 1 / SAT_W;
  // temperaments from C, cents per step 0..11 (section 1.10)
  const TEMP = {et: [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100],
    arab: [0, 100, 200, 300, 350, 500, 650, 700, 850, 900, 1000, 1050],
    jmaj: [0, 111.73, 203.91, 315.64, 386.31, 498.04, 590.22, 701.96, 813.69, 884.36, 996.09, 1088.27],
    jmin: [0, 111.73, 203.91, 315.64, 386.31, 498.04, 609.78, 701.96, 813.69, 884.36, 1017.60, 1088.27],
    mean: [0, 76.05, 193.16, 310.26, 386.31, 503.42, 579.47, 696.58, 772.63, 889.74, 1006.84, 1082.89],
    pyta: [0, 90.22, 203.91, 294.13, 407.82, 498.04, 611.73, 701.96, 792.18, 905.87, 996.09, 1109.78]};
  // ids (section 5.1)
  const MODES = ['poly', 'mono', 'slur', 'mport', 'para', 'moly', 'pslur', 'mretrig', 'pretrig'];
  const WAVES = ['sin', 'sqr', 'up', 'down', 'saws', 'step', 'hsin', 'rand'];
  const FMODE = {lp: 0, hp: 1, bp: 2, notch: 3};
  // modulation targets: index and range D (section 1.9)
  const TG = ['freq', 'o1f', 'o2f', 'vol', 'o1v', 'o2v', 'nv', 'flt', 'feg', 'mask', 'o1m', 'o2m', 'pan', 'nf', 'l1a', 'l1s', 'l2a', 'l2s', 'fx1t', 'fx2t', 'fx1b', 'fx2b', 'peg', 'atk'];
  const TI = {}; TG.forEach((k, i) => { TI[k] = i; });
  const TD_ = [24, 24, 24, 1, 1, 1, 1, 99, 1, 256, 256, 256, 1, 99, 99, 99, 99, 99, 15, 15, 100, 100, 1, 1];
  const NT = TG.length;
  const SRC_OK = {lfo: 'freq vol flt mask pan o1f o1v o1m o2f o2v o2m nf nv fx1t fx2t fx2b', mw: 'flt l1a l1s l2a l2s vol mask freq o1v o1m o2v o2m nf nv fx1b fx2b', v: 'flt feg vol mask peg atk'};
  const OKS = {}; for (const s in SRC_OK) { OKS[s] = new Uint8Array(NT); for (const k of SRC_OK[s].split(' ')) OKS[s][TI[k]] = 1; }
  const amtU = a => (a < 0 ? -1 : 1) * Math.pow(Math.min(99, Math.abs(a)) / 99, 1.5);   // section 1.3 Mod-Menge
  const VELG = [2.2, 1.8, 1.4, 1.0, 0.7], ATG = [2.0, 1.6, 1.3, 1.0, 0.8];
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
  const STRNUM = {vc: 1, ac: 1};   // VEL / AT CURVE may come as 'max' / 'none'
  function fill(d, s) {
    if (!s || typeof s !== 'object') return d;
    for (const k in d) {
      if (!(k in s)) continue;
      const a = d[k], b = s[k];
      if (Array.isArray(a)) { if (Array.isArray(b)) d[k] = b.map(x => (Array.isArray(x) ? x.slice() : x)); }
      else if (a && typeof a === 'object') fill(a, b);
      else if (typeof a === 'number') { const x = +b; if (isFinite(x) && b !== '' && b !== null) d[k] = x; else if (STRNUM[k] && typeof b === 'string') d[k] = b; }
      else if (typeof a === 'string') { if (typeof b === 'string') d[k] = b; }
    }
    return d;
  }
  // VEL CURVE 1..5 (gamma), 6 / 'max' = always full; AT CURVE 1..5 (gamma), 6 = min(1, 3a), 0 / 7 / 'none' = off
  const velCurve = (vc, v) => { if (vc === 'max' || +vc >= 6) return 1; const g = VELG[clamp(Math.round(+vc || 4), 1, 5) - 1]; return Math.pow(clamp(v, 0, 1), g); };
  const atCurve = (ac, a) => { if (ac === 'none' || +ac === 0 || +ac >= 7) return 0; const k = Math.round(+ac || 4); if (k === 6) return Math.min(1, 3 * a); return Math.pow(clamp(a, 0, 1), ATG[clamp(k, 1, 5) - 1]); };
  // FX type names by family index and n (made once: no strings in the audio path)
  const FXF = ['CH', 'DT', 'BC', 'RM', 'DL', 'RV'], FXN = FXF.map(f => { const o = ['']; for (let n = 1; n <= 16; n++) o.push(f + n); return o; });
  // events at the same time: note off, stop, transport start, controllers, retune, then note on
  const QPR = [9, 5, 0, 4, 1, 3, 2];
  const QORD = (a, b) => a.at - b.at || QPR[a.k] - QPR[b.k];
  // numeric fields that are not smoothed (times, switches, deltas, indices)
  const NOSM = {m: 1, a: 1, d: 1, r: 1, lp: 1, dv: 1, ds: 1, de: 1, po: 1, ra: 1, vc: 1, ac: 1, tf: 1, sy: 1, ho: 1, tr: 1, dl: 1, dc: 1, ps: 1};

/* @FX */

  /* ---- one voice ---- */
  class Voice {
    constructor(k, hl) {
      this.k = k; this.on = false; this.ghost = false; this.id = -1; this.n = 60; this.vel = 0; this.velC = 0; this.pg = 0; this.gate = false; this.ord = 0; this.relOrd = 0;
      this.key = -1; this.susHeld = false;
      this.M1 = 7; this.b1 = 3; this.M2 = 7; this.b2 = 3;
      this.X1 = 0; this.xb1 = 0; this.xw1 = 0; this.xd1 = 0; this.X2 = 0; this.xb2 = 0; this.xw2 = 0; this.xd2 = 0;
      this.u1 = 7; this.u2 = 7; this.ux1 = 7; this.ux2 = 7;   // user masks (current / fading out)
      // hot numbers in typed arrays (a double or a large int32 in a plain field would allocate a heap number per store):
      // Z = [phase 1, phase 2, noise state, increment 1, increment 2] (int32 = the uint32 bits)
      // D = [0 noise phase, 1 noise value, 2/3 compensation delays, 4/5 DC block x/y, 6/7/8 gains x CSC, 9 noise increment,
      //      10 out left, 11 fade level, 12 fade step/factor, 13 out right, 14/15 SVF states, 16 g, 17 k, 18 a1, 19 a2, 20 a3]
      this.Z = new Int32Array(5); this.D = new Float64Array(24);
      this.fm = 0;                            // filter output 0 lp 1 hp 2 bp 3 notch
      // envelopes [osc1, osc2, noise, filter]: stage 0 off, 1 attack, 2 decay, 3 sustain, 4 release; level; timer; quantized level
      this.es = new Int8Array(4); this.el = new Float64Array(4); this.et = new Float64Array(4); this.eq = new Float64Array(4);
      this.pr = new Float64Array(4);          // PARA: own release level of a voice let go while others are held
      this.ds1 = 0; this.ds2 = 0; this.dm1 = 0; this.dm2 = 0; this.dpT = 0;
      this.H = new Float64Array(4); this.H[3] = -1e9;   // [t since note-on, pitch delta, glide, last pitch]: doubles stored each step
      this.vm = new Float64Array(NT);         // velocity route sums (u * v', per note)
      this.vVol = 1; this.vFeg = 1; this.vPeg = 1; this.vAtk = 1;
      this.pan0 = 0;                          // PANS spread of this note
      this.quiet = 0; this.kill = 0; this.paraRel = false; this.now = false;
      this.I = new Int32Array(5); this.C = new Int32Array(5);
      this.hl = hl; this.hb = new Float64Array(2 * hl); this.hp = 0;
    }
    get gld() { return this.H[2]; }   // (tests)
  }
  // per program running state: LFOs, PARA envelope, held keys
  class PState {
    constructor() {
      this.lph = new Float64Array(2); this.lphP = new Float64Array(2); this.lrndP = new Float64Array(2); this.lite = 0; this.lv = new Float64Array(2); this.lsp = new Float64Array(2).fill(-1); this.lf = new Float64Array(2); this.lrnd = new Float64Array(2); this.lrng = new Int32Array(2);
      this.lt = 0;                            // seconds since the phrase start (delay / decay of the LFOs)
      this.mod = new Float64Array(NT);        // MW + AT + LFO sums of this control step (in target units)
      this.lfoA = new Float64Array(8);        // LFO slot amounts after l1a / l2a
      this.es = new Int8Array(4); this.el = new Float64Array(4); this.et = new Float64Array(4); this.eq = new Float64Array(4);
      this.dlyOff = new Uint8Array(2); this.panAlt = 1; this.lastP = -1e9;
      this.keys = [];                         // held keys [{id, n, v, ord}] (mono modes return to them)
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
      this.lyS = new Float64Array(2); this.lyS[0] = .5; this.lyG = 0;   // layer BAL / PAN in use (0..1), glided per control step (no step on a turn)
      this.tq = new Float64Array(8);   // in / out of the per-step helpers (no double arguments or returns: no heap numbers)
      this.S = [new PState(), new PState()];
      this.NV = 12; this.V = []; for (let k = 0; k < 18; k++) this.V.push(new Voice(k, this.hl));   // 12 voices + 6 crossfade slots
      for (const v of this.V) this.clearVoice(v);
      this.q = []; this.late = 0; this.ord = 0; this.noteCnt = 0; this.seed = 0x9e3779b9; this.fi = 0; this.keepEl = new Float64Array(4); this.stole = false; this.endR = new Float64Array(512).fill(-1); this.endP = 0;
      this.frame = 0; this.qn = 0; this.busy = 0; this.busyN = 0; this.qMax = 0; this.lastRep = 0;
      this.hasPerf = typeof performance !== 'undefined' && typeof performance.now === 'function';
      // controllers: target, value, ramp step (10 ms in 1 ms steps); [bend, mw, at]
      this.cT = new Float64Array(3); this.cV = new Float64Array(3); this.cS = new Float64Array(3); this.cMoved = new Uint8Array(3);
      this.sus = false; this.lim = 0; this.trRun = false; this.bpm = 120;
      this.gc = 0; this.idle = false;          // samples to the next global control step; idle: see isIdle
      // operator smoothing (rule 12): numeric sets glide 5 ms in 1 ms steps; slots [obj, key, from, to, step]
      this.smN = 0; this.sm = []; for (let k = 0; k < 48; k++) this.sm.push({o: null, k: '', a: 0, b: 0, i: 0});
      this.tapOn = false; this.tapAll = false; this.tapK = ''; this.tapBuf = null; this.tapN = 0; this.tapV = -1;
      // BM3: FX1 per program, FX2 once (from A); the voices of each program sum into its own buffer first
      this.fx1 = [new FxSlot(1, sr), new FxSlot(1, sr)]; this.fx2 = new FxSlot(2, sr);
      this.pbL = [new Float32Array(128), new Float32Array(128)]; this.pbR = [new Float32Array(128), new Float32Array(128)];
      this.prep(0); this.lfoReset(this.S[0]); this.lfoReset(this.S[1]);
      this.port.onmessage = e => this.msg(e.data);
    }
    prog(p) { return fill(progInit(), p); }
    // per program derived numbers (ids to indices); called when a program changes
    prep(pi) {
      const P = this.P[pi]; if (!P) return;
      // the slots as fixed arrays [target, amount] x 4 (made once per program object, then only overwritten: no allocation)
      const D = P.__d || (P.__d = {mo: 0, w: new Int8Array(2), td: new Float64Array(3), fm: 0, slots: {v: new Float64Array(8), mw: new Float64Array(8), at: new Float64Array(8), l1: new Float64Array(8), l2: new Float64Array(8)}});
      D.mo = Math.max(0, MODES.indexOf(P.g.mo)); D.w[0] = Math.max(0, WAVES.indexOf(P.l1.w)); D.w[1] = Math.max(0, WAVES.indexOf(P.l2.w));
      this.slotFill(D.slots.v, P.mo.v, OKS.v); this.slotFill(D.slots.mw, P.mo.mw, OKS.mw); this.slotFill(D.slots.at, P.mo.at, OKS.mw); this.slotFill(D.slots.l1, P.l1.t, OKS.lfo); this.slotFill(D.slots.l2, P.l2.t, OKS.lfo);
      D.fm = FMODE[P.f.md] == null ? 0 : FMODE[P.f.md];
      D.td[0] = TD(P.o1.dv); D.td[1] = TD(P.o2.dv); D.td[2] = TD(P.pe.dv);   // delta times (no TD call per control step)
      // FX types as (family, n): FX1 CH DT BC RM = 0..3, FX2 DL RV DT = 4, 5, 1
      const ft = (t, fams) => { if (typeof t !== 'string' || t.length < 3) return [-1, 0]; const fi = fams.indexOf(t.slice(0, 2)), n = +t.slice(2) | 0; return fi < 0 || n < 1 || n > 16 || String(n) !== t.slice(2) ? [-1, 0] : [FXF.indexOf(t.slice(0, 2)), n]; };
      const a = ft(P.fx.t1, FAM1), b = ft(P.fx.t2, FAM2); D.f1 = a[0]; D.n1 = a[1]; D.f2 = b[0]; D.n2 = b[1];
    }
    slotFill(o, arr, ok) { for (let i = 0; i < 4; i++) { const s = Array.isArray(arr) ? arr[i] : null, t = s ? TI[s[0]] : undefined; o[2 * i] = t !== undefined && ok[t] ? t : -1; o[2 * i + 1] = s ? num(s[1], 0) : 0; } }
    // ---------------- messages ----------------
    msg(m) {
      if (!m || typeof m !== 'object') return;
      const now = currentTime;
      switch (m.t) {
        case 'prog': { const k = m.ab === 'b' ? 1 : 0; this.P[k] = m.p ? this.prog(m.p) : (k ? null : this.prog(null)); this.prep(k); this.progChanged(k); break; }
        case 'set': this.set(m.ab, String(m.k || ''), m.v); break;
        case 'ly': this.ly = fill(lyInit(), m.p); this.lyNew(); break;
        case 'gl': this.gl = fill(glInit(), m.p); break;
        case 'on': for (const x of m.list || []) { const at = num(x.at, 0); if (at < now - 1 / this.sr) this.late++; this.q.push({k: 1, at, n: num(x.n, 60), v: num(x.v, .8), d: x.d | 0, id: x.id == null ? -1 : x.id}); } this.sortQ(); break;
        case 'off': for (const x of m.list || []) this.q.push({k: 2, at: num(x.at, 0), n: num(x.n, 60), id: x.id == null ? -1 : x.id, tau: num(x.tau, 0), kill: x.kill ? 1 : 0}); this.sortQ(); break;
        case 'rt': for (const x of m.list || []) this.q.push({k: 3, at: num(x.at, 0), n: num(x.n, 60), to: num(x.to, 60), id: x.id == null ? -1 : x.id}); this.sortQ(); break;
        case 'ctl': this.ctl(m); break;
        case 'tr': { const run = !!m.run; if (m.bpm) this.bpm = clamp(+m.bpm || 120, 20, 400); if (run) { this.q.push({k: 6, at: num(m.at, now)}); this.sortQ(); } this.trRun = run; break; }
        case 'bpm': this.bpm = clamp(+m.bpm || this.bpm, 20, 400); break;
        case 'stop': this.q.push({k: 4, at: num(m.at, 0), tau: num(m.tau, .02)}); this.sortQ(); break;
        case 'panic': this.q.length = 0; for (const v of this.V) if (v.on) this.fadeOut(v, .003); for (const S of this.S) { this.endKeys(S); S.keys.length = 0; S.es.fill(0); S.el.fill(0); S.eq.fill(0); } this.sus = false; this.fx1[0].panic(); this.fx1[1].panic(); this.fx2.panic(); break;
        case 'reset': this.reset(); break;
        case 'lim': this.lim = m.level | 0; break;
        case 'seed': this.seed = (m.v >>> 0) || 0x9e3779b9; break;
        case 'tap': this.tap(m); break;
      }
    }
    sortQ() { this.q.sort(QORD); }
    // a whole new program: sounding voices of it take the new masks with the MASK crossfade, the rest at the next step
    progChanged(pi) {
      const P = this.P[pi]; if (!P) return;
      for (const v of this.V) if (v.on && !v.ghost && v.pg === pi) { this.maskTurn(v, 1, clamp(Math.round(P.o1.m), 0, 511)); this.maskTurn(v, 2, clamp(Math.round(P.o2.m), 0, 511)); }
    }
    set(ab, k, v) {
      if (ab === 'ly') { const o = Object.assign({}, this.ly); o[k] = v; this.ly = fill(lyInit(), o); this.lyNew(); return; }
      if (ab === 'gl') { const old = this.gl[k], o = Object.assign({}, this.gl); o[k] = v; const nw = fill(glInit(), o); const x = nw[k]; this.gl[k] = old;
        if (typeof old === 'number' && typeof x === 'number' && !NOSM[k]) this.smooth(this.gl, k, old, x); else this.gl[k] = x; return; }
      const pi = ab === 'b' ? 1 : 0, P = this.P[pi]; if (!P) return;
      const ks = k.split('.'); let o = P;
      for (let i = 0; i < ks.length - 1 && o; i++) o = o[ks[i]];
      if (!o || typeof o !== 'object') return;
      const last = ks[ks.length - 1], old = o[last];
      if (typeof old === 'number') {
        const x = +v; if (!isFinite(x)) return;
        if (last === 'm' && (ks[0] === 'o1' || ks[0] === 'o2') && ks.length === 2) {
          // a turn of MASK: 10 ms crossfade on the sounding voices of this program (rule 12)
          o[last] = x; const w = ks[0] === 'o1' ? 1 : 2, m = clamp(Math.round(x), 0, 511);
          for (const vc of this.V) if (vc.on && !vc.ghost && vc.pg === pi) this.maskTurn(vc, w, m);
        } else if (NOSM[last] || ks[0] === 'ar' || (ks[0] === 'fx' && last !== 'b1' && last !== 'b2')) o[last] = x;
        else this.smooth(o, last, old, x);
      } else if (typeof old === 'string') { if (typeof v === 'string') o[last] = v; }
      else if (Array.isArray(old) && Array.isArray(v)) o[last] = v.map(x => (Array.isArray(x) ? x.slice() : x));
      else return;
      this.prep(pi);
    }
    // operator smoothing: 5 ms in 1 ms steps toward the new value (section 2.4)
    smooth(o, k, a, b) {
      let s = null; for (const x of this.sm) if (x.o === o && x.k === k) { s = x; break; }
      if (s) a = o[k]; else { for (const x of this.sm) if (!x.o) { s = x; break; } }
      if (!s) { o[k] = b; return; }
      s.o = o; s.k = k; s.a = a; s.b = b; s.i = 0; this.smN++;
    }
    smoothStep() {
      if (!this.smN) return;
      let any = false, n = 0;
      for (let j = 0; j < this.sm.length; j++) { const s = this.sm[j]; if (!s.o) continue; if (Array.isArray(s.o)) any = true; s.i++; if (s.i >= 5) { s.o[s.k] = s.b; s.o = null; } else { s.o[s.k] = s.a + (s.b - s.a) * s.i / 5; n++; } }
      this.smN = n;
      if (any) { this.prep(0); this.prep(1); }
    }
    ctl(m) {
      if (Array.isArray(m.list)) { for (const x of m.list) this.q.push({k: 5, at: num(x.at, 0), c: x.k, v: num(x.v, 0)}); this.sortQ(); return; }
      if (m.bend != null) this.ctlSet(0, clamp(num(m.bend, 0), -1, 1));
      if (m.mw != null) this.ctlSet(1, clamp(num(m.mw, 0), 0, 1));
      if (m.pr != null) this.ctlSet(2, clamp(num(m.pr, 0), 0, 1));
      if (m.sus != null) this.susSet(!!m.sus);
    }
    // MW, pressure and bend glide 10 ms (in 1 ms steps)
    ctlSet(i, x) { if (x === this.cT[i]) return; this.cT[i] = x; this.cS[i] = (x - this.cV[i]) / 10; if (i) this.cMoved[i] = 1; }
    susSet(on) {
      this.sus = on;
      if (on) return;
      for (const v of this.V) if (v.on && !v.ghost && v.susHeld) { v.susHeld = false; this.release(v); }
      for (let p = 0; p < 2; p++) { const P = this.P[p], S = this.S[p]; if (P && (P.__d.mo === 4 || P.__d.mo === 6) && !S.keys.length) for (let k = 0; k < 4; k++) if (S.es[k]) { S.es[k] = 4; S.et[k] = 0; } }
    }
    reset() {
      this.q.length = 0; this.noteCnt = 0; this.ord = 0; this.trRun = false;
      for (const v of this.V) { if (v.on && !v.ghost) this.endVoice(v); this.clearVoice(v); v.H[3] = -1e9; }
      this.endR.fill(-1); this.endP = 0;
      for (let i = 0; i < 3; i++) { this.cT[i] = 0; this.cV[i] = 0; this.cS[i] = 0; this.cMoved[i] = 0; }
      for (const S of this.S) { S.keys.length = 0; S.panAlt = 1; S.lastP = -1e9; this.lfoReset(S); S.es.fill(0); S.el.fill(0); S.et.fill(0); S.eq.fill(0); S.mod.fill(0); }
      for (const s of this.sm) if (s.o) { s.o[s.k] = s.b; s.o = null; } this.smN = 0;
      this.sus = false; this.gc = 0;
      for (const F of [this.fx1[0], this.fx1[1], this.fx2]) { F.clear(); F.type = ''; F.cur = 0; F.byp = true; F.bc = 0; F.lz = true; }
      this.lyNew();
    }
    lfoReset(S) { S.lph.fill(0); S.lv.fill(0); S.lrng[0] = 0x2545f491; S.lrng[1] = 0x6c8e9cf5; for (let l = 0; l < 2; l++) { let r = S.lrng[l]; r ^= r << 13; r ^= r >>> 17; r ^= r << 5; S.lrng[l] = r; S.lrnd[l] = r * 4.656612873077393e-10; } S.lt = 0; S.dlyOff.fill(0); S.lphP.fill(0); S.lrndP.set(S.lrnd); S.lite = 0; }
    clearVoice(v) {
      v.on = false; v.ghost = false; v.id = -1; v.key = -1; v.gate = false; v.kill = 0; v.susHeld = false; v.paraRel = false; v.relOrd = 0; v.endSent = false;
      v.Z[0] = 0; v.Z[1] = 0; v.D.fill(0); v.D[11] = 1; v.xw1 = v.xw2 = 0;
      v.I.fill(0); v.C.fill(0); v.hb.fill(0); v.hp = 0;
      v.es.fill(0); v.el.fill(0); v.et.fill(0); v.eq.fill(0); v.pr.fill(1); v.quiet = 0; v.H[2] = 0; v.H[1] = 0; v.dpT = 0;
    }
    tap(m) {
      this.tapOn = !!m.on; this.tapK = String(m.k || 'ctl'); this.tapAll = !!m.all;
      if (this.tapOn) { this.tapBuf = new Float32Array(this.tapK === 'osc16' ? (m.len | 0) || 16 * 4096 : (m.len | 0) || 13 * 16384); this.tapN = 0; this.tapV = -1; }
      else if (this.tapBuf) { this.port.postMessage({t: 'tap', k: this.tapK, n: this.tapN, buf: this.tapBuf.slice(0, this.tapN)}); this.tapBuf = null; }
    }
    // ---------------- pitch ----------------
    // the played key through the temperament (from C), then GLOBAL SEMI (section 1.10): semitones, A4 = 69 (= TUNE)
    keyPitch(n) { const T = TEMP[this.gl.tm] || TEMP.et, k = Math.round(n), pc = ((k % 12) + 12) % 12; return k - pc + T[pc] / 100 + (n - k) + this.gl.st; }
    // ---------------- notes ----------------
    countActive() { let a = 0; for (let i = 0; i < this.V.length; i++) { const v = this.V[i]; if (v.on && !v.ghost) a++; } return a; }
    level(v) { return v.eq[0] + v.eq[1] + v.eq[2]; }
    // a free note voice; else steal: the quietest under the limiter, else the longest released, else the oldest held
    pickVoice() {
      const cap = this.lim >= 2 ? 6 : this.lim >= 1 ? 8 : this.NV;
      let act = 0;
      for (let i = 0; i < this.V.length; i++) { const v = this.V[i]; if (v.on && !v.ghost) act++; }
      if (act < cap) for (let i = 0; i < this.NV; i++) { const v = this.V[i]; if (!v.on) return v; }
      let best = null;
      if (this.lim > 0) { for (const v of this.V) if (v.on && !v.ghost && (!best || this.level(v) < this.level(best))) best = v; }
      else {
        for (const v of this.V) if (v.on && !v.ghost && !v.gate && (!best || v.relOrd < best.relOrd)) best = v;
        if (!best) for (const v of this.V) if (v.on && !v.ghost && (!best || v.ord < best.ord)) best = v;
      }
      if (!best) return null;
      // a voice slot of the 12 (the crossfade slots never carry a note); its envelope levels are kept for the modes without restart
      const keep = best.H[3]; this.keepEl.set(best.el); this.stole = true; this.ghostOf(best); this.clearVoice(best); best.H[3] = keep;
      if (best.k >= this.NV) { for (let i = 0; i < this.NV; i++) if (!this.V[i].on) return this.V[i]; }
      return best;
    }
    // the 3 ms crossfade of a voice that is taken over (rule 13): a copy of its whole state fades out linearly
    ghostOf(v) {
      if (!v.on) return;
      // its note ends now, unless the key is still held (a mono voice may come back to it; its 'end' follows the key's off)
      if (!v.ghost && !this.held(v) && !this.twin(v)) this.sendEnd(v);
      if (v.quiet > 2 && !v.gate) return;
      let g = null; for (let i = this.NV; i < this.V.length; i++) if (!this.V[i].on) { g = this.V[i]; break; }
      if (!g) { for (let i = this.NV; i < this.V.length; i++) if (!g || this.V[i].D[11] < g.D[11]) g = this.V[i]; }
      if (!g || g === v) return;
      this.copyVoice(g, v); g.ghost = true; g.gate = false; g.kill = 2; g.D[11] = v.kill ? v.D[11] : 1; g.D[12] = g.D[11] / Math.max(1, Math.round(.003 * this.sr)); g.id = -1; g.endSent = true;
    }
    copyVoice(g, v) {
      g.on = true; g.n = v.n; g.pg = v.pg; g.vel = v.vel; g.velC = v.velC; g.M1 = v.M1; g.b1 = v.b1; g.M2 = v.M2; g.b2 = v.b2; g.fm = v.fm;
      g.X1 = v.X1; g.xb1 = v.xb1; g.xw1 = 0; g.X2 = v.X2; g.xb2 = v.xb2; g.xw2 = 0;
      g.Z.set(v.Z); g.D.set(v.D); g.I.set(v.I); g.C.set(v.C); g.hb.set(v.hb); g.hp = v.hp; g.eq.set(v.eq); g.es.fill(0); g.quiet = 0;
    }
    newVoice(v, e, pg, n) {
      const P = this.P[pg] || this.P[0], D = P.__d;
      v.on = true; v.ghost = false; v.gate = true; v.id = e.id; v.key = e.n; v.n = n; v.vel = e.v; v.pg = pg; v.ord = ++this.ord; v.kill = 0;
      v.velC = velCurve(this.gl.vc, e.v);
      v.Z[2] = (Math.imul(this.seed ^ (++this.noteCnt), 0x9e3779b1) >>> 0) || 1;
      v.u1 = clamp(Math.round(P.o1.m), 0, 511); v.u2 = clamp(Math.round(P.o2.m), 0, 511); v.xw1 = v.xw2 = 0;
      this.velRoutes(v, P); v.endSent = false;
      this.deltas(v, P);
      for (let k = 0; k < 4; k++) { v.es[k] = 1; v.el[k] = 0; v.et[k] = 0; v.pr[k] = 1; }
      // PANS: alternate sides per note (section 1.10)
      const S = this.S[pg]; S.panAlt = -S.panAlt; v.pan0 = S.panAlt * P.g.ps / 15;
      v.fm = D.fm; v.quiet = 0; v.paraRel = false; v.H[2] = 0; v.now = true;
    }
    // mask delta k (0 / 1) of voice v at its time H[0] -> tq[k]
    maskD(v, D, k) { const q = this.tq, ds = k ? v.ds2 : v.ds1, T = D.td[k], t = v.H[0]; q[k] = 0; if (!ds) return; if (t >= T - 1e-9) return; const d = Math.abs(ds) * Math.exp(-t * LN100 / T); q[k] = (ds < 0 ? -1 : 1) * Math.ceil(d - 1e-9); }
    // velocity routes (per note): u * v' summed per target; vol / feg / peg / atk as factors (section 1.9)
    velRoutes(v, P) {
      v.vm.fill(0); v.vVol = 1; v.vFeg = 1; v.vPeg = 1; v.vAtk = 1; const s = P.__d.slots.v, vv = v.velC;
      for (let i = 0; i < 8; i += 2) { const t = s[i]; if (t < 0 || !s[i + 1]) continue; const u = amtU(s[i + 1]);
        if (t === TI.vol) v.vVol *= Math.max(0, 1 - Math.abs(u) * (1 - vv)); else if (t === TI.feg) v.vFeg *= 1 + u * (vv - 1);
        else if (t === TI.peg) v.vPeg *= 1 + u * (vv - 1); else if (t === TI.atk) v.vAtk *= Math.pow(2, -4 * u * vv); else v.vm[t] += u * vv * TD_[t]; }
    }
    deltas(v, P) { v.H[0] = 0; v.ds1 = P.o1.ds; v.ds2 = P.o2.ds; v.dm1 = P.o1.ds; v.dm2 = P.o2.ds; v.H[1] = Math.sign(P.pe.ds) * 48 * Math.pow(Math.abs(P.pe.ds) / 63, 2) * v.vPeg; v.dpT = 0; }
    // portamento from a pitch (semitones) over T(PORT) (exponential, 1 % rest)
    glideFrom(v, from) { const P = this.P[v.pg] || this.P[0]; v.H[2] = P.g.po > 0 && from > -1e8 ? from - this.keyPitch(v.n) : 0; }
    heldIdx(S, e) { for (let i = 0; i < S.keys.length; i++) { const k = S.keys[i]; if (e.id >= 0 ? k.id === e.id : k.n === e.n) return i; } return -1; }
    takeKey(v, e) { v.id = e.id; v.key = e.n; v.n = e.n; v.vel = e.v; v.velC = velCurve(this.gl.vc, e.v); v.gate = true; v.susHeld = false; v.endSent = false; v.ord = ++this.ord; this.velRoutes(v, this.P[v.pg] || this.P[0]); }
    // BM4 layer / split (section 1.13): the programs a key plays. d (BM6 'on.d'): 1 = only A, 2 = only B, 3 = both, 0 = by LAYER / SPLIT
    voiceOn(e) {
      const two = !!this.P[1], md = this.ly.md, d = e.d & 3;
      if (two && (d === 3 || (d === 0 && md === 'lay'))) { this.voiceOnPg(e, 0); this.voiceOnPg(e, 1); }
      else if (two && (d === 2 || (d === 0 && md === 'spl' && e.n >= this.ly.sp))) this.voiceOnPg(e, 1);
      else this.voiceOnPg(e, 0);
    }
    // the level and side of a program in LAYER / SPLIT: BAL 0..100 (A x (1 - b), B x b, as BAL of section 1.3), PAN 0..100 spreads A left, B right
    // new layer values: nothing sounding -> at once; else they glide (1 ms steps, factor 0.25: 99 % after 16 ms)
    lyNew() { let any = false; for (const v of this.V) if (v.on) any = true; this.lyG = 1; if (!any) { this.lyS[0] = clamp(this.ly.bal, 0, 100) / 100; this.lyS[1] = clamp(this.ly.pan, 0, 100) / 100; } }
    // layer gain -> tq[2], layer pan -> tq[3]
    lyGP(pg) {
      const q = this.tq; if (!this.P[1] || this.ly.md === 'ein') { q[2] = 1; q[3] = 0; return; }
      const b = this.lyS[0], p = this.lyS[1]; q[2] = pg ? b : 1 - b; q[3] = pg ? p : -p;
    }
    voiceOnPg(e, pg) {
      const P = this.P[pg], S = this.S[pg], mo = P.__d.mo;
      const legato = S.keys.length > 0;
      if (!legato) { S.lt = 0; S.dlyOff.fill(0); if (mo === 4 || mo === 6) for (let k = 0; k < 4; k++) { if (S.es[k] === 0) S.el[k] = 0; S.es[k] = 1; S.et[k] = 0; } }
      S.keys.push({id: e.id, n: e.n, v: e.v, ord: ++this.ord, ended: false});
      const prevP = S.lastP; S.lastP = this.keyPitch(e.n);
      // MONO family (MONO, MONO PORTA, MONO RETRIG, MOLY legato): one voice, last key
      if (mo === 1 || mo === 3 || mo === 7 || (mo === 5 && legato)) {
        let v = null; for (const x of this.V) if (x.on && !x.ghost && x.kill === 0 && x.pg === pg && (mo !== 5 || x.gate)) { if (!v || x.ord > v.ord) v = x; }
        const restart = mo === 7 || (mo === 3 && !legato);
        if (v && !restart) {
          // MONO: no restart (attack again from the current level when nothing was held), portamento always;
          // MONO PORTA / MOLY legato: no restart, portamento legato
          const from = this.keyPitch(v.n) + v.H[2];
          if (!v.gate) this.sendEnd(v);
          this.takeKey(v, e); this.glideFrom(v, from);
          if (!legato) { for (let k = 0; k < 4; k++) { v.es[k] = 1; v.et[k] = 0; } this.deltas(v, P); }
          return;
        }
        let from = -1e9;
        if (v) { from = this.keyPitch(v.n) + v.H[2]; const keep = v.H[3]; this.ghostOf(v); this.clearVoice(v); v.H[3] = keep; } else { v = this.pickVoice(); if (v && mo === 1) from = v.H[3]; }
        if (!v) return;
        this.newVoice(v, e, pg, e.n);
        if (legato || mo === 1) this.glideFrom(v, from);
        return;
      }
      // SLUR / PARA SLUR: a legato key 1-2 semitones next to a held key: that voice glides there (the old key counts as released)
      if ((mo === 2 || mo === 6) && legato) {
        let near = null; for (const x of this.V) if (x.on && !x.ghost && x.gate && x.pg === pg) { const d = Math.abs(x.key - e.n); if (d >= 1 && d <= 2 && (!near || x.ord > near.ord)) near = x; }
        if (near) {
          const from = this.keyPitch(near.n) + near.H[2], oi = this.heldIdx(S, {id: near.id, n: near.key});
          if (oi >= 0) S.keys.splice(oi, 1);
          this.sendEnd(near);
          this.takeKey(near, e); this.glideFrom(near, from);
          return;
        }
      }
      // POLY family: a free voice (or a steal: POLY, SLUR, PARA, MOLY run on from the taken voice's level, POLY RETRIG restarts)
      this.stole = false;
      const v = this.pickVoice(); if (!v) return;
      const from = v.H[3];
      this.newVoice(v, e, pg, e.n);
      if (this.stole && mo !== 8) v.el.set(this.keepEl);
      if (mo === 0 || mo === 8) this.glideFrom(v, from);                       // poly portamento: from this voice's last pitch
      else if ((mo === 4 || mo === 6) && legato) this.glideFrom(v, prevP);    // PARA: portamento from the second key on (from the last key)
    }
    release(v) {
      const P = this.P[v.pg] || this.P[0], mo = P.__d.mo, S = this.S[v.pg];
      if (v.gate || !v.relOrd) v.relOrd = ++this.ord; v.gate = false;
      v.dpT = Math.sign(P.pe.de) * 48 * Math.pow(Math.abs(P.pe.de) / 63, 2);                // pitch delta: END on release
      if ((mo === 4 || mo === 6) && S.keys.length > 0) { v.paraRel = true; return; }      // PARA: this voice fades with R, the shared set runs on
      for (let k = 0; k < 4; k++) if (v.es[k]) { v.es[k] = 4; v.et[k] = 0; }
    }
    voiceOff(e) {
      for (let pg = 0; pg < 2; pg++) {
        const S = this.S[pg]; const i = this.heldIdx(S, e); if (i < 0) continue;
        const key = S.keys[i]; S.keys.splice(i, 1);
        const P = this.P[pg] || this.P[0], mo = P.__d.mo;
        let v = null; for (const x of this.V) if (x.on && !x.ghost && x.pg === pg && x.gate && (key.id >= 0 ? x.id === key.id : x.key === key.n)) { v = x; break; }
        if (!v) {   // a key the mono voice had left (or a taken voice)
          this.endId(key.n, key.id);
          if (!S.keys.length && (mo === 4 || mo === 6) && !this.sus) for (let k = 0; k < 4; k++) if (S.es[k]) { S.es[k] = 4; S.et[k] = 0; }
          continue;
        }
        // MONO family: back to the newest still held key (legato: no restart; glide where the mode glides)
        if ((mo === 1 || mo === 3 || mo === 7 || mo === 5) && S.keys.length && !e.kill && !(e.tau > 0)) {
          let mono = true; if (mo === 5) { let n = 0; for (const x of this.V) if (x.on && !x.ghost && x.gate && x.pg === pg) n++; mono = n === 1; }
          if (mono) {
            const k2 = S.keys[S.keys.length - 1], from = this.keyPitch(v.n) + v.H[2];
            this.sendEnd(v);
            v.id = k2.id; v.key = k2.n; v.n = k2.n; this.glideFrom(v, from);
            continue;
          }
        }
        if (e.kill) this.fadeOut(v, .001);
        else if (e.tau > 0) this.fadeOut(v, e.tau);
        else if (this.sus) { v.gate = false; v.susHeld = true; v.relOrd = ++this.ord; }   // the pedal holds: let go, the envelope stays
        else this.release(v);
        if (!S.keys.length && (mo === 4 || mo === 6) && !this.sus) for (let k = 0; k < 4; k++) if (S.es[k]) { S.es[k] = 4; S.et[k] = 0; }
      }
    }
    fadeOut(v, tau) { if (v.gate || !v.relOrd) v.relOrd = ++this.ord; v.gate = false; v.susHeld = false; v.kill = v.kill === 2 ? 2 : 1; if (v.kill === 1) v.D[12] = Math.exp(-1 / (Math.max(tau, 1e-4) * this.sr)); }   // the fade alone (time constant tau), the envelope stays
    maskTurn(v, w, m) {
      const n = Math.round(.01 * this.sr);
      if (w === 1) { if (m === v.u1) return; v.ux1 = v.u1; v.u1 = m; v.xw1 = 1; v.xd1 = 1 / n; }
      else { if (m === v.u2) return; v.ux2 = v.u2; v.u2 = m; v.xw2 = 1; v.xd2 = 1 / n; }
      this.masks(v, this.S[v.pg].mod);
    }
    ev(e) {
      if (e.k === 1) { this.voiceOn(e); for (const v of this.V) if (v.now) { v.now = false; if (v.on) this.ctlVoice(v); } }
      else if (e.k === 2) this.voiceOff(e);
      else if (e.k === 3) { for (const v of this.V) if (v.on && !v.ghost && (e.id >= 0 ? v.id === e.id : v.n === e.n)) { v.n = e.to; v.key = e.to; } for (const S of this.S) { const i = this.heldIdx(S, e); if (i >= 0) S.keys[i].n = e.to; } }
      else if (e.k === 4) { for (const v of this.V) if (v.on) this.fadeOut(v, e.tau); for (const S of this.S) { this.endKeys(S); S.keys.length = 0; for (let k = 0; k < 4; k++) if (S.es[k]) { S.es[k] = 4; S.et[k] = 0; } } }
      else if (e.k === 5) { const i = e.c === 'bd' ? 0 : e.c === 'mw' ? 1 : e.c === 'at' ? 2 : -1; if (i >= 0) this.ctlSet(i, i ? clamp(e.v, 0, 1) : clamp(e.v, -1, 1)); else if (e.c === 'sus') this.susSet(e.v >= .5); }
      else if (e.k === 6) { for (const S of this.S) this.lfoReset(S); this.gc = 0; }   // transport start: LFO phase 0 and the global step grid
    }
    // ---------------- envelopes ----------------
    // one ADSR step; tsc scales the times (RATE), atk the attack (velocity route ATK); returns the 10-bit level
    // envelope k one control step; the time scale in tq[4], the attack factor in tq[5]
    envStep(es, el, et, k, E, q) {
      const tsc = this.tq[4], atk = this.tq[5];   // the 10-bit value goes to q[k] (no returned double: no heap number per step)
      const dt = this.dt; let st = es[k], l = el[k];
      if (st === 1) { const T = TX(E.a) * tsc * atk; l = T <= 0 ? 1 : l + dt / T; if (l >= 1) { l = 1; st = 2; et[k] = 0; } }
      else if (st === 2) {
        const S = (E.s / 15) * (E.s / 15), T = TX(E.d) * tsc;
        if (T <= 0) { l = S; et[k] = 1e9; } else { l = S + (l - S) * Math.exp(-dt * LN1000 / T); et[k] += dt; }
        if (et[k] >= T - 1e-9) { if (E.lp) { st = 1; et[k] = 0; } else { st = 3; l = S; } }
      } else if (st === 3) { l = (E.s / 15) * (E.s / 15); }
      else if (st === 4) { const T = TX(E.r) * tsc; l = T <= 0 ? 0 : l * Math.exp(-dt * LN1000 / T); if (l < 1e-6) { l = 0; st = 0; } }
      es[k] = st; el[k] = l;
      q[k] = Math.round(l * 1024) / 1024;     // 10 bit (section 2.4)
    }
    masks(v, mod) {
      const vm = v.vm;
      let m = clamp(Math.round(v.u1 + v.dm1 + mod[9] + mod[10] + vm[9]), 0, 511); if (m !== v.M1) { v.M1 = m; v.b1 = bitsOf(m); }
      m = clamp(Math.round(v.u2 + v.dm2 + mod[9] + mod[11] + vm[9]), 0, 511); if (m !== v.M2) { v.M2 = m; v.b2 = bitsOf(m); }
      if (v.xw1 > 0) { m = clamp(Math.round(v.ux1 + v.dm1 + mod[9] + mod[10] + vm[9]), 0, 511); v.X1 = m; v.xb1 = bitsOf(m); }
      if (v.xw2 > 0) { m = clamp(Math.round(v.ux2 + v.dm2 + mod[9] + mod[11] + vm[9]), 0, 511); v.X2 = m; v.xb2 = bitsOf(m); }
    }
    // ---------------- global control step (1 ms): controllers, operator smoothing, MW / AT / LFO sums, PARA envelope ----------------
    // the LFO part of the sums of program pi for the last control step (its kept phase and RAND value)
    lfoSums(pi) {
      const P = this.P[pi], S = this.S[pi], D = P.__d, mod = S.mod; S.lite = 0;
      for (let l = 0; l < 2; l++) {
        const L = l ? P.l2 : P.l1, sl = l ? D.slots.l2 : D.slots.l1, w = this.lfoWave(D.w[l], S.lphP[l], S.lrndP[l]);
        // DLAY: silent until 3/4 T, fade in over the last quarter; DCAY: -60 dB after T (from the phrase start)
        let g = 1;
        if (L.dl > 0 && !S.dlyOff[l]) { const Td = TX(L.dl); g = S.lt >= Td ? 1 : S.lt <= .75 * Td ? 0 : (S.lt - .75 * Td) / (.25 * Td); }
        if (L.dc > 0) g *= Math.exp(-S.lt * LN1000 / TX(L.dc));
        const val = w * g; S.lv[l] = val;
        const da = mod[14 + 2 * l];
        for (let i = 0; i < 8; i += 2) { const t = sl[i]; let a = sl[i + 1]; if (i === 0 || a) a = clamp(a + da, 0, 99); S.lfoA[4 * l + (i >> 1)] = a; if (t >= 0 && a) mod[t] += val * amtU(a) * TD_[t]; }
      }
    }
    // the LFO phases one control step on (the value of the step before is kept for lfoSums)
    lfoStep(S, P, mod) {
      S.lt += this.dt;
      for (let l = 0; l < 2; l++) {
        const L = l ? P.l2 : P.l1, spd = clamp(L.sp + mod[15 + 2 * l], 0, 99);
        if (spd !== S.lsp[l]) { S.lsp[l] = spd; S.lf[l] = 0.05 * Math.pow(8000, spd / 99); }
        S.lphP[l] = S.lph[l]; S.lrndP[l] = S.lrnd[l];
        let ph = S.lph[l] + S.lf[l] * this.dt;
        if (ph >= 1) { ph -= Math.floor(ph); let r = S.lrng[l]; r ^= r << 13; r ^= r >>> 17; r ^= r << 5; S.lrng[l] = r; S.lrnd[l] = r * 4.656612873077393e-10; }
        S.lph[l] = ph;
      }
    }
    ctlGlobal(lite) {
      this.smoothStep();
      if (this.lyG) { this.lyG = 0; for (let i = 0; i < 2; i++) { const L = this.lyS, d = (clamp(i ? this.ly.pan : this.ly.bal, 0, 100) / 100) - L[i]; if (d !== 0) { L[i] = d < 1e-4 && d > -1e-4 ? L[i] + d : L[i] + .25 * d; this.lyG = 1; } } }
      for (let i = 0; i < 3; i++) if (this.cV[i] !== this.cT[i]) { const x = this.cV[i] + this.cS[i]; this.cV[i] = (this.cS[i] > 0 ? x >= this.cT[i] : x <= this.cT[i]) ? this.cT[i] : x; }
      const mw = this.cV[1], at = atCurve(this.gl.ac, this.cV[2]);
      for (let pi = 0; pi < 2; pi++) {
        const P = this.P[pi]; if (!P) continue;
        const S = this.S[pi], D = P.__d, mod = S.mod;
        if (lite && S.lite) this.lfoStep(S, P, mod);   // idle: MW / AT stand still (isIdle), the sums are kept
        else {
        mod.fill(0);
        // MW and pressure: u * value * D
        let s = D.slots.mw; for (let i = 0; i < 8; i += 2) { const t = s[i]; if (t >= 0 && s[i + 1]) mod[t] += amtU(s[i + 1]) * mw * TD_[t]; }
        s = D.slots.at; for (let i = 0; i < 8; i += 2) { const t = s[i]; if (t >= 0 && s[i + 1]) mod[t] += amtU(s[i + 1]) * at * TD_[t]; }
        // a move of MW / pressure on amount or speed of an LFO lifts its delay (section 1.8)
        if (this.cMoved[1] || this.cMoved[2]) { if (mod[14] || mod[15]) S.dlyOff[0] = 1; if (mod[16] || mod[17]) S.dlyOff[1] = 1; }
        // LFOs (free running, one for all voices, stepwise per control step): the value at the current phase (phase 0 at the
        // transport start), then one step on; RAND: a new value per period. lite (idle): only the step on; the sums of the
        // last step are made when an event wakes the processor (lfoSums with the kept phase)
        this.lfoStep(S, P, mod);
        if (!lite) this.lfoSums(pi);
        else S.lite = 1;
        }
        // PARA: one envelope set per program
        if (D.mo === 4 || D.mo === 6) { this.tq[4] = 1; this.tq[5] = 1; this.envStep(S.es, S.el, S.et, 0, P.o1.e, S.eq); this.envStep(S.es, S.el, S.et, 1, P.o2.e, S.eq); this.envStep(S.es, S.el, S.et, 2, P.n.e, S.eq); this.envStep(S.es, S.el, S.et, 3, P.f.e, S.eq); }
      }
      this.cMoved[1] = 0; this.cMoved[2] = 0;
    }
    wake() { for (let pi = 0; pi < 2; pi++) if (this.P[pi] && this.S[pi].lite) this.lfoSums(pi); }
    // idle (no voice, every FX asleep, nothing gliding): nothing to render until the next event or control step
    isIdle() {
      for (let k = 0; k < this.V.length; k++) if (this.V[k].on) return false;
      if (this.smN) return false;
      if (this.cV[0] !== this.cT[0] || this.cV[1] !== this.cT[1] || this.cV[2] !== this.cT[2]) return false;
      return this.fx2.asleep() && this.fx1[0].asleep() && (!this.P[1] || this.fx1[1].asleep());
    }
    lfoWave(w, ph, rnd) {
      switch (w) {
        case 0: return Math.sin(2 * Math.PI * ph);
        case 1: return ph < .5 ? 1 : -1;
        case 2: return 2 * ph - 1;
        case 3: return 1 - 2 * ph;
        case 4: { const s = ph * 32, p = Math.floor(s), m = p & 23; return Math.sin(2 * Math.PI * (m + s - p) / 32); }   // the shape of mask 23
        case 5: return -1 + 2 * Math.floor(ph * 8) / 7;                                                           // 8 steps
        case 6: return 2 * Math.sin(Math.PI * ph) - 1;                                                            // the arc of mask 15, +-1
        default: return rnd;
      }
    }
    // ---------------- control step of one voice (section 2.4) ----------------
    ctlVoice(v) {
      const P = this.P[v.pg] || this.P[0], S = this.S[v.pg], mod = S.mod, vm = v.vm, dt = this.dt, sr = this.sr, D = v.D, gl = this.gl;
      const para = P.__d.mo === 4 || P.__d.mo === 6;
      // envelope times: RATE (x 2^(-(RATE/15)(note-60)/12)), attack: velocity route ATK
      const tsc = P.g.ra ? Math.pow(2, -(P.g.ra / 15) * (v.n - 60) / 12) : 1;
      let g1, g2, g3, gf;
      if (para) {
        if (v.paraRel) for (let k = 0; k < 4; k++) { const E = k === 0 ? P.o1.e : k === 1 ? P.o2.e : k === 2 ? P.n.e : P.f.e, T = TX(E.r); v.pr[k] = T <= 0 ? 0 : v.pr[k] * Math.exp(-dt * LN1000 / T); if (v.pr[k] < 1e-6) v.pr[k] = 0; }
        g1 = Math.round(S.eq[0] * v.pr[0] * 1024) / 1024; g2 = Math.round(S.eq[1] * v.pr[1] * 1024) / 1024; g3 = Math.round(S.eq[2] * v.pr[2] * 1024) / 1024; gf = S.eq[3] * v.pr[3];
        if (S.es[0] === 0 && S.es[1] === 0 && S.es[2] === 0 && !v.gate) v.paraRel = true;
        v.eq[0] = g1; v.eq[1] = g2; v.eq[2] = g3; v.eq[3] = gf;
      } else {
        const q = v.eq; this.tq[4] = tsc; this.tq[5] = v.vAtk;
        this.envStep(v.es, v.el, v.et, 0, P.o1.e, q); this.envStep(v.es, v.el, v.et, 1, P.o2.e, q);
        this.envStep(v.es, v.el, v.et, 2, P.n.e, q); this.envStep(v.es, v.el, v.et, 3, P.f.e, q);
        g1 = q[0]; g2 = q[1]; g3 = q[2]; gf = q[3];
      }
      // deltas: mask START -> 0, pitch START -> 0 (END after release), exponential, 1 % rest after T_D(SPD) (section 1.3)
      // the mask delta as whole steps away from 0 (the target is reached at T_D, where the 1 % rest is dropped)
      this.maskD(v, P.__d, 0); this.maskD(v, P.__d, 1); v.H[0] += dt; v.dm1 = this.tq[0] | 0; v.dm2 = this.tq[1] | 0;
      this.masks(v, mod);
      // pitch (semitones, A4 = 69 = TUNE): key through the temperament, SEMIs, TUNE, deltas, glide, bend, routes
      // the key through the temperament (inline: a returned double of a non-inlined call would be a heap number per step)
      const TT = TEMP[gl.tm] || TEMP.et, kn = v.n, kr = Math.round(kn), kc = ((kr % 12) + 12) % 12, kp = kr - kc + TT[kc] / 100 + (kn - kr) + gl.st, base = kp + (v.pg && this.ly.md !== 'ein' ? this.ly.semi + this.ly.tune / 100 : 0) + P.g.st + v.H[1] + v.H[2] + this.cV[0] * gl.pb + mod[0] + vm[0];
      const p1 = base + P.o1.st + P.o1.tu / 100 + mod[1], p2 = base + P.o2.st + P.o2.tu / 100 + mod[2];
      const f1 = gl.tn * Math.pow(2, (p1 - 69) / 12), f2 = gl.tn * Math.pow(2, (p2 - 69) / 12), s = 4294967296 / (16 * sr);
      v.H[3] = kp + v.H[2];
      // pitch delta and portamento: this step used the current values; on toward their targets (exponential, 1 % rest after T)
      v.H[1] = v.dpT + (v.H[1] - v.dpT) * Math.exp(-dt * LN100 / P.__d.td[2]); if (Math.abs(v.H[1] - v.dpT) < 1e-6) v.H[1] = v.dpT;
      if (v.H[2] !== 0) { const T = P.g.po > 0 ? .008 * Math.pow(1.6, P.g.po - 1) : 0; v.H[2] = T > 0 ? v.H[2] * Math.exp(-dt * LN100 / T) : 0; if (Math.abs(v.H[2]) < 1e-5) v.H[2] = 0; }
      v.Z[3] = Math.round(clamp(f1, 0, 8 * sr) * s); v.Z[4] = Math.round(clamp(f2, 0, 8 * sr) * s);
      const L1 = (P.o1.e.l / 99) * (P.o1.e.l / 99), L2 = (P.o2.e.l / 99) * (P.o2.e.l / 99), L3 = (P.n.e.l / 99) * (P.n.e.l / 99);
      D[6] = g1 * L1 * Math.max(0, 1 + mod[4] + vm[4]) * CSC; D[7] = g2 * L2 * Math.max(0, 1 + mod[5] + vm[5]) * CSC; D[8] = g3 * L3 * Math.max(0, 1 + mod[6] + vm[6]) * CSC;
      // the CIC integrators hold |sum| < 4 x CSC (2^31 / 8^5); level routes can push the gains beyond: scale all three together
      const gs = D[6] + D[7] + D[8]; if (gs > 3.9 * CSC) { const q = 3.9 * CSC / gs; D[6] *= q; D[7] *= q; D[8] *= q; }
      const fr = clamp(P.n.fr + mod[13] + vm[13], 0, 99); D[9] = Math.min(1, 30 * Math.pow(16 * sr / 30, fr / 99) / (16 * sr));
      // filter: CUTF + L x envelope (x velocity FEG) + routes, tracking of OSC1; TPT SVF coefficients for this step
      const cst = P.f.cu + P.f.e.l * v.vFeg * gf + mod[7] + vm[7];
      let fc = 20 * Math.pow(1000, cst / 99);
      if (P.f.tk) fc *= Math.pow(f1 / 261.6255653005986, P.f.tk / 100);
      fc = clamp(fc, 10, .45 * sr);
      const g = Math.tan(Math.PI * fc / sr), re = clamp(P.f.re, 0, 99), k = 1.414 * (1 - re / 99) - .012 * Math.pow(re / 99, 8);
      D[16] = g; D[17] = k; D[18] = 1 / (1 + g * (g + k)); D[19] = g * D[18]; D[20] = g * D[19]; v.fm = P.__d.fm;
      // level: VOL^2 x velocity (as the other synth engines: 1 - 0.6 + 0.6 v') x routes; pan: PANS + LFO
      const vo = (P.g.vo / 99) * (P.g.vo / 99), vg = (1 - .6 + .6 * v.velC) * v.vVol * Math.max(0, 1 + mod[3] + vm[3]);
      this.lyGP(v.pg);
      const pan = clamp(v.pan0 + mod[12] + this.tq[3], -1, 1), a = (pan + 1) * Math.PI / 4, out = vo * vg * OUTG * 2 * this.tq[2];   // x 2: the SVF input runs at 0.5
      D[10] = out * Math.cos(a); D[13] = out * Math.sin(a);
      const amp = D[6] + D[7] + D[8];
      if (!v.gate && amp === 0) v.quiet++; else v.quiet = 0;
      // test tap (section 5.3 bmTap): per control step [frame, slot, 4 envelopes, M1, M2, f1, fc, pitch 1, gain L, gain R]
      if (this.tapOn && this.tapK === 'ctl' && this.tapBuf && (this.tapAll || v.k === this.tapV || this.tapV < 0 && v.ord === this.ord) && this.tapN + 13 <= this.tapBuf.length) {
        const b = this.tapBuf; let i = this.tapN; b[i++] = this.frame + this.fi; b[i++] = v.k; b[i++] = v.eq[0]; b[i++] = v.eq[1]; b[i++] = v.eq[2]; b[i++] = v.eq[3];
        b[i++] = v.M1; b[i++] = v.M2; b[i++] = f1; b[i++] = fc; b[i++] = p1; b[i++] = D[10]; b[i++] = D[13]; this.tapN = i;
      }
    }
    // ---------------- render one voice over [a, b) ----------------
    renderVoice(v, L, R, i, e) {
      if (v.ghost) { this.run(v, L, R, i, e); if (v.D[11] <= 0) this.clearVoice(v); return; }
      if (v.quiet > 2 && v.kill === 0) this.runTail(v, L, R, i, e);
      else if (v.xw1 > 0 || v.xw2 > 0 || (this.tapOn && this.tapK === 'osc16' && v.k === this.tapV)) this.runX(v, L, R, i, e);
      else this.run(v, L, R, i, e);
    }
    // the control step of all voices (on the global 1 ms grid); the end of a voice is decided here (bit-exact whatever the
    // block phase): the fade done, or all amp envelopes at 0 for > 2 steps (decimator flushed) and the filter / DC tail under -140 dB
    ctlVoices(i) {
      this.fi = i;
      for (let k = 0; k < this.V.length; k++) {
        const v = this.V[k]; if (!v.on || v.ghost) continue;
        this.ctlVoice(v);
        if ((v.kill === 1 && v.D[11] < 1e-5) || (!v.gate && v.quiet > 2 && Math.abs(v.D[5]) + Math.abs(v.D[14]) + Math.abs(v.D[15]) < 1e-7)) this.endVoice(v);
      }
    }
    // the tail: the decimator is flushed (exact zeros); DC block and filter ring out
    runTail(v, L, R, i, e) {
      const D = v.D, comp = this.comp, c1 = 1 - 2 * comp, dcR = this.dcR, gL = D[10], gR = D[13], a1 = D[18], a2 = D[19], a3 = D[20], k = D[17], fm = v.fm;
      let dcy = D[5], cz1 = D[2], cz2 = D[3], dcx = D[4], f1 = D[14], f2 = D[15];
      for (; i < e; i++) {
        const yc = comp * cz2 + c1 * cz1; cz2 = cz1; cz1 = 0; dcy = yc - dcx + dcR * dcy; dcx = yc;
        const xs = .5 * dcy, v3 = xs - f2, v1 = a1 * f1 + a2 * v3, v2 = f2 + a2 * f1 + a3 * v3; f1 = 2 * v1 - f1; f2 = 2 * v2 - f2;
        if (f1 > SAT_T) { const u = (f1 - SAT_T) * SAT_I; f1 = SAT_T + SAT_W * (u > 3 ? 1 : u * (27 + u * u) / (27 + 9 * u * u)); } else if (f1 < -SAT_T) { const u = (-f1 - SAT_T) * SAT_I; f1 = -SAT_T - SAT_W * (u > 3 ? 1 : u * (27 + u * u) / (27 + 9 * u * u)); }
        const y = fm === 0 ? v2 : fm === 1 ? xs - k * v1 - v2 : fm === 2 ? v1 : xs - k * v1;
        L[i] += y * gL; R[i] += y * gR;
      }
      D[5] = Math.abs(dcy) < 1e-15 ? 0 : dcy; D[4] = dcx; D[2] = cz1; D[3] = cz2; D[14] = Math.abs(f1) < 1e-15 ? 0 : f1; D[15] = Math.abs(f2) < 1e-15 ? 0 : f2;
    }
    // fast path: no crossfade, no tap; phases as int32 (the same bits as uint32); kill 1 = exponential fade, 2 = linear 3 ms (crossfade)
    run(v, L, R, i, e) {
      const hbT = this.hbT, nT = hbT.length, hl = this.hl, hc = (hl - 1) >> 1, hb = v.hb, I = v.I, C = v.C, D = v.D, Z = v.Z, comp = this.comp, c1 = 1 - 2 * comp, dcR = this.dcR;
      let p1 = Z[0], p2 = Z[1]; const i1 = Z[3], i2 = Z[4], M1 = v.M1, M2 = v.M2, b1 = v.b1, b2 = v.b2, s1 = 32 - b1, s2 = 32 - b2;
      const G1 = D[6], G2 = D[7], G3 = D[8], ninc = D[9], gL = D[10], gR = D[13], n2 = G2 !== 0, n3 = G3 !== 0, i0 = i;
      const a1 = D[18], a2 = D[19], a3 = D[20], k = D[17], fm = v.fm, kill = v.kill, fd = D[12];
      let na = D[0], nz = D[1], rng = Z[2], hp = v.hp, cz1 = D[2], cz2 = D[3], dcx = D[4], dcy = D[5], f1 = D[14], f2 = D[15], fade = D[11];
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
        for (let kk = 0, o = 1; kk < nT; kk++, o += 2) y += hbT[kk] * (hb[q - o] + hb[q + o]);
        const yc = comp * (y + cz2) + c1 * cz1; cz2 = cz1; cz1 = y;
        dcy = yc - dcx + dcR * dcy; dcx = yc;
        // SVF (TPT), input x 0.5, the band state limited (self-oscillation at RESO 99)
        const xs = .5 * dcy, v3 = xs - f2, v1 = a1 * f1 + a2 * v3, v2 = f2 + a2 * f1 + a3 * v3; f1 = 2 * v1 - f1; f2 = 2 * v2 - f2;
        if (f1 > SAT_T) { const u = (f1 - SAT_T) * SAT_I; f1 = SAT_T + SAT_W * (u > 3 ? 1 : u * (27 + u * u) / (27 + 9 * u * u)); } else if (f1 < -SAT_T) { const u = (-f1 - SAT_T) * SAT_I; f1 = -SAT_T - SAT_W * (u > 3 ? 1 : u * (27 + u * u) / (27 + 9 * u * u)); }
        let s = fm === 0 ? v2 : fm === 1 ? xs - k * v1 - v2 : fm === 2 ? v1 : xs - k * v1;
        if (kill !== 0) { s *= fade; if (kill === 2) { fade -= fd; if (fade < 0) fade = 0; } else fade *= fd; }
        L[i] += s * gL; R[i] += s * gR;
      }
      if (!n2) p2 = (p2 + Math.imul(i2, 16 * (e - i0))) | 0;
      Z[0] = p1; Z[1] = p2; Z[2] = rng; D[0] = na; D[1] = nz; v.hp = hp; D[2] = cz1; D[3] = cz2; D[11] = fade;
      D[4] = dcx; D[5] = Math.abs(dcy) < 1e-15 ? 0 : dcy; D[14] = Math.abs(f1) < 1e-15 ? 0 : f1; D[15] = Math.abs(f2) < 1e-15 ? 0 : f2;
      I[0] = I0; I[1] = I1; I[2] = I2; I[3] = I3; I[4] = I4; C[0] = C0; C[1] = C1; C[2] = C2; C[3] = C3; C[4] = C4;
    }
    // slow path: MASK crossfade (10 ms) and the 16x test tap; otherwise the same arithmetic as run()
    runX(v, L, R, i, e) {
      const hbT = this.hbT, nT = hbT.length, hl = this.hl, hc = (hl - 1) >> 1, hb = v.hb, I = v.I, C = v.C, D = v.D, Z = v.Z, comp = this.comp, c1 = 1 - 2 * comp, dcR = this.dcR;
      const tap16 = this.tapOn && this.tapK === 'osc16' && v.k === this.tapV ? this.tapBuf : null;
      let p1 = Z[0], p2 = Z[1]; const i1 = Z[3], i2 = Z[4], M1 = v.M1, M2 = v.M2, b1 = v.b1, b2 = v.b2, s1 = 32 - b1, s2 = 32 - b2;
      const G1 = D[6], G2 = D[7], G3 = D[8], ninc = D[9], gL = D[10], gR = D[13];
      const X1 = v.X1, xb1 = v.xb1, xs1 = 32 - xb1, X2 = v.X2, xb2 = v.xb2, xs2 = 32 - xb2;
      const a1 = D[18], a2 = D[19], a3 = D[20], k = D[17], fm = v.fm, kill = v.kill, fd = D[12];
      let na = D[0], nz = D[1], rng = Z[2], hp = v.hp, cz1 = D[2], cz2 = D[3], dcx = D[4], dcy = D[5], f1 = D[14], f2 = D[15], fade = D[11];
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
        for (let kk = 0, o = 1; kk < nT; kk++, o += 2) y += hbT[kk] * (hb[q - o] + hb[q + o]);
        const yc = comp * (y + cz2) + c1 * cz1; cz2 = cz1; cz1 = y;
        dcy = yc - dcx + dcR * dcy; dcx = yc;
        const xs = .5 * dcy, v3 = xs - f2, v1 = a1 * f1 + a2 * v3, v2 = f2 + a2 * f1 + a3 * v3; f1 = 2 * v1 - f1; f2 = 2 * v2 - f2;
        if (f1 > SAT_T) { const u = (f1 - SAT_T) * SAT_I; f1 = SAT_T + SAT_W * (u > 3 ? 1 : u * (27 + u * u) / (27 + 9 * u * u)); } else if (f1 < -SAT_T) { const u = (-f1 - SAT_T) * SAT_I; f1 = -SAT_T - SAT_W * (u > 3 ? 1 : u * (27 + u * u) / (27 + 9 * u * u)); }
        let s = fm === 0 ? v2 : fm === 1 ? xs - k * v1 - v2 : fm === 2 ? v1 : xs - k * v1;
        if (kill !== 0) { s *= fade; if (kill === 2) { fade -= fd; if (fade < 0) fade = 0; } else fade *= fd; }
        L[i] += s * gL; R[i] += s * gR;
      }
      Z[0] = p1; Z[1] = p2; Z[2] = rng; D[0] = na; D[1] = nz; v.hp = hp; D[2] = cz1; D[3] = cz2; D[11] = fade;
      D[4] = dcx; D[5] = Math.abs(dcy) < 1e-15 ? 0 : dcy; D[14] = Math.abs(f1) < 1e-15 ? 0 : f1; D[15] = Math.abs(f2) < 1e-15 ? 0 : f2;
      I[0] = I0; I[1] = I1; I[2] = I2; I[3] = I3; I[4] = I4;
    }
    // the held keys without a sounding voice of their own (left by a mono voice) end with a stop / panic
    held(v) { const S = this.S[v.pg] || this.S[0]; for (let i = 0; i < S.keys.length; i++) if (S.keys[i].id === v.id && v.id !== -1) return true; return false; }
    endKeys(S) { for (let i = 0; i < S.keys.length; i++) { const k = S.keys[i]; let has = false; for (const v of this.V) if (v.on && !v.ghost && v.id === k.id) has = true; if (!has) this.endId(k.n, k.id); } }
    // the layer twin: the other program's voice of the same key (two voices of one program never hold back an 'end')
    twin(v) { if (v.id === -1) return false; for (let k = 0; k < this.NV; k++) { const x = this.V[k]; if (x !== v && x.on && !x.ghost && x.pg !== v.pg && x.id === v.id) return true; } return false; }
    endVoice(v) {
      if (!v.ghost && !this.twin(v)) this.sendEnd(v); this.clearVoice(v);   // a layered key: 'end' when its last voice ends
    }
    // one 'end' per note id: the ids already ended sit in a ring (the last 512; ids are unique from the host)
    sendEnd(v) { if (!this.twin(v)) this.endId(v.n, v.id); }
    endId(n, id) {
      if (id === -1 || id == null) return; const E = this.endR;
      for (let i = 0; i < E.length; i++) if (E[i] === id) return;
      E[this.endP] = id; this.endP = (this.endP + 1) & 511; this.port.postMessage({t: 'end', n, id});
    }
    seg(L, R, a, b) {
      if (b <= a) return; const V = this.V;
      if (this.pbL[0].length < b) for (let p = 0; p < 2; p++) { this.pbL[p] = new Float32Array(b); this.pbR[p] = new Float32Array(b); }
      const two = !!this.P[1];
      for (let p = 0; p < (two ? 2 : 1); p++) { this.pbL[p].fill(0, a, b); this.pbR[p].fill(0, a, b); }
      for (let k = 0; k < V.length; k++) {
        const v = V[k]; if (!v.on) continue;
        const pg = two ? v.pg : 0, pL = this.pbL[pg], pR = this.pbR[pg];
        this.renderVoice(v, pL, pR, a, b);
        // finite check (rule 17): a voice with NaN / Inf goes silent and is set anew
        if (v.on && !(isFinite(v.D[5]) && isFinite(v.D[14]) && isFinite(v.D[15]))) { for (let i = a; i < b; i++) { if (!isFinite(pL[i])) pL[i] = 0; if (!isFinite(pR[i])) pR[i] = 0; } this.endVoice(v); }
      }
      // FX1 per program (type from A, BAL of the program), the sum, FX2 (type and BAL from A; TIME FX OFF bypasses DL / RV)
      const A = this.P[0];
      for (let p = 0; p < (two ? 2 : 1); p++) {
        const P = this.P[p], mod = this.S[p].mod, pL = this.pbL[p], pR = this.pbR[p];
        const t = this.fxType(A.__d.f1, A.__d.n1, this.S[0].mod[18]), bal = t ? clamp(num(P.fx.b1, 0) + mod[20], 0, 100) / 100 : 0;
        if (t) this.fx1[p].setType(t);
        this.fx1[p].process(pL, pR, a, b, bal);
        for (let i = a; i < b; i++) { L[i] += pL[i]; R[i] += pR[i]; }
      }
      const mod = this.S[0].mod, t2 = this.fxType(A.__d.f2, A.__d.n2, mod[19]);
      let b2 = t2 ? clamp(num(A.fx.b2, 0) + mod[21], 0, 100) / 100 : 0;
      if (t2 && !this.gl.tf && (A.__d.f2 === 4 || A.__d.f2 === 5)) b2 = 0;
      if (t2) { this.fx2.setType(t2); this.fx2.par.sy = A.fx.sy ? 1 : 0; this.fx2.par.bpm = this.bpm; }
      this.fx2.process(L, R, a, b, b2);
    }
    // the type a FX slot plays: the stored type (parsed in prep), LFO steps inside its family (n 1..16); '' = none
    fxType(fam, n0, m) { if (fam < 0) return ''; const n = m ? clamp(n0 + Math.round(m), 1, 16) : n0; return FXN[fam][n]; }
    process(ins, outs) {
      // the own time is taken every 4th quantum (each clock read makes a heap number: rule 16) and counted 4 times
      const tq = (this.qn++ & 3) === 0, t0 = tq ? (this.hasPerf ? performance.now() : Date.now()) : 0;
      const o = outs[0], L = o[0], R = o[1] || o[0], N = L.length, sr = this.sr, tb = currentTime;
      let i0 = 0;
      for (;;) {
        // the next boundary: an event, a global control step, or the block end
        let k = N, ev = false;
        if (this.q.length && this.q[0].at < tb + (N - .5) / sr) { k = Math.round((this.q[0].at - tb) * sr); k = k < i0 ? i0 : k > N ? N : k; ev = true; }
        const gk = i0 + this.gc;
        if (gk <= k && gk < N) { k = gk; ev = false; }
        if (k > i0) { if (!this.idle) this.seg(L, R, i0, k); this.gc -= k - i0; i0 = k; }
        if (ev) {
          const e = this.q.shift();
          this.fi = i0; if (this.idle) { this.wake(); this.idle = false; } this.ev(e); this.idle = this.isIdle();
          if (e.k === 1 && this.tapOn && this.tapV < 0) for (const v of this.V) if (v.on && !v.ghost && v.ord === this.ord) this.tapV = v.k;
          continue;
        }
        if (i0 >= N) break;
        if (this.gc <= 0) { const id = this.idle && this.isIdle(); this.ctlGlobal(id); this.idle = id || this.isIdle(); if (!this.idle) { this.wake(); this.ctlVoices(i0); } this.gc = this.ctlN; }
      }
      if (this.late) { this.port.postMessage({t: 'late', n: this.late}); this.late = 0; }
      this.frame += N;
      if (tq) { const dq = (this.hasPerf ? performance.now() : Date.now()) - t0; this.busy += 4 * dq; if (dq > this.qMax) this.qMax = dq; } this.busyN += N;
      if (this.frame - this.lastRep >= sr) {
        this.port.postMessage({t: 'load', v: this.busy / (this.busyN / sr * 1000), nv: this.countActive(), q: this.qMax});
        this.lastRep = this.frame; this.busy = 0; this.busyN = 0; this.qMax = 0;
      }
      return true;
    }
  }
  return {BmProc, SIN, bitsOf, TX, TD, HB27, HB31, progInit, TEMP, TG, FxUnit, FxSlot, dlSync};
})();
registerProcessor('synq-bm', BMK.BmProc);
