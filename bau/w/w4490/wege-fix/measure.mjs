import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const f = process.argv[2];
const b = await chromium.launch();
for (const [w, h] of [[428, 926], [926, 428]]) {
  const p = await b.newPage({viewport: {width: w, height: h}, deviceScaleFactor: 2, hasTouch: true, isMobile: true});
  await p.goto('file://' + f); await p.waitForFunction(() => window.SYNQUENZER, null, {timeout: 60000}); await p.waitForTimeout(2000);
  const r = await p.evaluate(() => {
    const D = window.SYNQUENZER; D.setClip(0, 0, {len: 1, notes: [{t: 0, d: 1, n: 60, v: .8}]}); D.songFromChain([{scene: 0, bars: 4}, {scene: 0, bars: 4}]); D.songView(true);
    songSelect(1); rangeBarSync(); 
    return new Promise(res => setTimeout(() => {
      const t = SV.rbar.querySelector('[data-a="part"] .t'), cw = t.clientWidth, out = {cw, btn: t.parentElement.getBoundingClientRect().width, font: getComputedStyle(t).font};
      for (const s of ['Zusammenfassen …', 'Zusammen­fassen …', 'Zusammen…', 'Zusammen …', 'Zusammenf. …', 'Teil …', 'Takte kopieren →', 'Kopieren →', 'Takte →', 'Kopie →', 'Als Teil …']) { t.textContent = s; out[s] = t.scrollWidth; }
      rangeBarFit(); res(out);
    }, 600));
  });
  console.log(w, JSON.stringify(r));
  await p.close();
}
await b.close();
