/* ===== I3c/I3d + I1f (Nachtrag 8): the always-loaded part – the LFO page writes a drawn form, the form sheet and
   the TILT logic load on first need (formLoad / srLoad), the test API. ===== */
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
// the native LFO (WT, ECO, ?engine=native) has no drawn buffer yet (I3a native part open, STATUS): it plays the triangle there
LFO_FX_SHAPE[5] = 'triangle';
// the form of LFO n of track i (§3.2, §4.2 b): stored as a copy, A/B and dirty marks like setP, the table to the engine
function lfoFormWrite(i, n, f) {
  const snd = sndOf(i); if (!snd) return;
  if (UI.ab && UI.ab.t === i && UI.ab.side === 'B') UI.ab = null;
  snd.p['l' + n + 'f'] = f; wkLf(i, n, f);
  UI.sndVer++; UI.dirty.strip = true; markDirty();
  if (R.editor === 'synth' && i === R.selT) edParamChanged('l' + n + 'f');
}
// ✎ on the LFO page (§6.2): shape 5 (TAKT 1/1 when FREI), with the start form when there is none yet; the caller makes the undo
function lfoDrawn(i, n, start) {
  const snd = sndOf(i); if (!snd) return; const p = snd.p, pre = 'l' + n;
  if (start) lfoFormWrite(i, n, start);
  const wasFree = !(p[pre + 'sync'] > 0);
  if (wasFree) setP(i, pre + 'sync', 4);
  if (p[pre + 'shape'] !== 5) {         // setP keeps the stored range 0..4 of the controls; 5 is written here (I3a: PD 0..5)
    if (UI.ab && UI.ab.t === i && UI.ab.side === 'B') UI.ab = null;
    p[pre + 'shape'] = 5; liveUpdate(i, pre + 'shape'); UI.sndVer++; UI.dirty.strip = true; markDirty();
    if (R.editor === 'synth' && i === R.selT) edParamChanged(pre + 'shape');
  }
  if (wasFree && R.editor === 'synth' && i === R.selT) safeRebuild(buildSynthEd);   // the Takt knob instead of the rate knob
}
// the form sheet for a target ({kind: 'lfo', i, n}); while TEACH-IN (I1) runs, the sheet stays shut (§6.2)
function formOpen(tg) {
  if (R.sr && R.sr.cap) { if (ED.lcd) lcdShow('Form', 'Form im Grundklang malen (nach dem Vormachen)'); else toast('Form im Grundklang malen (nach dem Vormachen)'); return false; }
  if (!formLoad()) { toast('Form-Blatt konnte nicht laden'); return false; }
  return FUI.open(tg);
}
SYNQUENZER.form = {
  get: (i, n) => { const s = sndOf(i); return s && s.p['l' + n + 'f'] ? JSON.parse(JSON.stringify(s.p['l' + n + 'f'])) : null; },
  set: (i, n, f) => { const g = FORM.norm(f); if (!g) throw new Error('Form ungültig'); const b = soundSnapshot(i); lfoFormWrite(i, n, g); commitSound(i, b, 'LFO ' + n + ' Form'); return JSON.parse(JSON.stringify(g)); },
  eval: (f, ph, e, o) => FORM.eval(f, ph, e, o),
  norm: f => FORM.norm(f),
  lib: () => FORM.lib(),
  mine: () => null,                                        // „Meine Formen“ only after F5 = yes
  put: () => { throw new Error('Einsetzen kommt mit I3e'); },
  ride: () => { throw new Error('Kurve der Fahrt kommt mit I3f'); },
  load: () => formLoad(),
  raster: (zyk, g) => (formLoad() ? FORMCLEAN.raster(zyk, g) : null),
  // clean (§5.2): points [[u, y], …] of one stroke (u 0..768, y -1000..1000) on the form prev (null = none)
  clean: (pts, o) => { if (!formLoad()) return null; o = o || {}; const raw = FORMCLEAN.newRaw(), r = FORMCLEAN.paint(raw, pts);
    const R_ = FORMCLEAN.raster(o.zyk || 4, o.grid || .25); return FORMCLEAN.clean(raw, r.u0, r.u1, o.prev || null, {lines: R_.lines, Z: R_.Z, on: o.on !== false}); },
  open: (i, n) => formOpen({kind: 'lfo', i: i == null ? R.selT : i, n: n || 1}),
  abort: () => formAbort('api'),
  state: () => (FORML.loaded ? FUI.state() : {open: false}),
  info: () => ({stub: false, loaded: FORML.loaded, loadMs: FORML.ms, err: FORML.err, lfMiss: AU.synth.reduce((a, E) => a + (E && E.lfMiss || 0), 0)}),
  // spy on haptic(): kind, time and the event type that called it (A.8 H2: never pointermove / deviceorientation / timers)
  hapSpy: on => {
    if (on === false) { if (window.__hapOrig) { haptic = window.__hapOrig; window.__hapOrig = null; } return window.__hapLog || []; }
    if (!window.__hapOrig) { const h0 = haptic; window.__hapOrig = h0; window.__hapLog = []; haptic = k => { window.__hapLog.push({k, t: performance.now(), ev: window.event ? window.event.type : null, on: !!UI.haptics}); return h0(k); }; }
    return window.__hapLog;
  },
};
SYNQUENZER.sr = SYNQUENZER.sr || {};
// I1f (§6.9): the TILT logic for the tests (block sq-sr-src loads on first use); the field itself comes with I1d
SYNQUENZER.sr.neigen = {
  load: () => srLoad(),
  ref: () => (srLoad() ? NEIGEN.ref() : null), angle: () => (srLoad() ? NEIGEN.angle() : null),
  state: () => (srLoad() ? NEIGEN.state() : null), info: () => (srLoad() ? NEIGEN.info() : null),
};

