import { chromium } from 'playwright';
const file = process.argv[2];
const b = await chromium.launch({ args:['--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage({ viewport:{ width:390, height:844 }, hasTouch:true, isMobile:true });
const errs=[]; p.on('pageerror', e=>errs.push(String(e))); p.on('console', m=>{ if(m.type()==='error') errs.push(m.text()); });
await p.goto('file://'+file); await p.waitForTimeout(1500);
const r = await p.evaluate(async () => {
  const Q = window.SYNQUENZER, out = { version: typeof VERSION!=='undefined'?VERSION:'?' };
  const st = a => { let s=0,pk=0; for (const v of a){ s+=v*v; pk=Math.max(pk,Math.abs(v)); } return { rms:+Math.sqrt(s/a.length).toFixed(4), peak:+pk.toFixed(3) }; };
  try { const x = await Q.mkRender(factorySound('f-init-am'), [[0.05,'on',57,0.8],[0.8,'off',57]], {sec:1.2}); out.initAm = st(x.l); } catch(e){ out.mkErr=String(e); }
  out.placePart = typeof Q.placePart; out.mkKeys = Object.keys(Q).filter(k=>/^mk/.test(k)).length;
  return out;
});
console.log(JSON.stringify(r), 'errors', JSON.stringify(errs).slice(0,600));
await b.close();
