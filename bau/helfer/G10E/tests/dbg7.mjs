import {launch, open, take, sleep, geom, openEd, drag} from './h.mjs';
const br = await launch(); const H = await open(br), p = H.p, c = H.cdp;
const {id, ref} = await take(p, [0.5, 1, 1.5]); await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); }); await openEd(p, ref, id);
await p.evaluate(() => { window.__ev = []; for (const t of ['pointerdown','pointermove','pointerup','pointercancel']) window.addEventListener(t, e => window.__ev.push(t + ' ' + (e.target.tagName + '.' + e.target.className) + ' ' + Math.round(e.clientX) + ',' + Math.round(e.clientY)), true); });
await (await import('./h.mjs')).tap(c, 200, 190); await sleep(250); await openEd(p, ref, id);
const hd = await p.evaluate(() => { const r = document.querySelector('#wpSheet .qh b').getBoundingClientRect(); return {x: r.x + 30, y: r.y + r.height / 2}; });
await drag(c, hd.x, hd.y, hd.x + 5, hd.y + 120, 8, 10); await sleep(200);
console.log(hd, await p.evaluate(() => window.__ev.join('\n')), await p.evaluate(() => !!SYNQUENZER.wpInfo().editor));
await br.close();
