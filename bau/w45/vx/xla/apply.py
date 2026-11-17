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
# 5. Prüfung (Nachbessern nach dem Prüfer): Anzeige, Song transponieren, neue Spuren – Haken je eine Zeile, Kennung XLA
def repl_line(s, a, b, tag):
    """ändert eine bestehende Zeile (a → b, genau einmal) und hängt die Kennung an ihr Zeilenende"""
    c = s.count(a); assert c == 1, (c, a[:80])
    i = s.find(a); le = s.find('\n', i)
    line = s[s.rfind('\n', 0, i) + 1:le].replace(a, b)
    line += ('   ' if '//' not in line[-200:] else ' · ') + ('/* ' + tag + ' */' if '//' not in line[-200:] else tag)
    return s[:s.rfind('\n', 0, i) + 1] + line + s[le:]
src = rep(src, "  const o = mapOut(i, clipKey, note, time, entry);\n",
          "  const o = mapOut(i, clipKey, note, time, entry);\n  if (tr.xs === 1 && typeof xlaXsPost === 'function' && xlaXsOn(i)) return xlaXsPost(o, time);   /* XLA: ⇅½ nimmt song.xp mit wie ⇅ folgt (Song transponieren, Rückung, Abschnitt) */\n")
src = rep(src, "function shownShift(e) {\n",
          "function shownShift(e) {\n  if (typeof xlaHtView === 'function' && xlaHtView()) return xlaShown(e);   /* XLA: im Halbton-Projekt zeigt der Träger, was der Import tut („+2 · → D-Dur“) */\n")
src = rep(src, "function singleReadout(tgt) {\n",
          "function singleReadout(tgt) {\n  if (typeof xlaHtView === 'function' && xlaHtView()) return null;   /* XLA: im Halbton-Projekt keine Stufe (der Import geht genau um den Grundton) */\n")
src = rep(src, "  const i = NT(), t = newSynthTrack(i);\n",
          "  const i = NT(), t = newSynthTrack(i);\n  if (typeof xlaNewTrack === 'function') xlaNewTrack(t);   /* XLA: im Halbton-Projekt ist die neue Synth-Spur ⇅½ */\n")
X = "(typeof xlaSx === 'function' && xlaSx(i, song)) || "
src = repl_line(src, "} else if (tr.follow && song.xp && song.xp.length) {", "} else if (" + X + "tr.follow && song.xp && song.xp.length) {", "XLA: ⇅½ wie ⇅ folgt (song.xp)")
src = repl_line(src, "if (tr.kind === 'synth' && tr.follow && song.xp && song.xp.length) {", "if (tr.kind === 'synth' && (" + X + "tr.follow && song.xp && song.xp.length)) {", "XLA: ⇅½ wie ⇅ folgt (song.xp)")
src = repl_line(src, "mtx3Dr(i)) && tr.follow && song.xp && song.xp.length) {", "mtx3Dr(i)) && (" + X + "tr.follow && song.xp && song.xp.length)) {", "XLA: ⇅½ wie ⇅ folgt (song.xp)")
src = repl_line(src, "          if (tr.follow && song.xp && song.xp.length) {", "          if (" + X + "tr.follow && song.xp && song.xp.length) {", "XLA: ⇅½ wie ⇅ folgt (song.xp)")
src = repl_line(src, "return tr.follow !== false ? (XP.tl.length > 1", "return tr.follow !== false || (tr.xs === 1 && typeof xlaXsOn === 'function' && xlaXsOn(i)) ? (XP.tl.length > 1", "XLA: ⇅½ wie ⇅ folgt")
src = repl_line(src, "const tl = S.tracks[i].follow !== false ? XP.tl : JAM3.ft, P = [b0];", "const tl = S.tracks[i].follow !== false || (S.tracks[i].xs === 1 && typeof xlaXsOn === 'function' && xlaXsOn(i)) ? XP.tl : JAM3.ft, P = [b0];", "XLA: ⇅½ wie ⇅ folgt")
# 6. Prüfung 2: Hilfe-Karte „Transponieren – so funktioniert's“ im Halbton-Projekt mit dem richtigen Text (Haken je eine Zeile, Kennung XLA)
a = "    'Akkord = alle Spuren folgen dem Akkord (wie Improvisor).'].map(t => `<p>${esc(t)}</p>`).join('') + '</div><div class=\"row\"><button class=\"rb\" id=\"coachOk\">Verstanden</button></div>';\n"
src = rep(src, a, a + "  if (typeof xlaCoachTxt === 'function') xlaCoachTxt(c);   /* XLA: im DAW-Projekt (⇅½) sagt die Karte, was die Tasten dort tun */\n")
open(os.path.join(here, 'index.html'), 'w', encoding='utf-8').write(src)
print('ok', len(src))
