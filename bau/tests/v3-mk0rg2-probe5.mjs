import { open, NEW, OUT } from './v3-mk0rg2-lib.mjs';
const {p, errs, close} = await open(NEW, 'P1');
await p.evaluate(() => { const Q = window.SYNQUENZER; Q.selectSlot(4, 1); }); await p.waitForTimeout(500);
await p.screenshot({path: OUT + 'probe-drum.png'});
console.log(await p.evaluate(() => { const r = []; for (const y of [650, 720, 800]) for (const x of [50, 150, 250, 350]) { const e = document.elementFromPoint(x, y); r.push(x + ',' + y + ' ' + e.tagName + '#' + e.id + '.' + e.className + ' ' + JSON.stringify(e.dataset) + ' ' + e.textContent.trim().slice(0, 10)); } return r.join('\n'); }));
await close();
