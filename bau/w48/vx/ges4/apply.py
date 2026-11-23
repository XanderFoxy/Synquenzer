#!/usr/bin/env python3
"""GES4: Gesang→Noten – Konsonant-Anlauf genau (schmales Pegel-Tal = Vokalbeginn) + Vibrato-Pegelwellen kein neuer Einsatz. apply.py <eingang> <ausgang>"""
import sys, os, hashlib, tempfile
OK_MD5 = {'695af0504463a6385e21dc94e55b00c9'}
src, dst = sys.argv[1], sys.argv[2]
if os.path.realpath(dst).startswith('/dev/'):
    sys.exit('GES4: Ausgang muss eine Datei sein')
raw = open(src, 'rb').read()
md5 = hashlib.md5(raw).hexdigest()
if md5 not in OK_MD5:
    sys.exit('GES4: falsche Eingangsdatei md5 ' + md5)
s = raw.decode('utf-8')
here = os.path.dirname(os.path.abspath(__file__))
vb = open(os.path.join(here, 'block.js'), encoding='utf-8').read().strip('\n')
kb = open(os.path.join(here, 'kons-block.js'), encoding='utf-8').read().strip('\n')
if 'GES4-BEGIN' in s or 'GES4-K-BEGIN' in s:
    sys.exit('GES4: schon eingebaut')
HAKEN = [
    # (A) Konsonant-Anlauf in ges3Onset
    ('function ges3Onset(notes,A){', kb + '\nfunction ges3Onset(notes,A){', 1),
    ('if(ic<0)continue;', "if(ic<0)continue;\n/* GES4 */let g4k=false;if(typeof ges4Kons==='function'){const r4=ges4Kons(E,jm,jp,ms);if(r4>=0){ic=r4+a;g4k=true;}}", 1),
    ('const amp=Math.sqrt(Math.pow(10,th/10));let s=ic;for(', 'const amp=Math.sqrt(Math.pow(10,th/10));let s=ic;/* GES4 */if(!g4k)for(', 1),
    # (B) Vibrato: Pegel-Tal mitten im Vibrato-Ton ist kein Schnitt (nur Gesang→Noten)
    ('function segment(tr,o){\no=o||{};', 'function segment(tr,o){\no=o||{};', 1),
    ('const notes=[];\n\nlet i=0;\nwhile(i<nF){', 'const notes=[];\n' + vb + '\n\nlet i=0;\nwhile(i<nF){', 1),
    ('if(Math.min(L,R)-e[k]>=6&&k-cuts[cuts.length-1]>=F(60)){', 'if(Math.min(L,R)-e[k]>=6&&k-cuts[cuts.length-1]>=F(60)&&!g4Vib(k,i,j,Math.min(L,R)-e[k])){', 1),
    ("const sg=VSD.segment(A.tr,{snap:o.snap!==false,scale,root:key.root,tuning:'auto',attack:A.inst});",
     "const sg=VSD.segment(A.tr,{snap:o.snap!==false,scale,root:key.root,tuning:'auto',attack:A.inst,ges4:1});", 1),
]
for a, b, n in HAKEN:
    c = s.count(a)
    if c != n:
        sys.exit('GES4: Anker %r %d× statt %d×' % (a[:50], c, n))
    s = s.replace(a, b)
fd, tmp = tempfile.mkstemp(dir=os.path.dirname(os.path.abspath(dst)) or '.')
with os.fdopen(fd, 'wb') as f:
    f.write(s.encode('utf-8'))
os.replace(tmp, dst)
print('GES4 ok ->', dst, hashlib.md5(s.encode('utf-8')).hexdigest())
