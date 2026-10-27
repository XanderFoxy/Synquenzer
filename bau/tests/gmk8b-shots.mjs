// G-MK8b-merge: screenshots of the library (Micro, HIPHOP/VINTAGE and VOCODER tab) in P1 P3 L1
import {launch, open, sleep, DIR} from './gmk8b-h.mjs';
const br = await launch(false);
for (const fmt of ['P1', 'P3', 'L1']) {
  const {ctx, page} = await open(br, {fmt});
  await page.evaluate(async () => { await SYNQUENZER.libraryReady(); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); mkLoad(); await MKK.decodeAll(); SYNQUENZER.openBrowser(0); });
  for (const g of [5, 8]) { await page.evaluate(g => { BR.kp = g; brRefresh(); }, g); await sleep(250); await page.screenshot({path: DIR + '/lib-' + fmt + '-g' + g + '.png'}); }
  await ctx.close();
}
await br.close();
