import sys
p='spk12-block.js'; s=open(p,encoding='utf-8').read()
def rep(a,b,cnt=1):
    global s
    n=s.count(a)
    if n!=cnt: sys.exit('Anzahl %d statt %d: %r'%(n,cnt,a[:90]))
    s=s.replace(a,b)
K2 = " || s.art === 'ell' || s.art === 'lasso' || s.art === 'trans' || s.art === 'fol' || (s.art === 'harm' && s.hm)"
rep("if (!all.some(s => s.op === 'sub' || s.op === 'and' || s.art === 'wand' || s.art === 'inv')) return null;",
    "if (!all.some(s => s.op === 'sub' || s.op === 'and' || s.art === 'wand' || s.art === 'inv'"+K2+")) return null;")
rep("    if (s.art === 'wand') { flush(); const R = spk12Ras(d, s); items.push({op, val: R.val, box: R.box}); continue; }\n",
    "    if (s.art === 'wand') { flush(); const R = spk12Ras(d, s); items.push({op, val: R.val, box: R.box}); continue; }\n    if (s.art === 'ell' || s.art === 'lasso' || s.art === 'trans' || s.art === 'fol' || (s.art === 'harm' && s.hm)) { flush(); const R = spk12K2(d, s, base); items.push({op, val: R.val, box: R.box}); continue; }   // Teil 2\n")
rep("const spk12Has = U => U.sel.some(s => s.op === 'sub' || s.op === 'and' || s.art === 'wand' || s.art === 'inv');",
    "const spk12Has = U => U.sel.some(s => s.op === 'sub' || s.op === 'and' || s.art === 'wand' || s.art === 'inv'"+K2+");")
rep("const SPK12_TOOLS = ['rect', 'zeit', 'freq', 'pinsel', 'harm', 'wand'], SPK12_HT = ['rect', 'zeit', 'freq', 'harm', 'wand'];",
    "const SPK12_TOOLS = ['rect', 'zeit', 'freq', 'pinsel', 'harm', 'wand', 'ell', 'lasso', 'trans'], SPK12_HT = ['rect', 'zeit', 'freq', 'harm', 'wand', 'ell', 'lasso'];\nconst SPK12_SLOTS = {rect: ['rect', 'ell', 'lasso', 'wand'], zeit: ['zeit', 'trans']};   // Halten auf Rechteck bzw. Zeit → Liste")
kern=open('t2-kern.js',encoding='utf-8').read().rstrip('\n')+'\n'
rep("/* Ops im Kern: Zauberstab, Masken-Probe (Test), Anzeige-Raster der Auswahl */", kern+"/* Ops im Kern: Zauberstab, Masken-Probe (Test), Anzeige-Raster der Auswahl · Teil 2: Transient, Obertöne-Auto, folgt dem Ton */")
ops=open('t2-ops.js',encoding='utf-8').read().rstrip('\n')+'\n'
rep("  ops.spk12mask = (d, m) => {", ops+"  ops.spk12mask = (d, m) => {")
rep("  if (!G.s12cand) return G.tool === 'wand';   // Zauberstab: Ziehen zeichnet nichts", "  if (!G.s12cand) return spk12Move2(U, G, p);   // Zauberstab / Ellipse / Lasso / Transient")
rep("const spk12HOn = U => U.sel.length > 0 && SPK12_HT.includes(U.tool) && !U.busy && !U.ex && !U.sel.some(s => s.art === 'inv' && !s.nurF);",
    "const spk12HOn = U => U.sel.length > 0 && SPK12_HT.includes(U.tool) && !U.busy && !U.ex && !U.sel.some(s => (s.art === 'inv' && !s.nurF) || s.art === 'trans' || s.art === 'fol');")
