// MK-P-05 by real taps on the display field (halt 13): EDIT, PAGE through all pages and back, CURSOR clamps, −/+ one step + clamp + one undo,
// SELECT n = page of the plan, EXIT, COMPARE (EDIT held + EXIT, two fingers), GLOBAL 1C kbOct
import {launch, open, openMk, tap, panel, ctr} from './v3-qmkp-lib.mjs';
const b = await launch(); const fails = []; const log = [];
const page = await open(b, 'X'); await openMk(page);
await page.evaluate(() => MKUI.view({ansicht: 'ganz'})); await page.waitForTimeout(400);
const T = async id => { const E = (await panel(page)).elements.find(e => e.id === id); await tap(page, ...ctr(E)); await page.waitForTimeout(60); };
const st = () => page.evaluate(() => { const p = SYNQUENZER.mkPanel(); return {mode: p.modus, seite: p.seite, cur: p.cursor, lcd: p.lcd, u: SYNQUENZER.undoInfo().n}; });
for (const MODE of ['synth', 'voc']) {
  if (MODE === 'voc') await page.evaluate(() => SYNQUENZER.mkSet(0, 'mode', 3));
  await T('exit'); await T('edit');
  const n = await page.evaluate(() => MKUI.pages().length);
  let s = await st(); const seen = [s.seite];
  await T('pg.m'); s = await st(); if (s.seite !== seen[0]) fails.push(MODE + ' PAGE − at first page moved to ' + s.seite);
  for (let k = 0; k < n + 2; k++) { await T('pg.p'); s = await st(); if (seen[seen.length - 1] !== s.seite) seen.push(s.seite); }
  const back = []; for (let k = 0; k < n + 2; k++) { await T('pg.m'); s = await st(); back.push(s.seite); }
  log.push(MODE + ' pages fwd ' + seen.length + '/' + n + ': ' + seen.map(x => x.slice(0, 2)).join(' '));
  if (seen.length !== n) fails.push(MODE + ' PAGE + reached ' + seen.length + ' of ' + n + ' pages');
  if (back[back.length - 1] !== seen[0]) fails.push(MODE + ' PAGE − did not return to first page: ' + back[back.length - 1]);
  // SELECT n = page of the plan
  const plan = await page.evaluate(() => MKUI.pages().map(p => [p[0], p[2]]));
  for (let key = 1; key <= 16; key++) { await T('s' + key); s = await st(); const want = plan.find(p => p[1] === key); if (!want || !s.seite.startsWith(want[0])) fails.push(MODE + ' SELECT ' + key + ' -> ' + s.seite + ' want ' + (want && want[0])); }
}
await page.evaluate(() => SYNQUENZER.mkSet(0, 'mode', 0));
// CUTOFF on 08 FILTER: −/+ one step, clamps, one undo per press
await T('exit'); await T('edit'); await T('s6');
for (let k = 0; k < 6; k++) { const c = await st(); if (/CUTOFF/.test(c.lcd[1])) break; await T('cur.r'); }
let s0 = await st(); log.push('08 cursor: ' + JSON.stringify(s0.lcd));
const v = () => page.evaluate(() => SYNQUENZER.mkGet(0).t[0].f.cut);
let v0 = await v(), u0 = (await st()).u; await T('yes'); let v1 = await v(), u1 = (await st()).u;
if (v1 !== Math.min(127, v0 + 1) || u1 - u0 !== 1) fails.push(`+/YES CUTOFF ${v0} -> ${v1}, undo +${u1 - u0}`);
await page.evaluate(() => SYNQUENZER.mkSet(0, 't.0.f.cut', 127)); u0 = (await st()).u; await T('yes'); v1 = await v(); u1 = (await st()).u;
if (v1 !== 127 || u1 !== u0) fails.push(`+/YES at max: ${v1}, undo +${u1 - u0}`);
// CURSOR clamps at both ends
for (let k = 0; k < 10; k++) await T('cur.l'); let c1 = await st(); for (let k = 0; k < 12; k++) await T('cur.r'); let c2 = await st();
const items = await page.evaluate(() => MKUI.pages()[MKUI.P.page][3].length);
if (c1.cur !== 0 || c2.cur !== items - 1) fails.push(`CURSOR clamp ${c1.cur}/${c2.cur} items ${items}`);
// TYP list: +/YES at the end clamps
await T('cur.l'); for (let k = 0; k < 10; k++) await T('cur.l');
const tv = () => page.evaluate(() => SYNQUENZER.mkGet(0).t[0].f.type);
for (let k = 0; k < 6; k++) await T('yes'); const tmax = await tv(); for (let k = 0; k < 6; k++) await T('no'); const tmin = await tv();
log.push(`TYP after 6×YES ${tmax}, after 6×NO ${tmin}`); if (tmax !== 3 || tmin !== 0) fails.push(`TYP clamp ${tmax}/${tmin}`);
// EXIT → SPIEL
await T('exit'); s0 = await st(); if (s0.mode !== 'spiel') fails.push('EXIT -> ' + s0.mode);
// GLOBAL 1C via PAGE and +/YES changes kbOct
await T('global'); await T('pg.p'); await T('pg.p'); s0 = await st(); const o0 = await page.evaluate(() => S.tracks[0].kbOct || 4); await T('yes'); const o1 = await page.evaluate(() => S.tracks[0].kbOct || 4);
log.push('GLOBAL ' + s0.seite + ' kbOct ' + o0 + ' -> ' + o1); if (o1 !== o0 + 1) fails.push('GLOBAL 1C +/YES kbOct ' + o0 + ' -> ' + o1);
await T('exit');
// COMPARE: change CUTOFF, then EDIT held (finger 1) + EXIT tap (finger 2)
const P = await panel(page); log.push('dot before compare ' + await page.evaluate(() => !!document.querySelector('#synthSheet .chg'))); const eE = P.elements.find(e => e.id === 'edit'), xE = P.elements.find(e => e.id === 'exit');
await page.evaluate(() => { SYNQUENZER.initSound(0); }); await page.waitForTimeout(500); await page.evaluate(() => MKUI.view({ansicht: 'ganz'})); await page.waitForTimeout(300); log.push('init: ' + await page.evaluate(() => S.tracks[0].sound.name + ' origin ' + S.tracks[0].sound.origin)); await page.evaluate(() => SYNQUENZER.mkSet(0, 't.0.f.cut', 40)); await page.waitForTimeout(100); const snd0 = await page.evaluate(() => JSON.stringify(SYNQUENZER.mkGet(0)));
const cdp = page.cdp, pt = (e, id) => ({x: e.px.x + e.px.w / 2, y: e.px.y + e.px.h / 2, id, radiusX: 1, radiusY: 1, force: 1});
await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [pt(eE, 1)]}); await page.waitForTimeout(80);
await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [pt(eE, 1), pt(xE, 2)]}); await page.waitForTimeout(60);
await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [pt(eE, 1)]}); await page.waitForTimeout(200);
const cmpHeld = await page.evaluate(() => ({lcd: SYNQUENZER.mkPanel().lcd, ab: UI.ab && UI.ab.side, cut: SYNQUENZER.mkGet(0).t[0].f.cut, mode: MKUI.P.mode})); log.push('COMPARE while EDIT held: ' + JSON.stringify(cmpHeld));
await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await page.waitForTimeout(200);
const cmp = await page.evaluate(() => ({lcd: SYNQUENZER.mkPanel().lcd, ab: UI.ab && UI.ab.side, cut: SYNQUENZER.mkGet(0).t[0].f.cut}));
log.push('COMPARE: ' + JSON.stringify(cmp));
if (!/COMPARE/.test(cmp.lcd[1])) fails.push('COMPARE not shown: ' + JSON.stringify(cmp));
await T('exit'); await page.waitForTimeout(200);
const cmp2 = await page.evaluate(() => ({lcd: SYNQUENZER.mkPanel().lcd, ab: UI.ab && UI.ab.side, snd: JSON.stringify(SYNQUENZER.mkGet(0))}));
if (cmp2.snd !== snd0) fails.push('after COMPARE + EXIT the sound is not the edited one');
log.push('after EXIT: ' + JSON.stringify(cmp2.lcd) + ' ab ' + cmp2.ab);
console.log(log.join('\n')); console.log('FAILS', fails.length); for (const x of fails) console.log('  ' + x); console.log('errs', JSON.stringify(page.errs));
await b.close();
