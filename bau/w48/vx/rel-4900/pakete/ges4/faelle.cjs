let NOISE=0;
function rnd(seed){let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
const FORM={a:[[800,1,90],[1200,.6,110],[2500,.25,160]],i:[[300,1,60],[2300,.5,150],[3000,.35,200]],u:[[350,1,70],[800,.5,90],[2400,.12,160]]};
// Segmente: {typ:'ton',dur,m0,m1,glide,vib,vr,trem(dB),tr(Hz),vok,cont,att} | {typ:'kons',dur} | {typ:'pause',dur}
function synth(ph,SR,seed,pre){
const r=rnd(seed||1);let N=Math.round((pre||0)*SR);const on=[];let t=N;
for(const s of ph){if(s.typ==='ton'&&!s.cont)on.push(t/SR);t+=Math.round(s.dur*SR);}
const x=new Float32Array(t+Math.round(SR/5));let i=N,phase=0,vph=r()*6.28,tph=r()*6.28,tph2=r()*6.28;
for(let si=0;si<ph.length;si++){const s=ph[si],nx=ph[si+1],n=Math.round(s.dur*SR);
const fo=FORM[s.vok||'a'];
for(let k=0;k<n;k++,i++){const tt=k/SR;
if(s.typ==='ton'){
const g=s.glide||0;let m=s.m0;if(g>0)m=tt<g?s.m0+(s.m1-s.m0)*(0.5-0.5*Math.cos(Math.PI*tt/g)):s.m1;
if(s.vib){vph+=2*Math.PI*(s.vr||5.5)/SR;m+=Math.min(1,tt/0.25)*s.vib/100*Math.sin(vph);}
const f=440*Math.pow(2,(m-69)/12);phase+=2*Math.PI*f/SR;
let v=0;for(let h=1;h<=40;h++){const hf=h*f;if(hf>7000)break;let a=0.15/h;for(const[F,G,B]of fo)a+=G*Math.exp(-(((hf-F)/B)**2));v+=a*Math.sin(h*phase);}
let gdb=0;if(s.trem){tph+=2*Math.PI*(s.tr||4)/SR;tph2+=2*Math.PI*2.3/SR;gdb=s.irr?s.trem*(0.6*Math.sin(tph)+0.4*Math.sin(tph2)):s.trem*Math.sin(tph);}
if(s.dip){const c=s.dip.at,w=s.dip.w;const d=Math.abs(tt-c);if(d<w)gdb-=s.dip.db*(0.5+0.5*Math.cos(Math.PI*d/w));}
const att=s.att||0.02,a=Math.min(1,s.cont?1:tt/att,nx&&nx.cont?1:(s.dur-tt)/0.03);x[i]=0.12*v*a*Math.pow(10,gdb/20);
}else if(s.typ==='kons'){const a=Math.min(1,tt/0.005,(s.dur-tt)/0.005);x[i]=0.05*(r()*2-1)*a;}
}}
if(NOISE)for(let k=0;k<x.length;k++)x[k]+=NOISE*(r()*2-1);
return{x,on};
}
const PA=[
 {name:'3 Töne nach Pause',ph:[{typ:'ton',dur:.6,m0:60,vib:30},{typ:'pause',dur:.2},{typ:'ton',dur:.6,m0:64,vib:30},{typ:'pause',dur:.25},{typ:'ton',dur:.8,m0:67,vib:40}]},
 {name:'Konsonant vor Vokal (4 Silben)',ph:[{typ:'kons',dur:.07},{typ:'ton',dur:.45,m0:57,vib:30},{typ:'kons',dur:.06},{typ:'ton',dur:.45,m0:59,vib:30},{typ:'kons',dur:.08},{typ:'ton',dur:.45,m0:60,vib:30},{typ:'kons',dur:.06},{typ:'ton',dur:.7,m0:62,vib:50}]},
 {name:'weicher Einsatz 60 ms',ph:[{typ:'ton',dur:.7,m0:62,att:.06},{typ:'pause',dur:.2},{typ:'ton',dur:.7,m0:65,att:.06,vok:'u'}]},
 {name:'harter Einsatz 5 ms, tief',ph:[{typ:'ton',dur:.5,m0:48,att:.005},{typ:'pause',dur:.15},{typ:'ton',dur:.5,m0:50,att:.005,vok:'i'},{typ:'pause',dur:.15},{typ:'ton',dur:.6,m0:53,att:.005}]},
 {name:'Einsatz mit Tremolo ±6 dB',ph:[{typ:'ton',dur:1.0,m0:64,trem:6,vib:40},{typ:'pause',dur:.2},{typ:'ton',dur:1.0,m0:62,trem:6,irr:1,vib:40}]},
];
module.exports={synth,PA,setNoise:v=>{NOISE=v;}};
