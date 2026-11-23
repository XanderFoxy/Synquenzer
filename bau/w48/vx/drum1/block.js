/* DRUM1-BEGIN */
/* Drum-Kit aus der Drum-Ebene: Kick/Snare-Vorlagen aus dem Lied selbst lernen. Wo die Schwellen-Erkennung an vielen Stellen Kick UND Snare meldet,
   werden die Anschlag-Spektren dieser Stellen (11 Bänder, 46 ms) in zwei Gruppen geteilt; die Gruppe mit mehr Höhen ist die Snare-Vorlage, die andere
   die Kick-Vorlage. Nur bei klarer Trennung. Danach: Kick-Stellen, deren Spektrum weit weg von der Kick-Vorlage liegt (Bass-Anschläge), fallen weg. */
function drum1Vec(x,sr,t){
const N=2048,i0=Math.round((t-0.005)*sr),re=new Float32Array(N),im=new Float32Array(N),E=[30,60,90,130,180,250,400,800,1600,3200,6400,12000];
for(let i=0;i<N;i++){const j=i0+i;re[i]=j>=0&&j<x.length?x[j]*(0.5-0.5*Math.cos(2*Math.PI*i/N)):0;}
spk11bFft(re,im);
const v=[];let tot=0;for(let b=0;b<E.length-1;b++){let s=0;for(let q=Math.ceil(E[b]*N/sr);q<Math.min(N/2,E[b+1]*N/sr);q++)s+=re[q]*re[q]+im[q]*im[q];v.push(s);tot+=s;}
return tot>0?v.map(s=>10*Math.log10(s/tot+1e-12)):null;
}
function drum1Fix(x,sr,stepS,out){
const by=new Map();for(const h of out){if(h.w!=='k'&&h.w!=='s')continue;const m=by.get(h.k)||{};m[h.w]=1;by.set(h.k,m);}
const dbl=[...by].filter(([k,m])=>m.k&&m.s).map(([k])=>k);
if(dbl.length<8||dbl.length<0.2*by.size)return out;
const V=new Map();for(const k of dbl){const v=drum1Vec(x,sr,k*stepS);if(v)V.set(k,v);}
const ks=[...V.keys()];if(ks.length<8)return out;
const hf=v=>(v[8]+v[9]+v[10])/3-(v[0]+v[1]+v[2]+v[3]+v[4]+v[5])/6,d2=(a,b)=>{let s=0;for(let i=0;i<a.length;i++)s+=(a[i]-b[i])*(a[i]-b[i]);return s/a.length;};
let c=[ks.reduce((p,q)=>hf(V.get(q))<hf(V.get(p))?q:p),ks.reduce((p,q)=>hf(V.get(q))>hf(V.get(p))?q:p)].map(k=>V.get(k).slice()),g=new Map();
for(let it=0;it<12;it++){
for(const k of ks)g.set(k,d2(V.get(k),c[0])<=d2(V.get(k),c[1])?0:1);
c=[0,1].map(j=>{const m=ks.filter(k=>g.get(k)===j);if(!m.length)return c[j];return c[j].map((_,i)=>m.reduce((s,k)=>s+V.get(k)[i],0)/m.length);});
}
const n=[0,1].map(j=>ks.filter(k=>g.get(k)===j).length);if(Math.min(...n)<3)return out;
const sp=Math.sqrt(ks.reduce((s,k)=>s+d2(V.get(k),c[g.get(k)]),0)/ks.length),dc=Math.sqrt(d2(c[0],c[1]));
const info=out.info;if(info)info.lern={dbl:ks.length,abst:+dc.toFixed(1),streu:+sp.toFixed(1)};
if(!(dc>=5&&dc>=3*sp))return out;
const sj=hf(c[1])>=hf(c[0])?1:0,cK=c[1-sj],sK=Math.sqrt(ks.filter(k=>g.get(k)!==sj).reduce((s,k)=>s+d2(V.get(k),cK),0)/Math.max(1,n[1-sj]));
const lim=Math.max(3*sK,0.6*dc),drop=new Set();
for(const h of out){
if(h.w==='k'&&g.has(h.k)&&g.get(h.k)===sj)drop.add(h);
else if(h.w==='s'&&g.has(h.k)&&g.get(h.k)!==sj)drop.add(h);
else if(h.w==='k'&&!g.has(h.k)){const v=drum1Vec(x,sr,h.k*stepS);if(v&&Math.sqrt(d2(v,cK))>lim)drop.add(h);}
}
const o=out.filter(h=>!drop.has(h));o.info=info;if(info)Object.assign(info.lern,{weg:drop.size,grenze:+lim.toFixed(1)});
return o;
}
{const f0=spk11Hits;spk11Hits=function(x,sr,stepS,nStep,fr){const o=f0(x,sr,stepS,nStep,fr);if(fr)return o;try{return drum1Fix(x,sr,stepS,o);}catch(e){logErr(e);return o;}};}
/* DRUM1-END */
