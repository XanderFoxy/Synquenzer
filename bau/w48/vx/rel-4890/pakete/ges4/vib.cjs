// GES4 Vibrato-Fälle: Noten-Zahl und Tonhöhen-Fehler (VSD.pyin+segment wie vsAnalyse, 16 kHz/5 ms)
const fs=require('fs');const H=fs.readFileSync(process.argv[2],'utf8');
function grab(h,name){const i=h.indexOf('function '+name+'(');if(i<0)throw name;let d=0,j=h.indexOf('){',i)+1;for(;j<h.length;j++){const c=h[j];if(c==='{')d++;else if(c==='}'){d--;if(!d)break;}}return h.slice(i,j+1);}
const V=(new Function(grab(H,'vsDspMake')+';return vsDspMake();'))();
const {synth}=require('./faelle.cjs');
const PV=[];
for(const m of [52,57,62,67,72])for(const vr of [5.5])for(const vib of [50]){
 PV.push({name:'Vibrato-Ton m'+m,soll:[m],ph:[{typ:'ton',dur:1.6,m0:m,vib,vr}]});
 PV.push({name:'Gleiten +3 in Vibrato-Ton m'+m,soll:[m],ph:[{typ:'ton',dur:1.6,m0:m-3,m1:m,glide:.25,vib,vr}]});
 PV.push({name:'Vibrato-Ton m'+m+' dann +2',soll:[m,m+2],ph:[{typ:'ton',dur:1.0,m0:m,vib,vr},{typ:'ton',dur:1.0,m0:m,m1:m+2,glide:.08,vib,vr,cont:1}]});
}
let nn=0,ns=0,okc=0,pe=[];
for(const p of PV){const {x}=synth(p.ph,16000,5,0.1);
 const tr=V.pyin(x,{fs:16000,hop:80,fmin:55,fmax:1050});const sg=V.segment(tr,{snap:false,tuning:0,attack:false,ges4:1});
 const ms=sg.notes.filter(n=>n.t1-n.t0>=0.06);const ok=ms.length===p.soll.length;okc+=ok?1:0;nn+=ms.length;ns+=p.soll.length;
 if(ok)ms.forEach((n,k)=>pe.push(Math.abs(n.raw!=null?n.raw-p.soll[k]:n.m-p.soll[k])*100));
 if(process.argv[3]||!ok)console.log((ok?'OK ':'FEHLER ')+p.name+': '+ms.map(n=>n.m+'('+(n.raw!=null?n.raw.toFixed(2):'')+') '+n.t0.toFixed(3)+'-'+n.t1.toFixed(3)).join(' | '));
}
console.log('GESAMT Vibrato: Phrasen richtig '+okc+'/'+PV.length+'; Noten '+nn+' (Soll '+ns+'); mittl. Tonhöhen-Fehler '+(pe.reduce((a,b)=>a+b,0)/Math.max(1,pe.length)).toFixed(1)+' ct');
