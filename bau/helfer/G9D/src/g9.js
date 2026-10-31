/* ===== G9 (Nachtrag 8, Paket G9): Block sq-g9-src – Text-Modus (G9c), dünne Hüllen um den G9a-Kern g9Make (§7.12),
   Silben-Muster-Lader (§6.2, Cache synq-g9-v1), Erkennungs-Ablauf ohne Modell (G9b-V, §6.6) ===== */

/* ---------- Sprache raten (Auto, §7.7): Umlaute/ß oder häufige deutsche Wörter → de, häufige englische → en ---------- */
function g9Guess(text) {
  const t = ' ' + String(text || '').toLowerCase().replace(/[^a-zäöüß']+/g, ' ') + ' ';
  if (/[äöüß]/.test(t)) return 'de';
  const de = (t.match(/ (der|die|das|und|ich|nicht|ist|ein|eine|du|wir|mein|dein|mit|auf|sich|zu|im|es|sch\w*) /g) || []).length;
  const en = (t.match(/ (the|and|you|i|is|it|my|your|me|love|we|to|of|in|on|be|with|that|this|don't|i'm) /g) || []).length;
  return en > de ? 'en' : 'de';
}
const g9L = (lang, text) => (lang === 'en' ? 'en' : lang === 'de' ? 'de' : g9Guess(text));
const G9K = {guess: g9Guess};   // Rest des früheren Platzhalters: nur noch die Sprach-Vermutung

/* ---------- Silben-Muster (§6.2): vendor/g9/syl/, SHA-256, Cache synq-g9-v1; ohne Muster Vokalkern-Regel ---------- */
const G9_SYL = {de: {f: 'de-x-syllable.wasm', h: '085f65beb9c5b8aeb72ae661252f643ab1285bd659586fb2cfb1e93686c0d8dc', n: 94905},
  en: {f: 'en-us.wasm', h: '92e36e95948c94b68a86c06fcd846fd88bb405933d264071ee76bab2f9be3dc9', n: 21027}};
const G9_CACHE = 'synq-g9-v1';
async function g9Sha(buf) {
  if (!(window.crypto && crypto.subtle)) throw new Error('keine Prüfsumme möglich');
  const d = new Uint8Array(await crypto.subtle.digest('SHA-256', buf)); return Array.from(d, b => b.toString(16).padStart(2, '0')).join('');
}
function g9SylEnsure(lang) {
  const L = lang === 'en' ? 'en' : 'de', K = g9K();
  if (K.sylMode(L) === 'muster') return Promise.resolve('muster');
  if (G9.syl[L]) return G9.syl[L];
  const d = G9_SYL[L], url = new URL('vendor/g9/syl/' + d.f, document.baseURI).href;
  G9.syl[L] = (async () => {
    let buf = null, cache = null;
    try { if (window.caches && window.isSecureContext) cache = await caches.open(G9_CACHE); } catch (e) { cache = null; }
    try { if (cache) { const hit = await cache.match(url); if (hit) { const b = await hit.arrayBuffer(); if (await g9Sha(b) === d.h) buf = b; else await cache.delete(url); } } } catch (e) { buf = null; }
    if (!buf) {
      if (!/^https?:/.test(url)) throw new Error('kein Server');
      const t0 = performance.now(), r = await fetch(url, {method: 'GET', cache: 'no-cache'});
      G9.net.push({url, method: 'GET', bytes: 0, up: 0, ms: Math.round(performance.now() - t0), st: r.status, kind: 'syl'});
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const b = await r.arrayBuffer(); G9.net[G9.net.length - 1].bytes = b.byteLength;
      if (await g9Sha(b) !== d.h) throw new Error('Prüfsumme falsch: ' + d.f);
      buf = b;
      try { if (cache) await cache.put(url, new Response(b.slice(0), {headers: {'Content-Type': 'application/wasm'}})); } catch (e) {}
    }
    if (!K.sylLoad(L, new Uint8Array(buf))) throw new Error('Muster-Modul');
    G9.sylB[L] = new Uint8Array(buf); G9.wSyl = null;                 // Worker bekommt die Muster mit dem nächsten Auftrag
    G9.ctx = null;
    return 'muster';
  })().catch(e => { G9.sylErr = String(e && e.message || e); G9.syl[L] = null; G9.sylFail = G9.sylFail || {}; G9.sylFail[L] = G9.sylErr; return 'einfach'; });
  return G9.syl[L].then(r => { if (r === 'muster' && WP.ed && WP.ed.g9) { if (typeof g9Fill === 'function') g9Fill(WP.ed); wpPaint(); } return r; });
}
const g9SylMode = lang => g9K().sylMode(lang === 'en' ? 'en' : 'de');

/* ---------- Schnittstelle nach außen (Test-API §7.12) ---------- */
function g9Syl(word, lang) { return g9K().syl(word, g9L(lang, word)); }
function g9AlignApi(syl, marks, feat, o) { return g9K().align(syl.map(q => (typeof q === 'string' ? {x: q} : q)), marks, feat, o || {}); }

/* ---------- Merkmale je Marke (§6.1): im VS5a-Worker (g9f), Cache je Take + Quellpuffer + Marken ---------- */
function g9FeatSrc(id) { try { return wpBase(id, null, true); } catch (e) { return null; } }
function g9FeatCached(id, mk) {
  mk = mk || wpMarks(id); if (!mk) return null;
  const sim = G9.featSim && G9.featSim.get(id); if (sim && sim.length === mk.length) return sim;   // nur Tests (g9FeatSim)
  const f = G9.feat.get(id), b = g9FeatSrc(id);
  return f && f.mk === mk && b && f.bid === wpBid(b) ? f.f : null;
}
// sync = true: fehlen die Merkmale, im Haupt-Faden rechnen (nur für einen Schritt in den ersten ≈ 100 ms nach dem Öffnen)
function g9FeatOf(id, sync) {
  const mk = wpMarks(id); if (!mk) return null;
  const c = g9FeatCached(id, mk); if (c) return c;
  const b = g9FeatSrc(id); if (!b) return null;
  if (sync) { const f = g9K().feat(b.getChannelData(0), b.sampleRate, mk); G9.feat.set(id, {mk, bid: wpBid(b), f}); return f; }
  g9FeatReq(id);
  return null;
}
function g9FeatReq(id) {
  const mk = wpMarks(id), b = g9FeatSrc(id); if (!mk || !b) return Promise.resolve(null);
  const bid = wpBid(b), key = id + '@' + bid; G9.fq = G9.fq || new Map();
  const q = G9.fq.get(key); if (q && q.mk === mk) return q.p;
  const p = g9Call({op: 'g9f', x: b.getChannelData(0), sr: b.sampleRate, marks: mk.map(k => ({t: k.t, conf: k.conf}))}).then(f => {
    G9.fq.delete(key);
    if (wpMarks(id) !== mk || !Array.isArray(f)) return null;
    G9.feat.set(id, {mk, bid, f}); G9.ctx = null;
    if (WP.ed && WP.ed.id === id && WP.ed.g9) { g9Fill(WP.ed); wpPaint(); }
    return f;
  }, e => { G9.fq.delete(key); logErr(e); return null; });
  G9.fq.set(key, {mk, p});
  return p;
}
async function g9FeatApi(id) { const c = g9FeatCached(id); if (c) return deep(c); await (wpMarks(id) ? null : wpDetect(id)); const f = await g9FeatReq(id); return f ? deep(f) : deep(g9FeatOf(id, true)); }

/* ---------- Arbeits-Form eines Takes: W = Sicht des Kerns (§5.1) + Silben-Plätze P (§6.1) ---------- */
// VS5b-Text (§5.3): Silbe k → Marke k; Silben über 24 Zeichen werden geteilt (ly erlaubt 24), damit kein Buchstabe verloren geht
function g9Vs5b(lyrics, mk, lang) { const t = String(lyrics || '').trim().split(/\s+/).map(w => w.split('-').filter(Boolean).flatMap(x => x.match(/[\s\S]{1,24}/g)).join('-')).join(' '); return g9K().fromVs5b(t, mk, lang); }
function g9Pos(SL, k) { let lo = 0, hi = SL.length - 1; while (lo <= hi) { const h = (lo + hi) >> 1; if (SL[h] === k) return h; if (SL[h] < k) lo = h + 1; else hi = h - 1; } return lo; }
function g9Ctx(id, sync) {
  const m = S.takes && S.takes[id], mk = wpMarks(id) || [];
  if (!m) return null;
  const F0 = g9FeatOf(id, sync), c = G9.ctx;
  if (c && c.id === id && c.m === m && c.ly === m.ly && c.lyrics === m.lyrics && c.mk === mk && c.F === F0 && c.sm === g9SylMode('de') + g9SylMode('en')) return c.C;
  const C = g9Ctx0(id, m, mk, F0);
  G9.ctx = {id, m, ly: m.ly, lyrics: m.lyrics, mk, F: F0, C, sm: g9SylMode('de') + g9SylMode('en')};
  return C;
}
function g9Ctx0(id, m, mk, F) {
  const K = g9K(); let ly = null, lang = 'de', src = 'getippt', vs5b = false;
  if (m.ly && m.ly.s) { ly = m.ly; lang = m.ly.lang; src = m.ly.src; }
  else if (m.lyrics) { vs5b = true; src = 'vs5b'; lang = g9Guess(m.lyrics); ly = g9Vs5b(m.lyrics, mk, lang); }
  const V = ly ? K.view(ly, mk, F).V : [];
  const W = g9WOf(V, mk, F);
  return Object.assign({id, m, mk, ly, lang, src, vs5b, F}, W);
}
// Sicht → W mit Platz-Index pi; überzählige am Ende bekommen Plätze hinter der letzten Marke
function g9WOf(V, mk, F) {
  const K = g9K(), CO = K.costs(mk, F), P = K.slotsOf(V, CO, mk.length), piOf = new Int32Array(mk.length).fill(-1);
  P.forEach((j, p) => { piOf[j] = p; });
  let ext = P.length;
  const W = V.map(v => ({x: v.x, w: v.w || 0, u: v.u || 0, p: v.p, k: v.k, o: !!v.o, nm: !!v.nm, t: v.t}));
  W.forEach((q, i) => {
    if (q.nm) { q.pi = null; return; }
    const tail = q.o && q.k === mk.length - 1 && W.slice(i).every(z => z.o || z.nm);
    q.pi = tail ? ext++ : q.k >= 0 ? (piOf[q.k] >= 0 ? piOf[q.k] : g9Pos(P, q.k)) : 0;
  });
  return {W, P, piOf};
}
// ly.s → W (für Vorschau und Ergebnis-Auswertung)
function g9WFromS(C, s) { if (!s) return []; const V = g9K().view({s}, C.mk, C.F).V; return g9WOf(V, C.mk, C.F).W; }
function g9BuildS(W, mk) { return g9K().pack(W.map(q => Object.assign({}, q, {o: q.o ? 1 : 0})), mk); }
// Wort um Silbe i: [a, b]
function g9WordAt(W, i) { if (i < 0 || i >= W.length) return null; let a = i, b = i; while (a > 0 && !W[a].w) a--; while (b + 1 < W.length && !W[b + 1].w) b++; return [a, b]; }
// erste Silbe auf Marke k (nicht überzählig), sonst -1
function g9SylIdx(W, k) { for (let i = 0; i < W.length; i++) if (!W[i].nm && !W[i].o && W[i].k === k) return i; for (let i = 0; i < W.length; i++) if (!W[i].nm && W[i].k === k) return i; return -1; }
function g9NextIdx(W, k, incl) { for (let i = 0; i < W.length; i++) if (!W[i].nm && (incl ? W[i].k >= k : W[i].k > k) && W[i].k >= 0) return i; return -1; }
const g9Str = (W, a, b) => W.slice(a, b + 1).map(q => q.x);
// Anzeige eines Worts im Feld: ohne Bindestriche, wenn die Trennung von selbst so herauskäme
function g9Show(parts, lang) { const j = parts.join(''); const a = g9Syl(j, lang); return a.length === parts.length && a.every((x, i) => x === parts[i]) ? j : parts.join('-'); }
function g9Clean(text) { return String(text || '').replace(/[\u0000-\u001f\u007f]/g, '').trim().split(/\s+/)[0] || ''; }
const g9Nsyl = (C, text) => g9K().words(text, C.lang).length;

// eine G9-Änderung schreiben: ly + lyrics, ein Undo (Art 'ly'), „geändert“ sofort
function g9CommitS(C, s, label, o = {}) {
  const id = C.id, m = S.takes && S.takes[id]; if (!m) return false;
  const before = g9LySnap(id);
  g9PutLy(m, s, o.lang || C.lang, o.src || (C.vs5b ? 'vs5b' : C.src));
  G9.view.delete(id);
  if (g9LySnap(id) === before) return false;
  G9.auto.delete(id);                                                 // der Nutzer hat den Text geändert (§7.8)
  undoPush({kind: 'ly', id, before, label});
  markDirty(); UI.dirty.all = true;
  if (WP.ed && WP.ed.id === id) wpPaint();
  return true;
}

/* ---------- Schritte (§6.4, §6.5) → Kern apply; je Druck ein Undo ---------- */
// Wort an k (ersetzen bzw. neu) – trocken (Vorschau = Ergebnis): {W, first, last, merged, old, parts, sel, missing}
function g9OpWord(C, k, text) {
  const word = g9Clean(text); if (!word) return {err: 'leer'};
  if (!C.mk.length) return {err: 'keine Marke'};
  const r = g9K().apply(C.ly, C.mk, C.F, {op: 'wort', k, text: word, lang: C.lang});
  if (!r.ok || !r.s) return {err: r.toast || 'keine Marke'};
  const n = g9Nsyl(C, word), W = g9WFromS(C, r.s), last = (r.iNext | 0) - 1, first = last - n + 1;
  return {W, s: r.s, n, first, last, merged: r.merged || 0, missing: r.missing || 0, old: r.old ? [r.old] : null, parts: W.slice(first, last + 1).map(q => q.x), sel: r.sel, word: r.word};
}
function g9Pick(C, k) { const i = g9SylIdx(C.W, k); return i >= 0 ? i : g9NextIdx(C.W, k, false); }
// [Nachrücken] (§6.4): der Rest ab dem nächsten Wort rückt um n Silben-Plätze nach rechts, das Wort verteilt sich auf die frei gewordenen Plätze
function g9OpNach(C, k, n) {
  const W = C.W, i0 = g9SylIdx(W, k); if (i0 < 0 || !(n > 0)) return {err: 'Kein Wort'};
  const [a, b] = g9WordAt(W, i0), K = g9K();
  let s = C.ly.s.map(y => Object.assign({}, y));
  if (b + 1 < W.length) { const r = K.apply(Object.assign({}, C.ly, {s}), C.mk, C.F, {op: 'nach', i: b + 1, n}); if (!r.ok) return {err: r.toast || 'Nachrücken geht nicht'}; s = r.s; }
  const V = K.view({s}, C.mk, C.F).V, SL = K.slotsOf(V, K.costs(C.mk, C.F), C.mk.length), p0 = g9Pos(SL, V[a].k);
  let lim = SL.length;   // bis vor die nächste Silbe; eine feste Silbe ohne Marke ist Schranke (nur Plätze vor ihrer Zeit)
  if (b + 1 < V.length) { const y = V[b + 1]; if (y.k >= 0) lim = g9Pos(SL, y.k); else { lim = 0; while (lim < SL.length && C.mk[SL[lim]].t <= y.t + 1e-9) lim++; } }
  for (let q = a; q <= b; q++) { const p = Math.min(p0 + q - a, lim - 1); if (p >= 0 && SL[p] != null && V[q].k >= 0) { V[q].k = SL[p]; V[q].o = 0; } }
  return {s: K.pack(V, C.mk), i0: a};
}
// alles aus der Test-API und der Bedienung: g9Set(id, {op, k, text, d, n, lang})
function g9Set(id, op) {
  if (!op) return {ok: false};
  const C = g9Ctx(id, true); if (!C) return {ok: false, err: 'Kein Take'};
  if (!C.mk.length && op.op !== 'text') return {ok: false, err: 'Marken werden gesucht …'};
  const K = g9K(), W = C.W;
  let r = null, label, tst = null, srcO = null, langO = null, i0 = null, sel = null, res = {};
  const run = st => K.apply(C.ly, C.mk, C.F, st);
  switch (op.op) {
    case 'word': {
      const q = g9OpWord(C, op.k, op.text); if (q.err) return {ok: false, err: q.err};
      r = {ok: true, s: q.s}; label = 'Songtext: ' + q.parts.join('');
      if (q.old) tst = q.old.join('') + ' → ' + q.parts.join('');
      if (q.merged > 0) tst = (tst ? tst + ' · ' : '') + (q.merged + 1) + ' Silben auf einer Marke';
      if (!C.m.ly && !C.vs5b) srcO = 'getippt';
      res = {merged: q.merged, missing: q.missing, first: q.first, last: q.last, n: q.n}; sel = q.sel; break;
    }
    case 'del': { const i = g9SylIdx(W, op.k); if (i < 0) return {ok: false, err: 'kein Wort'}; r = run({op: 'loesch', i}); if (!r.ok) break; label = 'Wort gelöscht: ' + r.word; tst = r.word + ' gelöscht'; break; }
    case 'ins': {
      const word = g9Clean(op.text); if (!word) return {ok: false, err: 'leer'};
      const t0 = C.mk[op.k] ? C.mk[op.k].t : 0, hit = g9SylIdx(W, op.k);
      // mitten in einem Wort: vor das Wort, auf dessen ersten Platz
      const k = hit >= 0 ? W[g9WordAt(W, hit)[0]].k : op.k;
      let ia = W.findIndex(y => (y.k >= 0 && !y.nm ? y.k >= k : y.t >= (C.mk[k] ? C.mk[k].t : t0) - 1e-9)); if (ia < 0) ia = W.length;
      r = run({op: 'wort', k, text: word, lang: C.lang, ins: true}); if (!r.ok) break;
      label = 'Wort eingefügt: ' + r.word; tst = r.word + ' eingefügt'; if (!C.m.ly && !C.vs5b) srcO = 'getippt';
      res = {first: ia, n: r.n, last: ia + r.n - 1}; break;
    }
    case 'shift': {
      let i = g9Pick(C, op.k); if (i < 0) return {ok: false, err: 'Keine Silbe ab hier'};
      if (op.d > 0 && W[i].k === op.k && i + 1 < W.length && W[i + 1].k === W[i].k && !W[i + 1].o && !W[i + 1].nm) i = i + 1;   // §6.5: Verschmelzung löst sich zuerst
      if (op.d < 0) { const pv = i > 0 ? W[i - 1] : null; if (W[i].pi <= 0) return {ok: false, err: 'Schon am Anfang'}; if (pv && !pv.nm && pv.pi === W[i].pi) return {ok: false, err: 'Schon mit der vorigen Silbe verschmolzen'}; }
      r = run({op: op.d < 0 ? 'links' : 'rechts', i}); if (!r.ok) break; i0 = i;
      label = op.d < 0 ? 'Text ab hier ‹ Silbe' : 'Text ab hier Silbe ›'; tst = label; break;
    }
    case 'merge': {
      const i = g9SylIdx(W, op.k); if (i < 0) return {ok: false, err: 'Keine Silbe in diesem Abschnitt'};
      let e = i; while (e + 1 < W.length && W[e + 1].k === W[i].k && !W[e + 1].nm && !W[e + 1].o) e++;
      if (e - i + 1 >= 3) return {ok: false, err: 'Höchstens 3 Silben auf einer Marke'};
      if (e + 1 >= W.length || W[e + 1].nm) return {ok: false, err: 'Keine nächste Silbe'};
      r = run({op: 'versch', i: e}); if (!r.ok) break; i0 = i; label = 'Silben verschmolzen'; tst = label; break;
    }
    case 'split': {
      const i = g9SylIdx(W, op.k); if (i < 0) return {ok: false, err: 'Keine Silbe in diesem Abschnitt'};
      if (!(i + 1 < W.length && W[i + 1].k === W[i].k && !W[i + 1].nm)) return {ok: false, err: 'Nur eine Silbe in diesem Abschnitt'};
      r = run({op: 'trenn', i}); if (!r.ok) break; i0 = i; label = 'Silben getrennt'; tst = label; break;
    }
    case 'nach': { const q = g9OpNach(C, op.k, op.n | 0); if (q.err) return {ok: false, err: q.err}; r = {ok: true, s: q.s}; i0 = q.i0; label = 'Nachgerückt'; tst = label; break; }
    case 'neu': { if (!C.ly) return {ok: false, err: 'Kein Text'}; r = run({op: 'neu'}); label = 'Neu ausgerichtet'; tst = label; break; }
    case 'text': {
      const L = g9L(op.lang, op.text); langO = L; srcO = 'eingefuegt';
      r = op.s !== undefined ? {ok: true, s: op.s} : K.apply(C.ly, C.mk, C.F, {op: 'ganz', text: op.text, lang: L});
      const cut = !!(r.s && r.s.length >= G9_MAX && g9WordsCount(op.text) > G9_MAX);
      label = r.s && r.s.length ? 'Songtext eingefügt' : 'Songtext gelöscht'; tst = label + (cut ? ' · gekürzt auf ' + G9_MAX + ' Silben' : ''); break;
    }
    default: return {ok: false, err: 'unbekannt'};
  }
  if (!r || !r.ok) return {ok: false, err: (r && r.toast) || 'geht nicht'};
  const ch = g9CommitS(C, r.s, label, {src: srcO, lang: langO});
  return Object.assign({ok: ch, label, toast: tst, merged: 0, i0, sel: sel != null ? sel : r.sel}, res);
}
// Silbenzahl ohne Kappung (für den Hinweis „gekürzt“)
function g9WordsCount(text) { let n = 0; for (const w of String(text || '').split(/\s+/)) if (/[\p{L}\p{N}]/u.test(w)) n += Math.max(1, g9Syl(w, 'de').length); return n; }
// [Ganzer Text] und lange Schritte im Worker (§6.3: ganze Ausrichtung ≤ 60 ms im Worker; kein Haupt-Faden-Task > 50 ms)
async function g9SetAsync(id, op) {
  if (op && op.op === 'text') {
    const L = g9L(op.lang, op.text); await g9SylEnsure(L);
    const mk = wpMarks(id) || (await wpDetect(id)) || []; if (!S.takes[id]) return {ok: false};
    let F = g9FeatCached(id, mk); if (!F && mk.length) F = await g9FeatReq(id);
    const C = g9Ctx(id); if (!C) return {ok: false};
    const r = await g9Call({op: 'g9a', ly: C.ly, marks: C.mk.map(k => ({t: k.t, conf: k.conf})), feat: C.F, step: {op: 'ganz', text: op.text, lang: L}});
    if (!S.takes[id] || wpMarks(id) !== C.mk) return g9Set(id, Object.assign({}, op, {lang: L}));   // inzwischen geändert: sofort hier
    return g9Set(id, Object.assign({}, op, {lang: L, s: r && r.ok ? r.s : null}));
  }
  return g9Set(id, op);
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
  // „–“ nur zwischen Silben (die vorige klingt weiter); vor dem Text, nach einer Pause und hinter der letzten Silbe „·“
  let seen = false, lastS = -1; cells.forEach((c, j) => { if (c.s.length) lastS = j; });
  cells.forEach((c, j) => { if (c.s.length) { seen = true; c.kind = 'syl'; } else { c.kind = seen && j < lastS && !(mk[j].word) ? 'mel' : 'empty'; if (mk[j].word) seen = false; } });
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
    syl: C.W.map(q => ({x: q.x, k: q.k, o: !!q.o, w: q.w || 0, u: !!q.u, pi: q.pi, nm: !!q.nm})), feat: !!C.F, mode: g9SylMode(C.lang)};
}
