#!/usr/bin/env python3
# MLG1: baut index.html aus basis.html (= rel-4780, md5 68e92c03) + mlg1-block.js + einzeiligen Haken (Kennung MLG1)
import os
here = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(here, 'basis.html'), encoding='utf-8').read()
block = open(os.path.join(here, 'mlg1-block.js'), encoding='utf-8').read()
assert '</script' not in block

def rep(s, a, b, n=1):
    c = s.count(a)
    assert c == n, (c, a[:80])
    return s.replace(a, b)

# 1. Block vor dem Start (wie die anderen Pakete: nach UPD-END)
a = "/* UPD-END */\nif (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();"
src = rep(src, a, "/* UPD-END */\n" + block.rstrip('\n') + "\nif (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();")
# 2. Haken (je eine Zeile, Kennung MLG1)
a = "const FACTORY = SQF.ANALOG.concat(SQF.FM6 || [], WT_FACTORY);\n"
src = rep(src, a, a + "if (typeof mlgWerk === 'function') FACTORY.push(...mlgWerk());   /* MLG1: 10 eigene Retro-Werksklänge (Übersetzer MLG1, eigene Werte) */\n")
a = "  foot.append(bSave, bImp, bExp, bus, dl);\n"
src = rep(src, a, a + "  if (typeof mlgFoot === 'function') mlgFoot(foot, t);   /* MLG1: Klang aus DAW-Datei übernehmen (nur Synth-Spuren) */\n")
open(os.path.join(here, 'index.html'), 'w', encoding='utf-8').write(src)
print('ok', len(src))
