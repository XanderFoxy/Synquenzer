import sys
p='index.html'; s=open(p).read()
def rep(old,new,cnt=1):
    global s
    n=s.count(old)
    if n!=cnt: sys.exit('MISS %d: %s'%(n,old[:80]))
    s=s.replace(old,new)
js=open('src-g6pe.js').read(); css=open('src-g6pe.css').read()
# CSS nach dem G6-CSS
anchor=".g6sheet .g6v .mbtn{flex:0 0 auto;min-height:44px;min-width:44px;margin:0;padding:0 6px;font-size:12px}\n@media (max-height:440px){.g6sheet .g6rec{grid-template-columns:repeat(4,1fr);gap:4px;margin:2px 0}.g6sheet .g6rec .mbtn{font-size:11px}.g6sheet .clab{margin:0 0 2px}.g6sheet > .small:last-child{display:none}}\n"
rep(anchor, anchor+css)
# JS-Block nach G6-END
rep("/* G6-END */\n", "/* G6-END */\n"+js)
# v2-Weiche im Normalisieren (G6+a-Naht)
rep("function g6NormChor(c) {\n  if (!c || typeof c !== 'object' || !Array.isArray(c.voices)) return null;",
    "function g6NormChor(c) {\n  if (c && c.v === 2 && typeof g6pNorm2 === 'function') return g6pNorm2(c);   // G6+: Chor-Gruppe (v2)\n  if (!c || typeof c !== 'object' || !Array.isArray(c.voices)) return null;")
# Undo-Element chorlanes
rep("  if (e.kind === 'gfx') return g4Snap(e.track);                                                // G4\n",
    "  if (e.kind === 'gfx') return g4Snap(e.track);                                                // G4\n  if (e.kind === 'chorlanes') return g6peLaneSnap(e.track);                                    // G6+: Chor-Spuren der STIMME-Spur\n")
rep("  else if (e.kind === 'gfx') g4Restore(e.track, val);            // G4\n",
    "  else if (e.kind === 'gfx') g4Restore(e.track, val);            // G4\n  else if (e.kind === 'chorlanes') g6peLaneRestore(e.track, val);   // G6+\n")
# Spur-Daten an der STIMME-Spur (normTrack / tkNormProject)
rep("  if (o.stimme) { const g = g4Norm(t.gfx); if (g) o.gfx = g; }    // G4: Effekte der STIMME-Spur\n",
    "  if (o.stimme) { const g = g4Norm(t.gfx); if (g) o.gfx = g; }    // G4: Effekte der STIMME-Spur\n  if (o.stimme && t.chor && typeof g6pNormLanes === 'function') { const c = g6pNormLanes(t.chor); if (c) o.chor = c; }   // G6+: Chor-Spuren\n")
rep("delete t.stimme; delete t.gfx; /* G4: gfx nur an der STIMME-Spur */", "delete t.stimme; delete t.gfx; delete t.chor; /* G4: gfx nur an der STIMME-Spur; G6+: chor auch */")
# Blatt: Tipp + Regler + Schließen
rep("  openPop(anchor || EL.top, p => { p.classList.add('tksheet', 'g6sheet'); guardTouch(p); g6SheetPaint(p);\n    onTap(p, b => {\n      const d = b.dataset, rr = G6.sheet; if (!rr) return;",
    "  G6PE.kl = false; G6PE.dot = null; G6PE.add = false; G6PE.ren = null;\n  openPop(anchor || EL.top, p => { p.classList.add('tksheet', 'g6sheet', 'g6pe'); guardTouch(p); g6SheetPaint(p); g6peSlBind(p);\n    onTap(p, b => {\n      const d = b.dataset, rr = G6.sheet; if (!rr) return;\n      if (g6peTap(b)) return;                                     // G6+e: neues Blatt")
rep("  }, {name: 'chor', onClose: () => { G6.sheet = null; }});",
    "  }, {name: 'chor', onClose: () => { G6.sheet = null; G6PE.live = null; G6PE.ren = null; if (G6.solo != null && !G6.arm) g6Solo(G6.solo); }});   // G6+e: Solo gilt nur, solange das Blatt offen ist")
rep("function g6SheetPaint(p) {\n  p = p || (UI.pop && UI.pop.name === 'chor' ? UI.pop.el : null); const r = G6.sheet, x = r && tkRef(r); if (!p || !x) return;\n  const c = x.a.chor, rd = g6Ready(x.a);",
    "function g6SheetPaint(p) {   // G6+e: v2 bzw. noch kein Chor → neues Blatt; ein Chor aus 4.25 → alte Ansicht mit Kopfzeile\n  p = p || (UI.pop && UI.pop.name === 'chor' ? UI.pop.el : null); const X = g6peCur(); if (!p || !X) return;\n  if (X.c && X.c.v !== 2) { g6SheetPaintV1(p); g6peV1Head(p); p.classList.add('g6v1'); return; }\n  p.classList.remove('g6v1'); g6pePaint(p, X); if (p.isConnected) popFit(p);\n}\nfunction g6SheetPaintV1(p) {\n  const r = G6.sheet, x = r && tkRef(r); if (!p || !x) return;\n  const c = x.a.chor, rd = g6Ready(x.a);")
# Klang auf dem 4.25-Weg (Platzhalter bis G6+c): Spur stumm, Chor aus, Kopplung, Abstand der Gruppe
rep("  const c = a && a.chor, M = G6_MIX[c && c.mix] || G6_MIX['80'], lb = g6Lead(a), el = lb && G6.ke.get(lb); if (!c || !el) return null;",
    "  const c = a && a.chor, M0 = G6_MIX[c && c.mix] || G6_MIX['80'], M = c && c.v === 2 && c.grp ? {below: c.grp.below} : M0, lb = g6Lead(a), el = lb && G6.ke.get(lb); if (!c || !el) return null;   // G6+: Abstand der Gruppe")
rep("    const N = g6Node(v, a.take + ':' + vi + ':' + k, i), g = g6Gain(v, vi);\n    N.inp.gain.setTargetAtTime(A0 * Math.pow(10, v.db / 20), t, .01);\n    N.g.gain.setTargetAtTime(g ? (isNum(v.vol) ? v.vol : 1) : 0, t, .01); N.rev.gain.setTargetAtTime(v.rev * (g6On(vi) ? 1 : 0), t, .01); N.dly.gain.setTargetAtTime(v.dly * (g6On(vi) ? 1 : 0), t, .01);",
    "    const N = g6Node(v, a.take + ':' + vi + ':' + k, i), g = g6Gain(v, vi), mu = typeof g6pVoiceMul === 'function' ? g6pVoiceMul(a, v) : 1;   // G6+e: Spur stumm / Chor aus / Kopplung\n    N.inp.gain.setTargetAtTime(A0 * Math.pow(10, v.db / 20), t, .01);\n    N.g.gain.setTargetAtTime(g ? (isNum(v.vol) ? v.vol : 1) * mu : 0, t, .01); N.rev.gain.setTargetAtTime(v.rev * (g6On(vi) ? mu : 0), t, .01); N.dly.gain.setTargetAtTime(v.dly * (g6On(vi) ? mu : 0), t, .01);")
# Test-API
rep("Object.assign(SYNQUENZER, G6_API);                // G6: Chor-Generator\n",
    "Object.assign(SYNQUENZER, G6_API);                // G6: Chor-Generator\nObject.assign(SYNQUENZER, G6PE_API);              // G6+e: Blatt „Chor“ neu\n")
open(p,'w').write(s); print('ok')
