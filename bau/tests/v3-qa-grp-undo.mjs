// QA group G-P1b: undo/redo chain of the new actions (FANG TEIL ×3 incl. ⟳ ersetzen and an Szene hängen, Stimme-FANG with
// sheet changes, ● REC 🎤, Teilen/Verbinden, placePart, markAction ×8, songRange ×4) – undo all the way back = start,
// redo all the way = end; then save/load: file export (download) → file input in a fresh page, autosave + reload; playback equal.
import {open, OUT, check, done, tapEl, tapText, eq, diff, canon} from './v3-qa-grp-lib.mjs';
import {micOn, resample, b64} from './v3-vs2-h.mjs';
import {renderVoice} from './v3-vs2-corpus.mjs';
import fs from 'fs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const H = await open(); const {br, p, errs, E} = H;
await E(() => { SYNQUENZER.setBpm(140); SYNQUENZER.setMetronome(false); SYNQUENZER.setRecOptions({countIn: 0}); });
const mic = await micOn(p, 'wired');
await E(() => SYNQUENZER.stop()); await sleep(1300);
const P = () => E(() => SYNQUENZER.project());
const strip = o => { const c = JSON.parse(JSON.stringify(o)); for (const k of ['saved', 'modified', 'updated', 'ui']) delete c[k]; return c; };
const steps = []; const snap = async (name) => { steps.push({name, p: strip(await P()), u: await E(() => SYNQUENZER.undoInfo())}); console.log('step', steps.length - 1, name, JSON.stringify(steps[steps.length - 1].u.top && steps[steps.length - 1].u.top.label)); };
await snap('start');
const chords = (seq, b0, off = 0.06) => E(([seq, b0, off]) => new Promise(res => { let k = 0; const iv = setInterval(() => { const b = audBeat(); if (k < seq.length && b >= b0 + 4 * k + off) { SYNQUENZER.keyOn(seq[k], .8, 'c' + k); const kk = k; setTimeout(() => SYNQUENZER.keyOff(0, 'c' + kk), 80); k++; } if (k >= seq.length) { clearInterval(iv); res(); } }, 2); }), [seq, b0, off]);
const fangAt = async (b) => { await p.waitForFunction(x => audBeat() >= x, b, {polling: 5}); return E(() => SYNQUENZER.fangTeil({})); };
// 1. FANG TEIL → ALS TEIL (Strophe)
await E(() => { SYNQUENZER.launchScene(0); SYNQUENZER.setKbMode('transpose'); });
await chords([57, 53, 48, 55, 57, 53, 48, 55], 4); await fangAt(36.3); await sleep(80);
await E(() => SYNQUENZER.fangAccept('part')); await snap('ALS TEIL Strophe');
// 2. FANG TEIL → ＋ Ans Song-Ende (Refrain)
await E(() => SYNQUENZER.launchScene(1)); await chords([53, 55, 48, 48, 53, 55, 48, 48], 44); await fangAt(76.3); await sleep(80);
await E(() => SYNQUENZER.fangAccept('end')); await snap('Ans Song-Ende Refrain');
// 3. FANG TEIL → name Strophe, ⟳ ersetzen + Ans Song-Ende
await E(() => SYNQUENZER.launchScene(0)); await chords([50, 55, 50, 55], 84); await fangAt(100.3); await sleep(80);
await E(() => { SYNQUENZER.fangName('Strophe', 'replace'); return SYNQUENZER.fangAccept('end'); }); await snap('⟳ Strophe ersetzen + Song-Ende');
// 4. FANG TEIL → an Szene 3 hängen (scene 3 has no chord row)
await E(() => SYNQUENZER.launchScene(2)); await chords([45, 47, 45, 47], 108); await fangAt(124.3); await sleep(80);
const sa = await E(() => SYNQUENZER.fangPart() && SYNQUENZER.fangPart().suggest.sceneAlt);
console.log('sceneAlt', sa);
await E(n => SYNQUENZER.fangToScene(n || 3), sa); await snap('an Szene hängen');
// 5. Stimme-FANG + sheet changes (one undo)
await E(() => SYNQUENZER.setKbMode('play'));
const SB = 60 / 140, LEAD = .04, MEL = [[0, 1, 64], [1, 1, 67], [2, 2, 69], [4, 1, 67], [5, 1, 64], [6, 2, 62]];
const sig = renderVoice(MEL.map(([b, d, m], k) => ({on: LEAD + b * SB, dur: d * SB, midi: m, legato: false, rest: k ? .1 : 0})), {voice: 'female', seed: 9, sigma: 10, vib: [20, 40], bpm: 140});
const y = b64(resample(sig.x, 16000, mic.sr));
await E(([b, beat, lead]) => { const c = SYNQUENZER.vsClock(); window.__fake.play(b, c.start + beat * c.spb - lead); }, [y, 132, LEAD]);
await p.waitForFunction(() => audBeat() >= 140.3, null, {polling: 5});
await E(() => SYNQUENZER.vsFang()); await p.waitForFunction(() => !SYNQUENZER.vsInfo().busy && SYNQUENZER.vsResult(), null, {timeout: 20000});
await E(() => { SYNQUENZER.vsResultSet({oct: 1}); SYNQUENZER.vsResultSet({grid: '1/8'}); SYNQUENZER.vsResultSet({snap: false}); SYNQUENZER.vsResultOk(); });
await snap('Stimme-FANG (+ Oktave, Raster, Frei)');
// 6. ● REC with 🎤 on MELODIE scene 4
await E(() => { SYNQUENZER.setRecOptions({countIn: 0}); SYNQUENZER.selectSlot(5, 3); });
await p.waitForFunction(() => audBeat() >= 147.3, null, {polling: 5}); await E(() => SYNQUENZER.rec());
const rs = await E(() => SYNQUENZER.runtime().rec.startBeat);
await E(([b, beat, lead]) => { const c = SYNQUENZER.vsClock(); window.__fake.play(b, c.start + beat * c.spb - lead); }, [y, rs, LEAD]);
await p.waitForFunction(x => audBeat() >= x, rs + 8.1, {polling: 5}); await E(() => SYNQUENZER.rec());
await p.waitForFunction(() => SYNQUENZER.runtime().rec.state === 'off' && !SYNQUENZER.vsInfo().busy, null, {timeout: 20000}); await sleep(200);
await E(() => SYNQUENZER.vsResultOk()); await snap('● REC Stimme');
await E(() => SYNQUENZER.stop()); await sleep(1200);
// 7. Teilen / Verbinden on the sung clip
const melSlot = await E(() => [0, 1, 2, 3, 4, 5, 6, 7].find(s => SYNQUENZER.getClip(5, s)));
await E(s => SYNQUENZER.openRoll(5, s), melSlot); await sleep(300);
await E(() => SYNQUENZER.rollApi().selectIdx([2])); await E(() => [...document.querySelectorAll('button')].find(x => x.textContent === 'Teilen').click()); await snap('Teilen');
await E(() => SYNQUENZER.rollApi().selectIdx([0, 1])); await E(() => [...document.querySelectorAll('button')].find(x => x.textContent === 'Verbinden').click()); await snap('Verbinden');
await E(() => SYNQUENZER.closeRoll());
// 8. song data operations
const M = () => E(() => SYNQUENZER.songMarks());
console.log('marks', JSON.stringify((await M()).map(m => m.id + ':' + m.name + '@' + m.a + '+' + m.len)));
await E(() => SYNQUENZER.placePart('P2', 0)); await snap('placePart Refrain at 0');
await E(() => SYNQUENZER.placePart('S3', 2, 'replace')); await snap('placePart Szene 3 replace at 2');
let ms = await M();
const op = async (kind, arg, pick = 0) => { ms = await M(); const id = ms[Math.min(pick, ms.length - 1)].id; const r = await E(([id, k, a]) => SYNQUENZER.markAction(id, k, a), [id, kind, arg]); await snap('markAction ' + kind + ' ' + (arg == null ? '' : JSON.stringify(arg)) + ' → ' + r); };
await op('rep', 2, 1); await op('move', 0, 2); await op('copy', null, 0); await op('replaceBy', 'P1', 1); await op('rename', 'Chorus', 0); await op('unname', null, 1); await op('swapR', null, 0); await op('applyAll', null, 2); await op('delete', null, 3);
for (const [k, a, b, arg] of [['insertEmpty', 1, 2], ['copy', 0, 1, 6], ['clear', 3, 3], ['asPart', 0, 3, 'Bridge'], ['delete', 4, 5]]) { const r = await E(([k, a, b, arg]) => SYNQUENZER.songRange(k, a, b, arg), [k, a, b, arg]); await snap(`songRange ${k} ${a}-${b} → ${JSON.stringify(r)}`); }
for (let i = steps.length - 1; i > 0; i--) if (steps[i].u.n === steps[i - 1].u.n) { console.log('no-op step dropped:', steps[i].name); steps.splice(i, 1); }
const n = steps.length - 1;
// undo all the way, compare each intermediate state
let bad = [];
for (let k = n; k > 0; k--) { await E(() => SYNQUENZER.undo()); await sleep(30); const cur = strip(await P()); if (!eq(cur, steps[k - 1].p)) bad.push({undoTo: k - 1, name: steps[k - 1].name, diff: diff(cur, steps[k - 1].p).slice(0, 4)}); }
check('undo chain: each undo restores the previous state exactly (' + n + ' steps)', !bad.length, bad.slice(0, 4));
check('undo chain ends at the start state', eq(strip(await P()), steps[0].p), diff(strip(await P()), steps[0].p).slice(0, 4));
bad = [];
for (let k = 1; k <= n; k++) { await E(() => SYNQUENZER.redo()); await sleep(30); const cur = strip(await P()); if (!eq(cur, steps[k].p)) bad.push({redoTo: k, name: steps[k].name, diff: diff(cur, steps[k].p).slice(0, 4)}); }
check('redo chain: each redo re-applies exactly', !bad.length, bad.slice(0, 4));
const undoN = steps.map(s => s.u.n); check('every action = exactly one undo step (no-op applyAll excepted)', undoN.every((u, i) => !i || u === undoN[i - 1] + 1 || /→ false/.test(steps[i].name)), undoN);
fs.writeFileSync(OUT + 'undo-final.json', JSON.stringify(steps[n].p));
// ---- save/load: 1) file export via the menu path (download) → file input in a fresh page
const dl = p.waitForEvent('download', {timeout: 15000}).catch(e => null);
const how = await E(() => SYNQUENZER.exportProject()); const d = await dl;
console.log('export', how, d && d.suggestedFilename());
let fileP = null; if (d) { fileP = OUT + 'export-' + d.suggestedFilename(); await d.saveAs(fileP); }
check('project file exported (download)', !!fileP, how);
const ref = strip(await P());
// playback reference: song from bar 1, 8 bars, noteLog (track, beat, out)
const playLog = async (pg) => { await pg.evaluate(() => { SYNQUENZER.stop(); }); await sleep(1300); await pg.evaluate(() => { SYNQUENZER.setBpm(140); SYNQUENZER.clearLog(); SYNQUENZER.songLoop(false); SYNQUENZER.songPlay(0); }); await pg.waitForFunction(() => audBeat() >= 32.2, null, {timeout: 60000, polling: 20}); const L = await pg.evaluate(() => SYNQUENZER.noteLog(4096).filter(n => n.beat != null && n.beat < 32).map(n => [n.track, +n.beat.toFixed(3), n.out, n.clipNote])); await pg.evaluate(() => SYNQUENZER.stop()); return L.sort((a, b) => a[1] - b[1] || a[0] - b[0] || a[2] - b[2]); };
const L0 = await playLog(p);
// autosave now, then reload the same page (IndexedDB)
await E(() => SYNQUENZER.save()); await sleep(800);
console.log('storage', JSON.stringify(await E(() => SYNQUENZER.storage())));
await p.reload(); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version); await sleep(1500);
const afterReload = strip(await E(() => SYNQUENZER.project()));
check('reload (autosave): project deep-equal', eq(afterReload, ref), diff(afterReload, ref).slice(0, 6));
const L1 = await playLog(p);
check('reload: 8 bars of song playback identical (noteLog)', eq(L0, L1), {n0: L0.length, n1: L1.length, d: diff(L0, L1).slice(0, 4)});
// fresh browser context, load the exported file with the real file input
const H2 = await open({mic: false});
if (fileP) { await H2.p.setInputFiles('#fileIn', fileP); await sleep(1500); }
const imp = strip(await H2.E(() => SYNQUENZER.project()));
check('file → fresh page: project deep-equal', eq(imp, ref), diff(imp, ref).slice(0, 6));
const L2 = await playLog(H2.p);
check('file → fresh page: 8 bars of song playback identical', eq(L0, L2), {n0: L0.length, n2: L2.length, d: diff(L0, L2).slice(0, 4)});
check('parts + marks survive', eq(await H2.E(() => SYNQUENZER.parts()), await E(() => SYNQUENZER.parts())) && eq(await H2.E(() => SYNQUENZER.songMarks()), await E(() => SYNQUENZER.songMarks())));
// undo after reload? (history is per session – just make sure it does not throw)
check('no console errors', !errs.length && !H2.errs.length, errs.concat(H2.errs).slice(0, 5));
await H2.br.close(); await br.close(); done();
