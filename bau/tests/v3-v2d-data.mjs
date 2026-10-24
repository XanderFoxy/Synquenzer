// V2d acceptance (data): N7S-19 … N7S-24, N7S-26, Rundweg, clips deep-equal
import { open } from './v3-v2d-pw.mjs';
import { SETUP55, eq, mkCheck } from './v3-v2d-lib.mjs';
const {check, done} = mkCheck();
const {b, p, errs} = await open();
const E = f => p.evaluate(f);
const reset = async () => { await p.evaluate(SETUP55); };
await reset();
const clips0 = await E(() => JSON.stringify(window.SYNQUENZER.project().project ? window.SYNQUENZER.project().project.tracks.map(t => t.clips) : window.SYNQUENZER.project().tracks.map(t => t.clips)));
const clipsNow = () => E(() => { const pr = window.SYNQUENZER.project(); const P = pr.project || pr; return JSON.stringify(P.tracks.map(t => t.clips)); });
const proj = () => E(() => { const pr = window.SYNQUENZER.project(); const P = pr.project || pr; return JSON.stringify({song: P.song, parts: P.parts}); });
const before = await proj();
// N7S-19 insert at T3
let r = await E(() => window.SYNQUENZER.placePart(0, 2, 'insert'));
let s = await E(() => window.SYNQUENZER.song());
const L19 = [[{bar: 2, slot: 0, re: 1}, {bar: 6, slot: -1}, {bar: 7, slot: 2}], [{bar: 2, slot: 1, re: 1}, {bar: 6, slot: -1}, {bar: 7, slot: 1}], [{bar: 7, slot: 2}],
  [{bar: 0, slot: 3}, {bar: 2, slot: -1}], [{bar: 2, slot: 0, re: 1}, {bar: 6, slot: 1}, {bar: 7, slot: 1, re: 1}], []];
