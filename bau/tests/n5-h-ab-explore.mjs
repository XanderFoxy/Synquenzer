import { launch, OUT } from './n5-h-ab-lib.mjs';
const {b, p, errs} = await launch();
await p.screenshot({path: OUT + '/n5-h-ab-main.png'});
const info = await p.evaluate(() => {
  const vis = [...document.querySelectorAll('button, [role=button], .cell, .knob')].filter(x => { const r = x.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.top < innerHeight && r.bottom > 0; });
  return {n: vis.length, list: vis.slice(0, 120).map(x => (x.id || x.className.toString().slice(0, 30)) + '|' + x.textContent.trim().slice(0, 20) + '|' + Math.round(x.getBoundingClientRect().left) + ',' + Math.round(x.getBoundingClientRect().top))};
});
console.log(JSON.stringify(info, null, 0));
console.log(JSON.stringify(await p.evaluate(() => ({h: SYNQUENZER.history(), v: VERSION, nt: NT(), ns: NS(), id: S.id, name: S.name}))));
console.log('errs', errs);
await b.close();
