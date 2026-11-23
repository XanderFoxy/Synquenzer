function vr1Make(){
'use strict';
const TAU=2*Math.PI,EPS=1e-12,BLK=16384;
const db=p=>10*Math.log10(p+EPS);

function bqC(type,sr,f,q,g){
const w=TAU*f/sr,c=Math.cos(w),al=Math.sin(w)/(2*q),a0=1+al,a1=-2*c,a2=1-al;
let b0,b1,b2;
if(type==='lp'){b0=(1-c)/2;b1=1-c;b2=b0;}
else if(type==='hp'){b0=(1+c)/2;b1=-(1+c);b2=b0;}
else{b0=g*a0+(1-g);b1=g*a1+(1-g)*a1;b2=g*a2+(1-g);}
return[b0/a0,b1/a0,b2/a0,a1/a0,a2/a0];
}
const BW4=[0.5411961,1.3065630];
function bqStep(co,st,v){const o=co[0]*v+st[0];st[0]=co[1]*v-co[3]*o+st[1];st[1]=co[2]*v-co[4]*o;return o;}
function bqRun(co,st,x,y,a,b){
const b0=co[0],b1=co[1],b2=co[2],a1=co[3],a2=co[4];let z1=st[0],z2=st[1];
for(let i=a;i<b;i++){const v=x[i],o=b0*v+z1;z1=b1*v-a1*o+z2;z2=b2*v-a2*o;y[i]=o;}
st[0]=z1<1e-30&&z1>-1e-30?0:z1;st[1]=z2<1e-30&&z2>-1e-30?0:z2;
}
function FFT(n){
const rev=new Uint32Array(n),cs=new Float64Array(n>>1),sn=new Float64Array(n>>1);let bits=0;while((1<<bits)<n)bits++;
for(let i=0;i<n;i++){let r=0;for(let b=0;b<bits;b++)r|=((i>>b)&1)<<(bits-1-b);rev[i]=r;}
for(let i=0;i<n>>1;i++){cs[i]=Math.cos(TAU*i/n);sn[i]=Math.sin(TAU*i/n);}
return(re,im,inv)=>{
for(let i=0;i<n;i++){const j=rev[i];if(j>i){let t=re[i];re[i]=re[j];re[j]=t;t=im[i];im[i]=im[j];im[j]=t;}}
for(let size=2;size<=n;size<<=1){const half=size>>1,step=n/size;
for(let i=0;i<n;i+=size)for(let j=i,k=0;j<i+half;j++,k+=step){
const l=j+half,c=cs[k],s=inv?sn[k]:-sn[k],tr=re[l]*c-im[l]*s,ti=re[l]*s+im[l]*c;
re[l]=re[j]-tr;im[l]=im[j]-ti;re[j]+=tr;im[j]+=ti;}}
};
}
function*part(g,a,s){let r;while(!(r=g.next()).done)yield a+s*r.value;return r.value;}
const med=(a,i0,i1)=>{i0=Math.max(0,i0);i1=Math.min(a.length,i1);if(i1<=i0)return null;const t=Array.prototype.slice.call(a,i0,i1).sort((p,q)=>p-q);return t[t.length>>1];};
const pct=(a,q)=>{const t=Array.from(a).filter(v=>v>-150).sort((p,r)=>p-r);return t.length?t[Math.min(t.length-1,Math.floor(q*t.length))]:-150;};


function*feats(x,sr){
const n=x.length,H=Math.max(32,Math.round(0.005*sr)),nh=Math.ceil(n/H);

const C={lf:BW4.map(q=>bqC('lp',sr,150,q)),mid:[bqC('hp',sr,300,Math.SQRT1_2),bqC('lp',sr,3000,Math.SQRT1_2)],
br:[bqC('hp',sr,1000,Math.SQRT1_2),bqC('lp',sr,6000,Math.SQRT1_2)],hf:BW4.map(q=>bqC('hp',sr,5000,q)),sub:BW4.map(q=>bqC('lp',sr,70,q))};
const S={lf:[[0,0],[0,0]],mid:[[0,0],[0,0]],br:[[0,0],[0,0]],hf:[[0,0],[0,0]],sub:[[0,0],[0,0]]};
const F={tot:new Float64Array(nh),lf:new Float64Array(nh),mid:new Float64Array(nh),br:new Float64Array(nh),hf:new Float64Array(nh),sub:new Float64Array(nh)};
const ta=new Float64Array(BLK),tb=new Float64Array(BLK);
const run2=(co,st,src,dst,L)=>{const b0=co[0],b1=co[1],b2=co[2],a1=co[3],a2=co[4];let z1=st[0],z2=st[1];
for(let i=0;i<L;i++){const v=src[i],o=b0*v+z1;z1=b1*v-a1*o+z2;z2=b2*v-a2*o;dst[i]=o;}
st[0]=z1<1e-30&&z1>-1e-30?0:z1;st[1]=z2<1e-30&&z2>-1e-30?0:z2;};
let clip=0,run=0,pk=0;
for(let i0=0;i0<n;i0+=BLK){
const i1=Math.min(n,i0+BLK),L=i1-i0;
for(let i=i0;i<i1;i++){const v=x[i],h=(i/H)|0,av=v<0?-v:v;if(av>pk)pk=av;if(av>=0.998){run++;if(run===2)clip++;}else run=0;F.tot[h]+=v*v;ta[i-i0]=v;}
for(const k of['lf','mid','br','hf','sub']){
run2(C[k][0],S[k][0],ta,tb,L);run2(C[k][1],S[k][1],tb,tb,L);
const A=F[k];let h=(i0/H)|0,e=(h+1)*H-i0,acc=0;
for(let i=0;i<L;i++){if(i===e){A[h]+=acc;acc=0;h++;e+=H;}const v=tb[i];acc+=v*v;}A[h]+=acc;
}
yield i1/n;
}

const nf=Math.max(1,nh-1),R={},w=1/(2*H);
for(const k of['tot','lf','mid','br','hf','sub']){const a=F[k],o=new Float64Array(nf);for(let j=0;j<nf;j++)o[j]=db((a[j]+(a[j+1]||0))*w);R[k]=o;}
return{H,nh,nf,F,R,clip,pk,sr,n};
}


function*humFind(x,sr,Fe){
const D=Math.max(1,Math.floor(sr/2600)),sd=sr/D,L=BW4.map(q=>bqC('lp',sr,1100,q)),s0=[0,0],s1=[0,0];
let a=0,b=Math.min(x.length,Math.round(10*sr));const want=Math.round(10*sr);
if(b>want&&Fe){
const fpS=sr/Fe.H,W=Math.round(10*fpS),st=Math.max(1,Math.round(fpS));let best=1e9;
for(let j=0;j+W<=Fe.nf;j+=st){let s=0;for(let q=j;q<j+W;q+=4)s+=Fe.R.tot[q];if(s<best){best=s;a=Math.round(j*Fe.H);}}
b=Math.min(x.length,a+want);
}
const pre=Math.min(a,Math.round(0.2*sr)),M=Math.floor((b-a)/D),xd=new Float64Array(M);
let k=0;for(let i=a-pre;i<b&&k<M;i++){const v=bqStep(L[1],s1,bqStep(L[0],s0,x[i]));if(i>=a&&(i-a)%D===0)xd[k++]=v;}
let ws=0;for(let i=0;i<M;i++){const w=0.5-0.5*Math.cos(TAU*i/M);xd[i]*=w;ws+=w;}
yield 0.2;
const P=f=>{const c=2*Math.cos(TAU*f/sd);let p1=0,p2=0;for(let i=0;i<M;i++){const s=xd[i]+c*p1-p2;p2=p1;p1=s;}return p1*p1+p2*p2-c*p1*p2;};
const T=M/sd,off=Math.max(1.5,3/Math.max(0.5,T)),KH=7,KM=Math.min(16,Math.floor((sd/2-40)/60));
const res={};
let step=0;
for(const base of[50,60]){
let bf=base,bs=-1;


for(let f=base-2;f<=base+2+1e-9;f+=0.05){let s=0;for(let h=1;h<=KH;h++){const c=db(P(h*f))-db((P(h*f-off)+P(h*f+off))/2);s+=(c>30?30:c>0?c:0)/h;}if(s>bs){bs=s;bf=f;}if(++step%8===0)yield 0.2+0.6*step/170;}

const HS=[];for(let h=1;h<=KH;h++){const c=db(P(h*bf))-db((P(h*bf-off)+P(h*bf+off)+P(h*bf-off*1.7)+P(h*bf+off*1.7))/4);if(c>=10)HS.push(h);}if(!HS.length)HS.push(1);
let f1=bf;bs=-1;const sc=f=>{let s=0;for(const h of HS)s+=P(h*f);return s;};
for(let f=bf-0.1;f<=bf+0.1+1e-9;f+=0.005){const s=sc(f);if(s>bs){bs=s;f1=f;}}
const ym=sc(f1-0.005),y0=bs,yp=sc(f1+0.005),den=ym-2*y0+yp;if(den<0)f1+=0.005*0.5*(ym-yp)/den;
const rk=[],amp=[];
for(let h=1;h<=KM;h++){const pc=P(h*f1),nb=(P(h*f1-off)+P(h*f1+off)+P(h*f1-off*1.7)+P(h*f1+off*1.7))/4;rk.push(db(pc)-db(nb));amp.push(2*Math.sqrt(pc)/ws);}
res[base]={f0:f1,rk,amp,score:rk.slice(0,KH).reduce((s,v)=>s+Math.min(30,Math.max(0,v)),0)};
}
const B=res[50].score>=res[60].score?res[50]:res[60],base=B===res[50]?50:60;
let n=0;for(let h=0;h<B.rk.length;h++)if(B.rk[h]>=10)n=h+1;

const hits=B.rk.slice(0,KH).filter(v=>v>=10).length,on=(hits>=2&&Math.max(B.rk[0],B.rk[1])>=10)||(B.rk[0]>=15&&Math.abs(B.f0-base)<=0.5);
let hp=0;for(let h=0;h<n;h++)if(B.rk[h]>=10)hp+=B.amp[h]*B.amp[h]/2;
return{on,base,f0:+B.f0.toFixed(4),n:on?Math.max(2,n):0,rk:B.rk.map(v=>+v.toFixed(1)),db:on?+db(hp).toFixed(1):null,sec:+T.toFixed(1)};
}


const HQ=60;
function humCoefs(sr,h){
const out=[],f0=h.f0||50,n=Math.max(1,Math.min(16,h.n||7)),d=h.depth!=null?h.depth:-30,q=h.q||HQ;
for(let k=1;k<=n;k++){const f=k*f0;if(f>=sr*0.45)break;const dk=k<=7?d:d*(1-0.5*(k-7)/9);const qk=q*Math.sqrt(k);out.push({f,q:qk,db:dk,c:bqC('kerbe',sr,f,qk,Math.pow(10,dk/20))});}
return out;
}
function*hum(x,y,sr,h){
const K=humCoefs(sr,h),S=K.map(()=>[0,0]),n=x.length;
for(let i0=0;i0<n;i0+=BLK){const i1=Math.min(n,i0+BLK);for(let k=0;k<K.length;k++)bqRun(K[k].c,S[k],k?y:x,y,i0,i1);if(!K.length)y.set(x.subarray(i0,i1),i0);yield i1/n;}
return K.map(k=>({f:+k.f.toFixed(3),db:+k.db.toFixed(1),q:k.q}));
}

function*hp(x,y,sr,fc){
const c=bqC('hp',sr,fc||80,Math.SQRT1_2),n=x.length,b0=c[0],b1=c[1],b2=c[2],a1=c[3],a2=c[4];let s=[0,0];
for(let i0=0;i0<n;i0+=BLK){const i1=Math.min(n,i0+BLK);bqRun(c,s,x,y,i0,i1);yield 0.5*i1/n;}
let z1=0,z2=0;
for(let i1=n;i1>0;i1-=BLK){const i0=Math.max(0,i1-BLK);for(let i=i1-1;i>=i0;i--){const v=y[i],o=b0*v+z1;z1=b1*v-a1*o+z2;z2=b2*v-a2*o;y[i]=o;}yield 0.5+0.5*(n-i0)/n;}
}


function plopFind(Fe,o){
o=o||{};const sens=o.sens!=null?o.sens:8,thr=6+(10-sens)*1.5,R=Fe.R,nf=Fe.nf,fps=Fe.sr/Fe.H;


const LF=R.sub||R.lf,own=o.own!=null?o.own:-10,lvl=o.lvl!=null?o.lvl:-20;
const r=new Float64Array(nf);for(let j=0;j<nf;j++)r[j]=LF[j]-R.mid[j];
const flo=pct(LF,0.1),top=pct(R.tot,0.99),B0=Math.round(0.25*fps),B1=Math.round(0.03*fps),A0=Math.round(0.1*fps),A1=Math.round(0.3*fps);
const ex=new Float64Array(nf),cand=new Uint8Array(nf),LB=new Float64Array(nf);
for(let j=0;j<nf;j++){
if(LF[j]<flo+15||LF[j]<top+lvl||LF[j]<R.tot[j]+own)continue;
const rb=med(r,j-B0,j-B1),ra=med(r,j+A0,j+A1),lb=med(LF,j-B0,j-B1),la=med(LF,j+A0,j+A1);
const base=rb==null?ra:ra==null?rb:Math.max(rb,ra),lbase=lb==null?la:la==null?lb:Math.max(lb,la);
if(base==null)continue;


ex[j]=LF[j]-lbase;LB[j]=lbase;if(ex[j]>=thr+(o.rise!=null?o.rise:6))cand[j]=1;
}
const ev=[];
for(let j=0;j<nf;j++){
if(!cand[j])continue;let e=j,mx=ex[j];while(e+1<nf&&(cand[e+1]||(e+6<nf&&cand.subarray(e+2,e+7).some(Boolean)))){e++;if(ex[e]>mx)mx=ex[e];}
const dur=(e-j+2)/fps;


let q0=j,q1=e;const lbE=Math.min(LB[j]||0,LB[e]||0)+6;const gm=o.gmax!=null?o.gmax:1;while(q0>0&&j-q0<gm&&LF[q0-1]>=lbE)q0--;while(q1+1<nf&&q1-e<gm&&LF[q1+1]>=lbE)q1++;

if(dur>=0.02&&dur<=0.13)ev.push({t0:q0*Fe.H/Fe.sr,t1:(q1+2)*Fe.H/Fe.sr,s0:q0*Fe.H,s1:Math.min(Fe.n,(q1+2)*Fe.H),c0:j*Fe.H,c1:Math.min(Fe.n,(e+2)*Fe.H),exDb:+mx.toFixed(1)});
j=e;
}
return ev;
}



function lpZero(x,a,b,sr,fc){const L=b-a,y=new Float64Array(L);for(let i=0;i<L;i++)y[i]=x[a+i];
for(const q of BW4){const c=bqC('lp',sr,fc,q);let s=[0,0];for(let i=0;i<L;i++)y[i]=bqStep(c,s,y[i]);s=[0,0];for(let i=L-1;i>=0;i--)y[i]=bqStep(c,s,y[i]);}
return y;}
function arCoef(z,segs,p){const r=new Float64Array(p+1);for(const[a,b]of segs)for(let k=0;k<=p;k++){let s=0;for(let i=a+k;i<b;i++)s+=z[i]*z[i-k];r[k]+=s;}
r[0]*=1+1e-6;const A=new Float64Array(p+1),T=new Float64Array(p+1);A[0]=1;let E=r[0]+EPS;
for(let m=1;m<=p;m++){let acc=r[m];for(let k=1;k<m;k++)acc+=A[k]*r[m-k];const kk=-acc/E;T.set(A);for(let k=1;k<m;k++)A[k]=T[k]+kk*T[m-k];A[m]=kk;E*=1-kk*kk;if(E<=0)break;}
return A;}



function lsar(z,g0,g1,A){const p=A.length-1,m=g1-g0,W=p+1,M=new Float64Array(m*W),v=new Float64Array(m);
for(let t=g0;t<g1+p;t++){const cu=[],cv=[];let b=0;for(let k=0;k<=p;k++){const i=t-k;if(i<0||i>=z.length)continue;if(i>=g0&&i<g1){cu.push(i-g0);cv.push(A[k]);}else b+=A[k]*z[i];}
for(let u=0;u<cu.length;u++){v[cu[u]]-=cv[u]*b;for(let w=0;w<cu.length;w++)if(cu[w]<=cu[u])M[cu[u]*W+cu[u]-cu[w]]+=cv[u]*cv[w];}}
for(let i=0;i<m;i++)M[i*W]+=1e-9;
for(let j=0;j<m;j++){let d=M[j*W];for(let k=Math.max(0,j-p);k<j;k++)d-=M[j*W+j-k]*M[j*W+j-k];d=Math.sqrt(Math.max(d,1e-18));M[j*W]=d;
for(let i=j+1;i<Math.min(m,j+W);i++){let s=M[i*W+i-j];for(let k=Math.max(0,i-p);k<j;k++)s-=M[i*W+i-k]*M[j*W+j-k];M[i*W+i-j]=s/d;}}
for(let i=0;i<m;i++){let s=v[i];for(let k=Math.max(0,i-p);k<i;k++)s-=M[i*W+i-k]*v[k];v[i]=s/M[i*W];}
for(let i=m-1;i>=0;i--){let s=v[i];for(let k=i+1;k<Math.min(m,i+W);k++)s-=M[k*W+k-i]*v[k];v[i]=s/M[i*W];}
return v;}
function plopCut(y,sr,E,cut){
const M=Math.min(2048,Math.round(0.045*sr)),seg=[[E.s0-Math.round(0.02*sr)-M,E.s0-Math.round(0.02*sr)],[E.s1+Math.round(0.02*sr),E.s1+Math.round(0.02*sr)+M]].filter(([p,q])=>p>=0&&q<=y.length);
if(!seg.length)return cut;let bf=0,bp=0,tot=0;
for(let f=90;f<=400;f+=8){const c=2*Math.cos(TAU*f/sr);let pw=0;for(const[p]of seg){let p1=0,p2=0;for(let i=0;i<M;i++){const s=y[p+i]*(0.5-0.5*Math.cos(TAU*i/M))+c*p1-p2;p2=p1;p1=s;}pw+=p1*p1+p2*p2-c*p1*p2;}tot+=pw;if(pw>bp){bp=pw;bf=f;}}
if(!bf||bp<4*tot/39)return cut;

return Math.max(120,Math.min(cut,0.8*bf));
}



function plopSin(z,g0,g1,sd,cut){
const W=Math.max(12,Math.round((plopSin.W||0.025)*sd)),out=new Float64Array(g1-g0);
const fit=(a,b,f)=>{const w=TAU*f/sd;let cc=0,ss=0,cs=0,zc=0,zs=0,zz=0;
for(let i=a;i<b;i++){const c=Math.cos(w*(i-a)),s=Math.sin(w*(i-a)),v=z[i];cc+=c*c;ss+=s*s;cs+=c*s;zc+=v*c;zs+=v*s;zz+=v*v;}
const d=cc*ss-cs*cs||1e-12,A=(zc*ss-zs*cs)/d,B=(zs*cc-zc*cs)/d;return{R:Math.hypot(A,B),ph:Math.atan2(B,A),w,e:A*zc+B*zs,zz};};
const side=(a,b,at)=>{if(a<0||b>z.length)return null;let bf=0,be=-1,zz=0;
for(let f=90;f<=Math.min(420,cut*1.1);f+=1){const r=fit(a,b,f);zz=r.zz;if(r.e>be){be=r.e;bf=f;}}
for(let f=bf-0.9;f<=bf+0.9;f+=0.1){const r=fit(a,b,f);if(r.e>be){be=r.e;bf=f;}}
if(!(be>0.3*zz))return{f:bf,H:[],zz};
const H=[];for(let h=1;h*bf<Math.min(cut*1.3,0.45*sd);h++){const r=fit(a,b,h*bf);H.push({R:r.R,th:r.w*(at-a)-r.ph,w:r.w});}
return{f:bf,H,zz};};
const Ls=side(g0-W,g0,g0-1),Rs=side(g1,g1+W,g1),T=g1-(g0-1);
if(!Ls||!Rs)return Float64Array.from(z.subarray(g0,g1)).fill(0);
const nh=Math.max(Ls.H.length,Rs.H.length);
for(let h=0;h<nh;h++){
let l=Ls.H[h],r=Rs.H[h];if(!l&&!r)continue;
if(!l)l={R:0,w:r.w,th:r.th-r.w*T};if(!r)r={R:0,w:l.w,th:l.th+l.w*T};
const M=Math.round(((l.th+l.w*T-r.th)+(r.w-l.w)*T/2)/TAU),x=r.th+TAU*M-l.th-l.w*T,yv=r.w-l.w,al=3*x/(T*T)-yv/T,be=-2*x/(T*T*T)+yv/(T*T);
const fade=!l.R||!r.R?Math.max(1,0.005*sd):0;
for(let t=1;t<T;t++){const th=l.th+l.w*t+al*t*t+be*t*t*t;
const A=fade?(l.R?l.R*Math.exp(-t/fade):r.R*Math.exp(-(T-t)/fade)):l.R+(r.R-l.R)*t/T;out[t-1]+=A*Math.cos(th);}
}
return out;
}





function plopFit(z,g0,g1,sd,cut,hb,D,sr){
const W=Math.max(12,Math.round(0.025*sd)),Lg=g1-g0;if(g0-W<0||g1+W>z.length)return null;
const fit1=(a,b,f)=>{const w=TAU*f/sd;let cc=0,ss=0,cs=0,zc=0,zs=0,zz=0;
for(let i=a;i<b;i++){const c=Math.cos(w*(i-a)),s=Math.sin(w*(i-a)),v=z[i];cc+=c*c;ss+=s*s;cs+=c*s;zc+=v*c;zs+=v*s;zz+=v*v;}
const d=cc*ss-cs*cs||1e-12,A=(zc*ss-zs*cs)/d,B=(zs*cc-zc*cs)/d;return{e:A*zc+B*zs,zz};};
const f0of=(a,b)=>{let bf=0,be=-1,zz=0;for(let f=90;f<=Math.min(420,cut*1.1);f+=1){const r=fit1(a,b,f);zz=r.zz;if(r.e>be){be=r.e;bf=f;}}
for(let f=bf-0.9;f<=bf+0.9;f+=0.1){const r=fit1(a,b,f);if(r.e>be){be=r.e;bf=f;}}

for(const dv of[3,2]){const f2=bf/dv;if(f2<70)continue;let b2=-1,ff=f2;for(let f=f2-1.5;f<=f2+1.5;f+=0.1){const r=fit1(a,b,f);if(r.e>b2){b2=r.e;ff=f;}}if(b2>=(plopFit.OCT||0.12)*be)return{f:ff,on:be>0.3*zz,zz};}
return{f:bf,on:be>0.3*zz,zz};};
const L=f0of(g0-W,g0),R=f0of(g1,g1+W);if(!L.on&&!R.on)return null;
let fL=L.on?L.f:R.f,fR=R.on?R.f:L.f;if(fR/fL>1.3||fL/fR>1.3){if(L.zz>=R.zz)fR=fL;else fL=fR;}
const fm=(fL+fR)/2,m=Math.max(2,Math.ceil((plopFit.MF||300)/fm)),K=Math.floor(Math.min(cut*1.3,0.45*sd)/fm);if(K<1)return null;


const jA=g0-W,jB=g1+W,cA=(g0-W/2)*D,cB=(g1+W/2)*D,Tw=Math.round(Math.min(0.035,Math.max(0.012,(plopFit.TW||6)/fm))*sr),h2=Tw>>1;
const s0=jA*D-h2,s1=jB*D+h2;if(s0<0||s1>=hb.length)return null;
const th=new Float64Array(s1-s0+1);{let ph=0;for(let s=s0;s<=s1;s++){const q=Math.min(1,Math.max(0,(s-cA)/(cB-cA)));ph+=TAU*m*(fL+(fR-fL)*q)/sr;th[s-s0]=ph;}}
const tc=new Float64Array(th.length),ts=new Float64Array(th.length);for(let i=0;i<th.length;i++){tc[i]=Math.cos(th[i]);ts[i]=Math.sin(th[i]);}
const wn=new Float64Array(2*h2+1);for(let i=-h2;i<=h2;i++)wn[i+h2]=0.5+0.5*Math.cos(Math.PI*i/(h2+1));
const NJ=jB-jA,Ph=new Float64Array(NJ),Am=new Float64Array(NJ),Dr=new Float64Array(NJ);let amx=0;
for(let j=0;j<NJ;j++){const c=(jA+j)*D;let ur=0,ui=0;for(let i=-h2,q=c-h2-s0;i<=h2;i++,q++){const v=hb[c+i]*wn[i+h2];ur+=v*tc[q];ui-=v*ts[q];}
Dr[j]=Math.atan2(ui,ur);Am[j]=Math.hypot(ur,ui);if(Am[j]>amx)amx=Am[j];}
if(!(amx>0))return null;

{let prev=0,acc=0,have=false;for(let j=0;j<NJ;j++){const c=(jA+j)*D;if(Am[j]>=amx/8){if(have){let dd=Dr[j]-prev;dd-=TAU*Math.round(dd/TAU);acc+=dd;}else{acc=Dr[j];have=true;}prev=Dr[j];}Ph[j]=(th[c-s0]+acc)/m;Am[j]/=amx;}}

let aL=0,aR=0;for(let j=0;j<W;j++){aL+=Am[j]/W;aR+=Am[NJ-1-j]/W;}const fl=plopFit.EV===0?0:Math.min(aL,aR)*(plopFit.EF||1);
const Ae=Am.map(v=>Math.max(v,fl));

const Q=Math.max(1,Math.floor(2*80*Lg/sd)),np=6*K,nc=np+Q+1;
const col=(j,c)=>{const t=jA+j;if(c<np){const k=1+Math.floor(c/6),r=c%6,p=r>>1,tau=(t-(g0-1))/(Lg+1),a=k*Ph[j];return(r&1?-Math.sin(a):Math.cos(a))*(p?Math.pow(tau,p):1)*(plopFit.NOA?1:Ae[j]);}
const q=c-np;return Math.cos(Math.PI*q*(t-g0+0.5)/Lg);};

const solve=(M,v,n)=>{for(let i=0;i<n;i++){let p=i;for(let r=i+1;r<n;r++)if(Math.abs(M[r*n+i])>Math.abs(M[p*n+i]))p=r;
if(p!==i){for(let c=0;c<n;c++){const t=M[i*n+c];M[i*n+c]=M[p*n+c];M[p*n+c]=t;}const t=v[i];v[i]=v[p];v[p]=t;}
const d=M[i*n+i]||1e-18;for(let r=i+1;r<n;r++){const f=M[r*n+i]/d;if(!f)continue;for(let c=i;c<n;c++)M[r*n+c]-=f*M[i*n+c];v[r]-=f*v[i];}}
for(let i=n-1;i>=0;i--){let s=v[i];for(let c=i+1;c<n;c++)s-=M[i*n+c]*v[c];v[i]=s/(M[i*n+i]||1e-18);}return v;};
const edge=(j0,j1,on)=>{const c=new Float64Array(2*K);if(!on)return c;const n=2*K,M=new Float64Array(n*n),v=new Float64Array(n);
for(let j=j0;j<j1;j++){const b=[];const am=plopFit.NOA?1:Ae[j];for(let k=1;k<=K;k++){b.push(am*Math.cos(k*Ph[j]),-am*Math.sin(k*Ph[j]));}const zz=z[jA+j];
for(let u=0;u<n;u++){v[u]+=b[u]*zz;for(let w=0;w<n;w++)M[u*n+w]+=b[u]*b[w];}}
for(let u=0;u<n;u++)M[u*n+u]+=1e-9*(M[u*n+u]+1e-12);return solve(M,v,n);};
const cl=edge(0,W,L.on),cr=edge(NJ-W,NJ,R.on);

const pri=new Float64Array(nc),lam=new Float64Array(nc),G=new Float64Array(nc*nc),rhs=new Float64Array(nc),J0=g0-jA,J1=g1-jA;
for(let k=0;k<K;k++)for(let r=0;r<2;r++){const a=cl[2*k+r],b=cr[2*k+r];pri[6*k+r]=a;pri[6*k+2+r]=b-a;pri[6*k+4+r]=0;}
const BB=new Float64Array(nc*nc),Bz=new Float64Array(nc),cv=new Float64Array(nc);let zz=0;
for(let j=J0;j<J1;j++){for(let c=0;c<nc;c++)cv[c]=col(j,c);const v=z[jA+j];zz+=v*v;for(let u=0;u<nc;u++){Bz[u]+=cv[u]*v;for(let w=0;w<nc;w++)BB[u*nc+w]+=cv[u]*cv[w];}}
const reg=(lm)=>{G.set(BB);rhs.set(Bz);for(let u=0;u<nc;u++){G[u*nc+u]+=lm[u]+1e-9*(BB[u*nc+u]+1e-12);rhs[u]+=lm[u]*pri[u];}return solve(G,rhs,nc);};
const th0=Float64Array.from(reg(lam));let rss=0;
for(let j=J0;j<J1;j++){let s=0;for(let c=0;c<nc;c++)s+=th0[c]*col(j,c);const d=z[jA+j]-s;rss+=d*d;}

let eg=0,ee=0;for(let j=J0;j<J1;j++)eg+=z[jA+j]*z[jA+j];for(let j=0;j<W;j++)ee+=z[jA+j]*z[jA+j]+z[jA+NJ-1-j]*z[jA+NJ-1-j];
const rho=Math.max(1,(eg/Lg)/(ee/(2*W)+1e-20)),sig=rss/Math.max(1,Lg-nc)*(plopFit.SG||1)*Math.pow(rho,plopFit.RH!=null?plopFit.RH:1.6);
for(let k=0;k<K;k++){const A=Math.hypot(cl[2*k],cl[2*k+1]),B=Math.hypot(cr[2*k],cr[2*k+1]),dd=Math.hypot(cr[2*k]-cl[2*k],cr[2*k+1]-cl[2*k+1]);
const t2=Math.pow((plopFit.PA||0.3)*Math.max(A,B),2)+dd*dd+1e-12;for(let c=6*k;c<6*k+6;c++)lam[c]=sig/t2*(c-6*k>=4?(plopFit.P2||1):1);}
const th1=reg(lam),out=new Float64Array(Lg);
for(let j=J0;j<J1;j++){let s=0;for(let c=0;c<np;c++)s+=th1[c]*col(j,c);out[j-J0]=s;}

if(plopFit.LIM!==0){const hw=Math.max(2,Math.round((plopFit.LW||0.003)*sd)),gn=new Float64Array(Lg);
for(let j=0;j<Lg;j++){let eo=0,ez=0;for(let d=-hw;d<=hw;d++){const w=0.5+0.5*Math.cos(Math.PI*d/(hw+1)),q=j+d;const o=q>=0&&q<Lg?out[q]:0,v=z[g0+q]||0;eo+=w*o*o;ez+=w*v*v;}gn[j]=eo>ez?Math.sqrt(ez/eo):1;}
for(let j=0;j<Lg;j++)out[j]*=gn[j];}
return out;
}
function*plop(y,sr,ev,o){
o=o||{};const cut=o.cut||250,g=Math.pow(10,-0.48*(o.str!=null?o.str:50)/20),D=Math.max(1,Math.floor(sr/1100)),n=y.length,out=[];
const C=Math.round((o.ctx||0.3)*sr),mg=Math.round((o.mg!=null?o.mg:0.01)*sr),p=o.p||40;
for(let e=0;e<ev.length;e++){

const E0=ev[e],E=o.grow===0&&E0.c0!=null?{t0:E0.t0,t1:E0.t1,exDb:E0.exDb,s0:E0.c0,s1:E0.c1}:E0,a=Math.max(0,E.s0-mg-C),b=Math.min(n,E.s1+mg+C),ce=o.cut||o.fix===1?cut:o.fix===0?plopCut(y,sr,E,cut):(pc=>pc>=160?pc:cut)(plopCut(y,sr,E,cut)),low=lpZero(y,a,b,sr,ce),L=Math.floor((b-a)/D),z=new Float64Array(L);


for(let j=0;j<L;j++)z[j]=low[j*D];
const g0=Math.max(1,Math.floor((E.s0-mg-a)/D)),g1=Math.min(L-1,Math.ceil((E.s1+mg-a)/D)+1);
if(g1-g0<2||g0<p||L-g1<p){out.push({t0:+E.t0.toFixed(4),t1:+E.t1.toFixed(4),exDb:E.exDb,redDb:0});continue;}
let zu=o.ar?lsar(z,g0,g1,arCoef(z,[[p,g0],[g1+p,L]].filter(s=>s[1]-s[0]>p),p)):null;
if(!zu&&o.fit!==0){const hb=new Float64Array(b-a);for(let i=0;i<hb.length;i++)hb[i]=y[a+i]-low[i];zu=plopFit(z,g0,g1,sr/D,ce,hb,D,sr);}
if(!zu)zu=plopSin(z,g0,g1,sr/D,ce);
const cd=new Float64Array(L);let e0=0,e1=0;for(let j=g0;j<g1;j++){cd[j]=(zu[j-g0]-z[j])*(1-g);e0+=z[j]*z[j];e1+=(z[j]+cd[j])*(z[j]+cd[j]);}
const q0=(g0-2)*D,q1=Math.min(b-a,(g1+2)*D);
for(let i=q0;i<q1;i++){const u=i/D,j=Math.floor(u),f=u-j,c0=cd[j-1]||0,c1=cd[j]||0,c2=cd[j+1]||0,c3=cd[j+2]||0;
const v=c1+0.5*f*(c2-c0+f*(2*c0-5*c1+4*c2-c3+f*(3*(c1-c2)+c3-c0)));if(v!==0)y[a+i]+=v;}
out.push({t0:+E.t0.toFixed(4),t1:+E.t1.toFixed(4),exDb:E.exDb,redDb:+(db(e0)-db(e1)).toFixed(1)});
yield(e+1)/ev.length;
}
return out;
}




function*clickScan(x,sr,o,wins){
o=o||{};const sens=Math.max(1,Math.min(10,o.sens!=null?o.sens:4)),mouth=o.art!=='tief',n=x.length;
const J=Math.max(8,Math.round(0.0005*sr)),nj=Math.ceil(n/J)+1,N=2048,p=10,PR=256+p;
const fe=new Float32Array(nj),fh=new Float32Array(nj),done=new Uint8Array(Math.ceil(n/N));
const blocks=[];if(!wins)for(let b=0;b*N<n;b++)blocks.push(b);else for(const[a,e]of wins)for(let b=Math.max(0,Math.floor(a/N));b*N<Math.min(n,e);b++)if(!done[b]){done[b]=1;blocks.push(b);}
const C=mouth?BW4.map(q=>bqC('hp',sr,2000,q)):[bqC('hp',sr,60,Math.SQRT1_2)],h=new Float64Array(N+PR),hw=new Float64Array(N),wn=new Float64Array(N),r=new Float64Array(p+1),A=new Float64Array(p+1),T=new Float64Array(p+1);
for(let i=0;i<N;i++)wn[i]=0.5-0.5*Math.cos(TAU*(i+0.5)/N);
for(let bi=0;bi<blocks.length;bi++){
const s=blocks[bi]*N,e=Math.min(n,s+N),a=Math.max(0,s-PR),L=e-a,o0=s-a;
for(let i=0;i<L;i++)h[i]=x[a+i];
for(const c of C){const st=[0,0];bqRun(c,st,h,h,0,L);}
const M=L-o0;for(let i=0;i<M;i++)hw[i]=h[o0+i]*wn[i];
for(let k=0;k<=p;k++){let q=0;for(let i=k;i<M;i++)q+=hw[i]*hw[i-k];r[k]=q;}
r[0]*=1+1e-4;A.fill(0);A[0]=1;let E=r[0]+EPS;
for(let m=1;m<=p&&E>EPS;m++){let acc=r[m];for(let k=1;k<m;k++)acc+=A[k]*r[m-k];const kk=-acc/E;T.set(A);for(let k=1;k<m;k++)A[k]=T[k]+kk*T[m-k];A[m]=kk;E*=1-kk*kk;}

const A1=A[1],A2=A[2],A3=A[3],A4=A[4],A5=A[5],A6=A[6],A7=A[7],A8=A[8],A9=A[9],A10=A[10];
let j=(s/J)|0,eJ=(j+1)*J-a,me=fe[j],mh=fh[j];
for(let i=o0;i<L;i++){
if(i===eJ){fe[j]=me;fh[j]=mh;j++;eJ+=J;me=fe[j];mh=fh[j];}
const hi=h[i],q=hi+A1*h[i-1]+A2*h[i-2]+A3*h[i-3]+A4*h[i-4]+A5*h[i-5]+A6*h[i-6]+A7*h[i-7]+A8*h[i-8]+A9*h[i-9]+A10*h[i-10];
const aq=q<0?-q:q,ah=hi<0?-hi:hi;if(aq>me)me=aq;if(ah>mh)mh=ah;
}
fe[j]=me;fh[j]=mh;
if((bi&63)===63)yield 0.9*(bi+1)/blocks.length;
}

const MED=o.med!==false,K1=(o.k1b!=null?o.k1b:8)-0.6*sens,K2=3.0-0.18*sens,W=Math.round(0.012*sr/J),I=Math.round(0.025*sr/J),BIG=o.big!=null?o.big:30,MX=Math.round(0.005*sr/J),X3=Math.round(0.003*sr/J),ev=[];
const sel=new Uint8Array(nj);if(!wins)sel.fill(1);else for(const[a,e]of wins)for(let j=Math.max(0,Math.floor(a/J));j<Math.min(nj,Math.ceil(e/J));j++)sel[j]=1;
const tmp=new Float64Array(256),medx=(arr,j0,j1,x0,x1)=>{let c=0;for(let j=Math.max(0,j0);j<Math.min(nj,j1)&&c<256;j++){if(j>=x0&&j<=x1)continue;tmp[c++]=arr[j];}if(!c)return 0;const t=tmp.subarray(0,c).sort();return t[c>>1];};
const mean=(arr,j0,j1,x0,x1)=>{let s=0,c=0;for(let j=Math.max(0,j0);j<Math.min(nj,j1);j++){if(j>=x0&&j<=x1)continue;s+=arr[j];c++;}return c?s/c:0;};




/* VOX2-BEGIN: puls-synchroner Vergleich (Klicks in Vokalen) */
const PS=o.ps!=null?o.ps:1,PL0=Math.max(2,Math.round(0.0025*sr/J)),PL1=Math.round(0.012*sr/J),vx2Per=(arr,j,xl,xr)=>{let bL=0,bc=0;const cc=new Float64Array(PL1+1);for(let L=PL0;L<=PL1;L++){let sxy=0,sxx=0,syy=0;for(let q=Math.max(0,j-I);q+L<Math.min(nj,j+I+1);q++){if((q>=xl&&q<=xr)||(q+L>=xl&&q+L<=xr))continue;const u=arr[q],w=arr[q+L];sxy+=u*w;sxx+=u*u;syy+=w*w;}const c=sxy/Math.sqrt(sxx*syy+1e-30);cc[L]=c;if(c>bc){bc=c;bL=L;}}for(let L=PL0;L<bL;L++)if(cc[L]>=0.85*bc&&cc[L]>=cc[L-1]&&cc[L]>=cc[L+1]){bL=L;break;}return{L:bL,c:bc};},vx2At=(arr,k)=>{let r=0;for(let q=k-1;q<=k+1;q++)if(q>=0&&q<nj&&arr[q]>r)r=arr[q];return r;},vx2Ref=(arr,j,L)=>Math.max(vx2At(arr,j-L),vx2At(arr,j+L),vx2At(arr,j-2*L),vx2At(arr,j+2*L));
const vx2Acc=(arr,j,v,n2,k2,xl,xr)=>{if(!(PS>0)||!(v>(o.psN||1.4)*n2))return false;const P=vx2Per(arr,j,xl,xr);return P.c>=(o.psC||0.5)&&v>(o.psK||k2+1)*vx2Ref(arr,j,P.L);};
const vx2Rej=j=>{if(!(PS>0)||wins)return false;const P=vx2Per(fh,j,j-2,j+2);if(!(P.c>=(o.psC||0.5))||P.L*J<(o.psL!=null?o.psL:0.005)*sr)return false;return fh[j]<(o.psR||0.9)*Math.max(vx2At(fh,j-P.L),vx2At(fh,j+P.L));};
/* VOX2-END */
const BQ=o.bq!=null?o.bq:1.2,bigQuiet=(arr,xl,xr,m)=>!(BQ>0)||(MED?mean(arr,xl-W,xr+W+1,xl,xr):m)<=BQ*(MED?m:medx(arr,xl-W,xr+W+1,xl,xr));
const test=(arr,j,k1,k2)=>{const v=arr[j];if(v<2e-4||v<arr[j-1]||v<arr[j+1]||v<arr[j-2]||v<arr[j+2])return null;
let jl=j,jr=j;while(jl>j-MX&&arr[jl-1]>0.25*v)jl--;while(jr<j+MX&&jr+1<nj&&arr[jr+1]>0.25*v)jr++;
const xl=Math.min(jl-2,j-X3),xr=Math.max(jr+2,j+X3);


let n1=0,n2=0,s1=0,s2=0;for(let q=Math.max(1,xl-I);q<Math.min(nj-1,xr+I+1);q++){if(q>=xl&&q<=xr)continue;const u=arr[q];if(u<arr[q-1]||u<arr[q+1])continue;if(u>n1){n2=n1;n1=u;}else if(u>n2)n2=u;if(q>=xl-W&&q<=xr+W){if(u>s1){s2=s1;s1=u;}else if(u>s2)s2=u;}}



let m=-1;
if(!(v>k2*n2)&&!vx2Acc(arr,j,v,n2,k2,xl,xr)/*VOX2*/){if(!(BIG>0&&v>k2*s2))return null;m=(MED?medx:mean)(arr,xl-W,xr+W+1,xl,xr);if(!(v>BIG*m)||!bigQuiet(arr,xl,xr,m))return null;}
if(m<0)m=(MED?medx:mean)(arr,xl-W,xr+W+1,xl,xr);if(!(v>k1*m))return null;return{jl,jr,sc:20*Math.log10(v/(m+EPS))};};
for(let j=2;j<nj-2;j++){
if(!sel[j])continue;
const T1=test(fe,j,K1,K2),T2=T1?null:test(fh,j,K1+1,K2+0.4),Tq=T1||T2;if(!Tq)continue;if(vx2Rej(j))continue;/*VOX2*/
let jl=Tq.jl,jr=Tq.jr;const v=fe[j],m=0;

const hp=Math.max(fh[jl],fh[j]),hm=mean(fh,jl-W,jr+W+1,jl-2,jr+2);
while(jl>j-MX&&fh[jl-1]>Math.max(0.2*hp,3*hm))jl--;while(jr<j+MX&&jr+1<nj&&fh[jr+1]>Math.max(0.2*hp,3*hm))jr++;
if(jl<=j-MX||jr>=j+MX)continue;
if(Math.max(fh[jl],fh[j])<(o.min!=null?o.min:1e-3))continue;

const A0=Math.round(0.002*sr/J),A1=Math.round(0.02*sr/J),eb=mean(fh,jl-A1,jl-A0,-1,-1),ea=mean(fh,jr+A0,jr+A1,-1,-1),onDb=20*Math.log10((ea+EPS)/(eb+EPS));
if(onDb>(o.onset!=null?o.onset:15))continue;
const wmin=Math.max(1,Math.round((o.width!=null?o.width:1)*0.001*sr/J)),pad=Math.max(0,wmin-(jr-jl+1)),mg=Math.round(0.00025*sr);
let s0=Math.max(0,(jl-(pad>>1))*J-mg),s1=Math.min(n,(jr+1+pad-(pad>>1))*J+mg);
if(ev.length&&s0<=ev[ev.length-1].s1+J){const q=ev[ev.length-1];q.s1=Math.max(q.s1,s1);q.sc=Math.max(q.sc,+Tq.sc.toFixed(1));}
else ev.push({s0,s1,t0:+(s0/sr).toFixed(4),t1:+(s1/sr).toFixed(4),sc:+Tq.sc.toFixed(1),how:T1?'rest':'huelle',on:+onDb.toFixed(1)});
j=jr+2;
}
yield 1;
return ev;
}





function clickSpan(z,g0,g1,sr,p,o){
if((o&&o.span===0)||g1-g0>Math.round((o&&o.spanMax!=null?o.spanMax:0.003)*sr))return[g0,g1];
const q=Math.max(4,Math.round(0.00025*sr)),L=z.length,fr=i=>{let s=0;for(let k=i;k<i+q;k++)s+=z[k]*z[k];return s/q;},E=[];
for(let i=Math.max(p,g0-Math.round(0.012*sr));i+q<=g0-Math.round(0.001*sr);i+=q)E.push(fr(i));
for(let i=g1+Math.round(0.003*sr);i+q<=Math.min(L-p,g1+Math.round(0.012*sr));i+=q)E.push(fr(i));
if(E.length<8)return[g0,g1];
E.sort((u,v)=>u-v);let mu=0;for(const e of E)mu+=e;mu/=E.length;





const NZ=o&&o.nz!=null?o.nz:2,md=E[E.length>>1];if(NZ>0&&mu>NZ*md)return[g0,g1];
const nb=o&&o.ref===0?md:mu,T=(o&&o.spanK!=null?o.spanK:4)*nb;
let e1=g1,e0=g0;const mx1=Math.min(g1+Math.round((o&&o.spanR!=null?o.spanR:0.002)*sr),g0+Math.round(0.008*sr),L-2*p),mn0=Math.max(2*p,g0-Math.round((o&&o.spanL!=null?o.spanL:0.0005)*sr));
while(e1+q<=mx1&&fr(e1)>T)e1+=q;
while(e0-q>=mn0&&fr(e0-q)>T)e0-=q;
return[e0,e1,nb];
}
function*click(y,sr,ev,o){
const p=40,C=Math.round(0.02*sr),n=y.length,out=[];
for(let e=0;e<ev.length;e++){
const E=ev[e],a=Math.max(0,E.s0-C-p),b=Math.min(n,E.s1+C+p),L=b-a,z=new Float64Array(L),g0=E.s0-a,g1=E.s1-a;
for(let i=0;i<L;i++)z[i]=y[a+i];
if(g0<2*p||L-g1<2*p||g1-g0>Math.round(0.008*sr)){out.push({t0:E.t0,t1:E.t1,sc:E.sc,redDb:0});continue;}

const lo=o&&o.art==='tief'?null:lpZero(y,a,b,sr,1500);if(lo)for(let i=0;i<L;i++)z[i]-=lo[i];
const[h0,h1,nb]=clickSpan(z,g0,g1,sr,p,o);
let lw=lo;



if(lo&&nb>0&&!(o&&o.lowF===0)){let pz=0;for(let j=h0;j<h1;j++)pz+=z[j]*z[j];pz/=Math.max(1,h1-h0);
if(pz>(o&&o.lowH!=null?o.lowH:100)*nb){lw=lpZero(y,a,b,sr,o&&o.lowF?o.lowF:700);for(let i=0;i<L;i++)z[i]=y[a+i]-lw[i];}}
const A=arCoef(z,[[p,h0],[h1+p,L]].filter(s=>s[1]-s[0]>p),p),zu=lsar(z,h0,h1,A);
if(nb>0&&!(o&&o.cap===0)){let pu=0;for(let j=0;j<zu.length;j++)pu+=zu[j]*zu[j];pu/=Math.max(1,zu.length);const cap=(o&&o.capK!=null?o.capK:2)*nb;
if(pu>cap){const g=Math.sqrt(cap/pu);for(let j=0;j<zu.length;j++)zu[j]*=g;}}
let e0=0,e1=0;for(let j=h0;j<h1;j++){const u=zu[j-h0];e0+=z[j]*z[j];e1+=u*u;y[a+j]=lw?lw[j]+u:u;}
out.push({t0:Math.floor((a+h0)/sr*1e4)/1e4,t1:Math.ceil((a+h1)/sr*1e4)/1e4,sc:E.sc,redDb:+(db(e0)-db(e1)).toFixed(1)});
if((e&15)===15)yield(e+1)/ev.length;
}
return out;
}
function*clicks2(y,sr,o){
o=o||{};const ev1=yield*part(clickScan(y,sr,o),0,0.6),r1=yield*part(click(y,sr,ev1,o),0.6,0.15),C=Math.round(0.03*sr);
const ev2=ev1.length?yield*part(clickScan(y,sr,Object.assign({},o,{sens:Math.min(10,(o.sens!=null?o.sens:4)+1)}),ev1.map(e=>[e.s0-C,e.s1+C])),0.75,0.2):[];
const r2=yield*part(click(y,sr,ev2,o),0.95,0.05);
return{pass1:r1.length,pass2:r2.length,list:r1.concat(r2.map(e=>Object.assign({pass:2},e))).sort((a,b)=>a.t0-b.t0)};
}




function*voicing(x,sr,Fe,mask){
const D=Math.max(1,Math.floor(sr/5500)),sd=sr/D,L=BW4.map(q=>bqC('lp',sr,Math.min(1500,sd*0.3),q)),s0=[0,0],s1=[0,0],n=x.length,M=Math.floor(n/D),xd=new Float32Array(M+1);
for(let i0=0;i0<n;i0+=BLK){const i1=Math.min(n,i0+BLK);for(let i=i0;i<i1;i++){const v=bqStep(L[1],s1,bqStep(L[0],s0,x[i]));if(i%D===0)xd[i/D]=v;}
for(const z of[s0,s1]){if(z[0]<1e-30&&z[0]>-1e-30)z[0]=0;if(z[1]<1e-30&&z[1]>-1e-30)z[1]=0;}yield 0.6*i1/n;}


const W=Math.round(0.04*sd),l0=Math.max(2,Math.floor(sd/1000)),l1=Math.ceil(sd/60),vc=new Float32Array(Fe.nf),P=10,LL=W+l1+P;
const sg=new Float64Array(LL),rs=new Float64Array(LL),hw=new Float64Array(LL),rr=new Float64Array(P+1),Ac=new Float64Array(P+1),Tc=new Float64Array(P+1);
for(let i=0;i<LL;i++)hw[i]=0.5-0.5*Math.cos(TAU*(i+0.5)/LL);
for(let j=0;j<Fe.nf;j++){
if(!mask[j])continue;const a=Math.round((j+1)*Fe.H/D)-(W>>1)-P;if(a<0||a+LL>M)continue;
for(let i=0;i<LL;i++)sg[i]=xd[a+i];
for(let k=0;k<=P;k++){let q=0;for(let i=k;i<LL;i++)q+=sg[i]*hw[i]*sg[i-k]*hw[i-k];rr[k]=q;}
rr[0]*=1+1e-3;Ac.fill(0);Ac[0]=1;let E=rr[0]+EPS;
for(let m=1;m<=P&&E>EPS;m++){let acc=rr[m];for(let k=1;k<m;k++)acc+=Ac[k]*rr[m-k];const kk=-acc/E;Tc.set(Ac);for(let k=1;k<m;k++)Ac[k]=Tc[k]+kk*Tc[m-k];Ac[m]=kk;E*=1-kk*kk;}
for(let i=P;i<LL;i++){let q=0;for(let k=0;k<=P;k++)q+=Ac[k]*sg[i-k];rs[i]=q;}
let e0=0,e1=0;for(let i=P;i<P+W;i++)e0+=rs[i]*rs[i];for(let i=P+l0;i<P+W+l0;i++)e1+=rs[i]*rs[i];
let best=0;for(let l=l0;l<=l1;l++){let q=0;for(let i=P;i<P+W;i++)q+=rs[i]*rs[i+l];const c=q/Math.sqrt(e0*e1+EPS);if(c>best)best=c;if(P+W+l<LL)e1+=rs[P+W+l]*rs[P+W+l]-rs[P+l]*rs[P+l];}
vc[j]=best;
}
yield 1;
return vc;
}
function*breathFind(x,sr,Fe,o){
o=o||{};const sens=o.sens!=null?o.sens:5,R=Fe.R,nf=Fe.nf,fps=sr/Fe.H,sh=(sens-5)*0.8;
const floor=pct(R.tot,0.1),hi=pct(R.tot,0.99),cand=new Uint8Array(nf),loud=new Uint8Array(nf),mask=new Uint8Array(nf);
for(let j=0;j<nf;j++){loud[j]=R.tot[j]>floor+10?1:0;
cand[j]=loud[j]&&R.tot[j]<hi&&R.br[j]-R.tot[j]>-6-sh&&R.lf[j]-R.tot[j]<-14+sh&&R.hf[j]-R.br[j]<-1+sh?1:0;}
for(let j=0;j<nf;j++)if(loud[j])for(let q=Math.max(0,j-36);q<=Math.min(nf-1,j+36);q++)if(cand[q]){mask[j]=1;break;}
const vc=yield*part(voicing(x,sr,Fe,mask),0,0.9),vth=0.45,voiced=j=>j>=0&&j<nf&&loud[j]&&(!mask[j]||vc[j]>vth);
const ev=[],G=4,keep=Math.round(0.02*fps),near=Math.round(0.04*fps);
for(let j=0;j<nf;j++){
if(!cand[j]||voiced(j))continue;let e=j,gap=0;
for(let q=j+1;q<nf;q++){if(cand[q]&&!voiced(q)){e=q;gap=0;}else if(voiced(q)||++gap>G)break;}
let s=j,t=e;while(s<=t&&(()=>{for(let q=s-keep;q<s;q++)if(voiced(q))return true;return false;})())s++;
while(t>=s&&(()=>{for(let q=t+1;q<=t+keep+1;q++)if(voiced(q))return true;return false;})())t--;
j=e;const dur=(t-s+2)/fps;if(dur<0.12||dur>0.9)continue;

const tail=q=>q>=0&&q<nf&&!voiced(q)&&R.tot[q]>floor+4&&R.lf[q]-R.tot[q]<-8&&(()=>{for(let u=q-keep;u<=q+keep;u++)if(voiced(u))return false;return true;})();
for(let k=0;k<24&&tail(s-1);k++)s--;for(let k=0;k<24&&tail(t+1);k++)t++;
let vl=false,vr=false;for(let q=s-near-keep;q<s;q++)if(voiced(q))vl=true;for(let q=t+1;q<=t+near+keep+1;q++)if(voiced(q))vr=true;
if(vl&&vr&&dur<0.3)continue;
const s0=s*Fe.H,s1=Math.min(Fe.n,(t+2)*Fe.H);let pw=0;for(let i=s0;i<s1;i++)pw+=x[i]*x[i];
ev.push({s0,s1,t0:+(s0/sr).toFixed(3),t1:+(s1/sr).toFixed(3),db:+db(pw/Math.max(1,s1-s0)).toFixed(1)});
}
yield 1;
return ev;
}
function*breath(y,sr,ev,o){
o=o||{};const T=o.target!=null?o.target:-40,R=Math.max(1,Math.round(0.01*sr)),out=[];
for(let e=0;e<ev.length;e++){
const E=ev[e],act=E.act||o.act||'leiser',s0=E.s0,s1=E.s1,L=s1-s0;let A=0,B=0,Cc=0,P=0;
const w=i=>{const r=Math.min(1,(i-s0+0.5)/R,(s1-i-0.5)/R);return 0.5-0.5*Math.cos(Math.PI*Math.max(0,r));};
for(let i=s0;i<s1;i++){const v=y[i]*y[i],ww=w(i),u=1-ww;A+=u*u*v;B+=u*ww*v;Cc+=ww*ww*v;P+=v;}
const Ldb=db(P/Math.max(1,L)),Pt=Math.pow(10,T/10)*L;
let g=1;
if(act==='weg')g=0;
else if(act==='leiser'){if(o.mode==='absenken')g=Math.pow(10,-(o.down!=null?o.down:12)/20);else if(P>Pt){const d=B*B-Cc*(A-Pt);g=A>=Pt?0:Math.max(0,Math.min(1,(-B+Math.sqrt(Math.max(0,d)))/(Cc+EPS)));}}
if(g<1)for(let i=s0;i<s1;i++){const ww=w(i);y[i]*=1-ww+g*ww;}
let P2=0;for(let i=s0;i<s1;i++)P2+=y[i]*y[i];
out.push({t0:E.t0,t1:E.t1,act,db:+Ldb.toFixed(1),dbNeu:+db(P2/Math.max(1,L)).toFixed(1),gDb:g>0?+(20*Math.log10(g)).toFixed(1):null});
if((e&7)===7)yield(e+1)/ev.length;
}
return out;
}




function*roomLearn(x,sr){
const n=x.length,H=Math.max(64,Math.round(0.01*sr)),nf=Math.floor(n/H),Lf=new Float64Array(nf);
for(let j=0;j<nf;j++){let s=0;for(let i=j*H;i<(j+1)*H;i++)s+=x[i]*x[i];Lf[j]=db(s/H);}
yield 0.4;


const WN=20,cands=[];
const tw=new Float64Array(WN);


const dig=pct(Lf.filter(v=>v>-110),0.1)-40,scan=th=>{cands.length=0;for(let j=0;j+WN<=nf;j+=5){let c=0;for(let q=j;q<j+WN;q++)if(Lf[q]>th)tw[c++]=Lf[q];if(c<WN)continue;tw.sort();cands.push({j,m:tw[WN>>1]});}};
scan(-110);if(cands.length&&cands.reduce((m,c)=>Math.min(m,c.m),0)<dig)scan(dig);
if(!cands.length)return null;cands.sort((p,q)=>p.m-q.m);
const use=[],best=cands[0].m;for(const c of cands){if(c.m>best+3||use.length>=10)break;if(use.every(u=>Math.abs(u.j-c.j)>=WN))use.push(c);}
const N=1024,F=FFT(N),re=new Float64Array(N),im=new Float64Array(N),P=new Float64Array(N/2+1);let cnt=0,pw=0,fr=0;
for(const u of use){pw+=WN*Math.pow(10,(u.m+0.5)/10);fr+=WN;
for(let a=u.j*H;a+N<=(u.j+WN)*H;a+=N>>1){for(let i=0;i<N;i++){re[i]=x[a+i]*(0.5-0.5*Math.cos(TAU*(i+0.5)/N));im[i]=0;}F(re,im,false);for(let k=0;k<=N/2;k++)P[k]+=re[k]*re[k]+im[k]*im[k];cnt++;}}
yield 1;
if(!cnt)return null;const fl=best;
const loud=Array.from(Lf).filter(v=>v>-110).sort((a,b)=>a-b),act=loud[Math.floor(0.8*loud.length)];
if(!(act-best>=25))return{none:true,db:+best.toFixed(1),act:+act.toFixed(1)};
for(let k=0;k<=N/2;k++)P[k]/=cnt;
return{db:+db(pw/fr).toFixed(1),p:pw/fr,P,N,frames:fr,wins:cnt,floor:+fl.toFixed(1)};
}

function roomBands(sr,N){const B=[];for(let f=200*Math.pow(2,-1/6);f<Math.min(12000,sr/2);f*=Math.pow(2,1/3)){const k0=Math.max(1,Math.round(f*N/sr)),k1=Math.min(N/2,Math.round(f*Math.pow(2,1/3)*N/sr));if(k1>k0)B.push([k0,k1]);}return B;}
function*room(y,sr,o,Lr){
o=o||{};if(!Lr||Lr.none)return{learned:null,holes:[],why:Lr?'kein Raumton (nur '+(Lr.act-Lr.db).toFixed(0)+' dB unter dem Gesang)':'kein Raumton'};
const n=y.length,H=Math.max(64,Math.round(0.01*sr)),h1=Math.max(16,Math.round(0.001*sr)),nf=Math.floor(n/H),th=Lr.db-(o.below!=null?o.below:10);
const lev=(a,b)=>{let s=0;for(let i=a;i<b;i++)s+=y[i]*y[i];return db(s/Math.max(1,b-a));};
const holes=[];let s=-1;

for(let j=0;j<=nf;j++){const q=j<nf&&lev(j*H,(j+1)*H)<th;if(q&&s<0)s=j;if(!q&&s>=0){if(j-s>=3&&s>0&&j<nf)holes.push([s*H,j*H]);s=-1;}}
for(const hz of holes){while(hz[0]-h1>=0&&lev(hz[0]-h1,hz[0])<th)hz[0]-=h1;while(hz[1]+h1<=n&&lev(hz[1],hz[1]+h1)<th)hz[1]+=h1;}
yield 0.3;
const N=Lr.N,F=FFT(N),re=new Float64Array(N),im=new Float64Array(N),win=new Float64Array(N),mag=new Float64Array(N/2+1),R=Math.round(0.01*sr),out=[];
for(let i=0;i<N;i++)win[i]=Math.sin(Math.PI*(i+0.5)/N);
for(let k=1;k<N/2;k++)mag[k]=Math.sqrt(Lr.P[k]);
for(let q=0;q<holes.length;q++){

const[a,b]=holes[q],L=b-a,ph=lev(a,b);let nb=[],nbu=[],ns=0;

for(const W of[30,100,200]){nb=[];nbu=[];ns=0;
for(const[u0,u1]of[[a-W*H,a],[b,b+W*H]])for(let u=Math.max(0,u0);u+H<=Math.min(n,u1);u+=H){const l=lev(u,u+H);if(l>-110&&l<=Lr.db+15){nb.push(l);nbu.push(u);}else if(l<=-110)ns++;}
if(nb.length>=12||(nb.length<5&&ns>=5))break;}
if(nb.length<5&&ns>=5)continue;


nb.sort((p1,p2)=>p1-p2);let pt=nb.length>=5?Math.pow(10,(nb[nb.length>>1]+0.5)/10):Lr.p;
{const NR=o.nr!=null?o.nr:(room.NR!=null?room.NR:3),nl=[];if(NR>0)for(let u=Math.max(0,a-NR*H);u+H<=a;u+=H){const l=lev(u,u+H);if(l>-110&&l<=Lr.db+15)nl.push(l);}if(NR>0)for(let u=b;u+H<=Math.min(n,b+NR*H);u+=H){const l=lev(u,u+H);if(l>-110&&l<=Lr.db+15)nl.push(l);}
if(nl.length>=3){nl.sort((p1,p2)=>p1-p2);const pn=Math.pow(10,(nl[nl.length>>1]+0.5)/10),UP=o.up!=null?o.up:2;


pt=pn>pt&&UP>0&&nb.length>=5?Math.min(pn,pt*Math.pow(10,UP/10)):Math.min(pt,pn);}}
const need=pt-Math.pow(10,ph/10);if(need<=0||L<2*R)continue;

let mg=mag;{const P2=new Float64Array(N/2+1);let c2=0;const okU=new Set(nbu);
const PW=[],PU=[];
for(const u of nbu){if(!okU.has(u+H)||!okU.has(u+2*H)||u+N>n)continue;for(let i=0;i<N;i++){re[i]=y[u+i]*(0.5-0.5*Math.cos(TAU*(i+0.5)/N));im[i]=0;}F(re,im,false);const Pw=new Float64Array(N/2+1);for(let k=0;k<=N/2;k++){const e=re[k]*re[k]+im[k]*im[k];P2[k]+=e;Pw[k]=e;}PW.push(Pw);PU.push(u);c2++;}




const TON=o.ton!=null?o.ton:0;let PN=null;
if(c2>=3&&TON>0){const kA=Math.max(1,Math.round(100*N/sr)),kB=Math.min(N/2,Math.round(1500*N/sr)),tb=new Float64Array(kB-kA),keep=[];
PW.forEach((Pw,w)=>{let mx=0;for(let k=kA;k<kB;k++){tb[k-kA]=Pw[k];if(Pw[k]>mx)mx=Pw[k];}tb.sort();if(!(mx>TON*tb[tb.length>>1]))keep.push(w);});

const NW=o.nw!=null?o.nw:10,near=NW>0?keep.filter(w=>PU[w]+N>=a-NW*H&&PU[w]<=b+NW*H):keep,use=near.length>=3?near:keep;
if(use.length>=3&&(use.length<PW.length||near.length>=3))PN=use.map(w=>PW[w]);}
const PS=PN||PW,cs=PS.length,P3=PN?new Float64Array(N/2+1):P2;if(PN)for(const Pw of PN)for(let k=0;k<=N/2;k++)P3[k]+=Pw[k];
if(cs>=3){mg=new Float64Array(N/2+1);for(let k=1;k<N/2;k++)mg[k]=Math.sqrt(P3[k]/cs);




const TW=PS.map(P=>{let e=0;for(let k=1;k<N/2;k++)e+=P[k];return e||1e-30;});let Tm=0;for(const t of TW)Tm+=t/TW.length;
if(o.med!==0&&!(PN&&o.pm===1))for(const[k0,k1]of roomBands(sr,N)){const v=PS.map((P,w)=>{let e=0;for(let k=k0;k<k1;k++)e+=P[k];return e/TW[w];}).sort((p,q)=>p-q),md=v[v.length>>1]*Tm;
let e2=0;for(let k=k0;k<k1;k++)e2+=P3[k]/cs;const g=e2>0?Math.sqrt(md/e2):1;for(let k=k0;k<k1;k++)mg[k]*=g;}}}
let sd=(a*2654435761+12345)>>>0;const rnd=()=>{sd=(Math.imul(sd,1103515245)+12345)>>>0;return sd/4294967296;};
const z=new Float64Array(L+2*N);
for(let f=0;f*(N>>1)<L+N;f++){re.fill(0);im.fill(0);
for(let k=1;k<N/2;k++){const t=TAU*rnd();re[k]=mg[k]*Math.cos(t);im[k]=mg[k]*Math.sin(t);re[N-k]=re[k];im[N-k]=-im[k];}
F(re,im,true);const o0=f*(N>>1);for(let i=0;i<N&&o0+i<z.length;i++)z[o0+i]+=re[i]*win[i];}
let zp=0;for(let i=N;i<N+L;i++)zp+=z[i]*z[i];const gn=Math.sqrt(need*L/(zp+EPS));
for(let i=0;i<L;i++){const r=Math.min(1,(i+0.5)/R,(L-i-0.5)/R),fw=0.5-0.5*Math.cos(Math.PI*r);y[a+i]+=gn*fw*z[N+i];}
out.push({t0:+(a/sr).toFixed(3),t1:+(b/sr).toFixed(3),dbZiel:+db(pt).toFixed(1),dbVor:isFinite(ph)&&ph>-200?+ph.toFixed(1):null,dbNach:+lev(a,b).toFixed(1)});
yield 0.3+0.7*(q+1)/holes.length;
}
return{learned:{db:Lr.db,frames:Lr.frames},holes:out};
}


function*check(x,sr,o){
o=o||{};const t0=Date.now(),Fe=yield*part(feats(x,sr),0,0.45),R=Fe.R,nf=Fe.nf,fps=sr/Fe.H;
const Hm=yield*part(humFind(x,sr,Fe),0.45,0.17);
const plops=plopFind(Fe,o.plop);
const floor=pct(R.tot,0.1),act=pct(R.tot,0.6),top=pct(R.tot,0.99);

const clickList=yield*part(clickScan(x,sr,o.click),0.62,0.2),clicks=clickList.length;
const breaths=yield*part(breathFind(x,sr,Fe,o.breath),0.82,0.1);

const SH=yield*part(vr1EssCore(x,sr,6,{gen:true,scan:true,keep:breaths.map(e=>[e.s0,e.s1])}),0.92,0.05);

let eh=0,et=0,sib=0;const sibSec=new Array(Math.ceil(x.length/sr)).fill(0);for(let j=0;j<nf;j++)if(R.tot[j]>act-20){const t=Math.pow(10,R.tot[j]/10),h=Math.pow(10,R.hf[j]/10);et+=t;eh+=h;if(h>0.4*t){sib++;sibSec[Math.min(sibSec.length-1,Math.floor(j/fps))]++;}}
const B={sr,sec:+(x.length/sr).toFixed(2),clip:Fe.clip,peakDb:+(20*Math.log10(Fe.pk+EPS)).toFixed(1),floorDb:+floor.toFixed(1),snrDb:+(act-floor).toFixed(1),
hum:Hm,plops,clicks,clickList:clickList.map(e=>({t0:e.t0,t1:e.t1,sc:e.sc})),breaths:breaths.length,breathList:breaths.map(e=>({t0:e.t0,t1:e.t1,db:e.db})),sibPct:+(100*eh/(et+EPS)).toFixed(1),sibFrames:sib,sibSec,sibHot:SH.hot||0,sibHotMs:SH.hotMs||0,actDb:+act.toFixed(1),ms:Date.now()-t0};
const L=[];
if(B.clip)L.push(B.clip+' Übersteuerung'+(B.clip>1?'en':''));
if(B.clicks)L.push(B.clicks+' Klick'+(B.clicks>1?'s':''));
if(plops.length)L.push(plops.length+' Plopp'+(plops.length>1?'s':''));
if(Hm.on)L.push('Brumm '+Hm.base+' Hz');
if(B.breaths)L.push(B.breaths+' Atmer');
if(B.sibHot)L.push(B.sibHot+'× Zischen');
if(B.snrDb<35)L.push('Raumton '+Math.round(B.floorDb)+' dB');
B.line=L.length?L.join(' · '):'sauber';
yield 1;
return B;
}


const ORDER=['click','plop','hum','hp','breath','room','ess'];
function*run(x,sr,o){
o=o||{};const st=o.steps||{},t0=Date.now(),y=Float32Array.from(x),info={order:[]},on=ORDER.filter(k=>st[k]),sp=1/Math.max(1,on.length);


const wg=o.weg?new Float32Array(x.length):null,acc=sg=>{for(let i=0;i<y.length;i++)wg[i]+=sg*y[i];};
let at=0,Fe=null,keep=st.ess&&st.ess.keep?st.ess.keep.slice():[];
for(const k of on){
if(wg&&k!=='room')acc(1);
if(k==='click')info.click=yield*part(clicks2(y,sr,st.click),at,sp);
else if(k==='breath'){
const B=st.breath,fe=Fe||(yield*part(feats(y,sr),at,sp*0.5)),ev=B.list?B.list.map(e=>Object.assign({},e,{s0:e.s0!=null?e.s0:Math.round(e.t0*sr),s1:e.s1!=null?e.s1:Math.round(e.t1*sr)})):yield*part(breathFind(y,sr,fe,B),at+sp*0.5,sp*0.3);
info.breath=yield*part(breath(y,sr,ev,B),at+sp*0.8,sp*0.2);
for(const e of ev)keep.push([e.s0,e.s1]);
}else if(k==='room'){const Lr=yield*part(roomLearn(x,sr),at,sp*0.4);info.room=yield*part(room(y,sr,st.room,Lr),at+sp*0.4,sp*0.6);}
else if(k==='plop'){
Fe=yield*part(feats(y,sr),at,sp*0.5);
const ev=st.plop.list||plopFind(Fe,st.plop);
info.plop=yield*part(plop(y,sr,ev,st.plop),at+sp*0.5,sp*0.5);
}else if(k==='hum'){
let h=st.hum===true||st.hum==='auto'?null:st.hum;
if(!h||!h.f0){const f=yield*part(humFind(y,sr,Fe),at,sp*0.3);h=Object.assign({},h||{},{f0:f.f0,n:f.on?Math.max(f.n,7):0,found:f});}
info.hum={f0:h.f0,n:h.n,depth:h.depth!=null?h.depth:-30,q:h.q||HQ,found:h.found||null};
if(h.n)info.hum.k=yield*part(hum(y,y,sr,h),at+sp*0.3,sp*0.7);
}else if(k==='hp'){yield*part(hp(y,y,sr,st.hp.fc),at,sp);info.hp={fc:st.hp.fc||80};}
else if(k==='ess'){const E=st.ess===true?{}:st.ess;info.ess=yield*part(vr1EssCore(y,sr,E.amt!=null?E.amt:6,Object.assign({},E,{gen:true,keep})),at,sp);}
if(wg&&k!=='room')acc(-1);
info.order.push(k);at+=sp;
}
info.ms=Date.now()-t0;

if(wg&&o.q16){let mx=1e-9;for(let i=0;i<wg.length;i++){const a=wg[i]<0?-wg[i]:wg[i];if(a>mx)mx=a;}const s=32767/mx,q=new Int16Array(wg.length);for(let i=0;i<wg.length;i++)q[i]=Math.round(wg[i]*s);return{y,wg:q,ws:s,info};}
return wg?{y,wg,info}:{y,info};
}


const LV={leicht:0.5,mittel:1,stark:1.5};
function assist(B,lv){
const f=LV[lv]||1,st={},why=[];
if(B.clicks){st.click={sens:Math.round(4*f)};why.push('click');}
if(B.plops&&B.plops.length){st.plop={str:Math.round(50*f)};why.push('plop');}
if(B.hum&&B.hum.on){st.hum={f0:B.hum.f0,n:Math.max(B.hum.n||0,7),depth:-30*f};why.push('hum');}
st.hp={fc:80};
if(B.breaths){st.breath={target:-40-12*(f-1)};why.push('breath');}
st.room={};
if(B.sibHot?B.sibHotMs>=40:B.sibHotMs==null&&B.sibPct>=20){st.ess={amt:6*f};why.push('ess');}
return{lv:LV[lv]?lv:'mittel',f,steps:st,found:why};
}

function suggest(B){const s=(B.clicks>20?2:B.clicks?1:0)+(B.plops&&B.plops.length>3?2:B.plops&&B.plops.length?1:0)+(B.hum&&B.hum.on?1:0)+(B.breaths>8?1:0)+(B.sibHot>10?2:B.sibHot?1:0);return s>=5?'stark':s>=2?'mittel':'leicht';}

function worst(B,len){
len=len||10;const T=B.sec||0;if(T<=len)return{t0:0,t1:T};
const sc=new Float64Array(Math.ceil(T)+1),add=(t,v)=>{const k=Math.max(0,Math.min(sc.length-1,Math.floor(t)));sc[k]+=v;};
for(const e of B.clickList||[])add(e.t0,1);for(const e of B.plops||[])add(e.t0!=null?e.t0:(e.s0||0)/B.sr,3);for(const e of B.breathList||[])add(e.t0,1);
(B.sibSec||[]).forEach((c,k)=>add(k,0.05*c));
let best=0,bt=0;for(let a=0;a+len<=Math.ceil(T);a++){let s=0;for(let k=a;k<a+len;k++)s+=sc[k];if(s>best){best=s;bt=a;}}
bt=Math.min(bt,T-len);return{t0:bt,t1:bt+len,score:+best.toFixed(2)};
}

function done(g){let r;while(!(r=g.next()).done);return r.value;}
return{check,run,assist,suggest,worst,ess:vr1EssCore,feats,humFind,humCoefs,hum,hp,plopFind,plop,clickScan,click,clicks2,voicing,breathFind,breath,roomLearn,room,bqC,done,ORDER,VERSION:'vr1-kern-3'};
}






