import {launch, open} from './v3-qa8-lib.mjs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const b = await launch();
for (const f of ['L2', 'L1', 'LM', 'P3']) {
  const {ctx, page} = await open(b, f);
  await page.evaluate(async () => { await SYNQUENZER.libraryReady(); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); });
  await sleep(400);
  await page.evaluate(async () => { mkProg.select(6, 16); SYNQUENZER.mkSet(0, 't.0.f.cut', 30); await mkProg.write(6, 16, 'Doppelsirene Neu'); SYNQUENZER.mkSet(0, 't.0.f.cut', 31); });
  await page.evaluate(() => document.querySelector('#synthSheet .sh-head .hb.sv').click()); await sleep(400);
  const r = await page.evaluate(() => { const p = document.querySelector('.pop.mk8w'), g = p.querySelector('[data-a="go"]'); const pr = p.getBoundingClientRect(), gr = g.getBoundingClientRect(); const cs = getComputedStyle(p);
    return {vh: innerHeight, pop: [pr.top, pr.bottom].map(Math.round), go: [gr.top, gr.bottom].map(Math.round), scrollH: p.scrollHeight, clientH: p.clientHeight, maxH: cs.maxHeight, pb: cs.paddingBottom, overflowY: cs.overflowY, layer: (() => { const l = document.getElementById('popLayer'); const s = getComputedStyle(l); return {pb: s.paddingBottom, b: s.bottom}; })()}; });
  console.log(f, JSON.stringify(r));
  await ctx.close();
}
await b.close();
