const {chromium, sleep, open, setup, render} = require('./lib2.cjs');
const port = process.argv[2], wer = process.argv[3] || 'neu', post = +(process.argv[4] || 0);
(async () => {
  const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const {ctx, p, errs} = await open(b, port, wer, 428, 926);
  const s = await setup(p, {post});
  console.log('setup', JSON.stringify(s));
  const t0 = Date.now(); const r = await render(p, true); console.log('render', JSON.stringify(r), Date.now() - t0, 'ms');
  await p.evaluate(st => vx1rOpen({t: st, s: 0}), s.st);
  let k; for (k = 0; k < 120; k++) { await sleep(250); if (await p.evaluate(() => VX1E.clip && VX1E.clip.notes.length > 0)) break; }
  console.log('notes after', k * 250, 'ms', await p.evaluate(() => JSON.stringify(VX1E.clip.notes.map(n => [n.t, n.d, n.n]))));
  await p.evaluate(() => ED.roll.fitView('clip')); await sleep(600);
  await p.screenshot({path: __dirname + '/probe-' + wer + '.png'});
  console.log('errs', JSON.stringify(errs));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
