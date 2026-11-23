#!/usr/bin/env python3
# KSM2: Klangschule-Locks (TAKT-Zeiten, Tonh.-Hk.) auch fuer Wavetable, MS-Platte und Bit Mask, soweit der Kern den Parameter hat.
# Aufruf: apply.py <eingang> <ausgang>
import sys,hashlib,os
src,dst=sys.argv[1],sys.argv[2]
if os.path.realpath(dst)=='/dev/null':sys.exit('Ausgang /dev/null nicht erlaubt')
raw=open(src,'rb').read()
if hashlib.md5(raw).hexdigest() not in ('a23eefd7ac3f52251e5bc881f1de4628',):sys.exit('falscher Eingang (md5)')
s=raw.decode('utf-8')
here=os.path.dirname(os.path.abspath(__file__))
def rd(n):return open(os.path.join(here,n),encoding='utf-8').read().strip('\n')
blk=rd('block.js');bm=rd('block-bm.js')
for n,b in (('block-bm.js',bm),):
    if any(ord(c)>127 for c in b) or '`' in b or '${' in b or '</script' in b.lower():sys.exit(n+': nicht ASCII/Vorlagen-sicher')
if '</script' in blk.lower():sys.exit('block.js enthaelt </script')
def rep(a,b,n=1):
    global s
    c=s.count(a)
    if c!=n:sys.exit('Anker %d statt %d: %r'%(c,n,a[:80]))
    s=s.replace(a,b)
# --- Hauptskript: Locks je Engine umsetzen ---
A="function lkNoteX(i,clip,nt,rb){"
rep(A,blk+"\n"+A)
rep("const e=LKT[p];if(!e||e.cls==='s'||e.cls==='r'||!lkFamOk(e,snd))continue;",
    "const e=LKT[p];if(e&&e.ksm!=null&&ksm2Eng(snd)){const x=lkFromN(e,v[p]);if(typeof x!=='number'||!isFinite(x))continue;const o0=out.length,r=ksm2Put(snd,e,x,out,nat);if(r)nN++;if(r||out.length>o0||snd.engine==='wt'){lkv[p]=v[p];nV++;}continue;}if(!e||e.cls==='s'||e.cls==='r'||!lkFamOk(e,snd))continue;")
A="nodes.push(...src.nodes);srcs.push(...src.srcs);starts.push(...src.starts);"
rep(A,A+"if(PL.ksm2Pe)ksm2NatPe(v,PL,src,nodes,srcs,starts,t0);")
# --- Bit Mask: Hauptthread-Teil (sq-bm-src) ---
rep("if(lk)bm1On(o,lk);","if(lk){bm1On(o,lk);ksm2Bm(o,lk);}")
# --- Bit Mask: Worklet-Vorlage BM_WK ---
A="class BmProc extends AudioWorkletProcessor{"
rep(A,bm+"\n"+A)
rep("fq:typeof x.fc==='number'&&Math.abs(x.fc)<=96?Math.pow(2,x.fc/12):1});}this.sortQ();break;",
    "fq:typeof x.fc==='number'&&Math.abs(x.fc)<=96?Math.pow(2,x.fc/12):1,kx:ksm2Kx(x)});}this.sortQ();break;")
rep("v.pg=pg;v.ord=++this.ord;v.kill=0;v.fq=e.fq||1;","v.pg=pg;v.ord=++this.ord;v.kill=0;v.fq=e.fq||1;v.kx=e.kx||null;v.kE=null;")
rep("takeKey(v,e){v.fq=e.fq||1;","takeKey(v,e){v.fq=e.fq||1;v.kx=e.kx||null;v.kE=null;")
rep("*48*Math.pow(Math.abs(P.pe.ds)/63,2)*v.vPeg;v.dpT=0;}","*48*Math.pow(Math.abs(P.pe.ds)/63,2)*v.vPeg;if(v.kx&&v.kx.pe!==null)v.H[1]=v.kx.pe*v.vPeg;v.dpT=0;}")
rep("this.envStep(v.es,v.el,v.et,0,P.o1.e,q);this.envStep(v.es,v.el,v.et,1,P.o2.e,q);",
    "const ksm2k=v.kx&&(v.kx.ta||v.kx.tf)?ksm2E(v,P):null;this.envStep(v.es,v.el,v.et,0,ksm2k?ksm2k[0]:P.o1.e,q);this.envStep(v.es,v.el,v.et,1,ksm2k?ksm2k[1]:P.o2.e,q);")
rep("this.envStep(v.es,v.el,v.et,2,P.n.e,q);this.envStep(v.es,v.el,v.et,3,P.f.e,q);",
    "this.envStep(v.es,v.el,v.et,2,ksm2k?ksm2k[2]:P.n.e,q);this.envStep(v.es,v.el,v.et,3,ksm2k?ksm2k[3]:P.f.e,q);")
for k in ('KSM2-BEGIN','KSM2-END'):
    if s.count(k)!=2:sys.exit('Marker '+k+' %d'%s.count(k))
tmp=dst+'.tmp';open(tmp,'w',encoding='utf-8').write(s);os.replace(tmp,dst)
print('ok',hashlib.md5(s.encode()).hexdigest())
