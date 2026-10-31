
/* ---------- Text-Modus im Marken-Editor (§7.1–§7.10) ---------- */
const G9_PULSE = 150, G9_REPLAY = 1500;
const g9Rec = () => (G9.rec && typeof G9.rec.recognize === 'function' ? G9.rec : null);   // Andock-Stelle für die Erkennung (Zweig g9-br-E)
function g9Toggle(on) {
  const E = WP.ed; if (!E) return false;
  on = on == null ? !E.g9 : !!on;
  if (on && !E.g9) g9On(E); else if (!on && E.g9) g9Off(E);
  return !!E.g9;
}
function g9End(why) { const E = WP.ed; if (E && E.g9) g9Off(E); return why; }
function g9Btn(cls, long, short, aria, fn) {
  const b = el('button', 'rb ' + cls, esc(long)); b.dataset.l = long; b.dataset.s = short || long; if (aria) b.setAttribute('aria-label', aria);
  b.addEventListener('mousedown', e => e.preventDefault());              // Fokus bleibt im Feld (Chromium)
  b.addEventListener('click', e => { const E = WP.ed; if (!E || !E.g9) return; G9.hits = (G9.hits | 0) + 1; try { fn(E, e); } catch (err) { logErr(err); } g9Refocus(E); });
  return b;
}
function g9On(E) {
  closePop();
  const sh = EL.wpSheet, b = sh.querySelector('.wpb'), head = sh.querySelector('.qh'), x = tkRef(E.r); if (!b || !head || !x) return;
  const tb = head.querySelector('b');
  E.g9 = {sel: -1, fk: -1, orig: '', dirty: false, typed: false, prevW: null, pulse: 0, last: {k: -1, t: -1e9}, src: null, title: tb ? tb.innerHTML : '', sx: [], dock: null, ls: []};
  const G = E.g9;
  sh.classList.add('g9');
  if (tb) tb.innerHTML = wpTitlePieces('Text · STIMME · ' + x.label);
  // [Erkennen]: nur, wenn die Erkennung angedockt ist (§9 Stopp-Punkt 1: sonst ausgeblendet)
  const rb = el('button', 'rb g9rec', 'Erkennen'); rb.setAttribute('aria-label', 'Worte erkennen'); rb.hidden = !g9Rec();
  rb.addEventListener('click', () => g9RecSheet(rb)); head.insertBefore(rb, E.tx); G.rb = rb;
  E.tx.setAttribute('aria-pressed', 'true');
  // Silben-Leiste
  const bar = el('div', 'g9bar'), bcv = el('canvas'); bar.append(bcv); bar.dataset.g9h = 'leiste';
  // Eingabe: [◀] Feld [+] [▶]
  const row = el('div', 'g9row'), inr = el('div', 'g9in'), tl = el('div', 'g9tl');
  const f = el('input', 'g9f'); f.type = 'text'; f.maxLength = 60; f.placeholder = 'Silbe oder Wort'; f.setAttribute('aria-label', 'Silbe oder Wort');
  for (const [k, v] of [['autocomplete', 'off'], ['autocorrect', 'off'], ['autocapitalize', 'off'], ['spellcheck', 'false'], ['enterkeyhint', 'next'], ['inputmode', 'text']]) f.setAttribute(k, v);
  const bp = g9Btn('g9prev', '◀', '◀', 'Voriger Abschnitt', E2 => g9Step(E2, -1));
  const bi = g9Btn('g9ins', '+', '+', 'Wort hier einfügen', E2 => g9Accept(E2, 'plus'));
  const bn = g9Btn('g9next', '▶', '▶', 'Nächster Abschnitt', E2 => g9Step(E2, 1));
  inr.append(bp, f, bi, bn);
  const sg = el('div', 'g9sh');
  const sl = g9Btn('g9sl', '‹ Silbe', '‹', 'Text ab hier eine Silbe nach links', E2 => g9Tool(E2, {op: 'shift', d: -1}));
  const sr = g9Btn('g9sr', 'Silbe ›', '›', 'Text ab hier eine Silbe nach rechts', E2 => g9Tool(E2, {op: 'shift', d: 1}));
  sg.append(sl, sr);
  const bm = g9Btn('g9mg', 'Verschmelzen', '⌒', 'Mit nächster Silbe verschmelzen', E2 => g9Tool(E2, {op: 'merge'}));
  const bs = g9Btn('g9sp', 'Trennen', '⌣', 'Trennen', E2 => g9Tool(E2, {op: 'split'}));
  const bt = g9Btn('g9tx', 'Ganzer Text', '≡', 'Ganzen Text einfügen', E2 => g9TextSheet(bt));
  const bx = g9Btn('g9x', '✕', '✕', 'Schließen', () => wpClose());
  tl.append(sg, bm, bs, bt, bx);
  row.append(inr, tl);
  b.append(bar, row);
  Object.assign(G, {bar, bcv, row, inr, tl, field: f, bp, bi, bn, sl, sr, bm, bs, bt, bx, longs: [sl, sr, bm, bs, bt]});
  // Haptik-Labels (§7.9): je Ziel ein Label mit Schalter-Kästchen, nur im Text-Modus und mit UI.haptics
  E.cvw.dataset.g9h = 'welle';
  for (const n of [E.cvw, bar, bp, bi, bn, sl, sr, bm, bs, bt]) g9HapAdd(n);
  // Gesten am Rahmen (Wellenform) und an der Leiste: Tipp = Abschnitt wählen + vorspielen, Ziehen > 8 px = schwenken
  g9Gest(E.cvw, () => E.cv); g9Gest(bar, () => bcv);
  g9Field(E, f);
  // Zoom (§7.2): öffnet mit der Stufe des Marken-Modus; Median-Abschnitt < 44 px → eine Stufe feiner, höchstens bis 1 Takt
  G.zoom0 = E.zoom; G.zoomed = false;
  G.vvH = () => g9Dock(); if (window.visualViewport) { visualViewport.addEventListener('resize', G.vvH); visualViewport.addEventListener('scroll', G.vvH); } window.addEventListener('resize', G.vvH);
  sh.classList.toggle('hap', !!UI.haptics);
  wpPaint();
  g9ZoomRule(E);
  const C = g9Ctx(E.id), i = C ? C.W.findIndex(q => !q.nm && q.k >= 0) : -1;
  g9Select(i >= 0 ? C.W[i].k : 0, {silent: true});
  requestAnimationFrame(() => g9Fit(E));
}
function g9Off(E) {
  const G = E.g9; if (!G) return;
  if (G.dirty && G.field && document.activeElement === G.field) g9Accept(E, 'blur');
  g9StopPlay(true);
  if (G.vvH) { if (window.visualViewport) { visualViewport.removeEventListener('resize', G.vvH); visualViewport.removeEventListener('scroll', G.vvH); } window.removeEventListener('resize', G.vvH); }
  try { if (G.field) G.field.blur(); } catch (e) {}
  E.g9 = null;
  const sh = EL.wpSheet;
  g9Undock(sh);
  sh.classList.remove('g9', 'hap');
  for (const n of [G.bar, G.row, G.rb]) if (n && n.parentNode) n.remove();
  if (E.cvw) { E.cvw.querySelectorAll('.g9hl').forEach(n => n.remove()); delete E.cvw.dataset.g9h; }
  const tb = sh.querySelector('.qh b'); if (tb && G.title) tb.innerHTML = G.title;
  if (E.tx) E.tx.setAttribute('aria-pressed', 'false');
  if (G.zoomed && WP.ed === E) E.zoom = G.zoom0;
  if (WP.ed === E) wpPaint();
}
function g9Undock(sh) { sh.classList.remove('g9dock', 'd300', 'd250', 'd200', 'q118', 'q88'); for (const k of ['top', 'left', 'width', 'height']) sh.style[k] = ''; }
// nach ↶ ↷ (Art 'ly') bzw. 'takes'
function g9Undone(id) { const E = WP.ed; if (E && E.g9 && (!id || E.id === id)) { g9Fill(E); wpPaint(); } else if (E) wpPaint(); }
// Zoom-Regel (§7.2, G9-37)
function g9ZoomRule(E) {
  const G = E.g9, sx = G.sx.filter(s => s[1] > s[0]); if (!sx.length) return;
  const w = sx.map(s => s[1] - s[0]).sort((a, b) => a - b), med = w[w.length >> 1];
  if (med >= 44) return;
  const ORD = [0, 4, 2, 1], i = ORD.indexOf(E.zoom);           // grob → fein
  if (i >= 0 && i < ORD.length - 1) { E.zoom = ORD[i + 1]; G.zoomed = true; wpPaint(); }
}
// lange oder kurze Namen (§7.2): die langen nur, wenn alle ohne Kürzung passen
function g9Fit(E) {
  const G = E && E.g9; if (!G) return;
  const tl = G.tl; tl.classList.remove('short');
  for (const b of G.longs) b.textContent = b.dataset.l;
  const forced = G.dock && G.dock.H < 250 || EL.wpSheet.classList.contains('g9q');
  const over = forced || G.longs.some(b => b.scrollWidth > b.clientWidth + .5 || b.clientWidth < 44);
  if (over) { tl.classList.add('short'); for (const b of G.longs) b.textContent = b.dataset.s; }
}

