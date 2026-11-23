const {chromium}=require('playwright');
(async()=>{const port=process.argv[2];const b=await chromium.launch();
for(const [w,h] of [[428,926],[926,428]]){const c=await b.newContext({viewport:{width:w,height:h},hasTouch:true,isMobile:true,deviceScaleFactor:2});const p=await c.newPage();const errs=[];
p.on('pageerror',e=>errs.push('pageerror '+e));p.on('console',m=>{if(m.type()==='error'&&!/abspann-logo/.test(m.location().url||'')&&!/Failed to load resource/.test(m.text()))errs.push(m.text());});
p.on('response',r=>{if(r.status()>=400&&!/abspann-logo/.test(r.url()))errs.push('HTTP '+r.status()+' '+r.url());});
await p.goto('http://127.0.0.1:'+port+'/index.html');await p.waitForFunction(()=>window.SYNQUENZER,null,{timeout:90000});await p.waitForTimeout(3000);
console.log(w+'x'+h,'title',await p.title(),'errors',JSON.stringify(errs));await c.close();}
await b.close();})();
