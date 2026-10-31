import { open, SONG8 } from './n5-v-lib.mjs';
const sizes = [[390, 844, 'P1'], [375, 667, 'P2'], [320, 568, 'P3'], [844, 390, 'L1'], [667, 375, 'L2'], [926, 428, 'W']];
const out = {};
for (const [w, h, n] of sizes) {
  const {b, p, errs} = await open({w, h, touch: true, dpr: 2});
  await p.evaluate(s => { SYNQUENZER.setSong(s); SYNQUENZER.openMenu(); }, SONG8);
  await p.waitForTimeout(300);
  const btn = await p.$('#menu button[aria-label="Video des Songs erstellen"]');
  await btn.scrollIntoViewIfNeeded(); await btn.tap(); await p.waitForTimeout(500);
  await p.screenshot({path: 'n5-v-out/ui-' + n + '.png'});
  const m = await p.evaluate(() => {
    const sh = document.getElementById('vvSheet'), r = sh.getBoundingClientRect(), bad = [], small = [];
    for (const e of sh.querySelectorAll('button')) { const q = e.getBoundingClientRect(); if (q.width < 44 || q.height < 44) small.push(e.textContent + ' ' + q.width.toFixed(0) + 'x' + q.height.toFixed(0)); if (q.right > innerWidth + .5 || q.bottom > innerHeight + .5 || q.left < -.5 || q.top < -.5) bad.push('out:' + e.textContent); }
    for (const e of sh.querySelectorAll('button,span,b,.vvway')) if (e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow !== 'visible') bad.push('clip:' + e.className + ':' + e.textContent.slice(0, 30));
    const cv = sh.querySelector('canvas').getBoundingClientRect();
    return {sheet: [r.width, r.height], doc: [document.documentElement.scrollHeight, innerHeight], small, bad, cv: [cv.width, cv.height]};
  });
  // toggle format + view, measure no size change of sheet / controls
  const before = await p.evaluate(() => document.querySelector('.vvctl').getBoundingClientRect().toJSON());
  await p.tap('.vvseg button:nth-child(2)'); await p.waitForTimeout(300);
  await p.screenshot({path: 'n5-v-out/ui-' + n + '-169.png'});
  const after = await p.evaluate(() => document.querySelector('.vvctl').getBoundingClientRect().toJSON());
  m.ctlJump = JSON.stringify(before) !== JSON.stringify(after);
  out[n] = m; console.log(n, JSON.stringify(m), errs);
  await b.close();
}
