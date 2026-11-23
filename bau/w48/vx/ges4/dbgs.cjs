const fs=require('fs');const H=fs.readFileSync(process.argv[2],'utf8');
function grab(h,name){const i=h.indexOf('function '+name+'(');let d=0,j=h.indexOf('){',i)+1;for(;j<h.length;j++){const c=h[j];if(c==='{')d++;else if(c==='}'){d--;if(!d)break;}}return h.slice(i,j+1);}
let src=grab(H,'vsDspMake');src=src.replace("push(s0,bd,'p');","globalThis.DB&&console.log('pcut',bd*5,c.toFixed(2),nl.toFixed(2));push(s0,bd,'p');").replace("/* GES2 */if(o.ges2!==false)ges2Glide(notes,m,unk,F);","globalThis.DB&&console.log('vor ges2',JSON.stringify(notes.map(n=>[n.a*5,n.b*5,+n.m.toFixed(2)])));/* GES2 */if(o.ges2!==false)ges2Glide(notes,m,unk,F);globalThis.DB&&console.log('nach ges2',JSON.stringify(notes.map(n=>[n.a*5,n.b*5,+n.m.toFixed(2)])));");
const V=(new Function(src+';return vsDspMake();'))();
const {synth}=require('./faelle.cjs');const mm=+process.argv[3];
const {x}=synth([{typ:'ton',dur:1.6,m0:mm-3,m1:mm,glide:.25,vib:50,vr:5.5}],16000,5,0.1);
const tr=V.pyin(x,{fs:16000,hop:80,fmin:55,fmax:1050});globalThis.DB=1;
const sg=V.segment(tr,{snap:false,tuning:0,attack:false,ges4:1});console.log(sg.notes.map(n=>[n.t0,n.t1,n.m,n.by].join(',')).join(' | '));
let s='';for(let i=18;i<80;i+=2)s+=i*5+':'+(tr.f0[i]>0?(12*Math.log2(tr.f0[i]/440)+69).toFixed(2):'-')+' ';console.log(s);
