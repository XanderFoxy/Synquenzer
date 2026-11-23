#!/usr/bin/env python3
"""ENT1D: Blatt „Klang erkennen" – Kopf/✕ an gleicher Stelle wie andere Blätter, langer Name gekürzt.
Aufruf: apply.py <eingang> <ausgang>"""
import sys, hashlib, os, tempfile
ERLAUBT = {'9cfae59f07ef6b087ffe339b125878b3'}
src, dst = sys.argv[1], sys.argv[2]
raw = open(src, 'rb').read()
md5 = hashlib.md5(raw).hexdigest()
if md5 not in ERLAUBT:
    sys.exit('ENT1D: md5 %s nicht erlaubt' % md5)
t = raw.decode('utf-8')
if 'ENT1D' in t:
    sys.exit('ENT1D: schon angewendet')
H = [
 # 1) langer Name: eigene Spanne mit Kürzung, voller Name als Hinweis
 ("const nm = Z.src && Z.src.name ? '„' + esc(Z.src.name) + '“' : 'Aufnahme';",
  "const nm = Z.src && Z.src.name ? '<span class=\"ke1-nm\" title=\"' + esc(Z.src.name) + '\">„' + esc(Z.src.name) + '“</span>' : 'Aufnahme'; /* ENT1D */", 1),
 # 2) hochkant: gleiche Breite wie die anderen Blätter (8 px Rand) → ✕ an derselben Stelle; Kürz-Regel
 ("s.textContent = ['.pop.ke1{width:min(400px,calc(100vw - 16px));max-width:calc(100vw - 16px)}',",
  "s.textContent = ['.pop.ke1{width:min(440px,calc(100vw - 16px));max-width:calc(100vw - 16px)}', /* ENT1D */ '.ke1 .ke1-nm{display:inline-block;max-width:min(100%,15em);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;vertical-align:bottom}',", 1),
 # 3) quer (Telefon): volle Breite mit 8 px Rand → ✕ rechts oben wie in den breiten Blättern
 ("@media (orientation:landscape) and (max-height:500px){.pop.ke1{width:min(860px,calc(100vw - 16px))}",
  "@media (orientation:landscape) and (max-height:500px){.pop.ke1{width:calc(100vw - 16px)}", 1),
]
for a, b, n in H:
    c = t.count(a)
    if c != n:
        sys.exit('ENT1D: Anker %d× statt %d×: %r' % (c, n, a[:70]))
    t = t.replace(a, b)
fd, tmp = tempfile.mkstemp(dir=os.path.dirname(os.path.abspath(dst)) or '.', prefix='.ent1d-')
with os.fdopen(fd, 'wb') as f:
    f.write(t.encode('utf-8'))
os.replace(tmp, dst)
print('ENT1D ok →', dst, hashlib.md5(t.encode('utf-8')).hexdigest())
