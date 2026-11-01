#!/usr/bin/env python3
# CHORSP – Bau: bau/snapshots/R-4300.html + Einhängepunkte (je genau 1 Treffer) + src/chs.css + src/chs.js → index.html
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
BASE = os.path.normpath(os.path.join(HERE, '../../snapshots/R-4300.html'))
s = open(BASE, encoding='utf-8').read()
css = open(os.path.join(HERE, 'src/chs.css'), encoding='utf-8').read()
js = open(os.path.join(HERE, 'src/chs.js'), encoding='utf-8').read()

def rep(a, b):
    global s
    c = s.count(a)
    if c != 1:
        sys.exit('Einhängepunkt %d× statt 1×: %r' % (c, a[:120]))
    s = s.replace(a, b)

# ---------- Blöcke ----------
rep("#wpSheet .g6pgc .g6pgso.on{color:var(--ink);background:var(--amber);border-radius:0 5px 5px 0}\n",
    "#wpSheet .g6pgc .g6pgso.on{color:var(--ink);background:var(--amber);border-radius:0 5px 5px 0}\n" + css)
rep("/* G6PH-END */\n", "/* G6PH-END */\n" + js)
rep("Object.assign(SYNQUENZER, G6PH_API);", "Object.assign(SYNQUENZER, G6PH_API);\nObject.assign(SYNQUENZER, CHS_API);                 // CHORSP: Background-Gruppe, Gesangs-Editor")

# ---------- 3. Auge der Legende ----------
rep("function g6pgLegend(E, host, before) { E.legHost = host; E.legBefore = before; g6pgLegSync(E); }",
    "function g6pgLegend(E, host, before) { E.legHost = host; E.legBefore = before; G6PG.hide = chsHideOf(E.r); g6pgLegSync(E); }   // CHS: Auge je Clip gemerkt")
rep("    if (lead) { q.fillStyle = 'rgba(150,158,172,.30)';",
    "    if (lead && !G6PG.hide.has(CHS_LEAD)) { q.fillStyle = 'rgba(150,158,172,.30)';")
rep("      if (n.dig && w > 12 && h >= 9) { q.fillStyle = col; q.fillText(n.dig, x0 + 2, y + 3.5, Math.max(8, w - 3)); }\n      q.globalAlpha = 1;\n      hit.push({k: n.k, x0, x1, y, h});",
    "      if (n.dig && w > 12 && h >= 9) { q.fillStyle = col; q.fillText(n.dig, x0 + 2, y + 3.5, Math.max(8, w - 3)); }\n      if (chsOnLead(E, n)) chsHalo(q, x0, y, w, h, col, strong && hl != null);   // CHS: Unisono lag unsichtbar unter dem Lead-Block\n      q.globalAlpha = 1;\n      hit.push({k: n.k, x0, x1, y, h});")
rep("function g6pgLeadNs(E) {\n  const id = E.id,",
    "function g6pgLeadNs(E) {\n  const xr = tkRef(E.r), id = xr ? xr.a.take : E.id;   // CHS: auch im Editor einer duplizierten/entkoppelten Stimme der Lead\n  const")
rep("  const st = L.map(l => l.id + l.c + l.dig + l.name + (G6PG.hide.has(l.id) ? 'h' : '') + (so === l.id ? 's' : '') + (E.voice === l.k ? 'e' : '')).join(',') + (arm ? '|a' + G6.arm.k + G6PG.leadQ : '');",
    "  const st = L.map(l => l.id + l.c + l.dig + l.name + (G6PG.hide.has(l.id) ? 'h' : '') + (so === l.id ? 's' : '') + (E.voice === l.k || E.chsTake === l.k ? 'e' : '')).join(',') + (arm ? '|a' + G6.arm.k + G6PG.leadQ : '') + (E.chsLead ? '|L' + G6PG.hide.has(CHS_LEAD) : '');")
