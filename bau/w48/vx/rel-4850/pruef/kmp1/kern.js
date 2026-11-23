// Kern-Test KMP1: node kern.js <port>
const {chromium}=require('playwright');
const port=process.argv[2]||'8840',URL='http://127.0.0.1:'+port+'/index.html',DIR=__dirname;
const res={},errs=[];
(async()=>{
const br=await chromium.launch();
async function mk(w,h){
const ctx=await br.newContext({viewport:{width:w,height:h},hasTouch:true,isMobile:true,deviceScaleFactor:2});
const pg=await ctx.newPage();
pg.on('pageerror',e=>errs.push('pageerror '+e.message));
pg.on('response',r=>{if(r.status()>=400)errs.push('http '+r.status()+' '+r.url());});pg.on('console',m=>{if(m.type()==='error')errs.push('console '+m.text());});
await pg.goto(URL,{waitUntil:'load'});
await pg.waitForFunction(()=>typeof S!=='undefined'&&S.tracks&&S.tracks.length&&typeof openEditor==='function',null,{timeout:60000});
await pg.waitForTimeout(1500);
return{ctx,pg,cdp:await ctx.newCDPSession(pg)};
}
const open=pg=>pg.evaluate(()=>{mkLoad();UI.vvOff=true;const t=S.tracks.findIndex(x=>x.kind==='synth');
soundEdit(t,'Test',()=>loadPreset(t,'f-mk-k101'));R.selT=t;ED.tab='geraet';openEditor();
return{t,origin:S.tracks[t].sound.origin,plate:!!document.querySelector('#synthSheet .kmp1p'),seg:!!document.querySelector('#synthSheet .kmp1sg'),knobs:document.querySelectorAll('#synthSheet .kmp1k').length};});
const snap=pg=>pg.evaluate(()=>{const s=sndOf(R.selT);return JSON.stringify({mk:s.p.mk,fx:s.fx,mw:s.p.mw});});
const flat=(o,p,out)=>{if(o&&typeof o==='object'){for(const k of Object.keys(o))flat(o[k],p?p+'.'+k:k,out);}else out[p]=o;return out;};
const diff=(a,b)=>{a=flat(JSON.parse(a),'',{});b=flat(JSON.parse(b),'',{});const o=[];for(const k of new Set([...Object.keys(a),...Object.keys(b)]))if(JSON.stringify(a[k])!==JSON.stringify(b[k]))o.push(k);return o;};
const ctr=(pg,sel)=>pg.evaluate(s=>{const x=document.querySelector(s);if(!x)return null;x.scrollIntoView({block:'center'});const r=x.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+Math.min(r.height/2,30)};},sel);
const tap=async(pg,sel)=>{const b=await ctr(pg,sel);await pg.touchscreen.tap(b.x,b.y);await pg.waitForTimeout(250);};
async function drag(cdp,x,y,dx,dy,hold){
await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});
if(hold)await new Promise(r=>setTimeout(r,hold));
const n=12;for(let j=1;j<=n;j++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx*j/n,y:y+dy*j/n,id:1}]});await new Promise(r=>setTimeout(r,16));}
await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
await new Promise(r=>setTimeout(r,150));
}
let A=await mk(428,926);
await A.pg.evaluate(()=>{try{localStorage.removeItem('sq.kmp1.view');localStorage.removeItem('sq.kmp1.sec');}catch(e){}});
res.open=await open(A.pg);await A.pg.waitForTimeout(400);
await A.pg.screenshot({path:DIR+'/hoch.png'});
res.knobs={};
for(const sec of['filter','klang','raum']){
await tap(A.pg,'.kmp1s[data-s="'+sec+'"]');
const labs=await A.pg.evaluate(()=>[...document.querySelectorAll('#synthSheet .kmp1k')].map(k=>k.getAttribute('aria-label')));
for(const lab of labs){
const sel='#synthSheet .kmp1k[aria-label="'+lab+'"]';
let b=await ctr(A.pg,sel);await A.pg.waitForTimeout(100);b=await ctr(A.pg,sel);
const s0=await snap(A.pg);await drag(A.cdp,b.x,b.y,70,4,0);let s1=await snap(A.pg),d=diff(s0,s1);
if(!d.length){b=await ctr(A.pg,sel);await drag(A.cdp,b.x,b.y,-70,4,0);s1=await snap(A.pg);d=diff(s0,s1);}
res.knobs[lab]=d.join(',');
}}
// senkrechter Wisch
{const sel='#synthSheet .kmp1k';const b=await ctr(A.pg,sel);const s0=await snap(A.pg);await drag(A.cdp,b.x,b.y,3,-160,0);await A.pg.waitForTimeout(300);res.vertical=diff(s0,await snap(A.pg));}
// Undo
{const s0=await snap(A.pg);await A.pg.evaluate(()=>undo());await A.pg.waitForTimeout(250);res.undo=diff(s0,await snap(A.pg));res.undoPlate=await A.pg.evaluate(()=>!!document.querySelector('#synthSheet .kmp1p'));}
// Programm
{const o0=await A.pg.evaluate(()=>sndOf(R.selT).origin);await tap(A.pg,'.kmp1pa[aria-label="Nächstes Programm"]');await A.pg.waitForTimeout(300);
const o1=await A.pg.evaluate(()=>({o:sndOf(R.selT).origin,lcd:document.querySelector('.kmp1lcd .l1').textContent,plate:!!document.querySelector('#synthSheet .kmp1p')}));
const peak=await A.pg.evaluate(async()=>{const r=await mkRender(sndOf(R.selT),[[0,'on',60,.8],[1,'off',60]],{sec:1.5});let m=0;for(const x of r.l)m=Math.max(m,Math.abs(x));return m;});
await tap(A.pg,'.kmp1pa[aria-label="Voriges Programm"]');await tap(A.pg,'.kmp1pa[aria-label="Voriges Programm"]');
const o2=await A.pg.evaluate(()=>({o:sndOf(R.selT).origin,lcd:document.querySelector('.kmp1lcd .l1').textContent}));
await A.pg.evaluate(()=>undo());await A.pg.waitForTimeout(250);
const o3=await A.pg.evaluate(()=>sndOf(R.selT).origin);
res.prog={o0,o1,o2,peak,undoBack:o3};}
// Tastatur
res.key=await A.pg.evaluate(()=>!!document.querySelector('.kmp1keys .kmp1wk'));
{const b=await ctr(A.pg,'.kmp1keys .kmp1wk');await A.cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:b.x,y:b.y+30,id:2}]});await A.pg.waitForTimeout(150);
res.keyOn=await A.pg.evaluate(()=>[document.querySelectorAll('.kmp1keys .on').length,[...KMP1.held.values()].map(h=>!!h.v).join()]);
await A.cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await A.pg.waitForTimeout(150);res.keyOff=await A.pg.evaluate(()=>document.querySelectorAll('.kmp1keys .on').length);}
// Umschalter Groß, gemerkt
{await tap(A.pg,'.kmp1b[data-v="gross"]');res.gross={plate:await A.pg.evaluate(()=>!!document.querySelector('#synthSheet .kmp1p')),big:await A.pg.evaluate(()=>!!document.querySelector('#synthSheet .mkfr'))};
await A.pg.reload({waitUntil:'load'});await A.pg.waitForFunction(()=>typeof S!=='undefined'&&S.tracks&&S.tracks.length&&typeof openEditor==='function',null,{timeout:60000});await A.pg.waitForTimeout(1200);
const o=await open(A.pg);res.gross.reload=o.plate;await tap(A.pg,'.kmp1b[data-v="kompakt"]');res.gross.back=await A.pg.evaluate(()=>!!document.querySelector('#synthSheet .kmp1p'));}
// Normaler MK-Klang: keine Platte
res.normal=await A.pg.evaluate(()=>{closeEditor();const t=R.selT;soundEdit(t,'Test',()=>loadPreset(t,INIT_IDS.analog));setEngine(t,'mk');openEditor();return{eng:sndOf(t).engine,origin:sndOf(t).origin,plate:!!document.querySelector('#synthSheet .kmp1p')};}).catch(e=>'err '+e.message);
await A.ctx.close();
let B=await mk(926,428);
res.quer=await open(B.pg);await B.pg.waitForTimeout(400);
res.quer.fit=await B.pg.evaluate(()=>{const w=document.querySelector('.kmp1w');return w?[w.scrollHeight,w.clientHeight,document.documentElement.scrollWidth]:null;});
{const sel='#synthSheet .kmp1k';let b=await ctr(B.pg,sel);const s0=await snap(B.pg);await drag(B.cdp,b.x,b.y,70,3,0);res.quer.knob=diff(s0,await snap(B.pg));}
await B.pg.screenshot({path:DIR+'/quer.png'});
await B.ctx.close();await br.close();
res.vvLabel=null;res.errs=errs;console.log(JSON.stringify(res,null,1));
})().catch(e=>{console.log('FEHLER',e&&e.stack||e,JSON.stringify(res),errs);process.exit(1);});
