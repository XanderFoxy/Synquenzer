/* =====================================================================================================================
   G2 (Nachtrag 5): Tonhöhe quantisieren + Gesang als Noten bearbeiten. Kern g2PitchMake (oben, getestet in
   bau/helfer/G267/tests/g2-core.mjs). Nur stimmhafte Teile werden verschoben (harmonisches Modell: jeder Teilton bekommt
   die Hülle des Originals an seiner neuen Frequenz = formant-erhaltend; der unverschobene Rest – Hauch, Rauschen – bleibt);
   Zisch-/Plosivlaute, Atmer und alles außerhalb einer verschobenen Note bleiben bitgleich.
   Daten (additiv am Take, Format bleibt; ein Take ohne Änderung bleibt Zeichen für Zeichen gleich):
     take.pitch = {mode 'soft'|'hard', str (0…1, Stärke), q (Tonhöhe quantisieren an), key {root, scale} (Tonart der Stelle),
                   notes: [{t0, t1 (s im Take), m (gemessene Höhe, MIDI mit Nachkomma), sh? (eigene Verschiebung, Halbtöne)}]}
   Abspielen: tkExt().proc nach der Zeitkarte (VS5) und vor SÄUBERN (VS4): Quelle = gesäubert bzw. roh, Ergebnis = Quelle der
   Zeitkarte. Render-Cache je Take + Plan + Quelle (bis 8 Fassungen je Take: ↶ ↷, A/B, Transponieren G7 ohne Neurechnen).
   ===================================================================================================================== */
const G2 = {w: null, wid: 0, wq: new Map(), an: new Map(), aq: new Map(), cache: new Map(), cur: new Map(), job: new Map(), next: new Map(),
  ab: false, ed: null, renders: 0, last: null, lastAn: null, how: null};
const G2P = g2PitchMake();
const G2_MODES = ['soft', 'hard'];
function g2NormPitch(p, len) {
  if (!p || typeof p !== 'object' || !Array.isArray(p.notes)) return null;
  const notes = [];
  for (const n of p.notes.slice(0, 4000)) {
    if (!n || !isNum(n.t0) || !isNum(n.t1) || !isNum(n.m) || n.t0 < 0 || n.t1 <= n.t0 || n.t1 > len + 1e-6) continue;
    const o = {t0: tkR6(n.t0), t1: tkR6(n.t1), m: +clamp(n.m, 0, 127).toFixed(3)};
    if (isNum(n.sh) && Math.round(n.sh)) o.sh = clamp(Math.round(n.sh), -36, 36);
    notes.push(o);
  }
  notes.sort((a, b) => a.t0 - b.t0);
  const out = {mode: G2_MODES.includes(p.mode) ? p.mode : 'soft', str: isNum(p.str) ? +clamp(p.str, 0, 1).toFixed(2) : 1, q: !!p.q, notes: notes.filter((n, i) => !i || n.t0 >= notes[i - 1].t1 - 1e-6)};
  if (p.key && isNum(p.key.root) && Harmony.SCALES[p.key.scale]) out.key = {root: clamp(Math.round(p.key.root), 0, 11), scale: p.key.scale};
  return out.notes.length ? out : null;
}
tkExt().take.push((m, o) => { const p = g2NormPitch(m.pitch, o.len / o.sr); if (p) o.pitch = p; });

