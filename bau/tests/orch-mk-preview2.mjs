import { chromium } from 'playwright';
const file = process.argv[2], out = process.argv[3];
const b = await chromium.launch({ args:['--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage({ viewport:{ width:844, height:390 }, hasTouch:true, isMobile:true });
const errs=[]; p.on('pageerror', e=>errs.push(String(e))); p.on('console', m=>{ if(m.type()==='error') errs.push(m.text()); });
await p.goto('file://'+file); await p.waitForTimeout(1500);
const r = await p.evaluate(async () => {
  const Q = window.SYNQUENZER; const out = {};
  const snd = factorySound('f-init-am');
  try {
    const x = await Q.mkRender(snd, [[0.05,'on',57,0.8],[0.8,'off',57]], {sec:1.2});
    const ch = x.getChannelData ? x.getChannelData(0) : (x.data || x.ch0 || x);
    let s=0,pk=0; for (let i=0;i<ch.length;i++){ s+=ch[i]*ch[i]; pk=Math.max(pk,Math.abs(ch[i])); }
    out.rms = Math.sqrt(s/ch.length); out.peak = pk; out.len = ch.length;
  } catch(e){ out.err = String(e); }
  try { Q.selectTrack && Q.selectTrack(1); Q.setParam ? Q.setParam(1,'engine','mk') : null; out.eng = Q.getParam ? Q.getParam(1,'engine') : '?'; } catch(e){ out.engErr=String(e); }
  try { Q.mkPanel && Q.mkPanel(true); } catch(e){ out.panelErr=String(e); }
  return out;
});
console.log(JSON.stringify(r));
await p.waitForTimeout(800);
await p.screenshot({ path: out });
console.log('errors', JSON.stringify(errs).slice(0,800));
await b.close();
