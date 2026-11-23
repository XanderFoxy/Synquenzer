const {chromium}=require('playwright');const port=require('fs').readFileSync(__dirname+'/port.txt','utf8').trim();
(async()=>{const b=await chromium.launch();
for(const vp of [{width:428,height:926},{width:926,height:428}]){
const ctx=await b.newContext({viewport:vp,hasTouch:true,isMobile:true,deviceScaleFactor:2});const p=await ctx.newPage();const errs=[];
p.on('pageerror',e=>errs.push(''+e));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto(`http://127.0.0.1:${port}/neu/index.html`);await p.waitForFunction(()=>window.SYNQUENZER,null,{timeout:90000});await p.waitForTimeout(1500);
const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));
const info=()=>UI.scenes.map(b=>{const r=b.getBoundingClientRect(),cs=getComputedStyle(b);return {s:b.dataset.s,vis:r.width>0,w:r.width,h:r.height,sh:b.scrollHeight,ch:b.clientHeight,pad:cs.padding,ov:cs.overflow,disp:cs.display,ai:cs.alignItems,html:b.innerHTML.slice(0,200),names:S.scenes.map(x=>x&&x.name)}});
const a=info();
S.scenes[0].name='Strophe';S.scenes[1].name='Refrain mit sehr langem Namen';UI.dirty.grid=true;await W(300);
const c=info();return {a:a.slice(0,2),c:c.slice(0,2),ns:NS(),mx:MX.scenes};});
console.log(JSON.stringify(vp),JSON.stringify(r,null,0),errs);
await p.screenshot({path:__dirname+'/probe-'+vp.width+'.png'});await ctx.close();}
await b.close();})();
