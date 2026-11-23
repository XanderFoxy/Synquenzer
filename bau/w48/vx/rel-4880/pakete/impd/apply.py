#!/usr/bin/env python3
# IMPD: Import-Dehnen mit Ankern auf den echten Schlaegen (Tempo-Lauf). Aufruf: apply.py <eingang> <ausgang>
import sys,hashlib,os
src,dst=sys.argv[1],sys.argv[2]
raw=open(src,'rb').read()
if hashlib.md5(raw).hexdigest() not in ('280c5b0b6a9ed1f8ac77868fb8d5d38f',):sys.exit('falscher Eingang (md5)')
s=raw.decode('utf-8')
blk=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'block.js'),encoding='utf-8').read().strip('\n')
def rep(a,b,n=1):
    global s
    c=s.count(a)
    if c!=n:sys.exit('Anker %d statt %d: %r'%(c,n,a[:80]))
    s=s.replace(a,b)
A1="async function nx1ImpStretch(c,q){\n"
rep(A1,blk+"\n"+A1)
A2="let r=null;try{r=await nx1Call({op:'stretch',x:c.x,sr:c.sr,src,dst:src.map(t=>t*q),lock:.03},240000);}"
rep(A2,"const W=await impdWarp(c,q,src)/*IMPD*/;let r=null;try{r=await nx1Call({op:'stretch',x:c.x,sr:c.sr,src:W.src,dst:W.dst,lock:.03},240000);}")
for k in ('IMPD-BEGIN','IMPD-END'):
    if s.count(k)!=1:sys.exit('Marker '+k)
tmp=dst+'.tmp';open(tmp,'w',encoding='utf-8').write(s);os.replace(tmp,dst)
print('ok',hashlib.md5(s.encode()).hexdigest())
