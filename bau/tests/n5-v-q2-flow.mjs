// QA musiker VV2: Xander's flow by touch — tap the yellow header → Video [Matrix]; stripe; undo; select bars → ⋯ → Video [Spur …];
// hold a lane entry → „Im Video zeigen“; argv: P | L
import { open, buildSong } from './n5-v-qm-lib.mjs';
import fs from 'fs';
const OUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/n5-v-q2-out/';
const L = process.argv[2] === 'L', [W, H, N] = L ? [844, 390, 'L1'] : [390, 844, 'P1'];
const {b, p, errs} = await open({w: W, h: H, touch: true, dpr: 3});
const res = {N};
res.setup = await buildSong(p);
await p.evaluate(() => setSongView(true)); await p.waitForTimeout(600);
const li = () => p.evaluate(() => svLayoutInfo());
const shot = n => p.screenshot({path: OUT + 'flow-' + N + '-' + n + '.png'});
const tapXY = async (x, y, w = 350) => { await p.touchscreen.tap(x, y); await p.waitForTimeout(w); };
const tapSel = async (sel, w = 350) => { const e = await p.$(sel); if (!e) throw new Error('fehlt ' + sel); const q = await e.boundingBox(); await tapXY(q.x + q.width / 2, q.y + q.height / 2, w); return q; };
const state = () => p.evaluate(() => ({video: S.song.video ? JSON.parse(JSON.stringify(S.song.video)) : null, pop: UI.pop ? UI.pop.name : null, vvS: SV.vvS, rulerH: SV.rulerH, rowH: SV.rowH, toast: EL.toast ? EL.toast.innerText : '', undo: SYNQUENZER.undoInfo ? SYNQUENZER.undoInfo() : null}));
let I = await li(); res.li0 = {rulerH: I.rulerH, rowH: I.rowH, cv: I.canvas, marks: I.marks, x0: I.x0, cellW: I.cellW};
const markXY = (I, name) => { const m = I.marks.find(m => m.label.startsWith(name)); return m && [I.canvas.x + (m.x0 + m.x1) / 2, I.canvas.y + 2 + (I.rulerH - (I.rulerH > 24 ? 8 : 0) - 4) / 2]; };
await shot('0-song');
// 1) tap on REFRAIN header
let xy = markXY(I, 'REFRAIN'); res.tapRefrain = xy;
await tapXY(xy[0], xy[1], 500);
res.s1 = await state();
await shot('1-markenblatt');
res.row1 = await p.evaluate(() => [...document.querySelectorAll('.pop .vvdr button')].map(b => { const q = b.getBoundingClientRect(); return {t: b.textContent, on: b.classList.contains('on'), x: q.x, y: q.y, w: q.width, h: q.height}; }));
await tapSel('.pop .vvdr button[data-a="vv-matrix"]', 500);
res.s2 = await state();
res.row2 = await p.evaluate(() => [...document.querySelectorAll('.pop .vvdr button')].map(b => ({t: b.textContent, on: b.classList.contains('on')})));
await shot('2-matrix');
// stripe pixels: canvas row at ruler - 4 px under the Refrain mark
I = await li(); res.li1 = {rulerH: I.rulerH, rowH: I.rowH, marks: I.marks};
const px = async (x, y) => p.evaluate(([x, y]) => { const c = SV.cv, k = c.width / c.getBoundingClientRect().width, r = c.getBoundingClientRect(); const d = c.getContext('2d').getImageData(Math.round((x - r.left) * k), Math.round((y - r.top) * k), 1, 1).data; return [d[0], d[1], d[2]]; }, [x, y]);
const mR = I.marks.find(m => m.label.startsWith('REFRAIN'));
res.stripePx = await px(I.canvas.x + (mR.x0 + mR.x1) / 2, I.canvas.y + I.rulerH - 4);
// 2) close sheet ✕, toast undo
res.toastBtns = await p.evaluate(() => [...document.querySelectorAll('#toast button, .toast button')].map(b => b.textContent));
const ub = await p.$('#toast button, .toast button');
if (ub) { const q = await ub.boundingBox(); res.toastBtnBox = q; await tapXY(q.x + q.width / 2, q.y + q.height / 2, 500); }
res.s3 = await state();
await shot('3-undo');
// redo
await p.evaluate(() => SYNQUENZER.redo ? SYNQUENZER.redo() : redo()); await p.waitForTimeout(300);
res.s4 = await state();
if (res.s4.pop) { const x = await p.$('.pop .ms-x'); if (x) await tapSel('.pop .ms-x', 400); }
// 3) select bars 3–4 (Strophe: 2..5): tap STROPHE header (chosen), tap again (bar selected), tap another bar → range
I = await li();
xy = markXY(I, 'STROPHE'); await tapXY(xy[0], xy[1], 450);
res.s5 = await state();
const barX = (I, bar) => I.canvas.x + bar * I.cellW - I.x0 + I.cellW / 2;
const ry = I.canvas.y + 2 + (I.rulerH - 8 - 4) / 2;
await tapXY(barX(I, 2), ry, 450); res.s6 = await state(); res.sel6 = (await li()).sel;
await tapXY(barX(I, 3), ry, 450); res.sel7 = (await li()).sel;
await shot('4-sel');
res.rangeBar = await p.evaluate(() => { const r = document.getElementById('rangeBar'); return r ? {hidden: r.hidden, btns: [...r.querySelectorAll('button')].map(b => b.dataset.a + ':' + b.textContent.trim())} : null; });
await tapSel('#rangeBar button[data-a="more"]', 500);
res.more = await p.evaluate(() => ({pop: UI.pop && UI.pop.name, rows: [...document.querySelectorAll('.pop .vvdr button')].map(b => { const q = b.getBoundingClientRect(); return {t: b.textContent, on: b.classList.contains('on'), w: q.width, h: q.height, y: q.y}; })}));
await shot('5-more');
await tapSel('.pop .vvdr button[data-a="vv-spur"]', 500);
res.spurList = await p.evaluate(() => ({pop: UI.pop && UI.pop.name, items: [...document.querySelectorAll('.pop button[data-t]')].map(b => { const q = b.getBoundingClientRect(); return {t: b.dataset.t, txt: b.textContent, w: q.width, h: q.height, y: q.y, bot: q.bottom}; })}));
await shot('6-spurliste');
const items = res.spurList.items; const mk = items.find(x => x.t === '3') || items[0];
await tapSel(`.pop button[data-t="${mk.t}"]`, 500);
res.s8 = await state();
await shot('7-spur');
// 4) hold a lane entry (Synth 2 at bar 7 = index 6) → Zell-Blatt → „Im Video zeigen“
await p.evaluate(() => { SV.sel = null; rangeBarSync && rangeBarSync(); UI.dirty.song = true; }); await p.waitForTimeout(200);
I = await li();
const row = I.rows.indexOf(I.rows.find(r => /2/.test(r) && r !== 'TAKT')); res.rows = I.rows;
const rIdx = I.rows.findIndex((r, k) => k > 0 && k - 1 >= 0 && r) ; // first track row
const cellY = (k) => I.canvas.y + I.rulerH + (k + .5) * I.rowH;
// track index 1 (Synth 2) is in SV.rows at position:
const pos = await p.evaluate(() => SV.rows.indexOf(1));
const hx = barX(I, 6), hy = cellY(pos);
const c = await p.context().newCDPSession(p);
await c.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: hx, y: hy}]});
await p.waitForTimeout(650);
await c.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await p.waitForTimeout(500);
res.hold = await p.evaluate(() => ({pop: UI.pop && UI.pop.name, opt: (() => { const e = document.querySelector('.pop button[data-a="vvshow"]'); if (!e) return null; const q = e.getBoundingClientRect(); return {txt: e.innerText, w: q.width, h: q.height, y: q.y, bot: q.bottom}; })(), cell: SV.cell}));
await shot('8-zelle');
if (res.hold.opt) { await tapSel('.pop button[data-a="vvshow"]', 500); }
res.s9 = await state();
await shot('9-shown');
res.errs = errs;
console.log(JSON.stringify(res, null, 1));
fs.writeFileSync(OUT + 'flow-' + N + '.json', JSON.stringify(res, null, 1));
await b.close();
