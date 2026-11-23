#!/usr/bin/env python3
# 4.92.0 = 4.91.0 (44fa0f18) -> VTRIM -> PERF5 (allgemeiner Verdichter, zuletzt) -> Versionsnummer.
import hashlib, os, re, subprocess, sys
H = os.path.dirname(os.path.abspath(__file__)); B = '44fa0f187f10e18dfc5944fcfe1b5bdb'
PAKETE = ['vtrim', 'perf5']
# Anker fuer die md5-Liste je apply.py: erst die Basis 4.91, sonst die urspruengliche Basis des Pakets (PERF5: 4.88.0).
ANKER = [B, '695af0504463a6385e21dc94e55b00c9']
def md5(p): return hashlib.md5(open(p,'rb').read()).hexdigest()
cur = os.path.join(H, '..', 'rel-4910', 'index.html'); assert md5(cur) == B, 'Basis falsch'
for i, p in enumerate(PAKETE):
    ap = os.path.join(H, 'pakete', p, 'apply.py'); src = open(ap, encoding='utf-8').read(); m = md5(cur)
    if m not in src:
        mm = None
        for a in ANKER:
            mm = re.search(r"(['\"])" + a + r"\1", src)
            if mm: break
        assert mm, p
        q = mm.group(1); src = src.replace(mm.group(0), mm.group(0) + ", " + q + m + q, 1)
        t = ap + '.tmp'; open(t, 'w', encoding='utf-8').write(src); os.replace(t, ap)
    out = os.path.join(H, 'stufe%02d-%s.html' % (i + 1, p))
    r = subprocess.run([sys.executable, ap, cur, out], capture_output=True, text=True, cwd=os.path.join(H, 'pakete', p))
    if r.returncode: sys.exit(p + ': ' + r.stdout[-1200:] + r.stderr[-1200:])
    if p == 'perf5': open(os.path.join(H, 'pruef', 'perf5-bericht.txt'), 'w', encoding='utf-8').write(r.stdout)
    print(p, md5(out)); cur = out
s = open(cur, encoding='utf-8').read(); assert s.count("const VERSION = '4.91.0';") == 1
s = s.replace("const VERSION = '4.91.0';", "const VERSION = '4.92.0';")
tmp = os.path.join(H, 'index.html.tmp'); open(tmp, 'w', encoding='utf-8').write(s); os.replace(tmp, os.path.join(H, 'index.html'))
print('4.92.0', md5(os.path.join(H, 'index.html')))