/* ---------- Haptik-Label im Ziel (§7.9) ---------- */
function g9HapAdd(node) {
  if (!node || node.querySelector(':scope > .g9hl')) return;
  const lb = el('label', 'g9hl'), inp = el('input'); lb.setAttribute('aria-hidden', 'true');
  inp.type = 'checkbox'; inp.setAttribute('switch', ''); inp.tabIndex = -1;
  inp.addEventListener('click', e => e.stopPropagation());
  lb.addEventListener('mousedown', e => e.preventDefault());
  lb.addEventListener('click', e => {
    const E = WP.ed, G = E && E.g9;
    if (!G || (G.dragT && performance.now() - G.dragT < 400)) { e.preventDefault(); e.stopPropagation(); return; }   // nach Ziehen: kein Tick
    const tg = node.dataset.g9h || node.className;
    queueMicrotask(() => { G9.hap.push({t: Math.round(performance.now()), el: tg, active: !!(WP.ed && WP.ed.g9 && document.activeElement === WP.ed.g9.field), dock: !!(WP.ed && WP.ed.g9 && WP.ed.g9.dock)}); if (G9.hap.length > 200) G9.hap.shift(); });
  });
  lb.append(inp); node.append(lb);
}
// Fokus bleibt beim Feld, wenn das Dock aktiv ist bzw. das Feld den Fokus hatte (§7.9 Nr. 2)
function g9Refocus(E) { const G = E && E.g9; if (G && G.field && (G.dock || G.hadFocus)) { try { G.field.focus({preventScroll: true}); } catch (e) {} } }
function g9Focus(E) { const G = E && E.g9; if (!G || !G.field) return; try { G.field.focus({preventScroll: true}); } catch (e) {} if (G.field.value) try { G.field.select(); } catch (e) {} }

