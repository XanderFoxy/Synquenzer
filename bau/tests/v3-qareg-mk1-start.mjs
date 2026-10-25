import { open, APP, BASE } from './v3-qareg-mk1-pw.mjs';
import fs from 'fs';
const OLD = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-old/';
const t = fs.readFileSync(OLD + 'v0a-project.json', 'utf8');
const N = +process.argv[2] || 4;
const VP = process.argv[3] === 'L1' ? {width: 844, height: 390} : {width: 390, height: 844};
for (const [n, f] of [['base', BASE], ['new', APP]]) {
  const {b, p, errs} = await open(VP, f);
  for (let i = 0; i < N; i++) {
    await p.evaluate((t) => { const Q = window.SYNQUENZER; Q.stop(); Q.importJSON(t); Q.setBpm(240); Q.clearLog(); Q.songPlay(0); }, t);
    await p.waitForFunction(() => window.SYNQUENZER.runtime().beat > 2.2, null, {polling: 20});
    const L = await p.evaluate(() => window.SYNQUENZER.noteLog(4000).filter(x => x.beat < 2).map(x => x.track + '@' + (x.beat == null ? 'null' : x.beat.toFixed(2)) + ':' + x.out));
    console.log(n, i, L.join(' '));
  }
  console.log(n, 'errs', errs); await b.close();
}