/* ---- I1c (B.1 6.9): test API of the super knob core and the clip states; no surface (the field comes with I1d) ---- */
const srEngQ = i => new Promise(res => { const E = AU.synth[i]; if (!E) return res(null); E.n8qCb = res; E.n8({n8q: 1}); setTimeout(() => res(E.n8qLast || null), 500); });
Object.assign(SYNQUENZER.sr, {
  get: () => ({S: S.sr ? JSON.parse(JSON.stringify(S.sr)) : null, x: R.sr.x, xs: R.sr.xs, drive: R.sr.drive ? Object.assign({}, R.sr.drive) : null, hand: R.sr.hand, cap: R.sr.cap ? {p: R.sr.cap.p, sc: R.sr.cap.sc, t: R.sr.cap.t} : null}),
  // the hand: one gesture = one undo step (start / move / end); x alone = a whole gesture
  set: (x, phase) => { if (!S.sr) S.sr = srNorm({x: R.sr.x}, S.tracks); if (phase) srHand(x, 'bar', phase); else { srHand(R.sr.x, 'bar', 'start'); srHand(x, 'bar', 'end'); } return R.sr.x; },
  // a target written directly (tests; the surface makes them by teach-in): {p, u: {uid: {c, d}}}
  target: (z, label) => srEdit(label || 'Ziel gesetzt', () => { const o = S.sr ? JSON.parse(JSON.stringify(S.sr)) : {v: 1, x: R.sr.x, sc: 'all', z: []};
    o.z = o.z.filter(q => Math.abs(q.p - z.p) > .05).concat([z]); S.sr = srNorm(o, S.tracks); return S.sr; }),
  drop: p => srEdit('Ziel gelöscht', () => { if (!S.sr) return false; S.sr.z = S.sr.z.filter(q => Math.abs(q.p - p) > .05); return true; }),
  clear: () => srEdit('Super-Regler gelöscht', () => { delete S.sr; return true; }),
  capture: (scope, t) => srCapture(scope, t), keep: () => srCapEnd(true), cancel: () => srCapEnd(false),
  drive: (x1, t0, t1) => srDriveTo(x1, t0, t1, 'matrix'), stop: () => srDriveStop(true),
  eff: (i, key, t) => heardAt(i, key, t), path: (i, key, x) => srPathOf(i, key, x), desc: k => { const D = srDesc(k); return D ? {k: D.k, law: D.law, lo: D.lo, hi: D.hi, kk: D.kk, fam: D.fam, l: D.l, vals: D.vals || null} : null; },
  get_: (i, k) => srGet(S.tracks[i], k), set_: (i, k, v) => srSet(S.tracks[i], k, v), tab: i => srTabOf(i), msg: i => srMsgOf(i, false),
  del: (i, key) => { const e = k1Mods(i).find(x => x.key === 'sr:' + key); return e ? n8K1Del(i, e) : false; },
  need: () => needCalc(S), core: () => SRCORE, eng: i => srEngQ(i),
  // worklet hooks (__srProbe / __morphProbe): per render quantum of track i while on
  probe: (i, on) => { const E = AU.synth[i]; if (!E) return null; if (on) { E.srpLog = []; E.mopLog = []; } E.n8({srProbe: !!on, moProbe: !!on}); return on ? true : {sr: E.srpLog || [], mo: E.mopLog || []}; },
  log: i => { const E = AU.synth[i]; return E ? {sr: (E.srpLog || []).slice(), mo: (E.mopLog || []).slice()} : null; },
});
SYNQUENZER.st = {
  get: (t, s) => { const c = S.tracks[t] && S.tracks[t].clips[s]; return c && c.st ? JSON.parse(JSON.stringify(c.st)) : null; },
  set: (t, s, st) => { const c = S.tracks[t] && S.tracks[t].clips[s]; if (!c) return null; const before = cleanClip(c); const n = st ? stNorm(st) : null; if (n) c.st = n; else delete c.st; pushUndo(t, s, before, n ? 'Klangzustand gesetzt' : 'Klangzustand gelöscht'); markDirty(); return n; },
  run: t => (R.st[t] ? {t0: R.st[t].t0, t1: R.st[t].t1, at: R.st[t].at, keys: R.st[t].keys.slice(), to: Object.assign({}, R.st[t].to)} : null),
  at: (t, key, time) => stValAt(t, key, time == null ? now_() : time),
};