/* ---------- Gesten: Tipp = wählen + vorspielen, Ziehen = schwenken ---------- */
function g9Gest(node, cvOf) {
  node.addEventListener('mousedown', e => { if (WP.ed && WP.ed.g9) e.preventDefault(); });
  node.addEventListener('pointerdown', e => {
    const E = WP.ed, G = E && E.g9; if (!G || G.p || e.button > 0) return;
    try { node.setPointerCapture(e.pointerId); } catch (er) {}
    G.p = {id: e.pointerId, x0: e.clientX, y0: e.clientY, t0: performance.now(), va: E.va, mode: null, cv: cvOf()};
  });
  node.addEventListener('pointermove', e => {
    const E = WP.ed, G = E && E.g9, p = G && G.p; if (!p || p.id !== e.pointerId) return;
    const dx = e.clientX - p.x0;
    if (!p.mode && Math.hypot(dx, e.clientY - p.y0) > 8) p.mode = 'pan';
    if (p.mode === 'pan') { E.va = p.va - dx / Math.max(1, p.cv.clientWidth) * E.vw.W; G.follow = null; wpPaint(); }
  });
  const end = (e, cancel) => {
    const E = WP.ed, G = E && E.g9, p = G && G.p; if (!p || p.id !== e.pointerId) return;
    G.p = null;
    if (p.mode) { G.dragT = performance.now(); return; }
    if (cancel || performance.now() - p.t0 >= 500) return;
    const cx = e.clientX - p.cv.getBoundingClientRect().left;
    UI.ghost = {t: performance.now(), x: e.clientX, y: e.clientY};
    G.tapT = performance.now();
    g9Select(g9HitK(E, cx), {tap: true});
    g9Focus(E);
  };
  node.addEventListener('pointerup', e => end(e, false));
  node.addEventListener('pointercancel', e => end(e, true));
  node.addEventListener('click', () => { const E = WP.ed; if (E && E.g9) g9Focus(E); });
}
// Treffer-Regel (§7.2): schmale Abschnitte (< 44 px) bekommen links/rechts (44 − b)/2 dazu, nur von einem Nachbarn, der ≥ 44 px behält;
// schmale Nachbarn teilen sich die Fläche (nächste Mitte gewinnt)
function g9HitK(E, cx) {
  const sx = E.g9.sx, n = sx.length; if (!n) return 0;
  const iv = sx.map(s => [s[0], s[1]]);
  for (let k = 0; k < n; k++) {
    const w = sx[k][1] - sx[k][0]; if (w >= 44) continue;
    const want = (44 - w) / 2;
    if (k > 0) { const wl = sx[k - 1][1] - sx[k - 1][0], g = Math.max(0, Math.min(want, wl - 44)); iv[k][0] -= g; }
    else iv[k][0] -= want;
    if (k < n - 1) { const wr = sx[k + 1][1] - sx[k + 1][0], g = Math.max(0, Math.min(want, wr - 44)); iv[k][1] += g; }
    else iv[k][1] += want;
  }
  let best = -1, bd = Infinity;
  for (let k = 0; k < n; k++) {
    if (cx < iv[k][0] || cx > iv[k][1]) continue;
    const c = (sx[k][0] + sx[k][1]) / 2, d = Math.abs(cx - c), narrow = sx[k][1] - sx[k][0] < 44;
    const inOwn = cx >= sx[k][0] && cx < sx[k][1];
    const sc = narrow ? d : inOwn ? d + 1e4 : d + 2e4;               // schmale zuerst (nächste Mitte), dann der eigene breite
    if (sc < bd) { bd = sc; best = k; }
  }
  if (best < 0) { for (let k = 0; k < n; k++) { const d = Math.min(Math.abs(cx - sx[k][0]), Math.abs(cx - sx[k][1])); if (d < bd) { bd = d; best = k; } } }
  return Math.max(0, best);
}

/* ---------- Wählen, Feld füllen, Nachführen ---------- */
function g9Select(k, o = {}) {
  const E = WP.ed, G = E && E.g9; if (!G) return false;
  const mk = wpMarks(E.id) || []; if (!mk.length) { wpPaint(); return false; }
  k = clamp(k | 0, 0, mk.length - 1);
  if (G.dirty && !o.keep) g9Accept(E, 'blur');
  G.sel = k; G.fk = k; G.prevW = null;
  g9Fill(E);
  g9Follow(E, k);
  wpPaint();
  if (!o.silent) {
    g9Play(E.id, k);
    if (!(UI.haptics && EL.wpSheet.classList.contains('hap') && !G.dock && o.tap)) haptic('tick');   // echter Tipp: der Tick kommt vom Label
  }
  return k;
}
function g9Fill(E) {
  const G = E.g9, C = g9Ctx(E.id); if (!C) return;
  const i = g9SylIdx(C.W, G.sel);
  let s = '';
  if (i >= 0) { const [a, b] = g9WordAt(C.W, i); s = g9Show(g9Str(C.W, a, b), C.lang); G.word = [a, b]; } else G.word = null;
  G.orig = s; G.dirty = false; G.typed = false; G.prevW = null;
  if (G.field) { G.field.value = s; if (document.activeElement === G.field) try { G.field.select(); } catch (e) {} }
  g9Tools(E, C);
}
// der gewählte Abschnitt bleibt im mittleren Drittel (weiches Nachführen ≤ 200 ms)
function g9Follow(E, k) {
  const G = E.g9; if (!E.vw || !G.sx[k]) return;
  const W = E.cv.clientWidth || 1, s = G.sx[k];
  if (s[0] >= W / 3 && s[1] <= 2 * W / 3 || (s[1] - s[0] > W / 3 && s[0] >= 0 && s[1] <= W)) return;
  const to = E.va + ((s[0] + s[1]) / 2 - W / 2) / W * E.vw.W, from = E.va, t0 = performance.now();
  G.follow = {to, from, t0};
  const step = () => { const H = WP.ed === E && E.g9 && E.g9.follow; if (!H) return; const u = Math.min(1, (performance.now() - H.t0) / 160), e = 1 - (1 - u) ** 3; E.va = H.from + (H.to - H.from) * e; wpPaint(); if (u < 1) requestAnimationFrame(step); else E.g9.follow = null; };
  requestAnimationFrame(step);
}
function g9Step(E, d) {
  const G = E.g9, mk = wpMarks(E.id) || []; if (!mk.length) return;
  if (d > 0 && G.dirty) { const r = g9Accept(E, 'next'); if (r) return; }
  g9Select(clamp(G.sel + d, 0, mk.length - 1));
}
// Werkzeug-Tasten: grau mit Grund (Toast beim Antippen)
function g9Tools(E, C) {
  const G = E.g9; C = C || g9Ctx(E.id); if (!C) return;
  const k = G.sel, i = g9SylIdx(C.W, k), pick = i >= 0 ? i : g9NextIdx(C.W, k, false);
  let grp = 0; if (i >= 0) { const p = C.W[i].pi; for (const q of C.W) if (q.pi === p && !q.nm) grp++; }
  const st = {
    sl: pick < 0 ? 'Keine Silbe ab hier' : C.W[pick].pi <= 0 ? 'Schon am Anfang' : pick > 0 && C.W[pick - 1].pi === C.W[pick].pi ? 'Schon mit der vorigen Silbe verschmolzen' : '',
    sr: pick < 0 ? 'Keine Silbe ab hier' : '',
    mg: i < 0 ? 'Keine Silbe in diesem Abschnitt' : grp >= 3 ? 'Höchstens 3 Silben auf einer Marke' : !C.W.some((q, z) => z > i && q.pi != null && q.pi !== C.W[i].pi) ? 'Keine nächste Silbe' : '',
    sp: i < 0 || grp < 2 ? 'Nur bei verschmolzenen Silben' : C.W[i].pi + 1 >= C.P.length ? 'Keine freie Marke – beide Silben bleiben zusammen.' : '',
  };
  G.why = st;
  for (const [key, b] of [['sl', G.sl], ['sr', G.sr], ['mg', G.bm], ['sp', G.bs]]) { b.classList.toggle('dis', !!st[key]); b.setAttribute('aria-disabled', String(!!st[key])); }
  const emp = !G.field || !g9Clean(G.field.value); G.bi.classList.toggle('dis', emp); G.bi.setAttribute('aria-disabled', String(emp));
}
function g9Tool(E, op) {
  const G = E.g9, key = op.op === 'shift' ? (op.d < 0 ? 'sl' : 'sr') : op.op === 'merge' ? 'mg' : 'sp';
  if (G.dirty) g9Accept(E, 'blur');
  g9Tools(E);
  if (G.why && G.why[key]) { toast(G.why[key]); return; }
  const r = g9Set(E.id, Object.assign({k: G.sel}, op));
  if (!r.ok) { if (r.err) toast(r.err); return; }
  // die Auswahl folgt der gewählten Silbe
  const C = g9Ctx(E.id); if (C && r.i0 != null && C.W[r.i0] && C.W[r.i0].k >= 0) G.sel = G.fk = C.W[r.i0].k;
  g9Fill(E); wpPaint(); g9Pulse(E);
  toast(r.toast || r.label, {label: 'Rückgängig', fn: () => undo()});
}