rep("""  d.innerHTML = (arm ? `<button class="rb g6pglq${G6PG.leadQ ? ' on' : ''}" data-a="lq" aria-pressed="${G6PG.leadQ}" aria-label="Lead leise mithören">Lead leise</button>` : '') + L.map(l => `<span class="g6pgc${G6PG.hide.has(l.id) ? ' off' : ''}${E.voice === l.k ? ' cur' : ''}" style="--cc:var(--chor${l.c.slice(1).toLowerCase()})"><i class="g6pgsw">${esc(l.dig)}</i><b>${esc(l.name)}</b>` +
    `<button class="rb g6pgeye" data-a="eye" data-id="${esc(l.id)}" data-k="${l.k}" aria-pressed="${G6PG.hide.has(l.id) ? 'false' : 'true'}" aria-label="${esc(l.name)} zeigen">${G6PG_EYE}</button>` +
    `<button class="rb g6pgso${so === l.id ? ' on' : ''}" data-a="solo" data-id="${esc(l.id)}" data-k="${l.k}" aria-pressed="${so === l.id}" aria-label="${esc(l.name)} solo">S</button></span>`).join('');""",
"""  d.innerHTML = (arm ? `<button class="rb g6pglq${G6PG.leadQ ? ' on' : ''}" data-a="lq" aria-pressed="${G6PG.leadQ}" aria-label="Lead leise mithören">Lead leise</button>` : '') + chsLeadChip(E) + L.map(l => { const cur = E.voice === l.k || E.chsTake === l.k; return `<span class="g6pgc${G6PG.hide.has(l.id) && !cur ? ' off' : ''}${cur ? ' cur' : ''}" style="--cc:var(--chor${l.c.slice(1).toLowerCase()})"><i class="g6pgsw">${esc(l.dig)}</i><b>${esc(l.name)}</b>` +
    (cur ? `<button class="rb g6pgeye chscur" data-a="cur" disabled aria-label="${esc(l.name)} wird bearbeitet">${G6PG_EYE}</button>` : `<button class="rb g6pgeye" data-a="eye" data-id="${esc(l.id)}" data-k="${l.k}" aria-pressed="${G6PG.hide.has(l.id) ? 'false' : 'true'}" aria-label="${esc(l.name)} zeigen">${G6PG_EYE}</button>`) +
    `<button class="rb g6pgso${so === l.id ? ' on' : ''}" data-a="solo" data-id="${esc(l.id)}" data-k="${l.k}" aria-pressed="${so === l.id}" aria-label="${esc(l.name)} solo">S</button></span>`; }).join('');""")

# ---------- 2. Noten-Editor ----------
rep("  const SG = g6pgGeo(E.r, a), LN = Vc ? g6pgLeadNs(E) : null;",
    "  const SG = g6pgGeo(E.r, a), LN = Vc || id !== a.take ? g6pgLeadNs(E) : null; E.chsLead = !!LN; E.chsTake = chsTakeK(a, id);   // CHS: Lead grau auch hinter einer Gegenstimme (mit Auge)")
rep("  const rowH = (Hp - (E.leg ? 46 : 0)) / (hi - lo + 1), Y = p => Hp - (p - lo + 0.5) * rowH;",
    "  const rowH = (Hp - (E.leg ? 46 : 0) - CHS_RH) / (hi - lo + 1), Y = p => Hp - CHS_RH - (p - lo + 0.5) * rowH; /* CHS: unten das Lineal */")
rep("  g2Info(rd);\n  g6pgLegSync(E);\n}", "  g2Info(rd);\n  g6pgLegSync(E);\n  chsEdPaint(E);   // CHS: Lineal, Loop, Laufstrich\n}")
rep("  G2.ed = null; clearTimeout(E.rt); g6pgClosed();", "  G2.ed = null; clearTimeout(E.rt); g6pgClosed(); chsEdClosed(E);")
rep("    if (!p.mode && Math.hypot(dx, dy) > 8) p.mode = p.k >= 0 && Math.abs(dy) >= Math.abs(dx) ? 'move' : 'pan';",
    "    if (!p.mode && Math.hypot(dx, dy) > 8) p.mode = p.k >= 0 && Math.abs(dy) >= Math.abs(dx) && chsMayMove(E, p) ? 'move' : 'pan';   // CHS: nur eine gewählte (oder gehaltene) Note verschiebt sich")
rep("    if (p.mode === 'move' && gh) { if (gh.d) { if (E.voice != null) g6NoteShift(E.r, E.voice, gh.k, gh.d); else g2NoteShift(E.id, gh.k, gh.d); } else g2Paint(); return; }",
    "    if (p.mode === 'move' && gh) { if (gh.d) { if (E.voice != null) g6NoteShift(E.r, E.voice, gh.k, gh.d); else g2NoteShift(E.id, gh.k, gh.d); chsAudition(E, gh.k); } else g2Paint(); return; }")
rep("g6NoteShift(E.r, E.voice, E.sel, v === 'up' ? 1 : -1); return; }   // G6",
    "g6NoteShift(E.r, E.voice, E.sel, v === 'up' ? 1 : -1); chsAudition(E, E.sel); return; }   // G6")
