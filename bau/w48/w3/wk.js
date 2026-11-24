const { webkit } = require('playwright');
(async()=>{try{const b=await webkit.launch();const ctx=await b.newContext({viewport:{width:428,height:926},deviceScaleFactor:2,isMobile:true,hasTouch:true});
const p=await ctx.newPage();await p.goto('http://127.0.0.1:8743/repo/the-wall/werkstatt3/css/muster-konsole.html');await p.waitForTimeout(400);
console.log(await p.evaluate(()=>{const css=[...document.styleSheets].find(s=>s.href&&s.href.includes('thema-konsole'));return css.cssRules.length+' '+getComputedStyle(document.querySelector('.raster3 [aria-pressed=true]')).backgroundColor+' '+document.documentElement.scrollWidth}));
await p.screenshot({path:'/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/w3/webkit.png'});await b.close()}catch(e){console.log('webkit nicht da:',String(e).slice(0,200))}})();
