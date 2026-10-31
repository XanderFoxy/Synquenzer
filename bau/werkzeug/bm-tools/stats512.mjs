import {fastAmps} from './fastbuild.mjs';
import {span} from './maskrule.mjs';
import fs from 'node:fs';
const out=[];
for(let M=0;M<512;M++){ const a=fastAmps(M,512,32768); let km=1,n=0,d=0; for(let k=1;k<=512;k++){ if(a[k]>a[km]) km=k; n+=k*a[k]*a[k]; d+=a[k]*a[k]; }
  let pc=0; for(let b=5;b<9;b++) if(M&(1<<b)) pc++;
  out.push({m:M, span:span(M), aktiv:+(1/(1<<pc)).toFixed(4), kmax:km, sp:+(n/d).toFixed(3), rmsDb:+(10*Math.log10(d/2/0.5)).toFixed(2), dc:+a[0].toFixed(4)}); }
fs.writeFileSync('mask-stats.json', JSON.stringify(out)); console.log('mask-stats.json: 512 Masken');
