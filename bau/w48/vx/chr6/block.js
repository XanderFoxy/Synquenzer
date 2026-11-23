/*CHR6-BEGIN Chor-Hülle: Log-Pegel zwischen den Teiltönen mit Lanczos-3 statt linear (Formant-Gipfel bleiben bei großen Sprüngen), Ausschlag begrenzt*/
function chr6Lm(LM,Hk,lo,t){
const p1=LM[lo],p2=LM[Math.min(Hk+1,lo+1)],l=p1+(p2-p1)*t;
if(lo>=Hk||t<=1e-6||t>=1-1e-6)return l;
const s1=Math.sin(Math.PI*t),x=lo+t;let s=0,ws=0;
for(let k=lo-2;k<=lo+3;k++){const d=x-k,w=((lo-k)&1?-1:1)*3*s1*Math.sin(Math.PI*d/3)/(Math.PI*Math.PI*d*d);s+=w*LM[k<1?1:k>Hk?Hk:k];ws+=w;}
const v=s/ws,hi=Math.max(p1,p2)+0.35,lw=Math.min(p1,p2)-0.12;
return v>hi?hi:v<lw?lw:v;
}
/*CHR6-END*/
