import { open, NEW, OUT } from './v3-mk0rg2-lib.mjs';
for (const vp of ['P1', 'L1']) {
const {p, errs, close} = await open(NEW, vp);
const cdp = await p.context().newCDPSession(p);
const kb = await p.evaluate(() => { const q = document.getElementById('kb').getBoundingClientRect(); return {x: q.x, y: q.y, w: q.width, h: q.height}; });
await p.evaluate(() => window.SYNQUENZER.clearLog());
const map = {};
for (let x = kb.x + 4; x < kb.x + kb.w; x += 9) {
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y: kb.y + kb.h - 12, id: 1}]});
  await p.waitForTimeout(40);
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
  await p.waitForTimeout(20);
  const L = await p.evaluate(() => window.SYNQUENZER.noteLog(5)); const last = L[L.length - 1];
  const k = last ? JSON.stringify(last) : 'none'; if (!(k in map)) map[k] = Math.round(x);
  await p.evaluate(() => window.SYNQUENZER.clearLog());
}
console.log(vp, Object.entries(map).map(([k, v]) => v + ' ' + k).join('\n'));
console.log(errs);
await close();
}
