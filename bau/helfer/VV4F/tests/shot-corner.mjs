import { open, OUT, SONG8 } from './lib.mjs';
for (const [w, h] of [[390, 844], [375, 667], [667, 375]]) {
  const {b, p} = await open({w, h, dpr: 3});
  const r = await p.evaluate(() => { const r = UI.cnw.getBoundingClientRect(); return {x: r.x, y: r.y, width: r.width + 4, height: r.height + 2}; });
  await p.screenshot({path: `${OUT}/corner-${w}x${h}.png`, clip: r});
  await p.evaluate(s => SYNQUENZER.setSong(s), SONG8); await p.evaluate(() => setSongView(true)); await p.waitForTimeout(400);
  const q = await p.evaluate(() => { const r = SV.labs.getBoundingClientRect(); return {x: r.x, y: r.y, width: r.width, height: Math.min(r.height, 300)}; });
  await p.screenshot({path: `${OUT}/labs-${w}x${h}.png`, clip: q});
  await b.close();
}
