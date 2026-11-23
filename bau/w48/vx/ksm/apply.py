#!/usr/bin/env python3
# KSM: Klangschule-Regler (TAKT, LFO-Raster, Filter 2, Tonh.-Hk.) als Mod-Ziel und Lock je Schritt. Aufruf: apply.py <eingang> <ausgang>
import sys,hashlib,os
src,dst=sys.argv[1],sys.argv[2]
raw=open(src,'rb').read()
if hashlib.md5(raw).hexdigest() not in ('695af0504463a6385e21dc94e55b00c9',):sys.exit('falscher Eingang (md5)')
s=raw.decode('utf-8')
here=os.path.dirname(os.path.abspath(__file__))
def rd(n):return open(os.path.join(here,n),encoding='utf-8').read().strip('\n')
blk=rd('block.js');wk=rd('block-wk.js')
if any(ord(c)>127 for c in wk):sys.exit('Worklet-Block nicht ASCII')
def rep(a,b,n=1):
    global s
    c=s.count(a)
    if c!=n:sys.exit('Anker %d statt %d: %r'%(c,n,a[:80]))
    s=s.replace(a,b)
# --- Worklet (stiller Block sq-worklet-src) ---
A="function ks4Def(){return Object.assign({},KS4_N);}"
rep(A,wk+"\n"+A)
rep("if(this.lkOn||this.lkEv)this.lkStart(v,this.lkEv);","if(this.lkOn||this.lkEv)this.lkStart(v,this.lkEv);this.ksmV(v,this.lkEv);")
A="if(!(x===x)||typeof x!=='number'||!(p>=0&&p<PV_A)||i!==Math.floor(i)){this.lkBad++;continue;}"
rep(A,"if(i<=-9000&&i>-9018)continue;"+A)
rep("if(this.ks4L)this.ks4Lfo(v,P,src,step,r1,r2);","if(this.ks4L||v.ksm)this.ksmLfo(v,P,src,step,r1,r2);")
rep("if(this.ks4P)this.ks4Ctl(v,P,src,dst,step);","if(this.ks4P||v.ksm)this.ksmCtl(v,P,src,dst,step);")
rep("m=clamp(+P.ksF2m,0,1),k=2-1.95*clamp(+P.ksF2r||0,0,1),z=v.ks4;","m=v.ksmF?v.ksmF[0]:clamp(+P.ksF2m,0,1),k=v.ksmF?v.ksmF[1]:2-1.95*clamp(+P.ksF2r||0,0,1),z=v.ks4;")
for x in ('envCoefs(D.A,t(P.aA,Q.ksAa),t(P.aD,Q.ksAd),P.aS,t(P.aR,Q.ksAr),P.aCurve);','envCoefs(D.F,t(P.fA,Q.ksFa),t(P.fD,Q.ksFd),P.fS,t(P.fR,Q.ksFr),P.fCurve);','envCoefs(D.M,t(P.mA,Q.ksMa),t(P.mD,Q.ksMd),P.mS,t(P.mR,Q.ksMr),P.mCurve);'):
    rep(x,x.replace('Q.ks','P.ks'))
rep("if(!this.ks4T)return;","if(!this.ks4T&&!(P!==Q&&KS4T(P)))return;")
rep("this.deriveInto(v.Dv,VP);v.D=v.Dv;","if(v.ksm&&v.ksm.t)this.ksmVP(v,VP);this.deriveInto(v.Dv,VP);v.D=v.Dv;",2)
# --- Hauptskript ---
A="function ks4PageLfo(pg,i,n){"
rep(A,blk+"\n"+A)
A="if(wk&&lkVoiceOk(e,snd)){if(out.length<32)out.push(e.wi,x);}"
rep(A,"if(wk&&e.ksm!=null){if(out.length<32&&(snd.engine==='analog'||snd.engine==='fm6'))out.push(e.ksm,x);}else "+A)
rep("ED.lfoPrev={n,dot,draw:drawShape};","ED.lfoPrev={n,dot,draw:drawShape};ksmPv(pv,i,n);")
for k in ('KSM-BEGIN','KSM-END'):
    if s.count(k)!=2:sys.exit('Marker '+k+' %d'%s.count(k))
tmp=dst+'.tmp';open(tmp,'w',encoding='utf-8').write(s);os.replace(tmp,dst)
print('ok',hashlib.md5(s.encode()).hexdigest())
