// Schneller Tabellenbau: flaechengemittelte Abtastung (exakt) + FFT + Box-Korrektur. Vergleich mit amps().
import {amps, span} from './maskrule.mjs';
const W=2*Math.PI/32;
function fft(re,im){ const n=re.length; for(let i=1,j=0;i<n;i++){ let b=n>>1; for(;j&b;b>>=1) j^=b; j^=b; if(i<j){[re[i],re[j]]=[re[j],re[i]];[im[i],im[j]]=[im[j],im[i]];} }
  for(let len=2;len<=n;len<<=1){ const a=-2*Math.PI/len, wr=Math.cos(a), wi=Math.sin(a);
    for(let i=0;i<n;i+=len){ let cr=1,ci=0; for(let k=0;k<len/2;k++){ const ur=re[i+k],ui=im[i+k], xr=re[i+k+len/2]*cr-im[i+k+len/2]*ci, xi=re[i+k+len/2]*ci+im[i+k+len/2]*cr;
      re[i+k]=ur+xr; im[i+k]=ui+xi; re[i+k+len/2]=ur-xr; im[i+k+len/2]=ui-xi; const t=cr*wr-ci*wi; ci=cr*wi+ci*wr; cr=t; } } } }
export function fastAmps(M,H=1024,N=8192){
  const S=span(M), per=N/S, re=new Float64Array(N), im=new Float64Array(N);
  for(let p=0;p<S;p++){ const m=p&M; if(m>=32) continue;
    for(let j=0;j<per;j++){ const t0=j/per, t1=(j+1)/per; re[p*per+j]=(Math.cos(W*(m+t0))-Math.cos(W*(m+t1)))/W*per; } }
  fft(re,im); const a=new Float64Array(H+1);
  for(let k=0;k<=H;k++){ const x=Math.PI*k/N, sc=k? Math.sin(x)/x : 1; a[k]=(k?2:1)*Math.hypot(re[k],im[k])/N/sc; }
  return a;
}
const t0=performance.now(); for(let m=0;m<256;m++) fastAmps(m); const dt=performance.now()-t0;
let worst=-999, wm=0; for(const m of [7,8,15,25,28,31,56,63,78,120,248,255]){ const A=amps(m,1024), B=fastAmps(m); let e=0,r=0; for(let k=1;k<=1024;k++){ e+=(A[k]-B[k])**2; r+=A[k]**2; } const d=10*Math.log10(e/r); if(d>worst){worst=d;wm=m;} }
console.log('alle 256 Masken schnell:', dt.toFixed(0),'ms (', (dt/256).toFixed(2),'ms je Maske ); groesste Abweichung zur genauen Formel', worst.toFixed(1),'dB bei Maske',wm);
