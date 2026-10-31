// Referenz "wie am Geraet": naiv mit 16-facher Ueberabtastung, ideale Dezimierung (FFT), Faltungs-Anteil 0..20 kHz.
import {span} from './maskrule.mjs';
const W=2*Math.PI/32;
function fft(re,im){ const n=re.length; for(let i=1,j=0;i<n;i++){ let b=n>>1; for(;j&b;b>>=1) j^=b; j^=b; if(i<j){[re[i],re[j]]=[re[j],re[i]];[im[i],im[j]]=[im[j],im[i]];} }
  for(let len=2;len<=n;len<<=1){ const a=-2*Math.PI/len, wr=Math.cos(a), wi=Math.sin(a);
    for(let i=0;i<n;i+=len){ let cr=1,ci=0; for(let k=0;k<len/2;k++){ const ur=re[i+k],ui=im[i+k], xr=re[i+k+len/2]*cr-im[i+k+len/2]*ci, xi=re[i+k+len/2]*ci+im[i+k+len/2]*cr;
      re[i+k]=ur+xr; im[i+k]=ui+xi; re[i+k+len/2]=ur-xr; im[i+k+len/2]=ui-xi; const t=cr*wr-ci*wi; ci=cr*wi+ci*wr; cr=t; } } } }
export function naive(M, f0, fs, n){ const S=span(M), out=new Float64Array(n); let ph=0; const inc=f0/fs;
  for(let i=0;i<n;i++){ const s=ph*S, p=Math.floor(s), f=s-p, m=p&M; out[i]= m<32 ? Math.sin(W*(m+f)) : 0; ph+=inc; if(ph>=1) ph-=1; } return out; }
const OS=+(process.argv[2]||16), fs=48000, NO=16384, N=NO*OS;
for (const [name,k] of [['C4',89],['C6',357],['C7',714]]){
  const f0=k*fs/NO; const row=[];
  for (const M of [7,8,31,78,255,511]){
    const x=naive(M,f0,fs*OS,N); const im=new Float64Array(N); fft(x,im);
    let h=0,a=0; const lim=Math.floor(20000/(fs/NO));
    for(let b=1;b<=lim;b++){ const e=x[b]*x[b]+im[b]*im[b]; if(b%k===0) h+=e; else a+=e; }
    row.push(`M${M}: ${(10*Math.log10(a/h)).toFixed(1)}`);
  }
  console.log(`${OS}x ${name} (${f0.toFixed(1)} Hz) Faltung re Nutzsignal [dB]:`, row.join('  '));
}
