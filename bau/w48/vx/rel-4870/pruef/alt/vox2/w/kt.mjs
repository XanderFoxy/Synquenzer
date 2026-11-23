// Klick-Test (synthetisch): 20 Klicks je Take wie Entwickler-Test (0,5–3 ms, 12–20 dB über Umgebung > 2 kHz), + Fehlalarme im sauberen Take.
import {loadK} from './kern.mjs';import {sing,rng} from './gen.mjs';
const LV0=+(process.env.LV0||12),LV1=+(process.env.LV1||8);
const K=loadK(process.argv[2]),TAU=2*Math.PI,O=process.env.CO?JSON.parse(process.env.CO):{};
function bq(f,q,sr){const w=TAU*f/sr,c=Math.cos(w),al=Math.sin(w)/(2*q),a0=1+al;return[(1+c)/2/a0,-(1+c)/a0,(1+c)/2/a0,-2*c/a0,(1-al)/a0];}
const hp2k=(v,sr)=>{const z=Float64Array.from(v);for(const q of[0.5411961,1.3065630]){const c=bq(2000,q,sr);let z1=0,z2=0;for(let i=0;i<z.length;i++){const x0=z[i],o=c[0]*x0+z1;z1=c[1]*x0-c[3]*o+z2;z2=c[2]*x0-c[4]*o;z[i]=o;}}return z;};
const GCI=+(process.env.GCI||0);const TAKES0=[{nm:'A tief 44k',sr:44100,dur:30,f0lo:90,f0hi:170,seed:11},{nm:'A2 tief 48k',sr:48000,dur:30,f0lo:85,f0hi:150,seed:23,breathy:0.02},{nm:'B mittel 48k',sr:48000,dur:30,f0lo:150,f0hi:280,seed:5},{nm:'C hoch 44k',sr:44100,dur:30,f0lo:220,f0hi:420,seed:7,breathy:0.06}],TAKES=TAKES0.map(t=>Object.assign({gci:GCI},t));
let TOT={hit:0,fpNew:0,own:0,ovMax:-99,same:true};const out={};
for(const T of TAKES){const S=sing(T),v=S.x,sr=S.sr,n=v.length,R=rng(777+T.seed),hpS=hp2k(v,sr);
  // Klicks nur in gesungenen Stellen (laute Vokale), wie die 3 verfehlten in Take A
  const cand=[];for(const N of S.notes)for(let t=N.t0+0.1;t<N.t1-0.1;t+=0.05)cand.push(t);
  const x=Float32Array.from(v),CL=[];const step=cand.length/20;
  for(let k=0;k<20;k++){const t=cand[Math.floor(k*step+R()*step*0.8)],i0=Math.round(t*sr),d=0.0005+R()*0.0025,M=Math.max(4,Math.round(d*sr)),f=2500+R()*3500,typ=k%2;
    let e=0;for(let i=i0-441;i<i0+441;i++)e+=hpS[i]*hpS[i];let pk=0;for(let i=i0-441;i<i0+441;i++)pk=Math.max(pk,Math.abs(hpS[i]));const amp=process.env.PK?pk*(+process.env.PK+R()*0.8):Math.max(0.01,Math.sqrt(e/882)*Math.pow(10,(LV0+R()*LV1)/20)),sg=R()<0.5?-1:1;
    for(let i=0;i<M;i++){const w=Math.min(1,i/2)*Math.exp(-3*i/M);x[i0+i]+=sg*amp*w*(typ?Math.sin(TAU*f*i/sr+1.2):(R()*2-1));}CL.push({t,s0:i0,s1:i0+M});}
  const r=K.done(K.run(x,sr,{steps:{click:O}})),L=r.info.click.list,at=(e,c)=>e.t1*sr>=c.s0-44&&e.t0*sr<=c.s1+44,hit=CL.filter(c=>L.some(e=>at(e,c))),fp=L.filter(e=>!CL.some(c=>at(e,c)));
  const own=K.done(K.clickScan(v,sr,O));  // sauberer synthetischer Gesang hat keine Klicks: jeder Fund = Fehlalarm
  const hx=hp2k(x,sr),hy=hp2k(r.y,sr),ov=(z,c)=>{let a=0,b=0,na=0,nb=0;const m=Math.round(0.01*sr);for(let i=c.s0-m;i<c.s1+m;i++){if(i>=c.s0&&i<c.s1){a+=z[i]*z[i];na++;}else{b+=z[i]*z[i];nb++;}}return 10*Math.log10((a/na+1e-20)/(b/nb+1e-20));};
  const ovr=hit.map(c=>+ov(hy,c).toFixed(1)),ovMax=ovr.length?Math.max(...ovr):0;
  const red=hit.map(c=>{let e0=0,e1=0;for(let i=c.s0-44;i<c.s1+44;i++){e0+=(x[i]-v[i])**2;e1+=(r.y[i]-v[i])**2;}return+(10*Math.log10(e0/(e1+1e-20))).toFixed(1);}).sort((a,b)=>a-b);
  let same=true;for(let i=0;i<n&&same;i++)if(r.y[i]!==x[i]&&!L.some(e=>i>=Math.round(e.t0*sr)-2&&i<Math.round(e.t1*sr)+2))same=false;
  const miss=CL.filter(c=>!hit.includes(c)).map(c=>+c.t.toFixed(3));
  out[T.nm]={gefunden:hit.length,fehl:fp.length,eigeneSauber:own.length,ovMax,abzugMedian:red[red.length>>1],abzugMin:red[0],same,miss};
  TOT.hit+=hit.length;TOT.fpNew+=fp.length;TOT.own+=own.length;TOT.ovMax=Math.max(TOT.ovMax,ovMax);TOT.same=TOT.same&&same;}
for(const k in out)console.log(k.padEnd(14),JSON.stringify(out[k]));console.log('SUMME',JSON.stringify(TOT));
