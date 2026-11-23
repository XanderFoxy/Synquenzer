/* KSM2-BEGIN: Klangschule-Locks auch fuer Wavetable, MS-Platte und Bit Mask - dort, wo der Kern den Parameter hat.
   WT (nativer Kern): TAKT-Zeiten Amp-/Filter-Hk. A/D/R als Sekunden beim Anschlag; Tonh.-Hk. als eigene Tonhoehen-Kurve je Stimme
   (faellt mit Hk. 2 zurueck, Hk.-2-TAKT-Locks gelten dafuer). MS-Platte: TAKT-Zeiten Amp-Hk. -> EG2, Filter-Hk. -> EG1 (A/D/R, beide Timbres).
   Bit Mask: Tonh.-Hk. -> Start der Tonhoehen-Hk.; TAKT-Zeiten Amp-Hk. -> Osz.-/Rausch-Hk., Filter-Hk. -> Filter-Hk.
   Nicht im Kern (ausgelassen): Filter 2 und LFO-Raster (alle drei), Hk.-2-TAKT und Tonh.-Hk. bei MS-Platte, Hk.-2-TAKT bei Bit Mask,
   Routen auf die neuen Ziele (WT rechnet Modulation nur spurweit, MS-Platte und Bit Mask haben eigene Mod-Matrizen). Ohne Lock: alter Weg. */
const KSM2_BPE=-7745,KSM2_BTA=-7746,KSM2_BTF=-7752;
function ksm2Eng(snd){const g=snd&&snd.engine;return g==='wt'||g==='mk'||g==='bm';}
function ksm2Sec(b){b=+b;if(!(b>0))return 0;b=Math.min(64,Math.max(.0625,b));return b*60/Math.max(20,S.bpm||120);}
function ksm2Put(snd,e,x,out,nat){
const j=-9000-e.ksm,g=snd.engine;
if(g==='wt'){
if(j<6){const s=ksm2Sec(x);if(!s)return false;nat[['aA','aD','aR','fA','fD','fR'][j]]=s;return true;}
if(j<9){const s=ksm2Sec(x);if(!s)return false;nat['ksm2M'+'adr'[j-6]]=s;return true;}
if(j===17&&x){nat.ksm2Pe=clamp(x,-48,48);return true;}
return false;
}
if(g==='mk'){
if(j>=6)return false;const s=ksm2Sec(x);if(!s)return false;
const k=j%3,y=Math.round(clamp(k===0?127/15*Math.log2(s/.0005):127/13*Math.log2(s/.002),0,127));
for(let tm=0;tm<2;tm++){const q=LKT['mk.t.'+tm+'.'+(j<3?'e2':'e1')+'.'+'adr'[k]];if(q&&lkVoiceOk(q,snd)&&out.length<32)out.push(q.wi,y);}
return false;
}
if(g==='bm'&&out.length<32){
if(j===17){out.push(KSM2_BPE,clamp(x,-48,48));return false;}
if(j<6){const s=ksm2Sec(x);if(s)out.push((j<3?KSM2_BTA:KSM2_BTF)-(j%3),s);}
}
return false;
}
function ksm2Bm(o,lk){
for(let j=0;j+1<lk.length;j+=2){const m=lk[j],x=+lk[j+1];if(!isFinite(x))continue;
if(m===KSM2_BPE)o.pe=x;
else if(m<=KSM2_BTA&&m>KSM2_BTA-3)(o.ta||(o.ta=[0,0,0]))[KSM2_BTA-m]=x;
else if(m<=KSM2_BTF&&m>KSM2_BTF-3)(o.tf||(o.tf=[0,0,0]))[KSM2_BTF-m]=x;}
}
function ksm2NatPe(v,PL,src,nodes,srcs,starts,t0){
try{
const pe=+PL.ksm2Pe;if(!pe)return;
const n=(k,d)=>{const x=+PL[k];return PL[k]!=null&&x===x?x:d;};
const E={a:n('ksm2Ma',n('mA',.001)),d:n('ksm2Md',n('mD',.5)),s:clamp(n('mS',0),0,1),r:n('ksm2Mr',n('mR',.5)),c:PL.mCurve==null? .5:+PL.mCurve};
const k=constSrc(0),pk=pe*100;
for(const s of src.srcs)if(s&&s.detune)k.out.connect(s.detune);
srcs.push(k.node);nodes.push(k.node);if(k.extra)nodes.push(k.extra);starts.push([k.node,0]);
envStart(k.offset,t0,E,pk,0);
v.ksm2Pe=k;
v.release=function(t,f){
if(!this.dead&&!f&&t<this.relT){const tt=Math.max(t,t0);try{const y=envValueAt(tt,t0,E,pk,0);k.offset.cancelScheduledValues(tt);k.offset.setValueAtTime(y,tt);k.offset.setTargetAtTime(0,tt,Math.max(E.r,.005)/3);}catch(e){}}
return Object.getPrototypeOf(this).release.call(this,t,f);
};
}catch(e){logErr(e);}
}
/* KSM2-END */
