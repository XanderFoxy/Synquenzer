import { open } from './v3-v2d-pw.mjs';
import { SETUP } from './v3-v2d2-lib.mjs';
const file = process.argv[2];
for (const [vp, w, h] of [['P3', 320, 568], ['L1', 844, 390], ['W', 1280, 800], ['P2', 375, 667]]) {
  const {b, p} = await open({width: w, height: h}, file, true);
  await p.evaluate(SETUP(true)); await p.evaluate(() => window.SYNQUENZER.songView(true)); await p.waitForTimeout(300);
  console.log(vp, JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('#songView .sv-top > button')].filter(x => x.offsetWidth).map(x => { const r = x.getBoundingClientRect(); return [x.className.replace(/rb |sv-b /g, '').split(' ')[0], +r.width.toFixed(1), +r.height.toFixed(1)]; }))),
    JSON.stringify(await p.evaluate(() => { const c = document.getElementById('carrier'); const r = c.getBoundingClientRect(); return [r.y, r.height]; })));
  await b.close();
}
