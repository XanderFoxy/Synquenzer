/* ---------- I3c + I3d (Nachtrag 8 B.3 §5.1, §5.3–5.5, §6.2–6.5, §6.9, §6.10): the form sheet. It lies over the editor area (same
   grid cell as the synth sheet, own element: an editor rebuild never touches it), the keyboard stays free. One stroke, one wipe,
   one library pick, one switch of „Aufräumen“ = one undo step (kind 'sound'). Drawing is pointer events with touch-action none;
   the visible snap is the duty (glide 150 ms, glow 300 ms, quarter line 120 ms), haptic('snap') only on lift (A.8 H3). ---------- */
const FUI = (() => {
  'use strict';
  const TK = 768;
  let st = null;
  const css = `
#formSheet{display:flex;flex-direction:column;z-index:24;gap:2px;padding:2px 16px 2px;touch-action:none}
#formSheet .fs-head{display:flex;align-items:center;gap:6px;height:44px;flex:none;min-width:0}
#formSheet .fs-head .fs-tt{flex:1 1 auto;min-width:0;display:flex;align-items:baseline;gap:8px;overflow:hidden}
#formSheet .fs-tt b{font:700 13px/1.1 var(--font-ui);letter-spacing:.05em;text-transform:uppercase;white-space:nowrap}
#formSheet .fs-tt .fs-inf{flex:1 1 auto;min-width:0}
#formSheet button{min-width:44px;height:44px;padding:0 8px;font-size:14px;white-space:nowrap;flex:none}
#formSheet .fs-done{padding:0 10px}
#formSheet .fs-main{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;gap:2px}
#formSheet .fs-lib{display:flex;gap:6px;flex:none;overflow-x:auto;overflow-y:hidden;touch-action:pan-x;scrollbar-width:none;height:44px}
#formSheet .fs-lib::-webkit-scrollbar{display:none}
#formSheet .fs-fld{flex:1 1 auto;min-height:120px;position:relative;border:1px solid var(--line);border-radius:var(--r-s);background:var(--lcd);overflow:hidden}
#formSheet canvas{position:absolute;inset:0;width:100%;height:100%;touch-action:none}
#formSheet .fs-inf{font:500 12px/1.2 var(--font-ui);color:var(--text-dim);white-space:nowrap;overflow:hidden;text-overflow:clip}
#formSheet .fs-inf.p{height:22px;line-height:22px;flex:none}
#formSheet .fs-inf.hot{color:var(--amber)}
#formSheet .fs-ctl{display:flex;gap:6px;flex:none;height:44px;min-width:0}
#formSheet .fs-ctl .on{border-color:var(--tc);color:var(--tc)}
#formSheet .grey{opacity:.4}
#formSheet .fs-ctl .kz{display:none}
#formSheet.kurz .fs-ctl .lg{display:none}
#formSheet.kurz .fs-ctl .kz{display:inline}
#formSheet .fs-head .q{display:none}
@media (orientation:landscape){
  #formSheet{padding:2px max(16px,env(safe-area-inset-right)) 2px max(16px,env(safe-area-inset-left))}
  #formSheet .fs-head .q{display:block}
  #formSheet .fs-inf.p{display:none}
  #formSheet .fs-main{flex-direction:row-reverse}
  #formSheet .fs-lib{flex-direction:column;width:168px;height:auto;overflow-x:hidden;overflow-y:auto;touch-action:pan-y}
  #formSheet .fs-lib button{width:100%;flex:none}
}`;
  const sndI = () => sndOf(st.tg.i);
  const pre = () => 'l' + st.tg.n;
  const cur = () => { const s = sndI(); return s ? s.p[pre() + 'f'] || null : null; };
  const zyk = () => { const s = sndI(); return s && s.p[pre() + 'sync'] > 0 ? s.p[pre() + 'sync'] : 4; };
  const zykName = () => { const k = LFO_SYNC.findIndex(v => Math.abs(v - zyk()) < 1e-3); return k >= 0 ? LFO_SYNC_LBL[k] : zyk() + ' Schläge'; };
  const label = () => 'LFO ' + st.tg.n;
  const now = () => performance.now();
  const reduced = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
  function tcol() { try { return getComputedStyle(document.documentElement).getPropertyValue('--t' + (st.tg.i + 1)).trim() || '#4cc9f0'; } catch (e) { return '#4cc9f0'; } }
  function raster() { return FORMCLEAN.raster(zyk(), st.grid); }
  // the tick and the height of a pointer (§5.1): 8 px margin top and bottom so that ±1 is easy to hit
  function pos(e) {
    const r = st.cv.getBoundingClientRect(), u = clamp((e.clientX - r.left) / Math.max(1, r.width) * TK, 0, TK);
    const y = clamp(((r.top + r.height / 2) - e.clientY) / Math.max(1, r.height / 2 - 8) * 1000, -1000, 1000);
    return [u, y];
  }
  function info(msg, hot) { st.msg = msg || ''; st.msgHot = !!hot; renderInfo(); }
  function renderInfo() {
    const R_ = raster(), base = FORMCLEAN.rasterText(zykName(), R_), t = base + (st.msg ? ' · ' + st.msg : '');
    for (const n of st.infs) { if (n.textContent !== t) n.textContent = t; n.classList.toggle('hot', st.msgHot); }
    const gn = R_.name || ''; for (const x of st.btn.grid.querySelectorAll('.gv')) if (x.textContent !== gn) x.textContent = gn;
  }
  // [≋ Einwischen] only where one heard place exists (§5.5); the reason otherwise
  function wischWhy() {
    if (st.tg.kind !== 'lfo') return 'Einwischen geht bei freien Reihen';
    if (!R.playing) return 'Einwischen geht bei laufendem Loop (▶)';
    const s = sndI(); if (s && s.p[pre() + 'retrig']) return 'Einwischen geht bei Start FREI';
    return '';
  }
  function updButtons() {
    const why = wischWhy();
    st.btn.wisch.classList.toggle('grey', !!why); st.btn.wisch.setAttribute('aria-disabled', why ? 'true' : 'false'); st.btn.wisch.title = why;
    if (why && st.mode === 'wischen' && !(st.stroke && st.stroke.wisch)) setMode('malen');
    st.btn.malen.classList.toggle('on', st.mode === 'malen'); st.btn.wisch.classList.toggle('on', st.mode === 'wischen');
    st.btn.malen.setAttribute('aria-pressed', String(st.mode === 'malen')); st.btn.wisch.setAttribute('aria-pressed', String(st.mode === 'wischen'));
    st.btn.clean.classList.toggle('on', st.clean); st.btn.clean.setAttribute('aria-pressed', String(st.clean));
    st.btn.undo.disabled = !UNDO.length; st.btn.redo.disabled = !REDO.length;
  }
  function setMode(m) { st.mode = m; updButtons(); }
  // short labels when a row would not fit (never cut, rule 1)
  function fit() {
    const sh = st.el; sh.classList.remove('kurz');
    const over = n => n.scrollWidth > n.clientWidth + 1;
    if (over(st.ctl) || over(st.head)) sh.classList.add('kurz');
  }
  /* ---------- drawing ---------- */
  function sizeCanvas() {
    const r = st.fld.getBoundingClientRect(), dpr = Math.min(3, window.devicePixelRatio || 1);
    const w = Math.max(1, Math.round(r.width * dpr)), h = Math.max(1, Math.round(r.height * dpr));
    if (st.cv.width !== w || st.cv.height !== h) { st.cv.width = w; st.cv.height = h; }
    st.W = r.width; st.H = r.height; st.dpr = dpr; st.dirty = true;
  }
  const yPx = y => st.H / 2 - y / 1000 * (st.H / 2 - 8);
  const uPx = u => u / TK * st.W;
  function shown() {      // the line that is shown now: the form, or during a stroke the raw stroke over the form
    const f = cur(), base = f ? FORMCLEAN.sample(f) : new Float32Array(TK + 1);
    if (st.stroke && st.stroke.raw) { const r = st.stroke.raw; for (let u = 0; u <= TK; u++) if (r[u] === r[u]) base[u] = r[u]; }
    return base;
  }
  function draw() {
    const t0 = now(), c = st.ctx, W = st.W, H = st.H, col = tcol(), tn = now();
    c.setTransform(st.dpr, 0, 0, st.dpr, 0, 0); c.clearRect(0, 0, W, H);
    const R_ = raster(), beat = TK / zyk();
    // grid: raster lines, the quarters (beats) stronger, the middle line
    c.lineWidth = 1; c.strokeStyle = 'rgba(255,255,255,.08)'; c.beginPath();
    for (const x of R_.lines) { const px = Math.round(uPx(x)) + .5; c.moveTo(px, 0); c.lineTo(px, H); } c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.22)'; c.beginPath();
    for (let b = 0; b * beat <= TK + 1e-6; b++) { const px = Math.round(uPx(Math.round(b * beat))) + .5; c.moveTo(px, 0); c.lineTo(px, H); } c.stroke();
    // a quarter line the finger crossed: 120 ms double width in the track colour (§5.3)
    for (const [b, t] of st.qhl) {
      if (tn - t > 120) { st.qhl.delete(b); continue; }
      c.strokeStyle = col; c.lineWidth = 2; c.beginPath(); const px = uPx(Math.round(b * beat)); c.moveTo(px, 0); c.lineTo(px, H); c.stroke();
    }
    c.lineWidth = 1; c.strokeStyle = 'rgba(255,255,255,.3)'; c.beginPath(); c.moveTo(0, Math.round(H / 2) + .5); c.lineTo(W, Math.round(H / 2) + .5); c.stroke();
    // the touched area of a wipe, light
    const sk = st.stroke;
    if (sk && sk.wisch && sk.u1 >= sk.u0) { c.fillStyle = 'rgba(255,255,255,.07)'; c.fillRect(uPx(sk.u0), 0, uPx(sk.u1) - uPx(sk.u0), H); }
    // the line: during a stroke the raw stroke 40 % over the form; after lifting it glides into the cleaned form in 150 ms
    let line = null, a = 1;
    if (st.anim) {
      const k = clamp((tn - st.anim.t0) / 150, 0, 1);
      if (k >= 1) st.anim = null; else { line = new Float32Array(TK + 1); for (let u = 0; u <= TK; u++) line[u] = st.anim.from[u] + (st.anim.to[u] - st.anim.from[u]) * k; a = .4 + .6 * k; }
    }
    if (!line) { const f = cur(); line = f ? FORMCLEAN.sample(f) : null; }
    const path = L => { c.beginPath(); const step = Math.max(1, Math.floor(TK / Math.max(1, W * 2))); for (let u = 0; u <= TK; u += step) { const x = uPx(u), y = yPx(L[u]); if (u) c.lineTo(x, y); else c.moveTo(x, y); } c.lineTo(uPx(TK), yPx(L[TK])); c.stroke(); };
    if (line) { c.globalAlpha = sk && !sk.wisch ? .55 : a; c.strokeStyle = col; c.lineWidth = 2; c.lineJoin = 'round'; path(line); c.globalAlpha = 1; }
    if (sk && sk.raw) {       // the raw stroke, faint (40 %)
      c.globalAlpha = .4; c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); let on = false;
      for (let u = 0; u <= TK; u++) { const v = sk.raw[u]; if (v !== v) { on = false; continue; } const x = uPx(u), y = yPx(v); if (on) c.lineTo(x, y); else { c.moveTo(x, y); on = true; } }
      c.stroke(); c.globalAlpha = 1;
    }
    // recognised straights and stairs light up for 300 ms
    if (st.glow && tn - st.glow.t0 < 300 && line) {
      const k = 1 - (tn - st.glow.t0) / 300; c.save(); c.globalAlpha = .35 + .65 * k; c.strokeStyle = col; c.lineWidth = 5; c.shadowColor = col; c.shadowBlur = 10 * k;
      for (const [x0, x1] of st.glow.hl) { c.beginPath(); for (let u = Math.max(0, x0 | 0); u <= Math.min(TK, x1); u++) { const x = uPx(u), y = yPx(line[u]); if (u === Math.max(0, x0 | 0)) c.moveTo(x, y); else c.lineTo(x, y); } c.stroke(); }
      c.restore();
    } else if (st.glow) st.glow = null;
    // the run line at the heard place (≤ 30 fps), with the finger's height as a dot during a wipe
    if (st.runU != null) {
      const x = uPx(st.runU); c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke();
      if (sk && sk.wisch && sk.y != null) { c.fillStyle = col; c.beginPath(); c.arc(x, yPx(sk.y), 6, 0, 2 * Math.PI); c.fill(); }
    }
    st.drawN++; const dt = now() - t0; st.drawMs.push(dt); if (st.drawMs.length > 240) st.drawMs.shift();
    st.dirty = false;
  }
  // the heard place of the LFO (§5.5 table, §4.3: song beat; without a song the transport beat)
  function heardU(tAud) {
    const B = t2b(tAud), Bs = R.songPlay ? songBeatOf(B) : B; if (Bs == null) return null;
    return FORMCLEAN.wischU.lfo(Bs, zyk());
  }
  function hoer(e) {
    if (typeof hoerZeit === 'function') return hoerZeit(e.timeStamp);     // I4b's clock bridge, when it is on the line (A.10)
    return FORMCLEAN.hoerZeit(e.timeStamp, {ctxNow: AU.ctx.currentTime, perfNow: performance.now(), outLat: AU.outLat || 0});
  }
  function loop() {
    if (!st) return;
    st.raf = requestAnimationFrame(loop);
    // the sheet lives only with its editor and track; a stopped transport ends a wipe (§5.5, §6.4)
    if (!EL.synthSheet.classList.contains('open') || R.editor !== 'synth' || R.selT !== st.tg.i || !sndI()) { close('zu'); return; }
    if (st.stroke && st.stroke.wisch && !R.playing) { abortStroke(); setMode('malen'); info('Transport angehalten – Einwischen verworfen', true); }
    const h = FORM.hash(cur()); if (h !== st.h) { st.h = h; st.dirty = true; if (!st.writing) st.last = null; }
    const tn = now();
    if (R.playing && AU.ctx) { if (tn - st.runT >= 33) { st.runT = tn; const u = heardU(AU.ctx.currentTime - (AU.outLat || 0)); if (u !== st.runU) { st.runU = u; st.dirty = true; } } }
    else if (st.runU != null) { st.runU = null; st.dirty = true; }
    if (st.anim || st.glow || st.qhl.size) st.dirty = true;
    if (tn - st.btnT > 200) { st.btnT = tn; updButtons(); }
    if (st.dirty) draw();
  }
  /* ---------- strokes ---------- */
  function down(e) {
    if (st.stroke || (e.pointerType === 'mouse' && e.button > 0)) return;     // a second finger does nothing (no zoom)
    if (st.mode === 'wischen') { const why = wischWhy(); if (why) { info(why, true); setMode('malen'); return; } }
    e.preventDefault();
    try { st.cv.setPointerCapture(e.pointerId); } catch (x) {}
    const [u, y] = pos(e), prev = cur();
    st.stroke = {id: e.pointerId, t0: now(), raw: FORMCLEAN.newRaw(), u0: TK, u1: 0, lu: u, ly: y, y, prev, wisch: st.mode === 'wischen', pvT: 0, ws: null};
    gestBegin('form' + e.pointerId, () => abortStroke());
    if (st.stroke.wisch) { st.stroke.ws = {u: null, y: null}; wipe(e); }
    else { const r = FORMCLEAN.paint(st.stroke.raw, [[u, y]]); grow(r); st.stroke.qb = Math.floor(u / (TK / zyk())); }
    st.last = null; st.dirty = true;
  }
  function grow(r) { if (!r) return; const s = st.stroke; if (r.u0 < s.u0) s.u0 = r.u0; if (r.u1 > s.u1) s.u1 = r.u1; }
  function evs(e) { let L = null; try { L = e.getCoalescedEvents ? e.getCoalescedEvents() : null; } catch (x) { L = null; } return L && L.length ? L : [e]; }
  function move(e) {
    const s = st.stroke; if (!s || e.pointerId !== s.id) return;
    if (s.wisch) { wipe(e); return; }
    const beat = TK / zyk(), tn = now();
    for (const q of evs(e)) {             // the pointerId of coalesced events is not trusted (first iOS version)
      const [u, y] = pos(q);
      grow(FORMCLEAN.paint(s.raw, [[s.lu, s.ly], [u, y]]));
      const qb = Math.floor(u / beat); if (qb !== s.qb) { const b = Math.max(qb, s.qb); if (b > 0 && b < zyk() + .5) st.qhl.set(b, tn); s.qb = qb; }
      s.lu = u; s.ly = y; s.y = y;
    }
    st.dirty = true;
  }
  function wipe(e) {
    const s = st.stroke;
    for (const q of evs(e)) {
      const th = hoer(q), u = heardU(th); if (u == null) continue;
      const y = pos(q)[1];
      grow(FORMCLEAN.wischPaint(s.raw, s.ws, u, y)); s.y = y; st.runU = u;
    }
    // preview (§5.5): at most every 33 ms the raw state (RDP ε 10) to the engine, no undo, the stored form unchanged
    const tn = now();
    if (tn - s.pvT >= 33 && s.u1 >= s.u0) { s.pvT = tn; const r = FORMCLEAN.clean(s.raw, s.u0, s.u1, s.prev, Object.assign(rOpt(), {on: false})); if (r && r.f) { s.pv = r.f; wkLf(st.tg.i, st.tg.n, r.f); } }
    st.dirty = true;
  }
  function rOpt() { const R_ = raster(); return {lines: R_.lines, Z: R_.Z}; }
  function up(e) {
    const s = st.stroke; if (!s || e.pointerId !== s.id) return;
    if (e.type === 'pointercancel') { abortStroke(); return; }
    move(e);
    st.stroke = null; gestEnd('form' + s.id);
    try { st.cv.releasePointerCapture(e.pointerId); } catch (x) {}
    const dur = now() - s.t0;
    if (s.u1 < s.u0 || (s.u1 - s.u0 < 4 && dur < 150)) { if (s.wisch && s.pv) wkLf(st.tg.i, st.tg.n, s.prev); st.dirty = true; return; }   // a tap changes nothing
    const res = FORMCLEAN.clean(s.raw, s.u0, s.u1, s.prev, Object.assign(rOpt(), {on: st.clean}));
    if (!res || !res.f) {
      if (s.wisch) wkLf(st.tg.i, st.tg.n, s.prev);
      info(res && res.err === 'zu-viele' ? 'Zu viele Abschnitte – Strich nicht übernommen' : '', true); st.dirty = true; return;
    }
    const from = shownFrom(s);
    commit(res.f, label() + (s.wisch ? ' Form eingewischt' : ' Form gemalt'));
    st.last = {prev: s.prev, raw: s.raw, u0: s.u0, u1: s.u1};
    landed(res, from);
    haptic('snap');                       // a try only; pointerup is a user activation (A.8 H3)
  }
  function shownFrom(s) { const f = s.prev, b = f ? FORMCLEAN.sample(f) : new Float32Array(TK + 1); for (let u = 0; u <= TK; u++) if (s.raw[u] === s.raw[u]) b[u] = s.raw[u]; return b; }
  // after a stroke: glide, glow, info line (counts from the clean-up, hint for very fine forms)
  function landed(res, from) {
    const to = FORMCLEAN.sample(res.f);
    st.anim = reduced() ? null : {from, to, t0: now()};
    st.glow = res.hl && res.hl.length ? {hl: res.hl, t0: now()} : null;
    const S_ = res.stats || {}, parts = [];
    if (S_.rampen) parts.push(S_.rampen + (S_.rampen === 1 ? ' Rampe' : ' Rampen'));
    if (S_.stufen) parts.push(S_.stufen + (S_.stufen === 1 ? ' Stufe' : ' Stufen'));
    if (S_.kurven) parts.push(S_.kurven + (S_.kurven === 1 ? ' Kurve' : ' Kurven'));
    let msg = st.clean ? 'Aufgeräumt' + (parts.length ? ': ' + parts.join(' · ') : '') : 'Nicht aufgeräumt: ' + (res.f.k.length - 1) + ' Abschnitte';
    const cyc = zyk() * 60 / S.bpm, sr = AU.ctx ? AU.ctx.sampleRate : 48000;
    if (FORMCLEAN.fine(res.f, cyc, sr)) msg = 'Sehr fein für ' + zykName() + ' bei ' + Math.round(S.bpm) + ' BPM: Kanten werden weicher';
    info(msg, false); st.dirty = true;
  }
  function commit(f, lbl) {
    const i = st.tg.i, b = soundSnapshot(i);
    st.writing = true; lfoFormWrite(i, st.tg.n, f); st.h = FORM.hash(cur()); st.writing = false;
    commitSound(i, b, lbl); updButtons();
  }
  function abortStroke() {
    const s = st && st.stroke; if (!s) return;
    st.stroke = null; gestEnd('form' + s.id);
    try { st.cv.releasePointerCapture(s.id); } catch (x) {}
    if (s.wisch) wkLf(st.tg.i, st.tg.n, s.prev);     // the old state back at once (§5.5)
    st.runU = null; st.dirty = true; setMode('malen');
  }
  /* ---------- the controls ---------- */
  function toggleClean() {
    st.clean = !st.clean; setUiPref('formClean', st.clean); updButtons();
    const L = st.last;        // §5.4: right after a stroke the new choice applies to that stroke (one undo)
    if (L && FORM.hash(cur()) === st.h) {
      const res = FORMCLEAN.clean(L.raw, L.u0, L.u1, L.prev, Object.assign(rOpt(), {on: st.clean}));
      if (res && res.f) { const from = FORMCLEAN.sample(cur()); commit(res.f, st.clean ? 'Aufräumen an' : 'Aufräumen aus'); st.last = L; landed(res, from); return; }
    }
    info(st.clean ? 'Aufräumen an (nächste Striche)' : 'Aufräumen aus (nächste Striche)');
  }
  function pickLib(name) {
    const f = FORM.lib()[name]; if (!f) return;
    abortStroke(); st.last = null;
    const from = FORMCLEAN.sample(cur() || f);
    commit(JSON.parse(JSON.stringify(f)), label() + ' Form ' + name);
    st.anim = reduced() ? null : {from, to: FORMCLEAN.sample(f), t0: now()};
    info(name); if (ED.lcd) lcdShow(label() + ' Form', name);
  }
  function rasterPop() {
    openPop(st.btn.grid, p => {
      p.classList.add('fsgrid');
      for (const [nm, g] of FORMCLEAN.RASTER) {
        const b = el('button', 'rb' + (Math.abs(g - st.grid) < 1e-9 ? ' on' : ''), esc(nm)); b.style.cssText = 'min-width:64px;height:44px;margin:2px';
        onTap(b, () => { st.grid = g; setUiPref('formRaster', g); closePop(); st.dirty = true; renderInfo(); }); p.appendChild(b);
      }
    }, {above: true});
  }
  function doUndo(fn) { abortStroke(); st.last = null; fn(); st.h = FORM.hash(cur()); st.dirty = true; updButtons(); renderInfo(); }
  /* ---------- open / close ---------- */
  function open(tg) {
    if (st) close('neu');
    if (!tg || tg.kind !== 'lfo' || !sndOf(tg.i)) return false;
    if (!document.getElementById('formSheetCss')) { const s = document.createElement('style'); s.id = 'formSheetCss'; s.textContent = css; document.head.appendChild(s); }
    const sh = el('section', 'sheet ed open'); sh.id = 'formSheet'; sh.setAttribute('aria-label', 'Form');
    sh.style.setProperty('--tc', `var(--t${tg.i + 1})`);
    const P = uiPrefs();
    st = {tg, el: sh, mode: 'malen', grid: FORMCLEAN.RASTER.some(r => Math.abs(r[1] - P.formRaster) < 1e-9) ? +P.formRaster : .25, clean: P.formClean !== false,
      stroke: null, last: null, anim: null, glow: null, qhl: new Map(), msg: '', msgHot: false, runU: null, runT: 0, btnT: 0, drawN: 0, drawMs: [], h: '', infs: [], btn: {}, writing: false, opened: now()};
    const head = el('div', 'fs-head'), done = el('button', 'rb fs-done', '◂ Fertig'), tt = el('div', 'fs-tt');
    tt.append(el('b', '', esc('Form · ' + label() + ' · ' + trackNameOf(tg.i))), el('span', 'fs-inf q'));
    const un = el('button', 'rb', '↶'), re = el('button', 'rb', '↷'); un.setAttribute('aria-label', 'Rückgängig'); re.setAttribute('aria-label', 'Wiederholen');
    head.append(done, tt, un, re);
    const main = el('div', 'fs-main'), lib = el('div', 'fs-lib'), fld = el('div', 'fs-fld'), cv = document.createElement('canvas');
    for (const nm of Object.keys(FORM.lib())) { const b = el('button', 'rb', esc(nm)); b.dataset.lib = nm; lib.appendChild(b); }
    fld.appendChild(cv); main.append(lib, fld);
    const inf = el('div', 'fs-inf p'), ctl = el('div', 'fs-ctl');
    const bM = el('button', 'rb', '✎ Malen'), bW = el('button', 'rb', '≋ <span class="lg">Einwischen</span><span class="kz">Wischen</span>');
    const bG = el('button', 'rb', '<span class="lg">Raster </span><span class="gv"></span> ▾'), bC = el('button', 'rb', '<span class="lg">Aufräumen</span><span class="kz">Aufr.</span> ✓');
    bM.setAttribute('aria-label', 'Malen'); bW.setAttribute('aria-label', 'Einwischen'); bG.setAttribute('aria-label', 'Raster'); bC.setAttribute('aria-label', 'Aufräumen');
    ctl.append(bM, bW, bG, bC);
    sh.append(head, main, inf, ctl);
    Object.assign(st, {head, ctl, fld, cv, ctx: cv.getContext('2d'), infs: [inf, tt.querySelector('.fs-inf')], btn: {done, undo: un, redo: re, malen: bM, wisch: bW, grid: bG, clean: bC}});
    EL.app.appendChild(sh);
    onTap(done, () => close('fertig'));
    onTap(un, () => doUndo(undo)); onTap(re, () => doUndo(redo));
    onTap(lib, b => pickLib(b.dataset.lib), 'button');
    onTap(bM, () => { abortStroke(); setMode('malen'); });
    onTap(bW, () => { const why = wischWhy(); if (why) { info(why, true); return; } setMode('wischen'); info('Finger hoch und runter – geschrieben wird an der gehörten Stelle'); });
    onTap(bG, rasterPop); onTap(bC, toggleClean);
    cv.addEventListener('pointerdown', down); cv.addEventListener('pointermove', move);
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('contextmenu', e => e.preventDefault());
    // turning the device rebuilds the layout without data loss; a running gesture is dropped (§6.10)
    st.ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => { if (!st) return; if (st.stroke) abortStroke(); sizeCanvas(); fit(); }) : null;
    if (st.ro) st.ro.observe(fld); else window.addEventListener('resize', sizeCanvas);
    sizeCanvas(); fit(); st.h = FORM.hash(cur()); updButtons(); renderInfo(); draw();
    st.raf = requestAnimationFrame(loop);
    st.openMs = now() - st.opened;
    return true;
  }
  function close(why) {
    if (!st) return;
    abortStroke();
    cancelAnimationFrame(st.raf); if (st.ro) st.ro.disconnect();
    if (UI.pop && st.el.contains(document.activeElement)) closePop();
    st.el.remove(); st = null;
    void why;
  }
  function state() {
    if (!st) return {open: false};
    const R_ = raster(), q = st.drawMs.slice().sort((a, b) => a - b);
    const box = n => { const r = n.getBoundingClientRect(); return {x: r.left, y: r.top, w: r.width, h: r.height}; };
    return {open: true, tg: Object.assign({}, st.tg), mode: st.mode, grid: st.grid, raster: {g: R_.g, name: R_.name, N: R_.N, rest: R_.rest, auto: R_.auto},
      clean: st.clean, info: st.infs[0].textContent, infoQ: st.infs[1].textContent, last: !!st.last, stroke: st.stroke ? {wisch: st.stroke.wisch, u0: st.stroke.u0, u1: st.stroke.u1} : null,
      anim: !!st.anim, glow: !!st.glow, qhl: [...st.qhl.keys()], runU: st.runU, wischWhy: wischWhy(), kurz: st.el.classList.contains('kurz'),
      drawN: st.drawN, drawMed: q.length ? q[q.length >> 1] : 0, openMs: st.openMs,
      field: box(st.fld), sheet: box(st.el), buttons: [...st.el.querySelectorAll('button')].map(b => Object.assign(box(b), {t: b.textContent.trim(), sw: b.scrollWidth, cw: b.clientWidth}))};
  }
  return {open, close, state, abort: () => abortStroke()};
})();
