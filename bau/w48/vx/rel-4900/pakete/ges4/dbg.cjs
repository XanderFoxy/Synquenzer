// GES4 Fehlersuche: Einsatz-Fehler je Einsatz (vorzeichenbehaftet) für Konsonant-Fälle
const fs=require('fs');const H=fs.readFileSync(process.argv[2],'utf8');
function grab(h,name){const i=h.indexOf('function '+name+'(');if(i<0)throw name;let d=0,j=h.indexOf('){',i)+1;for(;j<h.length;j++){const c=h[j];if(c==='{')d++;else if(c==='}'){d--;if(!d)break;}}return h.slice(i,j+1);}
const V=(new Function(grab(H,'vsDspMake')+';return vsDspMake();'))();
const on=(new Function(grab(H,'ges3Onset')+';return ges3Onset;'))();
const {synth,PA}=require('./faelle.cjs');
const sel=process.argv[3]||'';
for(const p of PA){if(sel&&!p.name.includes(sel))continue;
 for(const pre of [0.1,0.101,0.102,0.103,0.104]){const {x,on:O}=synth(p.ph,16000,7,pre);
 const tr=V.pyin(x,{fs:16000,hop:80,fmin:55,fmax:1050});const sg=V.segment(tr,{snap:false,tuning:0,attack:false});
 const t0=sg.notes.map(n=>n.t0);const ns=sg.notes.map(n=>Object.assign({},n));on(ns,{x,fs:16000});
 console.log(p.name,pre,'noten',sg.notes.length,O.map(o=>{let b=-1,bd=1e9;sg.notes.forEach((n,j)=>{const d=Math.abs(n.t0-o);if(d<bd){bd=d;b=j;}});return b<0||bd>.1?'X':((t0[b]-o)*1000).toFixed(1)+'/'+((ns[b].t0-o)*1000).toFixed(1)+sg.notes[b].by[0];}).join(' '));}
}