/* ---------- Plan: je Note Ziel (nächster Ton der Tonart), Stärke, eigene Verschiebung (+ G7 Transponieren) ---------- */
function g2Snap(m, key) {
  const SC = Harmony.SCALES[key && key.scale] || Harmony.SCALES.ionian, r = key ? key.root : 0, ins = q => SC.includes(((q - r) % 12 + 12) % 12);
  let best = null; for (let q = Math.floor(m) - 3; q <= Math.ceil(m) + 3; q++) if (ins(q) && (best == null || Math.abs(q - m) < Math.abs(best - m) - 1e-9)) best = q;
  return best == null ? Math.round(m) : best;
}
// gehörte Zielhöhe einer Note ohne Transponieren (MIDI, ganz bei Quantisieren 100 %)
function g2Target(P, n) { const base = P.q ? n.m + P.str * (g2Snap(n.m, P.key) - n.m) : n.m; return base + (n.sh || 0); }
function g2Plan(id, a) {
  const m = S.takes && S.takes[id], P = m && m.pitch; if (!P) return null;
  const xs = typeof g7Shift === 'function' ? g7Shift(id, a, P) : null;                 // G7: Transponieren der Stelle (Halbtöne je Note) oder null
  const plan = {mode: P.mode, notes: P.notes.map((n, k) => ({t0: n.t0, t1: n.t1, m: n.m, to: P.q ? g2Snap(n.m, P.key) : n.m, s: P.q ? P.str : 0, e: 100 * ((n.sh || 0) + (xs ? xs[k] || 0 : 0))}))};
  return G2P.active(plan) ? plan : null;
}
/* ---------- Quelle, Worker, Cache ---------- */
function g2Proc(id, a) {
  if (G2.ab) return null;
  const plan = g2Plan(id, a); if (!plan) return null;
  const b = g2Base(id, a); if (!b) return null;
  const k = G2P.planKey(plan) + '@' + wpBid(b), C = G2.cache.get(id), c = C && C.get(k);
  if (c) { c.t = performance.now(); G2.cur.set(id, c.buf); return c.buf; }
  g2Render(id, k, b, plan);
  return G2.cur.get(id) || null;                     // bis die neue Fassung da ist: die vorige (sonst die Quelle)
}
{ const P = tkExt().proc, k = P.indexOf(wpProc); P.splice(k < 0 ? 0 : k + 1, 0, g2Proc); }   // nach der Zeitkarte, vor SÄUBERN
function g2Base(id, a) { for (const f of tkExt().proc) { if (f === wpProc || f === g2Proc) continue; try { const b = f(id, a); if (b) return b; } catch (e) { logErr(e); } } return tkBuffer(id); }
function g2Worker() {
  if (G2.w !== null) return G2.w;
  try {
    const src = vsDspMake.toString() + '\n' + g2PitchMake.toString() + '\n' + g2Run.toString() + '\nconst V = vsDspMake(), P = g2PitchMake(), C = new Map();onmessage = e => { const m = e.data; try { const r = g2Run(V, P, C, m); postMessage({id: m.id, r}, r && r.y ? [r.y.buffer] : []); } catch (err) { postMessage({id: m.id, err: String(err && err.message || err)}); } };';
    const u = URL.createObjectURL(new Blob([src], {type: 'application/javascript'}));
    const w = new Worker(u); setTimeout(() => { try { URL.revokeObjectURL(u); } catch (e) {} }, 30000);
    w.onmessage = e => { const m = e.data, q = G2.wq.get(m.id); if (!q) return; G2.wq.delete(m.id); clearTimeout(q.to); if (m.err) q.no(new Error(m.err)); else q.ok(m.r); };
    w.onerror = e => { for (const q of G2.wq.values()) { clearTimeout(q.to); q.no(new Error('worker')); } G2.wq.clear(); G2.w = false; try { e.preventDefault(); } catch (er) {} };
    G2.w = w;
  } catch (e) { G2.w = false; }
  return G2.w;
}
// Worker und Rückfall: Analyse je Quelle (Cache, höchstens 3 Takes), Rendern eines Plans
function g2Run(V, P, C, m) {
  let a = C.get(m.key);
  if (!a) { a = P.analyse(m.x, m.sr, V); a.x = m.x; C.set(m.key, a); while (C.size > 3) C.delete(C.keys().next().value); }
  if (m.op === 'an') return {notes: a.notes, f0: Array.from(a.f0), hop: a.hop, n: a.n};
  return {y: P.render(a.x, m.sr, a, m.plan).y};
}
const G2_LOCAL = new Map();
function g2Call(m) {
  const w = g2Worker(), local = () => { G2.how = 'hauptfaden'; const r = g2Run(VSD, G2P, G2_LOCAL, m); return r.y ? {y: Float32Array.from(r.y)} : r; };
  if (!w) return Promise.resolve().then(local);
  return new Promise((ok, no) => {
    const id = ++G2.wid, x = new Float32Array(m.x);
    const to = setTimeout(() => { G2.wq.delete(id); try { ok(local()); } catch (e) { no(e); } }, 30000);
    G2.wq.set(id, {ok: r => { G2.how = 'worker'; ok(r); }, no: e => { try { ok(local()); } catch (er) { no(e); } }, to});
    try { w.postMessage(Object.assign({}, m, {id, x}), [x.buffer]); } catch (e) { clearTimeout(to); G2.wq.delete(id); try { ok(local()); } catch (er) { no(er); } }
  });
}
// gerendert wird eins nach dem anderen je Take; ist der Plan inzwischen neuer, folgt gleich der neueste
function g2Render(id, k, b, plan) {
  if (G2.job.has(id)) { if (G2.job.get(id) !== k) G2.next.set(id, true); return; }
  G2.job.set(id, k);
  const t0 = performance.now(), sr = b.sampleRate;
  g2Call({op: 'render', key: id + '@' + wpBid(b), x: b.getChannelData(0), sr, plan}).then(r => {
    G2.job.delete(id);
    const ab = wpToBuf(r.y, sr); if (!ab) return;
    let C = G2.cache.get(id); if (!C) G2.cache.set(id, (C = new Map()));
    C.set(k, {buf: ab, t: performance.now()});
    while (C.size > 8) { let ok = null, ot = Infinity; for (const [kk, v] of C) if (v.t < ot && v.buf !== G2.cur.get(id)) { ot = v.t; ok = kk; } if (!ok) break; C.delete(ok); }
    G2.renders++; G2.last = {id, ms: Math.round(performance.now() - t0), how: G2.how, n: plan.notes.length, key: k};
    const act = tkActiveIds(); for (const kk of [...G2.cache.keys()]) if (!act.has(kk) && !(G2.ed && G2.ed.id === kk)) { G2.cache.delete(kk); G2.cur.delete(kk); }
    if (G2.next.has(id)) { G2.next.delete(id); }
    g2Heard(id);
  }, e => { G2.job.delete(id); G2.next.delete(id); logErr(e); });
}
// neue Fassung hören: Zeitkarte (VS5) rechnet auf der neuen Quelle nach, dann Wechsel beim Abspielen ohne Loch (wpSwitch)
function g2Heard(id) {
  try { tkPlayBuf(id); } catch (e) {}                   // stößt die nächste Fassung an (Plan neuer) bzw. die Zeitkarte
  if (wpReady(id)) wpResync();
  UI.dirty.grid = UI.dirty.song = true; g2Paint();
}
function g2Ready(id, a) {
  const plan = g2Plan(id, a); if (!plan || G2.ab) return true;
  const b = g2Base(id, a); if (!b) return false;
  const C = G2.cache.get(id); return !!(C && C.get(G2P.planKey(plan) + '@' + wpBid(b)));
}
// Noten und Tonhöhen-Spur der Quelle (für den Editor und das erste Quantisieren), einmal je Take + Quelle
function g2Analyse(id) {
  const b0 = g2Base(id), key = b0 ? id + '@' + wpBid(b0) : null, c = G2.an.get(id);
  if (c && c.key === key) return Promise.resolve(c);
  if (G2.aq.has(key)) return G2.aq.get(key);
  const p = (async () => {
    let b = b0; if (!b) { tkLoad(id); const w = TK.wait.get(id); if (w) await w; b = g2Base(id); }
    if (!b) return null;
    const k = id + '@' + wpBid(b), t0 = performance.now(), r = await g2Call({op: 'an', key: k, x: b.getChannelData(0), sr: b.sampleRate});
    const A = {key: k, notes: r.notes, f0: Float32Array.from(r.f0), hop: r.hop, n: r.n};
    G2.an.set(id, A); G2.lastAn = {id, n: A.notes.length, ms: Math.round(performance.now() - t0), how: G2.how};
    return A;
  })();
  if (key) { G2.aq.set(key, p); p.then(() => G2.aq.delete(key), () => G2.aq.delete(key)); }
  return p;
}
/* ---------- Ändern (je ein Undo, Art 'takes') ---------- */
// Tonart der Stelle (Voreinstellung): Szene-Clip → Tonart der Szene, Song-Stimme → die der Szene an dem Takt, sonst die des Projekts
function g2KeyAt(r) {
  try {
    if (r && r.t != null) { const k = sceneKeyOf(r.s); if (k) return {root: k.root, scale: k.scale}; }
    if (r && r.vox && S.song) { const v = (S.song.vox || []).find(z => z.id === r.vox), si = v && typeof songSceneAtBar === 'function' ? songSceneAtBar(v.bar) : -1, k = si >= 0 ? sceneKeyOf(si) : null; if (k) return {root: k.root, scale: k.scale}; }
  } catch (e) { logErr(e); }
  return {root: S.key.root, scale: S.key.scale};
}
function g2Edit(id, label, fn, r) {
  const m = S.takes && S.takes[id]; if (!m) return Promise.resolve(false);
  return (m.pitch ? Promise.resolve(null) : g2Analyse(id)).then(A => {
    const mm = S.takes && S.takes[id]; if (!mm) return false;
    const before = JSON.stringify(S.takes);
    if (!mm.pitch) { if (!A || !A.notes.length) { toast('Keine Töne erkannt'); return false; } mm.pitch = {mode: 'soft', str: 1, q: false, key: g2KeyAt(r), notes: A.notes.map(n => ({t0: n.t0, t1: n.t1, m: n.m}))}; }
    if (fn(mm.pitch) === false) { S.takes = JSON.parse(before); return false; }
    const P = g2NormPitch(mm.pitch, mm.len / mm.sr);
    if (!P || (!P.q && !P.notes.some(n => n.sh))) delete mm.pitch; else mm.pitch = P;
    if (JSON.stringify(S.takes) === before) return false;
    undoPush({kind: 'takes', before, label}); markDirty(); UI.dirty.all = true; haptic('tick');
    g2After(id);
    return true;
  });
}
function g2After(id) { try { tkPlayBuf(id); } catch (e) {} if (g2Ready(id)) wpResync(); g2Paint(); }
// Quantisieren: o = {q, mode, str}
function g2SetQ(id, o, r) {
  return g2Edit(id, 'Tonhöhe · Audio', P => {
    if (o.q != null) P.q = !!o.q;
    if (o.mode) P.mode = o.mode === 'hard' ? 'hard' : 'soft';
    if (isNum(o.str)) P.str = clamp(o.str, 0, 1);
    if (o.key) P.key = {root: o.key.root, scale: o.key.scale};
    if (!P.key) P.key = g2KeyAt(r);
  }, r);
}
const g2NoteShift = (id, k, d) => g2Edit(id, 'Note verschoben', P => { const n = P.notes[k]; if (!n || !d) return false; n.sh = (n.sh || 0) + Math.round(d); });
function g2Split(id, k, t) {
  return g2Edit(id, 'Note geteilt', P => {
    const n = P.notes[k]; if (!n) return false; if (!(t > n.t0 + 0.03 && t < n.t1 - 0.03)) t = (n.t0 + n.t1) / 2;
    if (n.t1 - n.t0 < 0.08) return false;
    const A = G2.an.get(id), mOf = (a, b) => { if (!A) return n.m; const v = []; for (let i = Math.ceil(a / A.hop); i < Math.min(A.n, b / A.hop); i++) if (A.f0[i] > 0) v.push(G2P.midi(A.f0[i])); return v.length ? +VSD.median(v).toFixed(3) : n.m; };
    const L = Object.assign({}, n, {t1: tkR6(t), m: mOf(n.t0, t)}), R2 = Object.assign({}, n, {t0: tkR6(t), m: mOf(t, n.t1)});
    P.notes.splice(k, 1, L, R2);
  });
}
const g2Join = (id, k) => g2Edit(id, 'Noten verbunden', P => {
  const a = P.notes[k], b = P.notes[k + 1]; if (!a || !b) return false;
  const da = a.t1 - a.t0, db = b.t1 - b.t0;
  P.notes.splice(k, 2, Object.assign({}, a, {t1: b.t1, m: +((a.m * da + b.m * db) / (da + db)).toFixed(3)}));
});
function g2Undone() {
  const E = G2.ed; if (E && !tkRef(E.r)) { g2Close(); return; }
  for (const id of tkActiveIds()) { try { tkPlayBuf(id); } catch (e) {} }
  g2Paint();
}
// WAV der hörbaren Fassung (Tonhöhe, Zeitkarte, Säubern – was klingt), 16 Bit
function g2Wav(id) {
  const b = tkHeard(id); if (!b) { toast('Take fehlt auf diesem Gerät'); return false; }
  const d = b.getChannelData(0), pcm = new Int16Array(d.length); for (let i = 0; i < d.length; i++) { const v = Math.round(d[i] * 32767); pcm[i] = v > 32767 ? 32767 : v < -32768 ? -32768 : v; }
  const m = S.takes[id], t = new Date(m && m.created || Date.now());
  return deliver('synquenzer-take-' + t.getFullYear() + z2(t.getMonth() + 1) + z2(t.getDate()) + '-' + z2(t.getHours()) + z2(t.getMinutes()) + '-' + id.slice(0, 4) + '-gehoert', tkWav(pcm, b.sampleRate), 'wav', 'Take (gehörte Fassung) als WAV');
}

