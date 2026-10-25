import { chromium } from 'playwright';
const file = process.argv[2], out = process.argv[3];
const b = await chromium.launch({ args:['--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage({ viewport:{ width:844, height:390 }, hasTouch:true, isMobile:true });
const errs=[]; p.on('pageerror', e=>errs.push(String(e))); p.on('console', m=>{ if(m.type()==='error') errs.push(m.text()); });
await p.goto('file://'+file); await p.waitForTimeout(1500);
const info = await p.evaluate(async () => {
  const Q = window.SYNQUENZER; const r = {};
  r.keys = Object.keys(Q).filter(k=>/^mk|perf|placePart/.test(k));
  try { r.info = Q.mkInfo ? await Q.mkInfo() : null; } catch(e){ r.infoErr=String(e); }
  try { const x = await Q.mkRender({ note:57, dur:0.5 }); r.render = x && (x.rms ?? x.peak ?? (x.length||0)); r.renderType = typeof x; if (x && typeof x==='object') r.renderKeys = Object.keys(x).slice(0,8); } catch(e){ r.renderErr=String(e); }
  return r;
});
console.log(JSON.stringify(info).slice(0,1500));
try { await p.evaluate(()=>window.SYNQUENZER.mkPanel && window.SYNQUENZER.mkPanel(true)); await p.waitForTimeout(800); } catch(e){ console.log('panelErr', String(e)); }
await p.screenshot({ path: out });
console.log('errors', JSON.stringify(errs).slice(0,800));
await b.close();
