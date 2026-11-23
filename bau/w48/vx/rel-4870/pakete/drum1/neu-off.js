function spk11bEnv(x,sr){
const H=Math.max(1,Math.round(sr*0.005)),F=Math.floor(x.length/H),aL=1-Math.exp(-2*Math.PI*150/sr),aH=1-Math.exp(-2*Math.PI*5000/sr);
const E=[new Float32Array(F),new Float32Array(F),new Float32Array(F)];let l1=0,l2=0,h1=0;
for(let f=0;f<F;f++){
let sl=0,sm=0,sh=0;
for(let i=f*H,e=i+H;i<e;i++){const v=x[i];l1+=aL*(v-l1);l2+=aL*(l1-l2);h1+=aH*(v-h1);const hi=v-h1,mid=h1-l2;sl+=l2*l2;sm+=mid*mid;sh+=hi*hi;}
E[0][f]=Math.sqrt(sl/H);E[1][f]=Math.sqrt(sm/H);E[2][f]=Math.sqrt(sh/H);
}
const O=E.map(e=>{const o=new Float32Array(F);for(let f=2;f<F;f++){let m=0,c=0;for(let j=Math.max(0,f-8);j<f-1;j++){m+=e[j];c++;}o[f]=Math.max(0,e[f]-(c?m/c:0));}return o;});

const eh=E[2],Q=new Float32Array(F);
for(let f=10;f<F;f++){const a=(eh[f-2]+eh[f-3]+eh[f-4])/3,b=(eh[f-7]+eh[f-8]+eh[f-9])/3,r=b>1e-9?Math.min(1,Math.pow(a/b,0.2)):1;Q[f]=Math.max(0,eh[f]-a*r*r*r);}
return{E,O,H,F,Q};
}

