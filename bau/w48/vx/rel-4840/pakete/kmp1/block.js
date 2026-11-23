/*KMP1-BEGIN*/
const KMP1={k:'sq.kmp1.view',kb:'sq.kmp1.sec',v:null,sec:null,st:null,css:false,held:new Map()};
function kmp1View(){if(KMP1.v==null){let x=null;try{x=localStorage.getItem(KMP1.k);}catch(e){}KMP1.v=x==='gross'?'gross':'kompakt';}return KMP1.v;}
function kmp1SetView(v){KMP1.v=v==='gross'?'gross':'kompakt';try{localStorage.setItem(KMP1.k,KMP1.v);}catch(e){}if(R.editor==='synth')safeRebuild(buildSynthEd);return KMP1.v;}
function kmp1Sec(){if(KMP1.sec==null){let x=null;try{x=localStorage.getItem(KMP1.kb);}catch(e){}KMP1.sec=['filter','klang','raum'].includes(x)?x:'filter';}return KMP1.sec;}
function kmp1Pos(snd){
if(!snd||snd.engine!=='mk'||snd._nv||!window.MKK)return null;
let p=MKK.of(snd.origin);if(p)return p;
try{const r=snd.origin&&LIB.ok?LIB.lib.get(snd.origin):null;p=r&&MKK.of(r.origin);}catch(e){p=null;}
return p||null;
}
function kmp1Css(){
if(KMP1.css)return;KMP1.css=true;
const s=document.createElement('style');s.id='kmp1css';
s.textContent=
'.kmp1sg{display:flex;flex:none;margin-left:6px;align-self:center;height:30px;border:1px solid var(--panel-edge);border-radius:6px;overflow:hidden}'+
'.kmp1b{min-width:58px;padding:0 8px;border:0;background:transparent;color:var(--text);font:600 11px/1 var(--font-num);letter-spacing:.04em}'+
'.kmp1b.on{background:#d4572a;color:#170804}'+
'#synthSheet.kmp1on .mknav{display:none}'+
'.kmp1w{flex:1 1 100%;width:100%;align-self:stretch;min-height:0;max-height:100%;overflow-y:auto;overflow-x:hidden;touch-action:pan-y;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding:4px 0 10px}'+
'.kmp1p{margin:0 auto;max-width:720px;padding:8px 8px 10px;border-radius:8px;background:linear-gradient(180deg,#3a3d42,#222428);box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 3px 10px rgba(0,0,0,.55);color:#e8e6df;display:flex;flex-wrap:wrap;gap:8px}'+
'.kmp1c{flex:1 1 300px;min-width:0;display:flex;flex-direction:column;gap:8px}'+
'.kmp1top{display:flex;align-items:stretch;gap:6px}'+
'.kmp1lcd{flex:1;min-width:0;padding:5px 8px;border-radius:4px;background:#9fbf4c;color:#141a08;box-shadow:inset 0 2px 4px rgba(0,0,0,.45);font:700 13px/1.25 var(--font-num);letter-spacing:.03em}'+
'.kmp1lcd div{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kmp1lcd .l2{font-weight:500;font-size:11px;min-height:14px}'+
'.kmp1pa{width:44px;min-height:44px;border:1px solid #111;border-radius:5px;background:linear-gradient(180deg,#55595f,#35383c);color:#f1efe8;font:700 20px/1 var(--font-num)}'+
'.kmp1pt{font:700 9px/1.2 var(--font-num);letter-spacing:.14em;color:#c9c5b8;text-align:center;margin-bottom:-4px}'+
'.kmp1sel{display:flex;gap:5px}'+
'.kmp1s{flex:1;min-height:36px;border:1px solid #111;border-radius:5px;background:#2c2f33;color:#d9d6cc;font:700 11px/1 var(--font-num);letter-spacing:.1em;display:flex;align-items:center;justify-content:center;gap:6px}'+
'.kmp1s i{width:8px;height:8px;border-radius:50%;background:#4a2a20;display:inline-block}'+
'.kmp1s.on{color:#fff}.kmp1s.on i{background:#ff5a2a;box-shadow:0 0 6px #ff5a2a}'+
'.kmp1r{display:flex;justify-content:space-around;gap:4px}'+
'.kmp1k{flex:1 1 0;min-width:0;display:flex;flex-direction:column;align-items:center;touch-action:pan-y;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none}'+
'.kmp1k svg{width:100%;max-width:76px;aspect-ratio:1;display:block}'+
'.kmp1k .k1{fill:#111214;stroke:#4a4d52;stroke-width:1}.kmp1k .k2{fill:url(#kmp1cap)}.kmp1k .k3{stroke:#ff6a3a;stroke-width:2.6;stroke-linecap:round}.kmp1k .tk{stroke:#9a968a;stroke-width:1}'+
'.kmp1k.on .k1{stroke:#ff6a3a;stroke-width:2}'+
'.kmp1l{margin-top:2px;color:#e2dfd4;font:600 10px/1.15 var(--font-num);letter-spacing:.04em;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}'+
'.kmp1v{height:13px;color:#9fd0ff;font:500 10px/1.25 var(--font-num);white-space:nowrap}'+
'.kmp1kb{display:flex;flex-direction:column;gap:5px}'+
'.kmp1ok{display:flex;align-items:center;gap:6px}.kmp1ok b{flex:1;text-align:center;font:600 11px/1 var(--font-num);color:#d9d6cc}'+
'.kmp1ob{min-width:64px;min-height:34px;border:1px solid #111;border-radius:5px;background:#2c2f33;color:#e8e6df;font:700 11px/1 var(--font-num)}'+
'.kmp1keys{position:relative;height:110px;display:flex;touch-action:none;user-select:none;-webkit-user-select:none}'+
'.kmp1wk{flex:1;margin:0 1px;border-radius:0 0 4px 4px;background:linear-gradient(180deg,#f3f1ea,#d8d4c8);border:1px solid #1a1a1a}'+
'.kmp1bk{position:absolute;top:0;height:62%;width:9%;border-radius:0 0 3px 3px;background:linear-gradient(180deg,#222,#050505);border:1px solid #000;z-index:1}'+
'.kmp1wk.on{background:#ffb08f}.kmp1bk.on{background:#a8401c}';
document.head.appendChild(s);
}
function kmp1Fill(pg,i){
const sh=EL.synthSheet,tr=S.tracks[i],pos=tr&&kmp1Pos(tr.sound);
sh.classList.remove('kmp1on');
for(const id of[...KMP1.held.keys()])kmp1Off(id);
if(!pos||ED.tab!=='geraet'||!window.MKUI)return false;
kmp1Css();
const kom=kmp1View()==='kompakt',tb=sh.querySelector('.sh-tabs');
if(tb){
const sg=el('div','kmp1sg');sg.setAttribute('role','group');sg.setAttribute('aria-label','Ansicht');
sg.innerHTML='<button class="kmp1b rb'+(kom?' on':'')+'" data-v="kompakt" aria-pressed="'+kom+'">Kompakt</button><button class="kmp1b rb'+(kom?'':' on')+'" data-v="gross" aria-pressed="'+!kom+'">Groß</button>';
onTap(sg,b=>{if(b.dataset.v!==kmp1View())kmp1SetView(b.dataset.v);},'button[data-v]');
tb.appendChild(sg);
}
if(!kom)return false;
const P=MKUI.P;
if(P.i!==i){if(P.i>=0&&MKUI.leave){try{MKUI.leave();}catch(e){logErr(e);}}P.i=i;P.tim=1;}
P.pg=null;
sh.classList.add('kmp1on');
kmp1Plate(pg,i);
return true;
}
function kmp1Def(k){return MKUI.KN[k];}
function kmp1Lfo(){
const KN=MKUI.KN;
for(let k=0;k<4;k++){const s=Math.round(MKUI.get(KN['ps'+k]));if(s===2||s===3){const n=s-1;return[KN['l'+n+(Math.round(MKUI.get(KN['l'+n+'s']))?'n':'f')],KN['pi'+k]];}}
return[KN[Math.round(MKUI.get(KN.l2s))?'l2n':'l2f'],KN.vib];
}
function kmp1Specs(i){
const mk=k=>({mk:kmp1Def(k)}),L=kmp1Lfo(),K=(lab,s)=>Object.assign({lab},s);
const rev={d:PD['fx.rev'],get:()=>kv1Get(i,'fx.rev'),set:v=>setP(i,'fx.rev',v)};
return{
filter:['FILTER',[K('Cutoff',mk('cut')),K('Resonanz',mk('res')),K('Hk.-Menge',mk('feg')),K('Hk.-Tempo',mk('e1d'))]],
klang:['KLANG',[K('Welle',mk('o1w')),K('Verstimm.',mk('o2t')),K('LFO-Tempo',{mk:L[0]}),K('LFO-Menge',{mk:L[1]})]],
raum:['RAUM',[K('Echo',mk('dlyD')),K('Hall',rev),K('Breite',mk('mfxD')),K('Lautst.',mk('vol'))]],
};
}
function kmp1Lcd(i){
const L=KMP1.lcd;if(!L||!L.isConnected)return;
const snd=S.tracks[i].sound,pos=kmp1Pos(snd);
L.querySelector('.l1').textContent=(pos?String((pos.g-1)*16+pos.s).padStart(3,'0')+' ':'')+(snd.name||'');
}
function kmp1Plate(pg,i){
const w=el('div','kmp1w pan-y'),p=el('div','kmp1p');
p.innerHTML='<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><radialGradient id="kmp1cap" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#6c7076"/><stop offset=".6" stop-color="#3c3f44"/><stop offset="1" stop-color="#1e2023"/></radialGradient></defs></svg>';
const c1=el('div','kmp1c'),c2=el('div','kmp1c kmp1kb');
const top=el('div','kmp1top'),pv=el('button','kmp1pa rb','‹'),nx=el('button','kmp1pa rb','›'),lcd=el('div','kmp1lcd','<div class="l1"></div><div class="l2">PROGRAMM ‹ › · Regler ziehen</div>');
pv.setAttribute('aria-label','Voriges Programm');nx.setAttribute('aria-label','Nächstes Programm');lcd.setAttribute('role','status');
top.append(pv,lcd,nx);KMP1.lcd=lcd;
onTap(pv,()=>kmp1Prog(i,-1));onTap(nx,()=>kmp1Prog(i,1));
const sel=el('div','kmp1sel'),row=el('div','kmp1r');
c1.append(el('div','kmp1pt','PROGRAMM'),top,sel,row);
const specs=kmp1Specs(i),cur=kmp1Sec();
sel.innerHTML=Object.entries(specs).map(([k,v])=>'<button class="kmp1s rb'+(k===cur?' on':'')+'" data-s="'+k+'" aria-pressed="'+(k===cur)+'"><i></i>'+esc(v[0])+'</button>').join('');
const knobs=[];
const fillRow=()=>{row.innerHTML='';knobs.length=0;const sp=kmp1Specs(i)[kmp1Sec()];for(const x of sp[1]){if(!(x.mk||x.d))continue;const k=kmp1Knob(x,sp[0],i);knobs.push(k);row.appendChild(k);}};
fillRow();
onTap(sel,b=>{KMP1.sec=b.dataset.s;try{localStorage.setItem(KMP1.kb,KMP1.sec);}catch(e){}for(const x of sel.children){const on_=x===b;x.classList.toggle('on',on_);x.setAttribute('aria-pressed',on_);}fillRow();haptic('tick');},'button[data-s]');
kmp1Keys(c2,i);
p.append(c1,c2);w.appendChild(p);pg.appendChild(w);
kmp1Lcd(i);
w.addEventListener('touchmove',e=>{const st=KMP1.st;if(st&&!st.dead&&e.cancelable&&(st.act||Math.abs(st.dx)>Math.abs(st.dy)))e.preventDefault();},{passive:false});
ED.refreshers.push(()=>{for(const k of knobs)k._kmp1u();kmp1Lcd(i);});
return w;
}
function kmp1Prog(i,dir){
const tr=S.tracks[i],pos=kmp1Pos(tr&&tr.sound);if(!pos)return;
let n=((pos.g-1)*16+(pos.s-1)+dir+128)%128;
const r=MKK.rec(Math.floor(n/16)+1,n%16+1);if(!r)return;
UI.ab=null;
soundEdit(i,'Programm '+r.name,()=>loadPreset(i,r.id));
haptic('tick');
if(R.editor==='synth'&&R.selT===i)safeRebuild(buildSynthEd);
try{lcdShow('PROGRAMM',String(n+1).padStart(3,'0')+' '+r.name);}catch(e){}
}
function kmp1Knob(sp,sec,i){
const d=sp.mk||sp.d,k=el('div','kmp1k');k.tabIndex=0;k.setAttribute('role','slider');k.setAttribute('aria-label',sec+' '+sp.lab);
const mkP=!!sp.mk,u=soundUndo(i);
const prep=()=>{if(mkP&&MKUI.P.i!==i)MKUI.P.i=i;};
const rng=()=>{if(!mkP)return[d.min!=null?d.min:0,d.max!=null?d.max:1];prep();return MKUI.range(d);};
const gv=()=>{prep();if(mkP)return MKUI.get(d);const v=sp.get();return v==null?0:v;};
const nOf=()=>{const[lo,hi]=rng();return hi>lo?clamp((gv()-lo)/(hi-lo),0,1):0;};
const txt=v=>{try{if(mkP){const f=MKUI.fmtv(d,v);return[f[0],f[1]];}const s=fmtVal(d.fmt,v);return[s,s];}catch(e){return[String(v),String(v)];}};
let tk='';for(let j=0;j<=10;j++){const a=(135+27*j)*Math.PI/180,c=Math.cos(a),s=Math.sin(a);tk+='<line class="tk" x1="'+(20+16.5*c).toFixed(2)+'" y1="'+(20+16.5*s).toFixed(2)+'" x2="'+(20+19.5*c).toFixed(2)+'" y2="'+(20+19.5*s).toFixed(2)+'"/>';}
k.innerHTML='<svg viewBox="0 0 40 40" aria-hidden="true">'+tk+'<circle class="k1" cx="20" cy="20" r="15"/><g class="kr"><circle class="k2" cx="20" cy="20" r="12"/><line class="k3" x1="20" y1="19" x2="20" y2="9"/></g></svg><div class="kmp1l">'+esc(sp.lab)+'</div><div class="kmp1v"></div>';
const rot=k.querySelector('.kr'),val=k.querySelector('.kmp1v');
const paint=()=>{const v=gv(),n=nOf(),t=txt(v);rot.setAttribute('transform','rotate('+(-135+270*n).toFixed(1)+' 20 20)');val.textContent=t[0];k.setAttribute('aria-valuetext',t[1]);return t;};
k._kmp1u=paint;paint();
const show=t=>{const L=KMP1.lcd;if(L&&L.isConnected)L.querySelector('.l2').textContent=sec+' · '+sp.lab+' '+t[1];};
const setN=(n,live)=>{n=clamp(n,0,1);const[lo,hi]=rng();let v=lo+(hi-lo)*n;
if(mkP){if(!(d.log||d.step))v=Math.round(v);MKUI.setv(d,v,live);}else sp.set(v);
const t=paint();show(t);};
const fin=()=>{if(mkP&&(!d.L||d.nu)){prep();const v=MKUI.get(d);MKUI.setv(d,d.log||d.step?v:Math.round(v),false);}};
const go=st=>{if(st.act)return;st.act=true;clearTimeout(st.tm);st.b=u.snap();k.classList.add('on');try{k.setPointerCapture(st.id);}catch(e){}};
const end=e=>{const st=KMP1.st;if(!st||st.k!==k||(e&&e.pointerId!==st.id))return;KMP1.st=null;clearTimeout(st.tm);k.classList.remove('on');
if(st.act){fin();u.commit(st.b,'Kompakt: '+sec+' '+sp.lab);paint();}};
k.addEventListener('pointerdown',e=>{
if(e.button>0)return;if(KMP1.st)end(null);
const st={k,id:e.pointerId,x0:e.clientX,y0:e.clientY,dx:0,dy:0,n0:nOf(),act:false,dead:false,lp:false,tm:0,b:null};KMP1.st=st;
if(e.pointerType==='mouse'){go(st);e.preventDefault();return;}
st.tm=setTimeout(()=>{if(KMP1.st===st&&!st.act&&!st.dead){st.lp=true;go(st);haptic('tick');}},380);
});
k.addEventListener('pointermove',e=>{
const st=KMP1.st;if(!st||st.k!==k||e.pointerId!==st.id||st.dead)return;
st.dx=e.clientX-st.x0;st.dy=e.clientY-st.y0;
if(!st.act){
const ax=Math.abs(st.dx),ay=Math.abs(st.dy);
if(ay>8&&ay>=ax){st.dead=true;clearTimeout(st.tm);return;}
if(ax>=8&&ax>ay){go(st);st.x0=e.clientX;st.y0=e.clientY;st.dx=st.dy=0;return;}
if(ax>6||ay>6)clearTimeout(st.tm);
return;
}
e.preventDefault();
const[lo,hi]=rng(),span=d.L?Math.max(60,Math.min(200,(hi-lo+1)*22)):180,mv=st.dx-(st.lp||e.pointerType==='mouse'?st.dy:0);
setN(st.n0+mv/span,true);
});
k.addEventListener('pointerup',e=>end(e));
k.addEventListener('pointercancel',e=>end(e));
k.addEventListener('lostpointercapture',e=>{if(e.target!==k)return;const st=KMP1.st;if(st&&st.k===k&&st.act)end(e);});
k.addEventListener('keydown',e=>{const dir=e.key==='ArrowRight'||e.key==='ArrowUp'?1:e.key==='ArrowLeft'||e.key==='ArrowDown'?-1:0;if(!dir)return;e.preventDefault();
const b=u.snap(),[lo,hi]=rng(),stp=mkP?1/Math.max(1,hi-lo):.02;setN(nOf()+dir*stp,false);fin();u.commit(b,'Kompakt: '+sec+' '+sp.lab);});
return k;
}
function kmp1Off(id){const h=KMP1.held.get(id);if(!h)return;KMP1.held.delete(id);try{if(h.v)h.v.release(nowT());}catch(e){}h.x.classList.remove('on');}
function kmp1Keys(box,i){
const tr=S.tracks[i],ok=el('div','kmp1ok'),dn=el('button','kmp1ob rb','Okt −'),up=el('button','kmp1ob rb','Okt +'),lb=el('b','');
dn.setAttribute('aria-label','Oktave tiefer');up.setAttribute('aria-label','Oktave höher');
const base=()=>12*((tr.kbOct||4)+1);
const lab=()=>{lb.textContent='Tastatur ab C'+((tr.kbOct||4)-1);};
const oct=d=>{const o=clamp((tr.kbOct||4)+d,1,7);if(o!==(tr.kbOct||4)){tr.kbOct=o;markDirty();UI.kbRelayout=true;UI.dirty.kb=true;}lab();haptic('tick');};
onTap(dn,()=>oct(-1));onTap(up,()=>oct(1));lab();
ok.append(dn,lb,up);
const keys=el('div','kmp1keys');keys.setAttribute('aria-label','Kleine Tastatur');
const W=[0,2,4,5,7,9,11,12],B=[[1,1],[3,2],[6,4],[8,5],[10,6]];
for(const n of W){const x=el('div','kmp1wk');x.dataset.n=n;keys.appendChild(x);}
for(const[n,at]of B){const x=el('div','kmp1bk');x.dataset.n=n;x.style.left='calc('+(at*12.5)+'% - 4.5%)';keys.appendChild(x);}
const off=kmp1Off;
keys.addEventListener('pointerdown',e=>{
const x=e.target.closest('.kmp1wk,.kmp1bk');if(!x)return;e.preventDefault();
off(e.pointerId);try{if(typeof ensureAudio==='function')ensureAudio();}catch(_){}
const note=base()+(+x.dataset.n);let v=null;try{v=auditionStart(i,note,.8);}catch(err){logErr(err);}
try{R.lastNote[i]=note;}catch(_){}
KMP1.held.set(e.pointerId,{v,x});x.classList.add('on');
try{keys.setPointerCapture(e.pointerId);}catch(_){}
});
for(const t of['pointerup','pointercancel','lostpointercapture'])keys.addEventListener(t,e=>off(e.pointerId));
box.append(el('div','kmp1pt','TASTATUR'),ok,keys);
}
window.KMP1={view:kmp1View,setView:kmp1SetView,pos:kmp1Pos,state:KMP1};
/*KMP1-END*/
