import {open, sleep, check, done} from './v3-qa-gmk1-tl.mjs';
const T = await open(); const {p, E, errs} = T;
const wh = () => E(() => { const w = document.getElementById('mkWh'); return {eng: SYNQUENZER.getSound(0).engine, wheels: !!(w && !w.hidden && w.getClientRects().length), kb: Math.round(document.getElementById('kb').getBoundingClientRect().width)}; });
await E(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await sleep(500);
await T.tapTxt('button', /^MS ?2000$/); await sleep(500); const a = await wh(); console.log('VA → MS 2000 (header)', JSON.stringify(a));
await T.tapTxt('button', /^VA$/); await sleep(500); const b = await wh(); console.log('MS 2000 → VA (header)', JSON.stringify(b));
await T.tapTxt('.hb.ur', /^↶$/, 500); await sleep(1000); const c = await wh(); console.log('↶ (back to MS 2000)', JSON.stringify(c));
await T.tapTxt('.hb.ur', /^↶$/, 500); await sleep(500); const d = await wh(); console.log('↶ (back to VA)', JSON.stringify(d));
await T.tapTxt('.hb.ur', /^↷$/, 500); await sleep(500); const e = await wh(); console.log('↷ (MS 2000)', JSON.stringify(e));
// program load of an MS 2000 sound onto a VA track via the library
await E(async () => { await SYNQUENZER.saveSound(0, 'Rad Test', 'new'); }); await E(() => SYNQUENZER.selectTrack(2)); await sleep(400);
await E(() => SYNQUENZER.loadPreset(2, 'Rad Test')); await sleep(600); const f = await E(() => { const w = document.getElementById('mkWh'); return {eng: SYNQUENZER.getSound(2).engine, wheels: !!(w && !w.hidden && w.getClientRects().length)}; });
console.log('library: MS 2000 sound onto VA track 3', JSON.stringify(f));
check('W1 wheels shown whenever the selected track plays MS 2000 (after ↶/↷ and after loading an MS 2000 sound)', c.wheels && e.wheels && f.wheels && !d.wheels, {c, d, e, f});
await T.br.close(); done();
