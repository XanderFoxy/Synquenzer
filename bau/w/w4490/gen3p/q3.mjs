import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await b.newPage(); const errs = [];
p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + process.argv[2]); await p.waitForTimeout(1500);
console.log(JSON.stringify(await p.evaluate(() => {
  const D = window.SYNQUENZER, G = D.gen3;
  const figs = BB1_FIG.filter(f => f.snd && !FACTORY_BY_ID.get(f.snd)).map(f => f.id + ':' + f.snd);
  const bb = G.bbDrum().length, ue = G.ue().visible.length;
  return {missingSnd: figs, bb, ue, fillGs: [...gen3FillGs()].length};
})), errs);
await b.close();
