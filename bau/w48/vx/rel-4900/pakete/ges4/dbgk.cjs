const fs=require('fs');const H=fs.readFileSync(process.argv[2],'utf8');
function grab(h,name){const i=h.indexOf('function '+name+'(');let d=0,j=h.indexOf('){',i)+1;for(;j<h.length;j++){const c=h[j];if(c==='{')d++;else if(c==='}'){d--;if(!d)break;}}return h.slice(i,j+1);}
let src=grab(H,'ges4Kons');src=src.replace('if(E[jp]-E[jm]<25)','console.log("K",jm,jp,E[jm].toFixed(1),E[jp].toFixed(1));if(E[jp]-E[jm]<25)').replace('if(l===0','console.log("lr",l,r,jm);if(l===0').replace('return v[v','console.log("pre",v[v.length>>1].toFixed(1),t.toFixed(1));return v[v');
const K=(new Function(src+';return ges4Kons;'))();globalThis.ges4Kons=K;
const V=(new Function(grab(H,'vsDspMake')+';return vsDspMake();'))();
const on=(new Function(grab(H,'ges3Onset')+';return ges3Onset;'))();
const {synth,PA}=require('./faelle.cjs');const p=PA[1];
const {x,on:O}=synth(p.ph,16000,7,0.1);const tr=V.pyin(x,{fs:16000,hop:80,fmin:55,fmax:1050});const sg=V.segment(tr,{snap:false,tuning:0,attack:false});
on(sg.notes,{x,fs:16000});console.log(sg.notes.map(n=>n.t0.toFixed(4)),O);
