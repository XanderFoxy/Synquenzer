// QA: Kompakt program onto a non-MS-2000 track via engine filter (engine switch + E2 = mic in one undo), undo/redo deep-equal
import {launch, open, mkOk, sleep, DIR, tapSel} from './v3-qa-mk8b-h.mjs';
const {ok, fails} = mkOk();
const br = await launch(true);
for (const id of ['f-mk-k204', 'f-mk-k806', 'f-mk-k115']) {
  const {ctx, page, errs} = await open(br, {mic: true});
  await page.evaluate(async () => { await SYNQUENZER.libraryReady(); SYNQUENZER.play(); SYNQUENZER.stop(); SYNQUENZER.selectTrack(0); });
  const pre = await page.evaluate(() => ({eng: S.tracks[0].sound.engine, snap: JSON.stringify(S.tracks[0].sound) + JSON.stringify(S.tracks[0].mkIn || null), u: UNDO.length}));
  await page.evaluate(() => SYNQUENZER.openBrowser(0)); await sleep(300);
  // engine filter → MS 2000 via the engine popup
  const engBtn = await page.evaluate(() => { const b = [...document.querySelectorAll('#sndSheet .brcats button')].find(x => x.dataset.scope && /eng/.test(x.dataset.scope)); return b ? b.dataset.scope : [...document.querySelectorAll('#sndSheet .brcats button')].map(x => x.dataset.scope + ':' + x.textContent).join('|'); });
  await tapSel(page, `#sndSheet .brcats button[data-scope="${engBtn}"]`); await sleep(200);
  await tapSel(page, '.pop button[data-e="mk"]'); await sleep(300);
  const kp = await page.$('#sndSheet .brkp');
  ok(id + ' Kompakt chip visible after engine filter MS 2000 on a ' + pre.eng + ' track', !!kp);
  await tapSel(page, '#sndSheet .brkp'); const g = +id[6];
  await tapSel(page, `#sndSheet .brkg[data-g="${g}"]`);
  await tapSel(page, `#sndSheet .brow[data-id="${id}"] .bmain`); await sleep(600);
  const post = await page.evaluate(() => ({eng: S.tracks[0].sound.engine, o: S.tracks[0].sound.origin, e2: S.tracks[0].mkIn && S.tracks[0].mkIn.e2, u: UNDO.length, ed: soundEdited(S.tracks[0].sound)}));
  ok(id + ' loads onto the track (engine → mk), 1 undo', post.eng === 'mk' && post.o === id && post.u === pre.u + 1 && !post.ed, JSON.stringify(post));
  const un = await page.evaluate(snap => { undo(); const r = JSON.stringify(S.tracks[0].sound) + JSON.stringify(S.tracks[0].mkIn || null) === snap; const eng = S.tracks[0].sound.engine; redo(); return {r, eng, redo: S.tracks[0].sound.origin}; }, pre.snap);
  ok(id + ' undo deep-equal back to ' + pre.eng + ', redo', un.r && un.eng === pre.eng && un.redo === id, JSON.stringify(un));
  ok(id + ' console', errs.length === 0, errs.slice(0, 2).join(' | '));
  await ctx.close();
}
await br.close();
console.log(fails() ? 'FAIL ' + fails() : 'ALL PASS');
