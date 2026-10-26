// QA G-MK2a misc: sound browser (filter MS 2000, ▶ preview, load), A/B with MK2 edits, ◎ on EDIT-WAHL 2, ECO with MK2 waves,
// performance probe "Kern", MIDI export
import {open, sleep, OUT, check, done, eq, diff} from './v3-qa-gmk2a-tl.mjs';
import {setupProject} from './v3-qa-gmk2a-setup.mjs';
const T = await open(); const {p, E, errs} = T;
console.log('setup', JSON.stringify(await setupProject(E)));
await E(() => SYNQUENZER.selectTrack(0)); await T.openEd(0);
// --- M1 browser
await E(() => SYNQUENZER.openBrowser(0)); await sleep(600);
const chips = await E(() => [...document.querySelectorAll('button')].filter(b => b.offsetWidth && /MS ?2000/.test(b.textContent)).map(b => b.className + ':' + b.textContent.trim()));
console.log('MS 2000 buttons in browser', JSON.stringify(chips));
const fchip = await T.rectText('button', /^MS ?2000$/); if (fchip) await T.tap(fchip.cx, fchip.cy, 500);
const rows = await E(() => SYNQUENZER.browserRows ? SYNQUENZER.browserRows().map(r => r.name || r) : null);
console.log('rows', JSON.stringify(rows && rows.slice(0, 20)));
const row = await T.rectText('.brRow, .row, li, [data-id]', /Pad Stimme/);
console.log('row Pad Stimme', JSON.stringify(row));
await p.screenshot({path: OUT + 'misc-browser.png'});
let pv = null, lvPv = null;
const play = await E(() => { const r = [...document.querySelectorAll('[data-id]')].find(e => e.offsetWidth && /Pad Stimme/.test(e.textContent)); if (!r) return null; const b = r.querySelector('button, .pv, .play'); const bb = (b || r).getBoundingClientRect(); return {cx: bb.x + bb.width / 2, cy: bb.y + bb.height / 2, t: (b || r).className}; });
console.log('play target', JSON.stringify(play));
if (play) { await T.tap(play.cx, play.cy, 300); pv = await E(() => SYNQUENZER.previewState()); lvPv = await T.lvl(900); }
console.log('preview', JSON.stringify(pv), lvPv);
check('M1 browser: ▶ preview of an own MK2 program sounds', pv && pv.on && lvPv > -45, {pv, lvPv, rows: rows && rows.length});
await E(() => SYNQUENZER.closeBrowser()); await sleep(400); console.log('editor after closeBrowser', await E(() => SYNQUENZER.runtime().editor)); await T.openEd(0);
// --- M2 A/B: load Bass Welle, change wave, A/B toggles
await E(() => { const s = SYNQUENZER.library().find(x => x.name === 'Bass Welle'); SYNQUENZER.loadPreset(0, s.id); }); await sleep(300);
const savedMk = await T.pm(0);
await E(() => SYNQUENZER.mkSet(0, 't.0.o1.c2', 100));
const editMk = await T.pm(0);
const ab = await T.rectText('button', /^A\/B$/);
if (ab) await T.tap(ab.cx, ab.cy, 400);
const afterAB = await T.pm(0);
if (ab) await T.tap(ab.cx, ab.cy, 400);
const afterAB2 = await T.pm(0);
check('M2 A/B after a wave edit: shows the saved program, second tap the edit', ab && eq(afterAB, savedMk) && eq(afterAB2, editMk), {ab: !!ab, c2: [savedMk.t[0].o1.c2, editMk.t[0].o1.c2, afterAB.t[0].o1.c2, afterAB2.t[0].o1.c2]});
// --- M3 ◎ (what is different) on EDIT-WAHL 2 after a patch edit
await E(() => SYNQUENZER.mkSet(0, 't.0.p.1.i', 40));
const wia = await T.rectText('button', /^◎$/); if (wia) await T.tap(wia.cx, wia.cy, 300);
await T.tapMk('w2', 400);
const w2rows = await E(() => [...document.querySelectorAll('#popLayer .pop button')].filter(b => b.offsetWidth).map(b => b.innerHTML.includes('mwdot') ? 'DOT ' + b.textContent.trim().slice(0, 20) : b.textContent.trim().slice(0, 20)));
await T.closePop();
await T.tapMk('w1', 400);
const w1rows = await E(() => [...document.querySelectorAll('#popLayer .pop button')].filter(b => b.offsetWidth).map(b => b.innerHTML.includes('mwdot') ? 'DOT ' + b.textContent.trim().slice(0, 20) : b.textContent.trim().slice(0, 20)));
await T.closePop();
if (wia) await T.tap(wia.cx, wia.cy, 300);
console.log('w2 rows', JSON.stringify(w2rows)); console.log('w1 rows', JSON.stringify(w1rows));
check('M3 ◎: EDIT-WAHL 2 list marks PATCH 2 (changed), EDIT-WAHL 1 marks OSZ 1 (wave changed)', w2rows.some(r => /^DOT 2 PATCH 2/.test(r)) && w1rows.some(r => /^DOT 3 OSZ 1/.test(r)), {w2rows, w1rows});
// --- M4 ECO with MK2 waves
const eco = [];
for (const [w, c1, c2] of [[5, 0, 22], [5, 0, 124], [3, 60, 0], [4, 64, 0], [6, 30, 110]]) {
  await E(([w, c1, c2]) => { SYNQUENZER.mkSet(0, 't.0.o1.w', w); SYNQUENZER.mkSet(0, 't.0.o1.c1', c1); SYNQUENZER.mkSet(0, 't.0.o1.c2', c2); }, [w, c1, c2]);
  await E(() => SYNQUENZER.forceNative(true)); await sleep(300);
  const pr = E(() => SYNQUENZER.audition(0, 48, 600)); const lv = await T.lvl(500); await pr; await sleep(300);
  await E(() => SYNQUENZER.forceNative(false)); await sleep(300);
  eco.push([w, c2, lv]);
}
check('M4 ECO (forceNative) plays every MK2 wave audibly', eco.every(x => x[2] > -50), eco);
// --- M5 performance probe "Kern"
const pr = await E(async () => { try { const r = await SYNQUENZER.perfProbe(['kern']); return JSON.stringify(r).slice(0, 600); } catch (e) { return 'ERR ' + e.message; } });
console.log('probe', pr);
check('M5 Leistungs-Probe "Kern" (Speicherwelle + Sinus×) runs', !/ERR|"err"/.test(pr), pr.slice(0, 300));
// --- M6 MIDI export
const mid = await E(async () => { try { const r = SYNQUENZER.buildMidi ? SYNQUENZER.buildMidi() : null; const b = r && (r.bytes || r); return b ? (b.length || b.byteLength || JSON.stringify(Object.keys(r))) : 'null'; } catch (e) { return 'ERR ' + e.message; } });
check('M6 MIDI export builds with MS 2000 tracks', !/ERR|null/.test(String(mid)), mid);
check('no console errors', errs.length === 0, errs.slice(0, 5));
await T.br.close(); done();
