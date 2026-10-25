// song start: notes in the first 2 beats (demo, 240 BPM, song view open) — base vs new, 4 runs each
import { open, NEW, BASE } from './v3-qa-v2e2reg-pw.mjs';
for (let run = 0; run < 4; run++) for (const [name, file] of [['base', BASE], ['new', NEW]]) {
  const {b, p, errs} = await open({width: 390, height: 844}, file, true);
  await p.evaluate(async () => { const Q = window.SYNQUENZER; await Q.loadDemo(); Q.setBpm(240); Q.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}]); Q.songView(true); });
  await p.waitForTimeout(400);
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.clearLog(); Q.songPlay(0); });
  await p.waitForFunction(() => window.SYNQUENZER.runtime().beat > 2.2, null, {polling: 10});
  const L = await p.evaluate(() => window.SYNQUENZER.noteLog(400).filter(n => n.beat != null && n.beat >= 0 && n.beat < 2).map(n => n.track + '@' + n.beat.toFixed(2)).join(' '));
  console.log(run, name, L.split(' ').length, L);
  await b.close();
}
