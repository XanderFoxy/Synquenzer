/* VTRIM-BEGIN ===== Paket VTRIM: Gesang zerstörungsfrei beschneiden – Ende-Fähnchen (Nachlauf kürzen/verlängern) und Anfang-Fähnchen im Gesang-Editor =====
   Daten: clip.audio.vt={k:<Take>,e:<Ende s im Take>,a:<Anfang s im Take>} – der Take selbst bleibt ganz. Ohne vt läuft alles wie bisher (bitgleich). */
const VTR={o:null,drag:null,menu:null,css:false,sig:'',dc:new WeakMap(),dead:false,log:[],envK:''};
const VTR_F=.01,VTR_G={'1/4':1,'1/8':.5,'1/8T':1/3,'1/16':.25,'1/16T':1/6,'1/32':.125,'aus':0};
function vtrLog(x){VTR.log.push(x);if(VTR.log.length>64)VTR.log.shift();}
function vtrW(a){
const v=a&&a.vt;if(!v||v.k!==a.take)return null;
const e=isNum(v.e)&&v.e>a.in+1e-3?v.e:null,s=isNum(v.a)&&v.a>=0&&v.a<(e!=null?e:a.out)-1e-3?v.a:null;
return e==null&&s==null?null:{a:s,e};
}
tkExt().audio.push((a,s)=>{
const v=a&&a.vt;
if(v&&typeof v==='object'&&v.k===s.take){
const o={k:s.take};
if(isNum(v.e)&&v.e>s.in+1e-3&&v.e<=36000)o.e=tkR6(v.e);
if(isNum(v.a)&&v.a>=0&&v.a<(o.e!=null?o.e-1e-3:36000))o.a=tkR6(v.a);
if(o.e!=null||o.a!=null)s.vt=o;
}
if(a&&a.v3e===1)s.v3e=1;
});

/* Wiedergabe (Matrix, Loop, Song, Mixdown/Export laufen alle über tkPlace): Stück am Anfang/Ende kappen, kurze Blende an der Schnittkante */
function vtrStart(i,buf,a,t0,t1,off,joined,xs,X,mid,key,vox){
const v=vtrW(a);
let fi=joined? .005:a.fadeIn,fo=mid? .005:a.fadeOut,eo=a.out;
if(v){
if(v.a!=null&&off<v.a){t0+=v.a-off;off=v.a;fi=Math.max(fi||0,VTR_F);xs=false;}
if(v.e!=null&&v.e<eo){eo=v.e;if(t0+(eo-off)<t1-1e-6)fo=Math.max(fo||0,VTR_F);}
}
if(t0>=t1-1e-6||off>=eo-1e-4)return null;
return tkStartSrc({i,buf,when:t0,off,end:Math.min(t1,t0+(eo-off)),gain:a.gain,fi,fo,key,vox,take:a.take,aud:a,xc:xs?tkXfCurve(a.take,1):null,xw:xs?X.w:0});
}
/* Nachlauf hinter dem Loop-Ende (take.post) endet spätestens am Ende-Fähnchen */
function vtrPostCap(a){const v=vtrW(a);return v&&v.e!=null?v.e-a.out:Infinity;}
/* Probe-Daten mit Beschnitt (Clip-WAV, Faltpunkt): gleiche Blende wie live */
function vtrData(buf,a){
const d=buf.getChannelData(0),v=a&&a.vt?vtrW(a):null;if(!v)return d;
const k=(v.a==null?'':v.a)+':'+(v.e==null?'':v.e),hit=VTR.dc.get(d);if(hit&&hit.k===k)return hit.y;
const sr=buf.sampleRate,F=Math.max(1,Math.round(VTR_F*sr)),y=new Float32Array(d),n=y.length;
if(v.e!=null){const e=Math.round(v.e*sr);for(let j=Math.max(0,e-F);j<Math.min(n,e);j++)y[j]*=(e-j)/F;if(e<n)y.fill(0,Math.max(0,e));}
if(v.a!=null){const s0=Math.round(v.a*sr);y.fill(0,0,Math.max(0,Math.min(n,s0)));for(let j=Math.max(0,s0);j<Math.min(n,s0+F);j++)y[j]*=(j-s0)/F;}
VTR.dc.set(d,{k,y});return y;
}
function vtrPk(out,a,i0,step,sr){const v=vtrW(a);if(!v)return;for(let k=0;k<out.length;k++){const t=(i0+(k+.5)*step)/sr;if((v.e!=null&&t>=v.e)||(v.a!=null&&t<v.a))out[k]=0;}}
/* Gesang→Noten: Noten der verknüpften Spur (Noten aus diesem Gesang) im weggeschnittenen Teil schweigen – nichts wird gelöscht */
function vtrMel(i,clip){
const st=stimmeT();if(st<0||st===i||clip.lw)return null;
const s=R.slot[i];if(!(s>=0))return null;
const vc=S.tracks[st].clips[s],a=vc&&vc.audio;if(!a||!a.vt||a.take!==clip.take)return null;
const m=S.takes&&S.takes[a.take];if(!m||m.follow===false)return null;
const v=vtrW(a);if(!v)return null;
const sp=spb();return{a:v.a!=null?a.at+(v.a-a.in)/sp:-Infinity,e:v.e!=null?a.at+(v.e-a.in)/sp:Infinity};
}
function vtrSet(t,s,p,label){
const c=S.tracks[t]&&S.tracks[t].clips[s],a=c&&c.audio;if(!a)return false;
const v=vtrW(a)||{a:null,e:null},n={a:'a'in p?p.a:v.a,e:'e'in p?p.e:v.e};
if(n.a!=null)n.a=tkR6(n.a);if(n.e!=null)n.e=tkR6(n.e);
if(n.a===v.a&&n.e===v.e)return true;
const before=cleanClip(c);
if(n.a==null&&n.e==null)delete a.vt;else{const o={k:a.take};if(n.e!=null)o.e=n.e;if(n.a!=null)o.a=n.a;a.vt=o;}
pushUndo(t,s,before,label);
clipChanged(t,s);markDirty();UI.dirty.all=UI.dirty.grid=UI.dirty.song=true;
if(R.playing&&R.slot[t]===s)tkTrackResync(t);
haptic('tick');vtrLog({kind:'set',t,s,a:n.a,e:n.e,label});VTR.sig='';
return true;
}

