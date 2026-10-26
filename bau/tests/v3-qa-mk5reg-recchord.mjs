// QA MK5: ● recording of held chords on an MS 2000 track, arp off vs on (new) and base (arp off)
import { open, APP } from './v3-qa-mk5reg-pw.mjs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk5-base-4.12.0.html';
const waitBeat = (p, b, to = 30000) => p.waitForFunction(x => window.SYNQUENZER.runtime().beat > x, b, {timeout: to, polling: 5});
for (const [name, file, arp] of [['base', BASE, 0], ['new', APP, 0], ['new', APP, 1], ['base', BASE, 0], ['new', APP, 0], ['new', APP, 1]]) {
  const {b, p, errs} = await open({width: 390, height: 844}, file);
  await p.evaluate(async arp => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(120); Q.setEngine(3, 'mk'); await new Promise(r => setTimeout(r, 600)); if (arp) Q.mkSet(3, 'arp.on', 1);
    Q.setRecOptions({countIn: 1, length: 'auto', quantize: '1/16'}); Q.selectSlot(3, 0); Q.rec(); }, arp);
  await p.waitForFunction(() => window.SYNQUENZER.runtime().rec.state === 'recording', null, {timeout: 10000, polling: 10});
  const sb = await p.evaluate(() => window.SYNQUENZER.runtime().beat);
  const ch = [[60, 64, 67], [62, 65, 69], [64, 67, 71], [65, 69, 72]];
  for (let k = 0; k < 4; k++) { await waitBeat(p, Math.ceil(sb) + 2 * k - .01); await p.evaluate(ns => { for (const n of ns) window.SYNQUENZER.keyOn(n, .8, 'c' + n); }, ch[k]); await waitBeat(p, Math.ceil(sb) + 2 * k + 1.5); await p.evaluate(ns => { for (const n of ns) window.SYNQUENZER.keyOff(n, 'c' + n); }, ch[k]); }
  await waitBeat(p, Math.ceil(sb) + 8.3); await p.evaluate(() => window.SYNQUENZER.rec()); await p.waitForTimeout(3000);
  const clip = await p.evaluate(() => { const c = window.SYNQUENZER.getClip(3, 0); return c && {len: c.len, n: c.notes.map(x => x.n).join(','), t: c.notes.map(x => x.t).join(','), d: c.notes.map(x => x.d).join(',')}; });
  console.log(name, 'arp' + arp, JSON.stringify(clip), JSON.stringify(errs));
  await b.close();
}
