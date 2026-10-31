import { open, SONG8 } from './n5-v-lib.mjs';
import fs from 'fs'; import { execSync } from 'child_process';
const {b, p, errs} = await open();
for (const [fmt, view] of [['16:9', 'matrix'], ['9:16', 'song']]) {
  await p.evaluate(async ([s, fmt, view]) => { SYNQUENZER.setSong(s); SYNQUENZER.vvTest({opus: true}); await SYNQUENZER.vvMake({fmt, view, range: {a: 2, b: 6}}); }, [SONG8, fmt, view]);
  const bl = await p.evaluate(() => SYNQUENZER.vvBlob()); const f = `n5-v-out/shot-${view}.mp4`; fs.writeFileSync(f, Buffer.from(bl.b64, 'base64'));
  execSync(`ffmpeg -v error -y -ss 3.3 -i ${f} -frames:v 1 -vf scale=${fmt === '16:9' ? '960:-1' : '540:-1'} n5-v-out/shot-${view}.png`);
}
console.log(errs); await b.close();
