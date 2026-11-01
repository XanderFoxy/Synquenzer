/* G10G-BEGIN */
/* =====================================================================================================================
   G10g (Nachtrag 9, Punkt 7): Tonhöhe nach Tonart – wählbar, sauber, Konsonanten sichtbar geschützt.
   Tonhöhe-Blatt (Takes-Blatt → [♪ Tonhöhe · Noten]):
     Kopf: Chip „Tonart: E-Moll · Auto ▾“ → Leiste [Auto (Szene)] [Aus dem Gesang] [Projekt], 12 Grundtöne, Leitern
           (Dur, Moll, Dorisch, Mixolydisch, Phrygisch, Pent. Dur, Pent. Moll, Harm. Moll, Chromatisch). Unsichere Erkennung (< 0,25)
           → der Chip zeigt beide Vorschläge, die Leiste bietet beide an.
     Quantisieren an: ▲/▼ und senkrechtes Ziehen gehen stufenweise in der Tonart; Halten + Ziehen frei in Halbtönen.
     Halten (ohne Ziehen) auf einer Note = „nicht rastern“ an/aus. Regler „Einrast-Zeit“ 0–100 ms. Stimmlose Teile = graue Schraffur.
     Vorhören: beim Verschieben (Ziehen, ▲/▼) spielt sofort die Note in der neuen Lage (nur bei angehaltenem Transport).
   Daten (additiv am Take, Regel 28): pitch.key.src 'auto'|'user' (+ via 'gesang'|'projekt', alt = zweiter Vorschlag),
     pitch.notes[k].nq, pitch.rt (ms), pitch.v = 2 (Oktav-Klammer + Einrast-Zeit im Kern). Ohne v und src (alle Takes bis 4.30.0)
     bleibt P.key eingefroren, G7 rechnet mit g7Key, der Render ist bitgleich.
   ===================================================================================================================== */
const G10G = {HOLD: 450, hear: null, heard: [], uv: new Map()};
const G10G_LBL = {ionian: 'Dur', aeolian: 'Moll', dorian: 'Dorisch', mixolydian: 'Mixolydisch', phrygian: 'Phrygisch', lydian: 'Lydisch', locrian: 'Lokrisch',
  lydianAug: 'Lydisch übermäßig', dimWH: 'Ganzton-Halbton', pentMaj: 'Pent. Dur', pentMin: 'Pent. Moll', harmMin: 'Harm. Moll', chrom: 'Chromatisch'};
