/* ======================= G9 — Songtext aus Gesang (Nachtrag 8, Paket G9; G9d = Einbau G9a-Kern + G9c-Text-Modus + G9b-V) =======================
   Start-Pfad (A.13): Kern-Fabrik g9Make (G9a, DOM-frei, erst beim ersten Bedarf ausgeführt; auch im VS5a-Worker über toString),
   Normalisierer (Take-Feld `ly`, Format 5 additiv), Undo-Art 'ly' (§5.6), Marken-Haken in wpEdit (§6.5), Haken „Aufnahme hat Vorrang“
   (§6.6.10), wpUndone + G9.auto (§7.8), tkHeardMap (§6.7). Text-Modus, Silben-Muster-Lader, Erkennungs-Ablauf: Block sq-g9-src,
   ausgewertet beim ersten [Text] bzw. beim Öffnen des Marken-Editors für einen Take mit `ly`.
   ly = {v: 1, lang: 'de'|'en', src: 'erkannt'|'getippt'|'eingefuegt'|'vs5b', s: [{x, t, w?, j?, o?, p?, u?}]} (§5.1) */
/*@G9KERN@*/
const G9 = {w: null, job: new Map(), hold: false, feat: new Map(), auto: new Map(), view: new Map(), ed: null, sm: {state: 'none', bytes: 0, how: null, rev: null},
  loaded: false, ms: 0, err: null, play: [], hap: [], net: [], kb: null, ownStop: false, K: null, syl: {de: null, en: null}, sylB: {}, wSyl: null, mkMsg: null, saves: 0};
