// QA V2d′ UI by CDP touch (P1, L1): hold ● while the song plays → Start-Blatt; Vorlauf [aus] by touch → take starts at bar n;
// red 12 % tint over the recorded range (pixel probe); late hand chord on the bar line at 240 BPM lands on the bar line
import { openT, down, up, tapXY, tapSel, center, rulerXY, waitSong, projSong, clipsJSON, mk, SETUP } from './v3-qa2d2-lib.mjs';
const {check, done} = mk();
const only = process.argv[2] || '';
const VPS = [['P1', 390, 844], ['L1', 844, 390]].filter(v => !only || only.split(',').includes(v[0]));
for (const [id, w, h] of VPS) {
  const {b, p, errs, cdp} = await openT({width: w, height: h});
  await p.evaluate(SETUP(true));
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.selectTrack(1); Q.songView(true); return 1; });
  await p.waitForTimeout(300);
  // 1) hold ● while ▶ SONG plays
  await p.evaluate(() => window.SYNQUENZER.songPlay(0));
  await waitSong(p, 3);
  let c = await center(p, '.sv-rec'); await down(cdp, c.x, c.y); await p.waitForTimeout(650); await up(cdp); await p.waitForTimeout(200);
  const op = await p.evaluate(() => ({sheet: !!document.querySelector('.pop.rstart'), rec: window.SYNQUENZER.runtime().song.rec, play: window.SYNQUENZER.runtime().song.play}));
  check(id + ' hold ● while the song plays → Start-Blatt, no take yet, song keeps playing', op.sheet && !op.rec && op.play, op);
  if (op.sheet) await tapSel(p, cdp, '.pop.rstart .rs-x');
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.songPlay(false); Q.stop(); }); await p.waitForTimeout(300);
  // 2) Vorlauf [aus] by touch, range T4–5 Ersetzen, NOTEN S2 → transport starts at bar 4 (no preroll)
  let r = await rulerXY(p, 3); await tapXY(p, cdp, r.x, r.y);
  r = await rulerXY(p, 4); await tapXY(p, cdp, r.x, r.y);
  c = await center(p, '.sv-rec'); await tapXY(p, cdp, c.x, c.y); await p.waitForTimeout(200);
  await tapSel(p, cdp, '.pop.rstart #rsPre button[data-v="0"]');
  const preOn = await p.evaluate(() => document.querySelector('.pop.rstart #rsPre button.on').dataset.v);
  if (!(await p.evaluate(() => document.querySelector('.pop.rstart .rs-t[data-t="mel"]').classList.contains('on')))) await tapSel(p, cdp, '.pop.rstart .rs-t[data-t="mel"]');
  await tapSel(p, cdp, '.pop.rstart .rs-go'); await p.waitForTimeout(150);
  const st = await p.evaluate(() => { const s = window.SYNQUENZER.runtime().song; return {rec: s.rec, from: s.recFrom, to: s.recTo, mode: s.recMode, beat: s.beat, off: s.off}; });
  check(id + ' Vorlauf aus by touch → take from T4 without preroll (song beat ≥ 12 right away)', preOn === '0' && st.rec && st.from === 3 && st.to === 5 && st.mode === 'replace' && st.off === -12, {preOn, st});
  // 3) red tint over the recorded range: probe a cell of an unrecorded row inside the range vs outside (same row)
  await waitSong(p, 13.5);
  const px = await p.evaluate(() => {
    const cv = SV.cv, g = cv.getContext('2d'), dpr = cv.width / cv.getBoundingClientRect().width, row = SV.rows.indexOf(2);   // Synth 3 row (not recorded)
    const y = SV.rulerH + (row + .5) * SV.rowH, at = bar => { const x = (bar + .5) * SV.cellW - SV.x; const d = g.getImageData(Math.round(x * dpr), Math.round(y * dpr), 1, 1).data; return [d[0], d[1], d[2]]; };
    return {inR: at(3), outR: at(1), sx: SV.x, row};
  });
  check(id + ' recorded range tinted red (R up, G/B not)', px.inR[0] - px.outR[0] >= 8 && px.inR[0] - px.inR[1] > px.outR[0] - px.outR[1], px);
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.songPlay(false); Q.stop(); }); await p.waitForTimeout(300);
  // 4) AKKORDE Überschreiben ab T4; a hand chord 0.1 beat (25 ms) after the bar line of T5 → lands on beat 16
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.songSelect(null); Q.songPos(3); return Q.songRecFrom({from: 3, mode: 'over', targets: {clips: false, chords: true, notes: false}, preroll: 1}); });
  await waitSong(p, 16.1);
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.setKbMode('transpose'); Q.keyOn(62, .8, 'c1'); Q.keyOn(65, .8, 'c2'); Q.keyOn(69, .8, 'c3'); });
  await p.waitForTimeout(200);
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.keyOff(62, 'c1'); Q.keyOff(65, 'c2'); Q.keyOff(69, 'c3'); Q.setKbMode('play'); });
  await waitSong(p, 20.3);
  await p.evaluate(() => window.SYNQUENZER.songRecEnd());
  const car = await p.evaluate(() => window.SYNQUENZER.song().carrier.map(c => [c.beat, c.target && c.target.name]));
  check(id + ' hand chord 0.1 beat late at T5 → Dm at beat 16 exactly; T4 chord kept', car.some(x => x[0] === 16 && x[1] === 'Dm') && car.some(x => x[0] === 12), car);
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.songPlay(false); Q.stop(); }); await p.waitForTimeout(200);
  check(id + ' 0 console errors', !errs.length, errs);
  await b.close();
}
process.exit(done() ? 1 : 0);
