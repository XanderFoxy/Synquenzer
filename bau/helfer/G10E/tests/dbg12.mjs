import {launch, open, take, sleep, openEd} from './h.mjs';
const br = await launch();
for (const vp of [{width: 428, height: 926}, {width: 926, height: 428}]) {
const H = await open(br, vp), p = H.p;
const {id, ref} = await take(p, [0.5, 1, 1.5]); await openEd(p, ref, id);
console.log(await p.evaluate(() => { const out = []; for (const sel of ['#wpSheet .wpchips button:nth-child(1)', '#wpSheet .sh-x', '#wpSheet .g10add']) { const b = document.querySelector(sel), r = b.getBoundingClientRect(), cx = r.x + r.width / 2, cy = r.y + r.height / 2;
 for (const [x, y] of [[cx, cy - 21], [cx, cy + 21], [cx - 21, cy], [cx + 21, cy]]) { const e = document.elementFromPoint(x, y); out.push(sel.slice(9) + ' ' + Math.round(x) + ',' + Math.round(y) + ' → ' + (e ? e.tagName + '.' + e.className + (b.contains(e) || e === b ? ' OK' : '') : null)); } } return out.join('\n'); }));
await H.ctx.close(); }
await br.close();
