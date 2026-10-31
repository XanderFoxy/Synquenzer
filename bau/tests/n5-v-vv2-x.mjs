import { open } from './n5-v-lib.mjs';
const {b, p} = await open({w: 390, h: 844, touch: true});
const r = await p.evaluate(() => { SYNQUENZER.vvOpen(); const x = document.querySelector('#vvSheet .sh-x'), q = x.getBoundingClientRect(), h = x.parentNode.getBoundingClientRect(); const cs = getComputedStyle(x); return {q: [q.left, q.top, q.width, q.height], h: [h.left, h.top, h.width, h.height], iw: innerWidth, pr: getComputedStyle(x.parentNode).paddingRight, ov: getComputedStyle(x.parentNode).overflow, at: document.elementFromPoint(q.left + q.width / 2 + 21, q.top + q.height / 2 - 21).outerHTML.slice(0, 80), br: cs.borderRadius}; });
console.log(JSON.stringify(r)); await b.close();