check('N7S-19 lanes', eq(s.lanes, L19), s.lanes);
check('N7S-19 bars 11', s.bars === 11, s.bars);
const car = s.carrier.map(c => c.beat + ':' + (c.target ? c.target.name : 'O')).join(' ');
check('N7S-19 Träger', car === '0:Am 8:Am 12:F 16:C 20:G 24:G 28:F 32:G 36:Am', car);
check('N7S-19 Marken', eq(s.marks.map(m => [m.a, m.len, m.part]), [[0, 2, 'S4'], [2, 4, 'P1'], [7, 4, 'P2']]) && r && r.mark, [s.marks, r]);
check('N7S-19 Melodie +16', eq(s.mel[5].notes.map(n => n.t), [2, 23.8, 26, 40]), s.mel[5].notes.map(n => n.t));
check('N7S-19 clips deep-equal', (await clipsNow()) === clips0);
let u = await E(() => window.SYNQUENZER.undoInfo());
await E(() => window.SYNQUENZER.undo());
check('N7S-19 ein Undo → deep-equal', (await proj()) === before, u.top);
// playback of the inserted song: bass silent in T7 (beats 24–28), REFRAIN bass at 28 with phase 0
await E(() => window.SYNQUENZER.placePart(0, 2, 'insert'));
await E(() => { const Q = window.SYNQUENZER; Q.setBpm(240); Q.clearLog(); Q.songPlay(0); });
await p.waitForFunction(() => window.SYNQUENZER.runtime().beat > 37, null, {timeout: 20000, polling: 100});
let log = await E(() => window.SYNQUENZER.noteLog(400).filter(n => n.track === 0).map(n => [n.beat, n.out]));
const bassB = log.map(x => Math.round(x[0] * 1000) / 1000);
check('N7S-19 Bass schweigt in Schlag 24–28', !bassB.some(x => x >= 24 - 1e-6 && x < 28 - 1e-6), bassB);
check('N7S-19 REFRAIN-Bass ab 28 Phase 0 (M-ZEIT ±0,002)', [28, 32, 34].every(x => bassB.some(y => Math.abs(y - x) <= .002)) && bassB.filter(y => y >= 28 && y < 36).length === 3, bassB.filter(y => y >= 24));
await E(() => window.SYNQUENZER.songPlay(false));
// N7S-20 insert in the middle of REFRAIN (T5)
await reset();
// reference: bass notes of the original song from T5 (beat 16)
await E(() => { const Q = window.SYNQUENZER; Q.setBpm(240); Q.clearLog(); Q.songPlay(0); });
await p.waitForFunction(() => window.SYNQUENZER.runtime().beat > 26.5, null, {timeout: 20000, polling: 100});
const ref = await E(() => window.SYNQUENZER.noteLog(400).filter(n => n.track === 0 && n.beat >= 16 - 1e-6 && n.beat < 24).map(n => [+(n.beat - 16).toFixed(3), n.clipNote]));
await E(() => window.SYNQUENZER.songPlay(false));
await E(() => window.SYNQUENZER.placePart(0, 4, 'insert'));
s = await E(() => window.SYNQUENZER.song());
check('N7S-20 REFRAIN geteilt T4 + T9–11', eq(s.marks.filter(m => m.part === 'P2').map(m => [m.a, m.len]), [[3, 1], [8, 3]]), s.marks);
check('N7S-20 Bass-Fortsetzung {bar:8, slot:2, ph:4}', s.lanes[0].some(e => e.bar === 8 && e.slot === 2 && e.ph === 4), s.lanes[0]);
await E(() => { const Q = window.SYNQUENZER; Q.clearLog(); Q.songPlay(0); });
await p.waitForFunction(() => window.SYNQUENZER.runtime().beat > 42.5, null, {timeout: 25000, polling: 100});
const got = await E(() => window.SYNQUENZER.noteLog(500).filter(n => n.track === 0 && n.beat >= 32 - 1e-6 && n.beat < 40).map(n => [+(n.beat - 32).toFixed(3), n.clipNote]));
await E(() => window.SYNQUENZER.songPlay(false));
check('N7S-20 ab T9 dieselben Bass-Noten wie vorher ab T5', ref.length >= 2 && got.length === ref.length && got.every((x, k) => Math.abs(x[0] - ref[k][0]) <= .002 && x[1] === ref[k][1]), {ref, got});
// N7S-21 replace T3–6
await reset();
const ref7 = ref;   // not used
await E(() => window.SYNQUENZER.placePart(0, 2, 'replace'));
s = await E(() => window.SYNQUENZER.song());
check('N7S-21 bars 7, REFRAIN-Rest T7 Länge 1', s.bars === 7 && eq(s.marks.filter(m => m.part === 'P2').map(m => [m.a, m.len]), [[6, 1]]), [s.bars, s.marks]);
check('N7S-21 Fortsetzung {bar:6, slot:2, ph:4}', s.lanes[0].some(e => e.bar === 6 && e.slot === 2 && e.ph === 4), s.lanes[0]);
check('N7S-21 Melodie 7,75 ≤ t < 23,75 entfernt (auch 7,8)', eq(s.mel[5].notes.map(n => n.t), [2, 24]), s.mel[5].notes.map(n => n.t));
check('N7S-21 T1–2 deep-equal', eq(s.lanes[3].filter(e => e.bar < 2), [{bar: 0, slot: 3}]) && s.carrier[0].beat === 0 && s.carrier[0].target.name === 'Am');
// T7 sounds like before: bass phase 4 at beat 24 → clip notes 43 at 24 and 26
await E(() => { const Q = window.SYNQUENZER; Q.clearLog(); Q.songPlay(0); });
await p.waitForFunction(() => window.SYNQUENZER.runtime().beat > 27.6, null, {timeout: 20000, polling: 100});
const t7 = await E(() => window.SYNQUENZER.noteLog(400).filter(n => n.track === 0 && n.beat >= 24 - 1e-6 && n.beat < 28).map(n => [+(n.beat).toFixed(3), n.clipNote]));
await E(() => window.SYNQUENZER.songPlay(false));
check('N7S-21 T7 klingt wie vorher T7 (43 bei 24, 26)', eq(t7, [[24, 43], [26, 43]]), t7);
u = await E(() => window.SYNQUENZER.undoInfo()); check('N7S-21 ein Undo song', u.top && u.top.kind === 'song');
// N7S-22 append
await reset();
await E(() => window.SYNQUENZER.placePart(0, 7));
s = await E(() => window.SYNQUENZER.song());
check('N7S-22 bar = bars hängt an', s.bars === 11 && s.marks.some(m => m.a === 7 && m.part === 'P1'), s.marks);
await reset();
await E(() => window.SYNQUENZER.placePart(0, 12, 'replace'));
s = await E(() => window.SYNQUENZER.song());
check('N7S-22 bar > bars rastet bei bars ein', s.bars === 11 && s.marks.some(m => m.a === 7 && m.part === 'P1'), s.marks);
// N7S-23 markAction
await reset();
await E(() => window.SYNQUENZER.placePart(0, 2, 'insert'));
const m1 = (await E(() => window.SYNQUENZER.songMarks())).find(m => m.part === 'P1').id;
const one = async (label, fn, test) => { const u0 = await E(() => window.SYNQUENZER.undoInfo().n); const pb = await proj(); await E(fn); const s2 = await E(() => window.SYNQUENZER.song()); const u1 = await E(() => window.SYNQUENZER.undoInfo().n);
  const ok = test(s2); check('N7S-23 ' + label, ok && u1 === u0 + 1 && (await clipsNow()) === clips0, ok ? undefined : s2.marks);
  await E(() => window.SYNQUENZER.undo()); check('N7S-23 ' + label + ' Undo deep-equal', (await proj()) === pb); };
