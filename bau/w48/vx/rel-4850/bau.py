#!/usr/bin/env python3
# 4.85.0 = 4.84.0 (9cfae59f) -> ENT1B -> ENT1C -> ENT1D -> Versionsnummer. md5-Listen der Kopien je Stufe erweitert.
import hashlib, os, re, subprocess, sys
H = os.path.dirname(os.path.abspath(__file__))
def md5(p): return hashlib.md5(open(p,'rb').read()).hexdigest()
cur = os.path.join(H, '..', 'rel-4840', 'index.html')
assert md5(cur) == '9cfae59f07ef6b087ffe339b125878b3', 'Basis falsch'
for i, p in enumerate(['ent1b', 'ent1c', 'ent1d']):
    ap = os.path.join(H, 'pakete', p, 'apply.py')
    src = open(ap, encoding='utf-8').read(); m = md5(cur)
    if m not in src:
        src2, n = re.subn(r"((?:OK_MD5|ERLAUBT|ALLOWED)\s*=\s*\{)", r"\1'%s', " % m, src, count=1)
        assert n == 1, p; open(ap, 'w', encoding='utf-8').write(src2)
    out = os.path.join(H, 'stufe%d-%s.html' % (i + 1, p))
    r = subprocess.run([sys.executable, ap, cur, out], capture_output=True, text=True, cwd=os.path.join(H, 'pakete', p))
    if r.returncode: sys.exit(p + ': ' + r.stdout + r.stderr)
    print(p, md5(out)); cur = out
s = open(cur, encoding='utf-8').read()
assert s.count("const VERSION = '4.84.0';") == 1
s = s.replace("const VERSION = '4.84.0';", "const VERSION = '4.85.0';")
tmp = os.path.join(H, 'index.html.tmp'); open(tmp, 'w', encoding='utf-8').write(s); os.replace(tmp, os.path.join(H, 'index.html'))
print('4.85.0', md5(os.path.join(H, 'index.html')))
