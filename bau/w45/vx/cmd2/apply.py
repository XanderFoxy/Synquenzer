#!/usr/bin/env python3
# CMD2: baut index.html aus der Basis R-4790 (Synquenzer 4.79.0, md5 d29d696f) + cmd2-block.js (Kit „Elektro-Maschine“, aus CMD1)
# + cmd2-xla.js (im Import-Kern) + Haken (Kennung CMD1 / CMD2). Die Basis wird nur gelesen.
import hashlib, os
here = os.path.dirname(os.path.abspath(__file__))
BASIS = os.path.join(here, '..', '..', 'synq-snapshots', 'R-4790.html')
raw = open(BASIS, 'rb').read()
assert hashlib.md5(raw).hexdigest().startswith('d29d696f'), 'Basis ist nicht R-4790 (md5 d29d696f)'
src = raw.decode('utf-8')
block = open(os.path.join(here, 'cmd2-block.js'), encoding='utf-8').read()
core = open(os.path.join(here, 'cmd2-xla.js'), encoding='utf-8').read()
assert '</script' not in block + core and block.startswith('/* CMD2-BEGIN */') and block.rstrip().endswith('/* CMD2-END */')


def rep(s, a, b, n=1):
    c = s.count(a)
    assert c == n, (c, a[:90])
    return s.replace(a, b)


# 1. Block im Haupt-Skript (dasselbe Skript wie SQF und der Import; nur gehobene Funktionen), vor dem Import-Teil
a = "/* UPD-END */\n/* XLA-BEGIN ===== DAW-Projekt"
src = rep(src, a, "/* UPD-END */\n" + block.rstrip('\n') + "\n/* XLA-BEGIN ===== DAW-Projekt")
# 2. Haken Kit (eine Zeile wie CMD1): nach SQF, vor applyKitFix / DRUM_FACTORY / FACTORY_BY_ID
a = "const SQF = window.SQ_FACTORY || {ANALOG: [], FM6: [], KITS: [], PREVIEW: {}, PREVIEW_SEC: {}, ANALOG_BASE: {}};\n"
src = rep(src, a, a + "if (typeof cmdKit === 'function') cmdKit(SQF, KIT_NAMES, KIT_REF);   /* CMD1: Werks-Kit Elektro-Maschine (synthetisch, keine Samples) */\n")
# 3. Import-Kern (Text-Block sq-xla-src, läuft im Worker): Erkennung + Umlegen beim Lesen, Kit-Wahl, Übersicht
a = "  // GM-Drumnoten auf die 12 Pads des Synquenzers"
src = rep(src, a, core.rstrip('\n') + "\n" + a)
a = "    return {meta, tracks, warn};"
src = rep(src, a, "    cmdMapAll(tracks);   /* CMD2: Drum-Spuren im Layout des Elektro-Drumcomputers → Pads */\n" + a)
a = "    if (tr.kind === 'kit' || tr.kind === 'smpkit') {"
src = rep(src, a, "    if (tr.cmd) return cmdSound(pre);   /* CMD2 */\n" + a)
src = rep(src, "snd: L.drums.length ? soundFor(L.drums[0]) :", "snd: L.drums.length ? soundFor(L.drums.find(d => d.cmd) || L.drums[0]) /* CMD2 */ :")
a = "drums: L.drums.map(d => d.name), merged: L.merged, cap, key: keyOf(model.tracks)};"
src = rep(src, a, "drums: L.drums.map(d => d.name), drumKit: L.drums.length ? soundFor(L.drums.find(d => d.cmd) || L.drums[0]).sound.factory : '', drumMap: L.drums.filter(d => d.cmd).map(d => d.name) /* CMD2 */, merged: L.merged, cap, key: keyOf(model.tracks)};")
# 4. Haupt-Thread: Kit-Kennung 'elektro' → Werks-Kit; Import-Blatt nennt das Kit der DRUMS-Spur
src = rep(src, "gated: 'f-kit-gated-84'})[k] || DEFAULT_KIT;", "gated: 'f-kit-gated-84', elektro: 'f-kit-elektro-maschine' /* CMD2 */})[k] || DEFAULT_KIT;")
src = rep(src, "if (S0.drums.length) info.push('DRUMS: ' + S0.drums.join(' + '));", "if (S0.drums.length) info.push('DRUMS: ' + S0.drums.join(' + ') + (typeof cmdKitLine === 'function' ? cmdKitLine(S0) : ''));   /* CMD2 */")
open(os.path.join(here, 'index.html'), 'w', encoding='utf-8').write(src)
print('ok', len(src.encode('utf-8')), hashlib.md5(src.encode('utf-8')).hexdigest()[:8])
