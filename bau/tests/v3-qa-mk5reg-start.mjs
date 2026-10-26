// QA MK5 regression: are notes at the start of playback lost? repeated runs base vs new
import { open, APP } from './v3-qa-mk5reg-pw.mjs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk5-base-4.12.0.html';
const N = +process.argv[2] || 4;
const mode = process.argv[3] || 'demo';
const waitBeat = (p, b, to = 30000) => p.waitForFunction(x => window.SYNQUENZER.runtime().beat > x, b, {timeout: to, polling: 20});
for (const [name, file] of [['base', BASE], ['new', APP], ['base', BASE], ['new', APP]]) {
  const out = [];
  for (let i = 0; i < N; i++) {
    const {b, p, errs} = await open({width: 390, height: 844}, file);
    if (mode === 'demo') await p.evaluate(async () => { const Q = window.SYNQUENZER; await Q.loadDemo(); Q.setBpm(240); Q.clearLog(); Q.launchScene(0); });
    else await p.evaluate(() => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(240); const K = {root: 9, scale: 'aeolian'};
      Q.setClip(4, 0, {len: 1, key: K, notes: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5].map(t => ({t, d: .1, n: t % 1 ? 42 : 36, v: .9}))});
      Q.setClip(0, 0, {len: 1, key: K, notes: [0, 1, 2, 3].map(t => ({t, d: .4, n: 57 + t, v: .8}))}); Q.clearLog(); Q.launchScene(0); });
    await waitBeat(p, 8.2);
    const L = await p.evaluate(() => window.SYNQUENZER.noteLog(4000).filter(n => n.beat != null && n.beat >= 0 && n.beat < 8));
    const miss = L.length;
    const first = L.filter(n => n.beat < 2).map(n => n.track + '@' + n.beat.toFixed(2) + ':' + n.out).sort().join(' ');
    out.push(miss + ' | ' + first + (errs.length ? ' ERR ' + errs.join(';') : ''));
    await b.close();
  }
  console.log(name, '\n  ' + out.join('\n  '));
}
