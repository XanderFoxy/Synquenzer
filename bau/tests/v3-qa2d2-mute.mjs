// QA V2d′: what is HEARD during a take (noteLog of the take itself): K2-21 / 7.2 mute of the target track
// A) Vorlauf aus, Überschreiben ab T4, NOTEN Synth 2 → no old Synth-2 note from T4 on, also not on the first beat
// B) live punch-in (song already playing) via ● → Start-Blatt, range T4–5 Ersetzen, NOTEN Synth 2
// C) Ersetzen T3 on the MELODIE-Spur (song.mel notes 7.8 upbeat and 10 must be silent; 2 and 24 audible)
// D) SCHLEIFE Bereich T3–4 + Overdub NOTEN Synth 2: notes of both passes collected, old notes kept
import { openT, tapXY, tapSel, center, rulerXY, waitSong, note, projSong, clipsJSON, mk, SETUP, playLog } from './v3-qa2d2-lib.mjs';
const {check, done} = mk();
const {b, p, errs, cdp} = await openT();
const only = process.argv[2] || '';
const run = k => !only || only.split(',').includes(k);
const takeLog = (t) => p.evaluate(t => { const off = window.SYNQUENZER.runtime().song.off; return window.SYNQUENZER.noteLog(800).filter(n => n.track === t).map(n => [+(n.beat - off).toFixed(2), n.src, n.clipNote, n.out]); }, t);

