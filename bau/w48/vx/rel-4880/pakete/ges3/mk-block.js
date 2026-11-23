/* GES3-MK-BEGIN – Marken nur bei echtem Einsatz: eine Spektral-Marke mitten in einem durchgehend stimmhaften Vokal ohne Tonhöhen-Sprung,
   ohne tiefes Pegel-Tal und ohne Klangfarben-Wechsel (nur Lautstärke-Welle) fällt weg. Stille davor, Konsonant, Tonhöhe bleiben Marken. */
function ges3Echt(marks,x,sr,Es,hop,V,cents){
const hv=V.hv,nV=cents.length,nE=Es.length,n=x.length;
let N=256;while(N<sr*0.023)N<<=1;
const fft=FFT(N),re=new Float64Array(N),im=new Float64Array(N),win=new Float64Array(N);for(let i=0;i<N;i++)win[i]=0.5-0.5*Math.cos(TAU*i/N);
const NB=12,fl=200,fh=Math.min(5000,sr*0.45),ed=new Int32Array(NB+1);for(let b=0;b<=NB;b++)ed[b]=Math.round(fl*Math.pow(fh/fl,b/NB)/sr*N);
const prof=(c0,c1)=>{const P=new Float64Array(NB),st=Math.max(1,Math.round(0.005*sr));let k=0;
for(let c=c0;c<=c1;c+=st){const a=c-(N>>1);for(let i=0;i<N;i++){const q=a+i;re[i]=q>=0&&q<n?ok(x[q])*win[i]:0;im[i]=0;}fft(re,im);
for(let b=0;b<NB;b++){let s=0;for(let j=ed[b];j<Math.max(ed[b]+1,ed[b+1]);j++)s+=re[j]*re[j]+im[j]*im[j];P[b]+=s;}k++;}
for(let b=0;b<NB;b++)P[b]=10*Math.log10(P[b]/Math.max(1,k)+1e-20);return P;};
const mn=(a,b)=>{let s=0,c=0;for(let v=a;v<=b;v++)if(v>=0&&v<nV&&cents[v]===cents[v]){s+=cents[v];c++;}return c>=0.8*(b-a+1)?s/c:NaN;};
const E=k=>Es[k<0?0:k>=nE?nE-1:k];
const out=[];
for(const m of marks){
let keep=true;
if(m.src==='onset'&&!m.word){
const v=Math.round(m.i/hv);let vo=true;for(let k=v-6;k<=v+6;k++)if(!(k>=0&&k<nV&&cents[k]===cents[k])){vo=false;break;}
const A=mn(v-16,v-2),B=mn(v+2,v+16);
if(vo&&A===A&&B===B&&Math.abs(B-A)<=70){
const t=Math.round(m.i/hop);let lo=Infinity,L=-Infinity,R=-Infinity;
for(let k=t-12;k<=t+2;k++)lo=Math.min(lo,E(k));for(let k=t-50;k<t-8;k++)L=Math.max(L,E(k));for(let k=t;k<=t+20;k++)R=Math.max(R,E(k));
if(Math.min(L,R)-lo<15){
const P=prof(m.i-Math.round(0.05*sr),m.i-Math.round(0.015*sr)),Q=prof(m.i+Math.round(0.015*sr),m.i+Math.round(0.05*sr));
let mx=-Infinity;for(let b=0;b<NB;b++)mx=Math.max(mx,P[b],Q[b]);
const d=[];for(let b=0;b<NB;b++)if(Math.max(P[b],Q[b])>mx-30)d.push(Q[b]-P[b]);
let g=0;for(const y of d)g+=y;g/=Math.max(1,d.length);let r=0;for(const y of d)r+=(y-g)*(y-g);r=Math.sqrt(r/Math.max(1,d.length));
if(d.length>=4&&r<6)keep=false;
}
}
}
if(keep)out.push(m);
}
const dr=marks.length-out.length;marks.length=0;for(const m of out)marks.push(m);return dr;
}
/* GES3-MK-END */