const G9_MAX = 4000;
// der Kern: einmal erzeugt, erst wenn ihn etwas braucht (Normalisieren eines Takes mit ly, Marken-Haken, Text-Modus)
function g9K() { if (!G9.K) G9.K = g9Make(); return G9.K; }
// §5.2: verwirft keine Silbe des Nutzers – klemmt und ordnet nur (Kern normLy)
function g9NormLy(v, len) { return v ? g9K().normLy(v, len) : null; }
tkExt().take.push((m, o) => { if (!m.ly) return; const l = g9NormLy(m.ly, o.len / o.sr); if (l) o.ly = l; });
// Undo-Art 'ly' (§5.6): nur `ly` und `lyrics` eines Takes
function g9LySnap(id) { const m = S.takes && S.takes[id]; return JSON.stringify(m ? {ly: m.ly || null, lyrics: m.lyrics || null} : null); }
function g9LyPut(id, val) {
  const m = S.takes && S.takes[id], v = val ? JSON.parse(val) : null; if (!m || !v) return;
  if (v.ly) m.ly = v.ly; else delete m.ly;
  if (v.lyrics) m.lyrics = v.lyrics; else delete m.lyrics;
  G9.view.delete(id);
  if (typeof g9Undone === 'function') g9Undone(id); else if (typeof wpPaint === 'function') wpPaint();
}
// Block sq-g9-src (Muster sq-mk-src): einmal auswerten
function g9Load() {
  if (G9.loaded) return true;
  const t0 = performance.now(), el = document.getElementById('sq-g9-src');
  try {
    if (!el) throw new Error('sq-g9-src fehlt');
    const sc = document.createElement('script'); sc.textContent = el.textContent; document.head.appendChild(sc); sc.remove();
    if (typeof g9On !== 'function') throw new Error('G9 nicht geladen');
    G9.loaded = true;
  } catch (e) { G9.err = String(e && e.message || e); logErr(e); }
  G9.ms = performance.now() - t0;
  return G9.loaded;
}
const g9Mode = () => !!(WP.ed && WP.ed.g9);
function g9OnStop() { if (G9.ownStop || !g9Mode() || typeof g9End !== 'function') return; g9End('stop'); }
// tkHeardMap(id, a) (§6.7, nur lesend): welche Zeitkarte steckt im Puffer, der jetzt klingt? null = Quell-Zeiten (Roh-/Säubern-Take)
function tkHeardMap(id, a) {
  if (WP.ab) return null;
  const b = tkPlayBuf(id, a); if (!b) return null;
  for (const M of [WP.cache, WP.old, WP.alt]) { const c = M.get(id); if (c && c.buf === b) return c.map && !wpMapInfo(c.map).ident ? c.map : null; }
  return null;
}
// eine G9-Änderung schreiben ohne Undo (Marken-Haken, automatische Erkennung): ly normalisiert, lyrics = Klartext (§5.3)
function g9PutLy(m, s, lang, src) {
  if (!s || !s.length) { delete m.ly; delete m.lyrics; return; }
  const K = g9K(), ly = K.normLy({v: 1, lang, src, s}, m.len / m.sr);
  if (!ly) { delete m.ly; delete m.lyrics; return; }
  m.ly = ly; const pl = wpNormLyr(K.lyText(ly)); if (pl) m.lyrics = pl; else delete m.lyrics;
}
// Marken-Haken (§6.5) – läuft in wpEdit, im selben 'takes'-Undo: Marke verschoben → ihre Silben folgen; gelöscht → mit der vorigen
// verschmolzen (Überzahl o, nichts geht verloren); gesetzt → keine Silbe wandert. mk0 = Marken vor, mk1 = nach der Änderung
function g9MarkHook(id, mk0, mk1) {
  const m = S.takes && S.takes[id]; if (!m || !m.ly || !mk0 || !mk1) return;
  try {
    const K = g9K(), F = typeof g9FeatCached === 'function' ? g9FeatCached(id, mk0) : null;
    const ly = Object.assign({}, m.ly, {s: K.pack(K.view(m.ly, mk0, F).V, mk0)});   // zuerst die Sicht (§5.1 Neu-Einrasten) – Anker = Marken-Zeit
    const t0 = mk0.map(k => k.t), t1 = mk1.map(k => k.t);
    let op = null;
    if (t1.length === t0.length + 1) { const t = t1.find(x => !t0.includes(x)); if (t != null) op = {op: 'mkAdd', t}; }
    else if (t1.length + 1 === t0.length) { const t = t0.find(x => !t1.includes(x)); if (t != null) op = {op: 'mkDel', t}; }
    else if (t1.length === t0.length) { const d = t0.map((x, i) => i).filter(i => t0[i] !== t1[i]); if (d.length === 1) op = {op: 'mkMove', tOld: t0[d[0]], tNew: t1[d[0]]}; }
    if (!op) return;
    const r = K.apply(ly, mk0, F, op); if (!r || !r.ok) return;
    const before = JSON.stringify(m.ly);
    g9PutLy(m, r.s, ly.lang, ly.src);
    G9.view.delete(id); G9.auto.delete(id);
    G9.mkMsg = op.op === 'mkDel' && (r.merged || r.over) ? [r.merged ? r.merged + (r.merged === 1 ? ' Silbe' : ' Silben') + ' verschmolzen' : '', r.over ? r.over + (r.over === 1 ? ' Silbe' : ' Silben') + ' ohne Marke' : ''].filter(Boolean).join(' · ') : null;
    if (G9.mkMsg && JSON.stringify(m.ly) !== before) toast(G9.mkMsg);
  } catch (e) { logErr(e); }
}
// VS5b wpSetLyrics (Test-API wpLyrics, Rückfall-Pop): mit vorhandenem ly schreibt es beides (§8)
function g9SetLyricsHook(m, v) {
  if (!m.ly) return false;
  if (!v) { delete m.ly; delete m.lyrics; return true; }
  const id = Object.keys(S.takes).find(k => S.takes[k] === m), mk = id && wpMarks(id);
  if (!mk) return false;
  const K = g9K(), r = K.apply(m.ly, mk, typeof g9FeatCached === 'function' ? g9FeatCached(id, mk) : null, {op: 'ganz', text: v, lang: m.ly.lang});
  g9PutLy(m, r && r.s, m.ly.lang, 'eingefuegt'); G9.view.delete(id);
  return true;
}
// Aufnahme hat Vorrang (§6.6.10): jeder Mikrofon-Start beendet die Erkennung; 2 s nach dem letzten Mikrofon geht es weiter
function g9MicBusy() { try { return !!((typeof MIC !== 'undefined' && MIC.run) || (typeof ST !== 'undefined' && (ST.run || ST.on)) || (typeof MICTAP !== 'undefined' && (MICTAP.stream || MICTAP.p || MICTAP.users.size))); } catch (e) { return false; } }
function g9MicOn() {
  if (!G9.hold) G9.holdAt = performance.now();
  G9.hold = true;
  if (typeof g9RecHold === 'function') g9RecHold();
  if (!G9.holdT) G9.holdT = setInterval(() => {
    if (g9MicBusy()) { G9.free = 0; return; }
    G9.free = G9.free || performance.now();
    if (performance.now() - G9.free < 2000) return;
    clearInterval(G9.holdT); G9.holdT = 0; G9.free = 0; G9.hold = false;
    if (typeof g9RecResume === 'function') g9RecResume();
  }, 250);
}
// ↶ ↷ eines 'takes'-Schritts (wpUndone): ein automatisches Erkennungsergebnis, das der Schnappschuss noch nicht kennt, wieder einsetzen (§7.8)
function g9TakesUndone() {
  for (const [id, a] of G9.auto) { const m = S.takes && S.takes[id]; if (m && !m.ly && !m.lyrics && a && a.ly) { m.ly = JSON.parse(JSON.stringify(a.ly)); if (a.lyrics) m.lyrics = a.lyrics; G9.view.delete(id); } }
}
// Worker-Ops (VS5a-Worker, §8): g9f Merkmale, g9a ganze Ausrichtung/Schritt, g9s Silben-Muster
function g9Run(K, m) {
  if (m.op === 'g9f') return K.feat(m.x, m.sr, m.marks);
  if (m.op === 'g9a') return K.apply(m.ly, m.marks, m.feat, m.step, m.o);
  if (m.op === 'g9s') return K.sylLoad(m.lang, m.bytes);
  return null;
}
function g9Call(m) {
  const w = wpWorker(), local = () => g9Run(g9K(), m);
  if (!w) return Promise.resolve().then(local);
  if (G9.wSyl !== w) { G9.wSyl = w; for (const L of Object.keys(G9.sylB)) try { w.postMessage({op: 'g9s', lang: L, bytes: G9.sylB[L], id: -1}); } catch (e) {} }
  return new Promise((ok, no) => {
    const id = ++WP.wid, x = m.x ? new Float32Array(m.x) : null;
    const to = setTimeout(() => { WP.wq.delete(id); try { ok(local()); } catch (e) { no(e); } }, 20000);
    WP.wq.set(id, {ok, no: e => { try { ok(local()); } catch (er) { no(e); } }, to});
    try { w.postMessage(Object.assign({}, m, {id}, x ? {x} : {}), x ? [x.buffer] : []); } catch (e) { clearTimeout(to); WP.wq.delete(id); try { ok(local()); } catch (er) { no(er); } }
  });
}
// Beschriftung je Marke für wpPaint (wie VSM.assignLyrics: {labels, extra}); mit `ly` aus der Sicht (§5.1), sonst VS5b
function g9Labels(id, mk) { if (!g9Load()) return null; return g9LabelsOf(id, mk); }
const G9_API = {
  g9Syl: (w, lang) => (g9Load() ? g9Syl(w, lang) : null),
  g9Align: (syl, marks, feat, o) => (g9Load() ? deep(g9AlignApi(syl, marks, feat, o)) : null),
  g9Feat: r => (g9Load() ? g9FeatApi(wpId(r)) : Promise.resolve(null)),
  g9View: r => (g9Load() ? deep(g9ViewApi(wpId(r))) : null),
  g9Set: (r, op) => (g9Load() ? g9Set(wpId(r), op) : null),
  g9SetAsync: (r, op) => (g9Load() ? g9SetAsync(wpId(r), op) : Promise.resolve(null)),
  g9Ly: r => { const m = S.takes && S.takes[wpId(r)]; return m && m.ly ? deep(m.ly) : null; },
  g9NormLy: (v, len) => g9NormLy(v, len == null ? 1e9 : len),
  g9Text: (r, on) => { if (!WP.ed) { if (on === false) return false; wpOpen(typeof r === 'string' ? null : r || {t: stimmeT(), s: R.selS}); } if (!g9Load()) return false; return g9Toggle(on); },
  g9Sel: k => (g9Mode() ? g9Select(k, {api: true}) : false),
  g9Info: () => (G9.loaded ? g9InfoApi() : {loaded: false, sm: Object.assign({}, G9.sm), hold: G9.hold, kern: G9.K ? G9.K.VERSION : null}),
  g9FeatSim: (r, f) => { const id = wpId(r); G9.featSim = G9.featSim || new Map(); if (f) G9.featSim.set(id, f); else G9.featSim.delete(id); G9.ctx = null; if (WP.ed) wpPaint(); return !!f; },
  g9KbSim: h => { G9.kb = h == null ? null : +h; if (G9.loaded) g9Dock(); return G9.kb; },
  g9PlayLog: () => G9.play.map(x => Object.assign({}, x)),
  g9HapLog: () => G9.hap.map(x => Object.assign({}, x)),
  g9Net: () => G9.net.map(x => Object.assign({}, x)),
  g9Geom: () => (G9.loaded && g9Mode() ? g9GeomApi() : null),
  g9SylLoad: lang => (g9Load() ? g9SylEnsure(lang) : Promise.resolve('einfach')),
  g9SylMode: lang => (G9.K ? G9.K.sylMode(lang) : 'einfach'),
  g9Recognize: (r, o) => (g9Load() && typeof g9RecRun === 'function' ? g9RecRun(wpId(r), o || {}) : Promise.resolve(null)),
  g9RecStop: () => (G9.loaded && typeof g9RecStop === 'function' ? g9RecStop() : false),
  g9AsrSim: (fn, o) => (g9Load() ? g9AsrSimSet(fn, o) : false),      // nur Tests: Ersatz für das Sprachmodell (G9b-2 fehlt, §9 Stopp-Punkt 1)
};
