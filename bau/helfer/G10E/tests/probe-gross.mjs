// Studio-Ansicht (Schalter „Große Welle“): Wellenhöhe hochkant / Breite quer, Bildschirmfotos
import {launch, open, take, sleep, openEd, OUT} from './h.mjs';
const br = await launch();
for (const vp of [{width: 428, height: 926}, {width: 926, height: 428}]) {
  const H = await open(br, vp), p = H.p;
  await p.evaluate(() => localStorage.setItem('__x', '1'));
  const {id, ref} = await take(p, Array.from({length: 12}, (_, k) => 0.5 + k * 0.3));
  await openEd(p, ref, id);
  await p.evaluate(() => { document.querySelector('#wpSheet').classList.add('g10big'); });
  await sleep(200); await p.evaluate(() => SYNQUENZER.g10View(null, null));
  const r = await p.evaluate(() => { const c = document.querySelector('#wpSheet .wpcv').getBoundingClientRect(), s = document.querySelector('#wpSheet').getBoundingClientRect(); return {wave: [Math.round(c.width), Math.round(c.height)], sheet: [Math.round(s.width), Math.round(s.height)]}; });
  console.log(vp.width + '×' + vp.height, JSON.stringify(r));
  await p.screenshot({path: `${OUT}/gross-${vp.width}x${vp.height}.png`});
  await H.ctx.close();
}
await br.close();
