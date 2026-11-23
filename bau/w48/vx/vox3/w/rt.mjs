// Raumton-Farbe (synthetisch): Raumton ändert seine Farbe in jeder Pause (dunkel <-> hell); die Mitte der Pause ist hart stummgeschaltet (Gate).
// Misst je Lücke den Farbfehler (Terzbänder 200 Hz–8 kHz, Mittel |dB|, Pegel herausgerechnet) im ersten und letzten Drittel gegen den echten Raumton.
import {loadK} from './kern.mjs';import {sing,rng} from './gen.mjs';
const K=loadK(process.argv[2]),TAU=2*Math.PI,O=process.env.RO?JSON.parse(process.env.RO):{},HL=+(process.env.HL||0.8);
function fft(re,im){const n=re.length;for(let i=1,j=0;i<n;i++){let b=n>>1;for(;j&b;b>>=1)j^=b;j^=b;if(i<j){[re[i],re[j]]=[re[j],re[i]];[im[i],im[j]]=[im[j],im[i]];}}
 for(let L=2;L<=n;L<<=1){const a=-TAU/L;for(let i=0;i<n;i+=L)for(let k=0;k<L/2;k++){const c=Math.cos(a*k),s=Math.sin(a*k),xr=re[i+k+L/2]*c-im[i+k+L/2]*s,xi=re[i+k+L/2]*s+im[i+k+L/2]*c;re[i+k+L/2]=re[i+k]-xr;im[i+k+L/2]=im[i+k]-xi;re[i+k]+=xr;im[i+k]+=xi;}}}
function bands(x,a,b,sr){const N=2048,P=new Float64Array(N/2+1);let c=0;for(let u=a;u+N<=b;u+=N/2){const re=new Float64Array(N),im=new Float64Array(N);for(let i=0;i<N;i++)re[i]=x[u+i]*(0.5-0.5*Math.cos(TAU*(i+0.5)/N));fft(re,im);for(let k=0;k<=N/2;k++)P[k]+=re[k]**2+im[k]**2;c++;}
 const B=[];for(let f=200;f<8000;f*=Math.pow(2,1/3)){const k0=Math.round(f*N/sr),k1=Math.round(f*Math.pow(2,1/3)*N/sr);let e=0;for(let k=k0;k<k1;k++)e+=P[k];B.push(10*Math.log10(e/c+1e-30));}return B;}
const err=(A,B)=>{let m=0;for(let i=0;i<A.length;i++)m+=A[i]-B[i];m/=A.length;let e=0;for(let i=0;i<A.length;i++)e+=Math.abs(A[i]-B[i]-m);return e/A.length;};
const res=[];let same=true,sameShort=true;
for(const T of [{sr:44100,seed:3,f0lo:100,f0hi:200},{sr:48000,seed:4,f0lo:150,f0hi:300}]){
 const sr=T.sr,R=rng(99+T.seed),NN=10,ND=1.0,PD=0.5+HL+0.3,n=Math.round((0.5+NN*(ND+PD))*sr);
 const S=sing({sr,dur:ND+0.6,f0lo:T.f0lo,f0hi:T.f0hi,seed:T.seed,room:-140});
 const x=new Float64Array(n),room=new Float64Array(n),w=new Float64Array(n),holes=[];
 // Farbe: w=0 dunkel, w=1 hell; je Pause von w0 nach w1
 let wcur=R();for(let k=0;k<NN;k++){const t0=0.5+k*(ND+PD),i0=Math.round(t0*sr),i1=Math.round((t0+ND)*sr),i2=Math.round((t0+ND+PD)*sr),wn=wcur<0.5?0.6+0.4*R():0.4*R();
  for(let i=i0;i<i1;i++)w[i]=wcur;for(let i=i1;i<i2&&i<n;i++)w[i]=wcur+(wn-wcur)*(i-i1)/(i2-i1);
  // Note aus dem synthetischen Gesang (erste Note, verschoben)
  const N0=S.notes[0],s0=Math.round(N0.t0*sr),L=Math.min(i1-i0,Math.round((N0.t1-N0.t0)*sr));for(let i=0;i<L;i++)x[i0+i]+=S.x[s0+i];
  const h0=i1+Math.round(0.25*sr),h1=h0+Math.round(HL*sr);holes.push([h0,h1]);wcur=wn;}
 for(let i=0;i<Math.round(0.5*sr);i++)w[i]=w[Math.round(0.5*sr)];
 let d=0,hp=0,pv=0;const gR=Math.pow(10,-58/20);for(let i=0;i<n;i++){const z=R()*2-1;d=0.985*d+0.12*z;const h=z-pv;pv=z;room[i]=gR*((1-w[i])*d*1.6+w[i]*h*0.7);}
 for(let i=0;i<n;i++)x[i]+=room[i];const xin=Float32Array.from(x);for(const[a,b]of holes)for(let i=a;i<b;i++)xin[i]=0;
 const r=K.done(K.run(xin,sr,{steps:{room:O}})),y=r.y,H=r.info.room.holes;
 for(const[a,b]of holes){const L=b-a,t=Math.round(L/3),hit=H.find(h=>h.t0*sr<b&&h.t1*sr>a);
  const e1=err(bands(y,a,a+t,sr),bands(room,a,a+t,sr)),e3=err(bands(y,b-t,b,sr),bands(room,b-t,b,sr));res.push({e1,e3,hit:!!hit,dw:+(w[b]-w[a]).toFixed(2)});}
 for(let i=0;i<n&&same;i++)if(y[i]!==xin[i]&&!holes.some(([a,b])=>i>=a-sr*0.05&&i<b+sr*0.05))same=false;
}
const m=a=>a.reduce((p,q)=>p+q,0)/a.length,ok=res.filter(r=>r.e1<=2&&r.e3<=2).length;
console.log('Lücken',res.length,'gefüllt',res.filter(r=>r.hit).length,'Farbfehler Anfang Mittel',m(res.map(r=>r.e1)).toFixed(2),'Ende',m(res.map(r=>r.e3)).toFixed(2),'max',Math.max(...res.map(r=>Math.max(r.e1,r.e3))).toFixed(2),'beide Enden <=2 dB:',ok+'/'+res.length,'außerhalb gleich',same);
if(process.env.V)console.log(res.map(r=>r.e1.toFixed(1)+'/'+r.e3.toFixed(1)+'(dw '+r.dw+')').join(' '));
