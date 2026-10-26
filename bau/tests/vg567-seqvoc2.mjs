// vgmk567: live – SEQ (TONHÖHE +12 on even steps) stored, sound switched to Vocoder (E2 = lead track): seq scope + carrier pitch while a key is held
import {open, sleep} from './vg567-gmk7-tl.mjs';
import {setupProject} from './vg567-gmk7-setup.mjs';
const T = await open({viewport: {width: 390, height: 844}}); const {p, E, errs} = T;
await setupProject(E);
const PAD = 2, LEAD = 3;
await E(([a, b]) => { const Q = SYNQUENZER; Q.setEngine(a, 'mk'); Q.mkSet(a, 't.0.seq.on', 1); Q.mkSet(a, 't.0.seq.q.0.k', 1); for (let s = 0; s < 16; s++) Q.mkSet(a, 't.0.seq.q.0.v.' + s, s % 2 ? 12 : 0); Q.mkSet(a, 'mode', 3); Q.mkIn(a, 'e2', b); }, [PAD, LEAD]);
await T.openEd(PAD); await sleep(600);
await T.w2(/^11 /); await sleep(300);
const pn = await T.panel(); const mx = await E(() => [...document.querySelectorAll('#synthSheet .mkx[data-k="m2"]')].map(e => e.innerText.replace(/\s+/g, ' ')));
await E(() => { SYNQUENZER.launchScene(0); SYNQUENZER.play(); }); await sleep(1000);
await E(t => SYNQUENZER.mkScope(t), PAD); await sleep(300);
const k = await T.key(5); await T.send('touchStart', [{x: k.cx, y: k.cy, id: 41}]);
const sc = []; for (let i = 0; i < 6; i++) { await sleep(130); sc.push(await E(t => { const s = SYNQUENZER.mkScope(t); return s ? {seq0: s.seq && s.seq[0] && {on: s.seq[0].on, step: s.seq[0].step, vals: s.seq[0].vals}, pitch: s.voices.map(v => v.pitch != null ? +(+v.pitch).toFixed(2) : v.note)} : null; }, PAD)); }
await T.send('touchEnd', []);
console.log('mode', (await T.pm(PAD)).mode, 'knobs', JSON.stringify(pn.knobs), 'matrix', JSON.stringify(mx));
for (const s of sc) console.log(JSON.stringify(s));
console.log('errs', JSON.stringify(errs));
await T.br.close();
