const {chromium, sleep, open, setup, render} = require('./lib2.cjs');
const port = process.argv[2], wer = process.argv[3] || 'neu', post = +(process.argv[4] || 0), wait = +(process.argv[5] || 0);
(async () => {
  const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const {ctx, p, errs} = await open(b, port, wer, 428, 926);
  const s = await setup(p, {post});
  await sleep(wait);
  const H = [];
  for (let k = 0; k < 5; k++) { const r = await render(p, false); const x = await p.evaluate(k => { const y = __R[0]; let fd = -1; if (k) { const z = window.__Y0; for (let j = 0; j < y.length; j++) if (y[j] !== z[j]) { fd = j; break; } } window.__Y0 = y; return {fd, vp: VP.runs, g4: typeof G4 === 'object' ? G4.cache.size : null, pb: (() => { const a = S.tracks[stimmeT()].clips[0].audio, b = tkPlayBuf(a.take, a), raw = tkBuffer(a.take); return b === raw ? 'raw' : 'proc'; })()}; }, k); H.push(r.hash.slice(0, 8) + ' ' + JSON.stringify(x)); }
  console.log(wer, 'wait', wait); for (const h of H) console.log('  ', h);
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
