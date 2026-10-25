import { open, NEW, OUT } from './v3-mk0rg2-lib.mjs';
const {p, errs, close} = await open(NEW, 'P1');
console.log(await p.evaluate(() => { const r = []; for (const y of [700, 760, 820]) for (const x of [20, 60, 100, 200]) { const e = document.elementFromPoint(x, y); r.push(x + ',' + y + ' ' + e.tagName + '#' + e.id + '.' + e.className + ' ' + JSON.stringify(e.dataset)); } return r.join('\n'); }));
console.log(await p.evaluate(() => JSON.stringify({tracks: window.SYNQUENZER.tracks ? window.SYNQUENZER.tracks() : null, drum: [0,1,2,3,4,5].map(t => window.SYNQUENZER.isDrum(t))})).then(s => s.slice(0, 800)));
console.log(await p.evaluate(() => JSON.stringify(window.SYNQUENZER.runtime()).slice(0, 1500)));
console.log(errs);
await close();
