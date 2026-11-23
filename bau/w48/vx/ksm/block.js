/* KSM-BEGIN: Klangschule-Regler (TAKT, LFO-Raster, Filter 2, Tonh.-Hk.) als Mod-Ziel und Lock je Schritt; LFO-Vorschau mit Raster-Linien.
   Engine-Ziele 40..47 (Worklet-Block KSM), Lock-Paare mit Kennung -9000-j (j = Index in KSMK). Ohne Route/Lock: alter Weg. */
const KSMK=['ksAa','ksAd','ksAr','ksFa','ksFd','ksFr','ksMa','ksMd','ksMr','ksR1','ksG1','ksR2','ksG2','ksF2c','ksF2r','ksF2e','ksF2m','ksPe'];
const KSM_DST=[['pe','Tonh.-Hk.','OSZ'],['f2cut','Filter 2 Cutoff','FILTER'],['f2res','Filter 2 Reso.','FILTER'],['f2amt','Filter 2 Menge','FILTER'],
['f2mix','Filter 2 Anteil','FILTER'],['ras1','LFO 1 Raster','LFO'],['ras2','LFO 2 Raster','LFO'],['takt','TAKT-Zeiten','HÜLLK.']];
const KSM_LBL={ksAa:'Amp-Hk. A Takt',ksAd:'Amp-Hk. D Takt',ksAr:'Amp-Hk. R Takt',ksFa:'Filter-Hk. A Takt',ksFd:'Filter-Hk. D Takt',ksFr:'Filter-Hk. R Takt',
ksMa:'Hk. 2 A Takt',ksMd:'Hk. 2 D Takt',ksMr:'Hk. 2 R Takt',ksR1:'LFO 1 Raster',ksG1:'LFO 1 Glätten',ksR2:'LFO 2 Raster',ksG2:'LFO 2 Glätten',
ksF2c:'Filter 2 Cutoff',ksF2r:'Filter 2 Resonanz',ksF2e:'Filter 2 Menge',ksF2m:'Filter 2 Anteil',ksPe:'Tonh.-Hk.'};
(function ksmInit(){
try{
const DI=window.SQ_FACTORY&&window.SQ_FACTORY.DST_ID,SD=SQStore.MOD_DST;
KSM_DST.forEach(([id,l,g],j)=>{
if(DI)DI[id]=40+j;
if(Array.isArray(SD)&&!SD.includes(id))SD.push(id);
let G=MOD_DST.find(x=>x[0]===g);
if(!G){G=[g,[]];const fm=MOD_DST.findIndex(x=>x[0]==='FM');MOD_DST.splice(fm<0?MOD_DST.length:fm,0,G);}
if(!G[1].some(x=>x[0]===id))G[1].push([id,l]);
MDST[id]={id,l,g};
});
for(const d of['f2cut','f2res','f2amt','f2mix'])VA_ONLY_DST.add(d);
KSMK.forEach((k,j)=>{
const d=PD[k];if(!d||LKT[k])return;
const r=d.vals?{lo:0,hi:d.vals.length-1,c:'vals',vals:d.vals.slice()}:Object.assign({lo:d.min,hi:d.max,c:d.c||'lin'},d.k!=null?{k:d.k}:null);
LKT[k]=Object.assign({p:k,fam:'va',cls:'n',lbl:KSM_LBL[k]||k,sp:'-',wi:-1,nat:'nein',ksm:-9000-j},r);
});
}catch(e){logErr(e);}
})();
function ksmPv(pv,i,n){
try{
const svg=pv.querySelector('svg');if(!svg)return;
if(!document.getElementById('ksm-css')){const s=document.createElement('style');s.id='ksm-css';
s.textContent='.lfopv .ksmg line{stroke:rgba(255,255,255,.13);stroke-width:1;vector-effect:non-scaling-stroke}';document.head.appendChild(s);}
const g=document.createElementNS('http://www.w3.org/2000/svg','g');g.setAttribute('class','ksmg');svg.insertBefore(g,svg.firstChild);
let sig=null;
const draw=()=>{
const t=S.tracks[i];if(!t||!t.sound||!t.sound.p||!g.isConnected)return;
const p=t.sound.p,sy=+p['l'+n+'sync']||0,r=(+p['ksR'+n])|0,s=sy+'|'+r;if(s===sig)return;sig=s;
let h='';
if(sy>0){const st=sy>=1?(sy>8?4:1):sy,dx=60*st/sy;for(let x=dx;x<119.5;x+=dx)h+='<line x1="'+x.toFixed(2)+'" y1="0" x2="'+x.toFixed(2)+'" y2="56"/>';}
if(r>=3)for(let k=0;k<r;k++){const y=(28-22*(2*k/(r-1)-1)).toFixed(2);h+='<line x1="0" y1="'+y+'" x2="120" y2="'+y+'"/>';}
g.innerHTML=h;g.dataset.n=String(g.childElementCount);
};
draw();ED.refreshers.push(draw);
}catch(e){logErr(e);}
}
/* KSM-END */
