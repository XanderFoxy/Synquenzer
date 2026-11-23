/* SPKV2-BEGIN (ersetzt SPKV) Verfeinern Bass/Drums: Kick über Anschläge im Takt-Raster, Bass-Anschläge mit Tonverlauf nicht als Kick, Grundton-Lage, Sinus-Bass, Drums nach Bass gleich geteilt */
const spkvO={on:1,N:8192,fa:27,fb:300,fT:300,fK:200,kLen:0.22,dg:0.035,alt:1,sin:1,sub:1,dr:1,dbg:null};
function spkvFix(d,ziel,box,E){
if(!spkvO.on||(ziel!=='bass'&&ziel!=='drums')||!d||!d.mid)return null;
const sr=d.meta.sr,N=d.meta.base.N,hop=d.meta.base.hop,NB=N/2+1,df=sr/N,N8=spkvO.N,d8=sr/N8,K8=Math.min(N8/2+1,Math.ceil(1300/d8)+3);
const MG=8,a0=box.m0-MG,n=box.m1-box.m0+1+2*MG,cen=new Int32Array(n);if(n<=2*MG)return null;
for(let i=0;i<n;i++)cen[i]=(a0+i-1)*hop;
const X=magsAt(d,N8,cen,K8),N2=1024,d2=sr/N2,K2=Math.ceil(200/d2)+2,X2=magsAt(d,N2,cen,K2);
const C=[];for(let f=spkvO.fa;f<=spkvO.fb;f*=Math.pow(2,1/48))C.push(f);
const pk=(o,kf)=>{const k=Math.round(kf);if(k<1||k>=K8-1)return 0;return Math.max(X[o+k-1],X[o+k],X[o+k+1]);};
const f0=new Float32Array(n),hm=new Uint8Array(n),lo=new Float32Array(n),ld=new Float32Array(n),ls=new Float32Array(n),es=new Float32Array(n);let emax=0,esx=0;
for(let i=0;i<n;i++){const o=i*K8;let e=0;for(let k=Math.floor(30/d8);k<=Math.ceil(200/d8);k++)e+=X[o+k]*X[o+k];lo[i]=e;if(e>emax)emax=e;
let e2=0,e3=0;for(let k=1;k*d2<=200;k++){const p=X2[i*K2+k]*X2[i*K2+k];e2+=p;if(k*d2<=110)e3+=p;}ld[i]=10*Math.log10(e2+1e-12);ls[i]=10*Math.log10(e3+1e-12);es[i]=e3;if(e3>esx)esx=e3;}
for(let i=0;i<n;i++){
const o=i*K8;if(!(lo[i]>emax*1e-4))continue;
let best=0,bf=0;
for(const f of C){let s=0,g=1;for(let h=1;h<=6;h++,g*=0.86){const kf=h*f/d8;if(kf>=K8-2)break;s+=g*pk(o,kf);}if(s>best){best=s;bf=f;}}
/* Grundton-Lage: Unteroktave mit eigener Spitze und ungeradem Teilton -> eine Oktave tiefer */
if(bf/2>=spkvO.fa&&pk(o,bf/2/d8)>0.3*pk(o,bf/d8)&&pk(o,1.5*bf/d8)>0.2*pk(o,bf/d8))bf/=2;
let c=0;const p1=pk(o,bf/d8);
for(let h=2;h<=4;h++){const a=pk(o,h*bf/d8),m=0.5*(pk(o,(h-0.5)*bf/d8)+pk(o,(h+0.5)*bf/d8));if(a>2.5*m&&a>0.05*p1)c++;}
f0[i]=bf;hm[i]=c;
/* SPKV2: kein Ton gefunden -> Grundton über die Obertöne 2-5 (ein Kick überdeckt oft den Grundton) */
if(c<2&&spkvO.alt){let b2=-1,f2=0;for(const f of C){if(5*f/d8>=K8-2)break;let s=0,g=1;for(let h=2;h<=5;h++,g*=0.86)s+=g*(pk(o,h*f/d8)-pk(o,(h-0.5)*f/d8));if(s>b2){b2=s;f2=f;}}
while(f2>0&&2*f2<=spkvO.fb&&pk(o,f2/d8)+pk(o,3*f2/d8)<0.25*(pk(o,2*f2/d8)+pk(o,4*f2/d8)))f2*=2;
if(f2>0){let c2=0;const pr=Math.max(pk(o,f2/d8),pk(o,2*f2/d8));for(let h=2;h<=4;h++){const a=pk(o,h*f2/d8),m=0.5*(pk(o,(h-0.5)*f2/d8)+pk(o,(h+0.5)*f2/d8));if(a>2.5*m&&a>0.05*pr)c2++;}if(c2>=2){f0[i]=f2;hm[i]=c2;}}}
}
/* Ton-Abschnitte: stetiger Grundton mit Obertönen über mindestens 3 Rahmen */
const bF=new Float32Array(n),sgA=new Int32Array(n).fill(-1);
for(let a=0;a<n;){
if(!(hm[a]>=2&&f0[a]>0)){a++;continue;}
let b=a;while(b+1<n&&hm[b+1]>=2&&f0[b+1]>0&&Math.abs(12*Math.log2(f0[b+1]/f0[b]))<=0.6)b++;
if(b-a+1>=3){const v=[];for(let i=a;i<=b;i++)v.push(f0[i]);v.sort((x,y)=>x-y);const fm=v[v.length>>1];for(let i=Math.max(0,a-1);i<=b;i++)if(!bF[i]){bF[i]=fm;sgA[i]=a;}}
a=b+1;
}
/* SPKV2: Sinus-Bass ohne Obertöne: saubere einzelne Spitze, stetig und nicht abklingend (ein Kick klingt ab) */
if(spkvO.sin){const sp=new Float32Array(n),lv=new Float32Array(n),k0=Math.floor(spkvO.fa/d8),k1=Math.ceil(200/d8);
for(let i=0;i<n;i++){if(bF[i]||!(lo[i]>emax*1e-3))continue;const o=i*K8;let kb=-1,pb=0,t=0;for(let k=k0;k<=k1;k++){const p=X[o+k]*X[o+k];t+=p;if(p>pb){pb=p;kb=k;}}
if(kb<1)continue;let q=0;for(let k=kb-2;k<=kb+2;k++)q+=X[o+k]*X[o+k];if(q<0.7*t)continue;
const y0=X[o+kb-1],y1=X[o+kb],y2=X[o+kb+1],dn=y0-2*y1+y2,dl=dn<0?0.5*(y0-y2)/dn:0;sp[i]=(kb+dl)*d8;lv[i]=10*Math.log10(q+1e-12);}
for(let a=0;a<n;){if(!sp[a]){a++;continue;}let b=a;while(b+1<n&&sp[b+1]&&Math.abs(12*Math.log2(sp[b+1]/sp[b]))<=0.6)b++;
let im=a;for(let i=a;i<=b;i++)if(lv[i]>lv[im])im=i;
if(b-im>=4&&lv[im+4]-lv[im]>-1.5){const v=[];for(let i=a;i<=b;i++)v.push(sp[i]);v.sort((x,y)=>x-y);const fm=v[v.length>>1];for(let i=Math.max(0,a-1);i<=b;i++)if(!bF[i]){bF[i]=fm;sgA[i]=a;}}
a=b+1;}}
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
const pvF=i=>{for(let j=i-1;j>=Math.max(0,i-6);j--)if(bF[j]&&sgA[j]!==sgA[i])return bF[j];return 0;};
const resid=i=>{const o=i*K8,pf=spkvO.sub?pvF(i):0;let t=0,on=0;for(let k=Math.floor(30/d8);k<=Math.ceil(200/d8);k++){const p=X[o+k]*X[o+k];t+=p;on+=p*Math.max(cb(i,k),i>1?cb(i-2,k):0,cb1(pf,k));}return t>0?1-on/t:1;};
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
if(spkvO.sub){let sf=-99,sx=0;for(let j=i;j<=Math.min(n-1,i+1);j++){sf=Math.max(sf,ls[j]-Math.max(ls[j-1],ls[j-2]));sx=Math.max(sx,es[j]);}if(sf<3||sx<esx*3e-3)continue;}
ks.push(i);
for(let j=i-1;j<=Math.min(n-1,i+kL+2);j++)kW[j]=Math.max(kW[j],j<i?0.5:j<=i+kL?1:1-(j-i-kL)/3);
}
if(spkvO.dbg)spkvO.dbg({f0,hm,bF,kW,ks,fit,useG,cen,flux,aT,sgA});
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
else if(spkvO.dr){if(B)v=kq>0?(1-kq)*Math.min(e,1-sh)+kq*(1-sh):Math.min(e,1-sh);else if(kq>0)v=Math.max(e,kq);}
else{if(kq>0)v=Math.max(e,kq*(B?1-sh:1));else if(B)v=Math.min(e,1-sh);}
E[e0+k]=v<0?0:v>1?1:v;
}
}
return{kicks:ks.length,fit,useG};
}
/* SPKV2-END */
