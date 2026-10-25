import {open, OUT, sleep} from './v3-qa-gp2a-lib.mjs';
const T = await open({mic: false, viewport: {width: 844, height: 390}}); const {p, E, errs} = T;
console.log(JSON.stringify(await E(() => [...document.querySelectorAll('button')].filter(b => /FANG/.test(b.textContent)).map(b => (b.id || b.className) + '|' + b.textContent.trim() + '|' + b.offsetWidth))));
await T.br.close();
