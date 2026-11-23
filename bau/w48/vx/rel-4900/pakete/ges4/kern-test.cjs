// GES4 Kern-Test (auf GES3 aufgebaut): synthetische Gesangs-Phrasen mit bekannten Einsätzen.
// (A) Gesang→Noten: Einsatz-Fehler in ms (VSD.pyin+segment, 16 kHz / 5 ms wie vsAnalyse) vorher = Raster-t0, nachher = ges3Onset; je Phrase 5 Lagen im Raster.
// (B) Marken (detectMarks, 48 kHz): Zahl vorher (o={}) / nachher (o={g3:1}) gegen Soll; ohne g3 bitgleich zu vorher.
// Aufruf: node kern-test.cjs <vorher.html> <nachher.html>
const fs=require('fs');
const H0=fs.readFileSync(process.argv[2],'utf8'),H1=fs.readFileSync(process.argv[3],'utf8');
function grab(h,name){const i=h.indexOf('function '+name+'(');if(i<0)throw name;let d=0,j=h.indexOf('){',i)+1;for(;j<h.length;j++){const c=h[j];if(c==='{')d++;else if(c==='}'){d--;if(!d)break;}}return h.slice(i,j+1);}
const V=(new Function(grab(H1,'vsDspMake')+';return vsDspMake();'))();
const mkOn=h=>{const kk=h.indexOf('function ges4Kons(')>=0?grab(h,'ges4Kons'):'const ges4Kons=undefined;';return (new Function(kk+';'+grab(h,'ges3Onset')+';return ges3Onset;'))();};
const V0=(new Function(grab(H0,'vsDspMake')+';return vsDspMake();'))(),on0=mkOn(H0),ges3Onset=mkOn(H1);
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
const att=s.att||0.02,a=Math.min(1,s.cont?1:tt/att,nx&&nx.cont?1:(s.dur-tt)/0.03);x[i]=0.12*v*a*Math.pow(10,gdb/20);if(s.ovN)x[i]+=s.ovN*(r()*2-1)*Math.max(0,1-tt/s.ovT);
}else if(s.typ==='kons'){const a=Math.min(1,tt/0.005,(s.dur-tt)/0.005);x[i]=s.plos?(tt<s.plos?0:(tt<s.plos+0.008?0.12:0.035*Math.exp(-(tt-s.plos-0.008)/0.04))*Math.min(1,(s.dur-tt)/0.003)*(r()*2-1)):0.05*(r()*2-1)*a;}
}}
if(NOISE)for(let k=0;k<x.length;k++)x[k]+=NOISE*(r()*2-1);
return{x,on};
}
// ---------- (A) Einsatz ----------
const PA=[
 {name:'3 Töne nach Pause',ph:[{typ:'ton',dur:.6,m0:60,vib:30},{typ:'pause',dur:.2},{typ:'ton',dur:.6,m0:64,vib:30},{typ:'pause',dur:.25},{typ:'ton',dur:.8,m0:67,vib:40}]},
 {name:'K: Konsonant vor Vokal (4 Silben)',kons:1,ph:[{typ:'kons',dur:.07},{typ:'ton',dur:.45,m0:57,vib:30},{typ:'kons',dur:.06},{typ:'ton',dur:.45,m0:59,vib:30},{typ:'kons',dur:.08},{typ:'ton',dur:.45,m0:60,vib:30},{typ:'kons',dur:.06},{typ:'ton',dur:.7,m0:62,vib:50}]},
 {name:'weicher Einsatz 60 ms',ph:[{typ:'ton',dur:.7,m0:62,att:.06},{typ:'pause',dur:.2},{typ:'ton',dur:.7,m0:65,att:.06,vok:'u'}]},
 {name:'harter Einsatz 5 ms, tief',ph:[{typ:'ton',dur:.5,m0:48,att:.005},{typ:'pause',dur:.15},{typ:'ton',dur:.5,m0:50,att:.005,vok:'i'},{typ:'pause',dur:.15},{typ:'ton',dur:.6,m0:53,att:.005}]},
 {name:'Einsatz mit Tremolo ±6 dB',ph:[{typ:'ton',dur:1.0,m0:64,trem:6,vib:40},{typ:'pause',dur:.2},{typ:'ton',dur:1.0,m0:62,trem:6,irr:1,vib:40}]},
 {name:'K: Konsonant tief (m48, 5 Silben)',kons:1,ph:[{typ:'kons',dur:.08},{typ:'ton',dur:.4,m0:48},{typ:'kons',dur:.06},{typ:'ton',dur:.4,m0:50,vok:'u'},{typ:'kons',dur:.07},{typ:'ton',dur:.4,m0:52},{typ:'kons',dur:.05},{typ:'ton',dur:.4,m0:53,vok:'i'},{typ:'kons',dur:.08},{typ:'ton',dur:.6,m0:55}]},
 {name:'K: Konsonant hoch (m72, 4 Silben)',kons:1,ph:[{typ:'kons',dur:.06},{typ:'ton',dur:.4,m0:72,vib:40},{typ:'kons',dur:.07},{typ:'ton',dur:.4,m0:71,vok:'i',vib:40},{typ:'kons',dur:.05},{typ:'ton',dur:.4,m0:69,vib:40},{typ:'kons',dur:.06},{typ:'ton',dur:.6,m0:67,vib:40}]},
 {name:'K: Plosiv (Verschluss + Knall + Hauch)',kons:1,ph:[{typ:'kons',dur:.09,plos:.03},{typ:'ton',dur:.45,m0:60},{typ:'kons',dur:.08,plos:.03},{typ:'ton',dur:.45,m0:62},{typ:'kons',dur:.1,plos:.04},{typ:'ton',dur:.6,m0:64,vib:40}]},
 {name:'K: Reibelaut reicht 15 ms in den Vokal',kons:1,ph:[{typ:'kons',dur:.07},{typ:'ton',dur:.45,m0:59,ovN:.04,ovT:.015},{typ:'kons',dur:.07},{typ:'ton',dur:.45,m0:62,ovN:.04,ovT:.015},{typ:'kons',dur:.07},{typ:'ton',dur:.6,m0:64,ovN:.04,ovT:.015}]},
];
const SRA=16000,hop=80,KF=[];let A0=[],A1=[],jit0=[],jit1=[],nA=0;
console.log('(A) Gesang→Noten – Einsatz-Fehler (ms), je Phrase 5 Lagen im 5-ms-Raster (0/1/2/3/4 ms Vorlauf); vorher = 4.88 (Raster + GES3), nachher = Datei 2');
for(const p of PA){const e0=[],e1=[],per={};
let nz0=0,nz1=0;const soll=p.ph.filter(s=>s.typ==='ton'&&!s.cont).length;
for(const pre of [0.1,0.101,0.102,0.103,0.104]){
const {x,on}=synth(p.ph,SRA,7,pre);
const tr=V.pyin(x,{fs:SRA,hop,fmin:55,fmax:1050});
const sA=V0.segment(tr,{snap:false,tuning:0,attack:false}).notes.map(n=>Object.assign({},n));on0(sA,{x,fs:SRA});
const sB=V.segment(tr,{snap:false,tuning:0,attack:false,ges4:1}).notes.map(n=>Object.assign({},n));ges3Onset(sB,{x,fs:SRA});
nz0+=sA.length!==soll?1:0;nz1+=sB.length!==soll?1:0;
const near=(L,o)=>{let b=-1,bd=1e9;L.forEach((n,j)=>{const d=Math.abs(n.t0-o);if(d<bd){bd=d;b=j;}});return bd>0.1?null:L[b];};
on.forEach((o,k)=>{const na=near(sA,o),nb=near(sB,o);if(!na||!nb)return;
const d0=(na.t0-o)*1000,d1=(nb.t0-o)*1000;e0.push(d0);e1.push(d1);(per[k]=per[k]||{a:[],b:[]}).a.push(d0);per[k].b.push(d1);});
}
const ab=a=>a.reduce((s,v)=>s+Math.abs(v),0)/Math.max(1,a.length),mx=a=>Math.max(...a.map(Math.abs));
const sp=(K)=>{let s=0;for(const k in per){const v=per[k][K];s=Math.max(s,Math.max(...v)-Math.min(...v));}return s;};
A0.push(...e0);A1.push(...e1);jit0.push(sp('a'));jit1.push(sp('b'));
console.log('  '+p.name+': Einsätze '+e0.length+' | vorher mittel '+ab(e0).toFixed(1)+' max '+mx(e0).toFixed(1)+' Streuung über Lage '+sp('a').toFixed(1)+' | nachher mittel '+ab(e1).toFixed(1)+' max '+mx(e1).toFixed(1)+' Streuung '+sp('b').toFixed(1)+' | Noten-Zahl falsch (von 5 Lagen) '+nz0+' → '+nz1);KF.push([p.name,e0,e1,sp('a'),sp('b')]);
}
const ab=a=>a.reduce((s,v)=>s+Math.abs(v),0)/Math.max(1,a.length);
console.log('  GESAMT A: '+A0.length+' Einsätze, mittl. Fehler vorher '+ab(A0).toFixed(1)+' ms (max '+Math.max(...A0.map(Math.abs)).toFixed(1)+') → nachher '+ab(A1).toFixed(1)+' ms (max '+Math.max(...A1.map(Math.abs)).toFixed(1)+'); größte Streuung über die Lage '+Math.max(...jit0).toFixed(1)+' → '+Math.max(...jit1).toFixed(1)+' ms');
{const ab=a=>a.reduce((s,v)=>s+Math.abs(v),0)/Math.max(1,a.length);for(const[t,f]of[['Konsonant-Fälle',x=>x[0].startsWith('K:')],['Einsätze nach Pause',x=>!x[0].startsWith('K:')]]){const L=KF.filter(f),a0=[].concat(...L.map(x=>x[1])),a1=[].concat(...L.map(x=>x[2]));
console.log('  '+t+': '+a0.length+' Einsätze, mittl. Fehler '+ab(a0).toFixed(2)+' → '+ab(a1).toFixed(2)+' ms (max '+Math.max(...a0.map(Math.abs)).toFixed(1)+' → '+Math.max(...a1.map(Math.abs)).toFixed(1)+'), Streuung über Lage '+Math.max(...L.map(x=>x[3])).toFixed(1)+' → '+Math.max(...L.map(x=>x[4])).toFixed(1)+' ms');}}
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
const SRB=48000;NOISE=0.0003;let n0=0,n1=0,ns=0,ok0=0,ok1=0,same=0,h0=0,h1=0,f0=0,f1=0;
console.log('(B) Marken im Gesang-Editor: Soll-Einsätze = jeder neue Ton/Vokal/Wiederanschlag; Treffer = Soll-Einsatz mit Marke (±80 ms, Konsonant-Beginn zählt), Fehlmarken = Marken mitten in einem gehaltenen Ton');
for(const p of PB){const {x,on}=synth(p.ph,SRB,11,0.3);
const ends=[];{let t=0.3;on.length=0;for(const s of p.ph){if(s.typ==='ton'){on.push(t);if(s.dip)on.push(t+s.dip.at);}t+=s.dur;if(s.typ==='ton')ends.push(t);}}
const m0=M0.detectMarks(x,SRB),m1=M1.detectMarks(x,SRB,{g3:1}),mo=M1.detectMarks(x,SRB,{});
const bit=JSON.stringify(m0)===JSON.stringify(mo);if(bit)same++;
const ev=ms=>{const hit=on.filter(o=>ms.some(m=>m.t>o-0.08&&m.t<o+0.04)).length;
const fehl=ms.filter(m=>!on.some(o=>m.t>o-0.08&&m.t<o+0.04)&&!ends.some(e=>m.t>e-0.08&&m.t<e+0.05)).length;return{hit,fehl};};
const e0=ev(m0),e1=ev(m1);h0+=e0.hit;h1+=e1.hit;f0+=e0.fehl;f1+=e1.fehl;ns+=on.length;n0+=m0.length;n1+=m1.length;
const ok=e1.hit===on.length&&e1.fehl===0;ok1+=ok?1:0;ok0+=(e0.hit===on.length&&e0.fehl===0)?1:0;
console.log('  '+(ok?'OK    ':'FEHLER')+' '+p.name+': Einsätze '+on.length+' | vorher Treffer '+e0.hit+' Fehlmarken '+e0.fehl+' (Marken '+m0.length+') | nachher Treffer '+e1.hit+' Fehlmarken '+e1.fehl+' (Marken '+m1.length+')'+(bit?'':' ALT≠'));
}
console.log('  GESAMT B: Phrasen richtig '+ok0+'/'+PB.length+' → '+ok1+'/'+PB.length+'; Treffer '+h0+' → '+h1+' von '+ns+'; Fehlmarken '+f0+' → '+f1+'; Marken gesamt '+n0+' → '+n1+'; alte Takes (ohne g3) bitgleich '+same+'/'+PB.length);

