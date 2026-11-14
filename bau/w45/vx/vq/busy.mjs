import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const FILE = process.argv[2], sleep = ms => new Promise(r => setTimeout(r, ms));
const b = await chromium.launch();
for (const [w, h] of [[926, 370], [926, 428]]) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 1}), p = await ctx.newPage();
  await p.goto('file://' + FILE); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version, null, {timeout: 90000}); await sleep(900);
  await p.evaluate(() => { SYNQUENZER.loadDemo(); SYNQUENZER.songFromChain([{scene: 0, bars: 1}, {scene: 1, bars: 1}]); vvOpen(); }); await sleep(800);
  await p.evaluate(() => { vvGo(); }); await p.waitForFunction(() => VV.busy, null, {timeout: 5000}); await sleep(150);
  const m = await p.evaluate(() => { const g = document.querySelector('#vvSheet .vvprog'), c = document.querySelector('#vvSheet .vvprog .vvbtn'), r = g.getBoundingClientRect(), q = c.getBoundingClientRect();
    let seen = 0; for (let y = Math.floor(q.top) + .5; y < q.bottom; y++) { const e = document.elementFromPoint(q.left + q.width / 2, y); if (e && (e === c || c.contains(e))) seen++; }
    return {busy: VV.busy, prog: [Math.round(r.top), Math.round(r.bottom)], abbrechen: [Math.round(q.top), Math.round(q.bottom), c.textContent, 'sichtbar ' + seen]}; });
  console.log(w + 'x' + h, JSON.stringify(m));
  await p.waitForFunction(() => !VV.busy, null, {timeout: 120000}); await ctx.close();
}
await b.close();
