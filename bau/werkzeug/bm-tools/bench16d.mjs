// CPU-Probe 3: 16x naiv -> CIC5 (R=8, Ganzzahl) -> 96 kHz -> Halbband 23 Taps -> 48 kHz. Eigene Rechnung.
export const OS=16, FS=48000;
const V=12, BLK=128, sec=10;
const SIN=new Float32Array(32*64+1); for(let i=0;i<=32*64;i++) SIN[i]=Math.sin(2*Math.PI*i/(32*64));
// Halbband 23 Taps (Blackman-gefensterte sinc), Mitte 0.5
const HL=+(process.env.HL||23), hb=new Float32Array(HL); { const c=(HL-1)/2; for(let i=0;i<HL;i++){ const x=i-c; const s=x===0?0.5:Math.sin(Math.PI*x/2)/(Math.PI*x); const w=0.42-0.5*Math.cos(2*Math.PI*i/(HL-1))+0.08*Math.cos(4*Math.PI*i/(HL-1)); hb[i]=s*w; } }
const nz=[]; for(let i=0;i<HL;i++) if(Math.abs(hb[i])>1e-9 && i!==(HL-1)/2) nz.push(i);
const SC=16384, GAIN=1/Math.pow(8,5)/SC;
export function makeVoice(f1,f2,M1,M2){ const b=m=>m===0?0:32-Math.clz32(m); return {p1:0,p2:0,i1:Math.round(f1/(FS*OS)*4294967296)>>>0,i2:Math.round(f2/(FS*OS)*4294967296)>>>0,M1,M2,b1:b(M1),b2:b(M2),
  I:new Int32Array(5), C:new Int32Array(5), hbuf:new Float32Array(2*HL), hp:0, rng:12345, nh:0, nv:0}; }
export function runVoice(vc, out, n0, cnt){ const I=vc.I, C=vc.C, hbuf=vc.hbuf; let p1=vc.p1,p2=vc.p2,hp=vc.hp,rng=vc.rng,nh=vc.nh,nv=vc.nv;
  const i1=vc.i1,i2=vc.i2,M1=vc.M1,M2=vc.M2,b1=vc.b1,b2=vc.b2,sh1=32-b1,sh2=32-b2;
  let i0=I[0],i1_=I[1],i2_=I[2],i3=I[3],i4=I[4];
  for(let n=0;n<cnt;n++){
    for(let half=0;half<2;half++){
      for(let j=0;j<8;j++){ p1=(p1+i1)>>>0; p2=(p2+i2)>>>0; const m1=(p1>>>sh1)&M1, m2=(p2>>>sh2)&M2;
        const y=(m1<32?SIN[(m1<<6)+((p1<<b1)>>>26)]:0)*0.5+(m2<32?SIN[(m2<<6)+((p2<<b2)>>>26)]:0)*0.5;
        const x=(y*SC)|0; i0=(i0+x)|0; i1_=(i1_+i0)|0; i2_=(i2_+i1_)|0; i3=(i3+i2_)|0; i4=(i4+i3)|0; }
      // Kamm bei 96 kHz
      let c=i4, t; t=c; c=(c-C[0])|0; C[0]=t; t=c; c=(c-C[1])|0; C[1]=t; t=c; c=(c-C[2])|0; C[2]=t; t=c; c=(c-C[3])|0; C[3]=t; t=c; c=(c-C[4])|0; C[4]=t;
      const v=c*GAIN; hbuf[hp]=v; hbuf[hp+HL]=v; if(++hp===HL) hp=0; }
    let y=0.5*hbuf[hp+(HL-1)/2]; for(let k=0;k<nz.length;k++){ const i=nz[k]; y+=hb[i]*hbuf[hp+i]; } out[n0+n]+=y; }
  I[0]=i0;I[1]=i1_;I[2]=i2_;I[3]=i3;I[4]=i4; vc.p1=p1;vc.p2=p2;vc.hp=hp;vc.rng=rng;vc.nh=nh;vc.nv=nv; }
if (process.argv[2]!=='lib'){
  const vs=[]; for(let v=0;v<V;v++) vs.push(makeVoice(110*2**(v/12),110.4*2**(v/12),78,255));
  const out=new Float32Array(BLK); const nb=Math.round(sec*FS/BLK);
  for(let i=0;i<400;i++){ out.fill(0); for(const vc of vs) runVoice(vc,out,0,BLK); }
  const t0=performance.now(); for(let i=0;i<nb;i++){ out.fill(0); for(const vc of vs) runVoice(vc,out,0,BLK); } const dt=performance.now()-t0;
  console.log(`CIC5+Halbband: 12 Stimmen ${(100*dt/(sec*1000)).toFixed(1)} % Echtzeit, je Stimme ${(100*dt/(sec*1000)/V).toFixed(2)} %`);
}
