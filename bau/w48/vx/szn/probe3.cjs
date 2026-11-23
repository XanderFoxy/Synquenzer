const {chromium}=require('playwright');const port=require('fs').readFileSync(__dirname+'/port.txt','utf8').trim();
(async()=>{const b=await chromium.launch();const vp={width:428,height:926};
const ctx=await b.newContext({viewport:vp,hasTouch:true,isMobile:true,deviceScaleFactor:2});const P=await ctx.newPage();
await P.goto(`http://127.0.0.1:${port}/neu/index.html`);await P.waitForFunction(()=>window.SYNQUENZER,null,{timeout:90000});await P.waitForTimeout(1500);
const g=await P.evaluate(()=>{const r=i=>{const q=UI.scenes[i].getBoundingClientRect();return [q.x+q.width/2,q.y+4]};return {a:r(0),c:r(2),UX2:typeof UX2,on:typeof ux2On==='function'?ux2On():null}});
console.log(g, await P.evaluate(g=>({top:ux2TopScene(g.a[0],g.a[1]),busy:ux2Busy(),sv:UI.songView}),g));
const cdp=await ctx.newCDPSession(P),T=(type,x,y)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y,id:1}]});
await T('touchStart',g.a[0],g.a[1]);await P.waitForTimeout(50);
for(let k=1;k<=8;k++){await T('touchMove',g.a[0],g.a[1]+k*8);await P.waitForTimeout(30);}
console.log(await P.evaluate(()=>UX2.d?{kind:UX2.d.kind,sub:UX2.d.sub}:null));
for(let k=1;k<=8;k++){await T('touchMove',g.a[0]+(g.c[0]-g.a[0])*k/8,g.a[1]+64);await P.waitForTimeout(30);}
console.log(await P.evaluate(()=>UX2.d?{kind:UX2.d.kind,sub:UX2.d.sub,tgt:JSON.stringify(UX2.d.tgt||UX2.d.to||null)}:null));
for(let k=1;k<=8;k++){await T('touchMove',g.c[0],g.a[1]+64);await P.waitForTimeout(30);}
console.log(await P.evaluate(()=>UX2.d?{kind:UX2.d.kind,sub:UX2.d.sub,keys:Object.keys(UX2.d).join(',')}:null));
await T('touchEnd');await P.waitForTimeout(700);
console.log(await P.evaluate(()=>({names:S.scenes.map(x=>x.name),clips:S.tracks.map(t=>t?t.clips.map(c=>c?1:0).join(''):'')})));
await b.close();})();
