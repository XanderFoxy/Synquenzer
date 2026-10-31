
/* ---------- Schnittstelle nach außen (Test-API §7.12) ---------- */
function g9Syl(word, lang) { return G9K.syl(word, lang === 'auto' ? G9K.guess(word) : lang); }
function g9AlignApi(syl, marks, feat, o) {
  const sy = syl.map(q => (typeof q === 'string' ? {x: q} : q)), a = G9K.align(sy, marks, feat, o || {});
  return g9BuildS(sy.map((q, i) => Object.assign({}, q, {k: a[i].k, o: a[i].o})), marks);
}
function g9FeatOf(id) {
  const m = S.takes && S.takes[id], mk = wpMarks(id); if (!m || !mk) return null;
  const sim = G9.featSim && G9.featSim.get(id); if (sim && sim.length === mk.length) return sim;   // nur Tests (g9FeatSim)
  const key = id + '@' + mk.length + ':' + (mk.length ? mk[0].t + ':' + mk[mk.length - 1].t : '');
  let f = G9.feat.get(id); if (f && f.key === key) return f.f;
  f = {key, f: G9K.feat(mk, m.len / m.sr)}; G9.feat.set(id, f); return f.f;
}

/* ---------- Arbeits-Form eines Takes: W = [{x, w, u, p, k (Marke), o, nm}] + Silben-Plätze P (§6.1) ---------- */
// Zwischenspeicher je Take: gleiche ly/lyrics/Marken/Merkmale → dieselbe Arbeits-Form (Tastendruck ≤ 2 ms); Ops arbeiten auf Kopien
function g9Ctx(id) {
  const m = S.takes && S.takes[id], mk = wpMarks(id) || [];
  if (!m) return null;
  const F0 = g9FeatOf(id), c = G9.ctx;
  if (c && c.id === id && c.m === m && c.ly === m.ly && c.lyrics === m.lyrics && c.mk === mk && c.F === F0) return Object.assign({}, c.C, {P: c.C.P.slice()});
  const C = g9Ctx0(id, m, mk);
  G9.ctx = {id, m, ly: m.ly, lyrics: m.lyrics, mk, F: F0, C};
  return Object.assign({}, C, {P: C.P.slice()});
}
function g9Ctx0(id, m, mk) {
  let W = [], lang = 'de', src = 'getippt', vs5b = false;
  if (m.ly && m.ly.s) {
    const v = G9K.view(m.ly.s, mk);
    W = m.ly.s.map((q, i) => ({x: q.x, w: q.w || 0, u: q.u || 0, p: q.p, k: v[i].k, o: v[i].o, nm: v[i].nm, t: q.t}));
    lang = m.ly.lang; src = m.ly.src;
  } else if (m.lyrics) {                                               // §5.3: VS5b „eine Silbe je Marke von links“
    vs5b = true; src = 'vs5b'; lang = G9K.guess(m.lyrics);
    let i = 0;
    for (const wd of m.lyrics.trim().split(/\s+/).filter(Boolean)) wd.split('-').filter(Boolean).forEach((x, k) => {
      W.push({x, w: k ? 0 : 1, u: 0, k: mk.length ? Math.min(i, mk.length - 1) : -1, o: i >= mk.length}); i++;
    });
  }
  const F = g9FeatOf(id) || [], used = new Set(W.filter(q => !q.o && q.k >= 0).map(q => q.k)), P = [], piOf = new Int32Array(mk.length).fill(-1);
  mk.forEach((k, j) => { if (used.has(j) || G9K.skipC(F[j] || {conf: k.conf, rise: 6, gap: 0, pj: 0}) >= .5) { piOf[j] = P.length; P.push(j); } });
  // Platz-Index je Silbe; überzählige am Ende bekommen Plätze hinter der letzten Marke (sie kommen beim Verschieben zurück)
  let ext = P.length;
  W.forEach((q, i) => {
    if (q.nm) { q.pi = null; return; }
    const tail = q.o && W.slice(i).every(z => z.o || z.nm);
    q.pi = tail ? ext++ : q.k >= 0 ? (piOf[q.k] >= 0 ? piOf[q.k] : 0) : 0;
  });
  return {id, m, mk, W, P, piOf, lang, src, vs5b, F};
}
// Plätze → Marken: gleiche Marke = verschmolzen (j), ab der 4. Silbe einer Marke und hinter der letzten Marke überzählig (o)
function g9Place(C, W) {
  const P = C.P, last = P.length ? P[P.length - 1] : -1; let prevK = -2, run = 0;
  for (const q of W) {
    if (q.nm) { prevK = -2; continue; }
    const over = q.pi >= P.length || last < 0;
    q.k = over ? last : P[Math.max(0, q.pi)];
    if (over) { q.o = true; continue; }
    if (q.k === prevK) { run++; q.o = run > 3; } else { run = 1; q.o = false; }
    prevK = q.k;
  }
  return W;
}
function g9BuildS(W, mk) {
  const s = []; let prevK = -2;
  for (const q of W) {
    const t = q.nm ? q.t : q.k >= 0 && mk[q.k] ? mk[q.k].t : (mk.length ? mk[mk.length - 1].t : 0), o = {x: q.x, t: tkR6(t)};
    if (q.w) o.w = q.w;
    if (!q.nm && !q.o && q.k === prevK && s.length) o.j = 1;
    if (q.o) o.o = 1;
    if (isNum(q.p)) o.p = q.p;
    if (q.u) o.u = 1;
    if (!q.nm && !q.o) prevK = q.k;
    s.push(o);
  }
  return s;
}
// Klartext für `lyrics` (§5.3): Silben eines Worts mit „-“, Wörter mit Leerzeichen, ≤ 400 Zeichen (am Wortende gekürzt)
function g9Plain(W) {
  const words = []; for (const q of W) { if (q.w || !words.length) words.push([q.x]); else words[words.length - 1].push(q.x); }
  let out = '';
  for (const w of words) { const z = w.join('-'), nx = out ? out + ' ' + z : z; if (nx.length > 400) break; out = nx; }
  return out;
}
// eine G9-Änderung schreiben: ly + lyrics, ein Undo (Art 'ly'), „geändert“ sofort
function g9Commit(C, W, label, o = {}) {
  const id = C.id, m = S.takes && S.takes[id]; if (!m) return false;
  const before = g9LySnap(id);
  g9Place(C, W);
  if (!W.length) { delete m.ly; delete m.lyrics; }
  else {
    const ly = g9NormLy({v: 1, lang: o.lang || C.lang, src: o.src || (C.vs5b ? 'vs5b' : C.src), s: g9BuildS(W, C.mk)}, m.len / m.sr);
    if (ly) m.ly = ly; else delete m.ly;
    const pl = wpNormLyr(g9Plain(W)); if (pl) m.lyrics = pl; else delete m.lyrics;
  }
  G9.view.delete(id);
  if (g9LySnap(id) === before) return false;
  undoPush({kind: 'ly', id, before, label});
  markDirty(); UI.dirty.all = true;
  if (WP.ed && WP.ed.id === id) wpPaint();
  return true;
}
// Wort um Silbe i: [a, b]
function g9WordAt(W, i) { if (i < 0 || i >= W.length) return null; let a = i, b = i; while (a > 0 && !W[a].w) a--; while (b + 1 < W.length && !W[b + 1].w) b++; return [a, b]; }
// erste Silbe auf Marke k (nicht überzählig), sonst -1
function g9SylIdx(W, k) { for (let i = 0; i < W.length; i++) if (!W[i].nm && W[i].k === k) return i; return -1; }
// nächste Silbe mit Marke > k (bzw. ≥ k)
function g9NextIdx(W, k, incl) { for (let i = 0; i < W.length; i++) if (!W[i].nm && (incl ? W[i].k >= k : W[i].k > k) && W[i].k >= 0) return i; return -1; }
const g9Str = (W, a, b) => W.slice(a, b + 1).map(q => q.x);
// Anzeige eines Worts im Feld: ohne Bindestriche, wenn die Trennung von selbst so herauskäme
function g9Show(parts, lang) { const j = parts.join(''); const a = g9Syl(j, lang); return a.length === parts.length && a.every((x, i) => x === parts[i]) ? j : parts.join('-'); }
function g9Clean(text) { return String(text || '').replace(/[\u0000-\u001f\u007f]/g, '').trim().split(/\s+/)[0] || ''; }

