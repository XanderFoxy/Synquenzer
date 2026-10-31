// QA musiker VV1: the realistic song as 16:9 Song and 9:16 Matrix video; frames for a look
import { open, buildSong, OUTQ } from './n5-v-qm-lib.mjs';
import fs from 'fs';
const {b, p, errs} = await open({touch: true});
await buildSong(p);
await p.evaluate(() => SYNQUENZER.vvTest({opus: true}));
for (const [fmt, view] of [['16:9', 'song'], ['9:16', 'matrix'], ['16:9', 'matrix']]) {
  const x = await p.evaluate(async ([fmt, view]) => SYNQUENZER.vvMake({fmt, view}), [fmt, view]);
  const bl = await p.evaluate(() => SYNQUENZER.vvBlob()); const f = OUTQ + 'look-' + view + '-' + fmt.replace(':', 'x') + '.mp4'; fs.writeFileSync(f, Buffer.from(bl.b64, 'base64'));
  console.log(fmt, view, x.how, x.dur.toFixed(2), f);
}
console.log('errors', errs);
await b.close();
