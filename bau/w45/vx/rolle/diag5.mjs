import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const p = await (await b.newContext({viewport: {width: 926, height: 428}, deviceScaleFactor: 2, hasTouch: true, isMobile: true})).newPage();
await p.goto('file://' + process.argv[2]); await p.waitForTimeout(1500);
const r = await p.evaluate(async () => {
  const pcm = Array.from({length: 48000 * 2}, (_, i) => Math.round(8000 * Math.sin(i / 20) * (i % 24000 < 12000 ? 1 : .2)));
  const t = await SYNQUENZER.tkInject({pcm, sr: 48000, scene: 0, at: 0, len: 2}); await new Promise(r => setTimeout(r, 300));
  window.__vx1.open({t: stimmeT(), s: 0}); await new Promise(r => setTimeout(r, 1500));
  const x = document.querySelector('#rollSheet .rhead .sh-x'), r0 = x.getBoundingClientRect(), cy = r0.top + r0.height / 2, out = [];
  for (let xx = Math.floor(r0.left) - 6; xx < innerWidth; xx++) { const e = document.elementFromPoint(xx, cy); out.push(xx + ':' + (e === x ? 'X' : (e && (e.className || e.tagName)).toString().slice(0, 12))); }
  return {r: r0.toJSON(), vx: !!(ED.rollAt && ED.rollAt.vx), out, ov: getComputedStyle(document.querySelector('#rollSheet .rhead')).overflow};
});
console.log(JSON.stringify(r));
await b.close();
