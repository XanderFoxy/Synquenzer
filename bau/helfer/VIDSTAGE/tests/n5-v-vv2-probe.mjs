import { open, SONG8 } from './n5-v-lib.mjs';
import fs from 'fs';
const {b, p, errs} = await open();
await p.evaluate(s => SYNQUENZER.setSong(s), SONG8);
const r = await p.evaluate(() => {
  const o = {};
  o.cuts0 = SYNQUENZER.vvCuts();
  o.set1 = SYNQUENZER.vvDirSet(4, 8, 'matrix');
  o.set2 = SYNQUENZER.vvDirSet(5, 7, 'spur', 2);
  o.dir = SYNQUENZER.vvDirGet();
  o.cuts1 = SYNQUENZER.vvCuts();
  setSongView(true);
  return o;
});
console.log(JSON.stringify(r));
await p.waitForTimeout(500);
await p.screenshot({path: 'n5-v-out/vv2-songview.png'});
// stills of the stage
await p.evaluate(() => { SYNQUENZER.vvOpen(); });
await p.waitForTimeout(400);
await p.screenshot({path: 'n5-v-out/vv2-sheet.png'});
console.log('errors', errs);
await b.close();
