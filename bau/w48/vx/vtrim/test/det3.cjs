const {chromium, sleep, open, setup, render} = require('./lib2.cjs');
const port = process.argv[2], wer = process.argv[3] || 'neu';
(async () => {
  const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const {ctx, p, errs} = await open(b, port, wer, 428, 926);
  const s = await setup(p, {});
  await p.evaluate(() => { const o0 = tkStartSrc; window.__cap = []; tkStartSrc = function (o) { const r = o0.apply(this, arguments); if (window.__cap) __cap.push([o.when, o.off, o.end, o.fi, o.fo, o.gain, !!o.ctx, r ? [r.start, r.end, r.off, !!r.lim] : null].map(v => typeof v === 'number' ? +v.toFixed(7) : v)); return r; }; });
  for (let k = 0; k < 4; k++) { await p.evaluate(() => { __cap = []; }); const r = await render(p, false); const c = await p.evaluate(() => JSON.stringify(__cap)); console.log(r.hash.slice(0, 8), c); }
  // Knoten im Master-Weg
  console.log(await p.evaluate(() => JSON.stringify({wk: typeof wkReady === 'function' ? wkReady() : null, vp: Object.keys(VP).slice(0, 20)})));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
