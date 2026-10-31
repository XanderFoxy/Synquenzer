// CPU-Probe: 12 Stimmen x (2 Masken-Osz. + Rauschen) mit 16x naiv + Halbband-Kaskade 16->1. Eigene Rechnung.
const OS=16, FS=48000, V=12, BLK=128;
const SIN=new Float32Array(32*64+1); for(let i=0;i<=32*64;i++) SIN[i]=Math.sin(2*Math.PI*i/(32*64));
// Halbband-Kaskade: 4 Stufen 2:1, Laengen 7, 11, 15, 31 (gefensterte sinc, ungerade Taps 0 ausser Mitte)
function hb(n){ const h=new Float32Array(n), c=(n-1)/2; for(let i=0;i<n;i++){ const x=i-c; const s= x===0?0.5: Math.sin(Math.PI*x/2)/(Math.PI*x); const w=0.42-0.5*Math.cos(2*Math.PI*i/(n-1))+0.08*Math.cos(4*Math.PI*i/(n-1)); h[i]=s*w; } return h; }
const H=[hb(7),hb(11),hb(15),hb(31)];
class Dec{ constructor(){ this.st=H.map(h=>({h, buf:new Float32Array(h.length*2), pos:0})); }
  stage(s, x0, x1){ const b=s.buf, n=s.h.length; b[s.pos]=x0; b[s.pos+n]=x0; s.pos=(s.pos+1)%n; b[s.pos]=x1; b[s.pos+n]=x1; s.pos=(s.pos+1)%n;
    let y=0; const h=s.h; for(let i=0;i<n;i++) y+=h[i]*b[s.pos+i]; return y; }
}
const voices=[]; for(let v=0;v<V;v++) voices.push({p1:Math.random()*4294967296>>>0, p2:0, i1:Math.round((110*Math.pow(2,v/12))/(FS*OS)*4294967296)>>>0, i2:Math.round((110.4*Math.pow(2,v/12))/(FS*OS)*4294967296)>>>0, M1:78, M2:255, b1:7, b2:8, rng:12345+v, nh:0, nv:0, dec:new Dec(), tmp:new Float32Array(OS)});
function block(out){ out.fill(0); for(const vc of voices){ const t=vc.tmp, d=vc.dec;
  for(let n=0;n<BLK;n++){
    for(let j=0;j<OS;j++){ vc.p1=(vc.p1+vc.i1)>>>0; vc.p2=(vc.p2+vc.i2)>>>0;
      const s1=vc.p1>>>(32-vc.b1), f1=((vc.p1<<vc.b1)>>>26), m1=s1&vc.M1; const y1= m1<32 ? SIN[(m1<<6)+f1] : 0;
      const s2=vc.p2>>>(32-vc.b2), f2=((vc.p2<<vc.b2)>>>26), m2=s2&vc.M2; const y2= m2<32 ? SIN[(m2<<6)+f2] : 0;
      if(++vc.nh>=3){ vc.nh=0; vc.rng^=vc.rng<<13; vc.rng^=vc.rng>>>17; vc.rng^=vc.rng<<5; vc.nv=(vc.rng|0)/2147483648; }
      t[j]=0.5*y1+0.5*y2+0.1*vc.nv; }
    // 16 -> 8 -> 4 -> 2 -> 1
    let a=t, len=OS; for(let s=0;s<4;s++){ for(let i=0;i<len/2;i++) a[i]=d.stage(d.st[s], a[2*i], a[2*i+1]); len/=2; }
    out[n]+=a[0]; } } }
const out=new Float32Array(BLK); for(let i=0;i<200;i++) block(out);
const sec=10, nb=Math.round(sec*FS/BLK); const t0=performance.now(); for(let i=0;i<nb;i++) block(out); const dt=performance.now()-t0;
console.log(`12 Stimmen, 16x, ${sec} s Audio: ${dt.toFixed(0)} ms Rechenzeit = ${(100*dt/(sec*1000)).toFixed(1)} % Echtzeit (je Stimme ${(100*dt/(sec*1000)/V).toFixed(2)} %)`);
