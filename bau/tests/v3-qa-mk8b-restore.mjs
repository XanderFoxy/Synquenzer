// QA MK8b-05 / MK8-09: Kompakt → place C10, then WERKSKLANG ZURÜCK: factory C10 back, own sound stays in Eigene, one undo each, undo deep-equal
import {launch, open, mkOk, sleep} from './v3-qa-mk8b-h.mjs';
const {ok, fails} = mkOk();
const br = await launch(false);
for (let run = 1; run <= 2; run++) {
  const {ctx, page, errs} = await open(br, {fmt: 'P1'});
  const r = await page.evaluate(async () => {
    await SYNQUENZER.libraryReady(); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); mkLoad(); await MKK.decodeAll();
    const lib0 = JSON.stringify(SYNQUENZER.library());
    const s = await MKK.writeRec(MKK.rec(6, 13), 3, 10);
    const afterW = {own: MKF.ownAt(3, 10) && MKF.ownAt(3, 10).id, prog: MKF.progRec(3, 10).id};
    mkProg.select(3, 10); const loaded = S.tracks[0].sound.origin;
    const lib1 = JSON.stringify(SYNQUENZER.library()), u1 = UNDO.length;
    const res = mkProg.restore(3, 10); await new Promise(r => setTimeout(r, 400));
    const afterR = {res: !!res, own: !!MKF.ownAt(3, 10), prog: MKF.progRec(3, 10).id, kept: SYNQUENZER.library().some(x => x.id === s.id), keptBank: (SYNQUENZER.library().find(x => x.id === s.id) || {}).bank, du: UNDO.length - u1};
    undo(); await new Promise(r => setTimeout(r, 200));
    const undoR = {lib: JSON.stringify(SYNQUENZER.library()) === lib1, own: MKF.ownAt(3, 10) && MKF.ownAt(3, 10).id};
    return {afterW, loaded, sid: s.id, afterR, undoR};
  });
  ok('run ' + run + ' write → C10 own', r.afterW.own === r.sid && r.afterW.prog === r.sid && r.loaded === r.sid, JSON.stringify(r.afterW));
  ok('run ' + run + ' WERKSKLANG ZURÜCK → factory C10, own kept without place, 1 undo', r.afterR.prog === 'f-mk-c10' && !r.afterR.own && r.afterR.kept && !r.afterR.keptBank && r.afterR.du === 1, JSON.stringify(r.afterR));
  ok('run ' + run + ' undo restore deep-equal', r.undoR.lib && r.undoR.own === r.sid, JSON.stringify(r.undoR));
  ok('run ' + run + ' console', errs.length === 0, errs.slice(0, 2).join(' | '));
  await ctx.close();
}
await br.close();
console.log(fails() ? 'FAIL ' + fails() : 'ALL PASS');
