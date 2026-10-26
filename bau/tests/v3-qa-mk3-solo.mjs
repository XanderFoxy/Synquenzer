import {launch, open, tap, drag, lcd, panel, undoN, mkg, leds, J, pickPop, liveTap, liveDb} from './v3-qa-mk3-lib.mjs';
const b = await launch();
const {ctx, page, errs} = await open('L1');
await page.evaluate(async () => { ensureAudio(); await new Promise(q => setTimeout(q, 1500)); SYNQUENZER.keyOn(60); await new Promise(q => setTimeout(q, 200)); SYNQUENZER.keyOff(60); await new Promise(q => setTimeout(q, 300)); });
await page.evaluate(() => { const E = AU.synth[0]; window.__solo = []; const pm = E.node.port.postMessage.bind(E.node.port); E.node.port.postMessage = m => { if (m && m.mkSolo != null) window.__solo.push(m.mkSolo); return pm(m); }; });
await liveTap(page);
const play = async () => { await page.evaluate(() => inputDown(60, 'q', .9)); const d = await liveDb(page); await page.evaluate(() => inputUp('q')); await page.waitForTimeout(400); return Math.round(d * 10) / 10; };
console.log('Single INIT, level', await play(), 'ctx', await page.evaluate(() => AU.ctx.state));
// STIMME -> EINZELN/SCHICHT list -> Schicht (a gesture with one undo)
await page.evaluate(() => MKUI.setWahl(1, 0)); await tap(page, 'k1'); await pickPop(page, /Schicht/);
console.log('mode', (await mkg(page)).mode, 'undo n', await undoN(page));
await tap(page, 'timbre');   // T2
await tap(page, 'shift'); await tap(page, 'timbre');   // solo T2
console.log('panel', J(await panel(page)), 'leds', await leds(page), 'sent', await page.evaluate(() => window.__solo));
console.log('Schicht solo T2, level', await play());
// undo the mode change -> Einzeln
await page.evaluate(() => SYNQUENZER.undo()); await page.waitForTimeout(300);
const p = await panel(page);
console.log('after undo: mode', (await mkg(page)).mode, 'panel.solo', p.solo, 'timbre', p.timbre, 'P.solo', await page.evaluate(() => MKUI.P.solo), 'sent', await page.evaluate(() => window.__solo), 'same node', await page.evaluate(() => AU.synth[0].node === window.__anNode));
console.log('Einzeln after undo, level', await play(), 'leds', await leds(page), 'lcd', await lcd(page));
await tap(page, 'timbre'); console.log('after tap TIMBRE: sent', await page.evaluate(() => window.__solo), 'level', await play());
console.log('errs', errs);
await b.close();
