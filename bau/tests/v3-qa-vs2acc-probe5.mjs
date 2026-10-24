import {open} from './v3-qa-vs2acc-h.mjs';
const H = await open({vp: 'P1'}), p = H.p;
console.log(await p.evaluate(() => [0, 1, 2].map(t => { const c = SYNQUENZER.getClip(t, 0); return t + ': ' + (c ? c.notes.map(n => n.t + ':' + n.n).join(' ') : '-'); }).join('\n')));
await H.br.close();
