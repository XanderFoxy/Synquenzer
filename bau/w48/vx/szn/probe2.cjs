const {chromium}=require('playwright');const port=require('fs').readFileSync(__dirname+'/port.txt','utf8').trim();
(async()=>{const b=await chromium.launch();
for(const vp of [{width:428,height:926},{width:926,height:428}]){
const ctx=await b.newContext({viewport:vp,hasTouch:true,isMobile:true,deviceScaleFactor:2});const p=await ctx.newPage();const errs=[];
p.on('pageerror',e=>errs.push(''+e));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto(`http://127.0.0.1:${port}/neu/index.html`);await p.waitForFunction(()=>window.SYNQUENZER,null,{timeout:90000});await p.waitForTimeout(1500);
const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));
S.scenes[0].chords={len:4,ch:[{b:0,tg:null},{b:2,tg:null}]};S.scenes[1].name='Refrain mit sehr langem Namen';UI.dirty.grid=true;await W(300);
return UI.scenes.slice(0,2).map(b=>{const r=b.getBoundingClientRect();const kids=[...b.children].map(k=>{const q=k.getBoundingClientRect();return [k.className,+(q.top-r.top).toFixed(1),+(q.bottom-r.top).toFixed(1),+q.width.toFixed(1),k.scrollWidth,k.clientWidth]});return {h:r.height,w:r.width,sh:b.scrollHeight,kids,sc:b._sc.textContent}});});
console.log(JSON.stringify(vp),JSON.stringify(r),errs);
await p.screenshot({path:__dirname+'/probe2-'+vp.width+'.png',clip:{x:0,y:0,width:vp.width,height:Math.min(vp.height,300)}});await ctx.close();}
await b.close();})();
