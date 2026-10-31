// Pruefung der Masken-Regel mit 9 Bit (0..511). Eigene Rechnung.
import {fastAmps} from './fastbuild.mjs';
import {span} from './maskrule.mjs';
const H=512, c=[], rms=[], kmx=[];
for(let M=0;M<512;M++){ const a=fastAmps(M,H,32768); let n=0,d=0,km=1; for(let k=1;k<=H;k++){n+=k*a[k]*a[k]; d+=a[k]*a[k]; if(a[k]>a[km]) km=k;} c.push(n/d); rms.push(10*Math.log10(d/2/0.5)); kmx.push(km); }
let ok=0,bad=[]; for(let k=1;k<=32;k++){ const M=16*k-1; const l=c[M-1], r=M+1<512?c[M+1]:Infinity; if(c[M]<l&&c[M]<r) ok++; else bad.push(M); }
console.log('16k-1 lokale Minima (0..511):', ok,'/32', bad.length?'Ausnahmen '+bad:'');
let minSp=1; const sp=[]; for(let b=1;b<32;b++){ const v=c.slice(16*b,16*b+16); const idx=[...v.keys()].sort((x,y)=>v[x]-v[y]); const rank=[]; idx.forEach((i,j)=>rank[i]=j); let d2=0; for(let i=0;i<16;i++) d2+=(rank[i]-i)**2; const s=1-6*d2/(16*255); sp.push(s); minSp=Math.min(minSp,s);} console.log('Rang-Korrelation Bloecke 1..31: max (am schwaechsten)', Math.max(...sp).toFixed(2));
const act=M=>{let pc=0; for(let b=5;b<9;b++) if(M&(1<<b)) pc++; return 1/(1<<pc);};
const mean=(a,b,f)=>{let s=0; for(let m=a;m<b;m++) s+=f(m); return s/(b-a);};
console.log('klingender Anteil Mittel 0-255 / 256-511:', mean(0,256,act).toFixed(3), mean(256,512,act).toFixed(3));
console.log('Schwerpunkt Mittel 0-255 / 256-511:', mean(0,256,m=>c[m]).toFixed(1), mean(256,512,m=>c[m]).toFixed(1));
const s=rms.slice().sort((x,y)=>x-y); console.log('RMS dB re Sinus 0..511: min', s[0].toFixed(1), 'median', s[256].toFixed(1));
console.log('Beispiele kmax: 511→', kmx[511], ' 287(256+31)→', kmx[287], ' 271(256+15)→', kmx[271], ' 264(256+8)→', kmx[264]);
// gleiche Werte fuer 0..255 wie mit 8 Bit? (Regel haengt nur von M ab)
console.log('Span 255/256/511:', span(255), span(256), span(511));
