/* ======================= G9 — Songtext aus Gesang (Nachtrag 8, Paket G9; Zweig g9-br-U = G9c Text-Modus) =======================
   Start-Pfad (A.13, Dirigenten-Hinweis 3): Normalisierer g9NormLy (Take-Feld `ly`, Format 5 additiv), Undo-Art 'ly' (§5.6),
   Haken am Marken-Editor. Text-Modus, Platzhalter-Kern (bis g9-br-S) und Erkennen-Blatt: Block sq-g9-src, ausgewertet beim
   ersten [Text] bzw. beim Öffnen des Marken-Editors für einen Take mit `ly`.
   ly = {v: 1, lang: 'de'|'en', src: 'erkannt'|'getippt'|'eingefuegt'|'vs5b', s: [{x, t, w?, j?, o?, p?, u?}]} (§5.1) */
const G9 = {w: null, job: new Map(), hold: false, feat: new Map(), auto: new Map(), view: new Map(), ed: null, sm: {state: 'none', bytes: 0, how: null, rev: null},
  loaded: false, ms: 0, err: null, play: [], hap: [], net: [], kb: null, ownStop: false};
const G9_MAX = 4000, G9_SRC = ['erkannt', 'getippt', 'eingefuegt', 'vs5b'];
// §5.2: verwirft keine Silbe des Nutzers – klemmt und ordnet nur (feste Schlüssel-Reihenfolge, Speichern → Laden deep-equal)
function g9NormLy(v, len) {
  if (!v || typeof v !== 'object' || !Array.isArray(v.s)) return null;
  const out = []; let run = 0;
  for (const q of v.s.slice(0, G9_MAX)) {
    if (!q || typeof q !== 'object') continue;
    const x = String(q.x == null ? '' : q.x).replace(/[\u0000-\u001f\u007f-\u009f\s]/g, '').slice(0, 24);
    if (!x) continue;
    const prv = out[out.length - 1];
    let t = isNum(q.t) ? tkR6(clamp(q.t, 0, Math.max(0, len))) : prv ? prv.t : 0, ov = q.o === 1;
    if (prv && t < prv.t) { t = prv.t; ov = true; }                   // fallende Zeit: angehoben, ohne eigene Marke
    const o = {x, t};
    if (q.w === 1 || q.w === 2) o.w = q.w;
    if (!ov && q.j === 1 && prv && prv.t === t) { if (run >= 3) ov = true; else { o.j = 1; run++; } }
    else if (!ov) run = 1;
    if (ov) o.o = 1;
    if (isNum(q.p)) o.p = +clamp(q.p, 0, 1).toFixed(2);
    if (q.u === 1) o.u = 1;
    out.push(o);
  }
  if (!out.length) return null;
  return {v: 1, lang: v.lang === 'en' ? 'en' : 'de', src: G9_SRC.includes(v.src) ? v.src : 'getippt', s: out};
}
tkExt().take.push((m, o) => { const l = g9NormLy(m.ly, o.len / o.sr); if (l) o.ly = l; });
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
// Haken (je eine Zeile an der fremden Stelle, C.3 Z11)
const g9Mode = () => !!(WP.ed && WP.ed.g9);
function g9OnStop() { if (G9.ownStop || !g9Mode() || typeof g9End !== 'function') return; g9End('stop'); }
// tkHeardMap(id, a) (§6.7, nur lesend): welche Zeitkarte steckt im Puffer, der jetzt klingt? null = Quell-Zeiten (Roh-/Säubern-Take)
function tkHeardMap(id, a) {
  if (WP.ab) return null;
  const b = tkPlayBuf(id, a); if (!b) return null;
  for (const M of [WP.cache, WP.old, WP.alt]) { const c = M.get(id); if (c && c.buf === b) return c.map && !wpMapInfo(c.map).ident ? c.map : null; }
  return null;
}
// Beschriftung je Marke für wpPaint (wie VSM.assignLyrics: {labels, extra}); mit `ly` aus der Sicht (§5.1), sonst VS5b
function g9Labels(id, mk) { if (!g9Load()) return null; return g9LabelsOf(id, mk); }
const G9_API = {
  g9Syl: (w, lang) => (g9Load() ? g9Syl(w, lang) : null),
  g9Align: (syl, marks, feat, o) => (g9Load() ? g9AlignApi(syl, marks, feat, o) : null),
  g9Feat: r => (g9Load() ? deep(g9FeatOf(wpId(r))) : null),
  g9View: r => (g9Load() ? deep(g9ViewApi(wpId(r))) : null),
  g9Set: (r, op) => (g9Load() ? g9Set(wpId(r), op) : null),
  g9Ly: r => { const m = S.takes && S.takes[wpId(r)]; return m && m.ly ? deep(m.ly) : null; },
  g9NormLy: (v, len) => g9NormLy(v, len == null ? 1e9 : len),
  g9Text: (r, on) => { if (!WP.ed) { if (on === false) return false; wpOpen(typeof r === 'string' ? null : r || {t: stimmeT(), s: R.selS}); } if (!g9Load()) return false; return g9Toggle(on); },
  g9Sel: k => (g9Mode() ? g9Select(k, {api: true}) : false),
  g9Info: () => (G9.loaded ? g9InfoApi() : {loaded: false, sm: Object.assign({}, G9.sm), hold: G9.hold}),
  g9KbSim: h => { G9.kb = h == null ? null : +h; if (G9.loaded) g9Dock(); return G9.kb; },
  g9PlayLog: () => G9.play.map(x => Object.assign({}, x)),
  g9HapLog: () => G9.hap.map(x => Object.assign({}, x)),
  g9Net: () => G9.net.map(x => Object.assign({}, x)),
  g9Geom: () => (G9.loaded && g9Mode() ? g9GeomApi() : null),
  g9Recognize: (r, o) => (g9Load() && typeof g9RecRun === 'function' ? g9RecRun(wpId(r), o || {}) : Promise.resolve(null)),
};
