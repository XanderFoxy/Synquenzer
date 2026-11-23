/* DSE-BEGIN – Drum-Schritt-Editor der Einzelspur: FOLGEN, Locks je Schritt (lange druecken), eigene Laenge je Spur (D1) */
const DSE={css:false};
function dseCss(){
if(DSE.css)return;DSE.css=true;
const st=document.createElement('style');st.id='dse-css';
st.textContent='.lacts .mbtn.d1b{display:inline-flex;align-items:center;justify-content:center;gap:3px;min-width:44px;padding:0 9px;flex:none;position:relative;margin-right:6px}'+
'.lacts .mbtn.d1b::before{content:"";position:absolute;left:0;right:0;top:min(0px,calc(50% - 22px));bottom:min(0px,calc(50% - 22px));z-index:1}'+
'.lacts .d1b .d1i{flex:none;color:var(--amber)}.lacts .d1b small{font-size:10px;opacity:.85}';
document.head.appendChild(st);
}
function dseFol(){return folChip('steps');}
function dseGm(V){const tr=S.tracks[V.t];return tr&&tr.dvx?tr.dvx.gm:null;}
function dseView(V,goPg,pager,acts,E){
try{
dseCss();V.goPg=goPg;
if(pager)pager.addEventListener('pointerdown',()=>folHand('steps'),true);
const m=E.model,c0=m.commit;m.commit=function(){folEdit('steps');return c0.apply(this,arguments);};
dseHold(E,V);
const pb=acts.querySelector('.mtx3rb'),lb=el('button','rb mbtn d1b');lb.dataset.dse='len';
if(pb)acts.insertBefore(lb,pb);else acts.appendChild(lb);
V.lenB=lb;dseLenPaint(V);onTap(lb,()=>dseLenPop(lb,V));
}catch(e){logErr(e);}
}
function dseLenPaint(V){
const b=V.lenB;if(!b)return;
const tr=S.tracks[V.t],c=tr&&tr.clips[V.s],gm=dseGm(V),x=c&&c.lanes&&c.lanes[gm],Ls=x&&x.len?x.len:c?Math.round(c.len*16):16;
const h=D1_ICON+'<b>'+Ls+'</b>'+(x&&x.dir?'<small>'+d1Short[x.dir]+'</small>':'');
if(b._h!==h){b._h=h;b.innerHTML=h;}
b.title='Länge und Richtung ('+(tr?tr.name:'')+')';
b.setAttribute('aria-label','Länge '+Ls+', Richtung, ×2: '+(tr?tr.name:''));b.disabled=!c;
}
function dseFrame(V,c,vs,bAud,st){
try{
const t=V.t,gm=dseGm(V),N=V.E.model.steps,B=dBarB(c);
let ph=-1,g=0;
if(vs&&vs.playing===V.s&&bAud>=0){const L=clipB(c),cs=audCstart(t,bAud);ph=(((bAud-cs)%L)+L)%L;g=Math.floor((bAud-cs)/.25+1e-6);}
const l=ph>=0&&gm!=null?d1Lane(c,gm):null,q=l?jam1D1Pos(c,l,g,gm):-1;
if(V.pages>1&&V.goPg)folStep('steps',l?Math.floor(q/N)*B:ph,B,V.page*B,x=>V.goPg(Math.round(x/B)));else FOL.st.steps=folState('steps');
folChipPaint('steps');
if(l)st=Math.floor(q/N)===V.page?q%N:-1;
else if(ph>=0)st=Math.floor(ph/B)===V.page?Math.floor((ph%B)/.25):-1;
}catch(e){logErr(e);}
return st;
}
function dseTg(V,i){
const t=V.t,s=V.s,tr=S.tracks[t],c=tr&&tr.clips[s],gm=dseGm(V);if(!c||gm==null)return null;
const N=V.E.model.steps,NS=Math.round(clipB(c)*4),si=V.page*N+i;
const ns=c.notes.filter(n=>(n.n===gm||mapV1Drum(n.n)===gm)&&Math.round(n.t/.25)%NS===si);if(!ns.length)return null;
const sl=DRUM_BY_GM[gm]||DRUM_BY_ID[tr.dvx.v];
return{t,s,src:'drum',lbl:tr.name+' · Schritt '+(si+1),keys:ns.map(n=>({t:n.t,n:n.n})),sid:sl?sl.id:null,dse:1};
}
function dseHold(E,V){
if(!E||!E.el||!E.el.row)return;
const row=E.el.row;let H=null;
const stop=()=>{if(H){clearTimeout(H.tm);H=null;}};
row.addEventListener('pointerdown',e=>{
stop();if(e.button>0)return;
const cell=e.target&&e.target.closest?e.target.closest('.se-cell'):null,i=E.cells.indexOf(cell);if(i<0)return;
H={id:e.pointerId,x:e.clientX,y:e.clientY,i,tm:setTimeout(()=>{
const h=H;H=null;if(!h||mtx3bOpen()!==V||V.E!==E)return;
const tg=dseTg(V,h.i);if(!tg)return;
E.abort();armLongPressGuard();haptic('tick');
dseLkPop(E.cells[h.i],tg);
},480)};
});
row.addEventListener('pointermove',e=>{if(H&&e.pointerId===H.id&&Math.hypot(e.clientX-H.x,e.clientY-H.y)>8)stop();});
for(const ev of['pointerup','pointercancel'])row.addEventListener(ev,e=>{if(H&&e.pointerId===H.id)stop();releaseLongPressGuard();});
}
function dseLkPop(anchor,tg){
openPop(anchor,p=>{
p.classList.add('pl1pop');guardTouch(p);
p.appendChild(el('h4','',esc(tg.lbl)));
const w=pl1Sect(p,tg);jam1Sect(w,tg);
const ba=w&&w.querySelector('.pl1all'),bc=w&&w.querySelector('.pl1clr');
if(ba){ba.hidden=true;if(bc)bc.style.gridColumn='1 / -1';}
},{name:'pl1',onClose:()=>mtx3bPaint(true)});
}
function dseLenPop(anchor,V){
const t=V.t,s=V.s,tr=S.tracks[t],gm=dseGm(V);if(!tr||!tr.clips[s]||gm==null)return;
const before=cleanClip(tr.clips[s]);
const NS=()=>Math.round(tr.clips[s].len*16);
const cur=()=>{const c=tr.clips[s];return Object.assign({len:NS(),dir:'fwd',seed:1},c.lanes&&c.lanes[gm]);};
const put=e=>{const c=tr.clips[s];if(!c)return;const L=c.lanes?Object.assign({},c.lanes):{},o={};
if(e.len!==NS())o.len=e.len;if(e.dir!=='fwd'){o.dir=e.dir;if(e.dir==='rnd')o.seed=e.seed;}
if(Object.keys(o).length)L[gm]=o;else delete L[gm];
const n=d1Norm(L);if(n)c.lanes=n;else delete c.lanes;afterClipEdit(t,s,true);dseLenPaint(V);mtx3bPaint(true);};
openPop(anchor,p=>{
p.classList.add('d1p');
const lD={p:'len',l:'Länge',vals:Array.from({length:Math.min(64,Math.max(NS(),cur().len))},(_,i)=>i+1),fmt:'int'},sD={p:'seed',l:'Startwert',vals:Array.from({length:99},(_,i)=>i+1),fmt:'int'};
const kl=makeCtl(lD,()=>cur().len,x=>{const e=cur();e.len=x;put(e);},{label:'Länge',fmt:x=>x+' Schr.'});
const ks=makeCtl(sD,()=>cur().seed,x=>{const e=cur();e.seed=x;put(e);},{label:'Startwert',fmt:x=>String(x)});
const dirs=el('div','plist d1dirs');dirs.innerHTML=D1_DIRS.map(([k,l])=>`<button class="rb${cur().dir===k?' on':''}" data-d="${k}">${l}</button>`).join('');
const row=el('div','eukr');row.append(kl,ks);
const showSeed=()=>{ks.style.visibility=cur().dir==='rnd'?'':'hidden';};
const xb=el('button','mbtn rb d1x','×2 – Clip verdoppeln (mit Inhalt)');xb.disabled=tr.clips[s].len*2>16;
onTap(xb,()=>{closePop();dseDouble(t,s);});
p.innerHTML='<h4>'+esc(tr.name)+' – Länge und Richtung</h4>';
p.append(row,dirs,xb);
guardTouch(p);
onTap(dirs,b=>{const e=cur();e.dir=b.dataset.d;put(e);for(const o of dirs.children)o.classList.toggle('on',o===b);showSeed();},'button[data-d]');
showSeed();
},{name:'d1lane',above:true,onClose:()=>{
const c=tr.clips[s];if(!c)return;
if(JSON.stringify(cleanClip(c))!==JSON.stringify(before)){pushUndo(t,s,before,'Länge/Richtung '+tr.name);UI.dirty.grid=true;}
mtx3bPaint(true);
}});
}
function dseDouble(t,s){
const tr=S.tracks[t],c=tr&&tr.clips[s];if(!c)return;
if(c.len*2>16){toast('max. 16 Takte');return;}
const before=cleanClip(c),L=clipB(c);
c.notes=c.notes.concat(c.notes.filter(n=>n.t<L-1e-9).map(n=>Object.assign({},deep(n),{t:+(n.t+L).toFixed(6)},n.o!=null?{o:+(n.o+L).toFixed(4)}:{})));
c.len*=2;c.notes.sort((a,b)=>a.t-b.t);
pushUndo(t,s,before,'Clip verdoppeln');afterClipEdit(t,s,true);UI.dirty.grid=true;
lcdShow('×2',c.len+' Takte');mtx3bPaint(true);
}
/* DSE-END */