/* ---------- Operationen (§6.4, §6.5) auf W – je Druck ein Undo ---------- */
// Wort an k (ersetzen bzw. neu) – trocken (dry: Vorschau = Ergebnis)
function g9OpWord(C, k, text, dry) {
  const W = C.W.map(q => Object.assign({}, q)), word = g9Clean(text); if (!word) return {err: 'leer'};
  const lang = C.lang, parts = g9Syl(word, lang).slice(0, 24), n = parts.length, P = C.P;
  let i0 = g9SylIdx(W, k), a, b, old = null;
  if (i0 >= 0) { [a, b] = g9WordAt(W, i0); old = g9Str(W, a, b); }
  const pa = i0 >= 0 ? W[a].pi : C.piOf[k] >= 0 ? C.piOf[k] : null;
  if (pa == null) return {err: 'keine Marke'};
  // frei bis vor das nächste Wort (Ersetzen) bzw. vor die nächste Silbe (neu)
  let nx = i0 >= 0 ? b + 1 : W.findIndex(q => !q.nm && q.pi != null && q.pi > pa);
  if (nx < 0) nx = W.length;
  const pEnd = nx < W.length && W[nx].pi != null ? W[nx].pi : Math.max(P.length, pa + 1);
  const A = Math.max(1, pEnd - pa);
  // lokale Ausrichtung auf die freien Plätze (erste Silbe fest auf pa); Überzahl verschmolzen auf dem letzten Platz
  const sub = []; for (let p = pa; p < Math.min(pEnd, P.length); p++) sub.push(C.mk[P[p]]);
  let pis;
  if (n <= A && sub.length >= n) {
    const fs = (C.F && C.F.length ? P.slice(pa, pa + sub.length).map(j => C.F[j]) : null);
    const al = G9K.align(parts.map((x, q) => ({x, w: q ? 0 : 1, u: q ? 0 : 1, t: q ? undefined : sub[0].t})), sub, fs, {});
    pis = al.map((v, q) => (v.k >= 0 && !v.o ? pa + v.k : pa + Math.min(q, A - 1)));
    for (let q = 1; q < n; q++) if (pis[q] < pis[q - 1]) pis[q] = pis[q - 1];
  } else pis = parts.map((x, q) => pa + Math.min(q, A - 1));
  const merged = Math.max(0, n - A);
  const w0 = i0 >= 0 ? (W[a].w || 1) : 1;
  const nw = parts.map((x, q) => ({x, w: q ? 0 : w0, u: 1, pi: pis[q], o: false}));
  const lo = i0 >= 0 ? a : (nx < 0 ? W.length : nx), hi = i0 >= 0 ? b + 1 : lo;
  if (i0 < 0 && nx >= 0 && nx < W.length && W[nx].w === 0) W[nx].w = 1;  // neues Wort vor einer Silbe: die Silbe beginnt ein Wort
  const W2 = W.slice(0, lo).concat(nw, W.slice(hi));
  return {W: W2, n, parts, old, merged, first: lo, last: lo + n - 1, word: parts.join('-')};
}
function g9OpDel(C, k) {
  const W = C.W.map(q => Object.assign({}, q)), i0 = g9SylIdx(W, k); if (i0 < 0) return {err: 'kein Wort'};
  const [a, b] = g9WordAt(W, i0), old = g9Str(W, a, b), w2 = W[a].w === 2;
  W.splice(a, b - a + 1);
  if (w2 && a < W.length && W[a].w) W[a].w = 2;
  if (a < W.length && !W[a].w) W[a].w = 1;
  return {W, old};
}
// Wort vor Abschnitt k einfügen: erste Silbe auf k, der Rest ab hier rückt n Silben-Plätze nach rechts
function g9OpIns(C, k, text) {
  const W = C.W.map(q => Object.assign({}, q)), word = g9Clean(text); if (!word) return {err: 'leer'};
  const parts = g9Syl(word, C.lang).slice(0, 24), n = parts.length;
  let i0 = g9SylIdx(W, k); if (i0 >= 0) i0 = g9WordAt(W, i0)[0]; else i0 = g9NextIdx(W, k, false);
  const pk = i0 >= 0 && W[i0].k === k ? W[i0].pi : C.piOf[k]; if (pk == null || pk < 0) return {err: 'keine Marke'};
  if (i0 < 0) i0 = W.length;
  for (let i = i0; i < W.length; i++) if (W[i].pi != null) W[i].pi += n;
  if (i0 < W.length && !W[i0].w) W[i0].w = 1;
  const wl = i0 < W.length && W[i0].w === 2 ? 2 : 1; if (wl === 2) W[i0].w = 1;
  const nw = parts.map((x, q) => ({x, w: q ? 0 : wl, u: 1, pi: pk + q, o: false}));
  return {W: W.slice(0, i0).concat(nw, W.slice(i0)), parts, n, first: i0};
}
// gewählte Silbe (erste auf k bzw. die nächste danach)
function g9Pick(C, k) { const i = g9SylIdx(C.W, k); return i >= 0 ? i : g9NextIdx(C.W, k, false); }
function g9OpShift(C, k, d) {
  const W = C.W.map(q => Object.assign({}, q)), i0 = g9Pick(C, k);
  if (i0 < 0) return {err: 'Keine Silbe ab hier'};
  if (d < 0) {
    const prevPi = i0 > 0 && W[i0 - 1].pi != null ? W[i0 - 1].pi : -1;
    if (W[i0].pi <= 0 || W[i0].pi <= prevPi) return {err: prevPi >= 0 ? 'Schon mit der vorigen Silbe verschmolzen' : 'Schon am Anfang'};
    for (let i = i0; i < W.length; i++) if (W[i].pi != null) { W[i].pi = Math.max(W[i].pi - 1, 0); if (i > 0 && W[i - 1].pi != null && W[i].pi < W[i - 1].pi) W[i].pi = W[i - 1].pi; }
  } else for (let i = i0; i < W.length; i++) if (W[i].pi != null) W[i].pi += 1;
  return {W, i0};
}
function g9OpMerge(C, k) {
  const W = C.W.map(q => Object.assign({}, q)), i0 = g9SylIdx(W, k); if (i0 < 0) return {err: 'Keine Silbe in diesem Abschnitt'};
  let e = i0; while (e + 1 < W.length && W[e + 1].pi === W[i0].pi) e++;
  if (e - i0 + 1 >= 3) return {err: 'Höchstens 3 Silben auf einer Marke'};
  const n1 = e + 1; if (n1 >= W.length || W[n1].pi == null) return {err: 'Keine nächste Silbe'};
  const p = W[i0].pi; W[n1].pi = p;
  for (let i = n1 + 1; i < W.length; i++) if (W[i].pi != null) { W[i].pi -= 1; if (W[i].pi < W[i - 1].pi) W[i].pi = W[i - 1].pi; }
  return {W, i0};
}
function g9OpSplit(C, k) {
  const W = C.W.map(q => Object.assign({}, q)), i0 = g9SylIdx(W, k); if (i0 < 0) return {err: 'Keine Silbe in diesem Abschnitt'};
  let e = i0; while (e + 1 < W.length && W[e + 1].pi === W[i0].pi) e++;
  if (e === i0) return {err: 'Nur eine Silbe in diesem Abschnitt'};
  const p = W[e].pi; if (p + 1 >= C.P.length) return {err: 'Keine freie Marke – beide Silben bleiben zusammen.'};
  W[e].pi = p + 1;
  if (e + 1 < W.length && W[e + 1].pi != null && W[e + 1].pi <= p + 1) for (let i = e + 1; i < W.length; i++) if (W[i].pi != null) W[i].pi += 1;
  return {W, i0};
}
// Nachrücken (nach Ersetzen mit Verschmelzen): der Rest ab dem nächsten Wort rückt um n Plätze nach rechts, das Wort verteilt sich
function g9OpNach(C, k, n) {
  const W = C.W.map(q => Object.assign({}, q)), i0 = g9SylIdx(W, k); if (i0 < 0 || !(n > 0)) return {err: 'Kein Wort'};
  const [a, b] = g9WordAt(W, i0);
  for (let i = b + 1; i < W.length; i++) if (W[i].pi != null) W[i].pi += n;
  const pa = W[a].pi; for (let i = a; i <= b; i++) W[i].pi = pa + (i - a);
  return {W, i0: a};
}
// ganzer Text (§7.7): Zeilen = Atempausen (w: 2), Einfügen ersetzt den ganzen Text des Takes
function g9OpText(C, text, lang) {
  const L = !lang || lang === 'auto' ? G9K.guess(text) : lang, sy = [];
  String(text || '').replace(/\r/g, '').split('\n').forEach(line => {
    line.trim().split(/\s+/).filter(Boolean).forEach((wd, wi) => {
      const auto = G9K.auto(wd), parts = g9Syl(wd, L).slice(0, 24);
      parts.forEach((x, q) => sy.push({x: x.slice(0, 24), w: q ? 0 : wi ? 1 : 2, p: auto && parts.length > 1 && G9K.PH ? .5 : undefined}));
    });
  });
  if (!sy.length) return {W: [], lang: L};
  const m = C.m, al = G9K.align(sy, C.mk, C.F, {len: m.len / m.sr});
  const W = sy.slice(0, G9_MAX).map((q, i) => ({x: q.x, w: q.w, u: 0, p: q.p, k: al[i].k, o: al[i].o}));
  // Plätze neu: alle bisherigen plus jede Marke, die jetzt eine Silbe trägt (g9Place liest C.P)
  const PS = new Set(C.P); for (const q of W) if (!q.o && q.k >= 0) PS.add(q.k);
  C.P = [...PS].sort((x, y) => x - y); const pm = new Map(C.P.map((j, p) => [j, p]));
  let ext = C.P.length; for (const q of W) q.pi = q.o ? ext++ : pm.get(q.k);
  return {W, lang: L, n: sy.length};
}
// alles aus der Test-API und der Bedienung: g9Set(id, {op, k, text, d, n, lang})
function g9Set(id, op) {
  if (!op) return {ok: false};
  const C = g9Ctx(id); if (!C) return {ok: false, err: 'Kein Take'};
  if (!C.mk.length && op.op !== 'text') return {ok: false, err: 'Marken werden gesucht …'};
  let r, label, tst = null, srcO = null, langO = null;
  switch (op.op) {
    case 'word': r = g9OpWord(C, op.k, op.text); if (r.err) break;
      label = 'Songtext: ' + r.parts.join('');
      if (r.old) tst = r.old.join('') + ' → ' + r.parts.join('');
      if (r.merged > 0) tst = (tst ? tst + ' · ' : '') + (r.merged + 1) + ' Silben auf einer Marke';
      if (!C.m.ly && !C.vs5b) srcO = 'getippt';
      break;
    case 'del': r = g9OpDel(C, op.k); if (r.err) break; label = 'Wort gelöscht: ' + r.old.join(''); tst = r.old.join('') + ' gelöscht'; break;
    case 'ins': r = g9OpIns(C, op.k, op.text); if (r.err) break; label = 'Wort eingefügt: ' + r.parts.join(''); tst = r.parts.join('') + ' eingefügt'; if (!C.m.ly && !C.vs5b) srcO = 'getippt'; break;
    case 'shift': r = g9OpShift(C, op.k, op.d < 0 ? -1 : 1); if (r.err) break; label = op.d < 0 ? 'Text ab hier ‹ Silbe' : 'Text ab hier Silbe ›'; tst = label; break;
    case 'merge': r = g9OpMerge(C, op.k); if (r.err) break; label = 'Silben verschmolzen'; tst = label; break;
    case 'split': r = g9OpSplit(C, op.k); if (r.err) break; label = 'Silben getrennt'; tst = label; break;
    case 'nach': r = g9OpNach(C, op.k, op.n | 0); if (r.err) break; label = 'Nachgerückt'; tst = label; break;
    case 'text': r = g9OpText(C, op.text, op.lang); label = r.W.length ? 'Songtext eingefügt' : 'Songtext gelöscht'; tst = label; srcO = 'eingefuegt'; langO = r.lang; break;
    default: return {ok: false, err: 'unbekannt'};
  }
  if (r.err) return {ok: false, err: r.err};
  const ch = g9Commit(C, r.W, label, {src: srcO, lang: langO});
  return {ok: ch, label, toast: tst, merged: r.merged || 0, first: r.first, last: r.last, n: r.n, i0: r.i0};
}

