/* KSM-BEGIN (worklet): Klangschule-Regler als Mod-Ziel und Lock je Schritt. Ohne Lock/Route: v.ksm leer, alter Weg. */
const KSM_WK=['ksAa','ksAd','ksAr','ksFa','ksFd','ksFr','ksMa','ksMd','ksMr','ksR1','ksG1','ksR2','ksG2','ksF2c','ksF2r','ksF2e','ksF2m','ksPe'];
const KSM_WI=-9000,KSM_D0=40;
function ksmRas(r,m){r=r|0;if(m===0||r<3)return r;return Math.max(3,Math.min(16,Math.round(r+m*13)));}
Object.assign(AnalogCore.prototype,{
ksmV(v,e){
if(v.ksmD){v.ksmD=0;if(!v.lkN&&!this.lbX)v.D=null;}
v.ksm=null;v.ksmF=null;
let L=null,M=0;
if(e&&e.length>9){const n=Math.min(16,e[8]|0);for(let j=0;j<n;j++){const q=KSM_WI-e[9+2*j],x=e[10+2*j];if(q>=0&&q<18&&typeof x==='number'&&x===x){if(!L)L=new Float64Array(18).fill(NaN);L[q]=x;}}}
for(let s=0;s<NSLOT;s++){const d=this.mdst[s]-KSM_D0;if(this.msrc[s]&&d>=0&&d<8&&this.mamt[s]!==0)M|=1<<d;}
if(!L&&!M)return;
let t=false;if(L)for(let j=0;j<9;j++)if(L[j]===L[j])t=true;
v.ksm={L,M,t,f:1,W:v.ksmW||(v.ksmW={ksR1:0,ksG1:0,ksR2:0,ksG2:0,kfSh1:0,l1shape:0,kfSh2:0,l2shape:0,ksPe:0,ksF2q:0,ksF2e:0}),F:v.ksmFb||(v.ksmFb=new Float64Array(2))};
if(t)this.ksmEnv(v);
},
ksmVP(v,VP){
const K=v.ksm,L=K.L,P=this.lbP?this.PR:this.P;
for(let j=0;j<9;j++){const k=KSM_WK[j];let b=L&&L[j]===L[j]?L[j]:+P[k]||0;if(b>0)b=Math.min(64,Math.max(.0625,b*K.f));VP[k]=b>0?b:0;}
},
ksmEnv(v){
const P=this.lbP?this.PR:this.P;
if(!v.VP){v.VP=Object.assign(defaults(),P);v.Dv=new LkD(newEnv(),newEnv(),newEnv());}
if(!v.D)Object.assign(v.VP,P);
this.ksmVP(v,v.VP);this.deriveInto(v.Dv,v.VP);v.D=v.Dv;v.ksmD=1;
},
ksmLfo(v,P,src,step,r1,r2){
const K=v.ksm;if(!K){this.ks4Lfo(v,P,src,step,r1,r2);return;}
const L=K.L,W=K.W;let a=0,b=0;
if(K.M&96)for(let s=0;s<NSLOT;s++){const d=this.mdst[s]-KSM_D0;if((d===5||d===6)&&this.msrc[s]){const x=this.mamt[s]*src[this.msrc[s]];if(d===5)a+=x;else b+=x;}}
W.ksR1=ksmRas(L&&L[9]===L[9]?L[9]:P.ksR1,a);W.ksR2=ksmRas(L&&L[11]===L[11]?L[11]:P.ksR2,b);
W.ksG1=L&&L[10]===L[10]?L[10]:P.ksG1;W.ksG2=L&&L[12]===L[12]?L[12]:P.ksG2;
if(W.ksR1>=3||W.ksR2>=3||W.ksG1>0||W.ksG2>0)this.ks4Lfo(v,W,src,step,r1,r2);
},
ksmCtl(v,P,src,dst,step){
const K=v.ksm;if(!K){this.ks4Ctl(v,P,src,dst,step);return;}
const L=K.L,W=K.W;let mp=0,mc=0,mr=0,me=0,mm=0,mt=0;
if(K.M)for(let s=0;s<NSLOT;s++){const d=this.mdst[s]-KSM_D0;if(d<0||d>7||!this.msrc[s])continue;const x=this.mamt[s]*src[this.msrc[s]];
if(d===0)mp+=x;else if(d===1)mc+=x;else if(d===2)mr+=x;else if(d===3)me+=x;else if(d===4)mm+=x;else if(d===7)mt+=x;}
if(mt!==0&&v.t0<=step*1.5){const f=Math.pow(2,Math.round(clamp(mt,-1,1)*4));if(f!==1){K.f=f;K.t=true;this.ksmEnv(v);}}
W.ksR1=L&&L[9]===L[9]?L[9]:P.ksR1;W.ksR2=L&&L[11]===L[11]?L[11]:P.ksR2;
W.kfSh1=P.kfSh1;W.l1shape=P.l1shape;W.kfSh2=P.kfSh2;W.l2shape=P.l2shape;W.ksF2q=P.ksF2q;
W.ksPe=clamp((L&&L[17]===L[17]?L[17]:+P.ksPe||0)+mp*48,-48,48);
W.ksF2e=clamp((L&&L[15]===L[15]?L[15]:+P.ksF2e||0)+me,-1,1);
const c0=this.ks4C0;
if(this.ks4F){
const fc=L&&L[13]===L[13]?L[13]:P.ksF2c,fr=L&&L[14]===L[14]?L[14]:P.ksF2r,fm=L&&L[16]===L[16]?L[16]:P.ksF2m;
this.ks4C0=69+12*Math.log2(clamp(+fc||1000,20,20000)/440)+mc*120;
K.F[0]=clamp(+fm+mm,0,1);K.F[1]=2-1.95*clamp((+fr||0)+mr,0,1);v.ksmF=K.F;
}
this.ks4Ctl(v,W,src,dst,step);
this.ks4C0=c0;
},
});
/* KSM-END */
