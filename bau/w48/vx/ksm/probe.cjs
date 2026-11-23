const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const port=fs.readFileSync(__dirname+'/port.txt','utf8').trim();const page=process.argv[2]||'basis';const code=fs.readFileSync(process.argv[3],'utf8');
const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:428,height:926},hasTouch:true,isMobile:true});const p=await ctx.newPage();const errs=[];
p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errs.push(m.text());});
await p.goto('http://127.0.0.1:'+port+'/'+page+'.html');await p.waitForFunction(()=>window.SYNQUENZER&&window.S&&S.tracks,null,{timeout:90000});await p.waitForTimeout(800);
const r=await p.evaluate(code);console.log(JSON.stringify(r,null,1));console.log('ERRS',errs);await b.close();})();
