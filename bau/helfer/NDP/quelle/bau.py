#!/usr/bin/env python3
# ND-P: baut bau/helfer/NDP/index.html aus bau/snapshots/R-4300.html + quelle/ (ndp.css, ndp-block.js, ndp-main.js)
import pathlib, sys
Q = pathlib.Path(__file__).resolve().parent
ROOT = Q.parents[3]
src = (ROOT / 'bau/snapshots/R-4300.html').read_text(encoding='utf-8')
css = (Q / 'ndp.css').read_text(encoding='utf-8')
blk = (Q / 'ndp-block.js').read_text(encoding='utf-8').replace('/*@NDP_PLATTE_CSS@*/', (Q / 'ndp-platte.css').read_text(encoding='utf-8').replace('\\', '\\\\').replace('`', '\\`'))
main = (Q / 'ndp-main.js').read_text(encoding='utf-8')

def put(s, anchor, new, before=False):
    n = s.count(anchor)
    if n != 1: sys.exit('Anker %d× gefunden: %r' % (n, anchor[:80]))
    return s.replace(anchor, (new + anchor) if before else (anchor + new))

h = src
# 1) CSS ans Ende des Haupt-Stylesheets
h = put(h, '</style>\n</head>', css, before=True)
# 2) der Block, vor dem MK-Block
h = put(h, '<script type="text/plain" id="sq-mk-src">', '<script type="text/plain" id="sq-ndp-src">\n' + blk + '</script>\n', before=True)
# 3) Laden / Öffnen / Instrument-Wahl, nach mkLoad
h = put(h, '/* MK8 (Nachtrag 3 MK8 Umfang 5-6): the program memory A01-H16.', main, before=True)
# 4) Kopf-Knopf im Drum-Editor
a4 = "  F.r1.insertBefore(em, F.r1.querySelector('.hb.ur'));\n  if (ED.dTab === 'steps')"
h = put(h, a4, '')
h = h.replace(a4, "  F.r1.insertBefore(em, F.r1.querySelector('.hb.ur'));\n  F.r1.insertBefore(ndpHeadKey(), em);   // NDP: Kopf-Knopf MD_NAME (Instrument-Wahl + Platte)\n  if (ED.dTab === 'steps')", 1)
# 5) Knopf „North-Platte“ in Zeile E der SOUND-Seite eines Modell-Pads
a5 = "  e.append(all, solo, trig, more);\n"
h = put(h, a5, "  { const np = el('button', 'rb ndpopen', '<b>' + esc(MD_NAME) + '</b><small>Platte</small>'); np.setAttribute('aria-label', MD_NAME + '-Platte öffnen'); onTap(np, () => ndpOpen()); e.appendChild(np); }   // NDP\n")
# 6) closeSheets schließt auch die Platte (Projekt-Wechsel, Menü, Browser …)
a6 = "function closeSheets() {\n"
h = put(h, a6, "  if (typeof ndpIsOpen === 'function' && ndpIsOpen()) { try { NDP.close(true); } catch (e) { logErr(e); } }   // NDP\n")
# 7) Test-API
a7 = "  mdRender: (hits, o) => mdRender(hits, o), mdInfo: () => mdEngineInfo(), mdName: () => MD_NAME,\n"
h = put(h, a7, "  // NDP: die North-Platte (Öffnen, Schließen, Zustand, Ansicht, Instrument-Wahl)\n  ndpOpen: o => ndpOpen(o), ndpClose: () => ndpClose(), ndpInfo: () => (ndpIsOpen() ? NDP.info() : {open: false, loaded: NDPL.loaded}), ndpView: o => (ndpIsOpen() ? NDP.view(o) : null), ndpChoose: () => ndpChoose(), ndpLoadMs: () => NDPL.ms,\n")
out = ROOT / 'bau/helfer/NDP/index.html'
out.write_text(h, encoding='utf-8')
print('ok', len(src), '->', len(h), '(+%d)' % (len(h) - len(src)))
