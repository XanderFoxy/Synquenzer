#!/usr/bin/env python3
# SZN: Szenen-Name klein unter der Szenen-Nummer im Matrix-Kopf. Aufruf: apply.py <eingang> <ausgang>
import sys,hashlib,os
src,dst=sys.argv[1],sys.argv[2]
raw=open(src,'rb').read()
if hashlib.md5(raw).hexdigest() not in ('695af0504463a6385e21dc94e55b00c9', 'ac6bed69583cf249074b2321ed8c2fe8',):sys.exit('falscher Eingang (md5)')
s=raw.decode('utf-8')
here=os.path.dirname(os.path.abspath(__file__))
rd=lambda f:open(os.path.join(here,f),encoding='utf-8').read().strip('\n')
js,css=rd('block.js'),rd('block.css')
def rep(a,b,n=1):
    global s
    c=s.count(a)
    if c!=n:sys.exit('Anker %d statt %d: %r'%(c,n,a[:80]))
    s=s.replace(a,b)
# CSS: direkt nach der Regel fuer die Akkord-Zeile im Szenen-Kopf
A1=".scn .sc:empty{display:none}"
rep(A1,A1+"\n"+css)
# JS-Block vor buildGrid
A2="function buildGrid(){\n"
rep(A2,js+"\n"+A2)
# Haken in renderGrid: nach der Akkord-Zeile des Szenen-Kopfs
A3="if(b._scT!==scl){b._scT=scl;b._sc.textContent=scl;}"
rep(A3,A3+"sznHead(b,s);/*SZN*/")
for k in ('SZN-BEGIN','SZN-END'):
    if s.count(k)!=2:sys.exit('Marker '+k)
tmp=dst+'.tmp';open(tmp,'w',encoding='utf-8').write(s);os.replace(tmp,dst)
print('ok',hashlib.md5(s.encode()).hexdigest())
