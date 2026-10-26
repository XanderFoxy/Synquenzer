import {open, sleep, OUT} from './v3-qa-gmk7-tl.mjs';
const T = await open({viewport: {width: 390, height: 844}}); const {p, E, errs} = T;
const r = await E(async () => { const Q = SYNQUENZER; await Q.loadDemo(); const out = []; for (let t = 0; t < 6; t++) { const row = []; for (let s = 0; s < 8; s++) { const c = Q.getClip(t, s); row.push(c ? (c.notes ? c.notes.length + 'n/' + c.len : (c.steps ? 'steps' : JSON.stringify(c).slice(0, 40))) : '-'); } out.push([t, Q.tracks()[t].name, Q.getSound(t) && Q.getSound(t).name, Q.getSound(t) && Q.getSound(t).engine, row.join(' ')]); } return out; });
for (const x of r) console.log(JSON.stringify(x));
console.log(JSON.stringify(await E(() => SYNQUENZER.getClip(2, 0))).slice(0, 600));
console.log(JSON.stringify(await E(() => SYNQUENZER.getClip(5, 0))).slice(0, 600));
console.log('errs', errs);
await T.br.close();
