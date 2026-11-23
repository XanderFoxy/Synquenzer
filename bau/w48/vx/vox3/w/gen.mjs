// Synthetischer Gesang: Glottis-Pulse (Rosenberg, harter Schluss) -> Formanten; Noten mit Vibrato/Gleiten, Pausen mit Raumton + Atem.
const TAU=2*Math.PI;
export function rng(s){return()=>{s=(s*1103515245+12345)>>>0;return s/4294967296;};}
const V={a:[730,1090,2440,3400,4200],o:[570,840,2410,3300,4000],u:[300,870,2240,3200,4000],e:[530,1840,2480,3400,4200],i:[270,2290,3010,3500,4300]},BWs=[80,90,120,160,220];
function res(f,bw,sr){const r=Math.exp(-Math.PI*bw/sr),c=2*r*Math.cos(TAU*f/sr);return[c,-r*r,1-c+r*r];}
// voice: {sr,dur,f0lo,f0hi,seed,breathy,room(dB),tilt}
export function sing(o){
  const sr=o.sr,n=Math.round(o.dur*sr),x=new Float64Array(n),R=rng(o.seed||1),notes=[],gaps=[];
  let t=0.4;while(t<o.dur-1){const L=0.5+R()*1.3;notes.push({t0:t,t1:Math.min(o.dur-0.5,t+L),f:o.f0lo*Math.pow(o.f0hi/o.f0lo,R()),v:'aoeui'[Math.floor(R()*5)],g:0.6+0.4*R()});t+=L;const P=0.15+R()*0.55;gaps.push([t,t+P]);t+=P;}
  for(const N of notes){const i0=Math.round(N.t0*sr),i1=Math.round(N.t1*sr),F=V[N.v].map((f,k)=>res(f*(N.v==='a'||N.v==='o'?1:1),BWs[k],sr)),st=F.map(()=>[0,0]);
    let ph=0,prev=0,amp=1+0.03*(R()-0.5),Tcur=sr/N.f,pc=0;const fs=N.f*(1+0.06*(R()-0.5)),vibP=R()*TAU;
    for(let i=i0;i<i1;i++){const tt=(i-i0)/sr,Ln=(i1-i0)/sr,env=Math.min(1,tt/0.04)*Math.min(1,(Ln-tt)/0.06);
      const glide=tt<0.08?fs+(N.f-fs)*tt/0.08:N.f,vib=tt>0.3?Math.pow(2,0.025*Math.sin(TAU*5.5*tt+vibP)):1,f=glide*vib;
      const pph=ph;ph+=1/Tcur;let gci=(pph<0.58&&ph>=0.58)?-(o.gci||0)*amp:0;if(ph>=1){ph-=1;Tcur=sr/f*(1+0.006*(R()-0.5));amp=1+0.06*(R()-0.5);}
      const Tp=0.42,Tn=0.16;let g=ph<Tp?0.5-0.5*Math.cos(Math.PI*ph/Tp):ph<Tp+Tn?Math.cos(Math.PI*(ph-Tp)/(2*Tn)):0;
      const asp=(o.breathy||0.03)*(R()*2-1)*(ph<Tp+Tn?1:0.3);
      let s=(g-prev)*amp*N.g+gci*N.g+asp*N.g*0.15;prev=g;
      for(let k=0;k<F.length;k++){const c=F[k],z=st[k],y=c[2]*s+c[0]*z[0]+c[1]*z[1];z[1]=z[0];z[0]=y;s=y;}
      x[i]+=s*env;}}
  // Pegel: Gesang ~ -14 dBFS
  let e=0,c=0;for(const N of notes){for(let i=Math.round(N.t0*sr);i<Math.round(N.t1*sr);i++){e+=x[i]*x[i];c++;}}const g=0.2/Math.sqrt(e/c);for(let i=0;i<n;i++)x[i]*=g;
  // Raumton (leicht rosa) + Atem in manchen Pausen
  const rt=Math.pow(10,(o.room||-62)/20);let b0=0,b1=0;for(let i=0;i<n;i++){const w=R()*2-1;b0=0.97*b0+w*0.25;b1=0.6*b1+w;x[i]+=rt*(0.7*b0+0.5*b1);}
  for(const[a,b]of gaps)if(R()<0.4){const i0=Math.round((a+0.03)*sr),M=Math.round(Math.min(0.25,b-a-0.06)*sr);let z=0,z2=0;for(let i=0;i<M;i++){const w=R()*2-1;z=0.5*z+w;z2=w-0.9*z2;x[i0+i]+=0.004*Math.sin(Math.PI*i/M)*(z-z2*0.5);}}
  return{x:Float32Array.from(x),sr,notes,gaps};
}
