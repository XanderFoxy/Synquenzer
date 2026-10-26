import {launch, open, box, tap, drag, lcd, panel, undoN, mkg, leds, J, pickPop} from './v3-qa-mk3-lib.mjs';
let fails = 0; const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
const b = await launch();
const {ctx, page, errs} = await open('L1');
await page.evaluate(async () => { const D = SYNQUENZER; D.mkSet(0, 'mode', 1); D.mkSet(0, 't.0.f.cut', 100); D.mkSet(0, 't.1.f.cut', 50); await D.saveSound(0, 'QA Orig', 'new'); });
await page.waitForTimeout(300);
await page.evaluate(() => { const s = SYNQUENZER.library().find(x => x.name === 'QA Orig'); applySound(0, deep(s)); }); await page.waitForTimeout(400);
await page.evaluate(() => MKUI.setWahl(1, 5)); await tap(page, 'timbre'); // T2
const orig = () => page.evaluate(() => MKUI.panelInfo().orig);
await drag(page, 'k1', 20, 6); const m1 = await mkg(page), o1 = await orig();
// move T2 cutoff back to its stored value 50 via SHIFT + OKT (last knob ±1) until 50
let guard = 0; while ((await mkg(page)).t[1].f.cut !== 50 && guard++ < 40) { const c = (await mkg(page)).t[1].f.cut; await tap(page, 'shift'); await tap(page, c > 50 ? 'octd' : 'octu'); }
const o2 = await orig(), m2 = await mkg(page);
ok('ORIGINAL-LED mit T2: aus nach Änderung, an bei T2 = gespeichertem Wert 50', !o1 && o2 && m2.t[1].f.cut === 50 && m2.t[0].f.cut === 100, J({cut2: m1.t[1].f.cut, o1, back: m2.t[1].f.cut, o2}));
// ◎ marks: STIMME (mode 1 differs from INIT) and STIMMUNG (scale 5)
await page.evaluate(() => { SYNQUENZER.mkSet(0, 'scale', 5); UI.wia = true; MKUI.render(); });
const wia = await page.evaluate(() => [[...document.querySelectorAll('#synthSheet .mkx[data-k="w1"] .mtk')].map((t, k) => t.classList.contains('mwd') ? k : -1).filter(k => k >= 0), [...document.querySelectorAll('#synthSheet .mkx[data-k="w2"] .mtk')].map((t, k) => t.classList.contains('mwd') ? k : -1).filter(k => k >= 0)]);
ok('◎: Punkt an STIMME (Modus) und STIMMUNG (Stimmung)', wia[0].includes(0) && wia[1].includes(9), J(wia));
console.log('errs', errs);
await ctx.close(); await b.close();
