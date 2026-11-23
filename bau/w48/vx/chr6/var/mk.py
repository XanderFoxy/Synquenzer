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
# natürlicher kubischer Spline über LM[1..Hk] (einmal je setM), Auswertung in setS
SPL_OLD="LM[0]=LM[1];LM[Hk+1]=LM[Hk]-3;HK=Hk;"
SPL_NEW="LM[0]=LM[1];LM[Hk+1]=LM[Hk]-3;HK=Hk;chr6Spl(LM,Hk);"
fn="""const CHR6_D2=new Float64Array(HMAX+2),CHR6_U=new Float64Array(HMAX+2);
function chr6Spl(y,n){
const d=CHR6_D2,u=CHR6_U;d[1]=0;u[1]=0;
for(let i=2;i<n;i++){const p=0.5*d[i-1]+2;d[i]=-0.5/p;u[i]=(3*(y[i+1]-2*y[i]+y[i-1])-0.5*u[i-1])/p;}
d[n]=0;for(let k=n-1;k>=1;k--)d[k]=d[k]*d[k+1]+u[k];
}
function chr6Lm(LM,Hk,lo,t){
const p1=LM[lo],p2=LM[Math.min(Hk+1,lo+1)];
if(lo>=Hk||t<=0||Hk<3)return p1+(p2-p1)*t;
const a=1-t,v=a*p1+t*p2+((a*a*a-a)*CHR6_D2[lo]+(t*t*t-t)*CHR6_D2[lo+1])/6;
const hi=Math.max(p1,p2)+0.7,lw=Math.min(p1,p2)-0.7;
return v>hi?hi:v<lw?lw:v;
}"""
open('var/spl.mjs','w').write('export default '+json.dumps([[OLD,NEW],[HEAD,HEAD+"\n"+fn],[SPL_OLD,SPL_NEW]])+';\n')
