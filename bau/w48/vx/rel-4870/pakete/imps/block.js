/* IMPS-BEGIN – Audio-Import: digitale Stille am Dateianfang verschiebt weder Analyse noch Takt-Lage */
const IMPS={on:true,last:null,z:new WeakMap()};
function impsZ(x){
if(!x||!x.length)return 0;
let z=IMPS.z.get(x);if(z!=null)return z;
const n=x.length,L=x instanceof Float32Array?.5/32767:.5;z=0;while(z<n&&Math.abs(x[z])<L)z++;if(z>=n)z=0;
IMPS.z.set(x,z);return z;
}
function impsZs(c){return IMPS.on&&c&&c.pcm&&c.sr>0?impsZ(c.pcm)/c.sr:0;}
async function impsAnalyse(c,o,prog){
const z=IMPS.on?impsZ(c.x):0;
if(!z){IMPS.last={z:0};return imp1Analyse(c.x.slice(),c.sr,o,prog);}
const r=await imp1Analyse(c.x.slice(z),c.sr,o,prog);
IMPS.last={z,zs:z/c.sr,ok:!!(r&&r.ok)};
if(!r||!r.ok)return r;
const zs=z/c.sr,r0=JSON.parse(JSON.stringify(r)),sh=v=>typeof v==='number'?v+zs:v;
r.t1=sh(r.t1);r.start=sh(r.start);r.ende=sh(r.ende);r.dauer=sh(r.dauer);
if(Array.isArray(r.takte))r.takte=r.takte.map(sh);
if(Array.isArray(r.teile))r.teile=r.teile.map(p=>Object.assign({},p,{t0:sh(p.t0),t1:sh(p.t1)}));
Object.defineProperty(r,'imps',{value:{z,zs,r0},enumerable:false});
return r;
}
function impsSeg(r,c){
const q=r&&r.imps;
if(!q)return spk11Seg(r,c.x,c.sr);
const sg=spk11Seg(q.r0,c.x.subarray(q.z),c.sr);
return sg&&sg.map(p=>Object.assign({},p,{t0:typeof p.t0==='number'?p.t0+q.zs:p.t0,t1:typeof p.t1==='number'?p.t1+q.zs:p.t1}));
}
window.__imps={on:v=>{if(v!=null)IMPS.on=!!v;return IMPS.on;},last:()=>IMPS.last,z:x=>impsZ(x)};
/* IMPS-END */
