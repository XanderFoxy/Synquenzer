import { launch } from './n5-h-ab-lib.mjs';
const {b, p} = await launch({mobile: true});
console.log(await p.evaluate(() => [...document.querySelectorAll('#clipGrid > *, #clipGrid .row > *')].slice(0, 30).map(x => x.tagName + '.' + x.className + ' "' + x.textContent.trim().slice(0, 8) + '" ' + Math.round(x.getBoundingClientRect().left) + ',' + Math.round(x.getBoundingClientRect().top) + ' ' + Math.round(x.getBoundingClientRect().width)).join('\n')));
await b.close();
