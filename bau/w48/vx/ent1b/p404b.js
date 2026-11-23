const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:428,height:926},hasTouch:true,isMobile:true})).newPage();
p.on('response',r=>{if(r.status()>=400)console.log(r.status(),r.url());});
await p.goto('http://127.0.0.1:8742/index.html');await p.waitForFunction(()=>window.SYNQUENZER&&SYNQUENZER.vvOpen);await p.waitForTimeout(1500);await p.evaluate(()=>SYNQUENZER.vvOpen());await p.waitForTimeout(2500);await b.close();})();
