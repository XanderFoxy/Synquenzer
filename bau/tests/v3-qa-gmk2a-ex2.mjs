import {open, sleep, OUT} from './v3-qa-gmk2a-tl.mjs';
const T = await open(); const {p, E, errs} = T;
await T.openEd(0);
const mkb = await T.rectText('button', /^MS ?2000$/); await T.tap(mkb.cx, mkb.cy, 800);
console.log(await E(() => [...document.querySelectorAll('.mkx[data-k]')].filter(e => e.getClientRects().length).map(e => e.dataset.k + '@' + Math.round(e.getBoundingClientRect().x) + ',' + Math.round(e.getBoundingClientRect().y) + ' ' + e.getBoundingClientRect().width.toFixed(0) + 'x' + e.getBoundingClientRect().height.toFixed(0)).join(' | ')));
const pn = await T.panel(); console.log(JSON.stringify(pn).slice(0, 1500));
await p.screenshot({path: OUT + 'ex2-P.png'});
await T.br.close();
