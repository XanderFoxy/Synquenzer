import {launch, open, take, sleep, geom, openEd, tap, info, marksOf} from './h.mjs';
const br = await launch(); const H = await open(br), p = H.p, c = H.cdp;
const T = Array.from({length: 12}, (_, k) => 0.5 + k * 0.3);
const {id, ref} = await take(p, T); await openEd(p, ref, id);
await p.evaluate(() => { window.__ev = []; for (const t of ['pointerdown','pointerup','pointercancel','click']) window.addEventListener(t, e => window.__ev.push(t + ' ' + e.pointerId + ' ' + (e.target.tagName + '.' + e.target.className) + ' ' + Math.round(e.clientX) + ',' + Math.round(e.clientY)), true); });
const g = await geom(p); const M = g.marks.slice().sort((a,b)=>a-b); let x=-1; for (let k=0;k<M.length-1;k++) if (M[k+1]-M[k]>40) { x=(M[k]+M[k+1])/2; break; }
console.log('x', x, (await marksOf(p,id)).length);
await tap(c, x, g.y + 12, 600); await sleep(300);
console.log(await p.evaluate(() => window.__ev.join('\n')), (await marksOf(p,id)).length, await p.evaluate(() => document.querySelector('#wpSheet').className + ' ' + !!document.querySelector('#wpSheet .g10add')));
await br.close();
