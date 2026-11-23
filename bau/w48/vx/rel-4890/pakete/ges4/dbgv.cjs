const fs=require('fs');const H=fs.readFileSync(process.argv[2],'utf8');
function grab(h,name){const i=h.indexOf('function '+name+'(');let d=0,j=h.indexOf('){',i)+1;for(;j<h.length;j++){const c=h[j];if(c==='{')d++;else if(c==='}'){d--;if(!d)break;}}return h.slice(i,j+1);}
const V=(new Function(grab(H,'vsDspMake')+';return vsDspMake();'))();
const {synth}=require('./faelle.cjs');const m=+process.argv[3]||67;
const {x}=synth([{typ:'ton',dur:1.0,m0:m,vib:50,vr:5.5},{typ:'ton',dur:1.0,m0:m,m1:m+2,glide:.08,vib:50,vr:5.5,cont:1}],16000,5,0.1);
const tr=V.pyin(x,{fs:16000,hop:80,fmin:55,fmax:1050});
console.log(Object.keys(tr));
let s='';for(let i=270;i<330;i++){s+=i*5+':'+(tr.f0[i]>0?(12*Math.log2(tr.f0[i]/440)+69).toFixed(2):'---')+(tr.unk&&tr.unk[i]?'u':'')+(tr.vp?'/'+tr.vp[i].toFixed(2):'')+' ';}console.log(s);
{let s='';const E0=tr.e10||tr.rms;for(let i=200;i<400;i+=2){s+=i*5+':'+E0[i].toFixed(1)+' ';}console.log(s);}
const sg=V.segment(tr,{snap:false,tuning:0,attack:false});console.log(sg.notes.map(n=>[n.t0,n.t1,n.m,n.by].join(',')).join(' | '));