// ---------- (C) Vibrato-Ton (±50 ct, 5,5 Hz) – Noten-Zahl und Tonhöhe, Gesang→Noten (segment mit ges4) ----------
{const PV=[];
for(const m of [48,52,57,62,64,67,69,72,76])for(const vr of [5.5]){
 PV.push({name:'Vibrato-Ton m'+m,soll:[m],ph:[{typ:'ton',dur:1.6,m0:m,vib:50,vr}]});
 PV.push({name:'Gleiten +3 in Vibrato-Ton m'+m,soll:[m],ph:[{typ:'ton',dur:1.6,m0:m-3,m1:m,glide:.25,vib:50,vr}]});
 PV.push({name:'Vibrato m'+m+' → +2 legato',soll:[m,m+2],ph:[{typ:'ton',dur:1.0,m0:m,vib:50,vr},{typ:'ton',dur:1.0,m0:m,m1:m+2,glide:.08,vib:50,vr,cont:1}]});
 PV.push({name:'Vibrato m'+m+' → −1 legato, Vokal u',soll:[m,m-1],ph:[{typ:'ton',dur:1.0,m0:m,vib:50,vr,vok:'u'},{typ:'ton',dur:1.0,m0:m,m1:m-1,glide:.06,vib:50,vr,vok:'u',cont:1}]});
}
const SRC=16000;NOISE=0;const st={n0:0,n1:0,s:0,ok0:0,ok1:0,pe0:[],pe1:[],e0:[],e1:[]};
console.log('(C) Vibrato-Ton ±50 ct, 5,5 Hz (Soll = Zahl der gesungenen Töne; Fehler = Tonhöhe der Note gegen den gesungenen Ton, Einsatz gegen Soll)');
for(const p of PV){const {x,on}=synth(p.ph,SRC,5,0.1);const tr=V.pyin(x,{fs:SRC,hop:80,fmin:55,fmax:1050});
 const ev=(VV,o,onf)=>{const L=VV.segment(tr,o).notes.map(n=>Object.assign({},n));onf(L,{x,fs:SRC});return L.filter(n=>n.t1-n.t0>=0.06);};
 const a=ev(V0,{snap:false,tuning:0,attack:false},on0),b=ev(V,{snap:false,tuning:0,attack:false,ges4:1},ges3Onset);
 const okA=a.length===p.soll.length,okB=b.length===p.soll.length;st.n0+=a.length;st.n1+=b.length;st.s+=p.soll.length;st.ok0+=okA?1:0;st.ok1+=okB?1:0;
 if(okA)a.forEach((n,k)=>st.pe0.push(Math.abs(n.m-p.soll[k])*100));if(okB)b.forEach((n,k)=>st.pe1.push(Math.abs(n.m-p.soll[k])*100));
 st.e0.push(Math.abs(a[0].t0-0.1)*1000);st.e1.push(Math.abs(b[0].t0-0.1)*1000);
 if(!okA||!okB||process.env.ALLE)console.log('  '+(okB?'OK    ':'FEHLER')+' '+p.name+': Noten '+a.length+' → '+b.length+' (Soll '+p.soll.length+') | nachher '+b.map(n=>n.m.toFixed(2)+'@'+n.t0.toFixed(3)).join(' '));
}
const av=a=>(a.reduce((s,v)=>s+v,0)/Math.max(1,a.length));
console.log('  GESAMT C: Phrasen mit richtiger Noten-Zahl '+st.ok0+'/'+PV.length+' → '+st.ok1+'/'+PV.length+'; Noten '+st.n0+' → '+st.n1+' (Soll '+st.s+'); mittl. Tonhöhen-Fehler (richtige Phrasen) '+av(st.pe0).toFixed(1)+' → '+av(st.pe1).toFixed(1)+' ct; erster Einsatz mittl. '+av(st.e0).toFixed(1)+' → '+av(st.e1).toFixed(1)+' ms');
}
