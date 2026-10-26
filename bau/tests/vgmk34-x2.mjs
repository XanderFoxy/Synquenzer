import {open, sleep} from './vgmk34-tl3.mjs';
const L = process.argv[2] === 'L';
const T = await open({viewport: L ? {width: 844, height: 390} : {width: 390, height: 844}}); const {p, E, errs} = T;
await E(() => SYNQUENZER.setMetronome(false));
await E(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await sleep(600);
const b = await T.rectText('button', /^MS ?2000$/); if (b) await T.tap(b.cx, b.cy, 900); else { const c = await T.rectText('button', /^(VA|FM|WT) ▾$/); await T.tap(c.cx, c.cy, 400); await T.tapPop(/MS ?2000/); await sleep(900); }
console.log('eng', await E(() => SYNQUENZER.getSound(0).engine));
const ks = await E(() => [...document.querySelectorAll('.mkx[data-k]')].filter(e => e.getClientRects().length).map(e => { const r = e.getBoundingClientRect(); return e.dataset.k + ':' + e.textContent.replace(/\s+/g, ' ').trim().slice(0, 30) + '@' + Math.round(r.x) + ',' + Math.round(r.y) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height); }));
console.log(ks.join('\n'));
console.log(JSON.stringify(await T.panel()).slice(0, 1500));
console.log('lcd', await T.lcdAll());
await p.screenshot({path: process.env.OUTP});
console.log('errs', JSON.stringify(errs));
process.exit(0);
