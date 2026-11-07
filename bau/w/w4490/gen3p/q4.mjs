import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true}); await p.goto('file://' + process.argv[2]); await p.waitForTimeout(1500);
console.log(JSON.stringify(await p.evaluate(async () => {
  const D = window.SYNQUENZER;
  D.setClip(4, 0, {len: 1, notes: [{t: 0, d: .1, n: 36, v: .9}]}); D.placePart('S1', 0, 'insert');
  D.ui1.jump('grund'); await new Promise(r => setTimeout(r, 1200));
  const x = document.querySelector('.bb1s .ms-x'); if (x) x.click();
  D.songView(true); D.ueBar(true); await new Promise(r => setTimeout(r, 400));
  const b = document.querySelector(".gr2-ueg"); b.click(); await new Promise(r => setTimeout(r, 250)); const P = document.querySelector(".pop.gr2ueg"); return {P: P ? P.querySelectorAll("[data-ueg]").length : null, sv: !!document.querySelector('#songView.on, #songView.open'), cs: document.getElementById('clipSheet').className, bar: !!document.querySelector('.ue-bar'), ueg: !!document.querySelector('.gr2-ueg'), info: D.ueInfo ? D.ueInfo() : null, pops: [...document.querySelectorAll('.pop')].map(x => x.className)};
})));
await b.close();
