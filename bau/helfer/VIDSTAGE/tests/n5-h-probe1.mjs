import { chromium } from 'playwright';
const file = process.argv[2];
const b = await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']}); const p = await b.newPage({viewport:{width:390,height:844}});
const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type()==='error') errs.push(m.text()); });
await p.goto('file://'+file); await p.waitForTimeout(2000);
const r = await p.evaluate(() => {
  const out = {};
  const ser = () => JSON.stringify(window.SYNQUENZER.project ? window.SYNQUENZER.project() : null);
  let s = window.serializeProject ? 1 : 0;
  out.hasSer = s;
  out.keys = Object.keys(window.SYNQUENZER.project());
  out.demos = window.SYNQUENZER.demoSongs ? window.SYNQUENZER.demoSongs().map(d=>d.id) : null;
  return out;
});
console.log(JSON.stringify(r));
console.log('errors', JSON.stringify(errs));
await b.close();
