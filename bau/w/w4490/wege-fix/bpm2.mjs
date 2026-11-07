import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const f = process.argv[2];
const b = await chromium.launch();
const p = await b.newPage({viewport: {width: 926, height: 428}, deviceScaleFactor: 1, hasTouch: true, isMobile: true});
await p.goto('file://' + f); await p.waitForFunction(() => window.SYNQUENZER, null, {timeout: 60000}); await p.waitForTimeout(2000);
await p.evaluate(() => { const D = window.SYNQUENZER; D.setClip(0, 0, {len: 1, notes: [{t: 0, d: 1, n: 60, v: .8}]}); D.songFromChain([{scene: 0, bars: 4}]); D.songView(true); popBpm(); });
await p.waitForTimeout(500);
console.log(await p.evaluate(() => { const pp = UI.pop.el, cs = getComputedStyle(pp); return {w: pp.style.width, minW: cs.minWidth, maxW: cs.maxWidth, width: cs.width, cls: pp.className, style: pp.getAttribute('style')}; }));
await b.close();
