import {launch, open, take, sleep, geom, openEd} from './h.mjs';
const br = await launch(); const H = await open(br), p = H.p;
const {id, ref} = await take(p, [0.5, 1, 1.5, 2]); await openEd(p, ref, id);
for (const y of [460, 465, 467, 470, 474, 478]) console.log(y, await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e.tagName + '.' + e.className + ' < ' + e.parentElement.className; }, [298, y]));
console.log(await p.evaluate(() => JSON.stringify(document.querySelector('#wpSheet .qchips').getBoundingClientRect())));
await br.close();