rep("  G.single = U.sel.length === 1 && ['rect', 'zeit', 'freq'].includes(U.sel[0].art);", "  G.single = U.sel.length === 1 && ['rect', 'zeit', 'freq', 'ell'].includes(U.sel[0].art);")
rep("  } else if (o.art === 'inv') { if (o.nurF) { o.t0 = +(o.t0 + dt - gt).toFixed(4); o.t1 = +(o.t1 + dt + gt).toFixed(4); } }\n",
    "  } else if (o.art === 'inv') { if (o.nurF) { o.t0 = +(o.t0 + dt - gt).toFixed(4); o.t1 = +(o.t1 + dt + gt).toFixed(4); } }\n"
    "  else if (o.art === 'trans' || o.art === 'fol') return o;\n"
    "  else if (o.art === 'lasso') {   // Punkte verschieben; wachsen = vom Schwerpunkt weg (Zeit ± gt, Tonhöhe ± gc)\n"
    "    let tc = 0, cc = 0; for (const p of o.pts) { tc += p[0]; cc += Math.log2(Math.max(1, p[1])); } tc /= o.pts.length; cc /= o.pts.length;\n"
    "    o.pts = o.pts.map(p => { const c = Math.log2(Math.max(1, p[1])); return [+(p[0] + dt + Math.sign(p[0] - tc) * gt).toFixed(4), +(Math.pow(2, c + Math.sign(c - cc) * gc / 1200) * q).toFixed(2)]; });\n"
    "    const L = spk12LassoSh(o.pts, 0); o.t0 = L.t0; o.t1 = L.t1; o.f0 = L.f0; o.f1 = L.f1;\n"
    "    if (ws) { const k = spk12Cl((+o.kt || 0) / 0.12 + ws, 0, 3); o.kt = +(k * 0.12).toFixed(3); o.kf = Math.round(k * 120); }\n"
    "  }\n")
# Zustand: slot je Gruppe
rep("S = U.s12 = {doc: SPK1.doc, mode: o.mode || 'neu', slot: o.slot || 'rect',", "S = U.s12 = {doc: SPK1.doc, mode: o.mode || 'neu', slot: o.slot && typeof o.slot === 'object' ? o.slot : {rect: 'rect', zeit: 'zeit'}, hm: o.hm || null, hAuto: !!o.hAuto,")
rep("  const S = spk12S(U); if (S.inSelf) return;\n  const prev = S.prev || []", "  const S = spk12S(U); if (S.inSelf) return; spk12HmNew(U);\n  const prev = S.prev || []")
# Zeichnen
rep("""function spk12OvPre(U) {
  const S = spk12S(U); if (S.ovSel) { U.sel = S.ovSel; S.ovSel = null; }
  if (!U.sel.length || !spk12Has(U)) return {sel: null};
  const sel = U.sel; S.ovSel = sel; U.sel = []; return {sel};""", """function spk12OvPre(U) {
  const S = spk12S(U); if (S.ovSel) { U.sel = S.ovSel; S.ovSel = null; }
  const tmp = spk12TmpPre(U);   // Ellipse/Lasso beim Ziehen zeichnet Teil 2 selbst
  if (!U.sel.length || !spk12Has(U)) return {sel: null, tmp};
  const sel = U.sel; S.ovSel = sel; U.sel = []; return {sel, tmp};""")
rep("""  if (s12.sel) { U.sel = s12.sel; S.ovSel = null; spk12VwDraw(U, x); }
  spk12HdDraw(U, x);""", """  if (s12.sel) { U.sel = s12.sel; S.ovSel = null; spk12VwDraw(U, x); }
  if (s12.tmp) spk12TmpDraw(U, x, s12.tmp);
  spk12HitDraw(U, x); spk12HdDraw(U, x);""")