rep("    if (v === 'up' || v === 'dn') g2NoteShift(E.id, E.sel, v === 'up' ? 1 : -1);",
    "    if (v === 'up' || v === 'dn') { g2NoteShift(E.id, E.sel, v === 'up' ? 1 : -1); chsAudition(E, E.sel); }")
# ---------- 2. Marken-Editor ----------
rep("  const sp = spb(), segL = a.out - a.in, W = E.zoom ? Math.min(E.zoom * 4 * sp, Math.max(segL, sp)) : Math.max(segL, .05);",
    "  const sp = spb(), segL = a.out - a.in, W = chsViewW(E, E.zoom ? Math.min(E.zoom * 4 * sp, Math.max(segL, sp)) : Math.max(segL, .05), segL);   // CHS: Zoom mit zwei Fingern")
rep("  if (E.g9 && typeof g9AfterPaint === 'function') g9AfterPaint(E, mk);   // G9: Silben-Leiste, Info-Zeile\n}",
    "  if (E.g9 && typeof g9AfterPaint === 'function') g9AfterPaint(E, mk);   // G9: Silben-Leiste, Info-Zeile\n  chsEdPaint(E);   // CHS\n}")
rep("  WP.ed = null; g6pgClosed();", "  WP.ed = null; g6pgClosed(); chsEdClosed(E);")

# ---------- 1. Daten und Klang ----------
rep("    if (l.mute === true) o.mute = true;\n    ids.add(l.id); lanes.push(o);",
    "    if (l.mute === true) o.mute = true;\n    chsNormLane(l, o);   // CHS: Pegel/Pan der Background-Spur\n    ids.add(l.id); lanes.push(o);")
rep("  const o = {lanes}; if (ch.mute === true) o.mute = true;\n  return lanes.length || o.mute ? o : null;",
    "  const o = {lanes}; if (ch.mute === true) o.mute = true;\n  chsNormGrp(ch, o);   // CHS: Background, Gesang gesamt, Kopplung\n  return lanes.length || o.mute ? o : null;")
rep("function trackFx(tr) { return g4Fx(tr, fxOfSound(tr.sound)); }",
    "function trackFx(tr) { return chsFx(tr, g4Fx(tr, fxOfSound(tr.sound))); }   // CHS: Gesang gesamt (STIMME, ohne Wert unverändert)")
rep("const g6pcLeadK = a => Math.pow(10, (g6pcCoupled(a) ? g6pcLeadDb(a) : a.chor.grp.ref) / 20);",
    "const g6pcLeadK = a => Math.pow(10, (g6pcCoupled(a) ? chsLeadDb(a) : a.chor.grp.ref) / 20);   // CHS: Kopplung der ganzen Gruppe")
rep("  if (gA != null) set(G.lvl.gain, gA * (g6pcChorOn() ? 1 : 0) * g6pcLeadK(a));",
    "  if (gA != null) set(G.lvl.gain, gA * (g6pcChorOn() ? 1 : 0) * g6pcLeadK(a) * chsBgK());   // CHS: Background-Regler")
rep("const g6pcVg = (v, vi) => Math.pow(10, (v.db || 0) / 20) * (g6pcLaneOn(v.lane) && g6pcSoloOn(v.lane, vi) ? 1 : 0) * g6pcGuideOf(v.lane);",
    "const g6pcVg = (v, vi) => Math.pow(10, (v.db || 0) / 20) * (g6pcLaneOn(v.lane) && g6pcSoloOn(v.lane, vi) ? 1 : 0) * g6pcGuideOf(v.lane) * chsLaneK(v.lane);   // CHS: Pegel der Spur")
rep("N.pan.connect(G.hp); N.pan.pan.value = g6pcPanOf(v, C); }", "N.pan.connect(G.hp); N.pan.pan.value = chsPanOf(v, C, meas); }")
rep("if (x.pan && C) g6pcSetP(x.pan.pan, g6pcPanOf(v, C), now); }", "if (x.pan && C) g6pcSetP(x.pan.pan, chsPanOf(v, C), now); }")
rep("  if (typeof g6pcApplyAll === 'function') g6pcApplyAll();          // G6+c: Spur stumm / Chor aus sofort hörbar\n}",
    "  if (typeof g6pcApplyAll === 'function') g6pcApplyAll();          // G6+c: Spur stumm / Chor aus sofort hörbar\n  chsApply();                                                      // CHS: Gesang gesamt / Background nach ↶\n}")

