import {open, KOPIE, BASIS} from '../takt/pruef/h.mjs';
for (const F of [BASIS, KOPIE]) {
const {b, p, errs} = await open(F, 428, 926);
const r = await p.evaluate(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms)), out = {};
  for (const ts of [null, '3/4']) {
    stop(); SYNQUENZER.loadDemo(); ensureAudio(); await wait(200); if (ts) setSongTs(ts, {quiet: true});
    R.selS = 0; launchScene(0); if (!R.playing) play();
    while (t2b(AU.ctx.currentTime) < 1.4) await wait(10);
    launchScene(1); await wait(50);
    const q1 = S.tracks.map((tr, t) => R.pend[t] ? R.pend[t].beat : null).filter(x => x != null);
    while (t2b(AU.ctx.currentTime) < 5.3) await wait(10);
    launchScene(0); await wait(50);
    const q2 = S.tracks.map((tr, t) => R.pend[t] ? R.pend[t].beat : null).filter(x => x != null);
    stop(); out[ts || '4/4'] = {q1: [...new Set(q1)], q2: [...new Set(q2)]};
  }
  return out;
});
console.log(F.includes('basis') ? 'BASIS' : 'KOPIE', JSON.stringify(r), errs); await b.close();
}
