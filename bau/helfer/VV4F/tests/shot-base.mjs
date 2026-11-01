import { open, OUT, SONG8 } from './lib.mjs';
const tag = process.env.TAG || 'basis';
for (const [w, h] of [[428, 926], [926, 428]]) {
  const {b, p, errs} = await open({w, h});
  await p.screenshot({path: `${OUT}/${tag}-matrix-${w}x${h}.png`});
  await p.evaluate(s => { SYNQUENZER.setSong(s); }, SONG8);
  await p.evaluate(() => setSongView(true)); await p.waitForTimeout(500);
  await p.screenshot({path: `${OUT}/${tag}-song-${w}x${h}.png`});
  console.log(w, h, errs);
  await b.close();
}
