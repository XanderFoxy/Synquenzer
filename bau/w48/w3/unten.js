const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:428,height:926},deviceScaleFactor:2,isMobile:true,hasTouch:true});
const p=await ctx.newPage();await p.goto('http://127.0.0.1:8743/repo/the-wall/werkstatt3/css/muster-konsole.html');await p.waitForTimeout(300);
await p.evaluate(()=>scrollTo(0,99999));await p.waitForTimeout(200);
await p.screenshot({path:__dirname+'/unten.png'});await b.close()})();
