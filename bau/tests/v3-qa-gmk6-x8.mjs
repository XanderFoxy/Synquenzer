import {open, sleep, OUT} from './v3-qa-gmk6-tl.mjs';
const T = await open({viewport: {width: 390, height: 844}}); const {p, E, errs} = T;
console.log(JSON.stringify(await E(() => { const Q = SYNQUENZER; return [0,1,2,3,4,5].map(t => [0,1,2,3,4,5,6,7].map(s => { const c = Q.getClip(t, s); return c ? (c.len + ':' + (c.notes ? c.notes.length : c.steps ? 'drum' : '?')) : '-'; }).join(' ')); })));
console.log(typeof (await E(() => typeof audBeat)), JSON.stringify(await E(() => Object.keys(SYNQUENZER.runtime()))));
console.log(JSON.stringify(await E(() => Object.keys(SYNQUENZER).filter(k => /scene|launch|stop|play|Bpm|tempo|metro|serial|load|save|project/i.test(k)))));
await T.br.close();
