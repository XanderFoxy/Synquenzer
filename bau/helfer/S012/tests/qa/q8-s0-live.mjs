// S0: DR aus at M3 while the song plays (before it reaches T5) → silent there in this very pass; Toast-Rückgängig while playing
import {launch, open, sleep, tally} from '../h.mjs';
import {songABA} from '../lib.mjs';
const ok = tally(); const br = await launch();
{
  const H = await open(br), p = H.p; await songABA(p);
  await p.evaluate(() => SYNQUENZER.songView(true)); await sleep(200);
  await p.evaluate(() => { SYNQUENZER.clearLog(); SYNQUENZER.songPlay(0); });
  await p.waitForFunction(() => R.songPlay && R.playing);
  const b0 = await p.evaluate(() => R.songPlay.off);
  await p.waitForFunction(b0 => audBeat() > b0 + 5, b0);
  await p.evaluate(() => SYNQUENZER.markEdit('M3')); await sleep(150);
  await p.tap('.msheet .s0-c[data-t="4"]'); await sleep(100);
  await p.waitForFunction(b0 => audBeat() > b0 + 24.2, b0, {timeout: 20000});
  const log = await p.evaluate(() => SYNQUENZER.noteLog(4096));
  const dr = log.filter(e => e.track === 4 && e.beat != null).map(e => +(e.beat - b0).toFixed(2));
  const inM3 = dr.filter(b => b >= 16 && b < 24);
  ok(dr.some(b => b < 16) && !inM3.length, 'live: DR aus in T5–6 während der Song läuft → dort still ' + JSON.stringify(inM3));
  ok(!H.errs.length, 'keine Fehler ' + JSON.stringify(H.errs.slice(0, 2)));
  await p.evaluate(() => SYNQUENZER.stop());
  await H.ctx.close();
}
await br.close(); process.exit(ok.done() ? 1 : 0);