# ---------- 1a. Matrix ----------
rep("  MX.key = ''; mxApply(); mxLayout();\n}\n// [SZ] / [▲▼]", "  chsMxSync(true);   // CHS: Background-Zeilen unter der STIMME-Spur\n  MX.key = ''; mxApply(); mxLayout();\n}\n// [SZ] / [▲▼]")
rep("    const per = MX.pages[0].length, pg = []; for (let k = 0; k < synth.length; k += per) pg.push(synth.slice(k, k + per));",
    "    const per = MX.chsPer || MX.pages[0].length, pg = chsPages(synth, per);   // CHS: STIMME zählt mit ihren Background-Zeilen")
rep("  if (!MX.pages && synth.length + 1 > MX.lastFit) {\n    const per = Math.max(4, MX.lastFit - 1), pg = []; for (let k = 0; k < synth.length; k += per) pg.push(synth.slice(k, k + per));",
    "  if (!MX.pages && synth.length + chsMxExtra() + 1 > MX.lastFit) {\n    const per = Math.max(4, MX.lastFit - 1), pg = chsPages(synth, per); MX.chsPer = per;")
rep("  MX.nrows = MX.bankT && MX.pages ? MX.pages[0].length + 1 : nt;",
    "  MX.nrows = MX.bankT && MX.pages ? chsPageRows(MX.pages, MX.chsPer || MX.pages[0].length) + 1 : nt + chsMxExtra();")
rep("  const pad = MX.nrows - MX.rows.length;", "  chsMxApply(vt, vs);\n  const pad = MX.nrows - MX.rows.length - chsMxVisExtra(vt);")
rep("  const nt = NT(), key = nt + ':' + g.clientWidth + 'x' + g.clientHeight + ':' + trackOrder().join('');",
    "  const nt = NT() + chsMxExtra(), key = nt + ':' + g.clientWidth + 'x' + g.clientHeight + ':' + trackOrder().join('');")
rep("    const per = Math.max(4, Math.floor((H + gapY) / (minR + gapY)) - 1);\n    const pages = []; for (let k = 0; k < synth.length; k += per) pages.push(synth.slice(k, k + per));",
    "    const per = Math.max(4, Math.floor((H + gapY) / (minR + gapY)) - 1);\n    const pages = chsPages(synth, per); MX.chsPer = per;")
rep("function renderGrid(bAud) {\n", "function renderGrid(bAud) {\n  try { chsMxRender(); } catch (e) { logErr(e); }   // CHS\n")

# ---------- 1b. Song ----------
rep("  if (avail / (ord.length + 2) >= 26 - .5) { SV.rows = ord.slice(); SV.pages = null; }",
    "  if (avail / (ord.length + chsSvExtra() + 2) >= 26 - .5) { SV.rows = ord.slice(); SV.pages = null; }")
rep("  svBuildRows();\n  const nR = SV.rows.length + 2;", "  chsSvRows();   // CHS: Background-Zeilen nach der STIMME-Zeile\n  svBuildRows(); CHS.svLab = '';\n  const nR = SV.rows.length + 2;")
rep("    try { tkSvDraw(g, song, XB, ru, rh, W); } catch (e) { logErr(e); }   // VS3: Song-Stimme als gläserne Wellen",
    "    try { tkSvDraw(g, song, XB, ru, rh, W); } catch (e) { logErr(e); }   // VS3: Song-Stimme als gläserne Wellen\n    try { chsSvDraw(g, song, XB, ru, rh, W); } catch (e) { logErr(e); }   // CHS: Background-Zeilen")
rep("  if (row < svChordRow()) { const t = SV.rows[row]; if (t < 0 || bar > song.bars) return;",
    "  if (row < svChordRow()) { const t = SV.rows[row]; if (chsSvCode(t) != null) { chsSvTap(t, bar); return; } if (t < 0 || bar > song.bars) return;")
rep("  onTap(labs, d => { const t = +d.dataset.t;", "  onTap(labs, d => { if (chsSvLabTap(d)) return; const t = +d.dataset.t;")
rep("  on(EL.grid, 'contextmenu', e => e.preventDefault());",
    "  on(EL.grid, 'contextmenu', e => e.preventDefault());\n  on(EL.grid, 'click', e => { const b = e.target.closest && e.target.closest('[data-chs]'); if (b) { e.stopPropagation(); chsMxTap(b); } });   // CHS: Background-Zeilen")

open(os.path.join(HERE, 'index.html'), 'w', encoding='utf-8').write(s)
print('index.html', len(s), 'Zeichen')
