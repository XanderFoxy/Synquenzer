#!/usr/bin/env python3
# 4.89.0 = 4.88.0 (695af050) -> CHR6 -> CMD3 -> FOK4 -> SPKV2 -> GES4 -> PERF5 (allgemeiner Verdichter, zuletzt) -> Versionsnummer.
import hashlib, os, re, subprocess, sys
H = os.path.dirname(os.path.abspath(__file__)); B = '695af0504463a6385e21dc94e55b00c9'
def md5(p): return hashlib.md5(open(p,'rb').read()).hexdigest()
cur = os.path.join(H, '..', 'rel-4880', 'index.html'); assert md5(cur) == B, 'Basis falsch'
for i, p in enumerate(['chr6','cmd3','fok4','spkv2','ges4','perf5']):
    ap = os.path.join(H, 'pakete', p, 'apply.py'); src = open(ap, encoding='utf-8').read(); m = md5(cur)
    if m not in src:
        mm = re.search(r"(['\"])" + B + r"\1", src); assert mm, p
        q = mm.group(1); src = src.replace(mm.group(0), mm.group(0) + ", " + q + m + q, 1)
        t = ap + '.tmp'; open(t, 'w', encoding='utf-8').write(src); os.replace(t, ap)
    out = os.path.join(H, 'stufe%d-%s.html' % (i + 1, p))
    r = subprocess.run([sys.executable, ap, cur, out], capture_output=True, text=True, cwd=os.path.join(H, 'pakete', p))
    if r.returncode: sys.exit(p + ': ' + r.stdout[-1200:] + r.stderr[-1200:])
    print(p, md5(out)); cur = out
s = open(cur, encoding='utf-8').read(); assert s.count("const VERSION = '4.88.0';") == 1
s = s.replace("const VERSION = '4.88.0';", "const VERSION = '4.89.0';")
tmp = os.path.join(H, 'index.html.tmp'); open(tmp, 'w', encoding='utf-8').write(s); os.replace(tmp, os.path.join(H, 'index.html'))
print('4.89.0', md5(os.path.join(H, 'index.html')))
