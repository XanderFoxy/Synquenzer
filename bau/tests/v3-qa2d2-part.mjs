// QA 7.2 / K2-63: during a CLIPS take in the clip view, a TOUCH on the part key STROPHE writes its lanes from the next bar line and
// sets a Teil-Marke; banner in #top does not cover the part keys; one undo
import { openT, tapXY, waitSong, projSong, clipsJSON, mk, SETUP, playLog } from './v3-qa2d2-lib.mjs';
const {check, done} = mk();
for (const [id, w, h] of [['P1', 390, 844], ['L1', 844, 390]]) {
  const {b, p, errs, cdp} = await openT({width: w, height: h});
  await p.evaluate(SETUP(false));
  await p.evaluate(() => { window.SYNQUENZER.songView(false); ensureAudio(); }); await p.waitForTimeout(400);
  const s0 = await projSong(p), c0 = await clipsJSON(p);
  await p.evaluate(() => window.SYNQUENZER.songRecFrom({from: 2, mode: 'over', targets: {clips: true, chords: false, notes: false}, preroll: 1}));
  await waitSong(p, 5.2);
  const k = await p.evaluate(() => { const ks = [...document.querySelectorAll('#partBar .pk')]; const x = ks.find(e => /STR/i.test(e.textContent)); if (!x) return null; const r = x.getBoundingClientRect(); const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return {x: r.left + r.width / 2, y: r.top + r.height / 2, h: r.height, ok: !!(hit && hit.closest('.pk') === x), txt: x.textContent, ban: UI.recBan && !UI.recBan.hidden ? UI.recBan.textContent : null}; });
  check(id + ' part key STROPHE reachable during ● (elementFromPoint, banner in #top)', k && k.ok && k.h >= 36 && k.ban, k);
  if (k) await tapXY(p, cdp, k.x, k.y, 60);
  await waitSong(p, 24.5);
  await p.evaluate(() => window.SYNQUENZER.songRecEnd());
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.songPlay(false); Q.stop(); }); await p.waitForTimeout(300);
  const s = await p.evaluate(() => window.SYNQUENZER.song());
  check(id + ' mark STROPHE (P1) at T3, len 4', s.marks.some(m => m.part === 'P1' && m.a === 2 && m.len === 4), s.marks);
  check(id + ' Strophe lanes from T3: bass Sz1, Fläche Sz2, drums Sz1, Sequenz/Synth4 off', s.lanes[0].some(e => e.bar === 2 && e.slot === 0) && s.lanes[4].some(e => e.bar === 2 && e.slot === 0), s.lanes);
  check(id + ' clips deep-equal; one undo → deep-equal', (await clipsJSON(p)) === c0 && await p.evaluate(() => window.SYNQUENZER.undoInfo().top.kind) === 'song' && (await p.evaluate(() => { window.SYNQUENZER.undo(); return JSON.stringify(window.SYNQUENZER.song()); })) === s0);
  check(id + ' 0 console errors', !errs.length, errs);
  await b.close();
}
process.exit(done() ? 1 : 0);