/* ---------- Sicht für Anzeige: je Marke {txt, kind} + überzählige ---------- */
function g9Cells(C, Wv) {
  const W = Wv || C.W, mk = C.mk, cells = mk.map(() => ({s: [], over: []})), extra = [], dash = [];
  for (let i = 0; i < W.length; i++) {
    const q = W[i];
    if (q.nm) { dash.push({x: q.x, t: q.t, i}); continue; }
    if (q.k < 0 || !cells[q.k]) { extra.push({x: q.x, i}); continue; }
    if (q.o && q.k === mk.length - 1 && W.slice(i).every(z => z.o || z.nm)) { extra.push({x: q.x, i, k: q.k}); continue; }
    (q.o ? cells[q.k].over : cells[q.k].s).push(i);
  }
  // „–“ = Melisma der vorigen Silbe, „·“ = leer (vor dem Text oder nach einer Pause)
  let seen = false;
  cells.forEach((c, j) => { if (c.s.length) { seen = true; c.kind = 'syl'; } else { c.kind = seen && !(mk[j].word) ? 'mel' : 'empty'; if (mk[j].word) seen = false; } });
  return {cells, extra, dash};
}
// wpPaint (Marken- und Text-Modus): Beschriftung je Marke
function g9LabelsOf(id, mk) {
  const C = g9Ctx(id); if (!C || !C.W.length) return null;
  const {cells, extra} = g9Cells(C);
  return {labels: cells.map(c => (c.s.length ? c.s.map(i => C.W[i].x).join('·') : c.kind === 'mel' ? '–' : '·')), extra: extra.map(e => C.W[e.i].x)};
}
function g9ViewApi(id) {
  const C = g9Ctx(id); if (!C) return null;
  const {cells, extra, dash} = g9Cells(C);
  return {marks: C.mk.length, places: C.P.slice(), cells: cells.map(c => ({x: c.s.map(i => C.W[i].x), over: c.over.map(i => C.W[i].x), kind: c.kind})), extra: extra.map(e => C.W[e.i].x), dash: dash.map(d => ({x: d.x, t: d.t})),
    syl: C.W.map(q => ({x: q.x, k: q.k, o: !!q.o, w: q.w || 0, u: !!q.u, pi: q.pi}))};
}
