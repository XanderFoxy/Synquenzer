import {launch, FMT} from './v3-mkp-lib.mjs';
import path from 'path';
const b = await launch();
for (const file of ['v3-mkp-vorg.html', '../mk-br-MKP/index.html']) for (const f of ['P1', 'P3', 'XH']) {
  const [w, h] = FMT[f]; const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true}); const page = await ctx.newPage();
  await page.goto('file://' + path.resolve(file)); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  for (const eng of ['va', 'mk']) {
  await page.evaluate(e => { SYNQUENZER.setEngine(0, e); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }, eng); await page.waitForTimeout(1500);
  const r = await page.evaluate(() => { const out = []; for (const e of document.querySelectorAll('#synthSheet *')) { if (!e.offsetWidth || ![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue; if (e.scrollWidth > e.clientWidth + 1) out.push(e.className + ':' + e.textContent.trim().slice(0, 12) + ' ' + e.scrollWidth + '>' + e.clientWidth + ' ' + getComputedStyle(e).textOverflow + ' ' + getComputedStyle(e).overflow); } return out; });
  console.log(file.slice(0, 12), f, eng, JSON.stringify(r));
  }
  await ctx.close();
}
await b.close();
