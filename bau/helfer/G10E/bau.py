#!/usr/bin/env python3
"""G10e bauen: bau/snapshots/R-4300.html + src/g10e.css + src/g10e.js + Haken -> index.html (wiederholbar).
Jeder Haken muss genau einmal passen, sonst bricht der Bau ab."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
BASE = os.path.join(ROOT, 'bau', 'snapshots', 'R-4300.html')
s = open(BASE, encoding='utf-8').read()
css = open(os.path.join(HERE, 'src', 'g10e.css'), encoding='utf-8').read()
js = open(os.path.join(HERE, 'src', 'g10e.js'), encoding='utf-8').read()

def rep(old, new, cnt=1):
    global s
    n = s.count(old)
    if n != cnt:
        sys.exit('Haken passt %d-mal (erwartet %d): %r' % (n, cnt, old[:120]))
    s = s.replace(old, new)

# CSS: hinter die letzte Marken-Editor-Regel (G9-Block)
a = "@media (orientation:landscape){#wpSheet .qh .sh-x,#wpSheet .wpab,#wpSheet .wptx{position:relative}"
i = s.index(a); j = s.index('\n', i) + 1
if s.count(a) != 1: sys.exit('CSS-Anker')
s = s[:j] + css + s[j:]

# Daten (additiv, Regel 28): Herkunft der Marke, Nur Wortanfänge, Q-Bereich
rep("    if (k.user) o.user = true;\n    out.push(o);",
    "    if (k.user) o.user = true;\n    if (k.src === 'pitch') o.src = 'pitch'; else if (k.src === 'on' || k.src === 'onset' || k.src === 'start') o.src = 'on';   // G10e: Herkunft (neue Erkennungen)\n    out.push(o);")
rep("  return {mode: w.mode === 'stretch' ? 'stretch' : 'slice', grid: WP_GRIDS.includes(w.grid)",
    "  return g10eNormFine({mode: w.mode === 'stretch' ? 'stretch' : 'slice', grid: WP_GRIDS.includes(w.grid)")
rep("t0: isNum(w.t0) ? tkR6(w.t0) : 0, map: {v: 1, src: s.map(tkR6), dst: d.map(tkR6)}};\n}",
    "t0: isNum(w.t0) ? tkR6(w.t0) : 0, map: {v: 1, src: s.map(tkR6), dst: d.map(tkR6)}}, w);   // G10e: wo/qr additiv\n}")
rep("  const w = VSM.makeWarp(times, Array.from(q.times, t => wpSmp(m, t)), m.len / m.sr);   // VS5a-fix2",
    "  const qt = g10eFine(times, Array.from(q.times), mk, o, q.grid, q.swing, bpm, t0);   // G10e: Q-Bereich, Nur Wortanfänge, Tonwechsel-Marken (ohne Felder: unverändert)\n  const w = VSM.makeWarp(times, qt.map(t => wpSmp(m, t)), m.len / m.sr);   // VS5a-fix2")
rep("    map: {v: 1, src: Array.from(w.src, tkR6), dst: Array.from(w.dst, tkR6)}};\n  return q.grid;",
    "    map: {v: 1, src: Array.from(w.src, tkR6), dst: Array.from(w.dst, tkR6)}};\n  if (o.wo) m.warp.wo = true; if (isNum(o.qr) && o.qr > 0) m.warp.qr = Math.round(o.qr);   // G10e\n  return q.grid;")
rep("mode: w.mode, swingAuto: false});\n",
    "mode: w.mode, swingAuto: false, wo: w.wo, qr: w.qr});\n")
rep("wpQuant(id, {grid: o.grid, strength: o.strength, swing: o.swing, mode: m.warp ? m.warp.mode : 'stretch', swingAuto: false});",
    "wpQuant(id, {grid: o.grid, strength: o.strength, swing: o.swing, mode: m.warp ? m.warp.mode : 'stretch', swingAuto: false, wo: m.warp && m.warp.wo, qr: m.warp && m.warp.qr});")
rep("  const g = wpQuant(id, Object.assign({mode: w ? w.mode : 'slice', strength: w ? w.strength : 1, swing: w ? w.swing : .5, t0: wpT0(id, a)}, o));",
    "  const g = wpQuant(id, Object.assign({mode: w ? w.mode : 'slice', strength: w ? w.strength : 1, swing: w ? w.swing : .5, t0: wpT0(id, a), wo: w ? w.wo : g10eDef(id, 'wo'), qr: w ? w.qr : g10eDef(id, 'qr')}, o));")

rep("  if (m.op === 'det') return M.detectMarks(m.x, m.sr).map(k => ({t: k.t, conf: k.conf, word: !!k.word}));",
    "  if (m.op === 'det') return M.detectMarks(m.x, m.sr).map(k => ({t: k.t, conf: k.conf, word: !!k.word, src: k.src}));   // G10e: Herkunft mitgeben")

rep("for (let k = 2; k <= quiet; k++) if (tf - k >= 0 && active[tf - k]) { word = false; break; }",
    "for (let k = 6; k <= quiet + 4; k++) if (tf - k >= 0 && active[tf - k]) { word = false; break; }   // G10e: Ruhe vor dem Einschwingen prüfen (vorher ab 10 ms: fast nie ein Wort-Strich)")

# Editor: Aufbau, Zoom-Taste, Schließen, Ansicht, Zeichnen, Gesten, Strich-Blatt
rep("  zb.addEventListener('click', () => { const E = WP.ed; if (!E) return; E.zoom = WP_ZOOM[(WP_ZOOM.indexOf(E.zoom) + 1) % WP_ZOOM.length]; wpPaint(); });",
    "  zb.addEventListener('click', () => { const E = WP.ed; if (!E) return; g10eZoomBtn(E); });   // G10e: + Stufe „Wort“, aus dem freien Zoom zur nächsten Stufe")
rep("  sh.classList.add('open');\n  wpGest(cv);",
    "  g10eBuild(WP.ed, sh, b, cvw, foot);                 // G10e: Mini-Karte, [+], [⋯], Haptik-Labels, Wischen/Tipp außerhalb\n  sh.classList.add('open');\n  wpGest(cv);")
rep("  EL.wpSheet.classList.remove('open'); EL.wpSheet.innerHTML = '';\n  if (WP.ab)",
    "  g10eClosed(E);                                     // G10e\n  EL.wpSheet.classList.remove('open'); EL.wpSheet.innerHTML = '';\n  if (WP.ab)")
rep("  const sp = spb(), segL = a.out - a.in, W = E.zoom ? Math.min(E.zoom * 4 * sp, Math.max(segL, sp)) : Math.max(segL, .05);",
    "  const sp = spb(), segL = a.out - a.in, W = g10eViewW(E, segL, sp) || (E.zoom ? Math.min(E.zoom * 4 * sp, Math.max(segL, sp)) : Math.max(segL, .05));   // G10e: stufenlos / „Wort“")
rep("function wpPaint() {\n  const E = WP.ed; if (!E || !E.cv) return;\n",
    "function wpPaint() {\n  const E = WP.ed; if (!E || !E.cv) return;\n  const g10t = G10E.perf ? performance.now() : 0;      // G10e: Bildzeit messen\n")
rep("  const wave = (b, inv, mk) => {\n",
    "  const wave = (b, inv, mk) => {\n    if (E.g10map && V.W * b.sampleRate / Wp < 24) { g.strokeStyle = g.fillStyle; g10eWaveDeep(g, b, inv, V, Wp, mid, hh); return; }   // G10e: tief gezoomt echte Form\n")
rep("  g6pgPaintWp(g, E, x, Wp, Hp, dpr);",
    "  if (E.g10map) g10ePaintUnder(E, g, g10eHeardBuf(E, a), live && !(wpReady(id) && WP.cache.get(id)) ? (t => VSM.warpInverse(w.map, t)) : null, V, Wp, Hp);   // G10e: Einsatz-Kurve\n  g6pgPaintWp(g, E, x, Wp, Hp, dpr);")
rep("  // VS5b Songtext: eine Silbe je Marke (von links)",
    "  if (E.g10map) g10ePaintOver(E, g, P, X, Wp, Hp, mk);   // G10e: Versatz, Einrasten, Abspielmarke\n  // VS5b Songtext: eine Silbe je Marke (von links)")
rep("  // Bedienung\n  const md = w ? w.mode : E.mode;",
    "  if (E.g10map) { g10eAfterPaint(E, a, mk, P); if (G10E.perf) G10E.frames.push(performance.now() - g10t); if (E.g10fast) return; }   // G10e\n  // Bedienung\n  const md = w ? w.mode : E.mode;")
rep("  E.zb.textContent = E.zoom ? E.zoom + (E.zoom === 1 ? ' Takt' : ' Takte') : 'Ganz';",
    "  g10eTxt(E.zb, E.g10map ? g10eZoomLbl(E) : E.zoom ? E.zoom + (E.zoom === 1 ? ' Takt' : ' Takte') : 'Ganz');   // G10e: Text ohne das Haptik-Label zu löschen")
rep("  E.ab.classList.toggle('on', WP.ab); E.ab.textContent = WP.ab ? 'Original' : 'A/B';",
    "  E.ab.classList.toggle('on', WP.ab); g10eTxt(E.ab, WP.ab ? 'Original' : 'A/B');")
rep("function wpGest(cv) {\n",
    "function wpGest(cv) {\n  if (typeof g10eGest === 'function') { g10eGest(cv); return; }   // G10e: Pinch, Doppeltipp, Halten, Lupe (ersetzt die K2-Gesten, K2-Regeln bleiben)\n")
rep("    p.innerHTML = `<h4>Marke ${k + 1}</h4><div class=\"savrow\"><button class=\"mbtn rb\" data-a=\"del\">✕ Löschen</button>",
    "    p.innerHTML = `<h4>Marke ${k + 1}${g10eSelInfo(k)}</h4><div class=\"savrow\"><button class=\"mbtn rb\" data-a=\"play\" aria-label=\"Hören\">▶</button><button class=\"mbtn rb\" data-a=\"del\">✕ Löschen</button>")
rep("    onTap(p, bt => { const a = bt.dataset.a, Q = WP.ed; closePop(); if (a === 'del' && Q && wpMarkDel(Q.id, k))",
    "    onTap(p, bt => { const a = bt.dataset.a, Q = WP.ed; if (a === 'play') { if (Q) g10ePlayMark(Q, k); return; } closePop(); if (a === 'del' && Q && wpMarkDel(Q.id, k))")
rep("  lyFrame(bAud);                                             // G9E: Mitlese-Zeile (Songtext)\n",
    "  lyFrame(bAud);                                             // G9E: Mitlese-Zeile (Songtext)\n  if (typeof g10eFrame === 'function') g10eFrame(bAud);      // G10e: Abspielmarke im Marken-Editor\n")

# JS-Block hinter die Test-API des Marken-Editors
a = "  wpCore: (fn, args) =>"
if s.count(a) != 1: sys.exit('JS-Anker')
i = s.index(a); j = s.index('\n};\n', i) + 4
s = s[:j] + '\n' + js + '\n' + s[j:]

open(os.path.join(HERE, 'index.html'), 'w', encoding='utf-8').write(s)
print('ok', len(s.splitlines()), 'Zeilen')
