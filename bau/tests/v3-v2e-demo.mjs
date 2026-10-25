import { open } from './v3-v2d-pw.mjs';
for (const [vp, w, h] of [['P1', 390, 844], ['L1', 844, 390]]) {
  const {b, p, errs} = await open({width: w, height: h}, undefined, true);
  await p.evaluate(() => window.SYNQUENZER.songView(true)); await p.waitForTimeout(400);
  await p.screenshot({path: `v3-v2e-demo-${vp}.png`});
  console.log(vp, JSON.stringify(await p.evaluate(() => window.SYNQUENZER.svLayoutInfo())), errs);
  await b.close();
}
