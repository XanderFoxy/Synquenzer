/* VXRR-BEGIN – Gesang reinigen: Regler „Gesamt“ und Stärke je Schritt (0–100 %, Standard 100 % = Ergebnis wie bisher, bitgleich).
   Stärke a je Schritt (× Gesamt) mischt im Kern nach dem Schritt: y = vorher + a·(nachher − vorher); bei 100 % rechnet nichts mit. */
function vxrrNorm(v){
const o={g:1,a:{}},c=x=>Math.round(Math.max(0,Math.min(1,+x))*100)/100;if(!v||typeof v!=='object')return o;
if(v.g!=null&&isFinite(v.g))o.g=c(v.g);
if(v.a&&typeof v.a==='object')for(const k of VXR1_ORDER)if(v.a[k]!=null&&isFinite(v.a[k])&&c(v.a[k])<1)o.a[k]=c(v.a[k]);
return o;
}
const vxrrDef=v=>v.g>=1&&!Object.keys(v.a).length;
function vxrrGet(id){const s=vr1Sel(id);if(!s.vxrr){const m=S.takes&&S.takes[id];s.vxrr=vxrrNorm(m&&m.vr1&&m.vr1.vxrr);}return s.vxrr;}
function vxrrSet(id,k,pct){const V=vxrrGet(id),n=JSON.parse(JSON.stringify(V));if(k==='g')n.g=pct/100;else n.a[k]=pct/100;vr1Sel(id).vxrr=vxrrNorm(n);}
function vxrrMix(id,P){
try{if(!P||!P.steps)return P;const V=vxrrGet(id);if(vxrrDef(V))return P;
for(const k in P.steps){const o=P.steps[k],e=Math.round(V.g*(V.a[k]!=null?V.a[k]:1)*1e4)/1e4;if(e<1&&o&&typeof o==='object')o.vxa=e;}}catch(e){}
return P;
}
function vxrrStore(id,m){if(!m||!m.vr1)return;const V=vxrrGet(id);if(vxrrDef(V))delete m.vr1.vxrr;else m.vr1.vxrr=JSON.parse(JSON.stringify(V));}
function vxrrSame(id,m){return JSON.stringify(vxrrGet(id))===JSON.stringify(vxrrNorm(m&&m.vr1&&m.vr1.vxrr));}
// Säubern, das „Gesang reinigen“ beim Anwenden selbst dazuschaltet, folgt dem Gesamt-Regler (0 % = bleibt aus)
function vxrrNoCl(id,m,lv){const V=vxrrGet(id);if(V.g>=1||!m||(m.cl|0))return false;const b=(typeof CH5_VR1!=='undefined'&&CH5_VR1[lv])||0,v=Math.round(b*V.g/5)*5;if(v>0)m.cl=v;return true;}
function vxrrPvCl(id,v){const V=vxrrGet(id);return V.g>=1?v:Math.round(v*V.g/5)*5;}
tkExt().take.push((raw,o)=>{const v=raw&&raw.vr1&&raw.vr1.vxrr;if(!o||!o.vr1||!v)return;const n=vxrrNorm(v);if(!vxrrDef(n))o.vr1.vxrr=n;});

function vxrrRow(k,lab,v,ok){return`<div class="clrow"><span class="cllab">${lab} <b class="vxrrv" data-vxrr="${k}">${v} %</b></span><input type="range" class="clr pan-x vxrrr" data-vxrr="${k}" min="0" max="100" step="5" value="${v}"${ok?'':' disabled'} aria-label="${lab} 0 bis 100 Prozent"></div>`;}
function vxrrBuild(d,id,ok){
const V=vxrrGet(id),pc=x=>Math.round(100*x);d._vxrrOk=!!ok;
const r0=d.querySelector('.clrow');if(r0)r0.insertAdjacentHTML('afterend',vxrrRow('g','Gesamt',pc(V.g),ok));
const mo=d.querySelector('.vr1more');
if(mo)mo.insertAdjacentHTML('beforeend',`<div class="vxrrg"><div class="small">Stärke je Schritt</div>`+VXR1_ORDER.map(k=>vxrrRow(k,VR1_NM[k],pc(V.a[k]!=null?V.a[k]:1),ok)).join('')+`</div>`);
d.addEventListener('input',e=>{const r=e.target;if(!r||!r.classList||!r.classList.contains('vxrrr'))return;r._vxrrDrag=1;const b=d.querySelector('b.vxrrv[data-vxrr="'+r.dataset.vxrr+'"]');if(b)b.textContent=r.value+' %';});
d.addEventListener('change',e=>{const r=e.target;if(!r||!r.classList||!r.classList.contains('vxrrr'))return;r._vxrrDrag=0;vxrrSet(id,r.dataset.vxrr,+r.value);vr1Status();});
}
function vxrrPaint(d,id,s,m,P){
if(!d||!d.querySelector('.vxrrr'))return;const V=vxrrGet(id),ok=d._vxrrOk&&tkAudioOk();
for(const r of d.querySelectorAll('input.vxrrr')){
const k=r.dataset.vxrr,v=Math.round(100*(k==='g'?V.g:(V.a[k]!=null?V.a[k]:1)));
r.disabled=!ok||(k!=='g'&&!(P&&P.steps[k]));
if(!r._vxrrDrag&&+r.value!==v){r.value=String(v);const b=d.querySelector('b.vxrrv[data-vxrr="'+k+'"]');if(b)b.textContent=v+' %';}
}
}
/* VXRR-END */
