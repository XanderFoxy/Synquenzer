// QA V2e′ t6: own clip by touch — Zell-Blatt, toast [Bearbeiten] → ROLLE, drums → SCHRITTE, glass, long block split, undo kinds
import { openVp, T, SETUP55, PREP, sleep, mkCheck } from './v3-qa-v2e2-lib.mjs';
const VP = process.argv[2] || 'P1';
const {check, done} = mkCheck();
const {b, p, errs, cdp} = await openVp(VP);
const t = T(p, cdp), E = t.E;
await E(SETUP55(true));
await E(() => window.SYNQUENZER.songView(true)); await sleep(300);
const cell = async (tr, bar) => { const i = await t.info(); const row = i.rows.findIndex((r, k) => k > 0 && E && false); return E(([tr, bar]) => { const I = window.SYNQUENZER.svLayoutInfo(); const rows = I.rows; /* map row tag → track */ const tags = rows.slice(1, -2); const sv = window.SV || null; return {I}; }, [tr, bar]); };
// rows → tracks via SV.rows (global lexical)
const cellXY = (tr, bar) => E(([tr, bar]) => { const I = window.SYNQUENZER.svLayoutInfo(); const r = SV.rows.indexOf(tr); if (r < 0) return null; return {x: I.canvas.x + bar * I.cellW - I.x0 + I.cellW / 2, y: I.canvas.y + I.rulerH + r * I.rowH + I.rowH / 2}; }, [tr, bar]);
const hold = async (x, y, ms = 560) => { await t.down(x, y); await sleep(ms); await t.up(); await sleep(300); };
const C0 = await t.clips(), S0 = await E(() => JSON.stringify(window.SYNQUENZER.song()));
// (a) Synth 1 in T5 (bar 4)
let c = await cellXY(0, 4); console.log('cell', c);
await hold(c.x, c.y);
let btns = await t.popBtns(); console.log('sheet', btns);
check(`${VP} N7S-47 hold → Zell-Blatt [own][whole][x]`, JSON.stringify(btns.filter(x => x !== 'x')) === '["own","whole"]', btns);
check(`${VP} K2-24 hold alone changes nothing`, (await E(() => JSON.stringify(window.SYNQUENZER.song()))) === S0);
await t.tapPop('Eigener Clip'); await sleep(300);
const toast = await E(() => ({txt: document.getElementById('toast').textContent, btns: [...document.querySelectorAll('#toast button')].map(b => b.textContent)}));
console.log('toast', toast);
const u1 = await t.undo(); console.log('undo top', JSON.stringify(u1.top));
check(`${VP} N7S-47 (a) scene clips deep-equal`, (await t.clips()) === C0);
const st = await E(() => { const s = window.SYNQUENZER.song(); return s.lanes[0]; });
console.log('bass lane', JSON.stringify(st));
// [Bearbeiten] in the toast → ROLLE on the own clip
const tb = await E(() => { const b = [...document.querySelectorAll('#toast button')].find(b => /Bearbeiten/.test(b.textContent)); if (!b || !b.offsetWidth) return null; const r = b.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}; });
check(`${VP} toast has [Bearbeiten]`, !!tb, toast);
if (tb) { await t.tap(tb.x, tb.y, 500); }
const ro = await E(() => { const r = window.SYNQUENZER.roll(); return r ? {own: r.own, t: r.track, s: r.slot, title: (document.querySelector('#rollSheet .sh-title') || {}).textContent} : null; });
console.log('roll', ro);
check(`${VP} 9.2 toast [Bearbeiten] → ROLLE on the own clip`, ro && ro.own, ro);
// close roll
{ const r = await t.rect('#rollSheet .sh-x'); if (r) await t.tap(r.cx, r.cy, 400); }
// drums own clip: DRUMS track 4 in T3 (bar 2: strophe drums Sz1)
c = await cellXY(4, 2);
await hold(c.x, c.y);
await t.tapPop('Eigener Clip'); await sleep(300);
const dOwn = await E(() => window.SYNQUENZER.ownClip(4, 2));
check(`${VP} drums own clip made`, !!dOwn, dOwn);
c = await cellXY(4, 2);
await t.tap(c.x, c.y, 600);
const ed = await E(() => ({editor: window.SYNQUENZER.runtime().editor, roll: !!window.SYNQUENZER.roll(), steps: !!document.querySelector('#stepSheet:not([hidden]), .steps-sheet:not([hidden])'), vs: window.SYNQUENZER.viewState ? window.SYNQUENZER.viewState() : null}));
console.log('drum tap', JSON.stringify(ed).slice(0, 300));
check(`${VP} 9.2 tap on a drums own clip → SCHRITTE`, ed.editor === 'steps' || ed.steps, ed.editor);
await p.screenshot({path: 'v3-qa-v2e2-t6-drumroll.png'});
{ const r = await t.rect('#rollSheet .sh-x'); if (r) await t.tap(r.cx, r.cy, 400); }
console.log('roll closed?', await E(() => !window.SYNQUENZER.roll() || !document.getElementById('rollSheet').classList.contains('open')));
// glass view: hold on a reference cell works the same
await E(() => window.SYNQUENZER.songViewMode('glass')); await sleep(200);
c = await cellXY(1, 3);
console.log('glass dbg', c, await t.songOn(), await t.pop(), JSON.stringify((await t.info()).canvas), (await t.info()).x0, await E(() => window.SYNQUENZER.runtime().editor));
await hold(c.x, c.y);
console.log('after hold', await t.pop(), JSON.stringify((await t.info()).cell));
btns = await t.popBtns();
check(`${VP} glass: hold → Zell-Blatt`, JSON.stringify(btns.filter(x => x !== 'x')) === '["own","whole"]', btns);
await t.tapPop('Abbrechen'); await sleep(200);
await E(() => window.SYNQUENZER.songViewMode('squares')); await sleep(200);
console.log('errors', errs);
check('0 console errors', errs.length === 0, errs);
await b.close();
process.exit(done());
