/* ND1 ===== drum model engine (Nachtrag 6): main-thread side of the worklet 'synq-md' (source: script#sq-md-src) =====
   MD_NAME is the one writing of the engine's display name (section 0.4). Nothing here runs or loads by itself: the module is
   added to an AudioContext only when MDX.load(ctx) is called (ND4: when a pad gets source md or a loaded project has one),
   so projects without model pads load and sound exactly as before (rule 28).
   MDX.load(ctx) -> Promise<bool>        addModule (Blob URL, then data: URL; source is ASCII), once per context
   MDX.node(ctx, dest) -> E               one AudioWorkletNode per drum track (0 inputs, 1 stereo output -> dest); on an
                                          OfflineAudioContext the node gets no CPU-limiter stage and is not counted in cpuLoad
     E.ch(i, p) · E.kit(p) · E.hit(list) (batched per task; item {ch, at, v, acc, tune, dec, id?}) · E.cancel(ids) · E.mute(ch, solo)
     E.stop(at, tau) · E.panic() · E.reset()
     E.lim(stage) · E.test(msg) -> Promise(reply|null, by id, 2 s) · E.dispose(); E.load / E.nv / E.late (once per second)
     live hits: send at most 4096 ahead (worklet queue); MDX.render splits long patterns by itself
   MDX.render(o) -> Promise<{l, r}>       offline render through the same module (tests, video VV1, freeze FR1); a node for an
                                          OfflineAudioContext gets its first messages as processorOptions.init (deterministic)
   MDX.norm(p) / MDX.normKit(p)           every m* value clamped to its range, codes checked, missing = INIT; only for model
                                          programs (src md) - the drum voice uses mDec/mLvl with other meanings (see CHANGES Q4)
   MDX.INIT / MDX.KIT0 / MDX.R            INIT SOUND, kit effects, ranges; scales T G fN fE Q, VERH, VERST, dlyTime, dlBForTime
   MDX.scl(code, start, n)                SCL PRE: the pitches of n model channels from the lowest one (not stored)
   MDX.info()                             state, load (fraction of real time), late hits, nodes (engineInfo().md) */
