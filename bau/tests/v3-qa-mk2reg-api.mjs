import { open } from './v3-mk0reg-pw.mjs';
const {b, p, errs} = await open({width: 390, height: 844});
console.log(await p.evaluate(() => Object.keys(window.SYNQUENZER).join(' ')));
console.log(await p.evaluate(() => { const Q = window.SYNQUENZER; return JSON.stringify({info: Q.mkInfo ? Q.mkInfo() : null}).slice(0, 1500); }));
console.log(errs); await b.close();