/* ---------- Schreiben (§6.4, §7.4) ---------- */
function g9Field(E, f) {
  f.addEventListener('pointerdown', e => e.stopPropagation());
  f.addEventListener('touchstart', e => e.stopPropagation(), {passive: true});
  f.addEventListener('focus', () => { const G = WP.ed && WP.ed.g9; if (G) G.hadFocus = true; g9Dock(); });
  f.addEventListener('blur', () => setTimeout(() => {
    const E2 = WP.ed, G = E2 && E2.g9; if (!G || G.field !== f || document.activeElement === f) return;
    G.hadFocus = false;
    if (G.dirty) g9Accept(E2, 'blur');                                  // „Fertig“: geändertes Wort übernommen
    g9Dock();
  }, 60));
  f.addEventListener('beforeinput', e => {
    const E2 = WP.ed, G = E2 && E2.g9; if (!G) return;
    // Leertaste auf dem unveränderten (markierten) Wort: nur weiter, nichts löschen
    if (e.inputType === 'insertText' && e.data === ' ' && !G.dirty) { e.preventDefault(); g9Step(E2, 1); }
  });
  f.addEventListener('keydown', e => {
    const E2 = WP.ed, G = E2 && E2.g9; if (!G) return;
    G.kd = performance.now();
    if (e.key === 'Enter') { e.preventDefault(); if (G.dirty) g9Accept(E2, 'enter'); else g9Step(E2, 1); return; }
    if (e.key === 'Backspace' && f.value === '' && !G.dirty) { e.preventDefault(); g9Back(E2); return; }
    if (e.key === 'Backspace' && f.value === '') { e.preventDefault(); g9Back(E2); return; }
  });
  f.addEventListener('input', () => {
    const E2 = WP.ed, G = E2 && E2.g9; if (!G) return;
    const t0 = performance.now();
    let v = f.value;
    G.dirty = v !== G.orig;
    if (!G.typed) { G.typed = true; g9Pulse(E2); if (!(G.last.k === G.sel && performance.now() - G.last.t < G9_REPLAY)) g9Play(E2.id, G.sel); }
    if (/\s/.test(v)) {                                                 // Leertaste: übernehmen; Rest = Anfang des nächsten Worts
      const at = v.search(/\s/), word = v.slice(0, at), rest = v.slice(at).replace(/^\s+/, '');
      f.value = word; G.dirty = word !== G.orig || (word === '' && G.orig !== '');
      g9Accept(E2, 'space');
      if (rest && WP.ed && WP.ed.g9) { const G2 = WP.ed.g9; G2.field.value = rest; G2.dirty = rest !== G2.orig; G2.typed = true; g9Preview(WP.ed); }
      G9.kt = performance.now() - t0; return;
    }
    g9Preview(E2);
    G9.kt = performance.now() - t0;
    (G9.kts || (G9.kts = [])).push(G9.kt); if (G9.kts.length > 400) G9.kts.shift();
  });
}
// Vorschau = Ergebnis nach der Leertaste (gleiche Rechnung, trocken); Bindestrich: der Rahmen geht zur nächsten Silbe desselben Worts
function g9Preview(E) {
  const G = E.g9, v = g9Clean(G.field.value);
  G.prevW = null;
  if (v) { const C = g9Ctx(E.id), r = C && g9OpWord(C, G.sel, v); if (r && !r.err) { g9Place(C, r.W); G.prevW = {W: r.W, first: r.first, last: r.last}; const h = (G.field.value.match(/-/g) || []).length; if (h !== G.hy) { const z = r.W[Math.min(r.last, r.first + h)]; if (z && z.k >= 0 && z.k !== G.fk) { G.fk = z.k; g9Pulse(E); g9Play(E.id, z.k); } G.hy = h; } } }
  else { G.fk = G.sel; G.hy = 0; }
  g9Tools(E);
  wpPaint();
}
function g9Pulse(E) { const G = E.g9; G.pulse = performance.now(); const tick = () => { if (WP.ed === E && E.g9 && performance.now() - E.g9.pulse < G9_PULSE + 20) { wpPaint(); requestAnimationFrame(tick); } else if (WP.ed === E) wpPaint(); }; requestAnimationFrame(tick); }
// übernehmen: how = 'space' | 'enter' | 'next' | 'blur' | 'plus'
function g9Accept(E, how) {
  const G = E.g9; if (!G) return false;
  const v = g9Clean(G.field.value);
  let r = null;
  if (how === 'plus') {
    if (!v) { toast('Erst ein Wort tippen'); return false; }
    r = g9Set(E.id, {op: 'ins', k: G.sel, text: v});
  } else if (!G.dirty) { if (how !== 'blur') g9Step(E, 1); return false; }
  else if (!v) r = G.word ? g9Set(E.id, {op: 'del', k: G.sel}) : null;
  else r = g9Set(E.id, {op: 'word', k: G.sel, text: v});
  G.dirty = false; G.prevW = null; G.hy = 0;
  if (!r || !r.ok) { if (r && r.err) toast(r.err); g9Fill(E); wpPaint(); return false; }
  haptic('snap');
  const C = g9Ctx(E.id);
  if (r.toast) {
    const acts = [];
    if (r.merged > 0) { const k0 = G.sel, n = r.merged; acts.push({label: 'Nachrücken', fn: () => { const r2 = g9Set(E.id, {op: 'nach', k: k0, n}); if (r2.ok) { if (WP.ed && WP.ed.g9) { g9Fill(WP.ed); wpPaint(); } toast('Nachgerückt', {label: 'Rückgängig', fn: () => undo()}); } }}); }
    acts.push({label: 'Rückgängig', fn: () => undo()});
    toast(r.toast, acts);
  }
  if (how === 'blur') { g9Fill(E); wpPaint(); return true; }
  // Rahmen springt auf den Abschnitt nach der letzten Silbe (Silben-Platz), der spielt
  let nk = G.sel;
  if (C && r.last != null && C.W[r.last]) { const p = C.W[r.last].pi; nk = p + 1 < C.P.length ? C.P[p + 1] : Math.min((wpMarks(E.id) || []).length - 1, C.W[r.last].k + 1); }
  else if (how !== 'plus' && C) nk = Math.min(C.mk.length - 1, G.sel + 1);
  if (how === 'plus' && C && r.first != null && C.W[r.first + r.n]) nk = C.W[r.first + r.n].k;
  g9Select(nk, {keep: true});
  return true;
}
// Lösch-Taste im leeren Feld: zur vorigen Silbe (Abschnitt gewählt, Wort markiert), nichts löschen
function g9Back(E) {
  const G = E.g9, C = g9Ctx(E.id); if (!C) return;
  let j = -1; for (let i = C.W.length - 1; i >= 0; i--) if (!C.W[i].nm && C.W[i].k >= 0 && C.W[i].k < G.sel) { j = C.W[i].k; break; }
  G.dirty = false;
  g9Select(j >= 0 ? j : Math.max(0, G.sel - 1));
}

