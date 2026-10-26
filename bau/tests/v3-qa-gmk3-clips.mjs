import {open, sleep} from './v3-qa-gmk3-tl.mjs';
const T = await open(); const {E} = T;
console.log(JSON.stringify(await E(() => { const o = {}; for (let t = 0; t < 6; t++) for (let s = 0; s < 4; s++) { const c = SYNQUENZER.getClip(t, s); o[t + ':' + s] = c ? {len: c.len, n: c.notes ? c.notes.length : null, notes: c.notes ? c.notes.slice(0, 12).map(x => x.n + '@' + x.t + '/' + x.d).join(' ') : (c.steps ? 'steps' : Object.keys(c).join(',')), key: c.key && c.key.root + c.key.scale} : null; } return o; }), null, 1));
console.log('bpm', await E(() => SYNQUENZER.runtime().bpm), JSON.stringify(await E(() => Object.keys(SYNQUENZER.runtime()))));
await T.br.close();
