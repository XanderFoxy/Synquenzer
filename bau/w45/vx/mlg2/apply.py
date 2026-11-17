#!/usr/bin/env python3
# MLG2: baut index.html aus der Basis R-4790 (Synquenzer 4.79.0, md5 d29d696f) + mlg1-block.js (MLG1, portiert) + mlg2-block.js
# + einzeiligen Haken (Kennung MLG1 / MLG2). Die Basis wird nur gelesen.
import hashlib, os
here = os.path.dirname(os.path.abspath(__file__))
BASIS = os.path.join(here, '..', '..', 'synq-snapshots', 'R-4790.html')
raw = open(BASIS, 'rb').read()
assert hashlib.md5(raw).hexdigest().startswith('d29d696f'), 'Basis ist nicht R-4790 (md5 d29d696f)'
src = raw.decode('utf-8')
blocks = []
for fn in ('mlg1-block.js', 'mlg2-block.js'):
    p = os.path.join(here, fn)
    if os.path.exists(p):
        b = open(p, encoding='utf-8').read()
        assert '</script' not in b
        blocks.append(b.rstrip('\n'))


def rep(s, a, b, n=1):
    c = s.count(a)
    assert c == n, (c, a[:90])
    return s.replace(a, b)


INIT = "if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();"
# 1. Blöcke vor dem Start (nach XLA-END, wie die anderen Pakete nach dem letzten Block)
src = rep(src, "/* XLA-END */\n" + INIT, "/* XLA-END */\n" + '\n'.join(blocks) + '\n' + INIT)
# 2. MLG1-Haken (je eine Zeile, unverändert aus MLG1)
a = "const FACTORY = SQF.ANALOG.concat(SQF.FM6 || [], WT_FACTORY);\n"
src = rep(src, a, a + "if (typeof mlgWerk === 'function') FACTORY.push(...mlgWerk());   /* MLG1: 10 eigene Retro-Werksklänge (Übersetzer MLG1, eigene Werte) */\n")
a = "  foot.append(bSave, bImp, bExp, bus, dl);\n"
src = rep(src, a, a + "  if (typeof mlgFoot === 'function') mlgFoot(foot, t);   /* MLG1: Klang aus DAW-Datei übernehmen (nur Synth-Spuren) */\n")
if os.path.exists(os.path.join(here, 'mlg2-hooks.py')):
    exec(open(os.path.join(here, 'mlg2-hooks.py'), encoding='utf-8').read())
open(os.path.join(here, 'index.html'), 'w', encoding='utf-8').write(src)
print('ok', len(src), hashlib.md5(src.encode('utf-8')).hexdigest()[:8])
