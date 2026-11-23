const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];
for(const vp of [{width:428,height:926},{width:926,height:428}]){const c=await b.newContext({viewport:vp,hasTouch:true,isMobile:true});const p=await c.newPage();
p.on('pageerror',e=>errs.push('pageerror '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/abspann-logo|404/.test(m.text()))errs.push('console '+m.text());});
await p.goto('http://localhost:8884/index.html',{waitUntil:'load'});await p.waitForTimeout(4000);
const r=await p.evaluate(()=>typeof vr1Make==='function'?(()=>{const K=vr1Make();const sr=44100,x=new Float32Array(sr);for(let i=0;i<sr;i++)x[i]=0.2*Math.sin(2*Math.PI*120*i/sr);x[22050]+=0.8;return K.done(K.clickScan(x,sr,{})).length;})():'kein vr1Make');
console.log(vp.width+'x'+vp.height,'clickScan-Probe',r);await c.close();}
console.log('errors',JSON.stringify(errs));await b.close();})();