/* ---------- Vorspielen eines Abschnitts (§6.7) ---------- */
function g9StopPlay(fast) {
  const s = G9.src; if (!s) return; G9.src = null;
  const c = AU.ctx; if (!c) return;
  try { const t = c.currentTime, p = s.g.gain; if (p.cancelAndHoldAtTime) p.cancelAndHoldAtTime(t); else p.cancelScheduledValues(t); p.setValueAtTime(p.value, t); p.linearRampToValueAtTime(0, t + .005); s.s.stop(t + .008); } catch (e) {}
}
function g9Play(id, k) {
  const E = WP.ed, x = E && tkRef(E.r), a = x && x.a, m = S.takes && S.takes[id], mk = wpMarks(id) || [];
  if (!a || !m || !mk[k]) return null;
  if (R.playing) { G9.ownStop = true; try { stop(); } catch (e) { logErr(e); } finally { G9.ownStop = false; } }   // F3: ▶ hält an
  ensureAudio(); const c = AU.ctx; if (!c) return null;
  const ab = WP.ab, buf = ab ? tkBuffer(id) : tkHeard(id, a), map = ab ? null : tkHeardMap(id, a); if (!buf) { tkLoad(id); return null; }
  const len = m.len / m.sr, t0 = mk[k].t, t1 = k + 1 < mk.length ? mk[k + 1].t : len;
  const A = map ? VSM.warpTime(map, t0) : t0, B0 = map ? VSM.warpTime(map, t1) : t1;
  const dur = clamp(B0 - A, .12, 4), B = Math.min(buf.duration, A + dur);
  const st = stimmeT(), dest = st >= 0 && AU.tracks[st] && AU.tracks[st].trackIn; if (!dest) return null;
  g9StopPlay();
  const s = c.createBufferSource(), g = c.createGain(), G = isNum(a.gain) ? a.gain : 1, when = c.currentTime + .01, d = Math.max(.012, B - A);
  s.buffer = buf; g.gain.setValueAtTime(0, when); g.gain.linearRampToValueAtTime(G, when + .005); g.gain.setValueAtTime(G, when + d - .005); g.gain.linearRampToValueAtTime(0, when + d);
  s.connect(g); g.connect(dest);
  try { s.start(when, Math.max(0, A)); s.stop(when + d + .005); } catch (e) { logErr(e); return null; }
  const rec = {s, g}; G9.src = rec; s.onended = () => { try { s.disconnect(); g.disconnect(); } catch (e) {} if (G9.src === rec) G9.src = null; };
  const ent = {id, k, a: +A.toFixed(6), b: +(A + d).toFixed(6), src: [t0, t1], map: map ? wpMapInfo(map).key : null, raw: buf === tkBuffer(id), ab, when, at: c.currentTime, tap: performance.now()};
  G9.play.push(ent); if (G9.play.length > 100) G9.play.shift();
  if (E && E.g9) E.g9.last = {k, t: performance.now()};
  return ent;
}

