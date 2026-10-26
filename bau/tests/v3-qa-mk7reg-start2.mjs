// QA MK7 regression: FIRST launch after fresh page load (demo), repeated fresh pages, base vs new
import { open, APP } from './v3-qa-mk7reg-pw.mjs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk6-base-4.12.0.html';
const N = +(process.argv[2] || 5);
for (let i = 0; i < N; i++) for (const [name, file] of [['base', BASE], ['new', APP]]) {
  const {b, p, errs} = await open({width: 390, height: 844}, file);
  const t0 = Date.now();
  await p.evaluate(async () => { const Q = window.SYNQUENZER; await Q.loadDemo(); Q.setBpm(240); Q.clearLog(); Q.launchScene(0); });
  await p.waitForFunction(() => window.SYNQUENZER.runtime().beat > 2.2, null, {timeout: 20000, polling: 20});
  const L = await p.evaluate(() => window.SYNQUENZER.noteLog(4000).filter(n => n.beat != null && n.beat < 1.1).map(n => n.track + '@' + n.beat.toFixed(2) + ':' + n.out));
  const te = await p.evaluate(() => window.SYNQUENZER.tickErrors());
  console.log(i, name, 'drums', L.filter(x => x.startsWith('4@')).join(' '), '| all', L.length, 'te', te, errs.length ? JSON.stringify(errs) : '');
  await b.close();
}
