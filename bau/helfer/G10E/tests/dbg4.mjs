import {launch, open, take, sleep, geom, openEd, tap} from './h.mjs';
const br = await launch(); const H = await open(br), p = H.p;
const {id, ref} = await take(p, [0.5, 1, 1.5, 2]); await openEd(p, ref, id);
await p.evaluate(() => { window.__ev = []; for (const t of ['pointerdown','pointerup','click','touchstart','touchend','mousedown','mouseup']) document.addEventListener(t, e => window.__ev.push(t + ' ' + (e.target.tagName + '.' + e.target.className) + ' ' + Math.round(e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX) || 0) + ',' + Math.round(e.clientY || 0) + ' dp' + e.defaultPrevented), true); });
await tap(H.cdp, 303, 464); await sleep(300);
console.log(await p.evaluate(() => window.__ev.join('\n')), await p.evaluate(() => SYNQUENZER.undoInfo().top));
await br.close();
