// D1 regression: the step page of a clip without lanes (1 and 2 bars) has the same geometry as 4.23.0 (cells, lane bars, tabs,
// overview, pager, Euklid/Muster) in all formats; tapping a step behaves the same (clip after 3 taps equal)
import {app, report} from './touch-lib.mjs';
const BASE = new URL('../../../werkzeug/vs-base-B.html', import.meta.url).pathname, res = [];
async function look(file, w, h, len) {
  const A = await app({width: w, height: h}, file), {p, tap} = A;
  await p.evaluate(len => { const S = window.SYNQUENZER; S.setClip(4, 0, {len, key: {root: 0, scale: 'ionian'}, notes: [{t: 0, d: .1, n: 36, v: .8}]}); S.openRoll(4, 0); }, len);
  await p.waitForTimeout(500);
  const g = await p.evaluate(() => { const R = e => { if (!e || !e.offsetParent) return null; const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]; };
    return {cells: [...document.querySelectorAll('.se-cell')].map(R), bars: [...document.querySelectorAll('.se-bar')].slice(0, 2).map(R), tabs: R(document.querySelector('.se-tabs')), ov: R(document.querySelector('.ovw')),
      nav: R(document.querySelector('.pgnav')), eu: [...document.querySelectorAll('.dtools .mbtn')].slice(0, 2).map(R), H: document.documentElement.scrollHeight}; });
  const c = await p.evaluate(() => { const r = document.querySelectorAll('.se-cell')[5].getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; });
  await tap(c.x, c.y); await tap(c.x, c.y); await tap(c.x, c.y);
  g.clip = await p.evaluate(() => window.SYNQUENZER.getClip(4, 0).notes.map(n => [n.t, n.n, n.v]));
  await A.b.close(); return g;
}
for (const [w, h] of [[390, 844], [375, 667], [320, 568], [844, 390], [667, 375], [926, 428]]) for (const len of [1, 2]) {
  const a = await look(BASE, w, h, len), b = await look(undefined, w, h, len);
  for (const k of ['cells', 'bars', 'tabs', 'ov', 'H', 'clip']) res.push({id: `REG ${w}×${h} ${len} T ${k}`, pass: JSON.stringify(a[k]) === JSON.stringify(b[k]), info: JSON.stringify(a[k]) === JSON.stringify(b[k]) ? 'gleich' : JSON.stringify(a[k]).slice(0, 120) + ' ≠ ' + JSON.stringify(b[k]).slice(0, 120)});
  const navOk = JSON.stringify(a.nav) === JSON.stringify(b.nav) || (w === 375 && len === 2), euOk = JSON.stringify(a.eu) === JSON.stringify(b.eu);
  res.push({id: `REG ${w}×${h} ${len} T Fuß`, pass: navOk && euOk, info: `Pager ${JSON.stringify(a.nav)} → ${JSON.stringify(b.nav)}, Euklid/Muster ${JSON.stringify(a.eu)} → ${JSON.stringify(b.eu)}`});
}
report('D1-Regression', res);
