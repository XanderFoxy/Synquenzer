import {open, sleep, OUT} from './v3-qa-gmk2a-tl.mjs';
const T = await open(); const {p, E, errs} = T;
console.log(await E(() => { const P = SYNQUENZER.project().project || SYNQUENZER.project(); return P.tracks.map((t, i) => i + ' ' + t.name + ' kbOct ' + t.kbOct + ' clips ' + t.clips.map(c => c ? (c.notes ? c.notes.length : '?') + 'n/' + c.len : '-').join(',')).join('\n') + '\nbpm ' + P.bpm + ' scenes ' + (P.scenes && P.scenes.length); }));
console.log(await E(() => [...document.querySelectorAll('#kb .key')].slice(0, 30).map(k => k.dataset.n || k.dataset.note || k.textContent).join(',')));
console.log(await E(() => JSON.stringify(Object.keys(SYNQUENZER.runtime()))));
await T.br.close();
