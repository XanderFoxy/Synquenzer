import {open, sleep, OUT} from './v3-qa-gmk3-tl.mjs';
for (const [tag, vp] of [['P1', {width: 390, height: 844}], ['P2', {width: 375, height: 812}]]) {
  const T = await open({viewport: vp}); const {p, E} = T;
  await E(() => { const Q = SYNQUENZER; Q.setEngine(0, 'mk'); Q.mkSet(0, 'mode', 2); });
  await T.openEd(0);
  const pn0 = await T.panel(); if (pn0 && pn0.half === 'A') { await T.tapTxt('button, .tab', /^RECHTS$/); await sleep(300); }
  await T.w('w1', /^1 STIMME/);
  const shot = async n => { const l = await E(() => { const l = document.querySelector('.lcd'); const b = l.getBoundingClientRect(); return [b.y, l.className, [...l.children].map(c => c.className + ':' + Math.round(c.getBoundingClientRect().x) + '-' + Math.round(c.getBoundingClientRect().right) + '/' + Math.round(c.getBoundingClientRect().height) + ':' + c.textContent.slice(0, 70))]; }); console.log(tag, n, JSON.stringify(l)); await p.screenshot({path: OUT + 'lcd4-' + tag + '-' + n + '.png', clip: {x: 0, y: Math.max(0, l[0] - 6), width: vp.width, height: 50}}); };
  const lx = await T.rect('.lx.lsplit'); await T.tap(lx.cx - 40, lx.cy, 300); await shot('armed');
  await E(() => SYNQUENZER.keyOn(52, .8, 'q')); await sleep(200); await E(() => SYNQUENZER.keyOff(52, 'q')); await sleep(300); await shot('set');
  await T.tapMk('k1', 300); await T.tapPop(/^Split$/); await sleep(500); await shot('einzeln-list');
  await T.br.close();
}
