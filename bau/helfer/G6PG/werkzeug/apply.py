# G6+g: baut index.html = R-4252.html + G6PG-Block + Haken (wiederholbar)
import sys, pathlib
H = pathlib.Path(__file__).resolve().parents[1]
base = (H / '../../snapshots/R-4252.html').resolve().read_text()
blk = (H / 'g6pg-block.js').read_text()
s = base
def rep(old, new, n=1):
    global s
    c = s.count(old)
    if c != n: sys.exit('Stelle %d× statt %d×: %r' % (c, n, old[:80]))
    s = s.replace(old, new)
CSS = """#wpSheet .wpz{flex:0 0 88px;height:44px;padding:0;font:700 12px/1 var(--font-ui)}
/* G6+g: Farben der Chorstimmen (Nachtrag 10 §1.6, Kontrast ≥ 3 : 1 zum Grund – dunkel: Editor-Leinwand, hell: heller Grund) */
:root{--chor3:#ff5f5f;--chor5:#3ddc84;--chor6:#4d9dff;--chor8:#b585ff;--chor4:#ff9d42;--chor2:#c8956a;--chor1:#a2a8b3;--chorF:#ffd23f}
:root[data-theme="light"]{--chor3:#c62828;--chor5:#1b7f3b;--chor6:#1f5fc4;--chor8:#7b3fd1;--chor4:#b35300;--chor2:#7a4e2a;--chor1:#5d636e;--chorF:#806500}
/* G6+g: Legende der Chor-Spuren über der Leinwand (eine Zeile, scrollt innen; Treffer 44 × 44) */
#wpSheet .g6pgleg{flex:none;display:flex;gap:4px;height:44px;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;touch-action:pan-x}
#wpSheet .g6pgleg::-webkit-scrollbar{display:none}
#wpSheet .g6pgc{flex:none;display:flex;align-items:center;gap:0;height:44px;padding-left:9px;border-radius:6px;background:var(--chassis-2);box-shadow:inset 4px 0 0 var(--cc),inset 0 0 0 1px var(--line)}
#wpSheet .g6pgc.cur{background:var(--chassis-3)}
#wpSheet .g6pgc .g6pgsw{flex:none;display:grid;place-items:center;min-width:20px;height:20px;padding:0 3px;border-radius:4px;background:var(--cc);color:#0e1014;font:800 11px/1 var(--font-num);font-style:normal}
#wpSheet .g6pgc b{flex:none;max-width:112px;margin:0 2px 0 6px;font:600 12px/14px var(--font-ui);color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:clip}
#wpSheet .g6pgc button{flex:none;width:44px;height:44px;min-width:0;padding:0;border:0;background:none;color:var(--text);display:grid;place-items:center;font:800 13px/1 var(--font-ui)}
#wpSheet .g6pgc .g6pgx{display:none}
#wpSheet .g6pgc.off{opacity:.62}
#wpSheet .g6pgc.off .g6pgx{display:inline}
#wpSheet .g6pgc .g6pgso.on{color:var(--ink);background:var(--amber);border-radius:0 5px 5px 0}
#wpSheet .g6pglq{flex:none;height:44px;padding:0 10px;font:700 12px/1 var(--font-ui)}
#wpSheet .g6pglq.on{color:var(--ink);background:var(--sel);border-color:var(--sel)}"""
rep("#wpSheet .wpz{flex:0 0 88px;height:44px;padding:0;font:700 12px/1 var(--font-ui)}", CSS)
rep("/* G6-END */", blk.rstrip() + "\n/* G6-END */")
rep("  Object.assign(G2.ed, {cv, chips, rs: row, info, ab, cvw});", "  Object.assign(G2.ed, {cv, chips, rs: row, info, ab, cvw});\n  g6pgLegend(G2.ed, b, cvw);   // G6+g: Legende der Chor-Spuren")
rep("  Object.assign(WP.ed, {cv, an, chips, rs, rw, zb, info, ab, cvw, seg, tx});", "  Object.assign(WP.ed, {cv, an, chips, rs, rw, zb, info, ab, cvw, seg, tx});\n  g6pgLegend(WP.ed, b, cvw);   // G6+g: Legende der Chor-Spuren")
rep("  let lo = Infinity, hi = -Infinity; ns.forEach((n, k) => { lo = Math.min(lo, n.m, tg[k]); hi = Math.max(hi, n.m, tg[k]); });\n",
    "  let lo = Infinity, hi = -Infinity; ns.forEach((n, k) => { lo = Math.min(lo, n.m, tg[k]); hi = Math.max(hi, n.m, tg[k]); });\n"
    "  const SG = g6pgGeo(E.r, a), LN = Vc ? g6pgLeadNs(E) : null; if (SG && isFinite(SG.lo)) { lo = Math.min(lo, SG.lo); hi = Math.max(hi, SG.hi); } if (LN) for (const n of LN.ns) { lo = Math.min(lo, n.p); hi = Math.max(hi, n.p); }   // G6+g: Schatten im Bereich\n")
