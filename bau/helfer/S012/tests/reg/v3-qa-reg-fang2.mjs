// QA regression (V2d): classic FANG in SPIELEN — label right after FANG and a second tap shortly after
import { open, APP } from './v3-v2d-pw.mjs';
import {BASE} from './v3-v2d-pw.mjs';
const waitBeat = (p, b, to = 30000) => p.waitForFunction(x => window.SYNQUENZER.runtime().beat > x, b, {timeout: to, polling: 20});
for (const [name, file] of [['base', BASE], ['new', APP]]) {
  const {b, p, errs} = await open({width: 390, height: 844}, file);
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(120); const K = {root: 9, scale: 'aeolian'};
    Q.setClip(4, 0, {len: 1, key: K, notes: [{t: 0, d: .1, n: 36, v: .9}, {t: 2, d: .1, n: 38, v: .9}]});
    Q.setClip(0, 0, {len: 1, key: K, notes: [{t: 0, d: .5, n: 45, v: .8}]});
    Q.selectSlot(3, 0); Q.launchScene(0); });
  await waitBeat(p, 3.9);
  const ns = [72, 74, 76, 79];
  for (let k = 0; k < 4; k++) { await waitBeat(p, 4 + k - .03); await p.evaluate(n => window.SYNQUENZER.tap(n, 150), ns[k]); }
  await waitBeat(p, 8.2);
  const lab = () => p.evaluate(() => { const b = document.getElementById('bFang'); const r = window.SYNQUENZER.runtime(); return b.textContent + ' | mode=' + (r.fangMode || '-') + ' lit=' + r.fang + ' part=' + JSON.stringify(r.part) + ' sheet=' + !!document.querySelector('.pop.fsheet'); });
  console.log(name, 'before FANG     :', await lab());
  await p.click('#bFang');
  await p.waitForTimeout(100);
  console.log(name, 'right after FANG:', await lab(), 'clip30', JSON.stringify((await p.evaluate(() => window.SYNQUENZER.getClip(3, 0))) ? 'yes' : 'no'));
  await waitBeat(p, 12.3); console.log(name, 'beat 12.3 (FANG clip started, ~2 s after last note):', await lab());
  // second tap 0.7 s after the first (e.g. a double tap or "did it work?")
  { const r = await p.evaluate(() => { const q = document.getElementById('bFang').getBoundingClientRect(); return {x: q.left + q.width / 2, y: q.top + q.height / 2, vis: getComputedStyle(document.getElementById('bFang')).visibility}; });
    console.log(name, 'FANG button visibility before 2nd tap:', r.vis); await p.mouse.click(r.x, r.y); }
  await p.waitForTimeout(300);
  const st = await p.evaluate(() => { const Q = window.SYNQUENZER, r = Q.runtime(); return {clips3: [0, 1, 2, 3].map(s => !!Q.getClip(3, s)), part: r.part, row: r.row, sheet: !!document.querySelector('.pop.fsheet'), toast: [...document.querySelectorAll('.toast, #toast')].map(x => x.textContent).join(' / ')}; });
  console.log(name, 'after 2nd tap   :', await lab(), JSON.stringify(st));
  await waitBeat(p, 20.5);
  const sl = await p.evaluate(() => ({slots: window.SYNQUENZER.runtime().slots, part: window.SYNQUENZER.runtime().part}));
  console.log(name, 'two bars later  :', JSON.stringify(sl), 'errs', JSON.stringify(errs));
  await b.close();
}
