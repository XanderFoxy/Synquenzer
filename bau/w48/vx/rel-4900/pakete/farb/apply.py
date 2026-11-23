#!/usr/bin/env python3
# FARB: eigene Farben fuer die Spuren 9-16. Aufruf: apply.py <eingang> <ausgang>
import sys,hashlib,os
src,dst=sys.argv[1],sys.argv[2]
raw=open(src,'rb').read()
if hashlib.md5(raw).hexdigest() not in ('695af0504463a6385e21dc94e55b00c9', '3acc8abe299050ff852193e7d98555d7',):sys.exit('falscher Eingang (md5)')
s=raw.decode('utf-8')
blk=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'block.css'),encoding='utf-8').read().strip('\n')
def rep(a,b,n=1):
    global s
    c=s.count(a)
    if c!=n:sys.exit('Anker %d statt %d: %r'%(c,n,a[:80]))
    s=s.replace(a,b)
# Anker: Ende der Alias-Zeile --t9..--t24 (= Farben 1-8) im Haupt-Stil; danach gilt der FARB-Block (spaeter = gewinnt)
A1="--t16:var(--t8);--t16a:var(--t8a);"
if s.count(A1)!=1:sys.exit('Anker A1')
A2="--t24:var(--t8);--t24a:var(--t8a)}\n"
rep(A2,A2+blk+"\n")
for k in ('FARB-BEGIN','FARB-END'):
    if s.count(k)!=1:sys.exit('Marker '+k)
if s.index('FARB-BEGIN')<s.index(A1):sys.exit('Reihenfolge')
tmp=dst+'.tmp';open(tmp,'w',encoding='utf-8').write(s);os.replace(tmp,dst)
print('ok',hashlib.md5(s.encode()).hexdigest())
