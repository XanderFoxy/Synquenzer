import {open, sleep, OUT} from './v3-qa-gmk6-tl.mjs';
const T = await open({viewport: {width: 844, height: 390}}); const {p, E, errs} = T;
await T.openEd(2);
console.log(JSON.stringify(await E(() => [...document.querySelectorAll('#synthSheet button')].filter(b => b.offsetWidth).map(b => b.textContent.trim()).slice(0, 30))));
await p.screenshot({path: OUT + 'x6-L.png'});
await T.br.close();
