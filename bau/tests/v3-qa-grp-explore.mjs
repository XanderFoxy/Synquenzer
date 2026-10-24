import {open, OUT} from './v3-qa-grp-lib.mjs';
const {br, p, errs, E} = await open();
await p.screenshot({path: OUT + 'start.png'});
const info = await E(() => {
  const vis = e => e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden';
  const btns = [...document.querySelectorAll('button')].filter(vis).map(b => { const r = b.getBoundingClientRect(); return `${b.id || ''}.${b.className}|${b.textContent.trim().slice(0, 24)}|${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)}`; });
  return {ver: SYNQUENZER.version, btns, demo: SYNQUENZER.project().name, rt: SYNQUENZER.runtime().fangMode};
});
console.log(JSON.stringify(info, null, 1));
console.log('errs', errs);
await br.close();