/* ---------- Noten-Editor des Takes (im Blatt des Marken-Editors): Noten-Blöcke über der Wellenform ----------
   Tipp auf eine Note = wählen; senkrecht ziehen = Halbtöne verschieben (eigene Melodie); waagrecht ziehen auf leerer Fläche =
   blättern; [▲] [▼] = die gewählte Note ±1; [Teilen] an der zuletzt getippten Stelle; [Verbinden] mit der nächsten Note.
   [Aus] [Weich] [Hart] + Stärke = Tonhöhe quantisieren auf die Tonart der Stelle; A/B = Original hören; WAV = gehörte Fassung */
function g2Open(r) {
  const x = tkRef(r); if (!x || !tkAudioOk()) return false;
  if (QS.open) closeQuantSheet(false, true);
  closePop(); if (WP.ed) wpClose(); if (G2.ed) g2Close();
  const id = x.a.take, segBars = (x.a.out - x.a.in) / spb() / 4;
  G2.ed = {r, id, zoom: segBars <= 2.05 ? 0 : 2, va: x.a.in, sel: -1, p: null, ghost: null, tapT: null, sb: null};
  const sh = EL.wpSheet; sh.innerHTML = ''; sh.classList.add('g2');
  const head = el('div', 'qh', `<b>${wpTitlePieces('Tonhöhe · STIMME · ' + x.label)}</b>`);
  const wv = el('button', 'rb wptx', 'WAV'); wv.setAttribute('aria-label', 'Gehörte Fassung als WAV'); wv.addEventListener('click', () => { const E = G2.ed; if (E) g2Wav(E.id); });
  const ab = el('button', 'rb wpab', 'A/B'); ab.setAttribute('aria-label', 'Original hören (A/B)');
  ab.addEventListener('click', () => { G2.ab = !G2.ab; wpResync(); g2Paint(); });
  const cl = el('button', 'sh-x rb', '✕'); cl.setAttribute('aria-label', 'Schließen'); cl.addEventListener('click', () => g2Close());
  head.append(wv, ab, cl);
  const b = el('div', 'qb wpb'), cvw = el('div', 'wpcv'), cv = el('canvas');
  cvw.append(cv);
  const chips = el('div', 'qchips wpchips g2chips');
  [['off', 'Aus'], ['soft', 'Weich'], ['hard', 'Hart'], ['up', '▲'], ['dn', '▼'], ['split', 'Teilen'], ['join', 'Verbinden'], ['zoom', '']].forEach(([v, l]) => { const bt = el('button', 'rb', l); bt.dataset.v = v; chips.appendChild(bt); });
  chips.querySelector('[data-v=up]').setAttribute('aria-label', 'Note einen Halbton höher');
  chips.querySelector('[data-v=dn]').setAttribute('aria-label', 'Note einen Halbton tiefer');
  chips.addEventListener('click', e => {
    const bt = e.target.closest('button[data-v]'), E = G2.ed; if (!bt || !E) return;
    const v = bt.dataset.v, P = S.takes[E.id] && S.takes[E.id].pitch;
    if (v === 'off') { g2SetQ(E.id, {q: false}, E.r); return; }
    if (v === 'soft' || v === 'hard') { g2Info('Töne werden gesucht …'); g2SetQ(E.id, {q: true, mode: v, str: P && P.q ? P.str : 1}, E.r).then(ok => { const Q = S.takes[E.id] && S.takes[E.id].pitch; if (ok && Q) toast(g2MovedN(Q) + ' Töne auf die Tonart ' + keyLabel(Q.key) + ' gezogen'); }); return; }
    if (v === 'zoom') { E.zoom = WP_ZOOM[(WP_ZOOM.indexOf(E.zoom) + 1) % WP_ZOOM.length]; g2Paint(); return; }
    if (E.sel < 0 || !P || !P.notes[E.sel]) { if (!P && (v === 'up' || v === 'dn' || v === 'split' || v === 'join')) { g2Info('Töne werden gesucht …'); g2Analyse(E.id).then(() => g2Paint()); } toast('Erst eine Note antippen'); return; }
    if (v === 'up' || v === 'dn') g2NoteShift(E.id, E.sel, v === 'up' ? 1 : -1);
    else if (v === 'split') g2Split(E.id, E.sel, E.tapT);
    else if (v === 'join') { if (!P.notes[E.sel + 1]) { toast('Keine Note dahinter'); return; } g2Join(E.id, E.sel); }
  });
  const row = el('div', 'qrow'), inp = el('input'), val = el('span', 'mval');
  row.appendChild(el('span', 'lbl', 'Stärke'));
  inp.type = 'range'; inp.min = 0; inp.max = 100; inp.step = 1; inp.setAttribute('aria-label', 'Stärke');
  const sset = (v, fin) => {
    const E = G2.ed; if (!E) return; const m = S.takes[E.id], P = m && m.pitch; val.textContent = v + ' %';
    if (!P || !P.q) { if (fin) toast('Erst Weich oder Hart'); return; }
    if (!E.sb) E.sb = JSON.stringify(S.takes);
    P.str = v / 100;
    clearTimeout(E.rt); if (fin) g2After(E.id); else { g2Paint(); const id = E.id; E.rt = setTimeout(() => { if (G2.ed && G2.ed.id === id) g2After(id); }, 150); }
    if (fin) { const before = E.sb; E.sb = null; if (JSON.stringify(S.takes) !== before) { undoPush({kind: 'takes', before, label: 'Stärke · Tonhöhe'}); markDirty(); } }
  };
  inp.addEventListener('input', () => sset(+inp.value, false)); inp.addEventListener('change', () => sset(+inp.value, true));
  row.append(inp, val); row._g = () => { const E = G2.ed, P = E && S.takes[E.id] && S.takes[E.id].pitch, v = Math.round((P ? P.str : 1) * 100); inp.value = v; val.textContent = v + ' %'; };
  const info = el('span', 'qnote wpinfo', '');
  cvw.append(info);
  const sl = el('div', 'wpsl'); sl.append(row);
  b.append(cvw, chips, sl);
  sh.append(head, b);
  Object.assign(G2.ed, {cv, chips, rs: row, info, ab, cvw});
  sh.classList.add('open');
  g2Gest(cv);
  g2Paint();
  g2Analyse(id).then(() => g2Paint(), e => { logErr(e); g2Info('Töne nicht gefunden'); });
  return true;
}
function g2Info(t) { if (G2.ed && G2.ed.info) G2.ed.info.textContent = t; }
function g2Close() {
  const E = G2.ed; if (!E) return;
  G2.ed = null; clearTimeout(E.rt);
  EL.wpSheet.classList.remove('open', 'g2'); EL.wpSheet.innerHTML = '';
  if (G2.ab) { G2.ab = false; wpResync(); }
}
function g2MovedN(P) { let n = 0; for (const x of P.notes) if (Math.abs(g2Target(P, x) - x.m) > 0.005) n++; return n; }
// die Noten, die der Editor zeigt: gespeichert, sonst die erkannten (noch ohne Änderung)
function g2Notes(id) { const m = S.takes && S.takes[id]; if (m && m.pitch) return m.pitch.notes; const A = G2.an.get(id); return A ? A.notes : null; }
function g2Paint() {
  const E = G2.ed; if (!E || !E.cv) return;
  const x = tkRef(E.r); if (!x) { g2Close(); return; }
  const a = x.a, id = E.id, m = S.takes && S.takes[id], P = m && m.pitch, cv = E.cv, wr = cv.getBoundingClientRect(), dpr = Math.min(3, window.devicePixelRatio || 1);
  const Wp = Math.max(1, Math.round(wr.width)), Hp = Math.max(1, Math.round(wr.height));
  if (cv.width !== Wp * dpr || cv.height !== Hp * dpr) { cv.width = Wp * dpr; cv.height = Hp * dpr; }
  const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
  const V = wpView(E, a), X = t => (t - V.a) / V.W * Wp; E.vw = V; E.X = X;
  const ns = g2Notes(id) || [], A = G2.an.get(id), Pk = P || {q: false, str: 1, notes: ns};
  const tg = ns.map(n => g2Target(Pk, n));
  // Tonhöhen-Bereich: alle Noten ± 2 Halbtöne, mindestens eine Oktave
  let lo = Infinity, hi = -Infinity; ns.forEach((n, k) => { lo = Math.min(lo, n.m, tg[k]); hi = Math.max(hi, n.m, tg[k]); });
  if (!isFinite(lo)) { lo = 55; hi = 67; }
  lo = Math.floor(lo) - 2; hi = Math.ceil(hi) + 2; if (hi - lo < 12) { const c = (lo + hi) / 2; lo = Math.floor(c - 6); hi = lo + 12; }
  const rowH = Hp / (hi - lo + 1), Y = p => Hp - (p - lo + 0.5) * rowH; E.Y = Y; E.rowH = rowH; E.lo = lo;
  g.fillStyle = '#0e1014'; g.fillRect(0, 0, Wp, Hp);
  const key = P && P.key || g2KeyAt(E.r), SC = Harmony.SCALES[key.scale] || Harmony.SCALES.ionian;
  g.font = WP.font || (WP.font = '600 10px ' + getComputedStyle(document.body).fontFamily);
  for (let p = lo; p <= hi; p++) {
    const ins = SC.includes(((p - key.root) % 12 + 12) % 12), y = Y(p);
    if (ins) { g.fillStyle = ((p - key.root) % 12 + 12) % 12 === 0 ? '#1d222c' : '#161a21'; g.fillRect(0, y - rowH / 2, Wp, rowH); }
    g.fillStyle = '#262c37'; g.fillRect(0, Math.round(y + rowH / 2) + .5, Wp, 1);
  }
  // Takte (Rasterbezug wie der Marken-Editor)
  const sp = spb(), t0 = m && m.warp ? m.warp.t0 : wpT0(id, a);
  for (let bt = Math.floor((V.a - t0) / sp / 4) * 4; bt <= (V.a + V.W - t0) / sp + 1e-9; bt += 1) { const xx = Math.round(X(t0 + bt * sp)) + .5, bar = bt % 4 === 0; g.fillStyle = bar ? '#4a5466' : '#2a303b'; g.fillRect(xx - (bar ? 1 : .5), 0, bar ? 2 : 1, Hp); }
  // Wellenform blass dahinter (die gehörte Fassung)
  const hb = tkHeard(id, a);
  if (hb) { const d = hb.getChannelData(0), sr = hb.sampleRate; g.fillStyle = 'rgba(120,140,170,.28)';
    for (let px = 0; px < Wp; px++) { const s0 = Math.max(0, Math.floor((V.a + px / Wp * V.W) * sr)), s1 = Math.min(d.length, Math.floor((V.a + (px + 1) / Wp * V.W) * sr)); let pk = 0; for (let i = s0; i < s1; i += 8) { const v = Math.abs(d[i]); if (v > pk) pk = v; } const h = Math.min(1, Math.sqrt(pk)) * Hp * .45; g.fillRect(px, Hp / 2 - h, 1, 2 * h); } }
  // Tonhöhen-Spur (gemessen) dünn
  if (A) { g.strokeStyle = 'rgba(200,210,230,.55)'; g.lineWidth = 1; g.beginPath(); let on = false;
    const i0 = Math.max(0, Math.floor(V.a / A.hop)), i1 = Math.min(A.n, Math.ceil((V.a + V.W) / A.hop) + 1);
    for (let i = i0; i < i1; i++) { const f = A.f0[i]; if (!(f > 0)) { on = false; continue; } const xx = X(i * A.hop), yy = Y(G2P.midi(f)); if (on) g.lineTo(xx, yy); else g.moveTo(xx, yy); on = true; }
    g.stroke(); }
  // Noten-Blöcke: Umriss = gesungen, Block = gehört
  E.blk = [];
  ns.forEach((n, k) => {
    const x0 = X(n.t0), x1 = X(n.t1), t = (E.ghost && E.ghost.k === k ? tg[k] + E.ghost.d : tg[k]), y = Y(t), w = Math.max(2, x1 - x0), h = Math.max(4, rowH - 2);
    E.blk.push({k, x0, x1, y});
    if (x1 < 0 || x0 > Wp) return;
    if (Math.abs(t - n.m) > 0.02) { g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 1; g.strokeRect(x0 + .5, Y(n.m) - h / 2 + .5, w - 1, h - 1); }
    g.fillStyle = k === E.sel ? '#ffd27a' : P ? '#f0a531' : '#8a7448'; g.fillRect(x0, y - h / 2, w, h);
    if (k === E.sel) { g.strokeStyle = '#ffffff'; g.lineWidth = 2; g.strokeRect(x0 + 1, y - h / 2 + 1, w - 2, h - 2); }
    if (w > 22 && h >= 9) { g.fillStyle = '#16120a'; g.fillText(noteNames()[((Math.round(t) % 12) + 12) % 12] + (Math.floor(Math.round(t) / 12) - 1), x0 + 3, y + 3.5, w - 4); }
  });
  // Bedienung
  const md = !P || !P.q ? 'off' : P.mode;
  E.chips.querySelectorAll('button[data-v]').forEach(bt => { const v = bt.dataset.v, on = v === md; if (v === 'off' || v === 'soft' || v === 'hard') { bt.classList.toggle('on', on); bt.setAttribute('aria-pressed', String(on)); } });
  E.chips.querySelector('[data-v=zoom]').textContent = E.zoom ? E.zoom + (E.zoom === 1 ? ' Takt' : ' Takte') : 'Ganz';
  E.rs._g();
  E.ab.classList.toggle('on', G2.ab); E.ab.textContent = G2.ab ? 'Original' : 'A/B';
  const rd = !A && !P ? 'Töne werden gesucht …' : ns.length + (ns.length === 1 ? ' Note' : ' Noten') + ' · Tonart ' + keyLabel(key) + ' · ' + (P && P.q ? (P.mode === 'hard' ? 'Hart ' : 'Weich ') + Math.round(P.str * 100) + ' %' : 'nicht quantisiert') + (g2Ready(id, a) ? '' : ' · rechnet …');
  g2Info(rd);
}
function g2Hit(E, cx, cy) {
  let best = -1, bd = 1e9;
  for (const b of E.blk || []) { if (cx < b.x0 - 6 || cx > b.x1 + 6) continue; const d = Math.abs(cy - b.y); if (d < Math.max(14, E.rowH) && d < bd) { bd = d; best = b.k; } }
  return best;
}
function g2Gest(cv) {
  const pos = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  cv.addEventListener('pointerdown', e => {
    const E = G2.ed; if (!E || E.p || e.button > 0) return;
    try { cv.setPointerCapture(e.pointerId); } catch (er) {}
    const [cx, cy] = pos(e); E.p = {id: e.pointerId, x0: e.clientX, y0: e.clientY, t0: performance.now(), k: g2Hit(E, cx, cy), mode: null, va: E.va};
  });
  cv.addEventListener('pointermove', e => {
    const E = G2.ed, p = E && E.p; if (!p || p.id !== e.pointerId) return;
    const dx = e.clientX - p.x0, dy = e.clientY - p.y0;
    if (!p.mode && Math.hypot(dx, dy) > 8) p.mode = p.k >= 0 && Math.abs(dy) >= Math.abs(dx) ? 'move' : 'pan';
    if (p.mode === 'move') { E.ghost = {k: p.k, d: Math.round(-dy / Math.max(6, E.rowH))}; E.sel = p.k; g2Paint(); }
    else if (p.mode === 'pan') { E.va = p.va - dx / E.cv.clientWidth * E.vw.W; g2Paint(); }
  });
  const end = (e, cancel) => {
    const E = G2.ed, p = E && E.p; if (!p || p.id !== e.pointerId) return;
    E.p = null; const gh = E.ghost; E.ghost = null;
    if (cancel) { g2Paint(); return; }
    if (p.mode === 'move' && gh) { if (gh.d) g2NoteShift(E.id, gh.k, gh.d); else g2Paint(); return; }
    if (p.mode) return;
    const [cx] = pos(e); UI.ghost = {t: performance.now(), x: e.clientX, y: e.clientY};
    E.sel = p.k; E.tapT = p.k >= 0 ? E.vw.a + cx / E.cv.clientWidth * E.vw.W : null; g2Paint();
  };
  cv.addEventListener('pointerup', e => end(e, false));
  cv.addEventListener('pointercancel', e => end(e, true));
}
/* ---------- Test-API ---------- */
const G2_API = {
  g2Info: r => { const id = wpId(r), m = id && S.takes && S.takes[id], A = id && G2.an.get(id);
    return {id, pitch: m && m.pitch ? deep(m.pitch) : null, an: A ? {notes: deep(A.notes), hop: A.hop, n: A.n} : null, ready: id ? g2Ready(id) : null, renders: G2.renders, last: G2.last, lastAn: G2.lastAn, how: G2.how, ab: G2.ab,
      targets: m && m.pitch ? m.pitch.notes.map(n => g2Target(m.pitch, n)) : null, editor: G2.ed ? {id: G2.ed.id, sel: G2.ed.sel, zoom: G2.ed.zoom} : null}; },
  g2Analyse: r => g2Analyse(wpId(r)).then(A => (A ? {notes: deep(A.notes), hop: A.hop, n: A.n, f0: Array.from(A.f0)} : null)),
  g2Quantize: (r, o) => g2SetQ(wpId(r), o || {q: true, mode: 'hard', str: 1}, typeof r === 'string' ? null : r || {t: stimmeT(), s: R.selS}),
  g2Note: (r, op, k, v) => { const id = wpId(r); return op === 'shift' ? g2NoteShift(id, k, v) : op === 'split' ? g2Split(id, k, v) : op === 'join' ? g2Join(id, k) : Promise.resolve(false); },
  g2AB: v => { G2.ab = v == null ? !G2.ab : !!v; wpResync(); g2Paint(); return G2.ab; },
  g2Open: r => g2Open(r || {t: stimmeT(), s: R.selS}), g2Close: () => { g2Close(); return true; },
  g2Geom: () => { const E = G2.ed; if (!E || !E.cv) return null; const rc = E.cv.getBoundingClientRect(); return {x: rc.left, y: rc.top, w: rc.width, h: rc.height, view: {a: E.vw.a, W: E.vw.W}, rowH: E.rowH, lo: E.lo,
    blocks: (E.blk || []).map(b => ({k: b.k, x0: rc.left + b.x0, x1: rc.left + b.x1, y: rc.top + b.y}))}; },
  g2Played: async (r, a, b) => { const id = wpId(r); for (let n = 0; n < 800 && !(g2Ready(id) && wpReady(id)); n++) { tkPlayBuf(id); await sleep(25); } const x = tkPlayBuf(id), raw = tkBuffer(id);
    return x ? {raw: x === raw, sr: x.sampleRate, n: x.length, data: Array.from(x.getChannelData(0).subarray(a || 0, b == null ? x.length : b))} : null; },
  g2Wav: r => g2Wav(wpId(r)),
  g2Core: () => G2P.VERSION
};
