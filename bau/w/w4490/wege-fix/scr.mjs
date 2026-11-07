import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const f = process.argv[2];
const b = await chromium.launch();
for (const [w, h] of [[926, 428], [428, 926]]) {
  const p = await b.newPage({viewport: {width: w, height: h}, deviceScaleFactor: 1, hasTouch: true, isMobile: true});
  await p.goto('file://' + f); await p.waitForFunction(() => window.SYNQUENZER, null, {timeout: 60000}); await p.waitForTimeout(2000);
  const r = await p.evaluate(() => { const D = window.SYNQUENZER; D.setClip(0, 0, {len: 1, notes: [{t: 0, d: 1, n: 60, v: .8}]}); D.songFromChain([{scene: 0, bars: 4}]); D.songView(true);
    return new Promise(res => setTimeout(() => { const x = [...document.querySelectorAll('.sv-scr')].map(e => ({vis: !!e.offsetParent, cls: e.className})); res({x, css: !!document.getElementById('wege-css'), fab: SX7.fab ? !!SX7.fab.offsetParent : null}); }, 500)); });
  console.log(w, JSON.stringify(r));
  await p.close();
}
await b.close();
