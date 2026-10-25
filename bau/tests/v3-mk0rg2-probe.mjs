import { open, NEW } from './v3-mk0rg2-lib.mjs';
const {p, errs, close} = await open(NEW, 'P1');
console.log(await p.evaluate(() => [...document.querySelectorAll('button,[role=button]')].filter(x => x.offsetParent).map(x => (x.id || '-') + ':' + (x.className||'').slice(0,20) + ':' + x.textContent.trim().slice(0, 14)).join('\n')));
console.log(errs);
await close();
