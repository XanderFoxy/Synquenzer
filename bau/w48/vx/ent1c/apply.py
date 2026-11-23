#!/usr/bin/env python3
# ENT1C: Video-Spur im Song – auf Touch-Geraeten mind. 40 px hoch tippbar (Chips gekuerzt, nie uebereinander)
import sys, os, hashlib, tempfile
OK_MD5 = {'9cfae59f07ef6b087ffe339b125878b3'}
src, dst = sys.argv[1], sys.argv[2]
raw = open(src, 'rb').read()
md5 = hashlib.md5(raw).hexdigest()
if md5 not in OK_MD5:
    sys.exit('ENT1C: falscher Eingang md5=' + md5)
t = raw.decode('utf-8')
if 'ENT1C-BEGIN' in t:
    sys.exit('ENT1C: schon angewendet')

def rep(t, old, new, n=1):
    c = t.count(old)
    if c != n:
        sys.exit('ENT1C: Anker %d statt %d: %r' % (c, n, old[:80]))
    return t.replace(old, new)

# 1) Block: Touch-Erkennung + Spurhoehe (vor vd3VvS)
A1 = "function vd3VvS(song,h){const L=VD3&&uiPrefs().vd3cut===true?((h||SV.h||300)<240?20:24):0;"
B1 = ("/* ENT1C-BEGIN Video-Spur: Touch = 40 px Tippziel */\n"
      "const VD3_TAPH=40;\n"
      "function vd3Tap(){try{return !!(window.matchMedia&&matchMedia('(pointer:coarse)').matches);}catch(e){return false;}}\n"
      "/* ENT1C-END */\n"
      "function vd3VvS(song,h){const L=VD3&&uiPrefs().vd3cut===true?(vd3Tap()?VD3_TAPH:(h||SV.h||300)<240?20:24)/*ENT1C*/:0;")
t = rep(t, A1, B1)

# 2) Schrift im Chip: bei hoher Spur 11 px
A2 = "g.font='700 '+(h<22?9:10)+'px '+C.ui;g.textBaseline='middle';g.textAlign='left';\nif(!VD3.lbl"
B2 = "g.font='700 '+(h<22?9:h>=32?11:10)/*ENT1C*/+'px '+C.ui;g.textBaseline='middle';g.textAlign='left';\nif(!VD3.lbl"
t = rep(t, A2, B2)

fd, tmp = tempfile.mkstemp(dir=os.path.dirname(os.path.abspath(dst)) or '.')
with os.fdopen(fd, 'wb') as f:
    f.write(t.encode('utf-8'))
os.replace(tmp, dst)
print('ENT1C ok ->', dst, hashlib.md5(t.encode('utf-8')).hexdigest())
