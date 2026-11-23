// Sicht-Probe: node sicht.cjs <port> <w> <h> <pre> <post> <name>
const {chromium, sleep, open, setupX, openEdUI, geo} = require('./xlib.cjs');
const [port, w, h, pre, post, name] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const {ctx, p, errs, T} = await open(b, port, 'neu', +w, +h);
  const s = await setupX(p, {pre: +pre, post: +post});
  const q = await openEdUI(p, T, s.st);
  await p.screenshot({path: __dirname + '/' + name + '.png'});
  console.log(JSON.stringify({s, q, g: await geo(p), errs}, null, 0));
  await ctx.close(); await b.close();
})().catch(e => { console.error(e); process.exit(1); });