/* ---------- Zeichnen: Rahmen in der Wellenform, Silben-Leiste (§7.2) ---------- */
function g9PaintWave(E, g, P, X, Wp, Hp, mk) {
  const G = E.g9, m = S.takes && S.takes[E.id], len = m ? m.len / m.sr : 0, map = E.map;
  const endT = map ? VSM.warpTime(map, len) : len;
  G.sx = mk.map((k, j) => [X(P[j]), j + 1 < P.length ? X(P[j + 1]) : X(endT)]);
  G.X = X;
  const k = G.fk >= 0 ? G.fk : G.sel, s = G.sx[k]; if (!s) return;
  const lw = performance.now() - G.pulse < G9_PULSE ? 3 : 2;
  g.fillStyle = 'rgba(255,211,90,.18)'; g.fillRect(s[0], 0, s[1] - s[0], Hp);
  g.strokeStyle = '#ffd35a'; g.lineWidth = lw; g.strokeRect(s[0] + lw / 2, lw / 2, Math.max(1, s[1] - s[0] - lw), Hp - lw);
}
function g9PaintBar(E, mk) {
  const G = E.g9, cv = G.bcv, r = cv.getBoundingClientRect(), dpr = Math.min(3, window.devicePixelRatio || 1);
  const Wp = Math.max(1, Math.round(r.width)), Hp = Math.max(1, Math.round(r.height));
  if (cv.width !== Wp * dpr || cv.height !== Hp * dpr) { cv.width = Wp * dpr; cv.height = Hp * dpr; }
  const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.fillStyle = '#101318'; g.fillRect(0, 0, Wp, Hp);
  const x = tkRef(E.r), a = x && x.a, V = E.vw; if (!a || !V) return;
  // Hüllkurve der gehörten Fassung im Hintergrund
  const buf = WP.ab ? tkBuffer(E.id) : tkHeard(E.id, a);
  if (buf) {
    const key = wpBid(buf) + '|' + V.a + '|' + V.W + '|' + Wp; let pk = G.pk && G.pk.key === key ? G.pk.v : null;
    if (!pk) { const d = buf.getChannelData(0), sr = buf.sampleRate; pk = new Float32Array(Wp); for (let px = 0; px < Wp; px++) { const i0 = Math.max(0, Math.floor((V.a + px / Wp * V.W) * sr)), i1 = Math.min(d.length, Math.floor((V.a + (px + 1) / Wp * V.W) * sr)); let q = 0; for (let i = i0, st = Math.max(1, (i1 - i0) >> 6); i < i1; i += st) { const v = d[i] < 0 ? -d[i] : d[i]; if (v > q) q = v; } pk[px] = q; } G.pk = {key, v: pk}; }
    g.fillStyle = 'rgba(127,176,222,.30)';
    for (let px = 0; px < Wp; px++) if (pk[px] > 0) { const h = Math.max(1, Math.sqrt(pk[px]) * (Hp - 6)); g.fillRect(px, Hp - 2 - h, 1, h); }
  }
  const C = g9Ctx(E.id); if (!C) return;
  const W = G.prevW ? G.prevW.W : C.W, pv = G.prevW, {cells, extra, dash} = g9Cells(C, W);
  const sx = G.sx, ff = getComputedStyle(document.body).fontFamily;
  const fN = '600 13px ' + ff;
  const sel = G.fk >= 0 ? G.fk : G.sel;
  g.textBaseline = 'middle';
  cells.forEach((c, j) => {
    const s = sx[j]; if (!s || s[1] < 0 || s[0] > Wp) return;
    const x0 = Math.round(s[0]), x1 = Math.round(s[1]);
    g.fillStyle = '#4a5466'; g.fillRect(x0, 0, 1, Hp);
    if (j === sel) { const lw = performance.now() - G.pulse < G9_PULSE ? 3 : 2; g.fillStyle = 'rgba(255,211,90,.18)'; g.fillRect(x0, 0, x1 - x0, Hp); g.strokeStyle = '#ffd35a'; g.lineWidth = lw; g.strokeRect(x0 + lw / 2, lw / 2, Math.max(1, x1 - x0 - lw), Hp - lw); }
    g.save(); g.beginPath(); g.rect(x0 + 1, 0, Math.max(0, x1 - x0 - 2), Hp); g.clip();
    let xx = x0 + 4; const y = Hp / 2;
    const seg = (txt, col, al, dot) => { g.globalAlpha = al; g.fillStyle = col; g.font = fN; g.fillText(txt, xx, y); const tw = g.measureText(txt).width; if (dot) { g.fillStyle = col; for (let d = 0; d < tw; d += 4) g.fillRect(xx + d, y + 9, 2, 1); } xx += tw; g.globalAlpha = 1; };
    if (c.s.length) c.s.forEach((i, n) => {
      const q = W[i], isNew = pv && i >= pv.first && i <= pv.last;
      if (n) seg('·', '#8b93a3', 1);
      const unsure = isNum(q.p) && q.p < .6;
      seg(q.x, isNew ? '#ffe7a6' : q.u ? '#f2f4f8' : '#c7d3e3', isNew ? .6 : unsure ? .55 : 1, unsure);
    });
    else seg(c.kind === 'mel' ? '–' : '·', '#6c7484', 1);
    for (const i of c.over) { seg('·', '#8b93a3', 1); seg(W[i].x, '#ff5c5c', 1); }
    if (j === cells.length - 1) for (const e of extra) { seg(' ', '#000', 0); seg(W[e.i].x, '#ff5c5c', 1); }
    g.restore();
  });
  // feste Silben ohne Marke: gestrichelt an t
  for (const d of dash) {
    const xx = G.X ? G.X(E.map ? VSM.warpTime(E.map, d.t) : d.t) : -99; if (xx < -40 || xx > Wp) continue;
    g.font = fN; const tw = g.measureText(d.x).width; g.setLineDash([3, 3]); g.strokeStyle = '#f2f4f8'; g.lineWidth = 1; g.strokeRect(xx + .5, 4.5, tw + 8, Hp - 9); g.setLineDash([]);
    g.fillStyle = '#f2f4f8'; g.fillText(d.x, xx + 4, Hp / 2);
  }
}
// Info-Zeile im Text-Modus (§7.3): „Silbe 7 · Takt 3.2 · 0,42 s · ‹Wort›“
function g9InfoLine(E, mk) {
  const G = E.g9, m = S.takes && S.takes[E.id]; if (!m) return '';
  if (!mk.length) return 'Marken werden gesucht …';
  const k = G.sel; if (k < 0 || !mk[k]) return 'Abschnitt antippen';
  const x = tkRef(E.r), a = x && x.a, w = m.warp, map = E.map, len = m.len / m.sr;
  const tA = map ? VSM.warpTime(map, mk[k].t) : mk[k].t, tB = map ? VSM.warpTime(map, k + 1 < mk.length ? mk[k + 1].t : len) : (k + 1 < mk.length ? mk[k + 1].t : len);
  const t0 = w ? w.t0 : wpT0(E.id, a), bpb = grid().beatsPerBar || 4, beat = (tA - t0) / spb(), bar = Math.floor(beat / bpb + 1e-6), bt = Math.floor(beat - bar * bpb + 1e-6);
  const C = g9Ctx(E.id), i = C ? g9SylIdx(C.W, k) : -1;
  let s = 'Silbe ' + (k + 1) + ' · Takt ' + (bar + 1) + '.' + (bt + 1) + ' · ' + (tB - tA).toFixed(2).replace('.', ',') + ' s';
  if (i >= 0) { const [aa, bb] = g9WordAt(C.W, i), q = C.W[i]; s += ' · ' + (isNum(q.p) && q.p < .6 ? 'unsicher · ' : '') + C.W.slice(aa, bb + 1).map(z => z.x).join(''); }
  if (C && G9K.PH && C.W.some(q => q.p === .5)) s += ' · Silbentrennung vereinfacht';
  return s;
}
function g9AfterPaint(E, mk) {
  const G = E.g9; if (!G) return;
  g9PaintBar(E, mk);
  wpInfoTxt(g9InfoLine(E, mk));
  E.tx.classList.add('on');
}

