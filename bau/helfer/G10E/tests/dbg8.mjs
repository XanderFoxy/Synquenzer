import {launch, open, take, sleep, geom, openEd, drag, tap, touch, pinch} from './h.mjs';
const br = await launch();
const steps = process.argv.slice(2);
const H = await open(br), p = H.p, c = H.cdp;
const T = Array.from({length: 12}, (_, k) => 0.5 + k * 0.3);
const {id, ref} = await take(p, T); await openEd(p, ref, id);
const g = await geom(p);
for (const s of steps) {
  if (s === 'pinch') await pinch(c, g.x + 200, g.y + 80, 60, 240, 12);
  if (s === 'k2') { const x = g.marks[3]; await touch(c, 'touchStart', [[x, g.y + 10]]); for (let k = 1; k <= 5; k++) await touch(c, 'touchMove', [[x + k * 4, g.y + 10]]); await touch(c, 'touchStart', [[x + 20, g.y + 10], [g.x + 40, g.y + g.h - 10]]); await touch(c, 'touchMove', [[x + 30, g.y + 10], [g.x + 60, g.y + g.h - 10]]); await touch(c, 'touchEnd', []); }
  if (s === 'hold') await tap(c, g.x + 30, g.y + 12, 560);
  if (s === 'tap') await tap(c, g.x + 30, g.y + 80);
  if (s === 'out') { await tap(c, 200, 190); await sleep(250); await openEd(p, ref, id); }
  if (s === 'ps') await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); });
  if (s === 'zb') { const zb = await p.evaluate(() => { const r = document.querySelector('#wpSheet .wpz').getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}; }); await tap(c, zb.x, zb.y); }
  if (s === 'plus') { const zb = await p.evaluate(() => { const r = document.querySelector('#wpSheet .g10add').getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}; }); await tap(c, zb.x, zb.y); await sleep(100); await tap(c, g.x + 50, g.y + 80); }
  if (s === 'undo') await p.evaluate(() => SYNQUENZER.undo());
  await sleep(200);
}
const hd = await p.evaluate(() => { const r = document.querySelector('#wpSheet .qh b').getBoundingClientRect(); return {x: r.x + 30, y: r.y + r.height / 2}; });
console.log(await p.evaluate(h => { const e = document.elementFromPoint(h.x, h.y); const t = document.getElementById('toast'); return e.tagName + '.' + e.className + ' toast:' + t.className + ' ' + JSON.stringify(t.getBoundingClientRect()) + ' ' + t.textContent; }, hd));
await drag(c, hd.x, hd.y, hd.x + 5, hd.y + 120, 8, 10); await sleep(200);
console.log(steps.join(','), 'zu:', !(await p.evaluate(() => SYNQUENZER.wpInfo().editor)));
await br.close();
