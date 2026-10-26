import {open, sleep, OUT} from './v3-qa-gmk3-tl.mjs';
const T = await open({viewport: {width: 390, height: 844}}); const {p, E} = T;
await E(() => { const Q = SYNQUENZER; Q.setEngine(0, 'mk'); });
await T.openEd(0);
await T.w('w1', /^1 STIMME/);
const shot = async n => { const l = await E(() => { const l = document.querySelector('.lcd'); const b = l.getBoundingClientRect(); return [b.y, l.className, [...l.children].map(c => c.className + ':' + Math.round(c.getBoundingClientRect().x) + '-' + Math.round(c.getBoundingClientRect().right) + ':' + c.textContent.slice(0, 50))]; }); console.log(n, JSON.stringify(l)); await p.screenshot({path: OUT + 'lcd5-' + n + '.png', clip: {x: 0, y: Math.max(0, l[0] - 6), width: 390, height: 50}}); };
for (const mode of ['Schicht', 'Split']) {
  await T.knobList('k1', new RegExp('^' + mode + '$')); await shot('mode-' + mode);
  await T.knobList('k2', /^Mono$/); await shot('zuweis-' + mode);
  await T.knobList('k2', /^Poly$/);
}
await T.br.close();
