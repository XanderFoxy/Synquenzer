import {launch, open, sleep} from './gmk8b-h.mjs';
const br = await launch(false);
for (const fmt of ['P3', 'P2', 'P1']) {
  const {ctx, page} = await open(br, {fmt});
  await page.evaluate(async () => { await SYNQUENZER.libraryReady(); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); mkLoad(); await MKK.decodeAll(); SYNQUENZER.openBrowser(0); });
  await sleep(300);
  const r = await page.evaluate(async () => { let n = 0, tot = 0; const ex = [];
    for (let g = 1; g <= 8; g++) { BR.kp = g; brRefresh(); await new Promise(r => setTimeout(r, 30));
      for (const t of document.querySelectorAll('#sndSheet .brow .bmain span')) { tot++; if (t.scrollWidth > t.clientWidth + 1) { n++; if (ex.length < 3) ex.push(t.textContent + ' shown ' + t.clientWidth + '/' + t.scrollWidth + ' px'); } } }
    return {n, tot, ex}; });
  console.log(fmt, 'truncated sub-labels', r.n + '/' + r.tot, JSON.stringify(r.ex));
  await ctx.close();
}
await br.close();
