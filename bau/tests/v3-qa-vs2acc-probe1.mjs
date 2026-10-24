import {open, sleep} from './v3-qa-vs2acc-h.mjs';
const H = await open({vp: 'P1'}), p = H.p;
console.log('micok', await p.evaluate(() => document.getElementById('app').classList.contains('micok')));
await p.tap('#segMic');
await p.waitForFunction(() => window.__q.bus, null, {timeout: 5000});
console.log('loop', await p.evaluate(() => window.__q.loop(-30, 40)));
for (let i = 0; i < 16; i++) { await sleep(500); const s = await p.evaluate(() => { const s = SYNQUENZER.stimme(); return {phase: s.phase, route: s.route, lat: s.latMs, sheet: s.sheet, row: s.row}; }); console.log(JSON.stringify(s)); }
await p.screenshot({path: 'v3-qa-vs2acc-probe1.png'});
console.log(await p.evaluate(() => JSON.stringify(SYNQUENZER.stimme()).slice(0, 1500)));
console.log('errs', H.errs);
await H.br.close();
