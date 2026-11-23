/* CMD3-BEGIN – Echo je Spur aus dem DAW-Projekt-Import: weicht das Delay einer Synth-Spur vom Projekt-Echo ab, bekommt sie ein eigenes Echo (gleiche Einstellungen teilen sich eines) */
function cmd3Norm(e){
if(!e||typeof e!=='object')return null;
let n=null;try{n=normFxBus({echo:e}).echo;}catch(er){n=null;}
return n&&typeof n==='object'?n:null;
}
function cmd3NormTr(t,o,def){
if(!t||!o||!def||def.kind!=='synth'||!t.ech||typeof t.ech!=='object')return;
const n=cmd3Norm(t.ech);if(n)o.ech=n;
}
function cmd3Echo(c,p){
const m=c&&c.mlg2,P=m&&m.on&&m.prep;if(!P||!p||!p.fxBus||!p.fxBus.echo||!Array.isArray(p.tracks))return;
const PE=p.fxBus.echo,sp=JSON.stringify(cmd3Norm(PE));let n=0;
P.forEach((x,i)=>{
const t=p.tracks[i];if(!x||!x.echo||!t||t.kind!=='synth')return;
const e=cmd3Norm(Object.assign({},PE,x.echo));if(!e||JSON.stringify(e)===sp)return;
t.ech=e;n++;
});
if(m.stat)m.stat.ech=n;
}
function cmd3Reg(c){
const W=cmd3Reg.w||(cmd3Reg.w=new WeakMap());let M=W.get(c);
if(!M){M=new Map();W.set(c,M);}
return M;
}
function cmd3Max(e){
let s=.1;for(const d of[e.divL,e.divR]){const v=FX.divSec(d||'1/8',40);if(v>s)s=v;}
return Math.min(6,s+.06);
}
function cmd3Unit(c,e,sig){
const M=cmd3Reg(c);let U=M.get(sig);if(U)return U;
const E=FX.Echo(c,{loopExtra:AU.loopExtra||0,maxSec:cmd3Max(e)});E.set(e,S.bpm);
E.output.connect(AU.masterSum);if(AU.hallIn)E.toHall.connect(AU.hallIn);
U={E,e,sig};M.set(sig,U);return U;
}
function cmd3Sync(i){
const c=AU.ctx,A=AU.tracks[i],tr=S.tracks[i];if(!c||!A||!A.dlySend||!AU.echoIn||!AU.masterSum)return;
const e=tr&&tr.kind==='synth'&&tr.ech?tr.ech:null,sig=e?JSON.stringify(e):'';
if((A.cmd3Sig||'')===sig)return;
let U=null;if(e){try{U=cmd3Unit(c,e,sig);}catch(er){logErr(er);U=null;}if(!U)return;}
try{A.dlySend.disconnect(A.cmd3U?A.cmd3U.E.input:AU.echoIn);}catch(er){}
A.dlySend.connect(U?U.E.input:AU.echoIn);
A.cmd3U=U;A.cmd3Sig=sig;
cmd3Gc(c);
}
function cmd3Gc(c){
const M=cmd3Reg(c);if(!M.size)return;
const used=new Set();for(const A of AU.tracks)if(A&&A.cmd3U)used.add(A.cmd3U.sig);
for(const[k,U]of M)if(!used.has(k)){M.delete(k);const E=U.E;setTimeout(()=>{try{E.output.disconnect();E.toHall.disconnect();}catch(er){}},4000);}
}
function cmd3Tempo(t){
const c=AU.ctx;if(!c)return;
for(const U of cmd3Reg(c).values()){try{U.E.set(U.e,S.bpm,t==null?c.currentTime:t);}catch(er){}}
}
function cmd3Kill(){
const c=AU.ctx;if(!c)return;const M=cmd3Reg(c);if(!M.size)return;
const now=c.currentTime;let T=.2;
for(const U of M.values()){
const E=U.E;try{E.kill(now);for(const g of[E.ret.gain,E.toHall.gain]){g.cancelScheduledValues(now);g.setTargetAtTime(0,now,.008);}}catch(er){}
T=Math.max(T,FX.divSec(U.e.divL,S.bpm),FX.divSec(U.e.divR,S.bpm));
}
clearTimeout(cmd3Kill.t);cmd3Kill.t=setTimeout(()=>{cmd3Kill.t=0;cmd3Tempo();},Math.min(6.2,T+.15)*1000);
}
function cmd3Own(e,E){return!!e&&(!E||JSON.stringify(cmd3Norm(Object.assign({},E,e)))!==JSON.stringify(cmd3Norm(E)));}
function cmd3Ech(e,E){
if(!e)return'';
if(!cmd3Own(e,E))return'Echo '+e.divL+' wie in der DAW';
return'eigenes Echo '+e.divL+(e.divR&&e.divR!==e.divL?' | '+e.divR:'')+' wie in der DAW';
}
/* CMD3-END */
