import { open } from './v3-qa-mk4reg-pw.mjs';
const {b, p, errs} = await open({width: 390, height: 844});
console.log(await p.evaluate(() => Object.keys(window.SYNQUENZER).join(' ')));
console.log(await p.evaluate(() => { const Q = window.SYNQUENZER; return JSON.stringify({info: Q.mkInfo ? Q.mkInfo() : null}).slice(0, 1500); }));
console.log(await p.evaluate(() => { const Q = window.SYNQUENZER; Q.setEngine(0,'mk'); return JSON.stringify(Q.getSound(0)).slice(0, 3000); }));
console.log(errs); await b.close();
