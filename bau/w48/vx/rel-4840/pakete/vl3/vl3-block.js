/* VL3-BEGIN ===== Paket VL3: Auftakt erkennen und falten, Fähnchen im Gesang-Editor ===== */
const VL3={pend:new Map(),roll:null,o:null,sig:'',raf:0,shown:false,t0:0,drag:null,menu:null,css:false};
function vl3Bar(c){return c&&c.len>0?clipB(c)/c.len*spb():g10aBpb()*spb();}
function vl3Max(c,a){
if(!c||!a||!isNum(a.in))return 0;
const bar=vl3Bar(c),v=vl2Vor(a);
return Math.max(0,Math.min(a.in,2*bar,v?v.takte*bar:Infinity));
}
function vl3Sec(c,a){
if(!c||!a||!isNum(c.vl3s)||!(c.vl3s>0))return 0;
return Math.min(c.vl3s,vl3Max(c,a));
}

/* Einsatz der Phrase im letzten Takt vor der 1 (Sekunden vor der 1), 0 = kein Auftakt */
function vl3Find(pcm,ia,sr,bar,beat){
if(!(bar>0)||!(ia>sr*.06))return 0;
const i0=Math.max(0,ia-Math.round(bar*sr)),i1=Math.min(pcm.length,ia+Math.round(sr));
const{e,w}=g3Env(pcm,i0,i1,sr),ka=Math.floor((ia-i0)/w);if(ka<4)return 0;
const thr=vl2Thr(e);
let pkB=0;for(let k=ka;k<e.length;k++)if(e[k]>pkB)pkB=e[k];
let k=ka-1;while(k>=0&&!(e[k]>thr))k--;if(k<0)return 0;
const G=4,seg=end=>{let s=end,g=0,pk=0;for(let j=end;j>=0;j--){if(e[j]>thr){s=j;g=0;if(e[j]>pk)pk=e[j];}else if(++g>G)break;}return{s,pk};};
const A=seg(k);if(A.pk<Math.max(thr*1.5,pkB*.2))return 0;
const gapMax=Math.max(G,Math.round(Math.min(beat*.5,.25)*sr/w));
let on=A.s,j=A.s-1;
while(j>=0){let q=j;while(q>=0&&!(e[q]>thr))q--;if(q<0||on-q-1>gapMax)break;const B=seg(q);if(B.pk<A.pk*.35)break;on=B.s;j=B.s-1;}
const sec=(ia-(i0+on*w))/sr;
if(sec<.05)return 0;
return Math.min(ia/sr,bar,sec+.02);
}
function vl3Auto(id,pcm,ia,sr){
try{
const s=vl3Find(pcm,ia,sr,g10aBpb()*spb(),spb());
vl2Log({kind:'vl3',id,s:+s.toFixed(4)});
if(!(s>0))return;
VL3.pend.set(id,{in:ia/sr,s,n:0});vl3AutoTry(id);
}catch(e){logErr(e);}
}
function vl3AutoTry(id){
const p=VL3.pend.get(id);if(!p)return;
let hit=false;
for(let t=0;t<S.tracks.length;t++){
const tr=S.tracks[t];if(!tr||!tr.clips)continue;
for(let s=0;s<tr.clips.length;s++){
const c=tr.clips[s],a=c&&c.audio;
if(!a||a.take!==id||Math.abs(a.in-p.in)>1e-3||a.at>1e-6)continue;
hit=true;if(c.vorlaufModus||c.vl3s!=null)continue;
const sec=Math.min(p.s,vl3Max(c,a));if(!(sec>.05))continue;
const before=cleanClip(c);c.vorlaufModus='gefaltet';c.vl3s=+sec.toFixed(4);
pushUndo(t,s,before,'Auftakt gefaltet');
clipChanged(t,s);markDirty();UI.dirty.all=UI.dirty.grid=UI.dirty.song=true;
if(R.playing&&R.slot[t]===s)tkTrackResync(t);
toast('Auftakt erkannt · im Loop gefaltet');
}
}
if(hit||++p.n>40){VL3.pend.delete(id);return;}
setTimeout(()=>vl3AutoTry(id),150);
}
function vl3Set(t,s,sec){
const c=S.tracks[t]&&S.tracks[t].clips[s];if(!c||!c.audio)return false;
sec=+sec.toFixed(4);if(c.vl3s===sec)return true;
const before=cleanClip(c);c.vl3s=sec;
pushUndo(t,s,before,'Auftakt verschoben');
clipChanged(t,s);markDirty();UI.dirty.all=UI.dirty.grid=UI.dirty.song=true;
if(R.playing&&R.slot[t]===s)tkTrackResync(t);
haptic('tick');return true;
}