await one('rep 2', () => window.SYNQUENZER.markAction(window.SYNQUENZER.songMarks().find(m => m.part === 'P1').id, 'rep', 2), s2 => s2.bars === 15 && eq(s2.marks.filter(m => m.part === 'P1').map(m => [m.a, m.len]), [[2, 4], [6, 4]]));
await one('move → Ende', () => window.SYNQUENZER.markAction(window.SYNQUENZER.songMarks().find(m => m.part === 'P1').id, 'move', 11), s2 => s2.bars === 11 && eq(s2.marks.map(m => [m.a, m.part]), [[0, 'S4'], [3, 'P2'], [7, 'P1']]));
await one('copy', () => window.SYNQUENZER.markAction(window.SYNQUENZER.songMarks().find(m => m.part === 'P1').id, 'copy', 0), s2 => s2.bars === 15 && s2.marks.filter(m => m.part === 'P1').length === 2 && s2.marks[0].part === 'P1');
await E(() => { const Q = window.SYNQUENZER; Q.setPart(2, {name: 'Bridge', slots: [{s: 0}, -1, -1, -1, {s: 1}, -1], chords: {len: 2, ch: [{b: 0, tg: Q.parseChord('Dm')}]}}); });
await one('replaceBy (Länge 2, Rest rückt −2)', () => { const Q = window.SYNQUENZER; return Q.markAction(Q.songMarks().find(m => m.part === 'P1').id, 'replaceBy', 2); },
  s2 => s2.bars === 9 && eq(s2.marks.map(m => [m.a, m.len, m.part]), [[0, 2, 'S4'], [2, 2, 'P3'], [5, 4, 'P2']]));
