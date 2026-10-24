import {open, sleep} from './v3-qa-vs2acc-h.mjs';
const H = await open({vp: 'P1'}), p = H.p;
console.log(await p.evaluate(() => { const st = SYNQUENZER.state ? SYNQUENZER.state() : null; return JSON.stringify(st).slice(0, 600); }));
console.log(await p.evaluate(() => { const o = []; for (let t = 0; t < 8; t++) { const r = []; for (let s = 0; s < 8; s++) { const c = SYNQUENZER.getClip(t, s); r.push(c ? (c.len + 'b' + (c.notes ? c.notes.length : (c.steps ? 'st' : '?'))) : '-'); } o.push(t + ': ' + r.join(' ')); } return o.join('\n'); }));
console.log(await p.evaluate(() => Object.keys(SYNQUENZER).filter(k => /undo|redo|tap|bpm|metro|kb|scene|launch|new|demo|reset/i.test(k)).join(' ')));
console.log(await p.evaluate(() => [...document.querySelectorAll('button[id]')].map(b => b.id).join(' ')));
await H.br.close();
