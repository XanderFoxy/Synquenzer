// Entwurf Halbband (Kaiser-Fenster, Halbband-Struktur) + CIC5 R=8 + Ausgleichs-FIR; eigene Rechnung.
const cic=(f,fsIn)=>{ const x=Math.PI*f/fsIn; if(x<1e-12) return 1; return Math.pow(Math.sin(8*x)/(8*Math.sin(x)),5); };
function I0(x){let s=1,t=1;for(let k=1;k<50;k++){t*=(x/2/k)**2;s+=t;}return s;}
export function hbKaiser(L,beta){const c=(L-1)/2,h=new Float64Array(L);for(let i=0;i<L;i++){const x=i-c;const s=x===0?.5:Math.sin(Math.PI*x/2)/(Math.PI*x);const w=I0(beta*Math.sqrt(1-((i-c)/c)**2))/I0(beta);h[i]=s*w;}return h;}
const resp=(h,f,fs)=>{let re=0,im=0;const c=(h.length-1)/2;for(let i=0;i<h.length;i++){const w=2*Math.PI*f/fs*(i-c);re+=h[i]*Math.cos(w);}return re;};
export function evalChain(fs,h){ const fs2=2*fs, fs16=16*fs;
  // worst alias: tone f in (0,8fs) at 16x; output freq after decimation folding to 0..fs/2; only those landing in 0..16k
  let worst=-999, wf=0; for(let f=100; f<8*fs; f+=50){ // tone at 16x rate
    // fold to 2fs domain
    let g=Math.abs(cic(f,fs16)); let f2=f%fs2; if(f2>fs) f2=fs2-f2; // at 96k
    g*=Math.abs(resp(h,f2,fs2)); let f1=f2%fs; if(f1>fs/2) f1=fs-f1;
    if(f>=fs/2-1 && f1<=16000){ const d=20*Math.log10(g+1e-20); if(d>worst){worst=d;wf=f;} } }
  const pb=[]; for(const f of [1000,5000,10000,12000,14000,16000]) pb.push(20*Math.log10(Math.abs(cic(f,fs16)*resp(h,f,fs2))));
  return {worst,wf,pb}; }
if(process.argv[2]==='scan') for(const fs of [48000,44100]) for(const L of [23,27,31]) { let best=null; for(let b=3;b<=10;b+=.25){ const h=hbKaiser(L,b); const r=evalChain(fs,h); const pbmin=Math.min(...r.pb.map((x,i)=>x)); const sc=r.worst; if(!best||sc<best.r.worst) best={b,r}; } console.log(fs,L,'beta',best.b,'worst',best.r.worst.toFixed(1),'@',best.r.wf,'pb',best.r.pb.map(x=>x.toFixed(2)).join(' ')); }
