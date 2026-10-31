const OS=16, FS=48000, V=12, BLK=128, L=176, sec=5, nb=Math.round(sec*FS/BLK);
const SIN=new Float32Array(32*64+1); for(let i=0;i<=32*64;i++) SIN[i]=Math.sin(2*Math.PI*i/(32*64));
const h=new Float32Array(L).fill(1/L); const buf=new Float32Array(2*L*V); const tmp=new Float32Array(OS*BLK);
function osc(){ let acc=0; for(let v=0;v<V;v++){ let p1=v*1000,p2=0; const i1=12345678+v*1000,i2=12399999+v; for(let n=0;n<BLK*OS;n++){ p1=(p1+i1)>>>0; p2=(p2+i2)>>>0; const m1=(p1>>>25)&78, m2=(p2>>>24)&255; tmp[n]=(m1<32?SIN[(m1<<6)+((p1<<7)>>>26)]:0)+(m2<32?SIN[(m2<<6)+((p2<<8)>>>26)]:0); } acc+=tmp[5]; } return acc; }
function fir(){ let acc=0; for(let v=0;v<V;v++){ const o=v*2*L; for(let n=0;n<BLK;n++){ let y=0; for(let k=0;k<L;k++) y+=h[k]*buf[o+k+(n&63)]; acc+=y; } } return acc; }
function firPoly(){ // nur jeder 2. Tap ungleich 0 waere Halbband; hier: L/2 Taps durch Symmetrie
  let acc=0; const H2=L>>1; for(let v=0;v<V;v++){ const o=v*2*L; for(let n=0;n<BLK;n++){ let y=0; const b=o+(n&63); for(let k=0;k<H2;k++) y+=h[k]*(buf[b+k]+buf[b+L-1-k]); acc+=y; } } return acc; }
for (const [name,f] of [['Oszillatoren 12x2x16',osc],['FIR 176 Taps x12',fir],['FIR symmetrisch (88 MAC) x12',firPoly]]){ for(let i=0;i<300;i++) f(); const t0=performance.now(); for(let i=0;i<nb;i++) f(); const dt=performance.now()-t0; console.log(name+':', (100*dt/(sec*1000)).toFixed(1),'% Echtzeit'); }
