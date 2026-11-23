/* TON2-BEGIN: erster Ton der Audio-Clips nach dem Laden – Stücke eines Takes parallel lesen (in Reihenfolge eingesetzt, höchstens TON2_W gleichzeitig) und die Lautheits-Analyse mit dem Take im Gerätespeicher merken (Schlüssel <take>:lv1), statt sie nach jedem Laden neu zu rechnen; alte Takes: einmal rechnen, dann merken */
const TON2={got:new Map(),sv:new WeakSet(),hit:0,miss:0,bad:0,save:0,err:0,sig:null},TON2_W=6;
function ton2Pf(keys){
const P=new Map();let j=0;
const pre=x=>{if(x<keys.length&&!P.has(x)){const p=kv.aget(keys[x]);p.catch(()=>{});P.set(x,p);}};
return()=>{for(let x=j;x<j+TON2_W;x++)pre(x);const p=P.get(j);P.delete(j);j++;return p;};
}
function ton2Hash(s,h){h=h>>>0||2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}return h;}
function ton2Sig(){
if(TON2.sig)return TON2.sig;
let s=[VP_LUFS,VP_REF,VP_LO,VP_HI,VP_CEIL,VP_K,VP_ATT,VP_REL].join(',');
for(const f of[vpKco,vpTp,vpJob,vpStep,vpEnvBuf,vpEnvFill,vpEnvD])s+='|'+String(f);
return(TON2.sig='lv1-'+ton2Hash(s).toString(36)+'-'+s.length.toString(36));
}
function ton2Fp(b){
const d=b.getChannelData(0),n=d.length,u=new Uint32Array(d.buffer,d.byteOffset,n),M=Math.min(n,4096);let h=2166136261;
for(let k=0;k<M;k++){const i=M>1?Math.floor(k*(n-1)/(M-1)):0;h^=u[i];h=Math.imul(h,16777619)>>>0;}
return n+':'+b.sampleRate+':'+h.toString(36);
}
function ton2Read(id){
return kv.aget(id+':lv1').then(ab=>{
if(!(ab instanceof ArrayBuffer)||ab.byteLength<8)return null;
const dv=new DataView(ab),hl=dv.getUint32(0,true);if(hl<2||8+hl>ab.byteLength)return null;
const h=JSON.parse(new TextDecoder().decode(new Uint8Array(ab,8,hl)));const o=(8+hl+3)&~3,nf=dv.getUint32(4,true);
if(!h||h.sig!==ton2Sig()||o+nf*4>ab.byteLength)return null;
h.f=new Float32Array(ab.slice(o,o+nf*4));return h;
},()=>null).catch(()=>null);
}
function ton2Load(id){
return Promise.all([tkPcm(id),ton2Read(id)]).then(([pcm,c])=>{if(pcm)TON2.got.set(id,c);return pcm;});
}
function ton2Use(id,b){
try{
const c=TON2.got.get(id);TON2.got.delete(id);
if(!c||!b||VP.m.has(b)){TON2.miss++;return;}
if(c.fp!==ton2Fp(b)){TON2.bad++;return;}
const r={lufs:c.lufs,gDb:c.gDb,g:c.g,pk:c.pk,env:null,segs:c.segs,K:c.K,grDb:c.grDb};
if(c.nb>0){
const env=new Float32Array(c.nb).fill(1);let q=0;
for(const[s0,s1]of c.segs){const e=Math.min(c.nb-1,s1+1);for(let k=s0;k<=e;k++)env[k]=c.f[q++];}
r.env=env;
}
if(c.eb===1)r.eb=null;
else if(c.eb===2){const eb=vpEnvBuf(b.length,b.sampleRate),d=eb.d||eb.getChannelData(0);for(const sg of c.segs)vpEnvFill(d,r.env,sg,b.sampleRate);r.eb=eb;}
r.ms=c.ms;r.sec=c.sec;
VP.m.set(b,r);TON2.sv.add(b);TON2.hit++;
}catch(e){TON2.err++;logErr(e);}
}
function ton2Done(b,r){
try{
if(!b||!r||r.ms==null||TON2.sv.has(b)||!b.getChannelData)return;
let id=null;for(const[k,x]of TK.buf)if(x===b){id=k;break;}
if(!id||!S.takes||!S.takes[id]||!kv||!kv.aput)return;
TON2.sv.add(b);
const nb=r.env?r.env.length:0,parts=[];let nf=0;
if(nb)for(const[s0,s1]of r.segs){const e=Math.min(nb-1,s1+1);parts.push(r.env.subarray(s0,e+1));nf+=e-s0+1;}
const h={sig:ton2Sig(),fp:ton2Fp(b),lufs:r.lufs,gDb:r.gDb,g:r.g,pk:r.pk,grDb:r.grDb,K:r.K,segs:r.segs,nb,eb:!('eb'in r)?0:r.eb?2:1,ms:r.ms,sec:r.sec};
const hb=new TextEncoder().encode(JSON.stringify(h)),o=(8+hb.length+3)&~3,ab=new ArrayBuffer(o+nf*4),dv=new DataView(ab);
dv.setUint32(0,hb.length,true);dv.setUint32(4,nf,true);new Uint8Array(ab,8,hb.length).set(hb);
const f=new Float32Array(ab,o,nf);let q=0;for(const p of parts){f.set(p,q);q+=p.length;}
kv.aput(id+':lv1',ab).then(()=>{TON2.save++;},e=>{TON2.err++;TON2.sv.delete(b);});
}catch(e){TON2.err++;logErr(e);}
}
/* TON2-END */
