#!/usr/bin/env python3
# XLA: baut index.html aus basis.html + xla-core.js (Text-Block sq-xla-src) + xla-block.js + einzeiligen Haken (Kennung XLA)
import sys, os
here = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(here, 'basis.html'), encoding='utf-8').read()
core = open(os.path.join(here, 'xla-core.js'), encoding='utf-8').read()
block = open(os.path.join(here, 'xla-block.js'), encoding='utf-8').read()
assert '</script' not in core and '</script' not in block

def rep(s, a, b, n=1):
    c = s.count(a)
    assert c == n, (c, a[:80])
    return s.replace(a, b)

# 1. Kern als Text-Block (wird erst beim Öffnen einer Datei übersetzt) – nach dem letzten Text-Block sq-md-src
a = "registerProcessor('synq-md', MdProc);\n</script>\n<script>\n/* ===== §1.1 block 2: Harmony + Transposer"
b = ("registerProcessor('synq-md', MdProc);\n</script>\n"
     "<script type=\"text/plain\" id=\"sq-xla-src\">/* XLA-BEGIN (Kern als Text, erst beim Öffnen einer .cbp übersetzt) */\n" + core.rstrip('\n') + "\n/* XLA-END */</script>\n"
     "<script>\n/* ===== §1.1 block 2: Harmony + Transposer")
src = rep(src, a, b)
# 2. Logik-Block vor dem Start
a = "/* UPD-END */\nif (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();"
b = "/* UPD-END */\n" + block.rstrip('\n') + "\nif (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();"
src = rep(src, a, b)
# 3. Haken (je eine Zeile, Kennung XLA)
src = rep(src, "async function imp1File(ab, name, hint) {\n",
          "async function imp1File(ab, name, hint) {\n  if (typeof xlaIsCbp === 'function' && xlaIsCbp(ab)) return xlaFile(ab, name);   /* XLA: DAW-Projekt (.cbp) → eigenes Blatt */\n")
src = rep(src, "function undoState(e) {\n",
          "function undoState(e) {\n  if (e.kind === 'xla') return xlaUndoState(e);               // XLA: DAW-Projekt geöffnet (Projektwechsel als ein Schritt)\n")
src = rep(src, "function undoApply(e, val) {\n",
          "function undoApply(e, val) {\n  if (e.kind === 'xla') xlaUndoApply(e, val); else            // XLA: DAW-Projekt geöffnet\n")
src = rep(src, "function onFilePicked(file) {\n  if (!file) return;\n",
          "function onFilePicked(file) {\n  if (!file) return;\n  if (/\\.cbp$/i.test(file.name || '') && typeof xlaPickFile === 'function') { xlaPickFile(file); return; }   /* XLA: DAW-Projekt (.cbp) */\n")
src = rep(src, "const st = !c ? 'Audio (MP3, WAV, M4A, AIFF, CAF) oder MIDI wählen.",
          "const st = !c /* XLA: + .cbp */ ? 'Audio (MP3, WAV, M4A, AIFF, CAF), MIDI oder DAW-Projekt (.cbp) wählen.")
src = rep(src, "B('midiin', 'Audio/MIDI importieren', 'Tempo · Taktart · Teile', !busy) + '</div>' +   // IMP1: ein Import-Weg",
          "B('midiin', 'Audio/MIDI importieren', 'Tempo · Taktart · Teile · .cbp', !busy) + '</div>' +   // IMP1: ein Import-Weg · XLA: + DAW-Projekt (.cbp)")
open(os.path.join(here, 'index.html'), 'w', encoding='utf-8').write(src)
print('ok', len(src))
