// QA musiker VV2-02: a Video entry for the STIMME track (index 6, the 7th track) — Speichern → neu laden, and Datei → in a fresh page
import {launch, open, sleep} from './gmk8b-h.mjs';
import { buildSong } from './n5-v-qm-lib.mjs';
const br = await launch(false);
const ctx = await br.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true});
let H = await open(br, {ctx}), p = H.page;
await buildSong(p, {mk: false});
const A = await p.evaluate(() => { SYNQUENZER.vvDirSet(6, 7, 'spur', stimmeT()); SYNQUENZER.vvDirSet(2, 4, 'spur', 1); return {nt: S.tracks.length, st: stimmeT(), video: S.song.video, file: JSON.stringify(SYNQUENZER.serialize())}; });
const F = JSON.parse(A.file), inFile = (F.song || (F.project && F.project.song) || {}).video; console.log('file keys', Object.keys(F).slice(0, 12).join(','));
await p.evaluate(() => SYNQUENZER.save()); await sleep(1500); await p.close();
H = await open(br, {ctx}); p = H.page; await sleep(1200);
const B = await p.evaluate(() => ({nt: S.tracks.length, video: S.song && S.song.video}));
// fresh context (another device / new browser) → import the file
const ctx2 = await br.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true});
const H2 = await open(br, {ctx: ctx2}); const p2 = H2.page; await sleep(800);
const C = await p2.evaluate(f => { const nt0 = S.tracks.length; importProject(JSON.parse(f).project || JSON.parse(f), []); return {nt0, nt: S.tracks.length, video: S.song && S.song.video}; }, A.file).catch(e => ({err: String(e)}));
console.log(JSON.stringify({before: {nt: A.nt, st: A.st, video: A.video}, inFile, afterReload: B, afterImportFresh: C, errs: H.errs.concat(H2.errs)}));
await br.close();
