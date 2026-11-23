/*MLG3-BEGIN*/
const MLG3={k:'sq.mlg3.view',v:null,st:null,css:false};
function mlg3View(){if(MLG3.v==null){let x=null;try{x=localStorage.getItem(MLG3.k);}catch(e){}MLG3.v=x==='voll'?'voll':'retro';}return MLG3.v;}
function mlg3SetView(v){MLG3.v=v==='voll'?'voll':'retro';try{localStorage.setItem(MLG3.k,MLG3.v);}catch(e){}if(R.editor==='synth')safeRebuild(buildSynthEd);return MLG3.v;}
function mlg3Org(o){o=String(o||'');return o==='daw:va'||o.startsWith('f-retro-');}
function mlg3Is(snd){
if(!snd||snd.engine!=='analog'||snd._nv)return false;
const o=snd.origin;if(mlg3Org(o))return true;
try{const r=o&&LIB.ok?LIB.lib.get(o):null;return!!(r&&mlg3Org(r.origin));}catch(e){return false;}
}
function mlg3Chip(f){return f&&f.engine==='analog'&&(mlg3Org(f.id)||mlg3Org(f.origin))?'<span class="mlg3c">Retro</span>':'';}
function mlg3Css(){
if(MLG3.css)return;MLG3.css=true;
const s=document.createElement('style');s.id='mlg3css';
s.textContent=
'.mlg3sg{display:flex;flex:none;margin-left:6px;align-self:center;height:30px;border:1px solid var(--panel-edge);border-radius:6px;overflow:hidden}'+
'.mlg3b{min-width:46px;padding:0 8px;border:0;background:transparent;color:var(--text);font:600 11px/1 var(--font-num);letter-spacing:.04em}'+
'.mlg3b.on{background:#c98a3a;color:#140c04}'+
'#synthSheet.mlg3on .sh-tabs>.tab,#synthSheet.mlg3on .sh-subs{display:none}'+
'#synthSheet.mlg3on .mlg3sg{margin-left:0}'+
'.mlg3w{flex:1 1 100%;width:100%;align-self:stretch;min-height:0;max-height:100%;overflow-y:auto;overflow-x:hidden;touch-action:pan-y;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding:0 0 10px}'+
'.mlg3p{position:relative;margin:0 auto;max-width:980px;padding:6px 6px 8px;border-radius:5px;background:linear-gradient(180deg,#2a2a2e,#17171a);box-shadow:inset 0 1px 0 rgba(255,255,255,.09),0 3px 10px rgba(0,0,0,.55);border-left:9px solid #6a3c1c;border-right:9px solid #6a3c1c}'+
'.mlg3h{display:flex;align-items:baseline;justify-content:space-between;gap:8px;padding:0 4px 3px;color:#e9e2cf;font:700 10px/1.2 var(--font-num);letter-spacing:.16em}'+
'.mlg3h span{font-weight:500;letter-spacing:.04em;color:#bdb6a2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
'.mlg3g{display:flex;flex-wrap:wrap}'+
'.mlg3s{flex:1 1 auto;margin:3px;padding:0 3px 3px;border:1px solid rgba(233,226,207,.18);border-radius:4px}'+
'.mlg3t{margin:0 -3px 2px;padding:2px 0;background:#0c0c0e;color:#e9e2cf;text-align:center;font:700 9px/1.2 var(--font-num);letter-spacing:.14em;border-radius:3px 3px 0 0}'+
'.mlg3r{display:flex;justify-content:space-around}'+
'.mlg3k{width:50px;display:flex;flex-direction:column;align-items:center;touch-action:pan-y;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none}'+
'.mlg3k svg{width:40px;height:40px;display:block}'+
'.mlg3k .mk1{fill:#0b0b0c;stroke:#3a3a3e;stroke-width:1}.mlg3k .mk2{fill:url(#mlg3cap)}.mlg3k .mk3{stroke:#fff;stroke-width:2.4;stroke-linecap:round}.mlg3k .mtk{stroke:#8d887a;stroke-width:1}'+
'.mlg3k.on .mk1{stroke:#c98a3a;stroke-width:2}'+
'.mlg3l{margin-top:1px;color:#d9d3c1;font:600 9px/1.15 var(--font-num);letter-spacing:.06em;text-transform:uppercase;white-space:nowrap}'+
'.mlg3v{height:11px;color:#8fc7ff;font:500 9px/1.2 var(--font-num);white-space:nowrap}'+
'.mlg3c{flex:none;align-self:center;margin-right:4px;padding:3px 5px;border-radius:4px;background:#6a3c1c;color:#f3e6c8;font:700 9px/1 var(--font-num);letter-spacing:.06em}';
document.head.appendChild(s);
}
function mlg3Fill(F,i){
const sh=EL.synthSheet,tr=S.tracks[i];
if(!tr||tr.kind!=='synth'||!mlg3Is(tr.sound)){sh.classList.remove('mlg3on');return false;}
mlg3Css();
const retro=mlg3View()==='retro',tb=sh.querySelector('.sh-tabs');
sh.classList.toggle('mlg3on',retro);
if(tb){
const sg=el('div','mlg3sg');sg.setAttribute('role','group');sg.setAttribute('aria-label','Ansicht');
sg.innerHTML='<button class="mlg3b rb'+(retro?' on':'')+'" data-v="retro" aria-pressed="'+retro+'">Retro</button><button class="mlg3b rb'+(retro?'':' on')+'" data-v="voll" aria-pressed="'+!retro+'">Voll</button>';
onTap(sg,b=>{if(b.dataset.v!==mlg3View())mlg3SetView(b.dataset.v);},'button[data-v]');
tb.appendChild(sg);
}
if(!retro)return false;
mlg3Plate(F.body,i);
return true;
}
function mlg3Specs(i){
const snd=S.tracks[i].sound,tk=k=>({d:PD[k],get:()=>kv1Get(i,k),set:v=>setP(i,k,v),u:soundUndo(i)});
const bus=k=>({d:BUS_PD[k],get:()=>busGet(k),set:v=>busSet(k,v,true),u:fxUndo});
const lfoD={min:0,max:1,c:'lin',def:0,fmt:'pct',l:'LFO → Filter'};
const lfo={d:lfoD,get:()=>{const m=sndOf(i).mods.find(x=>x.src==='lfo1'&&x.dst==='cutoff');return m?clamp(toKnobAmt('cutoff',m.amt),0,1):0;},set:v=>setMod(i,'lfo1','cutoff',v),u:soundUndo(i)};
const rk=kv1Get(i,'l1sync')>0?'l1sync':'l1rate';
const K=(lab,s)=>Object.assign({lab},s);
return[
['OSZ 1',[K('Welle',tk('o1w')),K('Lage',tk('o1oct')),K('Verst.',tk('o1fine')),K('Mix',tk('o1lvl'))]],
['FILTER',[K('Cutoff',tk('cutoff')),K('Reso',tk('res')),K('Hk.-Menge',tk('fenv'))]],
['OSZ 2',[K('Welle',tk('o2w')),K('Lage',tk('o2oct')),K('Verst.',tk('o2fine')),K('Mix',tk('o2lvl'))]],
['ECHO',[K('Zeit',bus('echo.divL')),K('Rückk.',bus('echo.fb')),K('Menge',tk('fx.dly'))]],
['FILTER-HÜLLK.',[K('A',tk('fA')),K('D',tk('fD')),K('S',tk('fS')),K('R',tk('fR'))]],
['LFO',[K('Tempo',tk(rk)),K('Menge',lfo)]],
['AMP-HÜLLK.',[K('A',tk('aA')),K('D',tk('aD')),K('S',tk('aS')),K('R',tk('aR'))]],
];
}
function mlg3Plate(body,i){
const w=el('div','mlg3w pan-y'),p=el('div','mlg3p'),snd=S.tracks[i].sound;
p.innerHTML='<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><radialGradient id="mlg3cap" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#f4efe2"/><stop offset=".6" stop-color="#cfc8b4"/><stop offset="1" stop-color="#8f8873"/></radialGradient></defs></svg>'+
'<div class="mlg3h"><b>RETRO · 2 OSZ.</b><span>'+esc(snd.name||'')+'</span></div>';
const g=el('div','mlg3g'),all=[];
for(const[t,ks]of mlg3Specs(i)){
const s=el('div','mlg3s'),r=el('div','mlg3r');s.appendChild(el('div','mlg3t',esc(t)));
for(const sp of ks){if(!sp.d)continue;const k=mlg3Knob(sp,t,i);all.push(k);r.appendChild(k);}
s.appendChild(r);g.appendChild(s);
}
p.appendChild(g);w.appendChild(p);body.appendChild(w);
w.addEventListener('touchmove',e=>{const st=MLG3.st;if(st&&!st.dead&&e.cancelable&&(st.act||Math.abs(st.dx)>Math.abs(st.dy)))e.preventDefault();},{passive:false});
const upd=()=>{for(const k of all)k._mlg3u();};
ED.refreshers.push(upd);
return w;
}
function mlg3Knob(sp,sec,i){
const d=sp.d,k=el('div','mlg3k');k.tabIndex=0;k.setAttribute('role','slider');k.setAttribute('aria-label',sec+' '+sp.lab);
let tk='';for(let j=0;j<=10;j++){const a=(135+27*j)*Math.PI/180,c=Math.cos(a),s=Math.sin(a);tk+='<line class="mtk" x1="'+(20+16.5*c).toFixed(2)+'" y1="'+(20+16.5*s).toFixed(2)+'" x2="'+(20+19.5*c).toFixed(2)+'" y2="'+(20+19.5*s).toFixed(2)+'"/>';}
k.innerHTML='<svg viewBox="0 0 40 40" aria-hidden="true">'+tk+'<circle class="mk1" cx="20" cy="20" r="15"/><g class="mrot"><circle class="mk2" cx="20" cy="20" r="11"/><line class="mk3" x1="20" y1="19" x2="20" y2="8"/></g></svg><div class="mlg3l">'+esc(sp.lab)+'</div><div class="mlg3v"></div>';
const rot=k.querySelector('.mrot'),val=k.querySelector('.mlg3v');
const fmt=v=>{try{return fmtVal(d.fmt,v);}catch(e){return String(v);}};
const nOf=()=>{const v=sp.get();return v==null?0:clamp(toNorm(d,v),0,1);};
const paint=()=>{const v=sp.get(),n=v==null?0:clamp(toNorm(d,v),0,1);rot.setAttribute('transform','rotate('+(-135+270*n).toFixed(1)+' 20 20)');val.textContent=v==null?'–':fmt(v);k.setAttribute('aria-valuetext',val.textContent);};
k._mlg3u=paint;paint();
const put=n=>{n=clamp(n,0,1);const v=fromNorm(d,n);sp.set(v);paint();try{lcdShow(sec+' · '+sp.lab,val.textContent);}catch(e){}};
const go=st=>{if(st.act)return;st.act=true;clearTimeout(st.tm);st.b=sp.u.snap();k.classList.add('on');try{k.setPointerCapture(st.id);}catch(e){}};
const end=(e,ok)=>{const st=MLG3.st;if(!st||st.k!==k||(e&&e.pointerId!==st.id))return;MLG3.st=null;clearTimeout(st.tm);k.classList.remove('on');
if(st.act)sp.u.commit(st.b,'Retro: '+sec+' '+sp.lab);};
k.addEventListener('pointerdown',e=>{
if(e.button>0)return;if(MLG3.st)end(null);
const st={k,id:e.pointerId,x0:e.clientX,y0:e.clientY,dx:0,dy:0,n0:nOf(),act:false,dead:false,lp:false,tm:0,b:null};MLG3.st=st;
if(e.pointerType==='mouse'){go(st);e.preventDefault();return;}
st.tm=setTimeout(()=>{if(MLG3.st===st&&!st.act&&!st.dead){st.lp=true;go(st);}},380);
});
k.addEventListener('pointermove',e=>{
const st=MLG3.st;if(!st||st.k!==k||e.pointerId!==st.id||st.dead)return;
st.dx=e.clientX-st.x0;st.dy=e.clientY-st.y0;
if(!st.act){
const ax=Math.abs(st.dx),ay=Math.abs(st.dy);
if(ay>8&&ay>=ax){st.dead=true;clearTimeout(st.tm);return;}
if(ax>=8&&ax>ay){go(st);st.x0=e.clientX;st.y0=e.clientY;st.dx=st.dy=0;return;}
if(ax>6||ay>6)clearTimeout(st.tm);
return;
}
e.preventDefault();
const span=d.vals?Math.max(60,Math.min(200,d.vals.length*22)):180,mv=st.dx-(st.lp||e.pointerType==='mouse'?st.dy:0);
put(st.n0+mv/span);
});
k.addEventListener('pointerup',e=>end(e,true));
k.addEventListener('pointercancel',e=>end(e,false));
k.addEventListener('lostpointercapture',e=>{if(e.target!==k)return;const st=MLG3.st;if(st&&st.k===k&&st.act)end(e,false);});
k.addEventListener('keydown',e=>{const dir=e.key==='ArrowRight'||e.key==='ArrowUp'?1:e.key==='ArrowLeft'||e.key==='ArrowDown'?-1:0;if(!dir)return;e.preventDefault();
const b=sp.u.snap(),stp=d.vals?1/Math.max(1,d.vals.length-1):.02;put(nOf()+dir*stp);sp.u.commit(b,'Retro: '+sec+' '+sp.lab);});
return k;
}
window.MLG3={is:mlg3Is,view:mlg3View,setView:mlg3SetView,state:MLG3};
/*MLG3-END*/
