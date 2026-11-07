import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await b.newPage(); await p.goto('file://' + process.argv[2]); await p.waitForTimeout(1500);
console.log(JSON.stringify(await p.evaluate(() => {
  const D = window.SYNQUENZER, G = D.gen3, u = G.ue(), bb = G.bbDrum().map(f => f.ue);
  const miss = u.visible.filter(id => !bb.includes(id));
  return {vis: u.visible.length, bb: bb.length, miss: miss.map(id => { const L = UE_LIB.find(x => x.id === id); return [id, L.k, L.a, L.len, !!L.stop, (L.notes||[]).length, L.gs]; })};
})));
await b.close();