/* ---------- Tastatur-Dock (§7.10) ---------- */
function g9Dock() {
  const E = WP.ed, G = E && E.g9, sh = EL.wpSheet; if (!G) return;
  const f = G.field, foc = document.activeElement === f, vv = window.visualViewport, ih = window.innerHeight;
  const vis = G9.kb != null ? G9.kb : vv ? vv.height : ih, top0 = G9.kb != null ? 0 : vv ? vv.offsetTop : 0;
  const on = foc && vis < ih - 120;
  if (!on) { if (G.dock) { G.dock = null; g9Undock(sh); sh.classList.toggle('hap', !!UI.haptics); requestAnimationFrame(() => { g9Fit(E); wpPaint(); }); } return; }
  const land = window.innerWidth > ih, H = land ? (vis >= 118 ? 118 : 88) : (vis >= 300 ? 300 : vis >= 250 ? 250 : 200);
  const cls = land ? 'q' + H : 'd' + H;
  if (!G.dock || G.dock.cls !== cls) { g9Undock(sh); sh.classList.add('g9dock', cls); }
  sh.classList.toggle('hap', false);                                   // ohne Probe-Ergebnis (G9-61): Labels nur ohne Tastatur
  Object.assign(sh.style, {top: Math.round(top0 + vis - H) + 'px', left: '0px', width: window.innerWidth + 'px', height: H + 'px'});
  const was = G.dock; G.dock = {H, cls, vis};
  try { const se = document.scrollingElement || document.documentElement; if (se.scrollTop) se.scrollTop = 0; if (window.scrollY) window.scrollTo(0, 0); } catch (e) {}
  if (!was || was.cls !== cls) requestAnimationFrame(() => { g9Fit(E); wpPaint(); });
}

/* ---------- [Ganzer Text] (§7.7) ---------- */
function g9TextSheet(anchor) {
  const E = WP.ed; if (!E || !E.g9) return;
  const id = E.id, C = g9Ctx(id); if (!C) return;
  if (E.g9.dirty) g9Accept(E, 'blur');
  // vorbelegt mit dem vorhandenen Text (Zeilen aus w: 2)
  const lines = []; let cur = null, wd = null;
  for (const q of C.W) { if (q.w === 2 || !cur) { cur = []; lines.push(cur); } if (q.w || !wd || !cur.length) { wd = [q.x]; cur.push(wd); } else wd.push(q.x); }
  const txt = lines.map(l => l.map(w => g9Show(w, C.lang)).join(' ')).join('\n');
  let lang = C.m.ly ? C.lang : 'auto';
  openPop(anchor, p => {
    guardTouch(p); p.classList.add('g9txt');
    p.innerHTML = `<h4>Ganzer Text</h4><textarea class="g9ta" rows="6" maxlength="20000" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="Songtext" placeholder="Songtext einfügen">${esc(txt)}</textarea>` +
      `<div class="qnote">Zeilen = Atempausen. Silben trennt die App; eigene Bindestriche gelten.</div>` +
      `<div class="g9lr"><div class="seg g9lang"><button data-l="de">Deutsch</button><button data-l="en">Englisch</button><button data-l="auto">Auto</button></div>` +
      `<button class="mbtn rb g9ok" data-a="ok">✓ Verteilen</button></div>`;
    const ta = p.querySelector('.g9ta'), seg = p.querySelector('.g9lang');
    const paintL = () => seg.querySelectorAll('button').forEach(b => { const on = b.dataset.l === lang; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
    paintL();
    seg.addEventListener('click', e => { const b = e.target.closest('button[data-l]'); if (b) { lang = b.dataset.l; paintL(); } });
    ta.addEventListener('pointerdown', e => e.stopPropagation()); ta.addEventListener('touchstart', e => e.stopPropagation(), {passive: true});
    on(ta, 'focus', () => popDock(p, true)); on(ta, 'blur', () => setTimeout(() => popDock(p), 50));
    onTap(p, () => { const v = ta.value; closePop(); const r = g9Set(id, {op: 'text', text: v, lang}); if (r && r.ok) { if (WP.ed && WP.ed.g9 && WP.ed.id === id) { g9Fill(WP.ed); wpPaint(); } toast(r.toast, {label: 'Rückgängig', fn: () => undo()}); } }, 'button[data-a="ok"]');
  }, {name: 'g9text'});
  popDock(UI.pop && UI.pop.el);
}

/* ---------- [Erkennen] (§7.8) – Andock-Stelle für Zweig g9-br-E (G9.rec), ohne Modell ausgeblendet ----------
   G9.rec = {cached(): bool, size(): {how, mb}, load(onMB) → Promise, recognize(id, {lang}) → Promise<{words: [{w, a, b, p?}], lang, ms, how, chunks}>,
             remove() → Promise, stop()}  (Wort-Zeiten a, b in Take-Sekunden) */
function g9RecSheet(anchor) {
  const E = WP.ed, rc = g9Rec(); if (!E || !E.g9 || !rc) return;
  const id = E.id, C = g9Ctx(id), has = !!(C && C.W.length), first = !(rc.cached && rc.cached());
  const pf = (typeof stProf === 'function' && stProf()) || {}, pg = pf.g9 || {};
  let lang = pg.lang || 'auto', auto = pg.auto !== false;
  openPop(anchor, p => {
    guardTouch(p); p.classList.add('g9rs');
    const sz = rc.size ? rc.size() : {mb: 80};
    p.innerHTML = `<h4>${first ? 'Worte erkennen' : 'Erkennen'}</h4>` +
      (first ? `<div class="qnote">Worte erkennen: lädt einmal ein Sprachmodell (≈ ${Math.round(sz.mb || 80)} MB) auf dieses Gerät. Danach ohne Internet. Der Gesang bleibt auf dem Gerät.</div>`
        : `<div class="qnote">Sprachmodell auf diesem Gerät: ${Math.round(sz.mb || 0)} MB <button class="rb g9rm" data-a="rm">Entfernen</button></div>`) +
      `<div class="seg g9lang"><button data-l="auto">Auto</button><button data-l="de">Deutsch</button><button data-l="en">Englisch</button></div>` +
      `<label class="g9auto"><input type="checkbox" ${auto ? 'checked' : ''}> Neue Aufnahmen automatisch erkennen</label>` +
      `<div class="savrow">` + (first ? `<button class="mbtn rb" data-a="go">Laden und erkennen</button><button class="mbtn rb" data-a="no">Abbrechen</button>`
        : has ? `<button class="mbtn rb" data-a="fill">Lücken füllen</button><button class="mbtn rb" data-a="all">Alles ersetzen</button>` : `<button class="mbtn rb" data-a="all">Erkennen</button>`) + `</div>`;
    const seg = p.querySelector('.g9lang'), paintL = () => seg.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.l === lang));
    paintL(); seg.addEventListener('click', e => { const b = e.target.closest('button[data-l]'); if (b) { lang = b.dataset.l; paintL(); } });
    const cb = p.querySelector('.g9auto input'); cb.addEventListener('change', () => { auto = cb.checked; });
    onTap(p, bt => {
      const a = bt.dataset.a; closePop();
      try { if (typeof stProf === 'function') { const P = stProf(); if (P) { P.g9 = Object.assign({}, P.g9, {auto, lang}); if (typeof stProfSave === 'function') stProfSave(); } } } catch (e) { logErr(e); }
      if (a === 'rm') { Promise.resolve(rc.remove && rc.remove()).then(() => toast('Sprachmodell entfernt')); return; }
      if (a === 'no') return;
      g9RecRun(id, {lang, mode: a === 'fill' ? 'fill' : 'all'});
    }, 'button[data-a]');
  }, {name: 'g9rec'});
}
// Ergebnis der Erkennung ausrichten (§6.6.8): Wort-Zeiten als Anker, feste Silben bleiben; ein Undo „Erkennen“
async function g9RecRun(id, o) {
  const rc = g9Rec(); if (!rc) return null;
  try { if (typeof saveNow === 'function') saveNow(); } catch (e) {}
  wpInfoTxt('Erkennen …');
  let res;
  try { res = await rc.recognize(id, {lang: o.lang}); } catch (e) { logErr(e); wpInfoTxt('Erkennen fehlgeschlagen'); return null; }
  if (!res || !res.words) return null;
  const C = g9Ctx(id); if (!C || !C.mk.length) return res;
  const L = res.lang === 'en' ? 'en' : 'de', sy = [], tau = [];
  for (const wd of res.words) {
    const parts = g9Syl(wd.w, L); if (!parts.length) continue;
    const span = Math.max(.05, (wd.b - wd.a)), wt = parts.map(x => Math.max(1, (x.match(/[aeiouäöüy]/gi) || []).length)), tot = wt.reduce((s, v) => s + v, 0);
    let acc = 0; parts.forEach((x, q) => { sy.push({x, w: q ? 0 : 1, p: isNum(wd.p) ? wd.p : undefined}); tau.push(wd.a + span * acc / tot); acc += wt[q]; });
  }
  // feste Silben (u) bleiben; „Lücken füllen“: vorhandene Silben bleiben auf ihren Marken, neue nur in freie Strecken
  const keep = C.W.filter(q => q.u || (o.mode === 'fill' && !q.nm && q.k >= 0 && !q.o));
  const occ = new Set(keep.map(q => q.k));
  const add = sy.map((q, i) => Object.assign(q, {tau: tau[i]})).filter(q => { if (o.mode !== 'fill') return true; let b = 0, bd = 1e9; C.mk.forEach((k, j) => { const d = Math.abs(k.t - q.tau); if (d < bd) { bd = d; b = j; } }); return !occ.has(b); });
  const all = keep.map(q => ({x: q.x, w: q.w, u: 1, t: C.mk[q.k] ? C.mk[q.k].t : q.t, keepU: q.u, p: q.p, tt: C.mk[q.k] ? C.mk[q.k].t : q.t})).concat(add.map(q => ({x: q.x, w: q.w, p: q.p, tt: q.tau, tau: q.tau})));
  all.sort((x, y) => x.tt - y.tt);
  const al = G9K.align(all, C.mk, C.F, {len: C.m.len / C.m.sr, tau: all.map(q => (q.tau != null ? q.tau : undefined))});
  const PS = new Set(C.P); al.forEach(v => { if (!v.o && v.k >= 0) PS.add(v.k); }); C.P = [...PS].sort((x, y) => x - y); const pm = new Map(C.P.map((j, p) => [j, p]));
  let ext = C.P.length;
  const W = all.map((q, i) => ({x: q.x, w: q.w, u: q.keepU ? 1 : 0, p: q.p, k: al[i].k, o: al[i].o, pi: al[i].o ? ext++ : pm.get(al[i].k)}));
  if (W.length && !W[0].w) W[0].w = 1;
  g9Commit(C, W, 'Erkennen', {src: 'erkannt', lang: L});
  const ns = res.words.filter(w => isNum(w.p) && w.p < .6).length;
  wpInfoTxt(res.words.length + ' Wörter erkannt' + (ns ? ' · ' + ns + ' unsicher' : ''));
  if (WP.ed && WP.ed.g9 && WP.ed.id === id) { g9Fill(WP.ed); wpPaint(); }
  return res;
}