const G10G_LEITERN = ['ionian', 'aeolian', 'dorian', 'mixolydian', 'phrygian', 'pentMaj', 'pentMin', 'harmMin', 'chrom'];
// Schläge je Takt (Taktarten T1 kommen später: nur hier ändern)
function g10gBpb() { return grid().beatsPerBar; }
function g10gNormKey(k, o) {
  if (k.src === 'auto' || k.src === 'user') o.src = k.src;
  if (k.via === 'gesang' || k.via === 'projekt') o.via = k.via;
  if (k.alt && isNum(k.alt.root) && g10gScale(k.alt.scale)) o.alt = {root: clamp(Math.round(k.alt.root), 0, 11), scale: k.alt.scale};
}
function g10gNormPitch(p, o) {
  if (p.v === 2) o.v = 2;
  if (isNum(p.rt)) o.rt = clamp(Math.round(p.rt), 0, 100);
}
// neue Regeln (Neu-Lesen, Tonart je Note, gemeinsame Quelle G2/G7, eigene Leitern) nur mit v = 2 bzw. gesetztem key.src
function g10gNew(P) { return !!P && (P.v === 2 || !!(P.key && P.key.src)); }
// Stelle des Takes als Bezug für g2KeyAt: Szene-Clip {t, s} bzw. Song-Stimme {vox}
function g10gRef(id) {
  const a = typeof g7SegOf === 'function' ? g7SegOf(id) : null; if (!a) return null;
  const st = stimmeT();
  if (st >= 0) { const cs = S.tracks[st].clips; for (let s = 0; s < cs.length; s++) if (cs[s] && cs[s].audio === a) return {t: st, s}; }
  if (S.song && S.song.vox && S.song.vox.includes(a)) return {vox: a.id};
  return null;
}
function g10gAutoKey(id, r) { const k = g2KeyAt(r && (r.t != null || r.vox) ? r : g10gRef(id)); return {root: k.root, scale: k.scale}; }
function g10gNewKey(id, r) { return Object.assign(g10gAutoKey(id, r), {src: 'auto'}); }
// Tonart je Note bei 'auto' (Szene-Clip: Tonart der Szene; Song-Stimme: Szene an dem Takt der Note) – sonst null (dann gilt P.key)
function g10gKeys(id, P) {
  if (!P || !P.key || P.key.src !== 'auto' || !Array.isArray(P.notes)) return null;
  const a = typeof g7SegOf === 'function' ? g7SegOf(id) : null; if (!a) return null;
  try {
    if (S.song && S.song.vox && S.song.vox.includes(a)) {
      const sp = spb(), B = g10gBpb(), memo = new Map();
      return P.notes.map(n => {
        const beat = a.bar * B + (a.at || 0) + (n.t0 - a.in) / sp, bar = Math.max(0, Math.floor(beat / B + 1e-6));
        if (!memo.has(bar)) { const si = g2SongScene(bar), k = si >= 0 ? sceneKeyOf(si) : null; memo.set(bar, k ? {root: k.root, scale: k.scale} : {root: S.key.root, scale: S.key.scale}); }
        return memo.get(bar);
      });
    }
    const r = g10gRef(id); if (!r) return null;
    const K = g10gAutoKey(id, r); return P.notes.map(() => K);
  } catch (e) { logErr(e); return null; }
}
// angezeigte Tonart (neue Takes: die Quelle; alte: null → P.key)
function g10gKeyNow(id, P, r, k) {
  if (!P || !g10gNew(P)) return null;
  if (P.key && P.key.src === 'auto') { const ks = g10gKeys(id, P); return ks && ks.length ? ks[clamp(k == null ? 0 : k, 0, ks.length - 1)] : g10gAutoKey(id, r); }
  return P.key || null;
}
function g10gReread(id, P, r) { const ks = g10gKeys(id, P), k = ks && ks.length ? ks[0] : g10gAutoKey(id, r); P.key = {root: k.root, scale: k.scale, src: 'auto'}; }
// Plan für den Kern: alte Takes ergeben genau den Plan von 4.30.0 (gleiche Felder, gleiche Reihenfolge)
function g10gPlan(id, P, xs) {
  const ks = g10gKeys(id, P);
  const plan = {mode: P.mode, notes: P.notes.map((n, k) => { const q = P.q && !n.nq; return {t0: n.t0, t1: n.t1, m: n.m, to: q ? g2Snap(n.m, ks ? ks[k] : P.key) : n.m, s: q ? P.str : 0, e: 100 * ((n.sh || 0) + (xs ? xs[k] || 0 : 0))}; })};
  if (P.v === 2) { plan.v = 2; plan.rt = isNum(P.rt) ? P.rt : P.mode === 'hard' ? 15 : 40; }
  return plan;
}
function g10gMovedN(id, P) { const ks = g10gKeys(id, P); let n = 0; P.notes.forEach((x, k) => { if (Math.abs(g2Target(P, x, ks && ks[k]) - x.m) > 0.005) n++; }); return n; }
function g10gKeyLabel(k) {
  if (!k) return '–';
  if (k.scale === 'chrom') return 'Chromatisch';
  const r = noteNames()[clamp(k.root | 0, 0, 11)];
  return k.scale === 'ionian' ? r + '-Dur' : k.scale === 'aeolian' ? r + '-Moll' : r + ' ' + (G10G_LBL[k.scale] || k.scale);
}
// „Aus dem Gesang“: Tonart-Erkennung (KeyDetect, wie die Szenen) über die Noten des Takes, gewichtet nach Dauer (in Schlägen)
function g10gDetect(notes) {
  const sp = spb(), ns = (notes || []).filter(n => n && n.t1 > n.t0 && isNum(n.m)).map(n => ({n: Math.round(n.m + (n.sh || 0)), t: n.t0 / sp, d: (n.t1 - n.t0) / sp, v: .8}));
  if (!ns.length) return null;
  const k = KeyDetect.detectKey(ns, {fallback: S.key, barBeats: g10gBpb()});
  const sure = !!k.sure && k.conf >= .25;
  // unsicher ohne zweiten Kandidaten (dünnes Material): der Paralleltonart-Vorschlag (Dur ↔ Moll)
  const rel = k.scale === 'aeolian' ? {root: (k.root + 3) % 12, scale: 'ionian'} : {root: (k.root + 9) % 12, scale: 'aeolian'};
  const alt = sure ? null : k.alt && !(k.alt.root === k.root && k.alt.scale === k.scale) ? {root: k.alt.root, scale: k.alt.scale} : rel;
  return {root: k.root, scale: k.scale, conf: k.conf, sure, alt, name: g10gKeyLabel(k)};
}
/* ---------- Ändern (je ein Undo über g2Edit) ---------- */
function g10gSetKey(id, o, r) {
  return g2Edit(id, 'Tonart · Tonhöhe', P => {
    const cur = g10gKeyNow(id, P, r) || P.key || g10gAutoKey(id, r);
    if (o.src === 'auto') { P.key = {root: cur.root, scale: cur.scale, src: 'auto'}; g10gReread(id, P, r); }
    else if (o.via === 'gesang') { const d = g10gDetect(P.notes); if (!d) return false; P.key = {root: d.root, scale: d.scale, src: 'user', via: 'gesang'}; if (d.alt) P.key.alt = d.alt; }
    else if (o.via === 'projekt') P.key = {root: S.key.root, scale: S.key.scale, src: 'user', via: 'projekt'};
    else if (o.alt) { const k = P.key; if (!k || !k.alt) return false; P.key = {root: k.alt.root, scale: k.alt.scale, src: 'user', alt: {root: k.root, scale: k.scale}}; if (k.via) P.key.via = k.via; }
    else { const root = isNum(o.root) ? clamp(Math.round(o.root), 0, 11) : cur.root, scale = o.scale && g10gScale(o.scale) ? o.scale : cur.scale; P.key = {root, scale, src: 'user'}; }
  }, r).then(ok => { const P = S.takes && S.takes[id] && S.takes[id].pitch; if (ok) toast('Tonart ' + g10gKeyLabel(g10gKeyNow(id, P, r) || (P && P.key)) + (P && P.q ? ' · ' + g10gMovedN(id, P) + ' Töne gezogen' : '')); return ok; });
}
// ▲/▼: mit Quantisieren eine Stufe der Tonart (Ton außerhalb: der nächste Leiterton), sonst ein Halbton (wie bisher)
function g10gStepD(id, P, k, dir) {
  if (!P || !P.q || !P.notes[k]) return dir;
  const ks = g10gKeys(id, P), key = ks ? ks[k] : P.key, SC = g10gScale(key && key.scale) || Harmony.SCALES.ionian, r = key ? key.root : 0, ins = q => SC.includes(((q - r) % 12 + 12) % 12);
  const cur = Math.round(g2Target(P, P.notes[k], ks && ks[k])); let q = cur + dir, i = 0; while (!ins(q) && i++ < 12) q += dir;
  return q - cur;
}
function g10gStep(id, k, dir) {
  const m = S.takes && S.takes[id], P = m && m.pitch, d = g10gStepD(id, P, k, dir);
  g10gHear(id, k, d);
  return g2NoteShift(id, k, d);
}
function g10gNq(id, k) {
  const m = S.takes && S.takes[id], P = m && m.pitch;
  if (!P || !P.q) { toast('Erst Weich oder Hart'); return Promise.resolve(false); }
  let on = false;
  return g2Edit(id, 'Nicht rastern', Q => { const n = Q.notes[k]; if (!n) return false; if (n.nq) delete n.nq; else n.nq = true; on = !!n.nq; })
    .then(ok => { if (ok) toast(on ? 'Note wird nicht gerastert' : 'Note rastert wieder'); return ok; });
}
function g10gRtSet(id, ms) {
  const m = S.takes && S.takes[id], P = m && m.pitch;
  if (!P || !P.q) { toast('Erst Weich oder Hart'); return Promise.resolve(false); }
  return g2Edit(id, 'Einrast-Zeit · Tonhöhe', Q => { Q.rt = clamp(Math.round(ms), 0, 100); Q.v = 2; });
}
/* ---------- Gesten ---------- */
function g10gHoldArm(E) {
  const p = E.p; if (!p || p.k < 0 || E.voice != null) return;
  p.ht = setTimeout(() => { if (G2.ed === E && E.p === p && !p.mode) { p.held = true; haptic('tick'); g2Paint(); } }, G10G.HOLD);
}
// senkrechtes Ziehen: raw Halbtöne → mit Quantisieren der nächste Leiterton in Zugrichtung; gehalten = frei in Halbtönen
function g10gDragD(E, p, raw) {
  const P = S.takes[E.id] && S.takes[E.id].pitch;
  let d = raw;
  if (E.voice == null && raw && !p.held && P && P.q && P.notes[p.k]) {
    const ks = g10gKeys(E.id, P), key = ks ? ks[p.k] : P.key, SC = g10gScale(key && key.scale) || Harmony.SCALES.ionian, r = key ? key.root : 0, ins = q => SC.includes(((q - r) % 12 + 12) % 12);
    const cur = Math.round(g2Target(P, P.notes[p.k], ks && ks[p.k])), want = cur + raw, sg = Math.sign(raw);
    let q = want; for (let j = 0; j <= 12; j++) { if (ins(want + j * sg)) { q = want + j * sg; break; } if (j && ins(want - j * sg) && want - j * sg !== cur) { q = want - j * sg; break; } }
    d = q - cur;
  }
  if (E.voice == null && d !== (p.ld || 0)) { p.ld = d; if (d) g10gHear(E.id, p.k, d); }
  return d;
}
/* ---------- Vorhören: die Note der gehörten Fassung, d Halbtöne versetzt (ein Klang, Anstieg 8 ms, Ausklang ≤ 40 ms) ---------- */
function g10gHearStop() {
  const h = G10G.hear; G10G.hear = null; if (!h || !AU.ctx) return;
  const t = AU.ctx.currentTime;
  try { h.g.gain.cancelScheduledValues(t); h.g.gain.setValueAtTime(h.g.gain.value, t); h.g.gain.linearRampToValueAtTime(0, t + .012); h.s.stop(t + .016); } catch (e) {}
}
function g10gHear(id, k, d) {
  try {
    if (R.playing || !d) return null;
    const E = G2.ed, x = E && tkRef(E.r), a = x && x.a; if (!a) return null;
    const ns = g2Notes(id), n = ns && ns[k]; if (!n) return null;
    ensureAudio(); const c = AU.ctx; if (!c) return null;
    const buf = tkHeard(id, a); if (!buf) return null;
    const map = tkHeardMap(id, a), A = map ? VSM.warpTime(map, n.t0) : n.t0, B0 = map ? VSM.warpTime(map, n.t1) : n.t1;
    const st = stimmeT(), dest = st >= 0 && AU.tracks[st] && AU.tracks[st].trackIn; if (!dest) return null;
    g10gHearStop();
    const rate = Math.pow(2, d / 12), dur = clamp(B0 - A, .08, .6), len = dur / rate, rel = Math.min(.04, len / 3);
    const s = c.createBufferSource(), g = c.createGain(), G = isNum(a.gain) ? a.gain : 1, when = c.currentTime + .005;
    s.buffer = buf; s.playbackRate.value = rate;
    g.gain.setValueAtTime(0, when); g.gain.linearRampToValueAtTime(G, when + .008); g.gain.setValueAtTime(G, when + len - rel); g.gain.linearRampToValueAtTime(0, when + len);
    s.connect(g); g.connect(dest);
    s.start(when, Math.max(0, A)); s.stop(when + len + .01);
    const h = {s, g}; G10G.hear = h; s.onended = () => { try { s.disconnect(); g.disconnect(); } catch (e) {} if (G10G.hear === h) G10G.hear = null; };
    const ent = {id, k, d, rate: +rate.toFixed(5), a: +A.toFixed(4), len: +len.toFixed(4), at: +c.currentTime.toFixed(4)};
    G10G.heard.push(ent); if (G10G.heard.length > 50) G10G.heard.shift();
    return ent;
  } catch (e) { logErr(e); return null; }
}
/* ---------- Zeichnen: stimmlose Teile (Zisch-, Plosivlaute, Atem: keine Tonhöhe, aber Pegel) als Schraffur ---------- */
function g10gUnvoiced(id, A) {
  const raw = tkBuffer(id); if (!raw || !A) return [];
  const key = A.key + '#' + raw.length, c = G10G.uv.get(id); if (c && c.key === key) return c.runs;
  const d = raw.getChannelData(0), sr = raw.sampleRate, hs = A.hop * sr, TH = 0.004, runs = [];
  let on = -1, gap = 0;
  for (let i = 0; i <= A.n; i++) {
    let hit = false;
    if (i < A.n && !(A.f0[i] > 0)) { const s0 = Math.floor(i * hs), s1 = Math.min(d.length, Math.floor((i + 1) * hs)); let e = 0, q = 0; for (let j = s0; j < s1; j += 4) { e += d[j] * d[j]; q++; } hit = q > 0 && Math.sqrt(e / q) > TH; }
    if (hit) { if (on < 0) on = i; gap = 0; } else if (on >= 0) { if (++gap > 1 || i === A.n) { const e = i - gap + 1; if (e - on >= 2) runs.push([+(on * A.hop).toFixed(4), +(e * A.hop).toFixed(4)]); on = -1; gap = 0; } }
  }
  G10G.uv.set(id, {key, runs}); while (G10G.uv.size > 4) G10G.uv.delete(G10G.uv.keys().next().value);
  return runs;
}
function g10gHatch(g, E, id, A, X, Wp, Hp) {
  const runs = g10gUnvoiced(id, A); if (!runs.length) return;
  g.save(); g.strokeStyle = 'rgba(170,176,190,.34)'; g.lineWidth = 1;
  for (const [t0, t1] of runs) {
    const x0 = Math.max(0, X(t0)), x1 = Math.min(Wp, X(t1)); if (x1 <= x0) continue;
    g.fillStyle = 'rgba(170,176,190,.08)'; g.fillRect(x0, 0, x1 - x0, Hp);
    g.save(); g.beginPath(); g.rect(x0, 0, x1 - x0, Hp); g.clip(); g.beginPath();
    for (let s = Math.floor(x0 / 7) * 7 - Hp; s < x1; s += 7) { g.moveTo(s, Hp); g.lineTo(s + Hp, 0); }
    g.stroke(); g.restore();
  }
  g.restore();
}
function g10gNqMark(g, x0, y, w, h, on) {
  g.save(); g.setLineDash([3, 2]); g.lineWidth = 2; g.strokeStyle = on ? '#8fd8ff' : 'rgba(255,255,255,.9)';
  g.strokeRect(x0 + 1, y - h / 2 + 1, Math.max(1, w - 2), Math.max(1, h - 2)); g.restore();
}
/* ---------- Bedienung: Chip im Kopf, Leiste über dem Blatt, Regler Einrast-Zeit ---------- */
function g10gHead(head, wv) {
  const b = el('button', 'rb g10g-kc', '<span class="g10g-k1"></span><small class="g10g-k2"></small>');
  b.setAttribute('aria-label', 'Tonart wählen'); b.title = 'Tonart'; b.setAttribute('aria-expanded', 'false');
  b.addEventListener('click', () => { const E = G2.ed, kp = E && E.g10g && E.g10g.kp; if (!kp) return; kp.hidden = !kp.hidden; b.setAttribute('aria-expanded', String(!kp.hidden)); g2Paint(); });
  head.insertBefore(b, wv);
  return b;
}
function g10gPanel(b) {
  const kp = el('div', 'g10g-kp'); kp.hidden = true;
  const N = noteNames();
  kp.innerHTML = '<div class="g10g-r g10g-r4"><button class="rb" data-a="auto">Auto (Szene)</button><button class="rb" data-a="gesang">Aus dem Gesang</button><button class="rb" data-a="projekt">Projekt</button><button class="rb g10g-ok" data-a="close">Fertig</button></div>'
    + '<div class="g10g-r g10g-r2 g10g-alt" hidden><button class="rb" data-a="alt0"></button><button class="rb" data-a="alt1"></button></div>'
    + '<div class="g10g-l">Grundton</div><div class="g10g-r g10g-r6">' + N.map((x, i) => `<button class="rb" data-root="${i}">${x}</button>`).join('') + '</div>'
    + '<div class="g10g-l">Leiter</div><div class="g10g-r g10g-r5">' + G10G_LEITERN.map(s => `<button class="rb" data-scale="${s}">${G10G_LBL[s]}</button>`).join('') + '</div>';
  kp.addEventListener('click', e => {
    const bt = e.target.closest('button'), E = G2.ed; if (!bt || !E) return;
    const a = bt.dataset.a;
    if (a === 'close') { kp.hidden = true; if (E.g10g.kc) E.g10g.kc.setAttribute('aria-expanded', 'false'); g2Paint(); return; }
    if (a === 'alt0') return;
    const o = a === 'auto' ? {src: 'auto'} : a === 'gesang' ? {via: 'gesang'} : a === 'projekt' ? {via: 'projekt'} : a === 'alt1' ? {alt: true}
      : bt.dataset.root != null ? {root: +bt.dataset.root} : bt.dataset.scale ? {scale: bt.dataset.scale} : null;
    if (o) { if (!(S.takes[E.id] && S.takes[E.id].pitch)) g2Info('Töne werden gesucht …'); g10gSetKey(E.id, o, E.r).then(() => g2Paint()); }
  });
  b.appendChild(kp);
  return kp;
}
function g10gRtRow(sl) {
  const row = el('div', 'qrow g10g-rt'), inp = el('input'), val = el('span', 'mval');
  row.appendChild(el('span', 'lbl', 'Einrast-Zeit'));
  inp.type = 'range'; inp.min = 0; inp.max = 100; inp.step = 1; inp.setAttribute('aria-label', 'Einrast-Zeit');
  const cur = P => P && isNum(P.rt) ? P.rt : P && P.mode === 'hard' ? 15 : 40;
  const set = (v, fin) => {
    const E = G2.ed; if (!E) return; const m = S.takes[E.id], P = m && m.pitch; val.textContent = v + ' ms';
    if (!P || !P.q) { if (fin) { toast('Erst Weich oder Hart'); row._g(); } return; }
    if (!E.g10g.sb) E.g10g.sb = JSON.stringify(S.takes);
    P.rt = v; P.v = 2;
    clearTimeout(E.rt); if (fin) g2After(E.id); else { g2Paint(); const id = E.id; E.rt = setTimeout(() => { if (G2.ed && G2.ed.id === id) g2After(id); }, 150); }
    if (fin) { const before = E.g10g.sb; E.g10g.sb = null; if (JSON.stringify(S.takes) !== before) { undoPush({kind: 'takes', before, label: 'Einrast-Zeit · Tonhöhe'}); markDirty(); } }
  };
  inp.addEventListener('input', () => set(+inp.value, false)); inp.addEventListener('change', () => set(+inp.value, true));
  row.append(inp, val);
  row._g = () => { const E = G2.ed, P = E && S.takes[E.id] && S.takes[E.id].pitch, v = cur(P); if (E && E.g10g && E.g10g.sb) return; inp.value = v; val.textContent = v + ' ms'; };
  sl.append(row);
  return row;
}
function g10gSync(E, key) {
  const G = E.g10g; if (!G) return;
  if (G.rtr) G.rtr._g();
  const m = S.takes && S.takes[E.id], P = m && m.pitch, k = P && P.key;
  const src = !P ? 'auto' : !k || !k.src ? 'fest' : k.src === 'auto' ? 'auto' : k.via || 'eigene';
  const two = k && k.src === 'user' && k.alt ? g10gKeyLabel(k) + ' / ' + g10gKeyLabel(k.alt) : null;
  const ks = P && k && k.src === 'auto' ? g10gKeys(E.id, P) : null, many = ks && ks.some(x => x.root !== ks[0].root || x.scale !== ks[0].scale);
  if (G.kc) {
    G.kc.querySelector('.g10g-k1').textContent = two || g10gKeyLabel(key);   // Zeile 1: Tonart (unsicher: beide Vorschläge)
    G.kc.querySelector('.g10g-k2').textContent = 'Tonart · ' + {auto: 'Auto', fest: 'fest', gesang: 'Gesang', projekt: 'Projekt', eigene: 'Hand'}[src] + (many ? ' je Takt' : '') + ' ▾';
    G.kc.classList.toggle('on', !!(G.kp && !G.kp.hidden));
  }
  const kp = G.kp; if (!kp || kp.hidden) return;
  kp.querySelectorAll('button[data-a]').forEach(b => { const a = b.dataset.a; if (a === 'auto' || a === 'gesang' || a === 'projekt') { const on = a === src; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); } });
  const N = noteNames();
  kp.querySelectorAll('button[data-root]').forEach(b => { const i = +b.dataset.root, on = key && key.scale !== 'chrom' && key.root === i; b.textContent = N[i]; b.classList.toggle('on', !!on); b.setAttribute('aria-pressed', String(!!on)); });
  kp.querySelectorAll('button[data-scale]').forEach(b => { const on = !!key && key.scale === b.dataset.scale; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
  const al = kp.querySelector('.g10g-alt'); al.hidden = !two;
  if (two) { al.children[0].textContent = g10gKeyLabel(k); al.children[0].classList.add('on'); al.children[1].textContent = g10gKeyLabel(k.alt); }
}
/* ---------- Test-API ---------- */
const G10G_API = {
  g10gInfo: r => { const id = wpId(r), m = id && S.takes && S.takes[id], P = m && m.pitch, ks = P ? g10gKeys(id, P) : null, E = G2.ed;
    return {id, key: P && P.key ? deep(P.key) : null, now: P ? g10gKeyNow(id, P, null) : null, keys: ks, v: P ? P.v || null : null, rt: P && isNum(P.rt) ? P.rt : null,
      nq: P ? P.notes.map(n => !!n.nq) : null, targets: P ? P.notes.map((n, k) => g2Target(P, n, ks && ks[k])) : null, plan: id ? g2Plan(id) : null,
      chip: E && E.g10g && E.g10g.kc ? E.g10g.kc.textContent : null, panel: !!(E && E.g10g && E.g10g.kp && !E.g10g.kp.hidden), heard: G10G.heard.slice(-20)}; },
  g10gKey: (r, o) => g10gSetKey(wpId(r), o || {src: 'auto'}, typeof r === 'string' ? null : r || {t: stimmeT(), s: R.selS}),
  g10gStep: (r, k, dir) => g10gStep(wpId(r), k, dir),
  g10gNq: (r, k) => g10gNq(wpId(r), k),
  g10gRt: (r, ms) => g10gRtSet(wpId(r), ms),
  g10gDetect: notes => g10gDetect(notes),
  g10gSnap: (m, key) => g2Snap(m, key),
  g10gScales: () => deep(G10G_SCALES),
  g10gUnvoiced: r => { const id = wpId(r), A = id && G2.an.get(id); return A ? g10gUnvoiced(id, A) : null; },
  g10gPanel: open => { const E = G2.ed, kp = E && E.g10g && E.g10g.kp; if (!kp) return false; kp.hidden = open === false || (open == null && !kp.hidden); g2Paint(); return !kp.hidden; }
};
/* G10G-END */
