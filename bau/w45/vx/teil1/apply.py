import sys
p = 'index.html'; s = open(p, encoding='utf-8').read()
def rep(old, new, cnt=1):
    global s
    n = s.count(old)
    if n != cnt: print('FEHLER', n, old[:90]); sys.exit(1)
    s = s.replace(old, new)
# A1 spk1Grid
rep("      if (r && r.ok !== false && +r.bpm > 0) return {bpm: +r.bpm, off: +(r.t1 != null ? r.t1 : r.off) || 0, ts: r.ts || pr.ts, from: 'imp1'};",
    "      if (r && r.ok !== false && +r.bpm > 0) { const G = {bpm: +r.bpm, off: +(r.t1 != null ? r.t1 : r.off) || 0, ts: r.ts || pr.ts, from: 'imp1'}; return typeof teil1GridTeile === 'function' ? teil1GridTeile(G, r, x, +src.sr) : G; }   /* TEIL1: Songteile aus demselben Lauf */")
# Kern-ops
rep("    I.uBegin(d, L ? 'Loop' : 'Loop entfernt'); t2.loops = L && L[1] > L[0] ? [{a: L[0], b: L[1]}] : []; I.uEnd(d); return info(d);\n  };\n",
    "    I.uBegin(d, L ? 'Loop' : 'Loop entfernt'); t2.loops = L && L[1] > L[0] ? [{a: L[0], b: L[1]}] : []; I.uEnd(d); return info(d);\n  };\n"
    "  Z2.ops.teileSet = (d, m, emit, info) => { const g = d.meta.grid || (d.meta.grid = {bpm: 120, off: 0, ts: '4/4', from: 'projekt'}); g.teile = (Array.isArray(m.teile) ? m.teile : []).slice(0, 64).map(p => ({name: String(p.name || 'Teil').slice(0, 24), t0: +(+p.t0 || 0).toFixed(3), t1: +(+p.t1 || 0).toFixed(3), grp: p.grp | 0})); d.metaDirty = true; return info(d); }; Z2.ops.teileDrop = (d, m, emit, info) => { if (d.meta.grid) delete d.meta.grid.teile; d.metaDirty = true; return info(d); };   /* TEIL1: Songteile im Dokument (Erkennung, kein ↶); teileDrop = Test-Haken */\n")
# B: Lineal
rep("function spk1RulerDraw(U) {\n  const cv = U.ru.firstChild, x = cv.getContext('2d'), d = U.dpr, W = cv.width / d, H = cv.height / d; x.setTransform(d, 0, 0, d, 0, 0);",
    "function spk1RulerDraw(U) {\n  const cv = U.ru.firstChild, x = cv.getContext('2d'), d = U.dpr, T1 = typeof teil1Ru === 'function' ? teil1Ru(U, x) : 0 /* TEIL1: Teil-Streifen oben */, W = cv.width / d, H = cv.height / d - T1; x.setTransform(d, 0, 0, d, 0, d * T1);")
# C: Tipp
rep("      else { U.cur = Math.max(0, Math.min(U.dur, spk1T(U, e.clientX - q.r.left))); if (SPK1.pl && !U.playSel) spk1PlayFrom(U, U.cur); spk1Dirty(U, 'ov'); spk1Dirty(U, 'r'); }",
    "      else if (typeof teil1RuTap === 'function' && teil1RuTap(U, e.clientX - q.r.left, e.clientY - q.r.top)) return;   /* TEIL1: Tipp auf einen Teil = Fokus */\n      else { U.cur = Math.max(0, Math.min(U.dur, spk1T(U, e.clientX - q.r.left))); if (SPK1.pl && !U.playSel) spk1PlayFrom(U, U.cur); spk1Dirty(U, 'ov'); spk1Dirty(U, 'r'); }")
# Sync-Haken
rep("  if (typeof spk3LpFromMeta === 'function') spk3LpFromMeta(U);   // SPK3: Loop aus dem Dokument\n",
    "  if (typeof spk3LpFromMeta === 'function') spk3LpFromMeta(U);   // SPK3: Loop aus dem Dokument\n  if (typeof teil1Sync === 'function') teil1Sync(U);   /* TEIL1: Lineal-Höhe, Teile, Hintergrund-Erkennung */\n")
rep("  U.sh.classList.remove('nodoc'); U.ttl.lastChild.textContent = r.meta.name;\n  spk1Size(U); spk1FitAll(U);",
    "  U.sh.classList.remove('nodoc'); U.ttl.lastChild.textContent = r.meta.name;\n  if (typeof teil1Sync === 'function') teil1Sync(U);   /* TEIL1: Lineal-Höhe vor dem Zuschnitt */\n  spk1Size(U); spk1FitAll(U);")
