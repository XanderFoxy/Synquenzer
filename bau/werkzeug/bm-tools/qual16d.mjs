import {makeVoice, runVoice, FS} from './bench16d.mjs';
function fft(re,im){ const n=re.length; for(let i=1,j=0;i<n;i++){ let b=n>>1; for(;j&b;b>>=1) j^=b; j^=b; if(i<j){[re[i],re[j]]=[re[j],re[i]];[im[i],im[j]]=[im[j],im[i]];} }
  for(let len=2;len<=n;len<<=1){ const a=-2*Math.PI/len, wr=Math.cos(a), wi=Math.sin(a);
    for(let i=0;i<n;i+=len){ let cr=1,ci=0; for(let k=0;k<len/2;k++){ const ur=re[i+k],ui=im[i+k], xr=re[i+k+len/2]*cr-im[i+k+len/2]*ci, xi=re[i+k+len/2]*ci+im[i+k+len/2]*cr;
      re[i+k]=ur+xr; im[i+k]=ui+xi; re[i+k+len/2]=ur-xr; im[i+k+len/2]=ui-xi; const t=cr*wr-ci*wi; ci=cr*wi+ci*wr; cr=t; } } } }
const NO=16384, warm=4096;
for (const [name,k] of [['C4',89],['C6',357],['C7',714]]){ const f0=k*FS/NO; const row=[];
  for (const M of [7,8,78,255]){ const vc=makeVoice(f0,f0,M,M); const out=new Float32Array(NO+warm); runVoice(vc,out,0,NO+warm);
    const re=Float64Array.from(out.subarray(warm)), im=new Float64Array(NO); fft(re,im);
    let h=0,a=0; const lim=Math.floor((+process.env.LIM||20000)/(FS/NO)); for(let b=1;b<=lim;b++){ const e=re[b]**2+im[b]**2; if(b%k===0) h+=e; else a+=e; }
    // Daempfung des 16 kHz-nahen Teiltons gegen den Grundton? -> Sägen-Neigung pruefen
    row.push(`M${M}: ${(10*Math.log10(a/h)).toFixed(1)}`); }
  console.log(`Kette CIC5+HB ${name}:`, row.join('  ')); }
// Durchlass: Sinus (M31) bei 1k, 10k, 16k, 20k
for (const f of [1000,10000,16000,18000,20000]){ const k=Math.round(f/(FS/NO)); const vc=makeVoice(k*FS/NO,k*FS/NO,31,31); const out=new Float32Array(NO+warm); runVoice(vc,out,0,NO+warm);
  let s=0; for(let i=warm;i<NO+warm;i++) s+=out[i]*out[i]; console.log(`Durchlass ${f} Hz: ${(10*Math.log10(s/NO/0.5)).toFixed(2)} dB`); }