function spk11bSplit(v,lo,sep){
const a=v.filter(x=>x>lo).map(x=>Math.log(x)).sort((p,q)=>p-q),n=a.length;if(n<8)return null;
const cs=[0];for(const x of a)cs.push(cs[cs.length-1]+x);
let best=-1,bi=-1;
for(let i=2;i<=n-2;i++){const m0=cs[i]/i,m1=(cs[n]-cs[i])/(n-i),w=i*(n-i)*(m1-m0)*(m1-m0);if(w>best){best=w;bi=i;}}
if(bi<0)return null;const m0=cs[bi]/bi,m1=(cs[n]-cs[bi])/(n-bi);
return m1-m0>=Math.log(sep)?{t:Math.exp((a[bi-1]+a[bi])/2),lo:Math.exp(m0),hi:Math.exp(m1),nHi:n-bi}:null;
}
function spk11bHits(x,sr,stepS,nStep,fr,ref){
const A=spk11bEnv(x,sr),{E,O,H,F}=A,Bo=ref&&ref.bass&&ref.bass.length===x.length?spk11bEnv(ref.bass,sr):null;
const pk=[[],[],[]],dk=[],bk=[],pq=[];
for(let k=0;k<nStep;k++){
const c=k*stepS,f0=Math.max(0,Math.floor((c-0.03)*sr/H)),f1=Math.min(F-1,Math.ceil((c+0.035)*sr/H));
for(let b=0;b<3;b++){let m=0,mf=f0;for(let f=f0;f<=f1;f++)if(O[b][f]>m){m=O[b][f];mf=f;}pk[b].push(m);if(!b){let e0=0;for(let f=mf;f<=Math.min(F-1,mf+4);f++)e0=Math.max(e0,E[0][f]);const f2=Math.min(F-1,mf+Math.round(0.1*sr/H));dk.push(e0>0?E[0][f2]/e0:1);}}
{let q=0;for(let f=f0;f<=f1;f++)q=Math.max(q,A.Q[f]);pq.push(q);}
let m=0;if(Bo)for(let f=f0;f<=Math.min(Bo.F-1,f1);f++)m=Math.max(m,Bo.O[0][f]);bk.push(m);
}
const IN=ref&&ref.inner,ref97=IN?IN.r97:pk.map(a=>{const s=a.slice().sort((p,q)=>p-q);return Math.max(1e-4,s[Math.floor(0.97*(s.length-1))]||0);});
const nl=pk[0].map(v=>v/ref97[0]),nm=pk[1].map(v=>v/ref97[1]),nh=pk[2].map(v=>v/ref97[2]),nq=pq.map(v=>v/ref97[2]);
const lo=!fr||fr[0]<200,mi=!fr||(fr[1]>200&&fr[0]<5000),hi=!fr||fr[1]>4000;


let sS=IN?IN.sS:hi?spk11bSplit(nh,0.1,1.5):null;if(sS&&!IN){const s2=spk11bSplit(nh,sS.t,1.5);if(s2&&s2.nHi>=8)sS=s2;}
const tS=sS?Math.max(0.45,Math.min(0.75,sS.t)):0.7;
const sK=IN?IN.sK:lo?spk11bSplit(nl,0.08,1.8):null,tK=sK?Math.max(0.3,Math.min(0.6,sK.t)):0.35,tK2=0.3;
const isSn=k=>mi&&((nm[k]>0.35&&nl[k]<tK&&pk[1][k]>=1.9*pk[0][k])||(hi&&nh[k]>=tS&&(nm[k]>=0.12||nl[k]>=0.12)));

const out=[],hat=new Uint8Array(nStep),snS=[],kk=new Uint8Array(nStep),weak=[],spb=ref&&ref.spb>0?ref.spb:16;
for(let k=0;k<nStep;k++){
const sn=isSn(k),dom=!Bo||pk[0][k]>=0.7*bk[k];
const mc=pk[1][k]>=0.9*pk[0][k],tail=k>0&&kk[k-1]&&!mc&&nl[k]<0.8*nl[k-1];
const strong=sK&&nl[k]>=0.65*sK.hi&&!tail;
const click=strong||mc;
const kick=lo&&click&&!tail&&(!IN||strong)&&(dk[k]<0.6||strong)&&pk[0][k]>=(strong?0.25:0.4)*pk[1][k]&&((nl[k]>=tK&&dom&&(!sn||strong||!sK))||(nl[k]>=tK2&&!sn&&pk[0][k]>=1.5*bk[k]));
if(kick){out.push({k,w:'k',v:Math.min(1,0.45+0.55*nl[k])});kk[k]=1;}
else if(lo&&click&&!sn&&dk[k]<0.7&&nl[k]>=0.6*tK2&&pk[0][k]>=0.4*pk[1][k]&&(!Bo||pk[0][k]>=0.7*bk[k]))weak.push(k);
if(sn){out.push({k,w:'s',v:Math.min(1,0.45+0.55*Math.min(1,Math.max(nm[k],nh[k])/0.8))});snS.push([k,nh[k]]);}
else if(hi&&(nh[k]>0.12||nq[k]>0.12)){out.push({k,w:'h',v:Math.min(1,0.35+0.6*nh[k])});hat[k]=1;}
}

for(const k of weak){const p=k%spb,b0=Math.floor(k/spb);let n=0,c=0;for(let b=b0-4;b<=b0+4;b++){const j=b*spb+p;if(b===b0||j<0||j>=nStep)continue;c++;n+=kk[j];}if(c>=3&&n>=0.6*c)out.push({k,w:'k',v:Math.min(1,0.45+0.55*nl[k])});}
for(const[k,v]of snS)if(v>0.2&&((k>=2&&hat[k-2]&&hat[k+2])||(k>=1&&hat[k-1]&&hat[k+1])))out.push({k,w:'h',v:Math.min(1,0.35+0.3*v)});



const leise=[];
if(!(ref&&ref.inner)&&spb>=4&&nStep>=4*spb){
const nb=Math.floor(nStep/spb),Lb=[];
for(let b=0;b<nb;b++){const f0=Math.floor(b*spb*stepS*sr/H),f1=Math.min(F,Math.floor((b+1)*spb*stepS*sr/H));let s=0;for(let f=f0;f<f1;f++)s+=E[0][f]*E[0][f]+E[1][f]*E[1][f]+E[2][f]*E[2][f];Lb.push(s/Math.max(1,f1-f0));}
const q=Lb.slice().sort((p,q)=>p-q)[Math.floor(0.9*(nb-1))]||0,ql=q*Math.pow(10,-2.6),qh=q*Math.pow(10,-1.2),isQ=b=>Lb[b]>=ql&&Lb[b]<=qh;
for(let b=0;b<nb;){
if(!isQ(b)){b++;continue;}
let e=b;while(e<nb&&isQ(e))e++;
const k0=b*spb,n=(e-b)*spb,rb=[];
for(let c=0;c<3;c++)if(c===0?lo:c===1?mi:hi){const z=pk[c].slice(k0,k0+n).sort((p,q)=>p-q);rb.push((z[Math.floor(0.97*(z.length-1))]||0)/ref97[c]);}
const L={takte:[b,e],dB:rb.map(v=>Math.round(20*Math.log10(v+1e-9))),ok:false};if(e-b>=2)leise.push(L);
if(e-b>=2&&rb.length&&Math.min(...rb)>0&&Math.max(...rb)<=2*Math.min(...rb)){
const i0=Math.round(k0*stepS*sr),gm=Math.sqrt(Math.min(...rb)*Math.max(...rb)),hs=spk11bHits(x.subarray(i0,Math.min(x.length,i0+Math.round((n*stepS+0.05)*sr))),sr,stepS,n,fr,{spb,inner:{r97:ref97.map(v=>v*gm),sK,sS}});
const pos=new Map();for(const h of hs){const p=h.k%spb;if(!pos.has(p))pos.set(p,new Set());pos.get(p).add(Math.floor(h.k/spb));}
const rec=new Set([...pos].filter(([p,z])=>z.size>=Math.max(2,0.5*(e-b))).map(([p])=>p)),onRec=hs.filter(h=>rec.has(h.k%spb)).length;
if(hs.length>=2*(e-b)&&onRec>=0.7*hs.length&&hs.filter(h=>h.w!=='k').length>=e-b){
for(let i=out.length-1;i>=0;i--)if(out[i].k>=k0&&out[i].k<k0+n)out.splice(i,1);
for(const h of hs)out.push({k:h.k+k0,w:h.w,v:h.v});L.ok=true;
}
}
b=e;
}
}
out.sort((p,q)=>p.k-q.k);out.info={tK:+tK.toFixed(3),tS:+tS.toFixed(3),kick:!!sK,snare:!!sS,bass:!!Bo,leise};
return out;
}
function spk11bFft(re,im){
const n=re.length;for(let i=1,j=0;i<n;i++){let b=n>>1;for(;j&b;b>>=1)j^=b;j^=b;if(i<j){let t=re[i];re[i]=re[j];re[j]=t;t=im[i];im[i]=im[j];im[j]=t;}}
for(let len=2;len<=n;len<<=1){const a=-2*Math.PI/len,wr=Math.cos(a),wi=Math.sin(a);for(let i=0;i<n;i+=len){let cr=1,ci=0;for(let j=0;j<len/2;j++){const p=i+j,q=p+len/2,tr=re[q]*cr-im[q]*ci,ti=re[q]*ci+im[q]*cr;re[q]=re[p]-tr;im[q]=im[p]-ti;re[p]+=tr;im[p]+=ti;const t=cr*wr-ci*wi;ci=cr*wi+ci*wr;cr=t;}}}
}
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
{const f1=spk11bHits;spk11bHits=function(x,sr,stepS,nStep,fr,ref){const o=f1(x,sr,stepS,nStep,fr,ref);if(ref&&ref.inner)return o;return drum1Fix(x,sr,stepS,o);};}
