const M=require('./dbg.cjs');
const x=new Float32Array(48000*2);let r=1;const rn=()=>{r=(r*1664525+1013904223)>>>0;return r/4294967296;};
for(let i=0;i<x.length;i++){const t=i/48000;x[i]=(t>.3&&t<1.7?0.2*Math.sin(2*Math.PI*294*t)*Math.pow(10,6*Math.sin(2*Math.PI*4*t)/20):0)+0.0003*(rn()*2-1);}
globalThis.DBG=[];const a=M.detectMarks(x,48000,{});const b=M.detectMarks(x,48000,{g3:1});
console.log(a.map(m=>m.src+'@'+m.t.toFixed(2)+(m.word?'w':'')).join(' '));console.log(b.length);for(const d of DBG)console.log(JSON.stringify(d));
