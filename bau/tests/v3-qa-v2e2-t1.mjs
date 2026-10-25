// QA V2e′ t1: haptic sequence vs B.5 table, timings (b)(d), cancel paths
import { openVp, T, SETUP55, PREP, RESET, sleep, mkCheck } from './v3-qa-v2e2-lib.mjs';
const VP = process.argv[2] || 'P1';
const {check, done} = mkCheck();
const {b, p, errs, cdp} = await openVp(VP);
const t = T(p, cdp), E = t.E;
await E(SETUP55(false)); await E(() => window.SYNQUENZER.songView(false)); await sleep(300);
await E(PREP);
const hapUI = await E(() => { try { return window.SYNQUENZER.runtime().haptics; } catch (e) { return 'n/a'; } });
console.log('haptics flag', hapUI);
const P0 = await t.full();
const k0 = await t.key(0); console.log('key0', k0);
const hap = async () => E(() => ({hap: window.__hap.map(h => [Math.round(h[0] - window.__down), h[1]]), open: window.__open ? Math.round(window.__open - window.__down) : null, trans: (window.__trans || []).map(x => [Math.round(x[0] - window.__down), x[1]])}));

// (b) hold still until open, then release
await E(RESET);
await t.down(k0.x, k0.y); await sleep(1200);
let h = await hap(); console.log('(b) before release', JSON.stringify(h));
check('(b) haptics at open: pop then tick', h.hap.length === 2 && h.hap[0][1] === 14 && h.hap[1][1] === 6 && Math.abs(h.hap[1][0] - h.open) < 20, h);
await t.up(); await sleep(400);
h = await hap(); console.log('(b) after release', JSON.stringify(h));
check('B.5 #11 Abbruch (Schutz): no haptic on cancel', h.hap.length === 2, h.hap);
check('(b) deep-equal', (await t.full()) === P0);

// #7 drag before open, release -> abort; haptics should be pop only
await E(RESET);
await t.down(k0.x, k0.y); await sleep(480);
await t.glide(k0.x, k0.y, k0.x + 30, k0.y + 5, 3, 10); await t.up(); await sleep(400);
h = await hap(); console.log('#7', JSON.stringify(h));
check('B.5 #7 abort before open: haptic only pop', h.hap.length === 1 && h.hap[0][1] === 14, h.hap);

// full drop: open by spring, move to canvas, ticks per n, release on content -> sheet, Einfügen -> snap
await E(RESET);
await t.down(k0.x, k0.y); await sleep(480);
const cr = await t.rect('.corner.sw');
await t.glide(k0.x, k0.y, cr.cx, cr.cy, 6, 16);
await sleep(100);
let inf = await t.info();
const cv = inf.canvas;
await t.glide(cr.cx, cr.cy, cv.x + 2 * 36 + 5, cv.y + cv.h * .5, 10, 30);
await sleep(200);
h = await hap(); console.log('drag', JSON.stringify(h), JSON.stringify(await t.drag()));
await t.up(); await sleep(300);
console.log('pop', await t.pop(), await t.popBtns());
const hb = (await hap()).hap.length;
await t.tapPop('Einfügen'); await sleep(500);
h = await hap(); console.log('after insert', JSON.stringify(h));
const after = h.hap.slice(hb);
check('#13 snap on drop exactly once', after.filter(x => x[1] === 10).length === 1, after);
const want = await E(() => { const Q = window.SYNQUENZER; const s = JSON.stringify(Q.song()); return s; });
await E(() => window.SYNQUENZER.undo()); await sleep(200);
check('undo → deep-equal', (await t.full()) === P0);
const ref = await E(() => { const Q = window.SYNQUENZER; Q.placePart(0, 2, 'insert'); const s = JSON.stringify(Q.song()); Q.undo(); return s; });
check('N7S-42 Einfügen == placePart(0,2,insert)', want === ref, want === ref ? '' : [want.slice(0, 300), ref.slice(0, 300)]);
console.log('errors', errs);
check('0 console errors', errs.length === 0, errs);
await b.close();
process.exit(done());
