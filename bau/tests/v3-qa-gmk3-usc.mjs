import {open, sleep, OUT, check, done} from './v3-qa-gmk3-tl.mjs';
const T = await open(); const {p, E, errs} = T;
await E(() => { const Q = SYNQUENZER; Q.setEngine(0, 'mk'); Q.mkSet(0, 'scale', 9); Q.mkSet(0, 'usc.0', 30); Q.mkSet(0, 'usc.4', -14); Q.mkSet(0, 'usc.7', 2); });
await T.openEd(0); await T.w('w2', /^10 STIMMUNG/);
const u0 = await T.undoN(); const before = (await T.pm(0)).usc;
// one gesture: drag STIMMUNG down one step (Pelog) and back up (Eigene) without lifting the finger
const r = await T.mk('k0'); await T.down(r.cx, r.cy); await T.glide(r.cx, r.cy, r.cx, r.cy + 40, 10, 20); const mid = await E(() => SYNQUENZER.mkGet(0).scale); await T.glide(r.cx, r.cy + 40, r.cx, r.cy, 10, 20); await T.up(); await sleep(300);
const m = await T.pm(0);
console.log(JSON.stringify({before, mid, after: {scale: m.scale, usc: m.usc}, du: (await T.undoN()) - u0}));
check('one STIMMUNG drag Eigene → Pelog → Eigene (finger down) keeps the 12 own values', m.scale === 9 && JSON.stringify(m.usc) === JSON.stringify(before), {mid, usc: m.usc});
await T.br.close(); done();
