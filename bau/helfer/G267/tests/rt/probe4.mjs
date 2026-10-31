import {launch, openG, sleep} from './h.mjs';
import {rec2Start, rec2Stop, lufs} from '../rec2.mjs';
const br = await launch(null), H = await openG(br), p = H.p;
await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); });
await p.evaluate(() => { SYNQUENZER.setClip(0, 0, {len: 2, notes: [55, 59, 62].map(n => ({t: 0, d: 4, n, v: .5}))}); SYNQUENZER.setClip(1, 0, {len: 2, notes: [{t: 0, d: 4, n: 43, v: .6}]}); });
for (const m of [false, true]) {
  await p.evaluate(m => { SYNQUENZER.setMute(0, m); SYNQUENZER.setMute(1, m); SYNQUENZER.launchScene(0); }, m);
  await rec2Start(p); await p.evaluate(() => SYNQUENZER.play()); await sleep(2000); await p.evaluate(() => SYNQUENZER.stop()); await sleep(300); const G = await rec2Stop(p);
  console.log('mute', m, 'sr', G.sr, 'LUFS', lufs(G.l, G.r, G.sr).toFixed(1), JSON.stringify(await p.evaluate(() => SYNQUENZER.project().tracks.slice(0, 2).map(t => t.mute))));
}
await br.close();
