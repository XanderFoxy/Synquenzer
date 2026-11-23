// TON2 zeit: Kosten der Teilschritte (Lesen seriell/parallel, Puffer, Analyse rechnen vs. gemerkt übernehmen). node zeit.js <port> [amp]
const {chromium} = require('playwright');
const port = process.argv[2], AMP = +(process.argv[3] || 12000);
(async () => {
  const br = await chromium.launch(); const ctx = await br.newContext({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true});
  const pg = await ctx.newPage(); await pg.goto('http://127.0.0.1:' + port + '/index.html', {waitUntil: 'load'});
  await pg.waitForFunction(() => typeof S !== 'undefined' && S.tracks && S.tracks.length && typeof tkAddPcmTake === 'function', null, {timeout: 60000});
  await new Promise(r => setTimeout(r, 1500));
  const r = await pg.evaluate(async amp => {
    const sr = 48000, n = 180 * sr, p = new Int16Array(n); for (let i = 0; i < n; i++) p[i] = Math.round(amp * Math.sin(2 * Math.PI * 220 * i / sr));
    const t = tkAddPcmTake(p, sr, 'import'); await t.stored; await VP_API.vpWait(); for (let k = 0; k < 40 && !TON2.save; k++) await new Promise(r => setTimeout(r, 50));
    const id = t.id, m = S.takes[id], out = {};
    const med = a => a.sort((x, y) => x - y)[a.length >> 1];
    const T = async f => { const a = []; for (let k = 0; k < 5; k++) { const t0 = performance.now(); await f(); a.push(performance.now() - t0); } return +med(a).toFixed(1); };
    out.lesenSeriell = await T(async () => { for (const k of m.chunks) await kv.aget(k); });
    out.lesenParallel = await T(() => tkPcm(id));
    let pcm = await tkPcm(id), b;
    out.puffer = await T(() => { b = tkToBuffer(pcm, sr); });
    out.analyse = await T(() => { const J = vpJob(b); vpStep(J, Infinity); });
    out.gemerktLesen = await T(() => ton2Read(id));
    const c = await ton2Read(id);
    out.gemerktUebernehmen = await T(() => { const bb = tkToBuffer(pcm, sr); TON2.got.set(id, c); const t0 = performance.now(); ton2Use(id, bb); return performance.now() - t0; });
    out.hit = TON2.hit; out.segs = c.segs.length; out.bytes = (await kv.aget(id + ':lv1')).byteLength;
    return out;
  }, AMP);
  console.log(JSON.stringify(r)); await br.close();
})();
