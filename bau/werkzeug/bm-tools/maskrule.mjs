// Eigene Masken-Regel (Annahme) – Pruefung der Handbuch-Anker. Keine Handbuchinhalte.
const W = 2*Math.PI/32;
export const span = M => M===0 ? 1 : 1 << (32 - Math.clz32(M));
// komplexe Hilfen
const E = x => Math.abs(x)<1e-12 ? [1,0] : [Math.sin(x)/x, (1-Math.cos(x))/x]; // (e^{ix}-1)/(ix)
export function amps(M, H=256){
  const S=span(M), re=new Float64Array(H+1), im=new Float64Array(H+1);
  for(let p=0;p<S;p++){ const m=p&M; if(m>=32) continue;
    for(let k=0;k<=H;k++){ const b=2*Math.PI*k/S;
      const [e1r,e1i]=E(W-b), [e2r,e2i]=E(-W-b);
      const c1r=Math.cos(W*m), c1i=Math.sin(W*m), c2r=Math.cos(-W*m), c2i=Math.sin(-W*m);
      // A = e^{iWm}E(W-b) - e^{-iWm}E(-W-b)
      const Ar=(c1r*e1r-c1i*e1i)-(c2r*e2r-c2i*e2i), Ai=(c1r*e1i+c1i*e1r)-(c2r*e2i+c2i*e2r);
      // seg = A/(2i) = (Ai - i Ar)/2
      const sr=Ai/2, si=-Ar/2; const pr=Math.cos(-b*p), pi=Math.sin(-b*p);
      re[k]+=pr*sr-pi*si; im[k]+=pr*si+pi*sr; } }
  const a=new Float64Array(H+1); for(let k=0;k<=H;k++) a[k]=(k?2:1)*Math.hypot(re[k],im[k])/S;
  return a; // a[0]=DC, a[k]=Amplitude Teilton k
}
export const centroid = a => { let n=0,d=0; for(let k=1;k<a.length;k++){n+=k*a[k]*a[k]; d+=a[k]*a[k];} return d? n/d : 0; };
const db = x => 20*Math.log10(Math.max(x,1e-15));
if (process.argv[2]==='anchors'){
  for (const M of [0,1,3,7,8,15,16,20,24,25,28,29,30,31,32,47,48,56,63,64,72,78,79,95,120,127,248,255]){
    const a=amps(M,128); let kmax=1; for(let k=1;k<=128;k++) if(a[k]>a[kmax]) kmax=k;
    let rms=0; for(let k=1;k<=128;k++) rms+=a[k]*a[k]/2; rms=Math.sqrt(rms);
    let ev=0; for(let k=2;k<=14;k+=2) ev=Math.max(ev,a[k]);
    const rel=[1,2,3,4,5,6,7,8].map(k=>db(a[k]/a[1]).toFixed(1)).join(' ');
    console.log(`M${String(M).padStart(3)} span${String(span(M)).padStart(4)} kmax=${String(kmax).padStart(2)} rms=${rms.toFixed(3)} (${db(rms/0.7071).toFixed(1)} dB re Sinus) DC=${a[0].toFixed(3)} cen=${centroid(a).toFixed(2)} | h1..8 dB re h1: ${rel} | even2-14 max ${db(ev/a[1]).toFixed(1)}`);
  }
}
if (process.argv[2]==='cent'){
  const c=[]; for(let M=0;M<256;M++) c.push(centroid(amps(M,256)));
  let ok=0, bad=[]; for(let k=1;k<=16;k++){ const M=16*k-1; const l=c[M-1], r=M+1<256?c[M+1]:Infinity; if(c[M]<l && c[M]<r) ok++; else bad.push(M); }
  console.log('16k-1 lokale Minima:', ok, '/16 ; Ausnahmen', bad.join(','));
  console.log('cent 15,31,47,63,79,95,111,127,143:', [15,31,47,63,79,95,111,127,143].map(m=>c[m].toFixed(2)).join(' '));
  console.log('cent 16,32,48,64,80,96,112,128,144:', [16,32,48,64,80,96,112,128,144].map(m=>c[m].toFixed(2)).join(' '));
  // Block-Trend: Mittel der Schwerpunkte je 32er-Block
  const blk=[]; for(let b=0;b<8;b++){ let s=0; for(let m=32*b;m<32*b+32;m++) s+=c[m]; blk.push((s/32).toFixed(1)); } console.log('Mittel je 32er-Block:', blk.join(' '));
  // innerhalb 16er-Block faellt Schwerpunkt zum Ende? Spearman je Block
  const sp=[]; for(let b=0;b<16;b++){ const v=c.slice(16*b,16*b+16); const idx=[...v.keys()]; const r=idx.slice().sort((x,y)=>v[x]-v[y]); const rank=new Array(16); r.forEach((i,j)=>rank[i]=j); let d2=0; for(let i=0;i<16;i++) d2+=(rank[i]-i)**2; sp.push((1-6*d2/(16*(256-1))).toFixed(2)); } console.log('Spearman(Index,Schwerpunkt) je 16er-Block:', sp.join(' '));
  // Lautheit: rms in dB re Sinus, Verteilung
  const rr=[]; for(let M=0;M<256;M++){ const a=amps(M,256); let s=0; for(let k=1;k<=256;k++) s+=a[k]*a[k]/2; rr.push(db(Math.sqrt(s)/0.7071)); }
  const sorted=rr.slice().sort((x,y)=>x-y); console.log('RMS dB re Sinus: min',sorted[0].toFixed(1),'p10',sorted[25].toFixed(1),'median',sorted[128].toFixed(1),'max',sorted[255].toFixed(1));
  console.log('leiseste:', rr.map((v,i)=>[v,i]).sort((x,y)=>x[0]-y[0]).slice(0,8).map(([v,i])=>i+':'+v.toFixed(1)).join(' '));
}
if (process.argv[2]==='stats'){
  const out=[];
  for(let M=0;M<256;M++){ const a=amps(M,256); let kmax=1; for(let k=1;k<=256;k++) if(a[k]>a[kmax]) kmax=k;
    let s=0; for(let k=1;k<=256;k++) s+=a[k]*a[k]/2;
    const hi=M&0xE0; let pc=0; for(let b=5;b<8;b++) if(hi&(1<<b)) pc++;
    out.push({m:M, span:span(M), aktiv:+(1/(1<<pc)).toFixed(4), kmax, okt:Math.round(Math.log2(kmax)), sp:+centroid(a).toFixed(3), rmsDb:+(20*Math.log10(Math.sqrt(s)/Math.SQRT1_2)).toFixed(2), dc:+a[0].toFixed(4), gerade0: (M&16)&&M<32 ? 1:0});
  }
  const fs=await import('node:fs'); fs.writeFileSync('mask-stats.json', JSON.stringify(out));
  const okt=[0,0,0,0,0,0,0,0,0]; out.forEach(o=>okt[o.okt]++); console.log('Oktav-Hinweis Verteilung (0..8):', okt.join(' '));
  console.log('Beispiele', [7,8,15,24,28,31,56,63,78,95,120,127,248,255].map(m=>`${m}:k${out[m].kmax}/o+${out[m].okt}/${out[m].rmsDb}dB`).join('  '));
}
