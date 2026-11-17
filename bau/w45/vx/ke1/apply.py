#!/usr/bin/env python3
# KE1 „Klang erkennen“: basis.html (4.78.0) + 5 Haken (je eine neue Zeile, Kennung KE1) + Hauptblock (src/ke1-main.js hinter
# /* LT2-END */) + stiller Block <script type="text/plain" id="sq-ke1-src"> (src/compose.js + src/ke1-core.js + src/ke1-ui.js, Kommentare per
# src/strip.cjs entfernt) vor sq-md-src
# -> index.html. Keine vorhandene Zeile wird geändert. Aufruf: python3 apply.py
import sys, os, re
D = os.path.dirname(os.path.abspath(__file__)); SRC = os.path.join(D, 'src')
L = open(os.path.join(D, 'basis.html'), encoding='utf-8').read().split('\n')
def find(pattern):
    hits = [i for i, x in enumerate(L) if pattern in x]
    if len(hits) != 1: sys.exit('Anker %r: %d Treffer' % (pattern, len(hits)))
    return hits[0]
def after(pattern, line):
    i = find(pattern); L.insert(i + 1, line)
def before(pattern, line):
    i = find(pattern); L.insert(i, line)
def rd(n): return open(os.path.join(SRC, n), encoding='utf-8').read().rstrip('\n')
def rdk(n):   # stiller Block: ohne Kommentare (Auslieferung übernimmt text/plain-Blöcke bytegleich); src/strip.cjs prüft Syntaxbaum gleich
    import subprocess
    t = os.path.join(SRC, '.strip-' + n)
    subprocess.run(['node', os.path.join(SRC, 'strip.cjs'), os.path.join(SRC, n), t], check=True, stdout=subprocess.DEVNULL,
                   env=dict(os.environ, NODE_PATH='/opt/node-tools/node_modules'))
    x = open(t, encoding='utf-8').read().rstrip('\n'); os.remove(t); return x
# 1 Takes-Blatt: Knopf neben „Im Spektrum öffnen“
after("    (ok ? spk1TkBtn() : '') +   // SPK1: Im Spektrum öffnen",
      "    (ok && typeof ke1TkBtn === 'function' ? ke1TkBtn(x) : '') +   // KE1: Klang erkennen")
# 2 Takes-Blatt: Tipp
after("if (d.a === 'spk1') { const x = tkRef(rr); closePop(); if (x) spk1Open(",
      "      if (d.a === 'ke1' && typeof ke1Go === 'function') { const x = tkRef(rr); closePop(); if (x) ke1Go(ke1TkSrc(x, rr)); return; }   // KE1: Klang erkennen")
# 3 FANG-Ergebnis (eingespielt): Knopf in der unteren Leiste
after("h += `<div class=\"cr-bot fs-bot\"><button class=\"rb\" data-a=\"drop\"><span class=\"lg\">Verwerfen</span>",
      "  if (typeof ke1ResHtml === 'function') h = ke1ResHtml(h, r, inst);   // KE1: Klang erkennen (eingespielt, Take gespeichert)")
# 4 FANG-Ergebnis: Tipp
after("if (a === 'edit') { const r = VS.res; VS.res = null; closePop(); if (r) openRoll(MEL_T, r.si); return; }",
      "      if (a === 'ke1' && typeof ke1ResTap === 'function') { ke1ResTap(VS.res); return; }   // KE1: Klang erkennen")
# 5 Spektral-Seite „Klang nachbauen“: Weg zur neuen Erkennung (kein zweiter Knopf-Satz)
after("K.bTake = el('button', 'mbtn rb spk1-ck', 'Als Klang übernehmen');",
      "    if (typeof ke1KlHook === 'function') ke1KlHook(U, K, dd);   // KE1: zur Erkennung derselben Note")
# Hauptblock hinter LT2-END
i = find('/* LT2-END */')
if L[i].strip() != '/* LT2-END */': sys.exit('LT2-END')
L[i + 1:i + 1] = rd('ke1-main.js').split('\n')
# stiller Block vor sq-md-src
blk = '/* KE1-BEGIN (stiller Block sq-ke1-src: Worker-Quelltext, Kern, Blatt; erst beim ersten Tipp ausgewertet) */\n' + rdk('compose.js') + '\n' + rdk('ke1-core.js') + '\n' + rdk('ke1-ui.js') + '\n/* KE1-END */'
if '</script' in blk.lower(): sys.exit('</script im Block')
i = find('<script type="text/plain" id="sq-md-src">')
L[i:i] = ['<script type="text/plain" id="sq-ke1-src">'] + blk.split('\n') + ['</script>']
open(os.path.join(D, 'index.html'), 'w', encoding='utf-8').write('\n'.join(L))
print('ok', len(L), 'Block', len(blk), 'Zeichen')
