import {createRequire} from 'module'; const {chromium} = createRequire('/opt/node-tools/node_modules/')('playwright');
const file = process.argv[2];
const b = await chromium.launch();
const ctx = await b.newContext({viewport:{width:926,height:428}, hasTouch:true, isMobile:true, deviceScaleFactor:1});
const p = await ctx.newPage();
const errs=[]; p.on('pageerror', e=>errs.push(String(e)));
await p.goto('file://'+file); await p.waitForTimeout(2000);
const r = await p.evaluate(() => {
  const o = {};
  o.tracks = SYNQUENZER.tracks();
  o.engines = S.tracks.map(t => t.kind + ':' + (t.sound && t.sound.engine));
  o.sheets = [...document.querySelectorAll('.sheet')].map(s => s.id + ' ' + s.className);
  o.ids = [...document.querySelectorAll('body > *, #app > *')].map(e => e.tagName + '#' + e.id + '.' + e.className);
  o.pops = [...document.querySelectorAll('.pop')].map(e => e.className);
  return o;
});
console.log(JSON.stringify(r, null, 1));
console.log(errs);
await b.close();
