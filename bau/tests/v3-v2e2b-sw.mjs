import { openVp, SETUP } from './v3-v2e-lib.mjs';
const {b, p} = await openVp(process.argv[2] || 'P3');
await p.evaluate(SETUP(false)); await p.evaluate(() => window.SYNQUENZER.songView(true)); await p.waitForTimeout(300);
console.log(await p.evaluate(() => { const x = document.querySelector('.sv-sw'), l = x.querySelector('.swl'), cs = getComputedStyle(x); const g = x.querySelector('.clogo'); return [g.offsetWidth, g.scrollWidth, getComputedStyle(g).display, x.scrollWidth, x.clientWidth, l.scrollWidth, l.offsetWidth, cs.paddingLeft, cs.borderLeftWidth, getComputedStyle(l).fontSize, l.textContent]; }));
await p.screenshot({path: 'v3-v2e2b-sw.png', clip: {x: 0, y: 40, width: 120, height: 260}});
await b.close();