/* ---------- Fähnchen im Gesang-Editor ---------- */
function vtrRef(){
const r=ED.rollAt;if(!r||!r.vx||r.vox!=null||!(r.s>=0))return null;
const tr=S.tracks[r.t],c=tr&&tr.clips[r.s],a=c&&c.audio;
if(!a||!S.takes||!S.takes[a.take])return null;
return{t:r.t,s:r.s,c,a};
}
function vtrPostRaw(a){const m=S.takes&&S.takes[a.take],p=m&&m.post;return p&&Math.abs(p.out-a.out)<1e-4?Math.max(0,Math.min(p.sec,m.len/m.sr-a.out)):0;}
function vtrGeo(x){
const a=x.a,sp=spb(),L=clipB(x.c);if(!(sp>0)||!(L>0))return null;
const segA=Math.min(a.at,L),dur=(a.out-a.in)/sp,segB=Math.min(L,segA+dur);if(!(segB>segA+1e-6))return null;
const post=Math.abs(segA+dur-L)<=1e-3?vtrPostRaw(a):0,nE=segB+post/sp,v=vtrW(a),bt=T=>a.at+(T-a.in)/sp,a0=a.in,at=a.at;
const eB=v&&v.e!=null?clamp(bt(v.e),segA,nE):nE,aB=v&&v.a!=null?clamp(bt(v.a),segA,eB):segA;
return{sp,L,segA,segB,post,nE,eB,aB,bpb:x.c.len>0?L/x.c.len:g10aBpb(),tm:b=>a0+(b-at)*sp};
}
/* Nachlauf ragt über die Loop-Klammer (Clip-Ende) hinaus und ist (noch) nicht gekappt */
function vtrOver(G,eB){return G.post>.003&&eB>G.segB+1e-6;}
function vtrToLoop(label){
const y=vtrRef(),g=y?vtrGeo(y):null;if(!y||!g)return false;
return vtrSet(y.t,y.s,{e:g.segB>=g.nE-1e-6?null:g.tm(g.segB)},label||'Gesang-Ende auf Loop-Ende');
}
function vtrStartOn(x){
const v=vtrW(x.a);if(v&&v.a!=null)return true;
return!(x.a.at<=1e-6&&typeof vl3Lim==='function'&&vl3Lim(x)>0);
}
function vtrCss(){
if(VTR.css)return;VTR.css=true;
const s=document.createElement('style');
s.textContent='.vtro{position:absolute;pointer-events:none;overflow:hidden;z-index:3}.vtra{position:absolute;inset:0}'+
'.vtrz{position:absolute;top:0;bottom:0;background:repeating-linear-gradient(135deg,rgba(8,9,12,.62) 0 6px,rgba(8,9,12,.4) 6px 12px)}'+
'.vtre{position:absolute;top:52px;height:56px}.vtre svg{display:block;width:100%;height:100%}.vtre path{fill:var(--vtrc);opacity:.4}'+
'.vtrp{position:absolute;top:0;bottom:0;width:2px;margin-left:-1px;background:var(--vtrc)}'+
'.vtrn{position:absolute;top:0;bottom:0;background:var(--vtrz)}'+
'.vtrt{position:absolute;top:30px;font:600 11px/1 var(--font-ui,sans-serif);color:var(--vtrc);white-space:nowrap}.vtrt.a,.vtrt.e.r{margin-left:6px;transform:none}.vtrt.e,.vtrt.a.r{margin-left:-6px;transform:translateX(-100%)}'+
'.vtrh{position:absolute;top:0;width:48px;height:48px;padding:0;border:0;background:none;color:var(--vtrc);pointer-events:auto;touch-action:none;cursor:grab;-webkit-tap-highlight-color:transparent}'+
'.vtrh.a{margin-left:-14px}.vtrh.a svg{left:14px}.vtrh.e{margin-left:-34px}.vtrh.e svg{left:6px}.vtrh svg{position:absolute;top:3px;width:28px;height:22px}'+
'.vtro.full .vtrh.e path,.vtra.full .vtrh.a path{fill:none;stroke:currentColor;stroke-width:2}.vtro.lo .vtrh.e{top:112px}.vtro.lo .vtrt.e{top:142px}'+
'.vtrc.mbtn{position:absolute;top:112px;height:36px;padding:0 10px;font-size:12px;color:var(--vtrc);border-color:var(--vtrc);white-space:nowrap;pointer-events:auto;touch-action:manipulation}'+
'.vtrm{position:absolute;z-index:6;display:flex;gap:6px;padding:6px;border-radius:10px;background:#15171b;border:1px solid rgba(236,232,223,.18);box-shadow:0 6px 18px rgba(0,0,0,.45)}.vtrm .mbtn{min-height:44px;white-space:nowrap}';
document.head.appendChild(s);
}
function vtrBuild(cM){
vtrCss();const par=cM.parentElement;if(getComputedStyle(par).position==='static')par.style.position='relative';
const o=document.createElement('div');o.className='vtro';
o.innerHTML='<div class="vtre"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d=""/></svg></div>'+
'<div class="vtrn"></div><div class="vtrz e"></div><div class="vtrp e"></div><span class="vtrt e"></span>'+
'<button type="button" class="vtrh e" aria-label="Ende vom Gesang: ziehen kürzt oder verlängert den Nachlauf, tippen zeigt ganze Länge"><svg viewBox="0 0 28 22" aria-hidden="true"><path d="M27 1H2L8 8L2 15H27Z" fill="currentColor"/></svg></button>'+
'<div class="vtra"><div class="vtrz a"></div><div class="vtrp a"></div><span class="vtrt a"></span>'+
'<button type="button" class="vtrh a" aria-label="Anfang vom Gesang: ziehen schneidet den Beginn weg, tippen zeigt ganze Länge"><svg viewBox="0 0 28 22" aria-hidden="true"><path d="M1 1H26L20 8L26 15H1Z" fill="currentColor"/></svg></button></div>';
o.insertAdjacentHTML('beforeend','<button type="button" class="mbtn rb vtrc" aria-label="Ende vom Gesang auf das Loop-Ende setzen: der Nachlauf bleibt in der Loop-Klammer">Ende auf Loop-Ende</button>');
par.appendChild(o);
const q=k=>o.querySelector(k);
o._ee=q('.vtre');o._ez=q('.vtrz.e');o._ep=q('.vtrp.e');o._et=q('.vtrt.e');o._eh=q('.vtrh.e');
o._a=q('.vtra');o._az=q('.vtrz.a');o._ap=q('.vtrp.a');o._at=q('.vtrt.a');o._ah=q('.vtrh.a');o._n=q('.vtrn');o._c=q('.vtrc');
const col=VX1E.col||'#ffb22e';o.style.setProperty('--vtrc',col);o.style.setProperty('--vtrz',typeof vl3Rgba==='function'?vl3Rgba(col,.16):'rgba(255,178,46,.16)');
const stop=e=>e.stopPropagation();
const bind=(h,k)=>{
for(const ev of['touchstart','touchmove','touchend','mousedown','click','dblclick'])h.addEventListener(ev,stop,{passive:true});
h.addEventListener('pointerdown',e=>{
e.preventDefault();e.stopPropagation();
const x=vtrRef(),G=x?vtrGeo(x):null;if(!G)return;
vtrMenuClose();if(typeof VL3==='object')VL3.shown=true;
try{h.setPointerCapture(e.pointerId);}catch(_){}
const b0=k==='e'?G.eB:G.aB;
VTR.drag={id:e.pointerId,k,cx:e.clientX,b0,b:b0,moved:false,t:x.t,s:x.s,G};
});
h.addEventListener('pointermove',e=>{
const d=VTR.drag;if(!d||d.id!==e.pointerId)return;e.preventDefault();e.stopPropagation();
const dx=e.clientX-d.cx;if(!d.moved&&Math.abs(dx)<7)return;d.moved=true;
const f=ED.roll.fol();d.b=vtrSnap(d,d.b0+dx/f.ppb,f.ppb);VTR.sig='';
});
const end=(e,ok)=>{
const d=VTR.drag;if(!d||d.id!==e.pointerId)return;e.preventDefault();e.stopPropagation();
VTR.drag=null;VTR.sig='';try{h.releasePointerCapture(e.pointerId);}catch(_){}
if(!ok)return;
if(!d.moved){vtrMenu(d.k);return;}
vtrCommit(d);
};
h.addEventListener('pointerup',e=>end(e,true));
h.addEventListener('pointercancel',e=>end(e,false));
};
bind(o._eh,'e');bind(o._ah,'a');
for(const ev of['pointerdown','touchstart','touchmove','touchend','mousedown','dblclick'])o._c.addEventListener(ev,stop,{passive:true});
o._c.addEventListener('click',e=>{e.stopPropagation();vtrMenuClose();if(vtrToLoop())toast('Gesang endet am Loop-Ende');VTR.sig='';});
return o;
}
function vtrSnap(d,want,ppb){
const G=d.G,g=VTR_G[ROLLP&&ROLLP.grid],st=g==null?.25:g,mn=Math.max(.25,st),mag=12/ppb;
const lo=d.k==='e'?G.aB+mn:G.segA,hi=d.k==='e'?G.nE:G.eB-mn;if(hi<lo)return d.b0;
let b=st>0?Math.round(want/st)*st:Math.round(want*G.sp/.005)*.005/G.sp;
/* Takt-Grenzen rasten ein, die Loop-Klammer (Clip-Ende) und die ganze Länge noch stärker */
const bp=G.bpb>0?G.bpb:4,kb=Math.round(want/bp)*bp;if(Math.abs(want-kb)<=mag&&kb>=lo-1e-9&&kb<=hi+1e-9)b=kb;
for(const m of d.k==='e'?[G.nE,G.segB]:[G.segA])if(Math.abs(want-m)<=mag*1.5)b=m;
b=clamp(b,lo,hi);
if(d.k==='e'&&Math.abs(b-G.segB)<1e-9&&Math.abs(d.b-G.segB)>1e-9)haptic('tick');
return b;
}
function vtrCommit(d){
const G=d.G;
if(d.k==='e')return vtrSet(d.t,d.s,{e:d.b>=G.nE-1e-6?null:G.tm(d.b)},'Gesang-Ende verschoben');
return vtrSet(d.t,d.s,{a:d.b<=G.segA+1e-6?null:G.tm(d.b)},'Gesang-Anfang verschoben');
}
function vtrEnv(o,x,G){
const buf=tkPlayBuf(x.a.take,x.a);if(!buf)return false;
const d=buf.getChannelData(0),sr=buf.sampleRate,b0=Math.round(x.a.in*sr),s0=Math.round(G.tm(G.segB)*sr),s1=Math.round(G.tm(G.nE)*sr),N=100,st=Math.max(1,(s1-s0)/N),v=new Float32Array(N);
let mx=1e-6;for(let j=Math.max(0,b0);j<Math.min(d.length,s0);j+=16){const y=d[j]<0?-d[j]:d[j];if(y>mx)mx=y;}
for(let i=0;i<N;i++){let p=0;const a=Math.floor(s0+i*st),b=Math.floor(s0+(i+1)*st);for(let j=Math.max(0,a);j<Math.min(d.length,b);j+=2){const y=d[j]<0?-d[j]:d[j];if(y>p)p=y;}v[i]=p;}
let top='M0 50',bot='';for(let i=0;i<N;i++){const h=Math.sqrt(Math.min(1,v[i]/mx))*48;top+='L'+(i+.5)+' '+(50-h).toFixed(1);bot='L'+(i+.5)+' '+(50+h).toFixed(1)+bot;}
o._ee.querySelector('path').setAttribute('d',top+'L100 50'+bot+'Z');
return true;
}
function vtrTxt(base,sec,sg){return sec>.0005?base+' '+sg+fmtDec(sec,2)+' s':base;}
function vtrPaint(){
if(VTR.dead)return;
const api=ED.roll,cM=api&&api.el.main,f=api?api.fol():null,x=vtrRef(),G=x?vtrGeo(x):null;
if(!G||!(f.W>0)||!(f.ppb>0)||!cM.isConnected){if(VTR.o)VTR.o.hidden=true;vtrMenuClose();return;}
const d=VTR.drag,eB=d&&d.k==='e'?d.b:G.eB,aB=d&&d.k==='a'?d.b:G.aB,sOn=vtrStartOn(x);
/* Start-Fähnchen (Vorlauf oder Anfang) ganz nah am Ende-Fähnchen: Ende-Griff + Text rücken nach unten, damit sich nichts überdeckt */
const vo=typeof VL3==='object'&&VL3.o&&VL3.o.isConnected&&!VL3.o.hidden?VL3.o:null,vx=vo?vo._p.style.left:'';
const sig=[f.x0,f.ppb,f.W,cM.offsetLeft,cM.offsetTop,cM.offsetWidth,cM.offsetHeight,eB,aB,G.nE,G.segA,G.segB,sOn,x.a.take,x.a.in,x.a.out,VX1E.col,!!d,vx].join('|');
let o=VTR.o;
if(sig===VTR.sig&&o&&o.isConnected&&!o.hidden)return;
VTR.sig=sig;
if(!o||!o.isConnected||o.parentElement!==cM.parentElement){if(o)o.remove();o=VTR.o=vtrBuild(cM);VTR.envK='';}
o.hidden=false;
const st=o.style;st.left=cM.offsetLeft+'px';st.top=cM.offsetTop+'px';st.width=cM.offsetWidth+'px';st.height=cM.offsetHeight+'px';
const X=b=>(b-f.x0)*f.ppb,xe=X(eB),xn=X(G.nE),xb=X(G.segB),xs=sOn?X(aB):vx?parseFloat(vx):NaN;
o.classList.toggle('full',eB>=G.nE-1e-6);o.classList.toggle('lo',isFinite(xs)&&xe-xs<64);
o._ez.style.left=xe+'px';o._ez.style.width=Math.max(0,xn-xe)+'px';
o._ep.style.left=xe+'px';o._eh.style.left=xe+'px';o._et.style.left=xe+'px';
const et=vtrTxt('Ende',(G.nE-eB)*G.sp,'−');if(o._et.textContent!==et)o._et.textContent=et;
o._et.classList.toggle('r',xe-o._et.offsetWidth-10<0);
/* Nachlauf hinter der Loop-Klammer: getönt, mit einem Tipp aufs Loop-Ende begrenzbar */
const ov=vtrOver(G,eB);o._n.hidden=!ov;if(ov){o._n.style.left=xb+'px';o._n.style.width=Math.max(0,xe-xb)+'px';}
const cOn=ov&&!d&&xb>=0&&xb<=cM.offsetWidth+1;o._c.hidden=!cOn;
if(cOn){const cw=o._c.offsetWidth||140;o._c.style.left=clamp(xb-6-cw,4,Math.max(4,cM.offsetWidth-cw-4))+'px';}
if(G.post>.003){
const k=[x.a.take,x.a.in,x.a.out,G.post,G.sp].join(':');if(VTR.envK!==k&&vtrEnv(o,x,G))VTR.envK=k;
o._ee.hidden=false;o._ee.style.left=xb+'px';o._ee.style.width=Math.max(0,xn-xb)+'px';
}else o._ee.hidden=true;
o._a.hidden=!sOn;
if(sOn){
const xa=X(aB),x0=X(G.segA);
o._a.classList.toggle('full',aB<=G.segA+1e-6);
o._az.style.left=x0+'px';o._az.style.width=Math.max(0,xa-x0)+'px';
o._ap.style.left=xa+'px';o._ah.style.left=xa+'px';o._at.style.left=xa+'px';
const at=vtrTxt('Anfang',(aB-G.segA)*G.sp,'+');if(o._at.textContent!==at)o._at.textContent=at;
o._at.classList.toggle('r',xa+o._at.offsetWidth+10>cM.offsetWidth||(xe-xa<o._at.offsetWidth+o._et.offsetWidth+24&&xa-o._at.offsetWidth-10>=0));
}
}
function vtrMenu(k){
vtrMenuClose();const o=VTR.o,x=vtrRef(),G=x?vtrGeo(x):null;if(!o||!G)return;
const B=k==='e'?[['full','ganze Länge',G.eB>=G.nE-1e-6]].concat(G.post>.003?[['loop','Ende auf Loop-Ende',Math.abs(G.eB-G.segB)<1e-6]]:[]):[['full','ganze Länge',G.aB<=G.segA+1e-6]];
const m=document.createElement('div');m.className='vtrm';m.setAttribute('role','group');m.setAttribute('aria-label',k==='e'?'Ende vom Gesang':'Anfang vom Gesang');
m.innerHTML=B.map(([v,l,on])=>`<button type="button" class="mbtn rb${on?' on':''}" data-v="${v}" aria-pressed="${on}">${l}</button>`).join('');
const par=o.parentElement;par.appendChild(m);
const h=k==='e'?o._eh:o._ah,hx=o.offsetLeft+(parseFloat(h.style.left)||0);
m.style.left=clamp(k==='e'?hx-m.offsetWidth+12:hx-12,4,Math.max(4,par.clientWidth-m.offsetWidth-4))+'px';m.style.top=(o.offsetTop+52)+'px';
for(const ev of['pointerdown','touchstart','mousedown'])m.addEventListener(ev,e=>e.stopPropagation(),{passive:true});
m.addEventListener('click',e=>{
e.stopPropagation();const b=e.target.closest('button');if(!b)return;
const y=vtrRef(),g=y?vtrGeo(y):null;
if(y&&g){
if(b.dataset.v==='full')vtrSet(y.t,y.s,{[k]:null},k==='e'?'Gesang-Ende: ganze Länge':'Gesang-Anfang: ganze Länge');
else if(b.dataset.v==='loop')vtrToLoop('Gesang-Ende auf Loop-Ende');
}
vtrMenuClose();VTR.sig='';
});
VTR.menu=m;
setTimeout(()=>{if(VTR.menu===m)document.addEventListener('pointerdown',vtrOut,true);},0);
}
function vtrOut(e){if(VTR.menu&&!VTR.menu.contains(e.target))vtrMenuClose();}
function vtrMenuClose(){document.removeEventListener('pointerdown',vtrOut,true);if(VTR.menu){VTR.menu.remove();VTR.menu=null;}}
function vtrDrop(){vtrMenuClose();if(VTR.o){VTR.o.remove();VTR.o=null;}VTR.sig='';VTR.drag=null;VTR.envK='';}
/* VTRIM-END */
