import { open, APP } from './v3-v2d-pw.mjs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-v2ereg/base-v2d2fix.html';
for (const [vp, w, h] of [['P1', 390, 844], ['P2', 375, 667], ['P3', 320, 568], ['L1', 844, 390], ['L2', 667, 375], ['W', 844, 1180]]) for (const [name, file] of [['base', BASE], ['new', APP]]) {
  const {b, p, errs} = await open({width: w, height: h}, file, true);
  const r = await p.evaluate(async () => { const Q = window.SYNQUENZER; await Q.loadDemo(); Q.setBpm(240); Q.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}]);
    const out = {}; for (const t of [5, 0, 3]) { Q.setMelodyTrack(t); Q.songView(true); await new Promise(r => setTimeout(r, 300));
      const s = document.querySelector('#songView .sv-lm small'); out[t] = s.textContent + ' ' + s.scrollWidth + '/' + s.clientWidth + (s.scrollWidth > s.clientWidth + 1 ? ' CUT' : ''); } return out; });
  console.log(vp, name, JSON.stringify(r), errs.length);
  await b.close();
}