await E(() => window.SYNQUENZER.undo());   // the setPart of the step above
await one('delete (Rest rückt)', () => window.SYNQUENZER.markAction(window.SYNQUENZER.songMarks().find(m => m.part === 'P1').id, 'delete'), s2 => s2.bars === 7 && eq(s2.marks.map(m => [m.a, m.part]), [[0, 'S4'], [3, 'P2']]));
const lanesBefore = JSON.stringify((await E(() => window.SYNQUENZER.song())).lanes);
await one('unname (Lanes deep-equal)', () => window.SYNQUENZER.markAction(window.SYNQUENZER.songMarks().find(m => m.part === 'P1').id, 'unname'), s2 => JSON.stringify(s2.lanes) === lanesBefore && !s2.marks.some(m => m.part === 'P1'));
// applyAll with 3 places: STROPHE at 2, 11, 15 (append twice); change place 1 (cell), then apply
await E(() => { const Q = window.SYNQUENZER; Q.placePart(0, 99); Q.placePart(0, 99); });
let ms = await E(() => window.SYNQUENZER.songMarks().filter(m => m.part === 'P1'));
check('N7S-23 drei Stellen', ms.length === 3, ms);
await E(() => window.SYNQUENZER.songCycle(2, 3));   // a cell change in the first STROPHE (Sequenz T4)
ms = await E(() => window.SYNQUENZER.songMarks().filter(m => m.part === 'P1'));
check('Teil′: nur die geänderte Stelle (dev)', eq(ms.map(m => m.dev), [true, false, false]), ms);
const pb = await proj(), u0 = await E(() => window.SYNQUENZER.undoInfo().n);
await E(() => window.SYNQUENZER.markAction(window.SYNQUENZER.songMarks().find(m => m.part === 'P1').id, 'applyAll'));
ms = await E(() => window.SYNQUENZER.songMarks().filter(m => m.part === 'P1'));
s = await E(() => window.SYNQUENZER.song());
const stAt = (l, x) => { let v = -1; for (const e of l) { if (e.bar > x) break; v = e.slot; } return v; };
const sig = m => s.lanes.map(l => Array.from({length: m.len}, (_, j) => stAt(l, m.a + j)).join(',')).join('|');
const same = ms.every(m => sig(m) === sig(ms[0]));
check('N7S-23 applyAll: alle Stellen gleich, kein ′', ms.every(m => !m.dev) && same && (await E(() => window.SYNQUENZER.undoInfo())).top.kind === 'group' && (await E(() => window.SYNQUENZER.undoInfo().n)) === u0 + 1, ms);
check('N7S-23 applyAll clips deep-equal', (await clipsNow()) === clips0);
await E(() => window.SYNQUENZER.undo()); check('N7S-23 applyAll Undo deep-equal', (await proj()) === pb);
// swap
await reset(); await E(() => window.SYNQUENZER.placePart(0, 2, 'insert'));
await one('swapR', () => window.SYNQUENZER.markAction(window.SYNQUENZER.songMarks().find(m => m.part === 'P1').id, 'swapR'), s2 => eq(s2.marks.map(m => [m.a, m.len, m.part]), [[0, 2, 'S4'], [2, 4, 'P2'], [7, 4, 'P1']]));
// songRange
await one('songRange delete', () => window.SYNQUENZER.songRange('delete', 6, 6), s2 => s2.bars === 10);
await one('songRange insertEmpty', () => window.SYNQUENZER.songRange('insertEmpty', 0, 1), s2 => s2.bars === 13 && s2.marks[0].a === 2);
await one('songRange clear', () => window.SYNQUENZER.songRange('clear', 2, 5), s2 => s2.bars === 11 && [2, 3, 4, 5].every(x => s2.lanes.every(l => { let v = -1; for (const e of l) { if (e.bar > x) break; v = e.slot; } return v === -1; })));
await one('songRange copy', () => window.SYNQUENZER.songRange('copy', 2, 5), s2 => s2.bars === 15);
// N7S-24 speed
await E(() => { const Q = window.SYNQUENZER; const C = Q.parseChord('Am'); const lanes = [[], [], [], [], [], []], marks = [], car = [];
  for (let k = 0; k < 64; k++) { marks.push({a: k * 4, len: 4, part: 'P1'}); lanes[0].push({bar: k * 4, slot: k % 2 ? 2 : 0}); lanes[4].push({bar: k * 4, slot: 0, re: 1}); car.push({beat: k * 16, target: C}); }
  Q.setSong({bars: 256, lanes, carrier: car, marks}); });
const ms24 = [];
for (let k = 0; k < 5; k++) { await E(() => window.SYNQUENZER.placePart(0, 100, 'insert')); ms24.push(await E(() => window.SYNQUENZER.lastOpMs())); }
check('N7S-24 64 Marken / 256 Takte: placePart ≤ 5 ms', Math.max(...ms24) <= 5, ms24.map(x => x.toFixed(2)));
// N7S-26 MIDI marker
await reset(); await E(() => window.SYNQUENZER.placePart(0, 2, 'insert'));
const mk = await E(() => { const m = window.SYNQUENZER.buildMidi({mode: 'song'}); const by = Array.from(m.bytes); const out = []; for (let i = 0; i < by.length - 3; i++) if (by[i] === 0xFF && by[i + 1] === 6) { const n = by[i + 2]; out.push(String.fromCharCode(...by.slice(i + 3, i + 3 + n))); } return out; });
check('N7S-26 Marker FF 06 je Marke', eq(mk, ['Song', 'Intro', 'Strophe', 'Refrain']), mk);
// Rundweg speichern/laden: normalize keeps marks / re / ph / lanes
const rt = await E(() => { const Q = window.SYNQUENZER; const pr = Q.project(); const P = pr.project || pr; return JSON.stringify(P.song.lanes) + JSON.stringify(P.parts[0].lanes); });
check('Rundweg: Lanes mit re/ph im Projekt', rt.includes('"re":1') && rt.includes('"bar":0'));
check('0 Konsolenfehler', errs.length === 0, errs);
await b.close();
process.exit(done() ? 1 : 0);
