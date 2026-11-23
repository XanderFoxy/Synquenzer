#!/usr/bin/env python3
# KE2: Klang erkennen – Gewissheit (Engine 3) neu geeicht: Gewichte CAL.mk im stillen Block sq-ke1-src (eine Zeile, Marker /*KE2*/). Aufruf: apply.py <eingang> <ausgang>
import sys,hashlib,os
src,dst=sys.argv[1],sys.argv[2]
raw=open(src,'rb').read()
if hashlib.md5(raw).hexdigest() not in ('a7515b980ddc423e84f9d5cdf8f132a6', '959adf8c57661cfddae7a34e6595982b',):sys.exit('falscher Eingang (md5)')
s=raw.decode('utf-8')
H=os.path.dirname(os.path.abspath(__file__))
def rep(a,b,n=1):
    global s
    c=s.count(a)
    if c!=n:sys.exit('Anker %d statt %d: %r'%(c,n,a[:80]))
    s=s.replace(a,b)
# Welle aus dem Anschlag (versuch-anschlag.js) wird NICHT eingebaut: im Endlauf schlechter (siehe STAND.md).
cal=os.path.join(H,'cal.json')
if True:
    import re,json
    new=json.load(open(cal,encoding='utf-8'))
    m=re.findall(r'^const CAL =  (\{.*\}) ;$',s,re.M)
    if len(m)!=1:sys.exit('CAL-Anker')
    old=json.loads(m[0]);old.update(new)
    rep('const CAL =  '+m[0]+' ;','const CAL = /*KE2*/ '+json.dumps(old,separators=(',',':'))+' ;')
if s.count('/*KE2*/')!=1:sys.exit('Marker KE2')
tmp=dst+'.tmp';open(tmp,'w',encoding='utf-8').write(s);os.replace(tmp,dst)
print('ok',hashlib.md5(s.encode()).hexdigest())
