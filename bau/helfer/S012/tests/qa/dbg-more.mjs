import {launch, open, sleep} from '../h.mjs';
import {songABA} from '../lib.mjs';
const br = await launch();
for (const [w, h, app] of [[375, 667, null], [320, 568, null]]) {
  const H = await open(br, {viewport: {width: w, height: h}}), p = H.p; await songABA(p);
  await p.evaluate(() => SYNQUENZER.songView(true)); await sleep(250);
  await p.evaluate(() => SYNQUENZER.songSelect(0, 3)); await sleep(250);
  const info = await p.evaluate(() => { const b = document.querySelector('#rangeBar button[data-a="more"]'), k = b.getBoundingClientRect(), e = document.elementFromPoint(k.left + k.width / 2, k.top + k.height / 2); return {k: [k.left, k.top, k.width, k.height], hit: e && (e === b || b.contains(e)), hitEl: e && (e.id || e.className), vh: innerHeight}; });
  await p.tap('#rangeBar button[data-a="more"]'); await sleep(250);
  console.log(w, h, JSON.stringify(info), 'pop', await p.evaluate(() => UI.pop && UI.pop.name));
  await p.screenshot({path: `/home/user/Synquenzer/bau/helfer/S012/tests/qa/out/dbg-more-${w}.png`});
  await H.ctx.close();
}
await br.close();
