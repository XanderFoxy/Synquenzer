// QA V2e′ t10: L1/L2 — song view already open, drag a part key from the side field; drop / abort on side field
import { openVp, T, SETUP55, PREP, RESET, sleep, mkCheck } from './v3-qa-v2e2-lib.mjs';
const VP = process.argv[2] || 'L1';
const {check, done} = mkCheck();
const {b, p, errs, cdp} = await openVp(VP);
const t = T(p, cdp), E = t.E;
await E(SETUP55(false)); await E(() => window.SYNQUENZER.songView(true)); await sleep(300);
await E(PREP);
const P0 = await t.full();
const k0 = await t.key(0); console.log('key0 (side field)', k0);
check(`${VP} part key visible with the song view open`, !!k0);
const rows0 = (await t.info()).rows;
// 1) hold, release without moving → Teil-Blatt
await t.down(k0.x, k0.y); await sleep(800); await t.up(); await sleep(300);
let pc = await t.pop();
check(`${VP} hold + release (song open) → Teil-Blatt, song stays`, (pc || '').includes('psheet') && (await t.songOn()), pc);
if (pc) { const x = await t.rect('#popLayer .pop .ps-x'); if (x) await t.tap(x.cx, x.cy, 300); else await E(() => window.SYNQUENZER.closePop && 0); }
check(`${VP} deep-equal`, (await t.full()) === P0);
// 2) hold 1200 ms still: song already open → nothing auto, still lift; release → Teil-Blatt?
await E(RESET);
await t.down(k0.x, k0.y); await sleep(1200);
const dl = await t.drag(); console.log('hold 1200 (song open):', JSON.stringify(dl));
await t.up(); await sleep(300); pc = await t.pop(); console.log('pop after 1200', pc);
if (pc) { const x = await t.rect('#popLayer .pop .ps-x'); if (x) await t.tap(x.cx, x.cy, 300); }
// 3) hold, drag to the canvas bar 3 → sheet → Einfügen
await t.down(k0.x, k0.y); await sleep(500);
let inf = await t.info();
await t.glide(k0.x, k0.y, inf.canvas.x + 3 * 36 + 10 - inf.x0, inf.canvas.y + inf.canvas.h * .5, 10, 16);
let d = await t.drag(); console.log('over canvas', JSON.stringify(d));
check(`${VP} n = 3 at x = 3·36+10`, d && d.n === 3 && d.st === 'ready', d);
await t.up(); await sleep(300);
pc = await t.pop(); const bt = await t.popBtns();
check(`${VP} drop on content → Ersetzen/Einfügen-Blatt`, (pc || '').includes('plsheet') && bt.includes('insert'), [pc, bt]);
await t.tapPop('Einfügen'); await sleep(500);
const s = await E(() => window.SYNQUENZER.song());
check(`${VP} inserted at bar 3`, s.marks.some(m => m.a === 3 && m.len === 4), s.marks.map(m => m.part + '@' + m.a));
check(`${VP} rows unchanged`, JSON.stringify((await t.info()).rows) === JSON.stringify(rows0));
await E(() => window.SYNQUENZER.undo()); await sleep(200);
check(`${VP} undo → deep-equal`, (await t.full()) === P0);
// 4) drag to canvas, then back onto the side field and release → abort, song stays open, data equal
await t.down(k0.x, k0.y); await sleep(500);
inf = await t.info();
await t.glide(k0.x, k0.y, inf.canvas.x + 100, inf.canvas.y + 80, 8, 16);
await t.glide(inf.canvas.x + 100, inf.canvas.y + 80, k0.x, k0.y - 30, 8, 16);
d = await t.drag(); console.log('back over side', JSON.stringify(d));
await t.up(); await sleep(400);
check(`${VP} release over the side field → abort, song open, deep-equal, no sheet`, (await t.songOn()) && !(await t.pop()) && (await t.full()) === P0, [await t.songOn(), await t.pop()]);
// 5) from the clip view in L: spring at the SONG ⇄ field
await E(() => window.SYNQUENZER.songView(false)); await sleep(300);
const k1 = await t.key(0);
await E(RESET);
await t.down(k1.x, k1.y); await sleep(480);
const cr = await t.rect('.corner.sw'); console.log('corner', cr);
await t.glide(k1.x, k1.y, cr.cx, cr.cy, 4, 16);
await sleep(50);
d = await t.drag(); console.log('spring L', JSON.stringify(d));
check(`${VP} spring at SONG ⇄ opens`, d && d.why === 'spring' && (await t.songOn()), d);
await t.up(); await sleep(400);
check(`${VP} release in guard → clip view, deep-equal`, !(await t.songOn()) && (await t.full()) === P0);
console.log('errors', errs);
check('0 console errors', errs.length === 0, errs);
await b.close();
process.exit(done());
