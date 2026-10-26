// QA group G-P1b, step 4: ● REC with 🎤 on an empty scene (MELODIE track selected, touch on the slot and on ●), sing 2 bars,
// ● again to stop → MELODIE clip in that scene; result sheet; then Teilen/Verbinden in the roll (touch on the buttons), undo/redo.
import {open, OUT, check, done, tapEl, tapText, eq, diff} from './vgmk34-grp-lib.mjs';
import {micOn, resample, b64} from './v3-vs2-h.mjs';
import {renderVoice} from './v3-vs2-corpus.mjs';
import fs from 'fs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const which = process.argv[2] || 'mel';   // mel: MELODIE track selected; syn: Synth 4 selected
const {br, p, errs, E} = await open();
const proj = JSON.parse(fs.readFileSync(OUT + 'flow3-project.json', 'utf8'));
await E(pj => SYNQUENZER.importJSON(JSON.stringify({app: 'SYNQUENZER', kind: 'project', format: 4, project: pj})), proj);
await sleep(400);
await E(() => { SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); });
const mic = await micOn(p, 'wired');
await E(() => SYNQUENZER.stop()); await sleep(1200);
const T = which === 'mel' ? 5 : 3, SC = 2;
// select the empty slot by touch (track row T, scene 3)
const cell = await E(([t, s]) => { const m = SYNQUENZER.matrixInfo(); return m; }, [T, SC]);
await E(([t, s]) => SYNQUENZER.selectSlot(t, s), [T, SC]);
console.log('selected', JSON.stringify(await E(() => SYNQUENZER.runtime().selected)), 'recOpts', JSON.stringify(await E(() => SYNQUENZER.runtime().rec)));
await E(() => SYNQUENZER.play()); await sleep(100);
const st = await E(() => audBeat());
// ● at bar 2 – rec starts at the next bar (count-in?)
await p.waitForFunction(() => audBeat() >= 3.3, null, {polling: 10});
await tapEl(p, '#bRec'); await sleep(80);
const r0 = await E(() => SYNQUENZER.runtime().rec); console.log('rec after tap', JSON.stringify(r0));
const recStart = r0.startBeat != null ? r0.startBeat : 4;
const BPM = 120, SB = 0.5, LEAD = 0.04;
const mel = [[0, 1, 62], [1, 1, 64], [2, 2, 65], [4, 1, 64], [5, 1, 62], [6, 2, 60]];
const sig = renderVoice(mel.map(([b, d, m], k) => ({on: LEAD + b * SB, dur: d * SB, midi: m, legato: false, rest: k ? 0.1 : 0})), {voice: 'female', seed: 5, sigma: 10, vib: [20, 40], bpm: BPM});
const y = resample(sig.x, 16000, mic.sr);
console.log('place', JSON.stringify(await E(([b, beat, lead]) => { const c = SYNQUENZER.vsClock(); const t = c.start + beat * c.spb - lead; window.__fake.play(b, t); return {t, now: window.__ctx.currentTime, st: c.start}; }, [b64(y), recStart, LEAD])));
await p.waitForFunction(x => audBeat() >= x, recStart + 8.2, {timeout: 60000, polling: 10});
console.log('pre-stop', JSON.stringify(await E(() => ({b: audBeat(), st: R.startTime, rec: SYNQUENZER.runtime().rec}))));
await tapEl(p, '#bRec');   // stop
console.log('post-stop', JSON.stringify(await E(() => ({b: audBeat(), st: R.startTime, rec: SYNQUENZER.runtime().rec}))));
await p.waitForFunction(() => SYNQUENZER.runtime().rec.state === 'off', null, {timeout: 20000});
await p.waitForFunction(() => !SYNQUENZER.vsInfo().busy, null, {timeout: 20000}); await sleep(300);
const r = await E(() => SYNQUENZER.vsResult());
const want = (cl, mel) => { let hit = 0; for (const [b, , m] of mel) if (cl.notes.some(n => n.n === m && Math.abs((n.o != null ? n.o : n.t) - b) <= 0.1)) hit++; return hit; };
console.log('result', JSON.stringify(r && {kind: r.kind, track: r.track, scene: r.scene, len: r.len, notes: r.notes.map(n => [n.t, n.o, n.n, n.d])}), "q", JSON.stringify(await E(() => { const r = SYNQUENZER.vsResult(); return r && {grid: r.grid, snap: r.snap, oct: r.oct, q: SYNQUENZER.getClip(r.track, r.scene).q}; })));
const clips = await E(([s]) => [0, 1, 2, 3, 4, 5].map(t => { const c = SYNQUENZER.getClip(t, s); return c ? {t, len: c.len, n: c.notes.length} : null; }).filter(Boolean), [SC]);
console.log('clips in scene 3', JSON.stringify(clips), 'undo', JSON.stringify(await E(() => SYNQUENZER.undoInfo())));
check(`● REC with 🎤 (${which}): MELODIE clip in scene 3 with ≥ 5/6 sung notes`, r && r.track === 5 && r.scene === SC && want(r, mel) >= 5, r && {track: r.track, scene: r.scene, hit: want(r, mel)});
await p.screenshot({path: OUT + 'flow4-rec-' + which + '.png'});
if (r) await tapText(p, '.pop.vsres button', /OK/); await sleep(150);
await E(() => SYNQUENZER.stop()); await sleep(300);
// Teilen / Verbinden in the roll of the sung clip (touch on the action buttons)
if (r) {
  await E(([s]) => SYNQUENZER.openRoll(5, s), [SC]); await sleep(400);
  const c0 = await E(([s]) => SYNQUENZER.getClip(5, s), [SC]);
  const u0 = await E(() => SYNQUENZER.undoInfo().n);
  const longest = c0.notes.reduce((a, n, i) => (n.d > c0.notes[a].d ? i : a), 0);
  await E(i => SYNQUENZER.rollApi().selectIdx([i]), longest); await sleep(100);
  await p.screenshot({path: OUT + 'flow4-roll-sel.png'});
  const bt = await tapText(p, 'button', /^Teilen$/); console.log('tap Teilen', bt && [bt.w, bt.h]);
  await sleep(100);
  const c1 = await E(([s]) => SYNQUENZER.getClip(5, s), [SC]);
  check('Teilen splits the selected note (touch)', c1.notes.length === c0.notes.length + 1, [c0.notes.length, c1.notes.length]);
  const i2 = c1.notes.map((n, i) => i).filter(i => c1.notes[i].n === c0.notes[longest].n).slice(0, 2);
  await E(ix => SYNQUENZER.rollApi().selectIdx(ix), i2); await sleep(100);
  const bv = await tapText(p, 'button', /^Verbinden$/); console.log('tap Verbinden', bv && [bv.w, bv.h]);
  await sleep(100);
  const c2 = await E(([s]) => SYNQUENZER.getClip(5, s), [SC]);
  check('Verbinden joins them back (touch)', c2.notes.length === c0.notes.length, [c1.notes.length, c2.notes.length]);
  check('Teilen + Verbinden = 2 undo steps', await E(() => SYNQUENZER.undoInfo().n) === u0 + 2);
  await E(() => SYNQUENZER.undo()); const cu1 = await E(([s]) => SYNQUENZER.getClip(5, s), [SC]);
  check('undo Verbinden', eq(cu1.notes, c1.notes), diff(cu1.notes, c1.notes).slice(0, 3));
  await E(() => SYNQUENZER.undo()); const cu0 = await E(([s]) => SYNQUENZER.getClip(5, s), [SC]);
  check('undo Teilen', eq(cu0.notes, c0.notes), diff(cu0.notes, c0.notes).slice(0, 3));
  await E(() => SYNQUENZER.redo()); await E(() => SYNQUENZER.redo()); const cr = await E(([s]) => SYNQUENZER.getClip(5, s), [SC]);
  check('redo ×2 = after Verbinden', eq(cr.notes, c2.notes), diff(cr.notes, c2.notes).slice(0, 3));
  await E(() => SYNQUENZER.closeRoll());
}
fs.writeFileSync(OUT + 'flow4-project.json', JSON.stringify(await E(() => SYNQUENZER.project())));
console.log('errs', errs);
await br.close(); done();
