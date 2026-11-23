const fs=require('fs');const H1=fs.readFileSync(process.argv[2],'utf8');
function grab(h,name){const i=h.indexOf('function '+name+'(');let d=0,j=h.indexOf('){',i)+1;for(;j<h.length;j++){const c=h[j];if(c==='{')d++;else if(c==='}'){d--;if(!d)break;}}return h.slice(i,j+1);}
let src=grab(H1,'vsMarksMake');
// Debug: Gründe ausgeben
src=src.replace("if(keep)out.push(m);","if(globalThis.DBG)globalThis.DBG.push({t:+(m.i/sr).toFixed(2),src:m.src,word:m.word,keep});if(keep)out.push(m);");
src=src.replace("if(vo&&A===A&&B===B&&Math.abs(B-A)<=70){","if(globalThis.DBG)globalThis.DBG.push({t:+(m.i/sr).toFixed(2),vo,A:Math.round(A),B:Math.round(B)});if(vo&&A===A&&B===B&&Math.abs(B-A)<=70){");
src=src.replace("if(Math.min(L,R)-lo<15){","if(globalThis.DBG)globalThis.DBG.push({tal:+(Math.min(L,R)-lo).toFixed(1)});if(Math.min(L,R)-lo<15){");
src=src.replace("if(d.length>=4&&r<4)keep=false;","if(globalThis.DBG)globalThis.DBG.push({nb:d.length,r:+r.toFixed(2)});if(d.length>=4&&r<4)keep=false;");
module.exports=(new Function(src+';return vsMarksMake();'))();
