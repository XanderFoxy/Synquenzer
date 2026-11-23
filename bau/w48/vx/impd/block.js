/* IMPD-BEGIN – Import-Dehnen auf das Projekt-Tempo: Anker auf die echten Schlaege (auch bei leicht schwankendem Tempo).
   Nur wenn das Projekt schon Audio hat, das Tempo aus der Erkennung stammt (nicht vom Nutzer gewaehlt) und kein reiner Gesang;
   sonst dieselben Anker wie bisher (bitgleich). */
const IMPD={on:true,last:null};
function impdOk(c){
return IMPD.on&&!!(c&&c.r&&c.r.ok&&c.x&&c.sr)&&!c.r.vorgabe&&c.r.quelle!=='gesang'&&Math.abs(c.bpm-c.r.bpm)<1e-9&&!imp1Empty()&&nx1HasAu();
}
async function impdOns(x,sr){
const h=Math.max(8,Math.round(sr/1500)),n=Math.floor(x.length/h),fr=sr/h,e=new Float64Array(n+1);
for(let i=0;i<n;i++){let s=0;for(let j=i*h,b=j+h;j<b;j++){const v=x[j];s+=v*v;}e[i+1]=e[i]+s;if((i&65535)===65535)await vvYield();}
const m=Math.max(2,Math.round(.008*fr)),eps=e[n]/Math.max(1,n)*m*1e-3+1e-12,o=new Float32Array(n);
for(let i=m;i+m<=n;i++){const v=Math.log10((e[i+m]-e[i]+eps)/(e[i]-e[i-m]+eps));o[i]=v>0?v:0;}
const r=Math.max(1,Math.round(.012*fr)),D=new Float32Array(n);
for(let i=0;i<n;i++){let mx=0;for(let j=Math.max(0,i-r),b=Math.min(n-1,i+r);j<=b;j++)if(o[j]>mx)mx=o[j];D[i]=mx;if((i&65535)===65535)await vvYield();}
return{o,D,n,fr,r};
}
async function impdWarp(c,q,src){
const base={src,dst:src.map(t=>t*q)};
if(!impdOk(c)){IMPD.last={aus:true};return base;}
try{
const T0=performance.now(),sr=c.sr,L=c.x.length/sr,sp=60/c.bpm,V=await impdOns(c.x,sr),{o,D,n,fr,r}=V;
const at=(A,t)=>{const i=Math.round(t*fr);return i>=0&&i<n?A[i]:0;};
const G=[];for(let j=0,g0=c.t1-Math.ceil(c.t1/sp)*sp;g0+j*sp-.005<L-.1;j++)G.push(g0+j*sp);
const R=Math.max(1,Math.round(.25*sp*fr)),lam=3/(sp*fr),rf=Math.round(1.5*r),a=[];
let dp=0,snap=0,mx=0;
for(let k=0;k<G.length;k++){
let bs=-1e9,bd=dp,raw=0;
for(let d=-R;d<=R;d++){
let s=0;for(let j=Math.max(0,k-2),je=Math.min(G.length-1,k+2);j<=je;j++)s+=at(D,G[j]+d/fr);
const v=s-lam*Math.abs(d-dp);if(v>bs){bs=v;bd=d;raw=s;}
}
if(raw<.3)bd=dp;
const ci=Math.round((G[k]+bd/fr)*fr);let bi=-1,bo=.25;
for(let i=Math.max(0,ci-rf),ie=Math.min(n-1,ci+rf);i<=ie;i++)if(o[i]>bo){bo=o[i];bi=i;}
const t=bi>=0?bi/fr:G[k]+bd/fr;if(bi>=0)snap++;
a.push(t);dp=bd;mx=Math.max(mx,Math.abs(t-G[k]));
if((k&31)===31)await vvYield();
}
const S=[0],T=[0],lo=Math.max(.5,q/1.5),hi=Math.min(2,q*1.5);
for(let k=0;k<G.length;k++){
const s=a[k]-.005,d=G[k]*q-.005,ps=S[S.length-1],pd=T[T.length-1];
if(!(s>ps+.05&&d>pd+.05&&s<L-.1))continue;
const rr=(d-pd)/(s-ps);if(rr<lo||rr>hi)continue;
S.push(+s.toFixed(6));T.push(+d.toFixed(6));
}
while(S.length>1){const rr=(L*q-T[T.length-1])/(L-S[S.length-1]);if(rr>=lo&&rr<=hi)break;S.pop();T.pop();}
S.push(L);T.push(L*q);
IMPD.last={beats:G.length,anker:S.length-2,snap,maxMs:+(mx*1000).toFixed(1),ms:Math.round(performance.now()-T0)};
return{src:S,dst:T};
}catch(e){logErr(e);IMPD.last={fehler:String(e)};return base;}
}
window.__impd={on:v=>{IMPD.on=v!==false;},last:()=>IMPD.last};
/* IMPD-END */
