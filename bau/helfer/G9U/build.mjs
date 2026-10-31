// G9U Bau: Basis (.sicherung/stage-ges2-basis.html = bau/snapshots/stage-ges2.html) + src/* → index.html
// Jeder Eingriff in fremden Code ist ein genau einmal vorkommender Text-Ersatz (sonst Abbruch).
import fs from 'fs'; import path from 'path'; import {fileURLToPath} from 'url';
const D = path.dirname(fileURLToPath(import.meta.url)), ROOT = path.resolve(D, '../../..');
const base = path.join(ROOT, '.sicherung/stage-ges2-basis.html');
let h = fs.readFileSync(base, 'utf8');
const rd = f => fs.readFileSync(path.join(D, 'src', f), 'utf8');
function rep(from, to, n = 1) {
  const c = h.split(from).length - 1;
  if (c !== n) throw new Error(`Anker ${c}× statt ${n}×: ${from.slice(0, 90)}`);
  h = h.split(from).join(to);
}
// 1) CSS nach dem letzten #wpSheet-Block (Querformat-Treffer)
rep("@media (orientation:landscape){#wpSheet .qh .sh-x,#wpSheet .wpab,#wpSheet .wptx{position:relative}",
  rd('g9.css') + "@media (orientation:landscape){#wpSheet .qh .sh-x,#wpSheet .wpab,#wpSheet .wptx{position:relative}");
// 2) Block sq-g9-src (vor sq-mk-src): Platzhalter-Kern + Text-Modus
const blk = (rd('kern.js') + rd('g9.js') + rd('ui.js')).replace(/<\/script/gi, '<\\/script');
rep('<script type="text/plain" id="sq-mk-src">', '<script type="text/plain" id="sq-g9-src">\n' + blk + '\n</script>\n<script type="text/plain" id="sq-mk-src">');
// 3) Start-Pfad nach der WP-Test-API (vor G3)
rep('/* ======================= G3 — Vorlauf und Ausklang beim Einsingen', rd('start.js') + '\n/* ======================= G3 — Vorlauf und Ausklang beim Einsingen');
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
// 12) Hilfe (§7.11; der Satz zu [Erkennen] kommt mit der Erkennung, Zweig g9-br-E)
rep("    ...FX_HELP.map(t => 'FM-FELD: ' + t),", "    'TEXT (STIMME): Im Marken-Editor [Text] – auf die Wellenform tippen spielt den Abschnitt bis zur nächsten Marke; einfach losschreiben, Wörter mit mehreren Silben verteilen sich selbst; ein Wort antippen, Feld leeren und Leertaste löscht es, [+] fügt das getippte Wort ein. [Ganzer Text] verteilt einen eingefügten Songtext (Zeilen = Atempausen). Statt tippen geht auch die Diktier-Taste der Tastatur; für einen Tick je Taste in den Einstellungen das Tastatur-Feedback ‚Haptik‘ einschalten.',\n    ...FX_HELP.map(t => 'FM-FELD: ' + t),");
fs.writeFileSync(path.join(D, 'index.html'), h);
console.log('index.html', h.length, 'Bytes (+' + (h.length - fs.statSync(base).size) + ')');