rep("  // Noten-Blöcke: Umriss = gesungen, Block = gehört\n", "  g6pgPaintG2(g, E, x, Wp, Hp, dpr, LN, SG);   // G6+g: Chorstimmen als farbige Schatten hinter den Lead-Blöcken (Bild-Puffer)\n  // Noten-Blöcke: Umriss = gesungen, Block = gehört\n")
rep("  g2Info(rd);\n}", "  g2Info(rd);\n  g6pgLegSync(E);\n}")
rep("    const [cx] = pos(e); UI.ghost = {t: performance.now(), x: e.clientX, y: e.clientY};\n    E.sel = p.k;",
    "    const [cx, cy] = pos(e); UI.ghost = {t: performance.now(), x: e.clientX, y: e.clientY};\n    if (p.k < 0 && g6pgTap(E, cx, cy)) return;   // G6+g: Tipp auf einen Schatten öffnet die Stimme\n    E.sel = p.k;")
rep("  G2.ed = null; clearTimeout(E.rt);\n", "  G2.ed = null; clearTimeout(E.rt); g6pgClosed();\n")
rep("  const E = WP.ed; if (!E) return;\n  WP.ed = null;\n", "  const E = WP.ed; if (!E) return;\n  WP.ed = null; g6pgClosed();\n")
rep("    } else wave(buf);\n  }\n", "    } else wave(buf);\n  }\n  g6pgPaintWp(g, E, x, Wp, Hp, dpr);   // G6+g: Tonhöhenlinien der Chorstimmen (Bild-Puffer)\n")
rep("  E.rs._g(); E.rw._g();\n", "  E.rs._g(); E.rw._g(); g6pgLegSync(E);\n")
rep("r.g.gain.setTargetAtTime(G6.solo == null || G6.solo === -2 ? r.G : 0, t, .01);", "r.g.gain.setTargetAtTime(G6.solo == null || G6.solo === -2 ? r.G : g6pgLeadG(r), t, .01);")
rep("{ try { r.g.gain.cancelScheduledValues(0); r.g.gain.value = 0; } catch (e) {} }   // Solo einer Stimme: der Lead schweigt", "{ try { r.g.gain.cancelScheduledValues(0); r.g.gain.value = g6pgLeadG(r); } catch (e) {} }   // Solo einer Stimme: der Lead schweigt (G6+g: beim Selbst-Singen leise)")
rep("  v.take = {take: seg.take, in: seg.in, out: seg.out, at: seg.at};\n", "  v.take = {take: seg.take, in: seg.in, out: seg.out, at: seg.at};\n  if (clip.audio.chor.v === 2) v.dblOff = true;   // G6+g: Selbst gesungen v2 – Doppel aus, Spur/Pan/Pegel bleiben\n")
rep("      if (d.self != null) { g6Arm(rr, +d.self); return; }", "      if (d.self != null) { g6pgSing(rr, +d.self); return; }   // G6+g")
rep("Object.assign(SYNQUENZER, G6_API);                // G6: Chor-Generator", "Object.assign(SYNQUENZER, G6_API);                // G6: Chor-Generator\nObject.assign(SYNQUENZER, G6PG_API);              // G6+g: farbige Schatten, Legende, Selbst singen v2")
(H / 'index.html').write_text(s)
print('ok', len(s))
