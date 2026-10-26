import {launch, open} from './v3-qa8-lib.mjs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const b = await launch();
for (const own of [false, true]) for (const f of ['P1', 'P2', 'P3', 'L1', 'L2', 'LM', 'PM', 'W']) {
  const {ctx, page: p} = await open(b, f);
  await p.evaluate(async own => { await SYNQUENZER.libraryReady(); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); mkProg.select(2, 14);
    if (own) { SYNQUENZER.mkSet(0, 't.0.f.cut', 30); await mkProg.write(2, 14, 'Probe'); SYNQUENZER.mkSet(0, 't.0.f.cut', 31); } }, own);
  await sleep(400);
  await p.evaluate(() => document.querySelector('#synthSheet .sh-head .hb.sv').click()); await sleep(400);
  const r = await p.evaluate(() => { const q = document.querySelector('.pop.mk8w'), pr = q.getBoundingClientRect(); const hid = [...q.querySelectorAll('button, input')].filter(x => !x.hidden && getComputedStyle(x).display !== 'none').map(x => { const r = x.getBoundingClientRect(); return {t: (x.textContent || x.value).trim().slice(0, 18), vis: Math.round(Math.min(r.bottom, pr.bottom - 0) - Math.max(r.top, pr.top)), h: Math.round(r.height)}; }).filter(x => x.vis < x.h);
    return {sh: q.scrollHeight, ch: q.clientHeight, hidden: hid}; });
  console.log((own ? 'own ' : 'fac ') + f.padEnd(3), 'scrollH/clientH', r.sh + '/' + r.ch, r.hidden.length ? 'PARTLY HIDDEN: ' + JSON.stringify(r.hidden) : 'all visible');
  await ctx.close();
}
await b.close();
