// TON2 lesen: seriell vs. Fenster vs. alle parallel (17 Stücke = 3 min). node lesen.js <port>
const {chromium} = require('playwright');
(async () => {
  const br = await chromium.launch(); const pg = await (await br.newContext()).newPage(); await pg.goto('http://127.0.0.1:' + process.argv[2] + '/index.html', {waitUntil: 'load'});
  await pg.waitForFunction(() => typeof S !== 'undefined' && S.tracks && S.tracks.length && typeof tkAddPcmTake === 'function', null, {timeout: 60000});
  await new Promise(r => setTimeout(r, 1500));
  const r = await pg.evaluate(async () => {
    const sr = 48000, n = 180 * sr, p = new Int16Array(n); for (let i = 0; i < n; i++) p[i] = Math.round(9000 * Math.sin(i / 7));
    const t = tkAddPcmTake(p, sr, 'import'); await t.stored; const ks = S.takes[t.id].chunks, out = {};
    const med = a => +a.sort((x, y) => x - y)[a.length >> 1].toFixed(1);
    const T = async (nm, f) => { const a = []; for (let k = 0; k < 7; k++) { const t0 = performance.now(); await f(); a.push(performance.now() - t0); } out[nm] = med(a); };
    await T('seriell', async () => { for (const k of ks) await kv.aget(k); });
    await T('w6', async () => { const g = ton2Pf(ks); for (const k of ks) await g(k); });
    await T('alle', () => Promise.all(ks.map(k => kv.aget(k))));
    await T('seriell2', async () => { for (const k of ks) await kv.aget(k); });
    return out;
  });
  console.log(JSON.stringify(r)); await br.close();
})();
