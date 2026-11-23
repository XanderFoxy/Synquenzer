#!/usr/bin/env python3
# IMPS: Audio-Import ohne Verschiebung durch digitale Stille vorn. Aufruf: apply.py <eingang> <ausgang>
import sys,hashlib,os
src,dst=sys.argv[1],sys.argv[2]
raw=open(src,'rb').read()
if hashlib.md5(raw).hexdigest() not in ('a7515b980ddc423e84f9d5cdf8f132a6',):sys.exit('falscher Eingang (md5)')
s=raw.decode('utf-8')
blk=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'block.js'),encoding='utf-8').read().strip('\n')
def rep(a,b,n=1):
    global s
    c=s.count(a)
    if c!=n:sys.exit('Anker %d statt %d: %r'%(c,n,a[:80]))
    s=s.replace(a,b)
A1="function imp1Geo(c){\n"
rep(A1,blk+"\n"+A1)
A2="const k=c.t1>.03?Math.ceil((c.t1-.03)/takt):0,org=c.t1-k*takt;"
rep(A2,"const zs=impsZs(c)/*IMPS*/,k=c.t1-zs>.03?Math.ceil((c.t1-zs-.03)/takt):0,org=c.t1-k*takt;")
A3="try{r=await imp1Analyse(c.x.slice(),c.sr,c.known?{bpm:c.known}:{},p=>{c.p=p;imp1Prog();});}catch(e){r=null;}"
rep(A3,"try{r=await impsAnalyse(c,c.known?{bpm:c.known}:{},p=>{c.p=p;imp1Prog();})/*IMPS*/;}catch(e){r=null;}")
A4="const sg=typeof spk11Seg==='function'?spk11Seg(r,c.x,c.sr):null;"
rep(A4,"const sg=typeof spk11Seg==='function'?impsSeg(r,c)/*IMPS*/:null;")
for k in ('IMPS-BEGIN','IMPS-END'):
    if s.count(k)!=1:sys.exit('Marker '+k)
tmp=dst+'.tmp';open(tmp,'w',encoding='utf-8').write(s);os.replace(tmp,dst)
print('ok',hashlib.md5(s.encode()).hexdigest())
