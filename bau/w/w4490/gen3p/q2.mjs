import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await b.newPage(); await p.goto('file://' + process.argv[2]); await p.waitForTimeout(1500);
console.log(JSON.stringify(await p.evaluate(() => {
  const D = window.SYNQUENZER, figs = D.bb1.figs().filter(f => f.r !== 'drum'), o = {};
  for (const g of D.gen3.genres()) o[g.id] = figs.filter(f => f.g === g.id).map(f => f.r + ':' + f.id);
  return o;
}), null, 0));
await b.close();