/* ---------- Fähnchen im Gesang-Editor ---------- */
function vl3Ref(){
const r=ED.rollAt;if(!r||!r.vx||r.vox!=null||!(r.s>=0))return null;
const tr=S.tracks[r.t],c=tr&&tr.clips[r.s],a=c&&c.audio;
if(!a||a.at>1e-6||!S.takes||!S.takes[a.take])return null;
return{t:r.t,s:r.s,c,a};
}
function vl3Lim(x){
const lim=vl3Max(x.c,x.a);if(!(lim>=spb()*.25))return 0;
if(!(g3PreOf(x.a)>.003)&&!vl2Vor(x.a)&&!(x.c.vl3s>0))return 0;
return lim;
}
function vl3Pos(x,lim){const q=spb()*.25;return clamp(x.c.vl3s>0?x.c.vl3s:(g3PreOf(x.a)||spb()),q,lim);}
function vl3PreB(){
const x=vl3Ref(),lim=x?vl3Lim(x):0;if(!lim)return 0;
const f=ED.roll?ED.roll.fol():null,ppb=f&&f.ppb>0?f.ppb:48;
return lim/spb()+80/ppb;
}
function vl3Css(){
if(VL3.css)return;VL3.css=true;
const s=document.createElement('style');
s.textContent='.vl3o{position:absolute;pointer-events:none;overflow:hidden;z-index:3}'+
'.vl3z{position:absolute;top:0;bottom:0;background:var(--vl3z);box-shadow:inset -2px 0 0 var(--vl3c)}'+
'.vl3o.off .vl3z{background:repeating-linear-gradient(135deg,var(--vl3z) 0 6px,transparent 6px 12px)}'+
'.vl3e{position:absolute;top:52px;height:56px}.vl3e svg{display:block;width:100%;height:100%}.vl3e path{fill:var(--vl3c);opacity:.45}'+
'.vl3p{position:absolute;top:0;bottom:0;width:2px;margin-left:-1px;background:var(--vl3c)}'+
'.vl3t{position:absolute;top:30px;margin-left:6px;font:600 11px/1 var(--font-ui,sans-serif);color:var(--vl3c);white-space:nowrap}'+
'.vl3h{position:absolute;top:0;width:48px;height:48px;margin-left:-14px;padding:0;border:0;background:none;color:var(--vl3c);pointer-events:auto;touch-action:none;cursor:grab;-webkit-tap-highlight-color:transparent}'+
'.vl3h svg{position:absolute;left:14px;top:3px;width:28px;height:22px}.vl3o.off .vl3h path{fill:none;stroke:currentColor;stroke-width:2}'+
'.vl3m{position:absolute;z-index:6;display:flex;gap:6px;padding:6px;border-radius:10px;background:#15171b;border:1px solid rgba(236,232,223,.18);box-shadow:0 6px 18px rgba(0,0,0,.45)}.vl3m .mbtn{min-height:44px;white-space:nowrap}';
document.head.appendChild(s);
}
function vl3Rgba(col,al){const m=/^#([0-9a-f]{6})$/i.exec(String(col||'').trim());if(!m)return'rgba(255,178,46,'+al+')';const n=parseInt(m[1],16);return'rgba('+(n>>16)+','+((n>>8)&255)+','+(n&255)+','+al+')';}
function vl3Mount(){
VL3.roll=ED.roll;VL3.sig='';VL3.shown=false;VL3.t0=0;VL3.drag=null;vl3MenuClose();
if(VL3.o){VL3.o.remove();VL3.o=null;}
if(!VL3.raf)VL3.raf=requestAnimationFrame(vl3Tick);
}
function vl3Tick(){
VL3.raf=0;
if(!ED.roll||ED.roll!==VL3.roll||!vx1rOpenNow()){vl3Drop();return;}
try{vl3Paint();}catch(e){logErr(e);vl3Drop();return;}
VL3.raf=requestAnimationFrame(vl3Tick);
}
function vl3Drop(){vl3MenuClose();if(VL3.o){VL3.o.remove();VL3.o=null;}VL3.roll=null;VL3.sig='';VL3.drag=null;}
function vl3Env(o,x,lim){
const buf=tkPlayBuf(x.a.take,x.a);if(!buf)return false;
const d=buf.getChannelData(0),sr=buf.sampleRate,s0=Math.round((x.a.in-lim)*sr),s1=Math.round(x.a.in*sr),N=100,st=Math.max(1,(s1-s0)/N),v=new Float32Array(N);
let mx=1e-6;for(let i=0;i<N;i++){let p=0;const a=Math.floor(s0+i*st),b=Math.floor(s0+(i+1)*st);for(let j=Math.max(0,a);j<Math.min(d.length,b);j+=2){const y=d[j]<0?-d[j]:d[j];if(y>p)p=y;}v[i]=p;if(p>mx)mx=p;}
let top='M0 50',bot='';for(let i=0;i<N;i++){const h=Math.sqrt(v[i]/mx)*48;top+='L'+(i+.5)+' '+(50-h).toFixed(1);bot='L'+(i+.5)+' '+(50+h).toFixed(1)+bot;}
o._e.querySelector('path').setAttribute('d',top+'L100 50'+bot+'Z');
return true;
}
function vl3Build(cM){
vl3Css();const par=cM.parentElement;if(getComputedStyle(par).position==='static')par.style.position='relative';
const o=document.createElement('div');o.className='vl3o';
o.innerHTML='<div class="vl3e"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d=""/></svg></div><div class="vl3z"></div><div class="vl3p"></div><span class="vl3t"></span>'+
'<button type="button" class="vl3h" aria-label="Auftakt: ziehen verschiebt den Start, tippen wählt einmal, gefaltet oder aus"><svg viewBox="0 0 28 22" aria-hidden="true"><path d="M1 1H26L20 8L26 15H1Z" fill="currentColor"/></svg></button>';
par.appendChild(o);
o._e=o.querySelector('.vl3e');o._z=o.querySelector('.vl3z');o._p=o.querySelector('.vl3p');o._t=o.querySelector('.vl3t');o._h=o.querySelector('.vl3h');o._lim=-1;
const col=VX1E.col||'#ffb22e';o.style.setProperty('--vl3c',col);o.style.setProperty('--vl3z',vl3Rgba(col,.2));
if(!cM._vl3){cM._vl3=1;cM.addEventListener('pointerdown',()=>{VL3.shown=true;},{capture:true,passive:true});}
const h=o._h,stop=e=>e.stopPropagation();
for(const ev of['touchstart','touchmove','touchend','mousedown','click','dblclick'])h.addEventListener(ev,stop,{passive:true});
h.addEventListener('pointerdown',e=>{
e.preventDefault();e.stopPropagation();
const x=vl3Ref(),lim=x?vl3Lim(x):0;if(!lim)return;
vl3MenuClose();VL3.shown=true;
try{h.setPointerCapture(e.pointerId);}catch(_){}
const s0=vl3Pos(x,lim);
VL3.drag={id:e.pointerId,cx:e.clientX,s0,sec:s0,moved:false,t:x.t,s:x.s,lim};
});
h.addEventListener('pointermove',e=>{
const d=VL3.drag;if(!d||d.id!==e.pointerId)return;e.preventDefault();e.stopPropagation();
const dx=e.clientX-d.cx;if(!d.moved&&Math.abs(dx)<7)return;d.moved=true;
const f=ED.roll.fol(),sp=spb(),q=sp*.25,want=d.s0-dx/f.ppb*sp;
d.sec=clamp(Math.round(want/q)*q,q,Math.max(q,Math.floor(d.lim/q+1e-6)*q));VL3.sig='';
});
const end=(e,ok)=>{
const d=VL3.drag;if(!d||d.id!==e.pointerId)return;e.preventDefault();e.stopPropagation();
VL3.drag=null;VL3.sig='';try{h.releasePointerCapture(e.pointerId);}catch(_){}
if(!ok)return;
if(!d.moved){vl3Menu();return;}
vl3Set(d.t,d.s,d.sec);
};
h.addEventListener('pointerup',e=>end(e,true));
h.addEventListener('pointercancel',e=>end(e,false));
return o;
}
function vl3Paint(){
const api=ED.roll,cM=api.el.main,f=api.fol(),x=vl3Ref(),lim=x?vl3Lim(x):0;
if(!lim||!(f.W>0)||!(f.ppb>0)||!cM.isConnected){if(VL3.o)VL3.o.hidden=true;vl3MenuClose();return;}
const sp=spb(),md=vl2ModeOf(x.c),d=VL3.drag,sec=d?d.sec:vl3Pos(x,lim);
if(!VL3.shown){
const now=performance.now();if(!VL3.t0)VL3.t0=now;
const want=-sec/sp-80/f.ppb;
if(f.x0>want+1e-3&&!f.busy)api.showPage(want);
if(now-VL3.t0>900)VL3.shown=true;
}
const g=api.fol(),X=b=>(b-g.x0)*g.ppb,xf=X(-sec/sp),x1=X(0),xl=X(-lim/sp);
const sig=[g.x0,g.ppb,g.W,cM.offsetLeft,cM.offsetTop,cM.offsetWidth,cM.offsetHeight,sec,lim,md,x.a.take,x.a.in].join('|');
let o=VL3.o;
if(sig===VL3.sig&&o&&o.isConnected&&!o.hidden)return;
VL3.sig=sig;
if(!o||!o.isConnected||o.parentElement!==cM.parentElement){if(o)o.remove();o=VL3.o=vl3Build(cM);}
o.hidden=false;
const st=o.style;st.left=cM.offsetLeft+'px';st.top=cM.offsetTop+'px';st.width=cM.offsetWidth+'px';st.height=cM.offsetHeight+'px';
o.classList.toggle('off',md!=='gefaltet');
if(o._lim!==lim&&vl3Env(o,x,lim))o._lim=lim;
o._e.style.left=xl+'px';o._e.style.width=Math.max(0,x1-xl)+'px';
o._z.style.left=xf+'px';o._z.style.width=Math.max(0,x1-xf)+'px';
o._p.style.left=xf+'px';o._h.style.left=xf+'px';o._t.style.left=xf+'px';
const lb=VL2_LBL[md];if(o._t.textContent!==lb)o._t.textContent=lb;
}
function vl3Menu(){
vl3MenuClose();const o=VL3.o,x=vl3Ref();if(!o||!x)return;
const md=vl2ModeOf(x.c),m=document.createElement('div');m.className='vl3m';m.setAttribute('role','group');m.setAttribute('aria-label','Auftakt');
m.innerHTML=VL2_MODES.map(v=>`<button type="button" class="mbtn rb${md===v?' on':''}" data-v="${v}" aria-pressed="${md===v}">${VL2_LBL[v]}</button>`).join('');
m.hidden=false;const par=o.parentElement;par.appendChild(m);const hx=o.offsetLeft+(parseFloat(o._h.style.left)||0);
m.style.left=clamp(hx-12,4,Math.max(4,par.clientWidth-m.offsetWidth-4))+'px';m.style.top=(o.offsetTop+52)+'px';
for(const ev of['pointerdown','touchstart','mousedown'])m.addEventListener(ev,e=>e.stopPropagation(),{passive:true});
m.addEventListener('click',e=>{
e.stopPropagation();const b=e.target.closest('button');if(!b)return;
const y=vl3Ref();if(y&&vl2SetMode(y.t,y.s,b.dataset.v))haptic('tick');
vl3MenuClose();VL3.sig='';
});
VL3.menu=m;
setTimeout(()=>{if(VL3.menu===m)document.addEventListener('pointerdown',vl3Out,true);},0);
}
function vl3Out(e){if(VL3.menu&&!VL3.menu.contains(e.target))vl3MenuClose();}
function vl3MenuClose(){document.removeEventListener('pointerdown',vl3Out,true);if(VL3.menu){VL3.menu.remove();VL3.menu=null;}}
/* VL3-END */
