const { chromium } = require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();
for (const rm of ['no-preference','reduce']){
const ctx=await b.newContext({viewport:{width:428,height:926},deviceScaleFactor:2,isMobile:true,hasTouch:true,reducedMotion:rm});
const p=await ctx.newPage();const err=[];p.on('pageerror',e=>err.push(String(e)));
await p.goto('http://127.0.0.1:8743/repo/the-wall/werkstatt3/css/muster-konsole.html');await p.waitForTimeout(200);
const r=await p.evaluate(()=>{const g=(sel,prop,pseudo)=>getComputedStyle(document.querySelector(sel),pseudo||null).getPropertyValue(prop);
  const css=[...document.styleSheets].find(s=>s.href&&s.href.includes('thema-konsole'));
  return {regeln:css.cssRules.length,
   aktiv:g('.raster3 [aria-pressed=true]','background-color'),gewaehlt:g('.raster3 .gewaehlt','background-color'),
   laeuftAnim:g('.raster3 .laeuft','animation-name')+'/'+g('.raster3 .laeuft','opacity'),laeuftAfter:g('.raster3 .laeuft','animation-name','::after')+' '+g('.raster3 .laeuft','opacity','::after')+' '+g('.raster3 .laeuft','animation-duration','::after'),
   fehler:g('.raster3 .fehler','background-color'),aus:g('.raster3 [disabled]','background-color')+' '+g('.raster3 [disabled]','color'),
   seg18:g('.seg [aria-pressed=true]','background-color')+' r='+g('.seg>button:first-child','border-top-left-radius'),
   fahnePos:g('.fahnen .fahne','position'),rahmenBefore:g('.rahmen','border-top-width','::before')+' '+g('.rahmen','border-top-left-radius','::before'),
   minH:Math.min(...[...document.querySelectorAll('button')].map(e=>e.getBoundingClientRect().height)),
   transition:g('.pille','transition-duration')}});
console.log(rm, JSON.stringify(r), err.join('|')||'ok');
if(rm==='no-preference'){await p.tap('[data-thema-wahl=klassisch]');await p.waitForTimeout(100);
 console.log('nach Tippen:',await p.evaluate(()=>[document.documentElement.dataset.thema,localStorage.getItem('w3-thema'),document.querySelector('meta[name=theme-color]').content,document.querySelector('[data-thema-wahl=klassisch]').getAttribute('aria-pressed')].join(' ')));
 await p.reload();await p.waitForTimeout(100);console.log('nach Neuladen:',await p.evaluate(()=>document.documentElement.dataset.thema));}
await ctx.close()}
await b.close()})();
