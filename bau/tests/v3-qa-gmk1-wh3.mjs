import {open, sleep, check, done} from './v3-qa-gmk1-tl.mjs';
const T = await open(); const {p, E, errs} = T;
const wh = () => E(() => { const w = document.getElementById('mkWh'); return {eng: SYNQUENZER.getSound(0).engine, wheels: !!(w && !w.hidden && w.getClientRects().length), kb: Math.round(document.getElementById('kb').getBoundingClientRect().width), editor: SYNQUENZER.runtime().editor}; });
await E(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await sleep(500);
await T.tapTxt('button', /^MS ?2000$/); await sleep(500);
await T.tapTxt('button', /^VA$/); await sleep(500);
const x = await T.rectText('button', /^✕$/); await T.tap(x.cx, x.cy, 600);   // VA track: ✕ closes
console.log('closed on VA', JSON.stringify(await wh()));
const mu = await E(() => [...document.querySelectorAll('button')].filter(b => b.textContent.trim() === '↶' && b.getClientRects().length).map(b => { const r = b.getBoundingClientRect(); return [b.className, Math.round(r.x + r.width / 2), Math.round(r.y + r.height / 2), document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2) === b || b.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2))]; }));
console.log('visible ↶ buttons', JSON.stringify(mu));
const m = mu.find(u => u[3]); await T.tap(m[1], m[2], 800);
const a = await wh(); console.log('main ↶ → back to MS 2000', JSON.stringify(a));
await E(() => SYNQUENZER.selectTrack(1)); await sleep(300); await E(() => SYNQUENZER.selectTrack(0)); await sleep(400);
console.log('after re-selecting the track', JSON.stringify(await wh()));
check('W2 main-view ↶ that turns the selected track back into MS 2000 shows the BEND/MOD wheels', a.eng === 'mk' && a.wheels, a);
await T.br.close(); done();