if (run('A')) {
  await p.evaluate(SETUP(true));
  await p.evaluate(() => window.SYNQUENZER.selectTrack(1));
  if (process.env.CTX) { await p.evaluate(() => { ensureAudio(); }); await p.waitForTimeout(300); }
  await p.evaluate(() => { window.SYNQUENZER.clearLog(); return window.SYNQUENZER.songRecFrom({from: 3, mode: 'over', targets: {clips: false, chords: false, notes: true}, preroll: 0}); });
  await waitSong(p, 19.5);
  const L = await takeLog(1);
  const st = await p.evaluate(() => window.SYNQUENZER.runtime().song);
  check('A Vorlauf aus: take running from T4, mute from 11.75', st.rec && st.recFrom === 3 && st.mute && st.mute.a === 11.75, {rec: st.rec, from: st.recFrom, mute: st.mute});
  check('A Vorlauf aus: no old Synth-2 note heard in T4–T5 (incl. beat 12)', !L.some(x => x[1] === 'clip' && x[0] >= 11.75), L);
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.songRecEnd(); Q.songPlay(false); Q.stop(); });
  await p.waitForTimeout(300);
}
if (run('B')) {
  await p.evaluate(SETUP(true));
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.selectTrack(1); Q.songView(true); Q.songRecTargets({clips: false, chords: false, notes: true}); return 1; });
  await p.waitForTimeout(300);
  let r = await rulerXY(p, 3); await tapXY(p, cdp, r.x, r.y);
  r = await rulerXY(p, 4); await tapXY(p, cdp, r.x, r.y);
  const sel = await p.evaluate(() => window.SYNQUENZER.runtime().song.sel);
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.clearLog(); Q.songPlay(0); });
  await waitSong(p, 5);
  const rc = await center(p, '.sv-rec'); await tapXY(p, cdp, rc.x, rc.y); await p.waitForTimeout(200);
  const modes = await p.evaluate(() => [...document.querySelectorAll('.pop.rstart .rs-m')].map(x => x.dataset.m));
  await tapSel(p, cdp, '.pop.rstart .rs-m[data-m="replace"]');
  await tapSel(p, cdp, '.pop.rstart .rs-go'); await p.waitForTimeout(80);
  const st = await p.evaluate(() => window.SYNQUENZER.runtime().song);
  check('B live punch-in: range T4–5 replace, mute 11.75–19.75', sel && sel.a === 3 && sel.b === 4 && modes.join() === 'replace,overdub' && st.rec && st.recMode === 'replace' && st.recFrom === 3 && st.recTo === 5 && st.mute && st.mute.a === 11.75 && st.mute.b === 19.75, {sel, modes, from: st.recFrom, to: st.recTo, mode: st.recMode, mute: st.mute});
  await waitSong(p, 13); await note(p, 84, 120);
  await waitSong(p, 24.5);
  const L = await takeLog(1);
  const st2 = await p.evaluate(() => window.SYNQUENZER.runtime().song);
  check('B punched out by itself at T6', !st2.rec, st2.lastEnd);
  check('B heard during take: old clip notes before T4 (8) and after (20), none in T4–5', L.some(x => x[1] === 'clip' && Math.abs(x[0] - 8) < .02) && L.some(x => Math.abs(x[0] - 20) < .02) && !L.some(x => x[1] === 'clip' && x[0] >= 11.75 && x[0] < 19.75), L);
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.songPlay(false); Q.stop(); }); await p.waitForTimeout(300);
}
if (run('C')) {
  await p.evaluate(SETUP(false));
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.selectTrack(5); Q.clearLog(); return Q.songRecRange(2, 2, 'replace', {clips: false, chords: false, notes: true}, {preroll: 1, track: 5}); });
  await waitSong(p, 17);
  const L = await takeLog(5);
  const st = await p.evaluate(() => window.SYNQUENZER.runtime().song);
  check('C melody track replace T3: notes 7.8 and 10 not heard during take', !L.some(x => x[1] === 'melody' && x[0] >= 7.7 && x[0] < 15.7), {L, mute: st.mute, lastEnd: st.lastEnd});
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.songPlay(false); Q.stop(); }); await p.waitForTimeout(300);
  const mel = await p.evaluate(() => window.SYNQUENZER.songMelNotes(5).map(n => n.t));
  check('C melody after the take: T3 emptied (7.8, 10 gone), 2 and 24 kept', mel.join() === '2,24', mel);
  // audible playback of what is left
  const P = (await playLog(p, 26, 5)).map(n => [+n.beat.toFixed(2), n.out]);
  check('C playback: melody 76 at 2 and 81 at 24 only', P.length === 2 && P.some(x => Math.abs(x[0] - 2) < .02) && P.some(x => Math.abs(x[0] - 24) < .02), P);
}
if (run('D')) {
  await p.evaluate(SETUP(true));
  const c0 = await clipsJSON(p);
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.selectTrack(1); Q.songLoopRange({on: true, a: 3, b: 5}); Q.clearLog(); return Q.songRecRange(3, 4, 'overdub', {clips: false, chords: false, notes: true}, {preroll: 1}); });
  await waitSong(p, 12.5); await note(p, 72, 120);          // pass 1, T4 + ⅛
  // pass 2: the song beat wraps to 12 again; wait for the wrap then T5 + ⅛ of pass 2
  await p.waitForFunction(() => { const s = window.SYNQUENZER.runtime().song; return s.beat != null && s.beat < 14 && window.__seenHigh; }, null, {timeout: 1}).catch(() => {});
  await p.evaluate(() => new Promise(res => { let hi = false; const f = () => { const s = window.SYNQUENZER.runtime().song; if (s.beat > 19) hi = true; if (hi && s.beat >= 16.5 && s.beat < 18) return res(); requestAnimationFrame(f); }; f(); }));
  await note(p, 74, 120);                                   // pass 2, T5 + ⅛
  await p.evaluate(() => new Promise(res => { let hi = false; const f = () => { const s = window.SYNQUENZER.runtime().song; if (s.beat > 19) hi = true; if (hi && s.beat >= 12.3 && s.beat < 14) return res(); requestAnimationFrame(f); }; f(); }));
  await p.evaluate(() => window.SYNQUENZER.songRecEnd());
  await p.waitForTimeout(200);
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.songPlay(false); Q.stop(); }); await p.waitForTimeout(300);
  const s = await p.evaluate(() => window.SYNQUENZER.song());
  const own = Object.values(s.own || {}).map(c => c.notes.map(n => [n.t, n.n]));
  const u = await p.evaluate(() => window.SYNQUENZER.undoInfo());
  check('D loop overdub: own clip holds old notes + both new ones', own.length >= 1 && own.flat().length >= 6, {own, lane: s.lanes[1]});
  check('D loop overdub: one undo step, clips deep-equal', u.top && u.top.kind === 'song' && (await clipsJSON(p)) === c0, u.top);
  await p.evaluate(() => window.SYNQUENZER.songLoopRange({on: false}));
  const P = (await playLog(p, 24, 1)).map(n => [+n.beat.toFixed(2), n.src, n.out]);
  check('D playback: T4 old 62 + new 72-ish; T5 old 64 + new 74-ish', P.filter(x => x[0] >= 12 && x[0] < 16).length === 2 && P.filter(x => x[0] >= 16 && x[0] < 20).length === 2, P);
}
check('0 console errors', !errs.length, errs);
await b.close();
process.exit(done() ? 1 : 0);
