// QA V2d′ (acceptance lens): N2-2d′-01 fully by CDP touch (ruler tap → ● → Start-Blatt → Überschreiben, NOTEN ▾ S2 → START → ● end),
// plus the end of a take by ●/■ counted at finger-down (N7-R1 input t = press) in a tie case (time rule)
import { openT, down, up, tapXY, tapSel, center, rulerXY, waitSong, note, projSong, clipsJSON, mk, SETUP, playLog } from './v3-qa2d2-lib.mjs';
const {check, done} = mk();
const only = process.argv[2] || '';
const VPS = [['P1', 390, 844], ['L1', 844, 390]].filter(v => !only || only.split(',').includes(v[0]) || only.split(',').includes('all'));
for (const [id, w, h] of VPS) {
  const {b, p, errs, cdp} = await openT({width: w, height: h});
  // ---------- N2-2d′-01 by touch
  await p.evaluate(SETUP(true));
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.selectTrack(0); Q.songView(true); return 1; });
  await p.waitForTimeout(400);
  const s0 = await projSong(p), c0 = await clipsJSON(p), u0 = await p.evaluate(() => window.SYNQUENZER.undoInfo().n);
  let r = await rulerXY(p, 3); await tapXY(p, cdp, r.x, r.y);
  const sel = await p.evaluate(() => window.SYNQUENZER.runtime().song.sel);
  check(id + ' ruler tap on 4 → selection {3,3}', sel && sel.a === 3 && sel.b === 3, sel);
  const rec = await center(p, '.sv-rec'); await tapXY(p, cdp, rec.x, rec.y); await p.waitForTimeout(250);
  const sh = await p.evaluate(() => { const s = document.querySelector('.pop.rstart'); return s ? {head: s.querySelector('.rs-h b').textContent, modes: [...s.querySelectorAll('.rs-m')].map(x => x.dataset.m + ':' + x.textContent), tg: [...s.querySelectorAll('.rs-t')].map(x => x.dataset.t + ':' + x.classList.contains('on'))} : null; });
  check(id + ' ● → Start-Blatt with 4 modes (K2-27)', sh && sh.modes.length === 4, sh);
  await tapSel(p, cdp, '.pop.rstart .rs-m[data-m="over"]');
  // targets: NOTEN only
  for (const k of ['clips', 'chords']) { const on = await p.evaluate(k => { const x = document.querySelector('.pop.rstart .rs-t[data-t="' + k + '"]'); return x && x.classList.contains('on'); }, k); if (on) await tapSel(p, cdp, `.pop.rstart .rs-t[data-t="${k}"]`); }
  await tapSel(p, cdp, '.pop.rstart .rs-nt'); await tapSel(p, cdp, '.pop.rstart .rs-t[data-nt="1"]');
  const mon = await p.evaluate(() => { const x = document.querySelector('.pop.rstart .rs-t[data-t="mel"]'); return x && x.classList.contains('on'); });
  if (!mon) await tapSel(p, cdp, '.pop.rstart .rs-t[data-t="mel"]');
  const sh2 = await p.evaluate(() => { const s = document.querySelector('.pop.rstart'); return s ? {head: s.querySelector('.rs-h b').textContent, on: s.querySelector('.rs-m.on').dataset.m, nt: (s.querySelector('.rs-n small') || {}).textContent, tg: [...s.querySelectorAll('.rs-t')].map(x => x.dataset.t + ':' + x.classList.contains('on')), mode: s.querySelector('.rs-mode').textContent} : null; });
  check(id + ' sheet: AB TAKT 4 · Überschreiben · NOTEN Synth 2 only', sh2 && sh2.head === 'AUFNAHME AB TAKT 4' && sh2.on === 'over' && sh2.nt === 'Synth 2' && sh2.tg.join() === 'clips:false,chords:false,mel:true', sh2);
  await p.evaluate(() => window.SYNQUENZER.clearLog());
  await tapSel(p, cdp, '.pop.rstart .rs-go'); await p.waitForTimeout(100);
  const st = await p.evaluate(() => { const s = window.SYNQUENZER.runtime().song; return {rec: s.rec, mode: s.recMode, from: s.recFrom, to: s.recTo, t: s.recTrack, mute: s.mute, ban: SV.ban && !SV.ban.hidden ? SV.ban.textContent : null}; });
  check(id + ' START: over from 3, NOTEN track 1, mute from 11.75 to ∞, banner', st.rec && st.mode === 'over' && st.from === 3 && st.to == null && st.t === 1 && st.mute && st.mute.b == null || (st.mute && st.mute.b === Infinity), st);
  await waitSong(p, 12.5); await note(p, 76, 140);                       // T4 only
  await waitSong(p, 20.36);                                               // T6 + 9 %
  const rb = await center(p, '.sv-rec'); await down(cdp, rb.x, rb.y); await p.waitForTimeout(70); await up(cdp); await p.waitForTimeout(200);
  const takeLog = await p.evaluate(() => window.SYNQUENZER.noteLog(500).filter(n => n.track === 1).map(n => [n.src, n.clipNote, n.out]));
  const le = await p.evaluate(() => window.SYNQUENZER.runtime().song.lastEnd);
  check(id + ' ● by finger at T6 + 9 % → end bar line 6 (endBar 5)', le && le.endBar === 5, le);
  const u = await p.evaluate(() => window.SYNQUENZER.undoInfo());
  check(id + ' exactly one undo step (song)', u.n === u0 + 1 && u.top.kind === 'song', u);
  check(id + ' S.tracks[].clips deep-equal', (await clipsJSON(p)) === c0);
  await p.evaluate(() => window.SYNQUENZER.songPlay(false)); await p.waitForTimeout(300);
  const L = (await playLog(p, 24.5, 1)).map(n => [+n.beat.toFixed(2), n.src, n.clipNote, n.out]);
  check(id + ' playback: T5 (16–20) no Synth 2 note', !L.some(x => x[0] >= 16 - .01 && x[0] < 20 - .01), L);
  check(id + ' playback: T4 only the new note (sounds as 76)', L.filter(x => x[0] >= 12 - .01 && x[0] < 16 - .01).length === 1 && L.some(x => x[0] >= 12.3 && x[0] < 13 && x[3] === 76), L);
  check(id + ' playback: T6 old content (clip note 65 at 20)', L.some(x => Math.abs(x[0] - 20) < .02 && x[2] === 65), L);
  await p.evaluate(() => window.SYNQUENZER.undo());
  check(id + ' undo → song deep-equal', (await projSong(p)) === s0);

  // ---------- ● / ■ SONG end counted at finger-down (tie → time rule): take from T3, press at T4 + 40 %, lift at T4 + ~65 %
  for (const which of ['.sv-rec', '.sv-play']) {
    await p.evaluate(SETUP(false));
    await p.evaluate(() => { const Q = window.SYNQUENZER; Q.songView(true); return 1; });
    await p.waitForTimeout(300);
    await p.evaluate(() => window.SYNQUENZER.songRecFrom({from: 2, mode: 'over', targets: {clips: false, chords: true, notes: false}, preroll: 1}));
    await waitSong(p, 13.6);
    const c = await center(p, which);
    const tDown = await p.evaluate(() => window.SYNQUENZER.runtime().song.beat);
    await down(cdp, c.x, c.y); await p.waitForTimeout(260);
    const tUp = await p.evaluate(() => window.SYNQUENZER.runtime().song.beat);
    await up(cdp); await p.waitForTimeout(250);
    const le2 = await p.evaluate(() => window.SYNQUENZER.runtime().song.lastEnd);
    check(id + ' ' + (which === '.sv-rec' ? '●' : '■ SONG') + ' pressed at T4+40 %, lifted ~T4+65 % → end bar line 4 (endBar 3, finger-down)', le2 && le2.endBar === 3, {le2, tDown: +tDown.toFixed(3), tUp: +tUp.toFixed(3)});
    await p.evaluate(() => { const Q = window.SYNQUENZER; Q.songPlay(false); Q.stop(); }); await p.waitForTimeout(200);
  }
  check(id + ' 0 console errors', !errs.length, errs);
  await b.close();
}
process.exit(done() ? 1 : 0);
