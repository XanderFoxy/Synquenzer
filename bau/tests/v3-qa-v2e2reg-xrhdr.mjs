// QA regression (V2d): landscape top bar — do BPM / ♩ / Q / LÄNGE / mic move when the FANG place toggles FANG ⇄ FANG TEIL in ♪ SPIELEN?
import { open, NEW as APP, BASE as BASE0 } from './v3-qa-v2e2reg-pw.mjs';
for (const [vp, w, h] of [['L1', 844, 390], ['L2', 667, 375]]) {
  const {b, p, errs} = await open({width: w, height: h}, APP, true);
  await p.evaluate(async () => { const Q = window.SYNQUENZER; await Q.loadDemo(); Q.setBpm(120); Q.launchScene(0); });
  const pos = () => p.evaluate(() => { const g = id => { const e = document.getElementById(id); const r = e.getBoundingClientRect(); return Math.round(r.left) + '/' + Math.round(r.width); }; return {fang: document.getElementById('bFangT').textContent, bFangT: g('bFangT'), bBpm: g('bBpm'), bMetro: g('bMetro'), chipQ: g('chipQ'), chipLen: g('chipLen'), bMicT: g('bMicT')}; });
  await p.waitForTimeout(2600); console.log(vp, 'after scene start     ', JSON.stringify(await pos()));
  await p.evaluate(() => window.SYNQUENZER.launchClip(1, 1)); await p.waitForTimeout(2600);
  console.log(vp, 'after a clip change   ', JSON.stringify(await pos()));
  await p.evaluate(() => window.SYNQUENZER.tap(64, 120)); await p.waitForTimeout(300);
  console.log(vp, 'after playing one note', JSON.stringify(await pos()));
  await p.waitForTimeout(8500);
  console.log(vp, '8.5 s later           ', JSON.stringify(await pos()), 'errs', errs.length);
  await b.close();
}
