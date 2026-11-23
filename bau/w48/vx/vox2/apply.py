#!/usr/bin/env python3
# VOX2: puls-synchroner Vergleich in der Klick-Erkennung (clickScan). Aufruf: apply.py <eingang> <ausgang>
import sys,hashlib,os
src,dst=sys.argv[1],sys.argv[2]
raw=open(src,'rb').read()
if hashlib.md5(raw).hexdigest() not in ('9c7f63cf9e6a36aef575d37c064e4022',):sys.exit('falscher Eingang (md5)')
s=raw.decode('utf-8')
blk=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'block.js'),encoding='utf-8').read().strip('\n')
def rep(a,b,n=1):
    global s
    c=s.count(a)
    if c!=n:sys.exit('Anker %d statt %d: %r'%(c,n,a[:80]))
    s=s.replace(a,b)
A1="const BQ=o.bq!=null?o.bq:1.2,bigQuiet="
rep(A1,blk+"\n"+A1)
A2="if(!(v>k2*n2)){if(!(BIG>0&&v>k2*s2))return null;"
rep(A2,"if(!(v>k2*n2)&&!vx2Acc(arr,j,v,n2,k2,xl,xr)/*VOX2*/){if(!(BIG>0&&v>k2*s2))return null;")
A3="const T1=test(fe,j,K1,K2),T2=T1?null:test(fh,j,K1+1,K2+0.4),Tq=T1||T2;if(!Tq)continue;"
rep(A3,A3+"if(vx2Rej(j))continue;/*VOX2*/")
for k in ('VOX2-BEGIN','VOX2-END'):
    if s.count(k)!=1:sys.exit('Marker '+k)
tmp=dst+'.tmp';open(tmp,'w',encoding='utf-8').write(s);os.replace(tmp,dst)
print('ok',hashlib.md5(s.encode()).hexdigest())
