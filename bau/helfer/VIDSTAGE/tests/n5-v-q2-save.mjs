// QA musiker VV2-02: Xander's song with Regie → Speichern → Seite neu laden: song.video, stripe, cut list, the STIMME take plays;
// then file roundtrip (serialize → load)
import {launch, open, mkOk, sleep} from './gmk8b-h.mjs';
import { buildSong } from './n5-v-qm-lib.mjs';
const {ok, fails} = mkOk();
const br = await launch(false);
const ctx = await br.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true});
let H = await open(br, {ctx}), p = H.page;
await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); });
await buildSong(p);
await p.evaluate(() => { const Q = SYNQUENZER, m = S.song.marks.find(x => x.name === 'Refrain'); Q.vvDirSet(m.a, m.a + m.len, 'matrix'); Q.vvDirSet(2, 4, 'spur', 3); Q.vvDirSet(6, 7, 'spur', stimmeT()); setSongView(true); });
const A = await p.evaluate(() => ({video: S.song.video, cuts: SYNQUENZER.vvCuts().hash, vvS: SV.vvS}));
await p.evaluate(() => SYNQUENZER.save()); await sleep(1500);
const errs1 = H.errs.slice(); await p.close();
H = await open(br, {ctx}); p = H.page; await sleep(1500);
await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); window.__tap(); setSongView(true); }); await sleep(500);
const B = await p.evaluate(() => ({video: S.song && S.song.video, cuts: SYNQUENZER.vvCuts() && SYNQUENZER.vvCuts().hash, vvS: SV.vvS, rulerH: SV.rulerH}));
ok('reload keeps song.video', JSON.stringify(A.video) === JSON.stringify(B.video), JSON.stringify([A.video, B.video]));
ok('reload: same cut list + stripe', A.cuts === B.cuts && B.vvS === 8, JSON.stringify([A.cuts, B.cuts, B.vvS, B.rulerH]));
// the STIMME take plays after reload (song from bar 7)
await p.evaluate(() => SYNQUENZER.songPlay(6)); await sleep(1200);
const lv = await p.evaluate(() => ({lvl: window.__lvl(), tk: TK.src.length})); await p.evaluate(() => SYNQUENZER.stop());
ok('after reload the STIMME take plays in the song', lv.tk > 0 && lv.lvl.rmsDb > -50, JSON.stringify(lv));
// file roundtrip
const C = await p.evaluate(async () => { const j = JSON.stringify(SYNQUENZER.serialize()); const r = await (SYNQUENZER.loadProject ? SYNQUENZER.loadProject(JSON.parse(j)) : null); return {has: !!SYNQUENZER.loadProject, video: S.song && S.song.video, j2same: JSON.stringify(SYNQUENZER.serialize()).length === j.length}; });
ok('file roundtrip keeps song.video', !C.has || JSON.stringify(C.video) === JSON.stringify(A.video), JSON.stringify(C).slice(0, 300));
ok('no console errors', !errs1.length && !H.errs.length, JSON.stringify(errs1.concat(H.errs)).slice(0, 300));
await br.close(); console.log(fails() ? 'FAIL ' + fails() : 'ALL PASS');
