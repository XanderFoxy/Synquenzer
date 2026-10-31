/* ===== I3c/I3d + I1f (Nachtrag 8, branch i3-br-U): the always-loaded part – the LFO page writes a drawn form, the form sheet and
   the TILT logic load on first need (formLoad / srLoad), the test API. ===== */
// PLACEHOLDER until I3a: the worklet and the native LFO know shape 5 only with I3a; here a drawn LFO sounds as the triangle
// (rule §3.2 / §4.2 „form 5 without its table“). Projects without shape 5 send byte-equal messages (nothing is changed then).
LFO_FX_SHAPE[5] = 'triangle';
if (FORM.stub) {
  const wkFlat0 = wkFlat, wkSet0 = wkSet;
  wkFlat = snd => { const o = wkFlat0(snd); if (o.l1shape === 5) o.l1shape = 1; if (o.l2shape === 5) o.l2shape = 1; return o; };
  wkSet = (i, key, v) => wkSet0(i, key, (key === 'l1shape' || key === 'l2shape') && v === 5 ? 1 : v);
}
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
  info: () => ({stub: !!FORM.stub, loaded: FORML.loaded, loadMs: FORML.ms, err: FORML.err, sent: FORMSENT.slice(-64)}),
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
