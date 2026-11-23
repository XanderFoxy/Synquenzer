// Warum wird ein Plopp nicht erkannt? je Stoß: beste Rahmen-Werte gegen die Schwellen von plopFind
import {loadK} from './kern.mjs';import {sing,rng} from './gen.mjs';
const K=loadK(process.argv[2]),TAU=2*Math.PI,lv=+(process.env.LV||-6),TI=+(process.env.TI||0);
const TAKES=[{nm:'A tief 44k',sr:44100,dur:30,f0lo:90,f0hi:170,seed:11},{nm:'A2 tief 48k',sr:48000,dur:30,f0lo:85,f0hi:150,seed:23,breathy:0.02},{nm:'B mittel 48k',sr:48000,dur:30,f0lo:150,f0hi:280,seed:5},{nm:'C hoch 44k',sr:44100,dur:30,f0lo:220,f0hi:420,seed:7,breathy:0.06}];
const T=TAKES[TI],S=sing(T),v=S.x,sr=S.sr,R=rng(4242+T.seed+lv*7),x=Float32Array.from(v),PL=[];const ns=S.notes.filter(N=>N.t0>0.6&&N.t0<T.dur-1.5),step=ns.length/10;
for(let k=0;k<10;k++){const N=ns[Math.floor(k*step)],f=25+R()*45,d=0.025+R()*0.045,lead=0.005+R()*0.02,t=N.t0-lead,i0=Math.round(t*sr),M=Math.round(d*sr),amp=0.25*Math.pow(10,(lv+R()*4-2)/20),sg=R()<0.5?-1:1,ph=R()*0.6;
  for(let i=0;i<M;i++){const tt=i/sr,w=Math.min(1,tt/0.003)*Math.pow(1-i/M,2);x[i0+i]+=sg*amp*w*Math.sin(TAU*f*tt+ph);}PL.push({t,s0:i0,s1:i0+M,f,d});}
const Fe=K.done(K.feats(x,sr)),R2=Fe.R,nf=Fe.nf,fps=sr/Fe.H,LF=R2.sub,pct=(a,p)=>{const b=Array.from(a).filter(Number.isFinite).sort((p,q)=>p-q);return b[Math.floor(p*(b.length-1))];};
const med=(a,i0,i1)=>{i0=Math.max(0,i0);i1=Math.min(a.length,i1);if(i1-i0<3)return null;const b=Array.from(a.slice(i0,i1)).sort((p,q)=>p-q);return b[b.length>>1];};
const flo=pct(LF,0.1),top=pct(R2.tot,0.99);console.log('flo',flo.toFixed(1),'top',top.toFixed(1),'top-20',(top-20).toFixed(1));
const ev=K.plopFind(Fe,{});
for(const c of PL){const j0=Math.floor(c.s0/Fe.H),j1=Math.ceil(c.s1/Fe.H);let rows=[];
  for(let j=j0;j<=j1;j++){const lb=med(LF,j-Math.round(0.25*fps),j-Math.round(0.03*fps)),la=med(LF,j+Math.round(0.1*fps),j+Math.round(0.3*fps)),lbase=Math.max(lb??-200,la??-200);
    rows.push(`${LF[j].toFixed(0)}|${(LF[j]-R2.tot[j]).toFixed(0)}|${(LF[j]-lbase).toFixed(0)}(${(lb??0).toFixed(0)}/${(la??0).toFixed(0)})`);}
  const hit=ev.some(e=>e.t1*sr>=c.s0&&e.t0*sr<=c.s1);console.log((hit?'OK  ':'MISS')+' t'+c.t.toFixed(2)+' f'+c.f.toFixed(0)+' d'+(c.d*1000).toFixed(0)+'  LF|LF-tot|ex(lb/la): '+rows.join(' '));}