const MD_NAME = 'North';
const MDX = (() => {
  const L = {
    mWav: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 't1', 't2', 'F1', 'F2', 'F3', 'F4', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
      'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'P1', 'P2', 'P3', 'P4', 'C1', 'C2', 'C3', 'r1', 'r2'],
    mDm: ['E1', 'E2', 'E3', 'L', 'P', 'D'], mNdm: ['E1', 'E2', 'E3', 'L', 'G', 'D'], mNtyp: ['L1', 'L2', 'b1', 'b2', 'H1', 'H2', 'H3'],
    mCty: ['n1', 'n2', 'n3', 'P1', 'P2', 'P3', 'H1', 'H2', 'H3', 'C1', 'C2', 'C3'], mDty: ['dr', 'SA', 'rn'], mCrv: ['Li', 'L1', 'L2', 'L3', 'O1', 'O2'],
    rvT: ['ti', 'r1', 'r2', 'p1', 'p2', 'p3', 'p4', 'St', 'hA'], dlM: ['r', 'b'],
    scl: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7', 'P1', 'P2', 'H1', 'H2', 'H3', 'H4', 'H5', 'Av', 'bL']};
  // INIT SOUND (section ND4 data: the device names no values) and the kit effects (dlB 60 = quarter 120)
  const INIT = {src: 'md', mWav: 'A1', mSpc: 0, mFrq: 25, mDyf: 0, mDec: 20, mDm: 'E1', mDd: 20, mBnd: 0, mBt: 10, mPit: 45,
    mNres: 0, mNtyp: 'L1', mNfrq: 30, mNdyf: 0, mNdec: 15, mNdm: 'E1', mNdd: 15, mClv: 0, mCty: 'n1',
    mNlv: 0, mTlv: 40, mLvl: 40, mPan: 0, mEqf: 25, mEqg: 0, mDst: 0, mDty: 'dr', mRvb: 0, mDly: 0, mMono: 0, mCrv: 'Li', mName: '', mCat: ''};
  const KIT0 = {v: 1, rvT: 'r1', rvC: 0, dlR: 50, dlM: 'r', dlB: 60, dlF: 0};
  // numeric ranges [min, max, step]
  const R = {mSpc: [0, 99, 1], mFrq: [0, 50, 1], mDyf: [0, 9, 1], mDec: [0, 50, 1], mDd: [0, 50, 1], mBnd: [-50, 50, 1], mBt: [0, 50, 1], mPit: [0, 127.5, 0.1],
    mNres: [0, 20, 1], mNfrq: [0, 50, 1], mNdyf: [-9, 9, 1], mNdec: [0, 50, 1], mNdd: [0, 50, 1], mClv: [0, 50, 1],
    mNlv: [0, 50, 1], mTlv: [0, 50, 1], mLvl: [0, 50, 1], mPan: [-9, 9, 1], mEqf: [0, 50, 1], mEqg: [-9, 9, 1], mDst: [0, 50, 1], mRvb: [0, 50, 1], mDly: [0, 50, 1], mMono: [0, 1, 1],
    rvC: [-9, 9, 1], dlR: [0, 99, 1], dlB: [0, 470, 1], dlF: [0, 20, 1]};
  const snap = (v, r) => { v = +v; if (!Number.isFinite(v)) return null; v = Math.min(r[1], Math.max(r[0], v)); return r[2] < 1 ? Math.round(v * 10) / 10 : Math.round(v); };
  // a channel program: every m* value in range, codes from the lists, missing = INIT; unknown fields stay (rule 9)
  function norm(p) {
    const o = Object.assign({}, p || {});
    for (const k in INIT) {
      if (k === 'src') continue;
      if (L[k]) { if (!L[k].includes(o[k])) o[k] = o[k] === 'E' && k === 'mNdm' ? 'E1' : INIT[k]; }
      else if (R[k]) { const v = snap(o[k], R[k]); o[k] = v == null ? INIT[k] : v; }
      else if (typeof o[k] !== 'string') o[k] = INIT[k]; else o[k] = o[k].slice(0, 16);
    }
    return o;
  }
  function normKit(p) {
    const o = Object.assign({}, p || {}); o.v = 1;
    if (!L.rvT.includes(o.rvT)) o.rvT = KIT0.rvT; if (!L.dlM.includes(o.dlM)) o.dlM = KIT0.dlM;
    for (const k of ['rvC', 'dlR', 'dlB', 'dlF']) { const v = snap(o[k], R[k]); o[k] = v == null ? KIT0[k] : v; }
    return o;
  }
  // the m* values a channel message carries (flat, nothing else)
  function flat(p) { const o = {}; for (const k in INIT) if (k !== 'src') o[k] = p[k] == null ? INIT[k] : p[k]; return o; }
  // scales (section 1.2) and tables (section 1.15) - the same numbers the worklet uses
  const T = x => 0.004 * Math.pow(2500, x / 50), G = x => (x / 50) * (x / 50), fN = n => 30 * Math.pow(600, n / 50), fE = n => 40 * Math.pow(400, n / 50);
  const Q = r => 0.5 + 15.5 * (r / 20) * (r / 20), bendHT = (b, v) => Math.sign(b) * 48 * (b / 50) * (b / 50) * (0.3 + 0.7 * (v == null ? 1 : v)), hz = p => 440 * Math.pow(2, (p - 69) / 12);
  const VERH = [0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 1.41, 0.25, 1 / 3, 2 / 3, 0.75, 1.25, 4 / 3, 1.5, 5 / 3, 1.75, 2.25, 7 / 3, 2.5, 8 / 3, 3.5, 4.5, 5.5,
    0.707, 1.19, 1.483, 1.571, 1.593, 1.618, 1.732, 1.8, 1.98, 2.136, 2.236, 2.295, 2.38, 2.44, 2.546, 2.63,
    2.646, 2.653, 2.67, 2.718, 2.756, 2.917, 2.94, 3.142, 3.155, 3.236, 3.317, 3.5, 3.598, 3.606, 3.897, 5.404];
  for (let i = 0; i < 36; i++) VERH.push(0.125 * Math.pow(2, i * 0.2));
  const VERST = [0]; for (let i = 1; i <= 24; i++) VERST.push(0.02 * i); for (let i = 25; i <= 48; i++) VERST.push(i - 24); for (let i = 49; i <= 72; i++) VERST.push(-(i - 48)); for (let i = 73; i <= 99; i++) VERST.push(12 * Math.log2(VERH[i - 36]));
  // echo time: RATE 0..99 or the BPM dial 0..470 (quarter 60-179, eighth 90-179, sixteenth 90-300, then 0.050 ... 0.001 s)
  function dlyTime(K) { K = K || KIT0; if (K.dlM === 'b') { const b = Math.round(K.dlB); if (b < 120) return 60 / (60 + b); if (b < 210) return 30 / (90 + b - 120); if (b < 421) return 15 / (90 + b - 210); return 0.05 - 0.001 * (b - 421); }
    return 1.15 * Math.pow(0.01 / 1.15, K.dlR / 99); }
  function dlBInfo(b) { b = Math.round(b); if (b < 120) return {seg: 'q', bpm: 60 + b}; if (b < 210) return {seg: 'e', bpm: 90 + b - 120}; if (b < 421) return {seg: 's', bpm: 90 + b - 210}; return {seg: 't', sec: +(0.05 - 0.001 * (b - 421)).toFixed(3)}; }
  // TAP: mean of the last 3 intervals (s) -> the dial position whose time is nearest, quarters first (section 1.10)
  function dlBForTime(t) {
    let best = 60, bd = 1e9; for (let b = 0; b <= 470; b++) { const d = Math.abs(dlyTime({dlM: 'b', dlB: b}) - t); if (d < bd - 1e-12) { bd = d; best = b; } } return best;
  }
  function tap(times) { if (!times || times.length < 4) return null; const n = times.length, iv = [times[n - 1] - times[n - 2], times[n - 2] - times[n - 3], times[n - 3] - times[n - 4]]; return dlBForTime((iv[0] + iv[1] + iv[2]) / 3); }
  // SCL PRE (section 1.6): semitones above the start; chord / scale sets repeat per octave, the hang lists are fixed
  const SCL = {h1: [0, 4, 7], h2: [0, 3, 7], h3: [0, 4, 7, 11], h4: [0, 3, 7, 10], h5: [0, 5, 7], h6: [0, 7], h7: [0, 5, 10], P1: [0, 2, 4, 7, 9], P2: [0, 3, 5, 7, 10],
    Av: [0, 3, 4, 7, 8, 11], bL: [0, 3, 5, 6, 7, 10],
    H1: [0, 7, 8, 10, 12, 14, 15, 17, 19, 20, 22, 24], H2: [0, 7, 10, 12, 14, 15, 17, 19, 22, 24, 26, 27], H3: [0, 7, 8, 11, 12, 14, 15, 17, 19, 20, 23, 24],
    H4: [0, 3, 5, 7, 10, 12, 14, 15, 19, 22, 24, 26], H5: [0, 4, 7, 11, 12, 14, 16, 18, 19, 23, 24, 26]};
  function scl(code, start, n) {
    const S = SCL[code]; if (!S) return null; const fixed = code[0] === 'H', out = [];
    for (let i = 0; i < n; i++) { const st = fixed ? S[i % S.length] + 12 * Math.floor(i / S.length) : S[i % S.length] + 12 * Math.floor(i / S.length);
      out.push(Math.min(127.5, Math.max(0, Math.round((start + st) * 10) / 10))); }
    return out;
  }
  // channel order (section 0.3): slot order of the drum track, only pads with source md
  const ORDER = ['kick', 'snare', 'rim', 'clap', 'hatC', 'hatO', 'tomL', 'tomM', 'tomH', 'cym', 'perc', 'shaker'];
  /* ---------- loader (lazy, once per context) ---------- */
  const ST = {state: 'idle', how: null, err: null, ms: 0, adds: 0};
  const CTX = new WeakMap(), NODES = new Set();
  const src = () => { const el = document.getElementById('sq-md-src'); return el ? el.textContent : ''; };
  function load(ctx) {
    if (!ctx || !ctx.audioWorklet || typeof AudioWorkletNode !== 'function') { ST.state = 'failed'; ST.err = 'AudioWorklet nicht verfügbar'; return Promise.resolve(false); }
    if (CTX.has(ctx)) return CTX.get(ctx);
    const t0 = performance.now(), s = src(); ST.state = 'loading'; ST.adds++;
    const tries = [['blob', () => URL.createObjectURL(new Blob([s], {type: 'application/javascript'}))], ['data', () => 'data:application/javascript;base64,' + btoa(s)]];
    const go = i => { if (i >= tries.length) return Promise.reject(new Error('kein Ladeweg')); let url; try { url = tries[i][1](); } catch (e) { return go(i + 1); }
      return ctx.audioWorklet.addModule(url).then(() => { ST.how = tries[i][0]; if (ST.how === 'blob') try { URL.revokeObjectURL(url); } catch (e) {} }, () => go(i + 1)); };
    const p = go(0).then(() => { ST.state = 'ready'; ST.ms = performance.now() - t0; warm(ctx); return true; }, e => { ST.state = 'failed'; ST.err = String(e && e.message || e); CTX.delete(ctx); return false; });
    CTX.set(ctx, p); return p;
  }
  // NDSTAGE: warm-up once per live context. A silent second node (output through a gain 0) strikes every model, noise filter,
  // click table, dist type, decay shape, the hall and the echo one after the other (3 rounds of 12 channels, ~2 s), then it is
  // removed. V8 shares the compiled code inside the AudioWorkletGlobalScope, so the first bar of the real node runs warm
  // (measured in Chromium: 2-3 output underruns ~0.5 s after the first play without it, none with it). The real node's state
  // is untouched (own instance), offline contexts are never warmed (deterministic renders).
  function warm(ctx) {
    if (typeof OfflineAudioContext === 'function' && ctx instanceof OfflineAudioContext) return;
    try {
      const g = ctx.createGain(); g.gain.value = 0; g.connect(ctx.destination);
      const n = new AudioWorkletNode(ctx, 'synq-md', {numberOfInputs: 0, numberOfOutputs: 1, outputChannelCount: [2]}); n.connect(g); ST.warm = 'on';
      const W = L.mWav, NT = L.mNtyp, CT = L.mCty, DT = L.mDty, DM = L.mDm, NM = L.mNdm, N = ORDER.length, R = 3, gap = 0.045, round = N * gap + 0.15;
      const prog = (r, i) => { const k = r * N + i; return flat(norm({mWav: W[k % W.length], mSpc: (k * 29) % 100, mFrq: 30, mDec: 12, mDm: DM[k % DM.length], mBnd: k % 2 ? 12 : -8, mBt: 8, mPit: 40 + (k % 40),
        mNlv: 20, mNtyp: NT[k % NT.length], mNres: 4, mNdyf: 2, mNdec: 10, mNdm: NM[k % NM.length], mClv: 20, mCty: CT[k % CT.length], mDst: 12, mDty: DT[k % DT.length], mEqg: 3, mRvb: 12, mDly: 8, mCrv: L.mCrv[k % L.mCrv.length]})); };
      const send = r => { if (ST.warm !== 'on') return; for (let i = 0; i < N; i++) n.port.postMessage({t: 'ch', ch: i, p: prog(r, i)});
        const t = ctx.currentTime + 0.05, list = []; for (let i = 0; i < N; i++) list.push({ch: i, at: t + i * gap, v: 0.6 + 0.1 * (i % 4), acc: i % 3 ? 0 : 0.5, tune: 0, dec: 1}); n.port.postMessage({t: 'hit', list}); };
      n.port.postMessage({t: 'kit', p: normKit({rvT: 'hA', rvC: 3, dlR: 40, dlF: 10})});
      for (let r = 0; r < R; r++) setTimeout(() => send(r), r * round * 1000);
      setTimeout(() => { ST.warm = 'done'; try { n.port.postMessage({t: 'panic'}); n.disconnect(); g.disconnect(); } catch (e) {} }, (R * round + 0.4) * 1000);
    } catch (e) { ST.warm = 'failed'; }
  }
  function node(ctx, dest) {
    const n = new AudioWorkletNode(ctx, 'synq-md', {numberOfInputs: 0, numberOfOutputs: 1, outputChannelCount: [2]});
    if (dest) n.connect(dest);
    // an OfflineAudioContext node (VV1 / FR1) never gets the live CPU limiter and does not count in cpuLoad (ND1 item 7, ND4-10)
    const offline = typeof OfflineAudioContext === 'function' && ctx instanceof OfflineAudioContext;
    const E = {node: n, ctx, offline, load: 0, nv: 0, late: 0, dead: false, q: [], queued: false, waits: new Map(), tid: 0, lastLim: 0, errT: -1e9};
    n.port.onmessage = e => { const m = e.data; if (!m) return;
      if (m.t === 'load') { E.load = m.v; E.nv = m.nv; } else if (m.t === 'late') E.late = m.n;
      else if (m.t === 'test') { const w = E.waits.get(m.id); if (w) { E.waits.delete(m.id); w(m); } }
      else if (m.t === 'err' && typeof logErr === 'function') { const now = performance.now(); if (now - E.errT >= 5000) { E.errT = now; logErr(new Error(MD_NAME + ': ' + (m.ch >= 0 ? 'Kanal ' + (m.ch + 1) + ' ' : '') + m.msg)); } } };
    const post = m => { if (!E.dead) n.port.postMessage(m); };
    E.flush = () => { E.queued = false; if (E.q.length) { post({t: 'hit', list: E.q}); E.q = []; } };
    E.ch = (i, p) => { E.flush(); post({t: 'ch', ch: i, p: flat(p)}); };
    E.kit = p => { E.flush(); post({t: 'kit', p: normKit(p)}); };
    E.hit = list => { if (E.dead) return; for (const h of list) E.q.push(h); if (!E.queued) { E.queued = true; queueMicrotask(E.flush); } };
    E.mute = (ch, solo) => post({t: 'mute', ch, solo: solo || null});
    E.stop = (at, tau) => { E.flush(); post({t: 'stop', at, tau}); };
    E.panic = () => { E.q = []; post({t: 'panic'}); };
    // NDSTAGE (ND4): drop planned hits by id - still batched here, or already queued in the worklet
    E.cancel = ids => { if (!ids || !ids.length) return; const S = new Set(ids); E.q = E.q.filter(h => !S.has(h.id)); post({t: 'cancel', ids: [...S]}); };
    E.reset = () => { E.flush(); post({t: 'reset'}); };
    E.lim = s => { if (E.offline) return; E.lastLim = s | 0; post({t: 'lim', s: s | 0}); };
    // test API: every request carries an id, the worklet always answers with it; null after 2 s, on a closed context or after dispose
    E.test = m => new Promise(res => { if (E.dead || (ctx.state === 'closed')) { res(null); return; } const id = ++E.tid; E.waits.set(id, res); E.flush(); post(Object.assign({t: 'test', id}, m));
      setTimeout(() => { if (E.waits.has(id)) { E.waits.delete(id); res(null); } }, 2000); });
    E.dispose = () => { if (E.dead) return; E.flush(); E.dead = true; NODES.delete(E); n.port.onmessage = null; for (const w of E.waits.values()) w(null); E.waits.clear(); try { n.disconnect(); } catch (e) {} };
    if (!offline) { NODES.add(E); try { if (typeof LIM !== 'undefined' && LIM.level) E.lim(LIM.level); } catch (e) {} }
    return E;
  }
  // offline render: o = {sr, sec, chans: {i: program}, kit, hits: [{ch, at, v, acc, tune, dec}], msgs: [[t, msg]], tap, lim}
  async function render(o) {
    o = o || {}; const sr = o.sr || 48000, sec = o.sec || 2, oc = new OfflineAudioContext(2, Math.round(sec * sr), sr);
    await oc.audioWorklet.addModule('data:application/javascript;base64,' + btoa(src()));
    const init = [];   // first messages through processorOptions: applied before the first block (port messages could come late)
    if (o.kit) init.push({t: 'kit', p: normKit(o.kit)});
    for (const k in (o.chans || {})) init.push({t: 'ch', ch: +k, p: flat(norm(o.chans[k]))});
    if (o.tap != null) init.push({t: 'test', tap: o.tap}); if (o.lim) init.push({t: 'lim', s: o.lim});
    init.push({t: 'reset'});
    // messages at render-quantum starts: the one containing t (floor), clamped into the render; t 0 goes with the first messages
    const len = Math.round(sec * sr), last = Math.max(0, Math.floor((len - 1) / 128) * 128), at = new Map();
    const put = (f, m) => { if (f <= 0) { init.push(m); return; } if (!at.has(f)) at.set(f, []); at.get(f).push(m); };
    // hits in 1-s windows, each sent half a second ahead (the worklet queue holds 4096; a long pattern never overflows it)
    if (o.hits && o.hits.length) { const H = o.hits.slice().sort((a, b) => a.at - b.at), W = new Map(); for (const h of H) { const k = Math.max(0, Math.floor(h.at)); if (!W.has(k)) W.set(k, []); W.get(k).push(h); }
      for (const [k, L] of W) put(k === 0 ? 0 : Math.min(last, Math.floor((k - 0.5) * sr / 128) * 128), {t: 'hit', list: L}); }
    for (const [t, m] of o.msgs || []) put(Math.min(last, Math.floor(t * sr / 128 + 1e-9) * 128), m);
    const n = new AudioWorkletNode(oc, 'synq-md', {numberOfInputs: 0, numberOfOutputs: 1, outputChannelCount: [2], processorOptions: {init}}); n.connect(oc.destination);
    const post = m => n.port.postMessage(m);
    for (const [f, L] of at) oc.suspend(f / sr).then(() => { post(L.length === 1 ? L[0] : {t: 'all', list: L}); oc.resume(); }).catch(() => {});   // one message per suspend (Chromium applied only the first of several)
    const b = await oc.startRendering(); return {l: b.getChannelData(0), r: b.getChannelData(1)};
  }
  const load1 = () => { let s = 0; for (const E of NODES) s += E.load || 0; return s; };
  function setLim(s) { for (const E of NODES) if (E.lastLim !== (s | 0)) E.lim(s); }   // live nodes only (offline nodes are not in NODES)
  function info() { let late = 0, nv = 0; for (const E of NODES) { late += E.late; nv += E.nv; } return {name: MD_NAME, state: ST.state, how: ST.how, err: ST.err, loadMs: Math.round(ST.ms), warm: ST.warm || null, adds: ST.adds, nodes: NODES.size, load: +load1().toFixed(4), voices: nv, late}; }
  return {NAME: MD_NAME, L, R, INIT, KIT0, ORDER, VERH, VERST, SCL, T, G, fN, fE, Q, bendHT, hz, norm, normKit, flat, dlyTime, dlBInfo, dlBForTime, tap, scl,
    load, node, render, info, setLim, nodes: NODES, cpu: load1, src};
})();
window.MDX = MDX;
