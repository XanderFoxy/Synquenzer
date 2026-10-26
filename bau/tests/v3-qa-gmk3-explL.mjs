import {open, sleep, OUT} from './v3-qa-gmk3-tl.mjs';
const T = await open({viewport: {width: 844, height: 390}}); const {p, E, errs} = T;
await E(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await sleep(800);
console.log(JSON.stringify(await E(() => [...document.querySelectorAll('button')].filter(b => b.getClientRects().length && b.offsetWidth).map(b => b.textContent.trim().slice(0, 18)).filter(Boolean))));
await p.screenshot({path: OUT + 'explore-L.png'});
await T.br.close();
