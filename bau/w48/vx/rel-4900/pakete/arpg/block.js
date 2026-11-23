/* ARPG-BEGIN: Arp-Gate über 100 % (Legato). Über 100 % hält jede Arp-Note länger als ihr Schritt und überlappt die nächste.
   Gleiche Tonhöhe: die frühere Note endet, wo die neue beginnt (wie ein Neuanschlag; im MIDI nie zwei gleiche Töne übereinander). */
function arpgCut(s,t,notes){
try{
for(const r of s.hist)for(const v of r.vs){
if(v.dead||!(v.start<t-1e-4)||!(v.relT>t+1e-4))continue;
let hit=false;for(const n of notes)if(Math.min(127,Math.max(0,Math.round(n.p)))===v.out){hit=true;break;}
if(!hit)continue;
v.release(t);
if(v.log&&v.log.time!=null)v.log.dur=Math.max(0,t-v.log.time);
for(const e of r.le)if(e.note===v.out&&Math.abs(e.t-v.start)<1e-6&&e.t+e.dur>t)e.dur=Math.max(0,t-e.t);
}
}catch(e){logErr(e);}
}
function arpgTrim(out,t,p,Eb){
for(let k=out.length-1,n=0;k>=0&&n<256;k--,n++){const x=out[k];if(x.p===p&&x.t<t-Eb&&x.t+x.d>t+Eb)x.d=t-x.t;}
}
/* ARPG-END */
