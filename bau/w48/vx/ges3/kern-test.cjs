// GES3 Kern-Test: synthetische Gesangs-Phrasen mit bekannten Einsätzen.
// (A) Gesang→Noten: Einsatz-Fehler in ms (VSD.pyin+segment, 16 kHz / 5 ms wie vsAnalyse) vorher = Raster-t0, nachher = ges3Onset; je Phrase 5 Lagen im Raster.
// (B) Marken (detectMarks, 48 kHz): Zahl vorher (o={}) / nachher (o={g3:1}) gegen Soll; ohne g3 bitgleich zu vorher.
// Aufruf: node kern-test.cjs <vorher.html> <nachher.html>
const fs=require('fs');
const H0=fs.readFileSync(process.argv[2],'utf8'),H1=fs.readFileSync(process.argv[3],'utf8');
function grab(h,name){const i=h.indexOf('function '+name+'(');if(i<0)throw name;let d=0,j=h.indexOf('){',i)+1;for(;j<h.length;j++){const c=h[j];if(c==='{')d++;else if(c==='}'){d--;if(!d)break;}}return h.slice(i,j+1);}
const V=(new Function(grab(H1,'vsDspMake')+';return vsDspMake();'))();
const ges3Onset=(new Function(grab(H1,'ges3Onset')+';return ges3Onset;'))();
const M0=(new Function(grab(H0,'vsMarksMake')+';return vsMarksMake();'))(),M1=(new Function(grab(H1,'vsMarksMake')+';return vsMarksMake();'))();
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
// ---------- (A) Einsatz ----------
const PA=[
 {name:'3 Töne nach Pause',ph:[{typ:'ton',dur:.6,m0:60,vib:30},{typ:'pause',dur:.2},{typ:'ton',dur:.6,m0:64,vib:30},{typ:'pause',dur:.25},{typ:'ton',dur:.8,m0:67,vib:40}]},
 {name:'Konsonant vor Vokal (4 Silben)',ph:[{typ:'kons',dur:.07},{typ:'ton',dur:.45,m0:57,vib:30},{typ:'kons',dur:.06},{typ:'ton',dur:.45,m0:59,vib:30},{typ:'kons',dur:.08},{typ:'ton',dur:.45,m0:60,vib:30},{typ:'kons',dur:.06},{typ:'ton',dur:.7,m0:62,vib:50}]},
 {name:'weicher Einsatz 60 ms',ph:[{typ:'ton',dur:.7,m0:62,att:.06},{typ:'pause',dur:.2},{typ:'ton',dur:.7,m0:65,att:.06,vok:'u'}]},
 {name:'harter Einsatz 5 ms, tief',ph:[{typ:'ton',dur:.5,m0:48,att:.005},{typ:'pause',dur:.15},{typ:'ton',dur:.5,m0:50,att:.005,vok:'i'},{typ:'pause',dur:.15},{typ:'ton',dur:.6,m0:53,att:.005}]},
 {name:'Einsatz mit Tremolo ±6 dB',ph:[{typ:'ton',dur:1.0,m0:64,trem:6,vib:40},{typ:'pause',dur:.2},{typ:'ton',dur:1.0,m0:62,trem:6,irr:1,vib:40}]},
];
const SRA=16000,hop=80;let A0=[],A1=[],jit0=[],jit1=[],nA=0;
console.log('(A) Gesang→Noten – Einsatz-Fehler (ms), je Phrase 5 Lagen im 5-ms-Raster (0/1/2/3/4 ms Vorlauf)');
for(const p of PA){const e0=[],e1=[],per={};
for(const pre of [0.1,0.101,0.102,0.103,0.104]){
const {x,on}=synth(p.ph,SRA,7,pre);
const tr=V.pyin(x,{fs:SRA,hop,fmin:55,fmax:1050});
const sg=V.segment(tr,{snap:false,tuning:0,attack:false});
const t0=sg.notes.map(n=>n.t0);
const ns=sg.notes.map(n=>Object.assign({},n));ges3Onset(ns,{x,fs:SRA});
on.forEach((o,k)=>{let b=-1,bd=1e9;sg.notes.forEach((n,j)=>{const d=Math.abs(n.t0-o);if(d<bd){bd=d;b=j;}});if(b<0||bd>0.1)return;
const d0=(t0[b]-o)*1000,d1=(ns[b].t0-o)*1000;e0.push(d0);e1.push(d1);(per[k]=per[k]||{a:[],b:[]}).a.push(d0);per[k].b.push(d1);});
}
const ab=a=>a.reduce((s,v)=>s+Math.abs(v),0)/Math.max(1,a.length),mx=a=>Math.max(...a.map(Math.abs));
const sp=(K)=>{let s=0;for(const k in per){const v=per[k][K];s=Math.max(s,Math.max(...v)-Math.min(...v));}return s;};
A0.push(...e0);A1.push(...e1);jit0.push(sp('a'));jit1.push(sp('b'));
console.log('  '+p.name+': Einsätze '+e0.length+' | vorher mittel '+ab(e0).toFixed(1)+' max '+mx(e0).toFixed(1)+' Streuung über Lage '+sp('a').toFixed(1)+' | nachher mittel '+ab(e1).toFixed(1)+' max '+mx(e1).toFixed(1)+' Streuung '+sp('b').toFixed(1));
}
const ab=a=>a.reduce((s,v)=>s+Math.abs(v),0)/Math.max(1,a.length);
console.log('  GESAMT A: '+A0.length+' Einsätze, mittl. Fehler vorher '+ab(A0).toFixed(1)+' ms (max '+Math.max(...A0.map(Math.abs)).toFixed(1)+') → nachher '+ab(A1).toFixed(1)+' ms (max '+Math.max(...A1.map(Math.abs)).toFixed(1)+'); größte Streuung über die Lage '+Math.max(...jit0).toFixed(1)+' → '+Math.max(...jit1).toFixed(1)+' ms');
// ---------- (B) Marken ----------
const PB=[
 {name:'gehaltener Vokal ±6 dB Tremolo 4 Hz',soll:1,ph:[{typ:'ton',dur:2.5,m0:62,trem:6,tr:4}]},
 {name:'gehaltener Vokal ±6 dB unregelmäßig + Vibrato',soll:1,ph:[{typ:'ton',dur:2.5,m0:65,trem:6,irr:1,tr:3.1,vib:50}]},
 {name:'gehaltener Vokal ±6 dB 6 Hz, tief',soll:1,ph:[{typ:'ton',dur:2.0,m0:50,trem:6,tr:6,vok:'u'}]},
 {name:'gehaltener Vokal ±4 dB 5 Hz, hoch',soll:1,ph:[{typ:'ton',dur:2.0,m0:72,trem:4,tr:5,vok:'i'}]},
 {name:'3 Silben mit Konsonant, Tremolo ±6 dB',soll:3,ph:[{typ:'ton',dur:.8,m0:60,trem:6,tr:4},{typ:'kons',dur:.07},{typ:'ton',dur:.8,m0:60,trem:6,tr:4},{typ:'kons',dur:.07},{typ:'ton',dur:.9,m0:62,trem:6,tr:4}]},
 {name:'Legato 60-62-64 mit Tremolo (Tonhöhe)',soll:3,ph:[{typ:'ton',dur:.8,m0:60,trem:6,tr:4},{typ:'ton',dur:.8,m0:60,m1:62,glide:.04,trem:6,tr:4,cont:1},{typ:'ton',dur:.9,m0:62,m1:64,glide:.04,trem:6,tr:4,cont:1}]},
 {name:'gleicher Ton, Vokalwechsel a-i-u',soll:3,ph:[{typ:'ton',dur:.7,m0:62,vok:'a'},{typ:'ton',dur:.7,m0:62,vok:'i',cont:1},{typ:'ton',dur:.8,m0:62,vok:'u',cont:1}]},
 {name:'Silben mit Pausen',soll:3,ph:[{typ:'ton',dur:.5,m0:60},{typ:'pause',dur:.25},{typ:'ton',dur:.5,m0:62},{typ:'pause',dur:.25},{typ:'ton',dur:.6,m0:64}]},
 {name:'Wiederanschlag gleicher Ton (Tal −25 dB)',soll:2,ph:[{typ:'ton',dur:1.4,m0:62,dip:{at:.7,w:.04,db:25}}]},
];
const SRB=48000;NOISE=0.0003;let n0=0,n1=0,ns=0,ok0=0,ok1=0,same=0;
console.log('(B) Marken im Gesang-Editor (Soll = echte Einsätze)');
for(const p of PB){const {x}=synth(p.ph,SRB,11,0.3);
const m0=M0.detectMarks(x,SRB),m1=M1.detectMarks(x,SRB,{g3:1}),mo=M1.detectMarks(x,SRB,{});
const bit=JSON.stringify(m0)===JSON.stringify(mo);if(bit)same++;
n0+=m0.length;n1+=m1.length;ns+=p.soll;ok0+=m0.length===p.soll?1:0;ok1+=m1.length===p.soll?1:0;
console.log('  '+(m1.length===p.soll?'OK    ':'FEHLER')+' '+p.name+': Soll '+p.soll+' | vorher '+m0.length+' | nachher '+m1.length+'  ['+m1.map(m=>m.src+'@'+m.t.toFixed(2)).join(' ')+']'+(bit?'':' ALT≠'));
}
console.log('  GESAMT B: Phrasen richtig vorher '+ok0+'/'+PB.length+' → nachher '+ok1+'/'+PB.length+', Marken '+n0+' → '+n1+' (Soll '+ns+'); alte Takes (ohne g3) bitgleich '+same+'/'+PB.length);
