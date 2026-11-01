import { open, OUT, SONG8 } from './lib.mjs';
const tag = process.env.TAG || 'live';
for (const [w, h] of [[428, 926], [926, 428]]) {
  const {b, p, errs} = await open({w, h, dpr: 2});
  await p.evaluate(s => SYNQUENZER.setSong(s), SONG8);
  await p.evaluate(() => SYNQUENZER.launchScene(0)); await p.waitForTimeout(2200);
  await p.screenshot({path: `${OUT}/${tag}-matrix-${w}x${h}.png`});
  await p.evaluate(() => SYNQUENZER.stopAllClips()); await p.waitForTimeout(600);
  await p.evaluate(() => setSongView(true)); await p.evaluate(() => SYNQUENZER.songPlay ? SYNQUENZER.songPlay() : songPlayToggle()); await p.waitForTimeout(2500);
  await p.screenshot({path: `${OUT}/${tag}-song-${w}x${h}.png`});
  console.log(w, h, errs);
  await b.close();
}
