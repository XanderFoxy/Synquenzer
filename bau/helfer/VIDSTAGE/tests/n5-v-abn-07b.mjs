// P2: what lies over the Video sheet? (DIV.show.dock.cark) – timeline after opening, both by menu tap
import { open, SONG8, OUT } from './n5-v-abn-lib.mjs';
const tag = process.argv[2] || 'r1';
const [w, h] = (process.argv[3] || '375x667').split('x').map(Number);
const {b, p, errs} = await open({w, h, touch: true, dpr: 2});
await p.evaluate(s => { SYNQUENZER.setSong(s); SYNQUENZER.vvTest({opus: true}); SYNQUENZER.openMenu(); }, SONG8);
await p.waitForTimeout(300);
const mb = await p.$('#menu button[aria-label="Video des Songs erstellen"]'); await mb.scrollIntoViewIfNeeded(); await mb.tap();
const look = () => p.evaluate(() => {
  const d = document.querySelector('.dock.cark') || document.querySelector('.cark');
  const seg = document.querySelector('#vvSheet .vvseg button'); const q = seg.getBoundingClientRect(); const hit = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2);
  const x = document.querySelector('#vvSheet .sh-x'), xq = x.getBoundingClientRect(), xcs = getComputedStyle(x);
  let dk = null; if (d) { const r = d.getBoundingClientRect(), cs = getComputedStyle(d); dk = {cls: d.className, id: d.id, z: cs.zIndex, pos: cs.position, rect: [r.left, r.top, r.width, r.height].map(Math.round), text: d.textContent.trim().slice(0, 120), parent: d.parentElement && (d.parentElement.id || d.parentElement.className)}; }
  return {dock: dk, segHit: hit && (hit.tagName + '.' + hit.className), x: [xq.left, xq.top, xq.width, xq.height].map(Math.round), xRadius: xcs.borderRadius, vvZ: getComputedStyle(document.getElementById('vvSheet')).zIndex, chain: (() => { const o = []; let e = hit; while (e && o.length < 6) { o.push(e.tagName + (e.id ? '#' + e.id : '') + '.' + e.className); e = e.parentElement; } return o; })()};
});
for (const t of [100, 600, 1500, 3000, 6000]) { await p.waitForTimeout(t === 100 ? 100 : t - [100, 600, 1500, 3000, 6000][[100, 600, 1500, 3000, 6000].indexOf(t) - 1]); const r = await look(); console.log(t, JSON.stringify(r)); if (t === 600) await p.screenshot({path: OUT + tag + '-07b-' + w + 'x' + h + '.png'}); }
console.log(errs); await b.close();
