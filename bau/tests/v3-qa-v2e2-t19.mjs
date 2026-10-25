// QA V2e′ t19: mark source — lift, 12 px threshold, move, ⧉ geometry + 250 ms copy, abort on transport, haptics
import { openVp, T, SETUP55, PREP, RESET, sleep, mkCheck } from './v3-qa-v2e2-lib.mjs';
const VP = process.argv[2] || 'P1';
const {check, done} = mkCheck();
const {b, p, errs, cdp} = await openVp(VP);
const t = T(p, cdp), E = t.E;
await E(SETUP55(true)); await E(() => window.SYNQUENZER.songView(true)); await sleep(300);
await E(PREP);
const P0 = await t.full();
let inf = await t.info();
const mk = inf.marks.find(m => /STROPHE/.test(m.label)); console.log('marks', JSON.stringify(inf.marks));
const mx = inf.canvas.x + (mk.x0 + mk.x1) / 2, my = inf.canvas.y + inf.rulerH / 2;
// hold + 10 px (between 8 and 12) + release → nothing moved, no sheet?
await t.down(mx, my); await sleep(520);
await t.glide(mx, my, mx + 10, my, 3, 16);
let d = await t.drag(); console.log('10 px', JSON.stringify(d));
check(`${VP} mark lifted + 10 px: not yet dragging (≥ 12 px rule)`, !d, d);
await t.up(); await sleep(300);
console.log('pop after 10px', await t.pop());
check(`${VP} 10 px then release: data equal`, (await t.full()) === P0);
{ const x = await t.rect('#popLayer .pop .ms-x'); if (x) await t.tap(x.cx, x.cy, 300); }
// hold + move to ⧉ for 300 ms → copy; geometry of ⧉
await E(RESET);
await t.down(mx, my); await sleep(520);
await t.glide(mx, my, mx + 20, my + 20, 3, 16);
const sw = await E(() => { const e = document.querySelector('.sv-sw'); const r = e.getBoundingClientRect(); return {x: r.x, y: r.y, w: r.width, h: r.height, txt: e.textContent, cls: e.className}; });
console.log('⧉ field', sw);
if (VP === 'P1') check(`${VP} K2-26 ⧉ at the place of CLIPS ⇄ (x 8…72, 64×40)`, Math.abs(sw.x - 8) <= 1 && Math.abs(sw.w - 64) <= 1 && Math.abs(sw.h - 40) <= 1 && /⧉/.test(sw.txt), sw);
await t.glide(mx + 20, my + 20, sw.x + sw.w / 2, sw.y + sw.h / 2, 4, 16);
await sleep(150);
d = await t.drag(); check(`${VP} 150 ms over ⧉: not yet copy`, d && !d.copy, d);
await sleep(200);
d = await t.drag(); check(`${VP} ≥ 250 ms over ⧉: copy`, d && d.copy, d);
inf = await t.info();
await t.glide(sw.x + sw.w / 2, sw.y + sw.h / 2, inf.canvas.x + 6 * 36 + 3 - inf.x0, inf.canvas.y + 100, 8, 16);
d = await t.drag(); console.log('target', JSON.stringify(d));
await t.up(); await sleep(500);
let s = await E(() => window.SYNQUENZER.song());
console.log('after copy', s.marks.map(m => m.part + '@' + m.a + '/' + m.len).join(' '), 'bars', s.bars);
check(`${VP} copy at 6, original stays`, s.marks.filter(m => m.part === 'P1').length === 2, s.marks.map(m => m.part + '@' + m.a));
const ui = await t.undo(); check(`${VP} one undo (song)`, ui.top && ui.top.kind === 'song', ui.top);
const sw2 = await E(() => document.querySelector('.sv-sw').textContent);
check(`${VP} CLIPS ⇄ back`, /CLIPS/.test(sw2), sw2);
const UN = (await t.undo()).n;
await E(() => window.SYNQUENZER.undo()); await sleep(200);
check(`${VP} undo → deep-equal`, (await t.full()) === P0);
// mark drag released over the transport → abort, song stays open (from), data equal
await t.down(mx, my); await sleep(520);
await t.glide(mx, my, mx + 30, my + 40, 4, 16);
const tr = await t.rect('.sv-play');
await t.glide(mx + 30, my + 40, tr.cx, tr.cy, 4, 16); await t.up(); await sleep(400);
check(`${VP} mark released over transport → abort, song still open, deep-equal`, (await t.songOn()) && (await t.full()) === P0 && !(await E(() => window.SYNQUENZER.runtime().playing)), [await t.songOn()]);
const hp = await E(() => window.__hap.map(h => h[1]));
console.log('haptics', hp);
check('0 console errors', errs.length === 0, errs);
await b.close();
process.exit(done());
