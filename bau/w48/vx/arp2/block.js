/* ARP2-BEGIN (Arp- und Lauf-Feinheiten: Key Sync aus im Taktmass von Clip/Song, Arp aus -> gehaltene Toene klingen sofort direkt,
   Clip-Noten eines Planungsfensters in Zeitfolge anlegen) */
function arp2Bf(c){
if(c){const B=clipBarB(c);return B===4?undefined:b=>Math.floor(b/B+1e-6)*B;}
return tkPlain()?undefined:b=>barBeat(barAt(b,1e-6));
}
function arp2Ord(ev){
let p=-Infinity;
for(const e of ev.values()){if(e.t<p-1e-9)return[...ev.values()].sort((x,y)=>x.t-y.t);p=e.t;}
return ev.values();
}
function arp2Resume(i,iv,now,all,dir){
const tr=S.tracks[i];if(!tr||tr.kind!=='synth'||tr.mute||!AU.ctx||!iv||!iv.length)return 0;
const t1=now+.003,tc=now+.006;let n=0;
for(const x of iv){
if(x.src==='live'){
if(x.off!==Infinity)continue;
const inp=R.inputs&&R.inputs[x.id];if(!inp||inp.route!=='play'||inp.arp!==i||inp.voice)continue;
const t=Math.max(now+LIVE_LEAD,x.on),v=spawnVoice(i,x.n,x.vel,t,{src:'live'});if(!v)continue;
inp.voice=v;v.log=logNote({track:i,src:'live',clipNote:null,out:x.n,time:t,dur:null,vel:x.vel});n++;continue;
}
if(!R.playing)continue;
const t=Math.max(t1,x.on);if(x.off<=t+.02)continue;
if(x.src==='melody'){
if(dir&&!dir(x.n))continue;
const v=spawnVoice(i,x.n,x.vel,t,{src:'melody'});if(v){v.release(x.off);v.log=logNote({track:i,src:'melody',clipNote:null,out:x.n,time:t,dur:x.off-t,vel:x.vel});n++;}
continue;
}
if(!all&&x.on>=tc-1e-6)continue;
const out=clamp(x.raw?x.n:outPitch(i,x.key,x.n,t),0,127);
if(dir&&!dir(out))continue;
if(spawnClipVoice(i,out,x.vel,t,x.off-t,x.n,x.key||null,false,undefined,x.lk?{lk:x.lk}:null))n++;
}
return n;
}
/* ARP2-END */
