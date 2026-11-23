#!/usr/bin/env python3
"""GES2: Gleiten (auch mit Vibrato) in der Stufensuche glätten. apply.py <eingang> <ausgang>"""
import sys, os, hashlib, tempfile
OK_MD5 = {'9c7f63cf9e6a36aef575d37c064e4022'}
src, dst = sys.argv[1], sys.argv[2]
raw = open(src, 'rb').read()
md5 = hashlib.md5(raw).hexdigest()
if md5 not in OK_MD5:
    sys.exit('GES2: falsche Eingangsdatei md5 ' + md5)
s = raw.decode('utf-8')
blk = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'seg-block.js'), encoding='utf-8').read().strip('\n')
if 'GES2' in s:
    sys.exit('GES2: schon eingebaut')
HAKEN = [
    ('function segment(tr,o){', blk + '\nfunction segment(tr,o){', 1),
    ('const minF=F(o.minMs||60);', '/* GES2 */if(o.ges2!==false)ges2Glide(notes,m,unk,F);\nconst minF=F(o.minMs||60);', 1),
]
for a, b, n in HAKEN:
    c = s.count(a)
    if c != n:
        sys.exit('GES2: Anker %r %d× statt %d×' % (a[:40], c, n))
    s = s.replace(a, b)
fd, tmp = tempfile.mkstemp(dir=os.path.dirname(os.path.abspath(dst)) or '.')
with os.fdopen(fd, 'wb') as f:
    f.write(s.encode('utf-8'))
os.replace(tmp, dst)
print('GES2 ok ->', dst, hashlib.md5(s.encode('utf-8')).hexdigest())
