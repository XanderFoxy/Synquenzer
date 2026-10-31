// CPU-Probe 2: direktes 16:1-FIR (Kaiser, L Taps) je Stimme. Eigene Rechnung.
const OS=16, FS=48000, V=12, BLK=128, L=+(process.argv[2]||176);
const SIN=new Float32Array(32*64+1); for(let i=0;i<=32*64;i++) SIN[i]=Math.sin(2*Math.PI*i/(32*64));
function i0(x){ let s=1,t=1; for(let k=1;k<30;k++){ t*=(x/2)/k; s+=t*t; } return s; }
const beta=5.65, fc=24000/(FS*OS); const h=new Float32Array(L); let sum=0;
for(let i=0;i<L;i++){ const x=i-(L-1)/2; const s= x===0? 2*fc : Math.sin(2*Math.PI*fc*x)/(Math.PI*x); const w=i0(beta*Math.sqrt(1-((2*i/(L-1))-1)**2))/i0(beta); h[i]=s*w; sum+=h[i]; } for(let i=0;i<L;i++) h[i]/=sum;
export {h};
const voices=[]; for(let v=0;v<V;v++) voices.push({p1:0, p2:0, i1:Math.round((110*Math.pow(2,v/12))/(FS*OS)*4294967296)>>>0, i2:Math.round((110.4*Math.pow(2,v/12))/(FS*OS)*4294967296)>>>0, M1:78, M2:255, b1:7, b2:8, rng:12345+v, nh:0, nv:0, buf:new Float32Array(2*L), pos:0, g1:0.5, g2:0.5, g3:0.1});
function block(out){ out.fill(0); for(const vc of voices){ const buf=vc.buf;
  let p1=vc.p1,p2=vc.p2,pos=vc.pos,rng=vc.rng,nh=vc.nh,nv=vc.nv; const i1=vc.i1,i2=vc.i2,M1=vc.M1,M2=vc.M2,b1=vc.b1,b2=vc.b2,sh1=32-b1,sh2=32-b2,g1=vc.g1,g2=vc.g2,g3=vc.g3;
  for(let n=0;n<BLK;n++){
    for(let j=0;j<OS;j++){ p1=(p1+i1)>>>0; p2=(p2+i2)>>>0;
      const m1=(p1>>>sh1)&M1, m2=(p2>>>sh2)&M2;
      const y1= m1<32 ? SIN[(m1<<6)+((p1<<b1)>>>26)] : 0; const y2= m2<32 ? SIN[(m2<<6)+((p2<<b2)>>>26)] : 0;
      if(++nh>=3){ nh=0; rng^=rng<<13; rng^=rng>>>17; rng^=rng<<5; nv=(rng|0)*4.656612873e-10; }
      const x=g1*y1+g2*y2+g3*nv; buf[pos]=x; buf[pos+L]=x; if(++pos===L) pos=0; }
    let y=0; for(let k=0;k<L;k++) y+=h[k]*buf[pos+k]; out[n]+=y; }
  vc.p1=p1;vc.p2=p2;vc.pos=pos;vc.rng=rng;vc.nh=nh;vc.nv=nv; } }
if (process.argv[3]!=='nobench'){
const out=new Float32Array(BLK); for(let i=0;i<400;i++) block(out);
const sec=10, nb=Math.round(sec*FS/BLK); const t0=performance.now(); for(let i=0;i<nb;i++) block(out); const dt=performance.now()-t0;
console.log(`L=${L}: 12 Stimmen 16x, ${(100*dt/(sec*1000)).toFixed(1)} % Echtzeit, je Stimme ${(100*dt/(sec*1000)/V).toFixed(2)} %`);
}
