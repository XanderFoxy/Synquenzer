import {open, micOn} from './v3-vs2-h.mjs';
import {open as openB} from './v3-vs2-h-base.mjs';
for (const [nm, o] of [['G3G8', open], ['base', openB]]) {
  const H = await o(); const p = H.p; await micOn(p);
  for (let i = 0; i < 3; i++) {
    const r = await p.evaluate(() => { const t0 = performance.now(); SYNQUENZER.play(); const t1 = performance.now(); const c = SYNQUENZER.vsClock(); const t2 = performance.now(); return {play: t1 - t0, clock: t2 - t1, lead: c.start - window.__ctx.currentTime}; });
    console.log(nm, JSON.stringify(r));
    await p.evaluate(() => SYNQUENZER.stop()); await p.waitForTimeout(400);
  }
  await H.br.close();
}
