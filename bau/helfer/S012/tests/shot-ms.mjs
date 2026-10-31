// Bilder: Marken-Blatt mit [Bearbeiten] [Zusammenfassen] in allen Formaten
import {launch, open, sleep, OUT} from './h.mjs';
import {songABA} from './lib.mjs';
const br = await launch(); const H = await open(br), p = H.p; await songABA(p); await p.evaluate(() => SYNQUENZER.songView(true));
for (const [nm, w, h] of [['P1', 390, 844], ['P3', 320, 568], ['L2', 667, 375], ['W', 926, 428]]) {
  await p.evaluate(() => { if (UI.pop) closePop(); }); await p.setViewportSize({width: w, height: h}); await sleep(300);
  await p.evaluate(() => SYNQUENZER.openMarkSheet('M3')); await sleep(200);
  await p.screenshot({path: OUT + `/ms-${nm}.png`});
}
await br.close();
