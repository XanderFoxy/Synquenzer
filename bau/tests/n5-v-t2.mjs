import { open, SONG8 } from './n5-v-lib.mjs';
import fs from 'fs';
const {b, p, errs} = await open();
for (const fmt of ['16:9', '9:16']) {
  const r = await p.evaluate(async ([song, fmt]) => {
    const A = SYNQUENZER; A.setSong(song); A.vvTest({opus: true});
    const path = await A.vvPath(fmt);
    const t = performance.now();
    const m = await A.vvMake({fmt, view: fmt === '16:9' ? 'song' : 'matrix'});
    const bl = await A.vvBlob();
    return {path, m, b64: bl.b64, ms: performance.now() - t};
  }, [SONG8, fmt]);
  const f = 'n5-v-out/t2-' + fmt.replace(':', 'x') + '.' + r.m.ext;
  fs.writeFileSync(f, Buffer.from(r.b64, 'base64'));
  delete r.b64; console.log(JSON.stringify(r)); console.log(f);
}
console.log('errors', errs);
await b.close();
