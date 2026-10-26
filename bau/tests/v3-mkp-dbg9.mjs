import {launch, open} from './v3-mkp-lib.mjs';
const b = await launch(); const page = await open(b, process.argv[2], 'L1');
console.log(await page.evaluate(() => [47, 51, 53].map(y => y + ': ' + document.elementsFromPoint(385, y).slice(0, 4).map(e => e.tagName + '.' + String(e.className).slice(0, 14)).join(' > '))));
console.log(await page.evaluate(() => { const p = document.querySelector('.mkqh .pv'); const cs = getComputedStyle(p); return [cs.height, cs.paddingBottom, cs.boxSizing, cs.marginBottom, p.getBoundingClientRect().bottom, getComputedStyle(p, '::after').content, getComputedStyle(p, '::before').content, getComputedStyle(document.querySelector('.mkqh .preset'), '::after').content]; }));
await b.close();
