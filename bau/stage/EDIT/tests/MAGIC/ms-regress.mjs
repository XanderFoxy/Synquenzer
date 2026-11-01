// MAGIC Regression: alte Werkzeuge des Noten-Editors (✎ tippen/ziehen, verschieben, ⌫ wischen, Lineal-Takt tippen, Lineal ziehen, Aktionen) – 4.26.1 gegen MAGIC gleich
import { open, roll, swipe, line, xy, clip, ok, done, APP } from './lib.mjs';
import path from 'path';
const BASE = path.resolve(path.dirname(APP), '..', '..', 'snapshots', 'R-4270.html');
const out = {};
for (const [name, file] of [['base', BASE], ['new', APP]]) for (const vp of [{width: 428, height: 926}, {width: 926, height: 428}]) {
  const {b, p, errs} = await open(vp, file); const r = [];
  await roll(p, {root: 0, scale: 'ionian'}, [{t: 0, d: .5, n: 60, v: .8}, {t: 1, d: .5, n: 64, v: .8}]);
  await p.evaluate(() => window.SYNQUENZER.rollApi().centerOn(64));
  let q = await xy(p, 2.1, 65); await p.touchscreen.tap(q.x, q.y); await p.waitForTimeout(60); r.push((await clip(p)).notes.map(n => n.n + '@' + n.t + '/' + n.d).join(' '));
  await swipe(p, line(await xy(p, 3.05, 62), await xy(p, 3.9, 63), 8)); r.push((await clip(p)).notes.map(n => n.n + '@' + n.t + '/' + n.d).join(' '));
  await swipe(p, line(await xy(p, 1.1, 64), await xy(p, 1.6, 66), 8)); r.push((await clip(p)).notes.map(n => n.n + '@' + n.t + '/' + n.d).join(' '));
  await p.evaluate(() => window.SYNQUENZER.rollApi().setTool('erase'));
  await swipe(p, line(await xy(p, .1, 60), await xy(p, .3, 60), 6)); r.push((await clip(p)).notes.map(n => n.n + '@' + n.t + '/' + n.d).join(' '));
  q = await p.evaluate(() => window.SYNQUENZER.rollApi()._barNum(0)); await p.touchscreen.tap(q.x, q.y); await p.waitForTimeout(60); r.push(JSON.stringify(await p.evaluate(() => window.SYNQUENZER.rollApi().state.loop)));
  const x0 = await p.evaluate(() => window.SYNQUENZER.rollApi().state.view.x0); const r0 = await p.evaluate(() => window.SYNQUENZER.rollApi()._ruler(2));
  await swipe(p, line(r0, {x: r0.x - 80, y: r0.y}, 8)); r.push(String((await p.evaluate(() => window.SYNQUENZER.rollApi().state.view.x0)) !== x0));
  for (let i = 0; i < 4; i++) await p.evaluate(() => window.SYNQUENZER.undo()); r.push((await clip(p)).notes.map(n => n.n + '@' + n.t + '/' + n.d).join(' '));
  r.push(String(errs.length));
  out[name + vp.width] = r; await b.close();
}
for (const w of [428, 926]) { const A = out['base' + w], B = out['new' + w];
  console.log(w, JSON.stringify(B));
  ok(JSON.stringify(A) === JSON.stringify(B), w + ': alte Werkzeuge verhalten sich gleich wie 4.26.1' + (JSON.stringify(A) === JSON.stringify(B) ? '' : ' base ' + JSON.stringify(A))); }
done();