# D: Loop-Zeile
rep("    '<span class=\"spk2-lpt\">Loop ' + esc(spk2LpTxt(L)) + '</span>'",
    "    (typeof teil1LpTxt === 'function' && teil1LpTxt(U, L) ? '<span class=\"spk2-lpt\" aria-label=\"' + esc(teil1LpTxt(U, L)) + '\">' + esc(teil1LpTxt(U, L)) + '</span>' : '<span class=\"spk2-lpt\">Loop ' + esc(spk2LpTxt(L)) + '</span>') /* TEIL1: Teil-Name */")
# E: Matrix-Menü
rep("    dd.appendChild(el('h5', '', 'Loop ' + esc(spk2LpTxt(L)) + ' · ' + esc(spk2LName(U, lid))));\n",
    "    dd.appendChild(el('h5', '', 'Loop ' + esc(spk2LpTxt(L)) + ' · ' + esc(spk2LName(U, lid))));\n    if (typeof teil1MxRow === 'function') teil1MxRow(U, dd, b);   /* TEIL1: Als Szene · alle Ebenen */\n")
# E: spk11Parts Bereich
rep("  const sp = spk11Span(U);\n  if (sp) {", "  const sp = spk11Span(U) || (typeof teil1LpSpan === 'function' ? teil1LpSpan(U) : null);   /* TEIL1: aus dem Loop-Menü = Loop */\n  if (sp) {")
rep("  return {parts: out, g, nb, sel: !!sp, span: sp};", "  return {parts: out, g, nb, sel: !!spk11Span(U), span: sp, lp: !!sp && !spk11Span(U)};   /* TEIL1: sel nur bei echter Auswahl */")
rep("(P.X.sel ? ' · nur die Auswahl ' + f1(P.X.span[0]) + '–' + f1(P.X.span[1]) + ' s' : '');",
    "(P.X.sel ? ' · nur die Auswahl ' + f1(P.X.span[0]) + '–' + f1(P.X.span[1]) + ' s' : '') + (P.X.lp && spk2Lp(U) ? ' · nur Loop Takt ' + (spk2Lp(U)[0] + 1) + '–' + spk2Lp(U)[1] : '');   /* TEIL1 */")
# E: Szenen-Namen erst mit Clip
rep("    parts.forEach((p, j) => { const sc = S.scenes[scenes[j]]; if (sc) sc.name = p.name.slice(0, 24); });\n", "")
rep("    if (!out.audio && !out.midi) { toast('Nichts zum Anlegen – im Bereich still oder keine Spur frei'); return null; }",
    "    parts.forEach((p, j) => { const s = scenes[j], sc = S.scenes[s]; if (sc && S.tracks.some(t => t && t.clips[s])) sc.name = p.name.slice(0, 24); else (out.still = out.still || []).push(p.name); });   /* TEIL1: Name erst mit Clip, stille Teile ohne leere Szene */\n"
    "    if (!out.audio && !out.midi) { toast('Nichts zum Anlegen – im Bereich still oder keine Spur frei'); return null; }")
rep("  if (leer.length) ex.push('nichts in ' + leer.join(', '));\n  res.ex = ex;",
    "  if (leer.length) ex.push('nichts in ' + leer.join(', '));\n  if (res.still && res.still.length) ex.push(res.still.map(n => n + ': still – keine Szene').join(', '));   /* TEIL1 */\n  res.ex = ex;")
# A5 Namen
rep("rep = groups.map((G, g) => g).filter(g => groups[g].length >= 2);",
    "rep = groups.map((G, g) => g).filter(g => groups[g].length >= 2 && !(typeof teil1EdgeOnly === 'function' && teil1EdgeOnly(groups[g], runs, nBar)));   /* TEIL1: nur Rand + kurz = Intro/Outro */")
# A4 Import
rep("  c.parts = r.teile.map(p => ({name: p.name, ta: r.t1 + p.a * r.takt, grp: p.grp}));   // Teile",
    "  const sg = typeof spk11Seg === 'function' ? spk11Seg(r, c.x, c.sr) : null;   /* TEIL1: dieselben Teile wie die Spektral-Seite */\n  c.parts = sg ? sg.map(p => ({name: p.name, ta: p.t0, grp: p.grp})) : r.teile.map(p => ({name: p.name, ta: r.t1 + p.a * r.takt, grp: p.grp}));   // Teile")
# Block nach SPK11-END
blk = open('teil1-block.js', encoding='utf-8').read()
rep("try { window.__spk11 = SPK11_API; } catch (e) {}\n/* SPK11-END */\n", "try { window.__spk11 = SPK11_API; } catch (e) {}\n/* SPK11-END */\n" + blk)
open(p, 'w', encoding='utf-8').write(s); print('ok')
