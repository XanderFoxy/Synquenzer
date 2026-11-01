import {launch, open, take, sleep, geom, openEd} from './h.mjs';
const br = await launch(); const H = await open(br), p = H.p;
const {id, ref} = await take(p, [0.5, 1, 1.5, 2]); await openEd(p, ref, id);
const g = await geom(p);
console.log(await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e.outerHTML.slice(0, 200) + ' parent ' + e.parentElement.className + ' ' + getComputedStyle(e).display + ' ' + JSON.stringify(e.getBoundingClientRect()); }, [g.x + 200, g.y + 90]));
await br.close();
