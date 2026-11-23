#!/usr/bin/env python3
# VOX3: Plopps (zweiter Durchgang für leise Tiefstöße) + Raumton-Farbe in langen Lücken (davor -> danach). Aufruf: apply.py <eingang> <ausgang>
import sys,hashlib,os
src,dst=sys.argv[1],sys.argv[2]
raw=open(src,'rb').read()
if hashlib.md5(raw).hexdigest() not in ('a7515b980ddc423e84f9d5cdf8f132a6', '2339ab88996787807e139f754ff96046',):sys.exit('falscher Eingang (md5)')
s=raw.decode('utf-8')
blk=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'block.js'),encoding='utf-8').read().strip('\n')
def rep(a,b,n=1):
    global s
    c=s.count(a)
    if c!=n:sys.exit('Anker %d statt %d: %r'%(c,n,a[:80]))
    s=s.replace(a,b)
A1="\nfunction plopFind(Fe,o){"
rep(A1,"\n"+blk+A1)
A2="j=e;\n}\nreturn ev;\n}"
rep(A2,"j=e;\n}\nreturn vo3Weak(Fe,o,ev,LF,r,flo,top,lvl,own,thr);/*VOX3*/\n}")
A3="let mg=mag;{"
rep(A3,"let mg=mag,vo3c=null;/*VOX3*/{")
A4="for(let k=k0;k<k1;k++)mg[k]*=g;}}}\nlet sd="
rep(A4,"for(let k=k0;k<k1;k++)mg[k]*=g;}}vo3c=vo3Col(PW,PU,a,b,L,sr,N,mg,o);/*VOX3*/}\nlet sd=")
A5="for(let k=1;k<N/2;k++){const t=TAU*rnd();re[k]=mg[k]*Math.cos(t);im[k]=mg[k]*Math.sin(t);"
rep(A5,"const vo3m=vo3c?vo3c(f):mg;/*VOX3*/for(let k=1;k<N/2;k++){const t=TAU*rnd();re[k]=vo3m[k]*Math.cos(t);im[k]=vo3m[k]*Math.sin(t);")
for k in ('VOX3-BEGIN','VOX3-END'):
    if s.count(k)!=1:sys.exit('Marker '+k)
tmp=dst+'.tmp';open(tmp,'w',encoding='utf-8').write(s);os.replace(tmp,dst)
print('ok',hashlib.md5(s.encode()).hexdigest())
