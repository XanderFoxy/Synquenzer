const {chromium} = require('playwright');
const port = process.argv[2] || '8851', URL = 'http://127.0.0.1:' + port + '/index.html';
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const br = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const ctx = await br.newContext({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true});
  const pg = await ctx.newPage();
  await pg.goto(URL); await pg.waitForFunction(() => typeof tkAddPcmTake === 'function' && S.tracks.length, null, {timeout: 60000}); await sleep(1500);
  const r = await pg.evaluate(async () => {
    const sr = 48000, n = 180 * sr, p = new Int16Array(n); for (let i = 0; i < n; i++) p[i] = Math.round(8000 * Math.sin(2 * Math.PI * 220 * i / sr));
    const t = tkAddPcmTake(p, sr, 'import'); await t.stored; const id = t.id; const o = {chunks: S.takes[id].chunks.length};
    let a = performance.now(); const pcm = await tkPcm(id); o.pcm = Math.round(performance.now() - a);
    a = performance.now(); await Promise.all(S.takes[id].chunks.map(k => kv.aget(k))); o.par = Math.round(performance.now() - a);
    a = performance.now(); const b = tkToBuffer(pcm, sr); o.buf = Math.round(performance.now() - a);
    a = performance.now(); vpReady(b, true); o.vp = Math.round(performance.now() - a);
    a = performance.now(); await kv.aget(S.takes[id].chunks[0]); o.one = Math.round(performance.now() - a);
    return o;
  });
  console.log(JSON.stringify(r)); await br.close();
})();
