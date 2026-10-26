import {launch, open} from './v3-qa8-lib.mjs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const file = process.argv[2];
const b = await launch();
for (const f of ['P1']) for (const eng of ['mk', 'va']) {
  const {ctx, page: p, errs} = await open(b, f, file);
  const cdp = await ctx.newCDPSession(p);
  const tap = async (x, y, w = 300) => { await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y, id: 1}]}); await sleep(40); await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await sleep(w); };
  await p.evaluate(async eng => { await SYNQUENZER.libraryReady(); if (eng === 'mk') SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); if (eng === 'mk' && window.mkProg) mkProg.select(2, 3); }, eng);
  await sleep(500);
  const before = await p.evaluate(() => ({ed: R.editor, el: (() => { const e = document.elementFromPoint(4, 840); return e && (e.id || e.className); })()}));
  await p.evaluate(() => document.querySelector('#synthSheet .sh-head .hb.sv').click()); await sleep(300);
  const pop = await p.evaluate(() => { const q = document.querySelector('#popLayer .pop'); return q && q.className; });
  await tap(4, 840);
  const after = await p.evaluate(() => ({ed: R.editor, pop: !!document.querySelector('#popLayer .pop'), sheet: !!document.querySelector('#synthSheet .sh-head .preset .pv')}));
  console.log(eng, 'element under (4,840):', before.el, '| pop', pop, '| editor before', before.ed, 'after', JSON.stringify(after));
  await ctx.close();
}
await b.close();