/* ---------- Test-API ---------- */
function g9InfoApi() {
  const E = WP.ed, G = E && E.g9;
  const kts = (G9.kts || []).slice().sort((a, b) => a - b);
  return {loaded: G9.loaded, ms: +G9.ms.toFixed(2), ph: !!G9K.PH, sm: Object.assign({}, G9.sm), job: G9.job.size, hold: G9.hold, auto: G9.auto.size, rec: !!g9Rec(),
    mem: {wasm: null, model: null}, kt: {med: kts.length ? kts[kts.length >> 1] : null, max: kts.length ? kts[kts.length - 1] : null, n: kts.length},
    ed: G ? {sel: G.sel, fk: G.fk, prev: G.prevW ? g9BuildS(G.prevW.W, wpMarks(E.id) || []) : null, dock: G.dock ? Object.assign({}, G.dock) : null, kb: G9.kb, field: G.field.value, dirty: G.dirty, focus: document.activeElement === G.field,
      short: G.tl.classList.contains('short'), hap: EL.wpSheet.classList.contains('hap'), zoom: E.zoom, why: Object.assign({}, G.why)} : null};
}
function g9GeomApi() {
  const E = WP.ed, G = E.g9, r = E.cv.getBoundingClientRect(), br = G.bcv.getBoundingClientRect(), R2 = n => { const q = n.getBoundingClientRect(); return {x: q.left, y: q.top, w: q.width, h: q.height}; };
  return {wave: {x: r.left, y: r.top, w: r.width, h: r.height}, bar: {x: br.left, y: br.top, w: br.width, h: br.height}, sheet: R2(EL.wpSheet), field: R2(G.field),
    sx: G.sx.map(s => [r.left + s[0], r.left + s[1]]), btn: Object.fromEntries([['prev', G.bp], ['ins', G.bi], ['next', G.bn], ['sl', G.sl], ['sr', G.sr], ['mg', G.bm], ['sp', G.bs], ['tx', G.bt], ['x', G.bx], ['rec', G.rb], ['text', E.tx]].map(([k, n]) => [k, n && n.offsetParent ? R2(n) : null]))};
}
