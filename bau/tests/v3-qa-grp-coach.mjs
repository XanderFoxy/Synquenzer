import {open, OUT, tapEl, tapText} from './v3-qa-grp-lib.mjs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const {br, p, errs, E} = await open({mic: false});
await E(() => { SYNQUENZER.setBpm(120); });
await tapText(p, 'button.scn', /^▶\s*1/); await p.waitForFunction(() => SYNQUENZER.runtime().playing);
await tapEl(p, '#segTr'); await sleep(300);
const info = await E(() => {
  const b = [...document.querySelectorAll('button.scn')][1], rc = b.getBoundingClientRect(); const el = document.elementFromPoint(rc.x + rc.width / 2, rc.y + rc.height / 2);
  const chain = []; for (let e = el; e && e !== document.body; e = e.parentElement) { const cs = getComputedStyle(e); chain.push({tag: e.tagName, id: e.id, cls: e.className, op: cs.opacity, vis: cs.visibility, disp: cs.display, pe: cs.pointerEvents, z: cs.zIndex, pos: cs.position, rect: (r => [r.x, r.y, r.width, r.height].map(Math.round))(e.getBoundingClientRect()), hidden: e.hidden}); }
  return chain;
});
console.log(JSON.stringify(info, null, 1));
await p.screenshot({path: OUT + 'coach.png'});
// try to see the coach after time
for (const ms of [1000, 3000, 6000, 12000]) { await sleep(ms === 1000 ? 1000 : ms / 2); const r = await E(() => { const b = [...document.querySelectorAll('button.scn')][1], rc = b.getBoundingClientRect(); const el = document.elementFromPoint(rc.x + rc.width / 2, rc.y + rc.height / 2); return el === b || b.contains(el) ? 'button' : (el.textContent || '').trim().slice(0, 30); }); console.log('t', ms, r); }
await br.close();
