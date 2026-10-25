// independent check: additive voice, detached notes with end falls, exp-noise room IR at given DRR; app DSP pyin+segment
import {loadDsp} from './v3-vs2-corpus.mjs';
const D = loadDsp(process.env.F || '../dirigent-wt/index.html');
function rng(s){return()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296;};}
function make({fall, drr, rt=0.4, seed=3, base=50, snr=40}) {
  const fs=16000, r=rng(seed*7919+1), steps=[0,3,1,5,2,4,0,3,7,5,2,0], notes=steps.map((s,k)=>({on:0.3+k*0.6, dur:0.42, midi:base+s}));
  const N=Math.ceil((notes.at(-1).on+1.2)*fs), x=new Float64Array(N); const hp=Array.from({length:120},()=>r()*6.283);
  for (const n of notes) { let ph=0; const i0=Math.round(n.on*fs), i1=Math.round((n.on+n.dur)*fs);
    for (let i=i0;i<i1;i++){ const t=(i-i0)/fs, rem=(i1-i)/fs; let m=n.midi + 0.08*Math.sin(2*Math.PI*5.5*t)*Math.min(1,t/0.2); let a=Math.min(1,t/0.03)*Math.min(1,rem/0.03);
      if (fall) { const u=Math.max(0,Math.min(1,(fall[1]-rem)/fall[1])), sm=0.5-0.5*Math.cos(Math.PI*u); m-=fall[0]*sm; a*=Math.pow(10,-fall[2]/20*sm); }
      const f0=440*Math.pow(2,(m-69)/12); ph+=2*Math.PI*f0/fs; const K=Math.min(119,Math.floor(7000/f0)); let s=0;
      for(let k=1;k<=K;k++){ const fk=k*f0, fw=Math.exp(-(((fk-700)/400)**2))+0.5*Math.exp(-(((fk-1200)/300)**2))+0.25*Math.exp(-(((fk-2500)/400)**2))+0.05; s+=Math.sin(k*ph+hp[k])/k*fw; }
      x[i]=s*a; } }
  let e=0,c=0; for(let i=0;i<N;i++) if(x[i]) {e+=x[i]*x[i];c++;} const g=0.1/Math.sqrt(e/c); for(let i=0;i<N;i++) x[i]*=g;
  if (drr!=null) { const L=Math.round(rt*fs*1.2), ir=new Float64Array(L), rr=rng(seed+99); let e2=0; for(let j=0;j<L;j++){ ir[j]=(rr()*2-1)*Math.pow(10,-3*j/fs/rt); e2+=ir[j]*ir[j]; }
    const nrm=Math.pow(10,-drr/20)/Math.sqrt(e2), y=new Float64Array(N); const sub=[]; for(let j=0;j<L;j++) sub.push(j);
    for(let i=0;i<N;i++){const v=x[i]; if(!v) continue; const lim=Math.min(L,N-i); for(let j=0;j<lim;j++) y[i+j]+=v*ir[j];}
    for(let i=0;i<N;i++) x[i]+=y[i]*nrm; }
  const nk=0.1/Math.pow(10,snr/20); for(let i=0;i<N;i++) x[i]+=nk*(r()*2-1)*1.7;
  return {x:Float32Array.from(x), notes};
}
const [seed, base, W0, W1] = process.argv.slice(2).map(Number); const fall = (process.env.FALL || '2.5,0.14,9').split(',').map(Number);
const s = make({drr: 18, fall, seed, base}), tr = D.pyin(s.x, {fs: 16000}), dbg = [];
const ns = D.segment(tr, {snap: false, tuning: 'auto', dbg}).notes;
console.log(ns.filter(n => n.t1 > W0 && n.t0 < W1).map(n => `${n.t0.toFixed(3)}-${n.t1.toFixed(3)}:${n.n}/${n.m}`).join(' '));
for (const x of dbg) { const t = JSON.stringify(x, (k, v) => typeof v === 'number' ? +v.toFixed(2) : v); if (x.pre) console.log(JSON.stringify(x.pre.filter(q => q[1] > W0 / 0.005 && q[0] < W1 / 0.005))); else if (x.n ? x.n[1] > W0 / 0.005 && x.n[0] < W1 / 0.005 : true) console.log(t); }
let l = ''; for (let i = Math.round(W0 / 0.005); i < Math.round(W1 / 0.005); i++) l += `${i}:${tr.f0[i] > 0 ? (69 + 12 * Math.log2(tr.f0[i] / 440)).toFixed(2) : '--'}/${tr.e10[i].toFixed(0)} `; console.log(l);
