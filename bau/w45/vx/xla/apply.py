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
# 4. Schritt 2 – HALBTON je Spur (⇅½): Haken je eine Zeile, Kennung XLA
src = rep(src, "function mapOut(i, clipKey, note, time, entry) {\n  const tr = S.tracks[i];\n",
          "function mapOut(i, clipKey, note, time, entry) {\n  const tr = S.tracks[i];\n  if (tr.xs === 1 && typeof xlaXsOn === 'function' && xlaXsOn(i)) return xlaXsOut(i, clipKey, note, time, entry);   /* XLA: ⇅½ Halbton – genau um den Grundton verschoben */\n")
src = rep(src, "  const tr = S.tracks[track], e = entry || T.targetAt(time + 1e-6);\n",
          "  const tr = S.tracks[track], e = entry || T.targetAt(time + 1e-6);\n  if (tr && tr.xs === 1 && typeof xlaXsOn === 'function' && xlaXsOn(track)) return xlaXsNoteFor(track, clipKey, played, time, entry);   /* XLA: ⇅½ Halbton – gehört = gespeichert */\n")
src = rep(src, "    o.os = normBool(t.os, true);                                  // V2c′: „Eine Skala“ je Spur (Standard an)\n",
          "    o.os = normBool(t.os, true);                                  // V2c′: „Eine Skala“ je Spur (Standard an)\n    if (t.xs === 1 && o.follow === false) o.xs = 1;               /* XLA: ⇅½ Halbton (nur mit ⇅ fest; ältere Fassungen: fest und exakt) */\n")
src = rep(src, "    const nvN = needNorm(obj, p);",
          "    if (obj.xlaHt === 1) p.xlaHt = 1;                              /* XLA: DAW-Projekt mit Halbton (⇅ an der Spur: ⇅½ → fest → ⇅) */\n    const nvN = needNorm(obj, p);")
src = rep(src, "    else if (!tr.follow) { fb = 'fest'; fcls = 'fb fix'; }\n",
          "    else if (tr.xs === 1 && typeof xlaXsOn === 'function' && xlaXsOn(i)) { fb = '⇅½'; fcls = xlaHeadCls(); }   /* XLA: ⇅½ Halbton */\n    else if (!tr.follow) { fb = 'fest'; fcls = 'fb fix'; }\n")
src = rep(src, "  EL.bFolgt.setAttribute('aria-label', tr.follow ? 'Folgt dem Träger (an)' : 'Folgt nicht (fest)');\n",
          "  EL.bFolgt.setAttribute('aria-label', tr.follow ? 'Folgt dem Träger (an)' : 'Folgt nicht (fest)');\n  if (typeof xlaStrip === 'function') xlaStrip(tr, i);   /* XLA: ⇅½ Halbton an der Spur-Taste */\n")
src = rep(src, "  on(EL.bFolgt, 'click', () => { const tr = S.tracks[R.selT]; if (tr.kind === 'synth') setTrackFollow(R.selT, !tr.follow); });",
          "  on(EL.bFolgt, 'click', () => { const tr = S.tracks[R.selT]; if (typeof xlaFolgtTap === 'function' && xlaFolgtTap(R.selT)) return; /* XLA: ⇅½ → fest → ⇅ im DAW-Projekt */ if (tr.kind === 'synth') setTrackFollow(R.selT, !tr.follow); });")
src = rep(src, "tr.kind === 'synth' && !tr.follow ? 'fest' : 'f', nm0 = String(tr.name || '').toUpperCase();",
          "tr.kind === 'synth' && !tr.follow && tr.xs !== 1 ? 'fest' : 'f', nm0 = String(tr.name || '').toUpperCase();   /* XLA: eine ⇅½-Spur zeigt im Video ⇅ statt FEST */")
open(os.path.join(here, 'index.html'), 'w', encoding='utf-8').write(src)
print('ok', len(src))
