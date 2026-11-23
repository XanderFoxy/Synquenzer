/* TON1-BEGIN: erster Klangkorn-Ton nach dem Laden – das Audio aus dem Gerätespeicher geht sofort (vor den Spektren) an wartende Spur-Engines; der Worklet-Kern lässt wartende Stimmen weiterlaufen und blendet sie an der richtigen Stelle ein */
const TON1={pre:new Map()};
function ton1Msg(e){return{t:'src',x:e.x,sr:e.sr,f0:e.f0,frz:null,FL:0,fk:1,pre:1};}
function ton1Got(take,x,sr,f0){
try{
const e={x,sr,f0};TON1.pre.set(take,e);
setTimeout(()=>{if(TON1.pre.get(take)===e)TON1.pre.delete(take);},20000);
for(const E of SPK7.trS||[])if(E&&!E.dead&&E.ton1w===take&&E.take===take&&E.f0===f0){E.ton1w=null;E.post(ton1Msg(e));}
}catch(err){logErr(err);}
}
function ton1Pre(E,h){
try{
const e=TON1.pre.get(h.take);
if(e&&e.f0===h.f0&&!SPK7.pcm.has(h.take)){E.ton1w=null;E.post(ton1Msg(e));}else E.ton1w=h.take;
}catch(err){logErr(err);}
}
/* TON1-END */
