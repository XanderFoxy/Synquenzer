import {launch, open, VORG, FILE} from './v3-qmkp-lib.mjs';
const b = await launch();
for (const file of [VORG, FILE]) for (const f of ['P1', 'P3', 'XH']) {
  const page = await open(b, f, {file});
  await page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await page.waitForTimeout(1500);
  const r = await page.evaluate(() => [...EL.synthSheet.querySelectorAll('.hb')].filter(e => e.offsetWidth).map(e => (e.className.split(' ').slice(-1)[0]) + ':' + e.textContent.trim().slice(0, 6) + ':' + e.scrollWidth + '/' + e.clientWidth + ':' + getComputedStyle(e).overflow).join(' | '));
  const pn = await page.evaluate(() => { const e = EL.synthSheet.querySelector('.pn'); return e ? e.scrollWidth + '/' + e.clientWidth : null; });
  console.log(file.split('/').pop(), f, 'pn', pn, r);
  await page.ctx.close();
}
await b.close();