# Leiste / Slots
rep("const pC = U.s12pane = pane('rect zeit freq pinsel harm wand');", "const pC = U.s12pane = pane('rect zeit freq pinsel harm wand ell lasso trans');")
old_pane_tail = s[s.index("  const b = U.tl.querySelector('button[data-tool=\"rect\"]'); if (!b) return; b.dataset.s12slot = '1';"):s.index("  U.mn.addEventListener('pointercancel'")]
new_pane_tail = """  U.opt.s12ts = 5; U.opt.s12hg = 3; U.opt.s12tl = 120;
  for (const p of U.op.querySelectorAll('.spk1-o')) if (p.dataset.for === 'rect zeit freq') p.dataset.for += ' ell lasso';   // Kante auch für Ellipse/Lasso
  const pT = pane('trans'); sl(pT, 'Empfindl.', 's12ts', 1, 10, 1, v => String(v), () => spk12ReTr(U)); sl(pT, 'Höhen', 's12hg', 0, SPK12_HG.length - 1, 1, v => 'ab ' + SPK12_HG[v] + ' Hz', () => spk12ReTr(U)); sl(pT, 'Länge', 's12tl', 40, 300, 20, v => v + ' ms', () => spk12ReTr(U));
  const pH = pane('harm'), bH = el('button', 'n1b spk12-dd', 'Obertöne ▾'); bH.dataset.a = 's12hd'; bH.setAttribute('aria-label', 'Obertöne einzeln anhaken, Auto, nur ungerade'); pH.appendChild(bH); U.b12h = bH;
  for (const g of Object.keys(SPK12_SLOTS)) {
    const b = U.tl.querySelector('button[data-tool="' + g + '"]'); if (!b) continue; b.dataset.s12slot = g;
    let lp = null, x0 = 0, y0 = 0; const stop = () => { if (lp) { clearTimeout(lp); lp = null; } };
    b.addEventListener('pointerdown', e => { stop(); x0 = e.clientX; y0 = e.clientY; lp = setTimeout(() => { lp = null; spk12S(U).hold = performance.now(); spk12SlotDd(U, b); }, 480); });
    b.addEventListener('pointermove', e => { if (lp && Math.hypot(e.clientX - x0, e.clientY - y0) > 10) stop(); });
    b.addEventListener('pointerup', stop); b.addEventListener('pointercancel', stop);
    b.addEventListener('contextmenu', e => e.preventDefault());
  }
"""
s = s.replace(old_pane_tail, new_pane_tail)
i0 = s.index("function spk12Slot(U, k) {"); i1 = s.index("function spk12ModeBtns(U)")
s = s[:i0] + """function spk12Slot(U, k) {
  const g = spk12Grp(k), b = g && U.tl.querySelector('button[data-s12slot="' + g + '"]'); if (!b) return;
  b.dataset.tool = k; b.innerHTML = spk12Ic(k) + '<span>' + SPK12_ALT[k] + '</span>'; b.setAttribute('aria-label', 'Werkzeug ' + SPK12_ALT[k] + ' (halten = Liste)');
  spk12S(U).slot[g] = k;
}
function spk12SlotDd(U, b) {
  const g = b.dataset.s12slot;
  spk1Dd(U, b, dd => {
    dd.appendChild(el('h5', '', 'Werkzeug'));
    const r = el('div', 'spk1-g');
    for (const k of SPK12_SLOTS[g] || []) {
      const x = el('button', 'mbtn rb spk1-ck' + (U.tool === k ? ' on' : ''), spk12Ic(k) + '&nbsp;' + SPK12_ALT[k]); x.dataset.s12t = k;
      on(x, 'click', () => { spk1Dd(U, null); spk12Slot(U, k); spk1ToolSet(U, k); }); r.appendChild(x);
    }
    dd.appendChild(r); dd.appendChild(el('p', '', g === 'zeit' ? 'Transient: Schlag antippen oder über mehrere Schläge ziehen (Empfindlichkeit, ab … Hz).' : 'Ellipse und Lasso: ziehen bzw. umfahren. Zauberstab: antippen wählt die zusammenhängende helle Fläche.'));
  });
}
""" + s[i1:]
rep("  else if (a === 's12dd') spk12Dd(U, b);", "  else if (a === 's12dd') spk12Dd(U, b);\n  else if (a === 's12hd') spk12HDd(U, b);")
rep("    g('Auswahl', [['inv', 'Umkehren'], ['invf', 'Nur Frequenzen umkehren', !has || !spk12Box(U)], ['rest', 'Wiederherstellen', !S.last]]);",
    "    const fol = U.sel.length === 1 && U.sel[0].art === 'fol';\n    g('Auswahl', [['inv', 'Umkehren'], ['invf', 'Nur Frequenzen umkehren', !has || !spk12Box(U)], ['rest', 'Wiederherstellen', !S.last], ['fol', fol ? 'Folgt nicht mehr' : 'Folgt dem Ton', !has || (!fol && !spk12Box(U))]]);")
rep("    g('Werkzeug', [[U.tool === 'wand' ? 'rect' : 'wand', U.tool === 'wand' ? 'Rechteck' : 'Zauberstab']]);",
    "    g('Werkzeug', ['rect', 'ell', 'lasso', 'wand', 'trans'].filter(k => k !== U.tool).map(k => [k, SPK12_ALT[k]]));")
rep("  if (a === 'wand' || a === 'rect') { spk12Slot(U, a); spk1ToolSet(U, a); return true; }",
    "  if (['rect', 'ell', 'lasso', 'wand', 'zeit', 'trans'].includes(a)) { spk12Slot(U, a); spk1ToolSet(U, a); return true; }\n  if (a === 'fol') { spk12Follow(U); return true; }")
