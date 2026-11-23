/* ZRL2-BEGIN Tiefband: Rand-Rahmen des vorigen Streifens weiterreichen (gleiche FFT-Paare -> gleiche Bits) */
const zrl2LoW=new WeakMap();
function zrl2LoGet(d,N,cen,out,K,R,y,w){
const c=zrl2LoW.get(d),n=cen.length;if(!c||n<2)return 0;
const L=c[N+':'+R+':'+K];if(!L)return 0;
for(const e of L){
if(e.y!==y||e.w!==w)continue;
const h=e.cen[1]-e.cen[0],D0=cen[0]-e.cen[0];if(!(h>0)||D0%h)continue;
const D=D0/h;if(D<=0||(D&1)||D<e.f0||D>=e.n)continue;
const Rn=Math.min(n,e.n-D)&~1;if(Rn<=0)continue;
let ok=true;for(let j=0;j<Rn;j++)if(e.cen[D+j]!==cen[j]){ok=false;break;}
if(!ok)continue;
out.set(e.X.subarray((D-e.f0)*K,(D-e.f0+Rn)*K));
return Rn;
}
return 0;
}
function zrl2LoPut(d,N,cen,out,K,R,y,w){
const n=cen.length;if(n<4||!d||typeof d!=='object')return;
let c=zrl2LoW.get(d);if(!c)zrl2LoW.set(d,c={});
const k=N+':'+R+':'+K,f0=Math.max(0,n-64)&~1,e={y,w,n,f0,cen:Int32Array.from(cen),X:out.slice(f0*K)};
const L=c[k]||(c[k]=[]);L.unshift(e);if(L.length>2)L.length=2;
}
/* ZRL2-END */
