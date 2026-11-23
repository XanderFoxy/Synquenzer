/* SPKV-BEGIN Verfeinern Bass/Drums: Kick über Anschläge im Takt-Raster, Bass-Anschläge mit Tonverlauf nicht als Kick, Grundton-Lage */
const spkvO={on:1,N:8192,fa:27,fb:300,fT:300,fK:200,kLen:0.22,dg:0.035,dbg:null};
function spkvFix(d,ziel,box,E){
if(!spkvO.on||(ziel!=='bass'&&ziel!=='drums')||!d||!d.mid)return null;
const sr=d.meta.sr,N=d.meta.base.N,hop=d.meta.base.hop,NB=N/2+1,df=sr/N,N8=spkvO.N,d8=sr/N8,K8=Math.min(N8/2+1,Math.ceil(1300/d8)+3);
const MG=8,a0=box.m0-MG,n=box.m1-box.m0+1+2*MG,cen=new Int32Array(n);if(n<=2*MG)return null;
for(let i=0;i<n;i++)cen[i]=(a0+i-1)*hop;
const X=magsAt(d,N8,cen,K8),N2=1024,d2=sr/N2,K2=Math.ceil(200/d2)+2,X2=magsAt(d,N2,cen,K2);
const C=[];for(let f=spkvO.fa;f<=spkvO.fb;f*=Math.pow(2,1/48))C.push(f);
const pk=(o,kf)=>{const k=Math.round(kf);if(k<1||k>=K8-1)return 0;return Math.max(X[o+k-1],X[o+k],X[o+k+1]);};
const f0=new Float32Array(n),hm=new Uint8Array(n),lo=new Float32Array(n),ld=new Float32Array(n);let emax=0;
for(let i=0;i<n;i++){const o=i*K8;let e=0;for(let k=Math.floor(30/d8);k<=Math.ceil(200/d8);k++)e+=X[o+k]*X[o+k];lo[i]=e;if(e>emax)emax=e;
let e2=0;for(let k=1;k*d2<=200;k++)e2+=X2[i*K2+k]*X2[i*K2+k];ld[i]=10*Math.log10(e2+1e-12);}
for(let i=0;i<n;i++){
const o=i*K8;if(!(lo[i]>emax*1e-4))continue;
let best=0,bf=0;
for(const f of C){let s=0,g=1;for(let h=1;h<=6;h++,g*=0.86){const kf=h*f/d8;if(kf>=K8-2)break;s+=g*pk(o,kf);}if(s>best){best=s;bf=f;}}
/* Grundton-Lage: Unteroktave mit eigener Spitze und ungeradem Teilton -> eine Oktave tiefer */
if(bf/2>=spkvO.fa&&pk(o,bf/2/d8)>0.3*pk(o,bf/d8)&&pk(o,1.5*bf/d8)>0.2*pk(o,bf/d8))bf/=2;
let c=0;const p1=pk(o,bf/d8);
for(let h=2;h<=4;h++){const a=pk(o,h*bf/d8),m=0.5*(pk(o,(h-0.5)*bf/d8)+pk(o,(h+0.5)*bf/d8));if(a>2.5*m&&a>0.05*p1)c++;}
f0[i]=bf;hm[i]=c;
}
/* Ton-Abschnitte: stetiger Grundton mit Obertönen über mindestens 3 Rahmen */
const bF=new Float32Array(n),sgA=new Int32Array(n).fill(-1);
for(let a=0;a<n;){
if(!(hm[a]>=2&&f0[a]>0)){a++;continue;}
let b=a;while(b+1<n&&hm[b+1]>=2&&f0[b+1]>0&&Math.abs(12*Math.log2(f0[b+1]/f0[b]))<=0.6)b++;
if(b-a+1>=3){const v=[];for(let i=a;i<=b;i++)v.push(f0[i]);v.sort((x,y)=>x-y);const fm=v[v.length>>1];for(let i=Math.max(0,a-1);i<=b;i++)if(!bF[i]){bF[i]=fm;sgA[i]=a;}}
a=b+1;
}
/* Anschlag vor dem Ton-Abschnitt: der folgende stetige Ton bestimmt den Anschlag (Wechsel-Rahmen behalten den alten Ton dazu) */
const flux=new Float32Array(n),bP=new Float32Array(n);for(let i=2;i<n;i++)flux[i]=ld[i]-Math.max(ld[i-1],ld[i-2]);
for(let i=2;i<n-1;i++){
if(!(flux[i]>=4&&flux[i]>=flux[i-1]&&flux[i]>=flux[i+1]))continue;
let a=-1;for(let j=Math.max(0,i-2);j<=Math.min(n-1,i+5);j++)if(sgA[j]>=i-2){a=sgA[j];break;}
if(a<0)continue;const fa=bF[a];
for(let j=Math.max(0,i-1);j<a;j++){if(bF[j]&&Math.abs(12*Math.log2(bF[j]/fa))>0.6)bP[j]=bF[j];bF[j]=fa;sgA[j]=a;}
}
const cb1=(f,kk)=>{if(!(f>0))return 0;const h=Math.max(1,Math.round(kk*d8/f)),u=Math.abs(kk-h*f/d8);return Math.max(0,1-u/1.4);};
const cb=(i,kk)=>Math.max(cb1(bF[i],kk),cb1(bP[i],kk));
const resid=i=>{const o=i*K8;let t=0,on=0;for(let k=Math.floor(30/d8);k<=Math.ceil(200/d8);k++){const p=X[o+k]*X[o+k];t+=p;on+=p*Math.max(cb(i,k),i>1?cb(i-2,k):0);}return t>0?1-on/t:1;};
/* Takt-Raster: Nähe zu Viertel/Achtel/Sechzehntel; ein Raster, das nicht zu den Anschlägen passt, zählt nicht */
const g=d.meta.grid||{},bpm=+g.bpm,goff=+g.off||0,stp=bpm>=40&&bpm<=240?60/bpm/4:0;
const lvl=i=>{if(!stp)return 3;const t=cen[i]/sr,q=(t-goff)/stp,j=Math.round(q);if(Math.abs(q-j)*stp>spkvO.dg)return 3;return j%4===0?0:j%2===0?1:2;};
let fit=1;if(stp){let a=0,c=0;for(let i=2;i<n-1;i++)if(flux[i]>=6&&flux[i]>=flux[i-1]&&flux[i]>=flux[i+1]){c++;if(lvl(i)<3)a++;}fit=c>=4?a/c:1;}
const useG=stp&&fit>=0.6,kW=new Float32Array(n),aT=new Uint8Array(n),kL=Math.max(2,Math.round(spkvO.kLen*sr/hop)),ks=[];
for(let i=2;i<n-1;i++){
if(!(flux[i]>=flux[i-1]&&flux[i]>=flux[i+1]))continue;
const L=useG?lvl(i):3,thr=[3,4,5,8][L];if(flux[i]<thr)continue;
const tonal=bF[i]>0&&bF[Math.min(n-1,i+2)]>0&&sgA[Math.min(n-1,i+2)]===sgA[i];
const rq=[0.3,0.38,0.45,0.55][L],r=Math.max(resid(i),resid(Math.min(n-1,i+1)));
if(tonal&&r<rq){for(let j=Math.max(0,i-1);j<=Math.min(n-1,i+3);j++)aT[j]=1;continue;}
if(!tonal&&lo[i]<emax*1e-3)continue;
ks.push(i);
for(let j=i-1;j<=Math.min(n-1,i+kL+2);j++)kW[j]=Math.max(kW[j],j<i?0.5:j<=i+kL?1:1-(j-i-kL)/3);
}
if(spkvO.dbg)spkvO.dbg({f0,hm,bF,kW,ks,fit,useG,cen,flux});
const kT=Math.min(box.k1,NB-1,Math.floor(spkvO.fT/df)),kK=Math.floor(spkvO.fK/df);
for(let m=box.m0;m<=box.m1;m++){
const i=m-a0,B=bF[i]>0,Kw=kW[i];if(!B&&!Kw&&!aT[i])continue;
const o=i*K8,e0=(m-box.m0)*NB;
for(let k=0;k<=kT;k++){
let num=0,den=0;for(let t=-1;t<=1;t++){const kk=2*k+t;if(kk<0||kk>=K8)continue;const w=t?0.5:1,p=X[o+kk]*X[o+kk]*w;num+=p*cb(i,kk);den+=p;}
const sh=B&&den>0?num/den:0,e=E[e0+k],kq=k<=kK?Kw:0,at=aT[i]&&!Kw&&k<=kK;
let v=e;
if(at)v=ziel==='bass'?1:0;
else if(ziel==='bass'){if(B)v=kq>0?(1-kq)*Math.max(e,sh)+kq*sh:Math.max(e,sh);else if(kq>0)v=e*(1-kq);}
else{if(kq>0)v=Math.max(e,kq*(B?1-sh:1));else if(B)v=Math.min(e,1-sh);}
E[e0+k]=v<0?0:v>1?1:v;
}
}
return{kicks:ks.length,fit,useG};
}
/* SPKV-END */
