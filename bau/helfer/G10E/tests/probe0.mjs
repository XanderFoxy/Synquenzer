import {launch, open, take, sleep, OUT} from './h.mjs';
import fs from 'fs'; fs.mkdirSync(OUT, {recursive: true});
const br = await launch();
for (const vp of [{width: 428, height: 926}, {width: 926, height: 428}, {width: 428, height: 650}]) {
  const H = await open(br, vp), p = H.p;
  const T = Array.from({length: 12}, (_, k) => 0.5 + k * 0.3 + (k % 3) * 0.02);
  const {id, ref} = await take(p, T);
  await p.evaluate(r => SYNQUENZER.wpOpen(r), ref); await p.evaluate(id => SYNQUENZER.wpDetect(id), id); await sleep(400);
  await p.screenshot({path: `${OUT}/p0-${vp.width}x${vp.height}.png`});
  console.log(vp, JSON.stringify(await p.evaluate(() => { const g = SYNQUENZER.wpGeom(); const s = document.querySelector('#wpSheet').getBoundingClientRect(); return {g: {x: g.x, y: g.y, w: g.w, h: g.h, n: g.marks.length}, sheet: [s.x, s.y, s.width, s.height]}; })), H.errs);
  await H.ctx.close();
}
await br.close();
