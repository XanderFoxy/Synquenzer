import sys
OLD="const lo=Math.min(Hk,Math.max(1,Math.floor(ke))),t=Math.min(1,Math.max(0,ke-lo));\nconst lm=LM[lo]+(LM[Math.min(Hk+1,lo+1)]-LM[lo])*t;"
NEW="const lo=Math.min(Hk,Math.max(1,Math.floor(ke))),t=Math.min(1,Math.max(0,ke-lo));\nconst lm=chr6Lm(LM,Hk,lo,t);"
HEAD="const HMAX=64,FTOP=7000;"
import json
def w(name, fn):
    open(f'var/{name}.mjs','w').write('export default '+json.dumps([[OLD,NEW],[HEAD,HEAD+"\n"+fn]])+';\n')
# Catmull-Rom, Überschwinger-Grenze c (ln)
for c in ['0.35','0.7','9']:
    w('cr'+c.replace('.',''), """function chr6Lm(LM,Hk,lo,t){
const p1=LM[lo],p2=LM[Math.min(Hk+1,lo+1)];
if(lo>=Hk||t<=0)return p1+(p2-p1)*t;
const p0=lo>1?LM[lo-1]:p1,p3=lo+2<=Hk?LM[lo+2]:p2;
const m1=(p2-p0)/2,m2=(p3-p1)/2,t2=t*t,t3=t2*t;
const v=(2*t3-3*t2+1)*p1+(t3-2*t2+t)*m1+(-2*t3+3*t2)*p2+(t3-t2)*m2;
const hi=Math.max(p1,p2)+%s,lw=Math.min(p1,p2)-%s;
return v>hi?hi:v<lw?lw:v;
}""" % (c,c))
# Lanczos a=2/3 im Log-Bereich (Stützstellen 1..Hk, Rand gespiegelt/konstant)
for A in ['2','3']:
    w('lz'+A, """function chr6Lm(LM,Hk,lo,t){
const p1=LM[lo],p2=LM[Math.min(Hk+1,lo+1)];
if(lo>=Hk||t<=0)return p1+(p2-p1)*t;
const A=%s,x=lo+t;let s=0,ws=0;
for(let k=lo-A+1;k<=lo+A;k++){const d=x-k,kk=Math.min(Hk,Math.max(1,k));const w=Math.abs(d)<1e-9?1:A*Math.sin(Math.PI*d)*Math.sin(Math.PI*d/A)/(Math.PI*Math.PI*d*d);s+=w*LM[kk];ws+=w;}
const v=s/ws,hi=Math.max(p1,p2)+0.7,lw=Math.min(p1,p2)-0.7;
return v>hi?hi:v<lw?lw:v;
}""" % A)
