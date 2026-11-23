const {chromium, sleep, open, setup, render} = require('./lib.cjs');
const port = process.argv[2], wer = process.argv[3] || 'neu';
(async () => {
  const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const {ctx, p, errs} = await open(b, port, wer, 428, 926);
  const s = await setup(p);
  const r = await render(p);
  const e = await p.evaluate(sr => { const y = __R[0], w = Math.round(sr * .1), o = []; for (let k = 0; k * w < y.length; k++) { let s = 0, m = 0; for (let j = k * w; j < Math.min(y.length, (k + 1) * w); j++) { s += y[j] * y[j]; } o.push(+(10 * Math.log10(s / w + 1e-20)).toFixed(1)); } return o; }, r.sr);
  console.log(JSON.stringify(e));
  const fx = await p.evaluate(st => { const tr = S.tracks[st]; return {fx: JSON.stringify(tr.fx || tr.effects || null).slice(0, 300), vol: tr.vol, send: JSON.stringify(tr.send || tr.sends || null)}; }, s.st);
  console.log(JSON.stringify(fx));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
