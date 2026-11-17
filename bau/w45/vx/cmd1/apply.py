#!/usr/bin/env python3
# CMD1: baut index.html aus basis.html (= rel-4780, md5 68e92c03) + cmd1-block.js + einem einzeiligen Haken (Kennung CMD1)
import hashlib, os
here = os.path.dirname(os.path.abspath(__file__))
raw = open(os.path.join(here, 'basis.html'), 'rb').read()
assert hashlib.md5(raw).hexdigest().startswith('68e92c03'), 'basis.html ist nicht rel-4780'
src = raw.decode('utf-8')
block = open(os.path.join(here, 'cmd1-block.js'), encoding='utf-8').read()
assert '</script' not in block and block.startswith('/* CMD1-BEGIN */') and block.rstrip().endswith('/* CMD1-END */')

def rep(s, a, b, n=1):
    c = s.count(a)
    assert c == n, (c, a[:80])
    return s.replace(a, b)

# 1. Block vor dem Start (wie die anderen Pakete: nach UPD-END, im selben Skript wie der Haken -> Funktionen gehoben)
a = "/* UPD-END */\nif (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();"
src = rep(src, a, "/* UPD-END */\n" + block.rstrip('\n') + "\nif (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();")
# 2. Haken (eine Zeile, Kennung CMD1): nach SQF, vor applyKitFix / DRUM_FACTORY / FACTORY_BY_ID
a = "const SQF = window.SQ_FACTORY || {ANALOG: [], FM6: [], KITS: [], PREVIEW: {}, PREVIEW_SEC: {}, ANALOG_BASE: {}};\n"
src = rep(src, a, a + "if (typeof cmdKit === 'function') cmdKit(SQF, KIT_NAMES, KIT_REF);   /* CMD1: Werks-Kit Elektro-Maschine (synthetisch, keine Samples) */\n")
open(os.path.join(here, 'index.html'), 'w', encoding='utf-8').write(src)
print('ok', len(src))
