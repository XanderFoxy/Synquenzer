#!/usr/bin/env python3
# CHR6: Chor-Weg (g6pDspMake/renderMulti/setS) – Hüllen-Abtastung der neuen Teiltöne mit Lanczos-3 im Log-Bereich.
# Aufruf: apply.py <eingang> <ausgang>
import hashlib, os, sys, tempfile
HERE = os.path.dirname(os.path.abspath(__file__))
ALLOWED = {'695af0504463a6385e21dc94e55b00c9'}
src, dst = sys.argv[1], sys.argv[2]
if os.path.realpath(dst) in ('/dev/null', os.path.realpath(src)):
    sys.exit('Ausgang ungültig')
data = open(src, 'rb').read()
md5 = hashlib.md5(data).hexdigest()
if md5 not in ALLOWED:
    sys.exit(f'md5 {md5} nicht erlaubt')
s = data.decode('utf-8')
if 'CHR6-BEGIN' in s:
    sys.exit('CHR6 schon enthalten')
block = open(os.path.join(HERE, 'block.js'), encoding='utf-8').read().strip('\n')
EDITS = [
    # Hilfsfunktion in den Chor-Kern (wird mit g6pDspMake.toString() in den Worker übernommen)
    ("function g6pDspMake(){\n'use strict';\nconst HMAX=64,FTOP=7000;\n",
     "function g6pDspMake(){\n'use strict';\nconst HMAX=64,FTOP=7000;\n" + block + "\n", 1),
    # nur die Chor-Stelle (setS in renderMulti, erkennbar an „ke“); die Stimm-Korrektur (G2 render, „kk“) bleibt unberührt
    ("const lo=Math.min(Hk,Math.max(1,Math.floor(ke))),t=Math.min(1,Math.max(0,ke-lo));\nconst lm=LM[lo]+(LM[Math.min(Hk+1,lo+1)]-LM[lo])*t;",
     "const lo=Math.min(Hk,Math.max(1,Math.floor(ke))),t=Math.min(1,Math.max(0,ke-lo));\nconst lm=chr6Lm(LM,Hk,lo,t);", 1),
]
for old, new, n in EDITS:
    c = s.count(old)
    if c != n:
        sys.exit(f'Anker {old[:50]!r}: {c} Treffer statt {n}')
    s = s.replace(old, new)
fd, tmp = tempfile.mkstemp(dir=os.path.dirname(os.path.abspath(dst)) or '.', prefix='.chr6-')
with os.fdopen(fd, 'wb') as f:
    f.write(s.encode('utf-8'))
os.replace(tmp, dst)
print('ok', hashlib.md5(s.encode('utf-8')).hexdigest())
