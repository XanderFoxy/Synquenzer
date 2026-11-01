<script>
/* ===== MAGIC (Magic Scale): Wischen im Tonraster, Pause / Pause +, Akkord-Umkehrung, Takt-Leiste halten + ziehen (Ripple) =====
   Eine eigene Werkzeug-Zeile im Noten-Editor (CSS .prms, Präfix ms…). PianoRoll ruft die Haken nur, wenn opts.msKey gesetzt ist.
   Wischen: jede Rasterzelle unter dem Finger = eine Note; die Höhe rastet auf erlaubte Töne der Tonart der Stelle (Modus Tonart /
   Terzen / Terz+Quinte, nächste Lage zur Fingerhöhe); übersprungene Zellen werden aus der Linie gefüllt; nach links = Noten dieses
   Zugs wieder weg. Ein Undo-Schritt je Geste (über das model von PianoRoll). Keine neuen Felder im Projekt. */
(function (G) {
  'use strict';
  const MSP = {mode: 'scale'};                                     // überlebt das Schließen des Editors (wie ROLLP); Werkzeug und Tonart nicht
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const PC = n => ((n % 12) + 12) % 12;
  const SC0 = {ionian: [0, 2, 4, 5, 7, 9, 11], aeolian: [0, 2, 3, 5, 7, 8, 10]};
  const NN = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
  const MODE_DE = {ionian: 'Dur', aeolian: 'Moll', dorian: 'dorisch', phrygian: 'phrygisch', lydian: 'lydisch', mixolydian: 'mixolydisch', locrian: 'lokrisch'};
  const HOLD_MS = 350, SLOP = 7, CH_TOL = .07, VEL_HEAR = .45;
  const TOOLS = {msWipe: 'Wischen', msRest: 'Pause', msIns: 'Pause +', msChord: 'Akkorde'};
  const MODES = [['scale', 'Tonart'], ['third', 'Terzen'], ['triad', 'Terz+Quinte']];
  const CSS = `
.pr>.pr-bar.prms{display:none;grid-column:1/-1;grid-row:6;border-top:1px solid var(--line,#2d323c)}
.pr.ms-on{grid-template-rows:auto 26px minmax(0,1fr) var(--pr-vh,56px) auto auto}
.pr.ms-on>.pr-bar.prms{display:flex}
.pr-bar.prms button{min-height:44px;height:44px}
.pr-bar.prms .ms-lbl{flex:none;font-size:9px;letter-spacing:.08em;color:var(--text-dim,#9aa0aa);padding:0 2px}
.ms-kp{position:absolute;left:6px;right:6px;bottom:6px;z-index:5;padding:8px;border-radius:8px;background:#0b0c0ff2;box-shadow:0 4px 18px #000a;
  display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:4px;touch-action:manipulation}
.ms-kp[hidden]{display:none}
.ms-kp button{min-height:44px;border:0;border-radius:6px;font:700 13px var(--font-ui,system-ui);color:var(--text,#ece8df);background:var(--chassis-2,#1c1f25)}
.ms-kp button.on{background:var(--sel,#f4f1ea);color:#111}
.ms-kp .w2{grid-column:span 2}.ms-kp .w3{grid-column:span 3}`;

  function attach(K) {
    const {E, V, opts, model} = K;
    const st = {on: false, manual: null, hold: null, rip: null, chords: null, chSig: ''};
    const row = K.mk('div', 'pr-bar prms'); row.setAttribute('aria-label', 'Magic Scale');
    K.root.appendChild(row);
    if (!document.getElementById('ms-css')) { const s = document.createElement('style'); s.id = 'ms-css'; s.textContent = CSS; document.head.appendChild(s); }
    const B = {};
    B.magic = K.btn(K.bar, 'Magic', () => setOn(!st.on), 'Magic Scale: Wischen, Pausen, Akkord-Umkehrung');
    for (const k in TOOLS) B[k] = K.btn(row, TOOLS[k], () => setTool(k), {msWipe: 'Wischen: Noten im Raster malen, nur Töne der Tonart', msRest: 'Pause: Rasterzelle still machen', msIns: 'Pause einschieben: alles danach rückt eine Zelle weiter', msChord: 'Akkorde erkennen und umkehren'}[k]);
    B.sep1 = row.appendChild(K.mk('span', 'sep'));
    B.modes = MODES.map(([m, l]) => { const b = K.btn(row, l, () => { MSP.mode = m; K.render(); }, 'Modus ' + l); b.dataset.msMode = m; return b; });
    B.key = K.btn(row, 'Auto', () => keyPick(), 'Tonart für das Wischen (Auto = erkannt)');
    B.inUp = K.btn(row, 'Umk. ▲', () => invert(1), 'Umkehrung nach oben (tiefster Ton eine Oktave höher)');
    B.inDn = K.btn(row, 'Umk. ▼', () => invert(-1), 'Umkehrung nach unten (höchster Ton eine Oktave tiefer)');
    B.smooth = K.btn(row, 'Glatt', () => smooth(), 'Umkehrungen mit glatter Stimmführung wählen');
    // Tonart-Auswahl: Auto · 12 Grundtöne · Dur / Moll (auf der Notenfläche, schließt mit der Wahl oder ✕)
    const kp = K.mk('div', 'ms-kp'); kp.hidden = true; K.mainEl.appendChild(kp);
    ['pointerdown', 'pointerup', 'touchstart'].forEach(ev => kp.addEventListener(ev, e => e.stopPropagation()));

    function setOn(on) {
      st.on = !!on; K.root.classList.toggle('ms-on', st.on);
      if (st.on) { if (!TOOLS[E.tool]) setTool('msWipe'); }
      else { if (TOOLS[E.tool]) K.setTool('draw'); kp.hidden = true; }
      K.render();
    }
    function setTool(k) { if (!TOOLS[k]) return; if (!st.on) { st.on = true; K.root.classList.add('ms-on'); } E.tool = k; if (k !== 'msChord' && k !== 'msRest' && E.sel.size > 1) E.sel.clear(); kp.hidden = true; K.render(); }
    const owns = t => !!TOOLS[t];

    // ---------- Tonart der Stelle ----------
    const nnames = () => { try { const n = opts.msNoteNames && opts.msNoteNames(); if (n && n.length === 12) return n; } catch (e) {} return NN; };
    const scaleArr = sc => { const H = typeof Harmony !== 'undefined' && Harmony.SCALES; return (H && H[sc]) || SC0[sc] || SC0.ionian; };
    function autoKey(beat) { let k = null; try { k = opts.msKey ? opts.msKey(beat) : null; } catch (e) { k = null; } k = k || K.clip().key || {root: 0, scale: 'ionian'}; const H = typeof Harmony !== 'undefined' && Harmony.SCALES; return {root: PC(k.root | 0), scale: (H && H[k.scale]) || SC0[k.scale] ? k.scale : 'ionian'}; }
    const keyAt = beat => st.manual || autoKey(beat);
    function keyLabel(k) {
      if (opts.msKeyName) { try { const s = opts.msKeyName(k); if (s) return s; } catch (e) {} }
      const r = nnames()[k.root]; return k.scale === 'ionian' ? r + '-Dur' : k.scale === 'aeolian' ? r.toLowerCase() + '-Moll' : r + ' ' + (MODE_DE[k.scale] || k.scale);
    }
    function keyPick() {
      if (!kp.hidden) { kp.hidden = true; return; }
      const cur = st.manual, ak = autoKey(viewBeat());
      let h = `<button class="w3${cur ? '' : ' on'}" data-a="auto">Auto · ${esc(keyLabel(ak))}</button><button class="w2${cur && cur.scale === 'ionian' ? ' on' : ''}" data-s="ionian">Dur</button><button class="${cur && cur.scale === 'aeolian' ? 'on' : ''}" data-s="aeolian">Moll</button>`;
      const nm = nnames(), r0 = cur ? cur.root : ak.root;
      for (let r = 0; r < 12; r++) h += `<button data-r="${r}" class="${cur && cur.root === r ? 'on' : ''}">${esc(nm[r])}</button>`;
      kp.innerHTML = h; kp.hidden = false; kp.dataset.r = String(r0);
      kp.querySelectorAll('button').forEach(b => K.bindTap(b, () => {
        if (b.dataset.a) { st.manual = null; kp.hidden = true; }
        else if (b.dataset.s) { st.manual = {root: st.manual ? st.manual.root : +kp.dataset.r, scale: b.dataset.s}; kp.hidden = true; }
        else { const sc = st.manual ? st.manual.scale : (ak.scale === 'aeolian' ? 'aeolian' : 'ionian'); st.manual = {root: +b.dataset.r, scale: sc}; kp.dataset.r = b.dataset.r; keyPick(); keyPick(); return; }
        K.render();
      }));
    }
    const esc = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'})[c]);
    const viewBeat = () => clamp(V.x0 + V.W / V.ppb / 2, 0, Math.max(0, K.L() - 1e-6));

    // ---------- erlaubte Töne ----------
    // Stufe (absolut: Oktave·k + Index) oder null, wenn der Ton nicht in der Tonart liegt
    function degOf(n, key) { const S = scaleArr(key.scale), i = S.indexOf(PC(n - key.root)); return i < 0 ? null : Math.floor((n - key.root) / 12) * S.length + i; }
    function allowed(n, key, mode, anchor) {
      const d = degOf(n, key); if (d == null) return false;
      if (mode === 'scale' || anchor == null) return true;
      const k = scaleArr(key.scale).length, r = (((d - anchor) % k) + k) % k;
      if (mode === 'third') return (((d - anchor) % 2) + 2) % 2 === 0;
      return r === 0 || r === 2 || r === 4;
    }
    // nächster erlaubter Ton zur Fingerhöhe (rf = Zeile als Kommazahl); Gleichstand: obere Zeilenhälfte = der höhere
    function nearest(rf, key, mode, anchor) {
      const p0 = K.noteOfRow(rf), up = rf - Math.floor(rf) < .5;
      for (let d = 0; d <= 24; d++) {
        const a = p0 + (up ? d : -d), b = p0 - (up ? d : -d);
        if (a >= K.LO && a <= K.HI && allowed(a, key, mode, anchor)) return a;
        if (b >= K.LO && b <= K.HI && allowed(b, key, mode, anchor)) return b;
      }
      return clamp(p0, K.LO, K.HI);
    }
    // mit Hysterese: der Ton wechselt erst, wenn der Finger ⅓ Zeile über die Grenze hinaus ist (kein Flackern, kein Ton-Gewitter)
    function pitchAt(y, key, mode, anchor, cur) {
      const rf = K.rowAt(y), c = nearest(rf, key, mode, anchor);
      if (cur == null || c === cur) return c;
      const rc = K.rowOfNote(cur) + .5, r2 = rf + Math.sign(rc - rf) * .35;
      return nearest(r2, key, mode, anchor) === cur ? cur : c;
    }
    const stepOf = () => K.GRID[E.grid] || E.noteLen || .25;
    const hear = (n, v) => { if (model.audition) { try { model.audition(n, v == null ? VEL_HEAR : v); } catch (e) {} } };

    // ---------- Gesten auf der Notenfläche ----------
    function promote(g) {
      const tool = E.tool, step = stepOf();
      if (tool === 'msChord') { K.begin('marquee', {rect: {x: g.p0.x, y: g.p0.y, w: 0, h: 0}}); return true; }
      const k0 = Math.floor(g.beat0 / step + 1e-6);
      if (tool === 'msWipe') {
        if (k0 * step >= K.L() - 1e-9 || k0 < 0) return false;
        E.sel.clear();
        K.begin('ms', {ms: 'wipe', step, cells: new Map(), anchor: null, last: k0 - 1, lastBeat: g.beat0, lastY: g.p0.y, mode: MSP.mode});
        wipeTo(K.gst(), g.p0); return true;
      }
      if (tool === 'msRest' || tool === 'msIns') {
        const c = K.clip();
        K.begin('ms', {ms: tool === 'msRest' ? 'rest' : 'ins', step, k0, orig: c.notes.slice(), pos: c.notes.map(n => ({t: n.t, o: n.o})), len0: c.len});
        msDrag(K.gst(), g.p0); return true;
      }
      return false;
    }
    function wipeCell(g, k, y, hearIt) {
      const t = +(k * g.step).toFixed(6); if (t < 0 || t >= K.L() - 1e-9) return null;
      const key = keyAt(t), c = g.cells.get(k);
      if (c) {
        const n = pitchAt(y, key, g.mode, g.anchor, c.n); if (n === c.n) return null;
        c.n = n; if (c.note) { if (dupAt(t, n, c.note)) { K.dropNote(c.note); c.note = null; } else c.note.n = n; } else if (!dupAt(t, n, null)) c.note = K.addNote(t, n, noteD(g), opts.defVel);
        g.changed = true; return n;
      }
      const n = pitchAt(y, key, g.mode, g.anchor, null);
      if (g.anchor == null) g.anchor = degOf(n, key);
      const note = dupAt(t, n, null) ? null : K.addNote(t, n, noteD(g), opts.defVel);
      g.cells.set(k, {n, note}); if (note) g.changed = true;
      return n;
    }
    const noteD = g => (E.noteLen ? Math.min(E.noteLen, g.step) : g.step);
    const dupAt = (t, n, self) => K.clip().notes.some(x => x !== self && x.n === n && Math.abs(x.t - t) < 1e-6);
    function wipeTo(g, p) {
      const beat = K.beatAt(p.x), k = Math.floor(beat / g.step + 1e-6);
      let heard = null;
      if (k < g.last) {                                             // zurück: die Noten dieses Zugs rechts vom Finger fallen weg
        for (const [j, c] of g.cells) if (j > k) { if (c.note) K.dropNote(c.note); g.cells.delete(j); g.changed = true; }
        g.last = k;
      }
      if (k > g.last) {
        const span = beat - g.lastBeat;
        for (let j = g.last + 1; j <= k; j++) {
          const f = j === k || Math.abs(span) < 1e-9 ? 1 : clamp(((j + .5) * g.step - g.lastBeat) / span, 0, 1);
          const n = wipeCell(g, j, g.lastY + (p.y - g.lastY) * f); if (n != null) heard = n;
        }
        g.last = k;
      } else { const n = wipeCell(g, k, p.y); if (n != null) heard = n; }
      g.lastBeat = beat; g.lastY = p.y;
      if (heard != null) { hear(heard); const kk = keyAt(k * g.step); K.say(K.nm(heard) + ' · ' + keyLabel(kk)); }
    }
    function msDrag(g, p) {
      const c = K.clip(), k = Math.floor(K.beatAt(p.x) / g.step + 1e-6);
      if (g.ms === 'wipe') { wipeTo(g, p); return; }
      if (g.ms === 'rest') {
        const a = Math.min(g.k0, k), b = Math.max(g.k0, k), sel = E.sel.size ? E.sel : null;
        const keep = g.orig.filter(n => { const j = Math.floor(n.t / g.step + 1e-6); return !(j >= a && j <= b && (!sel || sel.has(n))); });
        c.notes = keep; g.changed = keep.length !== g.orig.length; g.cnt = b - a + 1;
        K.say(g.changed ? 'Pause · ' + (b - a + 1) + (b - a ? ' Zellen' : ' Zelle') : 'Hier ist schon Pause');
        return;
      }
      // ins: alles ab Zelle k0 rückt um n Zellen (n = 1 + Zellen nach rechts gezogen), im Raster; Clip wächst bis 64 Takte
      const s0 = g.k0 * g.step; let n = Math.max(1, k - g.k0 + 1);
      let maxEnd = 0; g.orig.forEach((x, i) => { if (g.pos[i].t >= s0 - 1e-9) maxEnd = Math.max(maxEnd, g.pos[i].t + x.d); });
      n = Math.max(0, Math.min(n, Math.floor((64 * 4 - maxEnd) / g.step + 1e-6)));
      const q = n * g.step;
      g.orig.forEach((x, i) => { const P = g.pos[i]; if (P.t >= s0 - 1e-9) { x.t = +(P.t + q).toFixed(6); if (q) delete x.o; else if (P.o != null) x.o = P.o; } else { x.t = P.t; if (P.o != null) x.o = P.o; } });
      c.notes = g.orig.slice();
      const need = maxEnd ? Math.ceil((maxEnd + q) / 4 - 1e-6) : g.len0; c.len = clamp(Math.max(g.len0, need), 1, 64);
      g.changed = n > 0 && g.orig.some((x, i) => g.pos[i].t >= s0 - 1e-9); g.cnt = n;
      K.say(g.changed ? 'Pause + ' + n + (n > 1 ? ' Zellen' : ' Zelle') : 'Dahinter liegt nichts');
    }
    function up(g) { if (g.ms === 'wipe') { const ns = [...g.cells.values()].filter(c => c.note).map(c => c.note); if (ns.length) E.sel = new Set(ns); } }
    const label = g => ({wipe: 'Wischen', rest: 'Pause', ins: 'Pause einschieben'})[g.ms] || 'Magic';
    // Tippen (ohne Ziehen): Wischen = eine Note, Pause / Pause + = eine Zelle, Akkorde = Akkord wählen
    function tap(g) {
      const tool = E.tool;
      if (tool === 'msChord') {
        const ch = chordAt(g.hit ? g.hit.note : null, g.beat0);
        if (ch) { E.sel = new Set(ch.notes); ch.notes.forEach(n => hear(n.n, .4)); K.say(ch.name + ' · ' + invName(ch)); } else E.sel.clear();
        return;
      }
      if (!promote(g)) return;                                    // promote → begin(): genau ein model.begin()
      const gg = K.gst(); if (gg.ms === 'wipe') up(gg);
      K.sortNotes(); model.end(!!gg.changed, label(gg)); K.afterExternal();
    }

    // ---------- Akkorde ----------
    function chords() {
      const c = K.clip(), sig = c.notes.length + ':' + c.notes.map(n => n.t + '/' + n.n).join(',');
      if (st.chords && st.chSig === sig) return st.chords;
      const ns = c.notes.slice().sort((a, b) => a.t - b.t || a.n - b.n), out = [];
      let cur = null;
      for (const n of ns) { if (cur && n.t - cur.t <= CH_TOL) cur.notes.push(n); else { cur = {t: n.t, notes: [n]}; out.push(cur); } }
      st.chords = out.filter(g => g.notes.length >= 3).map(g => Object.assign(g, describe(g.notes))); st.chSig = sig;
      return st.chords;
    }
    function describe(ns) {
      const H = typeof Harmony !== 'undefined' ? Harmony : null, ps = ns.map(n => n.n), nm = nnames();
      const d = H ? H.detectChord(ps) : null;
      if (!d || d.kind !== 'chord') { const lo = Math.min(...ps); return {name: nm[PC(lo)] + '?', inv: 0, det: d}; }
      const suf = H.SUFFIX[d.quality] || '';
      return {name: nm[d.root] + suf + (d.bass !== d.root ? '/' + nm[d.bass] : ''), inv: d.inversion, det: d};
    }
    const invName = ch => (ch.inv ? ch.inv + '. Umkehrung' : 'Grundstellung');
    function chordAt(note, beat) {
      const cs = chords();
      if (note) { const c = cs.find(x => x.notes.includes(note)); if (c) return c; }
      return cs.find(x => beat >= x.t - .05 && beat < x.t + Math.max(...x.notes.map(n => n.d))) || null;
    }
    function chordScope() {
      const cs = chords();
      if (E.sel.size) return cs.filter(c => c.notes.some(n => E.sel.has(n)));
      if (E.loop) return cs.filter(c => c.t >= E.loop.a * 4 - 1e-9 && c.t < (E.loop.b + 1) * 4 - 1e-9);
      return cs;
    }
    // eine Umkehrung auf Tonhöhen-Feld (gleiche Reihenfolge wie die Noten): ▲ tiefster +12, ▼ höchster −12 (nie auf einen vorhandenen Ton)
    function invStep(ps, dir) {
      const q = ps.slice(); let i = 0;
      for (let k = 1; k < q.length; k++) if (dir > 0 ? q[k] < q[i] : q[k] > q[i]) i = k;
      let m = q[i] + 12 * dir; while (q.some((x, k) => k !== i && x === m)) m += 12 * dir;
      if (m < K.LO || m > K.HI) return null;
      q[i] = m; return q;
    }
    function invert(dir) {
      const cs = chordScope(); if (!cs.length) { K.say('Kein Akkord (mind. 3 Noten zugleich)'); return; }
      model.begin(); let ok = true;
      const res = cs.map(c => invStep(c.notes.map(n => n.n), dir));
      if (res.some(r => !r)) ok = false;
      else cs.forEach((c, i) => c.notes.forEach((n, j) => { n.n = res[i][j]; }));
      K.sortNotes(); model.end(ok, dir > 0 ? 'Umkehrung ▲' : 'Umkehrung ▼'); st.chords = null; K.afterExternal();
      if (!ok) { K.say('Außerhalb des Tonumfangs'); return; }
      const c0 = chords().find(x => x.notes.includes(cs[0].notes[0]));
      if (c0) { c0.notes.forEach(n => hear(n.n, .4)); K.say(c0.name + ' · ' + invName(c0)); }
    }
    // Abstand zweier Lagen: jede Stimme zum nächsten Ton der anderen (beide Richtungen)
    function vlCost(a, b) { let s = 0; for (const x of a) s += Math.min(...b.map(y => Math.abs(x - y))); for (const y of b) s += Math.min(...a.map(x => Math.abs(x - y))); return s; }
    function smooth() {
      const all = chords(), cs = chordScope(); if (!cs.length) { K.say('Kein Akkord (mind. 3 Noten zugleich)'); return; }
      const i0 = all.indexOf(cs[0]);
      let prev = i0 > 0 ? all[i0 - 1].notes.map(n => n.n) : null, n = 0;
      model.begin();
      for (const c of cs) {
        const cur = c.notes.map(x => x.n);
        if (!prev) { prev = cur; continue; }
        const cand = [cur];
        for (const dir of [1, -1]) { let q = cur; for (let k = 0; k < cur.length * 2; k++) { q = invStep(q, dir); if (!q) break; cand.push(q); } }
        let best = cur, bc = vlCost(cur, prev);
        for (const q of cand) { const v = vlCost(q, prev); if (v < bc - 1e-9) { bc = v; best = q; } }
        if (best !== cur) { c.notes.forEach((x, j) => { x.n = best[j]; }); n++; }
        prev = best;
      }
      K.sortNotes(); model.end(n > 0, 'Stimmführung glatt'); st.chords = null; K.afterExternal();
      K.say(n ? 'Glatt: ' + n + (n > 1 ? ' Akkorde' : ' Akkord') + ' umgekehrt' : 'Schon glatt');
    }

    // ---------- Takt-Leiste halten + ziehen (Ripple), nur mit offener Magic-Zeile ----------
    K.rulerEl.addEventListener('pointerdown', e => {
      if (!st.on) return; clearTimeout(st.hold && st.hold.timer);
      const r = K.rulerEl.getBoundingClientRect(), h = {id: e.pointerId, x: e.clientX - r.left, y: e.clientY - r.top, armed: false};
      h.timer = setTimeout(() => {
        if (st.hold !== h) return; const s0 = ripStart0(h.x); if (s0 == null) { st.hold = null; return; }
        h.armed = true; h.s0 = s0; if (opts.onTick) opts.onTick(); K.say('Ab Takt ' + (Math.floor(s0 / 4) + 1) + ' verschieben'); K.render();
      }, HOLD_MS);
      st.hold = h;
    });
    K.rulerEl.addEventListener('pointermove', e => { const h = st.hold; if (!h || h.id !== e.pointerId || h.armed) return; const r = K.rulerEl.getBoundingClientRect(); if (Math.hypot(e.clientX - r.left - h.x, e.clientY - r.top - h.y) >= SLOP) { clearTimeout(h.timer); st.hold = null; } });
    const holdEnd = e => { const h = st.hold; if (h && h.id === e.pointerId) { clearTimeout(h.timer); setTimeout(() => { if (st.hold === h) st.hold = null; K.render(); }, 0); } };
    K.rulerEl.addEventListener('pointerup', holdEnd); K.rulerEl.addEventListener('pointercancel', holdEnd);
    function ripStart0(px) {
      const bar = Math.floor(K.beatAt(px) / 4), n = K.clip().len; if (bar < 0 || bar >= n) return null;
      return E.loop && bar >= E.loop.a && bar <= E.loop.b ? E.loop.a * 4 : bar * 4;
    }
    function ripStart(s) {
      const h = st.hold; if (!st.on || !h || !h.armed || h.id !== s.id) return false;
      const c = K.clip(); model.begin();
      const R = st.rip = {s0: h.s0, orig: c.notes.slice(), pos: c.notes.map(n => ({t: n.t, o: n.o})), len0: c.len, q: 0, step: stepOf()};
      s.end = cancel => {
        st.rip = null; st.hold = null;
        if (cancel) { model.revert(); K.afterExternal(); }
        else { K.sortNotes(); model.end(R.q !== 0, 'Takte verschieben'); K.afterExternal(); }
        K.render();
      };
      return true;
    }
    function ripDrag(s, p) {
      const R = st.rip; if (!R) return; const c = K.clip();
      let q = Math.round((p.x - s.p0.x) / V.ppb / R.step) * R.step;
      let maxEnd = 0; R.orig.forEach((x, i) => { if (R.pos[i].t >= R.s0 - 1e-9) maxEnd = Math.max(maxEnd, R.pos[i].t + x.d); });
      q = clamp(q, -R.s0, Math.max(0, 64 * 4 - maxEnd)); q = +q.toFixed(6); R.q = q;
      const keep = [];
      R.orig.forEach((x, i) => {
        const P = R.pos[i];
        if (P.t >= R.s0 - 1e-9) { x.t = +(P.t + q).toFixed(6); if (q) delete x.o; else if (P.o != null) x.o = P.o; keep.push(x); }
        else { x.t = P.t; if (P.o != null) x.o = P.o; if (!(q < 0 && P.t >= R.s0 + q - 1e-9)) keep.push(x); }   // nach links: Überschriebenes fällt weg
      });
      c.notes = keep;
      const need = maxEnd ? Math.ceil((maxEnd + q) / 4 - 1e-6) : R.len0; c.len = clamp(Math.max(R.len0, need), 1, 64);
      const bars = Math.trunc(q / 4), rest = +(q - bars * 4).toFixed(6);
      K.say((q > 0 ? '→ ' : q < 0 ? '← ' : '') + (q ? (bars ? Math.abs(bars) + (Math.abs(bars) === 1 ? ' Takt' : ' Takte') : '') + (rest ? (bars ? ' ' : '') + Math.round(Math.abs(rest) / .25) + '/16' : '') : 'ab Takt ' + (R.s0 / 4 + 1)));
      K.render();
    }

    // ---------- Zeichnen (vom draw() der Rolle) ----------
    function draw(x, C) {
      const tool = E.tool;
      if (st.on && tool === 'msChord') {
        x.font = '700 11px ' + K.tok('--font-num', 'monospace'); x.textBaseline = 'middle';
        for (const ch of chords()) {
          const bx = K.xOf(ch.t); if (bx < -60 || bx > V.W) continue;
          const w = x.measureText(ch.name).width + 10, sel = ch.notes.some(n => E.sel.has(n));
          x.fillStyle = sel ? C.sel : '#000'; x.globalAlpha = sel ? 1 : .7; K.rr(x, bx + 1, 3, w, 18, 4); x.fill(); x.globalAlpha = 1;
          x.fillStyle = sel ? '#111' : C.text; x.fillText(ch.name, bx + 6, 12.5);
        }
        x.textBaseline = 'alphabetic';
      }
      const h = st.hold, R = st.rip;
      if (st.on && h && h.armed) { const sx = K.xOf((R ? R.s0 + R.q : h.s0)); x.fillStyle = C.amber; x.globalAlpha = .8; x.fillRect(sx - 1, 0, 2, V.H); x.globalAlpha = .08; x.fillRect(sx, 0, V.W - sx, V.H); x.globalAlpha = 1; }
      paint();
    }
    function paint() {
      B.magic.classList.toggle('on', st.on);
      for (const k in TOOLS) B[k].classList.toggle('on', E.tool === k);
      const w = st.on && E.tool === 'msWipe', ch = st.on && E.tool === 'msChord';
      B.modes.forEach(b => { b.hidden = !w; b.classList.toggle('on', b.dataset.msMode === MSP.mode); });
      B.key.hidden = !w; B.sep1.hidden = !(w || ch);
      const t = st.manual ? keyLabel(st.manual) : 'Auto: ' + keyLabel(autoKey(viewBeat()));
      if (B.key._t !== t) { B.key._t = t; B.key.textContent = t + ' ▾'; }
      B.key.classList.toggle('on', !!st.manual);
      B.inUp.hidden = B.inDn.hidden = B.smooth.hidden = !ch;
    }
    function destroy() { clearTimeout(st.hold && st.hold.timer); st.hold = null; st.rip = null; }
    const api = {
      get state() { return {on: st.on, tool: E.tool, mode: MSP.mode, manual: st.manual ? {...st.manual} : null, key: keyAt(viewBeat()), keyLabel: B.key.textContent, armed: !!(st.hold && st.hold.armed), rip: st.rip ? {s0: st.rip.s0, q: st.rip.q} : null}; },
      setOn, setTool, setMode: m => { if (MODES.some(x => x[0] === m)) { MSP.mode = m; K.render(); } },
      setKey: k => { st.manual = k ? {root: PC(k.root | 0), scale: k.scale || 'ionian'} : null; K.render(); },
      keyAt, chords: () => chords().map(c => ({t: c.t, name: c.name, inv: c.inv, notes: c.notes.map(n => n.n)})), invert, smooth,
      el: {row, magic: B.magic, kp}
    };
    return {owns, promote, drag: msDrag, up, label, tap, draw, ripStart, ripDrag, destroy, api};
  }
  G.MagicScale = {attach, CSS};
})(typeof window !== 'undefined' ? window : globalThis);
</script>