rep("""  if ((k === 'rect' || k === 'wand') && S.slot !== k) { spk12Slot(U, k); const b = U.tl.querySelector('button[data-s12slot]'); if (b) { b.classList.add('on'); b.setAttribute('aria-pressed', 'true'); } }
  if (k === 'wand' && U.meta && !U.sel.length) spk1Stat(U, 'Antippen = Zauberstab (zusammenhängende helle Fläche) · zwei Finger = Zoom');""",
"""  const g = spk12Grp(k); if (g && S.slot[g] !== k) { spk12Slot(U, k); const b = U.tl.querySelector('button[data-s12slot="' + g + '"]'); if (b) { b.classList.add('on'); b.setAttribute('aria-pressed', 'true'); } }
  const tip = {wand: 'Antippen = Zauberstab (zusammenhängende helle Fläche)', ell: 'Ziehen = Ellipse', lasso: 'Umfahren = Lasso', trans: 'Schlag antippen oder über Schläge ziehen = Transient'}[k];
  if (tip && U.meta && !U.sel.length) spk1Stat(U, tip + ' · zwei Finger = Zoom');""")
# CSS für Häkchen-Knöpfe
rep(".spk1-op .spk12-dd{margin-left:6px}'", ".spk1-op .spk12-dd{margin-left:6px}.spk1-dd .mbtn.spk12-hn{min-width:44px;padding:6px 4px;justify-content:center;text-align:center}'")
# Teil-2-Hauptfaden vor dem Guide
ui=open('t2-ui.js',encoding='utf-8').read().rstrip('\n')+'\n'
rep("/* ---------- „Wo finde ich …?“ ---------- */", ui+"/* ---------- „Wo finde ich …?“ ---------- */")
rep("L.push({id: 'spk12', n: 'Auswahl kombinieren, umkehren, Zauberstab', w: 'Spektral › Leiste unter den Werkzeugen: Neu │ + │ − │ ∩ · Auswahl ▾ · Rechteck halten → Zauberstab',",
    "L.push({id: 'spk12', n: 'Auswahl kombinieren, Zauberstab, Lasso, Transient, Obertöne', w: 'Spektral › Leiste unter den Werkzeugen: Neu │ + │ − │ ∩ · Auswahl ▾ · Rechteck halten → Ellipse/Lasso/Zauberstab · Zeit halten → Transient · Harmonische → Obertöne ▾',")
rep("Zauberstab: antippen wählt die zusammenhängende Fläche (Toleranz, ± 5 s).',",
    "Zauberstab: antippen wählt die zusammenhängende Fläche (Toleranz, ± 5 s). Ellipse ziehen, Lasso umfahren. Transient: Schlag antippen oder über Schläge ziehen (Empfindlichkeit, ab … Hz). Obertöne ▾: jeden Oberton anhaken, nur ungerade, Auto. Auswahl ▾ → Folgt dem Ton: die Auswahl wandert mit der Tonhöhe.',")
rep("s: 'auswahl kombinieren hinzufuegen abziehen schnittmenge umkehren invertieren wiederherstellen erweitern verkleinern weich kante rand verschieben zauberstab toleranz spektrum',",
    "s: 'auswahl kombinieren hinzufuegen abziehen schnittmenge umkehren invertieren wiederherstellen erweitern verkleinern weich kante rand verschieben zauberstab toleranz spektrum ellipse lasso polygon transient schlag snare anschlag obertoene ungerade gerade auto folgt ton verfolgung',")
rep("  box: () => SPK1.ui && spk12Box(SPK1.ui), sel: () => SPK1.ui && spk12Clone(SPK1.ui.sel)\n",
    "  box: () => SPK1.ui && spk12Box(SPK1.ui), sel: () => SPK1.ui && spk12Clone(SPK1.ui.sel),\n"
    "  trans: o => spk1Call('spk12trans', Object.assign({doc: SPK1.doc}, o)), hauto: o => spk1Call('spk12hauto', Object.assign({doc: SPK1.doc}, o)), follow: o => spk1Call('spk12follow', Object.assign({doc: SPK1.doc}, o)),\n"
    "  doFollow: () => spk12Follow(SPK1.ui), doAuto: () => spk12HAuto(SPK1.ui), hm: (hm, K) => spk12HmSet(SPK1.ui, hm, 'Test', K)\n")
s = s.replace("(Teil 1/3: Kombinieren, Umkehren, Rand-Griffe, Zauberstab)", "(Teil 1/3: Kombinieren, Umkehren, Rand-Griffe, Zauberstab · Teil 2/3: Transient, Ellipse, Lasso, Obertöne-Häkchen/Auto, folgt dem Ton)")
open(p,'w',encoding='utf-8').write(s); print('ok', s.count('\n'))
