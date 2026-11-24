const { chromium } = require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:428,height:926},deviceScaleFactor:2,isMobile:true,hasTouch:true});
const p=await ctx.newPage();await p.goto('file://'+path.join(__dirname,'repo/the-wall/werkstatt3/css/muster-konsole.html'));await p.waitForTimeout(300);
console.log(await p.evaluate(()=>{const o=[];for(const e of document.querySelectorAll('*')){const r=e.getBoundingClientRect();if(r.right>428.5)o.push(e.tagName+'.'+e.className+' r='+Math.round(r.right)+' w='+Math.round(r.width))}
 const d=document.querySelector('.dock').getBoundingClientRect();return o.slice(0,15).join('\n')+'\nvv='+visualViewport.width+' iw='+innerWidth+' dock='+JSON.stringify(d)}));await b.close()})();
