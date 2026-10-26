import {open, sleep, OUT, check, done} from './v3-qa-gmk3-tl.mjs';
for (const [tag, vp] of [['P', {width: 390, height: 844}], ['L', {width: 844, height: 390}], ['P3', {width: 375, height: 667}]]) {
  const T = await open({viewport: vp}); const {p, E, errs} = T;
  await E(() => { const Q = SYNQUENZER; Q.setEngine(0, 'mk'); Q.mkSet(0, 'mode', 2); });
  await T.openEd(0);
  await T.w('w1', /^1 STIMME/);
  const lcd = await E(() => { const l = document.querySelector('.lcd'); const r = l.getBoundingClientRect(); const x = l.querySelector('.lx.lsplit'); const xr = x && x.getBoundingClientRect(); return {lcd: [r.x, r.y, r.width, r.height].map(Math.round), lx: xr && [xr.x, xr.y, xr.width, xr.height].map(Math.round), cls: l.className, html: l.innerHTML.slice(0, 600), sw: [l.scrollWidth, l.clientWidth]}; });
  console.log(tag, JSON.stringify(lcd));
  await p.screenshot({path: OUT + 'lcd-' + tag + '.png', clip: {x: 0, y: Math.max(0, lcd.lcd[1] - 60), width: vp.width, height: 140}});
  // tap the LCD line at its left part (not on the key label)
  const y = lcd.lcd[1] + lcd.lcd[3] / 2, x = lcd.lcd[0] + 12;
  await T.tap(x, y, 300); const arm = (await T.panel()).splitArm;
  console.log(tag, 'tap LCD left end → armed', arm, JSON.stringify(await T.lcdAll()));
  if (arm) await E(() => { MKUI.P.splitArm = false; });
  // P3: is there an LCD?
  await T.br.close();
}
