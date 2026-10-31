import { chromium } from 'playwright';
import fs from 'fs';
const APP='/home/user/Synquenzer/bau/vs/n5-br-V/index.html';
const SONG=JSON.parse(fs.readFileSync('song.json'));
const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,hasTouch:true,isMobile:true,recordVideo:{dir:'vid',size:{width:780,height:1688}}});
await ctx.addInitScript(()=>{const RX=[[/Moog[- ]?/gi,'Analog-'],[/Mini-?Lead/gi,'Retro-Lead'],[/Minimoog/gi,'Analog'],[/micro ?KORG/gi,'Klassik'],[/KORG/gi,'Klassik'],[/MS-?2000/gi,'MS-Panel'],[/Roland|Yamaha|Juno|Jupiter|Prophet|Oberheim|DX7|Nord /gi,'Klassik ']];
 const fix=()=>{const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){let t=n.nodeValue,o=t;for(const [r,s] of RX)t=t.replace(r,s);if(t!==o)n.nodeValue=t;}};
 const go=()=>{if(!document.body)return setTimeout(go,50);fix();new MutationObserver(fix).observe(document.body,{subtree:true,childList:true,characterData:true});};go();});
const p=await ctx.newPage(); const T0=Date.now(); const marks=[]; const mark=n=>{marks.push([n,(Date.now()-T0)/1000]);console.log(n,(Date.now()-T0)/1000);};
const cdp=await ctx.newCDPSession(p);
const touch=async(type,x,y)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y}]});
const drag=async(x,y,dx,dy,ms=900)=>{await touch('touchStart',x,y);const n=Math.round(ms/16);for(let i=1;i<=n;i++){const k=i/n,e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;await touch('touchMove',x+dx*e,y+dy*e);await p.waitForTimeout(16);}await touch('touchEnd');};
const tap=async(x,y)=>{await p.touchscreen.tap(x,y);};
const W=ms=>p.waitForTimeout(ms);
const box=async sel=>{const l=p.locator(sel).first();const r=await l.boundingBox();return r&&{x:r.x+r.width/2,y:r.y+r.height/2,r};};
const byText=async(t,scope='*')=>{const r=await p.evaluate(([t,scope])=>{const els=[...document.querySelectorAll(scope)].filter(e=>e.offsetParent&&e.textContent.trim()===t);const e=els[els.length-1];if(!e)return null;const q=e.getBoundingClientRect();return {x:q.x+q.width/2,y:q.y+q.height/2};},[t,scope]);return r;};
await p.goto('file://'+APP); await W(1500); await tap(5,300); await W(800);
await p.evaluate(s=>SYNQUENZER.setSong(s),SONG); await W(300);
// ---- Szene 1: Editor Synth 1, Filter auf, Cutoff drehen (Haken)
await p.evaluate(()=>SYNQUENZER.openEditor(0)); await W(500);
const ft=await byText('FILTER','button'); if(ft) await tap(ft.x,ft.y); await W(500);
const knobs=await p.evaluate(()=>[...document.querySelectorAll('.knob')].filter(e=>e.offsetParent).map(e=>{const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,l:(e.getAttribute('aria-label')||e.textContent||'').slice(0,20)}}));
console.log('knobs',JSON.stringify(knobs));

await tap(84,25); await W(400);
mark('s1');
if(knobs[0]){await drag(knobs[0].x,knobs[0].y,0,140,500);await W(150);await drag(knobs[0].x,knobs[0].y,0,-260,1300);await W(200);}
if(knobs[1]){await drag(knobs[1].x,knobs[1].y,0,-160,900);}
await W(300); mark('s1e');
// ---- Szene 2: Oszillator-Tab + Wellenwahl
const ot=await byText('OSZ','button'); if(ot){await tap(ot.x,ot.y);await W(400);}
mark('s2');
for(const w of ['Puls','Säge','Dreieck','Säge']){const q=await p.evaluate(w=>{const e=[...document.querySelectorAll('button')].find(e=>e.offsetParent&&e.textContent.trim().endsWith(w));if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}},w);if(q){await tap(q.x,q.y);await W(450);}}
const k2=await p.evaluate(()=>[...document.querySelectorAll('.knob')].filter(e=>e.offsetParent).map(e=>{const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}}));
if(k2[4]) await drag(k2[4].x,k2[4].y,0,-200,1000);
mark('s2e');
// ---- Szene 3: Klaviatur spielen
mark('s3');
for(const x of [30,85,140,195,250,140,85,195]){await tap(x,800);await W(220);}
mark('s3e');
// ---- Szene 4: Clip-Raster
const cl=await byText('×','button')||await box('button[aria-label*=chlie]'); 
await p.keyboard.press('Escape').catch(()=>{});
await p.evaluate(()=>{try{SYNQUENZER.openEditor(-1)}catch(e){}; const x=[...document.querySelectorAll('button')].find(e=>e.offsetParent&&e.textContent.trim()==='✕'||e.textContent.trim()==='×');});
await W(300);
const closeB=await p.evaluate(()=>{const e=[...document.querySelectorAll('button')].filter(e=>e.offsetParent).find(e=>/^[×✕✖]$/.test(e.textContent.trim()));if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}});
if(closeB){await tap(closeB.x,closeB.y);await W(500);}
mark('s4');
for(const t of ['1','2','1']){const q=await p.evaluate(t=>{const e=[...document.querySelectorAll('button,div')].filter(e=>e.offsetParent).find(e=>e.textContent.replace(/\s+/g,'').startsWith('▶'+t));if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}},t);if(q){await tap(q.x,q.y);await W(900);}}
mark('s4e');
// ---- Szene 5: Song-Ansicht
await p.evaluate(()=>SYNQUENZER.songView(true)); await W(300);
mark('s5');
await p.evaluate(()=>SYNQUENZER.songPlay(true)).catch(e=>console.log('sp',e.message));
await W(4500); mark('s5e');
await p.evaluate(()=>{try{SYNQUENZER.stop&&SYNQUENZER.stop()}catch(e){}});
await p.evaluate(()=>SYNQUENZER.songView(false)); await W(300);
// ---- Szene 6: MS-Bedienfeld
await p.evaluate(()=>{setEngine(3,'mk');}); await W(1500);
await p.evaluate(()=>SYNQUENZER.openEditor(3)); await W(2500);
mark('s6');
const k3=await p.evaluate(()=>[...document.querySelectorAll('.knob,[class*=mkk],[class*=knob]')].filter(e=>e.offsetParent).map(e=>{const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,w:r.width}}).filter(k=>k.w>20&&k.y>100&&k.y<800));
console.log('k3',k3.length);
for(const k of k3.slice(0,4)){await drag(k.x,k.y,0,-120,600);}
await W(400); mark('s6e');
await p.screenshot({path:'s6.png'});
fs.writeFileSync('marks.json',JSON.stringify(marks));
await p.close(); const vp=await p.video().path(); await ctx.close(); fs.copyFileSync(vp,'ui.webm'); console.log('video',vp); await b.close();
