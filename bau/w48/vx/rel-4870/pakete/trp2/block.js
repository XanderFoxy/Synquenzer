/* TRP2-BEGIN – Stufen-Teil (trs): Song-Aufnahme rechnet die Stufen zurück, gehaltene Noten an der Teil-Grenze neu gestimmt */
function trp2NoteFor(track,clipKey,played,time,entry){
if(!R.songPlay||!S.song||!S.song.marks||!S.song.marks.length)return null;
const L=trp1L(S.song);if(!L||!trp1TrOk(track))return null;
const sb=songBeatOf(t2b(time+1e-6));if(sb==null||!trp1At(L,sb))return null;
const e=entry||T.targetAt(time+1e-6);let best=played,bestErr=Infinity;
for(let d=0;d<=24;d++)for(const n of d?[played-d,played+d]:[played]){
if(n<0||n>127)continue;
const err=Math.abs(outPitch(track,clipKey,n,time,e)-played);
if(err===0)return n;
if(err<bestErr){bestErr=err;best=n;}
}
return best;
}
function trp2Tick(b0,b1){
const sp=R.songPlay;if(!sp||!S.song||!S.song.marks||!S.song.marks.length)return;
const L=trp1L(S.song);if(!L)return;
const s0=songBeatOf(b0),s1=songBeatOf(b1);if(s0==null||s1==null||s1<=s0||s1-s0>b1-b0+1e-6)return;
const E=new Set();
for(const x of L)for(const q of[x.b0,x.b1])if(q>=s0-1e-9&&q<s1-1e-9)E.add(+q.toFixed(6));
for(const q of[...E].sort((p,r)=>p-r)){const B=b0+(q-s0);if(B>0)applyCarrierChange({time:b2t(B)},{retriggerFrom:-Infinity});}
}
function trp2Re(song,m,a,len){
if(!m||!(m.trs||m.trn))return;
const nm=song.marks.find(x=>x.a===a&&x.part===m.part);if(!nm||nm.trs)return;
const per=trp1PerBar(m),out=[];for(let o=0;o<len;o++)out.push(per.length?per[Math.min(o,per.length-1)]:null);
const tn=m.trn;delete nm.trn;if(tn)nm.trn=tn;
if(out.some(x=>x&&x.s))trp1PerPut(nm,out);
TRP1.fc=null;
}
/* TRP2-END */
