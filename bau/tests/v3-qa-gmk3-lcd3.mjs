import {open, sleep, OUT} from './v3-qa-gmk3-tl.mjs';
for (const [tag, vp] of [['P1', {width: 390, height: 844}], ['P2', {width: 375, height: 812}], ['L1', {width: 844, height: 390}]]) {
  const T = await open({viewport: vp}); const {p, E} = T;
  await E(() => { const Q = SYNQUENZER; Q.setEngine(0, 'mk'); Q.mkSet(0, 'mode', 2); });
  await T.openEd(0);
  const pn0 = await T.panel(); if (pn0 && pn0.half === 'A') { await T.tapTxt('button, .tab', /^RECHTS$/); await sleep(300); }
  await T.w('w1', /^1 STIMME/);
  await T.tapMk('shift', 200);
  // drag SPLIT and screenshot during the drag (finger still down)
  const r = await T.mk('k2'); await T.down(r.cx, r.cy); await T.glide(r.cx, r.cy, r.cx, r.cy - 30, 8, 16);
  const l = await E(() => { const l = document.querySelector('.lcd'); const b = l.getBoundingClientRect(); return [b.y, [...l.children].map(c => c.className + ':' + Math.round(c.getBoundingClientRect().x) + '-' + Math.round(c.getBoundingClientRect().right) + ':' + c.textContent.slice(0, 40))]; });
  console.log(tag, 'during drag', JSON.stringify(l));
  await p.screenshot({path: OUT + 'lcd3-' + tag + '-drag.png', clip: {x: 0, y: Math.max(0, l[0] - 10), width: vp.width, height: 60}});
  await T.up(); await sleep(400);
  const l2 = await E(() => { const l = document.querySelector('.lcd'); return [...l.children].map(c => c.className + ':' + Math.round(c.getBoundingClientRect().x) + '-' + Math.round(c.getBoundingClientRect().right) + ':' + c.textContent.slice(0, 60)); });
  console.log(tag, 'after', JSON.stringify(l2));
  await p.screenshot({path: OUT + 'lcd3-' + tag + '-after.png', clip: {x: 0, y: Math.max(0, l[0] - 10), width: vp.width, height: 60}});
  await T.br.close();
}
