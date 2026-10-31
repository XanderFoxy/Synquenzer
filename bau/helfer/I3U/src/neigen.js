/* ---- I1f TILT logic (Nachtrag 8 B.1 §6.7): permission, sensor check, exact tilt angle, thumb clutch. No visible part; the
   field of I1d calls tap() in its click handler, attach(el) on its button and open()/close() with the field. Never calls
   haptic() (A.8 H2). Position goes out through NEIGEN.hooks (I1c: srHand). ---- */
const NEIGEN = (() => {
  const TXT = {
    ok: 'Daumen halten und kippen',
    denied: 'Bewegung nicht erlaubt. Safari merkt sich das – Tab schließen und die Seite neu öffnen; hilft das nicht, Safari ganz beenden.',
    nosensor: 'Kein Bewegungssensor',
    iframe: 'Neigen geht nur auf der Webseite in Safari',
    noreply: 'Sensor antwortet nicht',
    asking: '', idle: ''};
  const D2R = Math.PI / 180, DEAD = 1.5, FULL = 30, TAU = 40, REF_BEFORE = 50, REF_WAIT = 300, PROBE = 500, SEND_MS = 1000 / 60;
  let st = 'idle', opened = false, listening = false, visL = false, nList = 0, probeT = 0;
  // rotation work space (no allocation per event)
  const Rr = new Float64Array(9), Rn = new Float64Array(9), last = new Float64Array(4);   // last valid event: alpha beta gamma time
  let hasLast = false, oriL = false;
  const H = {on: false, pid: -1, el: null, refOk: false, ang: 0, xRef: 0, th: 0, ths: 0, tPrev: 0, tSend: -1e9, x: 0, waitT: 0, tickT: 0, tDown: 0};
  const work = new Float64Array(64); let wi = 0, wn = 0;
  const cnt = {start: 0, move: 0, end: 0, events: 0};

  const hooks = {
    _x: 0,
    get: () => (typeof srGet === 'function' && srGet.length === 0 ? +srGet() || 0 : hooks._x),
    hand: (x, phase) => { if (typeof srHand === 'function') srHand(x, 'neigen', phase); else hooks._x = x; }};

  // R = Rz(alpha) · Rx(beta) · Ry(gamma) (W3C, intrinsic Z-X'-Y''), row-major into out
  function rot(a, b, g, out) {
    a *= D2R; b *= D2R; g *= D2R;
    const ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b), cg = Math.cos(g), sg = Math.sin(g);
    out[0] = ca * cg - sa * sb * sg; out[1] = -sa * cb; out[2] = ca * sg + sa * sb * cg;
    out[3] = sa * cg + ca * sb * sg; out[4] = ca * cb; out[5] = sa * sg - ca * sb * cg;
    out[6] = -cb * sg;               out[7] = sb;      out[8] = cb * cg;
    return out;
  }
  // θ (degrees): Q = Rrefᵀ·Rnow; u = screen-up in device coordinates at screen angle `ang`; u' = Q·u;
  // θ = atan2(−u'·z, u'·u) = angle of u' projected onto the plane normal to screen-right. Positive = top edge away from the body.
  function theta(Rref, Rnow, ang) {
    const s = Math.sin(ang * D2R), c = Math.cos(ang * D2R);
    // v = Rnow·u (earth), u' = Rrefᵀ·v
    const v0 = Rnow[0] * s + Rnow[1] * c, v1 = Rnow[3] * s + Rnow[4] * c, v2 = Rnow[6] * s + Rnow[7] * c;
    const p0 = Rref[0] * v0 + Rref[3] * v1 + Rref[6] * v2, p1 = Rref[1] * v0 + Rref[4] * v1 + Rref[7] * v2, p2 = Rref[2] * v0 + Rref[5] * v1 + Rref[8] * v2;
    return Math.atan2(-p2, p0 * s + p1 * c) / D2R;
  }
  const mapX = (xRef, th) => { const a = Math.abs(th) - DEAD; const x = xRef + (a > 0 ? Math.sign(th) * a / FULL : 0); return x < 0 ? 0 : x > 1 ? 1 : x; };
  const scrAngle = () => {
    try { if (screen.orientation && typeof screen.orientation.angle === 'number') return screen.orientation.angle; } catch (e) {}
    const w = typeof window !== 'undefined' ? +window.orientation : 0; return isFinite(w) ? (w + 360) % 360 : 0;
  };
  const fin = v => typeof v === 'number' && isFinite(v);
  function foreignFrame() {
    try { if (window.top === window) return false; void window.top.location.href; return !window.top.location.href; } catch (e) { return true; }
  }
  function setSt(s) { st = s; if (s !== 'ok' && H.on) holdEnd(); if (s !== 'ok') unlisten(); else if (opened) listen(); }

  function send(phase) { const x = H.x; try { hooks.hand(x, phase); } catch (e) { if (typeof logErr === 'function') logErr(e); } cnt[phase]++; }
  function oriChg() { if (H.on && scrAngle() !== H.ang) holdEnd(); }
  function holdEnd() {
    if (oriL) { oriL = false; try { if (screen.orientation) screen.orientation.removeEventListener('change', oriChg); } catch (x) {} window.removeEventListener('orientationchange', oriChg); }
    if (!H.on) return;
    clearTimeout(H.waitT); clearTimeout(H.tickT); H.on = false;
    if (H.refOk) send('end');
    H.refOk = false; H.pid = -1;
  }
  function setRef(a, b, g, t) {
    rot(a, b, g, Rr); H.refOk = true; H.th = H.ths = 0; H.tPrev = t; H.tSend = -1e9;
    clearTimeout(H.waitT);
    send('start');
    clearTimeout(H.tickT); H.tickT = setTimeout(tick, 16);
  }
  function onOri(e) {
    const t0 = performance.now(); cnt.events++;
    const a = fin(e.alpha) ? e.alpha : 0, b = e.beta, g = e.gamma;
    if (!fin(b) || !fin(g)) return;
    const t = e.timeStamp || t0;
    last[0] = a; last[1] = b; last[2] = g; last[3] = t; hasLast = true;
    if (H.on) {
      if (scrAngle() !== H.ang) { holdEnd(); }                 // orientation changed: the hold ends, the position stays
      else if (!H.refOk) setRef(a, b, g, t);                   // first event after touching down
      else {
        rot(a, b, g, Rn); H.th = theta(Rr, Rn, H.ang);
        step(t);
      }
    }
    work[wi] = performance.now() - t0; wi = (wi + 1) & 63; if (wn < 64) wn++;
  }
  // one-pole smoothing, time-correct per event; while the sensor is silent (a still device may send no events) a 16-ms tick
  // carries the smoothing on to the last angle, so the position settles where the hand is
  function step(t) {
    const dt = Math.max(0, t - H.tPrev); H.tPrev = Math.max(H.tPrev, t);
    H.ths += (H.th - H.ths) * (1 - Math.exp(-dt / TAU));
    const x = mapX(H.xRef, H.ths), ch = x !== H.x; H.x = x;
    if (ch && t - H.tSend >= SEND_MS - .5) { H.tSend = t; send('move'); }
  }
  function tick() {
    if (!H.on || !H.refOk) return;
    if (scrAngle() !== H.ang) { holdEnd(); return; }
    const t = performance.now(); if (t - H.tPrev > 20) step(t);
    H.tickT = setTimeout(tick, 16);
  }
  function onVis() {
    if (document.visibilityState === 'hidden') { holdEnd(); unlisten(); }
    else if (opened && st === 'ok') listen();
  }
  function listen() { if (listening) return; window.addEventListener('deviceorientation', onOri); listening = true; nList++; }
  function unlisten() { if (!listening) return; window.removeEventListener('deviceorientation', onOri); listening = false; nList--; hasLast = false; }

  // first tap on TILT (per page view): call this synchronously in the click handler (no await before it)
  function tap() {
    if (st === 'ok' || st === 'asking') return st;
    if (foreignFrame()) { setSt('iframe'); return st; }
    const DOE = typeof DeviceOrientationEvent !== 'undefined' ? DeviceOrientationEvent : null;
    if (DOE && typeof DOE.requestPermission === 'function') {
      st = 'asking';
      let p; try { p = DOE.requestPermission(); } catch (e) { setSt('denied'); return st; }
      Promise.resolve(p).then(r => setSt(r === 'granted' ? 'ok' : 'denied'), () => setSt('denied'));
      return st;
    }
    if (!DOE) { setSt('nosensor'); return st; }
    // no permission API (desktop, other systems): a sensor counts only with an event with finite beta and gamma within 500 ms
    st = 'asking';
    const pr = e => { if (fin(e.beta) && fin(e.gamma)) { done(); setSt('ok'); } };
    const done = () => { clearTimeout(probeT); window.removeEventListener('deviceorientation', pr); nList--; };
    window.addEventListener('deviceorientation', pr); nList++;
    probeT = setTimeout(() => { done(); setSt('nosensor'); }, PROBE);
    return st;
  }
  function open() {
    opened = true;
    if (!visL) { document.addEventListener('visibilitychange', onVis); visL = true; }
    if (st === 'ok' && document.visibilityState !== 'hidden') listen();
  }
  function close() {
    opened = false; holdEnd(); unlisten();
    if (visL) { document.removeEventListener('visibilitychange', onVis); visL = false; }
  }
  // thumb clutch: tilt acts only while the thumb is on el
  function down(e) {
    if (st !== 'ok' || !listening || H.on) return;
    H.on = true; H.pid = e.pointerId; H.ang = scrAngle(); H.xRef = H.x = Math.min(1, Math.max(0, +hooks.get() || 0)); H.tDown = e.timeStamp || performance.now();
    H.refOk = false;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (x) {}
    if (!oriL) { oriL = true; try { if (screen.orientation) screen.orientation.addEventListener('change', oriChg); } catch (x) {} window.addEventListener('orientationchange', oriChg); }
    if (hasLast && H.tDown - last[3] <= REF_BEFORE && H.tDown - last[3] >= -REF_BEFORE) setRef(last[0], last[1], last[2], last[3]);
    else H.waitT = setTimeout(() => { if (H.on && !H.refOk) { H.on = false; H.pid = -1; st = 'noreply'; } }, REF_WAIT);
  }
  function up(e) { if (H.on && (e.pointerId === H.pid || H.pid < 0)) holdEnd(); }
  function attach(el) {
    el.style.touchAction = 'none';
    el.addEventListener('pointerdown', down); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    el.addEventListener('lostpointercapture', up);
    return () => { el.removeEventListener('pointerdown', down); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); el.removeEventListener('lostpointercapture', up); };
  }
  function medianMs() { if (!wn) return 0; const a = Array.from(work.subarray(0, wn)).sort((p, q) => p - q); return a[wn >> 1]; }
  // 'noreply' is shown once; the next touch tries again
  function state() { return {st, txt: TXT[st] || '', listening, listeners: nList, holding: H.on, ref: H.refOk}; }
  const api = {
    TXT, hooks, rot, theta, mapX, tap, open, close, attach, state,
    ref: () => (H.refOk ? {R: Array.from(Rr), angle: H.ang, xRef: H.xRef} : null),
    angle: () => ({raw: H.th, smooth: H.ths, x: H.x}),
    info: () => ({listeners: nList, listening, opened, events: cnt.events, start: cnt.start, move: cnt.move, end: cnt.end, medianMs: medianMs()}),
    _reset: () => { close(); st = 'idle'; cnt.start = cnt.move = cnt.end = cnt.events = 0; wn = wi = 0; H.x = 0; hooks._x = 0; }};
  // a later state 'noreply' becomes 'ok' again on the next touch
  api.attach = el => { const off = attach(el); const re = () => { if (st === 'noreply') st = 'ok'; }; el.addEventListener('pointerdown', re, true); return () => { off(); el.removeEventListener('pointerdown', re, true); }; };
  return api;
})();
if (typeof module !== 'undefined') module.exports = NEIGEN;
