#!/usr/bin/env python3
# 4.84.0 = base 4.83 (4e0fa427) -> VL3 -> MLG3 -> KMP1 -> Versionsnummer. md5-Listen der Kopien werden je Stufe erweitert.
import hashlib, os, re, subprocess, sys
H = os.path.dirname(os.path.abspath(__file__))
def md5(p): return hashlib.md5(open(p,'rb').read()).hexdigest()
cur = os.path.join(H, '..', 'base', 'index.html')
assert md5(cur) == '4e0fa4271ebcf1a1c50b668b5cad5c31', 'Basis falsch'
for i, p in enumerate(['vl3', 'mlg3', 'kmp1']):
    ap = os.path.join(H, 'pakete', p, 'apply.py')
    src = open(ap, encoding='utf-8').read()
    m = md5(cur)
    if m not in src:
        src2, n = re.subn(r"((?:ALLOWED|OK_MD5)\s*=\s*\{)", r"\1'%s', " % m, src, count=1)
        assert n == 1, p
        open(ap, 'w', encoding='utf-8').write(src2)
    out = os.path.join(H, 'stufe%d-%s.html' % (i + 1, p))
    r = subprocess.run([sys.executable, ap, cur, out], capture_output=True, text=True)
    if r.returncode: sys.exit(p + ': ' + r.stdout + r.stderr)
    print(p, md5(out)); cur = out
s = open(cur, encoding='utf-8').read()
assert s.count("const VERSION = '4.83.0';") == 1
s = s.replace("const VERSION = '4.83.0';", "const VERSION = '4.84.0';")
tmp = os.path.join(H, 'index.html.tmp'); open(tmp, 'w', encoding='utf-8').write(s); os.replace(tmp, os.path.join(H, 'index.html'))
print('4.84.0', md5(os.path.join(H, 'index.html')))
