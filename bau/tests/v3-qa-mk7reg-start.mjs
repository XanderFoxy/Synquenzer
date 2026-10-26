// QA MK7 regression: first beat of demo / v2 file after launch, repeated, base vs new
import { open, APP } from './v3-qa-mk7reg-pw.mjs';
import fs from 'fs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk6-base-4.12.0.html';
const V2 = fs.readFileSync('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-vs2reg/dirigent-v2.json', 'utf8');
const N = +(process.argv[2] || 4);
for (const [name, file] of [['base', BASE], ['new', APP]]) {
  const {b, p, errs} = await open({width: 390, height: 844}, file);
  const out = [];
  for (let i = 0; i < N; i++) {
    for (const what of ['demo', 'v2']) {
      await p.evaluate(async ([what, V2]) => { const Q = window.SYNQUENZER; Q.stop(); if (what === 'demo') await Q.loadDemo(); else Q.importJSON(V2); await new Promise(r => setTimeout(r, 300)); Q.setBpm(240); Q.clearLog(); Q.launchScene(0); }, [what, V2]);
      await p.waitForFunction(() => window.SYNQUENZER.runtime().beat > 2.2, null, {timeout: 20000, polling: 20});
      const L = await p.evaluate(() => window.SYNQUENZER.noteLog(4000).filter(n => n.track === 4 && n.beat != null && n.beat < 1.1).map(n => n.beat.toFixed(2) + ':' + n.out + (n.src ? '/' + n.src : '')));
      out.push(what + ' ' + L.join(' '));
    }
  }
  console.log(name, '\n ' + out.join('\n '), '\n errs', JSON.stringify(errs));
  await b.close();
}
