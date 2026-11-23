const {chromium, sleep, open, setup, render} = require('./lib.cjs');
const port = process.argv[2], wer = process.argv[3] || 'neu';
(async () => {
  const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const {ctx, p, errs} = await open(b, port, wer, 428, 926);
  const s = await setup(p);
  console.log('setup', JSON.stringify(s));
  const r = await render(p);
  const st = await p.evaluate(() => { const y = __R[0]; let on = -1, last = -1, pk = 0; for (let j = 0; j < y.length; j++) { const v = Math.abs(y[j]); if (v > 1e-3) { if (on < 0) on = j; last = j; } if (v > pk) pk = v; } return {on, last, pk, n: y.length}; });
  console.log('render', JSON.stringify(r), JSON.stringify(st));
  await p.evaluate(st => vx1rOpen({t: st, s: 0}), s.st);
  await sleep(1500);
  const g = await p.evaluate(() => { const o = document.querySelector('.vtro'), f = ED.roll.fol(), cM = ED.roll.el.main.getBoundingClientRect(); const R = e => { if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]; };
    return {f, cM: [cM.left, cM.top, cM.width, cM.height], o: R(o), eh: R(o && o.querySelector('.vtrh.e')), ah: R(o && o.querySelector('.vtrh.a')), ahid: o && o.querySelector('.vtra').hidden, et: o && o.querySelector('.vtrt.e').textContent, vl3: !!document.querySelector('.vl3o:not([hidden])'), dead: VTR.dead}; });
  console.log('geo', JSON.stringify(g));
  await p.screenshot({path: __dirname + '/smoke-' + wer + '.png'});
  console.log('errs', JSON.stringify(errs));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
