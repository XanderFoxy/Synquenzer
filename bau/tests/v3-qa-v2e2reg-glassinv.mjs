// QA V2e′ regression angle: the ▦│◧ toggle (by touch) during ▶ SONG changes no data and no playback; project switch while ◧;
// song view in ◧ after loading the old DIRIGENT v2 file and the demo; console errors
import { open, NEW, OUT } from './v3-qa-v2e2reg-pw.mjs';
import fs from 'fs';
const res = {};
for (const [vp, w, h] of [['P1', 390, 844], ['L1', 844, 390], ['P3', 320, 568]]) {
  const r = {};
  for (const glass of [false, true]) {
    const {b, p, errs} = await open({width: w, height: h}, NEW, true);
    await p.evaluate(async () => { const Q = window.SYNQUENZER; await Q.loadDemo(); Q.setBpm(240); Q.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}, {scene: 0, bars: 2}]); Q.songView(true); });
    await p.waitForTimeout(400);
    const s0 = await p.evaluate(() => window.SYNQUENZER.serialize());
    await p.evaluate(() => { const Q = window.SYNQUENZER; Q.clearLog(); Q.songPlay(0); });
    const gl = await p.evaluate(() => { const e = document.querySelector('#songView .sv-gl'); const q = e.getBoundingClientRect(); return {x: q.left + q.width / 2, y: q.top + q.height / 2}; });
    if (glass) { await p.waitForTimeout(700); await p.touchscreen.tap(gl.x, gl.y); await p.waitForTimeout(1500); await p.touchscreen.tap(gl.x, gl.y); await p.waitForTimeout(400); await p.touchscreen.tap(gl.x, gl.y); }
    await p.waitForFunction(() => window.SYNQUENZER.runtime().beat > 23.5, null, {polling: 10, timeout: 30000});
    await p.evaluate(() => window.SYNQUENZER.stop()); await p.waitForTimeout(200);
    const k = glass ? 'glass' : 'plain';
    r[k + 'View'] = await p.evaluate(() => window.SYNQUENZER.svLayoutInfo().view);
    r[k + 'Log'] = await p.evaluate(() => window.SYNQUENZER.noteLog(4000).filter(n => n.beat != null && n.beat >= 0 && n.beat < 23.5).map(n => n.track + '@' + n.beat.toFixed(2) + ':' + n.out).sort().join(' '));
    r[k + 'Same'] = (await p.evaluate(() => window.SYNQUENZER.serialize())).replace(/"saved":\d+|"mt":\d+/g, '') === s0.replace(/"saved":\d+|"mt":\d+/g, '');
    if (glass) {
      await p.screenshot({path: OUT + `glassinv-${vp}.png`});
      // old DIRIGENT v2 file while ◧, then the demo
      const t = fs.readFileSync(OUT + 'dirigent-v2.json', 'utf8');
      r.v2 = await p.evaluate(async t => { const Q = window.SYNQUENZER; const ok = Q.importJSON(t); await new Promise(r => setTimeout(r, 400)); const I = Q.svLayoutInfo(); return {ok, view: I.view, rows: I.rows, song: !!Q.song()}; }, t);
      r.v2b = await p.evaluate(async () => { const Q = window.SYNQUENZER; Q.songFromChain([{scene: 0, bars: 2}]); await new Promise(r => setTimeout(r, 400)); const I = Q.svLayoutInfo(); return {view: I.view, tiles: (I.tiles || []).length, rows: I.rows}; });
      await p.screenshot({path: OUT + `glassinv-v2-${vp}.png`});
    }
    r[k + 'Errs'] = errs.slice(); r[k + 'te'] = await p.evaluate(() => window.SYNQUENZER.tickErrors());
    await b.close();
  }
  r.logEq = r.plainLog === r.glassLog;
  if (!r.logEq) { const A = r.plainLog.split(' '), B = r.glassLog.split(' '); r.miss = A.filter(x => !B.includes(x)).slice(0, 10); r.extra = B.filter(x => !A.includes(x)).slice(0, 10); }
  delete r.plainLog; delete r.glassLog;
  res[vp] = r;
}
console.log(JSON.stringify(res, null, 1));
