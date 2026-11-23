const {chromium}=require('playwright');
(async()=>{const port=require('fs').readFileSync(__dirname+'/port.txt','utf8').trim();
const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:428,height:926},hasTouch:true,isMobile:true,deviceScaleFactor:2});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(''+e));
await p.goto('http://127.0.0.1:'+port+'/neu/index.html');await p.waitForFunction(()=>window.SYNQUENZER,null,{timeout:90000});await p.waitForTimeout(1500);
const r=await p.evaluate(()=>({nt:NT(),ns:NS(),tr:S.tracks.map(t=>({n:t.name,k:t.kind||t.type,clips:(t.clips||[]).map(c=>c?Object.keys(c).join(','):null).slice(0,3)})),pages:MX.pages,bankT:MX.bankT}));
console.log(JSON.stringify(r,null,0).slice(0,3000));console.log(errs);await b.close();})();
