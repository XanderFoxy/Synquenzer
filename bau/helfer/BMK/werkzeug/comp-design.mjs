import {hbKaiser} from './hb-design.mjs';
const cic=(f,fsIn)=>{ const x=Math.PI*f/fsIn; if(x<1e-12) return 1; return Math.pow(Math.sin(8*x)/(8*Math.sin(x)),5); };
const resp=(h,f,fs)=>{let re=0;const c=(h.length-1)/2;for(let i=0;i<h.length;i++){re+=h[i]*Math.cos(2*Math.PI*f/fs*(i-c));}return re;};
for(const [fs,L,b] of [[48000,27,7],[44100,31,6.5]]){ const h=hbKaiser(L,b); let s=0; for(const x of h) s+=x; 
  const D=f=>cic(f,16*fs)*resp(h,f,2*fs)/ (s);
  for(const nt of [1,2]){ // number of cos terms
    // minimize max |20log(D*H)| on 0..16k with H(0)=1 : grid search via least squares on log? do LS on linear then minimax refine
    const F=[]; for(let f=0;f<=16000;f+=100) F.push(f);
    let best=null;
    const ev=c=>{let w=0; for(const f of F){ const om=2*Math.PI*f/fs; let H=1; for(let k=1;k<=nt;k++) H+=c[k-1]*(Math.cos(k*om)-1)*2; const e=Math.abs(20*Math.log10(D(f)*H)); if(e>w) w=e;} return w;};
    // random search
    let c=new Array(nt).fill(0); let e=ev(c); let st=.05;
    for(let it=0;it<20000;it++){ const d=c.map(x=>x+(Math.random()-.5)*st); const e2=ev(d); if(e2<e){c=d;e=e2;} if(it%2000===1999) st*=.6; }
    console.log(fs,'HB',L,'comp',nt,'coef',c.map(x=>x.toFixed(6)).join(','),'maxdev dB',e.toFixed(3), 'DC gain hb', s.toFixed(6));
  } }
