// Kern-Test MLG3: node kern.js <port>
const {chromium}=require('playwright');
const port=process.argv[2]||'8731',URL='http://127.0.0.1:'+port+'/index.html';
const DIR=__dirname;
const res={};const errs=[];
(async()=>{
const br=await chromium.launch();
async function mk(w,h){
const ctx=await br.newContext({viewport:{width:w,height:h},hasTouch:true,isMobile:true,deviceScaleFactor:2});
const pg=await ctx.newPage();
pg.on('pageerror',e=>errs.push('pageerror '+e.message));
pg.on('console',m=>{if(m.type()==='error')errs.push('console '+m.text()+' '+JSON.stringify(m.location()));});pg.on('response',r=>{if(r.status()>=400)errs.push('http '+r.status()+' '+r.url());});
await pg.goto(URL,{waitUntil:'load'});
await pg.waitForFunction(()=>typeof S!=='undefined'&&S.tracks&&S.tracks.length&&typeof openEditor==='function',null,{timeout:60000});
await pg.waitForTimeout(1500);
return{ctx,pg,cdp:await ctx.newCDPSession(pg)};
}
const open=pg=>pg.evaluate(()=>{const t=S.tracks.findIndex(x=>x.kind==='synth');
soundEdit(t,'Test',()=>loadPreset(t,'f-retro-sequenz'));R.selT=t;openEditor();return{t,origin:S.tracks[t].sound.origin,plate:!!document.querySelector('#synthSheet .mlg3p'),seg:!!document.querySelector('#synthSheet .mlg3sg'),knobs:document.querySelectorAll('#synthSheet .mlg3k').length};});
const snap=pg=>pg.evaluate(()=>{const t=R.selT,s=S.tracks[t].sound,p={},fx={};for(const k of Object.keys(s.p))p[k]=kv1Get(t,k);for(const k of Object.keys(s.fx))fx[k]=kv1Get(t,'fx.'+k);return JSON.stringify({p,fx,mods:sndOf(t).mods,e:S.fxBus.echo});});
const diff=(a,b)=>{a=JSON.parse(a);b=JSON.parse(b);const o=[];for(const g of['p','fx','e'])for(const k of new Set([...Object.keys(a[g]),...Object.keys(b[g])]))if(JSON.stringify(a[g][k])!==JSON.stringify(b[g][k]))o.push(g+'.'+k);if(JSON.stringify(a.mods)!==JSON.stringify(b.mods))o.push('mods');return o;};
async function box(pg,lab){return pg.evaluate(l=>{const k=[...document.querySelectorAll('#synthSheet .mlg3k')].find(x=>x.getAttribute('aria-label')===l);if(!k)return null;k.scrollIntoView({block:'center'});const r=k.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+20};},lab);}
async function drag(cdp,x,y,dx,dy,hold){
await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});
if(hold)await new Promise(r=>setTimeout(r,hold));
const n=12;for(let j=1;j<=n;j++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx*j/n,y:y+dy*j/n,id:1}]});await new Promise(r=>setTimeout(r,16));}
await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
await new Promise(r=>setTimeout(r,120));
}
// Hochkant
let A=await mk(428,926);
await A.pg.evaluate(()=>{try{localStorage.removeItem('sq.mlg3.view');}catch(e){}});
res.open=await open(A.pg);
await A.pg.waitForTimeout(300);
await A.pg.screenshot({path:DIR+'/hoch.png'});
const want={'FILTER Cutoff':'p.cutoff','FILTER Reso':'p.res','AMP-HÜLLK. A':'p.aA','ECHO Rückk.':'e.fb'};
res.knobs={};
for(const[lab,key]of Object.entries(want)){
const b=await box(A.pg,lab);await A.pg.waitForTimeout(150);const b2=await box(A.pg,lab);
const s0=await snap(A.pg),u0=await A.pg.evaluate(()=>UI.undo?UI.undo.length:(typeof undoStack!=='undefined'?undoStack.length:-1));
await drag(A.cdp,b2.x,b2.y,70,4,0);
const s1=await snap(A.pg),d=diff(s0,s1);
res.knobs[lab]={changed:d,ok:d.length===1&&d[0]===key};
}
// senkrechter Wisch auf einem Regler
{const b=await box(A.pg,'OSZ 2 Verst.');await A.pg.waitForTimeout(150);
const sc0=await A.pg.evaluate(()=>{const w=document.querySelector('.mlg3w');return[w.scrollTop,w.scrollHeight,w.clientHeight,document.querySelector('#synthSheet .sh-body').scrollTop];});
const s0=await snap(A.pg);
const b2=await box(A.pg,'OSZ 2 Verst.');
await drag(A.cdp,b2.x,b2.y,3,-160,0);
await A.pg.waitForTimeout(400);
const s1=await snap(A.pg);
const sc1=await A.pg.evaluate(()=>{const w=document.querySelector('.mlg3w');return[w.scrollTop,w.scrollHeight,w.clientHeight,document.querySelector('#synthSheet .sh-body').scrollTop];});
res.vertical={changed:diff(s0,s1),scrollBefore:sc0,scrollAfter:sc1};}
// Halten + Ziehen
{const b=await box(A.pg,'LFO Menge');await A.pg.waitForTimeout(150);const b2=await box(A.pg,'LFO Menge');const s0=await snap(A.pg);
await drag(A.cdp,b2.x,b2.y,0,-60,500);const s1=await snap(A.pg);res.hold={changed:diff(s0,s1)};}
// Rueckgaengig
{const s0=await snap(A.pg);
const lab=await A.pg.evaluate(()=>{const b=document.querySelector('#synthSheet .hb.ur');return b&&b.textContent;});
await A.pg.evaluate(()=>undo());await A.pg.waitForTimeout(200);
const s1=await snap(A.pg);res.undo={btn:lab,changed:diff(s0,s1)};
await A.pg.evaluate(()=>undo());await A.pg.waitForTimeout(200);res.undo.changed2=diff(s1,await snap(A.pg));
res.undo.plateAfter=await A.pg.evaluate(()=>!!document.querySelector('#synthSheet .mlg3p'));}
// Umschalter auf Voll, neu laden
{await open(A.pg);await A.pg.waitForTimeout(300);const b=await A.pg.evaluate(()=>{const x=document.querySelector('.mlg3b[data-v="voll"]');const r=x.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2};});
await A.pg.touchscreen.tap(b.x,b.y);await A.pg.waitForTimeout(400);
res.voll={plate:await A.pg.evaluate(()=>!!document.querySelector('#synthSheet .mlg3p')),tabs:await A.pg.evaluate(()=>document.querySelectorAll('#synthSheet .sh-tabs .tab').length)};
await A.pg.screenshot({path:DIR+'/voll.png'});
await A.pg.reload({waitUntil:'load'});
await A.pg.waitForFunction(()=>typeof S!=='undefined'&&S.tracks&&S.tracks.length&&typeof openEditor==='function',null,{timeout:60000});
await A.pg.waitForTimeout(1200);
const o=await open(A.pg);res.reload={plate:o.plate,seg:o.seg,on:await A.pg.evaluate(()=>{const x=document.querySelector('.mlg3b.on');return x&&x.dataset.v;})};
// zurueck auf Retro
const c=await A.pg.evaluate(()=>{const x=document.querySelector('.mlg3b[data-v="retro"]');const r=x.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2};});
await A.pg.touchscreen.tap(c.x,c.y);await A.pg.waitForTimeout(300);res.reload.back=await A.pg.evaluate(()=>!!document.querySelector('#synthSheet .mlg3p'));
// Browser-Chip
res.chip=await A.pg.evaluate(()=>{try{openBrowser(R.selT);}catch(e){return 'err '+e.message;}return document.querySelectorAll('.mlg3c').length;});
}
// Nicht-Retro-Klang: keine Ansicht
res.normal=await A.pg.evaluate(()=>{closeEditor();const t=R.selT;soundEdit(t,'Test',()=>loadPreset(t,INIT_IDS.analog));openEditor();return{plate:!!document.querySelector('#synthSheet .mlg3p'),seg:!!document.querySelector('#synthSheet .mlg3sg')};});
await A.ctx.close();
// Quer
let B=await mk(926,428);
res.quer=await open(B.pg);await B.pg.waitForTimeout(300);
res.quer.fit=await B.pg.evaluate(()=>{const w=document.querySelector('.mlg3w');return w?[w.scrollHeight,w.clientHeight,document.documentElement.scrollWidth]:null;});
await B.pg.screenshot({path:DIR+'/quer.png'});
await B.ctx.close();
await br.close();
res.errs=errs;
console.log(JSON.stringify(res,null,1));
})().catch(e=>{console.log('FEHLER',e&&e.stack||e,JSON.stringify(res),errs);process.exit(1);});
