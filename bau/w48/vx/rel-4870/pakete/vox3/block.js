/* VOX3-BEGIN: Plopps – zweiter Durchgang für leise, kurze Tiefstöße; Raumton – Farbe in langen Lücken von davor nach danach */
function vo3Weak(Fe,o,ev,LF,r,flo,top,lvl,own,thr){
const REL=o.p3!=null?o.p3:8;if(!(REL>0))return ev;
const R=Fe.R,nf=Fe.nf,fps=Fe.sr/Fe.H,need=thr+(o.rise!=null?o.rise:6),K3=o.p3k!=null?o.p3k:8,X3=o.p3x!=null?o.p3x:6,D3=o.p3d!=null?o.p3d:0,gm=o.gmax!=null?o.gmax:1,B0=Math.round(0.25*fps),B1=Math.round(0.03*fps),A0=Math.round(0.1*fps),A1=Math.round(0.3*fps);
const c=new Uint8Array(nf),ex=new Float64Array(nf),LB=new Float64Array(nf),busy=new Uint8Array(nf);
for(const E of ev)for(let j=Math.max(0,Math.floor(E.s0/Fe.H)-2);j<Math.min(nf,Math.ceil(E.s1/Fe.H)+2);j++)busy[j]=1;
for(let j=0;j<nf;j++){if(busy[j]||LF[j]<flo+15||LF[j]<top+lvl-REL||LF[j]<R.tot[j]+own)continue;
const lb=med(LF,j-B0,j-B1),la=med(LF,j+A0,j+A1);if(r&&med(r,j-B0,j-B1)==null&&med(r,j+A0,j+A1)==null)continue;const lbase=lb==null?la:la==null?lb:Math.max(lb,la);if(lbase==null)continue;
ex[j]=LF[j]-lbase;LB[j]=lbase;c[j]=ex[j]>=need?1:ex[j]>=need-X3?2:0;}
const add=[];
for(let j=0;j<nf;j++){if(!c[j])continue;let e=j,mx=ex[j],dom=c[j]===1?LF[j]-R.tot[j]:-99;while(e+1<nf&&(c[e+1]||(e+6<nf&&c.subarray(e+2,e+7).some(Boolean)))){e++;if(ex[e]>mx)mx=ex[e];if(c[e]===1&&LF[e]-R.tot[e]>dom)dom=LF[e]-R.tot[e];}
const dur=(e-j+2)/fps;let q0=j,q1=e;const lbE=Math.min(LB[j]||0,LB[e]||0)+6;while(q0>0&&j-q0<gm&&LF[q0-1]>=lbE)q0--;while(q1+1<nf&&q1-e<gm&&LF[q1+1]>=lbE)q1++;
let free=true;for(let q=q0;q<=q1+1&&q<nf;q++)if(busy[q])free=false;
if(free&&dur>=0.02&&dur<=0.13&&mx>=need&&(mx>=need+K3||dom>=D3))add.push({t0:q0*Fe.H/Fe.sr,t1:(q1+2)*Fe.H/Fe.sr,s0:q0*Fe.H,s1:Math.min(Fe.n,(q1+2)*Fe.H),c0:j*Fe.H,c1:Math.min(Fe.n,(e+2)*Fe.H),exDb:+mx.toFixed(1)});
j=e;}
return add.length?ev.concat(add).sort((p,q)=>p.s0-q.s0):ev;
}
function vo3Col(PW,PU,a,b,L,sr,N,mg,o){
const LL=o.rc!=null?o.rc:0.5;if(!(LL>0)||L<LL*sr||!PW||PW.length<6)return null;
const col=ws=>{if(ws.length<3)return null;const m=Float64Array.from(mg),T=ws.map(P=>{let e=0;for(let k=1;k<N/2;k++)e+=P[k];return e||1e-30;});
for(const[k0,k1]of roomBands(sr,N)){const v=ws.map((P,w)=>{let e=0;for(let k=k0;k<k1;k++)e+=P[k];return e/T[w];}).sort((p,q)=>p-q),md=v[v.length>>1];let e2=0;for(let k=k0;k<k1;k++)e2+=mg[k]*mg[k];const g=e2>0?Math.sqrt(md/e2):0;for(let k=k0;k<k1;k++)m[k]=mg[k]*g;}
let s0=0,s1=0;for(let k=1;k<N/2;k++){s0+=mg[k]*mg[k];s1+=m[k]*m[k];}const g=s1>0?Math.sqrt(s0/s1):0;for(let k=1;k<N/2;k++)m[k]*=g;return m;};
const l=col(PW.filter((P,w)=>PU[w]<a)),rr=col(PW.filter((P,w)=>PU[w]>=b));if(!l||!rr)return null;
let d=0,nb=0;for(const[k0,k1]of roomBands(sr,N)){let el=0,er=0;for(let k=k0;k<k1;k++){el+=l[k]*l[k];er+=rr[k]*rr[k];}if(el>0&&er>0){d+=Math.abs(10*Math.log10(el/er));nb++;}}
if(!nb||d/nb<(o.rcd!=null?o.rcd:1.5))return null;
const out=new Float64Array(N/2+1);return f=>{const p=Math.max(0,Math.min(1,((f*(N>>1)+(N>>1)-N)/L-0.1)/0.8));for(let k=1;k<N/2;k++)out[k]=Math.sqrt((1-p)*l[k]*l[k]+p*rr[k]*rr[k]);return out;};
}
/* VOX3-END */
