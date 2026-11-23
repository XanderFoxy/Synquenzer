#!/usr/bin/env python3
# 4.86.0 = 4.85.0 (9c7f63cf) -> TON1 -> LT2 -> ZRL2 -> ARP2 -> GES2 -> VOX2 -> Versionsnummer. md5-Listen der Kopien je Stufe erweitert.
import hashlib, os, subprocess, sys
H = os.path.dirname(os.path.abspath(__file__))
B = '9c7f63cf9e6a36aef575d37c064e4022'
def md5(p): return hashlib.md5(open(p,'rb').read()).hexdigest()
cur = os.path.join(H, '..', 'rel-4850', 'index.html'); assert md5(cur) == B, 'Basis falsch'
for i, p in enumerate(['ton1', 'lt2', 'zrl2', 'arp2', 'ges2', 'vox2']):
    ap = os.path.join(H, 'pakete', p, 'apply.py'); src = open(ap, encoding='utf-8').read(); m = md5(cur)
    if m not in src:
        assert src.count("'%s'" % B) == 1, p
        src = src.replace("'%s'" % B, "'%s', '%s'" % (B, m)); open(ap, 'w', encoding='utf-8').write(src)
    out = os.path.join(H, 'stufe%d-%s.html' % (i + 1, p))
    r = subprocess.run([sys.executable, ap, cur, out], capture_output=True, text=True, cwd=os.path.join(H, 'pakete', p))
    if r.returncode: sys.exit(p + ': ' + r.stdout[-800:] + r.stderr[-800:])
    print(p, md5(out)); cur = out
s = open(cur, encoding='utf-8').read(); assert s.count("const VERSION = '4.85.0';") == 1
s = s.replace("const VERSION = '4.85.0';", "const VERSION = '4.86.0';")
tmp = os.path.join(H, 'index.html.tmp'); open(tmp, 'w', encoding='utf-8').write(s); os.replace(tmp, os.path.join(H, 'index.html'))
print('4.86.0', md5(os.path.join(H, 'index.html')))
