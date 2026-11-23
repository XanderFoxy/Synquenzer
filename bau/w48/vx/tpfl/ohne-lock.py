# TPFL Prüfhilfe (nicht zur Auslieferung): 4.90.0 ohne hörbare Drum-Lock-Wirkung (Tune) – Gegenprobe für den DSE-Kern-Test.
# Aufruf: python3 ohne-lock.py <4.90-index.html> <ausgang>
import sys, hashlib, os
src, dst = sys.argv[1], sys.argv[2]
b = open(src, 'rb').read()
assert hashlib.md5(b).hexdigest() == 'a23eefd7ac3f52251e5bc881f1de4628', 'falscher Eingang'
s = b.decode('utf-8')
rep = [('if(lk.tune){const f=Math.pow(2,lk.tune/12);', 'if(0&&lk.tune){const f=Math.pow(2,lk.tune/12);'),
       ('tune:lk&&isNum(lk.tune)?lk.tune:0,dec:', 'tune:0,dec:')]
for a, c in rep:
    n = s.count(a); assert n == 1, (a, n); s = s.replace(a, c)
tmp = dst + '.tmp'; open(tmp, 'w', encoding='utf-8').write(s); os.replace(tmp, dst); print('ok', dst)
