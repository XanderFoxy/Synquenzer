// exploratory + check: view/transport actions must not create data events (only ctx); lists any 'proj' event with its paths
import { launch } from './n5-h-lib.mjs';
const {b, p, errs} = await launch();
await p.evaluate(() => historyCheck());
const base = await p.evaluate(() => HIST.cur.strs.length);
const steps = [
  'SYNQUENZER.play()', 'SYNQUENZER.launchScene(1)', 'SYNQUENZER.launchScene(0)', 'SYNQUENZER.sceneBank(1)', 'SYNQUENZER.sceneBank(0)', 'SYNQUENZER.trackBank && SYNQUENZER.trackBank(1)', 'SYNQUENZER.trackBank && SYNQUENZER.trackBank(0)',
  'SYNQUENZER.songView && SYNQUENZER.songView(true)', 'SYNQUENZER.songView && SYNQUENZER.songView(false)', 'SYNQUENZER.partPage && SYNQUENZER.partPage(1)', 'SYNQUENZER.partPage && SYNQUENZER.partPage(0)',
  'selectTrack(4); SYNQUENZER.openEditor()', 'closeEditor()', 'selectTrack(1); SYNQUENZER.openEditor()', 'closeEditor()', 'SYNQUENZER.openRoll(1, 0)', 'SYNQUENZER.setRollView && SYNQUENZER.setRollView("lauf")', 'closeEditor()',
  'SYNQUENZER.setFollow && SYNQUENZER.setFollow("roll", false)', 'openMenu()', 'closeMenu()', 'SYNQUENZER.openBrowser && SYNQUENZER.openBrowser(1)', 'closeEditor()',
  'SYNQUENZER.tapSlot && SYNQUENZER.tapSlot(2, 1)', 'SYNQUENZER.keyOn(60); SYNQUENZER.keyOff(60)', 'SYNQUENZER.chord && SYNQUENZER.chord("Am")', 'SYNQUENZER.stop()', 'SYNQUENZER.stop()',
  'SYNQUENZER.fmxView && SYNQUENZER.fmxView(0, "dx")', 'SYNQUENZER.launchPart && SYNQUENZER.launchPart(0)', 'SYNQUENZER.stop()',
];
for (const s of steps) { await p.evaluate(s => { try { (0, eval)(s); } catch (e) { console.log('step err ' + s + ' ' + e); } }, s); await p.waitForTimeout(250); }
await p.waitForTimeout(2600);
const evs = await p.evaluate(b => HIST.cur.strs.slice(b).map(s => JSON.parse(s)), base);
console.log('ctx', evs.filter(e => e.u === 'ctx').map(e => e.z.c).join(' '));
const proj = evs.filter(e => e.u !== 'ctx');
console.log('data events', proj.length, JSON.stringify(proj.map(e => ({u: e.u, p: e.d && e.d.map(o => o.path).slice(0, 6)}))));
console.log('check', JSON.stringify(await p.evaluate(() => historyCheck({detail: true}))));
console.log('errors', JSON.stringify(errs.slice(0, 5)));
await b.close();
