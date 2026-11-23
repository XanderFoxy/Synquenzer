const {chromium, sleep, open, setup, render} = require('./lib.cjs');
const port = process.argv[2], wer = process.argv[3] || 'neu';
(async () => {
  const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const {ctx, p, errs} = await open(b, port, wer, 428, 926);
  const s = await setup(p);
  const H = [];
  for (let k = 0; k < 3; k++) { await render(p); H.push(await p.evaluate(k => { const y = __R[0]; window['__Y' + k] = y; let fd = -1; if (k) { const z = window['__Y0']; for (let j = 0; j < y.length; j++) if (y[j] !== z[j]) { fd = j; break; } } const u = new Uint32Array(y.buffer); let h = 2166136261; for (let i = 0; i < u.length; i++) { h ^= u[i]; h = Math.imul(h, 16777619) >>> 0; } return h.toString(16) + ' fd=' + fd + ' vp=' + JSON.stringify(VP.runs) ; }, k)); }
  console.log(wer, JSON.stringify(H));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
