import {open, OUT, sleep} from './v3-qa-gp2a-lib.mjs';
const T = await open({mic: false}); const {p, E, errs} = T;
await T.tapSel('.corner.sw'); await sleep(300);
console.log(JSON.stringify(await E(() => [...document.querySelectorAll('.sv-top *, .sv-labs > *')].filter(e => e.offsetWidth).map(e => e.tagName + '.' + e.className + ' [' + e.textContent.trim().slice(0, 20) + ']'))));
console.log(JSON.stringify(await E(() => [...document.querySelectorAll('#gridArea [class]')].filter(e => e.offsetWidth).map(e => e.className).filter((v, i, a) => a.indexOf(v) === i).slice(0, 80))));
await T.br.close();
