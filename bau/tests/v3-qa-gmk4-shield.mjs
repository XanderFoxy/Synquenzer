// where is the "1/8" row of the NOTE list relative to the TIEFE knob (L 926x428 and P 428x926)
import {open, sleep, OUT} from './v3-qa-gmk4-tl.mjs';
for (const L of [true, false]) {
const T = await open({viewport: L ? {width: 926, height: 428} : {width: 428, height: 926}}); const {p, E} = T;
await T.openEd(0);
const mkb = await T.rectText('button', /^MS ?2000$/); if (mkb) await T.tap(mkb.cx, mkb.cy, 800);
await T.w2(/^6 DELAY/); await T.tapMk('k1', 300); await T.tapPop(/^an$/); await sleep(700);
await T.tapMk('k2', 400);
const rows = await E(() => [...document.querySelectorAll('#popLayer .pop button[data-v]')].map(b => { const r = b.getBoundingClientRect(); return [b.textContent.trim(), Math.round(r.x + r.width / 2), Math.round(r.y + r.height / 2)]; }));
const knobs = await E(() => ['k0', 'k1', 'k2', 'k3'].map(k => { const e = [...document.querySelectorAll('.mkx[data-k="' + k + '"]')].find(e => e.getClientRects().length); const r = e.getBoundingClientRect(); return [k, Math.round(r.x + r.width / 2), Math.round(r.y + r.height / 2)]; }));
await p.screenshot({path: OUT + 'shield-' + (L ? 'L' : 'P') + '.png'});
const near = []; for (const r of rows) for (const k of knobs) if (Math.abs(r[1] - k[1]) <= 30 && Math.abs(r[2] - k[2]) <= 30) near.push(r[0] + ' over ' + k[0]);
console.log(L ? 'L' : 'P', 'knobs', JSON.stringify(knobs), 'rows within 30 px of a knob:', JSON.stringify(near));
await T.br.close();
}
