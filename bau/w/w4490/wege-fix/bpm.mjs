import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const f = process.argv[2], out = process.argv[3];
const b = await chromium.launch();
for (const [w, h] of [[926, 428], [926, 370], [428, 926]]) {
  const p = await b.newPage({viewport: {width: w, height: h}, deviceScaleFactor: 2, hasTouch: true, isMobile: true});
  await p.goto('file://' + f); await p.waitForFunction(() => window.SYNQUENZER, null, {timeout: 60000}); await p.waitForTimeout(2000);
  await p.evaluate(() => { const D = window.SYNQUENZER; D.setClip(0, 0, {len: 1, notes: [{t: 0, d: 1, n: 60, v: .8}]}); D.songFromChain([{scene: 0, bars: 4}]); D.songView(true); });
  await p.waitForTimeout(400);
  const bb = await p.evaluate(() => { const r = EL.bBpm.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; });
  await p.touchscreen.tap(bb.x, bb.y); await p.waitForTimeout(600);
  const r = await p.evaluate(() => { const pp = UI.pop && UI.pop.el; if (!pp) return null; const R = pp.getBoundingClientRect();
    return {name: UI.pop.name, pop: [Math.round(R.left), Math.round(R.top), Math.round(R.width), Math.round(R.height)], sh: pp.scrollHeight, ch: pp.clientHeight, kids: [...pp.children].map(c => c.tagName + '.' + c.className + ':' + Math.round(c.getBoundingClientRect().top) + '-' + Math.round(c.getBoundingClientRect().bottom)),
      btns: [...pp.querySelectorAll('button')].map(x => { const q = x.getBoundingClientRect(); return x.textContent.trim().slice(0, 14) + '@' + Math.round(q.left) + ',' + Math.round(q.top) + ' ' + Math.round(q.width) + 'x' + Math.round(q.height) + (q.bottom > innerHeight ? ' UNTEN' : ''); })}; });
  console.log(w + 'x' + h, JSON.stringify(r, null, 0));
  if (out) await p.screenshot({path: out + '/bpm-' + w + 'x' + h + '.png'});
  await p.close();
}
await b.close();
