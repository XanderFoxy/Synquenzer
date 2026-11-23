// Plopp-Test (synthetisch): je Take 10 Plopps = tieffrequenter Stoß (25–70 Hz, 25–70 ms) kurz vor einem Vokal-Einsatz.
// Misst: gefunden (Fund überlappt Stoß), Fehlalarme (Fund ohne Stoß, + Funde im sauberen Take), Abzug (Stoß-Energie < 200 Hz vorher/nachher), bitgleich außerhalb der Funde.
import {loadK} from './kern.mjs';import {sing,rng} from './gen.mjs';
const K=loadK(process.argv[2]),TAU=2*Math.PI,O=process.env.PO?JSON.parse(process.env.PO):{},V=!!process.env.V;
function bq(f,q,sr){const w=TAU*f/sr,c=Math.cos(w),al=Math.sin(w)/(2*q),a0=1+al;return[(1-c)/2/a0,(1-c)/a0,(1-c)/2/a0,-2*c/a0,(1-al)/a0];}
const lp=(v,sr,f)=>{const z=Float64Array.from(v);for(const q of[0.5411961,1.3065630]){const c=bq(f,q,sr);let z1=0,z2=0;for(let i=0;i<z.length;i++){const x0=z[i],o=c[0]*x0+z1;z1=c[1]*x0-c[3]*o+z2;z2=c[2]*x0-c[4]*o;z[i]=o;}}return z;};
const TAKES=[{nm:'A tief 44k',sr:44100,dur:30,f0lo:90,f0hi:170,seed:11},{nm:'A2 tief 48k',sr:48000,dur:30,f0lo:85,f0hi:150,seed:23,breathy:0.02},{nm:'B mittel 48k',sr:48000,dur:30,f0lo:150,f0hi:280,seed:5},{nm:'C hoch 44k',sr:44100,dur:30,f0lo:220,f0hi:420,seed:7,breathy:0.06}];
const LVL=(process.env.LVL||'-6,0,6').split(',').map(Number);
let TOT={plopps:0,hit:0,fehl:0,sauber:0,abzug12:0,same:true};
for(const lv of LVL){let sum={hit:0,n:0,fehl:0,sauber:0,a12:0};const rows=[];
for(const T of TAKES){const S=sing(T),v=S.x,sr=S.sr,n=v.length,R=rng(4242+T.seed+lv*7);
  const x=Float32Array.from(v),PL=[];const ns=S.notes.filter(N=>N.t0>0.6&&N.t0<T.dur-1.5),step=ns.length/10;
  // Gesangs-Pegel (RMS) ~0.2; Stoß-Spitze relativ dazu, Stufe lv dB
  for(let k=0;k<10;k++){const N=ns[Math.floor(k*step)],f=25+R()*45,d=0.025+R()*0.045,lead=0.005+R()*0.02,t=N.t0-lead,i0=Math.round(t*sr),M=Math.round(d*sr),amp=0.25*Math.pow(10,(lv+R()*4-2)/20),sg=R()<0.5?-1:1,ph=R()*0.6;
    for(let i=0;i<M;i++){const tt=i/sr,w=Math.min(1,tt/0.003)*Math.pow(1-i/M,2);x[i0+i]+=sg*amp*w*Math.sin(TAU*f*tt+ph);}PL.push({t,s0:i0,s1:i0+M,f:+f.toFixed(0),d:+(d*1000).toFixed(0)});}
  const Fe=K.done(K.feats(x,sr)),ev=K.plopFind(Fe,O),r=K.done(K.run(x,sr,{steps:{plop:Object.assign({str:50},O)}})),L=r.info.plop||[];
  const at=(e,c)=>e.t1*sr>=c.s0&&e.t0*sr<=c.s1,hit=PL.filter(c=>ev.some(e=>at(e,c))),fp=ev.filter(e=>!PL.some(c=>at(e,c)));
  const own=K.plopFind(K.done(K.feats(v,sr)),O);
  const lx=lp(x,sr,200),ly=lp(r.y,sr,200),lv0=lp(v,sr,200);
  const red=PL.map(c=>{let e0=0,e1=0;for(let i=c.s0;i<c.s1;i++){e0+=(lx[i]-lv0[i])**2;e1+=(ly[i]-lv0[i])**2;}return+(10*Math.log10(e0/(e1+1e-20))).toFixed(1);});
  let same=true;for(let i=0;i<n&&same;i++)if(r.y[i]!==x[i]&&!ev.some(e=>i>=e.s0-Math.round(0.35*sr)&&i<e.s1+Math.round(0.35*sr)))same=false;
  const a12=red.filter(z=>z>=12).length,miss=PL.filter(c=>!hit.includes(c)).map(c=>c.t.toFixed(2)+'s/'+c.f+'Hz/'+c.d+'ms');
  rows.push(T.nm.padEnd(13)+' gef '+hit.length+'/10 fehl '+fp.length+' sauber '+own.length+' abzug>=12 '+a12+'/10 '+JSON.stringify(red)+' same '+same+(V&&miss.length?' miss '+miss.join(' '):''));
  sum.hit+=hit.length;sum.n+=10;sum.fehl+=fp.length;sum.sauber+=own.length;sum.a12+=a12;TOT.same=TOT.same&&same;}
 console.log('Stufe '+lv+' dB: gefunden '+sum.hit+'/'+sum.n+' fehl '+sum.fehl+' sauber '+sum.sauber+' abzug>=12 '+sum.a12+'/'+sum.n);for(const r of rows)console.log('  '+r);
 TOT.plopps+=sum.n;TOT.hit+=sum.hit;TOT.fehl+=sum.fehl;TOT.sauber+=sum.sauber;TOT.abzug12+=sum.a12;}
console.log('SUMME',JSON.stringify(TOT));
