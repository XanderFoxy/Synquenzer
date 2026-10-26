import {open, sleep} from './vgmk34-tl4.mjs';
const L = process.argv[2] === 'L';
const T = await open({viewport: L ? {width: 844, height: 390} : {width: 390, height: 844}}); const {p, E, errs} = T;
await T.openEd(0);
const b = await E(() => [...document.querySelectorAll('button')].filter(e => /MS/.test(e.textContent)).map(e => { const r = e.getBoundingClientRect(); return [e.textContent.trim(), Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height), e.offsetWidth, getComputedStyle(e).visibility]; }));
console.log(JSON.stringify(b));
await p.screenshot({path: process.env.OUTP || '/tmp/x.png'});
console.log('errs', JSON.stringify(errs));
await T.close?.(); process.exit(0);
