#!/usr/bin/env python3
"""GES3: Gesang→Noten-Einsatz lagefest (echte Onset-Probe) + Marken nur bei echtem Einsatz (neue Takes). apply.py <eingang> <ausgang>"""
import sys, os, hashlib, tempfile
OK_MD5 = {'280c5b0b6a9ed1f8ac77868fb8d5d38f'}
src, dst = sys.argv[1], sys.argv[2]
raw = open(src, 'rb').read()
md5 = hashlib.md5(raw).hexdigest()
if md5 not in OK_MD5:
    sys.exit('GES3: falsche Eingangsdatei md5 ' + md5)
s = raw.decode('utf-8')
here = os.path.dirname(os.path.abspath(__file__))
on = open(os.path.join(here, 'on-block.js'), encoding='utf-8').read().strip('\n')
mk = open(os.path.join(here, 'mk-block.js'), encoding='utf-8').read().strip('\n')
if 'GES3-BEGIN' in s or 'GES3-MK-BEGIN' in s:
    sys.exit('GES3: schon eingebaut')
HAKEN = [
    # (A) Gesang→Noten: Einsatz auf die echte Onset-Probe
    ('function vsNotesOf(A,o){', on + '\nfunction vsNotesOf(A,o){', 1),
    ("const sg=VSD.segment(A.tr,{snap:o.snap!==false,scale,root:key.root,tuning:'auto',attack:A.inst});",
     "const sg=VSD.segment(A.tr,{snap:o.snap!==false,scale,root:key.root,tuning:'auto',attack:A.inst});\n/* GES3 */if(typeof ges3Onset==='function')ges3Onset(sg.notes,A);", 1),
    # (B) Marken nur bei echtem Einsatz (Worker vsMarksMake), nur für neue Takes
    ('function detectMarks(x,sr,o={}){', mk + '\nfunction detectMarks(x,sr,o={}){', 1),
    ('marks.sort((a,b)=>a.i-b.i);\n}\nreturn marks;\n}', '/* GES3 */if(o.g3)ges3Echt(marks,x,sr,Es,hop,V,cents);\nmarks.sort((a,b)=>a.i-b.i);\n}\nreturn marks;\n}', 1),
    ("if(m.op==='det')return M.detectMarks(m.x,m.sr).map(", "if(m.op==='det')return M.detectMarks(m.x,m.sr,{g3:!!m.g3}).map(", 1),
    ("return wpCall({op:'det',x,sr});", "return wpCall({op:'det',x,sr,g3:typeof ges3Neu==='function'&&ges3Neu(id)});", 1),
    ("const r=await wpCall({op:'det',x:vxr2View(x,off),sr});", "const r=await wpCall({op:'det',x:vxr2View(x,off),sr,g3:typeof ges3Neu==='function'&&ges3Neu(id)});", 1),
    ("await vxr2Det(b,id):await wpCall({op:'det',x:b.getChannelData(0),sr:b.sampleRate});",
     "await vxr2Det(b,id):await wpCall({op:'det',x:b.getChannelData(0),sr:b.sampleRate,g3:typeof ges3Neu==='function'&&ges3Neu(id)});", 1),
]
for a, b, n in HAKEN:
    c = s.count(a)
    if c != n:
        sys.exit('GES3: Anker %r %d× statt %d×' % (a[:50], c, n))
    s = s.replace(a, b)
fd, tmp = tempfile.mkstemp(dir=os.path.dirname(os.path.abspath(dst)) or '.')
with os.fdopen(fd, 'wb') as f:
    f.write(s.encode('utf-8'))
os.replace(tmp, dst)
print('GES3 ok ->', dst, hashlib.md5(s.encode('utf-8')).hexdigest())
