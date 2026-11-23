// PERF4: Klang erkennen – voller Zustand vorher/nachher (a, b, a), zum Vergleich ohne Zeitfelder. node ke1-test.cjs <port>
const {chromium} = require('playwright'); const port = process.argv[2], fs = require('fs');
async function run(br, dir) {
  const ctx = await br.newContext({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const pg = await ctx.newPage(), errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('http://127.0.0.1:' + port + '/' + dir + '/index.html', {waitUntil: 'load'});
  await pg.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.ke1 && typeof S !== 'undefined' && S.tracks, null, {timeout: 60000});
  await pg.waitForTimeout(1500);
  const st = await pg.evaluate(async () => { const sr = 48000, n = sr * 1.2, x = new Float32Array(n); let ph = 0;
    for (let i = 0; i < n; i++) { ph += 220 / sr; const env = Math.min(1, i / 480) * Math.exp(-i / (sr * 0.9)); x[i] = 0.5 * env * (2 * (ph % 1) - 1); }
    SYNQUENZER.ke1.open({pcm: x, sr, name: 'Probe'}); let st = null;
    for (let k = 0; k < 160; k++) { await new Promise(z => setTimeout(z, 250)); st = SYNQUENZER.ke1.state(); if (st && !st.busy && k > 20) break; }
    return JSON.stringify(st, null, 1); });
  fs.writeFileSync(__dirname + '/ke1-' + dir + '-' + Date.now() + '.json', st); await ctx.close(); return {st, errs};
}
(async () => { const br = await chromium.launch(); const a = await run(br, 'a'), b = await run(br, 'b'), a2 = await run(br, 'a'); await br.close();
  console.log(JSON.stringify({a: a.st.length, b: b.st.length, a2: a2.st.length, errs: [a.errs, b.errs, a2.errs]})); })();
