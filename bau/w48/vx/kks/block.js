/* KKS-BEGIN: Klangkorn-Seite im Klang-Editor – ein WT-Klang mit Klangkorn-Quelle (p.wt.h) zeigt statt der Wavetable-Seite die echten Klangkorn-Regler */
const KKS_D={bew:['Bewegung','bip'],gs:['Korngröße','exp'],dc:['Dichte','lin'],form:['Kornform','lin'],spo:['Streu Ort','lin'],spt:['Streu Ton','lin'],br:['Breite','lin'],vol:['Lautst.','lin']};
function kksIs(i){const s=sndOf(i),h=s&&s.engine==='wt'&&s.p&&s.p.wt&&s.p.wt.h;return!!(h&&typeof h==='object'&&typeof h.take==='string');}
function kksLive(i){
try{
const s=sndOf(i),A=AU.tracks&&AU.tracks[i];if(!s||!A||!kksIs(i)||!SPK7.tr)return;
const E=SPK7.tr.get(A.trackIn);if(!E||E.dead)return;
const ef=spk7Eff(s),pk=JSON.stringify(ef);if(E.pk!==pk){E.pk=pk;E.set(ef);}
}catch(e){logErr(e);}
}
function kksGet(i,k){const s=sndOf(i),h=s&&s.p&&s.p.wt&&s.p.wt.h,v=h&&h[k];return k==='art'?(v==='frz'?'frz':'korn'):(typeof v==='number'&&isFinite(v)?v:SPK7_DEF[k]);}
function kksSet(i,k,v){
if(!kksIs(i))return undefined;
const h=sndOf(i).p.wt.h,r=SPK7_RG[k],nv=k==='art'?(v==='frz'?'frz':'korn'):Math.max(r[0],Math.min(r[1],+v));
if(k!=='art'&&!isFinite(nv))return kksGet(i,k);
if(h[k]===nv)return nv;
h[k]=nv;UI.sndVer++;UI.dirty.strip=true;markDirty();kksLive(i);
if(R.editor==='synth'&&i===R.selT)edParamChanged('kks.'+k);
return nv;
}
function kksKnob(i,k){
const[l,c]=KKS_D[k],r=SPK7_RG[k],f=SPK7_SL.find(q=>q[0]===k)[3];
return makeCtl({p:'kks.'+k,l,min:r[0],max:r[1],c,def:SPK7_DEF[k]},()=>kksGet(i,k),v=>kksSet(i,k,v),{undo:soundUndo(i),key:'kks.'+k,fmt:f,label:l});
}
function kksPage(pg,i){
if(!kksIs(i))return false;
const art=makeSeg([['korn','Körnchen'],['frz','Schleife']],()=>kksGet(i,'art'),v=>{kksSet(i,'art',v);vis();},null,{undo:soundUndo(i),label:'Modus'});
art.dataset.key='kks.art';
const kk={};for(const k in KKS_D)kk[k]=kksKnob(i,k);
const ks1=[sKnob('wt.pos'),kk.bew,kk.gs,kk.dc,kk.form],ks2=[kk.spo,kk.spt,kk.br,kk.vol,sKnob('cutoff')],ks3=[sKnob('res'),sKnob('aA'),sKnob('aD'),sKnob('aS'),sKnob('aR')];
const all=ks1.concat(ks2,ks3);
function vis(){const f=kksGet(i,'art')==='frz';for(const k of['gs','dc','spt','form'])kk[k].classList.toggle('inert',f);}
vis();
ED.refreshers.push(()=>{art.update();all.forEach(x=>x.update());vis();kksLive(i);});
const r1=el('div','pgrow segs rest');r1.append(lgrp('Modus',art));
pg.classList.add('kks-pg');
pg.append(r1,kRow(ks1,'k5'),kRow(ks2,'k5'),kRow(ks3,'k5'),el('div','small note','Klangkorn: kurze Körner aus der Quelle, Position wählt die Stelle. Schleife = eingefrorenes Spektrum (Korn-Regler ruhen).'));
return true;
}
/* KKS-END */
