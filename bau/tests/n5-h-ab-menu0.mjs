import { launch, OUT } from './n5-h-ab-lib.mjs';
const {b, p, errs} = await launch({mobile: true});
const xy = await p.evaluate(() => { const r = document.getElementById('bMenu').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
await p.touchscreen.tap(xy[0], xy[1]); await p.waitForTimeout(600);
console.log(await p.evaluate(() => [...document.querySelectorAll('#menu button')].filter(x => x.getBoundingClientRect().width).map(x => x.textContent.trim().replace(/\s+/g, ' ').slice(0, 30)).join(' | ')));
await p.screenshot({path: OUT + '/n5-h-ab-menu0.png'});
await b.close();
