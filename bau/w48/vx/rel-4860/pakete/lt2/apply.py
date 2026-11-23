#!/usr/bin/env python3
# LT2: Vollbild mit Tönung nach Wechsel bei stehender Ansicht stückweise vorzeichnen. Aufruf: apply.py <eingang> <ausgang>
import sys, os, hashlib, tempfile
HERE = os.path.dirname(os.path.abspath(__file__))
OK_MD5 = {'9c7f63cf9e6a36aef575d37c064e4022', '125767aed0f89918371d0729d07a6f82'}
src, dst = sys.argv[1], sys.argv[2]
raw = open(src, 'rb').read()
md5 = hashlib.md5(raw).hexdigest()
if md5 not in OK_MD5: sys.exit('LT2: Eingang md5 %s nicht erlaubt' % md5)
s = raw.decode('utf-8')
if 'LT2-BEGIN' in s or 'lt2sDraw' in s: sys.exit('LT2: schon eingebaut')
block = open(os.path.join(HERE, 'block.js'), encoding='utf-8').read()
if not block.endswith('\n'): block += '\n'
EDITS = [
  # Haken in spk1GlDraw: erste Zeile
  ("function spk1GlDraw(U){\nconst G=typeof lt2G==='function'?lt2G(U):U.gl,gl=G.gl,W=U.cw,H=U.ch,d=U.dpr,v=U.v;\n",
   "function spk1GlDraw(U){\nif(typeof lt2sDraw==='function'&&lt2sDraw(U))return;/*LT2*/\nconst G=typeof lt2G==='function'?lt2G(U):U.gl,gl=G.gl,W=U.cw,H=U.ch,d=U.dpr,v=U.v;\n", 1),
  # Block vor spk1CpuDraw
  ("\nfunction spk1CpuDraw(U){\n", "\n" + block + "function spk1CpuDraw(U){\n", 1),
]
for a, b, n in EDITS:
    c = s.count(a)
    if c != n: sys.exit('LT2: Anker %r: %d Treffer statt %d' % (a[:60], c, n))
    s = s.replace(a, b)
for w, n in (('MS 2000', 1),):
    if s.count(w) != n: sys.exit('LT2: %s %d' % (w, s.count(w)))
if sum(1 for l in s.split('\n') if l.startswith('  live: true,')) != 1: sys.exit('LT2: live')
fd, tmp = tempfile.mkstemp(dir=os.path.dirname(os.path.abspath(dst)) or '.')
with os.fdopen(fd, 'wb') as f: f.write(s.encode('utf-8'))
os.replace(tmp, dst)
print('LT2 ok', hashlib.md5(s.encode('utf-8')).hexdigest())
