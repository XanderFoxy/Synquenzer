// CHR6 Rauchtest: node rauch.js <port>  (Server-Ordner srv/ mit index.html + version.json)
const {chromium} = require('playwright');
const port = process.argv[2], URL = 'http://127.0.0.1:' + port + '/index.html';
const errs = [], res = {};
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const br = await chromium.launch();
  const ctx = await br.newContext({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const pg = await ctx.newPage();
  pg.on('pageerror', e => errs.push('pageerror ' + e.message));
  pg.on('console', m => { if (m.type() === 'error') errs.push('console.error ' + m.text()); });
  pg.on('response', r => { if (r.status() >= 400 && !/medien\/abspann-logo\./.test(r.url())) errs.push('http ' + r.status() + ' ' + r.url()); });
  const t0 = Date.now();
  await pg.goto(URL, {waitUntil: 'load'});
  await pg.waitForFunction(() => typeof S !== 'undefined' && S.tracks && S.tracks.length, null, {timeout: 60000});
  res.bereitMs = Date.now() - t0; await sleep(1500);
  res.VERSION = await pg.evaluate(() => VERSION);
  // Chor-Kern im Seiten-Kontext und als Worker-Quelltext (g6pDspMake.toString) einmal rechnen
  res.chor = await pg.evaluate(async () => {
    const SR = 48000, n = SR, f0 = 196, x = new Float32Array(n);
    for (let i = 0; i < n; i++) { let s = 0; for (let h = 1; h < 30; h++) s += Math.cos(2 * Math.PI * h * f0 * i / SR) / h; x[i] = 0.1 * s * Math.min(1, i / 960, (n - 1 - i) / 960); }
    const nf = 100, an = {sr: SR, hop: 0.01, n: nf, f0: new Float32Array(nf).fill(f0), ap: new Float32Array(nf)};
    const D = g6pDspMake(), have = D.modelRuns(x, SR, an, 0, n, new Map());
    const runs = [...have.values()].map(R => [R.i0, R.i1]);
    const r = D.renderMulti(x, SR, an, i0 => have.get(i0), [{c: new Float64Array(nf).fill(-700), runs, x: null}, {c: new Float64Array(nf).fill(400), runs, x: {ms: 0, f: 1.035, d: 5, s: 1, r: 0.3, c: 0.12}}], 0, n);
    let ok = true; for (const y of r.ys) for (let i = 0; i < y.length; i++) if (!isFinite(y[i])) { ok = false; break; }
    const src = g6pDspMake.toString() + '\nconst D=g6pDspMake();onmessage=e=>{postMessage(typeof D.renderMulti)}';
    const w = new Worker(URL.createObjectURL(new Blob([src], {type: 'text/javascript'})));
    const wt = await new Promise(res => { w.onmessage = e => res(e.data); w.onerror = e => res('fehler ' + e.message); w.postMessage(1); });
    w.terminate();
    return {segs: r.segs, endlich: ok, worker: wt, hatChr6: /chr6Lm/.test(g6pDspMake.toString())};
  });
  await pg.screenshot({path: __dirname + '/rauch.png'});
  res.errs = errs; await br.close();
  console.log(JSON.stringify(res));
})().catch(e => { console.log('FEHLER', e && e.stack || e, JSON.stringify(res), errs); process.exit(1); });
