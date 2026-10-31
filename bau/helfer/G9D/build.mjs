// G9D Bau: Basis (bau/snapshots/stage-ges2.html) + G9a-Kern/G9b-V (../G9S) + src/* → index.html (= Snapshot G9STAGE)
// Jeder Eingriff in fremden Code ist ein genau einmal vorkommender Text-Ersatz (sonst Abbruch).
import fs from 'fs'; import path from 'path'; import {fileURLToPath} from 'url';
const D = path.dirname(fileURLToPath(import.meta.url)), ROOT = path.resolve(D, '../../..');
const base = path.join(ROOT, 'bau/snapshots/stage-ges2.html');
let h = fs.readFileSync(base, 'utf8');
const rd = f => fs.readFileSync(path.join(D, 'src', f), 'utf8');
const rdS = f => fs.readFileSync(path.join(D, '../G9S', f), 'utf8').replace(/\nif \(typeof module !== 'undefined'[^\n]*\n?$/, '\n');
const KERN = rdS('g9-kern.js'), ERK = rdS('g9-erk.js');
if (/module\.exports/.test(KERN + ERK)) throw new Error('module.exports im Kern');
function rep(from, to, n = 1) {
  const c = h.split(from).length - 1;
  if (c !== n) throw new Error(`Anker ${c}× statt ${n}×: ${from.slice(0, 90)}`);
  h = h.split(from).join(to);
}
// 1) CSS nach dem letzten #wpSheet-Block (Querformat-Treffer)
rep("@media (orientation:landscape){#wpSheet .qh .sh-x,#wpSheet .wpab,#wpSheet .wptx{position:relative}",
  rd('g9.css') + "@media (orientation:landscape){#wpSheet .qh .sh-x,#wpSheet .wpab,#wpSheet .wptx{position:relative}");
// 2) Block sq-g9-src (vor sq-mk-src): Platzhalter-Kern + Text-Modus
const START = rd('start.js').replace('/*@G9KERN@*/', () => KERN);
const blk0 = ERK + rd('g9.js') + rd('ui.js') + rd('rec.js'); new Function(blk0); new Function(START.replace(/tkExt\(\)/g, '({take: []})'));   // Syntax-Prüfung: bricht den Bau ab
const blk = blk0.replace(/<\/script/gi, '<\\/script');
rep('<script type="text/plain" id="sq-mk-src">', '<script type="text/plain" id="sq-g9-src">\n' + blk + '\n</script>\n<script type="text/plain" id="sq-mk-src">');
// 3) Start-Pfad nach der WP-Test-API (vor G3)
rep('/* ======================= G3 — Vorlauf und Ausklang beim Einsingen', START + '\n/* ======================= G3 — Vorlauf und Ausklang beim Einsingen');
rep('Object.assign(SYNQUENZER, WP_API);                // VS5a/b: Marken & Scheiben, Dehnen, Songtext',
  'Object.assign(SYNQUENZER, WP_API);                // VS5a/b: Marken & Scheiben, Dehnen, Songtext\nObject.assign(SYNQUENZER, G9_API);                // G9: Songtext-Bedienung (Text-Modus)');
// 4) Undo-Art 'ly' (§5.6)
rep("  if (e.kind === 'takes') return S.takes ? JSON.stringify(S.takes) : null;                     // VS3",
  "  if (e.kind === 'ly') return g9LySnap(e.id);                                                   // G9: nur Text eines Takes\n  if (e.kind === 'takes') return S.takes ? JSON.stringify(S.takes) : null;                     // VS3");
rep("  else if (e.kind === 'takes') { if (val) S.takes = JSON.parse(val);",
  "  else if (e.kind === 'ly') g9LyPut(e.id, val);                  // G9\n  else if (e.kind === 'takes') { if (val) S.takes = JSON.parse(val);");
// 5) Marken-Editor: [Text] öffnet den Text-Modus (§7.1); Take mit ly → Block laden (A.13); G2 schließt sich aus
rep("  tx.addEventListener('click', () => wpLyrPop(tx));",
  "  tx.addEventListener('click', () => { if (g9Load()) g9Toggle(); else wpLyrPop(tx); });   // G9: [Text] = Text-Modus (Pop nur noch als Rückfall)\n  if (S.takes[id] && S.takes[id].ly) g9Load();");
rep("  closePop(); if (WP.ed) wpClose();\n  const id = x.a.take, segBars = (x.a.out - x.a.in) / spb() / 4;\n  const w0",
  "  closePop(); if (WP.ed) wpClose(); if (typeof G2 !== 'undefined' && G2.ed) g2Close();   // G9: Noten-Editor und Text-/Marken-Editor schließen sich aus\n  const id = x.a.take, segBars = (x.a.out - x.a.in) / spb() / 4;\n  const w0");
// 6) wpPaint: Rahmen des gewählten Abschnitts; Beschriftung aus `ly` (Sicht), sonst VS5b; Leiste + Info danach
rep("  const LY = m && m.lyrics ? VSM.assignLyrics(m.lyrics, mk.length) : null;",
  "  if (E.g9 && typeof g9PaintWave === 'function') g9PaintWave(E, g, P, X, Wp, Hp, mk);   // G9: gewählter Abschnitt\n  const LY = m && m.ly ? g9Labels(id, mk) : m && m.lyrics ? VSM.assignLyrics(m.lyrics, mk.length) : null;   // G9: mit ly aus der Sicht (§5.1)");
rep("  E.info.classList.toggle('warn', !!wn);\n}",
  "  E.info.classList.toggle('warn', !!wn);\n  if (E.g9 && typeof g9AfterPaint === 'function') g9AfterPaint(E, mk);   // G9: Silben-Leiste, Info-Zeile\n}");
rep("  E.tx.classList.toggle('on', !!(m && m.lyrics));", "  E.tx.classList.toggle('on', !!(E.g9 || (m && (m.lyrics || m.ly))));");
// 7) wpGest: im Text-Modus setzt ein Tipp keine Marke (Gesten am Rahmen, §7.3/§7.9)
rep("    const E = WP.ed; if (!E || E.p || e.button > 0) return;\n    try { cv.setPointerCapture(e.pointerId); } catch (er) {}\n    E.p = {id: e.pointerId, x0: e.clientX, y0: e.clientY, t0: performance.now(), k: wpHit(E, xOf(e)), mode: null, va: E.va};",
  "    const E = WP.ed; if (!E || E.p || E.g9 || e.button > 0) return;   // G9: Text-Modus = eigene Gesten am Rahmen\n    try { cv.setPointerCapture(e.pointerId); } catch (er) {}\n    E.p = {id: e.pointerId, x0: e.clientX, y0: e.clientY, t0: performance.now(), k: wpHit(E, xOf(e)), mode: null, va: E.va};");
// 8) wpClose: Text-Modus/Dock weg, Vorspielen endet (G9-39)
rep("  const E = WP.ed; if (!E) return;\n  WP.ed = null;\n  if (UI.pop && (UI.pop.name === 'wpsel' || UI.pop.name === 'wplyr')) closePop();",
  "  const E = WP.ed; if (!E) return;\n  if (E.g9 && typeof g9Off === 'function') g9Off(E);              // G9\n  WP.ed = null;\n  if (UI.pop && (UI.pop.name === 'wpsel' || UI.pop.name === 'wplyr' || UI.pop.name === 'g9text' || UI.pop.name === 'g9rec')) closePop();");
// 9) Fassungs-Cache merkt sich seine Karte (für tkHeardMap, §6.7); Klang unverändert
rep("      WP.alt.set(id, {key, buf: ab, warn, mode: w.mode}); WP.altRenders", "      WP.alt.set(id, {key, buf: ab, warn, mode: w.mode, map: w.map}); WP.altRenders");
rep("    WP.cache.set(id, {key, buf: ab, warn, mode: w.mode});", "    WP.cache.set(id, {key, buf: ab, warn, mode: w.mode, map: w.map});");
// 10) ■ und Szenenwechsel beenden den Text-Modus (G9-39); das eigene Anhalten beim Vorspielen (F3) nicht
rep("function stop() {\n  const c = AU.ctx;", "function stop() {\n  const c = AU.ctx;\n  if (typeof g9OnStop === 'function') g9OnStop();             // G9-39");
rep("function launchScene(s) {\n  ensureAudio(); if (!AU.ctx) return;", "function launchScene(s) {\n  ensureAudio(); if (!AU.ctx) return;\n  if (typeof g9OnStop === 'function') g9OnStop();             // G9-39");
// 11) Geräteprofil: G9-Teil (§5.4, Lader g9ProfNorm-Muster)
rep("    if (o.vs && typeof o.vs === 'object') out.vs = {src: o.vs.src === 'inst' ? 'inst' : 'voice', lock: !!o.vs.lock, snap: o.vs.snap !== false, grid: String(o.vs.grid || '1/16')};   // VS2",
  "    if (o.vs && typeof o.vs === 'object') out.vs = {src: o.vs.src === 'inst' ? 'inst' : 'voice', lock: !!o.vs.lock, snap: o.vs.snap !== false, grid: String(o.vs.grid || '1/16')};   // VS2\n    if (o.g9 && typeof o.g9 === 'object') out.g9 = {auto: o.g9.auto !== false, lang: ['auto', 'de', 'en'].includes(o.g9.lang) ? o.g9.lang : 'auto'};   // G9 (§5.4)");
// 12a) G3-Bereich im Text-Modus (§7.2): Anlauf/Ausklang heller als „außerhalb“ und erreichbar; Ansicht beginnt bei a.in − Anlauf
rep("  E.va = clamp(E.va, a.in - W * .1, Math.max(a.in - W * .1, a.out - W * .9));",
  "  const g3a = E.g9 && typeof g3PreOf === 'function' ? g3PreOf(a) : 0, g3b = E.g9 && typeof g3PostOf === 'function' ? g3PostOf(a) : 0;   // G9: G3-Anlauf/Ausklang erreichbar\n  E.va = clamp(E.va, a.in - Math.max(W * .1, g3a), Math.max(a.in - Math.max(W * .1, g3a), a.out + g3b - W * .9));");
rep("  g.fillStyle = 'rgba(0,0,0,.55)'; const xi = X(a.in), xo = X(a.out); if (xi > 0) g.fillRect(0, 0, xi, Hp); if (xo < Wp) g.fillRect(xo, 0, Wp - xo, Hp);",
  "  g.fillStyle = 'rgba(0,0,0,.55)'; const xi = X(a.in), xo = X(a.out); if (xi > 0) g.fillRect(0, 0, xi, Hp); if (xo < Wp) g.fillRect(xo, 0, Wp - xo, Hp);\n  if (E.g9 && typeof g9PaintG3 === 'function') g9PaintG3(E, g, a, X, Wp, Hp);   // G9: hörbarer Anlauf/Ausklang heller");
// 12) Hilfe (§7.11; der Satz zu [Erkennen] kommt mit der Erkennung, Zweig g9-br-E)
rep("    ...FX_HELP.map(t => 'FM-FELD: ' + t),", "    'TEXT (STIMME): Im Marken-Editor [Text] – auf die Wellenform tippen spielt den Abschnitt bis zur nächsten Marke; einfach losschreiben, Wörter mit mehreren Silben verteilen sich selbst; ein Wort antippen, Feld leeren und Leertaste löscht es, [+] fügt das getippte Wort ein. [Ganzer Text] verteilt einen eingefügten Songtext (Zeilen = Atempausen). Statt tippen geht auch die Diktier-Taste der Tastatur; für einen Tick je Taste in den Einstellungen das Tastatur-Feedback ‚Haptik‘ einschalten.',\n    ...FX_HELP.map(t => 'FM-FELD: ' + t),");
// 13) G9d: VS5a-Worker kennt den Kern (Ops g9f/g9a/g9s, §8); Muster-Vorabgabe (id −1) ohne Antwort
rep("wpRun.toString() + '\\nconst M = vsMarksMake();M.X = vsStretchMake();onmessage = e => { const m = e.data; try { const r = wpRun(M, m);",
  "wpRun.toString() + '\\n' + g9Make.toString() + '\\n' + g9Run.toString() + '\\nconst K9 = g9Make();const M = vsMarksMake();M.X = vsStretchMake();onmessage = e => { const m = e.data; if (m.id === -1) { try { g9Run(K9, m); } catch (er) {} return; } try { const r = m.op === \"g9f\" || m.op === \"g9a\" || m.op === \"g9s\" ? g9Run(K9, m) : wpRun(M, m);");
// 14) Marken-Haken in wpEdit (§6.5, im selben 'takes'-Undo)
rep("  m.marks.sort((x, y) => x.t - y.t);\n  if (w) wpRequant(id, w);",
  "  m.marks.sort((x, y) => x.t - y.t);\n  if (m.ly && typeof g9MarkHook === 'function') g9MarkHook(id, mk, m.marks);   // G9: Silben folgen ihrer Marke\n  if (w) wpRequant(id, w);");
// 15) wpSetLyrics mit vorhandenem ly schreibt beides (§8)
rep("  const v = wpNormLyr(text), before = JSON.stringify(S.takes);\n  if (v) m.lyrics = v; else delete m.lyrics;",
  "  const v = wpNormLyr(text), before = JSON.stringify(S.takes);\n  if (!(typeof g9SetLyricsHook === 'function' && g9SetLyricsHook(m, v))) { if (v) m.lyrics = v; else delete m.lyrics; }   // G9");
// 16) wpUndone: automatisches Erkennungsergebnis wieder einsetzen (§7.8)
rep("function wpUndone() {\n", "function wpUndone() {\n  if (typeof g9TakesUndone === 'function') g9TakesUndone();   // G9 (§7.8)\n");
// 17) Aufnahme hat Vorrang (§6.6.10): jeder Mikrofon-Start
rep("function micTapGet(user, lazy) {\n  if (!micAvail()) return Promise.resolve(false);", "function micTapGet(user, lazy) {\n  if (!micAvail()) return Promise.resolve(false);\n  if (typeof g9MicOn === 'function') g9MicOn();   // G9: Aufnahme hat Vorrang");
rep("function micStart(opts) {\n  if (MIC.run || !micAvail()) return false;", "function micStart(opts) {\n  if (MIC.run || !micAvail()) return false;\n  if (typeof g9MicOn === 'function') g9MicOn();   // G9: Aufnahme hat Vorrang");
rep("function stStart(opts) {\n  if (ST.on || ST.run || !micAvail()) return false;", "function stStart(opts) {\n  if (ST.on || ST.run || !micAvail()) return false;\n  if (typeof g9MicOn === 'function') g9MicOn();   // G9: Aufnahme hat Vorrang");
// 18) neue Aufnahme mit Mikrofon → automatisch erkennen (F1), sobald ein Sprachmodell angedockt ist
rep("    TK.last = {id, n, sr, got, pre: pre / sr, late: late / sr, src};", "    TK.last = {id, n, sr, got, pre: pre / sr, late: late / sr, src};\n    if (G9.loaded && typeof g9AutoQueue === 'function') g9AutoQueue(id);   // G9 (F1)");
rep("      TK.last = {id, n, sr, got: n, pre: (Fa - F0) / sr, late: 0, src: 'song', stream: true, lost: s.lost};", "      TK.last = {id, n, sr, got: n, pre: (Fa - F0) / sr, late: 0, src: 'song', stream: true, lost: s.lost};\n      if (G9.loaded && typeof g9AutoQueue === 'function') g9AutoQueue(id);   // G9 (F1)");
// 19) Projektwechsel: G9-Aufträge und automatische Ergebnisse des alten Projekts verwerfen
rep("function applyProject(p, opts) {\n  opts = opts || {};", "function applyProject(p, opts) {\n  opts = opts || {};\n  if (G9.loaded && typeof g9ProjReset === 'function') g9ProjReset(); else G9.auto.clear();   // G9");
fs.writeFileSync(path.join(D, 'index.html'), h);
fs.writeFileSync(path.join(ROOT, 'bau/snapshots/G9STAGE.html'), h);
console.log('index.html', h.length, 'Bytes (+' + (h.length - fs.statSync(base).size) + ')');
